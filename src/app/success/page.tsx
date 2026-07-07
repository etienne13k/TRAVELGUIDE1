"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const guideId = params.get("id");
  const email = params.get("email");
  const destination = params.get("destination");

  const downloadUrl = guideId ? `/api/download-guide/${guideId}` : null;

  useEffect(() => {
    // Clear promo code from localStorage after successful purchase
    localStorage.removeItem("tgai_promo");
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0e1310] flex flex-col"
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <header className="border-b border-[#232c20] bg-[#161c14]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-[#d8e3d5]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            TravelGuide AI
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto mb-8">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h1
            className="text-3xl lg:text-4xl font-bold mb-4 text-[#d8e3d5]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Votre guide est prêt !
          </h1>

          <p className="text-[#7a9076] mb-8 leading-relaxed">
            {destination && (
              <>
                Votre guide de voyage{" "}
                <strong className="text-[#b8cdb4]">{destination}</strong> a
                été généré avec succès.
                <br />
              </>
            )}
            {email && (
              <>
                Une copie a été envoyée à{" "}
                <strong className="text-[#b8cdb4]">{email}</strong>.
              </>
            )}
          </p>

          <div className="bg-[#161c14] rounded-2xl border border-[#232c20] p-8 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#d8e3d5] mb-2">
              Télécharger votre guide PDF
            </h2>
            <p className="text-sm text-[#7a9076] mb-6">
              {destination ? `Guide ${destination}` : "Votre guide personnalisé"}{" "}
              · Format PDF
            </p>

            {downloadUrl ? (
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0e1310] font-bold px-8 py-4 rounded-xl hover:bg-[#b8962e] transition-all text-base w-full justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Télécharger mon guide PDF
              </a>
            ) : (
              <p className="text-sm text-[#c9a84c] bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-xl p-3">
                Votre guide vous a été envoyé par email.
              </p>
            )}
          </div>

          {email && (
            <div className="bg-[#161c14] border border-[#232c20] rounded-xl px-6 py-4 mb-8 text-left">
              <div className="flex items-center gap-2 text-sm text-[#7a9076]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>
                  Email envoyé à <strong className="text-[#b8cdb4]">{email}</strong> avec le PDF en pièce jointe.
                </span>
              </div>
            </div>
          )}

          <div className="bg-[#161c14] border border-[#c9a84c]/15 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs text-[#7a9076] leading-relaxed">
              <strong className="text-[#b8cdb4]">Avertissement :</strong> Ce guide a été généré par
              intelligence artificielle. Les informations fournies sont données
              à titre indicatif et peuvent ne pas être exactes ou à jour.
              Vérifiez les horaires, prix et disponibilités directement auprès des
              établissements avant votre départ.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7a9076] hover:text-[#d8e3d5] transition-colors border border-[#232c20] rounded-xl px-6 py-3 hover:border-[#c9a84c]/40"
          >
            Commander un autre guide →
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#232c20] py-6 text-center">
        <p className="text-xs text-[#4a6447]">
          © 2026 TravelGuide AI — Guides de voyage personnalisés par IA
        </p>
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0e1310] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
