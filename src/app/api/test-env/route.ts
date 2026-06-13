import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "OK (len=" + process.env.ANTHROPIC_API_KEY.length + ")" : "MISSING",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "OK" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "OK" : "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING",
    totalEnvVars: Object.keys(process.env).length,
    timestamp: new Date().toISOString(),
  });
}
