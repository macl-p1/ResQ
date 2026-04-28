import { extractNeedFromText } from "./lib/gemini";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  try {
    console.log("Testing extractNeedFromText...");
    const result = await extractNeedFromText('Flood in Chennai, 500 families need food and water urgently');
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
