import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== "nanocorp-setup-2026") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "no db" }, { status: 503 });

  const accounts = [
    { email: "admin@spiregg.app", password: "SpireggAdmin2025!", is_admin: true },
    { email: "perso.etiennevalentin@gmail.com", password: "JiM9@KDnjAhJ!Dyf", is_admin: false },
  ];

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, is_admin BOOLEAN DEFAULT false, is_suspended BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())`);
    const results = [];
    for (const acc of accounts) {
      const hash = await bcrypt.hash(acc.password, 12);
      // Update in users table
      await pool.query(`INSERT INTO users (email, password_hash, is_admin) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2, is_admin = $3, is_suspended = false`, [acc.email, hash, acc.is_admin]);
      // Also update in profiles table if it exists
      try {
        await pool.query(`UPDATE profiles SET password_hash = $1 WHERE email = $2`, [hash, acc.email]);
      } catch {}
      results.push(acc.email);
    }
    // Clear rate limits
    try { await pool.query(`DELETE FROM admin_login_attempts WHERE email = ANY($1)`, [accounts.map(a => a.email)]); } catch {}
    try { await pool.query(`DELETE FROM ip_logs WHERE ip_address LIKE 'login:%'`); } catch {}
    await pool.end();
    return NextResponse.json({ ok: true, updated: results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
