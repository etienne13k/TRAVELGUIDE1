import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const pool = getPool();

    const { rows } = await pool.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used = false AND expires_at > now()`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Ce lien est invalide ou a expiré" }, { status: 400 });
    }

    const { id: tokenId, user_id: userId } = rows[0];
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query("UPDATE profiles SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);
    await pool.query("UPDATE password_reset_tokens SET used = true WHERE id = $1", [tokenId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
