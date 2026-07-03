import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ensureAdminSchema } from "@/lib/admin-db";
import { getPool } from "@/lib/db";
import { isManagedPromoCode, normalizePromoCode, recordPromoUsage } from "@/lib/promo";

function inferPlan(amountCents: number): string {
  if (amountCents <= 300) return "3j";
  if (amountCents <= 600) return "7j";
  if (amountCents <= 1000) return "14j";
  return "1mois";
}

function metadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function itemMetadata(metadata: Record<string, unknown>, index: number): Record<string, string> {
  const prefix = `item_${index}_`;
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key, value]) => key.startsWith(prefix) && typeof value === "string")
      .map(([key, value]) => [key.slice(prefix.length), value as string])
  );
}

function itemCountFromMetadata(metadata: Record<string, unknown>): number {
  const count = Number(metadata.item_count);
  return Number.isInteger(count) && count > 0 ? Math.min(count, 20) : 1;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err) {
        console.error("[webhook] signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
    }

    if (event?.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data?.object as Stripe.Checkout.Session;
    const sessionId: string = session.id;
    const amountCents: number = session.amount_total ?? 0;
    const currency: string = session.currency ?? "eur";
    const email: string | null = session.customer_details?.email ?? null;
    const metadata = (session.metadata ?? {}) as Record<string, string>;
    const clientReferenceId: string | null = session.client_reference_id ?? null;
    const promoCode = normalizePromoCode(metadata.promo_code);
    const normalizedEmail = email?.toLowerCase() ?? null;
    const itemCount = itemCountFromMetadata(metadata);
    const plan: string = itemCount > 1 ? "multi" : metadataString(metadata, "plan") ?? inferPlan(amountCents);

    await ensureAdminSchema();
    const pool = getPool();

    await pool.query(
      `INSERT INTO payment_sessions (session_id, email, plan, amount_cents, currency)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (session_id) DO UPDATE SET
         email = EXCLUDED.email,
         plan = EXCLUDED.plan,
         amount_cents = EXCLUDED.amount_cents,
         currency = EXCLUDED.currency`,
      [sessionId, normalizedEmail, plan, amountCents, currency]
    );

    let userId: string | null = null;
    if (normalizedEmail) {
      const { rows } = await pool.query<{ id: string }>("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
      userId = rows[0]?.id ?? null;
    }

    // Payment Link flow: client_reference_id = pending order ID saved before redirect
    if (clientReferenceId) {
      const { rows: pendingRows } = await pool.query(
        "SELECT id FROM orders WHERE id = $1 AND status = 'pending_payment' LIMIT 1",
        [clientReferenceId]
      );
      const pendingOrder = pendingRows[0];

      if (pendingOrder) {
        await pool.query(
          `UPDATE orders SET
             user_id = COALESCE(user_id, $1),
             stripe_session_id = $2,
             session_id = $3,
             status = 'questionnaire_pending',
             amount_cents = $4,
             currency = $5
           WHERE id = $6`,
          [userId, sessionId, sessionId, amountCents, currency, clientReferenceId]
        );

        if (userId && isManagedPromoCode(promoCode)) {
          await recordPromoUsage({ userId, code: promoCode, productId: plan });
        }

        console.log(`[webhook] payment_link: order=${clientReferenceId} session=${sessionId} email=${normalizedEmail} plan=${plan}`);
        return NextResponse.json({ received: true });
      }
    }

    // Fallback: Checkout Session flow or Payment Link without pending order
    for (let index = 0; index < itemCount; index += 1) {
      const perItemMetadata = itemCount > 1 ? itemMetadata(metadata, index) : metadata as Record<string, string>;
      const itemPlan = perItemMetadata.plan ?? metadataString(metadata, `item_${index}_plan`) ?? inferPlan(amountCents);
      const destination = perItemMetadata.destination ?? metadataString(metadata, `item_${index}_destination`);
      const itemSessionId = itemCount > 1 ? `${sessionId}_${index}` : sessionId;
      const itemAmount = Number(perItemMetadata.price ?? metadataString(metadata, `item_${index}_price`)) || (itemCount > 1 ? 0 : amountCents);

      const { rows: existingOrders } = await pool.query<{
        id: string;
        user_id: string | null;
        destination: string | null;
        questionnaire_data: unknown;
      }>(
        "SELECT id, user_id, destination, questionnaire_data FROM orders WHERE session_id = $1 LIMIT 1",
        [itemSessionId]
      );
      const existingOrder = existingOrders[0];
      const questionnaireData = existingOrder?.questionnaire_data ?? perItemMetadata;

      if (existingOrder) {
        await pool.query(
          `UPDATE orders
           SET user_id = $1,
               session_id = $2,
               stripe_session_id = $3,
               plan = $4,
               status = $5,
               destination = $6,
               questionnaire_data = $7::jsonb,
               quiz_responses = $7::jsonb,
               amount_cents = $8,
               currency = $9
           WHERE id = $10`,
          [
            existingOrder.user_id ?? userId,
            itemSessionId,
            sessionId,
            itemPlan,
            "questionnaire_completed",
            existingOrder.destination ?? destination ?? null,
            JSON.stringify(questionnaireData),
            itemAmount,
            currency,
            existingOrder.id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO orders (user_id, session_id, stripe_session_id, plan, status, destination, questionnaire_data, quiz_responses, amount_cents, currency)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $7::jsonb, $8, $9)`,
          [userId, itemSessionId, sessionId, itemPlan, "questionnaire_completed", destination ?? null, JSON.stringify(questionnaireData), itemAmount, currency]
        );
      }
    }

    if (userId && isManagedPromoCode(promoCode)) {
      await recordPromoUsage({ userId, code: promoCode, productId: plan });
    }

    console.log(`[webhook] checkout_session: session=${sessionId} email=${normalizedEmail} plan=${plan} items=${itemCount} amount=${amountCents}${currency}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] error:", error);
    return NextResponse.json({ received: true });
  }
}
