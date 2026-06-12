"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Identifiants incorrects");
        return;
      }
      router.push(searchParams.get("redirect") || "/admin");
      router.refresh();
    } catch {
      setError("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-10 text-slate-100" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-[#1e293b] p-8 shadow-2xl shadow-black/30">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a84c]">Spire GG</p>
            <h1 className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Connexion admin
            </h1>
            <p className="mt-2 text-sm text-slate-400">Accès privé au suivi des commandes et livraisons.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c9a84c]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c9a84c]"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#c9a84c] px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#ddb958] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
