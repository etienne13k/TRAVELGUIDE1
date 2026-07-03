"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CART_PLANS,
  STRIPE_PAYMENT_LINKS,
  clearCart,
  formatEuro,
  getCartTotal,
  loadCart,
  removeCartItem,
  type CartItem,
  type PlanKey,
} from "@/lib/cart";
import LangToggle from "@/components/LangToggle";

const LEGAL_NOTICE =
  "Les horaires et jours d'ouverture des monuments et lieux recommandés dans votre guide sont fournis à titre indicatif. Spiregg ne peut être tenu responsable en cas de fermeture exceptionnelle, de modification d'horaires ou d'événements imprévus. Vérifiez les informations officielles avant chaque visite.";

function CartContent() {
  const router = useRouter();
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

  useEffect(() => {
    queueMicrotask(() => {
      setItems(loadCart());
      const saved = localStorage.getItem("tgai_promo");
      if (saved) setPromoCode(saved);
    });
  }, []);

  const total = getCartTotal(items);
  const firstPlanId = items[0]?.planId;

  // Pas d'auto-remplissage — l'utilisateur saisit WELCOME manuellement

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
      const savings = Math.round(total * 0.4); // -40%
      setPromoSavings(savings);
      setPromoMessage(`Code ${normalizedCode} appliqué — -40% sur votre commande ! 🎉`);
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
      const baseLink = STRIPE_PAYMENT_LINKS[item.planId as PlanKey];
      if (!baseLink) throw new Error("Lien de paiement introuvable.");
      const stripeUrl = normalizedPromoCode
        ? `${baseLink}?prefilled_promo_code=${encodeURIComponent(normalizedPromoCode)}`
        : baseLink;
      router.push(stripeUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <header className="sticky top-0 z-20 border-b border-[#425C47]/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-bold text-[#425C47]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            TravelGuide AI
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link href="/#pricing" className="rounded-full border border-[#425C47]/15 px-4 py-2 text-sm font-semibold text-[#425C47] hover:border-[#c9a84c]">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Panier</p>
            <h1 className="mt-2 text-3xl font-bold text-[#425C47]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Vos guides à commander
            </h1>
          </div>
          <p className="text-sm text-[#425C47]/55">{items.length} article{items.length > 1 ? "s" : ""}</p>
        </div>

        {items.length === 0 ? (
          <section className="rounded-[2rem] border border-[#425C47]/10 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a84c]/15 text-3xl">🛒</div>
            <h2 className="text-2xl font-bold text-[#425C47]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Votre panier est vide.
            </h2>
            <p className="mt-3 text-sm text-[#425C47]/60">Ajoutez un guide personnalisé avant de passer au paiement.</p>
            <Link href="/#pricing" className="mt-6 inline-flex rounded-full bg-[#c9a84c] px-6 py-3 text-sm font-bold text-white hover:bg-[#b8962e]">
              Commencer un guide →
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {items.map((item, index) => (
                <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-[#425C47]/10 bg-white shadow-sm">
                  <div className="border-b border-[#425C47]/8 bg-[#425C47] px-5 py-4 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c9a84c]">Guide #{index + 1}</p>
                        <h2 className="mt-1 text-xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                          🗺️ {item.destination || "Destination à confirmer"}
                        </h2>
                      </div>
                      <strong className="rounded-full bg-white/10 px-4 py-2 text-sm text-[#f2d991]">{formatEuro(item.price)}</strong>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#F8F4EF] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#425C47]/45">📅 Dates</p>
                      <p className="mt-1 text-sm font-semibold text-[#425C47]">{item.dates || "À confirmer"}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F8F4EF] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#425C47]/45">📦 Durée</p>
                      <p className="mt-1 text-sm font-semibold text-[#425C47]">{item.planLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F8F4EF] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#425C47]/45">💶 Prix</p>
                      <p className="mt-1 text-sm font-semibold text-[#425C47]">{formatEuro(item.price)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 px-5 pb-5">
                    <Link
                      href={`/questionnaire?edit=${encodeURIComponent(item.id)}&plan=${item.planId}`}
                      className="rounded-full border border-[#425C47]/15 px-4 py-2 text-sm font-bold text-[#425C47] hover:border-[#c9a84c] hover:text-[#9A7629]"
                    >
                      ✏️ Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-[1.75rem] border border-[#425C47]/10 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-[#425C47]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Récapitulatif
              </h2>

              <div className="mt-5 space-y-3 border-b border-[#425C47]/10 pb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm text-[#425C47]/65">
                    <span>{CART_PLANS[item.planId].duration} · {item.destination}</span>
                    <span className="font-semibold text-[#425C47]">{formatEuro(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#425C47]/45">Code promo</label>
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
                      className={`w-full rounded-xl border px-3 py-2.5 pr-9 text-sm font-mono focus:outline-none transition-colors ${
                        promoState === "valid"
                          ? "promo-input-valid bg-emerald-50"
                          : promoState === "invalid"
                          ? "promo-input-invalid bg-red-50"
                          : "border-[#425C47]/15 bg-[#F8F4EF] focus:border-[#c9a84c]"
                      }`}
                    />
                    {/* Icône état */}
                    {promoState === "valid" && (
                      <span className="promo-checkmark absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-base">✓</span>
                    )}
                    {promoState === "invalid" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 font-bold text-base">✕</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePromo}
                    className={`rounded-xl px-4 text-sm font-bold text-white transition-all ${
                      promoState === "valid"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-[#425C47] hover:bg-[#2e4133]"
                    }`}
                  >
                    {promoState === "valid" ? "✓" : "OK"}
                  </button>
                </div>
                {promoMessage && (
                  <p className="mt-2 text-xs text-[#425C47]/55">
                    {promoMessage}
                    {promoProfileUrl && (
                      <> <Link href={promoProfileUrl} className="font-semibold underline">Ouvrir le profil</Link></>
                    )}
                  </p>
                )}
              </div>

              <div className="my-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-bold text-amber-950">⚠️ Information importante</p>
                <p className="mt-2 text-xs leading-relaxed text-amber-900/90">{LEGAL_NOTICE}</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#425C47]/10 bg-[#F8F4EF] p-4 text-xs leading-relaxed text-[#425C47]/75 hover:bg-[#f3ede5]">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    if (event.target.checked) setTermsError(null);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#c9a84c]"
                />
                <span>
                  J&apos;ai lu et j&apos;accepte les <Link href="/cgv" className="font-semibold underline">Conditions Générales de Vente</Link> ainsi que la <Link href="/privacy" className="font-semibold underline">Politique de confidentialité</Link>. Je comprends que les informations du guide sont indicatives et non contractuelles.
                </span>
              </label>
              {termsError && <p className="mt-2 text-center text-xs font-semibold text-red-500">{termsError}</p>}

              <div className="mt-5 border-t border-[#425C47]/10 pt-5">
                {/* Badge économies */}
                {promoApplied && (
                  <div className="promo-badge-appear mb-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <span className="text-base">🎉</span>
                      Code <span className="font-mono">{promoCode}</span> appliqué
                    </span>
                    {promoSavings > 0 && (
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white">
                        -{formatEuro(promoSavings)}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[#425C47]">
                  <span className="font-bold">Total</span>
                  <div className="flex flex-col items-end gap-0.5">
                    {/* Ancien prix barré */}
                    {promoApplied && promoSavings > 0 && (
                      <span className="promo-old-price text-sm font-semibold">
                        {formatEuro(total)}
                      </span>
                    )}
                    {/* Nouveau prix */}
                    <strong
                      key={promoApplied ? "promo" : "normal"}
                      className={`text-2xl ${promoApplied && promoSavings > 0 ? "promo-new-price text-emerald-600" : "text-[#c9a84c]"}`}
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
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
                className="mt-5 w-full rounded-xl bg-[#c9a84c] py-4 text-base font-bold text-white shadow-md transition-all enabled:hover:scale-[1.02] enabled:hover:bg-[#b8962e] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
              >
                {loading ? "Ouverture du paiement…" : "Payer maintenant →"}
              </button>

              {error && (
                <p className="mt-3 text-center text-xs font-semibold text-red-500">
                  {error}
                  {checkoutProfileUrl && (
                    <> <Link href={checkoutProfileUrl} className="underline">Ouvrir le profil</Link></>
                  )}
                </p>
              )}
              <p className="mt-3 text-center text-[11px] text-[#425C47]/40">Paiement 100% sécurisé via Stripe · Une seule transaction</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F4EF]" />}>
      <CartContent />
    </Suspense>
  );
}
