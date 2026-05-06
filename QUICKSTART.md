# Tubertify - Quick Start (5 Minutes)

**Don't know where to start? This is your guide.**

---

## What You Need (Before You Start)

1. **A Google Account** - for Firebase and Gemini API (FREE)
2. **An OpenAI Account** - for ChatGPT API ($5-20/month typical)
3. **A Cloudflare Account** - for hosting (FREE)
4. **GitHub Account** - to push code (FREE)
5. **Installed on your computer**: Node.js ([download](https://nodejs.org/) v18 or newer)

---

## Step 1: Get Your Credentials (15 minutes)

### Firebase (Google)
1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Click **"Add project"** → name it `tubertify`
3. Wait for it to create (usually 1 min)
4. Click on your project
5. Click the **gear icon** (⚙️) top-left → **Project Settings**
6. Under **"Your apps"**, copy the values next to:
   - `apiKey` → will use this
   - `authDomain` → will use this
   - `projectId` → will use this
   - `storageBucket` → will use this
   - `messagingSenderId` → will use this
   - `appId` → will use this
7. Go to **Service Accounts** tab → **Generate New Private Key** → download (keep safe!)

**Done with Firebase! ✅**

### Gemini API (Google AI)
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Select **"Create API key in new GCP project"**
4. Copy the key

**Done with Gemini! ✅**

### OpenAI (ChatGPT)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or sign in
3. Go to **API Keys** (left sidebar)
4. Click **"Create new secret key"**
5. **Copy immediately** (you won't see it again!)
6. Go to **Billing** → add your credit card

**Done with OpenAI! ✅**

### Cloudflare
1. Go to [cloudflare.com](https://cloudflare.com)
2. Click **"Sign up"**
3. Enter email and password
4. After signing in, go to **Account Home** (top-left)
5. Scroll down and copy your **Account ID**

**Done with Cloudflare! ✅**

---

## Step 2: Create `.env.local` File (2 minutes)

In your project folder, create a file called `.env.local` and paste this (replace with YOUR values):

```
NEXT_PUBLIC_FIREBASE_API_KEY=paste_your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"your-project",...}

NEXT_PUBLIC_GEMINI_API_KEY=paste_your_gemini_key_here
OPENAI_API_KEY=sk-paste_your_openai_key_here

NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=paste_your_cloudflare_account_id
NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME=tubertify
```

**⚠️ Important**: Don't share this file! It's in `.gitignore` so it won't upload to GitHub.

---

## Step 3: Run Locally (1 minute)

In your terminal/command prompt:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open: http://localhost:3000

You should see the Tubertify website!

---

## Step 4: Deploy to Cloudflare Pages (5 minutes)

### First Time Only:
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Pages** (left sidebar)
3. Click **"Create a project"**
4. Select **"Connect to Git"**
5. Authorize Cloudflare to access GitHub
6. Select your `tubertify` repository
7. Use these settings:
   - **Project name**: `tubertify`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
8. Click **"Save and deploy"**
9. Add your environment variables:
   - Go to **Settings** → **Environment variables**
   - Add all the variables from your `.env.local`
   - For sensitive ones (API keys), check "Encrypt"

### Every Time After:
- Just push to GitHub: `git push origin main`
- Cloudflare automatically deploys!
- Your site is live at: `https://tubertify.pages.dev`

---

## What Now?

Your app is deployed! 🎉

**Next:**
1. Test it at `https://tubertify.pages.dev`
2. Try signing up
3. Test the AI features

**If something doesn't work:**
1. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) - detailed troubleshooting
2. Check [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) - common issues
3. Check Cloudflare dashboard for deployment errors

---

## Costs

**Monthly breakdown:**
- Firebase: **FREE** (generous free tier)
- Gemini: **FREE** (1,500 requests/day)
- OpenAI: **$0-20/month** (depends on usage, start small)
- Cloudflare: **FREE** (unlimited requests)

**Total: Mostly FREE! ✅** (just set budget on OpenAI)

---

## Important Reminders

✅ **DO:**
- Save your API keys safely
- Add `.env.local` to `.gitignore` (already done)
- Monitor OpenAI usage to avoid surprises
- Test locally before deploying

❌ **DON'T:**
- Commit `.env.local` to GitHub
- Share API keys in emails/chat
- Leave API keys in code comments
- Forget to set OpenAI billing limit

---

## Need Help?

Read these in order:
1. **Quick issues?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)
2. **API problems?** → [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md#troubleshooting)
3. **Deployment issues?** → [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)
4. **Detailed setup?** → [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

---

**You're all set!** 🚀 Your app is live, secure, and scalable.

