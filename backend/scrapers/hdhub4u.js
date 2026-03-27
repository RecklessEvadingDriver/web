const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// HDhub4u base URL — configurable via HDHUB4U_URL env var to handle domain changes,
// since streaming sites frequently migrate to new domains.
const MAIN_URL = process.env.HDHUB4U_URL || 'https://hdhub4u.rehab';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  Cookie: 'xla=s4t',
};

const CATEGORIES = [
  { slug: '', name: 'Latest' },
  { slug: 'category/bollywood-movies/', name: 'Bollywood' },
  { slug: 'category/hollywood-movies/', name: 'Hollywood' },
  { slug: 'category/hindi-dubbed/', name: 'Hindi Dubbed' },
  { slug: 'category/south-hindi-movies/', name: 'South Hindi Dubbed' },
  { slug: 'category/web-series/', name: 'Web Series' },
];

async function fetchWithTimeout(url, options = {}) {
  return axios.get(url, { timeout: 10000, headers: HEADERS, ...options });
}

function parseSearchQuality(text) {
  if (!text) return null;
  const u = text.toLowerCase();
  if (/\b(4k|uhd|2160p)\b/.test(u)) return '4K';
  if (/\b(1080p|fullhd)\b/.test(u)) return 'HD';
  if (/\b(720p)\b/.test(u)) return 'SD';
  if (/\b(hdts|hdcam)\b/.test(u)) return 'CAM';
  if (/\b(web-?dl|webrip|webdl)\b/.test(u)) return 'WEB';
  if (/\b(bluray|bdrip)\b/.test(u)) return 'BluRay';
  return null;
}

function toResult($, el) {
  const titleText = $(el)
    .find('figcaption:nth-child(2) > a:nth-child(1) > p:nth-child(1)')
    .text()
    .trim();
  const url = $(el)
    .find('figure:nth-child(1) > a:nth-child(2)')
    .attr('href');
  const poster = $(el)
    .find('figure:nth-child(1) > img:nth-child(1)')
    .attr('src');

  return {
    title: titleText,
    url,
    poster,
    quality: parseSearchQuality(titleText),
  };
}

async function fetchCategory(slug, page = 1) {
  const url = `${MAIN_URL}/${slug}page/${page}/`;
  const cacheKey = `cat:${slug}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await fetchWithTimeout(url);
  const $ = cheerio.load(data);
  const items = [];
  $('.recent-movies > li.thumb').each((_, el) => {
    const result = toResult($, el);
    if (result.url) items.push(result);
  });

  cache.set(cacheKey, items);
  return items;
}

module.exports = { fetchCategory, CATEGORIES, MAIN_URL, HEADERS, fetchWithTimeout, parseSearchQuality, cache };
