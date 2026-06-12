import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import { ensureAdminSchema } from "@/lib/admin-db";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = Record<string, string | string[] | undefined>;

type DashboardKpis = {
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  generating_orders: number;
  error_orders: number;
  revenue_cents: number;
  users_count: number;
};

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeStatus(status?: string) {
  if (status === "pending") return ["questionnaire_pending", "questionnaire_completed"];
  if (status === "generating") return ["generating", "human_review", "pdf_conversion"];
  if (status === "delivered") return ["delivered"];
  if (status === "error") return ["error"];
  return [];
}

function euros(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function currentQuery(params: SearchParams, updates: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) query.set(key, first);
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") query.delete(key);
    else query.set(key, String(value));
  }
  return `?${query.toString()}`;
}

async function getDashboardData(params: SearchParams) {
  await ensureAdminSchema();
  const pool = getPool();
  const page = Math.max(1, Number(getParam(params, "page") ?? "1") || 1);
  const status = getParam(params, "status") ?? "all";
  const plan = getParam(params, "plan") ?? "all";
  const from = getParam(params, "from") ?? "";
  const to = getParam(params, "to") ?? "";
  const search = getParam(params, "q")?.trim().toLowerCase() ?? "";
  const statuses = normalizeStatus(status);

  const [{ rows: allOrders }, { rows: paymentSessions }, { rows: usersRows }] = await Promise.all([
    pool.query(
      `SELECT id, user_id, session_id, created_at, plan, destination, status,
              guide_url, delivered_at, delivery_error, questionnaire_data
       FROM orders ORDER BY created_at DESC`
    ),
    pool.query(`SELECT session_id, email, amount_cents FROM payment_sessions`),
    pool.query(`SELECT id, email FROM users`),
  ]);

  const emailByUserId = new Map(usersRows.map((u) => [u.id, u.email]));
  const paymentBySessionId = new Map(paymentSessions.map((p) => [p.session_id, p]));
  const enrichedOrders = allOrders.map((order) => ({
    ...order,
    status: order.status ?? "pending",
    email:
      paymentBySessionId.get(order.session_id ?? "")?.email ??
      (order.user_id ? emailByUserId.get(order.user_id) : null) ??
      null,
  }));

  const filteredOrders = enrichedOrders.filter((order) => {
    if (statuses.length > 0 && !statuses.includes(order.status)) return false;
    if (plan !== "all" && order.plan !== plan) return false;
    if (from && (!order.created_at || order.created_at < from)) return false;
    if (to) {
      const toDate = new Date(`${to}T00:00:00.000Z`);
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      if (!order.created_at || order.created_at >= toDate.toISOString()) return false;
    }
    if (search && !(order.email ?? "").toLowerCase().includes(search)) return false;
    return true;
  });

  const offset = (page - 1) * PAGE_SIZE;
  const pagedOrders = filteredOrders.slice(offset, offset + PAGE_SIZE);

  const kpis: DashboardKpis = {
    total_orders: enrichedOrders.length,
    pending_orders: enrichedOrders.filter((o) => ["questionnaire_pending", "questionnaire_completed"].includes(o.status)).length,
    delivered_orders: enrichedOrders.filter((o) => o.status === "delivered").length,
    generating_orders: enrichedOrders.filter((o) => ["generating", "human_review", "pdf_conversion"].includes(o.status)).length,
    error_orders: enrichedOrders.filter((o) => o.status === "error").length,
    revenue_cents: paymentSessions.reduce((total, p) => total + (p.amount_cents ?? 0), 0),
    users_count: usersRows.length,
  };

  return {
    kpis,
    orders: pagedOrders.map((order) => ({
      id: order.id,
      created_at: order.created_at ?? "",
      email: order.email,
      plan: order.plan,
      destination: order.destination,
      status: order.status,
      guide_url: order.guide_url,
      delivered_at: order.delivered_at,
      delivery_error: order.delivery_error,
      questionnaire_data: order.questionnaire_data as Record<string, unknown> | null,
    })),
    total: filteredOrders.length,
    page,
    filters: { status, plan, from, to, search },
  };
}

export default async function AdminDashboardPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const { kpis, orders, total, page, filters } = await getDashboardData(params);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cards = [
    ["Total commandes", kpis.total_orders],
    ["En attente", kpis.pending_orders],
    ["Guides livrés", kpis.delivered_orders],
    ["En génération", kpis.generating_orders],
    ["En erreur", kpis.error_orders],
    ["Revenus totaux", euros(kpis.revenue_cents)],
    ["Utilisateurs inscrits", kpis.users_count],
  ];

  return (
    <AdminShell active="dashboard">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a84c]">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Dashboard commandes
          </h1>
          <p className="mt-2 text-sm text-slate-400">Suivi des guides payés, générés, livrés ou en erreur.</p>
        </div>
        <Link href="/admin/users" className="rounded-2xl border border-[#c9a84c]/40 px-5 py-3 text-sm font-bold text-[#c9a84c] transition hover:bg-[#c9a84c]/10">
          Gérer les utilisateurs
        </Link>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] border border-white/10 bg-[#1e293b] p-5 shadow-lg shadow-black/10">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </section>

      <form className="mb-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#1e293b] p-4 md:grid-cols-6" action="/admin">
        <select name="status" defaultValue={filters.status} className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100">
          <option value="all">Tous statuts</option>
          <option value="pending">En attente</option>
          <option value="generating">En génération</option>
          <option value="delivered">Livré</option>
          <option value="error">Erreur</option>
        </select>
        <select name="plan" defaultValue={filters.plan} className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100">
          <option value="all">Tous plans</option>
          <option value="3j">3j</option>
          <option value="7j">7j</option>
          <option value="14j">14j</option>
          <option value="1mois">1 mois</option>
        </select>
        <input name="from" type="date" defaultValue={filters.from} className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100" />
        <input name="to" type="date" defaultValue={filters.to} className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100" />
        <input name="q" defaultValue={filters.search} placeholder="Recherche email" className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600" />
        <button className="rounded-xl bg-[#c9a84c] px-4 py-2 text-sm font-bold text-[#0f172a]">Filtrer</button>
      </form>

      <AdminOrdersTable orders={orders} />

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>{total} commande(s) · page {page}/{totalPages}</span>
        <div className="flex gap-2">
          <Link href={currentQuery(params, { page: Math.max(1, page - 1) })} className={`rounded-xl border border-white/10 px-4 py-2 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-[#c9a84c]"}`}>
            Précédent
          </Link>
          <Link href={currentQuery(params, { page: Math.min(totalPages, page + 1) })} className={`rounded-xl border border-white/10 px-4 py-2 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-[#c9a84c]"}`}>
            Suivant
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
