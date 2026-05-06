# Tubertify - API Keys & Services Guide

Quick reference for all API keys and services used in Tubertify.

## Summary Table

| Service | Purpose | Cost | Key Type | Used For |
|---------|---------|------|----------|----------|
| Firebase | Authentication & Database | Free tier available | Client + Admin | User auth, data storage |
| Gemini API | AI text generation | Free tier available | REST API Key | Course content, study notes, quizzes |
| Cloudflare Pages | Hosting & CDN | Free tier available | Account ID | Production deployment |

---

## 1. Firebase

**What it does**: User authentication and real-time database

**Cost**: Free tier includes:
- 25,000 authentications/month
- 1GB storage
- 50,000 reads/writes/day

### Getting Firebase Keys

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Under **"Your apps"**, copy from the web app config:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Getting Firebase Admin Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Project Settings**
3. Go to **"Service Accounts"** tab
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Copy entire JSON content → `FIREBASE_ADMIN_SDK_KEY`

**⚠️ IMPORTANT**: Never commit this JSON file or key to GitHub!

### Used In

- `lib/firebaseClient.ts` - Client-side authentication and data reading
- `lib/firebaseAdmin.ts` - Server-side admin operations (creating user profiles, etc.)
- `components/Providers.tsx` - Auth context for entire app

### Features Used

- **Authentication**: Email/Password + Google Sign-In
- **Firestore Database**: 
  - User profiles (`/users/{userId}`)
  - Usage tracking (`/usage/{userId}`)
  - Courses (`/courses/{courseId}`)
  - AI notes (`/ai-notes/{docId}`)

---

## 2. Gemini API

**What it does**: AI text generation (provided by Google)

**Cost**: Free tier includes:
- 60 requests/minute
- 1,500 requests/day (free)

**Pricing** (if exceeds free tier):
- $0.000075 per input token
- $0.000300 per output token

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Choose **"Create API key in new GCP project"**
5. Copy the API key
6. Set as `NEXT_PUBLIC_GEMINI_API_KEY`

**Note**: This is different from Firebase! Don't mix them up.

### Used In

- `lib/gemini.ts` - Core Gemini API integration
- `app/api/assistant/route.ts` - AI assistant endpoint
- `app/api/ai-notes/route.ts` - AI note generation

### Features Used

- **Model**: `gemini-pro`
- **Max tokens**: 500-1000 (configurable)
- **Temperature**: 0.5-0.8 (affects creativity)

### Example Request

```bash
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "question": "What is recursion?",
    "context": "Programming fundamentals course"
  }'
```

### Rate Limiting

Tubertify implements per-user limits:
- 10 assistant questions/day
- 5 AI notes generation/day

---

## 3. Cloudflare Pages

**What it does**: Hosting and global CDN

**Cost**: Free tier includes:
- Unlimited sites
- Unlimited requests
- 200,000 function invocations/month
- Free SSL/TLS

### Getting Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Account Home"** (top-left)
3. Scroll to find **"Account ID"**
4. Copy it → `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID`

### Deployment

Cloudflare Pages automatically deploys from GitHub:

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variables
5. Deploy on every push to `main` branch

### Used In

- `wrangler.toml` - Deployment configuration
- `package.json` - `pages:deploy` script
- Production deployment and CDN

---

## Environment Variables Summary

Create `.env.local` with all these values:

```bash
# Firebase (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=<web_app_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app_id>
FIREBASE_ADMIN_SDK_KEY={"type":"service_account",...}

# Gemini (get from Google AI Studio)
NEXT_PUBLIC_GEMINI_API_KEY=<your_gemini_key>

# Cloudflare (get from Dashboard)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=<account_id>
NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME=tubertify
```

---

## Security Best Practices

### Do's ✅
- Store keys in `.env.local` (not in code)
- Use `NEXT_PUBLIC_` prefix only for public keys
- Regenerate keys immediately if exposed
- Use environment variables on production (Cloudflare Pages)
- Rotate keys quarterly

### Don'ts ❌
- Never commit `.env.local` to GitHub
- Don't share API keys in emails or chat
- Don't use same key for dev and production
- Don't leave keys in browser console
- Don't hardcode keys in source files

---

## Monitoring Costs

### Firebase
- Go to Firebase Console > **Project Settings** > **Billing**
- View usage and set spending limits

### Gemini API
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Check **"Billing"** section
- View API usage by service

---

## Troubleshooting

### "API key invalid" error
- Verify key matches the service
- Check for extra spaces or typos
- Regenerate key if uncertain
- Restart development server

### "Rate limit exceeded"
- Wait before making more requests
- Check daily/monthly quotas
- Upgrade to paid plan if needed

### "Unauthorized" error
- Firebase: Check Firestore security rules
- Gemini: Check API is enabled in Google Cloud

### "Rate limit exceeded"
- Wait before making more requests
- Free tier allows 1,500 requests/day for Gemini
- Upgrade to paid plan if needed

---

## Support Links

- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev/tutorials/python_quickstart)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

