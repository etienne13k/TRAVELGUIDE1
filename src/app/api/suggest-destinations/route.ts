import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Pool } from "pg";

export const maxDuration = 60;

async function getApiKey(): Promise<string | null> {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  if (!process.env.DATABASE_URL) return null;
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const res = await pool.query("SELECT value FROM app_config WHERE key = 'ANTHROPIC_API_KEY' LIMIT 1");
    await pool.end();
    return res.rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante" }, { status: 503 });
  }

  let answers: Record<string, unknown>;
  try {
    answers = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      system: "Tu es un expert en voyages. Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown ni ```json, juste le JSON brut.",
      messages: [{ role: "user", content: buildPrompt(answers) }],
    });

    const text = (msg.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined)?.text ?? "";
    const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = clean.match(/\[[\s\S]*\]/);

    if (!match) {
      return NextResponse.json({ error: `JSON introuvable dans: ${text.slice(0, 200)}` }, { status: 500 });
    }

    const suggestions = JSON.parse(match[0]);
    return NextResponse.json({ suggestions });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPrompt(a: Record<string, unknown>): string {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : "non précisé");
  return `Propose 3 destinations de voyage variées pour ce voyageur.

- Départ : ${a.departure_city ?? "non précisé"}
- Budget : ${a.budget ?? "non précisé"}
- Intérêts : ${arr(a.interests)}, sports : ${arr(a.sports)}
- Paysage : ${arr(a.landscape)}, Climat : ${a.climate ?? "non précisé"}
- Ambiance : ${a.trip_vibe ?? "non précisé"}
- À éviter : ${a.already_visited ?? ""} ${a.things_to_avoid ?? ""}

Réponds avec exactement ce JSON (3 objets) :
[{"name":"ville","country":"pays","emoji":"emoji","tagline":"accroche courte","why":"2 phrases personnalisées","highlights":["atout1","atout2","atout3"]}]

UNIQUEMENT le tableau JSON.`;
}
