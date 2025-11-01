# LearnPath - AI-Powered Learning Platform

A comprehensive web application that generates personalized, project-based learning courses using AI. The platform curates educational content from free YouTube videos and articles, with built-in authentication and subscription-based credit system.

## Features

### Core Functionality
- **AI-Powered Course Generation**: Uses Claude (Anthropic) or GPT (OpenAI) to create structured learning paths
- **Project-Based Learning**: Focus on hands-on projects and practical skills
- **Content Curation**: Automatically sources relevant YouTube videos and articles
- **Progress Tracking**: Monitor your learning journey with visual progress indicators
- **Authentication**: Secure user accounts with bcrypt password hashing

### Subscription & Credits
- **Multiple Pricing Tiers**: Free, Basic ($10/month), Pro ($25/month), Premium ($50/month)
- **Credit-Based System**: Generate courses using credits based on your plan
- **Usage Tracking**: Monitor credit consumption and remaining balance
- **Flexible Plans**: 5-1000 course generations per month depending on tier

### Content Sources
- **YouTube Integration**: Curated educational videos matching your learning level
- **Article Recommendations**: Quality articles from educational platforms (Medium, freeCodeCamp, Dev.to, etc.)
- **Multiple Formats**: Videos, articles, playlists, and courses

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: express-session with bcrypt
- **AI Integration**:
  - Google Gemini API (primary - **FREE tier available**)
  - Anthropic Claude SDK (alternative)
  - OpenAI SDK (alternative)
- **APIs**:
  - YouTube Data API v3
  - Google Custom Search API (optional)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: TailwindCSS
- **UI Components**: Radix UI (comprehensive component library)
- **Forms**: React Hook Form with Zod validation
- **State**: React Context API
- **Notifications**: Sonner (toast notifications)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- API Keys:
  - **Google Gemini API key** (for course generation - **FREE tier available** at https://ai.google.dev/)
  - YouTube Data API v3 key (for video curation)
  - Optional alternatives: Anthropic API key OR OpenAI API key
  - Google Custom Search API key (optional, for articles)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LearnPath
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env and add your configuration
   nano .env
   ```

   Required variables:
   ```env
   DATABASE_URL=mongodb://localhost:27017/learnpath
   SESSION_SECRET=your-secure-session-secret
   GEMINI_API_KEY=your-gemini-key
   YOUTUBE_API_KEY=your-youtube-key
   ```

   **Getting API Keys:**
   - **Gemini API** (FREE): Visit https://ai.google.dev/ and create an API key
   - **YouTube API** (FREE): Visit https://console.cloud.google.com/ and enable YouTube Data API v3

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Terminal 1: Start backend
   cd server
   npm run dev

   # Terminal 2: Start frontend
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### First-Time Setup

1. Register a new account at http://localhost:5173/register
2. Login with your credentials
3. You'll start with the Free plan (5 credits/month)
4. Create your first learning path
5. Generate AI-powered course content (uses 1 credit)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)

### Learning Paths
- `GET /api/learning-paths` - Get all user's learning paths (protected)
- `GET /api/learning-paths/:id` - Get specific learning path (protected)
- `POST /api/learning-paths` - Create new learning path (protected)
- `POST /api/learning-paths/:id/generate-course` - Generate AI course content (protected, uses 1 credit)
- `PUT /api/learning-paths/:id/progress` - Update progress (protected)
- `DELETE /api/learning-paths/:id` - Delete learning path (protected)

### Subscriptions
- `GET /api/subscriptions/plans` - Get all pricing plans
- `GET /api/subscriptions/current` - Get current subscription (protected)
- `GET /api/subscriptions/usage` - Get usage statistics (protected)
- `POST /api/subscriptions/subscribe` - Subscribe to a plan (protected)
- `POST /api/subscriptions/cancel` - Cancel subscription (protected)

## Pricing Plans

| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| **Free** | $0 | 5 | Basic learning paths, YouTube & article curation |
| **Basic** | $10 | 50 | All Free features + project-based learning, email support |
| **Pro** | $25 | 200 | All Basic features + advanced AI, priority support, analytics |
| **Premium** | $50 | 1000 | All Pro features + unlimited paths, API access, 24/7 support |

## Project Structure

```
LearnPath/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
│   └── package.json
├── server/                # Express backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   ├── course-generator.js  # AI course generation
│   │   ├── youtube.js            # YouTube API integration
│   │   ├── articles.js           # Article sourcing
│   │   └── llm.js                # LLM integration
│   ├── utils/            # Helper functions
│   └── server.js         # Express app
└── .env.example          # Environment variables template
```

## Key Features Explained

### AI Course Generation
The platform uses Claude (Anthropic) or GPT (OpenAI) to generate:
- **Structured Modules**: 4-6 learning modules with clear objectives
- **Hands-On Projects**: 3-5 project ideas for practical application
- **Learning Milestones**: Progress checkpoints
- **Resource Recommendations**: Curated videos and articles

### Credit System
- Each course generation costs **1 credit**
- Credits reset monthly based on subscription tier
- Users can track usage in real-time on dashboard
- Insufficient credits redirect to pricing page

### Content Curation
- **YouTube**: Searches for relevant educational videos matching topic and level
- **Articles**: Curates from educational platforms (Medium, freeCodeCamp, etc.)
- **Smart Matching**: Filters content by educational level and learning pace

## Environment Variables

See `.env.example` for full list. Key variables:

- `DATABASE_URL`: MongoDB connection string
- `SESSION_SECRET`: Secret for session encryption
- `GEMINI_API_KEY`: Google Gemini API key (primary - **FREE tier available**)
- `YOUTUBE_API_KEY`: YouTube Data API v3 key (**FREE tier available**)
- `ANTHROPIC_API_KEY`: Claude API key (optional alternative)
- `OPENAI_API_KEY`: OpenAI API key (optional alternative)
- `GOOGLE_SEARCH_API_KEY`: Google Custom Search key (optional)

## Deployment

**📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step deployment guide.**
**📖 See [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md) for MongoDB Atlas setup.**

### Quick Overview

**Database (MongoDB Atlas):**
- Free tier: 512MB storage
- Detailed setup guide in MONGODB_ATLAS_SETUP.md
- Get connection string and add to backend

**Frontend (Vercel):**
- Automatically configured with `vercel.json`
- Just connect your GitHub repo and deploy
- Set `VITE_API_URL` environment variable

**Backend (Railway/Render):**
- Deploy from `server/` directory
- Add environment variables (see DEPLOYMENT.md)
- Get your backend URL

**All services have FREE tiers!** Total cost: $0/month for getting started.

## Development

### Adding New Features
1. Backend: Add routes in `server/routes/`, models in `server/models/`, services in `server/services/`
2. Frontend: Add pages in `client/src/pages/`, components in `client/src/components/`
3. Update API types in `client/src/api/`

### Testing
```bash
# Backend tests (when available)
cd server
npm test

# Frontend tests (when available)
cd client
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: [your-email]

## Roadmap

- [ ] Course completion certificates
- [ ] Social features (share learning paths)
- [ ] Mobile app
- [ ] API access for Pro+ users
- [ ] Integration with more content sources
- [ ] AI learning coach
- [ ] Collaborative learning paths
- [ ] Quizzes and assessments
- [ ] Learning analytics dashboard

## Credits

Built with:
- Google Gemini AI (primary AI provider with FREE tier)
- Anthropic Claude AI (alternative)
- OpenAI GPT (alternative)
- YouTube Data API
- MongoDB
- React & TypeScript
- TailwindCSS & Radix UI
