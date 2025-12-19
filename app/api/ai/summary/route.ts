import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { summaryModel, PROMPTS, generateContent } from '@/lib/gemini'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { type, entityId, userId, content } = await request.json()

    if (!type || !entityId || !userId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if summary already exists
    const tableName = type === 'video' ? 'video_summaries' : 'course_summaries'
    const idField = type === 'video' ? 'module_id' : 'course_id'

    const { data: existingSummary } = await supabase
      .from(tableName)
      .select('*')
      .eq(idField, entityId)
      .single()

    if (existingSummary) {
      return NextResponse.json({ summary: existingSummary.summary_text || existingSummary.notes_content })
    }

    // Check AI usage limits
    const today = new Date().toISOString().split('T')[0]
    const usageType = type === 'video' ? 'video_summary' : 'course_summary'

    const { data: usageData } = await supabase
      .from('ai_usage_limits')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('usage_type', usageType)
      .eq('usage_date', today)
      .eq('entity_id', entityId)
      .single()

    if (usageData && usageData.usage_count > 0) {
      return NextResponse.json({ error: 'Summary already generated for this item' }, { status: 429 })
    }

    // Generate summary using Gemini
    const prompt = type === 'video' 
      ? PROMPTS.videoSummary.replace('{transcript}', content)
      : PROMPTS.courseSummary.replace('{videoSummaries}', content)

    const summary = await generateContent(summaryModel, prompt)

    // Save summary
    const summaryData = {
      [idField]: entityId,
      [type === 'video' ? 'summary_text' : 'summary_text']: summary
    }

    await supabase
      .from(tableName)
      .insert(summaryData)

    // Update usage limits
    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: usageType,
        usage_date: today,
        entity_id: entityId,
        usage_count: 1
      })

    // Update AI content flags
    await supabase
      .from('ai_content_flags')
      .upsert({
        entity_type: type,
        entity_id: entityId,
        content_type: 'summary',
        is_generated: true
      })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}