export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, skills, locationName } = await req.json() as {
      name: string; email: string; phone: string; skills: string[]; locationName?: string;
    };

    const results: { whatsapp: string; email: string } = { whatsapp: "skipped", email: "skipped" };

    // Send both simultaneously
    const [whatsappResult, emailResult] = await Promise.allSettled([
      // WhatsApp via Twilio
      (async () => {
        const twSid = process.env.TWILIO_ACCOUNT_SID;
        const twToken = process.env.TWILIO_AUTH_TOKEN;
        const twFrom = process.env.TWILIO_WHATSAPP_NUMBER;
        if (!twSid || !twToken || !twFrom || !phone) throw new Error("Twilio not configured");
        const tw = twilio(twSid, twToken);
        await tw.messages.create({
          from: `whatsapp:${twFrom}`,
          to: `whatsapp:${phone}`,
          body: `🙏 Welcome to ResQ, ${name}!\n\nYou are now registered as a volunteer.\n\n✅ Skills: ${skills.join(', ')}\n📍 Location: ${locationName || 'Auto-detect'}\n\nYou will receive WhatsApp alerts when tasks are assigned to you.\n\n— ResQ Team`,
        });
        return "sent";
      })(),
      // Email via Resend
      (async () => {
        if (!email) throw new Error("No email");
        const r = await sendWelcomeEmail(name, email, skills, locationName || "Auto-detect");
        if (!r.success) throw new Error("Email send failed");
        return "sent";
      })(),
    ]);

    results.whatsapp = whatsappResult.status === "fulfilled" ? "sent" : "failed";
    results.email = emailResult.status === "fulfilled" ? "sent" : "failed";

    return NextResponse.json(results);
  } catch (err) {
    console.error("Volunteer notify error:", err);
    return NextResponse.json({ error: "Notification failed" }, { status: 500 });
  }
}
