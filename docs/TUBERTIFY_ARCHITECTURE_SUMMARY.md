# ⚠️ LEGACY DOCUMENTATION - SUPABASE MIGRATION ANALYSIS

> **IMPORTANT**: This document contains historical information about the Supabase migration. The project has been fully migrated to Firebase Firestore. For current architecture details, see the main README.md and current codebase.

# Tubertify - Complete Architecture & Legacy Supabase Migration Analysis

## Executive Summary

**Tubertify** is a production-ready AI-powered YouTube learning platform that transforms videos/playlists into structured courses with AI-generated content, interactive tests, gamification, and an AI learning assistant.

**Repository**: https://github.com/prjsab01/tubertify  
**Status**: Deployed on Cloudflare Pages (Last updated 5 months ago)

---

## 1. Project Purpose & Core Features

### Primary Purpose
Convert YouTube videos and playlists into structured, gamified learning courses with AI-powered study aids.

### Core Features
1. **AI-Powered Course Creation** - Import YouTube playlists, auto-generate course structure
2. **Smart Summaries** - AI-generated video and course summaries via Google Gemini
3. **Interactive Tests** - 20-question MCQ tests with 30-minute timer, auto-generated
4. **Study Notes** - AI-generated study materials and learning guides
5. **TubiBot** - AI learning assistant (10 questions/day limit)
6. **Gamification**
   - Points system (login, video completion, course completion, test passing)
   - Streak tracking with calendar view
   - Achievements and milestones
   - Course unlocking via points
7. **Certificates** - Downloadable PDF upon course completion
8. **Digital Library** - Curated books and resources
9. **PWA Features** - Offline capability, installable on mobile/desktop

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark theme
- **UI Components**: ShadCN/UI
- **Animations**: Framer Motion
- **State Management**: React Context API (built-in providers)
- **PWA**: Native PWA support with manifest.json

### Backend & APIs
- **Runtime**: Node.js (Next.js API routes on edge runtime)
- **API Patterns**: RESTful endpoints
- **Request/Response**: JSON

### Database & Authentication
- **Database**: Firebase Firestore
- **Auth Provider**: Firebase Authentication
- **Security**: Firestore Security Rules
- **Service Layer**: Firebase Admin SDK and Firestore client

### AI & External APIs
- **AI Model**: Google Gemini API (gemini-pro)
- **AI Separation**: 3 different API keys for usage tracking
  - **Key 1**: Video/Course summaries
  - **Key 2**: Study notes & MCQ generation
  - **Key 3**: TubiBot chat
- **Video Data**: YouTube Data API v3

### Hosting & Deployment
- **Hosting**: Cloudflare Pages
- **Repository**: GitHub
- **Build**: Next.js build system
- **Database Host**: Firebase Firestore

---

## 3. Database Schema & Data Models

### 3.1 Core User & Profile Tables

#### `profiles` (User profiles with gamification)
```sql
- id (UUID, PK, FK to auth.users)
- email (VARCHAR)
- full_name, display_name, avatar_url (TEXT)
- role ('learner' | 'admin')
- learning_goals, preferred_topics (TEXT arrays)
- time_commitment (VARCHAR)
- total_points, current_streak, longest_streak (INTEGER)
- last_login_date (DATE)
- created_at, updated_at (TIMESTAMP)
```

#### `app_config` (System configuration)
```sql
- id (UUID, PK)
- key (VARCHAR, UNIQUE) - 'admin_email_hash'
- value (TEXT)
- created_at, updated_at
```

### 3.2 Course & Content Tables

#### `courses` (Course metadata)
```sql
- id (UUID, PK)
- title, description (TEXT)
- youtube_url, youtube_playlist_id (VARCHAR)
- thumbnail_url (TEXT)
- duration_minutes, total_modules (INTEGER)
- tags (TEXT array)
- difficulty_level ('beginner' | 'intermediate' | 'advanced')
- created_by (UUID, FK to profiles)
- is_featured, is_admin_created (BOOLEAN)
- unlock_points (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

#### `course_modules` (Individual videos/lessons)
```sql
- id (UUID, PK)
- course_id (UUID, FK)
- title, description (TEXT)
- youtube_video_id (VARCHAR)
- duration_seconds (INTEGER)
- module_order (INTEGER) - For ordering videos
- created_at (TIMESTAMP)
```

#### `course_progress` (User progress per course)
```sql
- id (UUID, PK)
- user_id, course_id (UUID, FK)
- status ('not_started' | 'in_progress' | 'completed')
- progress_percentage (DECIMAL)
- last_watched_module_id (UUID, FK)
- started_at, completed_at (TIMESTAMP)
- UNIQUE(user_id, course_id)
```

#### `video_progress` (Detailed video watch tracking)
```sql
- id (UUID, PK)
- user_id, module_id (UUID, FK)
- watched_seconds (INTEGER)
- is_completed (BOOLEAN)
- last_watched_at (TIMESTAMP)
- UNIQUE(user_id, module_id)
```

### 3.3 Testing & Assessment Tables

#### `tests` (MCQ test definitions)
```sql
- id (UUID, PK)
- course_id (UUID, FK)
- questions (JSONB) - Array of question objects
- passing_score (INTEGER, DEFAULT 80)
- time_limit_minutes (INTEGER, DEFAULT 30)
- created_at (TIMESTAMP)
```

#### `test_attempts` (User test submissions)
```sql
- id (UUID, PK)
- user_id, test_id, course_id (UUID, FK)
- answers (JSONB) - User's answers
- score, passed (INTEGER, BOOLEAN)
- started_at, completed_at (TIMESTAMP)
- time_taken_minutes (INTEGER)
```

#### `certificates` (Issue certificates)
```sql
- id (UUID, PK)
- user_id, course_id (UUID, FK)
- certificate_url (TEXT)
- issued_at (TIMESTAMP)
- UNIQUE(user_id, course_id)
```

### 3.4 AI & Content Tables

#### `ai_usage_limits` (Rate limiting for AI features)
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- usage_type (VARCHAR) - 'video_summary', 'course_summary', 'study_notes', 'mcq_generation', 'tubibot_chat'
- usage_date (DATE)
- usage_count (INTEGER, DEFAULT 0)
- entity_id (UUID) - Specific video/course ID
- UNIQUE(user_id, usage_type, usage_date, entity_id)
```

#### `ai_content_flags` (Track generated content)
```sql
- id (UUID, PK)
- entity_type (VARCHAR) - 'video', 'course'
- entity_id (UUID)
- content_type (VARCHAR) - 'summary', 'study_notes', 'mcq'
- is_generated (BOOLEAN)
- UNIQUE(entity_type, entity_id, content_type)
```

#### `course_summaries` (AI-generated course summaries)
```sql
- id (UUID, PK)
- course_id (UUID, FK, UNIQUE)
- summary_text (TEXT)
- created_at (TIMESTAMP)
```

#### `video_summaries` (AI-generated video summaries)
```sql
- id (UUID, PK)
- module_id (UUID, FK, UNIQUE)
- summary_text (TEXT)
- created_at (TIMESTAMP)
```

#### `study_notes` (AI-generated study materials)
```sql
- id (UUID, PK)
- course_id (UUID, FK, UNIQUE)
- notes_content (TEXT)
- created_at (TIMESTAMP)
```

### 3.5 User Engagement & Social Tables

#### `bookmarks` (User bookmarks for courses/videos)
```sql
- id (UUID, PK)
- user_id, course_id, module_id (UUID, FK)
- bookmark_type ('course' | 'video')
- created_at (TIMESTAMP)
- UNIQUE(user_id, course_id, module_id)
```

#### `wishlists` (Course wishlists)
```sql
- id (UUID, PK)
- user_id, course_id (UUID, FK)
- created_at (TIMESTAMP)
- UNIQUE(user_id, course_id)
```

#### `login_streaks` (Daily login tracking)
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- login_date (DATE)
- streak_count (INTEGER, DEFAULT 1)
- created_at (TIMESTAMP)
- UNIQUE(user_id, login_date)
```

#### `points_ledger` (Immutable points transaction log)
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- points_delta (INTEGER) - Points added/removed
- reason (VARCHAR) - 'daily_login', 'video_completion', 'course_completion', 'test_pass', 'streak_bonus'
- related_entity_type, related_entity_id (VARCHAR, UUID)
- created_at (TIMESTAMP)
```

### 3.6 Library & Resources Tables

#### `books` (Digital library resources)
```sql
- id (UUID, PK)
- title, author (VARCHAR)
- google_drive_url (TEXT)
- file_type ('pdf' | 'doc' | 'docx' | 'epub')
- tags (TEXT array)
- created_by (UUID, FK)
- created_at (TIMESTAMP)
```

#### `reading_progress` (Book reading tracking)
```sql
- id (UUID, PK)
- user_id, book_id (UUID, FK)
- pages_read, total_pages (INTEGER)
- is_completed (BOOLEAN)
- last_read_at (TIMESTAMP)
- UNIQUE(user_id, book_id)
```

### 3.7 Database Relationships (Entity Relationship)
```
profiles
├── courses (1-to-many: created_by)
├── course_progress (1-to-many: user_id)
├── video_progress (1-to-many: user_id)
├── test_attempts (1-to-many: user_id)
├── certificates (1-to-many: user_id)
├── bookmarks (1-to-many: user_id)
├── wishlists (1-to-many: user_id)
├── login_streaks (1-to-many: user_id)
├── points_ledger (1-to-many: user_id)
└── reading_progress (1-to-many: user_id)

courses
├── course_modules (1-to-many: course_id)
├── course_progress (1-to-many: course_id)
├── tests (1-to-many: course_id)
├── course_summaries (1-to-1: course_id)
└── study_notes (1-to-1: course_id)

course_modules
├── video_progress (1-to-many: module_id)
└── video_summaries (1-to-1: module_id)

tests
└── test_attempts (1-to-many: test_id)
```

---

## 4. Row Level Security (RLS) Policies

### Authentication Helper Function
```sql
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
  SELECT encode(digest(user_email, 'sha256'), 'hex') = 
         (SELECT value FROM app_config WHERE key = 'admin_email_hash')
$$ LANGUAGE SQL SECURITY DEFINER;
```

### Policy Categories

#### User Profile Policies
- **SELECT**: Users can view all profiles (public)
- **UPDATE**: Users can update own profile, admins can update any
- **INSERT**: Users can create own profile

#### Course Policies
- **SELECT**: Anyone can view courses (public)
- **INSERT**: Authenticated users can create courses
- **UPDATE**: Course creators can update own, admins can update any
- **DELETE**: Admins can delete courses

#### Progress Tracking Policies
- **SELECT**: Users can only view own progress, admins can see all
- **UPDATE/ALL**: Users can manage own progress

#### Test/Assessment Policies
- **SELECT**: Anyone can view tests, users see own attempts, admins see all
- **INSERT**: Users can create test attempts
- **UPDATE**: Users can update own attempts

#### AI-Generated Content Policies
- **SELECT**: Anyone can view summaries/notes (public)
- **INSERT/UPDATE**: System only (backend with service key)

#### AI Usage Limits Policies
- **SELECT**: Users see own usage, admins see all
- **UPDATE**: Users/system can track usage

---

## 5. Authentication Flow

### 5.1 User Authentication System

#### Sign-In Flow
1. User clicks "Get Started" on landing page
2. Redirected to Google OAuth consent screen
3. After approval, redirected to `/auth/callback` with OAuth code
4. Backend exchanges code for Supabase session
5. On successful auth:
   - Session stored in browser
   - User redirected to `/dashboard`
   - Profile loaded/created in database

#### Sign-Out Flow
1. User clicks "Sign Out" in navigation
2. Supabase session cleared
3. Redirected to home page (`/`)

### 5.2 Authentication Code Flow

**File**: `app/auth/callback/route.ts`
```typescript
// 1. OAuth callback route (GET)
export async function GET(request: NextRequest) {
  const code = searchParams.get('code')
  if (code) {
    const supabase = createClient(...)
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to /dashboard on success
  }
  // Redirect to error page on failure
}
```

### 5.3 Client-Side Auth Management

**File**: `components/providers.tsx`
```typescript
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

// Provides auth context throughout app
// Loads/creates profile on user login
// Checks admin status via email hash
// Updates role if admin status changes
```

### 5.4 Profile Creation/Update Logic
1. On first login: Check if profile exists
2. If not: Create new profile with learner role
3. Check admin status by hashing user email and comparing to app_config
4. Set role to 'admin' or 'learner' accordingly
5. Fetch profile data on every auth state change

---

## 6. User Workflows

### 6.1 Course Creation Workflow

**Endpoint**: `POST /api/courses/create`
**Flow**:
```
1. User provides YouTube URL (playlist or single video)
2. Rate limit check: 1 course per 24 hours
3. Extract playlist/video ID from URL
4. Fetch metadata from YouTube API v3:
   - Playlist: Get all videos, titles, descriptions, thumbnails
   - Single video: Get video details
5. Create course record in database
6. Create module records (one per video) with order
7. Return course + modules to client
```

**Key Code** (`app/api/courses/create/route.ts`):
- Fetches from YouTube API
- Parses ISO 8601 duration format
- Auto-extracts tags from title/description
- Rate limits via timestamp check
- Uses service role key for database writes

### 6.2 AI Summary Generation Workflow

**Endpoints**: 
- `POST /api/ai/summary` (for video/course summaries)
- `POST /api/ai/notes` (for study notes)
- `POST /api/ai/mcq` (for MCQ test generation)

**Flow**:
```
1. Frontend sends: type (video|course), entityId, userId, content
2. Check if summary already exists (once per entity)
3. Check daily rate limit in ai_usage_limits table
4. Generate content via Gemini API with context-specific prompt
5. Save generated content to appropriate table
6. Update ai_usage_limits (upsert)
7. Update ai_content_flags to mark as generated
8. Return generated content to client
```

**Rate Limits**:
- Video summaries: 1 per video
- Course summaries: 1 per course
- Study notes: 1 per course per 24 hours
- MCQ generation: 1 per course per 24 hours

### 6.3 TubiBot (AI Assistant) Workflow

**Endpoint**: `POST /api/ai/chat`
**Flow**:
```
1. User submits question with optional context:
   - learningHistory: User's past questions/responses
   - currentCourse: Current course info
2. Check daily rate limit: 10 questions per 24 hours
3. Build prompt with context from PROMPTS.tubiBotResponse
4. Generate response via Gemini chatModel (Key 3)
5. Update usage count in ai_usage_limits
6. Return response + remaining questions to client
```

**Key Features**:
- Per-user daily limit (tracked by user_id + usage_date)
- Context-aware responses (course/learning history)
- Friendly, mentor-like tone

### 6.4 Test Taking Workflow

**Endpoints**:
- `POST /api/ai/mcq` (generate 20-question test)
- `POST /api/tests/submit` (submit answers)

**Flow**:
```
1. Generate test: 20 MCQ questions with Gemini
2. Store in tests table with JSONB questions
3. User takes test with 30-minute timer
4. Submit answers:
   - Score calculation: questions_correct / 20 * 100
   - Compare to passing_score (default 80)
   - Create test_attempt record
   - Update course_progress if applicable
5. Award points if passed: 100 points
6. Generate certificate if course completed
```

### 6.5 Gamification Workflow

**Points System**:
- Daily login: +10 points
- Video completion: +50 points
- Course completion: +200 points
- Test passing: +100 points
- Streak bonuses: 7d (+50), 10d (+100), 1m (+500), 3m (+1500), 6m (+3000), 1y (+10000)

**Implementation**:
- All points tracked in immutable `points_ledger` table
- `profiles.total_points` updated on every transaction
- Points can be used to unlock premium courses
- Streaks tracked via `login_streaks` table (daily entries)

---

## 7. API Routes & Endpoints

### 7.1 Course APIs

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|-----------|
| `/api/courses/create` | POST | Create course from YouTube URL | User | 1 per 24h |
| `/api/courses/[id]` | GET | Fetch course details | Public | None |
| `/api/courses` | GET | List courses | Public | None |
| `/api/courses/[id]/progress` | GET | Get user's course progress | User | None |

### 7.2 AI APIs

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|-----------|
| `/api/ai/summary` | POST | Generate video/course summary | User | 1 per entity |
| `/api/ai/notes` | POST | Generate study notes | User | 1 per 24h |
| `/api/ai/mcq` | POST | Generate 20-Q test | User | 1 per 24h |
| `/api/ai/chat` | POST | TubiBot chat | User | 10 per 24h |

### 7.3 Test APIs

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/tests/[courseId]` | GET | Get test for course | Public |
| `/api/tests/submit` | POST | Submit test answers | User |
| `/api/tests/attempts` | GET | Get user's attempts | User |

### 7.4 User APIs

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/profile` | GET | Get user profile | User |
| `/api/profile` | PUT | Update user profile | User |
| `/api/progress/[courseId]` | PUT | Update course progress | User |

### 7.5 Admin APIs

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/users` | GET | List all users | Admin |
| `/api/admin/courses` | GET/POST | Manage courses | Admin |
| `/api/admin/analytics` | GET | System analytics | Admin |

---

## 8. Legacy Supabase Notes

This section is retained only for historical reference. The current Tubertify app is implemented with Firebase Authentication and Firestore, not Supabase.

For migration history and old Supabase integration details, see `docs/FIREBASE_MIGRATION_GUIDE.md`.

---

## 9. Data Flows & Request Lifecycle

### 9.1 Course Creation Data Flow

```
Client (course-creator.tsx)
  ↓ User enters YouTube URL
  ↓ POST /api/courses/create
  ↓
Server (app/api/courses/create/route.ts)
  ↓ Validate rate limit (1 course/24h)
  ↓ Extract playlist/video ID
  ↓ Fetch YouTube API v3
  ├─ Get playlist metadata (title, description, thumbnail)
  ├─ Get playlist items (video IDs)
  └─ Get video details (duration)
  ↓ Supabase:
  ├─ INSERT into courses table
  ├─ INSERT into course_modules table (1 per video)
  └─ RETURN course + modules
  ↓ Client receives course data
  ↓ Redirect to /dashboard
  ↓ Update course list UI
```

### 9.2 AI Summary Generation Data Flow

```
Client (course detail page)
  ↓ User clicks "Generate Summary"
  ↓ Frontend fetches video transcript from YouTube
  ↓ POST /api/ai/summary
  ├─ body: { type: 'video', entityId, userId, content: transcript }
  ↓
Server (app/api/ai/summary/route.ts)
  ├─ Check if summary exists (SELECT video_summaries WHERE module_id = ?)
  ├─ If exists, return cached summary
  ├─ Check rate limit (SELECT ai_usage_limits WHERE user_id = ? AND usage_date = TODAY)
  ├─ Call Gemini API with prompt: PROMPTS.videoSummary
  ├─ INSERT summary into video_summaries table
  ├─ UPSERT usage tracking in ai_usage_limits table
  ├─ UPSERT content flag in ai_content_flags table
  └─ RETURN { summary }
  ↓ Client displays summary
  ↓ Add to course overview
```

### 9.3 TubiBot Chat Data Flow

```
Client (tubibot chat component)
  ↓ User types question
  ↓ POST /api/ai/chat
  ├─ body: { userId, question, learningHistory, currentCourse }
  ↓
Server (app/api/ai/chat/route.ts)
  ├─ Check daily rate limit (10 questions/day)
  ├─ If limit reached, return 429 error
  ├─ Build context-aware prompt with learningHistory and currentCourse
  ├─ Call Gemini API with chatModel (API Key 3)
  ├─ UPSERT usage count in ai_usage_limits table
  └─ RETURN { response, remainingQuestions }
  ↓ Client displays response
  ↓ Show remaining question count
```

### 9.4 Test Submission Data Flow

```
Client (test-engine)
  ↓ User completes test
  ↓ POST /api/tests/submit
  ├─ body: { userId, testId, courseId, answers, timeTaken }
  ↓
Server (app/api/tests/submit/route.ts)
  ├─ Retrieve test questions from tests table
  ├─ Score calculation: correctAnswers / 20 * 100
  ├─ INSERT into test_attempts table
  ├─ UPDATE course_progress to 'completed' if last module
  ├─ If score >= 80 (passing):
  │  ├─ INSERT 100 points into points_ledger
  │  ├─ UPDATE profiles.total_points
  │  ├─ If all tests passed, INSERT certificate
  │  └─ Award streak bonuses if applicable
  └─ RETURN { score, passed, points_earned }
  ↓ Client shows results
  ↓ Display certificate or study recommendation
```

---

## 10. File Structure & Components

```
tubertify/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (metadata, fonts)
│   ├── globals.css                 # Global styles
│   ├── api/
│   │   ├── courses/
│   │   │   └── create/route.ts     # Create course from YouTube
│   │   ├── ai/
│   │   │   ├── summary/route.ts    # Generate summaries
│   │   │   ├── notes/route.ts      # Generate study notes
│   │   │   ├── mcq/route.ts        # Generate tests
│   │   │   └── chat/route.ts       # TubiBot chat
│   │   └── tests/route.ts          # Test management
│   ├── auth/
│   │   └── callback/route.ts       # OAuth callback handler
│   ├── dashboard/                  # User dashboard
│   ├── course/                     # Course pages
│   ├── test/                       # Test pages
│   ├── library/                    # Digital library
│   └── admin/                      # Admin panel
│
├── components/
│   ├── providers.tsx               # Auth context provider
│   ├── navigation.tsx              # Top navigation bar
│   ├── course-creator.tsx          # Course import UI
│   ├── ui/                         # ShadCN/UI components (shadcn init)
│   ├── loading.tsx                 # Loading states
│   └── page-transition.tsx         # Route transitions
│
├── lib/
│   ├── supabase.ts                 # Supabase client + types
│   ├── gemini.ts                   # Gemini API clients (3 instances)
│   └── utils.ts                    # Helper functions (hash, extract IDs)
│
├── supabase/
│   ├── schema.sql                  # Database schema (20+ tables)
│   └── rls-policies.sql            # Row Level Security policies
│
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # PWA icons
│
├── .env.example                    # Environment template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.js              # Tailwind CSS config
├── postcss.config.js               # PostCSS config
├── next.config.mjs                 # Next.js config
└── README.md                       # Documentation
```

---

## 11. Key Implementation Patterns

### 11.1 Prompt Engineering (Gemini Integration)

**File**: `lib/gemini.ts`

Three separate Gemini instances with different keys:

```typescript
// API Key 1: Summaries
const summaryModel = genAI1.getGenerativeModel({ model: 'gemini-pro' })

// API Key 2: Study Materials
const studyModel = genAI2.getGenerativeModel({ model: 'gemini-pro' })

// API Key 3: Chat
const chatModel = genAI3.getGenerativeModel({ model: 'gemini-pro' })

// Usage tracking via separate keys allows monitoring per-feature costs
```

**Prompt Templates** in `PROMPTS` object:
1. **videoSummary** - Extract key points, organize hierarchically
2. **courseSummary** - Synthesize video summaries into learning path
3. **studyNotes** - Create scannable notes with mnemonics
4. **mcqGeneration** - Generate 20 questions (30% easy, 50% medium, 20% hard)
5. **tubiBotResponse** - Mentor-like tone with context

### 11.2 Rate Limiting Pattern

**Pattern**: Per-user, per-feature, per-day tracking

```typescript
const today = new Date().toISOString().split('T')[0]

const { data: usageData } = await supabase
  .from('ai_usage_limits')
  .select('usage_count')
  .eq('user_id', userId)
  .eq('usage_type', 'tubibot_chat')           // Feature
  .eq('usage_date', today)                    // Day
  .eq('entity_id', courseId)                  // Optional: per-entity
  .single()

if (usageData?.usage_count >= LIMIT) {
  return NextResponse.json({ error: 'Limit exceeded' }, { status: 429 })
}

// After operation: UPSERT usage count
```

### 11.3 Immutable Ledger Pattern

**Points Ledger**: Every point change is immutable transaction

```typescript
// Record every points change
await supabase.from('points_ledger').insert({
  user_id: userId,
  points_delta: 100,              // +100 for test pass
  reason: 'test_passing',
  related_entity_type: 'course',
  related_entity_id: courseId,
  created_at: now()
})

// Update user's total (can recalculate from ledger if needed)
await supabase.from('profiles').update({
  total_points: currentPoints + 100
}).eq('id', userId)
```

### 11.4 Authentication Check Pattern

**Admin Detection**: Email hash comparison

```typescript
function is_admin(user_email) {
  const userHash = SHA256(user_email.toLowerCase().trim())
  const adminHash = SELECT value FROM app_config WHERE key = 'admin_email_hash'
  return userHash === adminHash
}

// Used in RLS policies for role-based access
```

### 11.5 OAuth Flow Pattern

```typescript
// 1. Trigger OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`
  }
})

// 2. User redirected to /auth/callback with code
// 3. Exchange code for session
const { error } = await supabase.auth.exchangeCodeForSession(code)

// 4. Redirect to dashboard
// 5. On next page load, useEffect fetches user session and profile
```

---

## 12. Security Features

### 12.1 Row Level Security (RLS)

All tables have RLS enabled with specific policies:

- **Users data**: Only owner can read/write
- **Public courses**: Anyone can read
- **Admin functions**: Only admins via email hash verification
- **AI-generated content**: Anyone can read (not sensitive), system/admin can write

### 12.2 API Security

- **Service Role Key**: Used server-side only (never exposed to client)
- **User validation**: API routes verify `userId` from request matches authenticated user
- **Rate limiting**: Per-user, per-feature limits prevent abuse
- **OAuth**: No password exposure, relies on Google OAuth

### 12.3 Admin Verification

- Admin email hashed (SHA-256) and stored in `app_config` table
- On login, current user's email is hashed and compared
- Admin role assigned dynamically (if changed, role updates on next login)
- Single admin email per deployment

### 12.4 Environment Variables

**Public** (exposed to client):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (API keys intentionally exposed in README for demo)

**Secret** (server-side only):
- `SUPABASE_SERVICE_ROLE_KEY`
- `YOUTUBE_API_KEY`
- `GEMINI_API_KEY_1/2/3` (could be kept server-side)
- `ADMIN_EMAIL_HASH`

---

## 13. Deployment Architecture

### 13.1 Hosting Stack

- **Frontend**: Cloudflare Pages (static Next.js export)
- **Backend**: Next.js API routes (Cloudflare Functions)
- **Database**: Supabase Cloud (PostgreSQL)
- **CDN**: Cloudflare global edge network
- **Repository**: GitHub (source of truth)

### 13.2 Deployment Process

1. Push to `main` branch on GitHub
2. Cloudflare Pages automatically detects changes
3. Runs `npm run build`
4. Next.js builds to `.next` directory
5. Deploys to Cloudflare edge workers
6. Routes API calls to Cloudflare Functions
7. All requests proxied through Supabase for database

### 13.3 Build Configuration

```javascript
// next.config.js
module.exports = {
  // Cloudflare Pages specific config
}

// Cloudflare Pages settings:
// Build command: npm run build
// Output directory: .next
```

---

## 14. Key Performance Considerations

### 14.1 Indexes
```sql
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_ai_usage_limits_user_date ON ai_usage_limits(user_id, usage_date);
-- Many more for common queries
```

### 14.2 Database Optimization

- **JSONB** for questions and answers (flexible schema)
- **Text arrays** for tags (USING GIN indexes)
- **Partitioning**: Could partition points_ledger by date
- **Caching**: Summaries cached (one per video/course)

### 14.3 Frontend Optimization

- **Server-side rendering**: Next.js App Router
- **Code splitting**: Route-based automatic splitting
- **Lazy loading**: Components load on demand
- **PWA**: Offline support via service worker

---

## 15. Gemini API Usage Tracking

### 15.1 Why 3 API Keys?

Separation allows monitoring costs by feature:
- **Key 1**: Video/Course summaries (likely high volume)
- **Key 2**: Study notes & MCQ (medium volume, higher computation)
- **Key 3**: TubiBot chat (conversational, ongoing)

### 15.2 Usage Metrics

Stored in `ai_usage_limits` table:
- `usage_count`: How many times used today
- `usage_date`: Date of usage
- `entity_id`: Specific video/course (if applicable)

Can be queried to:
- Enforce limits
- Track costs per feature
- Generate usage reports
- Predict quota exhaustion

---

## 16. Migration Guide: Supabase → Firebase

### 16.1 Mapping

| Supabase | Firebase Equivalent |
|----------|-------------------|
| PostgreSQL Database | Firestore (NoSQL) |
| Row Level Security | Firestore Security Rules |
| Supabase Auth | Firebase Authentication |
| Service Role Key | Firebase Admin SDK + Service Account |
| Tables/Rows | Collections/Documents |
| SQL Schema | JSON schema validation |

### 16.2 Key Differences for Firebase Migration

1. **RLS → Security Rules**: Firestore uses declarative rules instead of SQL policies
2. **Schema**: Firestore is schema-less (more flexible, less validated)
3. **Joins**: No native joins; denormalization recommended
4. **Transactions**: Firebase has transactions but different syntax
5. **Queries**: Use Firebase SDK (not SQL)
6. **Rate Limiting**: Implement in code instead of at DB level
7. **Ledger Pattern**: Use subcollections for transaction logs

### 16.3 Collection Structure (Firebase)

```firestore
users/
  {userId}/
    - email, full_name, avatar_url
    - role, total_points, current_streak
    - created_at, updated_at
    
courses/
  {courseId}/
    - title, description, youtube_url
    - created_by, thumbnail_url
    - modules/ (subcollection)
      {moduleId}/
        - title, youtube_video_id, duration_seconds
        - summary_text (generated)
    
course_progress/
  {userId}/
    {courseId}/
      - status, progress_percentage, completed_at
      
ai_usage/
  {userId}/
    {date}/
      - tubibot_chat: count
      - video_summary: count
      - study_notes: count

points_ledger/
  {userId}/
    {transactionId}/
      - points_delta, reason, created_at
```

---

## 17. Testing the System

### 17.1 Test Cases

1. **Authentication**
   - Sign in with Google
   - Check profile creation
   - Verify admin detection

2. **Course Creation**
   - Import valid YouTube playlist
   - Verify modules created
   - Test rate limiting

3. **AI Features**
   - Generate course summary
   - Generate study notes
   - Create MCQ test
   - Chat with TubiBot (verify 10/day limit)

4. **Gamification**
   - Award points on video completion
   - Track streaks
   - Verify certificates issued

5. **RLS Security**
   - Verify user can't access others' progress
   - Verify admin can see all data
   - Verify public courses visible to all

---

## 18. Important Notes for Firebase Migration

1. **No Native RLS**: Implement authorization logic in API routes/frontend
2. **No JSON Output Columns**: Store generated content as text in documents
3. **No Service Role Pattern**: Use Firebase Admin SDK with service account JSON
4. **Rate Limiting**: Implement via custom counters in Firestore, not at DB layer
5. **Immutable Ledger**: Use `{ immutable: true }` Firestore rules + timestamp validation
6. **Email Hash Admin**: Same approach works (hash admin email, store in app config)
7. **OAuth**: Firebase Authentication handles Google OAuth
8. **API Routes**: Same Next.js API routes pattern works with Firebase SDK

---

## 19. Conclusion

Tubertify demonstrates a complete, production-ready AI-powered learning platform integrating:
- Modern frontend (Next.js 14)
- Backend API patterns
- Complex database schema with security
- Multiple external APIs (YouTube, Gemini)
- Gamification and engagement features
- Comprehensive audit/tracking via ledgers

The Supabase architecture is well-designed for this use case. Firebase migration is feasible with careful attention to RLS translation and schema denormalization.

---

## 20. References & Resources

- **Repository**: https://github.com/prjsab01/tubertify
- **Supabase Docs**: https://supabase.io/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **YouTube API**: https://developers.google.com/youtube/v3
- **Google Gemini API**: https://ai.google.dev/
