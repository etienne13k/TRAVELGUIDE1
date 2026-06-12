import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient, type Json } from "@/lib/supabase";

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
    const [{ data, error }, { data: order, error: orderError }] = await Promise.all([
      supabase
        .from("payment_sessions")
        .select("email, plan, amount_cents, currency")
        .eq("session_id", sessionId)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("destination, plan, questionnaire_data, amount_cents")
        .eq("stripe_session_id", sessionId),
    ]);

    if (error) throw error;
    if (orderError) throw orderError;
    if (!data) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    const orders = order ?? [];
    const items = orders.map(orderSummary);
    const firstItem = items[0];

    return NextResponse.json({
      ...data,
      items,
      destination: firstItem?.destination ?? null,
      travel_dates: firstItem?.travel_dates ?? null,
      arrival_date: firstItem?.arrival_date ?? null,
      departure_date: firstItem?.departure_date ?? null,
    });
  } catch (error) {
    console.error("[session]", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
