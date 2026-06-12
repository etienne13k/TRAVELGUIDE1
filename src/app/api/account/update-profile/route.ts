import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "not_logged_in" }, { status: 401 });
    }

    const { firstName, lastName } = await req.json();

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ success: false, message: "Prénom et nom requis." }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      "UPDATE profiles SET first_name = $1, last_name = $2 WHERE id = $3",
      [firstName.trim(), lastName.trim(), session.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[update-profile]", error);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
