import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Ticket,
  Receipt,
  QrCode,
  LogOut,
  LogIn,
  Info,
  Calendar,
  MapPin,
  Clock,
  Shield,
  BarChart3,
  X,
  ChevronRight,
  Upload,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAppState, useAppDispatch } from '../../store/appStore';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDateTime, formatDate } from '../../data/mockData';
import { avatar, heroPoster } from '../../assets/posters';
import StatusBadge from '../../components/StatusBadge';
import ETicket from '../../components/ETicket';
import Footer from '../../components/Footer';

export default function ProfilePage() {
  const { event, orders } = useAppState();
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [ticketModal, setTicketModal] = useState(null);
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [uploadReceiptModal, setUploadReceiptModal] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const userName = currentUser?.name || 'Pengunjung Karcix';
  const userEmail = currentUser?.email?.toLowerCase();

  // Filter orders matching current authenticated user
  const displayOrders = orders.filter((o) => {
    if (!currentUser) return true;
    if (currentUser.role && currentUser.role !== 'customer') return true;
    return o.email?.toLowerCase() === userEmail;
  });

  const activeTickets = displayOrders.filter((o) => o.status === 'paid');

  const handleOrderRowClick = (order) => {
    if (order.status === 'paid') {
      setTicketModal(order);
    } else {
      setSelectedOrderModal(order);
    }
  };

  const handleUploadReceiptSubmit = (e) => {
    e.preventDefault();
    if (!uploadReceiptModal || !receiptFile) return;

    dispatch({
      type: 'UPLOAD_RECEIPT',
      payload: {
        orderId: uploadReceiptModal.id,
        receiptUrl: receiptFile,
      },
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadReceiptModal(null);
      setSelectedOrderModal(null);
      setReceiptFile(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-between">
      <main className="min-h-screen pb-16 pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Profil */}
          <aside className="w-full md:w-80 flex-shrink-0 animate-slide-up">
            <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center pb-6 border-b border-black/5">
                <img
                  src={avatar(userName)}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-[#1173d4] shadow-md"
                />
                <h1 className="text-xl font-bold text-[#1D1D1F]">{userName}</h1>
                <p className="text-xs text-[#86868B] mt-0.5">{currentUser?.email || 'Tamu'}</p>
                {currentUser?.whatsapp && (
                  <p className="text-xs text-[#86868B] font-mono mt-0.5">{currentUser.whatsapp}</p>
                )}

                {currentUser?.roleLabel && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1173d4] border border-blue-100">
                    {currentUser.roleLabel}
                  </span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 my-5">
                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="w-full flex items-center gap-2 p-2.5 text-xs font-semibold rounded-xl bg-blue-50 text-[#1173d4] hover:bg-blue-100/70 transition-colors"
                  >
                    <Shield className="w-4 h-4" /> Buka Admin Dashboard
                  </Link>
                )}

                {currentUser?.role === 'promotor' && (
                  <Link
                    to="/promotor"
                    className="w-full flex items-center gap-2 p-2.5 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100/70 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" /> Buka Promotor Panel
                  </Link>
                )}

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-semibold rounded-xl border border-red-200 text-[#FF3B30] hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Keluar dari Akun
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5"
                  >
                    <LogIn className="w-4 h-4" /> Masuk ke Akun
                  </Link>
                )}
              </div>

              <div className="bg-blue-50/70 rounded-2xl p-3.5 flex gap-2.5 text-xs text-[#555558] border border-blue-100/50">
                <Info className="w-4 h-4 text-[#1173d4] shrink-0 mt-0.5" />
                <p>
                  {isAuthenticated
                    ? 'Tiket aktif dan riwayat pesanan Anda tersimpan aman secara otomatis.'
                    : 'Masuk dengan email pemesanan untuk melihat e-ticket Anda.'}
                </p>
              </div>
            </div>
          </aside>

          {/* Konten Utama */}
          <div className="flex-grow w-full space-y-8">
            {/* Section Tiket Aktif */}
            <section className="animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1D1D1F]">Tiket Aktif</h2>
                  <p className="text-xs text-[#86868B]">
                    E-Ticket resmi Anda untuk check-in di gate acara
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1173d4] border border-blue-100">
                  {activeTickets.length} Tiket
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {activeTickets.length > 0 ? (
                  activeTickets.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#1D1D1F] text-white rounded-3xl overflow-hidden shadow-lg border border-black/10 relative group"
                    >
                      <div
                        className="h-32 w-full bg-cover bg-center relative"
                        style={{
                          backgroundImage: `url("${heroPoster(event?.id, event?.title)}")`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1D1D1F] via-[#1D1D1F]/60 to-transparent" />
                        <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white">
                            {order.tierName}
                          </span>
                          <span className="font-mono text-xs text-white/90 font-bold bg-black/40 px-2 py-0.5 rounded">
                            {order.ticketId || order.id}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <h3 className="font-bold text-lg text-white truncate">
                          {event?.title || 'PENSI FEST 2026'}
                        </h3>
                        <p className="text-xs text-white/70 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-[#1173d4]" />
                          {formatDate(event?.date)} • {event?.location}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                          <div>
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">
                              Pemegang Tiket
                            </p>
                            <p className="font-semibold text-sm text-white">{order.buyerName}</p>
                          </div>

                          <button
                            onClick={() => setTicketModal(order)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Buka QR Code</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="xl:col-span-2 bg-white border border-black/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
                    <Ticket className="w-12 h-12 text-[#D1D1D6] mb-3" />
                    <p className="text-[#1D1D1F] font-bold">Belum ada tiket aktif.</p>
                    <p className="text-[#86868B] text-xs mt-1 mb-4 max-w-sm">
                      Tiket akan otomatis muncul di sini setelah pembayaran diverifikasi oleh admin.
                    </p>
                    <button
                      onClick={() => navigate('/search')}
                      className="btn-primary py-2 px-5 text-xs font-semibold"
                    >
                      Cari Event Sekarang
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Section Riwayat Pesanan (Clickable rows) */}
            <section className="animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1D1D1F]">Riwayat Pesanan</h2>
                  <p className="text-xs text-[#86868B]">
                    Klik pada pesanan untuk melihat detail tiket atau status pembayaran
                  </p>
                </div>
              </div>

              <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-black/5">
                  {displayOrders.length > 0 ? (
                    [...displayOrders]
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((order) => (
                        <div
                          key={order.id}
                          onClick={() => handleOrderRowClick(order)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-blue-50/40 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-[#F5F5F7] group-hover:bg-blue-100/60 flex items-center justify-center text-[#555558] group-hover:text-[#1173d4] border border-black/5 transition-colors">
                              <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-[#1D1D1F] text-sm font-mono group-hover:text-[#1173d4] transition-colors">
                                  {order.id}
                                </p>
                                {order.status === 'paid' && (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    QR Siap
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#86868B] mt-0.5">
                                {order.tierName} • {order.qty} Tiket •{' '}
                                {formatDateTime(order.timestamp)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                            <div className="text-left sm:text-right">
                              <StatusBadge status={order.status} />
                              <p className="font-bold text-sm text-[#1D1D1F] mt-0.5">
                                {formatRupiah(order.totalAmount)}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1173d4] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-8 text-center text-[#86868B] text-xs">
                      Tidak ada riwayat pesanan.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modal E-Ticket (Paid) */}
      {ticketModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
          onClick={() => setTicketModal(null)}
        >
          <div className="relative w-full max-w-sm my-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setTicketModal(null)}
              aria-label="Tutup"
              className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow-lg text-[#1D1D1F] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <ETicket order={ticketModal} event={event} />
          </div>
        </div>
      )}

      {/* Modal Order Detail (Pending / Cancelled) */}
      {selectedOrderModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
          onClick={() => setSelectedOrderModal(null)}
        >
          <div
            className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-4">
              <div>
                <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                  Detail Pesanan
                </span>
                <h3 className="text-lg font-bold text-[#1D1D1F] font-mono">
                  {selectedOrderModal.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#86868B]">Status Pesanan:</span>
                <StatusBadge status={selectedOrderModal.status} />
              </div>

              <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Event:</span>
                  <span className="font-semibold text-[#1D1D1F]">{event?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Kategori:</span>
                  <span className="font-semibold text-[#1D1D1F]">{selectedOrderModal.tierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Jumlah Tiket:</span>
                  <span className="font-semibold text-[#1D1D1F]">{selectedOrderModal.qty} Tiket</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-2">
                  <span className="text-[#86868B]">Total Pembayaran:</span>
                  <span className="font-bold text-sm text-[#1173d4]">
                    {formatRupiah(selectedOrderModal.totalAmount)}
                  </span>
                </div>
              </div>

              {selectedOrderModal.status === 'pending' && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <p className="font-semibold">Menunggu Pembayaran / Verifikasi Admin</p>
                      <p className="mt-0.5 text-amber-700">
                        {selectedOrderModal.receiptUrl
                          ? 'Bukti pembayaran sudah terunggah dan sedang diperiksa oleh admin.'
                          : 'Segera lakukan pembayaran dan unggah bukti transfer/QRIS Anda.'}
                      </p>
                    </div>
                  </div>

                  {!selectedOrderModal.receiptUrl ? (
                    <button
                      onClick={() => setUploadReceiptModal(selectedOrderModal)}
                      className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Unggah Bukti Pembayaran</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                      <p className="text-xs text-[#1173d4] font-semibold">
                        ✓ Bukti pembayaran telah terkirim
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Bukti Pembayaran */}
      {uploadReceiptModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setUploadReceiptModal(null)}
        >
          <div
            className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-4">
              <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1173d4]" />
                Unggah Bukti Pembayaran
              </h3>
              <button
                onClick={() => setUploadReceiptModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="p-6 text-center text-emerald-600 space-y-2 animate-scale-in">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <p className="font-bold text-sm">Bukti pembayaran berhasil dikirim!</p>
                <p className="text-xs text-gray-500">Admin akan segera memverifikasi pesanan Anda.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadReceiptSubmit} className="space-y-4">
                <p className="text-xs text-[#86868B]">
                  Pesanan ID: <strong className="font-mono text-[#1D1D1F]">{uploadReceiptModal.id}</strong> (
                  {formatRupiah(uploadReceiptModal.totalAmount)})
                </p>

                <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-6 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    id="modal-receipt-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setReceiptFile(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="modal-receipt-input" className="cursor-pointer block">
                    {receiptFile ? (
                      <div className="space-y-2">
                        <img
                          src={receiptFile}
                          alt="Preview"
                          className="max-h-40 mx-auto rounded-xl object-contain shadow-sm"
                        />
                        <p className="text-xs text-blue-600 font-medium">Klik untuk ganti gambar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-xs font-semibold text-[#1D1D1F]">
                          Pilih Screenshot / Foto Bukti Transfer
                        </p>
                        <p className="text-[11px] text-[#86868B]">Mendukung PNG, JPG (Maks. 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadReceiptModal(null)}
                    className="btn-outline flex-1 py-2.5 text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!receiptFile}
                    className="btn-primary flex-1 py-2.5 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    Kirim Bukti
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
