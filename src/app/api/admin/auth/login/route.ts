import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSession, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE } from "@/lib/admin-auth";
import { ensureAdminSchema, getClientIp } from "@/lib/admin-db";
import { getPool } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(req: NextRequest) {
  await ensureAdminSchema();
  const pool = getPool();
  const ip = getClientIp(req);

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const email = body.email?.toLowerCase().trim() ?? "";
  const password = body.password ?? "";
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS count FROM admin_login_attempts
     WHERE ip_address = $1 AND success = false AND created_at > $2`,
    [ip, windowStart]
  );
  if (Number(countRows[0]?.count ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  let valid = false;
  if (email && password) {
    const { rows } = await pool.query(
      `SELECT password_hash FROM users WHERE email = $1 AND is_admin = true AND (is_suspended IS NULL OR is_suspended = false)`,
      [email]
    );
    if (rows.length > 0) {
      valid = await bcrypt.compare(password, rows[0].password_hash);
    }
  }

  await pool.query(
    `INSERT INTO admin_login_attempts (ip_address, email, success) VALUES ($1, $2, $3)`,
    [ip, email || null, valid]
  );

  if (!valid) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const token = await createAdminSession(email);
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
