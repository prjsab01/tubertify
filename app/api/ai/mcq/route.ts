import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { studyModel, PROMPTS, generateContent } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { courseId, userId, courseContent } = await request.json()

    if (!courseId || !userId || !courseContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if test already exists
    const { data: existingTest } = await supabase
      .from('tests')
      .select('*')
      .eq('course_id', courseId)
      .single()

    if (existingTest) {
      return NextResponse.json({ test: existingTest })
    }

    // Check AI usage limits
    const today = new Date().toISOString().split('T')[0]

    const { data: usageData } = await supabase
      .from('ai_usage_limits')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('usage_type', 'mcq_generation')
      .eq('usage_date', today)
      .eq('entity_id', courseId)
      .single()

    if (usageData && usageData.usage_count > 0) {
      return NextResponse.json({ error: 'MCQ test already generated for this course' }, { status: 429 })
    }

    // Generate MCQ using Gemini
    const prompt = PROMPTS.mcqGeneration.replace('{courseContent}', courseContent)
    const mcqResponse = await generateContent(studyModel, prompt)

    let questions
    try {
      const parsed = JSON.parse(mcqResponse)
      questions = parsed.questions || parsed
    } catch {
      // Fallback parsing if JSON is malformed
      questions = generateFallbackQuestions()
    }

    // Validate questions format
    if (!Array.isArray(questions) || questions.length !== 20) {
      questions = generateFallbackQuestions()
    }

    // Create test
    const testData = {
      course_id: courseId,
      questions: questions,
      passing_score: 80,
      time_limit_minutes: 30
    }

    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single()

    if (testError) {
      throw testError
    }

    // Update usage limits
    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: 'mcq_generation',
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
        content_type: 'mcq',
        is_generated: true
      })

    return NextResponse.json({ test })
  } catch (error) {
    console.error('MCQ generation error:', error)
    return NextResponse.json({ error: 'Failed to generate MCQ test' }, { status: 500 })
  }
}

function generateFallbackQuestions() {
  return Array.from({ length: 20 }, (_, i) => ({
    question: `Sample question ${i + 1} about the course content?`,
    options: [
      "A) First option",
      "B) Second option", 
      "C) Third option",
      "D) Fourth option"
    ],
    correctAnswer: "A",
    explanation: "This is a sample explanation for the correct answer.",
    difficulty: i < 6 ? "easy" : i < 14 ? "medium" : "hard"
  }))
}