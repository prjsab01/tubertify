import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini clients with different API keys for usage separation
const genAI1 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1!)
const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2!)
const genAI3 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_3!)

// API Key 1: Course & Video Summaries
export const summaryModel = genAI1.getGenerativeModel({ model: 'gemini-pro' })

// API Key 2: Study Notes & MCQ Generation
export const studyModel = genAI2.getGenerativeModel({ model: 'gemini-pro' })

// API Key 3: TubiBot Chat
export const chatModel = genAI3.getGenerativeModel({ model: 'gemini-pro' })

export const PROMPTS = {
  videoSummary: `You are an expert educational content analyzer. Create a comprehensive summary of this YouTube video transcript.

REQUIREMENTS:
- Extract key learning points and concepts
- Organize information hierarchically
- Include practical examples mentioned
- Highlight important definitions or formulas
- Keep summary between 200-400 words
- Use clear, educational language
- Focus on actionable insights

TRANSCRIPT: {transcript}

Provide a well-structured summary that helps learners understand the core concepts.`,

  courseSummary: `You are an educational course designer. Create a comprehensive course summary from the provided video summaries.

REQUIREMENTS:
- Synthesize all video content into cohesive learning path
- Identify main learning objectives
- Highlight prerequisite knowledge
- Suggest practical applications
- Include difficulty assessment
- Keep summary between 300-500 words
- Structure as: Overview, Key Topics, Learning Outcomes, Prerequisites

VIDEO SUMMARIES: {videoSummaries}

Create a course summary that gives learners clear expectations.`,

  studyNotes: `You are a study guide expert. Transform this course content into comprehensive study notes.

REQUIREMENTS:
- Create structured, scannable notes
- Use bullet points and numbered lists
- Include key terms and definitions
- Add memory aids and mnemonics where helpful
- Organize by topics/modules
- Include quick review sections
- Format for easy revision
- Keep between 400-600 words

COURSE CONTENT: {courseContent}

Generate study notes optimized for learning and retention.`,

  mcqGeneration: `You are an expert test creator. Generate 20 multiple-choice questions from this course content.

REQUIREMENTS:
- Mix of difficulty levels (30% easy, 50% medium, 20% hard)
- Cover all major topics proportionally
- 4 options per question (A, B, C, D)
- Only one correct answer per question
- Avoid trick questions or ambiguous wording
- Include application-based questions, not just recall
- Provide brief explanations for correct answers

COURSE CONTENT: {courseContent}

Return as JSON array with format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Brief explanation",
      "difficulty": "easy|medium|hard"
    }
  ]
}`,

  tubiBotResponse: `You are TubiBot, an AI learning assistant for Tubertify. You help learners with their studies in a friendly, encouraging way.

CONTEXT:
- User's learning history: {learningHistory}
- Current course: {currentCourse}
- User question: {userQuestion}

GUIDELINES:
- Be encouraging and supportive
- Provide clear, actionable advice
- Reference their learning progress when relevant
- Suggest specific study strategies
- Keep responses concise but helpful
- If question is off-topic, gently redirect to learning
- Use a warm, mentor-like tone

Respond to the user's question while staying focused on their learning journey.`
}

export async function generateContent(
  model: typeof summaryModel | typeof studyModel | typeof chatModel,
  prompt: string
): Promise<string> {
  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate content')
  }
}