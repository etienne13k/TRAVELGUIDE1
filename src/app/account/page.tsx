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

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "3j":    { bg: "rgba(66,92,71,0.2)", text: "#9ab896", border: "rgba(66,92,71,0.4)" },
  "7j":    { bg: "rgba(22,163,74,0.1)", text: "#4ade80", border: "rgba(22,163,74,0.25)" },
  "14j":   { bg: "rgba(124,58,237,0.1)", text: "#a78bfa", border: "rgba(124,58,237,0.25)" },
  "1mois": { bg: "rgba(201,168,76,0.1)", text: "#c9a84c", border: "rgba(201,168,76,0.3)" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  questionnaire_pending:   { label: "En attente du questionnaire", color: "#c9a84c" },
  questionnaire_completed: { label: "Questionnaire complété", color: "#9ab896" },
  generating:              { label: "Guide en génération…", color: "#60a5fa" },
  human_review:            { label: "Vérification humaine", color: "#a78bfa" },
  pdf_conversion:          { label: "Conversion PDF", color: "#22d3ee" },
  delivered:               { label: "Guide livré", color: "#4ade80" },
};

interface Order {
  id: string;
  destination: string | null;
  plan: string;
  status: string;
  created_at: string;
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
    "SELECT id, destination, plan, status, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return rows.map((order) => ({
    id: order.id,
    destination: order.destination,
    plan: order.plan,
    status: order.status ?? "pending",
    created_at: order.created_at ?? "",
  }));
}


export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const [orders, phoneStatus, profile] = await Promise.all([
    getOrders(session.userId),
    getPhoneStatus(getPool(), session.userId),
    getProfile(session.userId),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "#0e1310", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-[#232c20]" style={{ background: "#0e1310/90", backdropFilter: "blur(12px)" }}>
        <Link href="/" className="text-lg font-bold text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          TravelGuide AI
        </Link>
        <div className="flex items-center gap-4">
          <LangToggle />
          <span className="text-sm hidden sm:inline" style={{ color: "#C9A84C" }}>{session.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#d8e3d5" }}>
          Mon compte
        </h1>
        <p className="text-sm mb-8" style={{ color: "#7a9076" }}>
          Retrouvez vos commandes et gérez votre profil.
        </p>

        {/* Profil */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: "#161c14", border: "1px solid #232c20" }}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#d8e3d5" }}>
            Mon profil
          </h2>

          <ProfileForm
            initialFirstName={profile.first_name}
            initialLastName={profile.last_name}
            email={session.email}
          />

          <div className="my-6 border-t" style={{ borderColor: "#232c20" }} />

          {/* Téléphone */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold" style={{ color: "#d8e3d5" }}>Numéro de téléphone</span>
              {phoneStatus.phoneVerified ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.15)", color: "#4ade80", border: "1px solid rgba(22,163,74,0.3)" }}>
                  Vérifié
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                  Non vérifié
                </span>
              )}
            </div>
            {!phoneStatus.phoneVerified && (
              <p className="text-sm mb-3" style={{ color: "#b8cdb4" }}>
                Vérifiez votre numéro pour débloquer le code <span className="font-mono font-bold text-[#c9a84c]">WELCOME</span> (-40% sur votre premier guide).
              </p>
            )}
            <PhoneVerification initialPhone={phoneStatus.phone} initialVerified={phoneStatus.phoneVerified} />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#d8e3d5" }}>
          Mes commandes
        </h2>
        <p className="text-sm mb-6" style={{ color: "#7a9076" }}>
          Suivez la progression de vos guides en temps réel.
        </p>

        {orders.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: "#161c14", border: "1px solid #232c20" }}>
            <div className="text-5xl mb-4 text-[#4a6447]">—</div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#d8e3d5" }}>
              Aucune commande pour l&apos;instant
            </h2>
            <p className="text-sm mb-6" style={{ color: "#7a9076" }}>
              Commandez votre premier guide de voyage personnalisé par IA.
            </p>
            <Link
              href="/"
              className="inline-block rounded-xl px-6 py-3 font-semibold text-sm"
              style={{ background: "#C9A84C", color: "#0e1310" }}
            >
              Découvrir les offres →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const plan = PLAN_COLORS[order.plan] ?? PLAN_COLORS["3j"];
              const statusCfg = STATUS_LABELS[order.status] ?? { label: order.status, color: "#7a9076" };
              return (
                <div
                  key={order.id}
                  className="rounded-2xl p-6 flex items-center justify-between gap-4"
                  style={{ background: "#161c14", border: "1px solid #232c20" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-semibold truncate" style={{ color: "#d8e3d5" }}>
                        {order.destination ?? "Destination non définie"}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: plan.bg, color: plan.text, border: `1px solid ${plan.border}` }}
                      >
                        {PLAN_LABELS[order.plan] ?? order.plan}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span style={{ color: "#4a6447" }}>
                        {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="font-medium" style={{ color: statusCfg.color }}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all border border-[#232c20] hover:border-[#c9a84c]"
                    style={{ background: "#1a2418", color: "#b8cdb4" }}
                  >
                    Voir le suivi →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
