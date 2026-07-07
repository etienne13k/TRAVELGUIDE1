"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clearCart } from "@/lib/cart";
import LangToggle from "@/components/LangToggle";
import { useMode } from "@/lib/mode-theme";

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
  const { isBusiness } = useMode();
  const backHref = isBusiness ? "/business" : "/personal";
  const sessionId = searchParams.get("session_id") ?? "";
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (sessionId) {
      clearCart();
      localStorage.removeItem("tgai_promo");
    }

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
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="fixed top-4 right-4 z-50"><LangToggle /></div>
      <div className="max-w-xl w-full">
        <div className="rounded-[2rem] p-7 text-center" style={{ border: "1px solid var(--ce)", background: "var(--cc)" }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--ca)" }}>Commande confirmée</p>
          <h1
            className="mt-2 text-3xl font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}
          >
            Paiement confirmé !
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--cm)" }}>
            Merci pour votre achat. Votre questionnaire et vos dates de voyage ont bien été transmis pour la création du guide.
          </p>

          <div className="mt-7 rounded-3xl p-5 text-left" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em]" style={{ color: "var(--cf)" }}>
              Récapitulatif de commande
            </h2>

            {loading ? (
              <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: "var(--cc)", color: "var(--cf)" }}>Chargement du récapitulatif…</div>
            ) : (
              <div className="space-y-3 text-sm" style={{ color: "var(--ct)" }}>
                {orderItems ? (
                  orderItems.map((item, index) => (
                    <div key={`${item.destination ?? "guide"}-${index}`} className="rounded-2xl px-4 py-3" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold" style={{ color: "var(--ct)" }}>Guide #{index + 1}</span>
                        <strong className="text-right" style={{ color: "var(--ca)" }}>{item.plan ? PLAN_LABELS[item.plan] ?? item.plan : "Forfait confirmé"}</strong>
                      </div>
                      <p className="mt-2" style={{ color: "var(--cm)" }}>{item.destination ?? "Destination transmise"}</p>
                      <p className="mt-1" style={{ color: "var(--cm)" }}>{formatTravelDates(item) ?? "Dates transmises"}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4 rounded-2xl px-4 py-3" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
                      <span style={{ color: "var(--cf)" }}>Forfait</span>
                      <strong className="text-right" style={{ color: "var(--ct)" }}>{planLabel ?? "Forfait confirmé"}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl px-4 py-3" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
                      <span style={{ color: "var(--cf)" }}>Destination</span>
                      <strong className="text-right" style={{ color: "var(--ct)" }}>{summary?.destination ?? "Transmise dans le questionnaire"}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl px-4 py-3" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
                      <span style={{ color: "var(--cf)" }}>Dates de voyage</span>
                      <strong className="text-right" style={{ color: "var(--ca)" }}>{travelDates ?? "Transmises dans le questionnaire"}</strong>
                    </div>
                  </>
                )}
                <div className="flex items-start justify-between gap-4 rounded-2xl px-4 py-3" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
                  <span style={{ color: "var(--cf)" }}>Email</span>
                  <strong className="text-right" style={{ color: "var(--ct)" }}>{summary?.email ?? "Email de paiement"}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account"
              className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all"
              style={{ background: "var(--ca)", color: "var(--cat)" }}
            >
              Voir mes commandes
            </Link>
            <Link
              href={backHref}
              className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-colors"
              style={{ border: "1px solid var(--ce)", color: "var(--cs)" }}
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cb)" }}>
          <div className="text-sm" style={{ color: "var(--cf)" }}>Chargement…</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
