import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPool } from "@/lib/db";
import { getConfig } from "@/lib/app-config";

export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const pool = getPool();

  // Load order
  const { rows } = await pool.query(
    `SELECT id, plan, destination, questionnaire_data FROM orders WHERE id = $1`,
    [id]
  );
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  // Get Anthropic key
  const apiKey = await getConfig("ANTHROPIC_API_KEY");
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante" }, { status: 503 });

  const destination = order.destination || "Destination";
  const plan = order.plan || "3j";

  // Set generating
  await pool.query(`UPDATE orders SET status='generating', delivery_error=null WHERE id=$1`, [id]);

  // Call Claude
  let guideContent: string;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `Génère un guide de voyage pour ${destination}, plan ${plan}. Sois détaillé et pratique.`
      }]
    });
    const block = response.content.find((b: { type: string }) => b.type === "text");
    guideContent = block && "text" in block ? String(block.text) : "";
    if (!guideContent) throw new Error("Réponse vide de Claude");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await pool.query(`UPDATE orders SET status='error', delivery_error=$1 WHERE id=$2`, [msg, id]);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Store guide text in DB (no PDF for now)
  await pool.query(
    `UPDATE orders SET status='delivered', guide_url=null, delivered_at=now(), delivery_error='PDF non généré - texte disponible' WHERE id=$1`,
    [id]
  );

  return NextResponse.json({ success: true, preview: guideContent.slice(0, 200) });
}
