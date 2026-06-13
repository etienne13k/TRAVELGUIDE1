import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), { status: 503 });
  }

  let answers: Record<string, unknown>;
  try {
    answers = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        system:
          "Tu es un expert en voyages. Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown, sans ```json, juste le JSON brut.",
        messages: [{ role: "user", content: buildPrompt(answers) }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? "";

    const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) {
      return new Response(JSON.stringify({ error: "No JSON", raw: text.slice(0, 300) }), { status: 500 });
    }

    const suggestions = JSON.parse(match[0]);
    return new Response(JSON.stringify({ suggestions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

function buildPrompt(a: Record<string, unknown>): string {
  const arr = (v: unknown) =>
    Array.isArray(v) ? (v as string[]).join(", ") : "non précisé";
  return `Propose exactement 3 destinations de voyage différentes et variées.

PROFIL DU VOYAGEUR :
- Départ : ${a.departure_city ?? "non précisé"}
- Dates : ${a.travel_dates ?? "non précisé"}
- Budget : ${a.budget ?? "non précisé"}${a.budget_amount ? ` (${a.budget_amount}${a.budget_currency ?? "€"})` : ""}
- Groupe : ${a.traveler_type ?? "non précisé"}, ${a.traveler_adults ?? 1} adulte(s)
- Intérêts : ${arr(a.interests)}
- Sports : ${arr(a.sports)}
- Paysage : ${arr(a.landscape)}
- Climat : ${a.climate ?? "non précisé"}
- Ambiance : ${a.trip_vibe ?? "non précisé"}
- Rythme : ${a.activity_pace ?? "non précisé"}
- Vol max : ${a.max_flight_time ?? "peu importe"}
- Langues : ${arr(a.language_spoken)}
- À éviter : ${a.already_visited ?? ""} ${a.things_to_avoid ?? ""}
- Rêve : ${a.dream_experience ?? "non précisé"}

Format JSON attendu (tableau de 3 objets) :
[{"name":"ville","country":"pays","emoji":"emoji","tagline":"accroche max 8 mots","why":"2 phrases personnalisées","highlights":["atout1","atout2","atout3"]}]

UNIQUEMENT le tableau JSON, rien d'autre.`;
}
