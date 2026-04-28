import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const originLat = searchParams.get("originLat");
    const originLng = searchParams.get("originLng");
    const destLat = searchParams.get("destLat");
    const destLng = searchParams.get("destLng");

    if (!originLat || !originLng || !destLat || !destLng) {
      return NextResponse.json({ error: "originLat, originLng, destLat, destLng required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ distance: "N/A", duration: "N/A", error: "Maps API not configured" }, { status: 200 });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&mode=driving&units=metric&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return NextResponse.json({ distance: "N/A", duration: "N/A" });
    }

    return NextResponse.json({
      distance: element.distance?.text || "N/A",
      duration: element.duration?.text || "N/A",
      distanceValue: element.distance?.value,
      durationValue: element.duration?.value,
    });
  } catch (err) {
    console.error("Distance error:", err);
    return NextResponse.json({ error: "Distance calculation failed" }, { status: 500 });
  }
}
