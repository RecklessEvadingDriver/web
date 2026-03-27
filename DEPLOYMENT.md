# Deployment Guide for HDHub4U

This guide explains how to deploy your application to **Vercel** (recommended) or **Netlify**.

## Fixed Issues

### "File is not defined" Error (ReferenceError)
- **Root Cause**: The `undici` HTTP library requires a global `File` object in Node.js serverless environments, which wasn't available in the function runtime
- **Solution Implemented**:
  - Added comprehensive File/Blob polyfill in `api/index.js` (Vercel) and `netlify/functions/api.js` (Netlify)
  - Ensured `serverless-http` v3.2.9 (stable) and `undici` v6.0.0 are in dependencies
  - Polyfill handles both Blob and File creation with proper methods (text(), arrayBuffer(), stream())
  - All backend routes already support both serverless platforms

---

## Deploying to Vercel (Recommended)

Vercel is optimized for Next.js and Vite applications and provides superior performance for your streaming app.

### Option 1: Using Vercel Dashboard (Easiest)

1. **Connect Your Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository (RecklessEvadingDriver/web)

2. **Configure Build Settings**
   - Framework: Auto-detect (should select Vite)
   - Build Command: Leave as default or set to `npm run build:frontend`
   - Output Directory: `frontend/dist`

3. **Set Environment Variables**
   - No environment variables needed for basic deployment
   - Add any API keys if required by your scrapers

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to your project directory
cd /path/to/hdhub4u-streaming

# Deploy
vercel

# For production deployment
vercel --prod
```

### Vercel Configuration

The `vercel.json` file in your project root is already configured with:
- Frontend build output from Vite (`frontend/dist`)
- API routes handling (`api/index.js`)
- Automatic SPA routing for React Router
- Node.js 18.x runtime
- 1024MB memory, 60s timeout

---

## Deploying to Netlify (Alternative)

If you prefer to stay with Netlify, the fixes are already in place.

### Setup Instructions

1. **Connect Your Repository**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm install && cd backend && npm install && cd ../frontend && npm install && npm run build:frontend`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`

3. **Deploy**
   - Netlify will automatically build and deploy

### Netlify Configuration

The `netlify.toml` file is configured with:
- Node.js 20 environment
- API route rewrites (`/api/*` → `/.netlify/functions/api`)
- SPA fallback for React Router

---

## Post-Deployment Checklist

After deploying to either platform:

- [ ] Test the home page loads correctly
- [ ] Test search functionality
- [ ] Test streaming/video player
- [ ] Check browser console for errors
- [ ] Verify API calls are working (check Network tab)
- [ ] Test on mobile devices

---

## Environment Variables

If your scrapers or API requires environment variables:

### Vercel
1. Go to Project Settings → Environment Variables
2. Add your variables
3. Redeploy

### Netlify
1. Go to Site Settings → Build & Deploy → Environment
2. Add your variables
3. Redeploy

---

## Troubleshooting

### "Function failed" on Netlify
- Clear the build cache: Site Settings → Deploys → Trigger deploy (clear cache)
- Check the function logs in Netlify dashboard
- Verify all dependencies are installed

### "Cannot find module" errors
- Run `npm install:all` locally to ensure dependencies are installed
- Check that relative paths in imports are correct

### CORS errors in frontend
- Verify the backend is properly configured with CORS
- Check that API requests use the correct domain (production vs. local)

### Videos not loading
- Check the scraper is working (test `/api/search` endpoint)
- Verify external streaming sources are accessible
- Check browser console for specific error messages

---

## Monitoring & Logs

### Vercel
- Analytics & Monitoring: Project Settings → Analytics
- Function logs: Project → Logs (select function)
- Real-time monitoring available on Pro plan

### Netlify
- Analytics: Analytics tab in Site Settings
- Function logs: Functions tab in dashboard
- Build logs: Deploys tab

---

## Next Steps

1. **Deploy** to Vercel or Netlify using instructions above
2. **Test** all features on the live deployment
3. **Monitor** logs for any runtime errors
4. **Optimize** as needed (caching, image optimization, etc.)

For questions or issues, refer to:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
