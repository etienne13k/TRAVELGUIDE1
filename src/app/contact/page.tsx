"use client";

import { useState } from "react";
import Link from "next/link";
import { useMode } from "@/lib/mode-theme";

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { isBusiness } = useMode();
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

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

  return (
    <div className="min-h-screen" style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ background: "var(--cb)", borderColor: "var(--ce)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href={backHref} className="text-sm font-medium transition-colors" style={{ color: "var(--cm)" }}>
            ← Retour au site
          </Link>
          <Link href={backHref} className="font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {brandName}
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--ca)" }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--cm)" }}>On vous répond sous 24h</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
              Une question ?<br />On est là.
            </h1>
            <p className="text-base leading-relaxed mb-8" style={{ color: "var(--cm)" }}>
              Problème avec une commande, question sur un guide, suggestion d&apos;amélioration ou simple curiosité — on lit tous les messages.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  ),
                  title: "Email direct",
                  desc: "travel-guide@nanocorp.app",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ),
                  title: "Délai de réponse",
                  desc: "Généralement sous 24h en semaine",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  ),
                  title: "Confidentialité",
                  desc: "Vos données ne sont jamais revendues",
                },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--cc)", border: "1px solid var(--ce)", color: "var(--ca)" }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--ct)" }}>{item.title}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--cm)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl p-8" style={{ border: "1px solid var(--ce)", background: "var(--cc)" }}>
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
                  Message envoyé !
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--cm)" }}>
                  Nous avons bien reçu votre message et vous répondrons sous 24h.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
                  style={{ border: "1px solid var(--ce)", color: "var(--ct)" }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.background = "var(--csh)")}
                  onMouseLeave={e => ((e.target as HTMLElement).style.background = "")}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
                    Envoyez-nous un message
                  </h2>
                  <p className="text-xs" style={{ color: "var(--cf)" }}>Tous les champs sont obligatoires.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>Prénom</label>
                    <input type="text" required value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="Jean"
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                      style={{ background: "var(--cd)", border: "1px solid var(--ce)", color: "var(--ct)" }}
                      onFocus={e => (e.target.style.borderColor = "var(--ca)")}
                      onBlur={e => (e.target.style.borderColor = "var(--ce)")}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>Nom</label>
                    <input type="text" required value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Dupont"
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                      style={{ background: "var(--cd)", border: "1px solid var(--ce)", color: "var(--ct)" }}
                      onFocus={e => (e.target.style.borderColor = "var(--ca)")}
                      onBlur={e => (e.target.style.borderColor = "var(--ce)")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>Email</label>
                  <input type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="jean.dupont@email.com"
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{ background: "var(--cd)", border: "1px solid var(--ce)", color: "var(--ct)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--ca)")}
                    onBlur={e => (e.target.style.borderColor = "var(--ce)")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--cf)" }}>Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => update("message", e.target.value)} placeholder="Décrivez votre demande..."
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                    style={{ background: "var(--cd)", border: "1px solid var(--ce)", color: "var(--ct)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--ca)")}
                    onBlur={e => (e.target.style.borderColor = "var(--ce)")}
                  />
                  <p className="text-[10px] text-right mt-1" style={{ color: "var(--cv)" }}>{form.message.length}/1000</p>
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-xl font-bold py-3.5 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "var(--ca)", color: "var(--cat)" }}
                  onMouseEnter={e => { if (status !== "loading") (e.target as HTMLElement).style.background = "var(--cah)"; }}
                  onMouseLeave={e => { if (status !== "loading") (e.target as HTMLElement).style.background = "var(--ca)"; }}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--cat)", borderTopColor: "transparent" }} />
                      Envoi en cours…
                    </span>
                  ) : "Envoyer le message"}
                </button>

                <p className="text-[10px] text-center" style={{ color: "var(--cv)" }}>
                  En envoyant ce formulaire, vous acceptez notre{" "}
                  <Link href="/privacy" className="underline" style={{ color: "var(--cm)" }}>politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 mt-8" style={{ borderColor: "var(--ce)" }}>
        <p className="text-center text-xs" style={{ color: "var(--cf)" }}>© 2026 {brandName}</p>
      </footer>
    </div>
  );
}
