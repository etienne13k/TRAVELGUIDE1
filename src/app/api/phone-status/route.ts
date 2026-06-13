import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ loggedIn: false, verified: false });

  if (!process.env.DATABASE_URL) return NextResponse.json({ loggedIn: true, verified: false });

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const { rows } = await pool.query(
      `SELECT phone_verified FROM users WHERE id = $1 LIMIT 1`,
      [session.userId]
    );
    await pool.end();
    return NextResponse.json({ loggedIn: true, verified: rows[0]?.phone_verified === true });
  } catch {
    return NextResponse.json({ loggedIn: true, verified: false });
  }
}
