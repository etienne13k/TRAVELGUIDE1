import type { NextRequest } from "next/server";
import type { Pool, PoolClient } from "pg";

const SIGNUP_WINDOW_HOURS = 24;
const SIGNUP_LIMIT_PER_IP = 3;
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export const signupErrors = {
  captcha_failed: {
    fr: "Vérification anti-robot échouée. Réessayez.",
    en: "Anti-robot check failed. Please try again.",
  },
  captcha_not_configured: {
    fr: "Protection anti-robot non configurée. Réessayez plus tard.",
    en: "Anti-robot protection is not configured. Please try again later.",
  },
  ip_limit: {
    fr: "Trop de comptes créés depuis votre réseau. Réessayez demain.",
    en: "Too many accounts created from your network. Try again tomorrow.",
  },
  invalid_phone: {
    fr: "Format téléphone invalide (ex: +33612345678).",
    en: "Invalid phone format (example: +33612345678).",
  },
  phone_taken: {
    fr: "Ce numéro de téléphone est déjà associé à un compte.",
    en: "This phone number is already linked to an account.",
  },
};

export type SignupErrorCode = keyof typeof signupErrors;

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

export function normalizePhone(phone: unknown): string {
  return typeof phone === "string" ? phone.trim() : "";
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export async function hasReachedSignupIpLimit(pool: Pool, ipAddress: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM ip_logs
     WHERE ip_address = $1
       AND action = 'signup'
       AND created_at >= NOW() - ($2::text)::interval`,
    [ipAddress, `${SIGNUP_WINDOW_HOURS} hours`]
  );

  return Number(rows[0]?.count ?? 0) >= SIGNUP_LIMIT_PER_IP;
}

export async function recordSignupIp(client: PoolClient, ipAddress: string): Promise<void> {
  await client.query(
    "INSERT INTO ip_logs (ip_address, action) VALUES ($1, $2)",
    [ipAddress, "signup"]
  );
}

export async function isPhoneAlreadyUsed(
  client: Pool | PoolClient,
  phoneNumber: string,
  exceptUserId?: string
): Promise<boolean> {
  const params = exceptUserId ? [phoneNumber, exceptUserId] : [phoneNumber];
  const excludeSelf = exceptUserId ? "AND id <> $2" : "";
  const { rows } = await client.query(
    `SELECT id FROM users WHERE phone_number = $1 ${excludeSelf} LIMIT 1`,
    params
  );

  return rows.length > 0;
}

export function isFallbackAntiBotValid(answer: unknown, honeypot: unknown): boolean {
  const normalizedAnswer = typeof answer === "string" ? answer.trim() : "";
  const normalizedHoneypot = typeof honeypot === "string" ? honeypot.trim() : "";

  return normalizedAnswer === "7" && normalizedHoneypot.length === 0;
}

export async function verifyTurnstileToken(params: {
  token: unknown;
  ipAddress: string;
}): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const token = typeof params.token === "string" ? params.token.trim() : "";

  if (!secret || !token) return false;

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      response: token,
      remoteip: params.ipAddress,
    }),
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}
