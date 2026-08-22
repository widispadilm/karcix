import { useMemo, useState } from 'react';
import { Search, Send, CreditCard, ClipboardCheck, ChevronDown, Headset, SearchX } from 'lucide-react';
import Footer from '../../components/Footer';

const SUPPORT_EMAIL = 'support@karcix.id';

const CATEGORIES = [
  { icon: Send, title: 'Transfer Tiket', desc: 'Pelajari cara mengirim tiket ke teman atau keluarga.' },
  { icon: CreditCard, title: 'Kebijakan Refund', desc: 'Detail proses refund, syarat, dan estimasi waktu.' },
  { icon: ClipboardCheck, title: 'Syarat Masuk', desc: 'Apa saja yang perlu disiapkan sebelum tiba di venue.' },
];

const FAQS = [
  {
    q: 'Bagaimana cara transfer tiket ke orang lain?',
    a: "Buka menu 'Profil > Dompet Digital', pilih tiket, lalu klik tombol 'Transfer Tiket'. Masukkan email penerima yang terdaftar di Karcix. Penerima akan mendapat email konfirmasi untuk menerima tiket tersebut.",
  },
  {
    q: 'Apa kebijakan refund jika acara dibatalkan?',
    a: 'Jika acara dibatalkan oleh pihak penyelenggara, dana akan otomatis dikembalikan ke metode pembayaran awal dalam waktu 5-10 hari kerja. Tidak ada aksi yang perlu Anda lakukan.',
  },
  {
    q: 'Kenapa nominal transfer ada angka unik di belakangnya?',
    a: 'Tiga digit terakhir adalah kode unik pesanan Anda. Panitia memakai kode itu untuk mencocokkan transferan dengan pesanan yang benar, jadi transferlah tepat sampai digit terakhir.',
  },
  {
    q: 'Berapa lama pembayaran saya diverifikasi?',
    a: "Setelah bukti transfer diunggah, panitia akan memeriksanya secara manual. Pantau progresnya lewat menu 'Cek Pesanan' — e-ticket muncul otomatis begitu pembayaran dikonfirmasi.",
  },
  {
    q: 'Apakah saya perlu mencetak tiket fisik?',
    a: 'Tidak perlu. Cukup tunjukkan QR code dari e-ticket pada layar ponsel Anda. Pastikan kecerahan layar maksimal saat di-scan di gerbang masuk.',
  },
  {
    q: 'Identitas apa yang harus dibawa?',
    a: 'Sebagian besar event mewajibkan pengunjung membawa ID resmi berfoto (KTP, SIM, atau Paspor) untuk mencocokkan nama pada tiket dan untuk verifikasi batas usia.',
  },
  {
    q: 'Saya tidak menerima email konfirmasi pesanan.',
    a: "Silakan cek folder Spam/Junk di email Anda. Anda tetap bisa membuka e-ticket lewat menu 'Cek Pesanan' dengan ID pesanan atau email. Jika masih terkendala, hubungi Customer Support.",
  },
];

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [query, setQuery] = useState('');

  // Kolom pencarian benar-benar memfilter FAQ — sebelumnya hanya dekorasi.
  const visibleFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (faq) => faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      <main className="flex-grow w-full max-w-[800px] mx-auto px-6 md:px-10 pt-24 pb-24 md:pb-12">
        <div className="mb-12 text-center md:text-left animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-3">Pusat Bantuan &amp; FAQ</h1>
          <p className="text-[15px] text-[#86868B] max-w-2xl">
            Temukan jawaban untuk pertanyaan umum seputar pembayaran, verifikasi, transfer tiket,
            dan syarat masuk event.
          </p>

          <div className="mt-8 relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari topik bantuan..."
              aria-label="Cari topik bantuan"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-black/5 rounded-xl text-[15px] shadow-sm focus:outline-none focus:border-[#1173d4] focus:ring-1 focus:ring-[#1173d4] transition-all"
            />
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.title}
              onClick={() => setQuery(cat.title.split(' ')[0])}
              className="bg-white border border-black/5 rounded-xl p-6 text-left hover:shadow-sm transition-shadow group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#1173d4] group-hover:bg-[#1173d4] group-hover:text-white transition-colors">
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-[#1D1D1F] mb-2">{cat.title}</h3>
              <p className="text-sm text-[#86868B]">{cat.desc}</p>
            </button>
          ))}
        </div>

        <div
          className="bg-white border border-black/5 rounded-xl overflow-hidden shadow-sm animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          {visibleFaqs.length > 0 ? (
            visibleFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={faq.q} className="border-b border-black/5 last:border-b-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="w-full flex justify-between items-center gap-4 p-6 text-left hover:bg-[#F5F5F7] transition-colors"
                  >
                    <h3 className={`font-medium ${isOpen ? 'text-[#1173d4]' : 'text-[#1D1D1F]'}`}>
                      {faq.q}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[#86868B] transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#1173d4]' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="p-6 pt-0 text-[15px] text-[#555558] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <SearchX className="w-10 h-10 text-[#86868B] mx-auto mb-3" />
              <p className="text-[#1D1D1F] font-medium mb-1">Tidak ada topik yang cocok</p>
              <p className="text-sm text-[#86868B]">
                Coba kata kunci lain, atau hubungi Customer Support di bawah.
              </p>
            </div>
          )}
        </div>

        <div
          className="mt-16 bg-white rounded-xl p-8 text-center flex flex-col items-center border border-black/5 shadow-sm animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Headset className="w-8 h-8 text-[#1173d4]" />
          </div>
          <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">Masih Butuh Bantuan?</h3>
          <p className="text-[15px] text-[#86868B] mb-6 max-w-md">
            Tim Customer Support kami siap membantu untuk masalah yang tidak ada di FAQ.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Bantuan pesanan Karcix')}`}
            className="bg-[#1D1D1F] hover:bg-black text-white h-12 px-8 rounded-lg font-medium transition-colors active:scale-95 w-full md:w-auto inline-flex items-center justify-center"
          >
            Hubungi Support
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
