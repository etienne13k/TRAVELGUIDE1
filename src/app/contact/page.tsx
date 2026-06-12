"use client";

import { useState } from "react";
import Link from "next/link";
import LangToggle from "@/components/LangToggle";

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

      if (!res.ok) {
        setErrorMsg(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>

      {/* Nav */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#425C47]/70 hover:text-[#425C47] transition-colors font-medium">
            ← Retour au site
          </Link>
          <Link href="/" className="font-bold text-[#425C47]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            TravelGuide AI
          </Link>
          <LangToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — texte */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#425C47]/8 border border-[#425C47]/15 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-[#425C47] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#425C47] uppercase tracking-wide">On vous répond sous 48h</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#425C47] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Une question ?<br />On est là. ✈️
            </h1>
            <p className="text-[#425C47]/60 text-base leading-relaxed mb-8">
              Problème avec une commande, question sur un guide, suggestion d&apos;amélioration ou simple curiosité — on lit tous les messages.
            </p>

            <div className="space-y-5">
              {[
                { icon: "📧", title: "Email direct", desc: "travel-guide@nanocorp.app" },
                { icon: "⏱️", title: "Délai de réponse", desc: "Généralement sous 48h en semaine" },
                { icon: "🔒", title: "Confidentialité", desc: "Vos données ne sont jamais revendues" },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#425C47]/8 flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[#425C47] text-sm">{item.title}</p>
                    <p className="text-[#425C47]/55 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — formulaire */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_40px_rgba(0,0,0,0.08)] p-8">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-[#425C47] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Message envoyé !
                </h2>
                <p className="text-[#425C47]/60 text-sm mb-6">
                  Nous avons bien reçu votre message et vous répondrons sous 48h.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="rounded-xl border border-[#425C47]/20 px-5 py-2.5 text-sm font-semibold text-[#425C47] hover:bg-[#425C47]/5 transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-bold text-[#425C47] mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Envoyez-nous un message
                </h2>
                <p className="text-xs text-[#425C47]/45 mb-4">Tous les champs sont obligatoires.</p>

                {/* Prénom + Nom */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#425C47]/50 mb-1.5">Prénom</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={e => update("firstName", e.target.value)}
                      placeholder="Jean"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] bg-[#F5F7F5] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#425C47]/50 mb-1.5">Nom</label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={e => update("lastName", e.target.value)}
                      placeholder="Dupont"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] bg-[#F5F7F5] transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#425C47]/50 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    placeholder="jean.dupont@email.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] bg-[#F5F7F5] transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#425C47]/50 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => update("message", e.target.value)}
                    placeholder="Décrivez votre demande..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] bg-[#F5F7F5] resize-none transition-colors"
                  />
                  <p className="text-[10px] text-[#425C47]/35 text-right mt-1">{form.message.length}/1000</p>
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-xl bg-gradient-to-br from-[#425C47] to-[#2e4133] text-white font-bold py-3.5 text-sm transition-all hover:scale-[1.02] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours…
                    </span>
                  ) : (
                    "Envoyer le message →"
                  )}
                </button>

                <p className="text-[10px] text-[#425C47]/35 text-center">
                  En envoyant ce formulaire, vous acceptez notre{" "}
                  <Link href="/privacy" className="underline hover:text-[#425C47]">politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 mt-8">
        <p className="text-center text-xs text-[#425C47]/35">© 2026 TravelGuide AI</p>
      </footer>
    </div>
  );
}
