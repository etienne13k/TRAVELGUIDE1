import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== "nanocorp-setup-2026") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "no db" }, { status: 503 });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    const testEmail = "marie.dupont@gmail.com";

    // Upsert user
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id`,
      [testEmail, "$2b$12$placeholder"]
    );
    const userId = userRows[0].id;

    // Payment session
    const sessionId = `cs_test_fake_${Date.now()}`;
    await pool.query(
      `INSERT INTO payment_sessions (session_id, email, plan, amount_cents, currency) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [sessionId, testEmail, "7j", 2900, "eur"]
    );

    // Order
    const questionnaire = {
      destination: "Kyoto, Japon",
      duration: "7j",
      email: testEmail,
      budget: "comfort",
      traveler_type: "couple",
      interests: ["culture", "gastronomie", "temples"],
      language: "fr",
    };

    const { rows: orderRows } = await pool.query(
      `INSERT INTO orders (user_id, session_id, stripe_session_id, plan, status, destination, questionnaire_data, quiz_responses, amount_cents, currency)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$7::jsonb,$8,$9) RETURNING id`,
      [userId, sessionId, sessionId, "7j", "delivered", "Kyoto, Japon", JSON.stringify(questionnaire), 2900, "eur"]
    );

    await pool.end();
    return NextResponse.json({ ok: true, orderId: orderRows[0].id, email: testEmail });
  } catch (e) {
    await pool.end();
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
