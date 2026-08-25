import { useState } from 'react';
import { X, LogIn, UserPlus, Eye, EyeOff, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', onSuccess }) {
  const { loginCustomer, registerCustomer, DEMO_ACCOUNTS, loginAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'login' | 'register'
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWa, setRegWa] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await loginCustomer({ email: loginEmail, password: loginPassword });
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Login gagal. Periksa email & kata sandi.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (regPassword.length < 12) {
      setErrorMsg('Kata sandi harus minimal 12 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await registerCustomer({
        name: regName,
        email: regEmail,
        whatsapp: regWa,
        password: regPassword,
      });
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Pendaftaran gagal.');
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo('customer');
    onClose();
    if (onSuccess) onSuccess();
  };

  const passLengthValid = regPassword.length >= 12;
  const passMatchValid = regPassword.length > 0 && regPassword === regConfirmPassword;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5 relative animate-scale-in my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex bg-[#F5F5F7] p-1 rounded-2xl mb-6 border border-black/5">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            Masuk Akun
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-[#FF3B30] font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="input-field py-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showLoginPwd ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input-field py-2.5 text-xs sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd(!showLoginPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Masuk Akun'}</span>
            </button>

            {/* Quick Demo */}
            <div className="pt-3 border-t border-black/5 text-center">
              <span className="text-[11px] text-[#86868B] block mb-2 font-medium">
                Atau coba cepat tanpa ketik password:
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-[#1173d4] border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Masuk Demo (Andi Pratama)</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Nama Anda"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="input-field py-2 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="input-field py-2 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={regWa}
                onChange={(e) => setRegWa(e.target.value)}
                className="input-field py-2 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1">
                Kata Sandi (Min. 12 Karakter)
              </label>
              <div className="relative">
                <input
                  type={showRegPwd ? 'text' : 'password'}
                  required
                  placeholder="Minimal 12 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="input-field py-2 text-xs sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPwd(!showRegPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1">
                Konfirmasi Kata Sandi
              </label>
              <input
                type="password"
                required
                placeholder="Ulangi kata sandi"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="input-field py-2 text-xs sm:text-sm"
              />
            </div>

            {/* Checklist Validasi */}
            <div className="p-3 bg-[#F5F5F7] rounded-xl space-y-1 text-[11px] border border-black/5">
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  passLengthValid ? 'text-[#22c55e]' : 'text-[#86868B]'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${passLengthValid ? 'opacity-100' : 'opacity-30'}`} />
                <span>Panjang kata sandi minimal 12 huruf</span>
              </div>
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  passMatchValid ? 'text-[#22c55e]' : 'text-[#86868B]'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${passMatchValid ? 'opacity-100' : 'opacity-30'}`} />
                <span>Konfirmasi kata sandi cocok</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !passLengthValid || !passMatchValid}
              className="btn-primary w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-40"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
