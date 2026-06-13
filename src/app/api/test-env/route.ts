import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  const allAnthropicVars = Object.keys(process.env).filter(k =>
    k.toLowerCase().includes("anthropic")
  );
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key?.length ?? 0,
    keyPrefix: key ? key.slice(0, 12) + "..." : "MISSING",
    allAnthropicKeys: allAnthropicVars,
    timestamp: new Date().toISOString(),
  });
}
