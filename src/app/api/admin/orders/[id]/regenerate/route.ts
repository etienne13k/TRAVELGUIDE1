import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureAdminSchema, getClientIp, logAdminAction } from "@/lib/admin-db";
import { getPool } from "@/lib/db";
import { getConfig } from "@/lib/app-config";

export const maxDuration = 60;

type QuestionnaireData = Record<string, unknown>;

function asString(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return typeof value === "string" ? value : String(value ?? "");
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

  // Resolve email and destination from all possible sources
  const email =
    orderEmail ||
    asString(answers.user_email || answers.email) ||
    "noreply@travelguide.app";

  const destination =
    order.destination ||
    asString(answers.destination || answers.destination_arrival_city) ||
    "Destination a definir";

  await pool.query(
    `UPDATE orders SET status = 'generating', delivery_error = null WHERE id = $1`,
    [id]
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin;
  const internalSecret = await getConfig("INTERNAL_SECRET") ?? "admin-bypass";

  // Pass the FULL questionnaire data to generate-guide so all 3 prompts work correctly
  const guideInput = {
    ...answers,
    orderId: id,
    email,
    destination,
    duration: order.plan,
    mode: asString(answers.mode) || undefined,
    destination_arrival_city: asString(answers.destination_arrival_city) || undefined,
  };

  const response = await fetch(`${baseUrl}/api/generate-guide`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify(guideInput),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = (data as { error?: string }).error || "La generation a echoue";
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
