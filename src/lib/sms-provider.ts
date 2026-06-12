type SendOtpResult = {
  provider: string;
  verificationSid: string | null;
  status: string;
};

type CheckOtpResult = {
  provider: string;
  verified: boolean;
  status: string;
};

class SmsProviderError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 503) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function selectedProvider(): string {
  return (process.env.SMS_PROVIDER || "twilio").toLowerCase().trim();
}

function twilioAuthHeader(): string | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;

  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

function twilioServiceSid(): string | null {
  return process.env.TWILIO_VERIFY_SERVICE_SID || null;
}

async function twilioRequest<T>(path: string, body: URLSearchParams): Promise<T> {
  const authHeader = twilioAuthHeader();
  const serviceSid = twilioServiceSid();
  if (!authHeader || !serviceSid) {
    throw new SmsProviderError("sms_not_configured", "Twilio Verify is not configured.");
  }

  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    throw new SmsProviderError("sms_provider_error", data.message || "SMS provider rejected the request.", response.status);
  }

  return data;
}

async function sendTwilioOtp(phone: string): Promise<SendOtpResult> {
  const data = await twilioRequest<{ sid?: string; status?: string }>(
    "Verifications",
    new URLSearchParams({ To: phone, Channel: "sms" })
  );

  return {
    provider: "twilio",
    verificationSid: data.sid ?? null,
    status: data.status ?? "pending",
  };
}

async function checkTwilioOtp(phone: string, code: string): Promise<CheckOtpResult> {
  const data = await twilioRequest<{ status?: string }>(
    "VerificationCheck",
    new URLSearchParams({ To: phone, Code: code })
  );

  return {
    provider: "twilio",
    verified: data.status === "approved",
    status: data.status ?? "pending",
  };
}

function providerUnavailable(provider: string): never {
  throw new SmsProviderError(
    "sms_not_configured",
    `${provider} SMS verification is selected but not configured in this build.`,
    501
  );
}

function mockCode(): string {
  return process.env.SMS_MOCK_CODE || "000000";
}

async function sendMockOtp(): Promise<SendOtpResult> {
  if (process.env.NODE_ENV === "production") providerUnavailable("mock");
  return { provider: "mock", verificationSid: "mock_verification", status: "pending" };
}

async function checkMockOtp(code: string): Promise<CheckOtpResult> {
  if (process.env.NODE_ENV === "production") providerUnavailable("mock");
  return { provider: "mock", verified: code === mockCode(), status: code === mockCode() ? "approved" : "pending" };
}

export async function sendPhoneOtp(phone: string): Promise<SendOtpResult> {
  const provider = selectedProvider();
  if (provider === "twilio") return sendTwilioOtp(phone);
  if (provider === "mock") return sendMockOtp();
  if (provider === "vonage" || provider === "sinch") providerUnavailable(provider);

  throw new SmsProviderError("unsupported_provider", `Unsupported SMS_PROVIDER: ${provider}`, 400);
}

export async function checkPhoneOtp(phone: string, code: string): Promise<CheckOtpResult> {
  const provider = selectedProvider();
  if (provider === "twilio") return checkTwilioOtp(phone, code);
  if (provider === "mock") return checkMockOtp(code);
  if (provider === "vonage" || provider === "sinch") providerUnavailable(provider);

  throw new SmsProviderError("unsupported_provider", `Unsupported SMS_PROVIDER: ${provider}`, 400);
}

export function smsErrorResponse(error: unknown): { code: string; message: string; status: number } | null {
  if (error instanceof SmsProviderError) {
    return { code: error.code, message: error.message, status: error.status };
  }

  return null;
}
