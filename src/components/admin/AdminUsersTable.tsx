"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserOrder = {
  id: string;
  plan: string;
  destination: string | null;
  status: string;
  created_at: string;
};

type AdminUser = {
  id: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  orders_count: number;
  is_suspended: boolean;
  welcome_used: boolean;
  orders: UserOrder[];
};

const STATUS_LABELS: Record<string, string> = {
  questionnaire_pending: "En attente",
  questionnaire_completed: "En attente",
  generating: "En génération",
  human_review: "En génération",
  pdf_conversion: "En génération",
  delivered: "Livré",
  error: "Erreur",
};

function accountStatus(user: AdminUser) {
  if (user.is_suspended) return { label: "🚫 Suspendu", color: "text-red-200 bg-red-400/10 border-red-400/25" };
  if (!user.phone_number) return { label: "📵 Téléphone non vérifié", color: "text-amber-200 bg-amber-400/10 border-amber-400/25" };
  return { label: "✅ Actif", color: "text-emerald-200 bg-emerald-400/10 border-emerald-400/25" };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function UserPanel({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const status = accountStatus(user);

  async function toggleSuspension() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-suspension`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Action impossible");
      }
      router.refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 h-full w-full" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#1e293b] p-6 shadow-2xl">
        <div className="relative">
          <button onClick={onClose} className="absolute right-0 top-0 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200 hover:bg-white/20">Fermer</button>
          <p className="text-xs uppercase tracking-[0.22em] text-[#c9a84c]">Compte utilisateur</p>
          <h2 className="mt-2 pr-20 text-2xl font-bold text-white">{user.email}</h2>
          <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>{status.label}</span>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Téléphone</p>
              <p className="mt-1 text-sm text-white">{user.phone_number || "Non renseigné"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Inscription</p>
              <p className="mt-1 text-sm text-white">{formatDate(user.created_at)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Commandes</p>
              <p className="mt-1 text-sm text-white">{user.orders_count}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Code WELCOME</p>
              <p className="mt-1 text-sm text-white">{user.welcome_used ? "Oui" : "Non"}</p>
            </div>
          </div>

          <button
            onClick={toggleSuspension}
            disabled={loading}
            className="mt-6 rounded-2xl bg-[#c9a84c] px-5 py-3 text-sm font-bold text-[#0f172a] disabled:opacity-50"
          >
            {user.is_suspended ? "Réactiver le compte" : "Suspendre le compte"}
          </button>

          <h3 className="mt-8 text-lg font-bold text-white">Commandes du client</h3>
          <div className="mt-3 space-y-3">
            {user.orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{order.destination || "Destination non définie"}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(order.created_at)} · {order.plan}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">{STATUS_LABELS[order.status] ?? order.status}</span>
                </div>
              </div>
            ))}
            {user.orders.length === 0 && <p className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 text-sm text-slate-400">Aucune commande.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const [selected, setSelected] = useState<AdminUser | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1e293b] shadow-xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Téléphone</th>
                <th className="px-5 py-4">Date inscription</th>
                <th className="px-5 py-4">Nb commandes</th>
                <th className="px-5 py-4">Statut compte</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user, index) => {
                const status = accountStatus(user);
                return (
                  <tr key={user.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{index + 1}</td>
                    <td className="px-5 py-4 text-white">{user.email}</td>
                    <td className="px-5 py-4 text-slate-300">{user.phone_number || "—"}</td>
                    <td className="px-5 py-4 text-slate-300">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-4 text-slate-300">{user.orders_count}</td>
                    <td className="px-5 py-4"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>{status.label}</span></td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(user)} className="rounded-xl bg-[#c9a84c] px-4 py-2 text-xs font-bold text-[#0f172a]">Voir</button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">Aucun utilisateur inscrit.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <UserPanel user={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
