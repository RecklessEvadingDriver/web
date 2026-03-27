import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { fetchStreamLinks } from '../utils/api';

export default function PlayerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const linksParam = searchParams.get('links');
  const titleParam = searchParams.get('title') || '';

  const [streamLinks, setStreamLinks] = useState([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!linksParam) {
      setError('No stream links provided');
      setLoading(false);
      return;
    }
    const rawLinks = JSON.parse(decodeURIComponent(linksParam));
    fetchStreamLinks(rawLinks)
      .then((data) => {
        const links = data.links || [];
        setStreamLinks(links);
        if (links[0]) setCurrentUrl(links[0].url);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [linksParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Resolving stream links…</p>
        </div>
      </div>
    );
  }

  if (error || !currentUrl) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'No playable links found'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-accent rounded-lg text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-20 pb-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          {titleParam && (
            <h1 className="text-white font-bold text-lg truncate">{decodeURIComponent(titleParam)}</h1>
          )}
        </div>

        <VideoPlayer src={currentUrl} title={titleParam ? decodeURIComponent(titleParam) : ''} />

        {streamLinks.length > 1 && (
          <div className="mt-6">
            <p className="text-gray-400 text-sm mb-3 font-medium">Available Servers</p>
            <div className="flex flex-wrap gap-2">
              {streamLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentUrl(link.url)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    currentUrl === link.url
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'bg-dark-200 text-gray-300 hover:bg-dark-300 hover:text-white border border-gray-700'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.quality && link.quality !== 'Unknown' && (
                    <span className={`ml-2 text-xs ${currentUrl === link.url ? 'text-white/80' : 'text-gray-500'}`}>
                      {link.quality}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
