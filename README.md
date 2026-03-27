# HDHub4U Streaming Application

A full-stack streaming application built with Node.js/Express backend and React frontend, replicating the logic from the [HDhub4u Cloudstream extension](https://github.com/phisher98/cloudstream-extensions-phisher/tree/master/HDhub4u).

## Architecture

```
├── netlify.toml              # Netlify build & redirect config
├── netlify/
│   └── functions/
│       └── api.js            # Serverless wrapper for Express app
├── backend/                  # Node.js/Express API server
│   ├── server.js             # Entry point (also exported for serverless)
│   ├── routes/               # API route handlers
│   │   ├── home.js           # Homepage categories
│   │   ├── search.js         # Search via Pingora API
│   │   ├── details.js        # Content details + TMDB enrichment
│   │   └── stream.js         # Stream link extraction
│   └── scrapers/
│       └── hdhub4u.js        # Core HDhub4u scraper
└── frontend/                 # React + Vite + Tailwind CSS
    └── src/
        ├── components/       # Reusable UI components
        ├── pages/            # Page components
        └── utils/            # API client
```

## Deploy to Vercel (Recommended)

### One-click deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RecklessEvadingDriver/web)

### Manual deploy via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Manual deploy via Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`RecklessEvadingDriver/web`)
4. Vercel auto-detects `vercel.json` and pre-fills settings
5. (Optional) Set environment variables in Project Settings → Environment Variables
6. Click "Deploy"

The `vercel.json` config handles:
- Frontend build with Vite
- API routes served via `api/index.js`
- SPA routing fallback for React Router
- Automatic caching headers
- Node.js 18.x runtime

---

## Deploy to Netlify

### One-click deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/RecklessEvadingDriver/web)

### Manual deploy
1. Push this repository to GitHub / GitLab / Bitbucket.
2. In the [Netlify dashboard](https://app.netlify.com), click **Add new site → Import an existing project**.
3. Select the repository — Netlify auto-detects `netlify.toml` and pre-fills the settings:
   - **Build command**: `cd backend && npm install && cd ../frontend && npm install && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`
4. (Optional) Set environment variables in **Site configuration → Environment variables**:

| Variable | Description | Required? |
|---|---|---|
| `TMDB_API_KEY` | [TMDB API key](https://www.themoviedb.org/settings/api) for metadata enrichment | Recommended |
| `HDHUB4U_URL` | Override HDhub4u base URL if the default domain changes | Optional |

5. Click **Deploy site**.

After deployment every `/api/*` request is handled by the `netlify/functions/api` serverless
function, and all other routes serve the React SPA from `frontend/dist`.

**Note**: The "File is not defined" error has been fixed with polyfills in both `api/index.js` (Vercel) and `netlify/functions/api.js` (Netlify) to ensure compatibility with the `undici` HTTP library in serverless environments.

### How it works on Netlify
```
Browser → /api/search?q=batman
        → Netlify redirect rule → /.netlify/functions/api/search?q=batman
        → serverless-http wraps Express → routes/search.js → Pingora API

Browser → /details?url=…         (React-router route)
        → SPA catch-all → /index.html → React renders DetailsPage
        → DetailsPage calls /api/details → same serverless function
```

---

## Local Development

### Backend
```bash
cd backend
npm install
npm start          # production
npm run dev        # development (nodemon)
```
Backend runs on **http://localhost:3001**

### Frontend
```bash
cd frontend
npm install
npm run dev        # development
npm run build      # production build
```
Frontend runs on **http://localhost:3000** (proxies `/api` to backend via `vite.config.js`)

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/home?page=1` | Homepage categories with content |
| `GET /api/search?q=query&page=1` | Search content |
| `GET /api/details?url=<post_url>` | Content details + TMDB enrichment |
| `GET /api/stream?links=<json_array>` | Resolve streaming links |
| `GET /api/health` | Health check |

## Features

- **Backend**: Faithful port of Kotlin HDhub4u Cloudstream scraper
  - HTML parsing via Cheerio (mirrors JSoup logic)
  - Search via Pingora full-text search API
  - TMDB enrichment for metadata, cast, episodes
  - Stream link resolution (HubCloud, HubDrive, HubCDN, etc.)
  - Response caching with node-cache
  - Rate limiting via express-rate-limit
  - Serverless-compatible via `serverless-http`

- **Frontend**: Premium Netflix-inspired dark UI
  - Dynamic hero carousel with auto-rotation
  - Horizontally scrollable category rows
  - Real-time search with auto-suggestions
  - Cinematic details page with blurred backdrop
  - Season/episode selector with TMDB episode data
  - HLS.js video player with quality selection
  - Fully responsive design

