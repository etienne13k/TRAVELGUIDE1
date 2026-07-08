import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "set" : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL ? "set" : "MISSING",
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      INTERNAL_SECRET: process.env.INTERNAL_SECRET ? "set" : "MISSING",
      ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ? "set" : "MISSING",
    },
  });
}
