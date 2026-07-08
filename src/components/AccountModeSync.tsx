"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AccountModeSync() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "business" || mode === "personal") {
      localStorage.setItem("tgai_mode", mode);
      document.documentElement.dataset.mode = mode;
    }
  }, [searchParams]);

  return null;
}
