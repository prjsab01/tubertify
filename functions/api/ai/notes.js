import { GoogleGenerativeAI } from '@google/generative-ai'

export async function onRequestPost(context) {
  const { request, env } = context

  // Initialize Gemini client
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY_2)
  const studyModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Create Supabase client (simplified for edge function)
  const supabase = createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const { courseId, userId, courseContent } = await request.json()

    if (!courseId || !userId || !courseContent) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if notes already exist
    const { data: existingNotes } = await supabase
      .from('course_summaries')
      .select('*')
      .eq('course_id', courseId)
      .single()

    if (existingNotes) {
      return new Response(JSON.stringify({ notes: existingNotes.notes_content }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate study notes using Gemini
    const prompt = `You are a study guide expert. Transform this course content into comprehensive study notes.

REQUIREMENTS:
- Organize content into clear sections with headings
- Include key concepts, definitions, and important formulas
- Create bullet points for easy reading
- Add examples where relevant
- Include summary points at the end of each major section
- Use markdown formatting for better readability
- Keep notes between 800-1500 words
- Focus on practical understanding and application

COURSE CONTENT: ${courseContent}

Create detailed, well-structured study notes that will help students learn and retain the material effectively.`

    const result = await studyModel.generateContent(prompt)
    const response = await result.response
    const notes = response.text()

    // Save notes to database
    const notesData = {
      course_id: courseId,
      notes_content: notes,
      created_by: userId
    }

    await supabase
      .from('course_summaries')
      .insert(notesData)

    // Update usage limits
    const today = new Date().toISOString().split('T')[0]

    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: 'study_notes',
        usage_date: today,
        entity_id: courseId,
        usage_count: 1
      })

    return new Response(JSON.stringify({ notes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Study notes generation error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate study notes' }), {
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