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

function isoToFlag(iso: string): string {
  const code = iso.toUpperCase().trim();
  if (code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
}

async function fetchWikipediaPhoto(city: string, country: string): Promise<string | null> {
  const queries = [city, `${city}, ${country}`, country];
  for (const q of queries) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { "User-Agent": "TravelGuideAI/1.0" }, signal: AbortSignal.timeout(4000) });
      if (!res.ok) continue;
      const data = await res.json() as { thumbnail?: { source?: string } };
      const photo = data.thumbnail?.source;
      if (photo) return photo;
    } catch { continue; }
  }
  return null;
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

    const suggestions: Array<Record<string, unknown>> = JSON.parse(match[0]);

    // Fetch Wikipedia photos in parallel + generate flag from ISO code
    const withPhotos = await Promise.all(
      suggestions.map(async (s) => {
        const photo = await fetchWikipediaPhoto(String(s.name ?? ""), String(s.country ?? ""));
        const flag = isoToFlag(String(s.iso ?? ""));
        return { ...s, photo, flag };
      })
    );

    return NextResponse.json({ suggestions: withPhotos });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPrompt(a: Record<string, unknown>): string {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : "non précisé");
  const budget = a.budget as string ?? "";
  const travelerType = a.traveler_type as string ?? "";
  const adults = Number(a.traveler_adults ?? 1);
  const children = Number(a.traveler_children ?? 0);

  const groupDesc = travelerType === "solo" ? "voyageur solo" :
    travelerType === "couple" ? "couple" :
    travelerType === "family" ? `famille avec ${children} enfant${children > 1 ? "s" : ""}` :
    travelerType === "friends" ? `groupe de ${adults} amis` : "groupe";

  const budgetConstraint = budget === "backpacker"
    ? "BUDGET LIMITÉ : ne propose QUE des destinations accessibles pour un petit budget (logement < 40€/nuit, vie courante abordable)."
    : budget === "luxury"
    ? "BUDGET PREMIUM : propose des destinations avec des expériences haut de gamme possibles."
    : "Budget confort (milieu de gamme).";

  return `Tu es un expert en voyages. Propose 3 destinations RÉELLES et EXISTANTES pour ce voyageur.

PROFIL VOYAGEUR :
- Départ : ${a.departure_city ?? "non précisé"}
- Groupe : ${groupDesc}
- Budget : ${budgetConstraint}
- Intérêts : ${arr(a.interests)}${arr(a.sports) !== "non précisé" ? `, sports : ${arr(a.sports)}` : ""}
- Paysage souhaité : ${arr(a.landscape)}
- Climat préféré : ${a.climate ?? "non précisé"}
- Ambiance : ${a.trip_vibe ?? "non précisé"}
- Type de voyage : ${a.trip_type ?? "non précisé"}
- Style : ${a.authenticity ?? "non précisé"}
- Rêve de voyage : ${a.dream_experience ?? ""}
- À éviter absolument : ${[a.already_visited, a.things_to_avoid].filter(Boolean).join(", ") || "rien de spécifié"}

RÈGLES STRICTES DE COHÉRENCE :
1. Toutes les destinations proposées doivent être des villes ou pays RÉELS et GÉOGRAPHIQUEMENT EXISTANTS.
2. Si le budget est "backpacker", n'inclus JAMAIS des destinations connues pour être très chères (Maldives, Dubaï, Suisse…). Adapte strictement au budget.
3. Si le voyageur est solo, toutes les recommandations doivent être adaptées au voyage seul.
4. Assure-toi que les 3 destinations sont variées (différents continents ou régions si possible).
5. Tiens compte du temps de vol acceptable depuis la ville de départ.

Réponds avec exactement ce JSON (3 objets) :
[{"name":"ville/destination","country":"pays en français","iso":"code ISO 2 lettres du pays (ex: FR, JP, BR, MA, TH)","emoji":"emoji paysage ou activité","tagline":"accroche de 8 mots max","why":"2 phrases expliquant POURQUOI cette destination correspond EXACTEMENT à ce profil","highlights":["atout1 concret","atout2 concret","atout3 concret"]}]

UNIQUEMENT le tableau JSON brut, sans markdown.`;
}
