import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Package, ArrowLeft, Info, Clock, XCircle } from 'lucide-react';
import { useAppState } from '../../store/appStore';
import { formatRupiah, formatDateTime, ORDER_STATUS } from '../../data/mockData';
import ETicket from '../../components/ETicket';
import StatusBadge from '../../components/StatusBadge';

export default function OrderStatusPage() {
  const { orders, event, lastCreatedOrder } = useAppState();
  // Setelah checkout, ID pesanan terakhir langsung diisikan supaya pembeli tidak perlu mengetiknya.
  const [searchQuery, setSearchQuery] = useState(lastCreatedOrder?.id || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    setSearchResults(
      orders.filter(
        (o) => o.id.toLowerCase() === query || o.email.toLowerCase() === query
      )
    );
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-24 pt-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Ke Beranda</span>
        </Link>

        <div className="glass-card z-depth-1 p-6 sm:p-8 animate-fade-in text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cek Status Pesanan</h1>
          <p className="text-[#86868B] mb-8 max-w-md mx-auto">
            Masukkan ID Pesanan atau alamat email yang digunakan saat pembelian tiket.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="KCX-20260815-001 atau email@domain.com"
                aria-label="ID pesanan atau email"
                className="input-field pl-12"
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap">
              Cari Pesanan
            </button>
          </form>
        </div>

        {hasSearched && (
          <div className="space-y-6 animate-slide-up">
            {searchResults.length > 0 ? (
              searchResults.map((order) => (
                <div key={order.id} className="glass-card z-depth-1 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-200 pb-6">
                    <div>
                      <p className="text-sm text-[#86868B] mb-1">
                        ID Pesanan:{' '}
                        <span className="font-mono text-[#1D1D1F] font-medium">{order.id}</span>
                      </p>
                      <h3 className="text-xl font-bold">{order.buyerName}</h3>
                      <p className="text-xs text-[#86868B] mt-1">
                        {formatDateTime(order.timestamp)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <p className="text-xs text-[#86868B] mb-1 uppercase tracking-wider">Tiket</p>
                      <p className="font-medium">{order.tierName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#86868B] mb-1 uppercase tracking-wider">Jumlah</p>
                      <p className="font-medium">{order.qty} Tiket</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#86868B] mb-1 uppercase tracking-wider">Total</p>
                      <p className="font-medium text-[#1173d4]">{formatRupiah(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#86868B] mb-1 uppercase tracking-wider">Email</p>
                      <p className="font-medium break-all">{order.email}</p>
                    </div>
                  </div>

                  {order.status === ORDER_STATUS.PAID && (
                    <div className="border-t border-gray-200 pt-8 mt-4">
                      <h4 className="text-lg font-bold mb-6 text-center">E-Ticket Anda</h4>
                      <div className="max-w-md mx-auto">
                        <ETicket order={order} event={event} />
                      </div>
                    </div>
                  )}

                  {order.status === ORDER_STATUS.PENDING && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                      <Info className="w-5 h-5 text-[#1173d4] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-[#1D1D1F] mb-1">
                          {order.receiptUrl
                            ? 'Pembayaran sedang diverifikasi'
                            : 'Menunggu bukti pembayaran'}
                        </h4>
                        <p className="text-sm text-[#555558]">
                          {order.receiptUrl
                            ? 'Panitia sedang mengecek pembayaran Anda. E-Ticket akan muncul di sini setelah dikonfirmasi.'
                            : 'Kami belum menerima bukti transfer untuk pesanan ini. Selesaikan pembayaran lalu unggah buktinya.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === ORDER_STATUS.EXPIRED && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#86868B] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Pesanan kedaluwarsa</h4>
                        <p className="text-sm text-[#555558]">
                          Batas waktu pembayaran terlewat dan kuota tiket sudah dilepas kembali.
                          Silakan pesan ulang.
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === ORDER_STATUS.CANCELLED && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Pesanan dibatalkan</h4>
                        <p className="text-sm text-[#555558]">
                          Bukti pembayaran tidak sesuai atau pesanan dibatalkan panitia. Hubungi
                          Customer Support bila ini tidak semestinya terjadi.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-card z-depth-1 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-[#86868B]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pesanan tidak ditemukan</h3>
                <p className="text-[#86868B]">
                  Pastikan ID Pesanan atau email yang dimasukkan sudah benar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
