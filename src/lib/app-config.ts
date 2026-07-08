import { Pool } from "pg";

let _pool: Pool | null = null;
function getConfigPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!_pool) _pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return _pool;
}

const cache: Record<string, { value: string; ts: number }> = {};
const CACHE_TTL = 60_000; // 1 min

export async function getConfig(key: string): Promise<string | null> {
  if (process.env[key]) return process.env[key]!;

  const now = Date.now();
  if (cache[key] && now - cache[key].ts < CACHE_TTL) return cache[key].value;

  const pool = getConfigPool();
  if (!pool) return null;

  try {
    const res = await pool.query("SELECT value FROM app_config WHERE key = $1 LIMIT 1", [key]);
    const value = res.rows[0]?.value ?? null;
    if (value) cache[key] = { value, ts: now };
    return value;
  } catch {
    return null;
  }
}
