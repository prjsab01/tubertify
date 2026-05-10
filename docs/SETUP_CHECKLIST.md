# Tubertify - Complete Setup Checklist

Use this checklist to ensure all services are configured correctly.

## Phase 1: Firebase Setup ✓

- [ ] Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- [ ] Authentication enabled:
  - [ ] Google Sign-In configured
  - [ ] Email/Password enabled
  - [ ] Support email added
- [ ] Firestore Database created:
  - [ ] Database location selected
  - [ ] Production mode enabled
  - [ ] Security rules deployed (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))
- [ ] Web app registered in Firebase
- [ ] Firebase config values copied:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Service Account Key generated and saved securely
- [ ] `FIREBASE_ADMIN_SDK_KEY` prepared (keep secure, never commit)

## Phase 2: API Keys Setup ✓

### Gemini API
- [ ] Google account with API access enabled
- [ ] Visited [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] API key created
- [ ] `NEXT_PUBLIC_GEMINI_API_KEY` copied
- [ ] Free tier quota verified (1,500 requests/day)

## Phase 3: Environment Variables ✓

- [ ] `.env.local` file created in project root
- [ ] `.env.local` added to `.gitignore` (should already be there)
- [ ] All variables from [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) added:
  - [ ] All `NEXT_PUBLIC_FIREBASE_*` variables
  - [ ] `FIREBASE_ADMIN_SDK_KEY`
  - [ ] `NEXT_PUBLIC_GEMINI_API_KEY`
  - [ ] `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID`
  - [ ] `NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME`

## Phase 4: Local Development ✓

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Project builds successfully (`npm run build`)
- [ ] Development server starts (`npm run dev`)
- [ ] Frontend loads at `http://localhost:3000`
- [ ] No console errors visible

### Testing Local Features
- [ ] Firebase authentication works (sign up / sign in)
- [ ] User profile created in Firestore after sign up
- [ ] Gemini API responds: test at `/api/assistant`
- [ ] Rate limiting functions correctly

### API Testing Commands
```bash
# Test Gemini (Assistant)
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","question":"What is AI?","context":"Learning"}'
```

- [ ] Gemini API test successful
- [ ] No rate limit errors (initial requests should pass)

## Phase 5: Code Review ✓

- [ ] `lib/firebaseClient.ts` - Client-side Firebase initialized
- [ ] `lib/firebaseAdmin.ts` - Server-side admin initialized
- [ ] `lib/gemini.ts` - Gemini integration working
- [ ] `components/Providers.tsx` - Auth context using Firebase
- [ ] `app/api/assistant/route.ts` - Uses Gemini API
- [ ] `app/api/ai-notes/route.ts` - Uses Gemini API
- [ ] `app/api/user/route.ts` - Creates Firebase users
- [ ] No references to Supabase remaining
- [ ] No hardcoded API keys in any files

## Phase 6: GitHub & Deployment Prep ✓

- [ ] Repository pushed to GitHub: https://github.com/prjsab01/tubertify
- [ ] `.gitignore` includes `.env.local`
- [ ] `.env.local.example` has placeholder values (no real keys)
- [ ] All files committed and pushed
- [ ] No merge conflicts
- [ ] `main` branch is up to date

## Phase 7: Cloudflare Pages Setup ✓

- [ ] Cloudflare account created
- [ ] Account ID obtained from Dashboard
- [ ] GitHub integration connected to Cloudflare Pages
- [ ] Repository selected and connected
- [ ] Build settings configured:
  - [ ] Project name: `tubertify`
  - [ ] Production branch: `main`
  - [ ] Build command: `npm run build`
  - [ ] Build output: `.next`

## Phase 8: Environment Variables in Cloudflare ✓

- [ ] Cloudflare Pages project created
- [ ] Environment variables added for production:
  - [ ] All `NEXT_PUBLIC_FIREBASE_*` variables
  - [ ] `FIREBASE_ADMIN_SDK_KEY` (marked as encrypted)
  - [ ] `NEXT_PUBLIC_GEMINI_API_KEY` (marked as encrypted)
  - [ ] `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID`
  - [ ] `NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME`
- [ ] Variables double-checked for typos
- [ ] Sensitive variables encrypted

## Phase 9: Deployment Testing ✓

- [ ] First deployment triggered (push to `main` or manual trigger)
- [ ] Build logs reviewed for errors
- [ ] Deployment successful (green status)
- [ ] Production URL accessible: `https://tubertify.pages.dev`
- [ ] Homepage loads without errors
- [ ] No 404 or 500 errors in production

### Production Testing
- [ ] Sign up/Login works in production
- [ ] Firestore reads/writes work
- [ ] Gemini API responds in production
- [ ] Console has no errors
- [ ] All pages load quickly

## Phase 10: Custom Domain (Optional) ✓

- [ ] Domain obtained
- [ ] Custom domain configured in Cloudflare Pages
- [ ] DNS pointing to Cloudflare
- [ ] SSL/TLS certificate active
- [ ] Site accessible at custom domain
- [ ] HTTPS working (green lock icon)

## Phase 11: Monitoring & Security ✓

- [ ] Firebase security rules reviewed and deployed
- [ ] API rate limits configured (assist, notes, quiz, summary)
- [ ] Cloudflare DDoS protection enabled
- [ ] Cloudflare WAF configured (if needed)
- [ ] Error logging set up
- [ ] Budget alerts configured:
  - [ ] Firebase spending limit
  - [ ] Gemini API monitoring enabled

## Phase 12: Documentation ✓

- [ ] [SETUP_GUIDE.md](./SETUP_GUIDE.md) reviewed and understood
- [ ] [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) reviewed
- [ ] [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) saved for reference
- [ ] README.md updated with setup instructions
- [ ] Deployment commands documented for team

## Final Checks

- [ ] All services connected and communicating
- [ ] No API keys in GitHub repository
- [ ] Production deployment working correctly
- [ ] Team members can access documentation
- [ ] Backup plan for API keys (stored securely, not in email)
- [ ] Monitoring and alerting configured

---

## Current Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Firebase | ✅ Configured | Authentication & Firestore ready |
| Gemini API | ✅ Configured | For AI note generation |
| Cloudflare Pages | ✅ Ready | Awaiting deployment |
| GitHub | ✅ Connected | Code pushed to repository |
| Local Dev | ⏳ Testing | Verify all APIs work |
| Production | ⏳ Ready | Deploy after verification |

---

## Next Steps

1. **Complete Phase 4** - Test all features locally
2. **Verify API responses** - Run curl commands to test each endpoint
3. **Deploy to Cloudflare** - Push to main branch
4. **Test in production** - Verify everything works at production URL
5. **Monitor costs** - Set up billing alerts
6. **Document team access** - Share credentials securely

---

## Support

If you get stuck:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Review [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) for troubleshooting
3. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment issues
4. Review service documentation:
   - [Firebase Docs](https://firebase.google.com/docs)
   - [Gemini API Docs](https://ai.google.dev/)
   - [Cloudflare Docs](https://developers.cloudflare.com/pages/)

