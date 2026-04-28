import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from '@/lib/email';
import { extractNeedFromText } from '@/lib/gemini';
import { printCredentialDiagnostics, getGCloudCredentials } from '@/lib/gcloud-credentials';

export async function GET(request: Request) {
  console.log('\n=== TEST-ALL ROUTE HIT ===');
  const results: any = {};
  const baseUrl = new URL(request.url).origin;

  // Print credential diagnostics
  const credDiag = printCredentialDiagnostics();
  console.log('[test-all] Credentials:', JSON.stringify(credDiag, null, 2));
  results.credentials = credDiag;

  // Test TTS
  console.log('\n--- Testing TTS ---');
  try {
    const ttsRes = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello, this is a ResQ system test.', languageCode: 'en-IN' })
    });
    const ttsData = await ttsRes.json();
    if (ttsData.audio) {
      results.tts = `✅ Working — audio ${ttsData.audio.length} chars`;
    } else {
      results.tts = `❌ Failed: ${ttsData.error}`;
    }
  } catch (e: any) {
    results.tts = `❌ Error: ${e.message}`;
  }
  console.log('[test-all] TTS:', results.tts);

  // Test Gemini
  console.log('\n--- Testing Gemini ---');
  try {
    const extracted = await extractNeedFromText('Flood in Mumbai, 500 families need food and water urgently');
    results.gemini = extracted.need_type ? `✅ Working — extracted: ${extracted.need_type}` : '❌ Failed — no need_type';
  } catch (e: any) {
    results.gemini = `❌ Error: ${e.message}`;
  }
  console.log('[test-all] Gemini:', results.gemini);

  // Test Email
  console.log('\n--- Testing Email ---');
  try {
    await sendTestEmail('shivanshgangwar655@gmail.com');
    results.email = '✅ Working — check inbox';
  } catch (e: any) {
    results.email = `❌ Error: ${e.message}`;
  }
  console.log('[test-all] Email:', results.email);

  // Test OCR (using a tiny 1x1 PNG — just validates credentials, won't extract text)
  console.log('\n--- Testing OCR (Vision API credentials) ---');
  try {
    const creds = getGCloudCredentials();
    if (!creds) throw new Error('No valid credentials');
    const vision = require("@google-cloud/vision");
    const client = new vision.ImageAnnotatorClient({ credentials: creds });
    // Use a minimal valid PNG to test the API connection
    // 1x1 white pixel PNG
    const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const [result] = await client.documentTextDetection({
      image: { content: minimalPng },
    });
    results.ocr = '✅ Working — Vision API connected';
  } catch (e: any) {
    results.ocr = `❌ Error: ${e.message}`;
  }
  console.log('[test-all] OCR:', results.ocr);

  // Test STT (just validate the client creates successfully)
  console.log('\n--- Testing STT (Speech API credentials) ---');
  try {
    const creds = getGCloudCredentials();
    if (!creds) throw new Error('No valid credentials');
    const speech = require("@google-cloud/speech");
    const client = new speech.SpeechClient({ credentials: creds });
    // Just test that we can create the client without error
    results.stt = '✅ Client created — ready for audio input';
  } catch (e: any) {
    results.stt = `❌ Error: ${e.message}`;
  }
  console.log('[test-all] STT:', results.stt);

  console.log('\n=== TEST-ALL COMPLETE ===\n');
  return Response.json(results);
}
