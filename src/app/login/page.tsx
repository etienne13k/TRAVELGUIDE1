"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LangToggle from "@/components/LangToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      style={{ background: "#0e1310", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div />
          <Link href="/" className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#d8e3d5" }}>
            TravelGuide AI
          </Link>
          <LangToggle />
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#161c14", border: "1px solid #232c20" }}>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#d8e3d5" }}>
            Connexion
          </h1>
          <p className="text-sm mb-6" style={{ color: "#7a9076" }}>
            Accédez à votre espace client et suivez vos commandes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#b8cdb4" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "#111810", border: "1.5px solid #232c20", color: "#d8e3d5" }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                onBlur={(e) => (e.target.style.borderColor = "#232c20")}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium" style={{ color: "#b8cdb4" }}>Mot de passe</label>
                <Link href="/forgot-password" className="text-xs" style={{ color: "#C9A84C" }}>
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
                style={{ background: "#111810", border: "1.5px solid #232c20", color: "#d8e3d5" }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                onBlur={(e) => (e.target.style.borderColor = "#232c20")}
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
              style={{ background: loading ? "#2a3527" : "#425C47", color: "#d8e3d5" }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid #232c20", color: "#7a9076" }}>
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "#C9A84C" }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
