import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { stripeSessionId?: string; orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const { stripeSessionId, orderId: directOrderId } = body;
  if (!stripeSessionId && !directOrderId) {
    return NextResponse.json({ error: "stripeSessionId ou orderId requis" }, { status: 400 });
  }

  const pool = getPool();

  // Find the order: prefer direct orderId lookup, fall back to stripe_session_id
  const { rows } = await pool.query<{
    id: string;
    plan: string;
    status: string;
    questionnaire_data: Record<string, unknown> | null;
    destination: string | null;
  }>(
    directOrderId
      ? `SELECT id, plan, status, questionnaire_data, destination
         FROM orders
         WHERE id = $1
         LIMIT 1`
      : `SELECT id, plan, status, questionnaire_data, destination
         FROM orders
         WHERE stripe_session_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
    [directOrderId ?? stripeSessionId]
  );

  // Link the stripe session to the order if we found it by orderId
  if (directOrderId && stripeSessionId && rows[0]) {
    pool.query(`UPDATE orders SET stripe_session_id = $1 WHERE id = $2 AND stripe_session_id IS NULL`, [stripeSessionId, directOrderId]).catch(() => undefined);
  }

  const order = rows[0];
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  // Already delivered or generating — return existing order
  if (order.status === "delivered" || order.status === "generating") {
    return NextResponse.json({ orderId: order.id, status: order.status });
  }

  const qdata = order.questionnaire_data ?? {};
  const hasData = Object.keys(qdata).length > 0;

  if (!hasData) {
    return NextResponse.json({ orderId: order.id, status: "questionnaire_pending" });
  }

  const email = String(qdata.user_email ?? qdata.email ?? "");
  const destination = String(
    order.destination ||
    qdata.destination ||
    qdata.destination_arrival_city ||
    "À définir par l'IA"
  );

  // Trigger generation via internal call
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travelguide1.vercel.app";
  const internalSecret = process.env.INTERNAL_SECRET ?? await import("@/lib/app-config").then(m => m.getConfig("INTERNAL_SECRET"));
  if (!internalSecret) {
    return NextResponse.json({ orderId: order.id, status: "no_internal_secret", error: "INTERNAL_SECRET non configuré" }, { status: 503 });
  }

  const guidePayload = {
    ...qdata,
    orderId: order.id,
    email: email || "noreply@travelguide.app",
    destination,
    duration: order.plan,
  };

  try {
    const genRes = await fetch(`${baseUrl}/api/generate-guide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalSecret,
      },
      body: JSON.stringify(guidePayload),
    });

    const genData = await genRes.json() as Record<string, unknown>;

    if (!genRes.ok) {
      return NextResponse.json({ orderId: order.id, status: "error", error: genData.error ?? "Erreur génération" }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id, status: "delivered", guideId: genData.guideId });
  } catch (err) {
    return NextResponse.json({ orderId: order.id, status: "error", error: String(err) }, { status: 500 });
  }
}
