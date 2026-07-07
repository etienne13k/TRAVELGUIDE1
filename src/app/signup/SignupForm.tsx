"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LangToggle from "@/components/LangToggle";
import { useMode } from "@/lib/mode-theme";

type SignupFormProps = {
  turnstileSiteKey: string;
};

const inputStyle = {
  background: "var(--cd)",
  border: "1.5px solid var(--ce)",
  color: "var(--ct)",
} as React.CSSProperties;

export default function SignupForm({ turnstileSiteKey }: SignupFormProps) {
  const router = useRouter();
  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business IA" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";
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
      style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div />
          <Link
            href={backHref}
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}
          >
            {brandName}
          </Link>
          <LangToggle />
        </div>

        <div className="rounded-2xl p-8" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}
          >
            Créer un compte
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>
            Suivez vos guides de voyage en temps réel depuis votre espace personnel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
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
                onBlur={(event) => (event.target.style.borderColor = "#232c20")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
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
                onBlur={(event) => (event.target.style.borderColor = "#232c20")}
              />
              <p className="mt-1 text-xs" style={{ color: "var(--cm)" }}>
                Format international E.164 requis. Exemple : +33612345678.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
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
                onBlur={(event) => (event.target.style.borderColor = "#232c20")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
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
                onBlur={(event) => (event.target.style.borderColor = "#232c20")}
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
              <div className="rounded-xl p-3" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
                <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
              </div>
            ) : (
              <div className="rounded-xl p-4" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
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
                  onFocus={(event) => (event.target.style.borderColor = "var(--ca)")}
                  onBlur={(event) => (event.target.style.borderColor = "var(--ce)")}
                />
                <p className="mt-2 text-xs" style={{ color: "var(--cm)" }}>
                  Cloudflare Turnstile s&apos;activera automatiquement dès que sa clé publique sera configurée.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-semibold text-sm transition-all"
              style={{ background: loading ? "var(--ce)" : "var(--ck)", color: "var(--ct)" }}
            >
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid var(--ce)", color: "var(--cm)" }}>
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--ca)" }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
