import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractYouTubeVideoId, extractYouTubePlaylistId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { url, userId } = await request.json()

    if (!url || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      return NextResponse.json({ 
        error: 'Rate limit exceeded. You can create 1 course per 24 hours.' 
      }, { status: 429 })
    }

    const playlistId = extractYouTubePlaylistId(url)
    const videoId = extractYouTubeVideoId(url)

    if (!playlistId && !videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    let courseData
    let modules = []

    if (playlistId) {
      // Handle playlist
      const playlistInfo = await fetchPlaylistInfo(playlistId)
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
      const videoInfo = await fetchVideoInfo(videoId!)
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

    return NextResponse.json({ course, modules: moduleInserts })
  } catch (error) {
    console.error('Course creation error:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}

async function fetchPlaylistInfo(playlistId: string) {
  // Mock implementation - in production, use YouTube Data API
  return {
    title: `Playlist Course: ${playlistId}`,
    description: 'A comprehensive course created from YouTube playlist',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videos: [
      {
        videoId: 'dQw4w9WgXcQ',
        title: 'Introduction to the Topic',
        description: 'Learn the basics',
        duration: 300
      }
    ]
  }
}

async function fetchVideoInfo(videoId: string) {
  // Mock implementation - in production, use YouTube Data API
  return {
    videoId,
    title: 'Sample Video Course',
    description: 'A course created from a single YouTube video',
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: 600
  }
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