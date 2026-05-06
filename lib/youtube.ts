import { VideoMeta } from "./types";

export function parsePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.searchParams.has("list")) {
      return parsed.searchParams.get("list");
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function fetchPlaylistVideos(playlistId: string): Promise<VideoMeta[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY in environment.");
  }

  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(
    playlistId,
  )}&key=${apiKey}`;

  const response = await fetch(playlistUrl);
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`YouTube API error: ${details}`);
  }

  const data = await response.json();
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error("Invalid YouTube playlist response.");
  }

  return data.items.map((item: any, index: number) => {
    const snippet = item.snippet || {};
    const resourceId = snippet.resourceId || {};
    const youtubeId = resourceId.videoId || snippet.videoOwnerChannelId || "";
    const thumbnailUrl = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "";

    return {
      youtubeId,
      title: snippet.title || `Video ${index + 1}`,
      description: snippet.description || "",
      thumbnailUrl,
      playlistPosition: index + 1,
      videoUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    };
  });
}
