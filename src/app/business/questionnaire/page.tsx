"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addCartItem, loadCart, updateCartItem } from "@/lib/cart";

/* ─── Design tokens ─── */
const B = {
  bg: "#08080d",
  card: "#0f0f18",
  cardDeep: "#0b0b12",
  border: "#1a1a2e",
  text: "#e2e8f0",
  muted: "#6b7a99",
  faint: "#2d3748",
  blue: "#3b82f6",
  blueHover: "#2563eb",
  blueFaint: "rgba(59,130,246,0.08)",
  blueBorder: "rgba(59,130,246,0.22)",
  error: "rgba(239,68,68,0.15)",
  errorBorder: "rgba(239,68,68,0.5)",
  errorText: "#f87171",
};

/* ─── Constants ─── */
const OBJECTIFS = [
  { id: "conference", label: "Conférence / Salon" },
  { id: "client", label: "Réunion client" },
  { id: "formation", label: "Formation / Séminaire" },
  { id: "mission", label: "Mission longue durée" },
  { id: "autre", label: "Autre" },
];

const HOTELS = [
  { id: "business", label: "Hôtel d'affaires" },
  { id: "boutique", label: "Boutique hôtel" },
  { id: "appart", label: "Appartement / Serviced appt" },
  { id: "economic", label: "Budget / Économique" },
];

const TRANSPORTS = [
  { id: "avion", label: "Avion" },
  { id: "train", label: "Train" },
  { id: "voiture", label: "Voiture / Location" },
  { id: "vtc", label: "VTC / Taxi" },
];

const PROXIMITES = [
  { id: "lieu_reunion", label: "Lieu de réunion / Congrès" },
  { id: "bureau_client", label: "Bureau du client" },
  { id: "centre_ville", label: "Centre-ville" },
  { id: "aeroport", label: "Aéroport / Gare" },
];

const BUDGET_NIVEAUX = [
  { id: "eco", label: "Économique", sub: "< 150 € / nuit" },
  { id: "standard", label: "Standard", sub: "150 – 250 € / nuit" },
  { id: "premium", label: "Premium", sub: "> 250 € / nuit" },
  { id: "policy", label: "Politique entreprise", sub: "Selon barème interne" },
];

const PAYS_EXEMPLES = ["France", "Allemagne", "Espagne", "Italie", "Royaume-Uni", "États-Unis", "Japon", "Chine", "Belgique", "Suisse", "Pays-Bas", "Canada"];

interface MissionAnswers {
  mission_type: "" | "solo" | "team";
  destination_city: string;
  destination_country: string;
  departure_city: string;
  arrival_date: string;
  departure_date: string;
  objectif: string;
  colleagues: number;
  hotel_type: string;
  transports: string[];
  proximite: string[];
  budget_niveau: string;
  requirements: string;
  notes: string;
  user_email: string;
}

const EMPTY: MissionAnswers = {
  mission_type: "",
  destination_city: "", destination_country: "", departure_city: "",
  arrival_date: "", departure_date: "", objectif: "",
  colleagues: 1, hotel_type: "", transports: [], proximite: [],
  budget_niveau: "", requirements: "", notes: "", user_email: "",
};

/* ─── Helpers ─── */
function inputCls(hasError: boolean) {
  return {
    width: "100%",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    outline: "none",
    background: B.bg,
    color: B.text,
    border: `1px solid ${hasError ? B.errorBorder : B.border}`,
    transition: "border-color 0.2s",
  } as React.CSSProperties;
}

function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <label className="block mb-2 text-sm font-semibold" style={{ color: B.text }}>
      {children}
      {required && <span className="ml-1" style={{ color: B.blue }}>*</span>}
      {hint && <span className="ml-1.5 text-xs font-normal" style={{ color: B.muted }}>{hint}</span>}
    </label>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl mb-5" style={{ background: B.card, border: `1px solid ${B.border}` }}>
      {title && (
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${B.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: B.blue }}>{title}</p>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
      style={{
        background: selected ? B.blue : B.blueFaint,
        color: selected ? "#fff" : B.muted,
        border: `1px solid ${selected ? B.blue : B.border}`,
      }}
    >
      {label}
    </button>
  );
}

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs" style={{ color: B.errorText }}>{msg}</p>;
}

function isGibberish(text: string): boolean {
  const s = text.trim().toLowerCase();
  if (s.length === 0) return false;
  const alpha = s.replace(/[^a-z]/g, "");
  if (alpha.length < 4) return false;
  if (!/[aeiouy]/.test(alpha)) return true;
  if (/^(.{1,3})\1{2,}$/.test(alpha)) return true;
  if (/[^aeiouy]{5,}/.test(alpha)) return true;
  const realVowelPos = [...alpha].reduce<number[]>((a, c, i) => ("aeiou".includes(c) ? [...a, i] : a), []);
  if (realVowelPos.length === 0 && alpha.length >= 5) return true;
  if (realVowelPos.length > 0) {
    const trailing = alpha.slice(realVowelPos[realVowelPos.length - 1] + 1);
    if (trailing.length > 3) return true;
  }
  return false;
}

/* ─── Stepper number input ─── */
function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all"
        style={{ background: B.blueFaint, border: `1px solid ${B.border}`, color: value <= min ? B.faint : B.blue }}>−</button>
      <span className="text-xl font-bold w-8 text-center" style={{ color: B.text }}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all"
        style={{ background: B.blueFaint, border: `1px solid ${B.border}`, color: value >= max ? B.faint : B.blue }}>+</button>
    </div>
  );
}

/* ─── Main component ─── */
function BusinessQuestionnaireContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<MissionAnswers>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [s2Errors, setS2Errors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [replacedExisting, setReplacedExisting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("tgai_mode", "business");
    const stored = localStorage.getItem("tgai_session_user");
    if (stored) {
      try {
        const u = JSON.parse(stored) as { email?: string };
        if (u.email) setAnswers(p => ({ ...p, user_email: u.email! }));
      } catch { /* */ }
    }
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.email) setAnswers(p => ({ ...p, user_email: d.email }));
    }).catch(() => undefined);
  }, []);

  function scrollTo(id: string) {
    setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 50);
  }

  function toggle(field: "transports" | "proximite", val: string) {
    setAnswers(p => {
      const arr = p[field];
      return { ...p, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  }

  async function goNext() {
    if (step === 1) {
      const errs: Record<string, string> = {};
      if (!answers.mission_type) errs.mission_type = "Veuillez choisir le type de déplacement.";
      if (!answers.destination_city.trim()) errs.destination_city = "Veuillez indiquer la ville de destination.";
      if (!answers.departure_city.trim()) errs.departure_city = "Veuillez indiquer votre ville de départ.";
      if (!answers.arrival_date) errs.arrival_date = "Veuillez sélectionner une date d'arrivée.";
      if (!answers.departure_date) errs.departure_date = "Veuillez sélectionner une date de départ.";
      if (!answers.objectif) errs.objectif = "Veuillez indiquer l'objectif du déplacement.";
      if (Object.keys(errs).length > 0) { setErrors(errs); scrollTo(`f-${Object.keys(errs)[0]}`); return; }

      // Heuristic + AI validation
      const toCheck = [
        { name: "destination_city", label: "Ville de destination", value: answers.destination_city },
        { name: "departure_city", label: "Ville de départ", value: answers.departure_city },
      ];
      const heurErrs: Record<string, string> = {};
      for (const f of toCheck) {
        if (isGibberish(f.value)) heurErrs[f.name] = `"${f.value}" ne semble pas être un lieu réel.`;
      }
      if (Object.keys(heurErrs).length > 0) { setErrors(heurErrs); scrollTo(`f-${Object.keys(heurErrs)[0]}`); return; }

      try {
        setValidating(true);
        const res = await fetch("/api/validate-input", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: toCheck }),
        });
        if (res.ok) {
          const data = await res.json() as { errors: Record<string, string> };
          if (Object.keys(data.errors).length > 0) { setErrors(data.errors); scrollTo(`f-${Object.keys(data.errors)[0]}`); return; }
        }
      } catch { /* silently allow */ }
      finally { setValidating(false); }
      setErrors({});
    }
    if (step === 2) {
      const errs: Record<string, string> = {};
      if (!answers.hotel_type) errs.hotel_type = "Veuillez choisir un type d'hébergement.";
      if (answers.transports.length === 0) errs.transports = "Veuillez choisir au moins un moyen de transport.";
      if (!answers.budget_niveau) errs.budget_niveau = "Veuillez indiquer votre niveau de budget.";
      if (Object.keys(errs).length > 0) { setS2Errors(errs); scrollTo(`s2-${Object.keys(errs)[0]}`); return; }
      setS2Errors({});
    }
    setStep(s => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAddToCart() {
    setTermsError(null);
    if (!termsAccepted) { setTermsError("Veuillez accepter les conditions générales de vente pour continuer."); return; }

    const existingCart = loadCart();
    if (existingCart.length > 0) setReplacedExisting(true);

    const cartInput = {
      plan: "business" as "3j",
      destination: answers.destination_city + (answers.destination_country ? `, ${answers.destination_country}` : ""),
      arrival_date: answers.arrival_date,
      departure_date: answers.departure_date,
      travel_dates: `${answers.arrival_date} → ${answers.departure_date}`,
      traveler_type: answers.mission_type === "team" ? "group" : "solo",
      traveler_adults: answers.mission_type === "team" ? 1 + answers.colleagues : 1,
      traveler_children: 0,
      children_ages: [],
      budget: answers.budget_niveau,
      budget_amount: "",
      budget_currency: "€",
      budget_scope: "total",
      language: "fr",
      criteria: { ...answers, mode: "business" },
    };

    try {
      setSubmitting(true);
      setSubmitError(null);
      const existingItem = existingCart[0];
      if (existingItem?.id) {
        updateCartItem(existingItem.id, cartInput);
      } else {
        addCartItem(cartInput as Parameters<typeof addCartItem>[0]);
      }
      router.push("/cart");
    } catch (err) {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const totalDays = answers.arrival_date && answers.departure_date
    ? Math.max(1, Math.round((new Date(answers.departure_date).getTime() - new Date(answers.arrival_date).getTime()) / 86400000))
    : null;

  return (
    <div ref={topRef} className="min-h-screen flex flex-col" style={{ background: B.bg, color: B.text, fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      {/* Top accent */}
      <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#1e3a8a,#3b82f6,#6366f1,#3b82f6,#1e3a8a)" }} />

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${B.border}`, background: B.bg }} className="sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/business" className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: B.blue }}>Travel</span>
            <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: B.text }}>Business</span>
          </Link>
          <Link href="/" className="text-xs" style={{ color: B.faint }}>← Mode personnel</Link>
        </div>
      </header>

      {/* Progress */}
      <div style={{ background: B.cardDeep, borderBottom: `1px solid ${B.border}` }}>
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {["Mission", "Préférences", "Confirmation"].map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{ background: done ? B.blue : active ? B.blue : B.border, color: done || active ? "#fff" : B.muted }}>
                    {done ? "✓" : n}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block" style={{ color: active ? B.text : B.faint }}>{label}</span>
                  {i < 2 && <div className="w-8 sm:w-16 h-px" style={{ background: done ? B.blue : B.border }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: B.blue }}>
            {step === 1 ? "Étape 1 / 3" : step === 2 ? "Étape 2 / 3" : "Étape 3 / 3"}
          </p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), serif", color: B.text }}>
            {step === 1 ? "Votre mission" : step === 2 ? "Vos préférences" : "Confirmation"}
          </h1>
          <p className="text-sm mt-1" style={{ color: B.muted }}>
            {step === 1 ? "Renseignez les informations clés de votre déplacement." : step === 2 ? "Précisez vos contraintes et préférences professionnelles." : "Vérifiez les informations avant d'ajouter au panier."}
          </p>
        </div>

        {replacedExisting && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "#fbbf24" }}>
            Un guide existant dans votre panier a été remplacé par cette nouvelle mission.
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            {/* Mission type — solo vs team */}
            <div className="mb-5" id="f-mission_type">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: B.blue }}>Type de déplacement</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {([
                  {
                    id: "solo" as const,
                    label: "Mission solo",
                    desc: "Vous voyagez seul. Le guide est optimisé pour un déplacement individuel.",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                    ),
                  },
                  {
                    id: "team" as const,
                    label: "Mission en équipe",
                    desc: "Vous voyagez avec des collègues. Le guide intègre la logistique de groupe.",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                        <circle cx="17" cy="8" r="3"/><path d="M15 20c0-1.7.7-3.3 2-4.5"/>
                      </svg>
                    ),
                  },
                ] as const).map(opt => {
                  const selected = answers.mission_type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { setAnswers(p => ({ ...p, mission_type: opt.id })); if (errors.mission_type) setErrors(p => ({ ...p, mission_type: "" })); }}
                      className="rounded-2xl p-5 text-left transition-all"
                      style={{
                        background: selected ? B.blueFaint : B.card,
                        border: `2px solid ${selected ? B.blue : B.border}`,
                      }}
                    >
                      <div className="mb-3" style={{ color: selected ? B.blue : B.muted }}>{opt.icon}</div>
                      <p className="font-bold text-sm mb-1" style={{ color: selected ? B.blue : B.text }}>{opt.label}</p>
                      <p className="text-xs leading-relaxed" style={{ color: B.muted }}>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
              {errors.mission_type && <p className="mt-2 text-xs" style={{ color: B.errorText }}>{errors.mission_type}</p>}
            </div>

            <Card title="Destination">
              <div className="space-y-4">
                <div id="f-destination_city">
                  <Label required>Ville de destination</Label>
                  <input style={inputCls(!!errors.destination_city)} value={answers.destination_city}
                    onChange={e => { setAnswers(p => ({ ...p, destination_city: e.target.value })); if (errors.destination_city) setErrors(p => ({ ...p, destination_city: "" })); }}
                    placeholder="ex. Francfort, New York, Tokyo" />
                  <FieldErr msg={errors.destination_city} />
                </div>
                <div>
                  <Label hint="(optionnel)">Pays</Label>
                  <select value={answers.destination_country} onChange={e => setAnswers(p => ({ ...p, destination_country: e.target.value }))}
                    style={{ ...inputCls(false), cursor: "pointer", appearance: "none" as const }}>
                    <option value="">Sélectionner...</option>
                    {PAYS_EXEMPLES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div id="f-departure_city">
                  <Label required>Ville de départ</Label>
                  <input style={inputCls(!!errors.departure_city)} value={answers.departure_city}
                    onChange={e => { setAnswers(p => ({ ...p, departure_city: e.target.value })); if (errors.departure_city) setErrors(p => ({ ...p, departure_city: "" })); }}
                    placeholder="ex. Paris, Lyon, Bordeaux" />
                  <FieldErr msg={errors.departure_city} />
                </div>
              </div>
            </Card>

            <Card title="Calendrier de la mission">
              <div className="grid sm:grid-cols-2 gap-4">
                <div id="f-arrival_date">
                  <Label required>Date d'arrivée</Label>
                  <input type="date" style={inputCls(!!errors.arrival_date)} value={answers.arrival_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => { setAnswers(p => ({ ...p, arrival_date: e.target.value })); if (errors.arrival_date) setErrors(p => ({ ...p, arrival_date: "" })); }} />
                  <FieldErr msg={errors.arrival_date} />
                </div>
                <div id="f-departure_date">
                  <Label required>Date de retour</Label>
                  <input type="date" style={inputCls(!!errors.departure_date)} value={answers.departure_date}
                    min={answers.arrival_date || new Date().toISOString().split("T")[0]}
                    onChange={e => { setAnswers(p => ({ ...p, departure_date: e.target.value })); if (errors.departure_date) setErrors(p => ({ ...p, departure_date: "" })); }} />
                  <FieldErr msg={errors.departure_date} />
                </div>
              </div>
              {totalDays && (
                <div className="mt-3 text-xs font-semibold" style={{ color: B.blue }}>
                  Durée calculée : {totalDays} jour{totalDays > 1 ? "s" : ""}
                </div>
              )}
            </Card>

            <Card title="Objectif du déplacement">
              <div id="f-objectif">
                <Label required>Type de mission</Label>
                <div className="flex flex-wrap gap-2">
                  {OBJECTIFS.map(o => (
                    <Pill key={o.id} label={o.label} selected={answers.objectif === o.id}
                      onClick={() => { setAnswers(p => ({ ...p, objectif: o.id })); if (errors.objectif) setErrors(p => ({ ...p, objectif: "" })); }} />
                  ))}
                </div>
                <FieldErr msg={errors.objectif} />
              </div>
            </Card>

            {answers.mission_type === "team" && (
              <Card title="Équipe">
                <Label>Nombre de collègues avec vous</Label>
                <div className="flex items-center gap-4">
                  <Stepper value={answers.colleagues} min={1} max={20} onChange={v => setAnswers(p => ({ ...p, colleagues: v }))} />
                  <span className="text-sm" style={{ color: B.muted }}>
                    {answers.colleagues === 1 ? "1 collègue" : `${answers.colleagues} collègues`}
                  </span>
                </div>
              </Card>
            )}
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Card title="Hébergement">
              <div id="s2-hotel_type" className="space-y-3">
                <Label required>Type d'hébergement préféré</Label>
                <div className="flex flex-wrap gap-2">
                  {HOTELS.map(o => (
                    <Pill key={o.id} label={o.label} selected={answers.hotel_type === o.id}
                      onClick={() => { setAnswers(p => ({ ...p, hotel_type: o.id })); if (s2Errors.hotel_type) setS2Errors(p => ({ ...p, hotel_type: "" })); }} />
                  ))}
                </div>
                <FieldErr msg={s2Errors.hotel_type} />
              </div>
              <div className="mt-4" id="s2-proximite">
                <Label hint="(plusieurs choix)">Proximité souhaitée</Label>
                <div className="flex flex-wrap gap-2">
                  {PROXIMITES.map(o => (
                    <Pill key={o.id} label={o.label} selected={answers.proximite.includes(o.id)}
                      onClick={() => toggle("proximite", o.id)} />
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Transport">
              <div id="s2-transports">
                <Label required hint="(plusieurs choix)">Modes de transport utilisés</Label>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORTS.map(o => (
                    <Pill key={o.id} label={o.label} selected={answers.transports.includes(o.id)}
                      onClick={() => { toggle("transports", o.id); if (s2Errors.transports) setS2Errors(p => ({ ...p, transports: "" })); }} />
                  ))}
                </div>
                <FieldErr msg={s2Errors.transports} />
              </div>
            </Card>

            <Card title="Budget">
              <div id="s2-budget_niveau">
                <Label required>Niveau de budget par nuit</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BUDGET_NIVEAUX.map(o => (
                    <button key={o.id} type="button"
                      onClick={() => { setAnswers(p => ({ ...p, budget_niveau: o.id })); if (s2Errors.budget_niveau) setS2Errors(p => ({ ...p, budget_niveau: "" })); }}
                      className="rounded-xl p-4 text-left transition-all"
                      style={{
                        background: answers.budget_niveau === o.id ? B.blueFaint : B.cardDeep,
                        border: `1px solid ${answers.budget_niveau === o.id ? B.blue : B.border}`,
                      }}>
                      <p className="text-sm font-bold mb-0.5" style={{ color: answers.budget_niveau === o.id ? B.blue : B.text }}>{o.label}</p>
                      <p className="text-xs" style={{ color: B.muted }}>{o.sub}</p>
                    </button>
                  ))}
                </div>
                <FieldErr msg={s2Errors.budget_niveau} />
              </div>
            </Card>

            <Card title="Contraintes spécifiques">
              <Label hint="(optionnel)">Exigences particulières</Label>
              <textarea
                rows={3}
                value={answers.requirements}
                onChange={e => setAnswers(p => ({ ...p, requirements: e.target.value }))}
                placeholder="ex. Facture au nom de l'entreprise, chambre non-fumeur, accès PMR, code vestimentaire..."
                style={{ ...inputCls(false), resize: "vertical" as const, minHeight: 80 }}
              />
            </Card>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            {/* Recap */}
            <Card title="Récapitulatif de la mission">
              <div className="space-y-3 text-sm">
                {[
                  { label: "Destination", val: answers.destination_city + (answers.destination_country ? `, ${answers.destination_country}` : "") },
                  { label: "Départ depuis", val: answers.departure_city },
                  { label: "Dates", val: `${answers.arrival_date} → ${answers.departure_date}${totalDays ? ` (${totalDays}j)` : ""}` },
                  { label: "Objectif", val: OBJECTIFS.find(o => o.id === answers.objectif)?.label ?? "" },
                  { label: "Type", val: answers.mission_type === "solo" ? "Mission solo" : answers.mission_type === "team" ? `Mission en équipe (1 + ${answers.colleagues} collègue${answers.colleagues > 1 ? "s" : ""})` : "" },
                  { label: "Hébergement", val: HOTELS.find(o => o.id === answers.hotel_type)?.label ?? "" },
                  { label: "Budget / nuit", val: BUDGET_NIVEAUX.find(o => o.id === answers.budget_niveau)?.label ?? "" },
                ].filter(r => r.val).map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-4 rounded-xl px-4 py-3" style={{ background: B.cardDeep, border: `1px solid ${B.border}` }}>
                    <span style={{ color: B.muted }}>{row.label}</span>
                    <span className="font-semibold text-right" style={{ color: B.text }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Notes complémentaires">
              <Label hint="(optionnel)">Informations supplémentaires pour le guide</Label>
              <textarea rows={4} value={answers.notes}
                onChange={e => setAnswers(p => ({ ...p, notes: e.target.value }))}
                placeholder="Lieu exact de la conférence, contacts sur place, préférences alimentaires pour les repas d'affaires..."
                style={{ ...inputCls(false), resize: "vertical" as const, minHeight: 100 }} />
            </Card>

            {/* Notice */}
            <div className="rounded-xl p-4 mb-5 text-sm leading-relaxed" style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", color: B.muted }}>
              <strong style={{ color: B.text }}>Information importante.</strong> Les horaires et informations pratiques fournies dans le guide sont à titre indicatif. Vérifiez toujours les détails directement auprès des établissements avant votre déplacement.
            </div>

            {/* Terms */}
            <div className="rounded-xl p-4 mb-5" style={{ background: B.card, border: `1px solid ${B.border}` }}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={termsAccepted} onChange={e => { setTermsAccepted(e.target.checked); setTermsError(null); }}
                  className="mt-0.5 w-4 h-4 rounded" style={{ accentColor: B.blue }} />
                <span className="text-xs leading-relaxed" style={{ color: B.muted }}>
                  J'ai lu et j'accepte les{" "}
                  <Link href="/cgv" target="_blank" className="underline" style={{ color: B.blue }}>Conditions Générales de Vente</Link>
                  {" "}ainsi que la{" "}
                  <Link href="/privacy" target="_blank" className="underline" style={{ color: B.blue }}>Politique de confidentialité</Link>.
                </span>
              </label>
              {termsError && <p className="mt-2 text-xs" style={{ color: B.errorText }}>{termsError}</p>}
            </div>

            {submitError && (
              <div className="mb-4 rounded-xl p-3 text-sm" style={{ background: B.error, border: `1px solid ${B.errorBorder}`, color: B.errorText }}>{submitError}</div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button type="button" onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex-1 rounded-xl py-3 font-semibold text-sm transition-all"
              style={{ border: `1px solid ${B.border}`, color: B.muted, background: "transparent" }}>
              Retour
            </button>
          )}
          {step < 3 && (
            <button type="button" onClick={goNext} disabled={validating}
              className="font-bold px-8 py-3 rounded-xl text-sm transition-all disabled:opacity-60"
              style={{ background: B.blue, color: "#fff", flex: step === 1 ? "auto" : 2 }}>
              {validating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : "Suivant →"}
            </button>
          )}
          {step === 3 && (
            <button type="button" onClick={handleAddToCart} disabled={submitting}
              className="flex-[2] font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60"
              style={{ background: B.blue, color: "#fff" }}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </span>
              ) : "Ajouter au panier →"}
            </button>
          )}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${B.border}`, background: B.bg }} className="py-6 text-center">
        <p className="text-xs" style={{ color: B.faint }}>© 2026 Travel Business IA — Mode Professionnel</p>
      </footer>
    </div>
  );
}

export default function BusinessQuestionnaire() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#08080d" }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BusinessQuestionnaireContent />
    </Suspense>
  );
}
