import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import {
  Shield,
  BarChart3,
  QrCode,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';

const STAFF_ACCESS_CODES = {
  admin: 'admin2026',
  promotor: 'promotor2026',
  gate: 'gate2026',
};

const ROLES = [
  {
    id: 'admin',
    name: 'Administrator',
    desc: 'Verifikasi bayar & kelola pesanan',
    icon: Shield,
    color: 'text-[#1173d4]',
    bg: 'bg-blue-50/70',
    border: 'border-blue-200',
    path: '/admin',
  },
  {
    id: 'promotor',
    name: 'Promotor Event',
    desc: 'Laporan omset & pantau kuota',
    icon: BarChart3,
    color: 'text-purple-600',
    bg: 'bg-purple-50/70',
    border: 'border-purple-200',
    path: '/promotor',
  },
  {
    id: 'gate',
    name: 'Petugas Gate',
    desc: 'Scan QR & check-in tiket',
    icon: QrCode,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    path: '/gate',
  },
];

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo } = useAuth();

  const [staffRole, setStaffRole] = useState('admin');
  const [staffCode, setStaffCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const redirectStaff = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from.startsWith(`/${role}`)) {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'admin') navigate('/admin');
    else if (role === 'promotor') navigate('/promotor');
    else if (role === 'gate') navigate('/gate');
    else navigate('/admin');
  };

  const handleStaffLogin = (e) => {
    e.preventDefault();
    if (staffCode.trim() !== STAFF_ACCESS_CODES[staffRole]) {
      setError(`Kode akses ${staffRole.toUpperCase()} salah. (Demo: ${STAFF_ACCESS_CODES[staffRole]})`);
      return;
    }

    const staffData = DEMO_ACCOUNTS[staffRole];
    login(staffData);
    setSuccessMsg(`Berhasil masuk sebagai ${staffData.roleLabel}!`);
    setTimeout(() => redirectStaff(staffRole), 600);
  };

  const handleQuickDemo = (type) => {
    const user = loginAsDemo(type);
    setSuccessMsg(`Masuk sebagai ${user.name} (${user.roleLabel})...`);
    setTimeout(() => redirectStaff(user.role), 500);
  };

  const currentRoleObj = ROLES.find((r) => r.id === staffRole) || ROLES[0];
  const IconComponent = currentRoleObj.icon;

  return (
    <div className="min-h-screen bg-[#141416] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Utama
        </Link>

        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Ticket className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Karcix Staff</span>
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          Portal Khusus Panitia & Staff
        </h2>
        <p className="mt-1 text-center text-sm text-gray-400">
          Akses kontrol internal manajemen event, verifikasi bayar, dan gate scanner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1C1C1E] py-8 px-6 sm:px-10 shadow-2xl border border-white/10 rounded-2xl animate-scale-in">
          {/* Role Switcher */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2.5">
              Pilih Role / Hak Akses
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = staffRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setStaffRole(role.id);
                      setError('');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold shadow-inner'
                        : 'border-white/5 bg-[#2C2C2E]/60 text-gray-400 hover:bg-[#2C2C2E] hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{role.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Staff Login Form */}
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${currentRoleObj.bg} ${currentRoleObj.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white">{currentRoleObj.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{currentRoleObj.desc}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Kode Akses Panitia ({staffRole.toUpperCase()})
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={staffCode}
                  onChange={(e) => {
                    setStaffCode(e.target.value);
                    setError('');
                  }}
                  placeholder={`Masukkan kode ${staffRole}`}
                  className="w-full bg-[#2C2C2E] border border-white/10 rounded-xl p-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center justify-between">
                <span>Demo code: <code className="font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{STAFF_ACCESS_CODES[staffRole]}</code></span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm mt-2 cursor-pointer"
            >
              Masuk ke {currentRoleObj.name}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Akses Cepat Demo (1-Klik)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-center transition-colors"
              >
                <p className="text-xs font-semibold text-blue-400">Admin</p>
                <p className="text-[10px] text-gray-400">Semua Fitur</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('promotor')}
                className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-center transition-colors"
              >
                <p className="text-xs font-semibold text-purple-400">Promotor</p>
                <p className="text-[10px] text-gray-400">Laporan</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('gate')}
                className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-center transition-colors"
              >
                <p className="text-xs font-semibold text-emerald-400">Gate</p>
                <p className="text-[10px] text-gray-400">Scanner</p>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Bukan panitia? <span className="text-blue-400 underline">Masuk sebagai Pembeli Tiket</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
