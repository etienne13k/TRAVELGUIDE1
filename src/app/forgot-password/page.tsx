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
      if (!res.ok) {
        setError(data.error || "Erreur serveur");
      } else {
        setSent(true);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#FDFAF5", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
            ✈️ TravelGuide AI
          </Link>
        </div>

        <div className="rounded-2xl p-8 shadow-lg" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
                Email envoyé !
              </h1>
              <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans les prochaines minutes. Vérifiez aussi vos spams.
              </p>
              <Link href="/login" className="text-sm font-semibold" style={{ color: "#C9A84C" }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
                Mot de passe oublié
              </h1>
              <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: "#F8F5EF", border: "1.5px solid #E8E0D0", color: "#425C47" }}
                    onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.target.style.borderColor = "#E8E0D0")}
                  />
                </div>

                {error && (
                  <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 font-semibold text-sm transition-all"
                  style={{ background: loading ? "#8899bb" : "#425C47", color: "#fff" }}
                >
                  {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm" style={{ color: "#7a7060" }}>
                <Link href="/login" className="font-semibold" style={{ color: "#C9A84C" }}>
                  ← Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
