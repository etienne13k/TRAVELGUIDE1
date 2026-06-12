"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tgai_newsletter_dismissed";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    // Ne pas afficher si déjà fermé ou inscrit
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Afficher après 12 secondes
    const timer = setTimeout(() => setVisible(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;

    setStatus("loading");
    try {
      // Envoi vers une API newsletter (à connecter selon votre outil : Mailchimp, Brevo, etc.)
      // Pour l'instant on simule le succès
      await new Promise(r => setTimeout(r, 800));
      setStatus("success");
      localStorage.setItem(STORAGE_KEY, "subscribed");
      setTimeout(() => setVisible(false), 3000);
    } catch {
      setStatus("error");
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-4 sm:right-6 z-[100] w-full max-w-sm animate-slide-up"
      role="dialog"
      aria-label="Inscription à la newsletter"
    >
      <div className="rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden">

        {/* Header vert */}
        <div className="bg-gradient-to-br from-[#425C47] to-[#2e4133] px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-sm">✈️ Restez inspiré·e</p>
            <p className="text-white/70 text-xs mt-0.5">Conseils voyage, offres exclusives, destinations tendance.</p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-white/50 hover:text-white text-lg leading-none ml-3 flex-shrink-0 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Corps */}
        <div className="px-5 py-4">
          {status === "success" ? (
            <div className="text-center py-2">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-[#425C47] text-sm">Vous êtes inscrit·e !</p>
              <p className="text-xs text-[#425C47]/55 mt-1">Bienvenue dans la communauté TravelGuide AI.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#425C47]/60 mb-3 leading-relaxed">
                Pas de spam. Uniquement du contenu utile pour voyager mieux.
                <br />
                <span className="text-[#425C47]/40">Désinscription en 1 clic à tout moment.</span>
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="flex-1 min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors bg-[#F5F7F5]"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-xl bg-[#C9A84C] hover:bg-[#B8962E] disabled:bg-gray-300 text-white text-xs font-bold px-4 py-2.5 transition-all flex-shrink-0"
                >
                  {status === "loading" ? "…" : "OK"}
                </button>
              </form>
              {status === "error" && (
                <p className="text-xs text-red-500 mt-2">Une erreur est survenue. Réessayez.</p>
              )}
              <p className="text-[10px] text-[#425C47]/35 mt-2">
                En vous inscrivant, vous acceptez de recevoir nos emails.{" "}
                <a href="/privacy" className="underline hover:text-[#425C47]">Politique de confidentialité</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
