import { NextRequest, NextResponse } from "next/server";
import { generateQuizWithOpenAI } from "../../../lib/openai";
import { checkAndIncrementUsage } from "../../../lib/firestore-tubertify";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, topic, difficulty } = data;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "topic is required." }, { status: 400 });
    }
    if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "difficulty must be 'easy', 'medium', or 'hard'." },
        { status: 400 }
      );
    }

    // Check rate limit: 3 quizzes per day
    const canGenerate = await checkAndIncrementUsage(userId, "quiz", 3);
    if (!canGenerate) {
      return NextResponse.json(
        { error: "Daily quiz limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    const questions = await generateQuizWithOpenAI(topic, difficulty);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate quiz questions." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      topic,
      difficulty,
      questions,
      count: questions.length,
    });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: error.message || "Quiz generation failed." },
      { status: 500 }
    );
  }
}
