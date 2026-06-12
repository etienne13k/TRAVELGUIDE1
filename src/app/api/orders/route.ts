import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, destination, plan, status, created_at, estimated_delivery, guide_url")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
