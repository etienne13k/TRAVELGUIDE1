"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur serveur");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
          Lien invalide
        </h1>
        <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
          Ce lien de réinitialisation est manquant ou invalide.
        </p>
        <Link href="/forgot-password" className="text-sm font-semibold" style={{ color: "#C9A84C" }}>
          Demander un nouveau lien →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
          Mot de passe mis à jour !
        </h1>
        <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
          Votre mot de passe a été réinitialisé. Vous allez être redirigé vers la connexion…
        </p>
        <Link href="/login" className="text-sm font-semibold" style={{ color: "#C9A84C" }}>
          Se connecter →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
        Nouveau mot de passe
      </h1>
      <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{ background: "#F8F5EF", border: "1.5px solid #E8E0D0", color: "#425C47" }}
            onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
            onBlur={(e) => (e.target.style.borderColor = "#E8E0D0")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "#425C47" }}>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="••••••••"
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
          {loading ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-sm text-center" style={{ color: "#7a7060" }}>Chargement…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
