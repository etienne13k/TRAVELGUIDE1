import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  const result: Record<string, string> = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ défini" : "❌ MANQUANT",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ défini" : "❌ MANQUANT",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "✅ défini" : "❌ MANQUANT",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "✅ défini" : "❌ MANQUANT",
    TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID ? "✅ défini" : "❌ MANQUANT",
  };

  try {
    const pool = getPool();
    const { rows } = await pool.query("SELECT current_database() as db, inet_server_addr()::text as ip");
    result.db_connection = "✅ OK";
    result.db_name = rows[0].db;
    result.db_ip = rows[0].ip;
  } catch (e: unknown) {
    result.db_connection = `❌ ERREUR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(result);
}
