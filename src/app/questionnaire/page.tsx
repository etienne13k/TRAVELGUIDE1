"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LangToggle from "@/components/LangToggle";
import { addCartItem, CART_PLANS, getCartItem, updateCartItem, type CartItemInput } from "@/lib/cart";

/* ──────────────────────────────────────────────────────────
   PLAN DATA
────────────────────────────────────────────────────────── */

const PLAN_KEY_MAP: Record<string, string> = {
  basic: "3j", standard: "7j", premium: "14j", elite: "1mois",
  "3": "3j", "7": "7j", "14": "14j", "30": "1mois",
};

const PLAN_ORDER = ["3j", "7j", "14j", "1mois"] as const;
type PlanKey = (typeof PLAN_ORDER)[number];
type Lang = "fr" | "en";

const PLANS: Record<PlanKey, { name: string; duration: string; oldPrice: string; price: string; priceN: number }> = {
  "3j":    { name: "Guide Express",  duration: "3 jours",  oldPrice: "5€",  price: "3€",  priceN: 3  },
  "7j":    { name: "Guide Complet",  duration: "7 jours",  oldPrice: "10€", price: "7€",  priceN: 7  },
  "14j":   { name: "Guide Immersif", duration: "14 jours", oldPrice: "18€", price: "12€", priceN: 12 },
  "1mois": { name: "Guide de Vie",   duration: "1 mois",   oldPrice: "25€", price: "18€", priceN: 18 },
};

const DESTINATIONS = [
  // France
  "Paris","Nice","Lyon","Marseille","Bordeaux","Toulouse","Strasbourg","Lille","Nantes","Montpellier","Rennes","Monaco","Cannes","Saint-Tropez","Annecy","Grenoble","Avignon","Aix-en-Provence","Carcassonne","Biarritz","Colmar","Tours","La Rochelle","Brest","Dijon","Metz","Nancy","Reims","Ajaccio","Bonifacio","Calvi","Toulon","Perpignan","Clermont-Ferrand","Limoges",
  // UK & Irlande
  "Londres","Édimbourg","Glasgow","Manchester","Liverpool","Bristol","Bath","Oxford","Cambridge","York","Brighton","Cardiff","Dublin","Belfast","Cork",
  // Italie
  "Rome","Milan","Florence","Venise","Naples","Turin","Bologne","Palerme","Vérone","Gênes","Capri","Amalfi","Positano","Sorrento","Cinque Terre","Portofino","Lac de Côme","Lac de Garde","Toscane","Sicile","Sardaigne","San Marin",
  // Espagne
  "Barcelone","Madrid","Séville","Valence","Bilbao","Saint-Sébastien","Grenade","Cordoue","Tolède","Salamanque","Saint-Jacques-de-Compostelle","Palma de Majorque","Ibiza","Formentera","Ténérife","Grande Canarie","Lanzarote","Fuerteventura","La Palma","Minorque","Malaga","Marbella","Cadix","Alicante","Murcie","Saragosse","Valladolid",
  // Portugal
  "Lisbonne","Porto","Algarve","Sintra","Madère","Açores","Faro","Évora","Braga","Coimbra",
  // Benelux
  "Amsterdam","Rotterdam","La Haye","Utrecht","Bruges","Bruxelles","Gand","Anvers","Luxembourg",
  // Allemagne
  "Berlin","Munich","Hambourg","Francfort","Cologne","Stuttgart","Dresde","Leipzig","Düsseldorf","Heidelberg","Rothenburg","Forêt-Noire","Vallée du Rhin","Nuremberg","Brême","Hanovre",
  // Autriche & Suisse
  "Vienne","Salzbourg","Innsbruck","Hallstatt","Graz","Zurich","Genève","Berne","Lucerne","Interlaken","Zermatt","Saint-Moritz","Lausanne","Bâle","Lugano",
  // Europe centrale
  "Prague","Brno","Český Krumlov","Karlovy Vary","Budapest","Eger","Varsovie","Cracovie","Gdansk","Wroclaw","Tallinn","Riga","Vilnius","Helsinki","Turku","Stockholm","Göteborg","Malmö","Oslo","Bergen","Tromsø","Lofoten","Stavanger","Flåm","Copenhague","Aarhus","Reykjavik",
  // Grèce & Balkans
  "Athènes","Thessalonique","Rhodes","Santorin","Mykonos","Corfou","Crète","Zakynthos","Météores","Delphes","Dubrovnik","Split","Hvar","Zadar","Pula","Zagreb","Kotor","Monténégro","Ljubljana","Lac de Bled","Bratislava","Bucarest","Transylvanie","Brasov","Sibiu","Cluj-Napoca","Sofia","Plovdiv","Belgrade","Novi Sad",
  // Turquie
  "Istanbul","Cappadoce","Antalya","Bodrum","Izmir","Éphèse","Pamukkale","Trabzon","Ölüdeniz","Alanya","Kaş","Göreme","Fethiye","Marmaris",
  // Israël & Moyen-Orient
  "Jérusalem","Tel Aviv","Mer Morte","Petra","Wadi Rum","Amman","Beyrouth","Aqaba","Dubaï","Abu Dhabi","Muscat","Doha","Bahreïn","Riyad","Koweït","Tbilissi","Batoumi","Erevan","Bakou",
  // Asie centrale
  "Almaty","Samarkand","Boukhara","Tachkent","Khiva","Oulan-Bator",
  // Japon
  "Tokyo","Kyoto","Osaka","Hiroshima","Nara","Hakone","Nikko","Sapporo","Fukuoka","Okinawa","Kanazawa","Nagasaki","Kobé","Nagoya","Sendai","Matsuyama",
  // Corée
  "Séoul","Busan","Île de Jeju","Gyeongju","Incheon",
  // Chine
  "Pékin","Shanghai","Hong Kong","Macao","Guangzhou","Shenzhen","Chengdu","Xi'an","Hangzhou","Suzhou","Guilin","Zhangjiajie","Lijiang","Dali","Kunming","Chongqing","Nankin","Harbin","Wuhan",
  // Taïwan & Asie Est
  "Taipei","Tainan","Taichung","Jiufen","Gorges de Taroko",
  // Thaïlande
  "Bangkok","Chiang Mai","Chiang Rai","Phuket","Koh Samui","Koh Phi Phi","Krabi","Kanchanaburi","Ayutthaya","Pai","Sukhothaï","Koh Lanta","Koh Chang","Pattaya","Koh Tao",
  // Indonésie
  "Bali","Jakarta","Yogyakarta","Lombok","Île de Komodo","Raja Ampat","Flores","Volcan Bromo","Borobudur","Ubud","Seminyak","Nusa Penida","Gili Air",
  // Malaisie & Singapour
  "Singapour","Kuala Lumpur","Penang","Langkawi","Malacca","Bornéo","Kota Kinabalu","Kuching",
  // Vietnam
  "Hô Chi Minh-Ville","Hanoï","Hoi An","Baie d'Ha Long","Da Nang","Hué","Sapa","Ninh Binh","Phong Nha","Mui Ne","Phu Quoc","Nha Trang",
  // Cambodge, Laos, Myanmar
  "Phnom Penh","Siem Reap","Angkor Wat","Luang Prabang","Vientiane","Vang Vieng","Yangon","Bagan","Lac Inle","Mandalay","Ngapali",
  // Inde
  "Mumbai","Delhi","Agra","Jaipur","Goa","Kerala","Varanasi","Kolkata","Chennai","Bangalore","Hyderabad","Udaipur","Jodhpur","Rishikesh","Ladakh","Darjeeling","Îles Andaman","Munnar","Pondichéry","Hampi","Mysore","Amritsar","Shimla","Manali","Pushkar","Jaisalmer","Alleppey",
  // Autres Asie du Sud
  "Maldives","Sri Lanka","Colombo","Sigiriya","Kandy","Galle","Ella","Mirissa","Népal","Katmandou","Pokhara","Chitwan","Bhoutan","Thimphou","Paro",
  // Amériques du Nord
  "New York","Los Angeles","Miami","San Francisco","Chicago","Las Vegas","Boston","Washington DC","La Nouvelle-Orléans","Nashville","Austin","Seattle","Portland","Denver","Phoenix","San Diego","Houston","Atlanta","Orlando","Honolulu","Maui","Big Island Hawaï","Napa Valley","Parc Yellowstone","Grand Canyon","Yosemite","Parc de Zion","Bryce Canyon","Glacier National Park","Montréal","Toronto","Vancouver","Québec","Ottawa","Calgary","Whistler","Victoria","Chutes du Niagara","Halifax",
  // Mexique & Amérique centrale
  "Mexico","Cancun","Playa del Carmen","Tulum","Oaxaca","Guadalajara","Puerto Vallarta","Los Cabos","Mérida","Chichen Itza","Guanajuato","Puebla","Holbox","Bacalar","Cozumel","La Havane","Trinidad Cuba","Punta Cana","Jamaïque","Barbade","Sainte-Lucie","Martinique","Guadeloupe","Aruba","Curaçao","Costa Rica","Arenal","Manuel Antonio","Monteverde","Panama City","Bocas del Toro","Guatemala","Antigua Guatemala","Tikal","Belize",
  // Amérique du Sud
  "Bogotá","Carthagène des Indes","Medellín","Santa Marta","Parc Tayrona","Lima","Cusco","Machu Picchu","Lac Titicaca","Arequipa","Lignes de Nazca","Vallée Sacrée","Montagne Arc-en-Ciel","La Paz","Sucre","Salar d'Uyuni","Potosí","Quito","Îles Galápagos","Cuenca","Amazonie","Rio de Janeiro","São Paulo","Salvador de Bahia","Manaus","Florianópolis","Chutes d'Iguazú","Fernando de Noronha","Buenos Aires","Patagonie","Mendoza","Bariloche","El Calafate","Ushuaia","Salta","Jujuy","Santiago du Chili","Valparaíso","Torres del Paine","Île de Pâques","Désert d'Atacama","Puerto Natales","Montevideo","Punta del Este","Colonia del Sacramento",
  // Afrique du Nord
  "Marrakech","Fès","Casablanca","Chefchaouen","Désert du Sahara","Essaouira","Meknès","Ouarzazate","Agadir","Tanger","Djerba","Tunis","Hammamet","Tozeur","Le Caire","Louxor","Assouan","Alexandrie","Mer Rouge","Hurghada","Charm el-Cheikh","Dahab","Sinaï","Abou Simbel","Oasis de Siwa",
  // Afrique subsaharienne
  "Nairobi","Masai Mara","Amboseli","Tsavo","Lamu","Zanzibar","Serengeti","Kilimandjaro","Ngorongoro","Stone Town","Le Cap","Johannesburg","Safari Kruger","Garden Route","Drakensberg","Stellenbosch","Namibie","Sossusvlei","Etosha","Swakopmund","Botswana","Delta de l'Okavango","Chobe","Victoria Falls","Zambèze","Mozambique","Bazaruto","Madagascar","Avenue des Baobabs","Nosy Be","Ile Maurice","La Réunion","Seychelles","Mahé","Praslin","La Digue","Addis-Abeba","Lalibela","Montagnes du Simien","Kampala","Bwindi","Kigali","Parc des Volcans","Accra","Dakar","Saint-Louis Sénégal",
  // Océanie
  "Sydney","Melbourne","Brisbane","Perth","Adélaïde","Cairns","Gold Coast","Uluru","Grande Barrière de Corail","Auckland","Wellington","Queenstown","Milford Sound","Rotorua","Christchurch","Fiordland","Fidji","Tahiti","Bora-Bora","Moorea","Nouvelle-Calédonie","Vanuatu","Samoa","Tonga","Îles Cook",
];

const PLAN_DATE_LIMITS: Record<PlanKey, { maxDays: number; label: string }> = {
  "3j": { maxDays: 3, label: "3 jours" },
  "7j": { maxDays: 7, label: "7 jours" },
  "14j": { maxDays: 14, label: "14 jours" },
  "1mois": { maxDays: 31, label: "1 mois" },
};

function resolvePlanKey(rawPlan: string): PlanKey | null {
  const mapped = PLAN_KEY_MAP[rawPlan] ?? rawPlan;
  return PLAN_ORDER.includes(mapped as PlanKey) ? (mapped as PlanKey) : null;
}

function resolveLanguage(rawLang: string | null): Lang {
  return rawLang === "en" ? "en" : "fr";
}

const LEGAL_COPY: Record<Lang, {
  noticeTitle: string;
  noticeBody: string;
  termsPrefix: string;
  termsLabel: string;
  termsJoin: string;
  privacyLabel: string;
  termsSuffix: string;
  error: string;
  paymentButton: string;
}> = {
  fr: {
    noticeTitle: "Information importante",
    noticeBody:
      "Les horaires et jours d'ouverture des monuments et lieux recommandés dans votre guide sont fournis à titre indicatif, sur la base des informations disponibles au moment de la génération. TravelGuide AI ne peut être tenu responsable en cas de fermeture exceptionnelle, de modification d'horaires ou d'événements imprévus affectant l'accès aux lieux mentionnés. Nous vous recommandons de vérifier les informations officielles avant chaque visite.",
    termsPrefix: "J'ai lu et j'accepte les",
    termsLabel: "Conditions Générales de Vente",
    termsJoin: "ainsi que la",
    privacyLabel: "Politique de confidentialité",
    termsSuffix:
      "Je comprends que les informations fournies dans le guide sont indicatives et non contractuelles.",
    error: "Veuillez accepter les conditions générales de vente pour continuer.",
    paymentButton: "Ajouter au panier",
  },
  en: {
    noticeTitle: "Important notice",
    noticeBody:
      "Opening hours and schedules listed in your guide are provided for informational purposes only. Spiregg cannot be held responsible for unexpected closures, schedule changes, or any unforeseen events affecting access to the listed locations. We recommend checking official sources before each visit.",
    termsPrefix: "I have read and agree to the",
    termsLabel: "Terms & Conditions",
    termsJoin: "and",
    privacyLabel: "Privacy Policy",
    termsSuffix:
      "I understand that the information provided in the guide is indicative and non-contractual.",
    error: "Please accept the terms and conditions to continue.",
    paymentButton: "Add to cart",
  },
};

/* ──────────────────────────────────────────────────────────
   OPTION DEFINITIONS
────────────────────────────────────────────────────────── */

type Opt = { id: string; emoji: string; label: string };

const TRAVEL_SPEED: Opt[] = [
  { id: "city_hopping",   emoji: "🚀", label: "Voyage itinérant (plusieurs villes)" },
  { id: "deep_immersion", emoji: "🐢", label: "Immersion profonde (une destination)" },
];

const TRAVELER_TYPE: Opt[] = [
  { id: "solo",    emoji: "🧍",       label: "En solo" },
  { id: "couple",  emoji: "💑",       label: "Couple" },
  { id: "family",  emoji: "👨‍👩‍👧‍👦", label: "Famille" },
  { id: "friends", emoji: "👫",       label: "Groupe d'amis" },
];

const ACTIVITY_PACE: Opt[] = [
  { id: "packed",     emoji: "⚡",  label: "Serré (plusieurs activités/jour)" },
  { id: "relaxed",    emoji: "☀️",  label: "Détendu (1 à 2 activités/jour)" },
  { id: "ultra_chill",emoji: "🌊",  label: "Très libre (sans programme strict)" },
];

const BUDGET_OPTS: Opt[] = [
  { id: "backpacker", emoji: "🎒", label: "Voyageur sac à dos" },
  { id: "comfort",    emoji: "😊", label: "Confort" },
  { id: "luxury",     emoji: "💎", label: "Haut de gamme" },
];

const ACCOMMODATION: Opt[] = [
  { id: "hostel",   emoji: "🛏️", label: "Auberge de jeunesse" },
  { id: "airbnb",   emoji: "🏠", label: "Airbnb" },
  { id: "hotel_3_4",emoji: "🏨", label: "Hôtel 3-4★" },
  { id: "resort",   emoji: "🌴", label: "Complexe hôtelier tout compris" },
  { id: "camping",  emoji: "⛺", label: "Camping" },
  { id: "boutique", emoji: "🏡", label: "Boutique hôtel" },
];

const TRANSPORT: Opt[] = [
  { id: "public",  emoji: "🚌", label: "Transports en commun" },
  { id: "walking", emoji: "🚶", label: "À pied / vélo" },
  { id: "rental",  emoji: "🚗", label: "Voiture de location" },
  { id: "taxi",    emoji: "🚕", label: "Taxi / Uber" },
];

const INTERESTS: Opt[] = [
  { id: "culture",      emoji: "🏛️", label: "Culture & histoire" },
  { id: "nature",       emoji: "🌿", label: "Nature" },
  { id: "adventure",    emoji: "🧗", label: "Aventure" },
  { id: "gastronomy",   emoji: "🍽️", label: "Gastronomie" },
  { id: "shopping",     emoji: "🛍️", label: "Boutiques et marchés" },
  { id: "nightlife",    emoji: "🎉", label: "Vie nocturne" },
  { id: "wellness",     emoji: "🧘", label: "Bien-être & spa" },
  { id: "art",          emoji: "🎨", label: "Art & musées" },
  { id: "photography",  emoji: "📸", label: "Photographie & lieux photogéniques" },
  { id: "water_sports", emoji: "🏄", label: "Sports nautiques" },
  { id: "hiking",       emoji: "🥾", label: "Randonnée" },
  { id: "architecture", emoji: "🏙️", label: "Architecture & urbanisme" },
];

const SPORTS: Opt[] = [
  { id: "hiking",       emoji: "🥾", label: "Randonnée" },
  { id: "climbing",     emoji: "🧗", label: "Escalade" },
  { id: "diving",       emoji: "🤿", label: "Plongée" },
  { id: "surf",         emoji: "🏄", label: "Surf" },
  { id: "ski",          emoji: "⛷️", label: "Ski" },
  { id: "yoga",         emoji: "🧘", label: "Yoga" },
  { id: "mountain_bike",emoji: "🚵", label: "VTT" },
  { id: "paragliding",  emoji: "🪂", label: "Parapente" },
  { id: "swimming",     emoji: "🏊", label: "Natation" },
  { id: "kayak",        emoji: "🚣", label: "Kayak" },
];

const LANDSCAPE: Opt[] = [
  { id: "beach",       emoji: "🏖️", label: "Plage & mer" },
  { id: "mountain",    emoji: "⛰️", label: "Montagne" },
  { id: "city",        emoji: "🏙️", label: "Ville & urbain" },
  { id: "desert",      emoji: "🏜️", label: "Désert" },
  { id: "jungle",      emoji: "🌴", label: "Jungle & forêt" },
  { id: "countryside", emoji: "🌾", label: "Campagne" },
  { id: "island",      emoji: "🏝️", label: "Île" },
];

const CLIMATE: Opt[] = [
  { id: "warm",      emoji: "☀️", label: "Chaud & ensoleillé" },
  { id: "temperate", emoji: "🌤️", label: "Tempéré" },
  { id: "cold",      emoji: "❄️",  label: "Froid" },
  { id: "any",       emoji: "🌈", label: "Peu importe" },
];

const SOCIABILITY: Opt[] = [
  { id: "social",      emoji: "🤝", label: "Très sociable (rencontres, visites en groupe)" },
  { id: "independent", emoji: "🧍", label: "Indépendant (voyage en privé)" },
  { id: "mixed",       emoji: "⚖️", label: "Entre les deux" },
];

const VIBE: Opt[] = [
  { id: "party",    emoji: "🎉", label: "Fêtards" },
  { id: "local",    emoji: "🌍", label: "Locaux & authentique" },
  { id: "business", emoji: "👔", label: "Professionnels" },
];

const COMFORT: Opt[] = [
  { id: "luxury",      emoji: "🌟", label: "Haut de gamme (tout confort)" },
  { id: "comfortable", emoji: "😊", label: "Confortable" },
  { id: "spartan",     emoji: "🎒", label: "Spartiate (adapté à l'aventure)" },
];

const CONNECTIVITY: Opt[] = [
  { id: "wifi",    emoji: "📶", label: "WiFi constant indispensable" },
  { id: "mobile",  emoji: "📱", label: "Données mobiles suffisent" },
  { id: "offline", emoji: "🔌", label: "Je peux me déconnecter" },
];

const ACCESSIBILITY: Opt[] = [
  { id: "wheelchair", emoji: "♿", label: "Mobilité réduite" },
  { id: "baby",       emoji: "👶", label: "Bébé / poussette" },
  { id: "senior",     emoji: "👴", label: "Personne âgée" },
  { id: "pets",       emoji: "🐕", label: "Animaux acceptés" },
  { id: "none",       emoji: "✅", label: "Aucune contrainte" },
];

const ECO: Opt[] = [
  { id: "eco_priority",  emoji: "🌱", label: "Tourisme responsable prioritaire" },
  { id: "if_possible",   emoji: "⚖️", label: "Si possible, sans contrainte" },
  { id: "not_priority",  emoji: "🗺️", label: "Pas une priorité" },
];

const AUTHENTICITY: Opt[] = [
  { id: "off_beaten",    emoji: "🗺️", label: "Hors des sentiers battus" },
  { id: "mixed",         emoji: "⚖️", label: "Équilibre entre classique et authentique" },
  { id: "tourist_spots", emoji: "📸", label: "Sites touristiques incontournables" },
];

const DIET: Opt[] = [
  { id: "vegetarian",   emoji: "🌿", label: "Végétarien" },
  { id: "vegan",        emoji: "🌱", label: "Végan" },
  { id: "pescatarian",  emoji: "🐟", label: "Pescatarien" },
  { id: "gluten_free",  emoji: "🚫", label: "Sans gluten" },
  { id: "lactose_free", emoji: "🥛", label: "Sans lactose" },
  { id: "halal",        emoji: "🔵", label: "Halal" },
  { id: "kosher",       emoji: "✡️", label: "Casher" },
  { id: "diabetes",     emoji: "🩺", label: "Diabète / maladie causant des troubles alimentaires" },
  { id: "allergies",    emoji: "⚠️", label: "Allergies alimentaires" },
  { id: "none",         emoji: "✅", label: "Aucune restriction" },
];

const INSTAGRAM: Opt[] = [
  { id: "very_important", emoji: "📸", label: "Très important (lieux photogéniques)" },
  { id: "nice",           emoji: "📷", label: "Si c'est joli, pourquoi pas" },
  { id: "not_priority",   emoji: "🚫", label: "Pas une priorité" },
];

/* ──────────────────────────────────────────────────────────
   TYPES
────────────────────────────────────────────────────────── */

interface Answers {
  travel_speed: string;
  traveler_type: string;
  traveler_adults: number;
  traveler_children: number;
  activity_pace: string;
  budget: string;
  accommodations: string[];
  transport: string[];
  interests: string[];
  sports: string[];
  destination: string;
  arrival_date: string;
  departure_date: string;
  travel_dates: string;
  landscape: string[];
  climate: string;
  sociability: string;
  vibe: string[];
  comfort_level: string;
  connectivity: string;
  accessibility: string[];
  eco_tourism: string;
  authenticity: string;
  diet: string[];
  allergy_details: string;
  budget_amount: string;
  instagram: string;
  user_email: string;
  notes: string;
  language: Lang;
}

const EMPTY: Answers = {
  travel_speed: "", traveler_type: "", traveler_adults: 1, traveler_children: 0, activity_pace: "",
  budget: "", accommodations: [], transport: [],
  interests: [], sports: [],
  destination: "", arrival_date: "", departure_date: "", travel_dates: "", landscape: [], climate: "",
  sociability: "", vibe: [],
  comfort_level: "", connectivity: "", accessibility: [],
  eco_tourism: "", authenticity: "",
  diet: [], allergy_details: "", budget_amount: "", instagram: "", user_email: "", notes: "", language: "fr",
};

/* ──────────────────────────────────────────────────────────
   UI PRIMITIVES
────────────────────────────────────────────────────────── */

function Pill({
  emoji, label, selected, onClick, disabled,
}: {
  emoji?: string; label: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium",
        "transition-all duration-150 select-none cursor-pointer",
        selected
          ? "border-[#425B48] bg-[#425B48] text-white shadow-[0_2px_8px_rgba(66,91,72,0.3)]"
          : disabled
          ? "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] cursor-not-allowed opacity-60"
          : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#c9a84c] hover:text-[#425B48]",
      ].join(" ")}
    >
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
    </button>
  );
}

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d4] p-6 shadow-sm">
      <h3 className="text-base font-bold text-[#425B48] flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stepper({
  value, min, max, onChange, label, sublabel,
}: {
  value: number; min: number; max: number;
  onChange: (v: number) => void;
  label: string; sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-[#334155]">{label}</p>
        {sublabel && <p className="text-xs text-[#94a3b8] mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e2e8f0] text-lg font-bold text-[#425B48] transition hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed"
        >−</button>
        <span className="w-6 text-center text-lg font-black text-[#425B48]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e2e8f0] text-lg font-bold text-[#425B48] transition hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed"
        >+</button>
      </div>
    </div>
  );
}

function QLabel({ children, hint, required }: { children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <p className="text-sm font-semibold text-[#334155] mb-3">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
      {hint && <span className="text-[#94a3b8] font-normal ml-1.5 text-xs">{hint}</span>}
    </p>
  );
}

const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const LAST_SELECTABLE_DATE = "2027-12-31";

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function countInclusiveDays(startDate: string, endDate: string): number {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function formatDateFr(dateKey: string): string {
  return parseLocalDate(dateKey).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTravelDates(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return "";
  if (startDate && !endDate) return startDate;
  if (!startDate && endDate) return endDate;
  if (startDate === endDate) return startDate;
  return `${startDate} → ${endDate}`;
}

function getMonthCells(monthDate: Date) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const firstCell = addDays(firstOfMonth, -mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstCell, index);
    return {
      date,
      key: toLocalDateKey(date),
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });
}

function TravelDateCalendar({
  planKey,
  startDate,
  endDate,
  onChange,
}: {
  planKey: PlanKey | null;
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}) {
  const todayKey = useMemo(() => toLocalDateKey(new Date()), []);
  const firstMonth = useMemo(() => {
    const today = parseLocalDate(todayKey);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [todayKey]);
  const [visibleMonth, setVisibleMonth] = useState(firstMonth);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [isChoosingEnd, setIsChoosingEnd] = useState(false);

  const maxDays = planKey ? PLAN_DATE_LIMITS[planKey].maxDays : 3;
  const planLabel = planKey ? PLAN_DATE_LIMITS[planKey].label : "3 jours";
  const selectedDays = startDate && endDate ? countInclusiveDays(startDate, endDate) : startDate ? 1 : 0;
  const monthCells = getMonthCells(visibleMonth);
  const currentMonthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
  const firstMonthKey = `${firstMonth.getFullYear()}-${String(firstMonth.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthKey = "2027-12";
  const canGoPrev = currentMonthKey > firstMonthKey;
  const canGoNext = currentMonthKey < lastMonthKey;

  function moveMonth(amount: number) {
    setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    setCalendarError(null);
  }

  function selectDate(dateKey: string) {
    if (!planKey) {
      setCalendarError("Choisissez d'abord un forfait pour connaître le nombre de jours inclus.");
      return;
    }

    if (!startDate || !isChoosingEnd || compareDateKeys(dateKey, startDate) < 0) {
      onChange(dateKey, dateKey);
      setIsChoosingEnd(true);
      setCalendarError(null);
      return;
    }

    const nextCount = countInclusiveDays(startDate, dateKey);
    if (nextCount > maxDays) {
      setCalendarError(`Votre plan ${planLabel} ne permet pas de dépasser ${maxDays} jours. Pour plus de jours, choisissez un plan supérieur.`);
      return;
    }

    onChange(startDate, dateKey);
    setIsChoosingEnd(false);
    setCalendarError(null);
  }

  return (
    <div className="mt-5 rounded-3xl border border-[#d9c996] bg-[#fffdf8] p-4 sm:p-5 shadow-[0_18px_50px_rgba(66,91,72,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Calendrier de voyage</p>
          <h4 className="mt-1 text-lg font-bold text-[#425B48]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Sélectionnez vos dates
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
            Cliquez sur une date de début puis une date de fin. Vous pouvez choisir moins de jours que le forfait, le prix reste identique.
          </p>
        </div>
        <div className="rounded-2xl border border-[#c9a84c]/40 bg-[#fff8e6] px-4 py-2 text-center">
          <p className="text-xl font-black text-[#425B48]">{selectedDays} / {maxDays}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7b21]">jours sélectionnés</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#425B48] px-3 py-2 text-white">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          disabled={!canGoPrev}
          className="rounded-xl px-3 py-2 text-lg font-bold transition-colors enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/30"
          aria-label="Mois précédent"
        >
          ←
        </button>
        <p className="text-sm font-bold capitalize tracking-wide">
          {MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          disabled={!canGoNext}
          className="rounded-xl px-3 py-2 text-lg font-bold transition-colors enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/30"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
        {WEEKDAY_LABELS.map((weekday, index) => (
          <span key={`${weekday}-${index}`} className={index >= 5 ? "text-[#c9a84c]" : undefined}>{weekday}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {monthCells.map(({ key, date, inCurrentMonth, isWeekend }) => {
          // Cases des mois adjacents → case vide invisible
          if (!inCurrentMonth) {
            return <div key={key} className="aspect-square" />;
          }

          const isPast = compareDateKeys(key, todayKey) < 0;
          const isTooFar = compareDateKeys(key, LAST_SELECTABLE_DATE) > 0;
          const disabled = isPast || isTooFar;
          const isStart = key === startDate;
          const isEnd = key === endDate && endDate !== startDate;
          const isSingle = key === startDate && key === endDate;
          const inRange = startDate && endDate && compareDateKeys(key, startDate) >= 0 && compareDateKeys(key, endDate) <= 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => selectDate(key)}
              disabled={disabled}
              className={[
                "relative aspect-square rounded-2xl text-sm font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2",
                disabled
                  ? "cursor-not-allowed bg-[#f1f5f9] text-[#cbd5e1] opacity-50"
                  : inRange
                  ? "bg-[#425B48] text-white shadow-[0_10px_22px_rgba(66,91,72,0.22)] hover:scale-105"
                  : isWeekend
                  ? "bg-[#fff7df] text-[#9a7b21] hover:bg-[#c9a84c] hover:text-white"
                  : "bg-white text-[#334155] hover:bg-[#c9a84c] hover:text-white",
                (isStart || isEnd || isSingle) && !disabled ? "ring-2 ring-[#c9a84c]" : "",
              ].join(" ")}
              aria-label={formatDateFr(key)}
              aria-pressed={Boolean(inRange)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#64748b]">
          Dates disponibles jusqu&apos;au 31 décembre 2027. Les dates passées sont grisées.
        </p>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              onChange("", "");
              setIsChoosingEnd(false);
              setCalendarError(null);
            }}
            className="self-start rounded-full border border-[#e2e8f0] px-4 py-2 text-xs font-bold text-[#425B48] transition-colors hover:border-[#c9a84c] hover:text-[#c9a84c] sm:self-auto"
          >
            Effacer les dates
          </button>
        )}
      </div>

      {startDate && (
        <div className="mt-3 rounded-2xl border border-[#c9a84c]/30 bg-white px-4 py-3 text-sm text-[#425B48]">
          <strong>Dates choisies :</strong> {formatDateFr(startDate)}{endDate && endDate !== startDate ? ` → ${formatDateFr(endDate)}` : ""}
        </div>
      )}

      {calendarError && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {calendarError}
        </p>
      )}
    </div>
  );
}

function PlanSelector({ selectedPlanKey, onSelect }: { selectedPlanKey: PlanKey | null; onSelect: (planKey: PlanKey) => void }) {
  return (
    <section className="bg-white rounded-2xl border border-[#e8e0d4] p-5 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#c9a84c] font-bold mb-1">Forfait</p>
          <h2
            className="text-xl sm:text-2xl font-bold text-[#425B48]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {selectedPlanKey ? "Votre forfait sélectionné" : "Choisissez votre forfait"}
          </h2>
        </div>
        <p className="text-sm text-[#64748b] sm:text-right">Modifiable avant le paiement.</p>
      </div>

      <div className="-mx-5 sm:mx-0 overflow-x-auto pb-1 sm:overflow-visible">
        <div className="flex gap-3 px-5 sm:px-0 sm:grid sm:grid-cols-4 min-w-max sm:min-w-0">
          {PLAN_ORDER.map(planKey => {
            const planOption = PLANS[planKey];
            const selected = selectedPlanKey === planKey;

            return (
              <button
                key={planKey}
                type="button"
                onClick={() => onSelect(planKey)}
                aria-pressed={selected}
                className={[
                  "w-36 sm:w-auto rounded-2xl border-2 p-4 text-left transition-all duration-200 shrink-0",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2",
                  selected
                    ? "border-[#c9a84c] bg-[#fff8e6] shadow-[0_10px_24px_rgba(201,168,76,0.22)] scale-[1.02]"
                    : "border-[#e8e0d4] bg-[#fffdf9] hover:border-[#c9a84c]/70 hover:bg-[#fffaf0]",
                ].join(" ")}
              >
                <span className="block text-sm font-bold text-[#425B48]">{planOption.duration}</span>
                <span className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-[#94a3b8] line-through">{planOption.oldPrice}</span>
                  <span className="text-2xl font-black text-[#c9a84c]">{planOption.price}</span>
                </span>
                <span className="mt-2 block text-[11px] font-semibold text-[#64748b]">{planOption.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT (needs Suspense for useSearchParams)
────────────────────────────────────────────────────────── */

function QuestionnaireContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve URL values without defaulting when no plan is present
  const initialPlanKey = resolvePlanKey(searchParams.get("plan") ?? "");
  const initialEmail = searchParams.get("email") ?? "";
  const editItemId = searchParams.get("edit");
  const urlLang = resolveLanguage(searchParams.get("lang"));

  const [language, setLanguage] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tgai_lang");
      if (stored === "en") return "en";
    }
    return urlLang;
  });
  const legalCopy = LEGAL_COPY[language];

  const [step, setStep] = useState(1); // 1, 2, 3
  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanKey | null>(initialPlanKey);
  const [answers, setAnswers] = useState<Answers>(() => ({ ...EMPTY, user_email: initialEmail, language }));
  const [errors, setErrors] = useState<{ destination?: string; dates?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [isEditingCartItem, setIsEditingCartItem] = useState(false);

  const plan = selectedPlanKey ? PLANS[selectedPlanKey] : null;

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const evt = e as CustomEvent<{ lang: "fr" | "en" }>;
      setLanguage(evt.detail.lang);
      setAnswers(prev => ({ ...prev, language: evt.detail.lang }));
    };
    window.addEventListener("tgai_lang_change", handleLangChange);
    return () => window.removeEventListener("tgai_lang_change", handleLangChange);
  }, []);

  useEffect(() => {
    if (!editItemId) return;

    queueMicrotask(() => {
      const cartItem = getCartItem(editItemId);
      if (!cartItem) {
        setSubmitError("Cet article n'est plus dans votre panier.");
        return;
      }

      setIsEditingCartItem(true);
      setSelectedPlanKey(cartItem.planId);
      setAnswers({
        ...EMPTY,
        ...cartItem.criteria,
        destination: cartItem.destination,
        travel_dates: cartItem.dates,
        language,
      } as Answers);
    });
  }, [editItemId, language]);

  /* ── STATE HELPERS ── */

  function radio(field: keyof Answers, value: string) {
    setAnswers(prev => ({ ...prev, [field]: (prev[field] as string) === value ? "" : value }));
  }

  function toggle(field: "accommodations"|"transport"|"interests"|"sports"|"landscape"|"vibe"|"accessibility"|"diet", value: string) {
    setAnswers(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }

  function toggleInterest(value: string) {
    setAnswers(prev => {
      const arr = prev.interests;
      if (arr.includes(value)) return { ...prev, interests: arr.filter(v => v !== value) };
      if (arr.length >= 5) return prev; // 5 maximum
      return { ...prev, interests: [...arr, value] };
    });
  }

  function choosePlan(nextPlanKey: PlanKey) {
    setSelectedPlanKey(nextPlanKey);
    setSubmitError(null);

    const nextMaxDays = PLAN_DATE_LIMITS[nextPlanKey].maxDays;
    if (answers.arrival_date && answers.departure_date && countInclusiveDays(answers.arrival_date, answers.departure_date) > nextMaxDays) {
      setAnswers(prev => ({ ...prev, arrival_date: "", departure_date: "", travel_dates: "" }));
      setErrors(prev => ({
        ...prev,
        dates: `Votre nouveau plan ${PLAN_DATE_LIMITS[nextPlanKey].label} accepte ${nextMaxDays} jours maximum. Merci de choisir une nouvelle période.`,
      }));
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("plan", nextPlanKey);
    window.history.replaceState(null, "", `?${params.toString()}`);

    window.posthog?.capture("plan_selected", { plan: nextPlanKey, source: "questionnaire" });
  }

  function updateTravelDates(startDate: string, endDate: string) {
    setAnswers(prev => ({
      ...prev,
      arrival_date: startDate,
      departure_date: endDate,
      travel_dates: formatTravelDates(startDate, endDate),
    }));
    if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
  }

  /* ── NAVIGATION ── */

  function scrollToError(fieldId: string) {
    setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function goNext() {
    if (step === 1) {
      const nextErrors: { destination?: string; dates?: string } = {};
      if (!answers.destination.trim()) nextErrors.destination = "Veuillez indiquer votre destination.";
      if (!answers.arrival_date) nextErrors.dates = "Veuillez sélectionner au moins une date de voyage.";
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        if (nextErrors.destination) scrollToError("field-destination");
        else if (nextErrors.dates) scrollToError("field-dates");
        return;
      }
      setErrors({});
    }
    setStep(s => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrev() {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ── CART ── */

  function buildCartItemInput(planKey: PlanKey, selectedPlan: typeof PLANS[PlanKey]): CartItemInput {
    return {
      planId: planKey,
      planLabel: CART_PLANS[planKey].label,
      price: selectedPlan.priceN * 100,
      destination: answers.destination.trim(),
      dates: answers.travel_dates || formatTravelDates(answers.arrival_date, answers.departure_date),
      criteria: { ...answers },
    };
  }

  function handleAddToCart() {
    setTermsError(null);

    if (!selectedPlanKey || !plan) {
      setSubmitError("Veuillez choisir votre forfait avant d’ajouter au panier.");
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!answers.user_email.trim() || !answers.user_email.includes("@")) {
      setErrors({ email: "Veuillez entrer une adresse courriel valide." });
      scrollToError("field-email");
      return;
    }
    if (!answers.destination.trim()) {
      setErrors({ destination: "Veuillez indiquer votre destination." });
      setStep(1);
      setTimeout(() => scrollToError("field-destination"), 100);
      return;
    }
    if (!answers.arrival_date) {
      setErrors({ dates: "Veuillez sélectionner au moins une date de voyage." });
      setStep(1);
      setTimeout(() => scrollToError("field-dates"), 100);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    window.posthog?.capture("questionnaire_added_to_cart", {
      plan: selectedPlanKey,
      destination: answers.destination,
      traveler_type: answers.traveler_type,
      mode: isEditingCartItem ? "update" : "add",
    });

    const cartInput = buildCartItemInput(selectedPlanKey, plan);
    const updatedItem = editItemId ? updateCartItem(editItemId, cartInput) : null;

    if (editItemId && updatedItem) {
      router.push("/cart");
      return;
    }

    if (editItemId && !updatedItem) {
      setSubmitError("Cet article n’existe plus. Ajoutez-le à nouveau au panier.");
      setSubmitting(false);
      return;
    }

    addCartItem(cartInput);
    setCartNotice("✅ Ajouté au panier ! Continuer mes achats ou voir le panier");
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ── CONDITIONAL DISPLAY ── */

  const showSports = answers.interests.some(i => ["adventure", "water_sports", "hiking"].includes(i));

  /* ── STEP LABELS ── */

  const STEP_LABELS = ["Votre voyage", "Vos préférences", "Finaliser"];

  /* ── RECAP HELPERS ── */

  function labelFor(opts: Opt[], id: string) {
    return opts.find(o => o.id === id)?.label ?? id;
  }

  function labelsFor(opts: Opt[], ids: string[]) {
    return ids.map(id => opts.find(o => o.id === id)?.label ?? id).join(", ");
  }

  const tripDuration = (() => {
    if (answers.arrival_date && answers.departure_date) {
      const days = countInclusiveDays(answers.arrival_date, answers.departure_date);
      if (days > 0) return `${days} jour${days > 1 ? "s" : ""} sélectionné${days > 1 ? "s" : ""}`;
    }
    return plan?.duration ?? "durée à choisir";
  })();

  /* ── RENDER ── */

  return (
    <div
      className="min-h-screen bg-[#fdf8f0]"
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#e8e0d4] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <Link
              href="/"
              className="font-bold text-[#425B48] text-base shrink-0"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              TravelGuide AI
            </Link>
            <LangToggle />
            <div className="flex items-center gap-2 bg-[#425B48]/8 border border-[#425B48]/15 rounded-full px-3 py-1.5 text-xs font-semibold text-[#425B48]">
              <span>✈️</span>
              {plan ? (
                <>
                  <span className="hidden sm:inline">{plan.name} — {plan.duration} — </span>
                  <span className="text-[#c9a84c]">{plan.price}</span>
                </>
              ) : (
                <span>{isEditingCartItem ? "Modification du panier" : "Choisissez votre forfait"}</span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done  ? "bg-[#425B48] text-white" :
                        active ? "bg-[#c9a84c] text-white shadow-md" :
                        "bg-[#e2e8f0] text-[#94a3b8]"
                      }`}
                    >
                      {done ? "✓" : n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${active ? "text-[#425B48]" : "text-[#94a3b8]"}`}>
                      {label}
                    </span>
                  </div>
                  {n < 3 && (
                    <div className="flex-1 h-0.5 mx-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className={`h-full bg-[#425B48] transition-all duration-300 ${done ? "w-full" : "w-0"}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {cartNotice && (
          <div className="rounded-2xl border border-[#c9a84c]/40 bg-white px-5 py-4 shadow-sm">
            <p className="font-bold text-[#425B48]">{cartNotice}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/#pricing" className="rounded-full border border-[#425B48]/15 px-4 py-2 text-[#425B48] hover:border-[#c9a84c]">
                Continuer
              </Link>
              <Link href="/cart" className="rounded-full bg-[#c9a84c] px-4 py-2 text-white hover:bg-[#b8962e]">
                Voir le panier
              </Link>
            </div>
          </div>
        )}

        <PlanSelector selectedPlanKey={selectedPlanKey} onSelect={choosePlan} />

        {/* ═══════════════════════════════════════
            STEP 1 — VOTRE VOYAGE
        ═══════════════════════════════════════ */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#425B48] mb-1"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Votre voyage ✈️
              </h1>
              <p className="text-[#64748b] text-sm">Dites-nous où et comment vous voulez voyager.</p>
            </div>

            {/* Destination */}
            <div id="field-destination">
            <SectionCard icon="📍" title="Destination">
              <QLabel required>Où souhaitez-vous aller ?</QLabel>
              <input
                type="text"
                list="destinations-list"
                value={answers.destination}
                onChange={e => {
                  setAnswers(prev => ({ ...prev, destination: e.target.value }));
                  if (errors.destination) setErrors({});
                }}
                placeholder="Ville, pays ou région… p. ex. Tokyo, Japon"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white transition-colors ${errors.destination ? "border-red-400" : "border-[#e2e8f0] focus:border-[#c9a84c]"}`}
              />
              <datalist id="destinations-list">
                {DESTINATIONS.map(d => <option key={d} value={d} />)}
              </datalist>
              <p className="text-xs text-[#94a3b8] mt-1.5">💡 Suggestions disponibles — vérifiez l&apos;orthographe avant de continuer.</p>
              {errors.destination && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.destination}</p>}

              <div id="field-dates">
              <TravelDateCalendar
                planKey={selectedPlanKey}
                startDate={answers.arrival_date}
                endDate={answers.departure_date}
                onChange={updateTravelDates}
              />
              {errors.dates && <p className="text-xs font-semibold text-red-500 mt-2">{errors.dates}</p>}
              </div>
            </SectionCard>
            </div>

            {/* Rythme & Style */}
            <SectionCard icon="🏃" title="Rythme & manière de voyager">
              <div className="space-y-5">
                <div>
                  <QLabel>Vitesse de voyage</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_SPEED.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.travel_speed === o.id} onClick={() => radio("travel_speed", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel>Avec qui voyagez-vous ?</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {TRAVELER_TYPE.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.traveler_type === o.id} onClick={() => radio("traveler_type", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel>Combien de voyageurs ?</QLabel>
                  <div className="space-y-2">
                    <Stepper
                      label="🧑 Adultes"
                      sublabel="18 ans et plus"
                      value={answers.traveler_adults}
                      min={1}
                      max={20}
                      onChange={v => setAnswers(prev => ({ ...prev, traveler_adults: v }))}
                    />
                    <Stepper
                      label="👶 Enfants"
                      sublabel="Moins de 18 ans"
                      value={answers.traveler_children}
                      min={0}
                      max={10}
                      onChange={v => setAnswers(prev => ({ ...prev, traveler_children: v }))}
                    />
                  </div>
                  {answers.traveler_children > 0 && (
                    <p className="mt-2 rounded-xl border border-[#c9a84c]/30 bg-[#fffbf0] px-3 py-2 text-xs text-[#9a7629]">
                      💡 Mentionnez les âges des enfants dans les notes libres si besoin d&apos;activités adaptées.
                    </p>
                  )}
                </div>

                <div>
                  <QLabel>Rythme d&apos;activités</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITY_PACE.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.activity_pace === o.id} onClick={() => radio("activity_pace", o.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ═══════════════════════════════════════
            STEP 2 — VOS PRÉFÉRENCES
        ═══════════════════════════════════════ */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#425B48] mb-1"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Vos préférences 🎯
              </h1>
              <p className="text-[#64748b] text-sm">Personnalisez votre style de voyage en détail.</p>
            </div>

            {/* Dépenses */}
            <SectionCard icon="💰" title="Dépenses & finances">
              <div className="space-y-5">
                <div>
                  <QLabel>Enveloppe globale</QLabel>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {BUDGET_OPTS.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.budget === o.id} onClick={() => radio("budget", o.id)} />
                    ))}
                  </div>
                  <QLabel hint="(optionnel)">Budget total approximatif pour ce voyage</QLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      value={answers.budget_amount}
                      onChange={e => setAnswers(prev => ({ ...prev, budget_amount: e.target.value }))}
                      placeholder="ex. 1500"
                      className="w-36 border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"
                    />
                    <span className="text-sm font-semibold text-[#94a3b8]">€</span>
                    <span className="text-xs text-[#94a3b8]">pour tout le voyage</span>
                  </div>
                </div>

                <div>
                  <QLabel hint="(plusieurs choix)">Type d&apos;hébergement</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {ACCOMMODATION.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.accommodations.includes(o.id)} onClick={() => toggle("accommodations", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel hint="(plusieurs choix)">Transport sur place</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {TRANSPORT.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.transport.includes(o.id)} onClick={() => toggle("transport", o.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Intérêts */}
            <SectionCard icon="🎯" title="Intérêts & passions">
              <div className="space-y-5">
                <div>
                  <QLabel hint={`(5 maximum — ${answers.interests.length}/5 sélectionnés)`}>Activités principales</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(o => (
                      <Pill
                        key={o.id} emoji={o.emoji} label={o.label}
                        selected={answers.interests.includes(o.id)}
                        disabled={!answers.interests.includes(o.id) && answers.interests.length >= 5}
                        onClick={() => toggleInterest(o.id)}
                      />
                    ))}
                  </div>
                </div>

                {showSports && (
                  <div>
                    <QLabel hint="(plusieurs choix)">Sports & aventure</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {SPORTS.map(o => (
                        <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.sports.includes(o.id)} onClick={() => toggle("sports", o.id)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Destination préférences */}
            <SectionCard icon="🌍" title="Paysage & climat">
              <div className="space-y-5">
                <div>
                  <QLabel hint="(plusieurs choix)">Type de paysage préféré</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {LANDSCAPE.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.landscape.includes(o.id)} onClick={() => toggle("landscape", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel>Climat préféré</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {CLIMATE.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.climate === o.id} onClick={() => radio("climate", o.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Social */}
            <SectionCard icon="👥" title="Interaction sociale">
              <div className="space-y-5">
                <div>
                  <QLabel>Sociabilité</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {SOCIABILITY.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.sociability === o.id} onClick={() => radio("sociability", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel hint="(plusieurs choix)">Ambiance recherchée</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {VIBE.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.vibe.includes(o.id)} onClick={() => toggle("vibe", o.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Logistique */}
            <SectionCard icon="🏢" title="Logistique & confort">
              <div className="space-y-5">
                <div>
                  <QLabel>Niveau de confort</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {COMFORT.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.comfort_level === o.id} onClick={() => radio("comfort_level", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel>Connectivité</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {CONNECTIVITY.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.connectivity === o.id} onClick={() => radio("connectivity", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel hint="(optionnel, plusieurs choix)">Accessibilité</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {ACCESSIBILITY.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.accessibility.includes(o.id)} onClick={() => toggle("accessibility", o.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Valeurs */}
            <SectionCard icon="🌱" title="Valeurs & engagement">
              <div className="space-y-5">
                <div>
                  <QLabel>Tourisme responsable</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {ECO.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.eco_tourism === o.id} onClick={() => radio("eco_tourism", o.id)} />
                    ))}
                  </div>
                </div>

                <div>
                  <QLabel>Authenticité</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {AUTHENTICITY.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.authenticity === o.id} onClick={() => radio("authenticity", o.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ═══════════════════════════════════════
            STEP 3 — FINALISER
        ═══════════════════════════════════════ */}
        {step === 3 && (
          <>
            <div className="mb-6">
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#425B48] mb-1"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Finaliser votre guide ✨
              </h1>
              <p className="text-[#64748b] text-sm">Quelques dernières infos, puis vous payez et recevez votre guide.</p>
            </div>

            {/* Infos pratiques */}
            <SectionCard icon="✨" title="Informations pratiques">
              <div className="space-y-5">
                <div>
                  <QLabel hint="(optionnel, plusieurs choix)">Restrictions & besoins alimentaires</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {DIET.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.diet.includes(o.id)} onClick={() => toggle("diet", o.id)} />
                    ))}
                  </div>
                  {answers.diet.includes("allergies") && (
                    <div className="mt-3">
                      <QLabel required>Précisez vos allergies alimentaires</QLabel>
                      <input
                        type="text"
                        value={answers.allergy_details}
                        onChange={e => setAnswers(prev => ({ ...prev, allergy_details: e.target.value }))}
                        placeholder="ex. arachides, fruits de mer, gluten sévère, noix…"
                        className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <QLabel>Photos & lieux photogéniques</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {INSTAGRAM.map(o => (
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.instagram === o.id} onClick={() => radio("instagram", o.id)} />
                    ))}
                  </div>
                </div>

                <div id="field-email">
                  <QLabel required>📧 Adresse de réception du guide</QLabel>
                  <input
                    type="email"
                    value={answers.user_email}
                    onChange={e => {
                      setAnswers(prev => ({ ...prev, user_email: e.target.value }));
                      if (errors.email) setErrors({});
                    }}
                    placeholder="votre@courriel.com"
                    className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"
                  />
                  <p className="text-xs text-[#94a3b8] mt-1">Votre guide PDF sera envoyé à cette adresse.</p>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <QLabel hint="(optionnel)">📝 Notes libres</QLabel>
                  <textarea
                    value={answers.notes}
                    onChange={e => {
                      if (e.target.value.length <= 500) setAnswers(prev => ({ ...prev, notes: e.target.value }));
                    }}
                    rows={3}
                    placeholder="Lieux incontournables, événements spéciaux, demandes particulières…"
                    className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white resize-none transition-colors"
                  />
                  <p className="text-xs text-[#94a3b8] text-right mt-1">{answers.notes.length}/500</p>
                </div>
              </div>
            </SectionCard>

            {/* ── RECAP ── */}
            <div className="bg-[#425B48] text-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>✈️</span>
                <span>{isEditingCartItem ? "Mettre à jour ce guide" : "Votre guide TravelGuide AI"}</span>
              </h3>

              <div className="space-y-2.5 text-sm">
                {answers.destination && (
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">📍</span>
                    <span><strong>{answers.destination}</strong></span>
                  </div>
                )}
                {(answers.arrival_date || answers.departure_date) && (
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">📅</span>
                    <span>
                      {answers.arrival_date && formatDateFr(answers.arrival_date)}
                      {answers.arrival_date && answers.departure_date && answers.departure_date !== answers.arrival_date && " → "}
                      {answers.departure_date && answers.departure_date !== answers.arrival_date && formatDateFr(answers.departure_date)}
                      {" "}
                      <span className="text-white/60">({tripDuration})</span>
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="w-5 shrink-0">🗂️</span>
                  <span>Forfait : {plan ? <><strong>{plan.name}</strong> — <span className="text-[#c9a84c]">{plan.price}</span></> : <strong>à choisir</strong>}</span>
                </div>
                {answers.traveler_type && (
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">👤</span>
                    <span>
                      {labelFor(TRAVELER_TYPE, answers.traveler_type)}
                      {" — "}
                      {answers.traveler_adults} adulte{answers.traveler_adults > 1 ? "s" : ""}
                      {answers.traveler_children > 0 && `, ${answers.traveler_children} enfant${answers.traveler_children > 1 ? "s" : ""}`}
                    </span>
                  </div>
                )}
                {answers.budget && (
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">💰</span>
                    <span>Enveloppe : {labelFor(BUDGET_OPTS, answers.budget)}</span>
                  </div>
                )}
                {answers.interests.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">🎯</span>
                    <span className="text-white/80">{labelsFor(INTERESTS, answers.interests)}</span>
                  </div>
                )}
                {answers.diet.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">🍽️</span>
                    <span className="text-white/80">{labelsFor(DIET, answers.diet)}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-4 text-left shadow-[0_10px_30px_rgba(120,80,0,0.12)]">
                <p className="text-sm font-bold text-amber-950">⚠️ {legalCopy.noticeTitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-amber-900/90">{legalCopy.noticeBody}</p>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-xs leading-relaxed text-white/85 transition-colors hover:bg-white/15">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    if (event.target.checked) setTermsError(null);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/40 accent-[#c9a84c]"
                />
                <span>
                  {legalCopy.termsPrefix}{" "}
                  <Link href="/cgv" className="font-semibold text-white underline underline-offset-2">
                    {legalCopy.termsLabel}
                  </Link>{" "}
                  {legalCopy.termsJoin}{" "}
                  <Link href="/privacy" className="font-semibold text-white underline underline-offset-2">
                    {legalCopy.privacyLabel}
                  </Link>
                  . {legalCopy.termsSuffix}
                </span>
              </label>

              {termsError && (
                <p className="mt-2 text-center text-xs font-semibold text-red-300">{termsError}</p>
              )}

              <div className="border-t border-white/20 mt-4 pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-white/30 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-all text-sm"
                >
                  Revoir mes réponses
                </button>
                <div className="relative flex-1 sm:flex-[2]">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={submitting}
                    className="w-full bg-[#c9a84c] hover:bg-[#b8962e] disabled:bg-[#94a3b8] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all enabled:hover:scale-[1.02] shadow-lg text-sm"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enregistrement…
                      </span>
                    ) : (
                      isEditingCartItem ? "Mettre à jour le panier →" : plan ? `${legalCopy.paymentButton} →` : "Choisir un forfait"
                    )}
                  </button>

                </div>
              </div>

              {submitError && (
                <p className="text-red-300 text-xs mt-3 text-center">{submitError}</p>
              )}
            </div>

            <p className="text-center text-xs text-[#94a3b8] -mt-1">
Ajoutez plusieurs guides au panier, puis payez en une seule transaction sécurisée.
            </p>
          </>
        )}

        {/* ── NAVIGATION BUTTONS ── */}
        <div className="flex items-center justify-between pt-4 pb-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={goPrev}
              className="flex items-center gap-2 text-[#425B48] font-semibold text-sm hover:text-[#c9a84c] transition-colors"
            >
              ← Précédent
            </button>
          ) : (
            <div />
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={goNext}
              className="bg-[#425B48] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#344a39] transition-all hover:scale-[1.02] shadow-md text-sm"
            >
              Suivant →
            </button>
          )}
        </div>
      </main>

      <footer className="border-t border-[#e8e0d4] py-6 mt-4">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs text-[#94a3b8]">© 2026 TravelGuide AI — Guides de voyage personnalisés par IA</p>
        </div>
      </footer>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center">
          <div className="text-5xl animate-bounce">✈️</div>
        </div>
      }
    >
      <QuestionnaireContent />
    </Suspense>
  );
}
