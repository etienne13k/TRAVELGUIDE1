"use client";
import { useEffect, useState } from "react";

export type Lang = "fr" | "en";
const KEY = "tgai_lang";
const EVENT = "tgai_lang_change";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === "en") setLangState("en");

    function onExternalChange(e: Event) {
      setLangState((e as CustomEvent<{ lang: Lang }>).detail.lang);
    }
    window.addEventListener(EVENT, onExternalChange);
    return () => window.removeEventListener(EVENT, onExternalChange);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(KEY, l);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { lang: l } }));
  }

  return [lang, setLang];
}
