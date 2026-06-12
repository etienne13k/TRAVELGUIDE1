import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";

// Route one-shot pour créer le compte admin
// Protégée par un token secret — à appeler UNE SEULE FOIS depuis le navigateur
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  // Vérification du token de setup (à définir dans les variables d'environnement)
  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  if (!setupToken || token !== setupToken) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const email = "admin@spiregg.app";
  const password = "SpireggAdmin2025!";
  const pool = getPool();

  try {
    // Créer la table users si besoin
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        is_suspended BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Vérifier si l'admin existe déjà
    const { rows } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    const hash = await bcrypt.hash(password, 12);

    if (rows.length > 0) {
      // Mettre à jour si existe
      await pool.query(
        "UPDATE users SET password_hash = $1, is_admin = true, is_suspended = false WHERE email = $2",
        [hash, email]
      );
      return NextResponse.json({ success: true, action: "updated", email });
    }

    // Créer le compte admin
    await pool.query(
      `INSERT INTO users (email, password_hash, is_admin)
       VALUES ($1, $2, true)`,
      [email, hash]
    );

    return NextResponse.json({ success: true, action: "created", email });
  } catch (error) {
    console.error("[admin/setup]", error);
    return NextResponse.json({ error: "Erreur serveur", detail: String(error) }, { status: 500 });
  }
}
