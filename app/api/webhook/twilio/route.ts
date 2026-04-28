import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { isDemoMode, demoStore } from "@/lib/demo-store";
import { adminDb } from "@/lib/firebase-admin";
import { extractNeedFromText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "";

    // Validate Twilio signature
    if (accountSid && authToken) {
      const twilioSignature = req.headers.get("x-twilio-signature") || "";
      const url = req.url;
      const formText = await req.text();
      const params = Object.fromEntries(new URLSearchParams(formText));
      const isValid = twilio.validateRequest(authToken, twilioSignature, url, params);
      if (!isValid && process.env.NODE_ENV !== "development") return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 403 });
      const body = params["Body"] || "";
      const from = params["From"] || "";
      const phone = from.replace("whatsapp:", "");

      // Extract and save
      const hasGeminiKey = !!(process.env.GOOGLE_GEMINI_API_KEY?.trim());
      let extracted;
      if (hasGeminiKey) { extracted = await extractNeedFromText(body); }
      else { extracted = demoStore.simpleExtract(body); }

      if (isDemoMode()) {
        demoStore.addNeed({ ...extracted, raw_text: body, status: "pending", report_count: 1, source: "whatsapp", ai_reasoning: null });
      } else {
        await adminDb.collection("needs").add({ ...extracted, raw_text: body, status: "pending", report_count: 1, source: "whatsapp", created_at: new Date(), ai_reasoning: null });
      }

      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>✅ ResQ received your report from ${phone}. Need type: ${extracted.need_type}, Urgency: ${extracted.urgency_score}/100. A coordinator has been notified.</Message></Response>`;
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    // Demo mode without Twilio creds
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>ResQ received your report.</Message></Response>`, { headers: { "Content-Type": "text/xml" } });
  } catch (err) {
    console.error("Twilio webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
