import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json() as { secret?: string; deleteOrders?: boolean };
  const { secret, deleteOrders } = body;
  if (secret !== "nanocorp-setup-2026") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "no db" }, { status: 503 });

  const admins = [
    { email: "admin@spiregg.app", password: "SpireggAdmin2025!" },
  ];

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    // Use a dedicated admin_accounts table — avoids Supabase ALTER TABLE restrictions on users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const results = [];
    for (const adm of admins) {
      const hash = await bcrypt.hash(adm.password, 12);
      await pool.query(
        `INSERT INTO admin_accounts (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
        [adm.email, hash]
      );
      results.push(adm.email);
    }

    // Clear rate limits
    try { await pool.query(`DELETE FROM admin_login_attempts WHERE email = ANY($1)`, [admins.map(a => a.email)]); } catch {}

    // Delete all orders if requested
    let ordersDeleted = 0;
    if (deleteOrders) {
      try {
        const res = await pool.query(`DELETE FROM orders`);
        ordersDeleted = res.rowCount ?? 0;
      } catch {}
    }

    await pool.end();
    return NextResponse.json({ ok: true, updated: results, ordersDeleted });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
