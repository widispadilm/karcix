import { Link, useLocation } from 'react-router';
import { Search, User, Ticket, Home, Receipt } from 'lucide-react';

// Halaman fokus & dashboard internal punya navigasinya sendiri.
const HIDDEN_PREFIXES = ['/checkout', '/confirmation', '/payment', '/admin', '/promotor', '/gate'];

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const isHidden =
    HIDDEN_PREFIXES.some((p) => path.startsWith(p)) || /^\/event\/[^/]+$/.test(path);
  if (isHidden) return null;

  const desktopLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        path === to ? 'text-[#1173d4]' : 'text-[#1D1D1F] hover:text-[#1173d4]'
      }`}
    >
      {label}
    </Link>
  );

  const mobileLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all active:scale-90 ${
        path === to ? 'text-[#1173d4] font-bold' : 'text-[#86868B]'
      }`}
    >
      <Icon className="w-5 h-5 mb-1" />
      {label}
    </Link>
  );

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="glass-nav fixed top-0 w-full z-50 h-16 flex items-center justify-between px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <Ticket className="w-5 h-5 text-[#1D1D1F]" />
          <span className="font-bold text-xl tracking-tight text-[#1D1D1F]">Karcix.id</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {desktopLink('/', 'Events')}
          {desktopLink('/search', 'Cari')}
          {desktopLink('/status', 'Cek Pesanan')}
          {desktopLink('/help', 'Bantuan')}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/search"
            aria-label="Cari event"
            className="md:hidden flex items-center text-[#1D1D1F] hover:text-[#1173d4] transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            to="/profile"
            aria-label="Profil"
            className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-black/5 hover:opacity-80 transition-opacity flex items-center justify-center"
          >
            <User className="w-4 h-4 text-[#86868B]" />
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden glass-nav fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 border-t border-black/5 bg-white/90 backdrop-blur-lg">
        {mobileLink('/', 'Events', Home)}
        {mobileLink('/search', 'Cari', Search)}
        {mobileLink('/status', 'Pesanan', Receipt)}
        {mobileLink('/profile', 'Profil', User)}
      </nav>
    </>
  );
}
