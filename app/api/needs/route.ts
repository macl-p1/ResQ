export const dynamic = "force-dynamic";
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

// PATCH — mark a need as resolved (volunteer completes task)
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json() as { id: string; status: string };
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    if (isDemoMode()) {
      const need = demoStore.needs.find((n) => n.id === id);
      if (!need) return NextResponse.json({ error: "Need not found" }, { status: 404 });

      need.status = status as any;

      if (status === "resolved" && need.assigned_volunteer_id) {
        // Update volunteer counts
        const vol = demoStore.volunteers.find((v) => v.id === need.assigned_volunteer_id);
        if (vol) {
          vol.active_task_count = Math.max(0, vol.active_task_count - 1);
          vol.completed_tasks = (vol.completed_tasks || 0) + 1;
        }
        // Update assignment status
        const assignment = demoStore.assignments.find((a) => a.need_id === id);
        if (assignment) {
          assignment.status = "completed";
          assignment.completed_at = new Date().toISOString();
        }
      }
      return NextResponse.json({ success: true });
    }

    // Firestore mode
    const needDoc = await adminDb.collection("needs").doc(id).get();
    if (!needDoc.exists) return NextResponse.json({ error: "Need not found" }, { status: 404 });

    const needData = needDoc.data()!;
    await adminDb.collection("needs").doc(id).update({ status });

    if (status === "resolved" && needData.assigned_volunteer_id) {
      // Decrement active tasks, increment completed tasks on volunteer
      const volRef = adminDb.collection("volunteers").doc(needData.assigned_volunteer_id);
      const volDoc = await volRef.get();
      if (volDoc.exists) {
        const volData = volDoc.data()!;
        await volRef.update({
          active_task_count: Math.max(0, (volData.active_task_count || 1) - 1),
          completed_tasks: (volData.completed_tasks || 0) + 1,
        });
      }

      // Update assignment record
      const assignSnap = await adminDb.collection("assignments")
        .where("need_id", "==", id)
        .where("volunteer_id", "==", needData.assigned_volunteer_id)
        .limit(1).get();
      if (!assignSnap.empty) {
        await assignSnap.docs[0].ref.update({ status: "completed", completed_at: new Date() });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update need error:", err);
    return NextResponse.json({ error: "Failed to update need" }, { status: 500 });
  }
}

