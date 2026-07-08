import { getPool } from "@/lib/db";

export const PROFILE_URL = "/account/profile";
export const PROMO_REQUIRES_LOGIN_MESSAGE = "Connectez-vous pour utiliser ce code.";
export const PROMO_ALREADY_USED_MESSAGE = "Ce code a déjà été utilisé sur votre compte.";

type PromoConfig = {
  planKey: string | null; // null = valable pour tous les plans
  discount: number;       // pourcentage (0-100)
};

export const VALID_PROMO_CODES: Record<string, PromoConfig> = {
  WELCOME: { planKey: null, discount: 25 },
};

export type ValidPromoCode = keyof typeof VALID_PROMO_CODES;
export type PromoValidationResult =
  | { valid: true; code: string; discount: number; isFree: boolean }
  | { valid: false; error: string; message: string; profileUrl?: string; status?: number };

export function normalizePromoCode(code: unknown): string {
  return typeof code === "string" ? code.toUpperCase().trim() : "";
}

export function getPromoConfig(code: string): PromoConfig | undefined {
  return VALID_PROMO_CODES[code];
}

export function isManagedPromoCode(code: string): boolean {
  return code in VALID_PROMO_CODES;
}

export async function validateManagedPromoForUser(params: {
  userId: string | null;
  code: string;
  planKey: string | undefined;
}): Promise<PromoValidationResult> {
  const code = normalizePromoCode(params.code);
  const promoConfig = getPromoConfig(code);

  if (!code || !params.planKey) {
    return { valid: false, error: "invalid_input", message: "Code promo ou plan manquant.", status: 400 };
  }

  if (!promoConfig) {
    return { valid: false, error: "invalid_code", message: "Code promo invalide ou expiré." };
  }

  // Vérification plan (null = tous les plans acceptés)
  if (promoConfig.planKey !== null && promoConfig.planKey !== params.planKey) {
    return {
      valid: false,
      error: "wrong_plan",
      message: `Ce code promo n'est pas valable pour ce plan.`,
    };
  }

  if (!params.userId) {
    return { valid: false, error: "not_logged_in", message: PROMO_REQUIRES_LOGIN_MESSAGE, status: 401 };
  }

  const pool = getPool();

  const { rows: usages } = await pool.query<{ id: string }>(
    "SELECT id FROM promo_usages WHERE user_id = $1 AND promo_code = $2 LIMIT 1",
    [params.userId, code]
  );

  if (usages.length > 0) {
    return { valid: false, error: "already_used", message: PROMO_ALREADY_USED_MESSAGE, status: 403 };
  }

  return { valid: true, code, discount: promoConfig.discount, isFree: promoConfig.discount === 100 };
}

export async function recordPromoUsage(params: {
  userId: string | null;
  code: string | null | undefined;
  productId?: string | null;
}): Promise<void> {
  const code = normalizePromoCode(params.code);
  if (!params.userId || !isManagedPromoCode(code)) return;

  const pool = getPool();
  await pool.query(
    `INSERT INTO promo_usages (user_id, promo_code, product_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, promo_code) DO NOTHING`,
    [params.userId, code, params.productId ?? null]
  );
}
