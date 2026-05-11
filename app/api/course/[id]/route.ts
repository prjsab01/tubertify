import { NextRequest, NextResponse } from "next/server";
import { getCourseWithModules } from "../../../../lib/firestoreClient";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
    }

    const course = await getCourseWithModules(courseId);

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    console.error("Error in course API:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch course." }, { status: 500 });
  }
}
