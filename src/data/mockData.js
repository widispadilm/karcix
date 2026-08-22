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

export const INITIAL_EVENT = {
  id: 'evt-001',
  title: 'PENSI FEST 2026',
  subtitle: 'Nite of Stars',
  date: '2026-09-20T19:00:00',
  endDate: '2026-09-20T23:00:00',
  location: 'Lapangan SMAN 1 Jakarta',
  address: 'Jl. Budi Utomo No.7, Jakarta Pusat',
  description: 'Malam penuh bintang dengan penampilan spektakuler dari band-band terbaik sekolah se-Jakarta! Nikmati live music, food court, dan photo booth gratis.',
  lineup: ['Stellar Band', 'Moonrise Collective', 'Echo Project', 'DJ NightOwl'],
  organizer: 'OSIS SMAN 1 Jakarta',
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
};

/**
 * Katalog event lain — hanya untuk mengisi beranda & halaman pencarian.
 * Belum bisa dibeli; halaman detail akan memberi tahu bahwa penjualannya belum dibuka.
 */
export const CATALOG_EVENTS = [
  {
    id: 'evt-002',
    title: 'Jakarta Soundwave 2026',
    category: 'Festival',
    date: '2026-10-12T16:00:00',
    location: 'GBK Senayan, Jakarta',
    priceFrom: 750000,
    rating: '4.9',
  },
  {
    id: 'evt-003',
    title: 'Neon Nights: Warehouse Project',
    category: 'Electronic',
    date: '2026-10-18T21:00:00',
    location: 'SCBD Expo, Jakarta',
    priceFrom: 450000,
    badge: 'Hampir Habis',
  },
  {
    id: 'evt-004',
    title: 'Autumn Leaves Jazz Session',
    category: 'Jazz & Blues',
    date: '2026-11-02T19:30:00',
    location: 'Ciputra Artpreneur, Jakarta',
    priceFrom: 1200000,
  },
];

/** Ubah event utama (yang punya tier & kuota) menjadi bentuk kartu katalog. */
export function eventToCard(event) {
  const prices = event.tiers?.map((t) => t.price) || [];
  const remaining = event.tiers?.reduce((sum, t) => sum + (t.quota - t.sold), 0) ?? 0;
  return {
    id: event.id,
    title: event.title,
    category: 'Konser',
    date: event.date,
    location: event.location,
    priceFrom: prices.length ? Math.min(...prices) : 0,
    badge: remaining > 0 && remaining < 100 ? 'Segera Habis' : undefined,
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
