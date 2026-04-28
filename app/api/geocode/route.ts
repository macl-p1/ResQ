export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&region=IN&key=${apiKey}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Geocoding API error:", error);
    return NextResponse.json({ error: "Failed to fetch coordinates" }, { status: 500 });
  }
}
