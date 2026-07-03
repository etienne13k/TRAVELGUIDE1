import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { createSupabaseServiceRoleClient, type Json } from "@/lib/supabase";
import { ensureAdminSchema } from "@/lib/admin-db";
import { buildSystemPrompt, buildUserMessage, getMaxTokens, type GuideInput } from "@/lib/guide-prompt";
import { generateGuidePDF } from "@/lib/pdf-generator";
import { getServerSession } from "@/lib/auth";
import { Pool } from "pg";
import crypto from "crypto";

export const maxDuration = 60;

async function getApiKey(): Promise<string | null> {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  if (!process.env.DATABASE_URL) return null;
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const res = await pool.query("SELECT value FROM app_config WHERE key = 'ANTHROPIC_API_KEY' LIMIT 1");
    await pool.end();
    return res.rows[0]?.value ?? null;
  } catch { return null; }
}

async function markOrderError(orderId: string | null, message: string) {
  if (!orderId) return;
  const supabase = createSupabaseServiceRoleClient();
  await supabase.from("orders").update({ status: "error", delivery_error: message }).eq("id", orderId);
}

async function ensureGuidesTable() {
  await ensureAdminSchema();
}

export async function POST(req: NextRequest) {
  // Get API key (from env or DB)
  const apiKey = await getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Service temporairement indisponible. Clé API non configurée." }, { status: 503 });
  }

  // Require authenticated session
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Vous devez être connecté pour générer un guide." }, { status: 401 });
  }

  let input: GuideInput & { orderId?: string };
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  // Weekly generation limit: 3 per verified account per week (based on session email)
  if (process.env.DATABASE_URL) {
    try {
      const limitPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await limitPool.query(`CREATE TABLE IF NOT EXISTS guide_limits (email text NOT NULL, week_start date NOT NULL, count int DEFAULT 1, PRIMARY KEY (email, week_start))`);

      // Check if account phone is verified
      const { rows: userRows } = await limitPool.query(
        `SELECT phone_verified FROM users WHERE email = $1 LIMIT 1`,
        [session.email.toLowerCase()]
      );
      const isVerified = userRows[0]?.phone_verified === true;
      if (!isVerified) {
        await limitPool.end();
        return NextResponse.json({ error: "Votre numéro de téléphone doit être vérifié pour générer un guide." }, { status: 403 });
      }

      // Check weekly count
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const ws = weekStart.toISOString().split("T")[0];
      const { rows } = await limitPool.query(
        `SELECT count FROM guide_limits WHERE email = $1 AND week_start = $2`,
        [session.email.toLowerCase(), ws]
      );
      const currentCount = Number(rows[0]?.count ?? 0);
      if (currentCount >= 3) {
        await limitPool.end();
        const resetAt = new Date(weekStart);
        resetAt.setDate(resetAt.getDate() + 7);
        return NextResponse.json({ error: "Limite de 3 générations par semaine atteinte.", resetAt: resetAt.toISOString() }, { status: 429 });
      }
      await limitPool.query(
        `INSERT INTO guide_limits (email, week_start, count) VALUES ($1, $2, 1) ON CONFLICT (email, week_start) DO UPDATE SET count = guide_limits.count + 1`,
        [session.email.toLowerCase(), ws]
      );
      await limitPool.end();
    } catch { /* non-fatal */ }
  }

  // Basic validation
  if (!input.email || !input.destination || !input.duration) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants : email, destination, duration." },
      { status: 400 }
    );
  }

  // Find and update the matching order for this email or explicit admin order id
  await ensureAdminSchema();
  const supabase = createSupabaseServiceRoleClient();
  let orderId: string | null = null;
  try {
    if (input.orderId) {
      const { data: order } = await supabase.from("orders").select("id").eq("id", input.orderId).maybeSingle();
      orderId = order?.id ?? null;
    } else {
      const { data: paymentSessions } = await supabase
        .from("payment_sessions")
        .select("session_id")
        .eq("email", input.email.toLowerCase());
      const sessionIds = (paymentSessions ?? []).map((session) => session.session_id);
      if (sessionIds.length > 0) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .in("session_id", sessionIds)
          .eq("plan", input.duration)
          .in("status", ["questionnaire_pending", "questionnaire_completed"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        orderId = order?.id ?? null;
      }
    }

    if (orderId) {
      await supabase
        .from("orders")
        .update({
          status: "generating",
          destination: input.destination,
          questionnaire_data: input as unknown as Json,
          quiz_responses: input as unknown as Json,
          delivery_error: null,
        })
        .eq("id", orderId);
    }
  } catch {
    // Non-fatal: order tracking failure doesn't block guide generation
  }

  // 1. Generate guide content with Claude
  let guideContent: string;
  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: getMaxTokens(input.duration),
      system: buildSystemPrompt(input.language === "en" ? "en" : "fr"),
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });
    guideContent = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");
    if (!guideContent) throw new Error("Claude returned empty content");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-guide] Claude error:", message);
    if (orderId) {
      await markOrderError(orderId, message).catch(() => undefined);
    }
    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return NextResponse.json(
        {
          error:
            "La génération du guide a pris trop de temps. Veuillez réessayer avec une destination plus courte.",
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la génération du contenu. Veuillez réessayer." },
      { status: 500 }
    );
  }

  // 1b. Coherence check — if issues detected, pause the order for admin review
  if (orderId) {
    try {
      const coherencePrompt = `Tu es un vérificateur de commandes pour un service de guide de voyage. Analyse le profil voyageur suivant et détecte UNIQUEMENT les problèmes sérieux qui rendraient ce guide inutilisable ou incohérent.

Signale SEULEMENT si :
- Le budget est clairement absurde pour la destination (ex: 50€ total pour Tokyo 14 jours)
- Les dates sont impossibles (voyage de 30 jours avec le plan 3 jours)
- Des informations critiques sont manquantes ou contradictoires
- Les réponses semblent être un test ou du contenu aléatoire sans sens

Ne signale PAS des imperfections normales ou des cas limites acceptables.

DONNÉES QUESTIONNAIRE :
Destination: ${input.destination}
Durée forfait: ${input.duration}
Dates: ${input.travel_dates || input.arrival_date || "non précisé"}
Groupe: ${input.traveler_type || "non précisé"}, ${input.traveler_adults || 1} adulte(s), ${input.traveler_children || 0} enfant(s)
Budget: ${input.budget || "non précisé"}${input.budget_amount ? `, ${input.budget_amount}${input.budget_currency || "€"} ${input.budget_scope === "per_person" ? "/pers" : "total"}` : ""}
Ville départ: ${input.departure_city || "non précisé"}
Email: ${input.email}
Notes: ${input.notes || "aucune"}

Réponds en JSON uniquement :
{"issues": ["problème 1", "problème 2"], "should_pause": true/false}

Si tout semble normal, réponds : {"issues": [], "should_pause": false}`;

      const coherenceClient = new Anthropic({ apiKey });
      const coherenceResp = await coherenceClient.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: coherencePrompt }],
      });
      const coherenceText = (coherenceResp.content.find(b => b.type === "text") as { type: "text"; text: string } | undefined)?.text ?? "";
      const jsonMatch = coherenceText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { issues?: string[]; should_pause?: boolean };
        if (parsed.should_pause && parsed.issues && parsed.issues.length > 0) {
          await supabase.from("orders").update({
            status: "paused_review",
            delivery_error: `[PAUSE AUTO] ${parsed.issues.join(" | ")}`,
          }).eq("id", orderId);
          return NextResponse.json({
            paused: true,
            reasons: parsed.issues,
            message: "Votre commande est en cours de vérification. Un membre de notre équipe va l'examiner et vous contactera dans les 24h.",
          }, { status: 202 });
        }
      }
    } catch {
      // Non-fatal: coherence check failure doesn't block generation
    }
  }

  // 2. Generate PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateGuidePDF(input, guideContent);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-guide] PDF error:", message);
    if (orderId) {
      await markOrderError(orderId, message).catch(() => undefined);
    }
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF. Veuillez réessayer." },
      { status: 500 }
    );
  }

  // 3. Store PDF in database
  let guideId: string;
  try {
    await ensureGuidesTable();
    guideId = crypto.randomUUID();
    const pdfBase64 = pdfBuffer.toString("base64");
    const { error } = await supabase.from("guides").insert({
      id: guideId,
      email: input.email,
      destination: input.destination,
      duration: input.duration,
      pdf_data: pdfBase64,
    });
    if (error) throw error;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-guide] DB error:", message);
    if (orderId) {
      await markOrderError(orderId, message).catch(() => undefined);
    }
    // Return PDF as base64 in response as fallback
    return NextResponse.json({
      guideId: null,
      pdfBase64: pdfBuffer.toString("base64"),
      emailSent: false,
      warning: "PDF généré mais non sauvegardé en base de données.",
    });
  }

  // 4. Send email with PDF attachment
  let emailSent = false;
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-guide.nanocorp.app";
      const downloadUrl = `${baseUrl}/api/download-guide/${guideId}`;

      await resend.emails.send({
        from: "TravelGuide AI <travel-guide@nanocorp.app>",
        to: input.email,
        subject: `Votre guide de voyage ${input.destination} est prêt ! ✈️`,
        html: buildEmailHtml(input, downloadUrl),
        attachments: [
          {
            filename: `guide-${input.destination.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`,
            content: pdfBuffer.toString("base64"),
          },
        ],
      });
      emailSent = true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[generate-guide] Email error:", message);
    }
  }

  // Update order delivery state
  if (orderId) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-guide.nanocorp.app";
    const guideDownloadUrl = `${baseUrl}/api/download-guide/${guideId}`;
    const deliveryStatus = emailSent ? "delivered" : "error";
    const deliveryError = emailSent ? null : "Email de livraison non envoyé";
    try {
      await supabase
        .from("orders")
        .update({
          status: deliveryStatus,
          guide_url: guideDownloadUrl,
          pdf_url: guideDownloadUrl,
          guide_id: guideId,
          delivered_at: deliveryStatus === "delivered" ? new Date().toISOString() : null,
          delivery_error: deliveryError,
        })
        .eq("id", orderId);
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json({
    guideId,
    emailSent,
    destination: input.destination,
    duration: input.duration,
  });
}

function buildEmailHtml(input: GuideInput, downloadUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F8F4EF; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; background: white; }
    .header { background: #425C47; padding: 40px; text-align: center; }
    .header h1 { color: white; font-size: 24px; margin: 0 0 8px; }
    .header p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }
    .body { padding: 40px; }
    .body h2 { color: #425C47; font-size: 20px; margin-bottom: 12px; }
    .body p { color: #4A4A6A; line-height: 1.6; font-size: 14px; }
    .btn { display: inline-block; background: #425C47; color: white !important; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 20px 0; }
    .info { background: #F8F4EF; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .info p { margin: 4px 0; font-size: 13px; }
    .disclaimer { font-size: 11px; color: #999; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TravelGuide AI</h1>
      <p>Votre guide de voyage personnalisé est prêt</p>
    </div>
    <div class="body">
      <h2>Votre guide ${input.destination} est prêt ! ✈️</h2>
      <p>Votre guide de voyage personnalisé a été généré par notre IA. Vous trouverez votre PDF en pièce jointe de cet email.</p>
      <div class="info">
        <p><strong>Destination :</strong> ${input.destination}</p>
        <p><strong>Durée :</strong> ${input.duration}</p>
        <p><strong>Budget :</strong> ${input.budget}</p>
      </div>
      <p>Vous pouvez également télécharger votre guide en cliquant sur le bouton ci-dessous :</p>
      <a href="${downloadUrl}" class="btn">Télécharger mon guide PDF →</a>
      <p class="disclaimer">${buildDisclaimer()}</p>
    </div>
  </div>
</body>
</html>`;
}

function buildDisclaimer(): string {
  return "Ce guide a été généré par intelligence artificielle. Les informations fournies sont données à titre indicatif et peuvent ne pas être exactes ou à jour. TravelGuide AI ne saurait être tenu responsable d'éventuelles erreurs ou omissions. Nous vous recommandons de vérifier les horaires, prix et disponibilités directement auprès des établissements avant votre départ.";
}
