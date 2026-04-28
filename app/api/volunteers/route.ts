export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";
import { Volunteer } from "@/types/database";

export async function GET() {
  try {
    if (isDemoMode()) {
      return NextResponse.json(demoStore.volunteers);
    }
    const snap = await adminDb.collection("volunteers").orderBy("name").get();
    const volunteers: Volunteer[] = snap.docs.map((d) => ({ id: d.id, ...d.data(), created_at: d.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString() }) as Volunteer);
    return NextResponse.json(volunteers);
  } catch (err) {
    console.error("Fetch volunteers error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
