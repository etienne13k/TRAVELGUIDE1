export interface GuideInput {
  email: string;
  destination: string;
  duration: string;
  language?: "fr" | "en";
  // Legacy fields (kept for backward compat)
  budget?: string;
  style?: string[];
  hebergement?: string;
  regime?: string[];
  compagnie?: string;
  notes?: string;
  // Full questionnaire fields
  departure_city?: string;
  travel_dates?: string;
  arrival_date?: string;
  departure_date?: string;
  dates_flexible?: string;
  traveler_type?: string;
  traveler_adults?: number;
  traveler_children?: number;
  budget_amount?: string;
  budget_currency?: string;
  budget_scope?: string;
  activity_pace?: string;
  authenticity?: string;
  trip_type?: string;
  trip_vibe?: string;
  max_flight_time?: string;
  accommodations?: string[];
  transport?: string[];
  neighborhood_vibe?: string;
  interests?: string[];
  sports?: string[];
  landscape?: string[];
  climate?: string;
  already_visited?: string;
  dream_experience?: string;
  non_negotiables?: string;
  things_to_avoid?: string;
  diet?: string[];
  allergy_details?: string;
  language_spoken?: string[];
  special_occasion?: string;
  scope_type?: string;
  country_zones?: string[];
  residence_country?: string;
  residence_city?: string;
  destination_arrival_city?: string;
}

const BUDGET_LABELS: Record<string, string> = {
  backpacker: "Petit budget / sac à dos",
  comfort: "Confort (milieu de gamme)",
  luxury: "Haut de gamme / luxe",
};

const PACE_LABELS: Record<string, string> = {
  packed: "Rythme intense — plusieurs activités par jour",
  relaxed: "Rythme détendu — 1 à 2 activités par jour",
  ultra_chill: "Très libre — sans programme fixe",
};

const TRAVELER_LABELS: Record<string, string> = {
  solo: "En solo",
  couple: "En couple",
  family: "Famille avec enfants",
  friends: "Groupe d'amis",
};

const VIBE_LABELS: Record<string, string> = {
  rest: "Repos & ressourcement",
  discovery: "Découverte & culture",
  adventure: "Aventure & adrénaline",
  party: "Fête & rencontres",
};

const TRIP_TYPE_LABELS: Record<string, string> = {
  one_place: "Séjour dans un seul lieu (immersion)",
  road_trip: "Road trip / plusieurs étapes",
};

const AUTHENTICITY_LABELS: Record<string, string> = {
  off_beaten: "Hors des sentiers battus",
  mixed: "Équilibre classique / local",
  tourist_spots: "Sites touristiques incontournables",
};

const ACCOMMODATION_LABELS: Record<string, string> = {
  hostel: "Auberge de jeunesse",
  airbnb: "Appartement / Airbnb",
  hotel_3_4: "Hôtel 3-4 étoiles",
  boutique: "Boutique hôtel",
  resort: "Complexe tout compris",
  camping: "Camping / plein air",
};

const TRANSPORT_LABELS: Record<string, string> = {
  public: "Transports en commun",
  walking: "À pied / vélo",
  rental: "Voiture de location",
  taxi: "Taxi / VTC",
};

const INTEREST_LABELS: Record<string, string> = {
  culture: "Culture & histoire",
  nature: "Nature & plein air",
  adventure: "Aventure & sport",
  gastronomy: "Gastronomie",
  shopping: "Shopping & marchés",
  nightlife: "Vie nocturne",
  art: "Art & musées",
  photography: "Photographie",
  architecture: "Architecture",
  sport: "Sport & activités",
};

const SPORT_LABELS: Record<string, string> = {
  hiking: "Randonnée",
  climbing: "Escalade",
  diving: "Plongée",
  surf: "Surf",
  ski: "Ski / snowboard",
  yoga: "Yoga / méditation",
  mountain_bike: "VTT",
  paragliding: "Parapente",
  kayak: "Kayak / canoë",
};

const DIET_LABELS: Record<string, string> = {
  vegetarian: "Végétarien",
  vegan: "Végan",
  pescatarian: "Pescatarien",
  gluten_free: "Sans gluten",
  lactose_free: "Sans lactose",
  halal: "Halal",
  kosher: "Casher",
  none: "Aucune restriction",
};

function labels(ids: string[] | undefined, map: Record<string, string>): string {
  if (!ids || ids.length === 0) return "Non précisé";
  return ids.map((id) => map[id] ?? id).join(", ");
}

function label(id: string | undefined, map: Record<string, string>): string {
  if (!id) return "Non précisé";
  return map[id] ?? id;
}

export function buildSystemPrompt(_language: "fr" | "en" = "fr"): string {
  return `Tu es le moteur de génération de travelguide, un service premium qui crée des guides de voyage personnalisés. Tu n'es PAS un assistant généraliste : tu produis un itinéraire jour par jour et heure par heure, calibré au budget réel et au profil exact du voyageur.

Ton obsession : faire vivre un voyage fluide, sans stress, sans pièges à touristes, en respectant le budget au centime près. Chaque recommandation doit pouvoir être justifiée par un horaire malin, un bon plan ou une économie.

RÈGLES DE GÉNÉRATION IMPÉRATIVES :

A. BUDGET
1. Décompose le budget total en postes : vols/transport longue distance · hébergement · transport local · activités · restauration · marge imprévus (~10%). Affiche ce tableau EN TÊTE de guide.
2. À la fin de chaque journée, indique le coût estimé du jour et le cumul vs budget restant. Ne dépasse JAMAIS le total.
3. Prix en devise locale + conversion en euros (ex: ~¥8 500 (~55 €)).
4. Si le budget est trop faible pour la destination, commence par une section ⚠️ ALERTE BUDGET avec le coût journalier réaliste et une alternative moins chère dans la même région. Sinon propose quand même les options les plus économiques adaptées au niveau de budget.

B. HÉBERGEMENT
1. Propose 2-3 options réelles correspondant au niveau demandé et à la composition du groupe.
2. Pour chaque option : nom, quartier, fourchette de prix/nuit, inclus, distance des points clés.
3. Tu ne réserves rien — précise "à confirmer sur [plateforme]".

C. BONS PLANS & ANTI-ARNAQUES (section dédiée en début de guide)
1. Applis utiles pour la destination.
2. Carte bancaire sans frais à l'étranger recommandée.
3. Pass transport local le plus avantageux.
4. Top 5 anti-attrape-touristes du coin avec la bonne alternative à chaque arnaque.

D. ADAPTATION AU PROFIL
- Famille : activités plaisantes pour enfants ET parents, pauses, horaires réalistes, distances courtes.
- Couple : ambiances, moments à deux, spots coucher de soleil.
- Solo : rencontres, sécurité, spots faciles seul.
- Groupe : grandes tables, vie nocturne, logistique groupe.
- Respecte TOUJOURS les contraintes alimentaires, À ÉVITER, RYTHME et INCONTOURNABLES.

E. RESTAURANTS & TIMING
- Adresses locales authentiques, pas de chaînes touristiques.
- Pour chaque adresse : spécialité, prix moyen, heure optimale pour éviter la foule.
- Pour chaque lieu/activité : horaire optimal ET raison (lumière, foule, ouverture).

F. HONNÊTETÉ
- Si une info n'est pas vérifiable, dis-le. Aucune adresse ou tarif fictif.
- Pour chaque lieu cité : horaires habituels, jours de fermeture, fermetures annuelles. Si incertain : "À vérifier avant la visite".

FORMAT DE SORTIE : voir structure ci-dessous dans le message utilisateur.`;
}

export function buildUserMessage(input: GuideInput): string {
  const adults = input.traveler_adults ?? 1;
  const children = input.traveler_children ?? 0;

  const groupDesc = (() => {
    const type = label(input.traveler_type, TRAVELER_LABELS);
    if (children > 0) return `${type} — ${adults} adulte${adults > 1 ? "s" : ""} + ${children} enfant${children > 1 ? "s" : ""}`;
    return `${type}${adults > 1 ? ` — ${adults} adultes` : ""}`;
  })();

  const budgetDesc = (() => {
    const level = label(input.budget, BUDGET_LABELS);
    if (input.budget_amount) {
      const scope = input.budget_scope === "per_person" ? "/ personne" : "total groupe";
      return `${level} — ${input.budget_amount} ${input.budget_currency ?? "€"} ${scope}`;
    }
    return level;
  })();

  const durationLabel =
    input.duration === "3j" ? "3 jours / 2 nuits" :
    input.duration === "7j" ? "7 jours / 6 nuits" :
    input.duration === "14j" ? "14 jours / 13 nuits" :
    input.duration === "1mois" ? "1 mois" : input.duration;

  const scopeDesc = input.scope_type === "country"
    ? `Tour du pays / road trip${input.country_zones?.length ? ` — zones : ${input.country_zones.join(", ")}` : ""}`
    : "Visite de la ville / séjour immersif";

  const dietDesc = (!input.diet || input.diet.length === 0 || input.diet.includes("none"))
    ? "Aucune restriction"
    : labels(input.diet, DIET_LABELS) + (input.allergy_details ? ` — Allergies : ${input.allergy_details}` : "");

  const mobiliteDesc = [
    children > 0 ? `${children} enfant${children > 1 ? "s" : ""}` : null,
    input.things_to_avoid?.toLowerCase().includes("poussette") ? "poussette" : null,
  ].filter(Boolean).join(", ") || "RAS";

  return `Génère mon guide de voyage personnalisé en suivant exactement le format travelguide décrit dans tes instructions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTIE 1 — PROFIL VOYAGEUR (questionnaire rempli)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESTINATION(S) ........... ${input.destination}
PÉRIMÈTRE ................ ${scopeDesc}
VILLE D'ARRIVÉE DESTINATION ${input.destination_arrival_city || "Non précisé (se réfère à la capitale ou aéroport principal)"}
PAYS DE RÉSIDENCE ........ ${input.residence_country || "Non précisé"}
VILLE DE RÉSIDENCE ....... ${input.residence_city || "Non précisé"}
VILLE DE DÉPART .......... ${input.departure_city || "Non précisé"}
DATES / SAISON ........... ${input.travel_dates || input.arrival_date || "Non précisé"}
DURÉE .................... ${durationLabel}

TYPE DE VOYAGEUR ......... ${label(input.traveler_type, TRAVELER_LABELS)}
COMPOSITION .............. ${groupDesc}
MOBILITÉ / SANTÉ ......... ${mobiliteDesc}

BUDGET TOTAL ............. ${budgetDesc}
RÉPARTITION SOUHAITÉE .... ${label(input.budget, BUDGET_LABELS)}
NIVEAU HÔTEL ............. ${labels(input.accommodations, ACCOMMODATION_LABELS)}

ENVIES / INTÉRÊTS ........ ${labels(input.interests, INTEREST_LABELS)}${(input.sports?.length ?? 0) > 0 ? ` · Sports : ${labels(input.sports, SPORT_LABELS)}` : ""}
PAYSAGES ................. ${input.landscape?.join(", ") || "Non précisé"}
CLIMAT ................... ${input.climate || "Non précisé"}
RYTHME ................... ${label(input.activity_pace, PACE_LABELS)}
AMBIANCE ................. ${label(input.trip_vibe, VIBE_LABELS)}
STYLE .................... ${label(input.authenticity, AUTHENTICITY_LABELS)}
TYPE DE VOYAGE ........... ${label(input.trip_type, TRIP_TYPE_LABELS)}
TRANSPORT LOCAL .......... ${labels(input.transport, TRANSPORT_LABELS)}

INDISPENSABLES ........... ${input.non_negotiables || "Non précisé"}
RÊVE DE VOYAGE ........... ${input.dream_experience || "Non précisé"}
À ÉVITER ................. ${[input.things_to_avoid, input.already_visited].filter(Boolean).join(" · ") || "Rien de spécifié"}
CONTRAINTES ALIMENTAIRES . ${dietDesc}
LANGUES PARLÉES .......... ${input.language_spoken?.join(", ") || "Non précisé"}
OCCASION SPÉCIALE ........ ${input.special_occasion || "Aucune"}
${input.notes ? `NOTES COMPLÉMENTAIRES .... ${input.notes}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURE DU GUIDE À PRODUIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧭 EN-TÊTE DU GUIDE
• Titre du voyage + dates + profil voyageur
• Tableau budget (décomposé par postes : vols · hébergement · transport local · activités · restauration · marge 10%)
• Section "Avant de partir" : applis utiles · carte bancaire sans frais conseillée · pass transport local · top 5 anti-attrape-touristes avec bonne alternative à chaque arnaque
• Section "Hébergement" : 2-3 options réelles avec nom, quartier, prix/nuit, inclus, distance points clés ("à confirmer sur [plateforme]")

📅 POUR CHAQUE JOUR, ce bloc exact :

JOUR {n} — {TITRE DU JOUR · Quartier(s)}                          [⭐ thème]
🗓️ Budget estimé du jour : ~{montant}   💡 {1 conseil clé}
──────────────────────────────────────────────────────────────────

{HEURE}   {MATIN/MIDI/APRÈS-MIDI/SOIR}              [{Catégorie}]
   {Titre de l'étape}
   {Description vivante : quoi, pourquoi c'est bien, horaire optimal, durée}
   💡 Tip : {prix précis · bon plan · alerte arnaque · astuce enfants si applicable}

{HEURE}   ...

🧮 Bilan du jour : {coût du jour} · Cumul : {cumul} / {budget total}

Catégories : Pratique · Spirituel · Gastronomie · Shopping · Culture · Nature · Détente · Nightlife · Famille · Panorama

RÈGLES DE STYLE :
• Ton vivant, concret, jamais générique — on doit sentir le terrain
• Chaque étape a un horaire précis
• Couvrir chaque journée du matin au soir dans l'ordre chronologique
• Afficher le cumul budget en bas de chaque jour
• Aucune adresse ou tarif fictif — si incertain, écrire "À vérifier avant la visite"

Génère le guide complet maintenant.`;
}

export function getMaxTokens(duration: string): number {
  if (duration === "3j") return 4000;
  if (duration === "7j") return 8000;
  if (duration === "14j") return 12000;
  return 16000;
}
