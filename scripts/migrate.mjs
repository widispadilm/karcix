import pg from 'pg';
const { Client } = pg;

const SQL_MIGRATION = `
-- 1. Enable UUID and Storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT DEFAULT 'Konser',
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT NOT NULL,
    address TEXT,
    description TEXT,
    lineup TEXT[] DEFAULT '{}',
    organizer TEXT,
    price_from BIGINT DEFAULT 0,
    rating TEXT DEFAULT '4.9',
    badge TEXT,
    poster_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Event Tiers Table
CREATE TABLE IF NOT EXISTS public.event_tiers (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    quota INTEGER NOT NULL,
    sold INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    color TEXT DEFAULT '#22c55e',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    buyer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    tier_id TEXT REFERENCES public.event_tiers(id) ON DELETE SET NULL,
    tier_name TEXT NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    unit_price BIGINT NOT NULL,
    unique_code INTEGER NOT NULL,
    total_amount BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'cancelled', 'expired'
    payment_method TEXT DEFAULT 'transfer',
    receipt_url TEXT,
    ticket_id TEXT,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Tickets Table (for Gate Scanning & Individual Tickets)
CREATE TABLE IF NOT EXISTS public.tickets (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    holder_name TEXT,
    qr_data TEXT,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RPC Function to atomically Create Order & Update Tier Sold Count
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_order_id TEXT,
    p_buyer_name TEXT,
    p_email TEXT,
    p_whatsapp TEXT,
    p_tier_id TEXT,
    p_qty INTEGER,
    p_payment_method TEXT DEFAULT 'transfer'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_tier RECORD;
    v_unique_code INTEGER;
    v_total_amount BIGINT;
    v_order RECORD;
BEGIN
    -- 1. Lock and check tier stock
    SELECT * INTO v_tier FROM public.event_tiers WHERE id = p_tier_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tier tiket tidak ditemukan.';
    END IF;

    IF (v_tier.quota - v_tier.sold) < p_qty THEN
        RAISE EXCEPTION 'Maaf, kuota tiket tidak mencukupi.';
    END IF;

    -- 2. Generate unique code and total
    v_unique_code := floor(random() * 900 + 100)::INTEGER;
    v_total_amount := (v_tier.price * p_qty) + v_unique_code;

    -- 3. Increment sold count
    UPDATE public.event_tiers
    SET sold = sold + p_qty
    WHERE id = p_tier_id;

    -- 4. Insert order
    INSERT INTO public.orders (
        id, buyer_name, email, whatsapp, tier_id, tier_name,
        qty, unit_price, unique_code, total_amount, status, payment_method, created_at
    )
    VALUES (
        p_order_id, p_buyer_name, p_email, p_whatsapp, p_tier_id, v_tier.name,
        p_qty, v_tier.price, v_unique_code, v_total_amount, 'pending', p_payment_method, NOW()
    )
    RETURNING * INTO v_order;

    RETURN to_jsonb(v_order);
END;
$$;

-- 7. RPC Function to Release / Restore Stock when Order is Cancelled or Expired
CREATE OR REPLACE FUNCTION public.release_order_atomic(
    p_order_id TEXT,
    p_next_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_order RECORD;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pesanan tidak ditemukan.';
    END IF;

    -- Only pending orders restore stock
    IF v_order.status = 'pending' AND p_next_status IN ('cancelled', 'expired') THEN
        UPDATE public.event_tiers
        SET sold = GREATEST(0, sold - v_order.qty)
        WHERE id = v_order.tier_id;
    END IF;

    UPDATE public.orders
    SET status = p_next_status, updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

    RETURN to_jsonb(v_order);
END;
$$;

-- 8. RPC Function to Approve Order and Generate Ticket
CREATE OR REPLACE FUNCTION public.approve_order_atomic(
    p_order_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_order RECORD;
    v_prefix TEXT;
    v_ticket_id TEXT;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pesanan tidak ditemukan.';
    END IF;

    v_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(v_order.tier_name, '\\s+', '', 'g') FROM 1 FOR 3));
    v_ticket_id := 'TIX-' || v_prefix || '-' || SUBSTRING(p_order_id FROM 5);

    UPDATE public.orders
    SET status = 'paid', ticket_id = v_ticket_id, updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

    -- Insert into tickets table as well
    INSERT INTO public.tickets (id, order_id, event_id, tier_name, holder_name, qr_data, checked_in)
    VALUES (v_ticket_id, p_order_id, 'evt-001', v_order.tier_name, v_order.buyer_name, v_ticket_id, FALSE)
    ON CONFLICT (id) DO NOTHING;

    RETURN to_jsonb(v_order);
END;
$$;

-- 9. RPC Function to Check-in Ticket at Gate
CREATE OR REPLACE FUNCTION public.checkin_ticket_atomic(
    p_ticket_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_order RECORD;
    v_ticket RECORD;
BEGIN
    -- Check in orders table first
    SELECT * INTO v_order FROM public.orders WHERE ticket_id = p_ticket_id OR id = p_ticket_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tiket tidak valid atau tidak ditemukan.');
    END IF;

    IF v_order.status != 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Status pesanan belum lunas (' || v_order.status || ').');
    END IF;

    IF v_order.checked_in THEN
        RETURN jsonb_build_object(
            'success', false, 
            'already_used', true,
            'message', 'Tiket SUDAH DIGUNAKAN sebelumnya!',
            'order', to_jsonb(v_order)
        );
    END IF;

    UPDATE public.orders
    SET checked_in = TRUE, checked_in_at = NOW(), updated_at = NOW()
    WHERE id = v_order.id
    RETURNING * INTO v_order;

    UPDATE public.tickets
    SET checked_in = TRUE, checked_in_at = NOW()
    WHERE id = v_order.ticket_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Check-in Berhasil! Silakan masuk.',
        'order', to_jsonb(v_order)
    );
END;
$$;

-- 10. Enable Row Level Security (RLS) & Create Permissive Prototype Policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage events" ON public.events;
CREATE POLICY "Public manage events" ON public.events FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read tiers" ON public.event_tiers;
CREATE POLICY "Public read tiers" ON public.event_tiers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage tiers" ON public.event_tiers;
CREATE POLICY "Public manage tiers" ON public.event_tiers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update orders" ON public.orders;
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read tickets" ON public.tickets;
CREATE POLICY "Public read tickets" ON public.tickets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public manage tickets" ON public.tickets;
CREATE POLICY "Public manage tickets" ON public.tickets FOR ALL USING (true);

-- 11. Storage Bucket setup for receipts & posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public storage receipts read" ON storage.objects;
CREATE POLICY "Public storage receipts read" ON storage.objects FOR SELECT USING (bucket_id IN ('receipts', 'posters'));

DROP POLICY IF EXISTS "Public storage receipts insert" ON storage.objects;
CREATE POLICY "Public storage receipts insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('receipts', 'posters'));

DROP POLICY IF EXISTS "Public storage receipts update" ON storage.objects;
CREATE POLICY "Public storage receipts update" ON storage.objects FOR UPDATE USING (bucket_id IN ('receipts', 'posters'));
`;

const SQL_SEED = `
-- Seed Events
INSERT INTO public.events (id, title, subtitle, category, date, end_date, location, address, description, lineup, organizer, price_from, rating, badge, is_active)
VALUES
(
    'evt-001',
    'PENSI FEST 2026',
    'Nite of Stars',
    'Konser',
    '2026-09-20T19:00:00+07:00',
    '2026-09-20T23:00:00+07:00',
    'Lapangan SMAN 1 Jakarta',
    'Jl. Budi Utomo No.7, Jakarta Pusat',
    'Malam penuh bintang dengan penampilan spektakuler dari band-band terbaik sekolah se-Jakarta! Nikmati live music, food court, dan photo booth gratis.',
    ARRAY['Stellar Band', 'Moonrise Collective', 'Echo Project', 'DJ NightOwl'],
    'OSIS SMAN 1 Jakarta',
    50000,
    '4.9',
    'Segera Habis',
    true
),
(
    'evt-002',
    'Jakarta Soundwave 2026',
    'The Biggest Wave',
    'Festival',
    '2026-10-12T16:00:00+07:00',
    '2026-10-12T23:00:00+07:00',
    'GBK Senayan, Jakarta',
    'Jl. Pintu Satu Senayan, Jakarta',
    'Festival musik terbesar di penghujung tahun.',
    ARRAY['Guest Stars Indonesia'],
    'Soundwave Ent',
    750000,
    '4.9',
    NULL,
    false
),
(
    'evt-003',
    'Neon Nights: Warehouse Project',
    'Rhythm & Glow',
    'Electronic',
    '2026-10-18T21:00:00+07:00',
    '2026-10-19T04:00:00+07:00',
    'SCBD Expo, Jakarta',
    'Sudirman Central Business District',
    'Pengalaman pesta musik elektronik berbalut visual neon menakjubkan.',
    ARRAY['Top EDM DJs'],
    'Neon Project',
    450000,
    '4.8',
    'Hampir Habis',
    false
),
(
    'evt-004',
    'Autumn Leaves Jazz Session',
    'Intimate Vibes',
    'Jazz & Blues',
    '2026-11-02T19:30:00+07:00',
    '2026-11-02T23:00:00+07:00',
    'Ciputra Artpreneur, Jakarta',
    'Ciputra World 1, Kuningan, Jakarta',
    'Malam jazz yang syahdu dan intim bersama musisi legendaris.',
    ARRAY['Jazz All-Stars'],
    'Jazz Circle',
    1200000,
    '4.9',
    NULL,
    false
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    date = EXCLUDED.date,
    end_date = EXCLUDED.end_date,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    description = EXCLUDED.description,
    lineup = EXCLUDED.lineup,
    organizer = EXCLUDED.organizer,
    price_from = EXCLUDED.price_from;

-- Seed Tiers for evt-001
INSERT INTO public.event_tiers (id, event_id, name, price, quota, sold, description, color)
VALUES
('tier-presale', 'evt-001', 'Presale 1', 50000, 200, 147, 'Early bird — harga spesial!', '#22c55e'),
('tier-regular', 'evt-001', 'Regular', 75000, 500, 213, 'Tiket reguler standing area', '#3b82f6'),
('tier-vip', 'evt-001', 'VIP', 100000, 100, 42, 'Front row + free merchandise + meet & greet', '#a855f7')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    quota = EXCLUDED.quota,
    sold = EXCLUDED.sold,
    description = EXCLUDED.description,
    color = EXCLUDED.color;

-- Seed Initial Orders
INSERT INTO public.orders (id, buyer_name, email, whatsapp, tier_id, tier_name, qty, unit_price, unique_code, total_amount, status, receipt_url, ticket_id, checked_in, created_at)
VALUES
('KCX-20260815-001', 'Andi Pratama', 'andi.pratama@gmail.com', '081234567890', 'tier-presale', 'Presale 1', 2, 50000, 123, 100123, 'pending', NULL, NULL, FALSE, '2026-08-15 10:30:00+07'),
('KCX-20260815-002', 'Siti Nurhaliza', 'siti.n@gmail.com', '081298765432', 'tier-vip', 'VIP', 1, 100000, 456, 100456, 'paid', 'https://placehold.co/400x600?text=Bukti+Transfer', 'TIX-VIP-20260815-002', FALSE, '2026-08-15 11:15:00+07'),
('KCX-20260815-003', 'Budi Santoso', 'budi.s@yahoo.com', '085678901234', 'tier-regular', 'Regular', 3, 75000, 789, 225789, 'paid', 'https://placehold.co/400x600?text=Bukti+Transfer', 'TIX-REG-20260815-003', TRUE, '2026-08-15 12:00:00+07'),
('KCX-20260815-004', 'Dewi Lestari', 'dewi.l@outlook.com', '087812345678', 'tier-presale', 'Presale 1', 1, 50000, 234, 50234, 'cancelled', NULL, NULL, FALSE, '2026-08-15 13:45:00+07'),
('KCX-20260815-005', 'Rizky Febian', 'rizky.f@gmail.com', '081345678901', 'tier-regular', 'Regular', 2, 75000, 567, 150567, 'pending', 'https://placehold.co/400x600?text=Bukti+Transfer', NULL, FALSE, '2026-08-15 14:20:00+07')
ON CONFLICT (id) DO UPDATE SET
    buyer_name = EXCLUDED.buyer_name,
    status = EXCLUDED.status,
    ticket_id = EXCLUDED.ticket_id,
    checked_in = EXCLUDED.checked_in;

-- Seed Initial Tickets
INSERT INTO public.tickets (id, order_id, event_id, tier_name, holder_name, qr_data, checked_in)
VALUES
('TIX-VIP-20260815-002', 'KCX-20260815-002', 'evt-001', 'VIP', 'Siti Nurhaliza', 'TIX-VIP-20260815-002', FALSE),
('TIX-REG-20260815-003', 'KCX-20260815-003', 'evt-001', 'Regular', 'Budi Santoso', 'TIX-REG-20260815-003', TRUE)
ON CONFLICT (id) DO NOTHING;
`;

async function run() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new Client({
    host: 'db.yzdgwohfswzdkpmgmcym.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'karcix1234!@',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected! Running migrations...');
    await client.query(SQL_MIGRATION);
    console.log('✓ Migration tables, RPCs, and RLS policies created!');

    console.log('Running seed data...');
    await client.query(SQL_SEED);
    console.log('✓ Seed data inserted successfully!');

    const res = await client.query('SELECT count(*) FROM public.orders;');
    console.log(`Total orders in DB: ${res.rows[0].count}`);

    const res2 = await client.query('SELECT count(*) FROM public.events;');
    console.log(`Total events in DB: ${res2.rows[0].count}`);

    const res3 = await client.query('SELECT count(*) FROM public.event_tiers;');
    console.log(`Total tiers in DB: ${res3.rows[0].count}`);

    await client.end();
    console.log('All migrations completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
    try { await client.end(); } catch {}
  }
}

run();
