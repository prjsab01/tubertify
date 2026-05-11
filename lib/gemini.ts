import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssistantRequest, AssistantResponse } from "./types";

export async function askGemini(request: AssistantRequest, apiKey: string): Promise<AssistantResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Context: ${request.context}\n\nQuestion: ${request.question}`;

  try {
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    return { answer };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { answer: "I couldn't generate an answer." };
  }
}
