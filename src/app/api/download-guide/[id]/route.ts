import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "ID invalide." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: guide, error } = await supabase
      .from("guides")
      .select("pdf_data, destination, duration")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!guide) {
      return NextResponse.json({ error: "Guide introuvable." }, { status: 404 });
    }

    const pdfBuffer = Buffer.from(guide.pdf_data, "base64");
    const filename = `guide-${guide.destination
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-${guide.duration}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[download-guide] error:", message);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement." },
      { status: 500 }
    );
  }
}
