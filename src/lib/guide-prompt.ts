export interface GuideInput {
  email: string;
  destination: string;
  duration: string;
  budget: string;
  style: string[];
  hebergement: string;
  regime: string[];
  compagnie: string;
  notes?: string;
  language?: "fr" | "en";
}

function guideLanguage(language?: string): "fr" | "en" {
  return language === "en" ? "en" : "fr";
}

export function buildSystemPrompt(language: "fr" | "en" = "fr"): string {
  if (language === "en") {
    return `You are an expert in creating tailor-made travel guides, with 20 years of travel writing experience for publications such as Condé Nast Traveler, Lonely Planet and National Geographic. You combine the expertise of a professional travel planner, a local guide and a premium lifestyle editor.

Your mission: generate an ultra-personalized, complete and directly usable travel guide based on the client's information. The guide must feel like a paid professional document — structured, practical, warm and immediately actionable.

FUNDAMENTAL RULES:
1. Every section must reflect the client's preferences, budget and lifestyle.
2. Never propose generic content. Every recommendation must be justified by the form data.
3. Adapt the tone: relaxed for backpackers, elegant for luxury travelers, adventurous for sports-focused travelers.
4. Cite indicative prices, real popular addresses and practical details.
5. For every recommended place, monument, museum, attraction or visit, include usual opening hours when available (for example: "Open Tuesday to Sunday, 9am–6pm"), weekly closing days (for example: "Closed on Mondays") and known annual closure periods (for example: "Closed in August").
6. If you are not certain about opening hours, closing days or any precise detail, write "To be checked before visiting" and recommend verifying official sources.

OUTPUT FORMAT: Generate the guide as structured text with sections clearly delimited by lines of dashes (────────────────────────────────────────────).
Use uppercase section titles. Be precise, practical and warm. Write the full guide in English.`;
  }

  return `Tu es un expert en création de guides de voyage sur mesure, avec 20 ans d'expérience en rédaction travel pour des magazines comme Condé Nast Traveler, Lonely Planet et National Geographic. Tu combines l'expertise d'un planner de voyage professionnel, d'un local guide, et d'un rédacteur lifestyle premium.

Ta mission : générer un guide de voyage ultra-personnalisé, complet et directement utilisable, à partir des informations fournies par le client. Le guide doit avoir la qualité d'un document professionnel payant — structuré, pratique, chaleureux, et immédiatement actionnable.

RÈGLES FONDAMENTALES :
1. Chaque section doit refléter les préférences, le budget et le style de vie du client.
2. Ne propose jamais de contenu générique. Chaque recommandation doit être justifiée par les données du formulaire.
3. Adapte le ton : décontracté pour les backpackers, élégant pour le luxe, aventurier pour les sportifs.
4. Cite des prix indicatifs, des noms d'adresses réels et populaires.
5. Pour chaque lieu, monument, musée, attraction ou visite recommandé, indique les horaires d'ouverture habituels quand ils sont disponibles (ex : "Ouvert du mardi au dimanche, 9h–18h"), les jours de fermeture hebdomadaire (ex : "Fermé le lundi") et les périodes de fermeture annuelle connues (ex : "Fermé en août").
6. Si tu n'as pas de certitude sur les horaires, jours de fermeture ou une info précise, indique "À vérifier avant la visite" et recommande de consulter les sources officielles.

FORMAT DE SORTIE : Génère le guide en texte structuré avec des sections clairement délimitées par des lignes de tirets (────────────────────────────────────────────).
Utilise des titres de section en majuscules. Sois précis, pratique et chaleureux.`;
}

export function buildUserMessage(input: GuideInput): string {
  const language = guideLanguage(input.language);
  const hasDietRestrictions =
    input.regime.length > 0 &&
    !input.regime.includes("Aucune restriction") &&
    !input.regime.includes("none");
  const regimeText = hasDietRestrictions
    ? input.regime.join(", ")
    : language === "en"
    ? "No dietary restrictions"
    : "Aucune restriction alimentaire";

  const styleText = input.style.length > 0 ? input.style.join(", ") : language === "en" ? "General" : "Général";

  if (language === "en") {
    return `Generate my personalized travel guide with the following information:

DESTINATION: ${input.destination}
DURATION: ${input.duration}
DAILY BUDGET: ${input.budget}
TRAVEL STYLE: ${styleText}
PREFERRED ACCOMMODATION: ${input.hebergement}
DIETARY RESTRICTIONS: ${regimeText}
TRAVEL COMPANIONS: ${input.compagnie}
SPECIAL NOTES: ${input.notes || "None"}

REQUIRED GUIDE STRUCTURE (follow this exact order):

────────────────────────────────────────────
COVER PAGE
────────────────────────────────────────────
[Guide title, destination, duration, generation date]

────────────────────────────────────────────
1. INTRODUCTION — THE DESTINATION AT A GLANCE
────────────────────────────────────────────
[Personalized 200-300 word narrative introduction + quick facts: language, currency, visa, best season. Include this note verbatim: "Opening hours shown are indicative and may vary. Always check before your visit."]

────────────────────────────────────────────
2. DAY-BY-DAY ITINERARY
────────────────────────────────────────────
[For each day: morning / afternoon / evening with activities, restaurants, transport and local tips. For every listed place or monument, include usual opening hours, weekly closing days and known annual closures where available]

────────────────────────────────────────────
3. RECOMMENDED RESTAURANTS
────────────────────────────────────────────
[Selection by category: breakfast, lunch, dinner, street food. Adapted to dietary restrictions]

────────────────────────────────────────────
4. ACTIVITIES AND PLACES TO VISIT
────────────────────────────────────────────
[Must-sees + hidden gems + activities based on specific interests. For every listed place or monument, include usual opening hours, weekly closing days and known annual closures where available]

────────────────────────────────────────────
5. PRACTICAL TIPS
────────────────────────────────────────────
[Transport, money, communication, health & safety, local culture & etiquette, pre-departure checklist]

${parseInt(input.duration) >= 7 || input.duration === "7j" || input.duration === "14j" || input.duration === "1mois" ? `────────────────────────────────────────────
6. RECOMMENDED ACCOMMODATION
────────────────────────────────────────────
[Accommodation selection by budget with recommended neighborhoods. Adapted to the requested accommodation type: ${input.hebergement}]

────────────────────────────────────────────
7. OFF-THE-BEATEN-PATH EXCURSIONS
────────────────────────────────────────────
[2-3 day trips or half-day trips with practical details, including usual opening hours and closures for visited places where available]` : ""}

[Generate a complete, professional and immediately usable guide. Be precise about addresses, prices, opening hours, closing days, annual closures and practical tips.]`;
  }

  return `Génère mon guide de voyage personnalisé avec les informations suivantes :

DESTINATION : ${input.destination}
DURÉE : ${input.duration}
BUDGET JOURNALIER : ${input.budget}
TYPE DE VOYAGE : ${styleText}
HÉBERGEMENT PRÉFÉRÉ : ${input.hebergement}
RESTRICTIONS ALIMENTAIRES : ${regimeText}
COMPAGNIE : ${input.compagnie}
NOTES SPÉCIALES : ${input.notes || "Aucune"}

STRUCTURE REQUISE DU GUIDE (respecte exactement cet ordre) :

────────────────────────────────────────────
PAGE DE COUVERTURE
────────────────────────────────────────────
[Titre du guide, destination, durée, date de génération]

────────────────────────────────────────────
1. INTRODUCTION — LA DESTINATION EN UN COUP D'ŒIL
────────────────────────────────────────────
[Introduction narrative 200-300 mots personnalisée + infos rapides : langue, monnaie, visa, meilleure période. Ajoute cette note textuelle : "Les horaires indiqués sont donnés à titre indicatif et peuvent varier. Vérifiez toujours avant votre visite."]

────────────────────────────────────────────
2. ITINÉRAIRE JOUR PAR JOUR
────────────────────────────────────────────
[Pour chaque journée : matin / après-midi / soirée avec activités, restaurants, transports et conseils locaux. Pour chaque lieu ou monument cité, indique les horaires habituels, jours de fermeture hebdomadaire et périodes de fermeture annuelle connues]

────────────────────────────────────────────
3. RESTAURANTS RECOMMANDÉS
────────────────────────────────────────────
[Sélection par catégorie : petit-déjeuner, déjeuner, dîner, street food. Adapté aux restrictions alimentaires]

────────────────────────────────────────────
4. ACTIVITÉS ET LIEUX À VISITER
────────────────────────────────────────────
[Incontournables + trésors cachés + activités selon intérêts spécifiques. Pour chaque lieu ou monument cité, indique les horaires habituels, jours de fermeture hebdomadaire et périodes de fermeture annuelle connues]

────────────────────────────────────────────
5. CONSEILS PRATIQUES
────────────────────────────────────────────
[Transport, argent, communication, santé & sécurité, culture locale & étiquette, checklist pré-départ]

${parseInt(input.duration) >= 7 || input.duration === "7j" || input.duration === "14j" || input.duration === "1mois" ? `────────────────────────────────────────────
6. HÉBERGEMENTS RECOMMANDÉS
────────────────────────────────────────────
[Sélection hébergements par budget avec quartiers recommandés. Adapté au type d'hébergement demandé : ${input.hebergement}]

────────────────────────────────────────────
7. EXCURSIONS HORS SENTIERS BATTUS
────────────────────────────────────────────
[2-3 excursions d'une journée ou demi-journée avec détails pratiques, incluant les horaires habituels et fermetures des lieux visités quand disponibles]` : ""}

[Génère un guide complet, professionnel et immédiatement utilisable. Sois précis sur les adresses, prix, horaires d'ouverture, jours de fermeture, fermetures annuelles et conseils pratiques.]`;
}

export function getMaxTokens(duration: string): number {
  if (duration === "3j") return 4000;
  if (duration === "7j") return 8000;
  if (duration === "14j") return 12000;
  return 16000;
}
