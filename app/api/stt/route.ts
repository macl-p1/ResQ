import { NextRequest, NextResponse } from "next/server";
import { getGCloudCredentials } from "@/lib/gcloud-credentials";
import { logVoiceUsed } from "@/lib/analytics";

let _client: any = null;
let _credEmail: string = "";

function getSpeechClient() {
  const creds = getGCloudCredentials();
  if (!creds) throw new Error("No valid Google Cloud credentials found. Check FIREBASE_ADMIN_* or GOOGLE_CLOUD_* env vars.");

  if (_client && _credEmail === creds.client_email) return _client;

  console.log("[STT] Creating client with:", creds.client_email);
  const speech = require("@google-cloud/speech");
  _client = new speech.SpeechClient({ credentials: creds });
  _credEmail = creds.client_email;
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== STT ROUTE HIT ===");
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    console.log("[STT] Audio file:", {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    });

    if (audioFile.size < 100) {
      console.error("[STT] Audio file too small:", audioFile.size, "bytes — likely empty recording");
      return NextResponse.json({ error: "Recording too short. Please speak for at least 2 seconds." }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer).toString("base64");
    console.log("[STT] Audio base64 length:", audioBytes.length);

    const client = getSpeechClient();

    // Try WEBM_OPUS first (Chrome/Edge), fall back to OGG_OPUS (Firefox)
    let response: any;
    try {
      console.log("[STT] Attempting recognize with WEBM_OPUS encoding...");
      [response] = await client.recognize({
        config: {
          encoding: "WEBM_OPUS" as const,
          sampleRateHertz: 48000,
          languageCode: "en-IN",
          alternativeLanguageCodes: ["hi-IN", "ta-IN", "te-IN", "bn-IN"],
          enableAutomaticPunctuation: true,
          model: "latest_long",
          useEnhanced: true,
        },
        audio: { content: audioBytes },
      });
    } catch (firstErr: any) {
      console.warn("[STT] WEBM_OPUS failed:", firstErr.message, "— trying OGG_OPUS fallback...");
      try {
        [response] = await client.recognize({
          config: {
            encoding: "OGG_OPUS" as const,
            sampleRateHertz: 48000,
            languageCode: "en-IN",
            alternativeLanguageCodes: ["hi-IN", "ta-IN", "te-IN", "bn-IN"],
            enableAutomaticPunctuation: true,
            model: "latest_long",
            useEnhanced: true,
          },
          audio: { content: audioBytes },
        });
      } catch (secondErr: any) {
        console.error("[STT] OGG_OPUS also failed:", secondErr.message);
        throw firstErr; // throw original error
      }
    }

    console.log("[STT] Full response:", JSON.stringify(response).substring(0, 500));

    const transcript = response.results
      ?.map((r: any) => r.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(" ") || "";

    const detectedLanguage = response.results?.[0]?.languageCode || "en-IN";
    const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;

    console.log("[STT] Result:", { transcript: transcript.substring(0, 100), detectedLanguage, confidence });

    if (!transcript) {
      console.warn("[STT] No transcript extracted from response");
      return NextResponse.json({
        transcript: "",
        error: "No speech detected. Speak clearly and try again.",
        language: detectedLanguage,
        confidence: 0,
      });
    }

    await logVoiceUsed(detectedLanguage);
    return NextResponse.json({ transcript, language: detectedLanguage, confidence });
  } catch (err: any) {
    console.error("[STT] ❌ Error:", err.message);
    console.error("[STT] Full error:", JSON.stringify(err, null, 2).substring(0, 500));
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
