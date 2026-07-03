import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Json } from "@/lib/supabase";
import { isPlanKey } from "@/lib/cart";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const { planId, destination, dates, criteria } = body as {
    planId?: unknown;
    destination?: unknown;
    dates?: unknown;
    criteria?: unknown;
  };

  if (!isPlanKey(planId)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const session = await getServerSession();
  const supabase = createSupabaseServiceRoleClient();

  let userId: string | null = null;
  if (session?.userId) {
    userId = session.userId;
  }

  const orderId = crypto.randomUUID();
  const questionnaireData = criteria && typeof criteria === "object" ? criteria : {};

  const { error } = await supabase.from("orders").insert({
    id: orderId,
    user_id: userId,
    session_id: orderId,
    plan: planId,
    status: "pending_payment",
    destination: typeof destination === "string" ? destination : null,
    questionnaire_data: questionnaireData as Json,
    quiz_responses: questionnaireData as Json,
    amount_cents: null,
    currency: "eur",
  });

  if (error) {
    console.error("[save-pending-order]", error);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }

  return NextResponse.json({ orderId });
}
