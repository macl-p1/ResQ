export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";
import { extractNeedFromText } from "@/lib/gemini";
import { logNeedReported } from "@/lib/analytics";
import { Need } from "@/types/database";

async function translateText(text: string, targetLang: string): Promise<string> {
  const key = process.env.GOOGLE_CLOUD_TRANSLATE_KEY;
  if (!key) return "";
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: text, target: targetLang, format: "text" }) }
    );
    const data = await res.json();
    return data.data?.translations?.[0]?.translatedText || "";
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      text, 
      source = "web", 
      lat, 
      lng, 
      location_name, 
      affected_count: manualAffected, 
      need_type: manualType,
      urgency_score: manualUrgency,
      dryRun = false 
    } = body as { 
      text: string; 
      source: string; 
      lat?: number; 
      lng?: number; 
      location_name?: string;
      affected_count?: number;
      need_type?: string;
      urgency_score?: number;
      dryRun?: boolean;
    };

    if (!text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });

    const hasGeminiKey = !!(process.env.GOOGLE_GEMINI_API_KEY?.trim());

    let extracted;

    if (hasGeminiKey) {
      extracted = await extractNeedFromText(text);
      if (lat !== undefined) extracted.lat = lat;
      if (lng !== undefined) extracted.lng = lng;
      if (location_name) extracted.location_name = location_name;
      if (manualAffected !== undefined) extracted.affected_count = manualAffected;
      if (manualType) extracted.need_type = manualType;
    } else {
      extracted = demoStore.simpleExtract(text);
      if (lat !== undefined) extracted.lat = lat;
      if (lng !== undefined) extracted.lng = lng;
      if (location_name) extracted.location_name = location_name;
      if (manualAffected !== undefined) extracted.affected_count = manualAffected;
      if (manualType) extracted.need_type = manualType;
    }

    if (dryRun) {
      return NextResponse.json({ extraction: extracted });
    }

    // Auto-geocode if lat/lng are missing but location_name exists
    if ((!extracted.lat || !extracted.lng) && extracted.location_name) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (apiKey) {
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(extracted.location_name)}&region=IN&key=${apiKey}`
          );
          const geoData = await geoRes.json();
          if (geoData.results?.[0]?.geometry?.location) {
            extracted.lat = geoData.results[0].geometry.location.lat;
            extracted.lng = geoData.results[0].geometry.location.lng;
            console.log("[Ingest] Auto-geocoded:", extracted.location_name, "→", extracted.lat, extracted.lng);
          }
        }
      } catch (geoErr) {
        console.warn("[Ingest] Geocoding failed (non-fatal):", geoErr);
      }
    }

    // Urgency is ALWAYS set manually — never by Gemini
    const urgencyScore = manualUrgency ?? 20; // default to Low if not provided

    // Pre-translate description
    const description = extracted.description || text.slice(0, 200);
    const [hi, ta, te, bn] = await Promise.all([
      translateText(description, "hi"),
      translateText(description, "ta"),
      translateText(description, "te"),
      translateText(description, "bn"),
    ]);
    const translated_text = { hi, ta, te, bn };

    const needData: Omit<Need, "id"> = {
      raw_text: text,
      location_name: extracted.location_name || "Unknown",
      lat: extracted.lat ?? null,
      lng: extracted.lng ?? null,
      need_type: extracted.need_type || "Other",
      urgency_score: urgencyScore,
      affected_count: extracted.affected_count ?? 0,
      description,
      status: "pending",
      report_count: 1,
      source: source as Need["source"],
      created_at: new Date().toISOString(),
      suggested_skills: extracted.suggested_skills || [],
      translated_text,
    };

    console.log("[Ingest] Saving need:", { 
      location: needData.location_name, 
      type: needData.need_type, 
      urgency: needData.urgency_score, 
      lat: needData.lat, 
      lng: needData.lng,
      affected: needData.affected_count,
    });

    if (isDemoMode()) {
      const created = demoStore.addNeed(needData);
      await logNeedReported(source, urgencyScore);
      return NextResponse.json({ need: created, extraction: extracted }, { status: 201 });
    }

    const docRef = await adminDb.collection("needs").add({ ...needData, created_at: new Date() });
    const created = { id: docRef.id, ...needData };
    await logNeedReported(source, urgencyScore);
    return NextResponse.json({ need: created, extraction: extracted }, { status: 201 });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
