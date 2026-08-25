import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router';
import {
  Clock,
  Copy,
  Check,
  Upload,
  AlertCircle,
  QrCode,
  Building2,
  ArrowLeft,
  ImageIcon,
  ChevronRight,
  CheckCircle2,
  Send,
  X,
} from 'lucide-react';
import { useAppState, useAppDispatch } from '../../store/appStore';
import { ORDER_STATUS, MAX_RECEIPT_BYTES, formatRupiah } from '../../data/mockData';
import qrisImage from '../../assets/qris-placeholder.jpg';

/** Batas waktu pembayaran, dihitung dari waktu pesanan dibuat. */
const PAYMENT_WINDOW_SECONDS = 15 * 60;

const BANK_ACCOUNTS = [
  { bank: 'BCA', acc: '1234567890' },
  { bank: 'Mandiri', acc: '0987654321' },
];

function secondsLeft(order) {
  if (!order || !order.timestamp) return 0;
  const elapsed = (Date.now() - new Date(order.timestamp).getTime()) / 1000;
  return Math.max(0, Math.round(PAYMENT_WINDOW_SECONDS - elapsed));
}

export default function PaymentPage() {
  const { lastCreatedOrder, orders, lastCreatedOrderId } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const targetOrderId =
    location.state?.orderId ||
    searchParams.get('orderId') ||
    localStorage.getItem('karcix-last-order-id');

  const activeOrder =
    (targetOrderId && orders.find((o) => o.id === targetOrderId)) ||
    lastCreatedOrder ||
    (lastCreatedOrderId && orders.find((o) => o.id === lastCreatedOrderId)) ||
    [...orders].reverse().find((o) => o.status === ORDER_STATUS.PENDING) ||
    null;

  const [timeLeft, setTimeLeft] = useState(() => secondsLeft(activeOrder));
  const [activeTab, setActiveTab] = useState(
    activeOrder?.paymentMethod === 'bank' ? 'transfer' : 'qris'
  );
  const [copiedText, setCopiedText] = useState('');
  const [selectedFileUrl, setSelectedFileUrl] = useState(activeOrder?.receiptUrl || null);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);

  const isPending = activeOrder?.status === ORDER_STATUS.PENDING;

  // Sisa waktu dihitung ulang dari timestamp pesanan
  useEffect(() => {
    if (!activeOrder || !isPending) return;
    setTimeLeft(secondsLeft(activeOrder));
    const timerId = setInterval(() => setTimeLeft(secondsLeft(activeOrder)), 1000);
    return () => clearInterval(timerId);
  }, [activeOrder, isPending]);

  // Saat waktu habis, kembalikan kuota tier
  useEffect(() => {
    if (isPending && timeLeft <= 0 && activeOrder) {
      dispatch({ type: 'EXPIRE_ORDER', payload: { orderId: activeOrder.id } });
    }
  }, [isPending, timeLeft, activeOrder, dispatch]);

  const timerColorClass = useMemo(() => {
    if (timeLeft > 300) return 'text-[#1D1D1F]';
    if (timeLeft > 60) return 'text-[#FF9500]';
    return 'text-[#FF3B30] animate-pulse';
  }, [timeLeft]);

  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center text-[#1D1D1F] px-4 text-center">
        <AlertCircle className="w-16 h-16 text-[#FF9500] mb-4" />
        <h2 className="text-2xl font-bold mb-2">Tidak ada pesanan aktif</h2>
        <p className="text-[#86868B] mb-6">Silakan pilih tiket dan lakukan checkout terlebih dahulu.</p>
        <Link to="/" className="btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch {
      setCopiedText('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG atau PNG).');
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setUploadError(
        `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 5 MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setUploadError('Gagal membaca file. Coba lagi.');
    reader.onloadend = () => {
      setSelectedFileUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReceipt = (e) => {
    e.preventDefault();
    if (!selectedFileUrl) {
      setUploadError('Silakan pilih foto / screenshot bukti transfer QRIS terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    dispatch({
      type: 'UPLOAD_RECEIPT',
      payload: { orderId: activeOrder.id, receiptUrl: selectedFileUrl },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessToast(true);
      setSubmittedModalOpen(true);
    }, 600);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const baseAmount = activeOrder.totalAmount - activeOrder.uniqueCode;
  const isExpired = !isPending && activeOrder.status === ORDER_STATUS.EXPIRED;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-24 pt-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        {isExpired ? (
          <div className="glass-card z-depth-1 p-8 text-center animate-fade-in">
            <AlertCircle className="w-16 h-16 text-[#FF3B30] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Batas Waktu Pembayaran Habis</h2>
            <p className="text-[#86868B] mb-6">
              Pesanan Anda otomatis dibatalkan dan kuota tiket telah dikembalikan.
            </p>
            <Link to="/" className="btn-primary inline-flex">
              Pesan Ulang Tiket
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Ringkasan */}
            <div className="glass-card z-depth-1 p-6 sm:p-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5">
                <div>
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
                    ID Pesanan: {activeOrder.id}
                  </span>
                  <h1 className="text-2xl font-bold text-[#1D1D1F]">Instruksi Pembayaran</h1>
                </div>
                <div className="flex items-center gap-2 bg-[#F5F5F7] px-4 py-2 rounded-xl">
                  <Clock className="w-5 h-5 text-[#86868B]" />
                  <span className={`font-mono text-lg font-bold ${timerColorClass}`}>
                    {timeString}
                  </span>
                </div>
              </div>

              {/* Rincian Nominal */}
              <div className="py-6 border-b border-black/5 space-y-2 text-sm">
                <div className="flex justify-between text-[#86868B]">
                  <span>
                    {activeOrder.tierName} × {activeOrder.qty}
                  </span>
                  <span>{formatRupiah(baseAmount)}</span>
                </div>
                <div className="flex justify-between text-[#86868B]">
                  <span className="flex items-center gap-1">
                    Kode Unik
                    <span className="text-[10px] bg-blue-50 text-[#1173d4] px-1.5 py-0.5 rounded font-mono">
                      otomatis
                    </span>
                  </span>
                  <span className="font-mono text-[#1173d4]">+{activeOrder.uniqueCode}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1D1D1F] pt-2 border-t border-black/5">
                  <span>Total Tagihan</span>
                  <span className="text-xl text-[#1173d4]">
                    {formatRupiah(activeOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Pilihan Tab Pembayaran */}
              <div className="mt-6">
                <div className="bg-gray-100 p-1.5 mb-6 flex gap-2 rounded-2xl border border-black/5">
                  <button
                    onClick={() => setActiveTab('qris')}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'qris'
                        ? 'bg-[#1173d4] text-white shadow-md'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    QRIS (GoPay, OVO, Dana, BCA)
                  </button>
                  <button
                    onClick={() => setActiveTab('transfer')}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'transfer'
                        ? 'bg-[#1173d4] text-white shadow-md'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Transfer Bank Manual
                  </button>
                </div>

                {activeTab === 'qris' ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="bg-white p-4 mb-3 w-64 h-64 flex items-center justify-center rounded-2xl border border-black/10 shadow-sm">
                      <img
                        src={qrisImage}
                        alt="Kode QRIS pembayaran Karcix"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-[#86868B] text-center max-w-xs mb-2">
                      Scan kode QRIS di atas dengan m-Banking / e-Wallet apa saja.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    {BANK_ACCOUNTS.map((item) => (
                      <div
                        key={item.acc}
                        className="bg-[#F5F5F7] p-4 rounded-2xl border border-black/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#86868B]">{item.bank}</p>
                          <p className="font-mono text-base font-bold text-[#1D1D1F]">{item.acc}</p>
                          <p className="text-[11px] text-[#86868B]">a/n Panitia Karcix ID</p>
                        </div>
                        <button
                          onClick={() => handleCopy(item.acc)}
                          className="bg-white hover:bg-gray-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors border border-black/5 shadow-sm cursor-pointer"
                        >
                          {copiedText === item.acc ? (
                            <Check className="w-3.5 h-3.5 text-[#34C759]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#86868B]" />
                          )}
                          {copiedText === item.acc ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Upload & Submit Bukti Pembayaran QRIS/Transfer */}
            <form
              onSubmit={handleSubmitReceipt}
              className="glass-card z-depth-1 p-6 sm:p-8 animate-slide-up space-y-4"
              style={{ animationDelay: '150ms' }}
            >
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#1173d4]" />
                  Upload Bukti Pembayaran {activeTab === 'qris' ? 'QRIS' : 'Transfer'}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Unggah tangkapan layar / screenshot bukti sukses pembayaran Anda, lalu klik tombol
                  Kirim Bukti Pembayaran.
                </p>
              </div>

              {/* Upload Box */}
              <div className="relative border-2 border-dashed border-gray-300 hover:border-[#1173d4] rounded-2xl p-6 transition-colors bg-gray-50 text-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="receipt-upload"
                  aria-label="Unggah bukti pembayaran"
                />

                {selectedFileUrl ? (
                  <div className="space-y-3">
                    <div className="w-36 h-36 overflow-hidden rounded-2xl border border-black/10 mx-auto shadow-sm bg-white p-1">
                      <img
                        src={selectedFileUrl}
                        alt="Pratinjau bukti transfer"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                    <p className="text-xs font-semibold text-[#137333] flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> Bukti foto siap dikirim
                    </p>
                    <p className="text-[11px] text-[#86868B]">Klik di sini untuk mengganti foto</p>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-black/5 flex items-center justify-center mx-auto mb-3 text-[#1173d4] shadow-sm">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-[#1D1D1F] mb-1">
                      Klik atau seret screenshot bukti pembayaran ke sini
                    </p>
                    <p className="text-[11px] text-[#86868B]">Mendukung format JPG, PNG (Maks. 5 MB)</p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#FF3B30] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFileUrl || isSubmitting}
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Mengirim Bukti Pembayaran...'
                    : 'Kirim Bukti Pembayaran untuk Diverifikasi'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-50 border border-green-200 text-[#137333] p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-[#137333] shrink-0" />
          <div>
            <p className="font-bold text-sm">Bukti Pembayaran Berhasil Dikirim!</p>
            <p className="text-xs text-green-700">Admin akan segera memverifikasi pesanan Anda.</p>
          </div>
        </div>
      )}

      {/* Modal Popup Bukti Pembayaran Terkirim / Verifikasi */}
      {submittedModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5 text-center animate-scale-in relative my-auto">
            <button
              onClick={() => setSubmittedModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-[#1D1D1F] mb-1">Bukti Pembayaran Terkirim!</h3>
            <p className="text-xs font-mono text-[#1173d4] font-bold mb-3">ID Pesanan: {activeOrder.id}</p>

            <p className="text-xs text-[#86868B] leading-relaxed mb-6">
              Bukti pembayaran Anda telah berhasil diunggah dan sedang diproses verifikasi oleh tim Admin Karcix. E-ticket QR Code akan otomatis terbit begitu status dinyatakan lunas.
            </p>

            <div className="bg-[#F5F5F7] p-4 rounded-2xl text-left text-xs space-y-2 mb-6 border border-black/5">
              <div className="flex justify-between">
                <span className="text-[#86868B]">Event:</span>
                <span className="font-semibold text-[#1D1D1F] truncate max-w-[200px]">
                  {activeOrder.eventTitle || 'PENSI FEST 2026'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Tiket:</span>
                <span className="font-semibold text-[#1D1D1F]">
                  {activeOrder.tierName} × {activeOrder.qty}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-black/5 pt-1.5">
                <span>Total Dibayar:</span>
                <span className="text-[#1173d4]">{formatRupiah(activeOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/status')}
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Cek Progres Status Pesanan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-outline w-full py-2.5 text-xs font-semibold cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
