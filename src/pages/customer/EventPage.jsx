import { useNavigate } from 'react-router';
import { Calendar, MapPin, ChevronRight, ArrowRight } from 'lucide-react';
import { useAppState } from '../../store/appStore';
import { formatDate, formatRupiah, CATALOG_EVENTS, eventToCard } from '../../data/mockData';
import { poster, heroPoster } from '../../assets/posters';
import Footer from '../../components/Footer';

export default function EventPage() {
  const { event } = useAppState();
  const navigate = useNavigate();

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#1D1D1F]">Memuat...</div>
    );
  }

  // Event utama tampil lebih dulu, lalu katalog event lain.
  const cards = [eventToCard(event), ...CATALOG_EVENTS];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative w-full h-[600px] md:h-[716px] min-h-[500px] mt-16 overflow-hidden bg-black">
        <img
          src={heroPoster(event.title, event.title)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 hero-gradient" />

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col justify-end max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 max-w-3xl animate-slide-up">
            <span className="text-white/80 uppercase tracking-widest text-xs font-semibold mb-1">
              Event Unggulan
            </span>
            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter">
              {event.title}
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.location} • {formatDate(event.date)}
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate(`/event/${event.id}`)}
                className="btn-pill inline-flex items-center gap-2"
              >
                Beli Tiket
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar event */}
      <main className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-16 flex-grow">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D1F]">
              Acara Mendatang
            </h2>
            <p className="text-[#86868B] mt-2 text-sm md:text-base">Event pilihan untukmu.</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="hidden md:flex items-center gap-1 text-[#1173d4] font-medium hover:underline text-sm"
          >
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((item, i) => (
            <article
              key={item.id}
              onClick={() => navigate(`/event/${item.id}`)}
              className="event-card bg-white rounded-lg border border-black/5 overflow-hidden cursor-pointer flex flex-col h-full shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative aspect-square w-full bg-gray-100 overflow-hidden rounded-t-lg">
                <img
                  src={poster(item.id, { label: item.title })}
                  alt={item.title}
                  className="card-image absolute inset-0 w-full h-full object-cover"
                />
                {item.badge && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1D1D1F] shadow-sm">
                    {item.badge}
                  </div>
                )}
                {!item.available && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                    Segera
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-[#1D1D1F] leading-tight mb-2">{item.title}</h3>
                <div className="mt-auto pt-4 flex flex-col gap-1 text-sm text-[#86868B]">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {formatDate(item.date)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {item.location}
                  </p>
                  <p className="text-[#1D1D1F] font-semibold mt-2">
                    Mulai {formatRupiah(item.priceFrom)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <button onClick={() => navigate('/search')} className="btn-outline w-full py-3">
            Lihat Semua Event
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
