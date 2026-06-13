import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Use streaming so Vercel Edge keeps the connection open
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        let fullText = "";

        const messageStream = anthropic.messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 2000,
          system:
            "Tu es un expert en voyages. Tu réponds UNIQUEMENT avec un tableau JSON valide, sans markdown, sans ```json, juste le JSON brut.",
          messages: [{ role: "user", content: buildPrompt(answers) }],
        });

        for await (const chunk of messageStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
          }
        }

        const clean = fullText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
        const match = clean.match(/\[[\s\S]*\]/);
        if (!match) {
          controller.enqueue(enc.encode(JSON.stringify({ error: "No JSON found", raw: fullText.slice(0, 300) })));
          controller.close();
          return;
        }

        const suggestions = JSON.parse(match[0]);
        controller.enqueue(enc.encode(JSON.stringify({ suggestions })));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(enc.encode(JSON.stringify({ error: msg })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/json" },
  });
}

function buildPrompt(a: Record<string, unknown>): string {
  const arr = (v: unknown) =>
    Array.isArray(v) ? (v as string[]).join(", ") : "non précisé";
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
- Rêve : ${a.dream_experience ?? "non précisé"}
- À éviter : ${a.things_to_avoid ?? "rien"}

Réponds avec un tableau JSON de 3 objets :
[
  {
    "name": "Ville ou région",
    "country": "Pays",
    "emoji": "1 emoji",
    "tagline": "Accroche courte max 8 mots",
    "why": "2-3 phrases personnalisées expliquant pourquoi cette destination colle parfaitement à ce voyageur",
    "highlights": ["point fort 1", "point fort 2", "point fort 3"]
  }
]

Les 3 destinations doivent être variées. Réponds UNIQUEMENT avec le tableau JSON.`;
}
