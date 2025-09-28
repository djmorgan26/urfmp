# 🚀 Railway Deployment Guide - URFMP

This guide shows you how to deploy your URFMP application to Railway with perfect Docker environment parity.

## 🎯 Why Railway?

- ✅ **Perfect Environment Parity** - Your local Docker setup runs identically in production
- ✅ **$5/month free credit** - Covers your entire application for development/demo
- ✅ **Native Docker Compose support** - Deploy your entire stack as-is
- ✅ **Automatic deployments** from GitHub commits
- ✅ **Built-in PostgreSQL, Redis** - No external database setup needed

## 📋 Prerequisites

1. **GitHub account** with your URFMP repository
2. **Railway account** (free signup at https://railway.app)
3. **Railway CLI** (optional but recommended)

```bash
# Install Railway CLI (optional)
npm install -g @railway/cli
```

## 🚀 Deployment Steps

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign up/in with your GitHub account
3. Click **"New Project"**
4. Choose **"Deploy from GitHub repo"**
5. Select your **URFMP repository**

### Step 2: Configure Environment Variables

In your Railway project dashboard, add these environment variables:

```env
# Database Configuration - Railway will provide DATABASE_URL automatically
# But you can also set these if needed:
DATABASE_NAME=urfmp
DATABASE_USER=urfmp
DATABASE_PASSWORD=urfmp-production-secure-2024

# Message Queue - Railway doesn't have built-in RabbitMQ, so we'll skip for now
# RABBITMQ_USER=urfmp
# RABBITMQ_PASSWORD=rabbitmq-production-secure-2024

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-me
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here-change-me

# Web App Configuration
VITE_URFMP_API_KEY=urfmp_prod_secure_api_key_change_me
VITE_DEMO_MODE=true
VITE_URFMP_API_URL=
VITE_URFMP_WS_URL=
VITE_COMPANY_NAME=URFMP
VITE_PRODUCT_NAME=URFMP
VITE_PRODUCT_FULL_NAME=Universal Robot Fleet Management Platform
VITE_TAGLINE=The Stripe of Robotics
VITE_DESCRIPTION=Monitor any robot in 7 lines of code

# Production Settings
NODE_ENV=production
PORT=3001
```

### Step 3: Configure Services

Railway will automatically detect your `docker-compose.prod.yml` file and deploy:

- **PostgreSQL Database** (with TimescaleDB)
- **Redis Cache**
- **RabbitMQ Message Queue**
- **URFMP API Service** (Node.js/Express)
- **URFMP Web App** (React/Vite)

### Step 4: Deploy

1. **Automatic deployment** triggers when you push to GitHub
2. **Manual deployment** via Railway dashboard
3. **CLI deployment** (if you installed Railway CLI):

```bash
railway login
railway link
railway up
```

### Step 5: Access Your Application

Once deployed, Railway will provide you with:

- **Web App URL**: `https://your-app.railway.app`
- **API URL**: `https://your-api.railway.app`
- **Database connection string**

## 🔧 Production vs Development

### Local Development
```bash
# Use your existing Docker setup
docker-compose up -d
```

### Production (Railway)
```bash
# Railway automatically uses docker-compose.prod.yml
# Optimized for production with:
# - Multi-stage builds
# - Security hardening
# - Performance optimization
# - Health checks
```

## 📊 Environment Parity

| Feature | Local Docker | Railway Production |
|---------|-------------|-------------------|
| Database | PostgreSQL + TimescaleDB | ✅ Identical |
| Cache | Redis | ✅ Identical |
| Message Queue | RabbitMQ | ✅ Identical |
| API | Node.js Container | ✅ Identical |
| Web App | React/Vite Container | ✅ Identical |
| Environment Variables | `.env` file | ✅ Railway Variables |

## 💰 Cost Estimation

**Railway Free Tier:**
- **$5/month credit** (enough for small applications)
- **Covers**: Database + API + Web App + Redis + RabbitMQ
- **Perfect for**: Development, demos, small production apps

**Typical Usage:**
- Small application: **$3-4/month** (within free credit)
- Medium application: **$8-12/month**
- Database, Redis, RabbitMQ: **Included**

## 🛠️ Maintenance

### Updating Your Application
1. **Push to GitHub** - Automatic deployment
2. **Environment changes** - Update in Railway dashboard
3. **Database migrations** - Run via Railway CLI or API

### Monitoring
- **Railway Dashboard** - Real-time metrics
- **Application logs** - Centralized logging
- **Health checks** - Automatic monitoring

## ⚡ Benefits Over Vercel

| Aspect | Vercel | Railway |
|--------|--------|---------|
| Environment Parity | ❌ Different | ✅ Identical Docker |
| Database | ❌ External required | ✅ Built-in PostgreSQL |
| WebSockets | ⚠️ Limited | ✅ Full support |
| Docker Support | ❌ No | ✅ Native |
| Full Stack | ❌ Frontend only | ✅ Complete stack |
| Cost | $$$ for full stack | $ Single platform |

## 🚨 Security Notes

1. **Change default passwords** in environment variables
2. **Use strong JWT secrets**
3. **Enable Railway's built-in SSL** (automatic)
4. **Database access** is automatically secured within Railway network

## 🐛 Troubleshooting

### Common Issues
1. **Build failures** - Check Docker build logs in Railway dashboard
2. **Environment variables** - Ensure all required vars are set
3. **Database connection** - Railway provides automatic DATABASE_URL
4. **Port configuration** - Railway handles port mapping automatically

### Getting Help
- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: Active community support
- **GitHub Issues**: Report URFMP-specific issues

---

## ✅ Ready to Deploy!

Your URFMP application is now configured for Railway deployment with perfect Docker environment parity.

**Next steps:**
1. Push these changes to GitHub
2. Create your Railway project
3. Watch your entire stack deploy automatically! 🚀