export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import type { Course, Module } from "../../../../lib/types";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
    }

    const courseRef = adminDb.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const course = { id: courseDoc.id, ...courseDoc.data() } as Course;

    const modulesCollectionRef = courseRef.collection("modules");
    const modulesSnapshot = await modulesCollectionRef.orderBy("order").get();
    const modules = modulesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Module));
    course.modules = modules;

    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch course." }, { status: 500 });
  }
}
