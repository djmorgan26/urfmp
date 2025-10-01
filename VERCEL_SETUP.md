# Vercel Deployment Setup - URFMP

## Environment Variables Configuration

### Required Vercel Environment Variables

Go to your Vercel project settings → Environment Variables and add:

```env
# Brand Configuration
VITE_COMPANY_NAME=URFMP
VITE_PRODUCT_NAME=URFMP
VITE_PRODUCT_FULL_NAME=Universal Robot Fleet Management Platform
VITE_TAGLINE=The Stripe of Robotics
VITE_DESCRIPTION=Monitor any robot in 7 lines of code

# Demo Mode (set to true until Railway backend is deployed)
VITE_DEMO_MODE=true

# API Configuration (update with your Railway API URL when available)
VITE_URFMP_API_URL=https://your-railway-api-url.railway.app
VITE_URFMP_WS_URL=wss://your-railway-api-url.railway.app/ws
```

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
