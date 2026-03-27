const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 120 });
const SEARCH_API = 'https://search.pingora.fyi/collections/post/documents/search';
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  Cookie: 'xla=s4t',
};

router.get('/', async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const cacheKey = `search:${q.trim().toLowerCase()}:${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(SEARCH_API, {
      timeout: 10000,
      headers: HEADERS,
      params: {
        q: q.trim(),
        query_by: 'post_title,category',
        query_by_weights: '4,2',
        sort_by: 'sort_by_date:desc',
        limit: 20,
        highlight_fields: 'none',
        use_cache: 'true',
        page,
      },
    });

    const { hits = [], found = 0, page: resPage = page } = response.data;

    const results = hits.map(({ document: doc }) => ({
      title: doc.post_title,
      url: doc.permalink,
      poster: doc.post_thumbnail,
      type: doc.post_type,
      date: doc.post_date,
      categories: doc.category,
    }));

    const payload = { query: q, page: resPage, found, results };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
