import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante" }, { status: 503 });
  }

  let answers: Record<string, unknown>;
  try {
    answers = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
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
