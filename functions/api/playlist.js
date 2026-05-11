export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { playlistUrl } = await request.json();

    if (!playlistUrl || typeof playlistUrl !== 'string') {
      return Response.json({ error: 'playlistUrl is required.' }, { status: 400 });
    }

    let playlistId = null;
    try {
      const parsed = new URL(playlistUrl.trim());
      playlistId = parsed.searchParams.get('list');
    } catch {
      return Response.json({ error: 'Invalid YouTube playlist URL.' }, { status: 400 });
    }

    if (!playlistId) {
      return Response.json({ error: 'Invalid YouTube playlist URL.' }, { status: 400 });
    }

    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'YouTube API key not configured.' }, { status: 500 });
    }

    const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${apiKey}`;
    const ytRes = await fetch(ytUrl);
    if (!ytRes.ok) {
      const details = await ytRes.text();
      return Response.json({ error: `YouTube API error: ${details}` }, { status: 502 });
    }

    const data = await ytRes.json();
    if (!data.items || !Array.isArray(data.items)) {
      return Response.json({ error: 'Invalid YouTube playlist response.' }, { status: 502 });
    }

    const videos = data.items.map((item, index) => {
      const snippet = item.snippet || {};
      const youtubeId = snippet.resourceId?.videoId || '';
      const thumbnailUrl = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '';
      return {
        youtubeId,
        title: snippet.title || `Video ${index + 1}`,
        description: snippet.description || '',
        thumbnailUrl,
        playlistPosition: index + 1,
        videoUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      };
    });

    return Response.json({ videos });
  } catch (err) {
    return Response.json({ error: err.message || 'Failed to fetch playlist.' }, { status: 500 });
  }
}
