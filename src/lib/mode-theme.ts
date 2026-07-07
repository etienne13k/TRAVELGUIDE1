"use client";

import { useEffect, useState } from "react";

export interface Theme {
  bg: string;
  card: string;
  cardDeep: string;
  cardHeader: string;
  border: string;
  text: string;
  muted: string;
  faint: string;
  veryFaint: string;
  accent: string;
  accentFaint: string;
  accentBorder: string;
  accentHover: string;
  accentText: string;
  promoButton: string;
  promoButtonHover: string;
  footerNote: string;
  modifyBtn: string;
}

export const PERSONAL: Theme = {
  bg: "#0e1310",
  card: "#161c14",
  cardDeep: "#111810",
  cardHeader: "#1a2418",
  border: "#232c20",
  text: "#d8e3d5",
  muted: "#7a9076",
  faint: "#4a6447",
  veryFaint: "#3a5037",
  accent: "#c9a84c",
  accentFaint: "rgba(201,168,76,0.15)",
  accentBorder: "rgba(201,168,76,0.30)",
  accentHover: "#b8962e",
  accentText: "#0e1310",
  promoButton: "#425C47",
  promoButtonHover: "#2e4133",
  footerNote: "#3a5037",
  modifyBtn: "#b8cdb4",
};

export const BUSINESS: Theme = {
  bg: "#08080d",
  card: "#0f0f18",
  cardDeep: "#0b0b12",
  cardHeader: "#0d0d1a",
  border: "#1a1a2e",
  text: "#e2e8f0",
  muted: "#6b7a99",
  faint: "#2d3748",
  veryFaint: "#1e2535",
  accent: "#3b82f6",
  accentFaint: "rgba(59,130,246,0.12)",
  accentBorder: "rgba(59,130,246,0.28)",
  accentHover: "#2563eb",
  accentText: "#ffffff",
  promoButton: "#1e3a5f",
  promoButtonHover: "#153059",
  footerNote: "#1e2535",
  modifyBtn: "#94a3b8",
};

export function useMode(): { T: Theme; isBusiness: boolean } {
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem("tgai_mode");
    setIsBusiness(mode === "business");

    const onStorage = (e: StorageEvent) => {
      if (e.key === "tgai_mode") setIsBusiness(e.newValue === "business");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { T: isBusiness ? BUSINESS : PERSONAL, isBusiness };
}
