import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export async function onRequestPost(context) {
  const { request, env } = context

  // Initialize Gemini client
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY_2)
  const studyModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Create Supabase client
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { courseId, userId, courseContent } = await request.json()

    if (!courseId || !userId || !courseContent) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if test already exists
    const { data: existingTest } = await supabase
      .from('tests')
      .select('*')
      .eq('course_id', courseId)
      .single()

    if (existingTest) {
      return new Response(JSON.stringify({ test: existingTest }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate MCQ test using Gemini
    const prompt = `You are an expert educational assessment creator. Generate a comprehensive multiple-choice test for this course content.

REQUIREMENTS:
- Create exactly 20 questions
- Each question must have 4 options (A, B, C, D)
- Only one correct answer per question
- Include variety: factual, conceptual, and application questions
- Cover different difficulty levels
- Questions should test understanding, not just memorization
- Provide detailed explanations for each correct answer

COURSE CONTENT: ${courseContent}

Return the response as a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct_answer": "A",
    "explanation": "Explanation why this is correct"
  }
]`

    const result = await studyModel.generateContent(prompt)
    const response = await result.response
    const mcqData = response.text()

    // Parse the JSON response
    let questions
    try {
      questions = JSON.parse(mcqData)
    } catch (e) {
      // If JSON parsing fails, create a fallback
      questions = [{
        question: "Sample question?",
        options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        correct_answer: "A",
        explanation: "Sample explanation"
      }]
    }

    // Save test to database
    const testData = {
      course_id: courseId,
      title: 'Course Assessment',
      description: 'Multiple choice test for course completion',
      questions: questions,
      total_questions: questions.length,
      passing_score: 70,
      time_limit_minutes: 30,
      created_by: userId
    }

    const { data: test } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single()

    // Update usage limits
    const today = new Date().toISOString().split('T')[0]

    await supabase
      .from('ai_usage_limits')
      .upsert({
        user_id: userId,
        usage_type: 'mcq_generation',
        usage_date: today,
        entity_id: courseId,
        usage_count: 1
      })

    return new Response(JSON.stringify({ test }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('MCQ generation error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate MCQ test' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}