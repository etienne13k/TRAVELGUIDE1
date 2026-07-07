"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMode } from "@/lib/mode-theme";

const inputStyle = {
  background: "var(--cd)",
  border: "1px solid var(--ce)",
  color: "var(--ct)",
} as React.CSSProperties;

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
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { setError("Le mot de passe doit faire au moins 8 caractères"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Erreur serveur");
      else { setSuccess(true); setTimeout(() => router.push("/login"), 3000); }
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  if (!token) return (
    <div className="text-center">
      <p className="text-4xl font-black mb-4" style={{ color: "var(--ca)" }}>!</p>
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>Lien invalide</h1>
      <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>Ce lien de réinitialisation est manquant ou invalide.</p>
      <Link href="/forgot-password" className="text-sm font-semibold" style={{ color: "var(--ca)" }}>Demander un nouveau lien →</Link>
    </div>
  );

  if (success) return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>Mot de passe mis à jour</h1>
      <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>Votre mot de passe a été réinitialisé. Redirection en cours…</p>
      <Link href="/login" className="text-sm font-semibold" style={{ color: "var(--ca)" }}>Se connecter →</Link>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>Nouveau mot de passe</h1>
      <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>Choisissez un nouveau mot de passe pour votre compte.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>Nouveau mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="••••••••"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--ca)")} onBlur={e => (e.target.style.borderColor = "var(--ce)")} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>Confirmer le mot de passe</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••••"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--ca)")} onBlur={e => (e.target.style.borderColor = "var(--ce)")} />
        </div>
        {error && <div className="rounded-lg px-4 py-3 text-sm bg-red-950/30 text-red-400 border border-red-900/40">{error}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-xl py-3 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ background: "var(--ca)", color: "var(--cat)" }}
          onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = "var(--cah)"; }}
          onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = "var(--ca)"; }}
        >
          {loading ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business IA" : "TravelGuide AI";
  const backHref = isBusiness ? "/business" : "/personal";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href={backHref} className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>{brandName}</Link>
        </div>
        <div className="rounded-2xl p-8" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
          <Suspense fallback={<div className="text-sm text-center" style={{ color: "var(--cf)" }}>Chargement…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
