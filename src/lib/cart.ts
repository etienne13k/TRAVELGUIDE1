export const CART_STORAGE_KEY = "spiregg_cart_items_v1";
export const BUSINESS_CART_STORAGE_KEY = "spiregg_cart_items_business_v1";
export const CART_UPDATED_EVENT = "spiregg_cart_updated";

function getActiveCartKey(): string {
  if (typeof window === "undefined") return CART_STORAGE_KEY;
  return localStorage.getItem("tgai_mode") === "business"
    ? BUSINESS_CART_STORAGE_KEY
    : CART_STORAGE_KEY;
}

export const PLAN_KEYS = ["7j", "1mois"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export type CartCriteriaValue = string | string[] | number | boolean | null | undefined;
export type CartCriteria = Record<string, CartCriteriaValue>;

export type CartItem = {
  id: string;
  planId: PlanKey;
  planLabel: string;
  price: number;
  destination: string;
  dates: string;
  criteria: CartCriteria;
  createdAt: string;
  updatedAt: string;
};

export const CART_PLANS: Record<PlanKey, { label: string; duration: string; amount: number }> = {
  "7j":    { label: "Guide Voyage — 7 jours", duration: "Jusqu'à 7 jours", amount: 500  },
  "1mois": { label: "Abonnement Mensuel",      duration: "1 mois illimité", amount: 1300 },
};

export type CartItemInput = Omit<CartItem, "id" | "createdAt" | "updatedAt">;

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && PLAN_KEYS.includes(value as PlanKey);
}

export function normalizePlanKey(value: unknown): PlanKey | null {
  if (typeof value !== "string") return null;

  const aliases: Record<string, PlanKey> = {
    basic: "7j",
    elite: "1mois",
    "7": "7j",
    "30": "1mois",
  };

  const normalized = aliases[value] ?? value;
  return isPlanKey(normalized) ? normalized : null;
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

export function getCartCount(): number {
  return loadCart().length;
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const rawCart = window.localStorage.getItem(getActiveCartKey());
    if (!rawCart) return [];

    const parsedCart: unknown = JSON.parse(rawCart);
    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter(isCartItem);
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(getActiveCartKey(), JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

// Stripe Payment Links — one per plan
export const STRIPE_PAYMENT_LINKS: Record<PlanKey, string> = {
  "7j":    "https://buy.stripe.com/00wdR9fAxc7iePV8GI0Ba02",
  "1mois": "https://buy.stripe.com/5kQ28r1JHfju239g9a0Ba04",
};

export function addCartItem(input: CartItemInput): CartItem {
  const timestamp = new Date().toISOString();
  const item: CartItem = {
    ...input,
    id: createCartItemId(input.planId),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Only 1 item allowed — replace previous
  saveCart([item]);
  return item;
}

export function updateCartItem(itemId: string, input: CartItemInput): CartItem | null {
  const existingItems = loadCart();
  const existingItem = existingItems.find((item) => item.id === itemId);
  if (!existingItem) return null;

  const updatedItem: CartItem = {
    ...existingItem,
    ...input,
    id: existingItem.id,
    createdAt: existingItem.createdAt,
    updatedAt: new Date().toISOString(),
  };

  saveCart(existingItems.map((item) => (item.id === itemId ? updatedItem : item)));
  return updatedItem;
}

export function removeCartItem(itemId: string): void {
  saveCart(loadCart().filter((item) => item.id !== itemId));
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartItem(itemId: string): CartItem | null {
  return loadCart().find((item) => item.id === itemId) ?? null;
}

function createCartItemId(planId: PlanKey): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${planId}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<CartItem>;
  return (
    typeof candidate.id === "string" &&
    isPlanKey(candidate.planId) &&
    typeof candidate.planLabel === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.destination === "string" &&
    typeof candidate.dates === "string" &&
    Boolean(candidate.criteria) &&
    typeof candidate.criteria === "object" &&
    !Array.isArray(candidate.criteria) &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}
