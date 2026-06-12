import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, is_suspended FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }
    if (user.is_suspended) {
      return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    const token = await createSession({ userId: user.id, email: user.email });
    const response = NextResponse.json({ success: true, email: user.email });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
