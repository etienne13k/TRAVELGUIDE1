"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type SessionSummary = {
  email?: string | null;
  plan?: string | null;
  destination?: string | null;
  travel_dates?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
};

type GenerateState = "idle" | "fetching_session" | "generating" | "done" | "error" | "no_data";

function formatDates(s: SessionSummary | null): string | null {
  if (!s) return null;
  if (s.travel_dates) return s.travel_dates;
  if (s.arrival_date && s.departure_date && s.arrival_date !== s.departure_date)
    return `${s.arrival_date} → ${s.departure_date}`;
  return s.arrival_date ?? null;
}

const STEPS = [
  { key: "fetching_session", label: "Confirmation du paiement…" },
  { key: "generating",       label: "Génération de votre guide par l'IA…" },
  { key: "done",             label: "Guide prêt !" },
];

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isBusiness } = useMode();
  const backHref = isBusiness ? "/business" : "/personal";
  const sessionId = searchParams.get("session_id") ?? "";

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [state, setState] = useState<GenerateState>("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (!sessionId || triggered.current) return;
    triggered.current = true;

    const storedOrderId = (() => { try { return localStorage.getItem("tgai_pending_order_id"); } catch { return null; } })();
    clearCart();
    localStorage.removeItem("tgai_promo");
    localStorage.removeItem("tgai_pending_order_id");

    async function run() {
      // Step 1: fetch session summary (try Stripe session first, fall back to order lookup)
      setState("fetching_session");
      await new Promise(r => setTimeout(r, 1500));

      let sessionData: SessionSummary = {};
      try {
        const res = await fetch(`/api/session/${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          sessionData = await res.json() as SessionSummary;
          setSummary(sessionData);
        }
      } catch { /* non-fatal */ }

      // Step 2: trigger auto-generation — use stored orderId if session lookup failed
      setState("generating");
      try {
        const body = storedOrderId
          ? { stripeSessionId: sessionId, orderId: storedOrderId }
          : { stripeSessionId: sessionId };
        const genRes = await fetch("/api/auto-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const genData = await genRes.json() as { orderId?: string; status?: string; error?: string };

        if (genData.orderId) {
          setOrderId(genData.orderId);
        }

        if (genData.status === "questionnaire_pending" || genData.status === "no_data") {
          // No questionnaire data yet — user needs to fill it
          setState("no_data");
          if (genData.orderId) {
            setTimeout(() => router.push(`/account/orders/${genData.orderId}`), 3000);
          }
          return;
        }

        if (genData.status === "delivered" || genData.status === "done" || genData.guideId) {
          setState("done");
          setTimeout(() => {
            if (genData.orderId) router.push(`/account/orders/${genData.orderId}`);
            else router.push("/account");
          }, 2500);
          return;
        }

        // Generating in progress or unknown — redirect to order page
        setState("done");
        setTimeout(() => {
          if (genData.orderId) router.push(`/account/orders/${genData.orderId}`);
          else router.push("/account");
        }, 2000);
      } catch (err) {
        setError(String(err));
        setState("error");
        setTimeout(() => router.push("/account"), 4000);
      }
    }

    run();
  }, [sessionId, router]);

  const travelDates = formatDates(summary);
  const planLabel = summary?.plan ? PLAN_LABELS[summary.plan] ?? summary.plan : null;
  const currentStepIdx = STEPS.findIndex(s => s.key === state);
  const isGenerating = state === "generating" || state === "fetching_session";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="fixed top-4 right-4 z-50"><LangToggle /></div>
      <div className="max-w-xl w-full">
        <div className="rounded-[2rem] p-7 text-center" style={{ border: "1px solid var(--ce)", background: "var(--cc)" }}>

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            {state === "done" ? (
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : state === "error" ? (
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--ca)" }}>
            Commande confirmée
          </p>
          <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {state === "done" ? "Guide en cours de création !" : state === "error" ? "Une erreur est survenue" : "Paiement confirmé !"}
          </h1>

          {/* Progress steps */}
          {sessionId && (
            <div className="mt-6 rounded-2xl p-5 text-left" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
              <div className="space-y-3">
                {STEPS.map((step, idx) => {
                  const isDone = currentStepIdx > idx || state === "done" || state === "no_data";
                  const isActive = currentStepIdx === idx && isGenerating;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: isDone ? "var(--ca)" : isActive ? "rgba(var(--car,201,168,76),0.15)" : "var(--ce)",
                          color: isDone ? "var(--cat)" : isActive ? "var(--ca)" : "var(--cm)",
                          border: isActive ? "1.5px solid var(--ca)" : "none",
                        }}>
                        {isDone ? "✓" : isActive ? (
                          <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin inline-block"
                            style={{ borderColor: "var(--ca) transparent transparent transparent" }} />
                        ) : idx + 1}
                      </div>
                      <span className="text-sm" style={{ color: isDone || isActive ? "var(--ct)" : "var(--cm)" }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {state === "generating" && (
                <p className="mt-4 text-xs text-center" style={{ color: "var(--cm)" }}>
                  Cela prend généralement 20–50 secondes selon la durée du guide…
                </p>
              )}
              {state === "no_data" && (
                <p className="mt-4 text-xs text-center" style={{ color: "var(--cm)" }}>
                  Vous allez être redirigé pour compléter votre questionnaire.
                </p>
              )}
              {state === "done" && (
                <p className="mt-4 text-xs text-center font-semibold" style={{ color: "var(--ca)" }}>
                  Redirection vers votre commande…
                </p>
              )}
              {error && (
                <p className="mt-3 text-xs text-red-400 text-center">{error}</p>
              )}
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="mt-5 rounded-2xl p-4 text-left" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--cf)" }}>
                Récapitulatif
              </p>
              <div className="space-y-2 text-sm">
                {planLabel && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--cf)" }}>Forfait</span>
                    <strong style={{ color: "var(--ct)" }}>{planLabel}</strong>
                  </div>
                )}
                {summary.destination && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--cf)" }}>Destination</span>
                    <strong style={{ color: "var(--ct)" }}>{summary.destination}</strong>
                  </div>
                )}
                {travelDates && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--cf)" }}>Dates</span>
                    <strong style={{ color: "var(--ca)" }}>{travelDates}</strong>
                  </div>
                )}
                {summary.email && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--cf)" }}>Email</span>
                    <strong style={{ color: "var(--ct)" }}>{summary.email}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA fallback */}
          {(state === "error" || state === "done" || state === "no_data") && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {orderId ? (
                <Link
                  href={`/account/orders/${orderId}`}
                  className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all"
                  style={{ background: "var(--ca)", color: "var(--cat)" }}
                >
                  Suivre ma commande
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all"
                  style={{ background: "var(--ca)", color: "var(--cat)" }}
                >
                  Voir mes commandes
                </Link>
              )}
              <Link
                href={backHref}
                className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-colors"
                style={{ border: "1px solid var(--ce)", color: "var(--cs)" }}
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          )}
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
