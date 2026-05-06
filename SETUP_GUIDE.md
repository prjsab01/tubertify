# Tubertify - Complete Setup Guide

This guide walks you through setting up Tubertify with Firebase, Gemini API, OpenAI API, and Cloudflare Pages deployment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [API Keys Setup](#api-keys-setup)
4. [Environment Variables](#environment-variables)
5. [Local Development](#local-development)
6. [Deployment](#deployment)

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A GitHub account (for repository)
- A Cloudflare account (for deployment)
- Google account (for Firebase and Gemini)

---

## Firebase Setup

Firebase is used for authentication and database storage.

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or "Create a project")
3. Enter project name: `tubertify` or similar
4. Accept the terms and click "Continue"
5. Enable Google Analytics (optional) and click "Create project"
6. Wait for project creation to complete

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Under **Sign-in providers**, enable:
   - **Google** - Click, enable toggle, add your email as support email
   - **Email/Password** - Click, enable toggle
4. Save

### Step 3: Create Firestore Database

1. Go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose **location** (closest to your users)
4. Start in **production mode**
5. Click **"Create"**

### Step 4: Set Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid in request.resource.data.authorizedUsers;
    }
    match /usage/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /ai-notes/{docId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

### Step 5: Get Firebase Credentials

1. In Firebase Console, click **"Project Settings"** (gear icon, top-left)
2. Go to **"Your apps"** tab
3. If no apps exist, click **"Add app"** and select web icon (`</>`):
   - App nickname: `tubertify-web`
   - Click **"Register app"**
4. Copy the configuration object - you'll need these values:

```
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 6: Generate Service Account Key

1. In Firebase Console, go to **Project Settings**
2. Go to **"Service Accounts"** tab
3. Click **"Generate New Private Key"**
4. A JSON file will download - this is your **FIREBASE_ADMIN_SDK_KEY**
5. Keep this file safe! **Never commit it to GitHub**

---

## API Keys Setup

### Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new GCP project"**
5. Copy the API key
6. Set as `NEXT_PUBLIC_GEMINI_API_KEY` in `.env.local`

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key immediately (you won't see it again)
5. Set as `OPENAI_API_KEY` in `.env.local`

**Important**: You'll need a billing plan on OpenAI to use the API. Set up payment in Account Settings.

---

## Environment Variables

### Step 1: Create `.env.local` File

In the project root directory, create a file named `.env.local`:

```bash
# ========================
# Firebase Configuration
# ========================
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"..."}

# ========================
# AI API Keys
# ========================
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_KEY
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY

# ========================
# Cloudflare Configuration
# ========================
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME=tubertify
```

### Step 2: Important Security Notes

**Never commit `.env.local` to GitHub!** It contains sensitive credentials.

- The file is already in `.gitignore`
- Only share `.env.local.example` (which has placeholder values)
- Each developer/environment should have their own `.env.local`

---

## Local Development

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Step 3: Test Authentication

1. Open http://localhost:3000
2. Try logging in with Google or Email/Password
3. Check Firebase Console > Authentication to see the user was created

### Step 4: Test APIs

Test the AI endpoints:

```bash
# Test Gemini API (AI Assistant)
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "question": "What is machine learning?",
    "context": "Learning about AI"
  }'

# Test AI Notes Generation
curl -X POST http://localhost:3000/api/ai-notes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "courseId": "course-1",
    "moduleId": "module-1",
    "videoId": "video-1",
    "title": "Introduction to Python",
    "transcript": "Python is a programming language..."
  }'
```

---

## Next Steps

- Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to deploy to Cloudflare Pages
- Check [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) for detailed API documentation
- See [TUBERTIFY_ARCHITECTURE_SUMMARY.md](./TUBERTIFY_ARCHITECTURE_SUMMARY.md) for technical architecture

---

## Troubleshooting

### Firebase SDK Not Loading

**Problem**: Error like "Firebase not initialized"

**Solution**:
1. Check `.env.local` has all NEXT_PUBLIC_FIREBASE_* variables
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Gemini API Errors

**Problem**: "401 Unauthorized" or "Invalid API Key"

**Solution**:
1. Verify `NEXT_PUBLIC_GEMINI_API_KEY` is set correctly
2. Check key hasn't expired in Google AI Studio
3. Restart dev server

### OpenAI API Errors

**Problem**: "403 Forbidden" or billing issues

**Solution**:
1. Verify `OPENAI_API_KEY` is correct
2. Check OpenAI account has active billing
3. Verify API key has access to required models

### Firestore Rules Blocking Access

**Problem**: "Permission denied" errors

**Solution**:
1. Check Firestore Rules in Firebase Console
2. Ensure rules allow read/write for authenticated users
3. Verify document paths match rule paths

---

## Support

For issues:
1. Check Firebase Console for error logs
2. Check browser console for JavaScript errors
3. Review environment variables are set correctly
4. Restart development server

