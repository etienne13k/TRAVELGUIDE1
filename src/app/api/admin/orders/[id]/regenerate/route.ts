import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureAdminSchema, getClientIp, logAdminAction } from "@/lib/admin-db";
import { getPool } from "@/lib/db";

export const maxDuration = 60;

type QuestionnaireData = Record<string, unknown>;

function asString(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return typeof value === "string" ? value : String(value ?? "");
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  await ensureAdminSchema();
  const pool = getPool();

  const { rows: orderRows } = await pool.query(
    `SELECT id, user_id, session_id, plan, destination, questionnaire_data FROM orders WHERE id = $1`,
    [id]
  );
  const order = orderRows[0];
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const [{ rows: psRows }, { rows: userRows }] = await Promise.all([
    order.session_id
      ? pool.query(`SELECT email FROM payment_sessions WHERE session_id = $1`, [order.session_id])
      : Promise.resolve({ rows: [] }),
    order.user_id
      ? pool.query(`SELECT email FROM users WHERE id = $1`, [order.user_id])
      : Promise.resolve({ rows: [] }),
  ]);

  const orderEmail = psRows[0]?.email ?? userRows[0]?.email ?? null;
  const answers = (order.questionnaire_data ?? {}) as QuestionnaireData;
  const email = orderEmail || asString(answers.user_email);
  const destination = order.destination || asString(answers.destination);

  if (!email || !destination) {
    await pool.query(
      `UPDATE orders SET status = 'error', delivery_error = $1 WHERE id = $2`,
      ["Réponses questionnaire incomplètes pour relancer la génération", id]
    );
    return NextResponse.json({ error: "Réponses questionnaire incomplètes" }, { status: 400 });
  }

  await pool.query(
    `UPDATE orders SET status = 'questionnaire_completed', delivery_error = null WHERE id = $1`,
    [id]
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin;
  const guideInput = {
    orderId: id,
    email,
    destination,
    duration: order.plan,
    budget: asString(answers.budget) || "Non précisé",
    style: [
      ...asArray(answers.interests),
      ...asArray(answers.vibe),
      ...asArray(answers.sports),
    ],
    hebergement: asString(answers.accommodations) || "Non précisé",
    regime: asArray(answers.diet),
    compagnie: asString(answers.traveler_type) || "Non précisé",
    notes: asString(answers.notes),
  };

  const response = await fetch(`${baseUrl}/api/generate-guide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guideInput),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = (data as { error?: string }).error || "La génération a échoué";
    await pool.query(
      `UPDATE orders SET status = 'error', delivery_error = $1 WHERE id = $2`,
      [message, id]
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await logAdminAction({
    adminEmail: admin.email,
    action: "order_regenerated",
    targetType: "order",
    targetId: id,
    metadata: { email, destination, plan: order.plan },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
}
