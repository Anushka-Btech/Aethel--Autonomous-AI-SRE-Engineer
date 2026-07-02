import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello in one sentence.",
    });

    console.log("✅ Success!");
    console.log(response.text);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

test();