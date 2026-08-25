import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  Music,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { useAppState } from '../../store/appStore';
import { formatRupiah, formatDate, formatTime, INITIAL_EVENTS } from '../../data/mockData';
import { poster, eventGallery } from '../../assets/posters';

export default function EventDetailPage() {
  const { id } = useParams();
  const { events, event } = useAppState();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allEvents = events && events.length > 0 ? events : (event ? [event] : INITIAL_EVENTS);
  const currentEvent = allEvents.find((e) => e.id === id) || allEvents[0];

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-3">Event Tidak Ditemukan</h1>
        <p className="text-[#86868B] mb-8 max-w-sm">Event yang kamu cari tidak tersedia.</p>
        <Link to="/" className="btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const gallery = eventGallery(currentEvent.id, currentEvent.title);
  const currentImage = gallery[currentImageIndex] || gallery[0];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const availableTiers = currentEvent.tiers?.filter((t) => t.quota - t.sold > 0) || [];
  const minPrice = availableTiers.length
    ? Math.min(...availableTiers.map((t) => t.price))
    : Math.min(...(currentEvent.tiers?.map((t) => t.price) || [0]));

  const bestSellerId = currentEvent.tiers?.reduce(
    (best, t) => (!best || t.sold / t.quota > best.sold / best.quota ? t : best),
    null
  )?.id;

  const activeTierId = selectedTier || availableTiers[0]?.id;

  return (
    <div className="antialiased overflow-hidden w-full h-screen flex flex-col md:flex-row bg-[#F5F5F7]">
      {/* Tombol kembali floating */}
      <div className="fixed top-0 left-0 z-50 p-4 md:p-6 pointer-events-none w-full">
        <button
          onClick={() => navigate('/')}
          aria-label="Kembali"
          className="pointer-events-auto bg-white/70 backdrop-blur-md border border-black/5 hover:bg-white transition-colors w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </button>
      </div>

      {/* Multi-Image Carousel Section */}
      <div className="w-full h-[400px] md:w-[42vw] md:h-screen flex-shrink-0 relative overflow-hidden bg-black group">
        {/* Background Image Slide */}
        <div
          key={currentImage.id}
          className="w-full h-full bg-cover bg-center bg-no-repeat absolute inset-0 transition-all duration-500 ease-out transform scale-100"
          style={{ backgroundImage: `url("${currentImage.url}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        {/* Counter Badge at Top Right */}
        <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md text-white rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/15">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>
            {currentImageIndex + 1} / {gallery.length}
          </span>
        </div>

        {/* Image Title & Caption at Bottom */}
        <div className="absolute bottom-10 left-6 right-6 z-20 text-white">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600/80 backdrop-blur-sm mb-1">
            {currentImage.title}
          </span>
          <p className="text-xs text-white/80 font-medium">{currentImage.caption}</p>
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={handlePrevImage}
          aria-label="Gambar Sebelumnya"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={handleNextImage}
          aria-label="Gambar Berikutnya"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Dot Indicators */}
        <div className="absolute bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-2">
          {gallery.map((img, idx) => (
            <button
              key={img.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(idx);
              }}
              aria-label={`Slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentImageIndex === idx
                  ? 'w-6 h-2 bg-white shadow-md'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Konten Detail Event */}
      <div className="w-full md:w-[58vw] md:h-screen overflow-y-auto relative bg-white rounded-t-3xl md:rounded-none -mt-6 md:mt-0 z-10 no-scrollbar flex-1">
        <div className="max-w-[800px] mx-auto pb-32">
          <div className="p-6 md:p-12 md:pt-24 flex flex-col gap-4 animate-slide-up">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#1173d4]">
                {currentEvent.category || 'Konser'}
              </span>
              {currentEvent.badge && (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  {currentEvent.badge}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-[52px] font-black leading-[1.1] tracking-[-0.02em] text-[#1D1D1F]">
              {currentEvent.title}
            </h1>
            <p className="text-[16px] text-[#86868B] font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1173d4]" />
              {currentEvent.location} • {formatDate(currentEvent.date)}
            </p>
          </div>

          <hr className="border-t border-black/5 mx-6 md:mx-12" />

          <div className="p-6 md:p-12 grid grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: 'Tanggal', value: formatDate(currentEvent.date) },
              { icon: Clock, label: 'Waktu', value: `${formatTime(currentEvent.date)} WIB` },
              { icon: MapPin, label: 'Lokasi', value: currentEvent.location },
              { icon: Users, label: 'Penyelenggara', value: currentEvent.organizer || 'Karcix Official' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/5 flex flex-col gap-2 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <item.icon className="w-5 h-5 text-[#1173d4]" />
                <div>
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                    {item.label}
                  </span>
                  <p className="text-[15px] font-bold text-[#1D1D1F] mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 md:px-12 space-y-3">
            <h2 className="text-xl font-bold text-[#1D1D1F]">Tentang Event</h2>
            <p className="text-[#555558] text-[15px] leading-relaxed whitespace-pre-line">
              {currentEvent.description}
            </p>
          </div>

          {currentEvent.lineup && currentEvent.lineup.length > 0 && (
            <div className="p-6 md:p-12 space-y-3">
              <h2 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#1173d4]" />
                Guest Star &amp; Lineup
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentEvent.lineup.map((artist) => (
                  <span
                    key={artist}
                    className="px-4 py-2 bg-[#F5F5F7] border border-black/5 rounded-full text-sm font-semibold text-[#1D1D1F]"
                  >
                    {artist}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pemilihan Tier Tiket */}
          <div className="p-6 md:p-12 space-y-4">
            <h2 className="text-xl font-bold text-[#1D1D1F]">Pilih Paket Tiket</h2>

            <div className="space-y-3">
              {currentEvent.tiers && currentEvent.tiers.length > 0 ? (
                currentEvent.tiers.map((tier) => {
                  const remaining = tier.quota - tier.sold;
                  const isSoldOut = remaining <= 0;
                  const isSelected = activeTierId === tier.id;
                  const isBestSeller = tier.id === bestSellerId && !isSoldOut;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSoldOut && setSelectedTier(tier.id)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSoldOut
                          ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                          : isSelected
                          ? 'border-[#1173d4] bg-blue-50/30 shadow-md ring-2 ring-[#1173d4]/20'
                          : 'border-black/10 bg-white hover:border-black/20 hover:shadow-sm'
                      }`}
                    >
                      {isBestSeller && (
                        <span className="absolute -top-2.5 right-4 bg-[#1173d4] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Terlaris
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-[#1D1D1F] text-base">{tier.name}</h3>
                          <p className="text-xs text-[#86868B] mt-1">{tier.description}</p>
                          <span
                            className={`inline-block text-xs font-medium mt-2 ${
                              isSoldOut ? 'text-[#FF3B30]' : 'text-[#86868B]'
                            }`}
                          >
                            {isSoldOut ? 'Habis Terjual' : `Tersisa ${remaining} tiket`}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-[#1D1D1F]">
                            {formatRupiah(tier.price)}
                          </span>
                          <span className="block text-[11px] text-[#86868B]">per tiket</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl">
                  Tiket untuk event ini segera hadir.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 right-0 w-full md:w-[58vw] bg-white/90 backdrop-blur-xl border-t border-black/5 p-4 px-6 md:px-12 flex items-center justify-between z-40">
          <div>
            <span className="text-xs text-[#86868B] block">Harga mulai dari</span>
            <span className="text-xl font-bold text-[#1D1D1F]">{formatRupiah(minPrice)}</span>
          </div>

          <button
            onClick={() => {
              if (activeTierId) navigate(`/checkout/${activeTierId}`);
            }}
            disabled={!activeTierId || availableTiers.length === 0}
            className="btn-primary py-3 px-8 flex items-center gap-2 text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-40 cursor-pointer"
          >
            <span>Pilih Tiket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
