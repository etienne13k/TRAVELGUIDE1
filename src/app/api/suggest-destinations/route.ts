import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 503 });
  }

  let answers: Record<string, unknown>;
  try {
    answers = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1200,
    thinking: { type: "adaptive" },
    system: `Tu es un expert en voyages avec 20 ans d'expérience. Tu proposes des destinations parfaitement adaptées aux envies du voyageur. Tu réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`,
    messages: [{ role: "user", content: buildPrompt(answers) }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    return NextResponse.json({ error: "Parsing error" }, { status: 500 });
  }

  const suggestions = JSON.parse(match[0]);
  return NextResponse.json({ suggestions });
}

function buildPrompt(a: Record<string, unknown>): string {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : "non précisé");
  return `Propose exactement 3 destinations de voyage différentes et variées pour ce voyageur.

CRITÈRES :
- Départ depuis : ${a.departure_city ?? "non précisé"}
- Dates : ${a.travel_dates ?? "à déterminer"}
- Budget : ${a.budget ?? "non précisé"}${a.budget_amount ? ` (${a.budget_amount}${a.budget_currency ?? "€"})` : ""}
- Voyageurs : ${a.traveler_type ?? "non précisé"} — ${a.traveler_adults ?? 1} adulte(s)${a.traveler_children ? `, ${a.traveler_children} enfant(s)` : ""}
- Intérêts : ${arr(a.interests)}
- Paysage : ${arr(a.landscape)}
- Climat : ${a.climate ?? "non précisé"}
- Rythme : ${a.activity_pace ?? "non précisé"}
- Ambiance : ${a.trip_vibe ?? "non précisé"}
- Type : ${a.trip_type ?? "non précisé"}
- Vol max : ${a.max_flight_time ?? "peu importe"}
- Langues : ${arr(a.language_spoken)}
- Déjà visité / à éviter : ${a.already_visited ?? "rien"}
- Rêve de voyage : ${a.dream_experience ?? "non précisé"}
- À éviter : ${a.things_to_avoid ?? "rien"}

Réponds avec un tableau JSON de 3 objets avec exactement ces champs :
[
  {
    "name": "Nom de la destination (ville ou région)",
    "country": "Pays",
    "emoji": "1 emoji représentatif",
    "tagline": "Phrase d'accroche courte (max 8 mots)",
    "why": "Explication personnalisée de 2-3 phrases pourquoi cette destination correspond parfaitement à CE voyageur précis",
    "highlights": ["point fort 1", "point fort 2", "point fort 3"]
  }
]

Les 3 destinations doivent être vraiment variées. Réponds UNIQUEMENT avec le tableau JSON.`;
}
