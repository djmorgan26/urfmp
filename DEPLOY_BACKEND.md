# Deploy URFMP Backend to Render.com

## Quick Start - Deploy in 5 Minutes

### Step 1: Deploy to Render
1. Go to https://render.com and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click "Apply" to deploy

### Step 2: Get Your API URL
After deployment completes (~5 min):
1. Go to your Render dashboard
2. Click on "urfmp-api" service
3. Copy the URL (will look like: `https://urfmp-api.onrender.com`)

### Step 3: Configure Vercel
1. Go to https://vercel.com/your-username/urfmp/settings/environment-variables
2. Add/Update these variables:
   ```
   VITE_DEMO_MODE = false
   VITE_URFMP_API_URL = https://your-api-url.onrender.com
   VITE_URFMP_WS_URL = wss://your-api-url.onrender.com/ws
   ```
3. Save and redeploy Vercel

### Step 4: Test
1. Visit your Vercel URL: https://urfmp.vercel.app
2. Try logging in with:
   - Email: `admin@urfmp.com`
   - Password: `admin123`

---

## What Gets Deployed

Your `render.yaml` configures:

### 1. PostgreSQL Database (Free)
- Persistent robot data storage
- Automatic backups
- Free tier: 256 MB storage

### 2. API Service (Free)
- Node.js/Express backend
- Health check at `/health`
- Automatic deployments from GitHub
- Free tier: 512 MB RAM, shared CPU
- **Note: Free tier sleeps after 15 min of inactivity (30-60 sec cold start)**

---

## Environment Variables (Auto-Configured)

Render automatically sets:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Randomly generated
- `JWT_REFRESH_SECRET` - Randomly generated
- `CORS_ORIGIN` - Allow Vercel frontend

---

## Troubleshooting

### API Not Responding
**Problem**: First request is slow (30-60 seconds)
**Cause**: Free tier sleeps after 15 minutes of inactivity
**Solution**: Normal behavior, just wait for cold start

### CORS Errors
**Problem**: Browser blocks API requests
**Cause**: CORS_ORIGIN not set correctly
**Solution**: Add `CORS_ORIGIN=https://urfmp.vercel.app` in Render env vars

### Database Connection Failed
**Problem**: API can't connect to database
**Cause**: Database not ready or connection string wrong
**Solution**: Wait 2-3 minutes after deployment, Render links services automatically

---

## Cost

### Free Tier Limits
- **API**: 512 MB RAM, shared CPU
- **Database**: 256 MB storage, 1 GB bandwidth/month
- **Limitations**:
  - Services sleep after 15 min inactivity
  - 30-60 second cold start time
  - 750 hours/month (enough for 24/7 operation)

### Upgrade Options
If you hit limits:
- **Starter Plan** ($7/month): No sleep, faster performance
- **Standard Database** ($7/month): 1 GB storage, better performance

---

## Alternative: Keep Using Localhost

If you don't want to deploy yet:

### Option 1: Use ngrok (Temporary Public URL)
```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Start your local API
docker-compose up -d

# Expose it publicly
ngrok http 3000

# Update Vercel env vars with ngrok URL
VITE_URFMP_API_URL=https://your-ngrok-url.ngrok.io
```

### Option 2: Demo Mode
```bash
# In Vercel dashboard
VITE_DEMO_MODE=true

# Frontend will use mock data, no backend needed
```

---

## Next Steps

After successful deployment:

1. **Add Custom Domain** (Optional)
   - Add your own domain in Render dashboard
   - Update Vercel env vars with new URL

2. **Set Up Monitoring**
   - Render provides logs and metrics
   - Check `/health` endpoint for status

3. **Enable Features**
   - RabbitMQ for real-time updates (requires paid plan)
   - Redis for caching (free tier available)

4. **Production Hardening**
   - Change JWT secrets
   - Set up database backups
   - Configure rate limiting
