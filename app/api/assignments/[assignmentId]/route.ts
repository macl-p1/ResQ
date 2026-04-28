import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";
import { Assignment } from "@/types/database";
import { logTaskCompleted } from "@/lib/analytics";

export async function PATCH(req: NextRequest, { params }: { params: { assignmentId: string } }) {
  try {
    const { assignmentId } = params;
    const { status } = await req.json() as { status: Assignment["status"] };

    const validStatuses = ["pending", "accepted", "in_progress", "completed"];
    if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    if (isDemoMode()) {
      const updates: Partial<Assignment> = { status };
      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
        const a = demoStore.getAssignmentById(assignmentId);
        if (a) {
          const need = demoStore.getNeedById(a.need_id);
          if (need) demoStore.updateNeedStatus(a.need_id, "resolved");
          const vol = demoStore.volunteers.find((v) => v.id === a.volunteer_id);
          if (vol) { vol.active_task_count = Math.max(0, vol.active_task_count - 1); vol.completed_tasks = (vol.completed_tasks || 0) + 1; }
          if (a.matched_at) { const mins = (Date.now() - new Date(a.matched_at).getTime()) / 60000; await logTaskCompleted(a.volunteer_id, Math.round(mins)); }
        }
      }
      const updated = demoStore.updateAssignment(assignmentId, updates);
      return NextResponse.json({ assignment: updated });
    }

    const aDoc = await adminDb.collection("assignments").doc(assignmentId).get();
    if (!aDoc.exists) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    const a = aDoc.data()!;

    const updates: Record<string, unknown> = { status };
    if (status === "completed") {
      updates.completed_at = new Date();
      await adminDb.collection("needs").doc(a.need_id).update({ status: "resolved" });
      const volDoc = await adminDb.collection("volunteers").doc(a.volunteer_id).get();
      const vol = volDoc.data();
      if (vol) {
        await adminDb.collection("volunteers").doc(a.volunteer_id).update({
          active_task_count: Math.max(0, (vol.active_task_count || 1) - 1),
          completed_tasks: (vol.completed_tasks || 0) + 1,
        });
        const matchedAt = a.matched_at?.toDate?.() || new Date();
        const mins = (Date.now() - matchedAt.getTime()) / 60000;
        await logTaskCompleted(a.volunteer_id, Math.round(mins));
      }
    }

    await adminDb.collection("assignments").doc(assignmentId).update(updates);
    return NextResponse.json({ assignment: { id: assignmentId, ...a, ...updates } });
  } catch (err) {
    console.error("Assignment update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
