import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, verified: false, error: "not_logged_in" }, { status: 401 });
  }

  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const client = getTwilioClient();
  if (!client || !verifyServiceSid) {
    return NextResponse.json(
      { success: false, verified: false, error: "sms_not_configured", message: "Service SMS non configuré." },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { phoneNumber?: unknown; code?: unknown };
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  const code = typeof body.code === "string" ? body.code.replace(/\D/g, "").slice(0, 6) : "";

  if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
    return NextResponse.json(
      { success: false, verified: false, error: "invalid_phone", message: "Format téléphone invalide." },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { success: false, verified: false, error: "invalid_code", message: "Code invalide. Entrez les 6 chiffres reçus par SMS." },
      { status: 400 }
    );
  }

  try {
    const check = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({ to: phoneNumber, code });

    if (check.status !== "approved") {
      return NextResponse.json({ success: true, verified: false });
    }

    const pool = getPool();
    await pool.query(
      `UPDATE profiles
       SET phone_number = $1, phone = $1, phone_verified = true
       WHERE id = $2`,
      [phoneNumber, session.userId]
    );

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    const twilioError = error as { code?: number; message?: string };
    if (twilioError.code === 20404) {
      return NextResponse.json(
        { success: false, verified: false, error: "code_rejected", message: "Code incorrect ou expiré." },
        { status: 400 }
      );
    }
    console.error("[auth/verify-phone-code]", error);
    return NextResponse.json(
      { success: false, verified: false, error: "server_error", message: "Erreur serveur, réessayez." },
      { status: 500 }
    );
  }
}
