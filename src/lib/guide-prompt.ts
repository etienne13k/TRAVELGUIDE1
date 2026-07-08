export interface GuideInput {
  email: string;
  destination: string;
  duration: string;
  mode?: string;
  language?: "fr" | "en";
  budget?: string;
  style?: string[];
  hebergement?: string;
  regime?: string[];
  compagnie?: string;
  notes?: string;
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
  destination_arrival_city?: string;
}

const BUDGET_LABELS: Record<string, string> = {
  backpacker: "Petit budget / sac a dos",
  comfort: "Confort (milieu de gamme)",
  luxury: "Haut de gamme / luxe",
};

const PACE_LABELS: Record<string, string> = {
  packed: "Rythme intense - plusieurs activites par jour",
  relaxed: "Rythme detendu - 1 a 2 activites par jour",
  ultra_chill: "Tres libre - sans programme fixe",
};

const TRAVELER_LABELS: Record<string, string> = {
  solo: "En solo",
  couple: "En couple",
  family: "Famille avec enfants",
  friends: "Groupe d amis",
};

const VIBE_LABELS: Record<string, string> = {
  rest: "Repos et ressourcement",
  discovery: "Decouverte et culture",
  adventure: "Aventure et adrenaline",
  party: "Fete et rencontres",
};

const TRIP_TYPE_LABELS: Record<string, string> = {
  one_place: "Sejour dans un seul lieu (immersion)",
  road_trip: "Road trip / plusieurs etapes",
};

const AUTHENTICITY_LABELS: Record<string, string> = {
  off_beaten: "Hors des sentiers battus",
  mixed: "Equilibre classique / local",
  tourist_spots: "Sites touristiques incontournables",
};

const ACCOMMODATION_LABELS: Record<string, string> = {
  hostel: "Auberge de jeunesse",
  airbnb: "Appartement / Airbnb",
  hotel_3_4: "Hotel 3-4 etoiles",
  boutique: "Boutique hotel",
  resort: "Complexe tout compris",
  camping: "Camping / plein air",
};

const TRANSPORT_LABELS: Record<string, string> = {
  public: "Transports en commun",
  walking: "A pied / velo",
  rental: "Voiture de location",
  taxi: "Taxi / VTC",
};

const INTEREST_LABELS: Record<string, string> = {
  culture: "Culture et histoire",
  nature: "Nature et plein air",
  adventure: "Aventure et sport",
  gastronomy: "Gastronomie",
  shopping: "Shopping et marches",
  nightlife: "Vie nocturne",
  art: "Art et musees",
  photography: "Photographie",
  architecture: "Architecture",
  sport: "Sport et activites",
};

const SPORT_LABELS: Record<string, string> = {
  hiking: "Randonnee",
  climbing: "Escalade",
  diving: "Plongee",
  surf: "Surf",
  ski: "Ski / snowboard",
  yoga: "Yoga / meditation",
  mountain_bike: "VTT",
  paragliding: "Parapente",
  kayak: "Kayak / canoe",
};

const DIET_LABELS: Record<string, string> = {
  vegetarian: "Vegetarien",
  vegan: "Vegan",
  pescatarian: "Pescatarien",
  gluten_free: "Sans gluten",
  lactose_free: "Sans lactose",
  halal: "Halal",
  kosher: "Casher",
  none: "Aucune restriction",
};

function labels(ids: string[] | undefined, map: Record<string, string>): string {
  if (!ids || ids.length === 0) return "Non precise";
  return ids.map((id) => map[id] ?? id).join(", ");
}

function label(id: string | undefined, map: Record<string, string>): string {
  if (!id) return "Non precise";
  return map[id] ?? id;
}

function durationLabel(duration: string): string {
  if (duration === "3j") return "3 jours (Guide Express)";
  if (duration === "7j") return "7 jours (Guide Complet)";
  if (duration === "14j") return "14 jours (Guide Immersif)";
  if (duration === "1mois") return "1 mois (Guide Evasion)";
  return duration;
}

function nbJours(duration: string): string {
  if (duration === "3j") return "3";
  if (duration === "7j") return "7";
  if (duration === "14j") return "14";
  if (duration === "1mois") return "30";
  return duration;
}

function splitDestination(dest: string): { city: string; country: string } {
  const parts = dest.split(",").map((s) => s.trim());
  return { city: parts[0] ?? dest, country: parts[1] ?? "" };
}

function dietDesc(input: GuideInput): string {
  if (!input.diet || input.diet.length === 0 || input.diet.includes("none")) {
    return "Aucune restriction";
  }
  return labels(input.diet, DIET_LABELS) + (input.allergy_details ? " - Allergies : " + input.allergy_details : "");
}

function interetsDesc(input: GuideInput): string {
  const base = labels(input.interests, INTEREST_LABELS);
  const sports = (input.sports?.length ?? 0) > 0 ? " - Sports : " + labels(input.sports, SPORT_LABELS) : "";
  return base + sports;
}

function notesDesc(input: GuideInput): string {
  return [input.dream_experience, input.notes].filter(Boolean).join(" - ") || "Aucune";
}

function substitute(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? ("{{" + key + "}}"));
}

export function buildSystemPrompt(input: GuideInput): string {
  const lang = input.language === "en" ? "anglais" : "francais";
  const dest = input.destination_arrival_city || input.destination;
  const { city, country } = splitDestination(dest);
  const dateDebut = input.arrival_date ?? (input.travel_dates?.split("->")[0]?.trim() ?? "Non precise");
  const dateFin = input.departure_date ?? (input.travel_dates?.split("->")[1]?.trim() ?? "Non precise");
  const devise = input.budget_currency ?? "EUR";
  const budgetBase = input.budget_scope === "per_person" ? "par personne" : "total groupe";

  const vars: Record<string, string> = {
    LANGUE_SORTIE: lang,
    VILLE_DEPART: input.departure_city ?? "Non precise",
    DATE_DEBUT: dateDebut,
    DATE_FIN: dateFin,
    NB_JOURS: nbJours(input.duration),
    FLEXIBILITE: input.dates_flexible ?? "Non precise",
    TYPE_GROUPE: label(input.traveler_type, TRAVELER_LABELS),
    NB_ADULTES: String(input.traveler_adults ?? 1),
    NB_ENFANTS: String(input.traveler_children ?? 0),
    FORFAIT: durationLabel(input.duration),
    BUDGET_MONTANT: input.budget_amount ?? "Non precise",
    DEVISE: devise,
    BUDGET_BASE: budgetBase,
    NIVEAU_BUDGET: label(input.budget, BUDGET_LABELS),
    PAYSAGES: input.landscape?.join(", ") ?? "Non precise",
    CLIMAT: input.climate ?? "Non precise",
    AMBIANCE: label(input.trip_vibe, VIBE_LABELS),
    RYTHME: label(input.activity_pace, PACE_LABELS),
    STYLE_DECOUVERTE: label(input.authenticity, AUTHENTICITY_LABELS),
    HEBERGEMENTS: labels(input.accommodations, ACCOMMODATION_LABELS),
    QUARTIER: input.neighborhood_vibe ?? "Non precise",
    TRANSPORTS: labels(input.transport, TRANSPORT_LABELS),
    INTERETS: interetsDesc(input),
    INCONTOURNABLES: input.non_negotiables ?? "Non precise",
    A_EVITER: input.things_to_avoid ?? "Rien",
    DEJA_VISITES: input.already_visited ?? "Aucun",
    LANGUES: input.language_spoken?.join(", ") ?? "Francais",
    RESTRICTIONS_ALIM: dietDesc(input),
    OCCASION: input.special_occasion ?? "Aucune",
    NOTES: notesDesc(input),
    ETAPES: input.trip_type === "road_trip" ? "Plusieurs etapes" : "Un seul lieu",
    TYPE_SEJOUR: label(input.trip_type, TRIP_TYPE_LABELS),
    VILLE_ARRIVEE: city,
    PAYS: country,
  };

  const gabarit = `
[HHhMM]  *  [MATIN / MIDI / APRES-MIDI / FIN APRES-MIDI / SOIREE]   [TAG]
* [Titre]
  [Description 2-4 phrases : quoi, pourquoi, duree, comment s y rendre]
  Tip : [astuce locale avec prix]`;

  if (input.mode === "business") {
    return substitute(
      "Tu es Travel Business, assistant IA specialise dans l optimisation des deplacements PROFESSIONNELS. " +
      "Tu produis un guide de mission HAUT DE GAMME, sobre et efficace, oriente productivite : hotels d affaires, " +
      "restaurants pour repas clients, transports optimises, agenda heure par heure. " +
      "Ecris en {{LANGUE_SORTIE}} (defaut : francais), ton professionnel, concis, factuel.\n\n" +
      "=== BRIEF DE MISSION ===\n" +
      "Destination        : {{VILLE_ARRIVEE}}, {{PAYS}}\n" +
      "Depart depuis      : {{VILLE_DEPART}}\n" +
      "Dates de mission   : {{DATE_DEBUT}} -> {{DATE_FIN}}  ({{NB_JOURS}} jours)\n" +
      "Type de mission    : {{TYPE_SEJOUR}}\n" +
      "Participants       : {{TYPE_GROUPE}} - {{NB_ADULTES}} personne(s)\n" +
      "Forfait            : {{FORFAIT}}\n" +
      "Hebergement voulu  : {{HEBERGEMENTS}}\n" +
      "Proximite voulue   : {{QUARTIER}}\n" +
      "Transports         : {{TRANSPORTS}}\n" +
      "Budget             : {{NIVEAU_BUDGET}} - {{BUDGET_MONTANT}} {{DEVISE}} ({{BUDGET_BASE}})\n" +
      "Exigences          : {{INCONTOURNABLES}}\n" +
      "Notes              : {{NOTES}}\n\n" +
      "=== REGLES PRO ===\n" +
      "- Priorite absolue a l efficacite : minimiser les temps de trajet, caler l hotel au plus pres du lieu de mission.\n" +
      "- Prevois des creneaux de travail/reunion et des marges realistes.\n" +
      "- Restaurants adaptes aux repas d affaires (calme, reservables, standing coherent avec le budget).\n" +
      "- Si mission en groupe : lieux de reunion, restaurants privatisables, logistique de groupe.\n" +
      "- Respecte les exigences particulieres.\n\n" +
      "=== REGLE PRIX & SOURCES ===\n" +
      "Chaque hotel/restaurant/transport/lieu reel, nomme, avec prix realiste et a jour, et le moyen de s y rendre. Signale les estimations.\n\n" +
      "=== GABARIT ETAPE ===" + gabarit + "\n\n" +
      "Tags : Pratique - Gastronomie - Business - Soiree - Detente\n\n" +
      "=== STRUCTURE DE SORTIE (Markdown) ===\n" +
      "1) EN-TETE OFFICIEL : TRAVEL BUSINESS - GUIDE PROFESSIONNEL EXCLUSIF / {{VILLE_ARRIVEE}} - {{PAYS}} / {{NB_JOURS}} jours - {{NB_ADULTES}} voyageur(s) / Genere le [date]\n" +
      "2) SYNTHESE MISSION : objectif, lieu exact, fuseau horaire, transfert aeroport/gare -> hotel (rapide + economique, prix et duree).\n" +
      "3) HEBERGEMENT RECOMMANDE : 1 choix principal + 1-2 alternatives, hotels reels proches du lieu de mission, prix/nuit, distance/temps, atouts business.\n" +
      "4) AGENDA JOUR PAR JOUR : pour chaque jour : JOUR X - [Titre - zone] / Budget estime / etapes horodatees suivant le GABARIT.\n" +
      "5) SE DEPLACER : meilleur mode hotel -> lieu de mission (temps, prix), pass/VTC, appli.\n" +
      "6) RESTAURANTS AFFAIRES : par occasion (petit-dej, dejeuner rapide, diner client) avec standing, prix/pers, reservation.\n" +
      "7) BUDGET MISSION : tableau (transport A/R, hotel x nuits, transferts, repas, extras) total et par personne.\n" +
      "8) INFOS PRO : etiquette, pourboires, code vestimentaire, connectivite, securite, contacts utiles.\n" +
      "9) AVERTISSEMENT final : verifier horaires, prix et disponibilites avant le depart.\n\n" +
      "Commence directement par l en-tete officiel. Aucun texte avant ou apres.",
      vars
    );
  }

  if (input.destination_arrival_city) {
    return substitute(
      "Tu es TravelGuide, concepteur d itineraires de voyage expert propulse par IA. " +
      "Tu rediges un guide de voyage HAUT DE GAMME, ultra-personnalise, complet et actionnable, destine a etre livre en PDF professionnel. " +
      "Ecris en {{LANGUE_SORTIE}} (par defaut : francais), d un ton chaleureux, precis et inspirant, sans remplissage.\n\n" +
      "=== PROFIL DU VOYAGEUR ===\n" +
      "Destination        : {{VILLE_ARRIVEE}}, {{PAYS}}\n" +
      "Depart depuis      : {{VILLE_DEPART}}\n" +
      "Type de sejour     : {{TYPE_SEJOUR}}  |  Etapes : {{ETAPES}}\n" +
      "Dates              : {{DATE_DEBUT}} -> {{DATE_FIN}}  ({{NB_JOURS}} jours)  |  Flexibilite : {{FLEXIBILITE}}\n" +
      "Groupe             : {{TYPE_GROUPE}} - {{NB_ADULTES}} adulte(s), {{NB_ENFANTS}} enfant(s)\n" +
      "Forfait            : {{FORFAIT}}\n" +
      "Budget             : {{NIVEAU_BUDGET}} - {{BUDGET_MONTANT}} {{DEVISE}} ({{BUDGET_BASE}})\n" +
      "Paysages souhaites : {{PAYSAGES}}\n" +
      "Climat prefere     : {{CLIMAT}}\n" +
      "Ambiance           : {{AMBIANCE}}\n" +
      "Rythme             : {{RYTHME}}\n" +
      "Style decouverte   : {{STYLE_DECOUVERTE}}\n" +
      "Hebergement voulu  : {{HEBERGEMENTS}}  |  Quartier : {{QUARTIER}}\n" +
      "Transports voulus  : {{TRANSPORTS}}\n" +
      "Centres d interet  : {{INTERETS}}\n" +
      "Incontournables    : {{INCONTOURNABLES}}\n" +
      "A eviter           : {{A_EVITER}}\n" +
      "Deja visites       : {{DEJA_VISITES}}\n" +
      "Langues parlees    : {{LANGUES}}\n" +
      "Restrictions alim. : {{RESTRICTIONS_ALIM}}\n" +
      "Occasion speciale  : {{OCCASION}}\n" +
      "Notes libres       : {{NOTES}}\n\n" +
      "=== REGLES DE PERSONNALISATION ===\n" +
      "- Cale TOUT sur le budget, le rythme et les centres d interet.\n" +
      "- Integre absolument les incontournables ; bannis tout ce qui est dans a eviter.\n" +
      "- Adapte au groupe (activites familiales si enfants, spots romantiques si couple, vie nocturne si groupe d amis).\n" +
      "- Chaque suggestion de restaurant respecte les restrictions alimentaires.\n" +
      "- Si occasion speciale renseignee, glisse 1-2 experiences marquantes adaptees.\n\n" +
      "=== PROFONDEUR SELON LE FORFAIT ===\n" +
      "- Guide Express (3j) : itineraire jour par jour, restaurants, activites incontournables, conseils pratiques.\n" +
      "- Guide Complet (7j) : + excursions depuis la ville + hebergements recommandes par quartier.\n" +
      "- Guide Immersif (14j) : + itineraire par zones geographiques + liste des points cles.\n" +
      "- Guide Evasion (1 mois) : + multi-destinations + planning semaine par semaine + saisonnalite.\n\n" +
      "=== REGLE PRIX & SOURCES ===\n" +
      "Chaque lieu/activite/repas/transport/hotel reel, nomme, avec prix realiste et a jour en {{DEVISE}}. Indique toujours COMMENT s y rendre. Signale les estimations.\n\n" +
      "=== GABARIT ETAPE ===" + gabarit + "\n\n" +
      "Tags : Pratique - Spirituel - Gastronomie - Shopping - Iconique - Vue - Nature - Culture - Soiree - Detente\n\n" +
      "=== STRUCTURE DE SORTIE (Markdown) ===\n" +
      "1) PAGE DE COUVERTURE : TRAVEL IA - GUIDE PERSONNEL EXCLUSIF / {{VILLE_ARRIVEE}} - {{PAYS}} / Guide [theme dominant] / {{NB_JOURS}} jours - {{NB_ADULTES}}+{{NB_ENFANTS}} voyageur(s) / Genere le [date] - PDF\n" +
      "2) INTRODUCTION (1/2 page) : pourquoi la destination colle au profil, meteo attendue, monnaie, langue, securite, TRANSFERT AEROPORT -> centre (option la moins chere + la plus rapide).\n" +
      "3) HEBERGEMENT - OU LOGER : 2 a 4 quartiers + 1-2 etablissements reels type {{HEBERGEMENTS}} avec fourchette prix/nuit, ambiance, pour qui, distance centre.\n" +
      "4) ITINERAIRE JOUR PAR JOUR : pour CHACUN des {{NB_JOURS}} jours : JOUR X - [Titre - Quartier(s)] / Budget estime du jour / puis 4 a 7 etapes horodatees suivant le GABARIT. 1 repas min/jour respectant les restrictions.\n" +
      "5) SE DEPLACER SUR PLACE : pass conseille (nom + prix), cout/trajet, appli utile, comparatif.\n" +
      "6) BUDGET DETAILLE : tableau (hebergement, transport, repas, activites, imprevus) par jour et total vs {{BUDGET_MONTANT}} {{DEVISE}}.\n" +
      "7) [7j+] EXCURSIONS. [14j+] ZONES GEOGRAPHIQUES + points cles. [1 mois] MULTI-DESTINATIONS + planning hebdo.\n" +
      "8) CONSEILS PRATIQUES : sante/securite, etiquette, applis, phrases utiles, check-list valise.\n" +
      "9) AVERTISSEMENT final : verifier horaires, prix et disponibilites avant le depart.\n\n" +
      "Commence directement par la page de couverture. Aucun texte avant ou apres le guide.",
      vars
    );
  }

  // Prompt 2 - IA suggere la destination
  return substitute(
    "Tu es TravelGuide, concepteur d itineraires expert propulse par IA. " +
    "L utilisateur n a PAS encore choisi sa destination. Ta mission se fait en DEUX temps : " +
    "(A) proposer la destination ideale selon son profil, puis (B) rediger le guide complet de cette destination. " +
    "Ecris en {{LANGUE_SORTIE}} (defaut : francais), ton chaleureux, precis, sans remplissage.\n\n" +
    "=== PROFIL & ENVIES (pas de destination imposee) ===\n" +
    "Depart depuis      : {{VILLE_DEPART}}\n" +
    "Dates              : {{DATE_DEBUT}} -> {{DATE_FIN}}  ({{NB_JOURS}} jours)  |  Flexibilite : {{FLEXIBILITE}}\n" +
    "Groupe             : {{TYPE_GROUPE}} - {{NB_ADULTES}} adulte(s), {{NB_ENFANTS}} enfant(s)\n" +
    "Forfait            : {{FORFAIT}}\n" +
    "Budget             : {{NIVEAU_BUDGET}} - {{BUDGET_MONTANT}} {{DEVISE}} ({{BUDGET_BASE}})\n" +
    "Un lieu / etapes   : {{ETAPES}}\n" +
    "Paysages souhaites : {{PAYSAGES}}\n" +
    "Climat prefere     : {{CLIMAT}}\n" +
    "Ambiance           : {{AMBIANCE}}\n" +
    "Rythme             : {{RYTHME}}\n" +
    "Style decouverte   : {{STYLE_DECOUVERTE}}\n" +
    "Hebergement voulu  : {{HEBERGEMENTS}}\n" +
    "Transports voulus  : {{TRANSPORTS}}\n" +
    "Centres d interet  : {{INTERETS}}\n" +
    "Incontournables    : {{INCONTOURNABLES}}\n" +
    "A eviter           : {{A_EVITER}}\n" +
    "Deja visites       : {{DEJA_VISITES}}\n" +
    "Langues parlees    : {{LANGUES}}\n" +
    "Restrictions alim. : {{RESTRICTIONS_ALIM}}\n" +
    "Occasion speciale  : {{OCCASION}}\n" +
    "Notes libres       : {{NOTES}}\n\n" +
    "=== PARTIE A - SUGGESTION DE DESTINATION ===\n" +
    "Analyse le profil (climat sur les dates reelles, duree de vol/train depuis {{VILLE_DEPART}}, budget total realiste vol+sejour, ambiance, langues, saisonnalite). " +
    "Propose 3 destinations classees, puis RECOMMANDE-EN 1 (Destination retenue). " +
    "Pour chaque option : Pays/ville, drapeau, pourquoi elle colle au profil, meteo attendue, transport depuis {{VILLE_DEPART}} (prix fourchette en {{DEVISE}}), budget total estime vs {{BUDGET_MONTANT}} {{DEVISE}}, niveau barriere linguistique. " +
    "Exclure deja visites et a eviter.\n\n" +
    "=== PARTIE B - GUIDE COMPLET DE LA DESTINATION RETENUE ===\n" +
    "Redige ensuite le guide complet de la destination recommandee avec EXACTEMENT la structure et les regles ci-dessous.\n\n" +
    "=== REGLE PRIX & SOURCES ===\n" +
    "Chaque lieu/activite/repas/transport/hotel reel, nomme, avec prix realiste et a jour en {{DEVISE}}, et le moyen de s y rendre. Signale les estimations.\n\n" +
    "=== PROFONDEUR SELON LE FORFAIT ===\n" +
    "(Express 3j = itineraire+restos+activites+pratique ; Complet 7j = +excursions +hebergements par quartier ; Immersif 14j = +zones geographiques +points cles ; Evasion 1 mois = +multi-destinations +planning hebdo +saisonnalite.)\n\n" +
    "=== GABARIT ETAPE ===" + gabarit + "\n\n" +
    "Tags : Pratique - Spirituel - Gastronomie - Shopping - Iconique - Vue - Nature - Culture - Soiree - Detente\n\n" +
    "=== STRUCTURE DE SORTIE (Markdown) ===\n" +
    "0) SUGGESTION : bloc Pourquoi cette destination (3 options + destination retenue), avec transport et budget chiffres.\n" +
    "1) PAGE DE COUVERTURE : TRAVEL IA - GUIDE PERSONNEL EXCLUSIF / [drapeau] [Ville retenue] - [Pays retenu] / Guide [theme dominant] - {{NB_JOURS}} jours - {{NB_ADULTES}}+{{NB_ENFANTS}} voyageur(s) / Genere le [date]\n" +
    "2) INTRODUCTION + TRANSFERT AEROPORT/GARE -> centre (option la moins chere + la plus rapide, prix et duree).\n" +
    "3) HEBERGEMENT - OU LOGER : 2-4 quartiers + etablissements reels type {{HEBERGEMENTS}} (prix/nuit, ambiance, distance centre).\n" +
    "4) ITINERAIRE JOUR PAR JOUR ({{NB_JOURS}} jours) : titre, budget du jour, puis 4-7 etapes horodatees suivant le GABARIT. 1 repas min/jour respectant les restrictions.\n" +
    "5) SE DEPLACER SUR PLACE : pass/carte conseille + prix, cout/trajet, appli, comparatif.\n" +
    "6) BUDGET DETAILLE : tableau (transport A/R, hebergement, transport local, repas, activites, imprevus) vs budget.\n" +
    "7) Sections additionnelles selon forfait.\n" +
    "8) CONSEILS PRATIQUES : securite, etiquette, applis, phrases utiles, check-list valise.\n" +
    "9) AVERTISSEMENT final : verifier horaires, prix et disponibilites avant le depart.\n\n" +
    "Commence directement par le bloc SUGGESTION puis la couverture. Aucun autre texte.",
    vars
  );
}

export function buildUserMessage(_input: GuideInput): string {
  return "Genere le guide complet maintenant.";
}

export function getMaxTokens(duration: string): number {
  if (duration === "3j") return 4000;
  if (duration === "7j") return 8000;
  if (duration === "14j") return 12000;
  return 16000;
}