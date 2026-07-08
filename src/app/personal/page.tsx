"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";
import NewsletterPopup from "@/components/NewsletterPopup";
import RevealObserver from "@/components/RevealObserver";

type Lang = "fr" | "en";

type PhoneStatus = {
  loggedIn: boolean;
  email?: string;
  phone: string | null;
  phoneVerified: boolean;
  welcomeUsed: boolean;
};

const translations = {
  fr: {
    banner_messages: [
      "🏷️ -25% sur votre premier guide avec le code WELCOME",
      "✈️ Jusqu'à 6€ économisés · Livraison 24h · Sans abonnement",
      "🌍 Paris · Tokyo · Bali · Bangkok · New York · et bien plus",
    ],
    nav_cta: "Créer mon guide",
    hero_title: "TravelGuide",
    hero_sub: "Vous savez où aller — ou laissez l'IA vous suggérer la destination parfaite. Guide personnalisé, livré en PDF.",
    hero_cta: "Créer mon guide",
    hero_sub_cta: "À partir de 3€ · Sans abonnement · Livraison sous 24h",
    how_title: "Comment ça marche",
    how_steps: [
      {
        n: "01",
        title: "Dites-nous où partir",
        desc: "Vous avez déjà une destination ? Parfait. Sinon, laissez l'IA en suggérer une selon vos envies. 5 minutes.",
      },
      {
        n: "02",
        title: "L'IA rédige votre guide",
        desc: "Notre IA spécialisée génère un guide complet et personnalisé à votre profil de voyageur unique.",
      },
      {
        n: "03",
        title: "Recevez votre guide",
        desc: "PDF professionnel livré dans votre boîte mail sous 24h. Prêt à partir.",
      },
    ],
    pricing_title: "Choisissez votre aventure",
    pricing_sub:
      "Chaque plan inclut tout ce que comprend le plan précédent, plus des fonctionnalités supplémentaires.",
    gift_tooltip: "🏷️ -25% avec le code WELCOME",
    gift_unlocked_tooltip: "✅ Code WELCOME disponible !",
    plans: [
      {
        name: "Guide Express",
        duration: "3 jours",
        price: "3€",
        oldPrice: "5€",
        savings: "Économisez 2€",
        desc: "Parfait pour un city trip ou un week-end prolongé.",
        inherited: null,
        features: [
          "Itinéraire jour par jour",
          "Restaurants sélectionnés",
          "Activités incontournables",
          "Conseils pratiques (budget, météo, transport)",
          "Livraison PDF par email",
        ],
        popular: false,
        badge: null as null | { label: string; color: string },
        cta: "Choisir ce plan →",
        plan_key: "3j",
      },
      {
        name: "Guide Complet",
        duration: "7 jours",
        price: "6€",
        oldPrice: "9€",
        savings: "Économisez 3€",
        desc: "L'équilibre parfait pour une semaine de vacances.",
        inherited: "Tout le plan 3 jours +",
        features: [
          "Excursions depuis la ville",
          "Hébergements recommandés par quartier",
        ],
        popular: false,
        badge: null as null | { label: string; color: string },
        cta: "Choisir ce plan →",
        plan_key: "7j",
      },
      {
        name: "Guide Immersif",
        duration: "14 jours",
        price: "10€",
        oldPrice: "15€",
        savings: "Économisez 5€",
        desc: "Deux semaines pour une vraie immersion culturelle.",
        inherited: "Tout le plan 7 jours +",
        features: [
          "Carte interactive des points clés",
          "Itinéraire organisé par zones géographiques",
        ],
        popular: false,
        badge: { label: "🔮 Premium", color: "indigo" },
        cta: "Choisir ce plan →",
        plan_key: "14j",
      },
      {
        name: "Guide Évasion",
        duration: "1 mois",
        price: "16€",
        oldPrice: "22€",
        savings: "Économisez 6€",
        desc: "Pour digital nomads et globe-trotters.",
        inherited: "Tout le plan 14 jours +",
        features: [
          "Multi-destinations",
          "Planning semaine par semaine",
          "Conseils saisonnalité et évènements locaux",
        ],
        popular: true,
        badge: null as null | { label: string; color: string },
        cta: "Choisir ce plan →",
        plan_key: "1mois",
      },
    ],
    examples_title: "À quoi ressemble votre guide ?",
    examples_sub: "Un aperçu illustratif de la qualité et du niveau de détail que vous recevrez.",
    social_title: "Ils nous font confiance",
    social_subtitle: "Des milliers de voyageurs font confiance à TravelGuide pour planifier leurs aventures.",
    social_stats: [
      { number: "4.9★", label: "note moyenne" },
      { number: "2000+", label: "destinations" },
      { number: "24h", label: "livraison garantie" },
    ],
    bottom_title: "Prêt pour votre prochain voyage ?",
    bottom_sub: "Rejoignez des centaines de voyageurs qui ont optimisé leur aventure avec TravelGuide.",
    footer_tagline: "L'intelligence artificielle au service de vos aventures.",
    footer_copy: "© 2026 Travel IA",
    footer_cgv: "Conditions Générales de Vente",
    footer_privacy: "Politique de Confidentialité",
    hero_card_subtitle: "Japon · 7 jours",
    hero_card_tag1: "Culturel",
    hero_card_tag2: "Gastronomie",
    hero_card_tag3: "Confort",
    hero_card_days: [
      { day: "J1", title: "Shinjuku & Kabukicho", sub: "Arrivée + Ramen Ichiran + vue nocturne", color: "#C9A84C" },
      { day: "J2", title: "Asakusa & Temple Senso-ji", sub: "Marché Nakamise + Akihabara", color: "#C9A84C" },
      { day: "J3", title: "Harajuku & Shibuya", sub: "Takeshita St. + Carrefour légendaire", color: "#425B48" },
    ],
    hero_card_more: "+ 4 jours supplémentaires…",
    hero_card_delivery: "Livraison 24h",
    nav_account_label: "Mon compte",
    hero_badge_ai: "Propulsé par IA entraînée",
    hero_badge_delivery: "Livraison",
    hero_badge_custom: "Personnalisé",
    hero_badge_rating: "Satisfaction",
    hero_card_label: "Exemple réel",
    how_sub: "Simple, rapide, et entièrement personnalisé.",
    how_step_label: "ÉTAPE",
    plan_popular_badge: "Meilleure offre",
    example_cover_mono: "TRAVEL IA — GUIDE PERSONNEL EXCLUSIF",
    example_cover_country: "Japon",
    example_cover_type: "Guide Culturel & Gastronomique",
    example_cover_days_label: "jours",
    example_cover_travelers_label: "voyageurs",
    example_cover_budget_label: "budget/j",
    example_cover_generated: "Généré le 08/06/2026 · PDF · IA entraînée",
    example_day_mono: "JOUR 3 — PROGRAMME DÉTAILLÉ",
    example_day_desc: "Culture jeune, shopping & coucher de soleil urbain",
    example_day_items: [
      { time: "9h00", label: "Matin", title: "Sanctuaire Meiji Jingu", desc: "Arrivez tôt pour profiter du calme. La forêt de 70 000 arbres plantés en 1920 est saisissante. Entrée libre. Comptez 1h30.", tag: "Spirituel", tagColor: "#425B48" },
      { time: "11h00", label: "Matin", title: "Takeshita Street", desc: "Fashion underground, crepes géantes chez Daisy's Crepe, déco kawaii. L'âme créative de Tokyo jeune.", tag: "Shopping", tagColor: "#C9A84C" },
      { time: "14h00", label: "Après-midi", title: "Gyukatsu Motomura", desc: "Katsu de bœuf à tremper dans un bouillon dashi fumant. File de 20 min mais ça vaut chaque seconde. ~¥1 200.", tag: "Gastronomie", tagColor: "#C9A84C" },
    ],
    example_day_footer: "SOIRÉE · BUDGET DU JOUR · TRANSPORTS · HÉBERGEMENTS · +6 SECTIONS",
  },
  en: {
    banner_messages: [
      "🏷️ -25% on your first guide with code WELCOME",
      "✈️ Save up to €6 · 24h delivery · No subscription",
      "🌍 Paris · Tokyo · Bali · Bangkok · New York · and much more",
    ],
    nav_cta: "Create my guide",
    hero_title: "TravelGuide",
    hero_sub: "Know where you're going — or let the AI suggest your perfect destination. Personalised guide, delivered as PDF.",
    hero_cta: "Create my guide",
    hero_sub_cta: "From €3 · No subscription · Delivered in 24h",
    how_title: "How it works",
    how_steps: [
      {
        n: "01",
        title: "Tell us where to go",
        desc: "Already have a destination? Great. Or let the AI suggest one based on your wishes. 5 minutes.",
      },
      {
        n: "02",
        title: "AI writes your guide",
        desc: "Our specialized AI generates a complete guide personalized to your unique traveler profile.",
      },
      {
        n: "03",
        title: "Receive your guide",
        desc: "Professional PDF delivered to your inbox within 24h. Ready to explore.",
      },
    ],
    pricing_title: "Choose your adventure",
    pricing_sub: "Each plan includes everything from the previous plan, plus additional features.",
    gift_tooltip: "🏷️ -25% with code WELCOME",
    gift_unlocked_tooltip: "✅ WELCOME code available!",
    plans: [
      {
        name: "Express Guide",
        duration: "3 days",
        price: "€3",
        oldPrice: "€5",
        savings: "Save €2",
        desc: "Perfect for a city trip or long weekend.",
        inherited: null,
        features: [
          "Day-by-day itinerary",
          "Curated restaurants",
          "Must-do activities",
          "Practical tips (budget, weather, transport)",
          "PDF delivery by email",
        ],
        popular: false,
        badge: null as null | { label: string; color: string },
        cta: "Choose this plan →",
        plan_key: "3j",
      },
      {
        name: "Complete Guide",
        duration: "7 days",
        price: "€6",
        oldPrice: "€9",
        savings: "Save €3",
        desc: "The perfect balance for a vacation week.",
        inherited: "Everything in 3 days +",
        features: [
          "Day trips from the city",
          "Recommended neighborhoods & hotels",
        ],
        popular: false,
        badge: null as null | { label: string; color: string },
        cta: "Choose this plan →",
        plan_key: "7j",
      },
      {
        name: "Immersive Guide",
        duration: "14 days",
        price: "€10",
        oldPrice: "€15",
        savings: "Save €5",
        desc: "Two weeks for genuine cultural immersion.",
        inherited: "Everything in 7 days +",
        features: [
          "Interactive map of key highlights",
          "Itinerary organized by geographic zones",
        ],
        popular: false,
        badge: { label: "🔮 Premium", color: "indigo" },
        cta: "Choose this plan →",
        plan_key: "14j",
      },
      {
        name: "Escape Guide",
        duration: "1 month",
        price: "€16",
        oldPrice: "€22",
        savings: "Save €6",
        desc: "For digital nomads and globe-trotters.",
        inherited: "Everything in 14 days +",
        features: [
          "Multi-destination trips",
          "Week-by-week planning",
          "Seasonal tips & local events",
        ],
        popular: true,
        badge: null as null | { label: string; color: string },
        cta: "Choose this plan →",
        plan_key: "1mois",
      },
    ],
    examples_title: "What does your guide look like?",
    examples_sub: "An illustrative preview of the quality and level of detail you will receive.",
    social_title: "They trust us",
    social_subtitle: "Thousands of travelers trust TravelGuide to plan their adventures.",
    social_stats: [
      { number: "4.9★", label: "average rating" },
      { number: "2000+", label: "destinations" },
      { number: "24h", label: "delivery guaranteed" },
    ],
    bottom_title: "Ready for your next journey?",
    bottom_sub: "Join hundreds of travelers who have optimized their adventure with TravelGuide.",
    footer_tagline: "Artificial intelligence at the service of your adventures.",
    footer_copy: "© 2026 Travel IA",
    footer_cgv: "Terms of Sale",
    footer_privacy: "Privacy Policy",
    hero_card_subtitle: "Japan · 7 days",
    hero_card_tag1: "Cultural",
    hero_card_tag2: "Gastronomy",
    hero_card_tag3: "Comfort",
    hero_card_days: [
      { day: "D1", title: "Shinjuku & Kabukicho", sub: "Arrival + Ramen Ichiran + night view", color: "#C9A84C" },
      { day: "D2", title: "Asakusa & Senso-ji Temple", sub: "Nakamise Market + Akihabara", color: "#C9A84C" },
      { day: "D3", title: "Harajuku & Shibuya", sub: "Takeshita St. + Iconic Crossing", color: "#425B48" },
    ],
    hero_card_more: "+ 4 more days…",
    hero_card_delivery: "Delivery 24h",
    nav_account_label: "My account",
    hero_badge_ai: "Powered by trained AI",
    hero_badge_delivery: "Delivery",
    hero_badge_custom: "Personalized",
    hero_badge_rating: "Rating",
    hero_card_label: "Real example",
    how_sub: "Simple, fast, and fully personalized.",
    how_step_label: "STEP",
    plan_popular_badge: "Best value",
    example_cover_mono: "TRAVEL IA — YOUR EXCLUSIVE PERSONAL GUIDE",
    example_cover_country: "Japan",
    example_cover_type: "Cultural & Gastronomic Guide",
    example_cover_days_label: "days",
    example_cover_travelers_label: "travelers",
    example_cover_budget_label: "budget/d",
    example_cover_generated: "Generated 08/06/2026 · PDF · Trained AI",
    example_day_mono: "DAY 3 — DETAILED SCHEDULE",
    example_day_desc: "Youth culture, shopping & urban sunset",
    example_day_items: [
      { time: "9am", label: "Morning", title: "Meiji Jingu Shrine", desc: "Arrive early to enjoy the calm. The forest of 70,000 trees planted in 1920 is breathtaking. Free entry. Allow 1h30.", tag: "Spiritual", tagColor: "#425B48" },
      { time: "11am", label: "Morning", title: "Takeshita Street", desc: "Underground fashion, giant crepes at Daisy's Crepe, kawaii decor. The creative soul of young Tokyo.", tag: "Shopping", tagColor: "#C9A84C" },
      { time: "2pm", label: "Afternoon", title: "Gyukatsu Motomura", desc: "Beef katsu dipped in steaming dashi broth. 20-min queue but worth every second. ~¥1,200.", tag: "Gastronomy", tagColor: "#C9A84C" },
    ],
    example_day_footer: "EVENING · DAILY BUDGET · TRANSPORT · ACCOMMODATIONS · +6 SECTIONS",
  },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const [cartCount, setCartCount] = useState(0);
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>({ loggedIn: false, phone: null, phoneVerified: false, welcomeUsed: false });
  const [exampleExpanded, setExampleExpanded] = useState(false);
  const tx = translations[lang];

  useEffect(() => {
    localStorage.setItem("tgai_mode", "personal");
    document.documentElement.dataset.mode = "personal";
    const refreshCartCount = () => setCartCount(getCartCount());

    refreshCartCount();
    window.addEventListener(CART_UPDATED_EVENT, refreshCartCount);
    window.addEventListener("storage", refreshCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCartCount);
      window.removeEventListener("storage", refreshCartCount);
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

  useEffect(() => {
    let cancelled = false;

    fetch("/api/phone/status")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && data) setPhoneStatus(data);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  function trackCTA(location: string) {
    if (typeof window !== "undefined") {
      window.posthog?.capture("cta_clicked", { location, lang });
    }
  }

  function trackPurchase(planName: string, price: string) {
    if (typeof window !== "undefined") {
      window.posthog?.capture("purchase_started", { plan: planName, price, lang });
    }
  }

  return (
    <div className="min-h-screen text-[#425C47]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <NewsletterPopup />

      {/* LAUNCH BANNER */}
      <div className="banner-ticker-wrap fixed top-0 w-full z-[60] bg-gradient-to-r from-[#C9A84C] via-[#E8C060] to-[#C9A84C] text-[#425C47] overflow-hidden h-12 flex items-center justify-center cursor-default">
        <div className="animate-ticker whitespace-nowrap text-sm font-bold">
          {[...tx.banner_messages, ...tx.banner_messages].map((msg, i) => (
            <span key={i} className="inline-block px-10">{msg}</span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav className="fixed top-12 w-full z-50 bg-[#0e1310]/97 backdrop-blur-sm border-b border-[#232c20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#d8e3d5] transition-colors duration-200 hover:text-[#c9a84c]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            TravelGuide
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-[#232c20] rounded-lg p-0.5">
              <button
                onClick={() => { setLang("fr"); localStorage.setItem("tgai_lang", "fr"); window.dispatchEvent(new CustomEvent("tgai_lang_change", { detail: { lang: "fr" } })); }}
                title="Passer en français"
                className={`rounded-md px-2 py-0.5 transition-all ${lang === "fr" ? "bg-[#232c20] shadow-sm" : "opacity-40 hover:opacity-70"}`}
              >
                <img src="https://flagcdn.com/w40/fr.png" width="24" height="16" alt="FR" style={{display:"inline",borderRadius:"2px"}} />
              </button>
              <button
                onClick={() => { setLang("en"); localStorage.setItem("tgai_lang", "en"); window.dispatchEvent(new CustomEvent("tgai_lang_change", { detail: { lang: "en" } })); }}
                title="Switch to English"
                className={`rounded-md px-2 py-0.5 transition-all ${lang === "en" ? "bg-[#232c20] shadow-sm" : "opacity-40 hover:opacity-70"}`}
              >
                <img src="https://flagcdn.com/w40/gb.png" width="24" height="16" alt="GB" style={{display:"inline",borderRadius:"2px"}} />
              </button>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full hover:bg-[#232c20] transition-colors px-2 py-1.5 text-[#d8e3d5]"
              aria-label={tx.nav_account_label}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-[#232c20] transition-colors text-[#d8e3d5]"
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
              href="#pricing"
              onClick={() => trackCTA("nav")}
              className="bg-[#C9A84C] text-white font-semibold px-5 py-2 rounded-full hover:bg-[#B8962E] transition-all text-sm shadow-sm hidden sm:block"
            >
              {tx.nav_cta}
            </a>
          </div>
        </div>
      </nav>

      <RevealObserver />

      {/* HERO */}
      <section className="hero-bg relative min-h-screen flex items-center pt-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[700px] h-[700px] rounded-full border border-[#C9A84C]/10" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] rounded-full border border-[#C9A84C]/7" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[300px] h-[300px] rounded-full bg-[#C9A84C]/4" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0e1310]/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full py-16">
          <div>
            <div className="anim-h1 inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse-dot" />
              <span className="text-xs font-semibold text-[#C9A84C] tracking-wide">{tx.hero_badge_ai}</span>
            </div>
            <h1 className="anim-h2 text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight sm:leading-none mb-5 sm:mb-6 text-[#d8e3d5]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {tx.hero_title}
            </h1>
            <p className="anim-h3 text-base sm:text-xl text-[#7a9076] max-w-lg leading-relaxed mb-8 sm:mb-10 font-medium">{tx.hero_sub}</p>
            <div className="anim-h4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a href="#pricing" onClick={() => trackCTA("hero")}
                className="bg-gradient-to-br from-[#425C47] to-[#2e4133] text-white font-bold px-8 py-4 rounded-full hover:from-[#2e4133] hover:to-[#1f2e22] transition-all hover:scale-105 text-base shadow-[0_8px_30px_rgba(66,92,71,0.35)] text-center">
                {tx.hero_cta} →
              </a>
              <p className="text-sm text-[#4a6447] text-center sm:text-left">{tx.hero_sub_cta}</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10">
              {[
                { val: "24h", label: tx.hero_badge_delivery },
                { val: "100%", label: tx.hero_badge_custom },
                { val: "4.9★", label: tx.hero_badge_rating },
              ].map((b, i) => (
                <div key={b.label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8 bg-[#232c20]" />}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{b.val}</div>
                    <div className="text-xs text-[#4a6447]">{b.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden sm:flex justify-center lg:justify-end">
            <div className="relative">
              <div className="bg-[#161c14] rounded-2xl border border-[#232c20] w-full max-w-[340px] overflow-hidden">
                <div className="bg-[#111810] border-b border-[#232c20] px-6 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono text-[#3a5037] tracking-[0.2em] uppercase">TravelGuide</span>
                    <span className="text-[#C9A84C] font-bold text-base" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>6€</span>
                  </div>
                  <div className="text-2xl font-bold text-[#d8e3d5] mb-0.5" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Tokyo</div>
                  <div className="text-[#7a9076] text-xs mb-4">{tx.hero_card_subtitle}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="bg-[#1e2c1e] border border-[#2a3a2a] text-[#9ab896] text-[10px] px-2.5 py-0.5 rounded-md">{tx.hero_card_tag1}</span>
                    <span className="bg-[#1e2c1e] border border-[#2a3a2a] text-[#9ab896] text-[10px] px-2.5 py-0.5 rounded-md">{tx.hero_card_tag2}</span>
                    <span className="bg-[#c9a84c]/10 border border-[#c9a84c]/25 text-[#c9a84c] text-[10px] px-2.5 py-0.5 rounded-md">{tx.hero_card_tag3}</span>
                  </div>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {tx.hero_card_days.map((item) => (
                    <div key={item.day} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 text-white" style={{ backgroundColor: item.color }}>{item.day}</span>
                      <div>
                        <div className="text-sm font-semibold text-[#d8e3d5] leading-tight">{item.title}</div>
                        <div className="text-[11px] text-[#4a6447] mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] text-[#3a5037] pt-1">{tx.hero_card_more}</div>
                </div>
                <div className="border-t border-[#1e2c1e] px-6 py-3 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-[#3a5037] uppercase tracking-wider">PDF</span>
                  <span className="text-[9px] font-mono text-[#3a5037] uppercase tracking-wider">{tx.hero_card_delivery}</span>
                  <span className="text-[9px] font-mono text-[#3a5037] uppercase tracking-wider">IA entraînée</span>
                </div>
              </div>
              <div className="absolute -top-2.5 -right-2.5 bg-[#C9A84C] text-[#0e1310] text-[10px] font-bold px-3 py-1 rounded-full">{tx.hero_card_label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 text-white overflow-hidden">
        {/* Beach photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')" }}
        />
        {/* Gradient overlay — visible mais tamisé */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e1f]/82 via-[#1a2e1f]/72 to-[#1a2e1f]/85" />
        {/* Subtle vignette edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,20,12,0.4)_100%)]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="reveal text-center mb-18">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
              <span className="text-xs font-bold text-[#C9A84C] tracking-widest uppercase">
                {lang === "fr" ? "3 étapes simples" : "3 simple steps"}
              </span>
            </div>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {tx.how_title}
            </h2>
            <p className="text-white/60 max-w-xl mx-auto text-base leading-relaxed">{tx.how_sub}</p>
          </div>

          {/* Steps grid */}
          <div className="grid md:grid-cols-3 gap-5 lg:gap-8 mt-14">
            {tx.how_steps.map((step, idx) => (
              <div
                key={step.n}
                className={`reveal reveal-d${(idx + 1) as 1 | 2 | 3} group bg-white/8 hover:bg-white/13 border border-white/15 hover:border-white/25 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-[1.03]`}
              >
                <div className="font-black text-5xl text-[#C9A84C]/70 leading-none mb-6 group-hover:text-[#C9A84C] transition-colors"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {step.n}
                </div>
                <h3
                  className="text-xl font-bold mb-3 text-white"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO FLOWS */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#111810]">
        <div className="max-w-5xl mx-auto">
          <div className="reveal text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#232c20] border border-[#2a3527] rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#c9a84c] uppercase tracking-widest">
                {lang === "fr" ? "Deux façons de voyager" : "Two ways to travel"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#d8e3d5] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {lang === "fr" ? "Votre voyage, votre façon" : "Your trip, your way"}
            </h2>
            <p className="text-[#7a9076] max-w-lg mx-auto text-sm leading-relaxed">
              {lang === "fr"
                ? "Que vous sachiez déjà où aller ou non, TravelGuide s'adapte à vous."
                : "Whether you know where to go or not, TravelGuide adapts to you."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Q1 */}
            <div className="reveal reveal-d1 rounded-3xl border border-[#232c20] bg-[#161c14] p-8 hover:border-[#425C47] transition-all duration-300 hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-xl bg-[#232c20] flex items-center justify-center mb-5 group-hover:bg-[#2a3527] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3 className="text-xl font-bold text-[#d8e3d5] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {lang === "fr" ? "J'ai ma destination" : "I know where I'm going"}
              </h3>
              <p className="text-[#7a9076] text-sm leading-relaxed mb-5">
                {lang === "fr"
                  ? "Vous savez exactement où aller. L'IA crée un programme sur mesure : itinéraire jour par jour, restaurants, activités, budget, transports — tout adapté à votre profil."
                  : "You know exactly where to go. The AI creates a tailor-made programme: day-by-day itinerary, restaurants, activities, budget, transport — all adapted to your profile."}
              </p>
              <ul className="space-y-1.5 mb-6 text-sm text-[#7a9076]">
                {(lang === "fr"
                  ? ["+ 2 000 destinations disponibles","Programme adapté à votre budget","Conseils restaurants & hébergements","Itinéraire selon votre rythme"]
                  : ["2,000+ destinations available","Programme tailored to your budget","Restaurant & accommodation tips","Itinerary matching your pace"]
                ).map(f => <li key={f} className="flex items-center gap-2"><span className="text-[#C9A84C] font-bold text-xs">✓</span>{f}</li>)}
              </ul>
              <a href={`/questionnaire?lang=${lang}`}
                className="inline-flex items-center gap-2 bg-[#425C47] text-[#d8e3d5] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#2e4133] transition-all hover:scale-105">
                {lang === "fr" ? "Choisir ma destination →" : "Choose my destination →"}
              </a>
            </div>
            {/* Q2 */}
            <div className="reveal reveal-d2 rounded-3xl border border-[#c9a84c]/20 bg-[#161c14] p-8 hover:border-[#C9A84C]/50 transition-all duration-300 hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center mb-5 group-hover:bg-[#c9a84c]/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-[#d8e3d5] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {lang === "fr" ? "Où partir ?" : "Where should I go?"}
              </h3>
              <p className="text-[#7a9076] text-sm leading-relaxed mb-5">
                {lang === "fr"
                  ? "Vous n'avez pas encore choisi. Décrivez vos envies — climat, ambiance, budget, durée — et l'IA vous suggère les meilleures destinations, puis crée le guide complet."
                  : "You haven't decided yet. Describe your wishes — climate, mood, budget, duration — and the AI suggests the best destinations, then creates the full guide."}
              </p>
              <ul className="space-y-1.5 mb-6 text-sm text-[#7a9076]">
                {(lang === "fr"
                  ? ["Suggestions personnalisées par IA","Filtres : plage, montagne, ville, aventure…","Budget, durée de vol, langues parlées","Un lieu ou road trip — vous choisissez"]
                  : ["AI-powered personalised suggestions","Filters: beach, mountain, city, adventure…","Budget, flight time, languages spoken","One place or road trip — your choice"]
                ).map(f => <li key={f} className="flex items-center gap-2"><span className="text-[#C9A84C] font-bold text-xs">✓</span>{f}</li>)}
              </ul>
              <a href={`/questionnaire?lang=${lang}`}
                className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0e1310] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#B8962E] transition-all hover:scale-105">
                {lang === "fr" ? "Trouver ma destination →" : "Find my destination →"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="scroll-mt-28 py-14 sm:py-24 px-4 sm:px-6 bg-pattern-light" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="reveal text-center mb-16">
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 text-[#d8e3d5]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {tx.pricing_title}
            </h2>
            <p className="text-[#7a9076] max-w-2xl mx-auto text-sm leading-relaxed">{tx.pricing_sub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tx.plans.map((plan, pIdx) => {
              const isInverted = plan.popular;
              const isGiftPlan = !phoneStatus.welcomeUsed; // disparaît si déjà utilisé
              const giftUnlocked = phoneStatus.loggedIn && phoneStatus.phoneVerified && !phoneStatus.welcomeUsed;
              const giftTooltip = giftUnlocked ? tx.gift_unlocked_tooltip : tx.gift_tooltip;
              return (
                <div
                  key={plan.name}
                  className={`reveal reveal-d${Math.min(pIdx + 1, 4) as 1|2|3|4} relative rounded-2xl p-6 border flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 ${
                    isInverted
                      ? "bg-gradient-to-br from-[#1e3324] to-[#162818] text-white border-[#2a4433] shadow-[0_8px_32px_rgba(66,92,71,0.3)]"
                      : "bg-[#161c14] text-[#d8e3d5] border-[#232c20]"
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A84C] text-white text-[11px] font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      ★ {tx.plan_popular_badge}
                    </div>
                  )}
                  {/* Gift badge */}
                  {isGiftPlan && (
                    <div className="group absolute right-3 top-3 z-10">
                      <div
                        tabIndex={0}
                        title={giftTooltip}
                        aria-label={giftTooltip}
                        className={`gift-badge flex h-10 w-10 items-center justify-center rounded-full border text-lg shadow-lg outline-none transition focus:ring-2 focus:ring-[#c9a84c]/40 ${
                          giftUnlocked
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-[#c9a84c]/30 bg-[#fdf8f0] text-[#c9a84c]"
                        }`}
                      >
                        🎁
                      </div>
                      <div className="pointer-events-none absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#c9a84c]/25 bg-[#fdf8f0] px-3 py-2 text-xs font-bold text-[#7a5d19] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:top-auto sm:bottom-full sm:mb-2 sm:mt-0">
                        {giftTooltip}
                      </div>
                    </div>
                  )}

                  {/* Premium badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-4 py-1 rounded-full ${
                          plan.badge.color === "indigo"
                            ? "bg-[#425C47] text-white"
                            : "bg-[#C9A84C] text-white"
                        }`}
                      >
                        {plan.badge.label}
                      </span>
                    </div>
                  )}

                  <div className={`text-xs font-mono tracking-wide mb-1 ${isInverted ? "text-white/45" : "text-[#4a6447]"}`}>
                    {plan.duration.toUpperCase()}
                  </div>

                  {/* Price display */}
                  <div className="mb-4">
                    <div className="flex items-end gap-2">
                      <span className={`text-sm line-through ${isInverted ? "text-white/40" : "text-gray-400"}`}>{plan.oldPrice}</span>
                      <span
                        className="text-5xl font-bold text-[#C9A84C]"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                      >
                        {plan.price}
                      </span>
                    </div>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                        isInverted ? "bg-white/10 text-[#E8C060]" : "bg-[#C9A84C]/10 text-[#c9a84c]"
                      }`}
                    >
                      {plan.savings}
                    </span>
                  </div>

                  <div className="font-semibold text-base mb-4">{plan.name}</div>
                  <p className={`text-sm leading-relaxed mb-6 ${isInverted ? "text-white/65" : "text-[#7a9076]"}`}>
                    {plan.desc}
                  </p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.inherited && (
                      <li className="text-sm flex items-center gap-2 font-medium mb-3 text-[#C9A84C]">
                        <span className="text-[#C9A84C] font-bold text-xs">↑</span>
                        {plan.inherited}
                      </li>
                    )}
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`text-sm flex items-center gap-2 ${isInverted ? "text-white/80" : "text-[#7a9076]"}`}
                      >
                        <span className="text-[#C9A84C] font-bold text-xs">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`/questionnaire?plan=${plan.plan_key}&lang=${lang}`}
                    onClick={() => trackPurchase(plan.name, plan.price)}
                    className={`block w-full text-center font-semibold py-3 rounded-xl transition-all hover:scale-105 text-sm ${
                      isInverted
                        ? "bg-[#C9A84C] text-[#0e1310] hover:bg-[#B8962E]"
                        : "bg-[#425C47] text-[#d8e3d5] hover:bg-[#2e4133]"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VISUAL EXAMPLES */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 bg-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 text-[#d8e3d5]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {tx.examples_title}
            </h2>
            <p className="text-[#7a9076] max-w-lg mx-auto text-sm">{tx.examples_sub}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cover mockup */}
            <div className="bg-[#425C47] text-white rounded-2xl overflow-hidden shadow-2xl p-10 min-h-[480px] flex flex-col justify-between relative">
              <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full border-[60px] border-white -translate-y-1/3 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-[40px] border-white translate-y-1/3 -translate-x-1/3" />
              </div>
              <div className="relative">
                <div className="text-[10px] font-mono tracking-widest text-white/30 mb-10">
                  {tx.example_cover_mono}
                </div>
                <div className="text-7xl mb-5">🇯🇵</div>
                <h3
                  className="text-6xl font-bold leading-none mb-2"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Tokyo
                </h3>
                <div className="text-white/50 text-lg mb-1">{tx.example_cover_country}</div>
                <div className="text-[#C9A84C] text-sm font-medium italic">{tx.example_cover_type}</div>
              </div>
              <div className="relative">
                <div className="flex gap-3 mb-6 flex-wrap">
                  {[
                    { val: "7", label: tx.example_cover_days_label },
                    { val: "2", label: tx.example_cover_travelers_label },
                    { val: "€150", label: tx.example_cover_budget_label },
                  ].map((b) => (
                    <div key={b.label} className="bg-white/8 rounded-lg px-4 py-2.5 text-center border border-white/10">
                      <div className="font-bold text-sm">{b.val}</div>
                      <div className="text-[10px] text-white/40">{b.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-white/25 font-mono">
                  {tx.example_cover_generated}
                </div>
              </div>
            </div>

            {/* Jour 1 complet — scrollable */}
            <div className="bg-[#161c14] rounded-2xl overflow-hidden border border-[#232c20] flex flex-col">
              {/* Header sticky */}
              <div className="border-b-2 border-[#C9A84C] px-7 pt-7 pb-4 bg-[#1a2418]">
                <div className="text-[10px] font-mono text-[#C9A84C] tracking-widest mb-1">
                  {lang === "fr" ? "JOUR 1 — PROGRAMME COMPLET" : "DAY 1 — FULL SCHEDULE"}
                </div>
                <h3 className="text-xl font-bold text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {lang === "fr" ? "Arrivée à Tokyo · Shinjuku & Kabukicho" : "Arrival in Tokyo · Shinjuku & Kabukicho"}
                </h3>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] bg-[#232c20] text-[#b8cdb4] px-2 py-0.5 rounded-full font-semibold">
                    {lang === "fr" ? "Budget estimé : ~¥8 500 (~55€)" : "Est. budget: ~¥8,500 (~€55)"}
                  </span>
                  <span className="text-[10px] bg-[#C9A84C]/10 text-[#c9a84c] px-2 py-0.5 rounded-full font-semibold">
                    {lang === "fr" ? "IC Card recommandée" : "IC Card recommended"}
                  </span>
                </div>
              </div>

              {/* Timeline scrollable */}
              <div className="px-7 py-5 space-y-0 bg-[#161c14]">
                {([
                  {
                    time: lang === "fr" ? "9h00" : "9am",
                    label: lang === "fr" ? "Matin" : "Morning",
                    title: lang === "fr" ? "Arrivée & Petit-déjeuner" : "Arrival & Breakfast",
                    desc: lang === "fr"
                      ? "Déposez vos bagages à l'hôtel (check-in souvent possible dès 9h). Direction le konbini (7-Eleven) du coin pour un onigiri au saumon et un café chaud — expérience 100% japonaise."
                      : "Drop luggage at hotel (early check-in often possible from 9am). Head to the nearest konbini (7-Eleven) for a salmon onigiri and hot coffee — a true Japanese experience.",
                    tip: lang === "fr" ? "💡 Tip : prenez votre IC Card à la machine dès l'aéroport. ~¥500" : "💡 Tip: Get your IC Card at the airport machine. ~¥500",
                    tag: lang === "fr" ? "Pratique" : "Practical",
                    color: "#94a3b8",
                  },
                  {
                    time: lang === "fr" ? "10h30" : "10:30am",
                    label: lang === "fr" ? "Matin" : "Morning",
                    title: lang === "fr" ? "Sanctuaire Meiji Jingu" : "Meiji Jingu Shrine",
                    desc: lang === "fr"
                      ? "Forêt de 70 000 arbres au cœur de Tokyo. Le calme absolu à 15 min du chaos de Shinjuku. Arrivez tôt pour éviter les groupes. La grande torii en bois de cyprès est saisissante. Entrée libre, comptez 1h."
                      : "Forest of 70,000 trees in the heart of Tokyo. Absolute calm, 15min from Shinjuku chaos. Arrive early to avoid tour groups. The large cypress torii is breathtaking. Free entry, allow 1h.",
                    tip: lang === "fr" ? "💡 Tip : tradition du vœu sur ema (tablette en bois) ~¥500. Ne pas photographier les mariages." : "💡 Tip: Write a wish on an ema wooden tablet ~¥500. Don't photograph weddings.",
                    tag: lang === "fr" ? "Spirituel" : "Spiritual",
                    color: "#425B48",
                  },
                  {
                    time: lang === "fr" ? "12h00" : "12pm",
                    label: lang === "fr" ? "Midi" : "Lunch",
                    title: lang === "fr" ? "Déjeuner : Ramen Ichiran Shinjuku" : "Lunch: Ramen Ichiran Shinjuku",
                    desc: lang === "fr"
                      ? "Ramen en cabine individuelle — le concept unique d'Ichiran. Commandez via formulaire, choisissez l'intensité du bouillon, la dureté des nouilles. File d'attente ~20min mais ça vaut absolument chaque seconde. Bouillon de porc tonkotsu crémeux."
                      : "Individual booth ramen — Ichiran's unique concept. Order via form, choose broth intensity and noodle firmness. Queue ~20min but absolutely worth every second. Creamy tonkotsu pork broth.",
                    tip: lang === "fr" ? "💡 ~¥1 500/pers · Ajoutez un œuf et une portion supplémentaire de nouilles (+¥200)" : "💡 ~¥1,500/pp · Add an egg and extra noodle portion (+¥200)",
                    tag: lang === "fr" ? "Gastronomie" : "Gastronomy",
                    color: "#C9A84C",
                  },
                  {
                    time: lang === "fr" ? "13h30" : "1:30pm",
                    label: lang === "fr" ? "Après-midi" : "Afternoon",
                    title: "Takeshita Street · Harajuku",
                    desc: lang === "fr"
                      ? "La rue la plus folle de Tokyo : fashion underground, crepes géantes, déco kawaii et cosplay. Ambiance unique au monde. Idéal pour observer la culture jeune japonaise. Évitez le week-end si vous n'aimez pas la foule."
                      : "Tokyo's craziest street: underground fashion, giant crepes, kawaii decor and cosplay. A globally unique atmosphere. Great for observing Japanese youth culture. Avoid weekends if you dislike crowds.",
                    tip: lang === "fr" ? "💡 Crepe chez Daisy's Crepe ~¥700 · La rue fait 350m, comptez 45min" : "💡 Crepe at Daisy's Crepe ~¥700 · The street is 350m, allow 45min",
                    tag: lang === "fr" ? "Shopping" : "Shopping",
                    color: "#C9A84C",
                  },
                  {
                    time: lang === "fr" ? "15h00" : "3pm",
                    label: lang === "fr" ? "Après-midi" : "Afternoon",
                    title: lang === "fr" ? "Carrefour de Shibuya" : "Shibuya Crossing",
                    desc: lang === "fr"
                      ? "Le carrefour le plus photographié du monde — jusqu'à 2 500 personnes traversent simultanément. Vue plongeante depuis le café Starbucks Reserve Roastery (niveau 1, baie vitrée) ou gratuitement depuis la terrasse du Scramble Square (gratuit depuis la rue, payant depuis le toit)."
                      : "The world's most photographed crossing — up to 2,500 people crossing simultaneously. Aerial view from Starbucks Reserve Roastery (level 1, bay window) or free from Scramble Square terrace.",
                    tip: lang === "fr" ? "💡 Meilleure heure : 17h-19h à la tombée de la nuit (lumières + foule)" : "💡 Best time: 5-7pm at dusk (lights + crowd)",
                    tag: lang === "fr" ? "Iconique" : "Iconic",
                    color: "#7c3aed",
                  },
                  {
                    time: lang === "fr" ? "17h30" : "5:30pm",
                    label: lang === "fr" ? "Fin d'après-midi" : "Late afternoon",
                    title: lang === "fr" ? "Tokyo Skytree ou Shinjuku Gyoen" : "Tokyo Skytree or Shinjuku Gyoen",
                    desc: lang === "fr"
                      ? "Option A (vue) : montez au Tokyo Skytree (634m, la plus haute tour du monde) pour un panorama à 360° sur la ville. Option B (zen) : le Shinjuku Gyoen, jardin impérial mixant styles japonais, français et anglais. Plus reposant après une journée chargée."
                      : "Option A (view): Tokyo Skytree (634m, world's tallest tower) for 360° panorama. Option B (zen): Shinjuku Gyoen, imperial garden mixing Japanese, French and English styles. More relaxing after a busy day.",
                    tip: lang === "fr" ? "💡 Skytree ~¥2 100 · Shinjuku Gyoen ~¥500 · Fermé le lundi" : "💡 Skytree ~¥2,100 · Shinjuku Gyoen ~¥500 · Closed Mondays",
                    tag: lang === "fr" ? "Vue" : "View",
                    color: "#0891b2",
                  },
                  {
                    time: lang === "fr" ? "19h30" : "7:30pm",
                    label: lang === "fr" ? "Soirée" : "Evening",
                    title: lang === "fr" ? "Dîner : Izakaya à Kabukicho" : "Dinner: Izakaya in Kabukicho",
                    desc: lang === "fr"
                      ? "Quartier animé de Shinjuku. Choisissez un izakaya (bar-restaurant japonais typique) pour partager yakitoris, edamame, karaage et gyozas entre amis. Ambiance décontractée, budget raisonnable. La rue Omoide Yokocho (\"ruelle des souvenirs\") propose des petites brochettes de poulet grillé fumant à ~¥200 pièce."
                      : "Animated Shinjuku district. Choose an izakaya (typical Japanese bar-restaurant) to share yakitori, edamame, karaage and gyoza. Relaxed atmosphere, reasonable budget. Omoide Yokocho (\"Memory Lane\") offers grilled chicken skewers for ~¥200 each.",
                    tip: lang === "fr" ? "💡 Budget dîner + boissons : ~¥2 500-3 500/pers · Réservation non nécessaire" : "💡 Dinner + drinks budget: ~¥2,500-3,500/pp · No reservation needed",
                    tag: lang === "fr" ? "Soirée" : "Evening",
                    color: "#C9A84C",
                  },
                ] as const).slice(0, exampleExpanded ? 99 : 2).map((item, idx, arr) => (
                  <div key={item.time} className="flex gap-4 py-4 border-b border-[#1e2b1c] last:border-0">
                    <div className="flex-shrink-0 w-12 text-right">
                      <div className="font-mono text-[10px] text-[#3a5037] mt-1">{item.time}</div>
                    </div>
                    <div className="relative flex-shrink-0 flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: item.color }} />
                      {idx < arr.length - 1 && <div className="w-px flex-1 bg-[#232c20] mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="text-[9px] text-[#3a5037] uppercase tracking-wide mb-0.5">{item.label}</div>
                          <div className="font-bold text-sm text-[#d8e3d5]">{item.title}</div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 text-white" style={{ backgroundColor: item.color }}>
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#7a9076] leading-relaxed mb-1.5">{item.desc}</p>
                      <p className="text-[10px] text-[#C9A84C] font-medium bg-[#C9A84C]/8 px-2 py-1 rounded-lg">{item.tip}</p>
                    </div>
                  </div>
                ))}

                {!exampleExpanded && (
                  <button
                    onClick={() => setExampleExpanded(true)}
                    className="w-full mt-2 mb-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#C9A84C]/30 py-3 text-sm font-bold text-[#C9A84C] hover:bg-[#C9A84C]/8 transition-colors"
                  >
                    <span className="text-lg leading-none">+</span>
                    {lang === "fr" ? "Voir les 4 étapes suivantes" : "Show 4 more steps"}
                  </button>
                )}

                {/* Budget du jour */}
                {exampleExpanded && (
                  <div className="mt-4 rounded-xl bg-[#425C47] text-white p-4">
                    <div className="text-[10px] font-mono tracking-widest opacity-60 mb-2">
                      {lang === "fr" ? "RÉCAPITULATIF JOUR 1" : "DAY 1 SUMMARY"}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: lang === "fr" ? "Budget" : "Budget", val: "~55€" },
                        { label: lang === "fr" ? "Activités" : "Activities", val: "7" },
                        { label: lang === "fr" ? "Transport" : "Transport", val: "IC Card" },
                      ].map(b => (
                        <div key={b.label} className="bg-white/10 rounded-lg p-2">
                          <div className="font-bold text-sm text-[#C9A84C]">{b.val}</div>
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
      <section className="py-14 sm:py-24 px-4 sm:px-6" style={{ background: "var(--ch)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}
          >
            {tx.social_title}
          </h2>
          <p className="text-base mb-16 max-w-xl mx-auto" style={{ color: "var(--cm)" }}>{tx.social_subtitle}</p>

          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {tx.social_stats.map((stat, sIdx) => (
              <div
                key={stat.label}
                className={`reveal-scale reveal-scale-d${(sIdx + 1) as 1|2|3} rounded-2xl px-6 py-8 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 cursor-default`}
                style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}
              >
                <span
                  className="text-3xl sm:text-5xl lg:text-6xl font-black leading-none"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ca)" }}
                >
                  {stat.number}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--cm)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#1a2e1f] via-[#2e4133] to-[#1a2e1f] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2 3.5 6.5l7 4L7 14l-2 0-1.5 1.5 2.5 1.5L7.5 19.5 9 21l1.5-1.5 0-2 3.5-3.5 4 7z"/>
            </svg>
          </div>
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-5"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {tx.bottom_title}
          </h2>
          <p className="text-white/55 mb-10 text-base max-w-lg mx-auto leading-relaxed">{tx.bottom_sub}</p>
          <a
            href="#pricing"
            onClick={() => trackCTA("bottom_cta")}
            className="inline-block bg-[#C9A84C] text-white font-semibold px-10 py-4 rounded-full hover:bg-[#B8962E] transition-all hover:scale-105 text-base shadow-lg"
          >
            {tx.hero_cta} →
          </a>
          <div className="mt-4 text-white/30 text-xs">{tx.hero_sub_cta}</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-[#232c20] bg-[#0e1310]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#3a5037]">
          <span
            className="font-bold text-[#7a9076] text-base"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            TravelGuide
          </span>
          <span className="text-xs">{tx.footer_tagline}</span>
          <div className="flex items-center gap-4 text-xs">
            <a href="/cgv" className="hover:text-[#b8cdb4] underline underline-offset-2 transition-colors">
              {tx.footer_cgv}
            </a>
            <a href="/privacy" className="hover:text-[#b8cdb4] underline underline-offset-2 transition-colors">
              {tx.footer_privacy}
            </a>
            <a href="/contact" className="hover:text-[#b8cdb4] underline underline-offset-2 transition-colors">
              {lang === "fr" ? "Contact" : "Contact"}
            </a>
            <span>{tx.footer_copy}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
