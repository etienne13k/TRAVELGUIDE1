import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? `set (${process.env.ANTHROPIC_API_KEY.slice(0, 10)}...)` : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL ? "set" : "MISSING",
      INTERNAL_SECRET: process.env.INTERNAL_SECRET ? "set" : "MISSING",
      ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ? "set" : "MISSING",
    },
  });
}
