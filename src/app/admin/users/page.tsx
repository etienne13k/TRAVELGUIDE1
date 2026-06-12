import AdminShell from "@/components/admin/AdminShell";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { ensureAdminSchema } from "@/lib/admin-db";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getUsers() {
  await ensureAdminSchema();
  const pool = getPool();
  const [{ rows: usersRows }, { rows: ordersRows }, { rows: promoRows }] = await Promise.all([
    pool.query(
      `SELECT id, email, phone_number, created_at, is_suspended FROM users ORDER BY created_at DESC`
    ),
    pool.query(
      `SELECT id, user_id, plan, destination, status, created_at FROM orders ORDER BY created_at DESC`
    ),
    pool.query(
      `SELECT user_id, promo_code FROM promo_usages WHERE promo_code = 'WELCOME'`
    ),
  ]);

  const ordersByUser = new Map<string, typeof ordersRows>();
  for (const order of ordersRows) {
    if (!order.user_id) continue;
    const existing = ordersByUser.get(order.user_id) ?? [];
    existing.push(order);
    ordersByUser.set(order.user_id, existing);
  }

  const welcomeUsers = new Set(promoRows.map((r) => r.user_id));

  return usersRows.map((user) => {
    const userOrders = ordersByUser.get(user.id) ?? [];
    return {
      id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      created_at: user.created_at ?? "",
      is_suspended: Boolean(user.is_suspended),
      orders_count: userOrders.length,
      welcome_used: welcomeUsers.has(user.id),
      orders: userOrders.map((order) => ({
        id: order.id,
        plan: order.plan,
        destination: order.destination,
        status: order.status ?? "pending",
        created_at: order.created_at ?? "",
      })),
    };
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <AdminShell active="users">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a84c]">Administration</p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Gestion utilisateurs
        </h1>
        <p className="mt-2 text-sm text-slate-400">Comptes clients, statut téléphone, commandes et suspension.</p>
      </div>
      <AdminUsersTable users={users} />
    </AdminShell>
  );
}
