import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, message } = await req.json();

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    const pool = getPool();

    // Créer la table si elle n'existe pas encore
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(
      `INSERT INTO contact_messages (first_name, last_name, email, message)
       VALUES ($1, $2, $3, $4)`,
      [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), message.trim()]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json({ error: "Erreur serveur, réessayez." }, { status: 500 });
  }
}
