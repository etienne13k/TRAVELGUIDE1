import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { isPhoneAlreadyUsed, isValidPhone, normalizePhone, signupErrors } from "@/lib/signup-anti-abuse";

type PgError = Error & {
  code?: string;
  constraint?: string;
};

function isPhoneUniqueViolation(error: unknown): boolean {
  const pgError = error as PgError;
  return pgError?.code === "23505" && pgError.constraint === "users_phone_number_unique";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "not_logged_in" }, { status: 401 });
    }

    const body = await req.json();
    const phone = normalizePhone(body.phoneNumber);

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({
        success: false,
        error: "invalid_phone",
        message: signupErrors.invalid_phone.fr,
      }, { status: 400 });
    }

    const pool = getPool();

    if (await isPhoneAlreadyUsed(pool, phone, session.userId)) {
      return NextResponse.json({
        success: false,
        error: "phone_taken",
        message: signupErrors.phone_taken.fr,
      }, { status: 409 });
    }

    await pool.query(
      "UPDATE users SET phone_number = $1, phone_verified = false WHERE id = $2",
      [phone, session.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isPhoneUniqueViolation(error)) {
      return NextResponse.json({
        success: false,
        error: "phone_taken",
        message: signupErrors.phone_taken.fr,
      }, { status: 409 });
    }

    console.error("[update-phone]", error);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
