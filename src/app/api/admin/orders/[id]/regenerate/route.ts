import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPool } from "@/lib/db";

export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const pool = getPool();

  const { rows } = await pool.query(
    `SELECT id, plan, destination, questionnaire_data FROM orders WHERE id = $1`,
    [id]
  );
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  // Get Anthropic key from env only
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante (env)" }, { status: 503 });

  const destination = String(order.destination || "Destination");
  const plan = String(order.plan || "3j");

  await pool.query(`UPDATE orders SET status='generating', delivery_error=null WHERE id=$1`, [id]);

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: `Génère un guide de voyage détaillé pour ${destination}, forfait ${plan}.` }],
    });
    const block = response.content.find((b: { type: string }) => b.type === "text");
    const text = block && "text" in block ? String((block as { text: string }).text) : "";
    if (!text) throw new Error("Claude a retourné un contenu vide");

    await pool.query(
      `UPDATE orders SET status='delivered', delivered_at=now(), delivery_error='PDF non généré' WHERE id=$1`,
      [id]
    );

    return NextResponse.json({ success: true, plan, destination, preview: text.slice(0, 300) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await pool.query(`UPDATE orders SET status='error', delivery_error=$1 WHERE id=$2`, [msg, id]);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
