import { Ticket } from 'lucide-react';
import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 py-8 mt-10 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#86868B]">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#1D1D1F]" />
          <span className="font-bold text-[#1D1D1F]">Karcix.id</span>
        </div>
        <p>© 2026 Karcix.id. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/help" className="hover:text-[#1D1D1F] transition-colors">Bantuan</Link>
          <a href="#" className="hover:text-[#1D1D1F] transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-[#1D1D1F] transition-colors">Privasi</a>
        </div>
      </div>
    </footer>
  );
}
