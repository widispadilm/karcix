import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, TrendingUp, MapPin, ChevronRight, Filter, SearchX } from 'lucide-react';
import Footer from '../../components/Footer';
import { useAppState } from '../../store/appStore';
import { formatRupiah, formatDate, INITIAL_EVENTS, eventToCard } from '../../data/mockData';
import { poster } from '../../assets/posters';

const CATEGORIES = ['Konser', 'Festival', 'Electronic', 'Jazz & Blues'];

const SORTS = {
  recommended: { label: 'Rekomendasi', compare: () => 0 },
  soonest: { label: 'Waktu Terdekat', compare: (a, b) => new Date(a.date) - new Date(b.date) },
  cheapest: { label: 'Harga Terendah', compare: (a, b) => a.priceFrom - b.priceFrom },
};

export default function SearchPage() {
  const navigate = useNavigate();
  const { events, event } = useAppState();

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sort, setSort] = useState('recommended');

  const allEvents = useMemo(() => {
    const evts = events && events.length > 0 ? events : (event ? [event] : INITIAL_EVENTS);
    return evts.map(eventToCard).filter(Boolean);
  }, [events, event]);

  // Filter dijalankan sungguhan — sebelumnya input & checkbox hanya dekorasi.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const min = Number(priceRange.min) || 0;
    const max = Number(priceRange.max) || Infinity;

    return allEvents
      .filter((item) => {
        if (q && !`${item.title} ${item.category} ${item.location}`.toLowerCase().includes(q)) {
          return false;
        }
        if (categories.length && !categories.includes(item.category)) return false;
        if (loc && !item.location.toLowerCase().includes(loc)) return false;
        if (item.priceFrom < min || item.priceFrom > max) return false;
        return true;
      })
      .sort(SORTS[sort].compare);
  }, [allEvents, query, categories, location, priceRange, sort]);

  const toggleCategory = (cat) =>
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const resetFilters = () => {
    setCategories([]);
    setLocation('');
    setPriceRange({ min: '', max: '' });
    setQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      <main className="flex-1 w-full max-w-[1200px] mx-auto pt-24 pb-24 md:pb-12 px-6 md:px-10 flex flex-col md:flex-row gap-8">
        {/* Toggle filter (mobile) */}
        <div className="md:hidden flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Pencarian</h1>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 text-[#1173d4] font-medium"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Sidebar filter */}
        <aside
          className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 animate-fade-in`}
        >
          <div className="sticky top-24 bg-white rounded-2xl border border-black/5 p-6 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-[#1D1D1F]">Filter</h2>
              <button
                onClick={resetFilters}
                className="text-xs text-[#1173d4] hover:underline font-medium"
              >
                Reset
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#86868B] mb-3 uppercase tracking-wider">
                Kategori
              </h3>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const checked = categories.includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat)}
                        className="sr-only"
                      />
                      <span
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          checked
                            ? 'bg-[#1173d4] border-[#1173d4]'
                            : 'border-[#D1D1D6] group-hover:border-[#1173d4]'
                        }`}
                      >
                        {checked && <span className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </span>
                      <span
                        className={`text-sm ${
                          checked ? 'text-[#1173d4] font-medium' : 'text-[#1D1D1F] group-hover:text-[#1173d4]'
                        }`}
                      >
                        {cat}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <hr className="border-black/5" />

            <div>
              <h3 className="text-sm font-semibold text-[#86868B] mb-3 uppercase tracking-wider">
                Lokasi
              </h3>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kota atau venue..."
                  aria-label="Filter lokasi"
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F5F7] border border-black/5 rounded-lg text-sm focus:outline-none focus:border-[#1173d4] focus:ring-1 focus:ring-[#1173d4] transition-shadow"
                />
              </div>
            </div>

            <hr className="border-black/5" />

            <div>
              <h3 className="text-sm font-semibold text-[#86868B] mb-3 uppercase tracking-wider">
                Harga
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                  placeholder="Min"
                  aria-label="Harga minimum"
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/5 rounded-lg text-sm text-center focus:outline-none focus:border-[#1173d4]"
                />
                <span className="text-[#86868B]">-</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                  placeholder="Max"
                  aria-label="Harga maksimum"
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/5 rounded-lg text-sm text-center focus:outline-none focus:border-[#1173d4]"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Hasil */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          <section className="animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#1173d4]" />
              <h2 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider">
                Pencarian Populer
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {['Festival', 'Jazz', 'Pensi', 'Jakarta'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-colors ${
                    query === tag
                      ? 'border-[#1173d4] bg-blue-50 text-[#1173d4] font-medium'
                      : 'border-black/5 bg-white text-[#555558] hover:border-[#1173d4] hover:text-[#1173d4]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          <div className="relative w-full max-w-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari event, kategori, atau venue..."
              aria-label="Cari event"
              className="w-full pl-12 pr-4 py-4 bg-white border border-black/5 rounded-2xl text-[15px] shadow-sm focus:outline-none focus:border-[#1173d4] focus:ring-2 focus:ring-[#1173d4]/20 transition-all"
            />
          </div>

          <div
            className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 animate-slide-up"
            style={{ animationDelay: '150ms' }}
          >
            <div>
              <h1 className="text-3xl font-bold text-[#1D1D1F]">Hasil Pencarian</h1>
              <p className="text-sm text-[#86868B] mt-1">
                Ditemukan {results.length} event
                {query ? ` untuk "${query}"` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-[#86868B]">
                Urutkan:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border border-black/5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#1D1D1F] focus:outline-none focus:border-[#1173d4]"
              >
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/event/${item.id}`)}
                  className="event-card bg-white rounded-[18px] border border-black/5 flex flex-col overflow-hidden cursor-pointer group animate-slide-up"
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={poster(item.id, { label: item.title })}
                      alt={item.title}
                      className="card-image w-full h-full object-cover"
                    />
                    {item.badge && (
                      <div className="absolute top-3 left-3 bg-[#FF3B30]/90 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-bold text-white shadow-sm">
                        {item.badge}
                      </div>
                    )}
                    {item.rating && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-bold text-[#1D1D1F] flex items-center gap-1 shadow-sm">
                        <span className="text-[#FF9500]">★</span> {item.rating}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#1173d4]">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-medium text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#1D1D1F] leading-tight mb-2 group-hover:text-[#1173d4] transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[#86868B] mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs truncate">{item.location}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#86868B] block">Mulai dari</span>
                        <span className="text-[15px] font-bold text-[#1D1D1F]">
                          {formatRupiah(item.priceFrom)}
                        </span>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-blue-50 text-[#1173d4] flex items-center justify-center group-hover:bg-[#1173d4] group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-black/5 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-8 h-8 text-[#86868B]" />
              </div>
              <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">Tidak ada event yang cocok</h3>
              <p className="text-[#86868B] mb-6">Coba ubah kata kunci atau longgarkan filternya.</p>
              <button onClick={resetFilters} className="btn-outline">
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
