import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "../../../lib/gemini";
import { checkAndIncrementUsage } from "../../../lib/firestore-tubertify";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, question, context } = data;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question is required." }, { status: 400 });
    }

    const canAsk = await checkAndIncrementUsage(userId, "assistant", 10);
    if (!canAsk) {
      return NextResponse.json(
        { error: "Daily limit reached for AI assistant. Try again tomorrow." },
        { status: 429 }
      );
    }

    const result = await askGemini({ question, context: context || "" });
    return NextResponse.json({ answer: result.answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Assistant request failed." }, { status: 500 });
  }
}
