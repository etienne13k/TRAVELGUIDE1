import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  const result: Record<string, string> = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ défini" : "❌ MANQUANT",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ défini" : "❌ MANQUANT",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ défini" : "❌ MANQUANT",
  };

  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    result.db_connection = "✅ OK";
  } catch (e: unknown) {
    result.db_connection = `❌ ERREUR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(result);
}
