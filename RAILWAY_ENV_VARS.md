# Railway Environment Variables Configuration

## Critical Variables That MUST Be Set in Railway Dashboard

These environment variables need to be configured in the Railway dashboard for the `@urfmp/api` service:

### 1. CORS Configuration (REQUIRED)

```bash
CORS_ORIGIN=https://urfmp-cs6wbuy43-david-morgans-projects-c718d971.vercel.app,http://localhost:3001
CORS_CREDENTIALS=true
```

### 2. Database (Auto-configured by Railway)

```bash
DATABASE_URL=${Postgres.DATABASE_URL}
```

### 3. JWT Secrets (REQUIRED - Generate secure random strings)

```bash
JWT_SECRET=<generate-a-secure-random-string-256-bits>
JWT_REFRESH_SECRET=<generate-a-different-secure-random-string-256-bits>
```

### 4. Environment

```bash
NODE_ENV=production
```

## How to Set Variables in Railway:

1. Go to https://railway.app/project/urfmp
2. Click on `@urfmp/api` service
3. Click "Variables" tab
4. Click "New Variable" for each variable above
5. Railway will auto-redeploy after saving

## Important Notes:

- **NEVER commit secrets to git** - Set them only in Railway dashboard
- The CORS_ORIGIN must include your Vercel frontend URL
- JWT secrets should be long random strings (use `openssl rand -base64 32` to generate)
- DATABASE_URL is automatically set by Railway when you link the Postgres service
