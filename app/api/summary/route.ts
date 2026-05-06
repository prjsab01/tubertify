import { NextRequest, NextResponse } from "next/server";
import { generateSummaryWithOpenAI } from "../../../lib/openai";
import { checkAndIncrementUsage } from "../../../lib/firestore-tubertify";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, content, title } = data;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required and must be a string." },
        { status: 400 }
      );
    }
    if (content.length < 100) {
      return NextResponse.json(
        { error: "content must be at least 100 characters." },
        { status: 400 }
      );
    }

    // Check rate limit: 5 summaries per day
    const canGenerate = await checkAndIncrementUsage(userId, "summary", 5);
    if (!canGenerate) {
      return NextResponse.json(
        { error: "Daily summary limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    const summary = await generateSummaryWithOpenAI(content);

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate summary." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title: title || "Summary",
      original_length: content.length,
      summary,
      summary_length: summary.length,
    });
  } catch (error: any) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: error.message || "Summary generation failed." },
      { status: 500 }
    );
  }
}
