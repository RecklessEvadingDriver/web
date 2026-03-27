# Quick Start Deployment Guide

## ✅ All Fixes Applied

The "File is not defined" error and all backend issues have been fixed. Your app is ready to deploy!

---

## 🚀 Deploy to Vercel (Recommended - 2 minutes)

### Option 1: Click Deploy Button
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RecklessEvadingDriver/web)

### Option 2: Via Command Line
```bash
npm install -g vercel
cd /path/to/hdhub4u-streaming
vercel --prod
```

### Option 3: Via Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import: `RecklessEvadingDriver/web`
4. Click "Deploy"
5. Done! ✅

---

## 🌐 Deploy to Netlify (2 minutes)

### Option 1: Click Deploy Button
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/RecklessEvadingDriver/web)

### Option 2: Via Dashboard
1. Go to [netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select: `RecklessEvadingDriver/web`
4. Build settings auto-detect
5. Click "Deploy site"
6. Done! ✅

---

## 🔍 Verify Deployment

After deploying, test these endpoints:

```bash
# Health check (should return {"status":"ok"})
curl https://your-domain.vercel.app/api/health

# Test search
curl "https://your-domain.vercel.app/api/search?q=batman"

# Test home categories
curl "https://your-domain.vercel.app/api/home?page=1"
```

---

## 🎬 Expected Results

✅ Frontend loads without errors  
✅ API endpoints respond correctly  
✅ Search returns results  
✅ Video player works  
✅ No "File is not defined" errors  

---

## ⚙️ Optional: Environment Variables

Add these in your platform's settings (optional):

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `TMDB_API_KEY` | Movie metadata | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| `HDHUB4U_URL` | Custom HDhub4u URL | If domain changes |

**Vercel**: Project Settings → Environment Variables  
**Netlify**: Site Settings → Build & Deploy → Environment  

---

## 📋 Deployment Checklist

- [ ] Deployed to Vercel or Netlify
- [ ] Health check endpoint responds
- [ ] Frontend loads
- [ ] Search works
- [ ] Video player streams content
- [ ] No errors in browser console
- [ ] No errors in platform logs

---

## 🆘 Troubleshooting

### API returning 502/503 error
1. Check platform function logs
2. Verify Node.js 18.x runtime selected
3. Clear cache and redeploy

### "Cannot find module" error
1. Run `npm install:all` locally first
2. Verify `vercel.json` or `netlify.toml` settings
3. Redeploy

### Frontend not loading
1. Check that `frontend/dist` exists after build
2. Verify SPA fallback routes are configured
3. Clear browser cache

### Videos not playing
1. Test API endpoints manually
2. Check browser Network tab for API responses
3. Verify external streaming sources are accessible

---

## 📚 Full Documentation

- **Detailed Fixes**: [FIXES_SUMMARY.md](FIXES_SUMMARY.md)
- **Complete Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Project Info**: [README.md](README.md)

---

## ✨ What Was Fixed

### "File is not defined" Error ✅
- Added global `File` and `Blob` polyfills
- Both Vercel and Netlify handlers now compatible with `undici` library
- Zero impact on functionality

### Vercel Deployment ✅
- Optimized `vercel.json` configuration
- Added response caching for better performance
- Ensured backend files bundled correctly

### Documentation ✅
- Updated deployment guide with detailed instructions
- Added quick start guide (this file!)
- Added comprehensive fixes summary

---

## 🎯 Next Steps

1. **Deploy** using one of the options above
2. **Verify** endpoints are working
3. **Share** your deployed app!
4. **Monitor** performance in dashboard

---

**That's it!** Your HDHub4U streaming app is now ready for production. 🚀
