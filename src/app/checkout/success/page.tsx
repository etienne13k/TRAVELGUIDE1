"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clearCart } from "@/lib/cart";
import LangToggle from "@/components/LangToggle";

const PLAN_LABELS: Record<string, string> = {
  "3j": "Guide Express — 3 jours",
  "7j": "Guide Complet — 7 jours",
  "14j": "Guide Immersif — 14 jours",
  "1mois": "Guide Évasion — 1 mois",
};

type SessionItemSummary = {
  plan?: string | null;
  destination?: string | null;
  travel_dates?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
};

type SessionSummary = SessionItemSummary & {
  email?: string | null;
  items?: SessionItemSummary[];
};

function formatTravelDates(summary: SessionItemSummary | null): string | null {
  if (!summary) return null;
  if (summary.travel_dates) return summary.travel_dates;
  if (summary.arrival_date && summary.departure_date && summary.arrival_date !== summary.departure_date) {
    return `${summary.arrival_date} → ${summary.departure_date}`;
  }
  return summary.arrival_date ?? null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (sessionId) clearCart();

    let cancelled = false;

    async function fetchSummary() {
      if (!sessionId) return;

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (cancelled) return;

      try {
        const res = await fetch(`/api/session/${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setSummary(data);
        }
      } catch {
        // La confirmation de paiement reste valide même si le récapitulatif tarde.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const travelDates = formatTravelDates(summary);
  const planLabel = summary?.plan ? PLAN_LABELS[summary.plan] ?? summary.plan : null;
  const orderItems = summary?.items?.length ? summary.items : null;

  return (
    <div
      className="min-h-screen bg-[#F8F4EF] flex items-center justify-center px-6 py-12"
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="fixed top-4 right-4 z-50"><LangToggle /></div>
      <div className="max-w-xl w-full">
        <div className="rounded-[2rem] border border-[#E8E0D0] bg-white p-7 text-center shadow-[0_24px_80px_rgba(26,26,46,0.12)]">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C9A84C]">Commande confirmée</p>
          <h1
            className="mt-2 text-3xl font-bold text-[#425C47]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Paiement confirmé !
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#425C47]/60">
            Merci pour votre achat. Votre questionnaire et vos dates de voyage ont bien été transmis pour la création du guide.
          </p>

          <div className="mt-7 rounded-3xl border border-[#425C47]/10 bg-[#FDFAF5] p-5 text-left">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#425C47]/60">
              Récapitulatif de commande
            </h2>

            {loading ? (
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#425C47]/50">Chargement du récapitulatif…</div>
            ) : (
              <div className="space-y-3 text-sm text-[#425C47]">
                {orderItems ? (
                  orderItems.map((item, index) => (
                    <div key={`${item.destination ?? "guide"}-${index}`} className="rounded-2xl bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold text-[#425C47]">Guide #{index + 1}</span>
                        <strong className="text-right text-[#C9A84C]">{item.plan ? PLAN_LABELS[item.plan] ?? item.plan : "Forfait confirmé"}</strong>
                      </div>
                      <p className="mt-2 text-[#425C47]/65">🗺️ {item.destination ?? "Destination transmise"}</p>
                      <p className="mt-1 text-[#425C47]/65">📅 {formatTravelDates(item) ?? "Dates transmises"}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                      <span className="text-[#425C47]/50">Forfait</span>
                      <strong className="text-right">{planLabel ?? "Forfait confirmé"}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                      <span className="text-[#425C47]/50">Destination</span>
                      <strong className="text-right">{summary?.destination ?? "Transmise dans le questionnaire"}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                      <span className="text-[#425C47]/50">Dates de voyage</span>
                      <strong className="text-right text-[#C9A84C]">{travelDates ?? "Transmises dans le questionnaire"}</strong>
                    </div>
                  </>
                )}
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                  <span className="text-[#425C47]/50">Email</span>
                  <strong className="text-right">{summary?.email ?? "Email de paiement"}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account"
              className="flex-1 rounded-xl bg-[#425C47] px-5 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02]"
            >
              Voir mes commandes
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl border-2 border-[#E8E0D0] px-5 py-3 text-sm font-bold text-[#425C47] transition-colors hover:border-[#C9A84C] hover:text-[#C9A84C]"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
          <div className="text-[#425C47]/40 text-sm">Chargement…</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
