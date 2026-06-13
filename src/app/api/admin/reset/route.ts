import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== "nanocorp-setup-2026") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "no db" }, { status: 503 });

  const email = "admin@spiregg.app";
  const password = "SpireggAdmin2025!";

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, is_admin BOOLEAN DEFAULT false, is_suspended BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())`);
    const hash = await bcrypt.hash(password, 12);
    await pool.query(`INSERT INTO users (email, password_hash, is_admin) VALUES ($1, $2, true) ON CONFLICT (email) DO UPDATE SET password_hash = $2, is_admin = true, is_suspended = false`, [email, hash]);
    await pool.end();
    return NextResponse.json({ ok: true, email });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
