const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const homeRoutes = require('./routes/home');
const searchRoutes = require('./routes/search');
const detailsRoutes = require('./routes/details');
const streamRoutes = require('./routes/stream');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/api/home', homeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/details', detailsRoutes);
app.use('/api/stream', streamRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Only start the HTTP server when run directly (e.g. `node server.js`).
// When imported by a serverless host (Netlify Functions), the app is
// exported without binding to a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HDHub4U API server running on port ${PORT}`);
  });
}

module.exports = app;
