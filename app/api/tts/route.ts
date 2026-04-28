export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getGCloudCredentials } from "@/lib/gcloud-credentials";

let _client: any = null;
let _credEmail: string = "";

function getTTSClient() {
  const creds = getGCloudCredentials();
  if (!creds) throw new Error("No valid Google Cloud credentials found. Check FIREBASE_ADMIN_* or GOOGLE_CLOUD_* env vars.");

  // Recreate client if credentials changed
  if (_client && _credEmail === creds.client_email) return _client;

  console.log("[TTS] Creating client with:", creds.client_email);
  const textToSpeech = require("@google-cloud/text-to-speech");
  _client = new textToSpeech.TextToSpeechClient({ credentials: creds });
  _credEmail = creds.client_email;
  return _client;
}

const VOICE_MAP: Record<string, string> = {
  "en-IN": "en-IN-Wavenet-D",
  "hi-IN": "hi-IN-Wavenet-C",
  "ta-IN": "ta-IN-Wavenet-C",
  "te-IN": "te-IN-Wavenet-D",
  "bn-IN": "bn-IN-Wavenet-B",
};

export async function POST(req: NextRequest) {
  try {
    console.log("=== TTS ROUTE HIT ===");
    const { text, languageCode = "en-IN" } = await req.json() as { text: string; languageCode?: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const truncated = text.substring(0, 500);
    console.log("[TTS] Request:", { text: truncated.substring(0, 60) + "...", languageCode });

    const voiceName = VOICE_MAP[languageCode] || VOICE_MAP["en-IN"];
    console.log("[TTS] Using voice:", voiceName);

    const client = getTTSClient();

    const [response] = await client.synthesizeSpeech({
      input: { text: truncated },
      voice: { languageCode, ssmlGender: "NEUTRAL" as const, name: voiceName },
      audioConfig: {
        audioEncoding: "MP3" as const,
        speakingRate: 0.9,
        pitch: 0,
      },
    });

    if (!response.audioContent) {
      console.error("[TTS] No audioContent in response!");
      return NextResponse.json({ error: "TTS returned no audio" }, { status: 500 });
    }

    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString("base64");
    console.log("[TTS] ✅ Success! Audio base64 length:", audioBase64.length);
    return NextResponse.json({ audio: audioBase64, languageCode });
  } catch (err: any) {
    console.error("[TTS] ❌ Error:", err.message);
    console.error("[TTS] Full error:", JSON.stringify(err, null, 2).substring(0, 500));
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
