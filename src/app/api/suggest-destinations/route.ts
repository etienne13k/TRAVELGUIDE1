import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { createAnthropicClient, getAnthropicApiKey, getAnthropicModel, getAnthropicText } from "@/lib/anthropic";

export const maxDuration = 60;

type DestinationSuggestion = {
  name: string;
  country: string;
  iso: string;
  emoji: string;
  type: "valeur_sure" | "caractere" | "coup_de_coeur";
  tagline: string;
  why: string;
  weather: string;
  budget_note: string;
  ideal_duration: string;
  keywords: string[];
  downside: string;
  flag?: string;
  photo?: null;
};

function isoToFlag(iso: string): string {
  const code = iso.toUpperCase().trim();
  if (code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
}

export async function POST(req: NextRequest) {
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante" }, { status: 503 });
  }

  // Suggestion limit: 3 per verified account per 3-day window
  if (process.env.DATABASE_URL) {
    try {
      const session = await getServerSession();
      if (session?.email) {
        const { Pool } = await import("pg");
        const limitPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

        // 3-day window: floor to nearest 3-day block from epoch
        await limitPool.query(`CREATE TABLE IF NOT EXISTS suggestion_limits (email text NOT NULL, period_start date NOT NULL, count int DEFAULT 1, PRIMARY KEY (email, period_start))`);
        const epochDays = Math.floor(Date.now() / 86400000);
        const periodStartDays = epochDays - (epochDays % 3);
        const periodStart = new Date(periodStartDays * 86400000).toISOString().split("T")[0];
        const resetAt = new Date((periodStartDays + 3) * 86400000).toISOString();

        const { rows } = await limitPool.query(
          `SELECT count FROM suggestion_limits WHERE email = $1 AND period_start = $2`,
          [session.email.toLowerCase(), periodStart]
        );
        const count = Number(rows[0]?.count ?? 0);
        if (count >= 3) {
          await limitPool.end();
          return NextResponse.json({ error: "Limite de 3 suggestions par 3 jours atteinte.", resetAt, code: "suggestion_limit" }, { status: 429 });
        }
        await limitPool.query(
          `INSERT INTO suggestion_limits (email, period_start, count) VALUES ($1, $2, 1) ON CONFLICT (email, period_start) DO UPDATE SET count = suggestion_limits.count + 1`,
          [session.email.toLowerCase(), periodStart]
        );
        await limitPool.end();
      }
    } catch { /* non-fatal */ }
  }

  let answers: Record<string, unknown>;
  try {
    answers = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  try {
    const anthropic = createAnthropicClient(apiKey);

    const msg = await anthropic.messages.create({
      model: getAnthropicModel(),
      max_tokens: 2200,
      temperature: 0.7,
      system: "Tu es un conseiller voyage senior spécialisé dans les destinations pertinentes, réalistes et adaptées au profil. Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown, sans balises ```json, sans texte avant ou après.",
      messages: [{ role: "user", content: buildPrompt(answers) }],
    });

    const text = getAnthropicText(msg.content);
    const suggestions = parseSuggestions(text);

    if (!suggestions || suggestions.length !== 3) {
      return NextResponse.json({ error: `JSON introuvable ou incomplet dans: ${text.slice(0, 200)}` }, { status: 500 });
    }

    const withPhotos = suggestions.map((suggestion) => {
      const flag = isoToFlag(suggestion.iso);
      return { ...suggestion, flag, photo: null };
    });

    return NextResponse.json({ suggestions: withPhotos });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseSuggestions(text: string): DestinationSuggestion[] | null {
  const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]) as Partial<DestinationSuggestion>[];
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;

    return parsed.map((suggestion, index) => {
      const suggestionType: DestinationSuggestion["type"] = index === 0
        ? "valeur_sure"
        : index === 1
          ? "caractere"
          : "coup_de_coeur";

      return {
        name: String(suggestion.name ?? "").trim(),
        country: String(suggestion.country ?? "").trim(),
        iso: String(suggestion.iso ?? "").slice(0, 2).toUpperCase(),
        emoji: String(suggestion.emoji ?? "🌍").trim() || "🌍",
        type: suggestionType,
        tagline: String(suggestion.tagline ?? "").trim(),
        why: String(suggestion.why ?? "").trim(),
        weather: String(suggestion.weather ?? "").trim(),
        budget_note: String(suggestion.budget_note ?? "").trim(),
        ideal_duration: String(suggestion.ideal_duration ?? "").trim(),
        keywords: Array.isArray(suggestion.keywords) ? suggestion.keywords.map(String).slice(0, 4) : [],
        downside: String(suggestion.downside ?? "").trim(),
      };
    }).filter((suggestion) => suggestion.name && suggestion.country && suggestion.iso.length === 2);
  } catch {
    return null;
  }
}

function buildPrompt(answers: Record<string, unknown>): string {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : null);
  const budget = (answers.budget as string) ?? "";
  const travelerType = (answers.traveler_type as string) ?? "";
  const adults = Number(answers.traveler_adults ?? 1);
  const children = Number(answers.traveler_children ?? 0);
  const departure = (answers.departure_city as string) ?? "";
  const duration = (answers.duration as string) ?? "";

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
    budget === "backpacker" ? "PETIT BUDGET / BACKPACKER — coût de la vie < 60€/jour tout compris (logement < 35€, repas < 15€). Destinations chères INTERDITES." :
    budget === "comfort" ? "BUDGET CONFORT — 80–180€/jour tout compris, hôtels 3 étoiles, restaurants corrects." :
    budget === "luxury" ? "BUDGET PREMIUM / LUXE — 250€+/jour, hôtels 4-5 étoiles, expériences exclusives." :
    "budget non précisé";

  const lines: string[] = [
    `- Départ : ${departure || "non précisé"}`,
    `- Durée du voyage : ${duration || "non précisée"}`,
    `- Groupe : ${groupDesc}`,
    `- Budget : ${budgetLabel}`,
  ];

  const interests = arr(answers.interests);
  if (interests) lines.push(`- Intérêts : ${interests}`);
  const sports = arr(answers.sports);
  if (sports) lines.push(`- Sports / activités : ${sports}`);
  const landscape = arr(answers.landscape);
  if (landscape) lines.push(`- Paysage souhaité : ${landscape}`);
  if (answers.climate) lines.push(`- Climat : ${answers.climate}`);
  if (answers.trip_vibe) lines.push(`- Ambiance souhaitée : ${answers.trip_vibe}`);
  if (answers.trip_type) lines.push(`- Type de voyage : ${answers.trip_type}`);
  if (answers.authenticity) lines.push(`- Style (authenticité vs tourisme) : ${answers.authenticity}`);
  const accommodations = arr(answers.accommodations);
  if (accommodations) lines.push(`- Hébergements préférés : ${accommodations}`);
  const transport = arr(answers.transport);
  if (transport) lines.push(`- Transports appréciés : ${transport}`);
  const diet = arr(answers.diet);
  if (diet) lines.push(`- Régime alimentaire : ${diet}`);
  const languages = arr(answers.language_spoken);
  if (languages) lines.push(`- Langues parlées : ${languages}`);
  if (answers.special_occasion) lines.push(`- Occasion spéciale : ${answers.special_occasion}`);
  if (answers.dream_experience) lines.push(`- Rêve de voyage : ${answers.dream_experience}`);
  if (answers.non_negotiables) lines.push(`- Non-négociables : ${answers.non_negotiables}`);

  const avoidParts = [answers.already_visited, answers.things_to_avoid].filter(Boolean).join(", ");
  if (avoidParts) lines.push(`- À éviter absolument : ${avoidParts}`);

  return `Tu es le conseiller découverte de travelguide. Propose exactement 3 destinations sur-mesure — comme un ami très calé qui connaît les bons coins et dit franchement ce qui correspond.

PROFIL VOYAGEUR :
${lines.join("\n")}

CONTRAINTE VOL :
${flightGuidance}

RÈGLES BUDGET (absolues) :
- BACKPACKER (<60€/j/pers) → INTERDIT : Islande, Norvège, Suisse, Maldives, Seychelles, Polynésie, Dubaï, Singapour, Australie, NZ. RECOMMANDÉ : Vietnam, Thaïlande, Cambodge, Indonésie, Inde, Maroc, Géorgie, Albanie, Balkans, Colombie, Pérou, Portugal hors saison.
- CONFORT → évite uniquement les destinations extrêmement chères.
- LUXURY → Maldives, Japon, Toscane, etc. sont pertinents.

STRUCTURE DES 3 OPTIONS (obligatoire) :
- Option 1 "valeur_sure" : colle pile aux critères, faible risque, valeur sûre.
- Option 2 "caractere" : un cran plus original mais totalement cohérente avec le profil.
- Option 3 "coup_de_coeur" : pépite moins évidente, effet "ah tiens !" — mais réaliste.

AUTRES RÈGLES :
1. Destinations RÉELLES uniquement.
2. Vérifie que la météo/saison est bonne aux dates demandées.
3. Famille → vols courts, sécurité, activités enfants. Solo → rencontres, sécurité. Groupe → vie nocturne.
4. Chaque destination doit correspondre à AU MOINS 3 critères du profil.
5. Honnêteté : 1 vrai bémol par destination (pas de destination parfaite sans nuance).
6. Évite les capitales ultra-évidentes si une région ou une ville secondaire correspond mieux au profil.
7. N'invente pas de prix exacts : donne des fourchettes réalistes et prudentes.

Réponds avec exactement ce JSON (3 objets, rien d'autre) :
[{
  "name": "ville ou région",
  "country": "pays en français",
  "iso": "code ISO 2 lettres (FR, JP, MA...)",
  "emoji": "1 emoji vibe",
  "type": "valeur_sure",
  "tagline": "accroche d'une ligne qui donne envie",
  "why": "2-3 phrases reliées aux ENVIES exactes du voyageur",
  "weather": "météo/saison réelle aux dates demandées (1 phrase)",
  "budget_note": "fourchette réaliste vs leur budget (1 phrase)",
  "ideal_duration": "durée idéale ex: 5-7 jours",
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4"],
  "downside": "1 vrai bémol honnête"
}]

JSON brut uniquement, sans markdown.`;
}
