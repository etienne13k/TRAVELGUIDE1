import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbKey = "not_checked";
  if (process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      const res = await pool.query("SELECT value FROM app_config WHERE key = 'ANTHROPIC_API_KEY' LIMIT 1");
      await pool.end();
      dbKey = res.rows[0]?.value ? "OK (len=" + res.rows[0].value.length + ")" : "ROW_NOT_FOUND";
    } catch (e) {
      dbKey = "DB_ERROR: " + String(e);
    }
  } else {
    dbKey = "NO_DATABASE_URL";
  }

  return NextResponse.json({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "OK (len=" + process.env.ANTHROPIC_API_KEY.length + ")" : "MISSING",
    DATABASE_URL_host: process.env.DATABASE_URL ? (() => { try { return new URL(process.env.DATABASE_URL!).hostname; } catch { return "parse_error"; } })() : "MISSING",
    db_anthropic_key: dbKey,
    timestamp: new Date().toISOString(),
  });
}
