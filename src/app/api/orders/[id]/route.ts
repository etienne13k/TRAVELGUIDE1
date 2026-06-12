import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { getServerSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseServiceRoleClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, destination, plan, status, created_at, estimated_delivery, guide_url")
    .eq("id", id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    console.error("[order]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  // Build step completion map from status
  const stepsByStatus: Record<string, string[]> = {
    questionnaire_pending: ["order_received"],
    questionnaire_completed: ["order_received", "questionnaire_filled"],
    generating: ["order_received", "questionnaire_filled", "generating"],
    human_review: ["order_received", "questionnaire_filled", "generating", "human_review"],
    pdf_conversion: ["order_received", "questionnaire_filled", "generating", "human_review", "pdf_conversion"],
    delivered: ["order_received", "questionnaire_filled", "generating", "human_review", "pdf_conversion", "delivered"],
  };

  const orderStatus = order.status ?? "pending";
  const completedSteps = stepsByStatus[orderStatus] || ["order_received"];

  const STEPS = [
    { key: "order_received", label: "Commande reçue", description: "Votre paiement a bien été confirmé" },
    { key: "questionnaire_filled", label: "Questionnaire rempli", description: "Vos préférences ont été enregistrées" },
    { key: "generating", label: "Guide en cours de génération", description: "Nos algorithmes créent votre guide personnalisé" },
    { key: "human_review", label: "Vérification humaine", description: "Un expert voyage relit et valide votre guide" },
    { key: "pdf_conversion", label: "Conversion PDF", description: "Votre guide est mis en forme" },
    { key: "delivered", label: "Guide envoyé !", description: "Votre PDF a été envoyé à votre email" },
  ];

  // Determine active step
  const activeStep = completedSteps[completedSteps.length - 1] || "order_received";

  const steps = STEPS.map((step) => ({
    ...step,
    is_completed: completedSteps.includes(step.key),
    is_active: step.key === activeStep && orderStatus !== "delivered",
  }));

  return NextResponse.json({ order, steps });
}
