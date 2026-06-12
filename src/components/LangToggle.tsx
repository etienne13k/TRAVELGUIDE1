"use client";

import { useEffect, useState } from "react";

export default function LangToggle() {
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    // Lire le lang depuis l'URL ou localStorage
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    const stored = localStorage.getItem("tgai_lang");
    const detected = urlLang === "en" ? "en" : stored === "en" ? "en" : "fr";
    setLang(detected as "fr" | "en");
  }, []);

  function toggle() {
    const next = lang === "fr" ? "en" : "fr";
    setLang(next);
    localStorage.setItem("tgai_lang", next);
    window.dispatchEvent(new CustomEvent("tgai_lang_change", { detail: { lang: next } }));

    const url = new URL(window.location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", next);
      window.history.replaceState({}, "", url.toString());
    }
  }

  return (
    <div className="flex items-center gap-1 border border-[#425C47]/20 rounded-lg p-0.5 select-none">
      <button
        onClick={() => { if (lang !== "fr") toggle(); }}
        title="Passer en français"
        className={`rounded-md px-2 py-0.5 transition-all ${lang === "fr" ? "bg-[#425C47]/15 shadow-sm" : "opacity-40 hover:opacity-70"}`}
      >
        <img src="https://flagcdn.com/w40/fr.png" width="24" height="16" alt="FR" style={{display:"inline",borderRadius:"2px"}} />
      </button>
      <button
        onClick={() => { if (lang !== "en") toggle(); }}
        title="Switch to English"
        className={`rounded-md px-2 py-0.5 transition-all ${lang === "en" ? "bg-[#425C47]/15 shadow-sm" : "opacity-40 hover:opacity-70"}`}
      >
        <img src="https://flagcdn.com/w40/gb.png" width="24" height="16" alt="GB" style={{display:"inline",borderRadius:"2px"}} />
      </button>
    </div>
  );
}
