import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export async function onRequestPost(context) {
  const { request, env } = context

  // Initialize Gemini client
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY_3)
  const chatModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Create Supabase client
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { userId, question, learningHistory, currentCourse } = await request.json()

    if (!userId || !question) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
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
      return new Response(JSON.stringify({
        error: 'Daily limit reached. You can ask 10 questions per day.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate response using Gemini
    const prompt = `You are TubiBot, an AI learning assistant for Tubertify. You help learners with their studies in a friendly, encouraging way.

CONTEXT:
- User's learning history: ${learningHistory || 'No previous learning history'}
- Current course: ${currentCourse || 'No current course'}
- User question: ${question}

GUIDELINES:
- Be encouraging and supportive
- Provide clear, actionable advice
- Reference their learning progress when relevant
- Suggest specific study strategies
- Keep responses concise but helpful
- If question is off-topic, gently redirect to learning
- Use a warm, mentor-like tone

Respond to the user's question while staying focused on their learning journey.`

    const result = await chatModel.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    // Update usage limits
    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: 'tubibot_chat',
        usage_date: today,
        usage_count: currentUsage + 1
      })

    return new Response(JSON.stringify({
      response: aiResponse,
      remainingQuestions: 9 - currentUsage
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('TubiBot chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}