import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroCarousel({ items = [] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const featured = items.slice(0, 8);

  function next() {
    setCurrent((c) => (c + 1) % featured.length);
  }
  function prev() {
    setCurrent((c) => (c - 1 + featured.length) % featured.length);
  }

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [featured.length]);

  function resetTimer() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  }

  if (!featured.length) {
    return (
      <div className="relative w-full h-[60vh] bg-dark-200 animate-pulse" />
    );
  }

  const item = featured[current];

  return (
    <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden select-none">
      {featured.map((f, i) => (
        <div
          key={f.url}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={f.poster}
            alt={f.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute inset-0 gradient-bottom" />
        </div>
      ))}

      <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-16 pb-20">
        {item.quality && (
          <span className="inline-block mb-3 px-3 py-0.5 bg-accent rounded text-xs font-bold tracking-widest uppercase">
            {item.quality}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-black text-white text-shadow mb-3 max-w-2xl leading-tight">
          {item.title}
        </h1>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(`/details?url=${encodeURIComponent(item.url)}`)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            More Info
          </button>
          <button
            onClick={() => navigate(`/details?url=${encodeURIComponent(item.url)}`)}
            className="flex items-center gap-2 px-6 py-3 glass text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={10} />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
            Details
          </button>
        </div>
      </div>

      <button
        onClick={() => { prev(); resetTimer(); }}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 glass rounded-full hover:bg-white/10 transition-colors"
        aria-label="Previous"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={() => { next(); resetTimer(); }}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 glass rounded-full hover:bg-white/10 transition-colors"
        aria-label="Next"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2 bg-accent' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
