const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 });

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  Cookie: 'xla=s4t',
};

if (!process.env.TMDB_API_KEY) {
  console.warn('[details] TMDB_API_KEY env var not set — TMDB enrichment will be skipped');
}
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://image.tmdb.org/t/p/original';
const TMDB_API = 'https://api.themoviedb.org/3';

async function fetchWithTimeout(url, opts = {}) {
  return axios.get(url, { timeout: 10000, headers: HEADERS, ...opts });
}

async function getTmdbDetails(tmdbId, type) {
  try {
    const { data } = await axios.get(
      `${TMDB_API}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids`,
      { timeout: 10000 }
    );
    return data;
  } catch {
    return null;
  }
}

async function getTmdbSeasonDetails(tmdbId, seasonNumber) {
  try {
    const { data } = await axios.get(
      `${TMDB_API}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`,
      { timeout: 10000 }
    );
    return data;
  } catch {
    return null;
  }
}

async function findTmdbByImdb(imdbId, type) {
  try {
    const { data } = await axios.get(
      `${TMDB_API}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`,
      { timeout: 10000 }
    );
    const results =
      type === 'movie' ? data.movie_results : data.tv_results;
    return results && results[0] ? String(results[0].id) : null;
  } catch {
    return null;
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url query param required' });

    const cacheKey = `details:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { data: html } = await fetchWithTimeout(url);
    const $ = cheerio.load(html);

    let title = $(
      '.page-body h2[data-ved="2ahUKEwjL0NrBk4vnAhWlH7cAHRCeAlwQ3B0oATAfegQIFBAM"], ' +
        'h2[data-ved="2ahUKEwiP0pGdlermAhUFYVAKHV8tAmgQ3B0oATAZegQIDhAM"]'
    )
      .text()
      .trim();

    const seasonMatch = title.match(/\bSeason\s*(\d+)\b/i);
    const seasonNumber = seasonMatch ? parseInt(seasonMatch[1]) : null;

    const image = $('meta[property="og:image"]').attr('content') || '';
    const plot = $('.kno-rdesc .kno-rdesc').text().trim();
    const poster = $('main.page-body img.aligncenter').attr('src') || image;
    const trailer = $('iframe')
      .filter((_, el) => {
        const src = $(el).attr('src') || '';
        return src.includes('youtube') || src.includes('youtu.be');
      })
      .first()
      .attr('src')
      ?.replace('/embed/', '/watch?v=');

    const typeRaw = $('h1.page-title span').text();
    const isMovie = /movie/i.test(typeRaw);
    const contentType = isMovie ? 'movie' : 'tv';

    let imdbUrl = $('div span a[href*="imdb.com"]').attr('href') || '';
    let tmdbId = '';

    const tmdbHref = $('div span a[href*="themoviedb.org"]').attr('href') || '';
    if (tmdbHref) {
      tmdbId = tmdbHref
        .split('/')
        .filter(Boolean)
        .pop()
        .split('-')[0]
        .split('?')[0];
    }

    const imdbIdOnly = imdbUrl.includes('title/')
      ? imdbUrl.split('title/')[1].split('/')[0]
      : '';

    if (!tmdbId && imdbIdOnly) {
      tmdbId = (await findTmdbByImdb(imdbIdOnly, contentType)) || '';
    }

    let enriched = null;
    if (tmdbId) {
      const details = await getTmdbDetails(tmdbId, contentType);
      if (details) {
        const name =
          details.name || details.title || title;
        const description =
          details.overview || plot;
        const yearRaw =
          details.release_date || details.first_air_date || '';
        const year = yearRaw ? yearRaw.slice(0, 4) : '';
        const background =
          details.backdrop_path
            ? TMDB_BASE + details.backdrop_path
            : image;
        const genres = (details.genres || []).map((g) => g.name);
        const rating = details.vote_average;
        const imdbId =
          details.external_ids?.imdb_id || imdbIdOnly;
        const logo = imdbId
          ? `https://live.metahub.space/logo/medium/${imdbId}/img`
          : null;

        const cast = (details.credits?.cast || []).slice(0, 20).map((c) => ({
          name: c.name || c.original_name,
          character: c.character,
          photo: c.profile_path ? TMDB_BASE + c.profile_path : null,
        }));

        let episodes = [];
        if (!isMovie && seasonNumber) {
          const seasonData = await getTmdbSeasonDetails(tmdbId, seasonNumber);
          if (seasonData?.episodes) {
            episodes = seasonData.episodes.map((ep) => ({
              episode: ep.episode_number,
              season: seasonNumber,
              title: ep.name,
              overview: ep.overview,
              thumbnail: ep.still_path ? TMDB_BASE + ep.still_path : null,
              airDate: ep.air_date,
              rating: ep.vote_average,
            }));
          }
        }

        enriched = {
          title: seasonNumber
            ? `${name} (Season ${seasonNumber})`
            : name,
          description,
          year,
          background,
          genres,
          rating,
          cast,
          logo,
          imdbId,
          tmdbId,
          episodes,
        };
      }
    }

    const movieLinks = [];
    $('h3 a, h4 a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text();
      if (/480|720|1080|2160|4K/i.test(text) && href) {
        movieLinks.push(href);
      }
    });

    $('.page-body > div a').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (/https:\/\/(.*\.)?(hdstream4u|hubstream)\..*/i.test(href)) {
        if (!movieLinks.includes(href)) movieLinks.push(href);
      }
    });

    const epLinksMap = {};
    const episodeRegex = /EPiSODE\s*(\d+)/i;

    $('h3, h4').each((_, el) => {
      const element = $(el);
      const elText = element.text();
      const epMatch = episodeRegex.exec(elText);
      const epNum = epMatch ? parseInt(epMatch[1]) : null;

      const isDirectLinkBlock = element.find('a').toArray().some((a) => {
        return /1080|720|4K|2160/i.test($(a).text());
      });

      if (isDirectLinkBlock) {
        element.find('a[href]').each((_, a) => {
          const href = $(a).attr('href');
          if (href) {
            if (!epLinksMap['__direct__']) epLinksMap['__direct__'] = [];
            if (!epLinksMap['__direct__'].includes(href))
              epLinksMap['__direct__'].push(href);
          }
        });
      } else if (epNum !== null) {
        const links = [];
        element.find('a[href]').each((_, a) => {
          const href = $(a).attr('href');
          if (href) links.push(href);
        });

        if (element[0]?.tagName === 'h4') {
          let next = element.next();
          while (next.length && next[0]?.tagName !== 'hr') {
            next.find('a[href]').each((_, a) => {
              const href = $(a).attr('href');
              if (href && !links.includes(href)) links.push(href);
            });
            next = next.next();
          }
        }

        if (links.length > 0) {
          if (!epLinksMap[epNum]) epLinksMap[epNum] = [];
          epLinksMap[epNum].push(...links.filter((l) => !epLinksMap[epNum].includes(l)));
        }
      }
    });

    const result = {
      title: enriched?.title || title,
      url,
      poster,
      image: enriched?.background || image,
      description: enriched?.description || plot,
      year: enriched?.year || '',
      genres: enriched?.genres || [],
      rating: enriched?.rating || null,
      cast: enriched?.cast || [],
      logo: enriched?.logo || null,
      imdbId: enriched?.imdbId || imdbIdOnly,
      tmdbId: enriched?.tmdbId || tmdbId,
      trailer: trailer || null,
      type: isMovie ? 'movie' : 'tv',
      seasonNumber,
      episodes: enriched?.episodes || [],
      movieLinks,
      episodeLinks: epLinksMap,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
