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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
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

    if (!password || password.length < 6) {
      setError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
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

      setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke profil Anda...');
      setTimeout(() => {
        navigate('/profile');
      }, 800);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-[#1173d4] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Karcix.id</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Daftar Akun Baru
          </h1>
          <p className="mt-1.5 text-sm text-[#86868B]">
            Buat akun untuk memesan tiket, melihat e-ticket, dan menikmati kemudahan event
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-black/5 rounded-3xl animate-scale-in">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Contoh: Andi Pratama"
                  className="input-field pl-12 !pl-12"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="nama@email.com"
                  className="input-field pl-12 !pl-12"
                />
              </div>
              <p className="text-[11px] text-[#86868B] mt-1">
                E-ticket pesanan akan dikirimkan ke email ini.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    setError('');
                  }}
                  placeholder="081234567890"
                  className="input-field pl-12 !pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Minimal 6 karakter"
                  className="input-field pl-12 pr-10 !pl-12"
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

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                Konfirmasi Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Ulangi kata sandi"
                  className="input-field pl-12 !pl-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-3 py-3 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-6 pt-5 border-t border-black/5 text-center text-xs text-[#86868B]">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-[#1173d4] hover:underline">
              Masuk di sini ➔
            </Link>
          </div>
        </div>

        {/* Back to Home Button at Bottom */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
