"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LangToggle from "@/components/LangToggle";
import { useMode } from "@/lib/mode-theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
      } else {
        window.posthog?.capture("login_completed");
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
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div />
          <Link href={backHref} className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {brandName}
          </Link>
          <LangToggle />
        </div>

        <div className="rounded-2xl p-8" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            Connexion
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>
            Accédez à votre espace client et suivez vos commandes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--cs)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "var(--cd)", border: "1.5px solid var(--ce)", color: "var(--ct)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ce)")}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium" style={{ color: "var(--cs)" }}>Mot de passe</label>
                <Link href="/forgot-password" className="text-xs" style={{ color: "var(--ca)" }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "var(--cd)", border: "1.5px solid var(--ce)", color: "var(--ct)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ca)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ce)")}
              />
            </div>

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
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid var(--ce)", color: "var(--cm)" }}>
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "var(--ca)" }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
