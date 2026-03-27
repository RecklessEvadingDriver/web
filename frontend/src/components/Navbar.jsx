import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchContent } from '../utils/api';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchContent(val.trim());
        setSuggestions(res.results.slice(0, 6));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSuggestions([]);
      setSearchOpen(false);
    }
  }

  function openDetails(url) {
    navigate(`/details?url=${encodeURIComponent(url)}`);
    setSearchOpen(false);
    setSuggestions([]);
    setQuery('');
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/95 shadow-lg' : 'bg-gradient-to-b from-dark/80 to-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black text-accent tracking-tight">HD</span>
          <span className="text-2xl font-black text-white tracking-tight">Hub4U</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/search?q=bollywood" className="hover:text-white transition-colors">Bollywood</Link>
          <Link to="/search?q=hollywood" className="hover:text-white transition-colors">Hollywood</Link>
          <Link to="/search?q=web series" className="hover:text-white transition-colors">Web Series</Link>
        </nav>

        <div className="relative flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSubmit} className="relative">
              <input
                ref={inputRef}
                value={query}
                onChange={handleQueryChange}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                placeholder="Search movies, shows..."
                className="w-64 md:w-80 bg-dark-200 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(''); setSuggestions([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              {(suggestions.length > 0 || loading) && (
                <div className="absolute top-full mt-2 left-0 right-0 glass rounded-xl overflow-hidden z-50 shadow-2xl">
                  {loading && (
                    <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
                  )}
                  {suggestions.map((s) => (
                    <button
                      key={s.url}
                      onMouseDown={() => openDetails(s.url)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors"
                    >
                      {s.poster ? (
                        <img src={s.poster} alt="" className="w-8 h-11 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-11 bg-dark-300 rounded" />
                      )}
                      <span className="text-sm text-white truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
