"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? "Une erreur est survenue."); setStatus("error"); return; }
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setStatus("error");
    }
  }

  const inputCls = "w-full rounded-xl border border-[#2a3527] px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-[#111810] text-[#d8e3d5] placeholder-[#3a5037] transition-colors";

  return (
    <div className="min-h-screen bg-[#0e1310]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <header className="sticky top-0 z-10 bg-[#0e1310]/95 backdrop-blur border-b border-[#232c20]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#7a9076] hover:text-[#d8e3d5] transition-colors font-medium">
            ← Retour au site
          </Link>
          <Link href="/" className="font-bold text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            TravelGuide AI
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#161c14] border border-[#232c20] rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-[#c9a84c] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#7a9076] uppercase tracking-wide">On vous répond sous 48h</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#d8e3d5] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Une question ?<br />On est là.
            </h1>
            <p className="text-[#7a9076] text-base leading-relaxed mb-8">
              Problème avec une commande, question sur un guide, suggestion d&apos;amélioration ou simple curiosité — on lit tous les messages.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  ),
                  title: "Email direct",
                  desc: "travel-guide@nanocorp.app",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ),
                  title: "Délai de réponse",
                  desc: "Généralement sous 48h en semaine",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  ),
                  title: "Confidentialité",
                  desc: "Vos données ne sont jamais revendues",
                },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#161c14] border border-[#232c20] flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[#d8e3d5] text-sm">{item.title}</p>
                    <p className="text-[#7a9076] text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl border border-[#232c20] bg-[#161c14] p-8">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-xl font-bold text-[#d8e3d5] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Message envoyé !
                </h2>
                <p className="text-[#7a9076] text-sm mb-6">
                  Nous avons bien reçu votre message et vous répondrons sous 48h.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="rounded-xl border border-[#232c20] px-5 py-2.5 text-sm font-semibold text-[#d8e3d5] hover:bg-[#1e2820] transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#d8e3d5] mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    Envoyez-nous un message
                  </h2>
                  <p className="text-xs text-[#4a6447]">Tous les champs sont obligatoires.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#4a6447] mb-1.5">Prénom</label>
                    <input type="text" required value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="Jean" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#4a6447] mb-1.5">Nom</label>
                    <input type="text" required value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Dupont" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#4a6447] mb-1.5">Email</label>
                  <input type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="jean.dupont@email.com" className={inputCls} />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#4a6447] mb-1.5">Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => update("message", e.target.value)} placeholder="Décrivez votre demande..." className={`${inputCls} resize-none`} />
                  <p className="text-[10px] text-[#3a5037] text-right mt-1">{form.message.length}/1000</p>
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-xl bg-[#c9a84c] text-[#0e1310] font-bold py-3.5 text-sm transition-all hover:bg-[#b8962e] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0e1310] border-t-transparent rounded-full animate-spin" />
                      Envoi en cours…
                    </span>
                  ) : "Envoyer le message"}
                </button>

                <p className="text-[10px] text-[#3a5037] text-center">
                  En envoyant ce formulaire, vous acceptez notre{" "}
                  <Link href="/privacy" className="underline hover:text-[#7a9076]">politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#232c20] py-6 mt-8">
        <p className="text-center text-xs text-[#4a6447]">© 2026 TravelGuide AI</p>
      </footer>
    </div>
  );
}
