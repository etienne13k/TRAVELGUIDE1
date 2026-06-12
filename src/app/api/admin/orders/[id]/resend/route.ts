import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureAdminSchema, getClientIp, logAdminAction } from "@/lib/admin-db";
import { getPool } from "@/lib/db";

function guideIdFromUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/api\/download-guide\/([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "RESEND_API_KEY non configurée" }, { status: 503 });

  const { id } = await params;
  await ensureAdminSchema();
  const pool = getPool();

  const { rows: orderRows } = await pool.query(
    `SELECT id, user_id, session_id, destination, plan, guide_url, guide_id FROM orders WHERE id = $1`,
    [id]
  );
  const order = orderRows[0];
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const [{ rows: psRows }, { rows: userRows }] = await Promise.all([
    order.session_id
      ? pool.query(`SELECT email FROM payment_sessions WHERE session_id = $1`, [order.session_id])
      : Promise.resolve({ rows: [] }),
    order.user_id
      ? pool.query(`SELECT email FROM users WHERE id = $1`, [order.user_id])
      : Promise.resolve({ rows: [] }),
  ]);

  const orderEmail = psRows[0]?.email ?? userRows[0]?.email ?? null;
  if (!orderEmail) return NextResponse.json({ error: "Email client introuvable" }, { status: 400 });

  const guideId = order.guide_id || guideIdFromUrl(order.guide_url);
  if (!guideId) return NextResponse.json({ error: "Aucun PDF disponible" }, { status: 400 });

  const { rows: guideRows } = await pool.query(
    `SELECT pdf_data, destination, duration FROM guides WHERE id = $1`,
    [guideId]
  );
  const guide = guideRows[0];
  if (!guide) return NextResponse.json({ error: "PDF introuvable" }, { status: 404 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-guide.nanocorp.app";
  const downloadUrl = `${baseUrl}/api/download-guide/${guideId}`;
  const destination = order.destination || guide.destination;

  await resend.emails.send({
    from: "TravelGuide AI <guides@travelguide.ai>",
    to: orderEmail,
    subject: `Votre guide de voyage ${destination} est disponible ✈️`,
    html: `<p>Bonjour,</p><p>Voici à nouveau votre guide personnalisé pour <strong>${destination}</strong>.</p><p><a href="${downloadUrl}">Télécharger le PDF</a></p>`,
    attachments: [
      {
        filename: `guide-${String(destination).replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`,
        content: guide.pdf_data,
      },
    ],
  });

  await logAdminAction({
    adminEmail: admin.email,
    action: "delivery_email_resent",
    targetType: "order",
    targetId: id,
    metadata: { email: orderEmail, guideId },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
}
