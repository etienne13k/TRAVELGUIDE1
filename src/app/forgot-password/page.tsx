"use client";

import { useState } from "react";
import Link from "next/link";
import { useMode } from "@/lib/mode-theme";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business IA" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Erreur serveur");
      else setSent(true);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href={backHref} className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {brandName}
          </Link>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "var(--caf)", border: "1px solid var(--cab)", color: "var(--ca)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
                Email envoyé
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>
                Si un compte existe pour <strong style={{ color: "var(--cs)" }}>{email}</strong>, vous recevrez un lien de réinitialisation dans les prochaines minutes. Vérifiez aussi vos spams.
              </p>
              <Link href="/login" className="text-sm font-semibold" style={{ color: "var(--ca)" }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
                Mot de passe oublié
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: "var(--cd)", border: "1px solid var(--ce)", color: "var(--ct)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--ca)")}
                    onBlur={e => (e.target.style.borderColor = "var(--ce)")}
                  />
                </div>

                {error && (
                  <div className="rounded-lg px-4 py-3 text-sm bg-red-950/30 text-red-400 border border-red-900/40">{error}</div>
                )}

                <button type="submit" disabled={loading} className="w-full rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--ca)", color: "var(--cat)" }}
                  onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = "var(--cah)"; }}
                  onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = "var(--ca)"; }}
                >
                  {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <Link href="/login" className="font-semibold" style={{ color: "var(--ca)" }}>← Retour à la connexion</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
