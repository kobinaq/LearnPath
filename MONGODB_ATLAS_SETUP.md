# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas (cloud database) for your LearnPath application.

## Why MongoDB Atlas?

- ✅ **FREE tier** with 512MB storage
- ✅ **No credit card required** for free tier
- ✅ **Automatic backups**
- ✅ **Built-in security**
- ✅ **Global availability**
- ✅ **Easy scaling**

## Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register

2. **Sign up for free**:
   - Use your email or Google/GitHub account
   - No credit card required for free tier

3. **Complete the welcome survey** (optional)

## Step 2: Create a Cluster

1. **Choose "Build a Database"**

2. **Select FREE Tier (M0)**:
   - Click on "Shared" (FREE tier)
   - Provider: AWS, Google Cloud, or Azure (doesn't matter)
   - Region: Choose closest to your location or users
   - Cluster Name: `LearnPathCluster` (or any name you prefer)

3. **Click "Create Cluster"** (takes 3-5 minutes to provision)

## Step 3: Create Database User

1. **Go to Database Access** (left sidebar under "Security")

2. **Click "Add New Database User"**:
   - Authentication Method: Password
   - Username: `learnpath_user` (or your choice)
   - Password: Click "Autogenerate Secure Password" or create your own
   - **IMPORTANT**: Copy and save the password securely!
   - Database User Privileges: Select "Read and write to any database"

3. **Click "Add User"**

## Step 4: Whitelist IP Address

1. **Go to Network Access** (left sidebar under "Security")

2. **Click "Add IP Address"**:

   **Option A - Allow from Anywhere (easiest for development):**
   - Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0` (auto-filled)
   - Click "Confirm"

   **Option B - Specific IPs (more secure):**
   - Add your current IP
   - Add your hosting provider's IPs (Railway, Render, etc.)
   - Note: Railway/Render use dynamic IPs, so "Allow from Anywhere" is often needed

## Step 5: Get Connection String

1. **Go to Database** (left sidebar)

2. **Click "Connect"** on your cluster

3. **Choose "Connect your application"**

4. **Copy the connection string**:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Customize the connection string**:
   - Replace `<username>` with your database username (e.g., `learnpath_user`)
   - Replace `<password>` with your database password
   - Add database name after `mongodb.net/`:
     ```
     mongodb+srv://learnpath_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/learnpath?retryWrites=true&w=majority
     ```

## Step 6: Test Connection (Optional)

### Option A: Using MongoDB Compass (GUI)

1. **Download MongoDB Compass**: https://www.mongodb.com/try/download/compass

2. **Open Compass** and paste your connection string

3. **Click Connect** - you should see your database!

### Option B: Using Your Application

1. **Add connection string to `.env`**:
   ```env
   DATABASE_URL=mongodb+srv://learnpath_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/learnpath?retryWrites=true&w=majority
   ```

2. **Start your server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Check console** - you should see "Database connected successfully"

## Step 7: Add to Your Backend Deployment

### For Railway:

1. **Go to your Railway project**
2. **Click on your service**
3. **Go to "Variables" tab**
4. **Add new variable**:
   - Name: `DATABASE_URL`
   - Value: Your MongoDB Atlas connection string
5. **Save** - Railway will auto-redeploy

### For Render:

1. **Go to your Render dashboard**
2. **Select your web service**
3. **Go to "Environment" tab**
4. **Add environment variable**:
   - Key: `DATABASE_URL`
   - Value: Your MongoDB Atlas connection string
5. **Save** - Render will auto-redeploy

### For Vercel (Serverless Functions):

1. **Go to your Vercel project**
2. **Settings** → **Environment Variables**
3. **Add new variable**:
   - Name: `DATABASE_URL`
   - Value: Your MongoDB Atlas connection string
4. **Save and redeploy**

## Full Example Connection String

```env
DATABASE_URL=mongodb+srv://learnpath_user:MySecureP@ssw0rd@learnpathcluster.ab1cd.mongodb.net/learnpath?retryWrites=true&w=majority
```

**Parts explained:**
- `mongodb+srv://` - Protocol (srv for DNS seedlist)
- `learnpath_user` - Your database username
- `MySecureP@ssw0rd` - Your database password (URL encode special chars!)
- `learnpathcluster.ab1cd.mongodb.net` - Your cluster address
- `learnpath` - Database name
- `?retryWrites=true&w=majority` - Connection options

## Important Security Notes

1. **Never commit `.env` files** to git (already in `.gitignore`)

2. **URL-encode special characters** in password:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`

3. **Use strong passwords** - MongoDB Atlas has password requirements

4. **Rotate credentials** if they're ever exposed

## Common Issues & Solutions

### Issue: "Authentication failed"
**Solution**: Double-check username and password in connection string. Ensure password is URL-encoded.

### Issue: "Connection timeout"
**Solution**: Check Network Access whitelist. Add `0.0.0.0/0` or your specific IP.

### Issue: "Database name not showing"
**Solution**: Create a collection first. MongoDB creates the database when you insert first document.

### Issue: "Too many connections"
**Solution**: Free tier has 500 concurrent connections. Ensure you're not creating new connections on every request (use Mongoose connection pooling).

## Monitoring Your Database

1. **Go to Metrics** tab in Atlas dashboard
2. **View**:
   - Connection count
   - Operations per second
   - Storage usage
   - Network traffic

## Free Tier Limits

- **Storage**: 512MB
- **RAM**: Shared
- **Connections**: 500 concurrent
- **Backups**: Not included (use exports)
- **Clusters**: 1 per project

## Upgrading (When Needed)

When you outgrow the free tier:
- **M10** (Dedicated): $0.08/hour (~$57/month)
- **M20** (Dedicated): $0.20/hour (~$144/month)

You can upgrade anytime from the Atlas dashboard.

## Backup Strategy

### Free Tier (Manual):

1. **Export data** regularly:
   ```bash
   mongodump --uri="YOUR_CONNECTION_STRING"
   ```

2. **Or use MongoDB Compass**:
   - Select database
   - Export to JSON/CSV

### Paid Tiers (Automatic):

- Continuous backups
- Point-in-time recovery
- Automated snapshots

## Next Steps

After setting up MongoDB Atlas:

1. ✅ Get your connection string
2. ✅ Add to `.env` file locally (for testing)
3. ✅ Add to Railway/Render environment variables
4. ✅ Deploy your backend
5. ✅ Test the application

## Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Connection String Guide**: https://www.mongodb.com/docs/manual/reference/connection-string/
- **Mongoose Docs**: https://mongoosejs.com/docs/

## Support

- **MongoDB Community**: https://www.mongodb.com/community/forums/
- **Stack Overflow**: Tag with `mongodb-atlas`
- **Atlas Support**: Available from dashboard (paid tiers get priority)

---

That's it! Your MongoDB Atlas database is now ready to use with your LearnPath application. 🎉
