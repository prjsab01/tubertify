import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssistantRequest, AssistantResponse } from "./types";

export async function askGemini(request: AssistantRequest, apiKey: string): Promise<AssistantResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Context: ${request.context}

Question: ${request.question}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = await response.text();
    return { answer };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { answer: "I couldn't generate an answer." };
  }
}
