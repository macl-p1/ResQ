export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";
import { AnalyticsData } from "@/types/database";

export async function GET() {
  try {
    if (isDemoMode()) {
      return NextResponse.json(demoStore.getAnalytics() as AnalyticsData);
    }

    const [needsSnap, volSnap, assignSnap] = await Promise.all([
      adminDb.collection("needs").get(),
      adminDb.collection("volunteers").where("is_available", "==", true).get(),
      adminDb.collection("assignments").get(),
    ]);

    const needs = needsSnap.docs.map((d) => d.data());
    const assignments = assignSnap.docs.map((d) => d.data());

    const needs_by_type: Record<string, number> = {};
    needs.forEach((n) => { const t = n.need_type || "Other"; needs_by_type[t] = (needs_by_type[t] || 0) + 1; });

    const completed = assignments.filter((a) => a.status === "completed" && a.completed_at && a.matched_at);
    let avg = 0;
    if (completed.length) {
      const times = completed.map((a) => (a.completed_at.toDate().getTime() - a.matched_at.toDate().getTime()) / 60000);
      avg = Math.round((times.reduce((a: number, b: number) => a + b, 0) / times.length) * 10) / 10;
    }

    const analytics: AnalyticsData = {
      total_needs: needs.length,
      pending_needs: needs.filter((n) => n.status === "pending").length,
      assigned_needs: needs.filter((n) => n.status === "assigned").length,
      resolved_needs: needs.filter((n) => n.status === "resolved").length,
      active_volunteers: volSnap.size,
      total_assignments: assignments.length,
      avg_response_time_minutes: avg,
      needs_by_type,
    };
    return NextResponse.json(analytics);
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
