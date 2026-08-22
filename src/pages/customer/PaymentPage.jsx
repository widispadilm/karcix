import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Clock, Copy, Check, Upload, AlertCircle, QrCode, Building2,
  ArrowLeft, ImageIcon, ChevronRight,
} from 'lucide-react';
import { useAppState, useAppDispatch } from '../../store/appStore';
import { ORDER_STATUS, MAX_RECEIPT_BYTES } from '../../data/mockData';
import qrisImage from '../../assets/qris-placeholder.jpg';

/** Batas waktu pembayaran, dihitung dari waktu pesanan dibuat. */
const PAYMENT_WINDOW_SECONDS = 15 * 60;

const BANK_ACCOUNTS = [
  { bank: 'BCA', acc: '1234567890' },
  { bank: 'Mandiri', acc: '0987654321' },
];

function secondsLeft(order) {
  if (!order) return 0;
  const elapsed = (Date.now() - new Date(order.timestamp).getTime()) / 1000;
  return Math.max(0, Math.round(PAYMENT_WINDOW_SECONDS - elapsed));
}

export default function PaymentPage() {
  const { lastCreatedOrder } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(() => secondsLeft(lastCreatedOrder));
  const [activeTab, setActiveTab] = useState(
    lastCreatedOrder?.paymentMethod === 'bank' ? 'transfer' : 'qris'
  );
  const [copiedText, setCopiedText] = useState('');
  const [uploadError, setUploadError] = useState('');

  const isPending = lastCreatedOrder?.status === ORDER_STATUS.PENDING;

  // Sisa waktu dihitung ulang dari timestamp pesanan, bukan dari hitungan mundur lokal,
  // supaya refresh halaman tidak me-reset batas waktu.
  useEffect(() => {
    if (!lastCreatedOrder || !isPending) return;
    setTimeLeft(secondsLeft(lastCreatedOrder));
    const timerId = setInterval(() => setTimeLeft(secondsLeft(lastCreatedOrder)), 1000);
    return () => clearInterval(timerId);
  }, [lastCreatedOrder, isPending]);

  // Saat waktu habis, kembalikan kuota tier — kalau tidak, stok bocor tiap pesanan mangkrak.
  useEffect(() => {
    if (isPending && timeLeft <= 0 && lastCreatedOrder) {
      dispatch({ type: 'EXPIRE_ORDER', payload: { orderId: lastCreatedOrder.id } });
    }
  }, [isPending, timeLeft, lastCreatedOrder, dispatch]);

  const timerColorClass = useMemo(() => {
    if (timeLeft > 300) return 'text-[#1D1D1F]';
    if (timeLeft > 60) return 'text-[#FF9500]';
    return 'text-[#FF3B30] animate-pulse';
  }, [timeLeft]);

  if (!lastCreatedOrder) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center text-[#1D1D1F] px-4 text-center">
        <AlertCircle className="w-16 h-16 text-[#FF9500] mb-4" />
        <h2 className="text-2xl font-bold mb-2">Tidak ada pesanan aktif</h2>
        <p className="text-[#86868B] mb-6">Silakan pilih tiket dan lakukan checkout terlebih dahulu.</p>
        <Link to="/" className="btn-primary">Kembali ke Beranda</Link>
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
      dispatch({
        type: 'UPLOAD_RECEIPT',
        payload: { orderId: lastCreatedOrder.id, receiptUrl: reader.result },
      });
    };
    reader.readAsDataURL(file);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const baseAmount = lastCreatedOrder.totalAmount - lastCreatedOrder.uniqueCode;
  const receiptUrl = lastCreatedOrder.receiptUrl;
  const expired = !isPending && lastCreatedOrder.status === ORDER_STATUS.EXPIRED;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-20 pt-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Ke Beranda</span>
        </Link>

        {expired ? (
          <div className="glass-card z-depth-1 border border-[#FF3B30]/30 p-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-[#FF3B30]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Waktu pembayaran habis</h1>
            <p className="text-[#86868B] mb-8">
              Pesanan {lastCreatedOrder.id} kedaluwarsa dan kuota tiketnya sudah dikembalikan.
              Silakan lakukan pemesanan ulang.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Pesan Ulang
            </button>
          </div>
        ) : !isPending ? (
          <div className="glass-card z-depth-1 p-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#34C759]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Pesanan sudah diproses</h1>
            <p className="text-[#86868B] mb-8">
              Status pesanan {lastCreatedOrder.id} saat ini bukan lagi menunggu pembayaran.
            </p>
            <button onClick={() => navigate('/status')} className="btn-primary">
              Lihat Status Pesanan
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="glass-card z-depth-1 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#1173d4]" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6 mb-6">
                <div>
                  <p className="text-sm text-[#86868B] mb-1">ID Pesanan</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold">{lastCreatedOrder.id}</span>
                    <button
                      onClick={() => handleCopy(lastCreatedOrder.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#86868B]"
                      title="Salin ID"
                    >
                      {copiedText === lastCreatedOrder.id ? (
                        <Check className="w-4 h-4 text-[#34C759]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 rounded-xl border border-gray-200 flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${timerColorClass}`} />
                  <div className="flex flex-col">
                    <span className="text-xs text-[#86868B]">Sisa Waktu</span>
                    <span className={`font-mono text-xl font-bold tabular-nums ${timerColorClass}`}>
                      {timeString}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <p className="text-[#86868B] mb-2">Total Pembayaran</p>
                <div className="text-4xl sm:text-5xl font-black mb-2 flex items-baseline justify-center tracking-tight">
                  <span>Rp {baseAmount.toLocaleString('id-ID')}</span>
                  <span className="text-[#1173d4] font-bold font-mono">
                    .{String(lastCreatedOrder.uniqueCode).padStart(3, '0')}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-amber-50 text-[#B06000] text-sm px-4 py-2 rounded-lg border border-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  Transfer tepat sampai 3 digit terakhir agar terverifikasi otomatis
                </div>
              </div>

              <div className="bg-gray-50 p-2 mb-6 flex gap-2 rounded-xl border border-gray-200">
                <button
                  onClick={() => setActiveTab('qris')}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'qris'
                      ? 'bg-[#1173d4] text-white'
                      : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QRIS
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'transfer'
                      ? 'bg-[#1173d4] text-white'
                      : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Transfer Bank
                </button>
              </div>

              {activeTab === 'qris' ? (
                <div className="flex flex-col items-center animate-fade-in">
                  <div className="bg-white p-4 mb-4 w-64 h-64 flex items-center justify-center rounded-xl border border-gray-100">
                    <img
                      src={qrisImage}
                      alt="Kode QRIS pembayaran Karcix"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-[#86868B] text-center max-w-xs">
                    Scan QRIS di atas menggunakan aplikasi e-wallet atau mobile banking Anda
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {BANK_ACCOUNTS.map((item) => (
                    <div
                      key={item.acc}
                      className="bg-[#F5F5F7] p-4 rounded-xl border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-[#86868B] mb-1">{item.bank}</p>
                        <p className="font-mono text-lg font-bold">{item.acc}</p>
                        <p className="text-xs text-[#86868B] mt-1">a/n Panitia PENSI FEST</p>
                      </div>
                      <button
                        onClick={() => handleCopy(item.acc)}
                        className="bg-white hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border border-gray-200"
                      >
                        {copiedText === item.acc ? (
                          <Check className="w-4 h-4 text-[#34C759]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#86868B]" />
                        )}
                        {copiedText === item.acc ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload bukti */}
            <div
              className="glass-card z-depth-1 p-6 sm:p-8 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1173d4]" />
                Bukti Pembayaran
              </h3>
              <p className="text-sm text-[#86868B] mb-6">
                Setelah melakukan pembayaran, unggah bukti transfer agar pesanan Anda dapat segera
                diverifikasi panitia.
              </p>

              <div className="relative">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="receipt-upload"
                  aria-label="Unggah bukti pembayaran"
                />
                <div
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                    receiptUrl
                      ? 'border-[#1173d4]/40 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-[#1173d4] hover:bg-blue-50/50'
                  }`}
                >
                  {receiptUrl ? (
                    <div className="space-y-4">
                      <div className="w-32 h-32 overflow-hidden rounded-lg border border-gray-200 mx-auto">
                        <img src={receiptUrl} alt="Pratinjau bukti transfer" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[#137333] font-medium flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Bukti berhasil diunggah
                      </p>
                      <p className="text-xs text-[#86868B]">Klik untuk mengganti foto</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-4 text-[#86868B]">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <p className="font-medium mb-1">Klik atau seret file ke sini</p>
                      <p className="text-xs text-[#86868B]">Format: JPG, PNG (maks 5 MB)</p>
                    </>
                  )}
                </div>
              </div>

              {uploadError && (
                <p className="mt-4 text-sm text-[#FF3B30] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {uploadError}
                </p>
              )}

              {receiptUrl && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => navigate('/status')}
                    className="btn-accent flex items-center gap-2"
                  >
                    Cek Status Pesanan
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
