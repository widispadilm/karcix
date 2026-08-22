import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import {
  Ticket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  UserPlus,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCustomer, loginAsDemo } = useAuth();

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = () => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    navigate('/profile');
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    try {
      setLoading(true);
      const user = loginCustomer({
        email: customerEmail,
        password: customerPassword,
      });

      setSuccessMsg(`Selamat datang kembali, ${user.name}!`);
      setTimeout(() => redirectAfterLogin(), 600);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    const user = loginAsDemo('customer');
    setSuccessMsg(`Masuk sebagai ${user.name}...`);
    setTimeout(() => redirectAfterLogin(), 500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] my-auto">
        {/* Brand & Header */}
        <div className="text-center mb-4 sm:mb-5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#1173d4] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-[#1D1D1F] tracking-tight">Karcix.id</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Masuk ke Akun Pembeli
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Akses e-ticket aktif dan riwayat pemesanan Anda
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white py-6 px-5 sm:py-7 sm:px-8 shadow-sm border border-black/5 rounded-2xl sm:rounded-3xl animate-scale-in">
          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#FF3B30] rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-[#22c55e] rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCustomerLogin} className="space-y-3 sm:space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="nama@email.com"
                  className="input-field pl-11 !pl-11 py-2.5 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={customerPassword}
                  onChange={(e) => {
                    setCustomerPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Masukkan kata sandi"
                  className="input-field pl-11 pr-10 !pl-11 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-2.5 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-4 p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-[#86868B]">Belum punya akun?</span>
            <Link
              to="/register"
              className="font-bold text-[#1173d4] hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Sekarang</span>
            </Link>
          </div>

          {/* 1-Click Quick Demo */}
          <div className="mt-4 pt-3.5 border-t border-black/5">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full p-2.5 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 rounded-xl text-left transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#1173d4] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#1173d4] truncate">Masuk Akun Demo</p>
                  <p className="text-[10px] text-[#86868B] truncate">{DEMO_ACCOUNTS.customer.name}</p>
                </div>
              </div>
              <span className="text-xs text-[#1173d4] font-semibold shrink-0">Masuk ➔</span>
            </button>
          </div>

          {/* Staff portal link */}
          <div className="mt-3.5 pt-3 border-t border-black/5 text-center">
            <Link
              to="/staff"
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#86868B] hover:text-[#1173d4] transition-colors"
            >
              <Shield className="w-3 h-3 text-[#1173d4]" />
              <span>Panitia / Pengelola Event?</span>
              <span className="font-semibold text-[#1173d4] underline">Portal Staff ➔</span>
            </Link>
          </div>
        </div>

        {/* Back to Home Button at Bottom */}
        <div className="text-center mt-3.5 sm:mt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
