# 🚀 GitHub Actions Railway Deployment Setup

This guide shows you how to set up automatic deployment to Railway using GitHub Actions.

## 📋 Prerequisites

1. **Railway account** with your project created
2. **GitHub repository** with your URFMP code
3. **Railway CLI access** (for getting tokens)

## 🔧 Setup Steps

### Step 1: Get Railway Credentials

#### A. Get Railway Token

1. Go to [Railway Dashboard](https://railway.app/account/tokens)
2. Click **"Create Token"**
3. Name it: **"GitHub Actions Deploy"**
4. **Copy the token** (starts with `railway_`)

#### B. Get Railway Service ID

1. Go to your Railway project
2. Click on your **API service**
3. Go to **"Settings"** tab
4. Copy the **"Service ID"** (UUID format)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**

Add these two secrets:

```
Secret Name: RAILWAY_TOKEN
Secret Value: your-railway-token-here

Secret Name: RAILWAY_SERVICE_ID
Secret Value: your-service-id-here
```

### Step 3: Enable GitHub Actions

1. Go to **"Actions"** tab in your GitHub repo
2. Click **"I understand my workflows..."** (if shown)
3. GitHub Actions are now enabled!

## 🔄 Workflow Files Created

I've created three workflow options for you:

### 1. **Simple Deployment** (`railway-simple.yml`)

- ✅ **Minimal setup** - Just deploys on push to main
- ✅ **Fast execution** - ~2-3 minutes
- ✅ **Reliable** - Uses official Railway action

### 2. **Full CI/CD Pipeline** (`ci-cd-railway.yml`) ⭐ **Recommended**

- ✅ **Quality checks** - Tests, linting, TypeScript
- ✅ **Safe deployment** - Only deploys if tests pass
- ✅ **Detailed reporting** - Status notifications
- ✅ **Graceful failures** - Continues even with warnings

### 3. **Advanced Pipeline** (`railway-deploy.yml`)

- ✅ **Comprehensive testing** - All packages
- ✅ **Build validation** - Ensures everything compiles
- ✅ **Custom deployment logic** - Manual Railway CLI

## 🎯 Recommended Workflow

**Use `ci-cd-railway.yml`** - It provides the best balance of:

- Quality assurance
- Fast deployment
- Reliable execution
- Good error handling

## 🚀 How It Works

### On Every Push to Main:

1. **Quality Checks Run**:
   - Install dependencies
   - Build packages (types, SDK)
   - Run linting (with warnings allowed)
   - Run TypeScript checks
   - Run all test suites

2. **If Quality Checks Pass**:
   - Deploy to Railway automatically
   - Railway builds your Docker container
   - Your app goes live!

3. **Notifications**:
   - GitHub shows green checkmarks ✅
   - You get deployment status
   - Railway shows the live URL

### On Pull Requests:

- **Only quality checks run** (no deployment)
- **Ensures code quality** before merging
- **Fast feedback** for contributors

## 📊 Expected Timeline

| Step               | Duration          | Status                    |
| ------------------ | ----------------- | ------------------------- |
| Quality Checks     | ~3-5 minutes      | Running tests, linting    |
| Railway Deployment | ~5-8 minutes      | Building Docker container |
| **Total**          | **~8-13 minutes** | **Complete deployment**   |

## ✅ Verification

After setup, test the deployment:

1. **Make a small change** to your code
2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Test GitHub Actions deployment"
   git push
   ```
3. **Check GitHub Actions tab** - Should show workflow running
4. **Check Railway dashboard** - Should show new deployment
5. **Visit your Railway URL** - Should show updated app

## 🛠️ Troubleshooting

### Common Issues:

#### ❌ "railway_token is invalid"

- **Solution**: Regenerate token in Railway dashboard
- **Update**: GitHub secret with new token

#### ❌ "Service not found"

- **Solution**: Double-check Railway Service ID
- **Verify**: Service ID in Railway project settings

#### ❌ "Quality checks failing"

- **Check**: GitHub Actions logs for specific errors
- **Fix**: Address any linting or test failures
- **Note**: Warnings are allowed, only errors block deployment

#### ❌ "Docker build failing"

- **Check**: Railway deployment logs
- **Verify**: All environment variables are set
- **Ensure**: Dockerfile syntax is correct

## 🎉 Benefits

### Compared to Manual Deployment:

- ✅ **Automatic** - No manual steps
- ✅ **Consistent** - Same process every time
- ✅ **Quality gates** - Tests prevent bad deployments
- ✅ **Fast feedback** - Know immediately if something breaks
- ✅ **Team friendly** - Anyone can deploy by pushing

### Compared to Railway Auto-Deploy:

- ✅ **More reliable** - GitHub Actions is very stable
- ✅ **Better testing** - Quality checks before deployment
- ✅ **More control** - Custom logic and notifications
- ✅ **Debugging** - Better logs and error reporting

## 🔐 Security Notes

- **GitHub Secrets** are encrypted and secure
- **Railway tokens** can be revoked/regenerated anytime
- **Service IDs** are not sensitive (can be public)
- **No secrets** are exposed in logs or code

## 📈 Monitoring

### GitHub Actions:

- **"Actions" tab** - See all workflow runs
- **Green checkmarks** - Successful deployments
- **Red X marks** - Failed deployments
- **Detailed logs** - Click any run for specifics

### Railway:

- **"Deployments" tab** - See Railway build status
- **"Logs" tab** - Application runtime logs
- **"Metrics" tab** - Performance monitoring

---

## ✅ Setup Complete!

Once you add the GitHub secrets and push a change, your automatic deployment pipeline will be live!

**Your URFMP application will now deploy automatically on every push to main** 🚀
