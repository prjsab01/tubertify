import { GoogleGenerativeAI } from '@google/generative-ai'

export async function onRequestPost(context) {
  const { request, env } = context

  // Initialize Gemini client
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY_1)
  const summaryModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Create Supabase client (simplified for edge function)
  const supabase = createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const { type, entityId, userId, content } = await request.json()

    if (!type || !entityId || !userId || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
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
      return new Response(JSON.stringify({
        summary: existingSummary.summary_text || existingSummary.notes_content
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate summary using Gemini
    const prompt = type === 'video'
      ? `You are an expert educational content analyzer. Create a comprehensive summary of this YouTube video transcript.

REQUIREMENTS:
- Extract key learning points and concepts
- Organize information hierarchically
- Include practical examples mentioned
- Highlight important definitions or formulas
- Keep summary between 200-400 words
- Use clear, educational language
- Focus on actionable insights

TRANSCRIPT: ${content}

Provide a well-structured summary that helps learners understand the core concepts.`
      : `You are an educational course designer. Create a comprehensive course summary from the provided video summaries.

REQUIREMENTS:
- Synthesize all video content into cohesive learning path
- Identify main learning objectives
- Highlight prerequisite knowledge
- Suggest practical applications
- Include difficulty assessment
- Keep summary between 300-500 words
- Structure as: Overview, Key Topics, Learning Outcomes, Prerequisites

VIDEO SUMMARIES: ${content}

Create a course summary that gives learners clear expectations.`

    const result = await summaryModel.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    // Save summary to database
    const summaryData = type === 'video'
      ? { module_id: entityId, summary_text: summary, created_by: userId }
      : { course_id: entityId, notes_content: summary, created_by: userId }

    await supabase
      .from(tableName)
      .insert(summaryData)

    // Update usage limits
    const today = new Date().toISOString().split('T')[0]
    const usageType = type === 'video' ? 'video_summary' : 'course_summary'

    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: usageType,
        usage_date: today,
        entity_id: entityId,
        usage_count: 1
      })

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('AI summary error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Simplified Supabase client for edge functions
function createSupabaseClient(supabaseUrl, serviceRoleKey) {
  return {
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          single: async () => {
            // This is a simplified implementation
            // In production, you'd use the actual Supabase client
            return { data: null, error: null }
          }
        })
      }),
      insert: (data) => ({
        // Simplified insert implementation
        then: (callback) => callback({ error: null })
      }),
      upsert: (data) => ({
        // Simplified upsert implementation
        then: (callback) => callback({ error: null })
      })
    })
  }
}