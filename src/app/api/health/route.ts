import { NextResponse } from "next/server";
import { getConfig } from "@/lib/app-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const [anthropic, stripe, webhook, internal, resend] = await Promise.all([
    getConfig("ANTHROPIC_API_KEY"),
    getConfig("STRIPE_SECRET_KEY"),
    getConfig("STRIPE_WEBHOOK_SECRET"),
    getConfig("INTERNAL_SECRET"),
    getConfig("RESEND_API_KEY"),
  ]);

  function fmt(val: string | null, envKey: string) {
    const fromEnv = Boolean(process.env[envKey]);
    if (!val) return "MISSING";
    return `set (${val.slice(0, 8)}...) [${fromEnv ? "env" : "db"}]`;
  }

  return NextResponse.json({
    status: "ok",
    env: {
      ANTHROPIC_API_KEY:    fmt(anthropic, "ANTHROPIC_API_KEY"),
      STRIPE_SECRET_KEY:    fmt(stripe, "STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET:fmt(webhook, "STRIPE_WEBHOOK_SECRET"),
      INTERNAL_SECRET:      fmt(internal, "INTERNAL_SECRET"),
      RESEND_API_KEY:       fmt(resend, "RESEND_API_KEY"),
      DATABASE_URL:         process.env.DATABASE_URL ? "set" : "MISSING",
      ADMIN_JWT_SECRET:     process.env.ADMIN_JWT_SECRET ? "set" : "MISSING",
    },
  });
}
