"use client";

import { useLang } from "@/lib/useLang";

export default function LangToggle() {
  const [lang, setLang] = useLang();

  return (
    <div className="flex items-center gap-1 rounded-lg p-0.5 select-none"
      style={{ border: "1px solid var(--ce)" }}>
      <button
        onClick={() => setLang("fr")}
        title="Passer en français"
        className="rounded-md px-2 py-0.5 transition-all"
        style={lang === "fr" ? { background: "var(--ce)" } : { opacity: 0.4 }}
      >
        <img src="https://flagcdn.com/w40/fr.png" width="24" height="16" alt="FR" style={{ display: "inline", borderRadius: "2px" }} />
      </button>
      <button
        onClick={() => setLang("en")}
        title="Switch to English"
        className="rounded-md px-2 py-0.5 transition-all"
        style={lang === "en" ? { background: "var(--ce)" } : { opacity: 0.4 }}
      >
        <img src="https://flagcdn.com/w40/gb.png" width="24" height="16" alt="GB" style={{ display: "inline", borderRadius: "2px" }} />
      </button>
    </div>
  );
}
