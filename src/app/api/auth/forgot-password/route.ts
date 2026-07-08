import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { Resend } from "resend";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    // Always return success to avoid email enumeration
    if (rows.length === 0) {
      return NextResponse.json({ success: true });
    }

    const userId = rows[0].id;
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing unused tokens for this user
    await pool.query(
      "UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false",
      [userId]
    );

    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [userId, tokenHash, expiresAt]
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-ia.nanocorp.app";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "TravelGuide <noreply@travelguide.ai>",
        to: normalizedEmail,
        subject: "Réinitialisation de votre mot de passe — TravelGuide",
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="color: #425C47; font-size: 24px; margin-bottom: 8px;">TravelGuide</h1>
            <p style="color: #7a7060; margin-bottom: 24px;">Réinitialisation de mot de passe</p>
            <p style="color: #425C47; margin-bottom: 16px;">
              Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #425C47; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; margin-bottom: 24px;">
              Réinitialiser mon mot de passe →
            </a>
            <p style="color: #7a7060; font-size: 13px; margin-bottom: 8px;">
              Ce lien expire dans <strong>1 heure</strong>.
            </p>
            <p style="color: #7a7060; font-size: 13px;">
              Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe ne sera pas modifié.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
