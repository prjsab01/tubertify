# 🚀 Tubertify Deployment Guide

This guide explains how to deploy Tubertify to Cloudflare Pages using Firebase for the backend and Gemini for AI.

## ✅ What is required

- GitHub repository: `prjsab01/tubertify`
- Cloudflare account with Pages enabled
- Firebase project with Authentication and Firestore
- Firebase service account JSON for `FIREBASE_ADMIN_SDK_KEY`
- Google Gemini API keys
- YouTube Data API key (required for playlist import)
- `ADMIN_EMAIL_HASH` for admin recognition

## 📦 Cloudflare Pages setup

1. In Cloudflare Pages, create or open the `tubertify` project.
2. Connect the GitHub repo `prjsab01/tubertify`.
3. Set the production branch to `main`.
4. Set the build command to:

```bash
npx @cloudflare/next-on-pages@1
```

5. Set the build output directory to:

```text
.vercel/output/static
```

6. Enable automatic deployments on push to `main`.
7. Do not add old Supabase variables; only add Firebase/Gemini/YouTube-related env vars.

## 🔑 Environment variables

### Plaintext variables
These are public-facing values and can be stored as normal Cloudflare Pages variables.

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Secret variables
These values should be stored as secret environment variables in Cloudflare Pages.

- `FIREBASE_ADMIN_SDK_KEY`
  - Use the full Firebase service account JSON string in Cloudflare Pages.
  - Locally, `lib/firebaseAdmin.ts` also supports a file path such as `./tubertify-firebase-adminsdk-fbsvc-f05a8f2785.json`.
- `GEMINI_API_KEY_1`
- `GEMINI_API_KEY_2`
- `GEMINI_API_KEY_3`
- `YOUTUBE_API_KEY`
- `ADMIN_EMAIL_HASH`

### Not required

Remove or ignore the old Supabase settings in Cloudflare Pages:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📌 Firebase configuration notes

- Enable **Firebase Authentication** and allow Google sign-in.
- Enable **Firestore** in the Firebase console.
- Generate a Firebase service account JSON and paste it into `FIREBASE_ADMIN_SDK_KEY` as a secret.
- Confirm `FIREBASE_ADMIN_SDK_KEY` is valid JSON in Cloudflare.

## 🌐 Cloudflare Pages variables summary

Use **plaintext** for the `NEXT_PUBLIC_FIREBASE_*` values.
Use **secret** for:

- `FIREBASE_ADMIN_SDK_KEY`
- `GEMINI_API_KEY_1`
- `GEMINI_API_KEY_2`
- `GEMINI_API_KEY_3`
- `YOUTUBE_API_KEY`
- `ADMIN_EMAIL_HASH`

## 📌 Build and deployment

- When you push code to `main`, Cloudflare Pages will automatically run the build.
- The app uses the build command configured in the dashboard.
- The app output is served from `.vercel/output/static`.

## 🎯 YouTube integration

- The app uses `YOUTUBE_API_KEY` for playlist import and YouTube metadata retrieval.
- Because `YOUTUBE_API_KEY` is used in server-side API routes, it must be stored as a secret.
- If `YOUTUBE_API_KEY` is missing, playlist import will fail.

## 🧠 Gemini integration

- The current app uses three Gemini keys for separate tasks:
  - `GEMINI_API_KEY_1` for summaries
  - `GEMINI_API_KEY_2` for notes and MCQs
  - `GEMINI_API_KEY_3` for the chat assistant
- Store all three as secrets in Cloudflare Pages.

## 🛠️ Local development

- Use `.env.local` to store development values.
- For local Firebase Admin access, you can use a file path in `FIREBASE_ADMIN_SDK_KEY`.
- Example:

```env
FIREBASE_ADMIN_SDK_KEY=./tubertify-firebase-adminsdk-fbsvc-f05a8f2785.json
```

## ✅ Final note

This repo is aligned with Firebase and Gemini. The old Supabase deployment steps are no longer applicable.
