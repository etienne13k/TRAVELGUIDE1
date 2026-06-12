import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "tgai_admin_session";
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8;

export interface AdminSessionPayload {
  email: string;
  role: "admin";
  [key: string]: unknown;
}

function getAdminSecret(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(email: string): Promise<string> {
  const secret = getAdminSecret();
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not configured");

  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  const secret = getAdminSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin" || typeof payload.email !== "string") return null;
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export const ADMIN_SESSION_MAX_AGE = ADMIN_TOKEN_TTL_SECONDS;
