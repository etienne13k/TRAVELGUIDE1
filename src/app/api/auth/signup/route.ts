import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import { getPool } from "@/lib/db";
import {
  getClientIp,
  hasReachedSignupIpLimit,
  isFallbackAntiBotValid,
  isPhoneAlreadyUsed,
  isValidPhone,
  normalizePhone,
  recordSignupIp,
  signupErrors,
  type SignupErrorCode,
  verifyTurnstileToken,
} from "@/lib/signup-anti-abuse";

type PgError = Error & {
  code?: string;
  constraint?: string;
};

function errorResponse(code: SignupErrorCode, status: number) {
  const messages = signupErrors[code];
  return NextResponse.json({ error: messages.fr, code, messages }, { status });
}

function isUniqueViolation(error: unknown, constraint: string): boolean {
  const pgError = error as PgError;
  return pgError?.code === "23505" && pgError.constraint === constraint;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  try {
    const body = await req.json();
    const normalizedEmail = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phoneNumber = normalizePhone(body.phoneNumber);

    if (!normalizedEmail || !password || !phoneNumber) {
      return NextResponse.json({ error: "Email, téléphone et mot de passe requis" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
    }
    if (!isValidPhone(phoneNumber)) {
      return errorResponse("invalid_phone", 400);
    }

    const pool = getPool();

    if (await hasReachedSignupIpLimit(pool, clientIp)) {
      return errorResponse("ip_limit", 429);
    }

    const turnstileConfigured = Boolean(
      process.env.TURNSTILE_SECRET_KEY &&
        (process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
    );
    const captchaPassed = turnstileConfigured
      ? await verifyTurnstileToken({ token: body.turnstileToken, ipAddress: clientIp })
      : isFallbackAntiBotValid(body.antiBotAnswer, body.companyWebsite);

    if (!captchaPassed) {
      return errorResponse("captcha_failed", 400);
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows: existingEmail } = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
      );
      if (existingEmail.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
      }

      if (await isPhoneAlreadyUsed(client, phoneNumber)) {
        await client.query("ROLLBACK");
        return errorResponse("phone_taken", 409);
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const { rows: inserted } = await client.query(
        "INSERT INTO users (email, phone_number, password_hash) VALUES ($1, $2, $3) RETURNING id, email",
        [normalizedEmail, phoneNumber, passwordHash]
      );
      const user = inserted[0];

      await recordSignupIp(client, clientIp);

      const { rows: paymentSessions } = await client.query(
        "SELECT session_id FROM payment_sessions WHERE email = $1",
        [normalizedEmail]
      );
      const sessionIds = paymentSessions.map((session: { session_id: string }) => session.session_id);
      if (sessionIds.length > 0) {
        const placeholders = sessionIds.map((_: unknown, index: number) => `$${index + 2}`).join(", ");
        await client.query(
          `UPDATE orders SET user_id = $1 WHERE user_id IS NULL AND session_id IN (${placeholders})`,
          [user.id, ...sessionIds]
        );
      }

      await client.query("COMMIT");

      const token = await createSession({ userId: user.id, email: user.email });
      const response = NextResponse.json({ success: true, email: user.email });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    } catch (error) {
      await client.query("ROLLBACK");
      if (isUniqueViolation(error, "users_email_key")) {
        return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
      }
      if (isUniqueViolation(error, "users_phone_number_unique")) {
        return errorResponse("phone_taken", 409);
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[signup]", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Erreur serveur: ${msg}` }, { status: 500 });
  }
}
