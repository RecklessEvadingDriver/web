# HDHub4U Streaming Application

A full-stack streaming application built with Node.js/Express backend and React frontend, replicating the logic from the [HDhub4u Cloudstream extension](https://github.com/phisher98/cloudstream-extensions-phisher/tree/master/HDhub4u).

## Architecture

```
├── backend/          # Node.js/Express API server
│   ├── server.js     # Entry point
│   ├── routes/       # API route handlers
│   │   ├── home.js   # Homepage categories
│   │   ├── search.js # Search via Pingora API
│   │   ├── details.js# Content details + TMDB enrichment
│   │   └── stream.js # Stream link extraction
│   └── scrapers/
│       └── hdhub4u.js# Core HDhub4u scraper
└── frontend/         # React + Vite + Tailwind CSS
    └── src/
        ├── components/ # Reusable UI components
        ├── pages/      # Page components
        └── utils/      # API client
```

## Setup & Running

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
Frontend runs on **http://localhost:3000** (proxies `/api` to backend)

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

- **Frontend**: Premium Netflix-inspired dark UI
  - Dynamic hero carousel with auto-rotation
  - Horizontally scrollable category rows
  - Real-time search with auto-suggestions
  - Cinematic details page with blurred backdrop
  - Season/episode selector with TMDB episode data
  - HLS.js video player with quality selection
  - Fully responsive design
