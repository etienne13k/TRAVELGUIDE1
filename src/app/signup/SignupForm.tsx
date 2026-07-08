"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

type Step = "form" | "otp";

export default function SignupForm({ turnstileSiteKey }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "business" || mode === "personal") {
      localStorage.setItem("tgai_mode", mode);
      document.documentElement.dataset.mode = mode;
    }
  }, [searchParams]);

  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

  // Form fields
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [antiBotAnswer, setAntiBotAnswer] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  function startCountdown() {
    setResendCountdown(60);
    const tick = () =>
      setResendCountdown((c) => {
        if (c <= 1) return 0;
        window.setTimeout(tick, 1000);
        return c - 1;
      });
    window.setTimeout(tick, 1000);
  }

  async function sendOtpCode() {
    setIsSendingCode(true);
    setOtpError("");
    setDemoCode(null);
    try {
      const res = await fetch("/api/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Impossible d'envoyer le code.");
      } else {
        const returnedDemoCode = typeof data.demoCode === "string" ? data.demoCode : null;
        const isDemoMode = data.demoMode === true && returnedDemoCode !== null;

        setDemoCode(isDemoMode ? returnedDemoCode : null);
        setOtpSuccess(data.message || (isDemoMode ? `Mode démo - Code : ${returnedDemoCode}` : `Code SMS envoyé au ${phoneNumber}.`));
        startCountdown();
      }
    } catch {
      setOtpError("Erreur réseau, réessayez.");
    } finally {
      setIsSendingCode(false);
    }
  }

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
        // Transition to OTP verification step
        setStep("otp");
        await sendOtpCode();
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  function updateOtpDigit(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      // Handle paste: fill all boxes
      const next = Array(6).fill("");
      digits.slice(0, 6).split("").forEach((d, i) => { next[i] = d; });
      setOtpDigits(next);
      otpRefs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    setOtpDigits((cur) => cur.map((d, i) => (i === index ? digits : d)));
    if (digits && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, key: string) {
    if (key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerifyOtp() {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("Entrez les 6 chiffres du code.");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        setOtpError(data.message || "Code incorrect ou expiré.");
      } else {
        window.posthog?.capture("phone_verified", { source: "signup" });
        router.push("/account");
      }
    } catch {
      setOtpError("Erreur réseau, réessayez.");
    } finally {
      setOtpLoading(false);
    }
  }

  if (step === "otp") {
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
              Vérification du téléphone
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>
              {demoCode ? (
                <>Mode démo actif pour <span style={{ color: "var(--ct)", fontWeight: 600 }}>{phoneNumber}</span>. Utilisez le code affiché ci-dessous.</>
              ) : (
                <>Un code SMS a été envoyé au <span style={{ color: "var(--ct)", fontWeight: 600 }}>{phoneNumber}</span>. Entrez les 6 chiffres ci-dessous.</>
              )}
            </p>

            <div className="space-y-6">
              {demoCode && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }}
                >
                  <p className="font-bold">Mode démo - Code : <span className="font-mono text-base">{demoCode}</span></p>
                  <p className="mt-1 text-xs">Aucun SMS réel n&apos;a été envoyé, car Twilio Verify n&apos;est pas configuré.</p>
                </div>
              )}

              {/* OTP boxes */}
              <div className="flex justify-between gap-2" aria-label="Code SMS à 6 chiffres">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    value={digit}
                    onChange={(e) => updateOtpDigit(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e.key)}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    className="rounded-xl text-center text-lg font-bold outline-none transition-all"
                    style={{
                      width: "100%",
                      height: "56px",
                      background: "var(--cd)",
                      border: `1.5px solid ${digit ? "var(--ca)" : "var(--ce)"}`,
                      color: "var(--ct)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                    onBlur={(e) => (e.target.style.borderColor = otpDigits[index] ? "var(--ca)" : "var(--ce)")}
                  />
                ))}
              </div>

              {otpError && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }}
                >
                  {otpError}
                </div>
              )}

              {otpSuccess && !otpError && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}
                >
                  {otpSuccess}
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpDigits.join("").length !== 6}
                className="w-full rounded-xl py-3 font-semibold text-sm transition-all"
                style={{
                  background: (otpLoading || otpDigits.join("").length !== 6) ? "var(--ce)" : "var(--ck)",
                  color: "var(--ct)",
                }}
              >
                {otpLoading ? "Vérification…" : "Vérifier le code"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setOtpDigits(Array(6).fill(""));
                    setOtpError("");
                    setOtpSuccess("");
                    setDemoCode(null);
                    await sendOtpCode();
                  }}
                  disabled={isSendingCode || resendCountdown > 0}
                  className="text-sm font-semibold transition-all"
                  style={{
                    color: (isSendingCode || resendCountdown > 0) ? "var(--cm)" : "var(--ca)",
                    cursor: (isSendingCode || resendCountdown > 0) ? "not-allowed" : "pointer",
                    background: "none",
                    border: "none",
                  }}
                >
                  {resendCountdown > 0
                    ? `Renvoyer le code dans ${resendCountdown}s`
                    : isSendingCode
                    ? "Envoi…"
                    : "Renvoyer le code"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push("/account")}
                  className="text-xs"
                  style={{ color: "var(--cm)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Passer cette étape pour l&apos;instant →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                Téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
                pattern="^\+[1-9]\d{1,14}$"
                placeholder="+33612345678"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ce)")}
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
                  Vérification anti-robot : combien font 3 + 4 ?
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
