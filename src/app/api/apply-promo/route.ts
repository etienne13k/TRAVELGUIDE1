import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { normalizePromoCode, validateManagedPromoForUser } from "@/lib/promo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getServerSession();
    const code = normalizePromoCode(body.promoCode);
    const planKey = body.planKey as string | undefined;
    const result = await validateManagedPromoForUser({ userId: session?.userId ?? null, code, planKey });

    return NextResponse.json(result, { status: result.valid ? 200 : result.status ?? 200 });
  } catch (error) {
    console.error("[apply-promo]", error);
    return NextResponse.json({ valid: false, error: "server_error", message: "Erreur serveur, réessayez." }, { status: 500 });
  }
}
