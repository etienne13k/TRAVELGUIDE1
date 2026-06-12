import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Route temporaire pour créer une commande de test
// Protégée par ADMIN_SETUP_TOKEN
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  if (!setupToken || token !== setupToken) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const pool = getPool();

  try {
    // 1. Créer un user de test s'il n'existe pas
    const testEmail = "test-client@example.com";
    const { rows: userRows } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [testEmail]
    );

    let userId: string;
    if (userRows.length > 0) {
      userId = userRows[0].id;
    } else {
      const { rows: newUser } = await pool.query(
        `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
        [testEmail, "$2b$12$placeholder_hash_not_real"]
      );
      userId = newUser[0].id;
    }

    // 2. Créer une payment_session fictive
    const sessionId = `test_stripe_cs_${Date.now()}`;
    await pool.query(
      "INSERT INTO payment_sessions (session_id, email, plan, amount_cents, currency) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
      [sessionId, testEmail, "7j", 700, "eur"]
    );

    // 3. Créer la commande de test
    const questionnaireData = {
      destination: "Tokyo, Japon",
      travel_dates: "15 août – 22 août 2026",
      travelers: "2",
      budget_per_day: "150",
      travel_style: "Culture & Gastronomie",
      interests: ["temples", "gastronomie", "street food", "quartiers modernes"],
      accommodation: "hôtel 3 étoiles",
      dietary: "aucune restriction",
      language: "fr",
    };

    const pdfPlaceholder = null;

    const { rows: orderRows } = await pool.query(
      `INSERT INTO orders (
        user_id, session_id, stripe_session_id, plan, status,
        destination, questionnaire_data, quiz_responses,
        amount_cents, currency, pdf_data, guide_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$7::jsonb,$8,$9,$10,$11)
      RETURNING id`,
      [
        userId,
        sessionId,
        sessionId,
        "7j",
        "delivered",
        "Tokyo, Japon",
        JSON.stringify(questionnaireData),
        700,
        "eur",
        pdfPlaceholder,
        null,
      ]
    );

    return NextResponse.json({
      success: true,
      orderId: orderRows[0].id,
      userId,
      email: testEmail,
      message: "Commande de test créée avec succès",
    });
  } catch (error) {
    console.error("[seed-test-order]", error);
    return NextResponse.json({ error: "Erreur", detail: String(error) }, { status: 500 });
  }
}
