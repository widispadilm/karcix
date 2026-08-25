import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Check, MapPin, Printer, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppState } from '../../store/appStore';
import { formatDate, formatTime, ORDER_STATUS } from '../../data/mockData';
import { poster } from '../../assets/posters';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { lastCreatedOrder: order, event } = useAppState();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!order || order.status === ORDER_STATUS.PAID) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/status');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">Belum ada tiket</h1>
        <p className="text-[#86868B] mb-8">Pesan tiket terlebih dahulu untuk melihat e-ticket.</p>
        <Link to="/" className="btn-primary">Cari Event</Link>
      </div>
    );
  }

  // Halaman ini hanya untuk pesanan yang sudah lunas — jika belum lunas, alihkan ke status
  if (order.status !== ORDER_STATUS.PAID) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] mb-1">Tiket Belum Terbit</h1>
          <p className="text-xs font-mono text-[#1173d4] font-bold mb-3">ID Pesanan: {order.id}</p>
          <p className="text-xs text-[#86868B] leading-relaxed mb-4">
            Pesanan Anda belum berstatus lunas (sedang diproses verifikasi oleh tim Karcix). E-Ticket QR Code akan otomatis ditampilkan setelah disetujui.
          </p>

          <div className="mb-6 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#1173d4] font-semibold flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1173d4] animate-ping shrink-0" />
            <span>Mengalihkan otomatis ke Halaman Status dalam <strong>{countdown}</strong> detik...</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link to="/status" className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
              <span>Cek Status Pesanan Saya Sekarang</span>
            </Link>
            <Link to="/" className="btn-outline w-full py-2.5 text-xs font-semibold">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const eventPoster = poster(event.title, { label: event.title, width: 600, height: 400 });
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location} ${event.address || ''}`.trim()
  )}`;

  return (
    <div className="min-h-screen bg-[#F5F5F7] antialiased flex flex-col items-center justify-center p-6 sm:p-12">
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-start items-center z-50 print:hidden">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium tracking-wide uppercase">Kembali</span>
        </button>
      </nav>

      <main className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-24 mt-12 animate-scale-in">
        {/* Tiket digital */}
        <div className="flex-shrink-0">
          <div className="ticket-card w-[300px] h-[500px] flex flex-col justify-between">
            <div className="h-[60%] flex flex-col">
              <div
                className="h-48 w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${eventPoster}")` }}
              />
              <div className="p-6 flex flex-col grow justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-[#86868B] text-sm mt-1">{event.subtitle}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#A1A1A6] font-semibold mb-1">
                      Tanggal
                    </p>
                    <p className="text-sm font-medium text-[#1D1D1F]">{formatDate(event.date)}</p>
                    <p className="text-sm font-medium text-[#1D1D1F]">{formatTime(event.date)} WIB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-[#A1A1A6] font-semibold mb-1">
                      Tiket
                    </p>
                    <p className="text-sm font-medium text-[#1D1D1F]">{order.tierName}</p>
                    <p className="text-sm font-medium text-[#1D1D1F]">{order.qty}×</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-card-divider" />

            <div className="h-[40%] bg-white p-6 flex flex-col items-center justify-center relative rounded-b-lg">
              <div className="w-32 h-32 bg-white flex items-center justify-center p-2 rounded-lg border border-gray-100 shadow-sm">
                <QRCodeSVG value={order.ticketId} size={112} />
              </div>
              <p className="text-xs text-[#A1A1A6] mt-4 tracking-widest uppercase font-mono">
                {order.ticketId}
              </p>
            </div>
          </div>
        </div>

        {/* Info sukses */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-4 lg:pt-12 max-w-md animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-6 shadow-lg">
            <Check className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#1D1D1F] mb-4 leading-tight">
            Tiketmu sudah siap!
          </h1>
          <p className="text-lg text-[#86868B] mb-10">
            E-ticket digital kamu sudah aktif. Tunjukkan QR di atas kepada petugas gate saat masuk.
          </p>

          <div className="w-full space-y-4 print:hidden">
            <button
              onClick={() => window.print()}
              className="btn-dark w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
              <Printer className="w-5 h-5" />
              Cetak / Simpan PDF
            </button>

            <Link
              to="/status"
              className="w-full flex items-center justify-center gap-2 bg-transparent text-[#1173d4] hover:text-[#0f60b3] py-3 rounded-lg font-medium text-sm transition-colors"
            >
              Lihat detail pesanan
            </Link>
          </div>

          <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-100 w-full flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#555558]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1D1D1F]">{event.location}</h4>
              <p className="text-sm text-[#86868B] mt-1">{event.address}</p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#1173d4] font-medium mt-2 inline-block hover:underline print:hidden"
              >
                Petunjuk Arah
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
