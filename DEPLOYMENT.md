# Deployment Guide

This guide will help you deploy the LearnPath application to production.

## Architecture

LearnPath is a full-stack application with:
- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Node.js + Express (deployed to Railway/Render)
- **Database**: MongoDB (MongoDB Atlas)

## Step 1: Deploy Backend

### Option A: Railway (Recommended - Easy & Free Tier)

1. **Create a Railway account**: https://railway.app/

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `LearnPath` repository
   - Select the branch: `claude/study-topic-course-generator-011CUh6GsmYyLuikyFcYC7WL`

3. **Configure the service**:
   - Set Root Directory: `server`
   - Set Start Command: `npm start`

4. **Add environment variables**:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/learnpath
   SESSION_SECRET=your-random-secret-key-here-make-it-long-and-secure
   GEMINI_API_KEY=your-gemini-api-key
   YOUTUBE_API_KEY=your-youtube-api-key
   PORT=3000
   NODE_ENV=production
   ```

   **Where to get API keys:**
   - **DATABASE_URL**: From MongoDB Atlas (Step 1 above)
   - **GEMINI_API_KEY**: https://ai.google.dev/ (FREE)
   - **YOUTUBE_API_KEY**: https://console.cloud.google.com/ (FREE)
   - **SESSION_SECRET**: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **Get your backend URL**:
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Save this URL - you'll need it for the frontend

### Option B: Render

1. **Create a Render account**: https://render.com/

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Select branch: `claude/study-topic-course-generator-011CUh6GsmYyLuikyFcYC7WL`

3. **Configure**:
   - Name: `learnpath-backend`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

4. **Add environment variables** (same as Railway above):
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/learnpath
   SESSION_SECRET=your-random-secret-key
   GEMINI_API_KEY=your-gemini-api-key
   YOUTUBE_API_KEY=your-youtube-api-key
   PORT=3000
   NODE_ENV=production
   ```

5. **Deploy** and save your URL

## Step 2: Set Up MongoDB

**✅ Already done in Step 1!** You should have:
- MongoDB Atlas cluster running
- Database user created
- Connection string ready
- Connection string added to backend environment variables

If not, see [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md) for detailed instructions.

---

## Step 3: Deploy Frontend to Vercel

1. **Push the latest changes**:
   ```bash
   git push origin claude/study-topic-course-generator-011CUh6GsmYyLuikyFcYC7WL
   ```

2. **Go to Vercel**: https://vercel.com/

3. **Import your repository**:
   - Click "Add New" → "Project"
   - Import your `LearnPath` repository
   - Select branch: `claude/study-topic-course-generator-011CUh6GsmYyLuikyFcYC7WL`

4. **Configure the project**:
   - Vercel will auto-detect the `vercel.json` configuration
   - Framework Preset: Vite
   - Root Directory: Leave as is (handled by vercel.json)

5. **Add environment variable**:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
   Replace with your actual backend URL from Step 1

6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - You'll get a URL like: `https://your-app.vercel.app`

## Step 4: Update CORS Settings

After deploying frontend, update your backend to allow requests from Vercel:

1. **Edit `server/server.js`**:
   ```javascript
   const cors = require("cors");

   app.use(cors({
     origin: [
       'http://localhost:5173',
       'https://your-app.vercel.app'  // Add your Vercel URL
     ],
     credentials: true
   }));
   ```

2. **Commit and push**:
   ```bash
   git add server/server.js
   git commit -m "Add Vercel URL to CORS whitelist"
   git push
   ```

3. **Railway/Render will auto-deploy** the backend update

## Step 5: Get API Keys

### Google Gemini API (FREE)
1. Visit: https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Create a new API key
4. Add to backend environment: `GEMINI_API_KEY=your-key`

### YouTube Data API v3 (FREE)
1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Add to backend environment: `YOUTUBE_API_KEY=your-key`

## Environment Variables Summary

### Backend (Railway/Render)
```env
# Database (from MongoDB Atlas)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/learnpath?retryWrites=true&w=majority

# Security
SESSION_SECRET=generate-a-random-32-character-string

# AI & APIs (all FREE tier available)
GEMINI_API_KEY=your-gemini-api-key-from-ai.google.dev
YOUTUBE_API_KEY=your-youtube-api-key-from-google-cloud

# Server
PORT=3000
NODE_ENV=production
```

**How to generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

## Troubleshooting

### Frontend shows 404
- Check that `vercel.json` is in the root directory
- Verify the build command runs successfully
- Check Vercel build logs

### API requests fail
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS settings in backend
- Verify backend is running (visit backend URL in browser)

### Database connection errors
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify connection string is correct
- Check database user credentials

### Course generation fails
- Verify `GEMINI_API_KEY` is set in backend
- Check Gemini API quota/limits
- View backend logs for detailed errors

## Testing Production Deployment

1. Visit your Vercel URL
2. Register a new account
3. Create a learning path
4. Generate a course (test Gemini API)
5. Check that videos and articles appear

## Updating Your Deployment

### Frontend updates:
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel will auto-deploy

### Backend updates:
```bash
git add .
git commit -m "Update backend"
git push
```
Railway/Render will auto-deploy

## Cost Breakdown (All FREE to start!)

- **Vercel**: Free tier (100GB bandwidth/month)
- **Railway**: Free tier ($5 credit/month)
- **Render**: Free tier (750 hours/month)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Gemini API**: Free tier (15 requests/minute)
- **YouTube API**: Free tier (10,000 units/day)

**Total cost: $0/month** for low-to-moderate traffic! 🎉

## Support

If you encounter issues:
1. Check the relevant service's logs (Railway/Render/Vercel)
2. Verify all environment variables are set
3. Check the browser console for frontend errors
4. Test backend API directly with Postman/curl

## Next Steps

After successful deployment:
- [ ] Set up custom domain (optional)
- [ ] Configure email notifications (future feature)
- [ ] Set up monitoring/analytics
- [ ] Configure automatic backups for MongoDB
