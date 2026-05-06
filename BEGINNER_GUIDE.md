# 🎯 TUBERTIFY - EVERYTHING SETUP GUIDE (For Non-Technical Users)

**Don't panic! This guide is written for someone with zero technical knowledge.**

---

## What You're Building

You're building a **learning platform** that uses AI to help students:
- Generate study notes from videos
- Answer questions with AI assistance
- Create practice quizzes
- Summarize long content

It's deployed on the cloud so anyone can access it from anywhere.

---

## The Big Picture

Think of your app like a house:

```
┌─────────────────────────────────────────────┐
│         YOUR APP (The House)                │
│  - Web pages users see                      │
│  - Login system                             │
│  - AI features                              │
└─────────────────────────────────────────────┘
                    ↓
    ┌──────────────────────────────────┐
    │    Internet Services (Utilities)  │
    ├──────────────────────────────────┤
    │ 🔥 Firebase (Your database)       │
    │ 🤖 Google Gemini (AI helper)      │
    │ 🧠 ChatGPT (Smart AI)             │
    │ ☁️ Cloudflare (Cloud hosting)     │
    └──────────────────────────────────┘
```

Each service does a specific job. You need to "turn them on" by getting API keys.

---

## What Each Service Does (Simple Version)

### 🔥 **Firebase** (By Google)
- Stores user accounts (login info)
- Stores your data (courses, notes, etc.)
- Handles user authentication (sign up/sign in)
- **Cost:** Free (you have unlimited requests!)

### 🤖 **Gemini API** (By Google)
- Generates study notes from transcripts
- Answers student questions
- Creates educational content
- **Cost:** Free (1,500 requests per day)

### 🧠 **OpenAI API** (By the company that made ChatGPT)
- Creates quiz questions
- Summarizes long text
- Like ChatGPT but you control it
- **Cost:** $0-20/month (very cheap)

### ☁️ **Cloudflare** (Hosting company)
- Puts your app on the internet
- Makes it super fast worldwide
- Prevents hacking/attacks
- **Cost:** Free

---

## Step-by-Step Setup (4 Easy Steps)

### **STEP 1: Get Your API Keys** (15 minutes)

You need to "turn on" 4 services and get keys. Think of it like getting passwords/credentials.

**DO THIS IN ORDER:**

#### A) Firebase
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name it: `tubertify`
4. Click "Create project" (wait 1 minute)
5. When done, click the gear icon ⚙️ → "Project Settings"
6. Copy these 6 values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
7. Go to "Service Accounts" tab
8. Click "Generate New Private Key"
9. Download the JSON file (keep it safe!)
10. Open it in a text editor and copy the entire contents

**SAVE THESE VALUES - YOU'LL NEED THEM LATER**

#### B) Gemini API (Google AI)
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Select "Create API key in new GCP project"
5. Copy the key (it's a long string)

**SAVE THIS VALUE**

#### C) OpenAI API (ChatGPT)
1. Go to: https://platform.openai.com
2. Sign up or sign in
3. Go to "API Keys" (left menu)
4. Click "Create new secret key"
5. **COPY IT IMMEDIATELY** (you won't see it again!)
6. Go to "Billing" and add your credit card
7. Set a spending limit (like $20/month)

**SAVE THIS VALUE - VERY IMPORTANT!**

#### D) Cloudflare (Hosting)
1. Go to: https://www.cloudflare.com
2. Click "Sign up"
3. Create an account
4. Go to "Account Home" (top-left)
5. Find your "Account ID" and copy it

**SAVE THIS VALUE**

---

### **STEP 2: Create the `.env.local` File** (2 minutes)

This file tells your app all the API keys it needs.

**⚠️ IMPORTANT:** This file is SECRET! Never share it or upload it to GitHub.

1. Open your project folder
2. Create a new file named `.env.local` (note: it starts with a dot)
3. Copy and paste this (replace with YOUR values):

```
NEXT_PUBLIC_FIREBASE_API_KEY=paste_your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"your-project",...}

NEXT_PUBLIC_GEMINI_API_KEY=paste_your_gemini_key_here
OPENAI_API_KEY=sk-paste_your_openai_key_here

NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=paste_your_cloudflare_account_id_here
NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME=tubertify
```

4. Save the file

**DONE! Your app now knows all the API keys.**

---

### **STEP 3: Test It Locally** (5 minutes)

"Locally" means running it on your computer before putting it on the internet.

1. Open Command Prompt/Terminal
2. Navigate to your project folder
3. Type these commands (one at a time):

```bash
npm install
npm run dev
```

4. When it says "ready", go to: http://localhost:3000
5. You should see your app loading!

**TEST IT:**
- Try signing up with an email
- Try signing in with Google
- Check that it doesn't show any red errors

**If something breaks:** Read [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)

---

### **STEP 4: Deploy to the Internet** (10 minutes)

"Deploy" = putting your app on the internet so everyone can use it.

1. Go to: https://www.cloudflare.com
2. Click "Pages" (left sidebar)
3. Click "Create a project"
4. Choose "Connect to Git"
5. Select your `tubertify` repository
6. Use these settings:
   - Project name: `tubertify`
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output: `.next`
7. Click "Save and deploy"
8. Add your environment variables:
   - Go to **Settings** > **Environment variables**
   - Add all the values from your `.env.local` file
   - Mark API keys as "Encrypted"
9. Your app is now live at: `https://tubertify.pages.dev`

**Every time you push code to GitHub, Cloudflare automatically deploys it!**

---

## Cost Breakdown

**Monthly costs:**

| Service | How much? | Why? |
|---------|-----------|------|
| Firebase | **FREE** | Generous free tier |
| Gemini | **FREE** | 1,500 requests/day included |
| OpenAI | **$0-20** | Based on usage |
| Cloudflare | **FREE** | Unlimited requests |
| **TOTAL** | **~$0-20/month** | Very affordable! |

**💡 TIP:** Set a spending limit on OpenAI ($20) so you don't get surprised bills.

---

## Understanding the Files

### Important Files You Created:
- **`.env.local`** - Your secret API keys (DO NOT SHARE!)
- **`.env.local.example`** - Template showing what values you need

### Documentation Files (Read These!):
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute guide (START HERE)
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete detailed instructions
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - How to put it on the internet
- **[API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md)** - Explanation of each API

### Code Files (Already Done):
- **`app/api/assistant/route.ts`** - AI answering questions
- **`app/api/ai-notes/route.ts`** - AI generating study notes
- **`app/api/quiz/route.ts`** - AI creating quizzes
- **`app/api/summary/route.ts`** - AI summarizing text
- **`lib/openai.ts`** - ChatGPT integration
- **`lib/gemini.ts`** - Google Gemini integration

---

## Troubleshooting (Common Problems)

### "Build failed"
→ Check your `.env.local` file has all values
→ Run `npm install` first
→ Check Cloudflare build logs for errors

### "Firebase not working"
→ Check your Firebase values are correct
→ Make sure you enabled Firestore in Firebase Console
→ Check browser console for error messages

### "API key invalid"
→ Copy the key again (no extra spaces!)
→ Check it's for the right service
→ Try regenerating a new key

### "Can't see my app at localhost"
→ Is the dev server still running?
→ Try http://localhost:3000 (not http://localhost)
→ Check for error messages in the terminal

### "Site not working after deployment"
→ Check environment variables in Cloudflare are set
→ Check if OpenAI has a billing issue
→ Look at Cloudflare build logs

---

## Monitoring Your App

### Check If Things Are Working:

1. **Firebase** → https://console.firebase.google.com/
   - See how many users signed up
   - Check your database

2. **OpenAI Usage** → https://platform.openai.com/account/usage/overview
   - See how much you've used
   - Check your spending

3. **Cloudflare Analytics** → Your Cloudflare dashboard
   - See how many people visited
   - Check for errors

---

## Security Rules (IMPORTANT!)

### ✅ DO:
- Keep `.env.local` safe (never share!)
- Never commit `.env.local` to GitHub
- Keep API keys secret
- Set spending limits on OpenAI
- Monitor your API usage regularly

### ❌ DON'T:
- Put API keys in code comments
- Share `.env.local` via email
- Tell people your API keys
- Leave `.env.local` in GitHub
- Forget to set OpenAI spending limit

---

## Quick Reference - What to do if you're confused

| You want to... | Do this... |
|---|---|
| **Start from scratch** | Read [QUICKSTART.md](./QUICKSTART.md) |
| **Get API keys** | Follow "Step 1" above |
| **Understand the APIs** | Read [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) |
| **Deploy to internet** | Follow "Step 4" above then read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| **Fix an error** | Check relevant documentation troubleshooting section |
| **Check if everything works** | Use [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) |

---

## Summary

### You have:
✅ A fully built app
✅ All code ready to go
✅ All integrations configured
✅ Comprehensive documentation
✅ GitHub repository set up

### You need to do:
1. Get 4 API keys (15 min)
2. Create `.env.local` file (2 min)
3. Test locally (5 min)
4. Deploy (10 min)

**Total time: ~45 minutes**

---

## Support Resources

- **Stuck?** Read the relevant documentation file
- **API questions?** Check [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md)
- **Deployment questions?** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Setup questions?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Service docs:** Google them (Firebase docs, OpenAI docs, etc.)

---

**You've got this! Follow the steps above and you'll have a working AI-powered learning platform in less than an hour. 🚀**

