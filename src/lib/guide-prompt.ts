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

export function buildSystemPrompt(language: "fr" | "en" = "fr"): string {
  if (language === "en") {
    return `You are a world-class travel writer and planner with 20+ years of experience writing for Condé Nast Traveler, Lonely Planet and National Geographic. You combine deep destination expertise with the precision of a professional travel planner and the warmth of a personal local guide.

Your mission: generate an ultra-personalized, professional-quality travel guide based on detailed traveler preferences. Every single recommendation must be directly justified by the traveler's profile — never generic.

CRITICAL RULES:
1. Adapt every section to the traveler's budget, style, pace, and group composition.
2. For solo travelers: tailor all activities and social tips for solo travel. Never suggest activities that require a partner unless offering solo alternatives.
3. For families: emphasize child-friendly venues, age-appropriate activities, family meals.
4. Budget coherence: for backpacker budgets, only recommend affordable options (street food, hostels, free attractions). If the chosen destination is notoriously expensive (Iceland, Norway, Switzerland, Maldives, Seychelles, Dubai, Singapore, French Polynesia, etc.) and the budget is backpacker or low comfort, start the guide with a clear WARNING section explaining the budget mismatch and suggesting realistic daily cost estimates. For luxury budgets, recommend premium experiences.
5. For every place, monument, restaurant or attraction: include usual opening hours, weekly closing days, and known annual closures. If uncertain, write "Check before visiting" and recommend official sources.
6. Validate that all recommended addresses, places, and hours are realistic and plausible.

OUTPUT FORMAT: Structured text with sections delimited by lines of dashes (────────────────────────────────────────────). Section titles in uppercase. Write in English.`;
  }

  return `Tu es un rédacteur et planificateur de voyages de classe mondiale, avec 20+ ans d'expérience pour des publications comme Condé Nast Traveler, Lonely Planet et National Geographic. Tu combines une expertise profonde des destinations, la précision d'un planner professionnel, et la chaleur d'un guide local personnel.

Ta mission : générer un guide de voyage ultra-personnalisé, de qualité professionnelle, basé sur un profil voyageur détaillé. Chaque recommandation doit être directement justifiée par le profil du voyageur — jamais générique.

RÈGLES CRITIQUES :
1. Adapte chaque section au budget, style, rythme et composition du groupe du voyageur.
2. Pour les voyageurs en solo : adapte toutes les activités et conseils sociaux au voyage solo. Ne propose jamais d'activités nécessitant un partenaire sans alternative solo.
3. Pour les familles : mets en avant les lieux adaptés aux enfants, activités adaptées à l'âge, repas familiaux.
4. Cohérence budget : pour les petits budgets, ne recommande que des options abordables (street food, auberges, attractions gratuites). Si la destination choisie est notoirement chère (Islande, Norvège, Suisse, Maldives, Seychelles, Dubaï, Singapour, Polynésie française, Australie, etc.) et que le budget est "backpacker" ou petit confort, commence le guide par une section "⚠️ ALERTE BUDGET" expliquant clairement le décalage, en donnant un coût journalier réaliste estimé pour cette destination, et en suggérant une alternative moins chère dans la même région. Pour le luxe, propose des expériences premium.
5. Pour chaque lieu, monument, restaurant ou attraction cité : indique les horaires habituels, jours de fermeture hebdomadaire et périodes de fermeture annuelle connues. En cas d'incertitude, écris "À vérifier avant la visite" et recommande les sources officielles.
6. Vérifie que toutes les adresses, lieux et horaires recommandés sont réalistes et plausibles.

FORMAT DE SORTIE : Texte structuré avec sections délimitées par des lignes de tirets (────────────────────────────────────────────). Titres de sections en majuscules.`;
}

export function buildUserMessage(input: GuideInput): string {
  const lang = input.language === "en" ? "en" : "fr";

  const groupDesc = (() => {
    const type = label(input.traveler_type, TRAVELER_LABELS);
    const adults = input.traveler_adults ?? 1;
    const children = input.traveler_children ?? 0;
    if (children > 0) return `${type} — ${adults} adulte${adults > 1 ? "s" : ""} + ${children} enfant${children > 1 ? "s" : ""}`;
    return `${type}${adults > 1 ? ` — ${adults} adultes` : ""}`;
  })();

  const budgetDesc = (() => {
    const level = label(input.budget, BUDGET_LABELS);
    if (input.budget_amount) {
      const scope = input.budget_scope === "per_person" ? "/ personne" : "total";
      return `${level} — ${input.budget_amount} ${input.budget_currency ?? "€"} ${scope}`;
    }
    return level;
  })();

  const durationLabel = (() => {
    if (input.duration === "3j") return "3 jours";
    if (input.duration === "7j") return "7 jours";
    if (input.duration === "14j") return "14 jours";
    if (input.duration === "1mois") return "1 mois";
    return input.duration;
  })();

  const scopeDesc = (() => {
    if (input.scope_type === "country") {
      const zones = input.country_zones?.join(", ");
      return `Tour du pays / road trip${zones ? ` — zones : ${zones}` : " — tout le pays"}`;
    }
    return "Visite de la ville / séjour immersif";
  })();

  const dietDesc = (() => {
    if (!input.diet || input.diet.length === 0 || input.diet.includes("none")) return "Aucune restriction alimentaire";
    const base = labels(input.diet, DIET_LABELS);
    return input.allergy_details ? `${base} — Allergies : ${input.allergy_details}` : base;
  })();

  if (lang === "en") {
    return `Generate my personalized travel guide:

═══════════ TRAVELER PROFILE ═══════════
DESTINATION: ${input.destination}
SCOPE: ${scopeDesc}
DURATION: ${durationLabel}
TRAVEL DATES: ${input.travel_dates || input.arrival_date || "Not specified"}
DEPARTURE FROM: ${input.departure_city || "Not specified"}

GROUP: ${groupDesc}
BUDGET: ${budgetDesc}
PACE: ${label(input.activity_pace, PACE_LABELS)}
VIBE: ${label(input.trip_vibe, VIBE_LABELS)}
TRIP TYPE: ${label(input.trip_type, TRIP_TYPE_LABELS)}
DISCOVERY STYLE: ${label(input.authenticity, AUTHENTICITY_LABELS)}

ACCOMMODATION: ${labels(input.accommodations, ACCOMMODATION_LABELS)}
TRANSPORT: ${labels(input.transport, TRANSPORT_LABELS)}
${input.neighborhood_vibe ? `PREFERRED NEIGHBORHOOD: ${input.neighborhood_vibe}` : ""}

INTERESTS: ${labels(input.interests, INTEREST_LABELS)}
${(input.sports?.length ?? 0) > 0 ? `SPORTS & ACTIVITIES: ${labels(input.sports, SPORT_LABELS)}` : ""}
${(input.landscape?.length ?? 0) > 0 ? `LANDSCAPE PREFERENCES: ${input.landscape!.join(", ")}` : ""}
${input.climate ? `CLIMATE: ${input.climate}` : ""}

DIETARY RESTRICTIONS: ${dietDesc}
${input.language_spoken?.length ? `LANGUAGES SPOKEN: ${input.language_spoken.join(", ")}` : ""}
${input.special_occasion ? `SPECIAL OCCASION: ${input.special_occasion}` : ""}
${input.non_negotiables ? `MUST-HAVES: ${input.non_negotiables}` : ""}
${input.things_to_avoid ? `TO AVOID: ${input.things_to_avoid}` : ""}
${input.already_visited ? `ALREADY VISITED (avoid): ${input.already_visited}` : ""}
${input.dream_experience ? `DREAM EXPERIENCE: ${input.dream_experience}` : ""}
${input.notes ? `ADDITIONAL NOTES: ${input.notes}` : ""}
═══════════════════════════════════════

REQUIRED GUIDE STRUCTURE:

────────────────────────────────────────────
COVER PAGE
────────────────────────────────────────────
[Title, destination, duration, dates, personalized subtitle]

────────────────────────────────────────────
1. INTRODUCTION — THE DESTINATION AT A GLANCE
────────────────────────────────────────────
[150-200 word personalized narrative, tailored to this traveler's style and interests. Quick facts: language, currency, visa requirements, best season. Note: "Opening hours shown are indicative. Always check before your visit."]

────────────────────────────────────────────
2. DAY-BY-DAY ITINERARY
────────────────────────────────────────────
[Detailed day-by-day plan adapted to the traveler's pace (${label(input.activity_pace, PACE_LABELS)}). Each day: morning / afternoon / evening with specific activities, restaurant names, transport tips and local insider advice. For every place cited, include opening hours and closing days.]

────────────────────────────────────────────
3. RESTAURANT SELECTION
────────────────────────────────────────────
[Curated restaurants by meal type, adapted to budget (${budgetDesc}) and dietary restrictions (${dietDesc}). Include price range per person.]

────────────────────────────────────────────
4. ACTIVITIES & PLACES TO VISIT
────────────────────────────────────────────
[Must-sees and hidden gems selected for interests: ${labels(input.interests, INTEREST_LABELS)}. Include opening hours, prices, tips.]

────────────────────────────────────────────
5. PRACTICAL TIPS
────────────────────────────────────────────
[Transport, money, safety, health, local customs & etiquette, pre-departure checklist. Tailored for ${groupDesc}.]

${(input.duration === "7j" || input.duration === "14j" || input.duration === "1mois") ? `────────────────────────────────────────────
6. RECOMMENDED ACCOMMODATION
────────────────────────────────────────────
[Selection matching budget (${budgetDesc}) and accommodation preference (${labels(input.accommodations, ACCOMMODATION_LABELS)}). Include recommended neighborhoods and price ranges.]

────────────────────────────────────────────
7. DAY TRIPS & EXCURSIONS
────────────────────────────────────────────
[2-3 excursions with transport details, opening hours and practical tips]` : ""}

[Write a complete, professional and immediately actionable guide. Be specific with real addresses, real prices, and accurate practical details.]`;
  }

  return `Génère mon guide de voyage personnalisé :

═══════════ PROFIL VOYAGEUR ═══════════
DESTINATION : ${input.destination}
PÉRIMÈTRE : ${scopeDesc}
DURÉE : ${durationLabel}
DATES DE VOYAGE : ${input.travel_dates || input.arrival_date || "Non précisé"}
DÉPART DEPUIS : ${input.departure_city || "Non précisé"}

GROUPE : ${groupDesc}
BUDGET : ${budgetDesc}
RYTHME : ${label(input.activity_pace, PACE_LABELS)}
AMBIANCE : ${label(input.trip_vibe, VIBE_LABELS)}
TYPE DE VOYAGE : ${label(input.trip_type, TRIP_TYPE_LABELS)}
STYLE DE DÉCOUVERTE : ${label(input.authenticity, AUTHENTICITY_LABELS)}

HÉBERGEMENT : ${labels(input.accommodations, ACCOMMODATION_LABELS)}
TRANSPORT : ${labels(input.transport, TRANSPORT_LABELS)}
${input.neighborhood_vibe ? `QUARTIER / AMBIANCE PRÉFÉRÉ : ${input.neighborhood_vibe}` : ""}

INTÉRÊTS : ${labels(input.interests, INTEREST_LABELS)}
${(input.sports?.length ?? 0) > 0 ? `SPORTS & ACTIVITÉS : ${labels(input.sports, SPORT_LABELS)}` : ""}
${(input.landscape?.length ?? 0) > 0 ? `PAYSAGES SOUHAITÉS : ${input.landscape!.join(", ")}` : ""}
${input.climate ? `CLIMAT PRÉFÉRÉ : ${input.climate}` : ""}

RESTRICTIONS ALIMENTAIRES : ${dietDesc}
${input.language_spoken?.length ? `LANGUES PARLÉES : ${input.language_spoken.join(", ")}` : ""}
${input.special_occasion ? `OCCASION SPÉCIALE : ${input.special_occasion}` : ""}
${input.non_negotiables ? `INCONTOURNABLES : ${input.non_negotiables}` : ""}
${input.things_to_avoid ? `À ÉVITER : ${input.things_to_avoid}` : ""}
${input.already_visited ? `DÉJÀ VISITÉ (à éviter) : ${input.already_visited}` : ""}
${input.dream_experience ? `RÊVE DE VOYAGE : ${input.dream_experience}` : ""}
${input.notes ? `NOTES COMPLÉMENTAIRES : ${input.notes}` : ""}
═══════════════════════════════════════

STRUCTURE REQUISE DU GUIDE :

────────────────────────────────────────────
PAGE DE COUVERTURE
────────────────────────────────────────────
[Titre, destination, durée, dates, sous-titre personnalisé]

────────────────────────────────────────────
1. INTRODUCTION — LA DESTINATION EN UN COUP D'ŒIL
────────────────────────────────────────────
[Introduction narrative 150-200 mots, adaptée au style et aux intérêts de ce voyageur. Infos rapides : langue locale, monnaie, visa, meilleure période. Note obligatoire : "Les horaires indiqués sont donnés à titre indicatif. Vérifiez toujours avant votre visite."]

────────────────────────────────────────────
2. ITINÉRAIRE JOUR PAR JOUR
────────────────────────────────────────────
[Programme détaillé jour par jour, adapté au rythme du voyageur (${label(input.activity_pace, PACE_LABELS)}). Chaque journée : matin / après-midi / soirée avec activités spécifiques, noms de restaurants, conseils transports et astuces locales. Pour chaque lieu cité, indique horaires et jours de fermeture.]

────────────────────────────────────────────
3. SÉLECTION DE RESTAURANTS
────────────────────────────────────────────
[Restaurants sélectionnés par catégorie, adaptés au budget (${budgetDesc}) et aux restrictions alimentaires (${dietDesc}). Inclure la fourchette de prix par personne.]

────────────────────────────────────────────
4. ACTIVITÉS ET LIEUX À VISITER
────────────────────────────────────────────
[Incontournables et trésors cachés sélectionnés pour les intérêts : ${labels(input.interests, INTEREST_LABELS)}. Inclure horaires, prix, conseils pratiques.]

────────────────────────────────────────────
5. CONSEILS PRATIQUES
────────────────────────────────────────────
[Transport, argent, sécurité, santé, culture locale & étiquette, checklist pré-départ. Adapté pour ${groupDesc}.]

${(input.duration === "7j" || input.duration === "14j" || input.duration === "1mois") ? `────────────────────────────────────────────
6. HÉBERGEMENTS RECOMMANDÉS
────────────────────────────────────────────
[Sélection adaptée au budget (${budgetDesc}) et au type d'hébergement (${labels(input.accommodations, ACCOMMODATION_LABELS)}). Inclure les quartiers recommandés et fourchettes de prix.]

────────────────────────────────────────────
7. EXCURSIONS ET ESCAPADES
────────────────────────────────────────────
[2-3 excursions avec détails transport, horaires et conseils pratiques]` : ""}

[Génère un guide complet, professionnel et immédiatement utilisable. Sois précis avec de vraies adresses, des prix réalistes et des détails pratiques exacts.]`;
}

export function getMaxTokens(duration: string): number {
  if (duration === "3j") return 4000;
  if (duration === "7j") return 8000;
  if (duration === "14j") return 12000;
  return 16000;
}
