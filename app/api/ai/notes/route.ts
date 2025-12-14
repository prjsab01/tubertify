import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { studyModel, PROMPTS, generateContent } from '@/lib/gemini'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId, courseContent } = await request.json()

    if (!courseId || !userId || !courseContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if study notes already exist
    const { data: existingNotes } = await supabase
      .from('study_notes')
      .select('*')
      .eq('course_id', courseId)
      .single()

    if (existingNotes) {
      return NextResponse.json({ notes: existingNotes.notes_content })
    }

    // Check AI usage limits
    const today = new Date().toISOString().split('T')[0]

    const { data: usageData } = await supabase
      .from('ai_usage_limits')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('usage_type', 'study_notes')
      .eq('usage_date', today)
      .eq('entity_id', courseId)
      .single()

    if (usageData && usageData.usage_count > 0) {
      return NextResponse.json({ error: 'Study notes already generated for this course' }, { status: 429 })
    }

    // Generate study notes using Gemini
    const prompt = PROMPTS.studyNotes.replace('{courseContent}', courseContent)
    const notes = await generateContent(studyModel, prompt)

    // Save study notes
    const notesData = {
      course_id: courseId,
      notes_content: notes
    }

    await supabase
      .from('study_notes')
      .insert(notesData)

    // Update usage limits
    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: 'study_notes',
        usage_date: today,
        entity_id: courseId,
        usage_count: 1
      })

    // Update AI content flags
    await supabase
      .from('ai_content_flags')
      .upsert({
        entity_type: 'course',
        entity_id: courseId,
        content_type: 'study_notes',
        is_generated: true
      })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Study notes generation error:', error)
    return NextResponse.json({ error: 'Failed to generate study notes' }, { status: 500 })
  }
}