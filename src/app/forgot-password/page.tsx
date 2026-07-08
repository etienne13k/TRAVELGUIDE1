"use client";

import { useState } from "react";
import Link from "next/link";
import { useMode } from "@/lib/mode-theme";

const T = {
  fr: {
    title: "Mot de passe oublié",
    subtitle: "Entrez votre email pour recevoir un lien de réinitialisation.",
    label: "Email",
    placeholder: "vous@exemple.com",
    submit: "Envoyer le lien de réinitialisation",
    submitting: "Envoi en cours…",
    backLogin: "← Retour à la connexion",
    sentTitle: "Email envoyé",
    sentMsg1: "Si un compte existe pour",
    sentMsg2: ", vous recevrez un lien de réinitialisation dans les prochaines minutes. Vérifiez aussi vos spams.",
    networkError: "Erreur réseau",
  },
  en: {
    title: "Forgot password",
    subtitle: "Enter your email to receive a reset link.",
    label: "Email",
    placeholder: "you@example.com",
    submit: "Send reset link",
    submitting: "Sending…",
    backLogin: "← Back to login",
    sentTitle: "Email sent",
    sentMsg1: "If an account exists for",
    sentMsg2: ", you'll receive a reset link within a few minutes. Check your spam folder too.",
    networkError: "Network error",
  },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";
  const t = T[lang];

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
      if (!res.ok) setError(data.error || (lang === "fr" ? "Erreur serveur" : "Server error"));
      else setSent(true);
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <Link href={backHref} className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {brandName}
          </Link>
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
            {(["fr", "en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="rounded-md px-2 py-0.5 text-xs font-bold transition-all"
                style={lang === l ? { background: "var(--ce)", color: "var(--ct)" } : { color: "var(--cm)", opacity: 0.6 }}>
                {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "var(--caf)", border: "1px solid var(--cab)", color: "var(--ca)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
                {t.sentTitle}
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>
                {t.sentMsg1} <strong style={{ color: "var(--cs)" }}>{email}</strong>{t.sentMsg2}
              </p>
              <Link href="/login" className="text-sm font-semibold" style={{ color: "var(--ca)" }}>
                {t.backLogin}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
                {t.title}
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>{t.subtitle}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>{t.label}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t.placeholder}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: "var(--cd)", border: "1px solid var(--ce)", color: "var(--ct)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--ca)")}
                    onBlur={e => (e.target.style.borderColor = "var(--ce)")} />
                </div>

                {error && (
                  <div className="rounded-lg px-4 py-3 text-sm bg-red-950/30 text-red-400 border border-red-900/40">{error}</div>
                )}

                <button type="submit" disabled={loading} className="w-full rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--ca)", color: "var(--cat)" }}
                  onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = "var(--cah)"; }}
                  onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = "var(--ca)"; }}>
                  {loading ? t.submitting : t.submit}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <Link href="/login" className="font-semibold" style={{ color: "var(--ca)" }}>{t.backLogin}</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
