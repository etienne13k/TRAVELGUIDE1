"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CART_PLANS,
  STRIPE_PAYMENT_LINKS,
  formatEuro,
  getCartTotal,
  loadCart,
  removeCartItem,
  type CartItem,
  type PlanKey,
} from "@/lib/cart";
import LangToggle from "@/components/LangToggle";
import { useMode } from "@/lib/mode-theme";

const LEGAL_NOTICE =
  "Les horaires et jours d'ouverture des monuments et lieux recommandés dans votre guide sont fournis à titre indicatif. Travel IA ne peut être tenu responsable en cas de fermeture exceptionnelle, de modification d'horaires ou d'événements imprévus. Vérifiez les informations officielles avant chaque visite.";

function CartContent() {
  const router = useRouter();
  const { T, isBusiness } = useMode();
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoProfileUrl, setPromoProfileUrl] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoSavings, setPromoSavings] = useState(0);
  const [promoState, setPromoState] = useState<"idle" | "valid" | "invalid">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutProfileUrl, setCheckoutProfileUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const autoAppliedRef = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      setItems(loadCart());
      const saved = localStorage.getItem("tgai_promo");
      if (saved) setPromoCode(saved);
    });
    fetch("/api/account/status").then(r => r.json()).then(d => {
      if (d.email) setUserEmail(d.email);
    }).catch(() => undefined);
  }, []);

  const total = getCartTotal(items);
  const firstPlanId = items[0]?.planId;

  useEffect(() => {
    if (!autoAppliedRef.current && items.length > 0 && promoCode.trim() && promoState === "idle") {
      autoAppliedRef.current = true;
      handlePromo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, promoCode]);

  function handleRemove(itemId: string) {
    removeCartItem(itemId);
    setItems(loadCart());
  }

  async function handlePromo() {
    const normalizedCode = promoCode.trim().toUpperCase();
    setPromoProfileUrl(null);

    if (!normalizedCode) {
      setPromoMessage("Entrez un code promo pour l'ajouter au checkout.");
      return;
    }

    setPromoCode(normalizedCode);

    try {
      const res = await fetch("/api/apply-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: normalizedCode, planKey: firstPlanId }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setPromoMessage(data.message ?? "Code promo invalide ou expiré.");
        setPromoProfileUrl(data.profileUrl ?? null);
        setPromoState("invalid");
        return;
      }

      setPromoApplied(true);
      setPromoState("valid");
      const savings = Math.round(total * 0.25);
      setPromoSavings(savings);
      setPromoMessage(`Code ${normalizedCode} appliqué — -25% sur votre commande !`);
    } catch {
      setPromoMessage("Erreur serveur, réessayez.");
    }
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    if (!termsAccepted) {
      setTermsError("Veuillez accepter les conditions générales de vente pour continuer.");
      return;
    }

    setTermsError(null);
    setError(null);
    setCheckoutProfileUrl(null);
    setLoading(true);

    window.posthog?.capture("purchase_started", {
      item_count: items.length,
      total_cents: total,
      destinations: items.map((item) => item.destination),
    });

    try {
      const normalizedPromoCode = promoCode.trim().toUpperCase();
      const item = items[0];
      const isBusiness = item.criteria?.mode === "business";
      const baseLink = isBusiness && item.planId === "7j"
        ? "https://buy.stripe.com/14A3cvagd1sE37de120Ba05"
        : STRIPE_PAYMENT_LINKS[item.planId as PlanKey];
      if (!baseLink) throw new Error("Lien de paiement introuvable.");

      const pendingRes = await fetch("/api/save-pending-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: item.planId,
          destination: item.destination,
          dates: item.dates,
          criteria: item.criteria,
        }),
      });
      const pendingData = pendingRes.ok ? await pendingRes.json() : null;
      const orderId: string | null = pendingData?.orderId ?? null;

      const params = new URLSearchParams();
      if (orderId) params.set("client_reference_id", orderId);
      if (normalizedPromoCode) params.set("prefilled_promo_code", normalizedPromoCode);
      if (userEmail) params.set("prefilled_email", userEmail);

      const query = params.toString();
      const stripeUrl = query ? `${baseLink}?${query}` : baseLink;
      router.push(stripeUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  const homeLink = isBusiness ? "/business" : "/personal";
  const shopLink = isBusiness ? "/business" : "/#pricing";
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const editBase = isBusiness ? "/business/questionnaire" : "/questionnaire";

  return (
    <div className="min-h-screen" style={{ background: T.bg, fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>

      {/* Top accent line for business mode */}
      {isBusiness && (
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1)" }} />
      )}

      <header
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ borderBottom: `1px solid ${T.border}`, background: `${T.bg}e6` }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href={homeLink}
            className="text-lg font-bold"
            style={{ color: T.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {brandName}
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link
              href={shopLink}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{ border: `1px solid ${T.border}`, color: T.modifyBtn }}
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: T.accent }}>Panier</p>
            <h1
              className="mt-2 text-3xl font-bold"
              style={{ color: T.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Vos guides à commander
            </h1>
          </div>
          <p className="text-sm" style={{ color: T.muted }}>{items.length} article{items.length > 1 ? "s" : ""}</p>
        </div>

        {items.length === 0 ? (
          <section
            className="rounded-[2rem] p-8 text-center"
            style={{ border: `1px solid ${T.border}`, background: T.card }}
          >
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{ background: T.accentFaint }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h2
              className="text-2xl font-bold"
              style={{ color: T.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Votre panier est vide.
            </h2>
            <p className="mt-3 text-sm" style={{ color: T.muted }}>
              Ajoutez un guide personnalisé avant de passer au paiement.
            </p>
            <Link
              href={shopLink}
              className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold transition-colors"
              style={{ background: T.accent, color: T.accentText }}
            >
              Commencer un guide →
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {items.map((item, index) => {
                const isBusinessSub = item.planId === "1mois" && item.criteria?.mode === "business";
                if (isBusinessSub) {
                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-[1.75rem]"
                      style={{ border: `1px solid ${T.accentBorder}`, background: T.card }}
                    >
                      <div className="px-5 py-5 flex items-center justify-between gap-4" style={{ background: T.cardHeader }}>
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: T.accentFaint, border: `1px solid ${T.accentBorder}` }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: T.accent }}>Pack Premium</p>
                            <h2 className="text-lg font-bold" style={{ color: T.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                              Travel Business · 1 mois
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: T.muted }}>10 guides de 3j inclus · pour les déplacements fréquents</p>
                          </div>
                        </div>
                        <strong className="rounded-full px-4 py-2 text-sm flex-shrink-0" style={{ background: T.accentFaint, border: `1px solid ${T.accentBorder}`, color: T.accent }}>
                          {formatEuro(item.price)}
                        </strong>
                      </div>
                      <div className="flex gap-3 px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="rounded-full border border-red-900/40 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-900/20"
                        >
                          Supprimer
                        </button>
                      </div>
                    </article>
                  );
                }
                const isBusinessGuide = isBusiness && item.planId !== "1mois";
                return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[1.75rem]"
                  style={{
                    border: isBusinessGuide ? "1px solid rgba(59,130,246,0.28)" : `1px solid ${T.border}`,
                    background: T.card,
                  }}
                >
                  <div
                    className="px-5 py-4"
                    style={{
                      borderBottom: isBusinessGuide ? "1px solid rgba(59,130,246,0.15)" : `1px solid ${T.border}`,
                      background: isBusinessGuide ? "#0d0d1a" : T.cardHeader,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: T.accent }}>
                          {isBusinessGuide ? `Guide Pro #${index + 1}` : `Guide #${index + 1}`}
                        </p>
                        <h2
                          className="mt-1 text-xl font-bold"
                          style={{ color: T.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
                        >
                          {item.destination || "Destination à confirmer"}
                        </h2>
                      </div>
                      <strong
                        className="rounded-full px-4 py-2 text-sm"
                        style={{ background: T.accentFaint, border: `1px solid ${T.accentBorder}`, color: T.accent }}
                      >
                        {formatEuro(item.price)}
                      </strong>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-3">
                    {[
                      { label: "Dates", value: item.dates || "À confirmer" },
                      { label: "Durée", value: item.planLabel },
                      { label: isBusinessGuide ? "Lieu" : "Prix", value: isBusinessGuide ? (item.destination || "À confirmer") : formatEuro(item.price) },
                    ].map((cell) => (
                      <div
                        key={cell.label}
                        className="rounded-2xl p-4"
                        style={{
                          background: isBusinessGuide ? "rgba(59,130,246,0.06)" : T.cardDeep,
                          border: isBusinessGuide ? "1px solid rgba(59,130,246,0.15)" : `1px solid ${T.border}`,
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: isBusinessGuide ? "rgba(59,130,246,0.5)" : T.faint }}>{cell.label}</p>
                        <p className="mt-1 text-sm font-semibold" style={{ color: T.text }}>{cell.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 px-5 pb-5">
                    <Link
                      href={`${editBase}?edit=${encodeURIComponent(item.id)}&plan=${item.planId}`}
                      className="rounded-full px-4 py-2 text-sm font-bold transition-colors"
                      style={{ border: `1px solid ${T.border}`, color: T.modifyBtn }}
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="rounded-full border border-red-900/40 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-900/20"
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
                );
              })}
            </section>

            <aside
              className="h-fit rounded-[1.75rem] p-6 lg:sticky lg:top-24"
              style={{ border: `1px solid ${T.border}`, background: T.card }}
            >
              <h2
                className="text-lg font-bold"
                style={{ color: T.text, fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Récapitulatif
              </h2>

              <div className="mt-5 space-y-3 pb-5" style={{ borderBottom: `1px solid ${T.border}` }}>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm" style={{ color: T.muted }}>
                    <span>
                      {item.planId === "1mois" && item.criteria?.mode === "business"
                        ? "Pack Premium Travel Business"
                        : `${CART_PLANS[item.planId].duration} · ${item.destination}`}
                    </span>
                    <span className="font-semibold" style={{ color: T.modifyBtn }}>{formatEuro(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: T.faint }}
                >
                  Code promo
                </label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(event) => {
                        const v = event.target.value;
                        setPromoCode(v);
                        localStorage.setItem("tgai_promo", v);
                        setPromoMessage("");
                        setPromoProfileUrl(null);
                        setPromoApplied(false);
                        setPromoSavings(0);
                        setPromoState("idle");
                      }}
                      onKeyDown={(event) => event.key === "Enter" && handlePromo()}
                      placeholder="ex. WELCOME"
                      className={`w-full rounded-xl px-3 py-2.5 pr-9 text-sm font-mono focus:outline-none transition-colors ${
                        promoState === "valid"
                          ? "promo-input-valid bg-emerald-950/50"
                          : promoState === "invalid"
                          ? "promo-input-invalid bg-red-950/30"
                          : ""
                      }`}
                      style={
                        promoState === "idle"
                          ? { border: `1px solid ${T.border}`, background: T.cardDeep, color: T.text }
                          : { color: T.text }
                      }
                    />
                    {promoState === "valid" && (
                      <span className="promo-checkmark absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-base">✓</span>
                    )}
                    {promoState === "invalid" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 font-bold text-base">✕</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePromo}
                    className="rounded-xl px-4 text-sm font-bold text-white transition-all"
                    style={{
                      background: promoState === "valid" ? "#065f46" : T.promoButton,
                    }}
                  >
                    {promoState === "valid" ? "✓" : "OK"}
                  </button>
                </div>
                {promoMessage && (
                  <p className="mt-2 text-xs" style={{ color: T.muted }}>
                    {promoMessage}
                    {promoProfileUrl && (
                      <> <Link href={promoProfileUrl} className="font-semibold underline">Ouvrir le profil</Link></>
                    )}
                  </p>
                )}
              </div>

              <div className="my-5 rounded-2xl border border-amber-800/40 bg-amber-950/30 px-4 py-4">
                <p className="text-sm font-bold text-amber-300">Information importante</p>
                <p className="mt-2 text-xs leading-relaxed text-amber-200/70">{LEGAL_NOTICE}</p>
              </div>

              <label
                className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 text-xs leading-relaxed transition-colors"
                style={{
                  border: `1px solid ${T.border}`,
                  background: T.cardDeep,
                  color: T.muted,
                }}
              >
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    if (event.target.checked) setTermsError(null);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ accentColor: T.accent }}
                />
                <span>
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <Link href="/cgv" className="font-semibold underline" style={{ color: T.modifyBtn }}>
                    Conditions Générales de Vente
                  </Link>{" "}
                  ainsi que la{" "}
                  <Link href="/privacy" className="font-semibold underline" style={{ color: T.modifyBtn }}>
                    Politique de confidentialité
                  </Link>
                  . Je comprends que les informations du guide sont indicatives et non contractuelles.
                </span>
              </label>
              {termsError && <p className="mt-2 text-center text-xs font-semibold text-red-400">{termsError}</p>}

              <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${T.border}` }}>
                {promoApplied && (
                  <div className="promo-badge-appear mb-3 flex items-center justify-between rounded-xl border border-emerald-800/40 bg-emerald-950/30 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      Code <span className="font-mono">{promoCode}</span> appliqué
                    </span>
                    {promoSavings > 0 && (
                      <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-xs font-black text-white">
                        -{formatEuro(promoSavings)}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between" style={{ color: T.text }}>
                  <span className="font-bold">Total</span>
                  <div className="flex flex-col items-end gap-0.5">
                    {promoApplied && promoSavings > 0 && (
                      <span className="promo-old-price text-sm font-semibold">
                        {formatEuro(total)}
                      </span>
                    )}
                    <strong
                      key={promoApplied ? "promo" : "normal"}
                      className={`text-2xl ${promoApplied && promoSavings > 0 ? "promo-new-price text-emerald-400" : ""}`}
                      style={!(promoApplied && promoSavings > 0) ? { color: T.accent, fontFamily: "var(--font-playfair), Georgia, serif" } : { fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {promoApplied && promoSavings > 0 ? formatEuro(total - promoSavings) : formatEuro(total)}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="mt-5 w-full rounded-xl py-4 text-base font-bold shadow-md transition-all enabled:hover:scale-[1.02] disabled:cursor-not-allowed"
                style={{
                  background: T.accent,
                  color: T.accentText,
                }}
              >
                {loading ? "Ouverture du paiement…" : "Payer maintenant →"}
              </button>

              {error && (
                <p className="mt-3 text-center text-xs font-semibold text-red-400">
                  {error}
                  {checkoutProfileUrl && (
                    <> <Link href={checkoutProfileUrl} className="underline">Ouvrir le profil</Link></>
                  )}
                </p>
              )}
              <p className="mt-3 text-center text-[11px]" style={{ color: T.footerNote }}>
                Paiement 100% sécurisé via Stripe · Une seule transaction
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#0e1310" }} />}>
      <CartContent />
    </Suspense>
  );
}
