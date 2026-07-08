"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PhoneVerificationProps = {
  initialPhone?: string | null;
  initialVerified?: boolean;
};

type Country = {
  flag: string;
  label: string;
  code: string;
};

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

const COUNTRIES: Country[] = [
  { flag: "🇫🇷", label: "France", code: "+33" },
  { flag: "🇧🇪", label: "Belgique", code: "+32" },
  { flag: "🇨🇭", label: "Suisse", code: "+41" },
  { flag: "🇨🇦", label: "Canada", code: "+1" },
  { flag: "🇺🇸", label: "États-Unis", code: "+1" },
  { flag: "🇬🇧", label: "Royaume-Uni", code: "+44" },
  { flag: "🇪🇸", label: "Espagne", code: "+34" },
  { flag: "🇩🇪", label: "Allemagne", code: "+49" },
  { flag: "🇮🇹", label: "Italie", code: "+39" },
];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function parseInitialPhone(phone?: string | null) {
  if (!phone) return { countryCode: "+33", localNumber: "" };
  const country = COUNTRIES.find((candidate) => phone.startsWith(candidate.code)) ?? COUNTRIES[0];
  return {
    countryCode: country.code,
    localNumber: phone.slice(country.code.length).replace(/^0+/, ""),
  };
}

function maskPhone(phone: string): string {
  if (phone.startsWith("+33") && phone.length >= 11) {
    return `+33 ${phone.slice(3, 4)} •••• •• ${phone.slice(-2)}`;
  }

  return `${phone.slice(0, Math.min(4, phone.length - 2))} •••• ${phone.slice(-2)}`;
}

export default function PhoneVerification({ initialPhone, initialVerified = false }: PhoneVerificationProps) {
  const router = useRouter();
  const parsedPhone = useMemo(() => parseInitialPhone(initialPhone), [initialPhone]);
  const [countryCode, setCountryCode] = useState(parsedPhone.countryCode);
  const [localNumber, setLocalNumber] = useState(parsedPhone.localNumber);
  const [step, setStep] = useState<"phone" | "code" | "verified">(initialVerified ? "verified" : "phone");
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState(initialPhone ?? "");
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const fullPhone = useMemo(() => {
    const localDigits = digitsOnly(localNumber).replace(/^0+/, "");
    return `${countryCode}${localDigits}`;
  }, [countryCode, localNumber]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function sendOtp() {
    setSending(true);
    setDemoCode(null);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus({ type: "error", message: data.message ?? "Impossible d’envoyer le code." });
        return;
      }

      const returnedDemoCode = typeof data.demoCode === "string" ? data.demoCode : null;
      const isDemoMode = data.demoMode === true && returnedDemoCode !== null;

      setStep("code");
      setCountdown(60);
      setCodeDigits(Array(6).fill(""));
      setDemoCode(isDemoMode ? returnedDemoCode : null);
      setStatus({
        type: "success",
        message: data.message ?? (isDemoMode ? `Mode démo - Code : ${returnedDemoCode}` : `Code envoyé par SMS au ${fullPhone}.`),
      });
      window.setTimeout(() => codeRefs.current[0]?.focus(), 50);
    } catch {
      setStatus({ type: "error", message: "Erreur réseau, réessayez." });
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    const code = codeDigits.join("");
    if (code.length !== 6) {
      setStatus({ type: "error", message: "Entrez les 6 chiffres du code." });
      return;
    }

    setVerifying(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, code }),
      });
      const data = await response.json();

      if (!response.ok || !data.verified) {
        setStatus({ type: "error", message: data.message ?? "Code incorrect ou expiré." });
        return;
      }

      setVerifiedPhone(data.phone ?? fullPhone);
      setStep("verified");
      setStatus({ type: "success", message: "✅ Numéro vérifié !" });
      window.posthog?.capture("phone_verified", { source: "account" });
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Erreur réseau, réessayez." });
    } finally {
      setVerifying(false);
    }
  }

  function updateCodeDigit(index: number, value: string) {
    const digits = digitsOnly(value);
    if (digits.length > 1) {
      const nextDigits = Array(6).fill("");
      digits.slice(0, 6).split("").forEach((digit, digitIndex) => {
        nextDigits[digitIndex] = digit;
      });
      setCodeDigits(nextDigits);
      codeRefs.current[Math.min(digits.length, 6) - 1]?.focus();
      return;
    }

    setCodeDigits((current) => current.map((digit, digitIndex) => (digitIndex === index ? digits : digit)));
    if (digits && index < 5) codeRefs.current[index + 1]?.focus();
  }

  function handleBackspace(index: number, key: string) {
    if (key !== "Backspace" || codeDigits[index] || index === 0) return;
    codeRefs.current[index - 1]?.focus();
  }

  if (step === "verified") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm animate-phone-success">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold">Numéro vérifié</p>
            <p className="text-sm text-emerald-700">{verifiedPhone ? maskPhone(verifiedPhone) : "Votre numéro est validé."}</p>
            <p className="mt-2 text-xs text-emerald-700">Le code WELCOME (-25% sur votre premier guide) est maintenant débloqué !</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl p-4 shadow-sm" style={{ border: "1px solid var(--ce)", background: "var(--cd)" }}>
      <div className="flex items-start gap-3">
        <span className="rounded-2xl p-3 text-2xl shadow-inner" style={{ background: "var(--cv)" }}>📱</span>
        <div>
          <h3 className="font-bold" style={{ color: "var(--ct)" }}>Vérification téléphone</h3>
          <p className="text-sm" style={{ color: "var(--cm)" }}>Recevez un code SMS pour débloquer le code WELCOME (-25% sur votre premier guide).</p>
        </div>
      </div>

      {step === "phone" && (
        <div className="space-y-3">
          <div className="grid grid-cols-[minmax(118px,0.55fr)_1fr] gap-2 max-sm:grid-cols-1">
            <label className="sr-only" htmlFor="phone-country">Pays</label>
            <select
              id="phone-country"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="rounded-xl px-3 py-3 text-sm font-semibold outline-none" style={{ border: "1px solid var(--ce)", background: "var(--cd)", color: "var(--ct)" }}
            >
              {COUNTRIES.map((country) => (
                <option key={`${country.label}-${country.code}`} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="phone-local">Numéro de téléphone</label>
            <input
              id="phone-local"
              type="tel"
              value={localNumber}
              onChange={(event) => setLocalNumber(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendOtp()}
              placeholder="6 12 34 56 78"
              className="rounded-xl px-4 py-3 text-sm font-mono outline-none transition" style={{ border: "1px solid var(--ce)", background: "var(--cd)", color: "var(--ct)" }}
            />
          </div>
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending || digitsOnly(localNumber).length < 6}
            className="w-full rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60" style={{ background: "var(--ck)", color: "var(--cat)" }}
          >
            {sending ? "Envoi du code…" : "Envoyer le code"}
          </button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-4">
          {demoCode && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-bold">Mode démo - Code : <span className="font-mono text-base">{demoCode}</span></p>
              <p className="mt-1 text-xs">Aucun SMS réel n&apos;a été envoyé, car Twilio Verify n&apos;est pas configuré.</p>
            </div>
          )}
          <div className="flex justify-between gap-2" aria-label="Code SMS à 6 chiffres">
            {codeDigits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  codeRefs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => updateCodeDigit(index, event.target.value)}
                onKeyDown={(event) => handleBackspace(index, event.key)}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                className="h-12 w-11 rounded-xl text-center text-lg font-bold outline-none transition sm:h-14 sm:w-12" style={{ border: "1px solid var(--ce)", background: "var(--cd)", color: "var(--ct)" }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={verifyOtp}
            disabled={verifying || codeDigits.join("").length !== 6}
            className="w-full rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60" style={{ background: "var(--ca)", color: "var(--cat)" }}
          >
            {verifying ? "Vérification…" : "Vérifier"}
          </button>
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending || countdown > 0}
            className="text-sm font-semibold underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50" style={{ color: "var(--ca)" }}
          >
            {countdown > 0 ? `Renvoyer le code dans ${countdown}s` : "Renvoyer le code"}
          </button>
        </div>
      )}

      {status.message && (
        <p className={`rounded-xl px-4 py-3 text-sm font-medium ${status.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {status.message}
        </p>
      )}
      <p className="text-xs" style={{ color: "var(--cm)" }}>Format final : {fullPhone || "+33612345678"}</p>
    </div>
  );
}
