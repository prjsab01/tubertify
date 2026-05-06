# Tubertify - Cloudflare Pages Deployment Guide

This guide explains how to deploy Tubertify to Cloudflare Pages for free hosting and CDN.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Cloudflare Setup](#cloudflare-setup)
3. [GitHub Integration](#github-integration)
4. [Environment Variables](#environment-variables)
5. [Deployment](#deployment)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure:
- Code is pushed to GitHub repository
- Cloudflare account (free tier available)
- All environment variables are configured
- Project builds successfully locally: `npm run build`

---

## Cloudflare Setup

### Step 1: Create Cloudflare Account

1. Go to [Cloudflare](https://www.cloudflare.com)
2. Click **"Sign up"**
3. Enter email and password
4. Verify email
5. Choose your plan (free plan is sufficient for Tubertify)

### Step 2: Add Your Domain (Optional)

If you have a custom domain:

1. In Cloudflare Dashboard, click **"Add site"**
2. Enter your domain name
3. Select your plan (free is fine)
4. Update nameservers at your domain registrar
5. Wait for nameserver verification (usually 5-10 minutes)

### Step 3: Get Your Cloudflare Account ID

1. In Cloudflare Dashboard, go to **"Account Home"** (top-left)
2. Scroll down to find your **Account ID**
3. Copy it - you'll need this for `.env.local` and `wrangler.toml`

---

## GitHub Integration

Cloudflare Pages automatically deploys when you push to GitHub.

### Step 1: Connect GitHub

1. In Cloudflare Dashboard, go to **Pages** (left sidebar)
2. Click **"Create a project"**
3. Select **"Connect to Git"**
4. Authorize Cloudflare to access your GitHub account
5. Select the `tubertify` repository
6. Click **"Begin setup"**

### Step 2: Configure Build Settings

1. **Project name**: `tubertify` (or your preferred name)
2. **Production branch**: `main`
3. **Build command**: `npm run build`
4. **Build output directory**: `.next`
5. Click **"Save and deploy"**

---

## Environment Variables

### Step 1: Set Environment Variables in Cloudflare

1. In Cloudflare Pages, go to your project settings
2. Go to **"Settings"** > **"Environment variables"**
3. Add these variables:

**Production environment:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

FIREBASE_ADMIN_SDK_KEY={"type":"service_account",...}

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME=tubertify
```

**For each variable:**
1. Click **"Add variable"**
2. Enter key name
3. Enter value
4. Click **"Add"**

### Step 2: Mark Sensitive Variables

For sensitive values (API keys), check the **"Encrypt"** option:
- `FIREBASE_ADMIN_SDK_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY`

### Step 3: Verify Build Configuration

1. Go to **"Builds"** tab to see deployment history
2. Click latest build to see logs
3. If build fails, check error message and logs

---

## Deployment

### Automatic Deployment

Every time you push to the `main` branch, Cloudflare automatically:
1. Pulls latest code from GitHub
2. Runs `npm run build`
3. Deploys to the CDN

### Manual Deployment (Optional)

Using Wrangler CLI:

```bash
# First, authenticate with Cloudflare
wrangler login

# Then deploy
npm run pages:deploy
```

### Watch Deployment Status

1. In Cloudflare Pages project dashboard
2. Go to **"Deployments"** tab
3. See deployment status in real-time
4. View build logs by clicking on a deployment

### Preview URLs

Cloudflare provides:
- **Production URL**: `https://tubertify.pages.dev/`
- **Preview URLs**: For each PR (if connected to GitHub)

---

## Post-Deployment

### Step 1: Verify Deployment

1. Visit your deployment URL
2. Test authentication (sign up / sign in)
3. Test API endpoints
4. Check browser console for errors

### Step 2: Configure Custom Domain

If you have a domain:

1. In Cloudflare Pages, go to **"Custom domain"**
2. Enter your domain: `tubertify.yourdomain.com`
3. Cloudflare will configure DNS automatically
4. Takes effect in 1-2 minutes

### Step 3: Enable Advanced Security

1. In Cloudflare Dashboard, go to **"Security"**
2. Enable **"DDoS Protection"** (automatic on free plan)
3. Configure **"WAF"** (Web Application Firewall) if needed
4. Set up **"SSL/TLS"** encryption (automatic)

### Step 4: Monitor Performance

1. In Cloudflare Pages, go to **"Analytics"**
2. View:
   - Request count
   - Status codes (200, 404, 500, etc.)
   - Performance metrics
   - Bandwidth usage

---

## Troubleshooting

### Build Fails

**Check:**
1. Logs in Cloudflare: **Deployments** > Click failed build
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies in `package.json`

**Solution:**
1. Fix the issue locally
2. Run `npm run build` to verify
3. Push to GitHub
4. Cloudflare will auto-retry

### Environment Variables Not Working

**Check:**
1. Variable names are exact (case-sensitive)
2. Values don't have extra spaces
3. Encrypted variables are properly set
4. Redeploy after adding variables

**Solution:**
1. Go to Pages > **Settings** > **Environment variables**
2. Delete and re-add the variable
3. Trigger new deployment by pushing to GitHub

### API Requests Fail

**Check:**
1. API keys are valid and active
2. Firestore/Firebase rules allow the request
3. Browser console for specific error messages

**Solution:**
1. Verify API keys in Cloudflare environment variables
2. Check Firebase and Gemini consoles for errors
3. Test locally with same credentials

### Database Connection Issues

**Check:**
1. Firestore is accessible from Cloudflare's region
2. Firebase security rules allow requests
3. No IP blocking or firewall issues

**Solution:**
1. Test locally to verify Firebase works
2. Check Firestore Rules tab in Firebase Console
3. Enable Firebase access from Cloudflare IPs if needed

---

## Monitoring & Maintenance

### Regular Checks

1. **Weekly**: Review error logs in Cloudflare Analytics
2. **Monthly**: Check API usage and costs (Gemini)
3. **Quarterly**: Update dependencies: `npm update`

### Performance Optimization

1. **Cache**: Cloudflare caches static assets automatically
2. **Image Optimization**: Use Cloudflare Image Optimization
3. **API Rate Limiting**: Configure in Cloudflare if needed

### Scaling

Cloudflare Pages scales automatically. For high traffic:
1. Monitor usage in Analytics
2. Monitor Gemini API usage and quotas
3. Adjust app usage if you near quota limits

---

## Support

For Cloudflare-specific issues:
- Check [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- Check [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- Review deployment logs in Cloudflare Dashboard

