# Fix CORS on Railway Backend

## Problem

Your Railway API is blocking requests from Vercel because CORS isn't configured for your production domain.

## Solution - Add Vercel URL to Railway

### Step 1: Go to Railway Dashboard

1. Open https://railway.app/dashboard
2. Click on your `urfmp-api` project
3. Go to **Variables** tab

### Step 2: Add CORS_ORIGIN Variable

Add this environment variable:

```
CORS_ORIGIN = https://urfmp.vercel.app
```

Or if you have a custom Vercel domain, use that instead.

### Step 3: Redeploy Railway

Railway should automatically redeploy after adding the variable. If not:

1. Go to **Deployments** tab
2. Click **Deploy** button

Wait 2-3 minutes for the deployment to complete.

---

## Multiple Domains (Optional)

If you need to allow multiple domains (like both Vercel production and preview deployments), use comma separation:

```
CORS_ORIGIN = https://urfmp.vercel.app,https://urfmp-*.vercel.app
```

---

## Verify It Works

After Railway redeploys:

1. Go to https://urfmp.vercel.app
2. Open browser console (F12)
3. Try logging in
4. The CORS error should be gone!

---

## Current CORS Configuration

Your API (`services/api/src/app.ts`) reads `CORS_ORIGIN` from environment:

- Default: `http://localhost:3001` (for local development)
- Production: Set via Railway environment variable

This allows the API to accept requests from your frontend.
