"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LangToggle from "@/components/LangToggle";

type SignupFormProps = {
  turnstileSiteKey: string;
};

const inputStyle = {
  background: "#F8F5EF",
  border: "1.5px solid #E8E0D0",
  color: "#425C47",
};

export default function SignupForm({ turnstileSiteKey }: SignupFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [antiBotAnswer, setAntiBotAnswer] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const turnstileToken = formData.get("cf-turnstile-response")?.toString() ?? "";

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phoneNumber,
          password,
          turnstileToken,
          antiBotAnswer,
          companyWebsite,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur d'inscription");
      } else {
        window.posthog?.capture("signup_completed");
        router.push("/account");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#FDFAF5", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div />
          <Link
            href="/"
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}
          >
            ✈️ TravelGuide AI
          </Link>
          <LangToggle />
        </div>

        <div className="rounded-2xl p-8 shadow-lg" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}
          >
            Créer un compte
          </h1>
          <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
            Suivez vos guides de voyage en temps réel depuis votre espace personnel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(event) => (event.target.style.borderColor = "#C9A84C")}
                onBlur={(event) => (event.target.style.borderColor = "#E8E0D0")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>
                Téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
                pattern="^\+[1-9]\d{1,14}$"
                placeholder="+33612345678"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(event) => (event.target.style.borderColor = "#C9A84C")}
                onBlur={(event) => (event.target.style.borderColor = "#E8E0D0")}
              />
              <p className="mt-1 text-xs" style={{ color: "#7a7060" }}>
                Format international E.164 requis. Exemple : +33612345678.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(event) => (event.target.style.borderColor = "#C9A84C")}
                onBlur={(event) => (event.target.style.borderColor = "#E8E0D0")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(event) => (event.target.style.borderColor = "#C9A84C")}
                onBlur={(event) => (event.target.style.borderColor = "#E8E0D0")}
              />
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="companyWebsite">Site web entreprise</label>
              <input
                id="companyWebsite"
                name="companyWebsite"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={companyWebsite}
                onChange={(event) => setCompanyWebsite(event.target.value)}
              />
            </div>

            {turnstileSiteKey ? (
              <div className="rounded-xl border border-[#E8E0D0] bg-[#F8F5EF] p-3">
                <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
              </div>
            ) : (
              <div className="rounded-xl border border-[#E8E0D0] bg-[#F8F5EF] p-4">
                <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>
                  Vérification anti-robot : combien font 3 + 4 ?
                </label>
                <input
                  type="text"
                  value={antiBotAnswer}
                  onChange={(event) => setAntiBotAnswer(event.target.value)}
                  required
                  inputMode="numeric"
                  placeholder="Réponse"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(event) => (event.target.style.borderColor = "#C9A84C")}
                  onBlur={(event) => (event.target.style.borderColor = "#E8E0D0")}
                />
                <p className="mt-2 text-xs" style={{ color: "#7a7060" }}>
                  Cloudflare Turnstile s&apos;activera automatiquement dès que sa clé publique sera configurée.
                </p>
              </div>
            )}

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
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid #E8E0D0", color: "#7a7060" }}>
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#C9A84C" }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
