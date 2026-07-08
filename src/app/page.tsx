"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#06060a", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      {/* Subtle top brand line */}
      <header className="flex items-center justify-center py-8">
        <span
          className="text-sm font-bold tracking-[0.25em] uppercase"
          style={{ color: "#2a2a3a" }}
        >
          TRAVEL IA
        </span>
      </header>

      {/* Two panels — fill remaining height */}
      <div className="flex-1 flex flex-col sm:flex-row">

        {/* ── Personal ── */}
        <Link
          href="/personal"
          className="group flex-1 relative flex flex-col justify-end p-10 sm:p-14 overflow-hidden transition-all duration-500"
          style={{ minHeight: "50vh", background: "#0a0f0c" }}
        >
          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 30% 60%, rgba(201,168,76,0.07), transparent 70%)" }}
          />
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
            style={{ background: "#C9A84C" }}
          />
          {/* Divider (desktop only) */}
          <div
            className="absolute right-0 top-[10%] bottom-[10%] w-px hidden sm:block"
            style={{ background: "#111118" }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Category label */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.28em] mb-5"
              style={{ color: "#4a6447" }}
            >
              Voyage personnel
            </p>

            {/* Title */}
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-none text-[#c8d5c0] group-hover:text-[#d8e3d5] transition-colors duration-300"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Travel<br />Guide
            </h2>

            {/* Description */}
            <p className="text-sm max-w-xs mb-8 leading-relaxed" style={{ color: "#3a5037" }}>
              Aventures, city trips, vacances. Guide personnalisé selon vos envies, livré en PDF.
            </p>

            {/* CTA row */}
            <div className="flex items-center gap-4">
              <span
                className="text-sm font-bold group-hover:gap-3 transition-all"
                style={{ color: "#C9A84C" }}
              >
                Créer mon guide →
              </span>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
              >
                dès 3€
              </span>
            </div>
          </div>

          {/* Background large text decoration */}
          <div
            className="absolute bottom-6 right-8 text-[11rem] font-bold leading-none select-none pointer-events-none opacity-[0.025] group-hover:opacity-[0.04] transition-opacity duration-500"
            style={{ fontFamily: "var(--font-playfair), serif", color: "#C9A84C" }}
          >
            01
          </div>
        </Link>

        {/* ── Business ── */}
        <Link
          href="/business"
          className="group flex-1 relative flex flex-col justify-end p-10 sm:p-14 overflow-hidden transition-all duration-500"
          style={{ minHeight: "50vh", background: "#07070e" }}
        >
          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.07), transparent 70%)" }}
          />
          {/* Top accent line */}
          <div
            className="absolute top-0 right-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
            style={{ background: "#3b82f6" }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Category label */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.28em] mb-5"
              style={{ color: "#1e3a5f" }}
            >
              Voyage d'affaires
            </p>

            {/* Title */}
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-none text-[#1e2a4a] group-hover:text-[#c8d3f0] transition-colors duration-300"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Travel<br />Business
            </h2>

            {/* Description */}
            <p className="text-sm max-w-xs mb-8 leading-relaxed" style={{ color: "#1a2235" }}>
              Déplacements professionnels. Hôtels business, restaurants clients, agenda optimisé.
            </p>

            {/* CTA row */}
            <div className="flex items-center gap-4">
              <span
                className="text-sm font-bold transition-all"
                style={{ color: "#3b82f6" }}
              >
                Configurer ma mission →
              </span>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                Pro
              </span>
            </div>
          </div>

          {/* Background large text decoration */}
          <div
            className="absolute bottom-6 right-8 text-[11rem] font-bold leading-none select-none pointer-events-none opacity-[0.025] group-hover:opacity-[0.04] transition-opacity duration-500"
            style={{ fontFamily: "var(--font-playfair), serif", color: "#3b82f6" }}
          >
            02
          </div>
        </Link>
      </div>

      {/* Minimal footer */}
      <footer className="flex items-center justify-center py-5">
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#15151e" }}>
          © 2026 Travel IA
        </p>
      </footer>
    </div>
  );
}
