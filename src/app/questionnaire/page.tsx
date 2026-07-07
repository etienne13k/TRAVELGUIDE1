"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LangToggle from "@/components/LangToggle";
import { addCartItem, CART_PLANS, getCartItem, loadCart, updateCartItem, type CartItemInput } from "@/lib/cart";

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
  "7j":    { name: "Guide Complet",  duration: "7 jours",  oldPrice: "9€",  price: "6€",  priceN: 6  },
  "14j":   { name: "Guide Immersif", duration: "14 jours", oldPrice: "15€", price: "10€", priceN: 10 },
  "1mois": { name: "Guide Évasion",  duration: "1 mois",   oldPrice: "22€", price: "16€", priceN: 16 },
};


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
  noticeTitle: string; noticeBody: string; termsPrefix: string; termsLabel: string;
  termsJoin: string; privacyLabel: string; termsSuffix: string; error: string; paymentButton: string;
}> = {
  fr: {
    noticeTitle: "Information importante",
    noticeBody: "Les horaires et jours d'ouverture des monuments et lieux recommandés dans votre guide sont fournis à titre indicatif. TravelGuide AI ne peut être tenu responsable en cas de fermeture exceptionnelle, de modification d'horaires ou d'événements imprévus affectant l'accès aux lieux mentionnés. Nous vous recommandons de vérifier les informations officielles avant chaque visite.",
    termsPrefix: "J'ai lu et j'accepte les",
    termsLabel: "Conditions Générales de Vente",
    termsJoin: "ainsi que la",
    privacyLabel: "Politique de confidentialité",
    termsSuffix: "Je comprends que les informations fournies dans le guide sont indicatives et non contractuelles.",
    error: "Veuillez accepter les conditions générales de vente pour continuer.",
    paymentButton: "Ajouter au panier",
  },
  en: {
    noticeTitle: "Important notice",
    noticeBody: "Opening hours and schedules listed in your guide are provided for informational purposes only. TravelGuide AI cannot be held responsible for unexpected closures, schedule changes, or any unforeseen events. We recommend checking official sources before each visit.",
    termsPrefix: "I have read and agree to the",
    termsLabel: "Terms & Conditions",
    termsJoin: "and",
    privacyLabel: "Privacy Policy",
    termsSuffix: "I understand that the information provided in the guide is indicative and non-contractual.",
    error: "Please accept the terms and conditions to continue.",
    paymentButton: "Add to cart",
  },
};

/* ──────────────────────────────────────────────────────────
   OPTION DEFINITIONS — no emojis
────────────────────────────────────────────────────────── */

type Opt = { id: string; label: string };

const TRAVELER_TYPE: Opt[] = [
  { id: "solo",    label: "En solo" },
  { id: "couple",  label: "En couple" },
  { id: "family",  label: "Famille avec enfants" },
  { id: "friends", label: "Groupe d'amis" },
];

const ACTIVITY_PACE: Opt[] = [
  { id: "packed",      label: "Intense — plusieurs activités par jour" },
  { id: "relaxed",     label: "Détendu — 1 à 2 activités par jour" },
  { id: "ultra_chill", label: "Libre — sans programme défini" },
];

const BUDGET_OPTS: Opt[] = [
  { id: "backpacker", label: "Petit budget / sac à dos" },
  { id: "comfort",    label: "Confort — milieu de gamme" },
  { id: "luxury",     label: "Haut de gamme" },
];

const ACCOMMODATION: Opt[] = [
  { id: "hostel",    label: "Auberge de jeunesse" },
  { id: "airbnb",    label: "Appartement / Airbnb" },
  { id: "hotel_3_4", label: "Hôtel 3-4 étoiles" },
  { id: "boutique",  label: "Boutique hôtel" },
  { id: "resort",    label: "Complexe tout compris" },
  { id: "camping",   label: "Camping / plein air" },
];

const TRANSPORT: Opt[] = [
  { id: "public",  label: "Transports en commun" },
  { id: "walking", label: "À pied ou à vélo" },
  { id: "rental",  label: "Voiture de location" },
  { id: "taxi",    label: "Taxi / VTC" },
];

const INTERESTS: Opt[] = [
  { id: "culture",      label: "Culture et histoire" },
  { id: "nature",       label: "Nature et plein air" },
  { id: "adventure",    label: "Aventure et sport" },
  { id: "gastronomy",   label: "Gastronomie" },
  { id: "shopping",     label: "Shopping et marchés" },
  { id: "nightlife",    label: "Vie nocturne" },
  { id: "art",          label: "Art et musées" },
  { id: "photography",  label: "Photographie" },
  { id: "architecture", label: "Architecture" },
  { id: "sport",        label: "Sport et activités" },
];

const SPORTS: Opt[] = [
  { id: "hiking",        label: "Randonnée" },
  { id: "climbing",      label: "Escalade" },
  { id: "diving",        label: "Plongée" },
  { id: "surf",          label: "Surf" },
  { id: "ski",           label: "Ski / snowboard" },
  { id: "yoga",          label: "Yoga / méditation" },
  { id: "mountain_bike", label: "VTT" },
  { id: "paragliding",   label: "Parapente" },
  { id: "kayak",         label: "Kayak / canoë" },
];

const LANDSCAPE: Opt[] = [
  { id: "beach",       label: "Plage et mer" },
  { id: "mountain",    label: "Montagne" },
  { id: "city",        label: "Ville et urbain" },
  { id: "desert",      label: "Désert" },
  { id: "jungle",      label: "Jungle et forêt tropicale" },
  { id: "countryside", label: "Campagne et vignobles" },
  { id: "island",      label: "Île isolée" },
];

const CLIMATE: Opt[] = [
  { id: "warm",      label: "Chaud et ensoleillé" },
  { id: "temperate", label: "Tempéré / doux" },
  { id: "cold",      label: "Froid / hiver" },
  { id: "any",       label: "Peu importe" },
];

const AUTHENTICITY: Opt[] = [
  { id: "off_beaten",    label: "Hors des sentiers battus" },
  { id: "mixed",         label: "Équilibre classique / local" },
  { id: "tourist_spots", label: "Sites touristiques incontournables" },
];

const TRIP_VIBE: Opt[] = [
  { id: "rest",      label: "Repos et ressourcement" },
  { id: "discovery", label: "Découverte et culture" },
  { id: "adventure", label: "Aventure et adrénaline" },
  { id: "party",     label: "Fête et rencontres" },
];

const TRIP_TYPE: Opt[] = [
  { id: "one_place",  label: "Un seul lieu — immersion totale" },
  { id: "road_trip",  label: "Road trip — plusieurs étapes" },
];

const SCOPE_TYPE: Opt[] = [
  { id: "city",    label: "Visite de la ville / alentours" },
  { id: "country", label: "Tour du pays / road trip" },
];

/* ──────────────────────────────────────────────────────────
   COUNTRIES LIST (FR) — 195 États de l'ONU
────────────────────────────────────────────────────────── */

const COUNTRIES: string[] = [
  "Afghanistan","Afrique du Sud","Albanie","Algérie","Allemagne","Andorre","Angola","Antigua-et-Barbuda",
  "Arabie Saoudite","Argentine","Arménie","Australie","Autriche","Azerbaïdjan",
  "Bahamas","Bahreïn","Bangladesh","Barbade","Belgique","Belize","Bénin","Bhoutan","Biélorussie",
  "Birmanie (Myanmar)","Bolivie","Bosnie-Herzégovine","Botswana","Brésil","Brunéi","Bulgarie","Burkina Faso","Burundi",
  "Cabo Verde","Cambodge","Cameroun","Canada","République centrafricaine","Chili","Chine","Chypre","Colombie",
  "Comores","Congo","Corée du Nord","Corée du Sud","Costa Rica","Côte d'Ivoire","Croatie","Cuba",
  "Danemark","Djibouti","Dominique","République dominicaine",
  "Équateur","Égypte","Émirats arabes unis","Érythrée","Espagne","Estonie","Eswatini","Éthiopie",
  "Fidji","Finlande","France",
  "Gabon","Gambie","Géorgie","Ghana","Grèce","Grenade","Guatemala","Guinée","Guinée-Bissau","Guinée équatoriale","Guyana",
  "Haïti","Honduras","Hongrie",
  "Îles Marshall","Îles Salomon","Inde","Indonésie","Irak","Iran","Irlande","Islande","Israël","Italie",
  "Jamaïque","Japon","Jordanie",
  "Kazakhstan","Kenya","Kirghizstan","Kiribati","Kosovo","Koweït",
  "Laos","Lesotho","Lettonie","Liban","Libéria","Libye","Liechtenstein","Lituanie","Luxembourg",
  "Macédoine du Nord","Madagascar","Malaisie","Malawi","Maldives","Mali","Malte","Maroc","Maurice","Mauritanie",
  "Mexique","Micronésie","Moldova","Monaco","Mongolie","Monténégro","Mozambique",
  "Namibie","Nauru","Népal","Nicaragua","Niger","Nigéria","Norvège","Nouvelle-Zélande",
  "Oman","Ouganda","Ouzbékistan",
  "Pakistan","Palaos","Palestine","Panama","Papouasie-Nouvelle-Guinée","Paraguay","Pays-Bas","Pérou",
  "Philippines","Pologne","Portugal",
  "Qatar",
  "Roumanie","Royaume-Uni","Russie","Rwanda",
  "Saint-Kitts-et-Nevis","Sainte-Lucie","Saint-Marin","Saint-Vincent-et-les-Grenadines","Salvador",
  "Samoa","São Tomé-et-Príncipe","Sénégal","Serbie","Seychelles","Sierra Leone","Singapour","Slovaquie",
  "Slovénie","Somalie","Soudan","Soudan du Sud","Sri Lanka","Suède","Suisse","Suriname","Syrie",
  "Tadjikistan","Tanzanie","Tchad","Thaïlande","Timor-Leste","Togo","Tonga","Trinité-et-Tobago","Tunisie",
  "Turkménistan","Turquie","Tuvalu",
  "Ukraine","Uruguay",
  "Vanuatu","Vatican","Venezuela","Viêt Nam",
  "Yémen",
  "Zambie","Zimbabwe",
];

const COUNTRY_ZONES: Opt[] = [
  { id: "nord",  label: "Nord" },
  { id: "sud",   label: "Sud" },
  { id: "est",   label: "Est" },
  { id: "ouest", label: "Ouest" },
  { id: "tout",  label: "Tout le pays" },
];

const LANGUAGE_SPOKEN: Opt[] = [
  { id: "fr",        label: "Français" },
  { id: "en",        label: "Anglais" },
  { id: "es",        label: "Espagnol" },
  { id: "it",        label: "Italien" },
  { id: "de",        label: "Allemand" },
  { id: "pt",        label: "Portugais" },
  { id: "ar",        label: "Arabe" },
  { id: "zh",        label: "Mandarin / Chinois" },
  { id: "ja",        label: "Japonais" },
  { id: "ru",        label: "Russe" },
  { id: "translate", label: "Traducteur / application" },
];

const DIET: Opt[] = [
  { id: "vegetarian",   label: "Végétarien" },
  { id: "vegan",        label: "Végan" },
  { id: "pescatarian",  label: "Pescatarien" },
  { id: "gluten_free",  label: "Sans gluten" },
  { id: "lactose_free", label: "Sans lactose" },
  { id: "halal",        label: "Halal" },
  { id: "kosher",       label: "Casher" },
  { id: "allergies",    label: "Allergies alimentaires" },
  { id: "none",         label: "Aucune restriction" },
];

/* ──────────────────────────────────────────────────────────
   TYPES
────────────────────────────────────────────────────────── */

interface Answers {
  destination: string;
  scope_type: string;
  country_zones: string[];
  nearby_cities: string;
  // Location fields
  departure_city: string;
  destination_arrival_city: string;
  arrival_city_country: string;
  // Dates
  arrival_date: string;
  departure_date: string;
  travel_dates: string;
  dates_flexible: string;
  // Group
  traveler_type: string;
  traveler_adults: number;
  traveler_children: number;
  children_ages: string[];
  // Budget
  budget: string;
  budget_amount: string;
  budget_currency: string;
  budget_scope: string;
  // Style
  activity_pace: string;
  authenticity: string;
  trip_type: string;
  trip_vibe: string;
  // Accommodation & transport
  accommodations: string[];
  transport: string[];
  neighborhood_vibe: string;
  // Interests
  interests: string[];
  sports: string[];
  landscape: string[];
  climate: string;
  // Preferences
  non_negotiables: string;
  things_to_avoid: string;
  already_visited: string;
  diet: string[];
  allergy_details: string;
  language_spoken: string[];
  special_occasion: string;
  // Final
  user_email: string;
  notes: string;
  language: Lang;
}

const EMPTY: Answers = {
  destination: "", scope_type: "", country_zones: [], nearby_cities: "",
  departure_city: "", destination_arrival_city: "", arrival_city_country: "",
  arrival_date: "", departure_date: "", travel_dates: "", dates_flexible: "",
  traveler_type: "", traveler_adults: 1, traveler_children: 0, children_ages: [],
  budget: "", budget_amount: "", budget_currency: "€", budget_scope: "",
  activity_pace: "", authenticity: "", trip_type: "", trip_vibe: "",
  accommodations: [], transport: [], neighborhood_vibe: "",
  interests: [], sports: [], landscape: [], climate: "",
  non_negotiables: "", things_to_avoid: "", already_visited: "",
  diet: [], allergy_details: "", language_spoken: [], special_occasion: "",
  user_email: "", notes: "", language: "fr",
};

/* ──────────────────────────────────────────────────────────
   EMAIL VALIDATION
────────────────────────────────────────────────────────── */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ──────────────────────────────────────────────────────────
   UI PRIMITIVES — dark theme
────────────────────────────────────────────────────────── */

function Pill({ label, selected, onClick, disabled }: {
  label: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium",
        "transition-all duration-150 select-none cursor-pointer",
        selected
          ? "border-[#c9a84c] bg-[#c9a84c] text-[#0e1310] font-semibold shadow-[0_2px_12px_rgba(201,168,76,0.35)]"
          : disabled
          ? "border-[#2a3527] bg-[#141c12] text-[#3a5037] cursor-not-allowed opacity-50"
          : "border-[#2a3527] bg-[#1a2218] text-[#9ab896] hover:border-[#c9a84c]/60 hover:text-[#d8e3d5]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#161c14] rounded-xl border border-[#232c20] p-6">
      <h3 className="text-xs font-bold text-[#c9a84c] uppercase tracking-[0.18em] mb-5">{title}</h3>
      {children}
    </div>
  );
}

function Stepper({ value, min, max, onChange, label, sublabel, disabled }: {
  value: number; min: number; max: number; onChange: (v: number) => void; label: string; sublabel?: string; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${disabled ? "border-[#1e2a1e] bg-[#111810] opacity-60" : "border-[#2a3527] bg-[#1a2218]"}`}>
      <div>
        <p className="text-sm font-semibold text-[#d8e3d5]">{label}</p>
        {sublabel && <p className="text-xs text-[#5a7856] mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a3527] text-lg font-bold text-[#9ab896] transition hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed">−</button>
        <span className="w-6 text-center text-lg font-black text-[#d8e3d5]">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a3527] text-lg font-bold text-[#9ab896] transition hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed">+</button>
      </div>
    </div>
  );
}

function QLabel({ children, hint, required }: { children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <p className="text-sm font-semibold text-[#b8cdb4] mb-3">
      {children}
      {required && <span className="text-[#c9a84c] ml-1">*</span>}
      {hint && <span className="text-[#4a6447] font-normal ml-2 text-xs">{hint}</span>}
    </p>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-400 mt-1.5 font-medium">{msg}</p>;
}

/* ──────────────────────────────────────────────────────────
   CALENDAR — dark theme
────────────────────────────────────────────────────────── */

const MONTH_NAMES = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const WEEKDAY_LABELS = ["L","M","M","J","V","S","D"];
const LAST_SELECTABLE_DATE = "2027-12-31";

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function parseLocalDate(dateKey: string): Date {
  const [y,m,d] = dateKey.split("-").map(Number);
  return new Date(y, m-1, d);
}
function compareDateKeys(a: string, b: string): number { return a.localeCompare(b); }
function addDays(date: Date, amount: number): Date {
  const d = new Date(date); d.setDate(d.getDate()+amount); return d;
}
function countInclusiveDays(start: string, end: string): number {
  return Math.floor((parseLocalDate(end).getTime()-parseLocalDate(start).getTime())/86_400_000)+1;
}
function formatDateFr(dateKey: string): string {
  return parseLocalDate(dateKey).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});
}
function formatTravelDates(s: string, e: string): string {
  if (!s && !e) return "";
  if (s && !e) return s;
  if (!s && e) return e;
  if (s === e) return s;
  return `${s} → ${e}`;
}

function getMonthCells(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const offset = (first.getDay()+6)%7;
  const firstCell = addDays(first, -offset);
  return Array.from({length:42},(_,i) => {
    const date = addDays(firstCell,i);
    return { date, key: toLocalDateKey(date), inCurrentMonth: date.getMonth()===monthDate.getMonth(), isWeekend: date.getDay()===0||date.getDay()===6 };
  });
}

function TravelDateCalendar({ planKey, startDate, endDate, onChange }: {
  planKey: PlanKey|null; startDate: string; endDate: string; onChange: (s:string,e:string)=>void;
}) {
  const todayKey = useMemo(()=>toLocalDateKey(new Date()),[]);
  const firstMonth = useMemo(()=>{const t=parseLocalDate(todayKey);return new Date(t.getFullYear(),t.getMonth(),1);},[todayKey]);
  const [visibleMonth, setVisibleMonth] = useState(firstMonth);
  const [calendarError, setCalendarError] = useState<string|null>(null);
  const [isChoosingEnd, setIsChoosingEnd] = useState(false);

  const maxDays = planKey ? PLAN_DATE_LIMITS[planKey].maxDays : 3;
  const planLabel = planKey ? PLAN_DATE_LIMITS[planKey].label : "3 jours";
  const selectedDays = startDate && endDate ? countInclusiveDays(startDate,endDate) : startDate ? 1 : 0;
  const monthCells = getMonthCells(visibleMonth);
  const curKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth()+1).padStart(2,"0")}`;
  const firstKey = `${firstMonth.getFullYear()}-${String(firstMonth.getMonth()+1).padStart(2,"0")}`;

  function moveMonth(n: number) { setVisibleMonth(p=>new Date(p.getFullYear(),p.getMonth()+n,1)); setCalendarError(null); }

  function selectDate(dateKey: string) {
    if (!planKey) { setCalendarError("Choisissez d'abord un forfait."); return; }
    if (!startDate || !isChoosingEnd || compareDateKeys(dateKey,startDate)<0) {
      onChange(dateKey,dateKey); setIsChoosingEnd(true); setCalendarError(null); return;
    }
    const next = countInclusiveDays(startDate,dateKey);
    if (next>maxDays) { setCalendarError(`Votre forfait ${planLabel} ne peut pas dépasser ${maxDays} jours.`); return; }
    onChange(startDate,dateKey); setIsChoosingEnd(false); setCalendarError(null);
  }

  return (
    <div className="mt-4 rounded-xl border border-[#2a3527] bg-[#111810] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c9a84c] mb-1">Calendrier de voyage</p>
          <p className="text-xs text-[#5a7856]">Cliquez sur une date de début, puis une date de fin.</p>
        </div>
        <div className="rounded-lg border border-[#c9a84c]/30 bg-[#1a2218] px-4 py-2 text-center shrink-0">
          <p className="text-xl font-black text-[#d8e3d5]">{selectedDays} <span className="text-[#5a7856] text-sm font-medium">/ {maxDays}</span></p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a7b21]">jours</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-[#1a2218] border border-[#2a3527] px-3 py-2 text-[#d8e3d5] mb-3">
        <button type="button" onClick={()=>moveMonth(-1)} disabled={curKey<=firstKey}
          className="rounded px-3 py-1 text-lg font-bold transition-colors enabled:hover:text-[#c9a84c] disabled:cursor-not-allowed disabled:text-[#2a3527]">←</button>
        <p className="text-sm font-bold capitalize tracking-wide">{MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</p>
        <button type="button" onClick={()=>moveMonth(1)} disabled={curKey>="2027-12"}
          className="rounded px-3 py-1 text-lg font-bold transition-colors enabled:hover:text-[#c9a84c] disabled:cursor-not-allowed disabled:text-[#2a3527]">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#4a6447] mb-2">
        {WEEKDAY_LABELS.map((w,i)=><span key={i} className={i>=5?"text-[#c9a84c]/60":undefined}>{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthCells.map(({key,date,inCurrentMonth,isWeekend})=>{
          if (!inCurrentMonth) return <div key={key} className="aspect-square"/>;
          const isPast = compareDateKeys(key,todayKey)<0;
          const isTooFar = compareDateKeys(key,LAST_SELECTABLE_DATE)>0;
          const disabled = isPast||isTooFar;
          const inRange = startDate&&endDate&&compareDateKeys(key,startDate)>=0&&compareDateKeys(key,endDate)<=0;
          const isStart = key===startDate;
          const isEnd = key===endDate&&endDate!==startDate;
          return (
            <button key={key} type="button" onClick={()=>selectDate(key)} disabled={disabled}
              className={["relative aspect-square rounded-lg text-sm font-semibold transition-all duration-100",
                disabled?"cursor-not-allowed bg-[#111810] text-[#2a3527]":
                inRange?"bg-[#c9a84c] text-[#0e1310] font-bold":
                isWeekend?"bg-[#1a2218] text-[#c9a84c]/70 hover:bg-[#c9a84c] hover:text-[#0e1310]":
                "bg-[#1a2218] text-[#9ab896] hover:bg-[#c9a84c] hover:text-[#0e1310]",
                (isStart||isEnd)&&!disabled?"ring-1 ring-[#c9a84c] ring-offset-1 ring-offset-[#111810]":"",
              ].join(" ")}
            >{date.getDate()}</button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-[#3a5037]">Disponible jusqu&apos;au 31 décembre 2027</p>
        {(startDate||endDate)&&(
          <button type="button" onClick={()=>{onChange("","");setIsChoosingEnd(false);setCalendarError(null);}}
            className="text-xs font-semibold text-[#5a7856] hover:text-[#c9a84c] transition-colors">
            Effacer
          </button>
        )}
      </div>
      {startDate&&(
        <div className="mt-2 rounded-lg border border-[#2a3527] bg-[#1a2218] px-4 py-2.5 text-sm text-[#d8e3d5]">
          <strong className="text-[#c9a84c]">Dates :</strong> {formatDateFr(startDate)}{endDate&&endDate!==startDate?` → ${formatDateFr(endDate)}`:""}
        </div>
      )}
      {calendarError&&<p className="mt-2 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-2 text-xs font-semibold text-red-400">{calendarError}</p>}
    </div>
  );
}

function PlanSelector({ selectedPlanKey, onSelect }: { selectedPlanKey: PlanKey|null; onSelect: (p:PlanKey)=>void }) {
  return (
    <section className="bg-[#161c14] rounded-xl border border-[#232c20] p-5 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#c9a84c] font-bold mb-1">Forfait</p>
          <h2 className="text-lg sm:text-xl font-bold text-[#d8e3d5]" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
            {selectedPlanKey ? "Forfait sélectionné" : "Choisissez votre forfait"}
          </h2>
        </div>
        <p className="text-xs text-[#4a6447]">Modifiable avant le paiement.</p>
      </div>
      <div className="-mx-5 sm:mx-0 overflow-x-auto pb-1 sm:overflow-visible">
        <div className="flex gap-3 px-5 sm:px-0 sm:grid sm:grid-cols-4 min-w-max sm:min-w-0">
          {PLAN_ORDER.map(planKey=>{
            const p = PLANS[planKey];
            const selected = selectedPlanKey===planKey;
            return (
              <button key={planKey} type="button" onClick={()=>onSelect(planKey)} aria-pressed={selected}
                className={["w-36 sm:w-auto rounded-lg border-2 p-4 text-left transition-all duration-200 shrink-0",
                  selected?"border-[#c9a84c] bg-[#1f2a1a]":"border-[#232c20] bg-[#1a2218] hover:border-[#c9a84c]/40 hover:bg-[#1f2a1a]"].join(" ")}>
                <span className="block text-xs font-bold text-[#7a9076] uppercase tracking-wider">{p.duration}</span>
                <span className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-[#3a5037] line-through">{p.oldPrice}</span>
                  <span className="text-2xl font-black text-[#c9a84c]">{p.price}</span>
                </span>
                <span className="mt-1.5 block text-xs font-medium text-[#7a9076]">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────── */

function QuestionnaireContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPlanKey = resolvePlanKey(searchParams.get("plan") ?? "");
  const initialEmail = searchParams.get("email") ?? "";
  const editItemId = searchParams.get("edit");
  const urlLang = resolveLanguage(searchParams.get("lang"));

  const [language, setLanguage] = useState<Lang>(()=>{
    if (typeof window!=="undefined"){const s=localStorage.getItem("tgai_lang");if(s==="en")return "en";}
    return urlLang;
  });
  const legalCopy = LEGAL_COPY[language];

  const [step, setStep] = useState(1);
  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanKey|null>(initialPlanKey);
  const [answers, setAnswers] = useState<Answers>(()=>({...EMPTY, user_email:initialEmail, language}));
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitError, setSubmitError] = useState<string|null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [step2Errors, setStep2Errors] = useState<Record<string,string>>({});
  const [step3Errors, setStep3Errors] = useState<Record<string,string>>({});
  const [termsError, setTermsError] = useState<string|null>(null);
  const [cartNotice, setCartNotice] = useState<string|null>(null);
  const [isEditingCartItem, setIsEditingCartItem] = useState(false);

  const plan = selectedPlanKey ? PLANS[selectedPlanKey] : null;

  useEffect(()=>{
    const handler = (e: Event)=>{
      const ev = e as CustomEvent<{lang:"fr"|"en"}>;
      setLanguage(ev.detail.lang);
      setAnswers(p=>({...p,language:ev.detail.lang}));
    };
    window.addEventListener("tgai_lang_change",handler);
    return ()=>window.removeEventListener("tgai_lang_change",handler);
  },[]);

  useEffect(()=>{
    if (!editItemId) return;
    queueMicrotask(()=>{
      const cartItem = getCartItem(editItemId);
      if (!cartItem){setSubmitError("Cet article n'est plus dans votre panier.");return;}
      setIsEditingCartItem(true);
      setSelectedPlanKey(cartItem.planId);
      setAnswers({...EMPTY,...(cartItem.criteria as Partial<Answers>),destination:cartItem.destination,travel_dates:cartItem.dates,language} as Answers);
    });
  },[editItemId,language]);

  function radio(field: keyof Answers, value: string) {
    setAnswers(p=>({...p,[field]:(p[field] as string)===value?"":value}));
  }
  function toggle(field: "accommodations"|"transport"|"interests"|"sports"|"landscape"|"diet"|"language_spoken"|"country_zones", value: string) {
    setAnswers(p=>{const arr=p[field] as string[];return{...p,[field]:arr.includes(value)?arr.filter(v=>v!==value):[...arr,value]};});
  }
  function toggleInterest(value: string) {
    setAnswers(p=>{
      const arr=p.interests;
      if (arr.includes(value)) return{...p,interests:arr.filter(v=>v!==value)};
      if (arr.length>=5) return p;
      return{...p,interests:[...arr,value]};
    });
  }

  function choosePlan(next: PlanKey) {
    setSelectedPlanKey(next);
    setSubmitError(null);
    const nextMax = PLAN_DATE_LIMITS[next].maxDays;
    if (answers.arrival_date&&answers.departure_date&&countInclusiveDays(answers.arrival_date,answers.departure_date)>nextMax) {
      setAnswers(p=>({...p,arrival_date:"",departure_date:"",travel_dates:""}));
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("plan",next);
    window.history.replaceState(null,"",`?${params.toString()}`);
  }

  function updateTravelDates(s: string, e: string) {
    setAnswers(p=>({...p,arrival_date:s,departure_date:e,travel_dates:formatTravelDates(s,e)}));
    if (errors.dates) setErrors(p=>({...p,dates:""}));
  }

  function scrollToError(id: string) {
    setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},50);
  }

  async function goNext() {
    if (step===1) {
      const nextErrors: Record<string,string> = {};
      if (!answers.destination.trim()) nextErrors.destination = "Veuillez indiquer votre destination.";
      if (!answers.departure_city.trim()) nextErrors.departure_city = "Veuillez indiquer votre ville de départ.";
      if (!answers.arrival_date) nextErrors.dates = "Veuillez sélectionner au moins une date.";
      if (!answers.dates_flexible) nextErrors.dates_flexible = "Veuillez indiquer si vos dates sont flexibles.";
      if (!answers.traveler_type) nextErrors.traveler_type = "Veuillez indiquer avec qui vous voyagez.";
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        scrollToError(`field-${Object.keys(nextErrors)[0]}`);
        return;
      }
      // AI validation for text fields
      try {
        setValidating(true);
        const toValidate = [
          { name: "destination", label: "Destination", value: answers.destination },
          { name: "departure_city", label: "Ville de départ", value: answers.departure_city },
          ...(answers.destination_arrival_city.trim() ? [{ name: "destination_arrival_city", label: "Ville d'arrivée", value: answers.destination_arrival_city }] : []),
        ];
        const res = await fetch("/api/validate-input", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ fields: toValidate }) });
        const data = await res.json() as { errors: Record<string,string> };
        if (Object.keys(data.errors).length > 0) {
          setErrors(data.errors);
          scrollToError(`field-${Object.keys(data.errors)[0]}`);
          return;
        }
      } catch { /* silently allow if API fails */ }
      finally { setValidating(false); }
      setErrors({});
    }
    if (step===2) {
      const s2: Record<string,string> = {};
      if (!answers.budget) s2.budget = "Veuillez choisir un niveau de budget.";
      if (answers.budget_amount && Number(answers.budget_amount) > 0) {
        if (!answers.budget_scope) {
          s2.budget_scope = "Précisez si ce montant est par personne ou au total.";
        } else {
          const amount = Number(answers.budget_amount);
          const adults = answers.traveler_adults || 1;
          const days = selectedPlanKey ? PLAN_DATE_LIMITS[selectedPlanKey].maxDays : 7;
          const totalAmount = answers.budget_scope === "per_person" ? amount * adults : amount;
          const perPersonPerDay = totalAmount / (adults * days);
          if (perPersonPerDay < 25) {
            s2.budget_amount = `Budget trop faible : ${Math.round(perPersonPerDay)}${answers.budget_currency}/pers/jour ne couvre pas un voyage réaliste (minimum 25${answers.budget_currency}/pers/jour). Vérifiez le montant saisi.`;
          }
        }
      } else if (!answers.budget_scope) {
        s2.budget_scope = "Précisez si votre budget est par personne ou au total.";
      }
      if (answers.accommodations.length===0) s2.accommodations = "Veuillez choisir au moins un type d'hébergement.";
      if (!answers.activity_pace) s2.activity_pace = "Veuillez choisir un rythme d'activités.";
      if (!answers.authenticity) s2.authenticity = "Veuillez choisir un style de découverte.";
      if (answers.transport.length===0) s2.transport = "Veuillez choisir au moins un moyen de transport.";
      if (answers.interests.length===0) s2.interests = "Veuillez choisir au moins un centre d'intérêt.";
      if (answers.landscape.length===0) s2.landscape = "Veuillez choisir au moins un type de paysage.";
      if (!answers.climate) s2.climate = "Veuillez choisir un type de climat.";
      if (!answers.trip_vibe) s2.trip_vibe = "Veuillez choisir une ambiance de voyage.";
      if (!answers.trip_type) s2.trip_type = "Veuillez choisir un type de voyage.";
      if (!answers.already_visited.trim()) s2.already_visited = "Indiquez les pays/villes déjà visités, ou écrivez « Aucun ».";
      if (!answers.non_negotiables.trim()) s2.non_negotiables = "Indiquez vos incontournables, ou écrivez « Aucun ».";
      if (!answers.things_to_avoid.trim()) s2.things_to_avoid = "Indiquez ce que vous souhaitez éviter, ou écrivez « Aucun ».";
      if (answers.language_spoken.length===0) s2.language_spoken = "Veuillez indiquer au moins une langue.";
      if (Object.keys(s2).length > 0) {
        setStep2Errors(s2);
        scrollToError(`s2-${Object.keys(s2)[0]}`);
        return;
      }
      // AI validation for free text fields in step 2
      try {
        setValidating(true);
        const toValidate = [
          { name: "already_visited", label: "Pays/villes déjà visités", value: answers.already_visited },
          { name: "non_negotiables", label: "Incontournables", value: answers.non_negotiables },
          { name: "things_to_avoid", label: "Choses à éviter", value: answers.things_to_avoid },
        ].filter(f => f.value.trim() && f.value.trim().toLowerCase() !== "aucun" && f.value.trim().toLowerCase() !== "none");
        if (toValidate.length > 0) {
          const res = await fetch("/api/validate-input", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ fields: toValidate }) });
          const data = await res.json() as { errors: Record<string,string> };
          if (Object.keys(data.errors).length > 0) {
            setStep2Errors(data.errors);
            scrollToError(`s2-${Object.keys(data.errors)[0]}`);
            return;
          }
        }
      } catch { /* silently allow */ }
      finally { setValidating(false); }
      setStep2Errors({});
    }
    setStep(s=>Math.min(3,s+1));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function goPrev() { setStep(s=>Math.max(1,s-1)); window.scrollTo({top:0,behavior:"smooth"}); }

  function buildCartItemInput(planKey: PlanKey, selectedPlan: typeof PLANS[PlanKey]): CartItemInput {
    return {
      planId: planKey,
      planLabel: CART_PLANS[planKey].label,
      price: selectedPlan.priceN*100,
      destination: answers.destination.trim() || "Destination à préciser",
      dates: answers.travel_dates||formatTravelDates(answers.arrival_date,answers.departure_date),
      criteria: {...answers},
    };
  }

  async function handleAddToCart() {
    setTermsError(null);
    if (!termsAccepted) { setTermsError(legalCopy.error); return; }
    if (!selectedPlanKey||!plan) { setSubmitError("Veuillez choisir votre forfait."); setStep(1); window.scrollTo({top:0,behavior:"smooth"}); return; }

    // Step 3 validation
    const s3: Record<string,string> = {};
    if (answers.diet.length===0) s3.diet = "Veuillez choisir au moins une option (y compris « Aucune restriction »).";
    if (!answers.user_email.trim() || !isValidEmail(answers.user_email)) s3.email = "Adresse e-mail invalide. Vérifiez le format (ex. nom@domaine.com).";
    if (Object.keys(s3).length > 0) {
      setStep3Errors(s3);
      const firstKey = Object.keys(s3)[0];
      scrollToError(`s3-${firstKey}`);
      return;
    }
    setStep3Errors({});

    if (!answers.destination.trim()) { setErrors({destination:"Veuillez indiquer votre destination."}); setStep(1); setTimeout(()=>scrollToError("field-destination"),100); return; }
    if (!answers.arrival_date) { setErrors({dates:"Veuillez sélectionner au moins une date."}); setStep(1); setTimeout(()=>scrollToError("field-dates"),100); return; }

    // Validate notes field with AI if filled
    if (answers.notes.trim()) {
      try {
        setSubmitting(true);
        const res = await fetch("/api/validate-input", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ fields: [{ name: "notes", label: "Notes libres", value: answers.notes }] }) });
        const data = await res.json() as { errors: Record<string,string> };
        if (data.errors.notes) {
          setStep3Errors({ notes: data.errors.notes });
          setSubmitting(false);
          scrollToError("s3-notes");
          return;
        }
      } catch { /* silently allow */ }
      finally { setSubmitting(false); }
    }

    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    const cartInput = buildCartItemInput(selectedPlanKey,plan);
    const updatedItem = editItemId ? updateCartItem(editItemId,cartInput) : null;
    if (editItemId&&updatedItem){router.push("/cart");return;}
    if (editItemId&&!updatedItem){setSubmitError("Cet article n'existe plus.");setSubmitting(false);return;}
    const existingItems = loadCart();
    addCartItem(cartInput);
    setCartNotice(existingItems.length > 0 ? "Votre nouveau guide a remplacé l'ancien article dans votre panier." : "Ajouté au panier avec succès.");
    setSubmitting(false);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  const showSports = answers.interests.some(i=>["adventure","sport"].includes(i));
  const tripDuration = (()=>{
    if (answers.arrival_date&&answers.departure_date){const d=countInclusiveDays(answers.arrival_date,answers.departure_date);if(d>0)return `${d} jour${d>1?"s":""}`;}
    return plan?.duration??"durée à choisir";
  })();

  const STEP_LABELS = ["Informations essentielles","Vos préférences","Finaliser"];

  const inputCls = (errKey: string) =>
    `w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors ${errors[errKey]?"border-red-700 focus:border-red-500":"border-[#2a3527] focus:border-[#c9a84c]"}`;

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-[#0e1310]" style={{fontFamily:"var(--font-dm-sans),system-ui,sans-serif"}}>
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-[#0a0f09]/95 backdrop-blur-md border-b border-[#1a2218]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <Link href="/" className="font-bold text-[#d8e3d5] text-base shrink-0 hover:text-[#c9a84c] transition-colors" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
              TravelGuide AI
            </Link>
            <LangToggle />
            <div className="flex items-center gap-2 border border-[#2a3527] rounded-full px-3 py-1.5 text-xs font-semibold text-[#9ab896]">
              <span className="hidden sm:inline">Guide personnalisé —</span>
              {plan ? <span className="text-[#c9a84c]">{plan.price}</span> : <span className="text-[#4a6447]">Choisissez un forfait</span>}
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label,i)=>{
              const n=i+1;const active=n===step;const done=n<step;
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done?"bg-[#c9a84c] text-[#0e1310]":active?"bg-[#425C47] text-white shadow-[0_0_12px_rgba(66,92,71,0.5)]":"bg-[#1a2218] text-[#3a5037] border border-[#2a3527]"}`}>
                      {done?"✓":n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${active?"text-[#c9a84c]":done?"text-[#7a9076]":"text-[#3a5037]"}`}>{label}</span>
                  </div>
                  {n<3&&<div className="flex-1 h-px mx-2 bg-[#1a2218] overflow-hidden"><div className={`h-full bg-[#c9a84c] transition-all duration-300 ${done?"w-full":"w-0"}`}/></div>}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {cartNotice&&(
          <div className="rounded-xl border border-[#c9a84c]/30 bg-[#1a2218] px-5 py-4">
            <p className="font-bold text-[#c9a84c] mb-3">{cartNotice}</p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/#pricing" className="rounded-lg border border-[#2a3527] px-4 py-2 text-[#9ab896] hover:border-[#c9a84c] transition-colors">Continuer</Link>
              <Link href="/cart" className="rounded-lg bg-[#c9a84c] px-4 py-2 text-[#0e1310] hover:bg-[#b8962e] transition-colors">Voir le panier</Link>
            </div>
          </div>
        )}

        <PlanSelector selectedPlanKey={selectedPlanKey} onSelect={choosePlan} />

        {/* ═══════════ STEP 1 ═══════════ */}
        {step===1&&(
          <>
            <div className="mb-1">
              <p className="text-xs font-bold text-[#c9a84c] uppercase tracking-[0.18em] mb-2">Étape 1 sur 3</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#d8e3d5] mb-1" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Votre voyage
              </h1>
              <p className="text-[#5a7856] text-sm">Indiquez votre destination, votre lieu de départ et vos dates.</p>
            </div>

            {/* Destination */}
            <div id="field-destination">
              <SectionCard title="Destination">
                <QLabel required>Où souhaitez-vous aller ?</QLabel>
                <input
                  type="text"
                  value={answers.destination}
                  onChange={e=>{setAnswers(p=>({...p,destination:e.target.value}));if(errors.destination)setErrors(p=>({...p,destination:""}));}}
                  placeholder="Ville, pays ou région — ex. Tokyo, Bali, Sicile"
                  className={inputCls("destination")}
                />
                <FieldError msg={errors.destination} />
              </SectionCard>
            </div>

            {/* Départ & arrivée */}
            <SectionCard title="Départ & arrivée">
              <div className="space-y-4">
                <div id="field-departure_city">
                  <QLabel required>Ville de départ</QLabel>
                  <input
                    type="text"
                    value={answers.departure_city}
                    onChange={e=>{setAnswers(p=>({...p,departure_city:e.target.value}));if(errors.departure_city)setErrors(p=>({...p,departure_city:""}));}}
                    placeholder="ex. Paris, Lyon, Montréal"
                    className={inputCls("departure_city")}
                  />
                  <p className="text-xs text-[#3a5037] mt-1.5">La ville depuis laquelle vous partez.</p>
                  <FieldError msg={errors.departure_city} />
                </div>
                <div id="field-destination_arrival_city">
                  <QLabel>Ville d&apos;arrivée</QLabel>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={answers.destination_arrival_city}
                      onChange={e=>{setAnswers(p=>({...p,destination_arrival_city:e.target.value}));if(errors.destination_arrival_city)setErrors(p=>({...p,destination_arrival_city:""}));}}
                      placeholder="ex. Tokyo, Bangkok, Rome"
                      className={`flex-1 border rounded-lg px-4 py-3 text-sm focus:outline-none bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors ${errors.destination_arrival_city?"border-red-700 focus:border-red-500":"border-[#2a3527] focus:border-[#c9a84c]"}`}
                    />
                    <select
                      value={answers.arrival_city_country}
                      onChange={e=>setAnswers(p=>({...p,arrival_city_country:e.target.value}))}
                      className="sm:w-48 border border-[#2a3527] rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Pays...</option>
                      {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-[#3a5037] mt-1.5">La ville et le pays par lesquels vous arrivez (aéroport principal, capitale...).</p>
                  <FieldError msg={errors.destination_arrival_city} />
                </div>
              </div>
            </SectionCard>

            {/* Type de séjour */}
            <SectionCard title="Type de séjour">
              <div className="space-y-4">
                <div>
                  <QLabel>Comment souhaitez-vous explorer ?</QLabel>
                  <select
                    value={answers.scope_type}
                    onChange={e=>setAnswers(p=>({...p,scope_type:e.target.value,country_zones:[],nearby_cities:""}))}
                    className="w-full border border-[#2a3527] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">-- Choisir un type --</option>
                    {SCOPE_TYPE.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
                {answers.scope_type==="city"&&(
                  <div>
                    <QLabel hint="(optionnel)">Villes ou sites alentour à inclure</QLabel>
                    <input
                      type="text"
                      value={answers.nearby_cities}
                      onChange={e=>setAnswers(p=>({...p,nearby_cities:e.target.value}))}
                      placeholder="ex. Nikko, Kamakura, Yokohama — villes proches de Tokyo"
                      className="w-full border border-[#2a3527] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors"
                    />
                    <p className="text-xs text-[#3a5037] mt-1.5">Si vous souhaitez inclure des excursions depuis la ville principale.</p>
                  </div>
                )}
                {answers.scope_type==="country"&&(
                  <div>
                    <QLabel hint="(plusieurs choix)">Zone(s) du pays à visiter</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {COUNTRY_ZONES.map(o=>(
                        <Pill key={o.id} label={o.label}
                          selected={answers.country_zones.includes(o.id)}
                          onClick={()=>toggle("country_zones",o.id)}/>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Dates */}
            <div id="field-dates">
              <SectionCard title="Dates du voyage">
                <TravelDateCalendar planKey={selectedPlanKey} startDate={answers.arrival_date} endDate={answers.departure_date} onChange={updateTravelDates}/>
                <FieldError msg={errors.dates} />
                <div className="mt-5" id="field-dates_flexible">
                  <QLabel required>Vos dates sont-elles flexibles ?</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {[{id:"fixed",label:"Non, dates fixes"},{id:"flexible",label:"Oui, flexibles (± quelques jours)"}].map(o=>(
                      <Pill key={o.id} label={o.label} selected={answers.dates_flexible===o.id} onClick={()=>{radio("dates_flexible",o.id);setErrors(p=>({...p,dates_flexible:""}));}}/>
                    ))}
                  </div>
                  <FieldError msg={errors.dates_flexible} />
                </div>
              </SectionCard>
            </div>

            {/* Groupe */}
            <div id="field-traveler_type">
              <SectionCard title="Votre groupe">
                <div className="space-y-5">
                  <div>
                    <QLabel required>Avec qui voyagez-vous ?</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {TRAVELER_TYPE.map(o=>(
                        <Pill key={o.id} label={o.label} selected={answers.traveler_type===o.id} onClick={()=>{
                          const newVal = answers.traveler_type === o.id ? "" : o.id;
                          setAnswers(p=>({...p, traveler_type: newVal, ...(newVal==="solo" ? {traveler_adults:1} : {})}));
                          setErrors(p=>({...p,traveler_type:""}));
                        }}/>
                      ))}
                    </div>
                    <FieldError msg={errors.traveler_type} />
                  </div>
                  <div>
                    <QLabel>Nombre de voyageurs</QLabel>
                    <div className="space-y-2">
                      <Stepper label="Adultes" sublabel="18 ans et plus" value={answers.traveler_adults} min={1} max={20} disabled={answers.traveler_type==="solo"} onChange={v=>setAnswers(p=>({...p,traveler_adults:v}))}/>
                      <Stepper label="Enfants" sublabel="Moins de 18 ans" value={answers.traveler_children} min={0} max={10}
                        onChange={v=>{
                          setAnswers(p=>{
                            const ages = [...p.children_ages];
                            while(ages.length<v) ages.push("");
                            return {...p,traveler_children:v,children_ages:ages.slice(0,v)};
                          });
                        }}/>
                    </div>
                    {answers.traveler_type==="solo"&&(
                      <p className="mt-2 text-xs text-[#5a7856] border border-[#1a2218] bg-[#111810] rounded-lg px-3 py-2">
                        Voyage solo — le nombre d&apos;adultes est fixé à 1.
                      </p>
                    )}
                    {answers.traveler_children>0&&(
                      <div className="mt-4">
                        <QLabel required>Âge des enfants</QLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from({length:answers.traveler_children},(_,i)=>(
                            <div key={i} className="flex items-center gap-2">
                              <label className="text-xs text-[#5a7856] shrink-0 w-16">Enfant {i+1}</label>
                              <input
                                type="number"
                                min="0"
                                max="17"
                                value={answers.children_ages[i]??""}
                                onChange={e=>{
                                  setAnswers(p=>{
                                    const ages=[...p.children_ages];
                                    ages[i]=e.target.value;
                                    return {...p,children_ages:ages};
                                  });
                                }}
                                placeholder="ans"
                                className="w-full border border-[#2a3527] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-[#3a5037] mt-1.5">Précisez l&apos;âge pour adapter les activités.</p>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          </>
        )}

        {/* ═══════════ STEP 2 ═══════════ */}
        {step===2&&(
          <>
            <div className="mb-1">
              <p className="text-xs font-bold text-[#c9a84c] uppercase tracking-[0.18em] mb-2">Étape 2 sur 3</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#d8e3d5] mb-1" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Vos préférences
              </h1>
              <p className="text-[#5a7856] text-sm">Personnalisez votre style de voyage.</p>
            </div>

            {/* Budget */}
            <div id="s2-budget">
              <SectionCard title="Budget">
                <div className="space-y-5">
                  <div>
                    <QLabel required>Niveau de budget</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {BUDGET_OPTS.map(o=><Pill key={o.id} label={o.label} selected={answers.budget===o.id} onClick={()=>{radio("budget",o.id);setStep2Errors(p=>{const n={...p};delete n.budget;return n;});}}/>)}
                    </div>
                    <FieldError msg={step2Errors.budget} />
                  </div>
                  <div id="s2-budget_amount">
                    <QLabel required>Montant et répartition du budget</QLabel>
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="number" min="0" max="999999" value={answers.budget_amount}
                        onChange={e=>{setAnswers(p=>({...p,budget_amount:e.target.value}));setStep2Errors(p=>{const n={...p};delete n.budget_amount;return n;});}}
                        placeholder="ex. 1500"
                        className="w-32 border border-[#2a3527] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors"/>
                      <div className="flex gap-1">
                        {["€","$","£"].map(c=>(
                          <button key={c} type="button" onClick={()=>setAnswers(p=>({...p,budget_currency:c}))}
                            className={`w-9 h-9 rounded-lg text-sm font-bold border transition-all ${answers.budget_currency===c?"border-[#c9a84c] bg-[#c9a84c] text-[#0e1310]":"border-[#2a3527] text-[#5a7856] hover:border-[#c9a84c] bg-[#1a2218]"}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div id="s2-budget_scope" className="mt-2">
                      <QLabel required>Ce montant est :</QLabel>
                      <div className="flex gap-2">
                        {[{id:"total",label:"Total du groupe"},{id:"per_person",label:"Par personne"}].map(o=>(
                          <button key={o.id} type="button" onClick={()=>{radio("budget_scope",o.id);setStep2Errors(p=>{const n={...p};delete n.budget_scope;return n;});}}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${answers.budget_scope===o.id?"border-[#c9a84c] bg-[#c9a84c] text-[#0e1310]":"border-[#2a3527] text-[#5a7856] hover:border-[#c9a84c] bg-[#1a2218]"}`}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <FieldError msg={step2Errors.budget_scope} />
                    </div>
                    <FieldError msg={step2Errors.budget_amount} />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Décor & Environnement */}
            <SectionCard title="Décor et environnement">
              <div className="space-y-5">
                <div id="s2-landscape">
                  <QLabel required hint="(plusieurs choix)">Type de paysage souhaité</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {LANDSCAPE.map(o=><Pill key={o.id} label={o.label} selected={answers.landscape.includes(o.id)} onClick={()=>{toggle("landscape",o.id);setStep2Errors(p=>{const n={...p};delete n.landscape;return n;});}}/>)}
                  </div>
                  <FieldError msg={step2Errors.landscape} />
                </div>
                <div id="s2-climate">
                  <QLabel required>Climat préféré</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {CLIMATE.map(o=><Pill key={o.id} label={o.label} selected={answers.climate===o.id} onClick={()=>{radio("climate",o.id);setStep2Errors(p=>{const n={...p};delete n.climate;return n;});}}/>)}
                  </div>
                  <FieldError msg={step2Errors.climate} />
                </div>
                <div id="s2-trip_vibe">
                  <QLabel required>Ambiance du voyage</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {TRIP_VIBE.map(o=><Pill key={o.id} label={o.label} selected={answers.trip_vibe===o.id} onClick={()=>{radio("trip_vibe",o.id);setStep2Errors(p=>{const n={...p};delete n.trip_vibe;return n;});}}/>)}
                  </div>
                  <FieldError msg={step2Errors.trip_vibe} />
                </div>
                <div id="s2-trip_type">
                  <QLabel required>Un lieu ou plusieurs étapes ?</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {TRIP_TYPE.map(o=><Pill key={o.id} label={o.label} selected={answers.trip_type===o.id} onClick={()=>{radio("trip_type",o.id);setStep2Errors(p=>{const n={...p};delete n.trip_type;return n;});}}/>)}
                  </div>
                  <FieldError msg={step2Errors.trip_type} />
                </div>
                <div id="s2-already_visited">
                  <QLabel required>Pays ou villes déjà visités</QLabel>
                  <input type="text" value={answers.already_visited}
                    onChange={e=>{setAnswers(p=>({...p,already_visited:e.target.value}));setStep2Errors(p=>{const n={...p};delete n.already_visited;return n;});}}
                    placeholder="ex. Thaïlande, Bali, Barcelone... ou « Aucun »"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors ${step2Errors.already_visited?"border-red-700 focus:border-red-500":"border-[#2a3527] focus:border-[#c9a84c]"}`}/>
                  <p className="text-xs text-[#3a5037] mt-1.5">Écrivez « Aucun » si vous n&apos;avez pas de préférence.</p>
                  <FieldError msg={step2Errors.already_visited} />
                </div>
              </div>
            </SectionCard>

            {/* Hébergement */}
            <div id="s2-accommodations">
              <SectionCard title="Hébergement">
                <div className="space-y-5">
                  <div>
                    <QLabel required hint="(plusieurs choix)">Type d&apos;hébergement préféré</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {ACCOMMODATION.map(o=><Pill key={o.id} label={o.label} selected={answers.accommodations.includes(o.id)} onClick={()=>{toggle("accommodations",o.id);setStep2Errors(p=>{const n={...p};delete n.accommodations;return n;});}}/>)}
                    </div>
                    <FieldError msg={step2Errors.accommodations} />
                  </div>
                  <div>
                    <QLabel hint="(optionnel)">Quartier ou ambiance préférés</QLabel>
                    <input type="text" value={answers.neighborhood_vibe}
                      onChange={e=>setAnswers(p=>({...p,neighborhood_vibe:e.target.value}))}
                      placeholder="ex. centre historique, proche de la plage, quartier branché..."
                      className="w-full border border-[#2a3527] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors"/>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Rythme & style */}
            <div id="s2-activity_pace">
              <SectionCard title="Rythme et style">
                <div className="space-y-5">
                  <div>
                    <QLabel required>Rythme d&apos;activités</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITY_PACE.map(o=><Pill key={o.id} label={o.label} selected={answers.activity_pace===o.id} onClick={()=>{radio("activity_pace",o.id);setStep2Errors(p=>{const n={...p};delete n.activity_pace;return n;});}}/>)}
                    </div>
                    <FieldError msg={step2Errors.activity_pace} />
                  </div>
                  <div id="s2-authenticity">
                    <QLabel required>Découvertes touristiques ou locales ?</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {AUTHENTICITY.map(o=><Pill key={o.id} label={o.label} selected={answers.authenticity===o.id} onClick={()=>{radio("authenticity",o.id);setStep2Errors(p=>{const n={...p};delete n.authenticity;return n;});}}/>)}
                    </div>
                    <FieldError msg={step2Errors.authenticity} />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Transport */}
            <div id="s2-transport">
              <SectionCard title="Transport sur place">
                <QLabel required hint="(plusieurs choix)">Comment vous déplacer sur place ?</QLabel>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORT.map(o=><Pill key={o.id} label={o.label} selected={answers.transport.includes(o.id)} onClick={()=>{toggle("transport",o.id);setStep2Errors(p=>{const n={...p};delete n.transport;return n;});}}/>)}
                </div>
                <FieldError msg={step2Errors.transport} />
              </SectionCard>
            </div>

            {/* Intérêts */}
            <div id="s2-interests">
              <SectionCard title="Centres d'intérêt">
                <div className="space-y-5">
                  <div>
                    <QLabel required hint={`(5 maximum — ${answers.interests.length}/5 sélectionné${answers.interests.length>1?"s":""})`}>
                      Activités et intérêts principaux
                    </QLabel>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(o=>(
                        <Pill key={o.id} label={o.label}
                          selected={answers.interests.includes(o.id)}
                          disabled={!answers.interests.includes(o.id)&&answers.interests.length>=5}
                          onClick={()=>{toggleInterest(o.id);setStep2Errors(p=>{const n={...p};delete n.interests;return n;});}}/>
                      ))}
                    </div>
                    <FieldError msg={step2Errors.interests} />
                  </div>
                  {showSports&&(
                    <div>
                      <QLabel hint="(plusieurs choix)">Sports et activités spécifiques</QLabel>
                      <div className="flex flex-wrap gap-2">
                        {SPORTS.map(o=><Pill key={o.id} label={o.label} selected={answers.sports.includes(o.id)} onClick={()=>toggle("sports",o.id)}/>)}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Incontournables & à éviter */}
            <SectionCard title="Incontournables et à éviter">
              <div className="space-y-5">
                <div id="s2-non_negotiables">
                  <QLabel required>2-3 choses absolument incontournables pour vous</QLabel>
                  <textarea value={answers.non_negotiables}
                    onChange={e=>{if(e.target.value.length<=300){setAnswers(p=>({...p,non_negotiables:e.target.value}));setStep2Errors(p=>{const n={...p};delete n.non_negotiables;return n;});}}}
                    rows={2} placeholder="ex. voir le Mont Fuji, manger des sushis authentiques... ou « Aucun »"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] resize-none transition-colors ${step2Errors.non_negotiables?"border-red-700 focus:border-red-500":"border-[#2a3527] focus:border-[#c9a84c]"}`}/>
                  <p className="text-xs text-[#3a5037] text-right mt-1">{answers.non_negotiables.length}/300</p>
                  <FieldError msg={step2Errors.non_negotiables} />
                </div>
                <div id="s2-things_to_avoid">
                  <QLabel required>Ce que vous ne voulez absolument pas</QLabel>
                  <textarea value={answers.things_to_avoid}
                    onChange={e=>{if(e.target.value.length<=200){setAnswers(p=>({...p,things_to_avoid:e.target.value}));setStep2Errors(p=>{const n={...p};delete n.things_to_avoid;return n;});}}}
                    rows={2} placeholder="ex. pas de bus bondés, pas de musées... ou « Aucun »"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] resize-none transition-colors ${step2Errors.things_to_avoid?"border-red-700 focus:border-red-500":"border-[#2a3527] focus:border-[#c9a84c]"}`}/>
                  <p className="text-xs text-[#3a5037] text-right mt-1">{answers.things_to_avoid.length}/200</p>
                  <FieldError msg={step2Errors.things_to_avoid} />
                </div>
              </div>
            </SectionCard>

            {/* Langues */}
            <div id="s2-language_spoken">
              <SectionCard title="Langues parlées">
                <QLabel required hint="(plusieurs choix)">Quelles langues parlez-vous ?</QLabel>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_SPOKEN.map(o=>(
                    <Pill key={o.id} label={o.label}
                      selected={answers.language_spoken.includes(o.id)}
                      onClick={()=>{toggle("language_spoken",o.id);setStep2Errors(p=>{const n={...p};delete n.language_spoken;return n;});}}/>
                  ))}
                </div>
                <FieldError msg={step2Errors.language_spoken} />
              </SectionCard>
            </div>
          </>
        )}

        {/* ═══════════ STEP 3 ═══════════ */}
        {step===3&&(
          <>
            <div className="mb-1">
              <p className="text-xs font-bold text-[#c9a84c] uppercase tracking-[0.18em] mb-2">Étape 3 sur 3</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#d8e3d5] mb-1" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Finaliser votre guide
              </h1>
              <p className="text-[#5a7856] text-sm">Quelques dernières informations avant le paiement.</p>
            </div>

            <SectionCard title="Informations pratiques">
              <div className="space-y-5">
                {/* Diet */}
                <div id="s3-diet">
                  <QLabel required hint="(plusieurs choix)">Restrictions alimentaires</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {DIET.map(o=><Pill key={o.id} label={o.label} selected={answers.diet.includes(o.id)} onClick={()=>{toggle("diet",o.id);setStep3Errors(p=>{const n={...p};delete n.diet;return n;});}}/>)}
                  </div>
                  <FieldError msg={step3Errors.diet} />
                  {answers.diet.includes("allergies")&&(
                    <div className="mt-3">
                      <QLabel required>Précisez vos allergies alimentaires</QLabel>
                      <input type="text" value={answers.allergy_details}
                        onChange={e=>setAnswers(p=>({...p,allergy_details:e.target.value}))}
                        placeholder="ex. arachides, fruits de mer, gluten..."
                        className="w-full border border-[#2a3527] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors"/>
                    </div>
                  )}
                </div>

                {/* Occasion */}
                <div>
                  <QLabel hint="(optionnel)">Occasion spéciale ?</QLabel>
                  <input type="text" value={answers.special_occasion}
                    onChange={e=>setAnswers(p=>({...p,special_occasion:e.target.value}))}
                    placeholder="ex. anniversaire, lune de miel, retraite, EVJF..."
                    className="w-full border border-[#2a3527] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors"/>
                </div>

                {/* Email */}
                <div id="s3-email">
                  <QLabel required>Adresse e-mail de réception du guide</QLabel>
                  <input type="email" value={answers.user_email}
                    onChange={e=>{setAnswers(p=>({...p,user_email:e.target.value}));setStep3Errors(p=>{const n={...p};delete n.email;return n;});if(errors.email)setErrors(p=>({...p,email:""}));}}
                    placeholder="votre@adresse.com"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] transition-colors ${(errors.email||step3Errors.email)?"border-red-700 focus:border-red-500":"border-[#2a3527] focus:border-[#c9a84c]"}`}/>
                  <p className="text-xs text-[#3a5037] mt-1.5">Votre guide PDF sera envoyé à cette adresse après génération.</p>
                  <FieldError msg={errors.email||step3Errors.email} />
                </div>

                {/* Notes */}
                <div id="s3-notes">
                  <QLabel hint="(optionnel)">Notes libres</QLabel>
                  <textarea value={answers.notes}
                    onChange={e=>{if(e.target.value.length<=500){setAnswers(p=>({...p,notes:e.target.value}));setStep3Errors(p=>{const n={...p};delete n.notes;return n;});}}}
                    rows={3} placeholder="Toute information complémentaire — contraintes particulières, villes supplémentaires à visiter, demandes spécifiques..."
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-[#0e1310] text-[#d8e3d5] placeholder-[#3a5037] resize-none transition-colors ${step3Errors.notes?"border-red-700 focus:border-red-500":"border-[#2a3527] focus:border-[#c9a84c]"}`}/>
                  <p className="text-xs text-[#3a5037] text-right mt-1">{answers.notes.length}/500</p>
                  <FieldError msg={step3Errors.notes} />
                </div>
              </div>
            </SectionCard>

            {/* RECAP */}
            <div className="bg-[#111c0e] border border-[#1e2e1a] text-[#d8e3d5] rounded-xl p-6">
              <h3 className="font-bold text-[#c9a84c] text-xs uppercase tracking-[0.18em] mb-5">
                {isEditingCartItem ? "Mise à jour du guide" : "Récapitulatif de votre commande"}
              </h3>
              <div className="space-y-2.5 text-sm mb-5">
                {answers.destination&&(
                  <div className="flex items-start gap-3">
                    <span className="text-[#4a6447] text-xs font-semibold uppercase tracking-wider w-24 shrink-0 mt-0.5">Destination</span>
                    <span className="font-semibold text-[#d8e3d5]">{answers.destination}</span>
                  </div>
                )}
                {answers.departure_city&&(
                  <div className="flex items-start gap-3">
                    <span className="text-[#4a6447] text-xs font-semibold uppercase tracking-wider w-24 shrink-0 mt-0.5">Départ</span>
                    <span>{answers.departure_city}</span>
                  </div>
                )}
                {(answers.arrival_date||answers.departure_date)&&(
                  <div className="flex items-start gap-3">
                    <span className="text-[#4a6447] text-xs font-semibold uppercase tracking-wider w-24 shrink-0 mt-0.5">Dates</span>
                    <span>
                      {answers.arrival_date&&formatDateFr(answers.arrival_date)}
                      {answers.arrival_date&&answers.departure_date&&answers.departure_date!==answers.arrival_date&&" → "}
                      {answers.departure_date&&answers.departure_date!==answers.arrival_date&&formatDateFr(answers.departure_date)}
                      {" "}<span className="text-[#4a6447]">({tripDuration})</span>
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-[#4a6447] text-xs font-semibold uppercase tracking-wider w-24 shrink-0 mt-0.5">Forfait</span>
                  <span>{plan?<><strong>{plan.name}</strong> — <span className="text-[#c9a84c] font-bold">{plan.price}</span></>:<span className="text-[#4a6447]">à choisir</span>}</span>
                </div>
                {answers.traveler_type&&(
                  <div className="flex items-start gap-3">
                    <span className="text-[#4a6447] text-xs font-semibold uppercase tracking-wider w-24 shrink-0 mt-0.5">Groupe</span>
                    <span>{TRAVELER_TYPE.find(o=>o.id===answers.traveler_type)?.label} — {answers.traveler_adults} adulte{answers.traveler_adults>1?"s":""}{answers.traveler_children>0&&`, ${answers.traveler_children} enfant${answers.traveler_children>1?"s":""}`}</span>
                  </div>
                )}
                {answers.budget&&(
                  <div className="flex items-start gap-3">
                    <span className="text-[#4a6447] text-xs font-semibold uppercase tracking-wider w-24 shrink-0 mt-0.5">Budget</span>
                    <span>{BUDGET_OPTS.find(o=>o.id===answers.budget)?.label}{answers.budget_amount&&` — ${answers.budget_amount}${answers.budget_currency}`}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-[#2a3527] bg-[#0e1310] px-4 py-4 mb-4">
                <p className="text-xs font-bold text-[#9ab896] mb-2">{legalCopy.noticeTitle}</p>
                <p className="text-xs leading-relaxed text-[#5a7856]">{legalCopy.noticeBody}</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#2a3527] bg-[#0e1310] p-4 text-left text-xs leading-relaxed text-[#9ab896] transition-colors hover:border-[#c9a84c]/40 mb-4">
                <input type="checkbox" checked={termsAccepted}
                  onChange={e=>{setTermsAccepted(e.target.checked);if(e.target.checked)setTermsError(null);}}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#3a5037] accent-[#c9a84c]"/>
                <span>
                  {legalCopy.termsPrefix}{" "}
                  <Link href="/cgv" className="font-semibold text-[#c9a84c] underline underline-offset-2">{legalCopy.termsLabel}</Link>{" "}
                  {legalCopy.termsJoin}{" "}
                  <Link href="/privacy" className="font-semibold text-[#c9a84c] underline underline-offset-2">{legalCopy.privacyLabel}</Link>
                  . {legalCopy.termsSuffix}
                </span>
              </label>
              {termsError&&<p className="mb-3 text-center text-xs font-semibold text-red-400">{termsError}</p>}

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={()=>setStep(2)}
                  className="flex-1 border border-[#2a3527] text-[#9ab896] font-semibold py-3 rounded-lg hover:border-[#c9a84c]/40 hover:text-[#d8e3d5] transition-all text-sm">
                  Revoir mes réponses
                </button>
                <button type="button" onClick={handleAddToCart} disabled={submitting}
                  className="flex-[2] bg-[#c9a84c] hover:bg-[#b8962e] disabled:bg-[#2a3527] disabled:text-[#3a5037] disabled:cursor-not-allowed text-[#0e1310] font-bold py-3 rounded-lg transition-all enabled:hover:scale-[1.01] shadow-[0_4px_20px_rgba(201,168,76,0.25)] text-sm">
                  {submitting?(
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0e1310] border-t-transparent rounded-full animate-spin"/>Enregistrement...
                    </span>
                  ):(
                    isEditingCartItem?"Mettre à jour le panier":plan?`${legalCopy.paymentButton}`:"Choisir un forfait"
                  )}
                </button>
              </div>
              {submitError&&<p className="text-red-400 text-xs mt-3 text-center">{submitError}</p>}
            </div>
          </>
        )}

        {/* NAV BUTTONS */}
        <div className="flex items-center justify-between pt-4 pb-8">
          {step>1?(
            <button type="button" onClick={goPrev}
              className="flex items-center gap-2 text-[#7a9076] font-semibold text-sm hover:text-[#c9a84c] transition-colors">
              ← Précédent
            </button>
          ):(
            <Link href="/" className="flex items-center gap-2 text-[#4a6447] font-semibold text-sm hover:text-[#7a9076] transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          )}
          {step<3&&(
            <button type="button" onClick={goNext} disabled={validating}
              className="bg-[#c9a84c] text-[#0e1310] font-bold px-8 py-3 rounded-lg hover:bg-[#b8962e] transition-all shadow-[0_4px_20px_rgba(201,168,76,0.25)] text-sm disabled:opacity-70 disabled:cursor-not-allowed">
              {validating?(
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0e1310] border-t-transparent rounded-full animate-spin"/>Vérification...
                </span>
              ):"Suivant"}
            </button>
          )}
        </div>
      </main>

      <footer className="border-t border-[#1a2218] py-6 mt-4">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs text-[#3a5037]">© 2026 TravelGuide AI — Guides de voyage personnalisés</p>
        </div>
      </footer>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e1310] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin"/></div>}>
      <QuestionnaireContent />
    </Suspense>
  );
}
