import type { NextRequest } from "next/server";
import { getPool } from "@/lib/db";

export async function ensureAdminSchema() {
  // no-op: schema is managed via migrations
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.headers.get("x-real-ip") || "unknown";
}

export async function logAdminAction(params: {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  await ensureAdminSchema();
  const pool = getPool();
  await pool.query(
    `INSERT INTO admin_logs (admin_email, action, target_type, target_id, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      params.adminEmail,
      params.action,
      params.targetType,
      params.targetId ?? null,
      JSON.stringify(params.metadata ?? {}),
      params.ipAddress ?? null,
    ]
  );
}
