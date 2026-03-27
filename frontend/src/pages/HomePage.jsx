import { useEffect, useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ContentRow from '../components/ContentRow';
import { fetchHome } from '../utils/api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHome(1)
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredItems = categories[0]?.items || [];

  return (
    <div className="min-h-screen bg-dark">
      <HeroCarousel items={featuredItems} />

      <div className="pt-6">
        {loading
          ? ['Latest', 'Bollywood', 'Hollywood', 'Web Series'].map((name) => (
              <ContentRow key={name} title={name} items={[]} loading={true} />
            ))
          : categories.map((cat) => (
              <ContentRow
                key={cat.slug}
                title={cat.name}
                items={cat.items}
                loading={false}
              />
            ))}
      </div>

      <footer className="mt-20 pb-8 text-center text-gray-600 text-xs">
        © 2025 HDHub4U Streaming · For educational purposes only
      </footer>
    </div>
  );
}
