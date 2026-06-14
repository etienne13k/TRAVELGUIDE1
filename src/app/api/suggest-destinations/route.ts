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

    // Generate flag emoji from ISO code
    const withPhotos = suggestions.map((s) => {
      const flag = isoToFlag(String(s.iso ?? ""));
      return { ...s, flag, photo: null };
    });

    return NextResponse.json({ suggestions: withPhotos });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPrompt(a: Record<string, unknown>): string {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : null);
  const budget = (a.budget as string) ?? "";
  const travelerType = (a.traveler_type as string) ?? "";
  const adults = Number(a.traveler_adults ?? 1);
  const children = Number(a.traveler_children ?? 0);
  const departure = (a.departure_city as string) ?? "";
  const duration = (a.duration as string) ?? "";

  const groupDesc =
    travelerType === "solo" ? "voyageur solo" :
    travelerType === "couple" ? "couple" :
    travelerType === "family" ? `famille avec ${children} enfant${children > 1 ? "s" : ""}` :
    travelerType === "friends" ? `groupe de ${adults} amis` : "groupe";

  // Flight time budget derived from trip duration
  const flightGuidance = duration
    ? `La durée du voyage est ${duration}. Calcule le temps de vol depuis ${departure || "la France"} et ne propose pas de destination dont le vol aller dépasse ~30% de la durée totale du séjour (ex: si le voyage dure 5 jours, évite les vols >7h). Pour un long séjour (14j+), tous les continents sont envisageables.`
    : `Tiens compte du temps de vol réel depuis ${departure || "la France"} — privilégie la cohérence avec la durée du séjour.`;

  const budgetLabel =
    budget === "backpacker" ? "petit budget / backpacker (logement < 40€/nuit, destinations accessibles financièrement)" :
    budget === "comfort" ? "budget confort / milieu de gamme (50–120€/nuit)" :
    budget === "luxury" ? "budget premium / luxe (hôtels 4-5 étoiles, expériences exclusives)" :
    "budget non précisé";

  const lines: string[] = [
    `- Départ : ${departure || "non précisé"}`,
    `- Durée du voyage : ${duration || "non précisée"}`,
    `- Groupe : ${groupDesc}`,
    `- Budget : ${budgetLabel}`,
  ];

  const interests = arr(a.interests);
  if (interests) lines.push(`- Intérêts : ${interests}`);
  const sports = arr(a.sports);
  if (sports) lines.push(`- Sports / activités : ${sports}`);
  const landscape = arr(a.landscape);
  if (landscape) lines.push(`- Paysage souhaité : ${landscape}`);
  if (a.climate) lines.push(`- Climat : ${a.climate}`);
  if (a.trip_vibe) lines.push(`- Ambiance souhaitée : ${a.trip_vibe}`);
  if (a.trip_type) lines.push(`- Type de voyage : ${a.trip_type}`);
  if (a.authenticity) lines.push(`- Style (authenticité vs tourisme) : ${a.authenticity}`);
  const accommodations = arr(a.accommodations);
  if (accommodations) lines.push(`- Hébergements préférés : ${accommodations}`);
  const transport = arr(a.transport);
  if (transport) lines.push(`- Transports appréciés : ${transport}`);
  const diet = arr(a.diet);
  if (diet) lines.push(`- Régime alimentaire : ${diet}`);
  const languages = arr(a.language_spoken);
  if (languages) lines.push(`- Langues parlées : ${languages}`);
  if (a.special_occasion) lines.push(`- Occasion spéciale : ${a.special_occasion}`);
  if (a.dream_experience) lines.push(`- Rêve de voyage : ${a.dream_experience}`);
  if (a.non_negotiables) lines.push(`- Non-négociables : ${a.non_negotiables}`);

  const avoidParts = [a.already_visited, a.things_to_avoid].filter(Boolean).join(", ");
  if (avoidParts) lines.push(`- À éviter absolument : ${avoidParts}`);

  return `Tu es un conseiller voyage passionné et créatif. Ton rôle : trouver les 3 MEILLEURES destinations pour ce voyageur, pas les plus évidentes. Ose proposer des destinations moins connues si elles correspondent parfaitement au profil.

PROFIL COMPLET DU VOYAGEUR :
${lines.join("\n")}

CONTRAINTE VOL :
${flightGuidance}

RÈGLES DE COHÉRENCE (absolues) :
1. Destinations RÉELLES et EXISTANTES uniquement.
2. Budget "backpacker" → jamais Maldives, Dubaï, Suisse, Maldives, Polynésie, Seychelles, etc. Privilégie Asie du Sud-Est, Europe de l'Est, Amérique Latine, Balkans, Maroc, etc.
3. Voyage solo → recommandations adaptées au voyage seul (sécurité, communauté backpacker, etc.).
4. Famille avec enfants → pas de destinations trop exotiques ou risquées, activités adaptées aux enfants.
5. Les 3 destinations doivent être VARIÉES (régions/ambiances différentes, pas 3 plages asiatiques si le voyageur n'a pas demandé ça).
6. Chaque destination doit répondre à AU MOINS 3 critères explicites du profil — explique lesquels dans "why".

Réponds avec exactement ce JSON (3 objets, rien d'autre) :
[{"name":"ville ou région","country":"pays en français","iso":"code pays ISO 3166-1 alpha-2 (ex: FR, JP, MA, TH, CO)","emoji":"1 emoji représentant le lieu","tagline":"accroche percutante de 6-8 mots","why":"2 phrases montrant PRÉCISÉMENT pourquoi cette destination colle au profil (cite les critères)","highlights":["point fort concret 1","point fort concret 2","point fort concret 3"]}]

JSON brut uniquement, sans markdown, sans commentaire.`;
}
