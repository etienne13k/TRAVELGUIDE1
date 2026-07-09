import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureAdminSchema, getClientIp, logAdminAction } from "@/lib/admin-db";
import { getPool } from "@/lib/db";
import { getConfig } from "@/lib/app-config";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { buildSystemPrompt, buildUserMessage, getMaxTokens } from "@/lib/guide-prompt";
import { generateGuidePDF } from "@/lib/pdf-generator";
import { Resend } from "resend";
import { createAnthropicClient, getAnthropicApiKey, getAnthropicModel, getAnthropicText } from "@/lib/anthropic";
import crypto from "crypto";

export const maxDuration = 60;
export const runtime = "nodejs";

type QuestionnaireData = Record<string, unknown>;

function asString(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return typeof value === "string" ? value : String(value ?? "");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    return await handleRegenerate(req, params);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Erreur inattendue: ${message}` }, { status: 500 });
  }
}

async function handleRegenerate(req: NextRequest, params: Promise<{ id: string }>) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  await ensureAdminSchema();
  const pool = getPool();
  const supabase = createSupabaseServiceRoleClient();

  const { rows: orderRows } = await pool.query(
    `SELECT id, user_id, session_id, plan, destination, questionnaire_data FROM orders WHERE id = $1`,
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
  const answers = (order.questionnaire_data ?? {}) as QuestionnaireData;

  const email = orderEmail || asString(answers.user_email || answers.email) || "noreply@travelguide.app";
  const destination = order.destination || asString(answers.destination || answers.destination_arrival_city) || "Destination a definir";

  await pool.query(`UPDATE orders SET status = 'generating', delivery_error = null WHERE id = $1`, [id]);

  // Get Anthropic API key
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    await pool.query(`UPDATE orders SET status = 'error', delivery_error = $1 WHERE id = $2`, ["ANTHROPIC_API_KEY manquante", id]);
    return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante" }, { status: 503 });
  }

  const input = {
    ...answers,
    email,
    destination,
    duration: order.plan,
    mode: asString(answers.mode) || undefined,
    destination_arrival_city: asString(answers.destination_arrival_city) || undefined,
  } as Parameters<typeof buildSystemPrompt>[0];

  // 1. Generate guide with Claude — directly, no HTTP call
  let guideContent: string;
  try {
    const anthropic = createAnthropicClient(apiKey);
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: getMaxTokens(order.plan),
      system: buildSystemPrompt(input),
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });
    guideContent = getAnthropicText(response.content);
    if (!guideContent) throw new Error("Claude returned empty content");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await pool.query(`UPDATE orders SET status = 'error', delivery_error = $1 WHERE id = $2`, [message, id]);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 2. Generate PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateGuidePDF(input, guideContent);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await pool.query(`UPDATE orders SET status = 'error', delivery_error = $1 WHERE id = $2`, [message, id]);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 3. Store PDF
  const guideId = crypto.randomUUID();
  const pdfBase64 = pdfBuffer.toString("base64");
  await supabase.from("guides").insert({ id: guideId, email, destination, duration: order.plan, pdf_data: pdfBase64 }).catch(() => undefined);

  // 4. Send email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin;
  const downloadUrl = `${baseUrl}/api/download-guide/${guideId}`;
  const resendKey = await getConfig("RESEND_API_KEY");
  let emailSent = false;
  if (resendKey && email !== "noreply@travelguide.app") {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Travel IA <noreply@travel-ia.fr>",
        to: email,
        subject: `Votre guide de voyage ${destination} est prêt ! ✈️`,
        html: `<p>Bonjour,</p><p>Votre guide <strong>${destination}</strong> est prêt.</p><p><a href="${downloadUrl}">Télécharger mon guide PDF</a></p>`,
        attachments: [{ filename: `guide-${destination.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`, content: pdfBase64 }],
      });
      emailSent = true;
    } catch { /* non-fatal */ }
  }

  // 5. Update order
  await supabase.from("orders").update({
    status: "delivered",
    guide_url: downloadUrl,
    pdf_url: downloadUrl,
    guide_id: guideId,
    delivered_at: new Date().toISOString(),
    delivery_error: emailSent ? null : "PDF généré, email non envoyé",
  }).eq("id", id);

  await logAdminAction({
    adminEmail: admin.email,
    action: "order_regenerated",
    targetType: "order",
    targetId: id,
    metadata: { email, destination, plan: order.plan },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true, guideId, emailSent });
}
