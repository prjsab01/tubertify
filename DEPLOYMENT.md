# 🚀 TUBERTIFY Deployment Guide

Complete step-by-step deployment guide for Tubertify on Cloudflare Pages with Supabase backend.

## 📋 Prerequisites

- GitHub account
- Supabase account
- Cloudflare account
- Google Cloud account (for Gemini API)
- Admin email for the platform

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be ready (2-3 minutes)

### 2. Configure Database

1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy and paste content from `supabase/schema.sql`
4. Click "Run" to execute
5. Create another query with content from `supabase/rls-policies.sql`
6. Click "Run" to execute

### 3. Configure Authentication

1. Go to Authentication > Settings
2. Enable Google OAuth provider
3. Add your Google OAuth credentials:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.pages.dev/auth/callback` (production)

### 4. Get Supabase Credentials

1. Go to Settings > API
2. Copy the following:
   - Project URL
   - Anon public key
   - Service role key (keep secret!)

## 🔑 Admin Setup

### 1. Generate Admin Email Hash

```javascript
// Run this in browser console or Node.js
const crypto = require('crypto'); // Node.js only
const adminEmail = 'your-admin@email.com';
const hash = crypto.createHash('sha256').update(adminEmail.toLowerCase().trim()).digest('hex');
console.log('Admin hash:', hash);
```

### 2. Update Database

1. Go to Supabase Table Editor
2. Open `app_config` table
3. Find the row with key `admin_email_hash`
4. Update the value with your generated hash
5. Save changes

## 🤖 Google Gemini API Setup

The API keys are already provided in the requirements:
- `GEMINI_API_KEY_1`: AIzaSyDWu6ewhUNDeVnZm7tJSeVM7LzPrk2MoHk
- `GEMINI_API_KEY_2`: AIzaSyCa0oGUiAFYoFeWu82aeMZMk2MGMGx2lnw  
- `GEMINI_API_KEY_3`: AIzaSyDMBWF14rRV1cwAkpSLy588zbCroQvdbgM

These keys are separated for different AI functions:
- Key 1: Course & Video summaries
- Key 2: Study notes & MCQ generation
- Key 3: TubiBot chat assistant

## 📁 GitHub Repository Setup

### 1. Create Repository

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Tubertify AI Learning Platform"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/tubertify.git
git branch -M main
git push -u origin main
```

### 2. Repository Structure

Ensure your repository has this structure:
```
tubertify/
├── app/                 # Next.js pages
├── components/          # React components
├── lib/                # Utilities
├── public/             # Static assets
├── supabase/           # Database files
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

## ☁️ Cloudflare Pages Deployment

### 1. Connect Repository

Your repository is already connected. Ensure it's set to the main branch.

### 2. Build Configuration

Update the build settings in Cloudflare Pages to:
- **Framework preset**: Next.js
- **Build command**: `npx @cloudflare/next-on-pages@1`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/` (leave empty)

### 3. Environment Variables

Your environment variables are already added. Ensure they match:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API Keys
GEMINI_API_KEY_1=AIzaSyDWu6ewhUNDeVnZm7tJSeVM7LzPrk2MoHk
GEMINI_API_KEY_2=AIzaSyCa0oGUiAFYoFeWu82aeMZMk2MGMGx2lnw
GEMINI_API_KEY_3=AIzaSyDMBWF14rRV1cwAkpSLy588zbCroQvdbgM

# Admin Configuration
ADMIN_EMAIL_HASH=your_generated_hash

# Environment
NODE_ENV=production
```

### 4. Deploy

Commit and push these changes to your main branch. Cloudflare Pages will automatically rebuild and deploy.

## 🌐 Custom Domain (Optional)

### 1. Add Custom Domain

1. In Cloudflare Pages, go to Custom domains
2. Click "Set up a custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### 2. SSL Certificate

- SSL certificate is automatically provisioned
- HTTPS is enforced by default

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Auth URLs

1. Go to Supabase Authentication settings
2. Update Site URL to your production domain
3. Add production redirect URL to allowed list

### 2. Test Core Features

1. **Authentication**: Sign in with Google
2. **Course Creation**: Create a course from YouTube URL
3. **AI Features**: Generate summaries and notes
4. **Tests**: Take a course test
5. **Admin Panel**: Access admin features (if admin)

### 3. Monitor Performance

1. Check Cloudflare Analytics
2. Monitor Supabase usage
3. Review Gemini API quotas

## 📊 Monitoring & Maintenance

### Supabase Monitoring

- Database usage and performance
- Authentication metrics
- API request patterns
- Storage usage

### Cloudflare Analytics

- Page views and unique visitors
- Performance metrics
- Geographic distribution
- Error rates

### AI Usage Tracking

- Monitor Gemini API usage
- Track rate limiting effectiveness
- Review AI-generated content quality

## 🚨 Troubleshooting

### Common Deployment Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Environment Variables:**
- Ensure all required variables are set
- Check for typos in variable names
- Verify Supabase credentials

**Authentication Issues:**
- Check Google OAuth configuration
- Verify redirect URLs
- Ensure Supabase auth settings are correct

**Database Connection:**
- Test Supabase connection
- Check RLS policies
- Verify service role permissions

### Performance Optimization

**Caching:**
- Cloudflare automatically caches static assets
- Configure cache headers for API routes
- Use Supabase edge caching

**Database:**
- Monitor query performance
- Add indexes for frequently queried columns
- Use connection pooling

**AI Optimization:**
- Implement response caching
- Optimize prompt engineering
- Monitor API quotas

## 🔄 Updates & Maintenance

### Automated Deployments

Cloudflare Pages automatically deploys when you push to the main branch:

```bash
# Make changes
git add .
git commit -m "Feature: Add new functionality"
git push origin main
# Deployment starts automatically
```

### Database Migrations

For schema changes:
1. Test changes in development
2. Create migration SQL files
3. Apply to production database via Supabase dashboard
4. Update application code
5. Deploy application changes

### Backup Strategy

**Database:**
- Supabase provides automatic backups
- Export important data regularly
- Test restore procedures

**Code:**
- GitHub serves as code backup
- Tag releases for easy rollback
- Maintain development/staging environments

## 📈 Scaling Considerations

### Traffic Growth

**Cloudflare Pages:**
- Automatically scales with traffic
- Global CDN distribution
- DDoS protection included

**Supabase:**
- Monitor connection limits
- Upgrade plan as needed
- Implement connection pooling

**AI Usage:**
- Monitor Gemini API quotas
- Implement intelligent caching
- Consider usage-based pricing

### Feature Expansion

**New AI Features:**
- Additional Gemini models
- Custom fine-tuned models
- Multi-language support

**Enhanced Learning:**
- Video transcription
- Advanced analytics
- Social features

**Mobile App:**
- React Native implementation
- Native mobile features
- Offline capabilities

---

## ✅ Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema and RLS policies applied
- [ ] Google OAuth configured
- [ ] Admin email hash generated and set
- [ ] GitHub repository created and pushed
- [ ] Cloudflare Pages project created
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] Authentication tested
- [ ] Core features tested
- [ ] Monitoring configured
- [ ] Backup strategy implemented

**🎉 Congratulations! Tubertify is now live and ready for learners worldwide!**