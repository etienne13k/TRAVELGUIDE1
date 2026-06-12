import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { normalizePromoCode, recordPromoUsage, validateManagedPromoForUser } from "@/lib/promo";

type FreeOrderItem = {
  destination?: unknown;
  dates?: unknown;
  criteria?: unknown;
};

type FreeOrderBody = {
  promoCode?: unknown;
  planKey?: unknown;
  item?: FreeOrderItem;
};

function tr(value: unknown): string {
  if (Array.isArray(value)) return value.join(",").substring(0, 500);
  if (typeof value === "string") return value.substring(0, 500);
  return String(value ?? "").substring(0, 500);
}

function normalizeCriteria(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "not_logged_in", message: "Connectez-vous pour utiliser ce code." }, { status: 401 });
    }

    const body = await req.json() as FreeOrderBody;
    const code = normalizePromoCode(body.promoCode);
    const planKey = body.planKey as string | undefined;
    const validation = await validateManagedPromoForUser({ userId: session.userId, code, planKey });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error, message: validation.message, profileUrl: validation.profileUrl },
        { status: validation.status ?? 400 }
      );
    }

    const promoCode = validation.code;
    const selectedPlan = planKey ?? "3j";
    const criteria = normalizeCriteria(body.item?.criteria);
    const destination = tr(body.item?.destination) || tr(criteria.destination) || null;
    const travelDates = tr(body.item?.dates) || tr(criteria.travel_dates);
    const questionnaireData = {
      ...criteria,
      destination,
      travel_dates: travelDates,
    };

    const pool = getPool();
    const { rows } = await pool.query<{ email: string }>("SELECT email FROM users WHERE id = $1", [session.userId]);
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ success: false, error: "not_logged_in", message: "Connectez-vous pour utiliser ce code." }, { status: 401 });
    }

    const freeSessionId = `free_${promoCode}_${session.userId}_${Date.now()}`;

    await pool.query(
      "INSERT INTO payment_sessions (session_id, email, plan, amount_cents, currency) VALUES ($1, $2, $3, $4, $5)",
      [freeSessionId, user.email, selectedPlan, 0, "eur"]
    );

    const { rows: orderRows } = await pool.query<{ id: string }>(
      `INSERT INTO orders (user_id, session_id, stripe_session_id, plan, status, destination, questionnaire_data, quiz_responses, amount_cents, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $7::jsonb, $8, $9)
       RETURNING id`,
      [
        session.userId,
        freeSessionId,
        freeSessionId,
        selectedPlan,
        destination ? "questionnaire_completed" : "questionnaire_pending",
        destination,
        JSON.stringify(questionnaireData),
        0,
        "eur",
      ]
    );

    await recordPromoUsage({ userId: session.userId, code: promoCode, productId: selectedPlan });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-guide.nanocorp.app";
    const redirectUrl = destination && orderRows[0]?.id
      ? `${baseUrl}/account/orders/${orderRows[0].id}`
      : `${baseUrl}/questionnaire?plan=${selectedPlan}&email=${encodeURIComponent(user.email)}`;

    return NextResponse.json({ success: true, email: user.email, redirectUrl });
  } catch (error) {
    console.error("[free-order]", error);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
