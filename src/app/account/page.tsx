import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import PhoneVerification from "@/components/PhoneVerification";
import ProfileForm from "@/components/ProfileForm";
import LangToggle from "@/components/LangToggle";
import { getPhoneStatus } from "@/lib/phone-verification";

const PLAN_LABELS: Record<string, string> = {
  "3j": "3 jours",
  "7j": "7 jours",
  "14j": "14 jours",
  "1mois": "1 mois",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  questionnaire_pending:   { label: "En attente du questionnaire", color: "#facc15" },
  questionnaire_completed: { label: "Questionnaire complété",      color: "#94a3b8" },
  generating:              { label: "Guide en génération…",        color: "#60a5fa" },
  human_review:            { label: "Vérification humaine",        color: "#a78bfa" },
  pdf_conversion:          { label: "Conversion PDF",              color: "#22d3ee" },
  delivered:               { label: "Guide livré ✓",              color: "#4ade80" },
};

interface Order {
  id: string;
  destination: string | null;
  plan: string;
  status: string;
  created_at: string;
  mode: string | null;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

async function getProfile(userId: string): Promise<Profile> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT first_name, last_name FROM profiles WHERE id = $1",
    [userId]
  );
  return rows[0] ?? { first_name: null, last_name: null };
}

async function getOrders(userId: string): Promise<Order[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, destination, plan, status, created_at,
            questionnaire_data->>'mode' as mode
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((o) => ({
    id: o.id,
    destination: o.destination,
    plan: o.plan,
    status: o.status ?? "pending",
    created_at: o.created_at ?? "",
    mode: o.mode ?? null,
  }));
}

/* ── design tokens (neutral slate) ── */
const N = {
  bg:     "#0b0b10",
  card:   "#13131a",
  deep:   "#0f0f15",
  border: "#22222e",
  text:   "#e2e8f0",
  muted:  "#64748b",
  faint:  "#1e1e28",
  accent: "#818cf8",        // indigo clair — neutre entre vert et bleu
  accentFaint: "rgba(129,140,248,0.10)",
  accentBorder: "rgba(129,140,248,0.22)",
};

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const [orders, phoneStatus, profile] = await Promise.all([
    getOrders(session.userId),
    getPhoneStatus(getPool(), session.userId),
    getProfile(session.userId),
  ]);

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || session.email.split("@")[0];

  return (
    <div className="min-h-screen" style={{ background: N.bg, fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: `${N.bg}f0`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${N.border}` }}
      >
        <Link href="/" className="text-base font-bold" style={{ color: N.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Mon espace
        </Link>
        <div className="flex items-center gap-3">
          <LangToggle />
          <span className="text-xs hidden sm:inline-block max-w-[130px] truncate" style={{ color: N.accent }}>
            {session.email}
          </span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: N.accent }}>Compte</p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: N.text }}>
            Bonjour, {displayName}
          </h1>
          <p className="text-sm mt-1" style={{ color: N.muted }}>
            Retrouvez toutes vos commandes et gérez votre profil.
          </p>
        </div>

        {/* Retour vers les pages */}
        <div className="flex gap-3">
          <Link href="/personal" className="rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.28)", color: "#c9a84c" }}>
            ← TravelGuide
          </Link>
          <Link href="/business" className="rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fb" }}>
            ← Travel Business
          </Link>
        </div>

        {/* Profil */}
        <section className="rounded-2xl p-6" style={{ background: N.card, border: `1px solid ${N.border}` }}>
          <h2 className="text-base font-bold mb-5" style={{ color: N.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Mon profil
          </h2>
          <ProfileForm
            initialFirstName={profile.first_name}
            initialLastName={profile.last_name}
            email={session.email}
          />

          <div className="my-6" style={{ borderTop: `1px solid ${N.border}` }} />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold" style={{ color: N.text }}>Numéro de téléphone</span>
              {phoneStatus.phoneVerified ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.28)" }}>Vérifié</span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: N.accentFaint, color: N.accent, border: `1px solid ${N.accentBorder}` }}>Non vérifié</span>
              )}
            </div>
            {!phoneStatus.phoneVerified && (
              <p className="text-sm mb-3" style={{ color: N.muted }}>
                Vérifiez votre numéro pour débloquer le code <span className="font-mono font-bold" style={{ color: N.accent }}>WELCOME</span> (-25% sur votre premier guide).
              </p>
            )}
            <PhoneVerification initialPhone={phoneStatus.phone} initialVerified={phoneStatus.phoneVerified} />
          </div>
        </section>

        {/* Commandes */}
        <section>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: N.text }}>
            Mes commandes
          </h2>
          <p className="text-sm mb-5" style={{ color: N.muted }}>
            Toutes vos commandes — TravelGuide et Travel Business.
          </p>

          {orders.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ background: N.card, border: `1px solid ${N.border}` }}>
              <p className="text-4xl mb-4" style={{ color: N.faint }}>—</p>
              <h3 className="text-lg font-bold mb-2" style={{ color: N.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Aucune commande pour l&apos;instant
              </h3>
              <p className="text-sm mb-6" style={{ color: N.muted }}>Commandez votre premier guide personnalisé.</p>
              <div className="flex justify-center gap-3">
                <Link href="/personal" className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                  TravelGuide →
                </Link>
                <Link href="/business" className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fb", border: "1px solid rgba(59,130,246,0.28)" }}>
                  Travel Business →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const statusCfg = STATUS_LABELS[order.status] ?? { label: order.status, color: N.muted };
                const isBiz = order.mode === "business";
                return (
                  <div key={order.id} className="rounded-2xl p-5 flex items-center justify-between gap-4"
                    style={{ background: N.card, border: `1px solid ${N.border}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-semibold truncate" style={{ color: N.text }}>
                          {order.destination ?? "Destination non définie"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={isBiz
                            ? { background: "rgba(59,130,246,0.12)", color: "#60a5fb", border: "1px solid rgba(59,130,246,0.25)" }
                            : { background: "rgba(201,168,76,0.10)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.25)" }}>
                          {isBiz ? "Business" : "TravelGuide"} · {PLAN_LABELS[order.plan] ?? order.plan}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span style={{ color: N.muted }}>
                          {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span className="font-semibold" style={{ color: statusCfg.color }}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                    <Link href={`/account/orders/${order.id}`}
                      className="shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                      style={{ background: N.faint, border: `1px solid ${N.border}`, color: N.text }}>
                      Suivi →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
