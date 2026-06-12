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
  "3j":    { bg: "#d4e0d6", text: "#425B48", border: "#b3cbb9" },
  "7j":    { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  "14j":   { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" },
  "1mois": { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  questionnaire_pending:   { label: "En attente du questionnaire", color: "#ea580c" },
  questionnaire_completed: { label: "Questionnaire complété", color: "#425B48" },
  generating:              { label: "Guide en génération…", color: "#ea580c" },
  human_review:            { label: "Vérification humaine", color: "#7c3aed" },
  pdf_conversion:          { label: "Conversion PDF", color: "#0891b2" },
  delivered:               { label: "Guide livré ✓", color: "#16a34a" },
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
    <div className="min-h-screen" style={{ background: "#FDFAF5", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ background: "#425C47" }}>
        <Link href="/" className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          ✈️ TravelGuide AI
        </Link>
        <div className="flex items-center gap-4">
          <LangToggle />
          <span className="text-sm hidden sm:inline" style={{ color: "#C9A84C" }}>{session.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
          Mon compte
        </h1>
        <p className="text-sm mb-8" style={{ color: "#7a7060" }}>
          Retrouvez vos commandes et gérez votre profil.
        </p>

        {/* Profil */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
            Mon profil
          </h2>

          {/* Prénom / Nom / Email */}
          <ProfileForm
            initialFirstName={profile.first_name}
            initialLastName={profile.last_name}
            email={session.email}
          />

          {/* Séparateur */}
          <div className="my-6 border-t" style={{ borderColor: "#E8E0D0" }} />

          {/* Téléphone */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold" style={{ color: "#425C47" }}>Numéro de téléphone</span>
              {phoneStatus.phoneVerified ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                  ✓ Vérifié
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a" }}>
                  Non vérifié
                </span>
              )}
            </div>
            {!phoneStatus.phoneVerified && (
              <p className="text-sm mb-3" style={{ color: "#78350f" }}>
                🎁 Vérifiez votre numéro pour débloquer le code <span className="font-mono font-bold">WELCOME</span> (-40% sur votre premier guide).
              </p>
            )}
            <PhoneVerification initialPhone={phoneStatus.phone} initialVerified={phoneStatus.phoneVerified} />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
          Mes commandes
        </h2>
        <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
          Suivez la progression de vos guides en temps réel.
        </p>

        {orders.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
              Aucune commande pour l&apos;instant
            </h2>
            <p className="text-sm mb-6" style={{ color: "#7a7060" }}>
              Commandez votre premier guide de voyage personnalisé par IA.
            </p>
            <Link
              href="/"
              className="inline-block rounded-xl px-6 py-3 font-semibold text-sm text-white"
              style={{ background: "#C9A84C" }}
            >
              Découvrir les offres →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const plan = PLAN_COLORS[order.plan] ?? PLAN_COLORS["3j"];
              const statusCfg = STATUS_LABELS[order.status] ?? { label: order.status, color: "#6b7280" };
              return (
                <div
                  key={order.id}
                  className="rounded-2xl p-6 flex items-center justify-between gap-4"
                  style={{ background: "#fff", border: "1px solid #E8E0D0" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-semibold truncate" style={{ color: "#425C47" }}>
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
                      <span style={{ color: "#7a7060" }}>
                        {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="font-medium" style={{ color: statusCfg.color }}>
                        ● {statusCfg.label}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                    style={{ background: "#425C47", color: "#fff" }}
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
