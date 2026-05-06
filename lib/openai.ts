import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CompletionRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  content: string;
  tokensUsed: number;
}

export async function getOpenAICompletion(
  request: CompletionRequest
): Promise<CompletionResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: request.prompt,
        },
      ],
      max_tokens: request.maxTokens || 500,
      temperature: request.temperature || 0.7,
    });

    const content =
      response.choices[0]?.message?.content || "No response generated";
    const tokensUsed = response.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export async function generateQuizWithOpenAI(
  topic: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<any[]> {
  const prompt = `Generate 5 multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.
Format as JSON array with objects containing: question, options (array of 4 strings), correctAnswer (index 0-3), explanation`;

  try {
    const response = await getOpenAICompletion({
      prompt,
      maxTokens: 1000,
      temperature: 0.8,
    });

    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Quiz generation error:", error);
    return [];
  }
}

export async function generateSummaryWithOpenAI(content: string): Promise<string> {
  const prompt = `Create a concise summary (2-3 paragraphs) of the following content:\n\n${content}`;

  try {
    const response = await getOpenAICompletion({
      prompt,
      maxTokens: 300,
      temperature: 0.5,
    });

    return response.content;
  } catch (error) {
    console.error("Summary generation error:", error);
    return "";
  }
}
