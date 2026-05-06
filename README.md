# Tubertify - AI-Powered Learning Platform

Tubertify is a modern learning platform that leverages AI to create personalized educational experiences. Built with Next.js, Firebase, and Gemini AI.

## 🚀 Features

- **AI-Powered Learning**
  - 🤖 Gemini AI for course content and study notes
  - 📝 Automatic study materials from video transcripts

- **User Management**
  - 🔐 Secure authentication (Google, Email/Password)
  - 👤 Personalized user profiles
  - 📊 Learning progress tracking

- **Learning Tools**
  - 📚 Course management
  - 🎥 Video integration with YouTube
  - 🧪 AI-generated quizzes
  - 📋 Automated study notes
  - 💡 Contextual AI assistance

- **Scalable Infrastructure**
  - ☁️ Firebase for database and auth
  - 📡 Cloudflare Pages for global deployment
  - ⚡ Optimized performance with CDN

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Node.js API Routes, Firebase Admin SDK
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **AI Services**:
  - Google Gemini API (study notes, content generation)
- **Deployment**: Cloudflare Pages
- **Hosting**: Wrangler CLI

## ⚡ Quick Start

**New to this? Start here:**

→ **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide

**For detailed setup:**

→ **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions

**Need deployment help?**

→ **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Cloudflare Pages deployment

## 📋 Setup Checklist

Follow this to ensure everything is set up correctly:

→ **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Complete checklist

## 🔑 API Keys & Services

Understanding what each service does and how to get API keys:

→ **[API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md)** - API keys and services guide

## 📁 Project Structure

```
tubertify/
├── app/
│   ├── api/                 # API routes
│   │   ├── ai-notes/        # Generate study notes (Gemini)
│   │   ├── assistant/       # AI assistant (Gemini)
│   │   ├── course/          # Course management
│   │   ├── playlist/        # Playlist management
│   │   └── user/            # User management
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── course/[id]/         # Course detail page
├── components/
│   └── Providers.tsx        # Auth context provider
├── lib/
│   ├── firebaseClient.ts    # Firebase client config
│   ├── firebaseAdmin.ts     # Firebase admin config
│   ├── gemini.ts            # Gemini API integration
│   ├── firestore-tubertify.ts # Firestore utilities
│   ├── auth.ts              # Auth utilities
│   ├── types.ts             # TypeScript types
│   └── youtube.ts           # YouTube integration
├── .env.local.example       # Environment variables template
├── SETUP_GUIDE.md           # Detailed setup guide
├── DEPLOYMENT_GUIDE.md      # Deployment to Cloudflare
├── API_KEYS_GUIDE.md        # API keys reference
├── SETUP_CHECKLIST.md       # Setup verification checklist
├── QUICKSTART.md            # Quick start guide
└── wrangler.toml            # Cloudflare Pages config
```

## 🔒 Environment Variables

Required environment variables (create `.env.local` file):

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_SDK_KEY={"type":"service_account",...}

# AI APIs
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Cloudflare
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_CLOUDFLARE_PROJECT_NAME=tubertify
```

See [.env.local.example](.env.local.example) for details.

## 💻 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- All environment variables configured

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Create .env.local file with values from SETUP_GUIDE.md

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000` - your app is running!

### Available Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run pages:dev  # Test Cloudflare Pages locally
```

## 🚀 Deployment

### Automatic Deployment (Recommended)

1. Push to GitHub `main` branch
2. Cloudflare automatically deploys
3. Live at `https://tubertify.pages.dev`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Manual Deployment

```bash
npm run pages:deploy
```

## 📊 API Endpoints

### Gemini AI Endpoints

**Assistant (Q&A)**
```
POST /api/assistant
Body: { userId, question, context }
Returns: { answer }
Limit: 10/day per user
```

**Study Notes**
```
POST /api/ai-notes
Body: { userId, courseId, moduleId, videoId, title, transcript }
Returns: { notes }
Limit: 5/day per user
```

### Course Management

**Get Courses**
```
GET /api/course
Returns: { courses }
```

**Get Course by ID**
```
GET /api/course/[id]
Returns: { course }
```

## 🔐 Security

- All API keys stored in `.env.local` (never committed)
- Firestore security rules enforce user data isolation
- Firebase Auth handles secure authentication
- API rate limiting prevents abuse
- HTTPS/SSL on all connections (Cloudflare)

## 📈 Monitoring

### Firebase Console
- User authentication logs
- Firestore data storage
- Real-time database monitoring

### Cloudflare Dashboard
- Request analytics
- Performance metrics
- Error tracking
- DDoS protection

### API Usage
- Gemini: Google Cloud Console
- Firebase: Firebase Console

## 💰 Cost Estimation

| Service | Free Tier | Typical Cost |
|---------|-----------|--------------|
| Firebase | 25k auth/month, 1GB storage | FREE |
| Gemini | 1,500 requests/day | FREE |
| Cloudflare | Unlimited requests | FREE |
| **Total** | | **FREE** |

## 🐛 Troubleshooting

### Firebase Issues
- Check environment variables
- Verify Firestore security rules
- Check Firebase Console logs

### AI API Issues
- Verify API keys are correct
- Check API key billing/credits
- Review rate limits

### Deployment Issues
- Check Cloudflare build logs
- Verify environment variables in Cloudflare
- Check GitHub connection

**For detailed troubleshooting:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Cloudflare deployment
- [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) - API reference
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Verification checklist
- [TUBERTIFY_ARCHITECTURE_SUMMARY.md](./TUBERTIFY_ARCHITECTURE_SUMMARY.md) - Technical architecture

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Push to GitHub
5. Create a Pull Request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

- Check the documentation files listed above
- Review Firebase and Gemini documentation
- Check Cloudflare Pages docs for deployment help

## 🎯 Next Steps

1. **New users:** Follow [QUICKSTART.md](./QUICKSTART.md)
2. **Need setup help:** Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. **Ready to deploy:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. **Verify everything:** Use [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

---

**Built with ❤️ using modern web technologies**
