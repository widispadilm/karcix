import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import {
  Ticket,
  Mail,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo } = useAuth();

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const redirectAfterLogin = () => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    navigate('/profile');
  };

  const handleCustomerLogin = (e) => {
    e.preventDefault();
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    const name = customerName.trim() || customerEmail.split('@')[0];
    const user = {
      id: `usr-cust-${Date.now().toString().slice(-4)}`,
      name,
      email: customerEmail.trim().toLowerCase(),
      role: 'customer',
      roleLabel: 'Pembeli',
    };

    login(user);
    setSuccessMsg(`Selamat datang kembali, ${name}!`);
    setTimeout(() => redirectAfterLogin(), 600);
  };

  const handleQuickDemo = () => {
    const user = loginAsDemo('customer');
    setSuccessMsg(`Masuk sebagai ${user.name}...`);
    setTimeout(() => redirectAfterLogin(), 500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1173d4] flex items-center justify-center text-white shadow-md">
            <Ticket className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Karcix.id</span>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#1D1D1F]">
          Masuk ke Akun Pembeli
        </h2>
        <p className="mt-1 text-center text-sm text-[#86868B]">
          Akses e-ticket aktif dan riwayat pemesanan tiket Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-black/5 rounded-2xl animate-scale-in">
          {/* Feedback messages */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-[#FF3B30] rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-[#22c55e] rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Customer Form */}
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="nama@email.com"
                  className="input-field pl-12 !pl-12"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-[#86868B] mt-1">
                Gunakan email yang sama saat Anda memesan tiket.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                Nama Lengkap (Opsional)
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="input-field pl-12 !pl-12"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              Masuk / Lanjutkan
            </button>
          </form>

          {/* 1-Click Quick Demo Customer */}
          <div className="mt-8 pt-6 border-t border-black/5">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full p-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 rounded-xl text-left transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#1173d4]" />
                <div>
                  <p className="text-xs font-bold text-[#1173d4]">Coba Masuk sebagai Customer Demo</p>
                  <p className="text-[11px] text-[#86868B]">{DEMO_ACCOUNTS.customer.name} ({DEMO_ACCOUNTS.customer.email})</p>
                </div>
              </div>
              <span className="text-xs text-[#1173d4] font-semibold">Masuk ➔</span>
            </button>
          </div>

          {/* Staff portal link */}
          <div className="mt-6 pt-4 border-t border-black/5 text-center">
            <Link
              to="/staff"
              className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#1173d4]" />
              <span>Panitia atau Pengelola Event?</span>
              <span className="font-semibold text-[#1173d4] hover:underline">Masuk ke Portal Staff ➔</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
