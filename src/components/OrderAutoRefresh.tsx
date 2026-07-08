"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const TERMINAL_STATUSES = new Set(["delivered", "error", "paused_review"]);
const POLL_INTERVAL_MS = 10_000;

export default function OrderAutoRefresh({ status }: { status: string }) {
  const router = useRouter();

  useEffect(() => {
    if (TERMINAL_STATUSES.has(status)) return;

    const interval = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status, router]);

  if (TERMINAL_STATUSES.has(status)) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-xs py-2" style={{ color: "#7a7060" }}>
      <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin inline-block"
        style={{ borderColor: "#C9A84C transparent transparent transparent" }} />
      <span>Mise à jour automatique toutes les 10 secondes…</span>
    </div>
  );
}
