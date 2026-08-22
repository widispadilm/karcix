import pg from 'pg';
const { Client } = pg;

const SQL_MIGRATION = `
-- Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT 'password123',
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read customers" ON public.customers;
CREATE POLICY "Public read customers" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert customers" ON public.customers;
CREATE POLICY "Public insert customers" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update customers" ON public.customers;
CREATE POLICY "Public update customers" ON public.customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete customers" ON public.customers;
CREATE POLICY "Public delete customers" ON public.customers FOR DELETE USING (true);

-- Seed initial customers
INSERT INTO public.customers (id, name, email, whatsapp, password, status, created_at)
VALUES
('CUST-001', 'Andi Pratama', 'andi.pratama@gmail.com', '081234567890', 'password123', 'active', '2026-08-15 10:00:00+07'),
('CUST-002', 'Siti Nurhaliza', 'siti.n@gmail.com', '081298765432', 'password123', 'active', '2026-08-15 10:30:00+07'),
('CUST-003', 'Budi Santoso', 'budi.s@yahoo.com', '085678901234', 'password123', 'active', '2026-08-15 11:00:00+07'),
('CUST-004', 'Dewi Lestari', 'dewi.l@outlook.com', '087812345678', 'password123', 'active', '2026-08-15 12:00:00+07'),
('CUST-005', 'Rizky Febian', 'rizky.f@gmail.com', '081345678901', 'password123', 'active', '2026-08-15 13:00:00+07')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    whatsapp = EXCLUDED.whatsapp;
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
    console.log('Running customers table migration...');
    await client.query(SQL_MIGRATION);
    console.log('✓ Customers table and seed data created successfully!');
    await client.end();
  } catch (err) {
    console.error('Migration error:', err);
    try { await client.end(); } catch {}
  }
}

run();
