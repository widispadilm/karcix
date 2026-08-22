import { useState } from 'react';
import { Link } from 'react-router';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';

/**
 * Gerbang akses sederhana untuk halaman internal (admin, promotor, gate).
 *
 * CATATAN: ini hanya pengaman prototipe — kode akses ada di bundle frontend, jadi
 * siapa pun yang membuka devtools bisa membacanya. Sebelum dipakai sungguhan,
 * ganti dengan autentikasi di sisi server.
 */
const ACCESS_CODES = {
  admin: 'admin2026',
  promotor: 'promotor2026',
  gate: 'gate2026',
};

const ROLE_LABEL = {
  admin: 'Admin',
  promotor: 'Promotor',
  gate: 'Petugas Gate',
};

export default function StaffGate({ role, children }) {
  const storageKey = `karcix-staff-${role}`;
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(storageKey) === 'true'
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (unlocked) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODES[role]) {
      sessionStorage.setItem(storageKey, 'true');
      setUnlocked(true);
      return;
    }
    setError('Kode akses salah.');
    setCode('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white border border-black/5 rounded-2xl p-8 shadow-sm animate-scale-in">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1173d4] flex items-center justify-center mb-6">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">
          Area {ROLE_LABEL[role]}
        </h1>
        <p className="text-sm text-[#86868B] mb-6">
          Halaman ini khusus panitia. Masukkan kode akses untuk melanjutkan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="Kode akses"
            className="input-field"
            autoFocus
          />

          {error && (
            <p className="text-sm text-[#FF3B30] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full">
            Masuk
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke beranda
        </Link>
      </div>

      <p className="mt-6 text-xs text-[#A1A1A6] text-center max-w-sm">
        Demo: kode <code className="font-mono">{ACCESS_CODES[role]}</code>
      </p>
    </div>
  );
}
