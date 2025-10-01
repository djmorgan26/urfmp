# Vercel Deployment Setup - URFMP

## ⚠️ Quick Fix for CORS Error

Your backend is already deployed on Railway! You just need to connect Vercel to it.

### Step 1: Get Your Railway API URL

1. Go to https://railway.app/dashboard
2. Find your `urfmp-api` project
3. Click on the service
4. Copy the public domain (looks like: `https://urfmp-api-production-xxxx.up.railway.app`)

### Step 2: Configure Vercel Environment Variables

Go to https://vercel.com → Your Project → Settings → Environment Variables

Add/Update these:

```env
# Brand Configuration
VITE_COMPANY_NAME=URFMP
VITE_PRODUCT_NAME=URFMP
VITE_PRODUCT_FULL_NAME=Universal Robot Fleet Management Platform
VITE_TAGLINE=The Stripe of Robotics
VITE_DESCRIPTION=Monitor any robot in 7 lines of code

# Connect to Railway Backend
VITE_DEMO_MODE=false

# Replace with YOUR Railway URL from Step 1
VITE_URFMP_API_URL=https://urfmp-api-production-xxxx.up.railway.app
VITE_URFMP_WS_URL=wss://urfmp-api-production-xxxx.up.railway.app/ws
```

### Step 3: Redeploy Vercel

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

### Step 4: Test

Visit your Vercel URL and try logging in:
- Email: `admin@urfmp.com`
- Password: `admin123`

## Two Deployment Modes

### Mode 1: Demo Mode (Current)
- Set `VITE_DEMO_MODE=true` in Vercel
- App runs with mock data, no backend needed
- Perfect for showcasing the UI

### Mode 2: Production Mode (with Backend)
1. Deploy API to Railway (or another platform)
2. Update Vercel environment variables:
   - `VITE_DEMO_MODE=false`
   - `VITE_URFMP_API_URL=https://your-actual-api-url.com`
   - `VITE_URFMP_WS_URL=wss://your-actual-api-url.com/ws`
3. Redeploy Vercel

## Quick Fix for Current CORS Error

The CORS error you're seeing (`localhost:3000` from `vercel.app`) happens because:
- Vercel deployed frontend is using development API URL (`localhost:3000`)
- Need to set production environment variables in Vercel dashboard

### Steps to Fix:

1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add the variables above
3. Go to Deployments → Latest Deployment → "..." menu → Redeploy

## Vercel Build Configuration

Already configured in `vercel.json`:
- Build command: `cd web && npm ci && vite build`
- Output directory: `web/dist`
- Framework preset: Vite

No changes needed to build settings.
