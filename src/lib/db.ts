/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;

export function getPool() {
  if (!pool) {
    // Dynamic require prevents webpack from bundling pg
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
