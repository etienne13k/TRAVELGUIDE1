type SendOtpResult = {
  provider: string;
  demoMode: boolean;
  demoCode: string | null;
  verificationSid: string | null;
  status: string;
};

type CheckOtpResult = {
  provider: string;
  demoMode: boolean;
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

function envValue(name: string): string | null {
  const value = process.env[name]?.trim();
  if (!value) return null;
  if (value.includes("your_") || value.includes("_here")) return null;
  return value;
}

function twilioAuthHeader(): string | null {
  const accountSid = envValue("TWILIO_ACCOUNT_SID");
  const authToken = envValue("TWILIO_AUTH_TOKEN");
  if (!accountSid || !authToken) return null;

  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

function twilioServiceSid(): string | null {
  return envValue("TWILIO_VERIFY_SERVICE_SID");
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

  const data = (await response.json().catch(() => ({}))) as T & { code?: number; message?: string; more_info?: string };
  if (!response.ok) {
    console.error("[sms-provider] Twilio Verify request failed", {
      path,
      status: response.status,
      code: data.code,
      message: data.message,
      moreInfo: data.more_info,
    });
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
    demoMode: false,
    demoCode: null,
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
    demoMode: false,
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

function isTwilioConfigured(): boolean {
  return Boolean(twilioAuthHeader() && twilioServiceSid());
}

function logMockFallback(reason: string): void {
  console.warn("[sms-provider] SMS demo mode active; no real SMS will be sent", {
    reason,
    expectedEnv: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"],
  });
}

async function sendMockOtp(reason: string): Promise<SendOtpResult> {
  const code = mockCode();
  logMockFallback(reason);
  console.info("[sms-provider] Mock OTP generated", { code });
  return { provider: "mock", demoMode: true, demoCode: code, verificationSid: "mock_verification", status: "pending" };
}

async function checkMockOtp(code: string, reason: string): Promise<CheckOtpResult> {
  const expectedCode = mockCode();
  logMockFallback(reason);
  return { provider: "mock", demoMode: true, verified: code === expectedCode, status: code === expectedCode ? "approved" : "pending" };
}

export async function sendPhoneOtp(phone: string): Promise<SendOtpResult> {
  const provider = selectedProvider();
  if (provider === "twilio") {
    if (!isTwilioConfigured()) return sendMockOtp("twilio_missing_credentials");
    return sendTwilioOtp(phone);
  }
  if (provider === "mock") return sendMockOtp("sms_provider_mock");
  if (provider === "vonage" || provider === "sinch") providerUnavailable(provider);

  throw new SmsProviderError("unsupported_provider", `Unsupported SMS_PROVIDER: ${provider}`, 400);
}

export async function checkPhoneOtp(phone: string, code: string): Promise<CheckOtpResult> {
  const provider = selectedProvider();
  if (provider === "twilio") {
    if (!isTwilioConfigured()) return checkMockOtp(code, "twilio_missing_credentials");
    return checkTwilioOtp(phone, code);
  }
  if (provider === "mock") return checkMockOtp(code, "sms_provider_mock");
  if (provider === "vonage" || provider === "sinch") providerUnavailable(provider);

  throw new SmsProviderError("unsupported_provider", `Unsupported SMS_PROVIDER: ${provider}`, 400);
}

export function smsErrorResponse(error: unknown): { code: string; message: string; status: number } | null {
  if (error instanceof SmsProviderError) {
    return { code: error.code, message: error.message, status: error.status };
  }

  return null;
}
