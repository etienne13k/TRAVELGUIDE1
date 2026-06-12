import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "TravelGuideAI/1.0 (spiregg.nanocorp.app)" },
    });

    if (!res.ok) throw new Error("Nominatim error");
    const data = await res.json();

    if (!data.length) {
      return NextResponse.json({ found: false });
    }

    const { lat, lon, display_name } = data[0];
    return NextResponse.json({ found: true, lat: parseFloat(lat), lng: parseFloat(lon), name: display_name });
  } catch {
    return NextResponse.json({ found: false });
  }
}
