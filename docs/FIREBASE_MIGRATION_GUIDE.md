# Firebase Migration Guide for Tubertify

This guide explains how to migrate Tubertify from Supabase to Firebase, mapping each feature to its Firebase equivalent.

---

## Table of Contents

1. [Quick Comparison](#quick-comparison)
2. [Database Migration](#database-migration)
3. [Authentication Migration](#authentication-migration)
4. [Security Rules (RLS Equivalent)](#security-rules)
5. [API Route Updates](#api-route-updates)
6. [Client Setup](#client-setup)
7. [Rate Limiting Implementation](#rate-limiting-implementation)
8. [Testing Checklist](#testing-checklist)

---

## Quick Comparison

| Feature | Supabase | Firebase |
|---------|----------|----------|
| **Database** | PostgreSQL (SQL) | Firestore (NoSQL) or Realtime DB |
| **Schema** | Predefined (schema.sql) | Flexible/Document-based |
| **Auth** | Supabase Auth + OAuth | Firebase Authentication |
| **Admin Access** | Service Role Key | Admin SDK + Service Account |
| **Security** | Row Level Security (SQL policies) | Security Rules (JSON) |
| **Real-time** | Postgres Notify | Firestore Listeners |
| **Transactions** | SQL TRANSACTIONS | Firestore Transactions |
| **Rate Limiting** | Via ai_usage_limits table | Code implementation or Firebase Rules |
| **Storage** | Supabase Storage | Cloud Storage or Firestore |

---

## Database Migration

### 3.1 Supabase → Firestore Structure

Instead of normalized SQL tables, Firestore uses collections of documents.

#### **Before (Supabase SQL)**
```sql
-- Normalized relational structure
profiles table
courses table
course_modules table
course_progress table
-- Many joins needed for queries
```

#### **After (Firestore)**
```javascript
// Hierarchical/denormalized structure

// Collection: users (from Firebase Auth)
users/
  {uid}/
    document fields:
      - email
      - full_name
      - role
      - total_points
      - current_streak
      - last_login_date
      - created_at
      - updated_at

// Collection: courses
courses/
  {courseId}/
    document fields:
      - title
      - description
      - youtube_url
      - youtube_playlist_id
      - thumbnail_url
      - created_by (uid)
      - is_featured
      - is_admin_created
      - unlock_points
      - difficulty_level
      - tags[]
      - created_at
      - updated_at
    
    subcollection: modules
      {moduleId}/
        - title
        - youtube_video_id
        - description
        - duration_seconds
        - module_order
        - created_at
    
    subcollection: summaries (instead of separate table)
      {summaryId}/
        - type: 'course_summary' or 'video_summary'
        - content
        - created_at
    
    subcollection: study_notes
      {notesId}/
        - content
        - created_at
    
    subcollection: tests
      {testId}/
        - questions: [{ question, options[], correct, difficulty }]
        - passing_score
        - time_limit_minutes
        - created_at

// Collection: course_progress
course_progress/
  {userId}/
    {courseId}/
      - status
      - progress_percentage
      - last_watched_module_id
      - started_at
      - completed_at
      - updated_at

// Collection: video_progress
video_progress/
  {userId}/
    {courseId}/
      {moduleId}/
        - watched_seconds
        - is_completed
        - last_watched_at
        - created_at

// Collection: test_attempts
test_attempts/
  {userId}/
    {attemptId}/
      - test_id
      - course_id
      - answers: { questionId: answer }
      - score
      - passed
      - started_at
      - completed_at
      - time_taken_minutes

// Collection: ai_usage
ai_usage/
  {userId}/
    {date: YYYY-MM-DD}/
      - tubibot_chat: count
      - video_summary: count
      - course_summary: count
      - study_notes: count
      - mcq_generation: count
      - updated_at

// Collection: points_ledger
points_ledger/
  {userId}/
    {transactionId}/
      - points_delta
      - reason
      - related_entity_type
      - related_entity_id
      - created_at
      - timestamp (server timestamp for ordering)

// Collection: login_streaks
login_streaks/
  {userId}/
    {date: YYYY-MM-DD}/
      - streak_count
      - created_at

// Collection: certificates
certificates/
  {userId}/
    {courseId}/
      - certificate_url
      - issued_at
      - created_at

// Collection: books (library)
books/
  {bookId}/
    - title
    - author
    - google_drive_url
    - file_type
    - tags[]
    - created_by
    - created_at

// Collection: reading_progress
reading_progress/
  {userId}/
    {bookId}/
      - pages_read
      - total_pages
      - is_completed
      - last_read_at
      - created_at
```

### 3.2 Migration Strategy

#### Option A: Firestore (Recommended for NoSQL)
**Pros**: Flexible, real-time listeners, scales well  
**Cons**: No joins, need denormalization

#### Option B: Cloud Firestore + Realtime Database
**Pros**: Best of both  
**Cons**: More complex setup

#### For this guide: Using Firestore

### 3.3 Firestore Initialization

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
```

---

## Authentication Migration

### Previous: Supabase OAuth

```typescript
// OLD: Supabase
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/dashboard` }
})
```

### New: Firebase Authentication

```typescript
// NEW: Firebase
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Create or update user profile in Firestore
    await createUserProfile(user)
    
    return user
  } catch (error) {
    console.error('Auth error:', error)
    throw error
  }
}

async function createUserProfile(user: FirebaseUser) {
  const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore')
  const profileRef = doc(db, 'users', user.uid)
  
  const profileSnap = await getDoc(profileRef)
  
  if (!profileSnap.exists()) {
    // New user
    await setDoc(profileRef, {
      email: user.email,
      full_name: user.displayName,
      avatar_url: user.photoURL,
      role: isAdmin(user.email) ? 'admin' : 'learner',
      total_points: 0,
      current_streak: 0,
      longest_streak: 0,
      learning_goals: [],
      preferred_topics: [],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
  } else {
    // Returning user - update last login
    await updateDoc(profileRef, {
      last_login_date: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
  }
}
```

### Configuration

1. **Firebase Console Setup**
   - Go to Authentication → Sign-in method
   - Enable Google
   - Add OAuth credentials from Google Cloud
   - Configure redirect URIs

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxx
   FIREBASE_ADMIN_SDK_KEY=xxx (JSON content)
   ```

---

## Security Rules

### Previous: Supabase RLS Policies

```sql
-- OLD: Supabase SQL
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view all courses"
  ON courses
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own progress"
  ON course_progress
  FOR ALL
  USING (user_id = auth.uid());
```

### New: Firebase Security Rules

```json
{
  "rules": {
    "users": {
      "{uid}": {
        ".read": "request.auth.uid == $uid || isAdmin()",
        ".write": "request.auth.uid == $uid || isAdmin()",
        ".validate": "newData.hasChildren(['email', 'role'])"
      }
    },
    
    "courses": {
      "{courseId}": {
        ".read": true,
        ".write": "isAdmin() || request.auth.uid == root.child('courses').child($courseId).child('created_by').val()",
        "modules": {
          "{moduleId}": {
            ".read": true,
            ".write": "isAdmin() || isCourseCr eator($courseId)"
          }
        },
        "summaries": {
          "{summaryId}": {
            ".read": true,
            ".write": "isAdmin()"
          }
        },
        "tests": {
          "{testId}": {
            ".read": true,
            ".write": "isAdmin() || isCourseCr eator($courseId)"
          }
        }
      }
    },
    
    "course_progress": {
      "{uid}": {
        "{courseId}": {
          ".read": "request.auth.uid == $uid || isAdmin()",
          ".write": "request.auth.uid == $uid",
          ".validate": "newData.hasChildren(['status'])"
        }
      }
    },
    
    "test_attempts": {
      "{uid}": {
        "{attemptId}": {
          ".read": "request.auth.uid == $uid || isAdmin()",
          ".write": "request.auth.uid == $uid",
          ".validate": "newData.hasChildren(['test_id', 'score'])"
        }
      }
    },
    
    "ai_usage": {
      "{uid}": {
        "{date}": {
          ".read": "request.auth.uid == $uid || isAdmin()",
          ".write": "request.auth.uid == $uid || isAdmin()"
        }
      }
    },
    
    "points_ledger": {
      "{uid}": {
        "{transactionId}": {
          ".read": "request.auth.uid == $uid || isAdmin()",
          ".write": "isAdmin() || (request.auth.uid == $uid && isValidPointsReason(newData.child('reason').val()))"
        }
      }
    }
  },
  
  "functions": {
    "isAdmin": "root.child('app_config').child('admin_uids').hasChild(request.auth.uid)",
    
    "isCourseCr eator": "root.child('courses').child(courseId).child('created_by').val() == request.auth.uid",
    
    "isValidPointsReason": [
      "data.val() == 'daily_login' ||",
      "data.val() == 'video_completion' ||",
      "data.val() == 'course_completion' ||",
      "data.val() == 'test_passing' ||",
      "data.val() == 'streak_bonus'"
    ]
  }
}
```

### Key Differences

1. **Syntax**: Rules use JSON instead of SQL
2. **Functions**: Utility functions defined in rules
3. **Validation**: `.validate` rules check data structure
4. **Admin**: No email hashing - use Firebase UIDs instead
5. **Paths**: Use `$variables` for path segments

### Admin Detection

**Supabase**: Email hash comparison in SQL
**Firebase**: Store admin UIDs in app_config collection

```typescript
// app_config collection
{
  admin_uids: {
    'user_uid_123': true,
    'user_uid_456': true
  }
}

// Security Rules
"isAdmin": "root.child('app_config').child('admin_uids').hasChild(request.auth.uid)"
```

---

## API Route Updates

### Example 1: Course Creation (Before/After)

#### Before: Supabase
```typescript
// app/api/courses/create/route.ts (OLD)
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { url, userId } = await request.json()
  
  // Check rate limit
  const { data: recentCourses } = await supabase
    .from('courses')
    .select('id')
    .eq('created_by', userId)
    .gte('created_at', yesterday.toISOString())
  
  if (recentCourses && recentCourses.length > 0) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  
  // Fetch YouTube info...
  
  // Insert course
  const { data: course } = await supabase
    .from('courses')
    .insert(courseData)
    .select()
    .single()
  
  // Insert modules
  await supabase.from('course_modules').insert(moduleInserts)
  
  return NextResponse.json({ course, modules: moduleInserts })
}
```

#### After: Firebase
```typescript
// app/api/courses/create/route.ts (NEW)
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const app = initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY!))
})

const db = getFirestore(app)

export async function POST(request: NextRequest) {
  const { url, userId } = await request.json()
  
  // Check rate limit
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 1)
  
  const coursesSnap = await db.collection('courses')
    .where('created_by', '==', userId)
    .where('created_at', '>=', Timestamp.fromDate(thirtyDaysAgo))
    .get()
  
  if (coursesSnap.size > 0) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  
  // Fetch YouTube info...
  const playlistInfo = await fetchPlaylistInfo(playlistId)
  
  // Create course document
  const courseRef = db.collection('courses').doc()
  const courseData = {
    title: playlistInfo.title,
    description: playlistInfo.description,
    youtube_playlist_id: playlistId,
    thumbnail_url: playlistInfo.thumbnail,
    created_by: userId,
    is_featured: false,
    unlock_points: 0,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  }
  
  await courseRef.set(courseData)
  
  // Create modules subcollection
  const modulesRef = courseRef.collection('modules')
  for (let i = 0; i < playlistInfo.videos.length; i++) {
    const video = playlistInfo.videos[i]
    await modulesRef.add({
      title: video.title,
      description: video.description,
      youtube_video_id: video.videoId,
      duration_seconds: video.duration,
      module_order: i + 1,
      created_at: FieldValue.serverTimestamp(),
    })
  }
  
  const courseSnap = await courseRef.get()
  const modulesSnap = await modulesRef.get()
  
  return NextResponse.json({
    course: { id: courseRef.id, ...courseSnap.data() },
    modules: modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}
```

### Example 2: AI Summary Generation

#### Before: Supabase
```typescript
const { data: existingSummary } = await supabase
  .from('video_summaries')
  .select('*')
  .eq('module_id', entityId)
  .single()

const { data: usageData } = await supabase
  .from('ai_usage_limits')
  .select('usage_count')
  .eq('user_id', userId)
  .eq('usage_date', today)
  .single()
```

#### After: Firebase
```typescript
const summarySnap = await db.collection('courses').doc(courseId)
  .collection('summaries')
  .where('type', '==', 'video_summary')
  .where('module_id', '==', entityId)
  .limit(1)
  .get()

const summaryExists = !summarySnap.empty
if (summaryExists) {
  return NextResponse.json({ summary: summarySnap.docs[0].data().content })
}

// Check usage
const today = new Date().toISOString().split('T')[0]
const usageSnap = await db.collection('ai_usage')
  .doc(userId)
  .collection('daily')
  .doc(today)
  .get()

const usageData = usageSnap.data() || {}
if ((usageData.video_summary || 0) > 0) {
  return NextResponse.json({ error: 'Already generated' }, { status: 429 })
}
```

---

## Client Setup

### Before: Supabase Provider

```typescript
// components/providers.tsx (OLD)
import { createSupabaseClient } from '../lib/supabase'

export function Providers({ children }) {
  const [user, setUser] = useState(null)
  const supabase = createSupabaseClient()
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        // Load profile...
      }
    )
    return () => subscription.unsubscribe()
  }, [])
  
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}
```

### After: Firebase Provider

```typescript
// components/providers.tsx (NEW)
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function Providers({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Load profile from Firestore
        const profileRef = doc(db, 'users', firebaseUser.uid)
        const profileSnap = await getDoc(profileRef)
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data())
        }
      } else {
        setProfile(null)
      }
    })
    
    return () => unsubscribe()
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, profile }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## Rate Limiting Implementation

### Manual Rate Limiting with Firestore

```typescript
// lib/rateLimiter.ts
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function checkRateLimit(
  userId: string,
  limitType: 'tubibot_chat' | 'video_summary' | 'course_summary' | 'mcq_generation' | 'study_notes',
  maxPerDay: number
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]
  const usageRef = doc(db, `ai_usage/${userId}/daily/${today}`)
  
  const usageSnap = await getDoc(usageRef)
  const usageData = usageSnap.data() || {}
  const currentCount = usageData[limitType] || 0
  
  if (currentCount >= maxPerDay) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: maxPerDay - currentCount - 1 }
}

export async function incrementUsage(
  userId: string,
  limitType: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const usageRef = doc(db, `ai_usage/${userId}/daily/${today}`)
  
  const usageSnap = await getDoc(usageRef)
  
  if (usageSnap.exists()) {
    await updateDoc(usageRef, {
      [limitType]: (usageSnap.data()[limitType] || 0) + 1,
      updated_at: serverTimestamp(),
    })
  } else {
    await setDoc(usageRef, {
      [limitType]: 1,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
  }
}
```

---

## Testing Checklist

- [ ] Firebase project created and configured
- [ ] Google OAuth credentials configured
- [ ] Environment variables set (.env.local)
- [ ] Firestore database initialized
- [ ] Security rules deployed
- [ ] Authentication flow working (sign in/out)
- [ ] User profile created on first login
- [ ] Admin role detection working
- [ ] Course creation working
- [ ] YouTube API integration working
- [ ] AI summary generation working
- [ ] Rate limiting enforced
- [ ] TubiBot chat working (10/day limit)
- [ ] Test creation and submission working
- [ ] Points system tracking correctly
- [ ] Streak tracking working
- [ ] Certificate generation working
- [ ] Gamification features functional
- [ ] PWA installable
- [ ] Deployment to production

---

## Migration Checklist

1. **Backend Services**
   - [ ] Firebase Admin SDK initialized
   - [ ] Environment variables configured
   - [ ] Firestore collections created
   - [ ] Security rules deployed
   - [ ] Indexes created for queries

2. **Authentication**
   - [ ] Firebase Auth enabled
   - [ ] Google OAuth configured
   - [ ] User profile creation logic working
   - [ ] Admin detection implemented

3. **API Routes**
   - [ ] All endpoints updated to use Firebase
   - [ ] Error handling updated
   - [ ] Rate limiting implemented
   - [ ] All tests passing

4. **Frontend**
   - [ ] Providers updated for Firebase
   - [ ] Auth context working
   - [ ] Navigation authenticated
   - [ ] Dashboard loading user data

5. **Data**
   - [ ] Sample data migrated (optional)
   - [ ] Firestore structure validated
   - [ ] Queries optimized

6. **Deployment**
   - [ ] Development environment tested
   - [ ] Production Firebase project created
   - [ ] Environment variables set in Cloudflare
   - [ ] Deployed to Cloudflare Pages
   - [ ] End-to-end testing complete

---

## Troubleshooting

### Issue: "Cannot read property 'uid' of null"
**Cause**: User not authenticated
**Solution**: Check auth state, ensure Google OAuth configured

### Issue: "Missing or insufficient permissions"
**Cause**: Security rules blocking access
**Solution**: Check rules, verify user ID in path matches auth.uid

### Issue: "Rate limit exceeded" but count is 0
**Cause**: Document not being created
**Solution**: Check if usageRef.set() is being called before update

### Issue: "Firestore transaction failed"
**Cause**: Concurrent write conflicts
**Solution**: Implement retry logic or use batch writes

---

## Next Steps

1. Set up Firebase project
2. Configure Firestore database
3. Implement Security Rules
4. Update API routes incrementally
5. Test each feature thoroughly
6. Deploy to staging first
7. Migrate user data (if needed)
8. Deploy to production
9. Monitor for issues
10. Clean up Supabase (after verification)

---

## Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Firestore Guide**: https://firebase.google.com/docs/firestore
- **Firebase Auth**: https://firebase.google.com/docs/auth
- **Security Rules**: https://firebase.google.com/docs/rules
- **Admin SDK**: https://firebase.google.com/docs/admin/setup

