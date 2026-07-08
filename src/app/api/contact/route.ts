import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { Resend } from "resend";

const CONTACT_EMAIL = "travel-ia@nanocorp.app";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, message } = await req.json();

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    const pool = getPool();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(
      `INSERT INTO contact_messages (first_name, last_name, email, message)
       VALUES ($1, $2, $3, $4)`,
      [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), message.trim()]
    );

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "TravelGuide <guides@travelguide.ai>",
        to: CONTACT_EMAIL,
        replyTo: email.trim(),
        subject: `[Contact] ${firstName} ${lastName} — ${email}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #425C47;">Nouveau message de contact</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr><td style="padding: 8px; font-weight: bold; color: #425C47; width: 120px;">Prénom</td><td style="padding: 8px;">${firstName.trim()}</td></tr>
              <tr style="background: #f5f7f5;"><td style="padding: 8px; font-weight: bold; color: #425C47;">Nom</td><td style="padding: 8px;">${lastName.trim()}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #425C47;">Email</td><td style="padding: 8px;"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
            </table>
            <div style="background: #f5f7f5; border-left: 4px solid #C9A84C; padding: 16px; border-radius: 4px;">
              <p style="margin: 0; white-space: pre-wrap; color: #425C47;">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #999;">Message reçu depuis travel-ia.nanocorp.app · Répondez directement à cet email pour contacter l'expéditeur.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json({ error: "Erreur serveur, réessayez." }, { status: 500 });
  }
}
