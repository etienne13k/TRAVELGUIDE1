"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-[#111810] border border-[#2a3527] text-[#d8e3d5] placeholder-[#3a5037] focus:border-[#c9a84c]";

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
      <p className="text-4xl font-black text-[#c9a84c] mb-4">!</p>
      <h1 className="text-2xl font-bold mb-2 text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Lien invalide</h1>
      <p className="text-sm mb-6 text-[#7a9076]">Ce lien de réinitialisation est manquant ou invalide.</p>
      <Link href="/forgot-password" className="text-sm font-semibold text-[#c9a84c]">Demander un nouveau lien →</Link>
    </div>
  );

  if (success) return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Mot de passe mis à jour</h1>
      <p className="text-sm mb-6 text-[#7a9076]">Votre mot de passe a été réinitialisé. Redirection en cours…</p>
      <Link href="/login" className="text-sm font-semibold text-[#c9a84c]">Se connecter →</Link>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-bold mb-1 text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Nouveau mot de passe</h1>
      <p className="text-sm mb-6 text-[#7a9076]">Choisissez un nouveau mot de passe pour votre compte.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#4a6447] mb-1.5">Nouveau mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="••••••••" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#4a6447] mb-1.5">Confirmer le mot de passe</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••••" className={inputCls} />
        </div>
        {error && <div className="rounded-lg px-4 py-3 text-sm bg-red-950/30 text-red-400 border border-red-900/40">{error}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-xl py-3 font-semibold text-sm bg-[#c9a84c] text-[#0e1310] hover:bg-[#b8962e] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {loading ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0e1310]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-xl font-bold text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>TravelGuide AI</Link>
        </div>
        <div className="rounded-2xl p-8 bg-[#161c14] border border-[#232c20]">
          <Suspense fallback={<div className="text-sm text-center text-[#4a6447]">Chargement…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
