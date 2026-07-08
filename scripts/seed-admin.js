#!/usr/bin/env node
/**
 * seed-admin.js — Creates (or updates) the admin account in the PostgreSQL database.
 *
 * Usage:
 *   DATABASE_URL=<neon-connection-string> node scripts/seed-admin.js
 *
 * The script is idempotent: running it twice on the same email only updates the password hash.
 * It updates both admin stores used by the login route:
 *   - admin_accounts (primary admin auth table)
 *   - profiles/users view (fallback auth path)
 *
 * Required env:
 *   DATABASE_URL   — Neon PostgreSQL connection string (already set in .env.local)
 *
 * Optional overrides (defaults below):
 *   ADMIN_EMAIL    — admin@spiregg.app
 *   ADMIN_PASSWORD — SpireggAdmin2025!
 */

"use strict";

const { Client } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@spiregg.app";
  const adminPassword = process.env.ADMIN_PASSWORD || "SpireggAdmin2025!";

  if (!process.env.DATABASE_URL) {
    console.error("❌  DATABASE_URL is not set. Export it or add it to .env.local");
    process.exit(1);
  }

  console.log(`🔑  Hashing password for ${adminEmail} …`);
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Ensure is_admin column exists
    await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE`);

    // Ensure the users view includes is_admin
    await client.query(`
      CREATE OR REPLACE VIEW users AS
        SELECT id, email, password_hash, phone AS phone_number, phone_verified,
               is_suspended, suspended_at, created_at, is_admin
        FROM profiles
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(
      `INSERT INTO admin_accounts (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash`,
      [adminEmail, passwordHash]
    );

    // Upsert admin fallback user
    const result = await client.query(
      `INSERT INTO profiles (email, password_hash, is_admin, phone_verified, is_suspended)
       VALUES ($1, $2, true, true, false)
       ON CONFLICT (email) DO UPDATE
         SET password_hash  = EXCLUDED.password_hash,
             is_admin       = true,
             phone_verified = true,
             is_suspended   = false
       RETURNING id, email, is_admin`,
      [adminEmail, passwordHash]
    );

    await client.query(
      `DELETE FROM admin_login_attempts
       WHERE email = $1`,
      [adminEmail]
    ).catch(() => undefined);

    const row = result.rows[0];
    console.log(`✅  Admin account ready:`);
    console.log(`    ID    : ${row.id}`);
    console.log(`    Email : ${row.email}`);
    console.log(`    Admin : ${row.is_admin}`);
    console.log(`    Primary admin_accounts row updated: true`);
    console.log(`    Recent failed attempts for this email cleared: true`);
    console.log(`\n    Login at https://travel-ia.nanocorp.app/admin/login`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("❌ ", err.message);
  process.exit(1);
});
