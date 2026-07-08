import type { NextRequest } from "next/server";
import type { Pool, PoolClient } from "pg";

const SIGNUP_WINDOW_HOURS = 24;
const SIGNUP_LIMIT_PER_IP = 3;

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
};

export type SignupErrorCode = keyof typeof signupErrors;

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
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

export const ANTI_BOT_QUESTIONS = [
  { id: "q1", question: "Combien font 3 + 4 ?", answer: "7" },
  { id: "q2", question: "Combien font 5 + 3 ?", answer: "8" },
  { id: "q3", question: "Combien font 12 - 5 ?", answer: "7" },
  { id: "q4", question: "Combien font 2 × 4 ?", answer: "8" },
  { id: "q5", question: "Combien font 15 - 8 ?", answer: "7" },
  { id: "q6", question: "Combien font 3 × 3 ?", answer: "9" },
  { id: "q7", question: "Combien font 20 - 11 ?", answer: "9" },
  { id: "q8", question: "Combien font 4 + 5 ?", answer: "9" },
  { id: "q9", question: "Combien font 6 + 2 ?", answer: "8" },
  { id: "q10", question: "Combien font 10 - 3 ?", answer: "7" },
];

export function isFallbackAntiBotValid(answer: unknown, honeypot: unknown, questionId?: unknown): boolean {
  const normalizedAnswer = typeof answer === "string" ? answer.trim() : "";
  const normalizedHoneypot = typeof honeypot === "string" ? honeypot.trim() : "";
  if (normalizedHoneypot.length > 0) return false;

  const qid = typeof questionId === "string" ? questionId : "q1";
  const question = ANTI_BOT_QUESTIONS.find(q => q.id === qid);
  if (!question) return normalizedAnswer === "7";

  return normalizedAnswer === question.answer;
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
