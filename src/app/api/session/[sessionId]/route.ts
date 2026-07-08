import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServiceRoleClient, type Json } from "@/lib/supabase";
import { getPool } from "@/lib/db";
import { getConfig } from "@/lib/app-config";

function metadataValue(metadata: Json | null | undefined, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function orderSummary(order: { destination: string | null; plan: string; questionnaire_data: Json | null; amount_cents: number | null }) {
  return {
    destination: order.destination ?? metadataValue(order.questionnaire_data, "destination"),
    plan: order.plan,
    amount_cents: order.amount_cents,
    travel_dates: metadataValue(order.questionnaire_data, "travel_dates") ?? metadataValue(order.questionnaire_data, "dates"),
    arrival_date: metadataValue(order.questionnaire_data, "arrival_date"),
    departure_date: metadataValue(order.questionnaire_data, "departure_date"),
  };
}

function inferPlan(amountCents: number): string {
  if (amountCents <= 300) return "3j";
  if (amountCents <= 600) return "7j";
  if (amountCents <= 1000) return "14j";
  return "1mois";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "missing session_id" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // Check if webhook already processed this session
    const [{ data: paymentSession }, { data: orders }] = await Promise.all([
      supabase.from("payment_sessions").select("email, plan, amount_cents, currency").eq("session_id", sessionId).maybeSingle(),
      supabase.from("orders").select("destination, plan, questionnaire_data, amount_cents").eq("stripe_session_id", sessionId),
    ]);

    if (paymentSession) {
      // Webhook already handled it — return normally
      const items = (orders ?? []).map(orderSummary);
      const firstItem = items[0];
      return NextResponse.json({
        ...paymentSession,
        items,
        destination: firstItem?.destination ?? null,
        travel_dates: firstItem?.travel_dates ?? null,
        arrival_date: firstItem?.arrival_date ?? null,
        departure_date: firstItem?.departure_date ?? null,
      });
    }

    // Webhook hasn't fired yet (or isn't configured) — query Stripe directly
    const stripeKey = await getConfig("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    const stripe = new Stripe(stripeKey);
    let stripeSession: Stripe.Checkout.Session;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ error: "payment not completed" }, { status: 402 });
    }

    const email = stripeSession.customer_details?.email?.toLowerCase() ?? null;
    const amountCents = stripeSession.amount_total ?? 0;
    const currency = stripeSession.currency ?? "eur";
    const clientReferenceId = stripeSession.client_reference_id ?? null;
    const plan = inferPlan(amountCents);

    // Save payment session so future calls skip Stripe API
    const pool = getPool();
    await pool.query(
      `INSERT INTO payment_sessions (session_id, email, plan, amount_cents, currency)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId, email, plan, amountCents, currency]
    ).catch(() => undefined);

    // Find user
    let userId: string | null = null;
    if (email) {
      const { rows } = await pool.query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
      userId = rows[0]?.id ?? null;
    }

    // Link pending order (created before Stripe redirect) via client_reference_id
    if (clientReferenceId) {
      const { data: pendingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("id", clientReferenceId)
        .eq("status", "pending_payment")
        .maybeSingle();

      if (pendingOrder) {
        await supabase.from("orders").update({
          stripe_session_id: sessionId,
          session_id: sessionId,
          status: "questionnaire_pending",
          amount_cents: amountCents,
          currency,
          ...(userId ? { user_id: userId } : {}),
        }).eq("id", clientReferenceId);

        // Fetch updated order data
        const { data: updatedOrder } = await supabase
          .from("orders")
          .select("destination, plan, questionnaire_data, amount_cents")
          .eq("id", clientReferenceId)
          .maybeSingle();

        const items = updatedOrder ? [orderSummary(updatedOrder)] : [];
        const firstItem = items[0];

        return NextResponse.json({
          email,
          plan: updatedOrder?.plan ?? plan,
          amount_cents: amountCents,
          currency,
          items,
          destination: firstItem?.destination ?? null,
          travel_dates: firstItem?.travel_dates ?? null,
          arrival_date: firstItem?.arrival_date ?? null,
          departure_date: firstItem?.departure_date ?? null,
        });
      }
    }

    // No pending order found — create a minimal one
    await supabase.from("orders").insert({
      user_id: userId,
      session_id: sessionId,
      stripe_session_id: sessionId,
      plan,
      status: "questionnaire_pending",
      destination: null,
      questionnaire_data: {} as Json,
      quiz_responses: {} as Json,
      amount_cents: amountCents,
      currency,
    }).then(() => undefined).catch(() => undefined);

    return NextResponse.json({
      email,
      plan,
      amount_cents: amountCents,
      currency,
      items: [],
      destination: null,
      travel_dates: null,
      arrival_date: null,
      departure_date: null,
    });
  } catch (error) {
    console.error("[session]", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
