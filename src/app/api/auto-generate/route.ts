import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { stripeSessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const { stripeSessionId } = body;
  if (!stripeSessionId) {
    return NextResponse.json({ error: "stripeSessionId requis" }, { status: 400 });
  }

  const pool = getPool();

  // Find the order linked to this Stripe session
  const { rows } = await pool.query<{
    id: string;
    plan: string;
    status: string;
    questionnaire_data: Record<string, unknown> | null;
    destination: string | null;
  }>(
    `SELECT id, plan, status, questionnaire_data, destination
     FROM orders
     WHERE stripe_session_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [stripeSessionId]
  );

  const order = rows[0];
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  // Already delivered or generating — return existing order
  if (order.status === "delivered" || order.status === "generating") {
    return NextResponse.json({ orderId: order.id, status: order.status });
  }

  const qdata = order.questionnaire_data ?? {};
  const email = String(qdata.user_email ?? qdata.email ?? "");
  const destination = order.destination ?? String(qdata.destination ?? qdata.destination_arrival_city ?? "");

  if (!email || !destination) {
    // No questionnaire data yet — user needs to fill questionnaire
    return NextResponse.json({ orderId: order.id, status: "questionnaire_pending" });
  }

  // Trigger generation via internal call
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-ia.nanocorp.app";
  const internalSecret = process.env.INTERNAL_SECRET;
  if (!internalSecret) {
    return NextResponse.json({ orderId: order.id, status: "no_internal_secret", error: "INTERNAL_SECRET non configuré" }, { status: 503 });
  }

  const guidePayload = {
    ...qdata,
    orderId: order.id,
    email,
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
