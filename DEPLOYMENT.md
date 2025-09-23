# URFMP Deployment Guide

## 🚀 Vercel Deployment (Recommended)

URFMP is configured for automatic deployment to Vercel with zero configuration needed.

### Quick Setup

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import the `urfmp` repository
   - Vercel will auto-detect the configuration

2. **Required Environment Variables**
   Set these in your Vercel project settings:
   ```bash
   VITE_COMPANY_NAME=URFMP
   VITE_PRODUCT_NAME=URFMP
   VITE_PRODUCT_FULL_NAME=Universal Robot Fleet Management Platform
   VITE_TAGLINE=The Stripe of Robotics
   VITE_DESCRIPTION=Monitor any robot in 7 lines of code
   VITE_API_URL=https://api.urfmp.com
   ```

3. **GitHub Secrets for CI/CD**
   Add these secrets to your GitHub repository:
   ```bash
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id
   VERCEL_PROJECT_ID=your_project_id
   ```

### Getting Vercel Credentials

1. **Vercel Token**
   - Go to [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - Create a new token with appropriate scope

2. **Organization ID**
   ```bash
   npx vercel org ls
   ```

3. **Project ID**
   ```bash
   npx vercel project ls
   ```

### Deployment Process

**Automatic Deployments:**
- Every push to `main` → Production deployment
- Every push to `dev` → Preview deployment
- Every PR → Preview deployment with unique URL

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### URLs

- **Production**: `https://urfmp.vercel.app`
- **Preview**: `https://urfmp-[branch].vercel.app`

## 📊 Performance Monitoring

The CI/CD pipeline includes:
- **Lighthouse CI** - Performance, accessibility, SEO scores
- **Bundle size analysis** - Ensures builds stay under 5MB
- **Smoke tests** - Basic functionality verification

## 🔧 Local Development

```bash
# Start development server
npm run dev:web

# Build for production
npm run build:vercel

# Preview production build
cd web && npm run preview
```

## 🌍 Other Deployment Options

### GitHub Pages
```yaml
# .github/workflows/pages.yml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./web/dist
```

### Netlify
```toml
# netlify.toml
[build]
  command = "npm run build:vercel"
  publish = "web/dist"

[build.environment]
  NODE_VERSION = "20"
```

## 🔐 Security Notes

- All API keys are stored as environment variables
- No sensitive data is committed to the repository
- Production builds exclude development dependencies
- CSP headers configured for secure asset loading

## 📝 Troubleshooting

**Build Failures:**
1. Check Node.js version (requires 20+)
2. Verify environment variables are set
3. Check build logs in Vercel dashboard

**Performance Issues:**
1. Review Lighthouse reports
2. Check bundle size analysis
3. Optimize images and assets

**API Connectivity:**
1. Verify VITE_API_URL is correct
2. Check CORS configuration
3. Validate API key format