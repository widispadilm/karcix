import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Lock, Timer, QrCode, Landmark, Wallet, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../store/appStore';
import { formatRupiah, MAX_QTY_PER_ORDER } from '../../data/mockData';
import CountdownTimer from '../../components/CountdownTimer';

const PAYMENT_METHODS = [
  { id: 'qris', icon: QrCode, label: 'QRIS' },
  { id: 'gopay', icon: Wallet, label: 'GoPay' },
  { id: 'bank', icon: Landmark, label: 'Transfer Bank' },
];

export default function CheckoutPage() {
  const { tierId } = useParams();
  const navigate = useNavigate();
  const { event } = useAppState();
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ buyerName: '', email: '', whatsapp: '' });
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [holdExpired, setHoldExpired] = useState(false);

  const tier = event?.tiers?.find((t) => t.id === tierId);
  if (!tier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#86868B]">Tiket tidak ditemukan.</p>
        <Link to="/" className="btn-primary">Kembali ke Beranda</Link>
      </div>
    );
  }

  const remaining = tier.quota - tier.sold;
  const soldOut = remaining <= 0;
  const maxQty = Math.min(remaining, MAX_QTY_PER_ORDER);
  const subtotal = tier.price * qty;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (soldOut || holdExpired) return;
    if (!form.buyerName || !form.email || !form.whatsapp) return;

    dispatch({
      type: 'CREATE_ORDER',
      payload: { ...form, tierId, qty: Math.min(qty, maxQty), paymentMethod },
    });
    navigate('/payment');
  };

  if (soldOut) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-[#FF9500]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">
          Tiket {tier.name} sudah habis
        </h1>
        <p className="text-[#86868B] mb-8 max-w-sm">
          Kuota untuk kategori ini sudah terpenuhi. Silakan pilih kategori tiket lain.
        </p>
        <Link to={`/event/${event.id}`} className="btn-primary">Lihat Kategori Lain</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="w-full max-w-5xl mb-10 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-4 text-[#1173d4]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D1F] mb-2">Checkout</h1>
          <p className="text-sm text-[#86868B] font-medium">
            {event.title} — {tier.name}
          </p>

          <div className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-[#86868B] bg-white shadow-sm py-2 px-4 rounded-full">
            <Timer className="w-4 h-4" />
            {holdExpired ? (
              <span className="text-[#FF3B30] font-medium">Masa penahanan tiket habis</span>
            ) : (
              <span className="flex items-center gap-1">
                Tiket ditahan selama
                <CountdownTimer
                  minutes={10}
                  variant="inline"
                  className="font-semibold"
                  onExpired={() => setHoldExpired(true)}
                />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-[#1D1D1F]">Data Pembeli</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="buyerName" className="block text-sm font-medium text-[#555558] mb-2">
                  Nama Lengkap
                </label>
                <input
                  id="buyerName"
                  type="text"
                  value={form.buyerName}
                  onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                  placeholder="Masukkan nama lengkap"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#555558] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@contoh.com"
                  className="input-field"
                  required
                />
                <p className="text-xs text-[#86868B] mt-2">
                  E-ticket dan status pesanan dikirim ke email ini.
                </p>
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-[#555558] mb-2">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="input-field"
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <span className="block text-sm font-medium text-[#555558] mb-2">Jumlah Tiket</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Kurangi jumlah tiket"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-10 h-10 rounded-full bg-[#E5E5EA] hover:bg-[#D1D1D6] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <span className="text-lg font-medium">−</span>
                  </button>
                  <span className="text-xl font-bold w-8 text-center tabular-nums">{qty}</span>
                  <button
                    type="button"
                    aria-label="Tambah jumlah tiket"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="w-10 h-10 rounded-full bg-[#E5E5EA] hover:bg-[#D1D1D6] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                  <span className="text-xs text-[#86868B]">
                    Maks {MAX_QTY_PER_ORDER} tiket · sisa {remaining}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-[#1D1D1F]">Metode Pembayaran</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center justify-center gap-2 h-14 rounded-lg font-semibold text-[15px] border transition-all ${
                        paymentMethod === method.id
                          ? 'border-[#1173d4] bg-blue-50 text-[#1173d4]'
                          : 'border-gray-200 bg-white text-[#555558] hover:border-[#1173d4]/40'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={holdExpired}
                className="w-full bg-[#1173d4] hover:bg-[#0f60b3] text-white h-14 rounded-lg font-semibold text-[15px] mt-8 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {holdExpired ? 'Waktu Habis — Ulangi Pemesanan' : 'Lanjut ke Pembayaran'}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#86868B]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pembayaran aman &amp; terenkripsi</span>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-[#1D1D1F]">Ringkasan Pesanan</h2>

            <div className="mb-6">
              <h3 className="text-md font-medium text-[#1D1D1F]">{event.title}</h3>
              <p className="text-sm text-[#86868B] mt-1">
                {tier.name} × {qty}
              </p>
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between">
                <span className="text-[#86868B]">Harga satuan</span>
                <span className="text-[#1D1D1F] font-medium">{formatRupiah(tier.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Subtotal</span>
                <span className="text-[#1D1D1F] font-medium">{formatRupiah(subtotal)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-[#1D1D1F] font-semibold">Total</span>
              <span className="text-2xl font-bold text-[#1D1D1F]">{formatRupiah(subtotal)}</span>
            </div>

            <p className="text-xs text-[#86868B] mt-4 leading-relaxed">
              Kode unik 3 digit akan ditambahkan pada nominal transfer di halaman pembayaran.
              Kode ini dipakai panitia untuk mencocokkan pembayaranmu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
