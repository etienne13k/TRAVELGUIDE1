"use client";

import { useEffect } from "react";

export default function ModeStyleInjector() {
  useEffect(() => {
    const apply = () => {
      const mode = localStorage.getItem("tgai_mode");
      document.documentElement.dataset.mode = mode === "business" ? "business" : "personal";
    };
    apply();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tgai_mode") apply();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
