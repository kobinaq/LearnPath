# LearnPath Deployment Guide

## Railway Deployment (Backend)

### Prerequisites
- Railway account (free tier available)
- MongoDB Atlas database configured
- API keys ready (Gemini, YouTube)

### Step 1: Deploy Backend to Railway

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your LearnPath repository**
4. Railway will auto-detect Node.js and deploy

### Step 2: Configure Environment Variables in Railway

Go to your project → **Variables** tab and add:

**Required:**
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/learnpath?retryWrites=true&w=majority
SESSION_SECRET=your-random-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
YOUTUBE_API_KEY=your-youtube-api-key
PORT=3000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Optional:**
```
OPENAI_API_KEY=your-openai-key (if using OpenAI)
ANTHROPIC_API_KEY=your-anthropic-key (if using Claude)
GOOGLE_SEARCH_API_KEY=your-search-key
GOOGLE_SEARCH_ENGINE_ID=your-engine-id
```

### Step 3: Get Your Railway Backend URL

After deployment, Railway will give you a URL like:
```
https://learnpath-production.up.railway.app
```

**Copy this URL** - you'll need it for Vercel.

---

## Vercel Deployment (Frontend)

### Step 1: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import your LearnPath repository**
3. **Configure Project:**
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Add Environment Variable

In Vercel project settings → **Environment Variables**:

```
VITE_API_URL=https://your-railway-backend.up.railway.app/api
```

Replace with your actual Railway backend URL from Step 3 above.

### Step 3: Update Railway FRONTEND_URL

Go back to Railway → **Variables** and update:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

This allows CORS to work properly.

### Step 4: Redeploy

Click **Redeploy** in Vercel to apply the environment variable.

---

## Testing Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to register a new account
3. Create a learning path
4. Verify everything works

---

## Troubleshooting

### "Network Error" or CORS Issues
- Check that `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Ensure `VITE_API_URL` in Vercel points to Railway backend with `/api`

### "Database Connection Failed"
- Verify MongoDB Atlas connection string is correct
- Check IP whitelist in MongoDB Atlas (use 0.0.0.0/0 for Railway)

### "API Key Not Configured"
- Make sure all required environment variables are set in Railway
- Redeploy after adding variables

### Build Fails on Railway
- Check Railway logs for specific error
- Ensure `server/package.json` dependencies are correct
- Verify `nixpacks.toml` configuration

---

## Local Development

For local development, continue using:

```bash
npm start
```

This runs both client (port 5173) and server (port 3000) locally.

---

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Vercel         │ ──────► │  Railway        │
│  (Frontend)     │  API    │  (Backend API)  │
│                 │ ◄────── │                 │
└─────────────────┘         └─────────┬───────┘
                                      │
                                      │
                                      ▼
                            ┌─────────────────┐
                            │                 │
                            │  MongoDB Atlas  │
                            │  (Database)     │
                            │                 │
                            └─────────────────┘
```

- **Frontend (Vercel)**: Serves React app, static files
- **Backend (Railway)**: Express API, business logic
- **Database (MongoDB Atlas)**: Cloud database

---

## Cost Estimate (Free Tier)

- **Vercel**: Free (100GB bandwidth, unlimited deploys)
- **Railway**: $5/month credit free (usually enough for small projects)
- **MongoDB Atlas**: Free M0 tier (512MB storage)
- **Total**: Effectively free for development/small projects
