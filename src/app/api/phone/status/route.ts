import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getPhoneStatus } from "@/lib/phone-verification";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ loggedIn: false, phone: null, phoneVerified: false });
    }

    const pool = getPool();
    const status = await getPhoneStatus(pool, session.userId);

    const { rows: usageRows } = await pool.query<{ id: string }>(
      "SELECT id FROM promo_usages WHERE user_id = $1 AND promo_code = 'WELCOME' LIMIT 1",
      [session.userId]
    );
    const welcomeUsed = usageRows.length > 0;

    return NextResponse.json({ loggedIn: true, email: session.email, ...status, welcomeUsed });
  } catch (error) {
    console.error("[phone/status]", error);
    return NextResponse.json({ loggedIn: false, phone: null, phoneVerified: false }, { status: 500 });
  }
}
