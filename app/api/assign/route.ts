import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";
import twilio from "twilio";
import { sendTaskAssignmentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { needId, volunteerId, aiReasoning } = await req.json() as { needId: string; volunteerId: string; aiReasoning?: string };
    if (!needId || !volunteerId) return NextResponse.json({ error: "needId and volunteerId required" }, { status: 400 });

    if (isDemoMode()) {
      const need = demoStore.getNeedById(needId);
      const volunteer = demoStore.getVolunteerById(volunteerId);
      if (!need || !volunteer) return NextResponse.json({ error: "Need or volunteer not found" }, { status: 404 });

      const mapsLink = (need.lat && need.lng)
        ? `https://www.google.com/maps/dir/?api=1&destination=${need.lat},${need.lng}&travelmode=driving`
        : null;

      demoStore.updateNeedStatus(needId, "assigned", volunteerId);
      const assignment = demoStore.addAssignment({
        need_id: needId, volunteer_id: volunteerId, volunteer_name: volunteer.name,
        need_title: `${need.need_type} — ${need.location_name}`,
        status: "pending", ai_reasoning: aiReasoning || null, completed_at: null,
      });
      // Update volunteer task count in demo store
      const vol = demoStore.volunteers.find((v) => v.id === volunteerId);
      if (vol) vol.active_task_count++;
      return NextResponse.json({ success: true, assignment, need, volunteer, mapsLink });
    }

    // Firestore mode
    const [needDoc, volunteerDoc] = await Promise.all([
      adminDb.collection("needs").doc(needId).get(),
      adminDb.collection("volunteers").doc(volunteerId).get(),
    ]);

    if (!needDoc.exists || !volunteerDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const need = { id: needDoc.id, ...needDoc.data() } as any;
    const volunteer = { id: volunteerDoc.id, ...volunteerDoc.data() } as any;

    // Generate Google Maps navigation link
    const mapsLink = (need.lat && need.lng)
      ? `https://www.google.com/maps/dir/?api=1&destination=${need.lat},${need.lng}&travelmode=driving`
      : null;

    // Create assignment in Firestore
    const assignmentRef = await adminDb.collection("assignments").add({
      need_id: needId,
      volunteer_id: volunteerId,
      volunteer_name: volunteer.name,
      need_title: `${need.need_type} — ${need.location_name}`,
      need_location: need.location_name,
      matched_at: new Date(),
      status: "pending",
      maps_link: mapsLink,
      ai_reasoning: aiReasoning || null,
      completed_at: null,
    });

    // Update need status
    await adminDb.collection("needs").doc(needId).update({
      status: "assigned",
      assigned_volunteer_id: volunteerId,
      ai_reasoning: aiReasoning || null,
    });

    // Update volunteer workload
    await adminDb.collection("volunteers").doc(volunteerId).update({
      active_task_count: (volunteer.active_task_count || 0) + 1,
    });

    // WhatsApp message with Google Maps link
    const whatsappBody = `🚨 *ResQ Task Assigned*

Hi ${volunteer.name}! You have been assigned an emergency task.

📋 *Task:* ${need.need_type}
📍 *Location:* ${need.location_name}
⚠️ *Urgency:* ${need.urgency_score}/100
👥 *People affected:* ${need.affected_count}
${mapsLink ? `\n🗺️ *Navigate to crisis site:*\n${mapsLink}` : ''}

Open ResQ to accept and track:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/volunteer/dashboard

— ResQ Crisis Response`;

    // FCM push notification
    const fcmPayload = {
      notification: {
        title: `🚨 New Task — ${need.need_type}`,
        body: `${need.location_name} · ${need.affected_count} people affected · Tap to navigate`,
      },
      data: {
        needId,
        assignmentId: assignmentRef.id,
        ...(mapsLink ? { mapsLink } : {}),
        type: 'task_assigned',
      },
    };

    // Send all notifications simultaneously
    await Promise.allSettled([
      // WhatsApp
      (async () => {
        const twSid = process.env.TWILIO_ACCOUNT_SID;
        const twToken = process.env.TWILIO_AUTH_TOKEN;
        const twFrom = process.env.TWILIO_WHATSAPP_NUMBER;
        if (!twSid || !twToken || !twFrom || !volunteer.phone) return;
        const tw = twilio(twSid, twToken);
        await tw.messages.create({
          from: `whatsapp:${twFrom}`,
          to: `whatsapp:${volunteer.phone}`,
          body: whatsappBody,
        });
      })(),

      // FCM push
      (async () => {
        if (!volunteer.fcm_token) return;
        await adminMessaging.send({
          token: volunteer.fcm_token,
          ...fcmPayload,
        });
      })(),

      // Email with maps link
      (async () => {
        if (!volunteer.email) return;
        await sendTaskAssignmentEmail(
          volunteer.email,
          volunteer.name,
          need.need_type,
          need.location_name,
          need.urgency_score,
          need.affected_count,
          needId,
          mapsLink || '',
        );
      })(),
    ]);

    return NextResponse.json({
      success: true,
      assignmentId: assignmentRef.id,
      mapsLink,
    });
  } catch (err) {
    console.error("Assign error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
