import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Ticket,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isLengthValid = password.length >= 12;
  const isMatchValid = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Mohon masukkan nama lengkap Anda.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Mohon masukkan alamat email yang valid.');
      return;
    }

    if (!whatsapp.trim() || whatsapp.length < 9) {
      setError('Mohon masukkan nomor WhatsApp yang valid (minimal 9 digit).');
      return;
    }

    if (!isLengthValid) {
      setError('Kata sandi harus terdiri dari minimal 12 karakter untuk keamanan.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Pastikan kedua kolom sandi sama persis.');
      return;
    }

    try {
      setLoading(true);
      await registerCustomer({
        name,
        email,
        whatsapp,
        password,
      });

      setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke profil...');
      setTimeout(() => {
        navigate('/profile');
      }, 700);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-[480px] my-auto">
        {/* Brand & Header */}
        <div className="text-center mb-3 sm:mb-4">
          <Link to="/" className="inline-flex items-center gap-2 mb-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#1173d4] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-[#1D1D1F] tracking-tight">Karcix.id</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Daftar Akun Baru
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Pesan tiket dan nikmati akses dompet digital Anda
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-5 px-5 sm:py-6 sm:px-8 shadow-sm border border-black/5 rounded-2xl sm:rounded-3xl animate-scale-in relative">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer z-30"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Feedback messages */}
          {error && (
            <div className="mb-3.5 p-2.5 bg-red-50 border border-red-200 text-[#FF3B30] rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3.5 p-2.5 bg-green-50 border border-green-200 text-[#22c55e] rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    placeholder="Andi Pratama"
                    className="input-field pl-9 !pl-9 py-2 text-xs sm:text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      setError('');
                    }}
                    placeholder="081234567890"
                    className="input-field pl-9 !pl-9 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="nama@email.com"
                  className="input-field pl-9 !pl-9 py-2 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Min. 12 karakter"
                    className="input-field pl-9 pr-8 !pl-9 py-2 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1">
                  Konfirmasi Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Ulangi kata sandi"
                    className="input-field pl-9 !pl-9 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Live Security Checklist Indicators */}
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                {isLengthValid ? (
                  <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                )}
                <span className={isLengthValid ? 'text-[#22c55e] font-semibold' : 'text-[#86868B]'}>
                  Minimal 12 karakter ({password.length}/12)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isMatchValid ? (
                  <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                ) : confirmPassword.length > 0 ? (
                  <X className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                )}
                <span
                  className={
                    isMatchValid
                      ? 'text-[#22c55e] font-semibold'
                      : confirmPassword.length > 0
                      ? 'text-[#FF3B30] font-medium'
                      : 'text-[#86868B]'
                  }
                >
                  {isMatchValid
                    ? 'Kata sandi cocok ✓'
                    : confirmPassword.length > 0
                    ? 'Konfirmasi sandi belum cocok'
                    : 'Konfirmasi sandi harus sama'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isLengthValid || !isMatchValid}
              className="btn-primary w-full mt-2 py-2.5 font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-4 pt-3.5 border-t border-black/5 text-center text-xs text-[#86868B]">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-[#1173d4] hover:underline">
              Masuk di sini ➔
            </Link>
          </div>
        </div>

        {/* Back to Home Button at Bottom */}
        <div className="text-center mt-3 sm:mt-4">
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
