import { GoogleGenerativeAI } from "@google/generative-ai";

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  // The SDK doesn't expose listModels directly easily, let's use fetch.
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`);
  const data = await response.json();
  console.log(data.models.map((m: any) => m.name));
}

list();
