# 🚀 TUBERTIFY - AI-Powered YouTube Learning Platform

Transform YouTube videos into structured courses with AI-powered summaries, interactive tests, and verified certificates.

## 🌟 Features

- **AI-Powered Learning**: Convert YouTube videos/playlists into structured courses
- **Smart Summaries**: AI-generated video and course summaries
- **Interactive Tests**: MCQ tests with 20 questions, 30-minute timer
- **Gamification**: Points system, streaks, and achievements
- **Certificates**: Downloadable PDF certificates upon completion
- **Digital Library**: Curated books and resources
- **TubiBot**: AI learning assistant (10 questions/day)
- **Progressive Web App**: Install on any device

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Dark theme)
- **ShadCN/UI** components
- **Framer Motion** animations
- **PWA** enabled

### Backend & Database
- **Supabase** (Auth, Database, Storage)
- **PostgreSQL** with Row Level Security
- **Google OAuth** authentication

### AI Integration
- **Google Gemini API** (3 separate keys for usage separation)
  - Key 1: Course & Video summaries
  - Key 2: Study notes & MCQ generation
  - Key 3: TubiBot chat assistant

### Hosting
- **Cloudflare Pages** (Free tier)
- **GitHub** repository

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Google Cloud account (for Gemini API)
- Cloudflare account

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/tubertify.git
cd tubertify
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API Keys (Already provided)
GEMINI_API_KEY_1=AIzaSyDWu6ewhUNDeVnZm7tJSeVM7LzPrk2MoHk
GEMINI_API_KEY_2=AIzaSyCa0oGUiAFYoFeWu82aeMZMk2MGMGx2lnw
GEMINI_API_KEY_3=AIzaSyDMBWF14rRV1cwAkpSLy588zbCroQvdbgM

# Admin Configuration
ADMIN_EMAIL_HASH=your_admin_email_sha256_hash
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema:
```bash
# In Supabase SQL Editor, run:
# 1. supabase/schema.sql
# 2. supabase/rls-policies.sql
```

3. Enable Google OAuth in Supabase Auth settings

### 4. Admin Setup
Generate SHA-256 hash of your admin email:
```javascript
// In browser console or Node.js
const crypto = require('crypto');
const adminEmail = 'your-admin@email.com';
const hash = crypto.createHash('sha256').update(adminEmail.toLowerCase().trim()).digest('hex');
console.log(hash);
```

Update the `admin_email_hash` in your `app_config` table.

### 5. Development
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles with roles and gamification data
- `courses` - Course metadata and settings
- `course_modules` - Individual video modules
- `course_progress` - User progress tracking
- `video_progress` - Detailed video watch progress
- `tests` - MCQ test definitions
- `test_attempts` - User test submissions
- `certificates` - Issued certificates
- `points_ledger` - Immutable points transaction log

### AI & Content
- `ai_usage_limits` - Rate limiting for AI features
- `ai_content_flags` - Track generated content
- `course_summaries` - AI-generated course summaries
- `video_summaries` - AI-generated video summaries
- `study_notes` - AI-generated study materials

### Library & Social
- `books` - Digital library resources
- `bookmarks` - User bookmarks
- `wishlists` - Course wishlists
- `login_streaks` - Daily login tracking

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Admin role verified via email hash
- Public content accessible to all authenticated users

### Rate Limiting
- Course creation: 1 per 24 hours
- AI summaries: Once per video/course
- TubiBot: 10 questions per 24 hours
- Test attempts: 2 per 24 hours

### Admin Access
- Single admin email (SHA-256 hashed)
- Dynamic role assignment on login
- Full CRUD access to all resources

## 🎮 Gamification System

### Points Earning
- Daily login: 10 points
- Video completion: 50 points
- Course completion: 200 points
- Test passing: 100 points
- Streak bonuses: 7d(50), 10d(100), 1m(500), 3m(1500), 6m(3000), 1y(10000)

### Features
- Immutable points ledger
- Streak tracking with calendar view
- Achievement system
- Course unlocking with points

## 🤖 AI Usage Separation

### API Key 1 (Summaries)
- Video transcript summaries
- Course overview generation
- Content analysis

### API Key 2 (Study Materials)
- Study notes generation
- MCQ test creation
- Learning objectives

### API Key 3 (Chat)
- TubiBot conversations
- Learning assistance
- Progress guidance

## 📱 PWA Features

- Offline capability
- Install on mobile/desktop
- Push notifications (future)
- App-like experience

## 🚀 Deployment

### Cloudflare Pages
1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Environment variables: Copy from `.env.local`
4. Deploy

### Custom Domain (Optional)
- Configure in Cloudflare Pages
- SSL automatically provisioned

## 📈 Monitoring & Analytics

### Built-in Tracking
- User engagement metrics
- Course completion rates
- AI usage statistics
- Performance analytics

### Supabase Dashboard
- Real-time database monitoring
- Auth analytics
- API usage tracking

## 🔧 Development Guidelines

### Code Structure
```
app/                 # Next.js App Router pages
├── api/            # API routes
├── dashboard/      # User dashboard
├── course/         # Course-related pages
├── test/           # Test engine
├── library/        # Digital library
└── admin/          # Admin panel

components/         # Reusable UI components
├── ui/            # Base UI components
└── ...            # Feature components

lib/               # Utilities and configurations
├── supabase.ts    # Database client
├── gemini.ts      # AI service
└── utils.ts       # Helper functions

supabase/          # Database schema and policies
├── schema.sql     # Database structure
└── rls-policies.sql # Security policies
```

### Best Practices
- TypeScript for type safety
- Component composition over inheritance
- Server-side data fetching where possible
- Optimistic UI updates
- Error boundaries and loading states

## 🐛 Troubleshooting

### Common Issues

**Authentication not working:**
- Check Supabase OAuth configuration
- Verify redirect URLs
- Ensure environment variables are set

**AI features failing:**
- Verify Gemini API keys
- Check rate limits
- Review usage quotas

**Database errors:**
- Check RLS policies
- Verify user permissions
- Review SQL schema

**Build failures:**
- Clear `.next` directory
- Check TypeScript errors
- Verify all dependencies

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check README and code comments
- Community: Join discussions in GitHub Discussions

---

**Built with ❤️ for the learning community**