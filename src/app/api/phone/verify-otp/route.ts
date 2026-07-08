import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import {
  isPhoneUsedByAnotherAccount,
  markPhoneVerified,
  phoneVerificationMessages,
  updateLatestPhoneVerification,
} from "@/lib/phone-verification";
import { isValidPhone, normalizePhone } from "@/lib/signup-anti-abuse";
import { checkPhoneOtp, smsErrorResponse } from "@/lib/sms-provider";

export const runtime = "nodejs";

type VerifyOtpBody = {
  phone?: unknown;
  code?: unknown;
};

function normalizeCode(code: unknown): string {
  return typeof code === "string" ? code.replace(/\D/g, "").slice(0, 6) : "";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, verified: false, error: "not_logged_in", message: phoneVerificationMessages.not_logged_in },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as VerifyOtpBody;
    const phone = normalizePhone(body.phone);
    const code = normalizeCode(body.code);

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, verified: false, error: "invalid_phone", message: phoneVerificationMessages.invalid_phone },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, verified: false, error: "invalid_code", message: phoneVerificationMessages.invalid_code },
        { status: 400 }
      );
    }

    const pool = getPool();

    if (await isPhoneUsedByAnotherAccount(pool, phone, session.userId)) {
      return NextResponse.json(
        { success: false, verified: false, error: "phone_taken", message: phoneVerificationMessages.phone_taken },
        { status: 409 }
      );
    }

    const verification = await checkPhoneOtp(phone, code);
    if (!verification.verified) {
      await updateLatestPhoneVerification({ client: pool, userId: session.userId, phone, status: verification.status });
      return NextResponse.json(
        { success: false, verified: false, error: "code_rejected", message: phoneVerificationMessages.code_rejected },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await markPhoneVerified(client, session.userId, phone);
      await updateLatestPhoneVerification({ client, userId: session.userId, phone, status: verification.status });
      await client.query("COMMIT");
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, verified: true, phone });
  } catch (error) {
    const smsError = smsErrorResponse(error);
    if (smsError) {
      console.error("[phone/verify-otp] SMS provider error", {
        code: smsError.code,
        status: smsError.status,
        message: smsError.message,
      });
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: smsError.code,
          message: phoneVerificationMessages[smsError.code as keyof typeof phoneVerificationMessages] ?? phoneVerificationMessages.sms_not_configured,
        },
        { status: smsError.status }
      );
    }

    console.error("[phone/verify-otp]", error);
    return NextResponse.json(
      { success: false, verified: false, error: "server_error", message: phoneVerificationMessages.server_error },
      { status: 500 }
    );
  }
}
