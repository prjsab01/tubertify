# Tubertify: Quick Reference Guide

A concise summary of Tubertify's architecture and integration points for quick lookup.

---

## 📋 Project Overview

| Aspect | Details |
|--------|---------|
| **Name** | Tubertify - AI-Powered YouTube Learning Platform |
| **Repository** | https://github.com/prjsab01/tubertify |
| **Status** | Production-ready, deployed on Cloudflare Pages |
| **Purpose** | Convert YouTube videos into structured AI-assisted courses |
| **Last Update** | ~5 months ago |

---

## 🛠️ Tech Stack at a Glance

```
Frontend          → Next.js 14 (App Router) + TypeScript + Tailwind CSS + ShadCN/UI
Backend APIs      → Next.js API Routes (Edge Runtime) + TypeScript
Database          → Supabase PostgreSQL + RLS
Authentication    → Supabase Auth + Google OAuth
AI Integration    → Google Gemini API (3 keys)
External APIs     → YouTube Data API v3
Hosting           → Cloudflare Pages
Real-time         → Firestore Listeners (after migration)
```

---

## 📊 Database Statistics

| Category | Count | Key Tables |
|----------|-------|-----------|
| **Core Tables** | 6 | profiles, courses, course_modules, course_progress, video_progress, tests |
| **AI Tables** | 5 | ai_usage_limits, ai_content_flags, course_summaries, video_summaries, study_notes |
| **User Tables** | 6 | bookmarks, wishlists, certificates, points_ledger, login_streaks, reading_progress |
| **Library** | 2 | books, reading_progress |
| **Config** | 1 | app_config |
| **Total Tables** | 20+ | - |

---

## 🔑 Environment Variables

### Public (Exposed to Client)
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_FIREBASE_API_KEY (after migration)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

### Secret (Server-side Only)
```env
SUPABASE_SERVICE_ROLE_KEY
FIREBASE_ADMIN_SDK_KEY (JSON)
YOUTUBE_API_KEY
GEMINI_API_KEY_1 (Summaries)
GEMINI_API_KEY_2 (Study Materials)
GEMINI_API_KEY_3 (Chat)
ADMIN_EMAIL_HASH (SHA-256)
```

---

## 🔐 Authentication Flow

```
1. User clicks "Get Started"
   ↓
2. Redirects to Google OAuth consent
   ↓
3. User approves → Google redirects with code
   ↓
4. /auth/callback exchanges code for session
   ↓
5. Session stored in browser (httpOnly cookie)
   ↓
6. Profile fetched/created in database
   ↓
7. User redirected to /dashboard
   ↓
8. useAuth() hook provides user context throughout app
```

---

## 📱 Core Features

### 1. YouTube Course Import
- **Endpoint**: `POST /api/courses/create`
- **Input**: YouTube playlist or single video URL
- **Rate Limit**: 1 course per 24 hours per user
- **Output**: Course with auto-created modules
- **Process**: YouTube API → Parse metadata → Supabase INSERT

### 2. AI Summaries (2 types)
- **Video Summary**: Summary of single video transcript
- **Course Summary**: Aggregated summary of all videos
- **Endpoint**: `POST /api/ai/summary`
- **AI Model**: Gemini (API Key 1)
- **Rate Limit**: 1 per entity per 24 hours
- **Storage**: Cached in `video_summaries` / `course_summaries`

### 3. AI Study Notes
- **What**: Scannable, structured notes for a course
- **Endpoint**: `POST /api/ai/notes`
- **AI Model**: Gemini (API Key 2)
- **Rate Limit**: 1 per course per 24 hours
- **Format**: Bullet points, mnemonics, key terms

### 4. Auto-Generated Tests
- **What**: 20-question MCQ test per course
- **Endpoint**: `POST /api/ai/mcq`
- **AI Model**: Gemini (API Key 2)
- **Questions**: 30% easy, 50% medium, 20% hard
- **Format**: JSONB stored in `tests.questions`
- **Time Limit**: 30 minutes
- **Passing Score**: 80%

### 5. TubiBot (AI Assistant)
- **What**: Per-message AI chat assistance
- **Endpoint**: `POST /api/ai/chat`
- **AI Model**: Gemini (API Key 3)
- **Rate Limit**: 10 questions per user per 24 hours
- **Context**: Learning history + current course
- **Tone**: Mentor-like, encouraging

### 6. Gamification
| Feature | Points | Storage |
|---------|--------|---------|
| Daily login | +10 | points_ledger |
| Video completion | +50 | points_ledger |
| Course completion | +200 | points_ledger |
| Test passing | +100 | points_ledger |
| 7-day streak | +50 | points_ledger |
| 30-day streak | +500 | points_ledger |
| 365-day streak | +10,000 | points_ledger |
| Streaks tracked | - | login_streaks |

### 7. Certificates
- **When**: Upon course completion AND all tests passed
- **Storage**: `certificates` table with URL
- **Format**: PDF (generated server-side)
- **Includes**: User name, course name, completion date

---

## 🌳 Data Relationships

```
User (profiles)
  ├─ Many Courses (created)
  ├─ Many Progress Records (course_progress)
  ├─ Many Video Progress Records (video_progress)
  ├─ Many Test Attempts (test_attempts)
  ├─ Many Points Ledger Entries (points_ledger)
  ├─ Many Login Streaks (login_streaks)
  ├─ Many Bookmarks (bookmarks)
  └─ Many Wishlist Items (wishlists)

Course
  ├─ Many Modules (course_modules)
  ├─ One Summary (course_summaries)
  ├─ One Study Notes (study_notes)
  ├─ One or More Tests (tests)
  ├─ Many Progress Records (course_progress)
  └─ Many Certificates (certificates)

Module (course_modules)
  ├─ One Summary (video_summaries)
  └─ Many Video Progress Records (video_progress)

Test (tests)
  └─ Many Attempts (test_attempts)
```

---

## 🔌 API Endpoints Summary

### Courses
- `POST /api/courses/create` - Import YouTube course
- `GET /api/courses` - List all courses
- `GET /api/courses/[id]` - Get course details
- `GET /api/courses/[id]/progress` - User's progress

### AI Features
- `POST /api/ai/summary` - Generate video/course summary
- `POST /api/ai/notes` - Generate study notes
- `POST /api/ai/mcq` - Generate 20-Q test
- `POST /api/ai/chat` - TubiBot chat message

### Tests
- `GET /api/tests/[courseId]` - Get test questions
- `POST /api/tests/submit` - Submit test answers
- `GET /api/tests/attempts` - Get user's test history

### User
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/progress` - Get all progress data

### Admin (requires admin role)
- `GET /api/admin/users` - List all users
- `GET /api/admin/courses` - Manage courses
- `GET /api/admin/analytics` - System analytics

---

## 📋 Rate Limits

| Feature | Limit | Period | Storage |
|---------|-------|--------|---------|
| Course Creation | 1 | 24 hours | Direct date check |
| Video Summary | 1 | Per video | ai_usage_limits |
| Course Summary | 1 | Per course | ai_usage_limits |
| Study Notes | 1 | Per course per day | ai_usage_limits |
| MCQ Generation | 1 | Per course per day | ai_usage_limits |
| TubiBot Chat | 10 | Per user per day | ai_usage_limits |
| Test Attempts | 2 | Per course per day | (not explicitly tracked) |

---

## 🔒 Security & RLS

### Authentication
- OAuth 2.0 via Google
- Session managed by Supabase Auth
- User context available in API routes

### Authorization
- **Public**: Courses, modules, tests, books, summaries
- **Private**: User progress, test attempts, profile
- **Admin-only**: User management, course promotion, analytics

### Row Level Security (RLS)
All tables protected. Examples:
```sql
-- Users can only access own data
WHERE user_id = auth.uid()

-- Admins can access all data
WHERE is_admin()

-- Courses readable by all, writable by creator/admin
SELECT: true
UPDATE: created_by = auth.uid() OR is_admin()
```

### Admin Detection
```sql
-- Email hash comparison
user_hash = SELECT(admin_hash FROM app_config)
```

---

## 📁 Key Files & Their Purposes

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client initialization + TypeScript types |
| `lib/gemini.ts` | Gemini API clients (3 instances) + prompt templates |
| `lib/utils.ts` | Helper functions (email hash, YouTube ID extraction) |
| `components/providers.tsx` | Auth context provider + profile loading |
| `components/navigation.tsx` | Top nav with auth-aware menu |
| `app/auth/callback/route.ts` | OAuth callback handler |
| `app/api/courses/create/route.ts` | Course import from YouTube |
| `app/api/ai/summary/route.ts` | Summary generation (video/course) |
| `app/api/ai/notes/route.ts` | Study notes generation |
| `app/api/ai/mcq/route.ts` | MCQ test generation |
| `app/api/ai/chat/route.ts` | TubiBot chat endpoint |
| `supabase/schema.sql` | Database schema (20+ tables) |
| `supabase/rls-policies.sql` | Row Level Security policies |

---

## 🚀 Deployment

| Component | Hosting |
|-----------|---------|
| Frontend | Cloudflare Pages |
| Backend APIs | Cloudflare Functions |
| Database | Supabase Cloud (PostgreSQL) |
| Storage | Supabase Storage (for certificates, assets) |
| CDN | Cloudflare Global Edge |

### Build Process
```bash
npm run build
# → Next.js builds to .next directory
# → Cloudflare Pages detects changes
# → Deploys to edge workers globally
```

---

## 🔄 Supabase → Firebase Migration Map

| Supabase Feature | Firebase Equivalent |
|------------------|-------------------|
| PostgreSQL | Firestore (NoSQL) |
| Schema validation | Document validation rules |
| RLS policies | Security Rules (JSON) |
| Supabase Auth | Firebase Authentication |
| Service role key | Firebase Admin SDK |
| Tables | Collections |
| Rows | Documents |
| Joins | Denormalization + subcollections |
| Transactions | Firestore Transactions |
| Notify/pubsub | Cloud Functions + Pub/Sub |

---

## 📊 Typical User Journey

```
1. Landing Page
   → Sign in with Google OAuth
   
2. Dashboard
   → View enrolled courses
   → View gamification stats (points, streak)
   → Access bookmarks
   
3. Course Page
   → View modules/videos
   → Read AI summary
   → Access study notes
   
4. Video Page
   → Watch YouTube video
   → Ask TubiBot (10/day)
   → View transcript summary
   
5. Test Page
   → Take 20-Q MCQ test (30 min timer)
   → View results
   → Earn points if pass
   
6. Certificate Page
   → Download certificate if completed
   → Share on social (future)
   
7. Library
   → Browse curated books
   → Track reading progress
```

---

## 🎯 Key Metrics/Analytics

Tracked but not fully detailed in README:

- User engagement (logins, courses started/completed)
- Course completion rates
- Test passing rates
- AI feature usage by type
- Points distribution
- Streak continuity
- Certificate issuance
- Feature adoption rates

---

## ⚡ Performance Optimizations

- **Indexes**: On email, featured, user_id, date combinations
- **Caching**: Summaries generated once per entity
- **RLS**: Prevents unauthorized queries early
- **Cloudflare**: Global CDN + edge caching
- **Next.js**: Code splitting + lazy loading
- **PWA**: Offline support + service worker

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Auth not working | OAuth config incomplete | Check Supabase/Firebase redirect URIs |
| Summaries not generating | API key invalid | Verify Gemini keys in env |
| Rate limit false positives | Time zone mismatch | Use UTC for date comparisons |
| RLS errors | User ID mismatch | Verify request includes correct userId |
| Slow queries | Missing indexes | Check schema.sql indexes |

---

## 📚 Documentation Files

1. **TUBERTIFY_ARCHITECTURE_SUMMARY.md** (THIS DIRECTORY)
   - Complete architecture overview
   - Database schema documentation
   - API endpoint details
   - Security features
   - 20 sections covering everything

2. **FIREBASE_MIGRATION_GUIDE.md** (THIS DIRECTORY)
   - Step-by-step Firebase setup
   - Firestore collection structure
   - Security Rules examples
   - Code migration examples
   - Testing checklist

3. **QUICK_REFERENCE.md** (THIS FILE)
   - One-page quick lookup
   - Key stats and summaries
   - Common patterns
   - Essential files

---

## 🔗 Important Links

- **Repository**: https://github.com/prjsab01/tubertify
- **Supabase Docs**: https://supabase.io/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js 14 Docs**: https://nextjs.org/docs
- **YouTube API**: https://developers.google.com/youtube/v3/docs
- **Google Gemini**: https://ai.google.dev/docs
- **Cloudflare Pages**: https://pages.cloudflare.com

---

## ✅ Validation Checklist

Before deployment/migration, verify:

- [ ] All 20 database tables created
- [ ] RLS policies applied to all tables
- [ ] OAuth configured (Google)
- [ ] API keys set (YouTube, Gemini x3)
- [ ] Admin email hash generated and stored
- [ ] Environment variables configured
- [ ] Course import working (YouTube API)
- [ ] AI features working (Gemini API)
- [ ] Rate limiting enforced
- [ ] Authentication flow complete
- [ ] User profile creation working
- [ ] Gamification points tracked
- [ ] Tests generated and submittable
- [ ] Certificates issuable
- [ ] PWA installable
- [ ] Performance acceptable
- [ ] Security rules validated
- [ ] Error handling comprehensive

---

## 🎓 Learning Resources for This Project

To understand this codebase better, study:

1. **Next.js 14 App Router**
   - Server/client components
   - Dynamic routes
   - API routes + edge runtime

2. **PostgreSQL + RLS**
   - Normalization principles
   - Security policies
   - Window functions for ordering

3. **Firebase/Firestore** (for migration)
   - Document model
   - Security rules language
   - Subcollections vs flat structure

4. **OAuth 2.0 Flow**
   - Authorization code flow
   - Session management
   - Token handling

5. **Prompt Engineering**
   - Context provision
   - Output formatting
   - Temperature/token tuning

6. **Gamification Design**
   - Points systems
   - Streaks and milestones
   - Reward psychology

---

**Last Updated**: May 6, 2026  
**Repository**: https://github.com/prjsab01/tubertify
