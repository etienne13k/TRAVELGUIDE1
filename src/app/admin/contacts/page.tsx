import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin-auth";
import { getPool } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

async function getMessages(): Promise<ContactMessage[]> {
  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    const { rows } = await pool.query<ContactMessage>(
      "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100"
    );
    return rows;
  } catch {
    return [];
  }
}

export default async function AdminContactsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const messages = await getMessages();
  const unread = messages.filter(m => !m.read).length;

  return (
    <AdminShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Messages de contact</h1>
            <p className="text-slate-400 text-sm mt-1">
              {messages.length} message{messages.length > 1 ? "s" : ""} reçu{messages.length > 1 ? "s" : ""}
              {unread > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unread} non lu{unread > 1 ? "s" : ""}</span>}
            </p>
          </div>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Retour dashboard
          </Link>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-400">Aucun message pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`rounded-2xl border p-5 transition-all ${
                  msg.read
                    ? "border-slate-700 bg-slate-800/50"
                    : "border-[#425C47] bg-slate-800 shadow-[0_0_0_1px_rgba(66,92,71,0.3)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {msg.first_name} {msg.last_name}
                      </span>
                      {!msg.read && (
                        <span className="bg-[#425C47] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-[#C9A84C] text-sm hover:underline"
                    >
                      {msg.email}
                    </a>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(msg.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 rounded-xl px-4 py-3">
                  {msg.message}
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`mailto:${msg.email}?subject=Re: votre message TravelGuide AI`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#425C47] hover:bg-[#2e4133] text-white text-xs font-bold px-4 py-2 transition-colors"
                  >
                    ✉️ Répondre
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
