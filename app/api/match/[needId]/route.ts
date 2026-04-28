export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";
import { matchVolunteers } from "@/lib/gemini";
import { Need, Volunteer } from "@/types/database";
import { logVolunteerMatched } from "@/lib/analytics";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(req: NextRequest, { params }: { params: { needId: string } }) {
  const { needId } = params;
  console.log('=== MATCH ROUTE HIT, needId:', needId);

  try {
    if (isDemoMode()) {
      const need = demoStore.getNeedById(needId);
      if (!need) return NextResponse.json({ error: "Need not found" }, { status: 404 });

      const hasGeminiKey = !!(process.env.GOOGLE_GEMINI_API_KEY?.trim());
      let candidates = demoStore.getAvailableVolunteers();
      if (!candidates.length) return NextResponse.json({ error: "No available volunteers", ranked: [] });

      const candidatesWithDist = candidates.map((v) => ({
        ...v,
        distance_km: (need.lat && need.lng && v.lat && v.lng) ? Math.round(haversineKm(need.lat, need.lng, v.lat, v.lng) * 10) / 10 : null,
      }));

      const matches = hasGeminiKey
        ? await matchVolunteers(need, candidatesWithDist)
        : { ranked: demoStore.simpleMatch(need, candidates), top_reasoning: "Matched based on skills. Distance shown for reference only." };

      // Enrich ranked results with full volunteer data
      const enrichedRanked = matches.ranked.map((r: any) => {
        const volunteer = candidatesWithDist.find((v: any) => v.id === r.volunteer_id);
        return { ...r, volunteer };
      }).filter((r: any) => r.volunteer);

      await logVolunteerMatched(need.need_type as string, 0);
      return NextResponse.json({
        success: true,
        need,
        ranked: enrichedRanked,
        top_reasoning: matches.top_reasoning,
        total_volunteers_evaluated: candidatesWithDist.length,
      });
    }

    // Firestore mode
    const needDoc = await adminDb.collection("needs").doc(needId).get();
    console.log('Need exists:', needDoc.exists);
    if (!needDoc.exists) return NextResponse.json({ error: "Need not found" }, { status: 404 });
    const need = { id: needDoc.id, ...needDoc.data() } as Need;

    // Fetch ALL available volunteers
    const volSnap = await adminDb.collection("volunteers").where("is_available", "==", true).get();
    console.log('Available volunteers found:', volSnap.size);

    if (volSnap.empty) {
      console.log('NO VOLUNTEERS FOUND — checking all volunteers without filter:');
      const allVols = await adminDb.collection("volunteers").get();
      console.log('Total volunteers in DB:', allVols.size);
      allVols.docs.forEach(d => console.log('Volunteer:', d.id, 'is_available:', d.data().is_available, 'isAvailable:', d.data().isAvailable));
      return NextResponse.json({
        error: "No available volunteers",
        debug: {
          totalVolunteers: allVols.size,
          volunteers: allVols.docs.map(d => ({ id: d.id, ...d.data() })),
        },
        ranked: [],
      });
    }

    // Calculate distance for each volunteer (informational only, never filtering)
    const volunteers = volSnap.docs.map(doc => {
      const data = doc.data();
      let distance_km: number | null = null;
      if (data.lat && data.lng && need.lat && need.lng) {
        distance_km = Math.round(haversineKm(need.lat, need.lng, data.lat, data.lng) * 10) / 10;
      }
      return { id: doc.id, ...data, distance_km } as Volunteer & { distance_km: number | null };
    });

    // Call Gemini for smart matching
    const matchResult = await matchVolunteers(need, volunteers);

    // Enrich ranked results with full volunteer data
    const enrichedRanked = matchResult.ranked.map((r: any) => {
      const volunteer = volunteers.find(v => v.id === r.volunteer_id);
      return { ...r, volunteer };
    }).filter((r: any) => r.volunteer);

    await logVolunteerMatched(need.need_type as string, 0);
    return NextResponse.json({
      success: true,
      need,
      ranked: enrichedRanked,
      top_reasoning: matchResult.top_reasoning,
      total_volunteers_evaluated: volunteers.length,
    });
  } catch (err) {
    console.error("Match error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
