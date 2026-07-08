import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import {
  hasReachedPhoneOtpLimit,
  isPhoneUsedByAnotherAccount,
  phoneVerificationMessages,
  recordPhoneOtpSend,
  storePhoneVerification,
} from "@/lib/phone-verification";
import { isValidPhone, normalizePhone } from "@/lib/signup-anti-abuse";
import { sendPhoneOtp, smsErrorResponse } from "@/lib/sms-provider";

export const runtime = "nodejs";

type SendOtpBody = {
  phone?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "not_logged_in", message: phoneVerificationMessages.not_logged_in },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as SendOtpBody;
    const phone = normalizePhone(body.phone);

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: "invalid_phone", message: phoneVerificationMessages.invalid_phone },
        { status: 400 }
      );
    }

    const pool = getPool();

    if (await isPhoneUsedByAnotherAccount(pool, phone, session.userId)) {
      return NextResponse.json(
        { success: false, error: "phone_taken", message: phoneVerificationMessages.phone_taken },
        { status: 409 }
      );
    }

    if (await hasReachedPhoneOtpLimit(pool, phone)) {
      return NextResponse.json(
        { success: false, error: "rate_limited", message: phoneVerificationMessages.rate_limited },
        { status: 429 }
      );
    }

    const verification = await sendPhoneOtp(phone);
    await Promise.all([
      recordPhoneOtpSend(pool, phone),
      storePhoneVerification({
        client: pool,
        userId: session.userId,
        phone,
        provider: verification.provider,
        verificationSid: verification.verificationSid,
        status: verification.status,
      }),
    ]);

    return NextResponse.json({
      success: true,
      provider: verification.provider,
      demoMode: verification.demoMode,
      demoCode: verification.demoMode ? verification.demoCode : undefined,
      message: verification.demoMode
        ? `Mode démo - Code : ${verification.demoCode}`
        : `Code envoyé par SMS au ${phone}.`,
    });
  } catch (error) {
    const smsError = smsErrorResponse(error);
    if (smsError) {
      console.error("[phone/send-otp] SMS provider error", {
        code: smsError.code,
        status: smsError.status,
        message: smsError.message,
      });
      return NextResponse.json(
        {
          success: false,
          error: smsError.code,
          message: phoneVerificationMessages[smsError.code as keyof typeof phoneVerificationMessages] ?? phoneVerificationMessages.sms_not_configured,
        },
        { status: smsError.status }
      );
    }

    console.error("[phone/send-otp]", error);
    return NextResponse.json(
      { success: false, error: "server_error", message: phoneVerificationMessages.server_error },
      { status: 500 }
    );
  }
}
