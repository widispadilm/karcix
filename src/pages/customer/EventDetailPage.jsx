import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Clock, Users, Music } from 'lucide-react';
import { useAppState } from '../../store/appStore';
import { formatRupiah, formatDate, formatTime, CATALOG_EVENTS } from '../../data/mockData';
import { poster } from '../../assets/posters';

export default function EventDetailPage() {
  const { id } = useParams();
  const { event } = useAppState();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState(null);

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  // Hanya event utama yang punya tier & kuota; sisanya masih katalog.
  if (id !== event.id) {
    const catalogEvent = CATALOG_EVENTS.find((e) => e.id === id);
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-3">
          {catalogEvent ? catalogEvent.title : 'Event tidak ditemukan'}
        </h1>
        <p className="text-[#86868B] mb-8 max-w-sm">
          {catalogEvent
            ? 'Penjualan tiket untuk event ini belum dibuka. Pantau terus halaman utama, ya.'
            : 'Event yang kamu cari tidak tersedia.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="btn-primary">Kembali ke Beranda</Link>
          <Link to={`/event/${event.id}`} className="btn-outline">
            Lihat {event.title}
          </Link>
        </div>
      </div>
    );
  }

  const availableTiers = event.tiers?.filter((t) => t.quota - t.sold > 0) || [];
  const minPrice = availableTiers.length
    ? Math.min(...availableTiers.map((t) => t.price))
    : Math.min(...(event.tiers?.map((t) => t.price) || [0]));

  // Badge "Terlaris" mengikuti data, bukan posisi tier di dalam array.
  const bestSellerId = event.tiers?.reduce(
    (best, t) => (!best || t.sold / t.quota > best.sold / best.quota ? t : best),
    null
  )?.id;

  const activeTierId = selectedTier || availableTiers[0]?.id;

  return (
    <div className="antialiased overflow-hidden w-full h-screen flex flex-col md:flex-row bg-[#F5F5F7]">
      <div className="fixed top-0 left-0 z-50 p-4 md:p-6 pointer-events-none w-full">
        <button
          onClick={() => navigate('/')}
          aria-label="Kembali"
          className="pointer-events-auto bg-white/50 backdrop-blur-md border border-black/5 hover:bg-white/80 transition-colors w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </button>
      </div>

      {/* Poster */}
      <div className="w-full h-[400px] md:w-[40vw] md:h-screen flex-shrink-0 relative">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat absolute inset-0"
          style={{ backgroundImage: `url("${poster(event.id, { label: event.title })}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 md:hidden" />
      </div>

      {/* Konten */}
      <div className="w-full md:w-[60vw] md:h-screen overflow-y-auto relative bg-white rounded-t-3xl md:rounded-none -mt-6 md:mt-0 z-10 no-scrollbar flex-1">
        <div className="max-w-[800px] mx-auto pb-32">
          <div className="p-6 md:p-12 md:pt-24 flex flex-col gap-4 animate-slide-up">
            <h1 className="text-4xl md:text-[56px] font-black leading-[1.1] tracking-[-0.02em] text-[#1D1D1F]">
              {event.title}
            </h1>
            <p className="text-[17px] text-[#86868B] font-medium mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.location} • {formatDate(event.date)}
            </p>
          </div>

          <hr className="border-t border-black/5 mx-6 md:mx-12" />

          <div className="p-6 md:p-12 grid grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: 'Tanggal', value: formatDate(event.date) },
              { icon: Clock, label: 'Waktu', value: `${formatTime(event.date)} WIB` },
              { icon: MapPin, label: 'Lokasi', value: event.location },
              { icon: Users, label: 'Penyelenggara', value: event.organizer },
            ].map((item, i) => (
              <div
                key={item.label}
                className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/5 flex flex-col gap-2 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <item.icon className="w-5 h-5 text-[#1173d4]" />
                <p className="text-xs text-[#86868B] font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-[#1D1D1F]">{item.value}</p>
              </div>
            ))}
          </div>

          <hr className="border-t border-black/5 mx-6 md:mx-12" />

          {/* Tier tiket */}
          <div className="p-6 md:p-12 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Pilih Paket</h2>
            <div className="flex flex-col gap-3">
              {event.tiers?.map((tier) => {
                const remaining = tier.quota - tier.sold;
                const isSoldOut = remaining <= 0;

                return (
                  <button
                    key={tier.id}
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`group flex items-center justify-between text-left p-5 rounded-2xl bg-white border transition-all relative overflow-hidden ${
                      isSoldOut
                        ? 'opacity-60 cursor-not-allowed'
                        : activeTierId === tier.id
                          ? 'border-[#1173d4] bg-blue-50/30 shadow-sm'
                          : 'border-black/5 hover:border-[#1173d4]/30 hover:bg-blue-50/20'
                    }`}
                  >
                    {tier.id === bestSellerId && !isSoldOut && (
                      <div className="absolute top-0 right-0 bg-[#1173d4] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">
                        Terlaris
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <h3
                        className={`text-lg font-bold transition-colors ${
                          isSoldOut
                            ? 'text-[#86868B] line-through'
                            : 'text-[#1D1D1F] group-hover:text-[#1173d4]'
                        }`}
                      >
                        {tier.name}
                      </h3>
                      <p className="text-[15px] text-[#86868B]">{tier.description}</p>
                      {!isSoldOut && (
                        <p className="text-xs text-[#86868B] mt-1">Tersisa {remaining} tiket</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end">
                      {isSoldOut ? (
                        <span className="text-[13px] font-medium tracking-wide uppercase text-[#86868B] bg-[#E5E5EA]/50 px-2.5 py-1 rounded-md">
                          Habis
                        </span>
                      ) : (
                        <>
                          <span className="text-lg font-semibold text-[#1D1D1F]">
                            {formatRupiah(tier.price)}
                          </span>
                          <span className="text-xs text-[#86868B]">per tiket</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {event.lineup?.length > 0 && (
            <div className="p-6 md:p-12 pt-0 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">Pengisi Acara</h2>
              <div className="flex flex-wrap gap-2">
                {event.lineup.map((artist) => (
                  <span
                    key={artist}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F5F5F7] border border-black/5 text-sm font-medium text-[#1D1D1F]"
                  >
                    <Music className="w-3.5 h-3.5 text-[#1173d4]" />
                    {artist}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 md:p-12 pt-0 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">Tentang Acara</h2>
            <p className="text-[15px] text-[#555558] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="fixed bottom-0 right-0 w-full md:w-[60vw] h-20 glass-panel flex items-center justify-between px-6 md:px-12 z-20">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#86868B]">Mulai dari</span>
            <span className="text-xl font-bold text-[#1D1D1F] leading-none">
              {formatRupiah(minPrice)}
            </span>
          </div>
          <button
            disabled={!activeTierId}
            onClick={() => navigate(`/checkout/${activeTierId}`)}
            className="bg-[#1173d4] hover:bg-[#0f60b3] text-white px-8 py-3.5 rounded-xl font-semibold text-[15px] transition-colors shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {activeTierId ? 'Pilih Tiket' : 'Tiket Habis'}
            {activeTierId && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
