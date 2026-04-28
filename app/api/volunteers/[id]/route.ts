export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { is_available } = await req.json() as { is_available: boolean };

    if (isDemoMode()) {
      demoStore.updateVolunteerAvailability(id, is_available);
      const vol = demoStore.getVolunteerById(id);
      return NextResponse.json({ volunteer: vol });
    }

    await adminDb.collection("volunteers").doc(id).update({ is_available });
    const doc = await adminDb.collection("volunteers").doc(id).get();
    return NextResponse.json({ volunteer: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("Volunteer update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
