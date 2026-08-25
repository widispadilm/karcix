/**
 * Status pesanan. Selalu pakai konstanta ini — jangan tulis literal string di komponen,
 * karena perbedaan huruf besar/kecil pernah membuat dashboard admin selalu kosong.
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: 'Menunggu Verifikasi',
  [ORDER_STATUS.PAID]: 'Lunas',
  [ORDER_STATUS.CANCELLED]: 'Dibatalkan',
  [ORDER_STATUS.EXPIRED]: 'Kedaluwarsa',
};

/** Batas maksimal tiket per pesanan. */
export const MAX_QTY_PER_ORDER = 4;

/** Batas ukuran bukti transfer yang diterima (byte). */
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

export const INITIAL_EVENTS = [
  {
    id: 'evt-001',
    title: 'PENSI FEST 2026',
    subtitle: 'Nite of Stars',
    category: 'Konser',
    date: '2026-09-20T19:00:00',
    endDate: '2026-09-20T23:00:00',
    location: 'Lapangan SMAN 1 Jakarta',
    address: 'Jl. Budi Utomo No.7, Jakarta Pusat',
    description: 'Malam penuh bintang dengan penampilan spektakuler dari band-band terbaik sekolah se-Jakarta! Nikmati live music, food court, dan photo booth gratis.',
    lineup: ['Stellar Band', 'Moonrise Collective', 'Echo Project', 'DJ NightOwl'],
    organizer: 'OSIS SMAN 1 Jakarta',
    badge: 'Segera Habis',
    rating: '4.9',
    tiers: [
      {
        id: 'tier-presale',
        name: 'Presale 1',
        price: 50000,
        quota: 200,
        sold: 147,
        description: 'Early bird — harga spesial!',
        color: '#22c55e',
      },
      {
        id: 'tier-regular',
        name: 'Regular',
        price: 75000,
        quota: 500,
        sold: 213,
        description: 'Tiket reguler standing area',
        color: '#3b82f6',
      },
      {
        id: 'tier-vip',
        name: 'VIP',
        price: 100000,
        quota: 100,
        sold: 42,
        description: 'Front row + free merchandise + meet & greet',
        color: '#a855f7',
      },
    ],
  },
  {
    id: 'evt-002',
    title: 'Jakarta Soundwave 2026',
    subtitle: 'The Biggest Wave Festival',
    category: 'Festival',
    date: '2026-10-12T16:00:00',
    endDate: '2026-10-12T23:00:00',
    location: 'GBK Senayan, Jakarta',
    address: 'Jl. Pintu Satu Senayan, Jakarta Pusat',
    description: 'Festival musik multi-genre terbesar di penghujung tahun menghadirkan panggung megah berstandar internasional dengan puluhan musisi papan atas.',
    lineup: ['The Waves', 'Senja Symphony', 'Jakarta Groove', 'DJ Spectra'],
    organizer: 'Soundwave Entertainment',
    rating: '4.9',
    tiers: [
      {
        id: 'tier-sw-early',
        name: 'Early Bird 2-Day Pass',
        price: 650000,
        quota: 150,
        sold: 45,
        description: 'Akses penuh 2 hari festival harga spesial',
        color: '#22c55e',
      },
      {
        id: 'tier-sw-ga',
        name: 'General Admission (GA)',
        price: 850000,
        quota: 400,
        sold: 120,
        description: 'Standing area umum dengan akses stage utama',
        color: '#3b82f6',
      },
      {
        id: 'tier-sw-vip',
        name: 'VIP Lounge Pass',
        price: 1500000,
        quota: 80,
        sold: 25,
        description: 'VIP Deck + Free Flow Drinks + Eksklusif Lounge Area',
        color: '#a855f7',
      },
    ],
  },
  {
    id: 'evt-003',
    title: 'Neon Nights: Warehouse Project',
    subtitle: 'Rhythm & Electronic Glow',
    category: 'Electronic',
    date: '2026-10-18T21:00:00',
    endDate: '2026-10-19T04:00:00',
    location: 'SCBD Expo, Jakarta',
    address: 'Sudirman Central Business District, Jakarta Selatan',
    description: 'Pengalaman pesta musik elektronik berbalut visual neon dan laser show 360 derajat kelas dunia.',
    lineup: ['DJ NightOwl', 'Cyber Pulse', 'Bassline Hero', 'Vortex'],
    organizer: 'Neon Project ID',
    badge: 'Hampir Habis',
    rating: '4.8',
    tiers: [
      {
        id: 'tier-nn-raver',
        name: 'Raver Early Access',
        price: 350000,
        quota: 100,
        sold: 30,
        description: 'Masuk sebelum jam 21:00 WIB',
        color: '#ec4899',
      },
      {
        id: 'tier-nn-fest',
        name: 'Festival Standing',
        price: 500000,
        quota: 300,
        sold: 80,
        description: 'Akses dance floor utama & visual area',
        color: '#0ea5e9',
      },
      {
        id: 'tier-nn-table',
        name: 'Sofa & Table VIP (Per Tiket)',
        price: 1200000,
        quota: 50,
        sold: 15,
        description: 'Sofa reservation + priority bar & valet',
        color: '#f59e0b',
      },
    ],
  },
  {
    id: 'evt-004',
    title: 'Autumn Leaves Jazz Session',
    subtitle: 'Intimate Jazz & Blues',
    category: 'Jazz & Blues',
    date: '2026-11-02T19:30:00',
    endDate: '2026-11-02T23:00:00',
    location: 'Ciputra Artpreneur, Jakarta',
    address: 'Ciputra World 1, Kuningan, Jakarta Selatan',
    description: 'Malam jazz yang syahdu dan intim bersama deretan maestro jazz legendaris tanah air di auditorium berakustik sempurna.',
    lineup: ['Jazz All-Stars', 'Saxophone Soul', 'Trio Nostalgia'],
    organizer: 'Jazz Circle Community',
    rating: '4.9',
    tiers: [
      {
        id: 'tier-jz-bronze',
        name: 'Bronze Seating',
        price: 750000,
        quota: 120,
        sold: 35,
        description: 'Tribun atas dengan akustik jernih',
        color: '#d97706',
      },
      {
        id: 'tier-jz-silver',
        name: 'Silver Row',
        price: 1100000,
        quota: 150,
        sold: 50,
        description: 'Baris tengah pandangan langsung ke panggung',
        color: '#64748b',
      },
      {
        id: 'tier-jz-gold',
        name: 'Gold Front Row',
        price: 1800000,
        quota: 60,
        sold: 18,
        description: 'Baris paling depan + Cocktail Dinner eksklusif',
        color: '#eab308',
      },
    ],
  },
];

export const INITIAL_EVENT = INITIAL_EVENTS[0];
export const CATALOG_EVENTS = INITIAL_EVENTS;

/** Ubah event menjadi bentuk kartu katalog */
export function eventToCard(event) {
  if (!event) return null;
  const prices = event.tiers?.map((t) => t.price) || [];
  const remaining = event.tiers?.reduce((sum, t) => sum + (t.quota - t.sold), 0) ?? 0;
  const minPrice = prices.length ? Math.min(...prices) : (event.priceFrom || 0);

  return {
    id: event.id,
    title: event.title,
    category: event.category || 'Konser',
    date: event.date,
    location: event.location,
    priceFrom: minPrice,
    badge: event.badge || (remaining > 0 && remaining < 100 ? 'Segera Habis' : undefined),
    rating: event.rating || '4.9',
    available: true,
  };
}

export const INITIAL_ORDERS = [
  {
    id: 'KCX-20260815-001',
    buyerName: 'Andi Pratama',
    email: 'andi.pratama@gmail.com',
    whatsapp: '081234567890',
    tierId: 'tier-presale',
    tierName: 'Presale 1',
    qty: 2,
    unitPrice: 50000,
    uniqueCode: 123,
    totalAmount: 100123,
    status: 'pending',
    receiptUrl: null,
    ticketId: null,
    checkedIn: false,
    timestamp: '2026-08-15T10:30:00',
  },
  {
    id: 'KCX-20260815-002',
    buyerName: 'Siti Nurhaliza',
    email: 'siti.n@gmail.com',
    whatsapp: '081298765432',
    tierId: 'tier-vip',
    tierName: 'VIP',
    qty: 1,
    unitPrice: 100000,
    uniqueCode: 456,
    totalAmount: 100456,
    status: 'paid',
    receiptUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5SZWNlaXB0PC90ZXh0Pjwvc3ZnPg==',
    ticketId: 'TIX-VIP-20260815-002',
    checkedIn: false,
    timestamp: '2026-08-15T11:15:00',
  },
  {
    id: 'KCX-20260815-003',
    buyerName: 'Budi Santoso',
    email: 'budi.s@yahoo.com',
    whatsapp: '085678901234',
    tierId: 'tier-regular',
    tierName: 'Regular',
    qty: 3,
    unitPrice: 75000,
    uniqueCode: 789,
    totalAmount: 225789,
    status: 'paid',
    receiptUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5SZWNlaXB0PC90ZXh0Pjwvc3ZnPg==',
    ticketId: 'TIX-REG-20260815-003',
    checkedIn: true,
    timestamp: '2026-08-15T12:00:00',
  },
  {
    id: 'KCX-20260815-004',
    buyerName: 'Dewi Lestari',
    email: 'dewi.l@outlook.com',
    whatsapp: '087812345678',
    tierId: 'tier-presale',
    tierName: 'Presale 1',
    qty: 1,
    unitPrice: 50000,
    uniqueCode: 234,
    totalAmount: 50234,
    status: 'cancelled',
    receiptUrl: null,
    ticketId: null,
    checkedIn: false,
    timestamp: '2026-08-15T13:45:00',
  },
  {
    id: 'KCX-20260815-005',
    buyerName: 'Rizky Febian',
    email: 'rizky.f@gmail.com',
    whatsapp: '081345678901',
    tierId: 'tier-regular',
    tierName: 'Regular',
    qty: 2,
    unitPrice: 75000,
    uniqueCode: 567,
    totalAmount: 150567,
    status: 'pending',
    receiptUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5SZWNlaXB0PC90ZXh0Pjwvc3ZnPg==',
    ticketId: null,
    checkedIn: false,
    timestamp: '2026-08-15T14:20:00',
  },
];

let orderSequence = INITIAL_ORDERS.length;

/**
 * ID pesanan berurutan per sesi. Versi lama memakai 3 digit acak sehingga dua pesanan
 * bisa mendapat ID yang sama dan saling menimpa saat dicari by-id.
 */
export function generateOrderId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  orderSequence += 1;
  return `KCX-${dateStr}-${String(orderSequence).padStart(3, '0')}`;
}

/** Sinkronkan penghitung setelah state dipulihkan dari sessionStorage. */
export function syncOrderSequence(orders) {
  orderSequence = Math.max(orderSequence, orders.length);
}

export function generateUniqueCode() {
  return Math.floor(Math.random() * 900) + 100; // 100-999
}

export function generateTicketId(tierName, orderId) {
  const prefix = tierName.replace(/\s+/g, '').toUpperCase().slice(0, 3);
  return `TIX-${prefix}-${orderId.slice(4)}`;
}

export function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
