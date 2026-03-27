const express = require('express');
const router = express.Router();
const { fetchCategory, CATEGORIES } = require('../scrapers/hdhub4u');

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const results = await Promise.allSettled(
      CATEGORIES.map(async (cat) => ({
        name: cat.name,
        slug: cat.slug,
        items: await fetchCategory(cat.slug, page),
      }))
    );

    const home = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((cat) => cat.items.length > 0);

    res.json({ page, categories: home });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const page = parseInt(req.query.page) || 1;
    const items = await fetchCategory(slug, page);
    res.json({ slug, page, items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
