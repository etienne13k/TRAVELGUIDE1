"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminOrder = {
  id: string;
  created_at: string;
  email: string | null;
  plan: string;
  destination: string | null;
  status: string;
  guide_url: string | null;
  delivered_at: string | null;
  delivery_error: string | null;
  questionnaire_data: Record<string, unknown> | null;
};

const STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  questionnaire_pending: { label: "En attente", badge: "bg-amber-400/10 text-amber-200 border-amber-400/25", dot: "🟡" },
  questionnaire_completed: { label: "En attente", badge: "bg-amber-400/10 text-amber-200 border-amber-400/25", dot: "🟡" },
  generating: { label: "En génération", badge: "bg-sky-400/10 text-sky-200 border-sky-400/25", dot: "🔵" },
  human_review: { label: "En génération", badge: "bg-sky-400/10 text-sky-200 border-sky-400/25", dot: "🔵" },
  pdf_conversion: { label: "En génération", badge: "bg-sky-400/10 text-sky-200 border-sky-400/25", dot: "🔵" },
  delivered: { label: "Livré", badge: "bg-emerald-400/10 text-emerald-200 border-emerald-400/25", dot: "🟢" },
  error: { label: "Erreur", badge: "bg-red-400/10 text-red-200 border-red-400/25", dot: "🔴" },
};

const PLAN_LABELS: Record<string, string> = {
  "3j": "3j",
  "7j": "7j",
  "14j": "14j",
  "1mois": "1 mois",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function deliveryText(order: AdminOrder) {
  if (order.status === "delivered") return `✅ Livré le ${formatDate(order.delivered_at || order.created_at)}`;
  if (order.status === "error") return `❌ Échec — ${order.delivery_error || "erreur inconnue"}`;
  if (["generating", "human_review", "pdf_conversion"].includes(order.status)) return "🔄 En cours de génération...";

  const created = new Date(order.created_at).getTime();
  const minutes = Math.max(1, Math.round((Date.now() - created) / 60000));
  const since = minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} h`;
  return `⏳ En attente depuis ${since}`;
}

function DetailsModal({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const entries = Object.entries(order.questionnaire_data ?? {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#1e293b] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#c9a84c]">Commande #{order.id.slice(0, 8)}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Réponses questionnaire</h2>
            <p className="mt-1 text-sm text-slate-400">{order.email ?? "Email inconnu"} · {PLAN_LABELS[order.plan] ?? order.plan}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200 hover:bg-white/20">Fermer</button>
        </div>
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
            Aucune réponse détaillée n&apos;est stockée pour cette commande.
          </div>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key.replaceAll("_", " ")}</dt>
                <dd className="mt-1 break-words text-sm text-slate-100">{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function runAction(order: AdminOrder, action: "regenerate" | "resend") {
    setBusyId(`${order.id}:${action}`);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/${action}`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Action impossible");
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1e293b] shadow-xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4">Livraison</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order, index) => {
                const meta = STATUS_META[order.status] ?? STATUS_META.questionnaire_pending;
                return (
                  <tr key={order.id} className="align-top hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{index + 1}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-300">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-4 text-slate-100">{order.email ?? "—"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-300">{PLAN_LABELS[order.plan] ?? order.plan}</td>
                    <td className="px-5 py-4 text-slate-100">{order.destination ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                        {meta.dot} {meta.label}
                      </span>
                    </td>
                    <td className="min-w-56 px-5 py-4 text-slate-300">{deliveryText(order)}</td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-64 flex-wrap gap-2">
                        <button onClick={() => setSelected(order)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15">Voir détails</button>
                        <button
                          onClick={() => runAction(order, "regenerate")}
                          disabled={busyId === `${order.id}:regenerate`}
                          className="rounded-xl bg-[#c9a84c] px-3 py-2 text-xs font-bold text-[#0f172a] disabled:opacity-50"
                        >
                          Regénérer
                        </button>
                        <button
                          onClick={() => runAction(order, "resend")}
                          disabled={!order.guide_url || busyId === `${order.id}:resend`}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Renvoyer email
                        </button>
                        <a
                          href={order.guide_url ?? "#"}
                          className={`rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold ${order.guide_url ? "text-slate-200 hover:border-[#c9a84c]" : "pointer-events-none text-slate-600"}`}
                        >
                          Télécharger PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">Aucune commande ne correspond aux filtres.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <DetailsModal order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
