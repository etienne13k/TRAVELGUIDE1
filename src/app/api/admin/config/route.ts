import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

const ALLOWED_KEYS = [
  "ANTHROPIC_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "INTERNAL_SECRET",
  "RESEND_API_KEY",
];

async function ensureConfigTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await ensureConfigTable();
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT key, value, updated_at FROM app_config WHERE key = ANY($1)",
    [ALLOWED_KEYS]
  );

  const result: Record<string, { set: boolean; preview: string; source: string; updated_at: string | null }> = {};
  for (const key of ALLOWED_KEYS) {
    const row = rows.find((r) => r.key === key);
    const envVal = process.env[key];
    const dbVal = row?.value ?? null;
    result[key] = {
      set: Boolean(envVal || dbVal),
      preview: envVal ? envVal.slice(0, 10) + "..." : dbVal ? dbVal.slice(0, 10) + "..." : "non définie",
      source: envVal ? "env" : dbVal ? "db" : "missing",
      updated_at: row?.updated_at ?? null,
    };
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  await ensureConfigTable();
  const pool = getPool();

  const saved: string[] = [];
  const errors: string[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    if (typeof value !== "string" || !value.trim()) continue;

    try {
      await pool.query(
        `INSERT INTO app_config (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value.trim()]
      );
      saved.push(key);
    } catch (e) {
      errors.push(`${key}: ${String(e)}`);
    }
  }

  return NextResponse.json({ saved, errors });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let body: { key?: string };
  try { body = await req.json(); } catch { body = {}; }
  const { key } = body;
  if (!key || !ALLOWED_KEYS.includes(key)) return NextResponse.json({ error: "Clé non autorisée" }, { status: 400 });

  const pool = getPool();
  await pool.query("DELETE FROM app_config WHERE key = $1", [key]);
  return NextResponse.json({ deleted: key });
}
