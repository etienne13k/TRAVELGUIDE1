"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";

export default function BusinessPage() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCartCount(getCartCount());
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        background: "#08080d",
        color: "#e2e8f0",
      }}
    >
      {/* Top accent line */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg,#1e3a8a,#3b82f6,#6366f1,#3b82f6,#1e3a8a)" }} />

      {/* Nav */}
      <header style={{ borderBottom: "1px solid #1a1a2e", background: "#08080d" }} className="sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#5b8af5" }}>Travel</span>
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#e2e8f0" }}>Business</span>
            </Link>
            <span style={{ width: 1, height: 16, background: "#1a1a2e", display: "inline-block" }} />
            <Link href="/" className="text-xs" style={{ color: "#4a5568" }}>
              ← Mode personnel
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-xs" style={{ color: "#6b7a99" }}>Mon compte</Link>
            <Link href="/cart" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid #1a1a2e", color: "#6b7a99" }}>
              Panier {cartCount > 0 && <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "#3b82f6", color: "#fff" }}>{cartCount}</span>}
            </Link>
            <Link href="/business/questionnaire" className="text-xs font-bold px-4 py-2 rounded-lg transition-all" style={{ background: "#3b82f6", color: "#fff" }}>
              Configurer mon déplacement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle,#6366f1,transparent)" }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "#93bbfc" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#3b82f6" }} />
            IA spécialisée voyages professionnels
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <h1
                className="text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#f0f4ff" }}
              >
                Votre déplacement<br />
                <span style={{ color: "#3b82f6" }}>professionnel,</span><br />
                optimisé par IA.
              </h1>
              <p className="text-lg leading-relaxed mb-8" style={{ color: "#8892a8" }}>
                Hôtels proches du lieu de réunion, restaurants adaptés aux dîners d'affaires, transports optimisés, agenda structuré. Un guide conçu pour le professionnel en déplacement.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href="/business/questionnaire"
                  className="flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90"
                  style={{ background: "#3b82f6", color: "#fff" }}
                >
                  Configurer mon déplacement
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>

              {/* Trust metrics */}
              <div className="flex flex-wrap gap-6">
                {[
                  { label: "Délai de livraison", value: "48h" },
                  { label: "Destinations business", value: "500+" },
                  { label: "Satisfaction client", value: "4.9★" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-xl font-bold" style={{ color: "#f0f4ff", fontFamily: "var(--font-playfair), Georgia, serif" }}>{s.value}</div>
                    <div className="text-xs" style={{ color: "#4a5568" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — guide preview card */}
            <div className="relative">
              <div className="rounded-2xl p-6" style={{ background: "#0f0f18", border: "1px solid #1a1a2e" }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "#3b82f6" }}>Guide professionnel</p>
                    <p className="text-base font-bold" style={{ color: "#f0f4ff", fontFamily: "var(--font-playfair), serif" }}>Francfort · Mission 4 jours</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
                    PDF
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    { icon: "📍", label: "Lieu de réunion", val: "Messe Frankfurt — Hall 8" },
                    { icon: "🏨", label: "Hébergement recommandé", val: "Marriott Messe (5 min à pied)" },
                    { icon: "🍽️", label: "Dîner client", val: "Michaelis Restaurant — ambiance feutrée" },
                    { icon: "✈️", label: "Transport", val: "CDG → FRA · Terminal 2, porte E31" },
                  ].map(r => (
                    <div key={r.label} className="flex items-start gap-3 px-3 py-2.5 rounded-lg" style={{ background: "#13131f" }}>
                      <span className="text-sm mt-0.5">{r.icon}</span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#4a5568" }}>{r.label}</p>
                        <p className="text-xs" style={{ color: "#c8d3f0" }}>{r.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4" style={{ borderTop: "1px solid #1a1a2e" }}>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a1a2e" }}>
                    <div className="h-full rounded-full w-3/4" style={{ background: "linear-gradient(90deg,#3b82f6,#6366f1)" }} />
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: "#3b82f6" }}>Agenda 75% optimisé</span>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full text-[10px] font-bold" style={{ background: "#1e3a8a", border: "1px solid #3b82f6", color: "#93bbfc" }}>
                Livré en 48h
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#0b0b12", borderTop: "1px solid #1a1a2e", borderBottom: "1px solid #1a1a2e" }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-3 text-center" style={{ color: "#3b82f6" }}>Processus</p>
          <h2 className="text-3xl font-bold text-center mb-16" style={{ fontFamily: "var(--font-playfair), serif", color: "#f0f4ff" }}>
            Comment ça marche
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Renseignez votre mission",
                desc: "Destination, dates, objectif du déplacement, contraintes de budget. 3 minutes.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                ),
              },
              {
                n: "02",
                title: "L'IA compose votre guide",
                desc: "Hôtels business, restaurants dîners clients, transport, agenda heure par heure.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                ),
              },
              {
                n: "03",
                title: "Recevez votre guide PDF",
                desc: "Document structuré, prêt pour impression ou mobile. Livraison sous 48h par email.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                ),
              },
            ].map(step => (
              <div key={step.n} className="rounded-xl p-6" style={{ background: "#0f0f18", border: "1px solid #1a1a2e" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold" style={{ color: "#1a1a2e", fontFamily: "var(--font-playfair), serif" }}>{step.n}</span>
                  <div className="p-2 rounded-lg" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{step.icon}</div>
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#f0f4ff" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7a99" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-3 text-center" style={{ color: "#3b82f6" }}>Contenu du guide</p>
          <h2 className="text-3xl font-bold text-center mb-16" style={{ fontFamily: "var(--font-playfair), serif", color: "#f0f4ff" }}>
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Hébergements business", desc: "Hôtels proches de vos lieux de réunion, avec parking, room service et facturation entreprise.", icon: "🏨" },
              { title: "Restaurants clients", desc: "Sélection de restaurants adaptés aux dîners d'affaires : cadre, service, carte et gamme de prix.", icon: "🍷" },
              { title: "Transport optimisé", desc: "Trajets aéroport, navettes, VTC, parkings relais — organisés par priorité de temps.", icon: "🚉" },
              { title: "Agenda structuré", desc: "Planning heure par heure coordonné avec vos créneaux de réunion et temps de trajet.", icon: "📅" },
              { title: "Informations pratiques", desc: "Décalage horaire, météo, devises, urgences, numéros utiles, appli locales.", icon: "📋" },
              { title: "Conseils culturels pro", desc: "Codes locaux pour réunions, coutumes business, étiquette en repas d'affaires.", icon: "🤝" },
            ].map(f => (
              <div key={f.title} className="rounded-xl p-5 flex gap-4" style={{ background: "#0f0f18", border: "1px solid #1a1a2e" }}>
                <span className="text-2xl mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="text-sm font-bold mb-1.5" style={{ color: "#f0f4ff" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b7a99" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section style={{ background: "linear-gradient(135deg,#0f172a,#0f0f18,#0a0a1a)", borderTop: "1px solid #1a1a2e" }}>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "#3b82f6" }}>Prêt à partir</p>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair), serif", color: "#f0f4ff" }}>
            Votre prochain déplacement, maîtrisé.
          </h2>
          <p className="text-sm mb-8" style={{ color: "#6b7a99" }}>
            Renseignez votre mission en 3 minutes. Notre IA compose un guide professionnel complet, livré en PDF sous 48h.
          </p>
          <Link
            href="/business/questionnaire"
            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90"
            style={{ background: "#3b82f6", color: "#fff" }}
          >
            Configurer mon déplacement
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#08080d", borderTop: "1px solid #1a1a2e" }} className="py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#2d3748" }}>© 2026 TravelGuide AI — Mode Professionnel</p>
          <div className="flex items-center gap-6">
            <Link href="/cgv" className="text-xs hover:text-blue-400 transition-colors" style={{ color: "#2d3748" }}>CGV</Link>
            <Link href="/privacy" className="text-xs hover:text-blue-400 transition-colors" style={{ color: "#2d3748" }}>Confidentialité</Link>
            <Link href="/contact" className="text-xs hover:text-blue-400 transition-colors" style={{ color: "#2d3748" }}>Contact</Link>
            <Link href="/" className="text-xs hover:text-blue-400 transition-colors" style={{ color: "#2d3748" }}>Mode personnel →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
