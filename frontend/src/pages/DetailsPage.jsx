import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchDetails, fetchStreamLinks } from '../utils/api';

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-white/10 text-gray-300',
    accent: 'bg-accent/20 text-accent',
    green: 'bg-green-900/40 text-green-400',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default function DetailsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamLinks, setStreamLinks] = useState([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');

  useEffect(() => {
    if (!url) { setError('No URL provided'); setLoading(false); return; }
    setLoading(true);
    fetchDetails(url)
      .then((data) => {
        setDetails(data);
        if (data.seasonNumber) setSelectedSeason(data.seasonNumber);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [url]);

  async function handlePlay(links) {
    if (!links || links.length === 0) return;
    setStreamLoading(true);
    try {
      const res = await fetchStreamLinks(links);
      const validLinks = res.links || [];
      if (validLinks.length > 0) {
        setStreamLinks(validLinks);
        setPlayerUrl(validLinks[0].url);
        setShowPlayer(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStreamLoading(false);
    }
  }

  async function handleMoviePlay() {
    if (details?.movieLinks?.length > 0) {
      await handlePlay(details.movieLinks);
    }
  }

  async function handleEpisodePlay(epNum) {
    setSelectedEpisode(epNum);
    const links = details?.episodeLinks?.[epNum] || details?.episodeLinks?.['__direct__'] || [];
    await handlePlay(links);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading details…</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-dark pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Content not found'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-accent rounded-lg text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const isMovie = details.type === 'movie';
  const episodes = details.episodes || [];

  return (
    <div className="min-h-screen bg-dark">
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={details.image || details.poster}
          alt={details.title}
          className="w-full h-full object-cover"
          style={{ filter: 'blur(2px) brightness(0.4)' }}
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 gradient-bottom" />

        {details.logo && (
          <div className="absolute bottom-32 left-6 md:left-16">
            <img src={details.logo} alt="logo" className="max-h-16 max-w-xs object-contain drop-shadow-2xl" />
          </div>
        )}
      </div>

      <div className="relative z-10 -mt-48 md:-mt-60 px-4 sm:px-8 md:px-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <img
              src={details.poster || details.image}
              alt={details.title}
              className="w-40 md:w-56 rounded-xl shadow-2xl border border-white/10"
            />
          </div>

          <div className="flex-1 pt-2 md:pt-8">
            <h1 className="text-3xl md:text-4xl font-black text-white text-shadow mb-3 leading-tight">
              {details.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {details.year && <Badge>{details.year}</Badge>}
              {details.rating && (
                <Badge variant="green">⭐ {parseFloat(details.rating).toFixed(1)}</Badge>
              )}
              {details.type && <Badge variant="accent">{isMovie ? 'Movie' : 'TV Series'}</Badge>}
              {details.genres?.slice(0, 3).map((g) => <Badge key={g}>{g}</Badge>)}
            </div>

            {details.description && (
              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl mb-6 line-clamp-4">
                {details.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {isMovie && (
                <button
                  onClick={handleMoviePlay}
                  disabled={streamLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  {streamLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                  {streamLoading ? 'Loading…' : 'Play Now'}
                </button>
              )}
              {details.trailer && (
                <a
                  href={details.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 glass text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 15.5v-7l6 3.5-6 3.5zM21.8 7.6A2.5 2.5 0 0 0 20.1 5.8C18.5 5.4 12 5.4 12 5.4s-6.5 0-8.1.4A2.5 2.5 0 0 0 2.2 7.6C1.8 9.2 1.8 12 1.8 12s0 2.8.4 4.4A2.5 2.5 0 0 0 3.9 18.2c1.6.4 8.1.4 8.1.4s6.5 0 8.1-.4a2.5 2.5 0 0 0 1.7-1.8C22.2 14.8 22.2 12 22.2 12s0-2.8-.4-4.4z" />
                  </svg>
                  Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {showPlayer && playerUrl && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">
              Now Playing {selectedEpisode ? `— Episode ${selectedEpisode}` : ''}
            </h2>
            <div className="relative">
              <video
                src={playerUrl}
                controls
                autoPlay
                className="w-full rounded-xl bg-black aspect-video"
                style={{ maxHeight: '70vh' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            {streamLinks.length > 1 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Available Servers:</p>
                <div className="flex flex-wrap gap-2">
                  {streamLinks.map((link, i) => (
                    <button
                      key={i}
                      onClick={() => setPlayerUrl(link.url)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        playerUrl === link.url
                          ? 'bg-accent text-white'
                          : 'bg-dark-200 text-gray-300 hover:bg-dark-300 hover:text-white'
                      }`}
                    >
                      {link.label} {link.quality !== 'Unknown' ? `· ${link.quality}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isMovie && episodes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-2">
              Season {details.seasonNumber} · Episodes
            </h2>
            <p className="text-gray-500 text-sm mb-6">{episodes.length} episodes</p>

            <div className="grid gap-3">
              {episodes.map((ep) => (
                <div
                  key={ep.episode}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                    selectedEpisode === ep.episode
                      ? 'bg-accent/10 border border-accent/30'
                      : 'bg-dark-200 hover:bg-dark-300 border border-transparent'
                  }`}
                  onClick={() => handleEpisodePlay(ep.episode)}
                >
                  <div className="flex-shrink-0 relative">
                    {ep.thumbnail ? (
                      <img
                        src={ep.thumbnail}
                        alt={ep.title}
                        className="w-28 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-28 h-16 bg-dark-300 rounded-lg flex items-center justify-center text-gray-600 text-2xl font-bold">
                        {ep.episode}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500 text-xs font-medium">E{String(ep.episode).padStart(2, '0')}</span>
                      <h3 className="text-sm font-semibold text-white truncate">{ep.title}</h3>
                    </div>
                    {ep.overview && (
                      <p className="text-xs text-gray-400 line-clamp-2">{ep.overview}</p>
                    )}
                    {ep.airDate && (
                      <p className="text-xs text-gray-600 mt-1">{ep.airDate}</p>
                    )}
                  </div>

                  {streamLoading && selectedEpisode === ep.episode && (
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isMovie && Object.keys(details.episodeLinks || {}).length > 0 && episodes.length === 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Episodes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(details.episodeLinks)
                .filter(([k]) => k !== '__direct__')
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([epNum]) => (
                  <button
                    key={epNum}
                    onClick={() => handleEpisodePlay(Number(epNum))}
                    className={`py-3 rounded-xl font-semibold text-sm transition-colors ${
                      selectedEpisode === Number(epNum)
                        ? 'bg-accent text-white'
                        : 'bg-dark-200 text-gray-300 hover:bg-dark-300 hover:text-white'
                    }`}
                  >
                    Episode {epNum}
                  </button>
                ))}
            </div>
          </div>
        )}

        {details.cast?.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-xl font-bold mb-6">Cast</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {details.cast.slice(0, 12).map((actor) => (
                <div key={actor.name} className="flex-shrink-0 text-center w-24">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 bg-dark-300">
                    {actor.photo ? (
                      <img src={actor.photo} alt={actor.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600">
                        {actor.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white truncate">{actor.name}</p>
                  {actor.character && (
                    <p className="text-xs text-gray-500 truncate">{actor.character}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
