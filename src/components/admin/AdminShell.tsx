import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export default function AdminShell({ active, children }: { active?: string; children: React.ReactNode }) {
  const links = [
    { key: "dashboard", href: "/admin", label: "📊 Dashboard" },
    { key: "orders", href: "/admin", label: "📦 Commandes" },
    { key: "users", href: "/admin/users", label: "👥 Utilisateurs" },
    { key: "contacts", href: "/admin/contacts", label: "📬 Messages" },
    { key: "config", href: "/admin/config", label: "⚙️ Configuration" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/10 bg-[#111c33]/95 p-6 lg:block">
        <Link href="/admin" className="mb-10 block">
          <p className="text-xs uppercase tracking-[0.28em] text-[#c9a84c]">Spire GG</p>
          <h1 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Admin
          </h1>
        </Link>
        <nav className="space-y-2">
          {links.map((link) => {
            const selected = link.key === active || (active === "dashboard" && link.key === "orders");
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  selected ? "bg-[#c9a84c] text-[#0f172a]" : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <AdminLogoutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0f172a]/92 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="font-bold text-white">Spire GG Admin</Link>
          <AdminLogoutButton />
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                link.key === active || (active === "dashboard" && link.key === "orders")
                  ? "bg-[#c9a84c] text-[#0f172a]"
                  : "bg-white/8 text-slate-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
