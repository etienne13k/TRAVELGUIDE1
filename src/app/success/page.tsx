"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import LangToggle from "@/components/LangToggle";

function SuccessContent() {
  const params = useSearchParams();
  const guideId = params.get("id");
  const email = params.get("email");
  const destination = params.get("destination");

  const downloadUrl = guideId ? `/api/download-guide/${guideId}` : null;

  return (
    <div
      className="min-h-screen bg-[#F8F4EF] flex flex-col"
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="border-b border-[#425C47]/10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-[#425C47]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            TravelGuide AI
          </Link>
          <LangToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-[#425C47] flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-3xl">✅</span>
          </div>

          {/* Title */}
          <h1
            className="text-3xl lg:text-4xl font-bold mb-4 text-[#425C47]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Votre guide est prêt&nbsp;! 🎉
          </h1>

          {/* Subtitle */}
          <p className="text-[#425C47]/60 mb-8 leading-relaxed">
            {destination && (
              <>
                Votre guide de voyage{" "}
                <strong className="text-[#425C47]">{destination}</strong> a
                été généré avec succès par notre IA.
                <br />
              </>
            )}
            {email && (
              <>
                Une copie a été envoyée à{" "}
                <strong className="text-[#425C47]">{email}</strong>.
              </>
            )}
          </p>

          {/* Download card */}
          <div className="bg-white rounded-2xl border border-[#425C47]/8 shadow-sm p-8 mb-8">
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-lg font-bold text-[#425C47] mb-2">
              Télécharger votre guide PDF
            </h2>
            <p className="text-sm text-[#425C47]/50 mb-6">
              {destination ? `Guide ${destination}` : "Votre guide personnalisé"}{" "}
              • Format PDF professionnel
            </p>

            {downloadUrl ? (
              <a
                href={downloadUrl}
                download
                onClick={() =>
                  window.posthog?.capture("guide_downloaded", {
                    guide_id: guideId,
                    destination,
                  })
                }
                className="inline-flex items-center gap-2 bg-[#425C47] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#2e4133] transition-all hover:scale-[1.02] shadow-md text-base w-full justify-center"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Télécharger mon guide PDF
              </a>
            ) : (
              <p className="text-sm text-orange-600 bg-orange-50 rounded-xl p-3">
                Lien de téléchargement non disponible. Votre guide vous a été
                envoyé par email.
              </p>
            )}
          </div>

          {/* Email confirmation */}
          {email && (
            <div className="bg-[#425C47]/4 rounded-xl px-6 py-4 mb-8 text-left">
              <div className="flex items-center gap-2 text-sm text-[#425C47]/60">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>
                  Email envoyé à <strong className="text-[#425C47]">{email}</strong>{" "}
                  avec le PDF en pièce jointe.
                </span>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Avertissement IA :</strong> Ce guide a été généré par
              intelligence artificielle. Les informations fournies sont données
              à titre indicatif et peuvent ne pas être exactes ou à jour.
              TravelGuide AI ne saurait être tenu responsable d&apos;éventuelles
              erreurs ou omissions. Nous vous recommandons de vérifier les
              horaires, prix et disponibilités directement auprès des
              établissements avant votre départ.
            </p>
          </div>

          {/* CTA — order another guide */}
          <Link
            href="/"
            onClick={() =>
              window.posthog?.capture("order_another_guide_clicked")
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-[#425C47]/60 hover:text-[#425C47] transition-colors border border-[#425C47]/20 rounded-xl px-6 py-3 hover:border-[#425C47]/50"
          >
            Commander un autre guide →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#425C47]/10 py-6 text-center">
        <p className="text-xs text-[#425C47]/35">
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
        <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
          <div className="text-4xl animate-bounce">✈️</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
