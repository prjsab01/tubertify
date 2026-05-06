# AI Course Builder

A starter Next.js app for creating module-based courses from YouTube playlists, with AI-powered notes and a helper assistant.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root from `.env.local.example` and add your values.
3. Run the app:
   ```bash
   npm run dev
   ```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable Authentication and choose Email/Password and Google sign-in.
3. Enable Firestore in test mode for development.
4. Copy the Firebase config values into `.env.local` using the `NEXT_PUBLIC_FIREBASE_*` names.

Example `.env.local` values:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

## Deploy to Cloudflare Pages

1. Create a Cloudflare Pages site and connect your Git repository.
2. In the Pages build settings, set:
   - Build command: `npm run build`
   - Build output directory: `.next`
3. Add the same env vars in Cloudflare Pages as secrets:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `OPENAI_API_KEY`
   - `YOUTUBE_API_KEY`
4. If you want to deploy from the command line, install Wrangler and run:
   ```bash
   npm run pages:deploy
   ```

> Note: Cloudflare Pages can build the app using the standard Next.js build output. If you want to use the CLI, `wrangler pages deploy` is available for manual deployment.

## Files and placeholders

- `lib/firebaseClient.ts` — Firebase client initialization.
- `lib/auth.ts` — Firebase auth helpers for login/register/logout.
- `lib/firestore.ts` — Firestore helpers for saving and loading courses.
- `lib/firebaseAdmin.ts` — Placeholder for future server-side Firebase Admin setup.
- `app/page.tsx` — Main page with auth, playlist import, course builder, AI assistant, and Firestore save.
- `.env.local.example` — Environment variable template.

## What to add

- In `.env.local`, add your Firebase config and API keys.
- `YOUTUBE_API_KEY` is used for playlist import.
- `OPENAI_API_KEY` is used for AI assistant requests.
- If you want backend admin access later, set `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PROJECT_ID`.

## Notes

- The current app uses Firebase Auth and Firestore from the client side.
- You can extend with server-side API routes and Firebase Admin security later.
