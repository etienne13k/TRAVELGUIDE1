import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureAdminSchema, getClientIp, logAdminAction } from "@/lib/admin-db";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  await ensureAdminSchema();
  const pool = getPool();

  const { rows } = await pool.query(
    `SELECT id, email, is_suspended FROM users WHERE id = $1`,
    [id]
  );
  const user = rows[0];
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const nextSuspended = !user.is_suspended;
  await pool.query(
    `UPDATE users SET is_suspended = $1, suspended_at = $2 WHERE id = $3`,
    [nextSuspended, nextSuspended ? new Date().toISOString() : null, id]
  );

  await logAdminAction({
    adminEmail: admin.email,
    action: nextSuspended ? "user_suspended" : "user_reactivated",
    targetType: "user",
    targetId: id,
    metadata: { userEmail: user.email },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true, isSuspended: nextSuspended });
}
