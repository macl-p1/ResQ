import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testGoogleCloud() {
  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATE_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_CLOUD_TRANSLATE_KEY is missing in .env.local");
    return;
  }

  console.log("Testing Google Cloud Translation API...");
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "Hello, this is a test from ResQ!", target: "hi", format: "text" }),
      }
    );

    const data = await res.json();
    if (data.error) {
      throw new Error(`API Error: ${data.error.message}`);
    }

    const translatedText = data.data?.translations?.[0]?.translatedText;
    console.log(`✅ Success! Translated to Hindi: "${translatedText}"`);
    console.log("\n🎉 Your Google Cloud API key is perfectly configured!");
  } catch (error) {
    console.error("\n❌ Google Cloud API test failed:");
    console.error(error);
  }
}

testGoogleCloud();
