import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";
import { Need } from "@/types/database";

export async function GET() {
  try {
    if (isDemoMode()) {
      return NextResponse.json(demoStore.needs);
    }
    const snap = await adminDb.collection("needs").orderBy("urgency_score", "desc").get();
    const needs: Need[] = snap.docs.map((d) => ({ id: d.id, ...d.data(), created_at: d.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString() }) as Need);
    return NextResponse.json(needs);
  } catch (err) {
    console.error("Fetch needs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Thin wrapper — delegates to /api/ingest
  return fetch(new URL("/api/ingest", req.url), { method: "POST", headers: req.headers, body: req.body });
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() as { id: string };
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    if (isDemoMode()) {
      demoStore.needs = demoStore.needs.filter((n) => n.id !== id);
      return NextResponse.json({ success: true });
    }

    // Check status before deleting
    const doc = await adminDb.collection("needs").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Need not found" }, { status: 404 });

    const data = doc.data();
    if (data?.status !== "pending") {
      return NextResponse.json({ error: "Cannot delete — need is already assigned or resolved" }, { status: 400 });
    }

    await adminDb.collection("needs").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete need error:", err);
    return NextResponse.json({ error: "Failed to delete need" }, { status: 500 });
  }
}
