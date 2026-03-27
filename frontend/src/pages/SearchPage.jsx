import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchContent } from '../utils/api';

const QUALITY_FILTERS = ['All', '4K', 'HD', 'SD', 'WEB', 'BluRay', 'CAM'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [found, setFound] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchContent(query.trim(), page)
        .then((data) => {
          setResults(data.results || []);
          setFound(data.found || 0);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400);
  }, [query, page]);

  function handleInputChange(e) {
    const val = e.target.value;
    setQuery(val);
    setPage(1);
    setSearchParams(val ? { q: val } : {});
  }

  const filtered =
    filter === 'All'
      ? results
      : results.filter((r) => r.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16 px-4 sm:px-8 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="relative mb-8">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={handleInputChange}
            placeholder="Search movies, shows, actors…"
            className="w-full pl-12 pr-4 py-4 bg-dark-200 border border-gray-700 rounded-2xl text-white text-lg placeholder-gray-500 outline-none focus:border-accent transition-colors"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearchParams({}); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {QUALITY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-accent text-white'
                  : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {query && !loading && (
          <p className="text-gray-400 text-sm mb-6">
            {found.toLocaleString()} results for <span className="text-white font-semibold">"{query}"</span>
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-dark-300 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div
                key={item.url}
                onClick={() => navigate(`/details?url=${encodeURIComponent(item.url)}`)}
                className="cursor-pointer group card-hover rounded-xl overflow-hidden bg-dark-200"
              >
                <div className="aspect-[2/3] overflow-hidden">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-300 flex items-center justify-center text-gray-600 text-xs text-center p-2">
                      {item.title}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                  {item.categories?.[0] && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.categories[0]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No results found for "{query}"</p>
            <p className="text-gray-600 text-sm mt-2">Try different keywords or remove filters</p>
          </div>
        )}

        {!query && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <circle cx={11} cy={11} r={8} />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <p className="text-gray-500">Start typing to search…</p>
          </div>
        )}

        {found > results.length && !loading && (
          <div className="mt-8 flex justify-center gap-3">
            {page > 1 && (
              <button
                onClick={() => setPage((p) => p - 1)}
                className="px-5 py-2.5 glass rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                ← Previous
              </button>
            )}
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2.5 bg-accent rounded-lg text-sm font-semibold hover:bg-accent/80 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
