import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import {
  Ticket,
  Lock,
  Mail,
  User,
  Shield,
  BarChart3,
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';

const STAFF_ACCESS_CODES = {
  admin: 'admin2026',
  promotor: 'promotor2026',
  gate: 'gate2026',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo } = useAuth();

  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'staff'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Customer form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Staff form state
  const [staffRole, setStaffRole] = useState('admin');
  const [staffCode, setStaffCode] = useState('');

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'admin') navigate('/admin');
    else if (role === 'promotor') navigate('/promotor');
    else if (role === 'gate') navigate('/gate');
    else navigate('/profile');
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
    setTimeout(() => redirectAfterLogin('customer'), 600);
  };

  const handleStaffLogin = (e) => {
    e.preventDefault();
    if (staffCode.trim() !== STAFF_ACCESS_CODES[staffRole]) {
      setError(`Kode akses ${staffRole} salah. (Petunjuk demo: ${STAFF_ACCESS_CODES[staffRole]})`);
      return;
    }

    const demoStaff = DEMO_ACCOUNTS[staffRole];
    login(demoStaff);
    setSuccessMsg(`Berhasil masuk sebagai ${demoStaff.roleLabel}!`);
    setTimeout(() => redirectAfterLogin(staffRole), 600);
  };

  const handleQuickDemo = (type) => {
    const user = loginAsDemo(type);
    setSuccessMsg(`Masuk sebagai ${user.name} (${user.roleLabel})...`);
    setTimeout(() => redirectAfterLogin(user.role), 500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1173d4] flex items-center justify-center text-white shadow-md">
            <Ticket className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-[#1D1D1F]">Karcix.id</span>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#1D1D1F]">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1 text-center text-sm text-[#86868B]">
          Akses e-ticket, pantau pesanan, atau kelola event Karcix
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-black/5 rounded-2xl animate-scale-in">
          {/* Tab Selection */}
          <div className="flex bg-[#F5F5F7] p-1 rounded-xl mb-6 border border-black/5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setError('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'customer'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <User className="w-4 h-4" /> Pembeli Tiket
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setError('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <Shield className="w-4 h-4" /> Panitia / Staff
            </button>
          </div>

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
          {activeTab === 'customer' && (
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
                  />
                </div>
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
                Masuk / Buat Akun
              </button>
            </form>
          )}

          {/* Staff Form */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                  Pilih Peran Staff
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStaffRole('admin')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      staffRole === 'admin'
                        ? 'border-[#1173d4] bg-blue-50/50 text-[#1173d4] font-semibold'
                        : 'border-black/5 bg-[#F5F5F7] text-[#555558] hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="text-xs">Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffRole('promotor')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      staffRole === 'promotor'
                        ? 'border-[#1173d4] bg-blue-50/50 text-[#1173d4] font-semibold'
                        : 'border-black/5 bg-[#F5F5F7] text-[#555558] hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs">Promotor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffRole('gate')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      staffRole === 'gate'
                        ? 'border-[#1173d4] bg-blue-50/50 text-[#1173d4] font-semibold'
                        : 'border-black/5 bg-[#F5F5F7] text-[#555558] hover:bg-gray-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs">Gate</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-1.5">
                  Kode Akses {staffRole.toUpperCase()}
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={staffCode}
                    onChange={(e) => {
                      setStaffCode(e.target.value);
                      setError('');
                    }}
                    placeholder={`Kode akses ${staffRole}`}
                    className="input-field pl-12 !pl-12"
                  />
                </div>
                <p className="text-[11px] text-[#86868B] mt-1">
                  Demo code: <code className="font-mono">{STAFF_ACCESS_CODES[staffRole]}</code>
                </p>
              </div>

              <button type="submit" className="btn-primary w-full mt-2">
                Masuk ke Panel {staffRole.toUpperCase()}
              </button>
            </form>
          )}

          {/* Quick Demo 1-Click Login */}
          <div className="mt-8 pt-6 border-t border-black/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1173d4]" /> 1-Click Demo Login
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="p-2.5 bg-[#F5F5F7] hover:bg-gray-200/80 rounded-xl text-left transition-colors border border-black/5"
              >
                <p className="text-xs font-semibold text-[#1D1D1F]">Andi Pratama</p>
                <p className="text-[10px] text-[#86868B]">Customer Demo</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 bg-blue-50/70 hover:bg-blue-100/70 rounded-xl text-left transition-colors border border-blue-100"
              >
                <p className="text-xs font-semibold text-[#1173d4]">Admin Dashboard</p>
                <p className="text-[10px] text-[#86868B]">Full Management</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('promotor')}
                className="p-2.5 bg-purple-50/70 hover:bg-purple-100/70 rounded-xl text-left transition-colors border border-purple-100"
              >
                <p className="text-xs font-semibold text-purple-700">Promotor Panel</p>
                <p className="text-[10px] text-[#86868B]">Laporan & Kuota</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('gate')}
                className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-xl text-left transition-colors border border-emerald-100"
              >
                <p className="text-xs font-semibold text-emerald-700">Petugas Gate</p>
                <p className="text-[10px] text-[#86868B]">QR Scanner</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
