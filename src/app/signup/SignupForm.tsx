"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LangToggle from "@/components/LangToggle";
import { useMode } from "@/lib/mode-theme";
import { ANTI_BOT_QUESTIONS } from "@/lib/anti-bot-questions";

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
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "business" || mode === "personal") {
      localStorage.setItem("tgai_mode", mode);
      document.documentElement.dataset.mode = mode;
    }
    const idx = Math.floor(Math.random() * ANTI_BOT_QUESTIONS.length);
    setAntiBotQuestion(ANTI_BOT_QUESTIONS[idx]);
  }, [searchParams]);

  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [antiBotAnswer, setAntiBotAnswer] = useState("");
  const [antiBotQuestion, setAntiBotQuestion] = useState(ANTI_BOT_QUESTIONS[0]);
  const [companyWebsite, setCompanyWebsite] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ref kept for Turnstile widget (unused otherwise)
  const _ref = useRef(null);
  void _ref;

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
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
          password,
          turnstileToken,
          antiBotAnswer,
          antiBotQuestionId: antiBotQuestion.id,
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ce)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ce)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ce)")}
              />
            </div>

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="companyWebsite">Site web entreprise</label>
              <input
                id="companyWebsite"
                name="companyWebsite"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>

            {turnstileSiteKey ? (
              <div className="rounded-xl p-3" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
                <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
              </div>
            ) : (
              <div className="rounded-xl p-4" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>
                  Vérification anti-robot : {antiBotQuestion.question}
                </label>
                <input
                  type="text"
                  value={antiBotAnswer}
                  onChange={(e) => setAntiBotAnswer(e.target.value)}
                  required
                  inputMode="numeric"
                  placeholder="Réponse"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--ce)")}
                />
                <p className="mt-2 text-xs" style={{ color: "var(--cm)" }}>
                  Cloudflare Turnstile s&apos;activera automatiquement dès que sa clé publique sera configurée.
                </p>
              </div>
            )}

            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }}
              >
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
            <Link href={`/login${isBusiness ? "?mode=business" : "?mode=personal"}`} className="font-semibold" style={{ color: "var(--ca)" }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
