import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "../../../lib/gemini";
import {
  saveAINotes,
  checkAndIncrementUsage,
  getAINotesForVideo,
} from "../../../lib/firestore-tubertify";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, courseId, moduleId, videoId, title, transcript } = data;

    if (!userId || !courseId || !moduleId || !videoId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, courseId, moduleId, videoId" },
        { status: 400 }
      );
    }

    // Check if notes already exist
    const existing = await getAINotesForVideo(courseId, moduleId, videoId);
    if (existing) {
      return NextResponse.json({ notes: existing, cached: true });
    }

    // Check rate limit: 5 notes per day
    const canGenerate = await checkAndIncrementUsage(userId, "notes", 5);
    if (!canGenerate) {
      return NextResponse.json(
        { error: "Daily limit reached for AI notes. Try again tomorrow." },
        { status: 429 }
      );
    }

    // Generate notes via AI
    const context = `Video Title: ${title}\n\nTranscript:\n${transcript || "No transcript available"}`;
    const prompt = `Generate comprehensive study notes for this video. Include:
1. A concise summary (2-3 sentences)
2. 5-7 key points (bullet list)
3. Important concepts and terms

Format as JSON with fields: summary, keyPoints, concepts`;

    const result = await askGemini({ question: prompt, context }, process.env.GEMINI_API_KEY_1!);

    // Parse the AI response
    let parsedNotes = {
      summary: "",
      keyPoints: [] as string[],
      concepts: [] as string[],
    };

    try {
      const jsonMatch = result.answer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedNotes = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      parsedNotes = {
        summary: result.answer,
        keyPoints: [],
        concepts: [],
      };
    }

    // Save to Firestore
    const notesId = await saveAINotes({
      courseId,
      moduleId,
      videoId,
      ...parsedNotes,
    });

    return NextResponse.json({
      id: notesId,
      notes: parsedNotes,
      cached: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate notes." },
      { status: 500 }
    );
  }
}
