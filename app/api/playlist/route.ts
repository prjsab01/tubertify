import { NextRequest, NextResponse } from "next/server";
import { fetchPlaylistVideos, parsePlaylistId } from "../../../lib/youtube";
import { adminDb } from "../../../lib/firebaseAdmin";
import type { Course, Module } from "../../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { playlistUrl, title, ownerId } = data;

    if (!playlistUrl || typeof playlistUrl !== "string") {
      return NextResponse.json({ error: "playlistUrl is required." }, { status: 400 });
    }
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }
    if (!ownerId || typeof ownerId !== "string") {
      return NextResponse.json({ error: "ownerId is required." }, { status: 400 });
    }

    const playlistId = parsePlaylistId(playlistUrl);
    if (!playlistId) {
      return NextResponse.json({ error: "Invalid YouTube playlist URL." }, { status: 400 });
    }

    const videos = await fetchPlaylistVideos(playlistId);

    const newCourse: Omit<Course, "id"> = {
      title,
      ownerId,
      modules: [],
      createdAt: new Date().toISOString(),
      isPublished: false,
    };

    const courseRef = await adminDb.collection("courses").add(newCourse);

    const modulesCollectionRef = courseRef.collection("modules");
    const playlistModule: Omit<Module, "id"> = {
      title: "Module 1",
      order: 1,
      videos: videos,
    };
    await modulesCollectionRef.add(playlistModule);

    return NextResponse.json({ courseId: courseRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to import playlist." }, { status: 500 });
  }
}
