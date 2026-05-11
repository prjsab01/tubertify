import { NextRequest, NextResponse } from "next/server";
import { fetchPlaylistVideos, parsePlaylistId } from "../../../lib/youtube";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { playlistUrl } = await request.json();

    if (!playlistUrl || typeof playlistUrl !== "string") {
      return NextResponse.json({ error: "playlistUrl is required." }, { status: 400 });
    }

    const playlistId = parsePlaylistId(playlistUrl);
    if (!playlistId) {
      return NextResponse.json({ error: "Invalid YouTube playlist URL." }, { status: 400 });
    }

    const videos = await fetchPlaylistVideos(playlistId);
    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error("Error in playlist API:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch playlist." }, { status: 500 });
  }
}
