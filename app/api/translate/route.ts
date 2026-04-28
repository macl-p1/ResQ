export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { logTranslationUsed } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json() as { text: string; targetLang: string };
    if (!text?.trim() || !targetLang) return NextResponse.json({ error: "text and targetLang required" }, { status: 400 });

    const apiKey = process.env.GOOGLE_CLOUD_TRANSLATE_KEY;
    if (!apiKey) return NextResponse.json({ translatedText: text, error: "Translation not configured" }, { status: 200 });

    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target: targetLang, format: "text" }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("Google Translate API Error:", data);
      return NextResponse.json({ error: "Google Translate API Error", details: data }, { status: res.status });
    }

    const translatedText = data.data?.translations?.[0]?.translatedText || text;
    await logTranslationUsed(targetLang);
    return NextResponse.json({ translatedText });
  } catch (err) {
    console.error("Translate error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
