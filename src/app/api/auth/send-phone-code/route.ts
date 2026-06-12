import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getServerSession } from "@/lib/auth";

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
    return NextResponse.json({ success: false, error: "not_logged_in" }, { status: 401 });
  }

  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const client = getTwilioClient();
  if (!client || !verifyServiceSid) {
    return NextResponse.json(
      { success: false, error: "sms_not_configured", message: "Service SMS non configuré." },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { phoneNumber?: unknown };
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";

  if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
    return NextResponse.json(
      { success: false, error: "invalid_phone", message: "Format téléphone invalide (ex: +33612345678)." },
      { status: 400 }
    );
  }

  try {
    await client.verify.v2.services(verifyServiceSid).verifications.create({ to: phoneNumber, channel: "sms" });
    return NextResponse.json({ success: true });
  } catch (error) {
    const twilioError = error as { code?: number; message?: string; status?: number };
    if (twilioError.code === 60200) {
      return NextResponse.json(
        { success: false, error: "invalid_phone", message: "Numéro de téléphone invalide." },
        { status: 400 }
      );
    }
    console.error("[auth/send-phone-code]", error);
    return NextResponse.json(
      { success: false, error: "sms_provider_error", message: "Impossible d'envoyer le code SMS." },
      { status: 502 }
    );
  }
}
