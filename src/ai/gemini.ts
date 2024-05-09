"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI ?? "");

export async function getGeminiVision(prompt: string, base64Image: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  const formatted = base64Image.split(",")[1];
  const image = {
    inlineData: {
      data: formatted,
      mimeType: "image/jpeg",
    },
  };

  const result = await model.generateContent([prompt, image]);
  console.log(result.response.text());
  return result.response.text();
}

export async function getGeminiText(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const result = await model.generateContent([prompt]);
  console.log(result.response.text());
  return result.response.text();
}