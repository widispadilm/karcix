import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Ticket, QrCode, Calendar, MapPin, Receipt, Info, X } from 'lucide-react';
import Footer from '../../components/Footer';
import ETicket from '../../components/ETicket';
import StatusBadge from '../../components/StatusBadge';
import { useAppState } from '../../store/appStore';
import { formatDate, formatDateTime, formatRupiah, ORDER_STATUS } from '../../data/mockData';
import { avatar, poster } from '../../assets/posters';

const DEMO_USER = 'Pengguna Demo';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { event, orders } = useAppState();
  const [ticketModal, setTicketModal] = useState(null);

  // Tiket aktif = pesanan yang sudah lunas. Sebelumnya semua pesanan ditandai "Aktif",
  // termasuk yang dibatalkan.
  const paidOrders = orders.filter((o) => o.status === ORDER_STATUS.PAID);
  const ticketBg = poster(event.id, { label: event.title, width: 600, height: 400 });

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pb-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 animate-fade-in">
          <div className="sticky top-24 bg-white border border-black/5 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5">
              <img
                src={avatar(DEMO_USER)}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-[#1173d4]"
              />
              <div>
                <h2 className="font-semibold text-[#1D1D1F]">{DEMO_USER}</h2>
                <span className="text-xs text-[#86868B]">Mode demo</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 flex gap-2 text-xs text-[#555558]">
              <Info className="w-4 h-4 text-[#1173d4] shrink-0 mt-0.5" />
              <p>
                Belum ada sistem login, jadi halaman ini menampilkan seluruh pesanan yang ada di
                sesi ini.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex-grow space-y-12">
          {/* Header mobile */}
          <div className="md:hidden flex items-center gap-4 bg-white p-4 rounded-xl border border-black/5 shadow-sm animate-slide-up">
            <img
              src={avatar(DEMO_USER)}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-[#1173d4]"
            />
            <div>
              <h2 className="text-xl font-bold text-[#1D1D1F]">{DEMO_USER}</h2>
              <span className="text-xs text-[#86868B]">Mode demo</span>
            </div>
          </div>

          {/* Tiket aktif */}
          <section className="animate-slide-up">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D1D1F]">Dompet Digital</h1>
              <p className="text-[#86868B] mt-1 text-sm">Tiket yang sudah lunas dan siap dipakai.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {paidOrders.length > 0 ? (
                paidOrders.map((order) => (
                  <div
                    key={order.id}
                    className="relative overflow-hidden rounded-2xl bg-white border border-black/5 shadow-sm"
                  >
                    <div className="absolute inset-0 z-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
                      <img src={ticketBg} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="relative z-20 p-6 flex flex-col h-full min-h-[240px]">
                      <div className="flex justify-between items-start mb-8">
                        <span className="bg-[#1173d4] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                          {order.tierName}
                        </span>
                        {order.checkedIn && (
                          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            Checked In
                          </span>
                        )}
                      </div>

                      <div className="mt-auto text-white">
                        <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-6">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> {event.location}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/20 pt-4">
                          <div className="flex gap-6">
                            <div>
                              <p className="text-[10px] text-white/60 uppercase tracking-wider">Tiket</p>
                              <p className="font-semibold text-lg">{order.qty}×</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/60 uppercase tracking-wider">Atas nama</p>
                              <p className="font-semibold">{order.buyerName}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setTicketModal(order)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <QrCode className="w-4 h-4" />
                            Lihat Tiket
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="xl:col-span-2 bg-white border border-black/5 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                  <Ticket className="w-12 h-12 text-[#D1D1D6] mb-4" />
                  <p className="text-[#1D1D1F] font-medium">Belum ada tiket aktif.</p>
                  <p className="text-[#86868B] text-sm mt-1 mb-4">
                    Tiket muncul di sini setelah pembayaranmu diverifikasi panitia.
                  </p>
                  <button onClick={() => navigate('/search')} className="btn-primary">
                    Cari Event
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Riwayat */}
          <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">Riwayat Pesanan</h2>

            <div className="bg-white border border-black/5 rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-black/5">
                {orders.length > 0 ? (
                  [...orders]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((order) => (
                      <div
                        key={order.id}
                        className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F5F5F7] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#555558] border border-black/5">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#1D1D1F] text-[15px] font-mono">
                              {order.id}
                            </p>
                            <p className="text-sm text-[#86868B] mt-0.5">
                              {order.tierName} • {order.qty} Tiket •{' '}
                              {formatDateTime(order.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                          <StatusBadge status={order.status} />
                          <p className="font-semibold text-[#1D1D1F]">
                            {formatRupiah(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-6 text-center text-[#86868B] text-sm">
                    Tidak ada riwayat pesanan.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modal e-ticket */}
      {ticketModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
          onClick={() => setTicketModal(null)}
        >
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setTicketModal(null)}
              aria-label="Tutup"
              className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow-md text-[#1D1D1F] hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <ETicket order={ticketModal} event={event} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
