"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-[#111810] border border-[#2a3527] text-[#d8e3d5] placeholder-[#3a5037] focus:border-[#c9a84c]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0e1310]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-xl font-bold text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            TravelGuide AI
          </Link>
        </div>

        <div className="rounded-2xl p-8 bg-[#161c14] border border-[#232c20]">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Email envoyé
              </h1>
              <p className="text-sm mb-6 text-[#7a9076]">
                Si un compte existe pour <strong className="text-[#b8cdb4]">{email}</strong>, vous recevrez un lien de réinitialisation dans les prochaines minutes. Vérifiez aussi vos spams.
              </p>
              <Link href="/login" className="text-sm font-semibold text-[#c9a84c]">
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1 text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Mot de passe oublié
              </h1>
              <p className="text-sm mb-6 text-[#7a9076]">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#4a6447] mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.com" className={inputCls} />
                </div>

                {error && (
                  <div className="rounded-lg px-4 py-3 text-sm bg-red-950/30 text-red-400 border border-red-900/40">{error}</div>
                )}

                <button type="submit" disabled={loading} className="w-full rounded-xl py-3 font-semibold text-sm transition-all bg-[#c9a84c] text-[#0e1310] hover:bg-[#b8962e] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <Link href="/login" className="font-semibold text-[#c9a84c]">← Retour à la connexion</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
