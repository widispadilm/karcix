import { useNavigate } from 'react-router';
import { Calendar, MapPin, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useAppState } from '../../store/appStore';
import { formatDate, formatRupiah, INITIAL_EVENTS, eventToCard } from '../../data/mockData';
import { poster, heroPoster } from '../../assets/posters';
import Footer from '../../components/Footer';

export default function EventPage() {
  const { events, event } = useAppState();
  const navigate = useNavigate();

  const allEvents = events && events.length > 0 ? events : (event ? [event] : INITIAL_EVENTS);
  const featuredEvent = allEvents[0];

  if (!featuredEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#1D1D1F]">Memuat event...</div>
    );
  }

  const cards = allEvents.map(eventToCard).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Featured Event */}
      <section className="relative w-full h-[600px] md:h-[716px] min-h-[500px] mt-16 overflow-hidden bg-black">
        <img
          src={heroPoster(featuredEvent.title, featuredEvent.title)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 hero-gradient" />

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col justify-end max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 max-w-3xl animate-slide-up">
            <span className="text-white/90 uppercase tracking-widest text-xs font-bold mb-1 flex items-center gap-1.5 bg-blue-600/80 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Event Unggulan
            </span>
            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter">
              {featuredEvent.title}
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              {featuredEvent.location} • {formatDate(featuredEvent.date)}
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate(`/event/${featuredEvent.id}`)}
                className="btn-pill inline-flex items-center gap-2 cursor-pointer shadow-xl hover:scale-105 transition-transform"
              >
                Beli Tiket
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Semua Event */}
      <main className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-16 flex-grow">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D1F]">
              Semua Acara &amp; Konser
            </h2>
            <p className="text-[#86868B] mt-2 text-sm md:text-base">
              Temukan tiket konser, festival musik, dan pertunjukan favorit Anda.
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="hidden md:flex items-center gap-1 text-[#1173d4] font-semibold hover:underline text-sm cursor-pointer"
          >
            Lihat Semua ({cards.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((item, i) => (
            <article
              key={item.id}
              onClick={() => navigate(`/event/${item.id}`)}
              className="event-card bg-white rounded-2xl border border-black/5 overflow-hidden cursor-pointer flex flex-col h-full shadow-sm hover:shadow-md transition-all group animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative aspect-square w-full bg-gray-100 overflow-hidden rounded-t-2xl">
                <img
                  src={poster(item.id, { label: item.title })}
                  alt={item.title}
                  className="card-image absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.badge && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1D1D1F] shadow-sm">
                    {item.badge}
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                  {item.category || 'Konser'}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-[#1D1D1F] leading-tight mb-2 group-hover:text-[#1173d4] transition-colors">
                  {item.title}
                </h3>
                <div className="mt-auto pt-4 flex flex-col gap-1.5 text-sm text-[#86868B]">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1173d4]" /> {formatDate(item.date)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1173d4]" /> {item.location}
                  </p>
                  <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                    <span className="text-xs text-[#86868B]">Mulai dari</span>
                    <span className="text-[#1173d4] font-bold text-base">
                      {formatRupiah(item.priceFrom)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <button
            onClick={() => navigate('/search')}
            className="btn-outline w-full py-3 font-semibold"
          >
            Lihat Semua Event ({cards.length})
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
