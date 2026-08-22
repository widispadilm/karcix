import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Search,
  User,
  Ticket,
  Home,
  Receipt,
  LogIn,
  LogOut,
  Shield,
  BarChart3,
  QrCode,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { avatar } from '../assets/posters';

// Halaman fokus & dashboard internal punya navigasinya sendiri.
const HIDDEN_PREFIXES = ['/checkout', '/confirmation', '/payment', '/admin', '/promotor', '/gate'];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { currentUser, isAuthenticated, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHidden =
    HIDDEN_PREFIXES.some((p) => path.startsWith(p)) || /^\/event\/[^/]+$/.test(path);
  if (isHidden) return null;

  const desktopLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        path === to ? 'text-[#1173d4] font-semibold' : 'text-[#1D1D1F] hover:text-[#1173d4]'
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

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="glass-nav fixed top-0 w-full z-50 h-16 flex items-center justify-between px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#1173d4] flex items-center justify-center text-white shadow-sm">
            <Ticket className="w-4 h-4" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#1D1D1F]">Karcix.id</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {desktopLink('/', 'Events')}
          {desktopLink('/search', 'Cari Event')}
          {desktopLink('/status', 'Cek Pesanan')}
          {desktopLink('/help', 'Bantuan')}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/search"
            aria-label="Cari event"
            className="md:hidden flex items-center text-[#1D1D1F] hover:text-[#1173d4] transition-colors p-2"
          >
            <Search className="w-5 h-5" />
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-black/5 transition-all border border-black/5 bg-white/60"
              >
                <img
                  src={avatar(currentUser.name)}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#1173d4]"
                />
                <span className="hidden sm:block text-xs font-semibold text-[#1D1D1F] max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-black/5 py-2 animate-scale-in z-50">
                  <div className="px-4 py-3 border-b border-black/5">
                    <p className="text-sm font-bold text-[#1D1D1F] truncate">{currentUser.name}</p>
                    <p className="text-xs text-[#86868B] truncate">{currentUser.email}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-[#1173d4] border border-blue-100">
                        {currentUser.roleLabel || currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#86868B]" /> Tiket & Profil Saya
                    </Link>
                    <Link
                      to="/status"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-[#86868B]" /> Status Pesanan
                    </Link>

                    {/* Staff Shortcut Links */}
                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1173d4] hover:bg-blue-50/50 font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}

                    {currentUser.role === 'promotor' && (
                      <Link
                        to="/promotor"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50/50 font-medium transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" /> Promotor Dashboard
                      </Link>
                    )}

                    {currentUser.role === 'gate' && (
                      <Link
                        to="/gate"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50/50 font-medium transition-colors"
                      >
                        <QrCode className="w-4 h-4" /> Gate Scanner
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-black/5 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#FF3B30] hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden glass-nav fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 border-t border-black/5 bg-white/90 backdrop-blur-lg">
        {mobileLink('/', 'Events', Home)}
        {mobileLink('/search', 'Cari', Search)}
        {mobileLink('/status', 'Pesanan', Receipt)}
        {isAuthenticated
          ? mobileLink('/profile', 'Profil', User)
          : mobileLink('/login', 'Masuk', LogIn)}
      </nav>
    </>
  );
}
