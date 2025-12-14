import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { chatModel, PROMPTS, generateContent } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { userId, question, learningHistory, currentCourse } = await request.json()

    if (!userId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check daily rate limit - 10 questions per 24 hours
    const today = new Date().toISOString().split('T')[0]

    const { data: usageData } = await supabase
      .from('ai_usage_limits')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('usage_type', 'tubibot_chat')
      .eq('usage_date', today)
      .single()

    const currentUsage = usageData?.usage_count || 0

    if (currentUsage >= 10) {
      return NextResponse.json({ 
        error: 'Daily limit reached. You can ask 10 questions per day.' 
      }, { status: 429 })
    }

    // Generate response using Gemini
    const prompt = PROMPTS.tubiBotResponse
      .replace('{learningHistory}', learningHistory || 'No previous learning history')
      .replace('{currentCourse}', currentCourse || 'No current course')
      .replace('{userQuestion}', question)

    const response = await generateContent(chatModel, prompt)

    // Update usage limits
    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: 'tubibot_chat',
        usage_date: today,
        usage_count: currentUsage + 1
      })

    return NextResponse.json({ 
      response,
      remainingQuestions: 9 - currentUsage
    })
  } catch (error) {
    console.error('TubiBot chat error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}