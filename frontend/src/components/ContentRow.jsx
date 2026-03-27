import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function MediaCard({ item }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/details?url=${encodeURIComponent(item.url)}`)}
      className="relative flex-shrink-0 w-36 md:w-44 cursor-pointer card-hover rounded-lg overflow-hidden group"
    >
      <div className="aspect-[2/3] bg-dark-300 overflow-hidden rounded-lg">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center px-2">
            {item.title}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-dark via-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs font-semibold text-white truncate leading-tight">{item.title}</p>
        {item.quality && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-accent/90 rounded text-xs font-bold text-white">
            {item.quality}
          </span>
        )}
      </div>

      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-accent/60 transition-all duration-300 pointer-events-none" />
    </div>
  );
}

export default function ContentRow({ title, items = [], loading = false }) {
  const rowRef = useRef(null);

  function scroll(dir) {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' });
    }
  }

  return (
    <section className="relative mb-10">
      <h2 className="text-lg md:text-xl font-bold text-white px-6 md:px-12 mb-4">
        {title}
      </h2>

      {loading ? (
        <div className="flex gap-3 px-6 md:px-12">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 md:w-44 aspect-[2/3] bg-dark-300 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="relative group/row">
          <button
            onClick={() => scroll(-1)}
            className="hidden group-hover/row:flex absolute left-0 top-0 bottom-0 z-10 items-center px-2 bg-gradient-to-r from-dark to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <span className="p-2 glass rounded-full hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <div
            ref={rowRef}
            className="flex gap-3 overflow-x-auto hide-scrollbar px-6 md:px-12 pb-2"
          >
            {items.map((item) => (
              <MediaCard key={item.url} item={item} />
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="hidden group-hover/row:flex absolute right-0 top-0 bottom-0 z-10 items-center px-2 bg-gradient-to-l from-dark to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <span className="p-2 glass rounded-full hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
