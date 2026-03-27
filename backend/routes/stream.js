const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 120 });

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  Cookie: 'xla=s4t',
};

/**
 * Applies ROT13 cipher to the input string.
 * Used as part of the multi-step decoding process for obfuscated stream redirect URLs
 * found on HDhub4u post pages (mirrors the `pen()` Kotlin utility function).
 */
function rot13(value) {
  return value
    .split('')
    .map((ch) => {
      if (ch >= 'A' && ch <= 'Z')
        return String.fromCharCode(((ch.charCodeAt(0) - 65 + 13) % 26) + 65);
      if (ch >= 'a' && ch <= 'z')
        return String.fromCharCode(((ch.charCodeAt(0) - 97 + 13) % 26) + 97);
      return ch;
    })
    .join('');
}

function base64Decode(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

async function getRedirectLinks(url) {
  try {
    const { data } = await axios.get(url, { timeout: 10000, headers: HEADERS });
    const regex =
      /s\('o','([A-Za-z0-9+/=]+)'|ck\('_wp_http_\d+','([^']+)'/g;
    let combined = '';
    let match;
    while ((match = regex.exec(data)) !== null) {
      const val = match[1] || match[2];
      if (val) combined += val;
    }

    if (!combined) return url;

    const decoded = base64Decode(rot13(base64Decode(base64Decode(combined))));
    const parsed = JSON.parse(decoded);

    const encodedurl = base64Decode(parsed.o || '').trim();
    if (encodedurl) return encodedurl;

    const dataStr = Buffer.from(parsed.data || '', 'base64').toString('utf-8').trim();
    const blogUrl = (parsed.blog_url || '').trim();

    if (blogUrl && dataStr) {
      const { data: body } = await axios.get(`${blogUrl}?re=${dataStr}`, {
        timeout: 10000,
        headers: HEADERS,
      });
      const $ = cheerio.load(body);
      return $('body').text().trim() || url;
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Extracts and base64-decodes a HubCDN streaming URL from embedded page HTML.
 * The page contains a JavaScript variable `reurl` with a URL that has a `?r=<base64>` param.
 * Decoding that param and taking the substring after `link=` yields the direct stream URL.
 * @param {string} pageHtml - Raw HTML of the HubCDN embed page
 * @returns {string|null} Decoded direct stream URL, or null if not found
 */
function decodeHubcdn(pageHtml) {
  const $ = cheerio.load(pageHtml);
  const scriptText =
    $('script')
      .toArray()
      .map((s) => $(s).html() || '')
      .find((s) => s.includes('reurl')) || '';

  const m = /reurl\s*=\s*"([^"]+)"/.exec(scriptText);
  if (!m) return null;

  const encoded = m[1].split('?r=')[1];
  if (!encoded) return null;

  const decoded = base64Decode(encoded);
  const afterLink = decoded.split('link=').pop();
  return afterLink || null;
}

async function resolveLink(link) {
  try {
    if (/hubdrive/i.test(link)) {
      const { data } = await axios.get(link, { timeout: 8000, headers: HEADERS });
      const $ = cheerio.load(data);
      const href = $('.btn.btn-primary.btn-user.btn-success1.m-1').attr('href');
      if (href) return [href];
      return [link];
    }

    if (/hubcloud/i.test(link)) {
      const { data } = await axios.get(link, { timeout: 8000, headers: HEADERS });
      const $ = cheerio.load(data);
      const links = [];
      $('a.btn').each((_, el) => {
        const href = $(el).attr('href');
        if (href) links.push(href);
      });
      return links.length ? links : [link];
    }

    if (/hubcdn/i.test(link)) {
      const { data } = await axios.get(link, { timeout: 8000, headers: HEADERS });
      const m3u8 = decodeHubcdn(data);
      if (m3u8) return [m3u8];
    }

    if (/hblinks/i.test(link)) {
      const { data } = await axios.get(link, { timeout: 8000, headers: HEADERS });
      const $ = cheerio.load(data);
      const links = [];
      $('h3 a, h5 a, div.entry-content p a').each((_, el) => {
        const href = $(el).attr('href');
        if (href) links.push(href);
      });
      return links.length ? links : [link];
    }

    return [link];
  } catch {
    return [link];
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { url, links } = req.query;
    let rawLinks = [];

    if (links) {
      rawLinks = JSON.parse(links);
    } else if (url) {
      rawLinks = [url];
    } else {
      return res.status(400).json({ error: 'url or links query param required' });
    }

    const cacheKey = `stream:${rawLinks.sort().join(',')}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const streamLinks = [];

    await Promise.allSettled(
      rawLinks.map(async (link) => {
        const finalLink = link.includes('?id=')
          ? await getRedirectLinks(link)
          : link;
        const resolved = await resolveLink(finalLink);
        for (const rl of resolved) {
          streamLinks.push({
            url: rl,
            label: detectLabel(rl),
            quality: detectQuality(rl),
          });
        }
      })
    );

    const result = { links: streamLinks };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

function detectLabel(url) {
  if (/hubcloud/i.test(url)) return 'HubCloud';
  if (/hubdrive/i.test(url)) return 'HubDrive';
  if (/hdstream4u/i.test(url)) return 'HDStream4U';
  if (/hubstream/i.test(url)) return 'HubStream';
  if (/pixeldrain/i.test(url)) return 'PixelDrain';
  if (/\.m3u8/i.test(url)) return 'HLS';
  return 'Direct';
}

function detectQuality(url) {
  const m = /(\d{3,4})[pP]/.exec(url);
  if (m) return `${m[1]}p`;
  if (/4k|2160/i.test(url)) return '4K';
  return 'Unknown';
}

module.exports = router;
