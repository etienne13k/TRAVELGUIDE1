#!/usr/bin/env node
/**
 * seed-admin.js — Creates (or updates) the admin account in the PostgreSQL database.
 *
 * Usage:
 *   DATABASE_URL=<neon-connection-string> node scripts/seed-admin.js
 *
 * The script is idempotent: running it twice on the same email only updates the password hash.
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

    // Upsert admin
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

    const row = result.rows[0];
    console.log(`✅  Admin account ready:`);
    console.log(`    ID    : ${row.id}`);
    console.log(`    Email : ${row.email}`);
    console.log(`    Admin : ${row.is_admin}`);
    console.log(`\n    Login at https://travel-guide.nanocorp.app/admin/login`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("❌ ", err.message);
  process.exit(1);
});
