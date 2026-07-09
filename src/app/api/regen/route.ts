import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPool } from "@/lib/db";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { orderId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }
  const { orderId } = body;
  if (!orderId) return NextResponse.json({ error: "orderId requis" }, { status: 400 });

  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, plan, destination, questionnaire_data FROM orders WHERE id = $1`,
    [orderId]
  );
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante" }, { status: 503 });

  const destination = String(order.destination || "Destination");
  const plan = String(order.plan || "3j");
  const qdata = (order.questionnaire_data as Record<string, unknown>) || {};

  await pool.query(`UPDATE orders SET status='generating', delivery_error=null WHERE id=$1`, [orderId]);

  // Generate guide
  let guideText: string;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const { buildSystemPrompt, buildUserMessage, getMaxTokens } = await import("@/lib/guide-prompt");
    const input = { ...qdata, destination, duration: plan, email: "admin@regen.local" } as Parameters<typeof buildSystemPrompt>[0];
    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: getMaxTokens(plan),
      system: buildSystemPrompt(input),
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });
    const block = resp.content.find((b: { type: string }) => b.type === "text");
    guideText = block && "text" in block ? String((block as { text: string }).text) : "";
    if (!guideText) throw new Error("Claude a retourné un contenu vide");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await pool.query(`UPDATE orders SET status='error', delivery_error=$1 WHERE id=$2`, [msg, orderId]);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Generate and store PDF
  try {
    const { generateGuidePDF } = await import("@/lib/pdf-generator");
    const { createSupabaseServiceRoleClient } = await import("@/lib/supabase");
    const { default: crypto } = await import("crypto");
    const { buildSystemPrompt, buildUserMessage } = await import("@/lib/guide-prompt");
    const input = { ...qdata, destination, duration: plan, email: "admin@regen.local" } as Parameters<typeof buildSystemPrompt>[0];
    const pdf = await generateGuidePDF(input, guideText);
    const guideId = crypto.randomUUID();
    const pdfB64 = pdf.toString("base64");
    const supabase = createSupabaseServiceRoleClient();
    await supabase.from("guides").insert({ id: guideId, email: "admin@regen.local", destination, duration: plan, pdf_data: pdfB64 });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-ia.nanocorp.app";
    const dlUrl = `${baseUrl}/api/download-guide/${guideId}`;

    // Try email
    let emailSent = false;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { rows: psRows } = await pool.query(`SELECT email FROM payment_sessions WHERE session_id = (SELECT session_id FROM orders WHERE id = $1)`, [orderId]);
      const { rows: uRows } = await pool.query(`SELECT email FROM users WHERE id = (SELECT user_id FROM orders WHERE id = $1)`, [orderId]);
      const toEmail = psRows[0]?.email || uRows[0]?.email;
      if (toEmail) {
        const { Resend } = await import("resend");
        await new Resend(resendKey).emails.send({
          from: "Travel IA <noreply@travel-ia.fr>",
          to: toEmail,
          subject: `Votre guide ${destination} est prêt ✈️`,
          html: `<p>Votre guide <strong>${destination}</strong> est prêt. <a href="${dlUrl}">Télécharger</a></p>`,
          attachments: [{ filename: `guide-${destination.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`, content: pdfB64 }],
        });
        emailSent = true;
      }
    }

    await supabase.from("orders").update({
      status: "delivered", guide_url: dlUrl, pdf_url: dlUrl, guide_id: guideId,
      delivered_at: new Date().toISOString(),
      delivery_error: emailSent ? null : "PDF généré, email non envoyé",
    }).eq("id", orderId);

    return NextResponse.json({ success: true, guideId, emailSent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await pool.query(`UPDATE orders SET status='error', delivery_error=$1 WHERE id=$2`, [msg, orderId]);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
