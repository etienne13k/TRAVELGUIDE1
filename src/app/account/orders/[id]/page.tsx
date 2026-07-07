import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import OrderTimeline from "@/components/OrderTimeline";
import LogoutButton from "@/components/LogoutButton";
import DestinationMapWrapper from "@/components/DestinationMapWrapper";

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

const STEP_DEFS = [
  { key: "order_received",       label: "Commande reçue",            description: "Votre paiement a bien été confirmé" },
  { key: "questionnaire_filled", label: "Questionnaire rempli",       description: "Vos préférences ont été enregistrées" },
  { key: "generating",           label: "Guide en cours de génération", description: "Nos algorithmes créent votre guide personnalisé" },
  { key: "human_review",         label: "Vérification humaine",       description: "Un expert voyage relit et valide votre guide" },
  { key: "pdf_conversion",       label: "Conversion PDF",             description: "Votre guide est mis en forme" },
  { key: "delivered",            label: "Guide envoyé !",             description: "Votre PDF a été envoyé à votre email" },
];

const COMPLETED_BY_STATUS: Record<string, string[]> = {
  questionnaire_pending:   ["order_received"],
  questionnaire_completed: ["order_received", "questionnaire_filled"],
  generating:              ["order_received", "questionnaire_filled", "generating"],
  human_review:            ["order_received", "questionnaire_filled", "generating", "human_review"],
  pdf_conversion:          ["order_received", "questionnaire_filled", "generating", "human_review", "pdf_conversion"],
  delivered:               ["order_received", "questionnaire_filled", "generating", "human_review", "pdf_conversion", "delivered"],
};

const ESTIMATED_DELIVERY: Record<string, string> = {
  "3j":    "Livraison estimée dans 2–4h",
  "7j":    "Livraison estimée dans 4–12h",
  "14j":   "Livraison estimée dans 12–24h",
  "1mois": "Livraison estimée dans 24–48h",
};

interface Order {
  id: string;
  destination: string | null;
  plan: string;
  status: string;
  created_at: string;
  estimated_delivery: string | null;
  guide_url: string | null;
  travel_dates: string | null;
}

type QuestionnaireData = Record<string, unknown>;

function isQuestionnaireData(value: unknown): value is QuestionnaireData {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function metadataString(data: unknown, key: string): string | null {
  if (!isQuestionnaireData(data)) return null;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function orderTravelDates(data: unknown): string | null {
  const explicitDates = metadataString(data, "travel_dates");
  if (explicitDates) return explicitDates;

  const arrivalDate = metadataString(data, "arrival_date");
  const departureDate = metadataString(data, "departure_date");
  if (arrivalDate && departureDate && arrivalDate !== departureDate) return `${arrivalDate} → ${departureDate}`;
  return arrivalDate;
}

async function getOrder(id: string, userId: string): Promise<Order | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT id, destination, plan, status, created_at, estimated_delivery, guide_url, questionnaire_data FROM orders WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  const data = rows[0];
  if (!data) return null;

  return {
    id: data.id,
    destination: data.destination,
    plan: data.plan,
    status: data.status ?? "pending",
    created_at: data.created_at ?? "",
    estimated_delivery: data.estimated_delivery,
    guide_url: data.guide_url,
    travel_dates: orderTravelDates(data.questionnaire_data),
  };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const order = await getOrder(id, session.userId);
  if (!order) notFound();

  const completedSteps = COMPLETED_BY_STATUS[order.status] ?? ["order_received"];
  const activeStep = order.status === "delivered" ? null : completedSteps[completedSteps.length - 1];

  const steps = STEP_DEFS.map((s) => ({
    ...s,
    is_completed: completedSteps.includes(s.key),
    is_active: s.key === activeStep,
  }));

  const plan = PLAN_COLORS[order.plan] ?? PLAN_COLORS["3j"];
  const isDelivered = order.status === "delivered";

  return (
    <div className="min-h-screen" style={{ background: "#FDFAF5", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ background: "#425C47" }}>
        <Link href="/" className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          TravelGuide
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-sm" style={{ color: "#C9A84C" }}>
            ← Mes commandes
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Order header */}
        <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
                {order.destination ?? "Destination à définir"}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: plan.bg, color: plan.text, border: `1px solid ${plan.border}` }}
                >
                  Plan {PLAN_LABELS[order.plan] ?? order.plan}
                </span>
                <span className="text-xs" style={{ color: "#7a7060" }}>
                  Commandé le {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
            {isDelivered && order.guide_url && (
              <a
                href={order.guide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl px-5 py-2.5 font-semibold text-sm transition-all inline-flex items-center gap-2"
                style={{ background: "#C9A84C", color: "#425C47" }}
              >
                📥 Télécharger mon guide
              </a>
            )}
          </div>

          {!isDelivered && (
            <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2 text-sm" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
              <span>⏱️</span>
              <span style={{ color: "#d97706" }}>
                {order.estimated_delivery ?? ESTIMATED_DELIVERY[order.plan] ?? "Livraison estimée dans quelques heures"}
              </span>
            </div>
          )}

          {isDelivered && (
            <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2 text-sm" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <span>🎉</span>
              <span style={{ color: "#16a34a" }}>Votre guide a été livré avec succès !</span>
            </div>
          )}

          {order.travel_dates && (
            <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2 text-sm" style={{ background: "#fff8e6", border: "1px solid #ead38a" }}>
              <span>📅</span>
              <span style={{ color: "#7a5d12" }}>
                Dates de voyage : <strong>{order.travel_dates}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Carte interactive pleine largeur pour 14j et 1 mois */}
        {(order.plan === "14j" || order.plan === "1mois") && (
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "2px solid #425C47" }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mr-2" style={{ background: "#d4e0d6", color: "#425C47" }}>
                  ✨ Inclus dans votre plan
                </span>
                <h2 className="text-base font-bold mt-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
                  🗺️ Carte interactive de votre destination
                </h2>
              </div>
            </div>
            <DestinationMapWrapper destination={order.destination} />
            {order.destination && (
              <p className="text-xs mt-3 text-center" style={{ color: "#7a7060" }}>
                📍 {order.destination} · Zoomez et explorez votre destination
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Timeline */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
            <h2 className="text-base font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
              Progression de votre commande
            </h2>
            <OrderTimeline steps={steps} />
          </div>

          {/* Map petite pour 3j et 7j */}
          {(order.plan === "3j" || order.plan === "7j") && (
            <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
              <h2 className="text-base font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
                Votre destination
              </h2>
              <DestinationMapWrapper destination={order.destination} />
              {order.destination && (
                <p className="text-xs mt-2 text-center" style={{ color: "#7a7060" }}>
                  📍 {order.destination}
                </p>
              )}
            </div>
          )}

          {/* Pour 14j/1mois : timeline seule dans la grille */}
          {(order.plan === "14j" || order.plan === "1mois") && (
            <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #E8E0D0" }}>
              <h2 className="text-base font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "#425C47" }}>
                📋 Récapitulatif du plan
              </h2>
              <div className="space-y-2 text-sm" style={{ color: "#425C47" }}>
                <div className="flex justify-between py-2 border-b" style={{ borderColor: "#E8E0D0" }}>
                  <span>Plan</span>
                  <strong>{PLAN_LABELS[order.plan]}</strong>
                </div>
                <div className="flex justify-between py-2 border-b" style={{ borderColor: "#E8E0D0" }}>
                  <span>Destination</span>
                  <strong>{order.destination ?? "—"}</strong>
                </div>
                {order.travel_dates && (
                  <div className="flex justify-between py-2">
                    <span>Dates</span>
                    <strong>{order.travel_dates}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Questionnaire CTA */}
        {order.status === "questionnaire_pending" && (
          <div className="rounded-2xl p-6" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">📋</span>
              <div>
                <h3 className="font-bold mb-1" style={{ color: "#c2410c" }}>Action requise : remplissez le questionnaire</h3>
                <p className="text-sm mb-3" style={{ color: "#9a3412" }}>
                  Pour que nous puissions créer votre guide personnalisé, merci de remplir le questionnaire de voyage.
                </p>
                <Link
                  href={`/questionnaire?plan=${order.plan}`}
                  className="inline-block rounded-xl px-5 py-2.5 font-semibold text-sm"
                  style={{ background: "#ea580c", color: "#fff" }}
                >
                  Remplir le questionnaire →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
