import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";

async function ensureCreditsColumn() {
  const pool = getPool();
  await pool
    .query("ALTER TABLE users ADD COLUMN IF NOT EXISTS business_credits INT NOT NULL DEFAULT 0")
    .catch(() => undefined);
}

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ credits: 0 });
  try {
    await ensureCreditsColumn();
    const pool = getPool();
    const { rows } = await pool.query<{ business_credits: number }>(
      "SELECT business_credits FROM users WHERE id = $1",
      [session.userId]
    );
    return NextResponse.json({ credits: rows[0]?.business_credits ?? 0 });
  } catch {
    return NextResponse.json({ credits: 0 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "not_logged_in", message: "Connectez-vous pour utiliser un crédit." }, { status: 401 });
  }
  try {
    await ensureCreditsColumn();
    const pool = getPool();

    const body = await req.json().catch(() => ({})) as {
      destination?: string;
      dates?: string;
      criteria?: Record<string, unknown>;
    };

    const { rows } = await pool.query<{ business_credits: number }>(
      `UPDATE users SET business_credits = business_credits - 1
       WHERE id = $1 AND business_credits > 0
       RETURNING business_credits`,
      [session.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "no_credits", message: "Vous n'avez plus de crédits Pack Premium." }, { status: 400 });
    }

    const freeSessionId = `credit_${session.userId}_${Date.now()}`;
    const questionnaireData = { ...(body.criteria ?? {}), destination: body.destination, travel_dates: body.dates };

    await pool.query(
      `INSERT INTO payment_sessions (session_id, email, plan, amount_cents, currency)
       VALUES ($1, $2, '7j', 0, 'eur') ON CONFLICT (session_id) DO NOTHING`,
      [freeSessionId, session.email]
    );

    const { rows: orderRows } = await pool.query<{ id: string }>(
      `INSERT INTO orders (user_id, session_id, stripe_session_id, plan, status, destination, questionnaire_data, quiz_responses, amount_cents, currency)
       VALUES ($1, $2, $3, '7j', 'questionnaire_completed', $4, $5::jsonb, $5::jsonb, 0, 'eur')
       RETURNING id`,
      [session.userId, freeSessionId, freeSessionId, body.destination ?? null, JSON.stringify(questionnaireData)]
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-ia.nanocorp.app";
    return NextResponse.json({
      success: true,
      remaining: rows[0].business_credits,
      sessionId: freeSessionId,
      orderId: orderRows[0]?.id ?? null,
      redirectUrl: `${baseUrl}/checkout/success?session_id=${freeSessionId}`,
    });
  } catch (error) {
    console.error("[business-credits]", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
