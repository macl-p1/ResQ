import { NextRequest, NextResponse } from "next/server";
import { getGCloudCredentials } from "@/lib/gcloud-credentials";
import { logOcrUsed } from "@/lib/analytics";

let _client: any = null;
let _credEmail: string = "";

function getVisionClient() {
  const creds = getGCloudCredentials();
  if (!creds) throw new Error("No valid Google Cloud credentials found. Check FIREBASE_ADMIN_* or GOOGLE_CLOUD_* env vars.");

  if (_client && _credEmail === creds.client_email) return _client;

  console.log("[OCR] Creating Vision client with:", creds.client_email);
  const vision = require("@google-cloud/vision");
  _client = new vision.ImageAnnotatorClient({ credentials: creds });
  _credEmail = creds.client_email;
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== OCR ROUTE HIT ===");
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    console.log("[OCR] Image file:", {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
    });

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Photo too large. Please use a photo under 10MB." }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBytes = Buffer.from(arrayBuffer).toString("base64");
    console.log("[OCR] Image base64 length:", imageBytes.length);

    const client = getVisionClient();

    console.log("[OCR] Calling documentTextDetection...");
    const [result] = await client.documentTextDetection({
      image: { content: imageBytes },
    });

    const text = result.fullTextAnnotation?.text || "";
    const confidence = result.fullTextAnnotation?.pages?.[0]?.confidence || 0;

    console.log("[OCR] Result:", {
      textLength: text.length,
      textPreview: text.substring(0, 100),
      confidence: Math.round(confidence * 100) + "%",
    });

    if (!text) {
      console.warn("[OCR] No text detected in image");
      return NextResponse.json({
        text: "",
        confidence: 0,
        error: "No text detected in this image. Try a clearer photo of printed text.",
      });
    }

    await logOcrUsed(confidence);
    return NextResponse.json({ text, confidence: Math.round(confidence * 100) });
  } catch (err: any) {
    console.error("[OCR] ❌ Error:", err.message);
    console.error("[OCR] Full error:", JSON.stringify(err, null, 2).substring(0, 500));
    return NextResponse.json({ error: `OCR processing failed: ${err.message}` }, { status: 500 });
  }
}
