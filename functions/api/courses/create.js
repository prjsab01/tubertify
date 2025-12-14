import { createClient } from '@supabase/supabase-js'
import { extractYouTubeVideoId, extractYouTubePlaylistId } from '../../lib/utils'

interface VideoInfo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  duration: number
}

export async function onRequestPost(context) {
  const { request, env } = context

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { url, userId } = await request.json()

    if (!url || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check rate limit - 1 course per 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('created_by', userId)
      .gte('created_at', yesterday.toISOString())

    if (recentCourses && recentCourses.length > 0) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. You can create 1 course per 24 hours.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const playlistId = extractYouTubePlaylistId(url)
    const videoId = extractYouTubeVideoId(url)

    if (!playlistId && !videoId) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let courseData
    let modules: VideoInfo[] = []

    if (playlistId) {
      // Handle playlist
      const playlistInfo = await fetchPlaylistInfo(playlistId, env.YOUTUBE_API_KEY)
      courseData = {
        title: playlistInfo.title,
        description: playlistInfo.description,
        youtube_playlist_id: playlistId,
        thumbnail_url: playlistInfo.thumbnail,
        tags: extractTags(playlistInfo.title + ' ' + playlistInfo.description),
        created_by: userId,
        total_modules: playlistInfo.videos.length
      }
      modules = playlistInfo.videos
    } else {
      // Handle single video
      const videoInfo = await fetchVideoInfo(videoId!, env.YOUTUBE_API_KEY)
      courseData = {
        title: videoInfo.title,
        description: videoInfo.description,
        youtube_url: url,
        thumbnail_url: videoInfo.thumbnail,
        tags: extractTags(videoInfo.title + ' ' + videoInfo.description),
        created_by: userId,
        total_modules: 1
      }
      modules = [videoInfo]
    }

    // Create course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single()

    if (courseError) {
      throw courseError
    }

    // Create modules
    const moduleInserts = modules.map((video, index) => ({
      course_id: course.id,
      title: video.title,
      description: video.description,
      youtube_video_id: video.videoId,
      duration_seconds: video.duration,
      module_order: index + 1
    }))

    const { error: modulesError } = await supabase
      .from('course_modules')
      .insert(moduleInserts)

    if (modulesError) {
      throw modulesError
    }

    return new Response(JSON.stringify({ course, modules: moduleInserts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Course creation error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create course' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function fetchPlaylistInfo(playlistId: string, apiKey: string): Promise<{
  title: string
  description: string
  thumbnail: string
  videos: VideoInfo[]
}> {
  // Fetch playlist details
  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
  )

  if (!playlistResponse.ok) {
    throw new Error('Failed to fetch playlist information')
  }

  const playlistData = await playlistResponse.json()

  if (!playlistData.items || playlistData.items.length === 0) {
    throw new Error('Playlist not found')
  }

  const playlist = playlistData.items[0].snippet

  // Fetch playlist items (videos)
  const itemsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
  )

  if (!itemsResponse.ok) {
    throw new Error('Failed to fetch playlist videos')
  }

  const itemsData = await itemsResponse.json()

  const videos: VideoInfo[] = itemsData.items.map((item: any) => ({
    videoId: item.contentDetails.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || '',
    duration: 0 // Will be fetched separately if needed
  }))

  return {
    title: playlist.title,
    description: playlist.description,
    thumbnail: playlist.thumbnails?.maxres?.url || playlist.thumbnails?.high?.url,
    videos
  }
}

async function fetchVideoInfo(videoId: string, apiKey: string): Promise<VideoInfo> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch video information')
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found')
  }

  const video = data.items[0]
  const snippet = video.snippet
  const contentDetails = video.contentDetails

  // Parse duration (ISO 8601 format)
  const duration = parseDuration(contentDetails.duration)

  return {
    videoId,
    title: snippet.title,
    description: snippet.description,
    thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url,
    duration
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 3600 + minutes * 60 + seconds
}

function extractTags(text: string): string[] {
  const commonTags = [
    'programming', 'tutorial', 'education', 'technology', 'web development',
    'javascript', 'python', 'react', 'nodejs', 'css', 'html', 'database',
    'machine learning', 'ai', 'data science', 'business', 'marketing'
  ]

  const lowerText = text.toLowerCase()
  return commonTags.filter(tag => lowerText.includes(tag)).slice(0, 5)
}