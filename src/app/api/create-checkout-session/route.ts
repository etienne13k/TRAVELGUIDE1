import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "@/lib/auth";
import { CART_PLANS, normalizePlanKey, type PlanKey } from "@/lib/cart";
import { isManagedPromoCode, normalizePromoCode, validateManagedPromoForUser } from "@/lib/promo";

const PLANS = {
  "3j":    { name: "TravelGuide — Guide Express (3 jours)",   amount:  300, maxDays: 3,  label: "3 jours" },
  "7j":    { name: "TravelGuide — Guide Complet (7 jours)",   amount:  600, maxDays: 7,  label: "7 jours" },
  "14j":   { name: "TravelGuide — Guide Immersif (14 jours)", amount: 1000, maxDays: 14, label: "14 jours" },
  "1mois": { name: "TravelGuide — Guide Évasion (1 mois)",    amount: 1600, maxDays: 31, label: "1 mois" },
} as const;

type Answers = Record<string, unknown>;
type CheckoutItem = {
  planId?: unknown;
  planKey?: unknown;
  planLabel?: unknown;
  price?: unknown;
  destination?: unknown;
  dates?: unknown;
  criteria?: unknown;
};

type CheckoutBody = {
  planKey?: unknown;
  answers?: Answers;
  items?: CheckoutItem[];
  promoCode?: unknown;
};

type NormalizedCheckoutItem = {
  planKey: PlanKey;
  label: string;
  amount: number;
  destination: string;
  dates: string;
  criteria: Answers;
};

type AppliedPromo = {
  code: string;
  promotionCodeId: string;
};

const METADATA_FIELDS = [
  "destination",
  "arrival_date",
  "departure_date",
  "travel_dates",
  "travel_speed",
  "traveler_type",
  "activity_pace",
  "budget",
  "accommodations",
  "transport",
  "interests",
  "sports",
  "landscape",
  "climate",
  "sociability",
  "vibe",
  "comfort_level",
  "connectivity",
  "accessibility",
  "eco_tourism",
  "authenticity",
  "diet",
  "instagram",
  "user_email",
  "language",
  "notes",
] as const;

function tr(val: unknown): string {
  if (Array.isArray(val)) return val.join(",").substring(0, 500);
  if (typeof val === "string") return val.substring(0, 500);
  return String(val ?? "").substring(0, 500);
}

function countInclusiveDays(startDate: string, endDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return null;
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  const days = Math.floor((end - start) / 86_400_000) + 1;
  return days > 0 ? days : null;
}

function formatTravelDates(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return "";
  if (startDate === endDate || !endDate) return startDate;
  return `${startDate} → ${endDate}`;
}

function normalizeAnswers(rawCriteria: unknown): Answers {
  return rawCriteria && typeof rawCriteria === "object" && !Array.isArray(rawCriteria)
    ? rawCriteria as Answers
    : {};
}

function normalizeItem(rawItem: CheckoutItem): NormalizedCheckoutItem | null {
  const planKey = normalizePlanKey(rawItem.planId ?? rawItem.planKey);
  if (!planKey) return null;

  const plan = PLANS[planKey];
  const criteria = normalizeAnswers(rawItem.criteria);
  const destination = tr(rawItem.destination) || tr(criteria.destination);
  const dates = tr(rawItem.dates) || tr(criteria.travel_dates) || formatTravelDates(tr(criteria.arrival_date), tr(criteria.departure_date));
  const requestedAmount = typeof rawItem.price === "number" ? rawItem.price : Number(rawItem.price);

  return {
    planKey,
    label: typeof rawItem.planLabel === "string" && rawItem.planLabel.trim() ? rawItem.planLabel : CART_PLANS[planKey].label,
    amount: requestedAmount === plan.amount ? requestedAmount : plan.amount,
    destination,
    dates,
    criteria: {
      ...criteria,
      destination,
      travel_dates: dates,
    },
  };
}

function normalizeBody(body: CheckoutBody): NormalizedCheckoutItem[] | null {
  if (Array.isArray(body.items)) {
    const items = body.items.map(normalizeItem).filter((item): item is NormalizedCheckoutItem => Boolean(item));
    return items.length > 0 ? items : null;
  }

  const planKey = normalizePlanKey(body.planKey);
  if (!planKey) return null;

  const criteria = normalizeAnswers(body.answers);
  return [
    {
      planKey,
      label: CART_PLANS[planKey].label,
      amount: PLANS[planKey].amount,
      destination: tr(criteria.destination),
      dates: tr(criteria.travel_dates) || formatTravelDates(tr(criteria.arrival_date), tr(criteria.departure_date)),
      criteria,
    },
  ];
}

function validateItemDates(item: NormalizedCheckoutItem): string | null {
  const plan = PLANS[item.planKey];
  const arrivalDate = tr(item.criteria.arrival_date);
  const departureDate = tr(item.criteria.departure_date) || arrivalDate;
  const selectedDays = countInclusiveDays(arrivalDate, departureDate);

  if (!selectedDays) {
    return `Veuillez sélectionner au moins une date de voyage pour ${item.destination || item.label}.`;
  }

  if (selectedDays > plan.maxDays) {
    return `Votre plan ${plan.label} ne permet pas de dépasser ${plan.maxDays} jours pour ${item.destination || "ce guide"}. Pour plus de jours, choisissez un plan supérieur.`;
  }

  return null;
}

function setMetadata(metadata: Record<string, string>, key: string, value: unknown): void {
  const text = tr(value);
  if (text) metadata[key.substring(0, 40)] = text;
}

function buildMetadata(items: NormalizedCheckoutItem[], promoCode?: unknown): Record<string, string> {
  const metadata: Record<string, string> = {
    item_count: String(items.length),
    plan: items.length === 1 ? items[0].planKey : "multi",
  };

  if (typeof promoCode === "string" && promoCode.trim()) {
    metadata.promo_code = promoCode.trim().toUpperCase().substring(0, 500);
  }

  items.forEach((item, index) => {
    setMetadata(metadata, `item_${index}_plan`, item.planKey);
    setMetadata(metadata, `item_${index}_plan_label`, item.label);
    setMetadata(metadata, `item_${index}_destination`, item.destination);
    setMetadata(metadata, `item_${index}_dates`, item.dates);
    setMetadata(metadata, `item_${index}_price`, item.amount);

    METADATA_FIELDS.forEach((field) => {
      setMetadata(metadata, `item_${index}_${field}`, item.criteria[field]);
    });
  });

  if (items.length === 1) {
    const [item] = items;
    METADATA_FIELDS.forEach((field) => setMetadata(metadata, field, item.criteria[field]));
    setMetadata(metadata, "destination", item.destination);
    setMetadata(metadata, "travel_dates", item.dates);
  }

  return metadata;
}

async function findStripePromotionCode(stripe: Stripe, code: string): Promise<string | null> {
  const promotionCodes = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
  return promotionCodes.data[0]?.id ?? null;
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const items = normalizeBody(body);
  if (!items) {
    return NextResponse.json({ error: "Panier invalide" }, { status: 400 });
  }

  for (const item of items) {
    const validationError = validateItemDates(item);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
  }

  const stripe = new Stripe(stripeKey);
  const normalizedPromoCode = normalizePromoCode(body.promoCode);
  let appliedPromo: AppliedPromo | null = null;

  if (normalizedPromoCode) {
    if (isManagedPromoCode(normalizedPromoCode)) {
      const session = await getServerSession();
      const validation = await validateManagedPromoForUser({
        userId: session?.userId ?? null,
        code: normalizedPromoCode,
        planKey: items[0]?.planKey,
      });

      if (!validation.valid) {
        return NextResponse.json({ error: validation.message, code: validation.error, profileUrl: validation.profileUrl }, { status: validation.status ?? 400 });
      }
    }

    const promotionCodeId = await findStripePromotionCode(stripe, normalizedPromoCode);
    if (!promotionCodeId) {
      return NextResponse.json({ error: "Code promo invalide ou expiré.", code: "invalid_code" }, { status: 400 });
    }

    appliedPromo = { code: normalizedPromoCode, promotionCodeId };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://travel-ia.nanocorp.app";
  const cancelUrl = items.length === 1
    ? `${baseUrl}/questionnaire?plan=${items[0].planKey}`
    : `${baseUrl}/cart`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `Guide TravelGuide – ${item.destination || "Destination personnalisée"} ${PLANS[item.planKey].label}`,
        },
        unit_amount: item.amount,
      },
      quantity: 1,
    })),
    allow_promotion_codes: appliedPromo ? undefined : true,
    discounts: appliedPromo ? [{ promotion_code: appliedPromo.promotionCodeId }] : undefined,
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: buildMetadata(items, appliedPromo?.code),
  });

  return NextResponse.json({ url: session.url });
}
