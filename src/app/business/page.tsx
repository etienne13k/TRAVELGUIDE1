"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";

type Lang = "fr" | "en";

const B = {
  bg: "#08080d",
  card: "#0f0f18",
  cardDeep: "#0b0b12",
  cardHeader: "#0d0d1a",
  border: "#1a1a2e",
  text: "#e2e8f0",
  muted: "#6b7a99",
  faint: "#2d3748",
  veryFaint: "#1e2535",
  accent: "#3b82f6",
  accentHover: "#2563eb",
  accentFaint: "rgba(59,130,246,0.12)",
  accentBorder: "rgba(59,130,246,0.28)",
  dark1: "#153059",
  dark2: "#0d1f3c",
};

const translations = {
  fr: {
    banner_messages: [
      "Guides professionnels sur mesure · Livraison sous 48h",
      "Optimisez vos deplacements d'affaires avec l'IA",
      "Frankfurt · Londres · Amsterdam · Singapour · et plus",
    ],
    nav_cta: "Configurer ma mission",
    hero_title: "Travel Business IA",
    hero_sub: "Déplacements professionnels optimisés par IA. Hôtels d'affaires, restaurants clients, agenda — tout géré en un guide PDF.",
    hero_cta: "Configurer ma mission",
    hero_sub_cta: "Sans abonnement · Livraison sous 48h · 100% personnalisé",
    how_title: "Comment ça marche",
    how_sub: "Simple, rapide, et entièrement adapté à votre mission.",
    how_steps: [
      {
        n: "01",
        title: "Décrivez votre mission",
        desc: "Destination, dates, objectif professionnel, préférences. 5 minutes pour renseigner votre profil de déplacement.",
      },
      {
        n: "02",
        title: "L'IA structure votre séjour",
        desc: "Notre IA génère un guide complet : hôtels business, restaurants clients, transports, agenda optimisé selon votre mission.",
      },
      {
        n: "03",
        title: "Recevez votre guide",
        desc: "PDF professionnel livré sous 48h dans votre boîte mail. Prêt à partir en déplacement.",
      },
    ],
    flows_badge: "Deux types de missions",
    flows_title: "Votre mission, votre façon",
    flows_sub: "Que vous partiez seul ou en équipe, pour une réunion ou un salon, Travel Business IA s'adapte.",
    flow1_title: "Mission solo ou petite équipe",
    flow1_desc: "Vous partez seul ou avec 2-3 collègues. L'IA optimise les hébergements, les transports et les restaurants adaptés à un budget entreprise.",
    flow1_features: [
      "Hôtels d'affaires sélectionnés",
      "Restaurants pour dîners clients",
      "Transports et navettes recommandés",
      "Planning heure par heure",
    ],
    flow1_cta: "Configurer ma mission →",
    flow2_title: "Groupe ou événement pro",
    flow2_desc: "Conférence, salon, formation d'équipe. L'IA anticipe les contraintes de groupe, les lieux de réunion et la logistique collective.",
    flow2_features: [
      "Lieux de réunion et salles de conf",
      "Restaurants privatisables",
      "Logistique groupe optimisée",
      "Agenda partageable en PDF",
    ],
    flow2_cta: "Planifier mon événement →",
    pricing_placeholder_title: "Plans professionnels",
    pricing_placeholder_sub: "Les offres Business sont en cours de finalisation. Configurez votre mission dès maintenant — tarif communiqué lors de la validation.",
    pricing_placeholder_cta: "Configurer ma mission",
    examples_title: "À quoi ressemble votre guide ?",
    examples_sub: "Un aperçu de la qualité et du niveau de détail que vous recevrez pour vos déplacements.",
    social_title: "Ils nous font confiance",
    social_subtitle: "Des professionnels et équipes font confiance à Travel Business IA pour leurs déplacements.",
    social_stats: [
      { number: "4.9★", label: "note moyenne" },
      { number: "97%", label: "de satisfaction" },
      { number: "500+", label: "villes couvertes" },
      { number: "48h", label: "livraison garantie" },
    ],
    bottom_title: "Prêt pour votre prochain déplacement ?",
    bottom_sub: "Optimisez vos missions professionnelles avec un guide sur mesure généré par IA.",
    footer_tagline: "L'IA au service de vos déplacements professionnels.",
    footer_copy: "© 2026 Travel Business IA",
    footer_cgv: "Conditions Générales de Vente",
    footer_privacy: "Politique de Confidentialité",
    hero_badge_ai: "Propulsé par IA entraînée",
    hero_badge_delivery: "Livraison",
    hero_badge_custom: "Personnalisé",
    hero_badge_rating: "Satisfaction",
    hero_card_label: "Exemple réel",
    hero_card_subtitle: "Allemagne · 3 jours",
    hero_card_tag1: "Business",
    hero_card_tag2: "Clients",
    hero_card_tag3: "Premium",
    hero_card_days: [
      { day: "J1", title: "Arrivée & Installation", sub: "Check-in Marriott + brief d'équipe + dîner client", color: "#3b82f6" },
      { day: "J2", title: "Journée Conférence", sub: "Messe Frankfurt + déjeuner partenaires", color: "#3b82f6" },
      { day: "J3", title: "Réunions & Départ", sub: "Rendez-vous clients + transfert aéroport", color: "#1e3a5f" },
    ],
    hero_card_more: "+ sections budget, transports, hôtels…",
    hero_card_delivery: "Livraison 48h",
    nav_account_label: "Mon compte",
    example_cover_mono: "TRAVEL BUSINESS — GUIDE PROFESSIONNEL EXCLUSIF",
    example_cover_city: "Frankfurt",
    example_cover_country: "Allemagne",
    example_cover_type: "Mission Commerciale & Conférence",
    example_cover_days_label: "jours",
    example_cover_travelers_label: "voyageurs",
    example_cover_budget_label: "budget/j",
    example_cover_generated: "Généré le 08/06/2026 · PDF · IA entraînée",
  },
  en: {
    banner_messages: [
      "Tailor-made professional guides · Delivered within 48h",
      "Optimize your business travel with AI",
      "Frankfurt · London · Amsterdam · Singapore · and more",
    ],
    nav_cta: "Configure my mission",
    hero_title: "Travel Business IA",
    hero_sub: "AI-optimized business travel. Business hotels, client restaurants, agenda — all in one PDF guide.",
    hero_cta: "Configure my mission",
    hero_sub_cta: "No subscription · Delivered in 48h · 100% personalized",
    how_title: "How it works",
    how_sub: "Simple, fast, and fully adapted to your mission.",
    how_steps: [
      {
        n: "01",
        title: "Describe your mission",
        desc: "Destination, dates, business objective, preferences. 5 minutes to fill in your travel profile.",
      },
      {
        n: "02",
        title: "AI structures your stay",
        desc: "Our AI generates a complete guide: business hotels, client restaurants, transport, and an optimized agenda for your mission.",
      },
      {
        n: "03",
        title: "Receive your guide",
        desc: "Professional PDF delivered to your inbox within 48h. Ready to travel.",
      },
    ],
    flows_badge: "Two mission types",
    flows_title: "Your mission, your way",
    flows_sub: "Whether you're travelling solo or as a team, for a meeting or a trade show, Travel Business IA adapts.",
    flow1_title: "Solo or small team mission",
    flow1_desc: "You're travelling alone or with 2-3 colleagues. The AI optimises accommodations, transport and restaurants suited to a corporate budget.",
    flow1_features: [
      "Curated business hotels",
      "Restaurants for client dinners",
      "Recommended transport & shuttles",
      "Hour-by-hour planning",
    ],
    flow1_cta: "Configure my mission →",
    flow2_title: "Group or corporate event",
    flow2_desc: "Conference, trade show, team training. The AI anticipates group constraints, meeting venues and collective logistics.",
    flow2_features: [
      "Meeting rooms & conference venues",
      "Privatizable restaurants",
      "Optimised group logistics",
      "Shareable PDF agenda",
    ],
    flow2_cta: "Plan my event →",
    pricing_placeholder_title: "Professional plans",
    pricing_placeholder_sub: "Business offers are being finalized. Configure your mission now — pricing communicated upon validation.",
    pricing_placeholder_cta: "Configure my mission",
    examples_title: "What does your guide look like?",
    examples_sub: "A preview of the quality and level of detail you will receive for your business travel.",
    social_title: "They trust us",
    social_subtitle: "Professionals and teams trust Travel Business IA for their business travel.",
    social_stats: [
      { number: "4.9★", label: "average rating" },
      { number: "97%", label: "satisfaction rate" },
      { number: "500+", label: "cities covered" },
      { number: "48h", label: "delivery guaranteed" },
    ],
    bottom_title: "Ready for your next business trip?",
    bottom_sub: "Optimize your professional missions with a tailor-made guide generated by AI.",
    footer_tagline: "AI at the service of your professional travel.",
    footer_copy: "© 2026 Travel Business IA",
    footer_cgv: "Terms of Sale",
    footer_privacy: "Privacy Policy",
    hero_badge_ai: "Powered by trained AI",
    hero_badge_delivery: "Delivery",
    hero_badge_custom: "Personalized",
    hero_badge_rating: "Rating",
    hero_card_label: "Real example",
    hero_card_subtitle: "Germany · 3 days",
    hero_card_tag1: "Business",
    hero_card_tag2: "Clients",
    hero_card_tag3: "Premium",
    hero_card_days: [
      { day: "D1", title: "Arrival & Setup", sub: "Marriott check-in + team brief + client dinner", color: "#3b82f6" },
      { day: "D2", title: "Conference Day", sub: "Messe Frankfurt + partner lunch", color: "#3b82f6" },
      { day: "D3", title: "Meetings & Departure", sub: "Client meetings + airport transfer", color: "#1e3a5f" },
    ],
    hero_card_more: "+ budget, transport, hotel sections…",
    hero_card_delivery: "Delivery 48h",
    nav_account_label: "My account",
    example_cover_mono: "TRAVEL BUSINESS — YOUR EXCLUSIVE PROFESSIONAL GUIDE",
    example_cover_city: "Frankfurt",
    example_cover_country: "Germany",
    example_cover_type: "Commercial Mission & Conference",
    example_cover_days_label: "days",
    example_cover_travelers_label: "travelers",
    example_cover_budget_label: "budget/d",
    example_cover_generated: "Generated 08/06/2026 · PDF · Trained AI",
  },
};

export default function BusinessPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [cartCount, setCartCount] = useState(0);
  const [exampleExpanded, setExampleExpanded] = useState(false);
  const tx = translations[lang];

  useEffect(() => {
    localStorage.setItem("tgai_mode", "business");
    const refresh = () => setCartCount(getCartCount());
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("tgai_lang");
    if (stored === "en") setLang("en");
    const handleLangChange = (e: Event) => {
      const evt = e as CustomEvent<{ lang: "fr" | "en" }>;
      setLang(evt.detail.lang);
    };
    window.addEventListener("tgai_lang_change", handleLangChange);
    return () => window.removeEventListener("tgai_lang_change", handleLangChange);
  }, []);

  return (
    <div className="min-h-screen" style={{ color: B.faint, fontFamily: "var(--font-dm-sans), system-ui, sans-serif", background: B.bg }}>

      {/* LAUNCH BANNER */}
      <div
        className="business-ticker-wrap fixed top-0 w-full z-[60] overflow-hidden h-12 flex items-center justify-center cursor-default"
        style={{ background: `linear-gradient(90deg, ${B.accent}, #6366f1, ${B.accent})` }}
      >
        <div className="animate-ticker whitespace-nowrap text-sm font-bold text-white">
          {[...tx.banner_messages, ...tx.banner_messages].map((msg, i) => (
            <span key={i} className="inline-block px-10">{msg}</span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav
        className="fixed top-12 w-full z-50 backdrop-blur-md"
        style={{ background: `${B.bg}f2`, borderBottom: `1px solid ${B.border}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div
            className="text-xl font-bold tracking-tight"
            style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Travel Business IA
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ border: `1px solid ${B.border}` }}>
              <button
                onClick={() => { setLang("fr"); localStorage.setItem("tgai_lang", "fr"); window.dispatchEvent(new CustomEvent("tgai_lang_change", { detail: { lang: "fr" } })); }}
                className={`rounded-md px-2 py-0.5 transition-all ${lang === "fr" ? "shadow-sm" : "opacity-40 hover:opacity-70"}`}
                style={lang === "fr" ? { background: B.border } : {}}
              >
                <img src="https://flagcdn.com/w40/fr.png" width="24" height="16" alt="FR" style={{ display: "inline", borderRadius: "2px" }} />
              </button>
              <button
                onClick={() => { setLang("en"); localStorage.setItem("tgai_lang", "en"); window.dispatchEvent(new CustomEvent("tgai_lang_change", { detail: { lang: "en" } })); }}
                className={`rounded-md px-2 py-0.5 transition-all ${lang === "en" ? "shadow-sm" : "opacity-40 hover:opacity-70"}`}
                style={lang === "en" ? { background: B.border } : {}}
              >
                <img src="https://flagcdn.com/w40/gb.png" width="24" height="16" alt="GB" style={{ display: "inline", borderRadius: "2px" }} />
              </button>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors"
              style={{ color: B.text }}
              aria-label={tx.nav_account_label}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
            <Link
              href="/cart"
              className="relative p-2 rounded-full transition-colors"
              style={{ color: B.text }}
              aria-label="Voir le panier"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <a
              href="#mission"
              className="hidden sm:block font-semibold px-5 py-2 rounded-full text-sm shadow-sm text-white transition-all"
              style={{ background: B.accent }}
            >
              {tx.nav_cta}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-36 overflow-hidden" style={{ background: B.bg }}>
        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[700px] h-[700px] rounded-full" style={{ border: `1px solid ${B.accentFaint}` }} />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] rounded-full" style={{ border: `1px solid rgba(59,130,246,0.07)` }} />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[300px] h-[300px] rounded-full" style={{ background: "rgba(59,130,246,0.04)" }} />
          <div className="absolute bottom-0 left-0 w-full h-24" style={{ background: `linear-gradient(to top, ${B.bg}99, transparent)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full py-16">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
              style={{ background: B.accentFaint, border: `1px solid ${B.accentBorder}` }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: B.accent }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: B.accent }}>{tx.hero_badge_ai}</span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight sm:leading-none mb-5 sm:mb-6"
              style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {tx.hero_title}
            </h1>
            <p className="text-base sm:text-xl max-w-lg leading-relaxed mb-8 sm:mb-10 font-medium" style={{ color: B.muted }}>
              {tx.hero_sub}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a
                href="#mission"
                className="font-bold px-8 py-4 rounded-full text-base text-white text-center transition-all hover:scale-105 shadow-[0_8px_30px_rgba(59,130,246,0.3)]"
                style={{ background: `linear-gradient(135deg, ${B.accent}, #6366f1)` }}
              >
                {tx.hero_cta} →
              </a>
              <p className="text-sm text-center sm:text-left" style={{ color: B.faint }}>{tx.hero_sub_cta}</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10">
              {[
                { val: "48h", label: tx.hero_badge_delivery },
                { val: "100%", label: tx.hero_badge_custom },
                { val: "4.9★", label: tx.hero_badge_rating },
              ].map((b, i) => (
                <div key={b.label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8" style={{ background: B.border }} />}
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>{b.val}</div>
                    <div className="text-xs" style={{ color: B.faint }}>{b.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="relative hidden sm:flex justify-center lg:justify-end">
            <div className="relative">
              <div
                className="rounded-2xl w-full max-w-[340px] overflow-hidden"
                style={{ background: B.card, border: `1px solid ${B.border}` }}
              >
                <div className="px-6 py-5" style={{ background: B.cardDeep, borderBottom: `1px solid ${B.border}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: B.veryFaint }}>Travel Business IA</span>
                    <span className="font-bold text-base" style={{ color: B.accent, fontFamily: "var(--font-playfair), Georgia, serif" }}>Pro</span>
                  </div>
                  <div className="text-2xl font-bold mb-0.5" style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>Frankfurt</div>
                  <div className="text-xs mb-4" style={{ color: B.muted }}>{tx.hero_card_subtitle}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md" style={{ background: B.accentFaint, border: `1px solid ${B.accentBorder}`, color: B.accent }}>{tx.hero_card_tag1}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md" style={{ background: B.accentFaint, border: `1px solid ${B.accentBorder}`, color: B.accent }}>{tx.hero_card_tag2}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>{tx.hero_card_tag3}</span>
                  </div>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {tx.hero_card_days.map((item) => (
                    <div key={item.day} className="flex items-start gap-3">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.day}
                      </span>
                      <div>
                        <div className="text-sm font-semibold leading-tight" style={{ color: B.text }}>{item.title}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: B.faint }}>{item.sub}</div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] pt-1" style={{ color: B.veryFaint }}>{tx.hero_card_more}</div>
                </div>
                <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${B.border}` }}>
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: B.veryFaint }}>PDF</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: B.veryFaint }}>{tx.hero_card_delivery}</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: B.veryFaint }}>IA entraînée</span>
                </div>
              </div>
              <div
                className="absolute -top-2.5 -right-2.5 text-white text-[10px] font-bold px-3 py-1 rounded-full"
                style={{ background: B.accent }}
              >
                {tx.hero_card_label}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,50,0.85) 0%, rgba(8,8,40,0.78) 50%, rgba(8,8,50,0.88) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,30,0.4) 100%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-18">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: B.accent }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: B.accent }}>
                {lang === "fr" ? "3 étapes simples" : "3 simple steps"}
              </span>
            </div>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {tx.how_title}
            </h2>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{tx.how_sub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-8 mt-14">
            {tx.how_steps.map((step) => (
              <div
                key={step.n}
                className="group rounded-2xl p-8 text-center transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <div
                  className="font-black text-5xl leading-none mb-6 transition-colors"
                  style={{ color: `rgba(59,130,246,0.7)`, fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {step.n}
                </div>
                <h3
                  className="text-xl font-bold mb-3 text-white"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO FLOWS */}
      <section id="mission" className="py-14 sm:py-20 px-4 sm:px-6" style={{ background: B.cardDeep }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
              style={{ background: B.border, border: `1px solid ${B.faint}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: B.accent }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: B.accent }}>{tx.flows_badge}</span>
            </div>
            <h2
              className="text-2xl sm:text-4xl font-bold mb-3"
              style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {tx.flows_title}
            </h2>
            <p className="max-w-lg mx-auto text-sm leading-relaxed" style={{ color: B.muted }}>{tx.flows_sub}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Flow 1 */}
            <div
              className="rounded-3xl p-8 transition-all duration-300"
              style={{ border: `1px solid ${B.border}`, background: B.card }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: B.border }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={B.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {tx.flow1_title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: B.muted }}>{tx.flow1_desc}</p>
              <ul className="space-y-1.5 mb-6 text-sm" style={{ color: B.muted }}>
                {tx.flow1_features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="font-bold text-xs" style={{ color: B.accent }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a
                href="/business/questionnaire"
                className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full text-sm text-white transition-all hover:scale-105"
                style={{ background: B.dark1 }}
              >
                {tx.flow1_cta}
              </a>
            </div>
            {/* Flow 2 */}
            <div
              className="rounded-3xl p-8 transition-all duration-300"
              style={{ border: `1px solid ${B.accentBorder}`, background: B.card }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: B.accentFaint }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={B.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {tx.flow2_title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: B.muted }}>{tx.flow2_desc}</p>
              <ul className="space-y-1.5 mb-6 text-sm" style={{ color: B.muted }}>
                {tx.flow2_features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="font-bold text-xs" style={{ color: B.accent }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a
                href="/business/questionnaire"
                className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full text-sm text-white transition-all hover:scale-105"
                style={{ background: B.accent }}
              >
                {tx.flow2_cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL EXAMPLES */}
      <section className="py-14 sm:py-24 px-4 sm:px-6" style={{ background: B.cardDeep }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {tx.examples_title}
            </h2>
            <p className="max-w-lg mx-auto text-sm" style={{ color: B.muted }}>{tx.examples_sub}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cover mockup */}
            <div
              className="text-white rounded-2xl overflow-hidden shadow-2xl p-8 min-h-[480px] flex flex-col justify-between relative"
              style={{ background: `linear-gradient(160deg, ${B.dark1} 0%, ${B.dark2} 60%, #0a0a1a 100%)` }}
            >
              {/* Background geometric accents */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full border-[80px] translate-x-1/3 -translate-y-1/3" style={{ borderColor: "rgba(59,130,246,0.06)" }} />
                <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full border-[50px] -translate-x-1/4 translate-y-1/4" style={{ borderColor: "rgba(59,130,246,0.04)" }} />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
              </div>
              <div className="relative">
                {/* Header bar */}
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[9px] font-mono tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {tx.example_cover_mono}
                  </div>
                  <div className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.25)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.4)" }}>
                    {lang === "fr" ? "GUIDE OFFICIEL" : "OFFICIAL GUIDE"}
                  </div>
                </div>
                {/* City icon */}
                <div className="mb-5 w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <h3 className="text-5xl font-bold leading-tight mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {tx.example_cover_city}
                </h3>
                <div className="text-base mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>{tx.example_cover_country}</div>
                <div className="text-sm font-semibold mb-5" style={{ color: B.accent }}>{tx.example_cover_type}</div>
                {/* Mission details */}
                <div className="space-y-2">
                  {[
                    { label: lang === "fr" ? "Référence" : "Reference", val: "TBM-2024-0847" },
                    { label: lang === "fr" ? "Objectif" : "Objective", val: lang === "fr" ? "Messe Frankfurt — IAA 2024" : "Messe Frankfurt — IAA 2024" },
                    { label: lang === "fr" ? "Hôtel" : "Hotel", val: lang === "fr" ? "Hôtel d'affaires — 4★ Centre" : "Business Hotel — 4★ Centre" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-[9px] uppercase tracking-widest w-20 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{row.label}</span>
                      <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="flex gap-3 mb-5 flex-wrap">
                  {[
                    { val: "3", label: tx.example_cover_days_label },
                    { val: "2", label: tx.example_cover_travelers_label },
                    { val: "€180", label: tx.example_cover_budget_label },
                    { val: lang === "fr" ? "4★" : "4★", label: lang === "fr" ? "Hôtel" : "Hotel" },
                  ].map((b) => (
                    <div key={b.label} className="rounded-lg px-3 py-2 text-center flex-1 min-w-[60px]" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)" }}>
                      <div className="font-bold text-sm" style={{ color: "#93c5fd" }}>{b.val}</div>
                      <div className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                    {tx.example_cover_generated}
                  </div>
                  <div className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)" }}>
                    {lang === "fr" ? "Livré — PDF" : "Delivered — PDF"}
                  </div>
                </div>
              </div>
            </div>

            {/* Day detail */}
            <div
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: B.card, border: `1px solid ${B.border}` }}
            >
              <div
                className="px-7 pt-7 pb-4"
                style={{ borderBottom: `2px solid ${B.accent}`, background: B.cardHeader }}
              >
                <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: B.accent }}>
                  {lang === "fr" ? "JOUR 2 — PROGRAMME COMPLET" : "DAY 2 — FULL SCHEDULE"}
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: B.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {lang === "fr" ? "Messe Frankfurt · Réunions & Networking" : "Messe Frankfurt · Meetings & Networking"}
                </h3>
                <div className="flex gap-3 mt-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: B.border, color: "#94a3b8" }}
                  >
                    {lang === "fr" ? "Budget estimé : ~€120/pers" : "Est. budget: ~€120/pp"}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: B.accentFaint, color: B.accent }}
                  >
                    {lang === "fr" ? "Badge Pro requis" : "Pro badge required"}
                  </span>
                </div>
              </div>

              <div className="px-7 py-5 space-y-0" style={{ background: B.card }}>
                {([
                  {
                    time: lang === "fr" ? "8h30" : "8:30am",
                    label: lang === "fr" ? "Matin" : "Morning",
                    title: lang === "fr" ? "Petit-déjeuner d'affaires — Café Metropol" : "Business Breakfast — Café Metropol",
                    desc: lang === "fr"
                      ? "Lieu de rendez-vous habituel des délégués de la Messe. Buffet continental + café filtre. Ambiance discrète, idéale pour un brief rapide avant l'ouverture."
                      : "Usual meeting spot for Messe delegates. Continental buffet + filter coffee. Discreet atmosphere, ideal for a quick brief before the show opens.",
                    tip: lang === "fr" ? "~€18/pers · Réservation recommandée la veille" : "~€18/pp · Reservation recommended the evening before",
                    tag: lang === "fr" ? "Pratique" : "Practical",
                    color: "#6b7a99",
                  },
                  {
                    time: lang === "fr" ? "10h00" : "10am",
                    label: lang === "fr" ? "Matin" : "Morning",
                    title: lang === "fr" ? "Conférence & Stands — Halle 4.1" : "Conference & Stands — Hall 4.1",
                    desc: lang === "fr"
                      ? "Secteur technologie et innovation. Priorisez les stands D12 (Google), E08 (SAP) et F22 (Siemens) selon votre secteur. Conférence keynote 11h salle Europa."
                      : "Technology and innovation sector. Prioritise stands D12 (Google), E08 (SAP) and F22 (Siemens) based on your sector. Keynote conference 11am in Europa hall.",
                    tip: lang === "fr" ? "Badge obligatoire · Vestiaire gratuit hall d'entrée" : "Badge required · Free cloakroom at entrance hall",
                    tag: "Business",
                    color: "#3b82f6",
                  },
                  {
                    time: lang === "fr" ? "13h00" : "1pm",
                    label: lang === "fr" ? "Déjeuner" : "Lunch",
                    title: lang === "fr" ? "Déjeuner client — Restaurant Metropol" : "Client Lunch — Restaurant Metropol",
                    desc: lang === "fr"
                      ? "Restaurant d'affaires à 5 min à pied. Cuisine européenne raffinée, cadre discret. Idéal pour un déjeuner de travail avec partenaires ou prospects. Menu d'affaires à €42."
                      : "Business restaurant 5 min walk away. Refined European cuisine, discreet setting. Ideal for working lunch with partners or prospects. Business menu at €42.",
                    tip: lang === "fr" ? "Réservation obligatoire · Parking souterrain à proximité" : "Reservation required · Underground parking nearby",
                    tag: lang === "fr" ? "Clients" : "Clients",
                    color: "#3b82f6",
                  },
                ] as const).slice(0, exampleExpanded ? 99 : 2).map((item, idx, arr) => (
                  <div key={item.time} className="flex gap-4 py-4" style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${B.border}` : "none" }}>
                    <div className="flex-shrink-0 w-12 text-right">
                      <div className="font-mono text-[10px] mt-1" style={{ color: B.veryFaint }}>{item.time}</div>
                    </div>
                    <div className="relative flex-shrink-0 flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: item.color }} />
                      {idx < arr.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: B.border }} />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: B.veryFaint }}>{item.label}</div>
                          <div className="font-bold text-sm" style={{ color: B.text }}>{item.title}</div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 text-white" style={{ backgroundColor: item.color }}>
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed mb-1.5" style={{ color: B.muted }}>{item.desc}</p>
                      <p className="text-[10px] font-medium px-2 py-1 rounded-lg" style={{ color: B.accent, background: B.accentFaint }}>{item.tip}</p>
                    </div>
                  </div>
                ))}

                {!exampleExpanded && (
                  <button
                    onClick={() => setExampleExpanded(true)}
                    className="w-full mt-2 mb-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-bold transition-colors"
                    style={{ borderColor: `${B.accent}50`, color: B.accent }}
                  >
                    <span className="text-lg leading-none">+</span>
                    {lang === "fr" ? "Voir la suite de la journée" : "Show rest of the day"}
                  </button>
                )}

                {exampleExpanded && (
                  <div className="mt-4 rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${B.dark1}, ${B.dark2})` }}>
                    <div className="text-[10px] font-mono tracking-widest opacity-60 mb-2">
                      {lang === "fr" ? "RÉCAPITULATIF JOUR 2" : "DAY 2 SUMMARY"}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: lang === "fr" ? "Budget" : "Budget", val: "~€120" },
                        { label: lang === "fr" ? "RDV" : "Meetings", val: "4" },
                        { label: "Transport", val: "U-Bahn" },
                      ].map(b => (
                        <div key={b.label} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.10)" }}>
                          <div className="font-bold text-sm" style={{ color: B.accent }}>{b.val}</div>
                          <div className="text-[9px] opacity-60 uppercase tracking-wide">{b.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 text-white" style={{ background: `linear-gradient(135deg, ${B.dark2}, ${B.dark1}, ${B.dark2})` }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {tx.social_title}
          </h2>
          <p className="text-base mb-16 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.60)" }}>{tx.social_subtitle}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {tx.social_stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl px-6 py-8 flex flex-col items-center gap-2 transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <span
                  className="text-3xl sm:text-5xl lg:text-6xl font-black leading-none"
                  style={{ color: B.accent, fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {stat.number}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.70)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section
        className="py-14 sm:py-24 px-4 sm:px-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${B.bg} 0%, ${B.dark2} 50%, ${B.bg} 100%)` }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 mx-auto mb-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
          </div>
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-5"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {tx.bottom_title}
          </h2>
          <p className="mb-10 text-base max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {tx.bottom_sub}
          </p>
          <a
            href="/business/questionnaire"
            className="inline-block font-semibold px-10 py-4 rounded-full text-base text-white transition-all hover:scale-105 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${B.accent}, #6366f1)` }}
          >
            {tx.hero_cta} →
          </a>
          <div className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>{tx.hero_sub_cta}</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6" style={{ borderTop: `1px solid ${B.border}`, background: B.bg }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm" style={{ color: B.veryFaint }}>
          <span
            className="font-bold text-base"
            style={{ color: B.muted, fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Travel Business IA
          </span>
          <span className="text-xs">{tx.footer_tagline}</span>
          <div className="flex items-center gap-4 text-xs">
            <a href="/cgv" className="underline underline-offset-2 transition-colors hover:opacity-70">
              {tx.footer_cgv}
            </a>
            <a href="/privacy" className="underline underline-offset-2 transition-colors hover:opacity-70">
              {tx.footer_privacy}
            </a>
            <a href="/contact" className="underline underline-offset-2 transition-colors hover:opacity-70">
              Contact
            </a>
            <span>{tx.footer_copy}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
