"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type KeyStatus = {
  set: boolean;
  preview: string;
  source: string;
  updated_at: string | null;
};

type Config = Record<string, KeyStatus>;

const KEY_LABELS: Record<string, { label: string; placeholder: string; hint: string }> = {
  ANTHROPIC_API_KEY:    { label: "Anthropic API Key",       placeholder: "sk-ant-api03-...",       hint: "Clé pour générer les guides avec Claude" },
  STRIPE_SECRET_KEY:    { label: "Stripe Secret Key",        placeholder: "sk_live_... ou sk_test_...", hint: "Clé secrète Stripe pour récupérer les sessions" },
  STRIPE_WEBHOOK_SECRET:{ label: "Stripe Webhook Secret",    placeholder: "whsec_...",              hint: "Secret pour valider les webhooks Stripe" },
  INTERNAL_SECRET:      { label: "Internal Secret",          placeholder: "une-chaine-aleatoire",   hint: "Secret pour les appels internes auto-generate" },
  RESEND_API_KEY:       { label: "Resend API Key",           placeholder: "re_...",                 hint: "Clé pour envoyer les emails (PDF du guide)" },
};

export default function AdminConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d: Config) => setConfig(d))
      .catch(() => setMsg({ type: "err", text: "Erreur de chargement" }));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const toSave = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v.trim())
    );

    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    });
    const data = await res.json() as { saved: string[]; errors: string[] };
    setSaving(false);

    if (data.saved?.length > 0) {
      setMsg({ type: "ok", text: `Sauvegardé : ${data.saved.join(", ")}` });
      setValues({});
      // Reload config
      fetch("/api/admin/config").then((r) => r.json()).then((d: Config) => setConfig(d));
    }
    if (data.errors?.length > 0) {
      setMsg({ type: "err", text: data.errors.join(", ") });
    }
  }

  async function handleDelete(key: string) {
    await fetch("/api/admin/config", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    fetch("/api/admin/config").then((r) => r.json()).then((d: Config) => setConfig(d));
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white">← Admin</Link>
          <h1 className="text-2xl font-bold text-white">Configuration</h1>
        </div>

        <p className="mb-6 text-sm text-slate-400">
          Les clés stockées ici en base de données sont utilisées en fallback si les variables d&apos;environnement Vercel sont absentes.
          La source <span className="text-green-400 font-semibold">env</span> = Vercel (prioritaire),{" "}
          <span className="text-blue-400 font-semibold">db</span> = stockée ici.
        </p>

        {/* Status actuel */}
        {config && (
          <div className="mb-8 rounded-xl border border-white/10 bg-[#111c33] p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">État actuel</p>
            {Object.entries(KEY_LABELS).map(([key, meta]) => {
              const status = config[key];
              return (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{meta.label}</p>
                    <p className="text-xs text-slate-500">{meta.hint}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {status?.set ? (
                      <>
                        <span className="text-xs font-mono text-slate-400">{status.preview}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.source === "env" ? "bg-green-400/15 text-green-300" : "bg-blue-400/15 text-blue-300"}`}>
                          {status.source}
                        </span>
                        {status.source === "db" && (
                          <button
                            onClick={() => handleDelete(key)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-400/15 text-red-300">manquante</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Définir / remplacer une clé</p>
          {Object.entries(KEY_LABELS).map(([key, meta]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-300 mb-1">{meta.label}</label>
              <input
                type="password"
                placeholder={meta.placeholder}
                value={values[key] ?? ""}
                onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-[#c9a84c] focus:outline-none"
                autoComplete="off"
              />
            </div>
          ))}

          {msg && (
            <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-400/10 text-green-300" : "bg-red-400/10 text-red-300"}`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || Object.values(values).every((v) => !v.trim())}
            className="w-full rounded-xl bg-[#c9a84c] py-3 text-sm font-bold text-[#0f172a] disabled:opacity-40"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder en base de données"}
          </button>
        </form>

        {/* Test rapide */}
        <div className="mt-8 rounded-xl border border-white/10 bg-[#111c33] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Test rapide</p>
          <div className="flex gap-3">
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5"
            >
              /api/health
            </a>
            <a
              href="/api/test-env"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5"
            >
              /api/test-env
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
