import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ loggedIn: false, welcomeUsed: false });
  }

  let welcomeUsed = false;
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id FROM promo_usages WHERE user_id = $1 AND promo_code = 'WELCOME' LIMIT 1",
      [session.userId]
    );
    welcomeUsed = rows.length > 0;
  } catch {
    // non-fatal
  }

  return NextResponse.json({ loggedIn: true, email: session.email, welcomeUsed });
}
