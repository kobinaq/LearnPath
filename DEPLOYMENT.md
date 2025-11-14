# LearnPath - Railway Deployment Guide

## Overview

LearnPath is configured to deploy as a **full-stack application on Railway**, with both frontend (React) and backend (Express) running together on a single service.

---

## Architecture

```
┌──────────────────────────────────────┐
│         Railway Service              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Express Server (Port 3000)    │ │
│  │                                │ │
│  │  • Serves API routes (/api/*)  │ │
│  │  • Serves React build (/*) ────┼─┼─► React SPA
│  │                                │ │
│  └────────────┬───────────────────┘ │
│               │                      │
└───────────────┼──────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   MongoDB Atlas       │
    │   (Database)          │
    └───────────────────────┘
```

**Benefits:**
- ✅ Single deployment (easier management)
- ✅ No CORS issues (same domain)
- ✅ Lower cost (one service instead of two)
- ✅ Simpler configuration

---

## Prerequisites

1. **Railway Account** - Sign up at https://railway.app (free tier available)
2. **MongoDB Atlas** - Set up database at https://mongodb.com/cloud/atlas
3. **API Keys Ready**:
   - Google Gemini API key (required) - https://makersuite.google.com/app/apikey
   - YouTube Data API key (required) - https://console.cloud.google.com/

---

## Deployment Steps

### Step 1: Create MongoDB Atlas Database

1. Go to https://mongodb.com/cloud/atlas
2. Create a **free M0 cluster**
3. Create a database user with password
4. Whitelist all IPs: `0.0.0.0/0` (for Railway)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/learnpath?retryWrites=true&w=majority
   ```

### Step 2: Deploy to Railway

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. **Authorize Railway** to access your GitHub
4. **Select your LearnPath repository**
5. Railway will automatically:
   - Detect Node.js application
   - Install dependencies
   - Build the frontend
   - Start the server

### Step 3: Configure Environment Variables

In Railway project → **Variables** tab, add these variables:

#### Required Variables:

```bash
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/learnpath?retryWrites=true&w=majority

# Session Security
SESSION_SECRET=your-random-secret-key-change-this-to-something-secure

# AI Provider (Gemini - FREE tier)
GEMINI_API_KEY=AIzaSyD-your-actual-gemini-key-here

# YouTube API
YOUTUBE_API_KEY=AIzaSyC-your-actual-youtube-key-here

# Environment
NODE_ENV=production
PORT=3000
```

#### Optional Variables:

```bash
# Alternative AI Providers (optional)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Article Search Enhancement (optional)
GOOGLE_SEARCH_API_KEY=your-search-key
GOOGLE_SEARCH_ENGINE_ID=your-engine-id

# Payment Processing (optional - not yet implemented)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

### Step 4: Deploy

1. After adding environment variables, Railway will automatically **redeploy**
2. Wait for deployment to complete (usually 2-5 minutes)
3. Railway will provide you with a URL like:
   ```
   https://learnpath-production.up.railway.app
   ```

### Step 5: Test Your Deployment

1. Visit your Railway URL
2. Try registering a new account
3. Create a learning path
4. Verify everything works!

---

## Build Process

Railway automatically runs these commands:

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Build frontend
npm run build
# This runs: cd client && npm run build
# Output: client/dist/

# Start server
npm start
# This runs: node server/server.js
# Server serves API and static files
```

---

## How It Works

### Production Mode:
- **Frontend**: Built into static files (`client/dist`)
- **Backend**: Serves static files AND API routes
- **URL Structure**:
  - `/` → React app (index.html)
  - `/api/*` → API endpoints
  - All other routes → React app (client-side routing)

### Development Mode:
- **Frontend**: Vite dev server on `localhost:5173`
- **Backend**: Express server on `localhost:3000`
- **Run**: `npm run dev` (starts both)

---

## Local Development

To run locally for development:

1. **Clone the repository**
2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```
3. **Edit `.env`** with your local credentials
4. **Install dependencies**:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
5. **Start development servers**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

---

## Troubleshooting

### Build Fails on Railway

**Error**: "Cannot find module"
- Check that all dependencies are in `package.json` files
- Verify Railway ran the build command successfully
- Check Railway build logs for specific errors

**Error**: "Build timed out"
- Railway free tier has 10-minute build limit
- Try deploying again (sometimes it's a temporary issue)

### Application Errors

**"Database connection failed"**
- Verify MongoDB Atlas connection string is correct
- Check that IP `0.0.0.0/0` is whitelisted in MongoDB Atlas
- Ensure database user credentials are correct

**"API key not configured"**
- Check that all required environment variables are set in Railway
- Redeploy after adding variables

**Blank page or 404 errors**
- Check Railway logs for errors
- Ensure `NODE_ENV=production` is set
- Verify frontend built successfully (`client/dist` folder exists)

### CORS Issues

If you see CORS errors:
- Shouldn't happen since frontend/backend are same domain
- Check browser console for actual error
- Verify `withCredentials: true` in API client

---

## Railway Configuration Files

These files configure Railway deployment:

- **`package.json`** - Build and start scripts
- **`nixpacks.toml`** - Nixpacks build configuration
- **`railway.json`** - Railway-specific settings
- **`Procfile`** - Process management

**Don't delete these files!** They're required for Railway deployment.

---

## Cost

**Free Tier (Hobby Plan):**
- $5 monthly credit (free)
- Usually enough for small projects
- ~500 hours of runtime
- After credits: ~$0.01/hour

**Pro Plan** ($20/month):
- $20 monthly credit
- Priority support
- Better resource limits

**MongoDB Atlas:**
- Free M0 tier (512MB)
- Sufficient for development/small production

**Total:** Effectively **FREE** for small projects!

---

## Monitoring

**Railway Dashboard:**
- View deployment logs
- Monitor resource usage
- Check build status
- View environment variables

**MongoDB Atlas:**
- Monitor database connections
- Check storage usage
- View query performance

---

## Updating Your App

To deploy updates:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. **Railway auto-deploys** from your connected branch

3. **Manual deployment**: Click "Deploy" in Railway dashboard

---

## Custom Domain (Optional)

To use your own domain:

1. Go to Railway project → **Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `learnpath.yourdomain.com`)
4. Add DNS records as instructed by Railway
5. Railway provides free SSL certificate

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **MongoDB Atlas Support**: https://support.mongodb.com

---

## Security Checklist

Before going live:

- [ ] Changed `SESSION_SECRET` to a strong random value
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Environment variables set in Railway (not in code)
- [ ] API keys are valid and have appropriate permissions
- [ ] `.env` file is in `.gitignore` (never commit secrets!)

---

## Next Steps

After successful deployment:

1. **Test all features** thoroughly
2. **Set up monitoring** (Railway provides basic metrics)
3. **Configure custom domain** (optional)
4. **Set up error tracking** (consider Sentry)
5. **Plan for scaling** if you expect high traffic

Good luck! 🚀
