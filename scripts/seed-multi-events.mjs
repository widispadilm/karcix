import pg from 'pg';
const { Client } = pg;

async function seedMultiEvents() {
  const client = new Client({
    host: 'db.yzdgwohfswzdkpmgmcym.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'karcix1234!@',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL for Multi-Event seeding...');

    // 1. Update existing events to active
    await client.query(`
      UPDATE public.events SET is_active = true WHERE id IN ('evt-001', 'evt-002', 'evt-003', 'evt-004');
    `);

    // 2. Seed tiers for evt-002 (Jakarta Soundwave 2026)
    await client.query(`
      INSERT INTO public.event_tiers (id, event_id, name, price, quota, sold, description, color)
      VALUES
        ('tier-sw-early', 'evt-002', 'Early Bird 2-Day Pass', 650000, 150, 45, 'Akses penuh 2 hari festival', '#22c55e'),
        ('tier-sw-ga', 'evt-002', 'General Admission (GA)', 850000, 400, 120, 'Standing area umum', '#3b82f6'),
        ('tier-sw-vip', 'evt-002', 'VIP Lounge Pass', 1500000, 80, 25, 'VIP Deck + Free Flow Drinks + Eksklusif Lounge', '#a855f7')
      ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        quota = EXCLUDED.quota,
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `);

    // 3. Seed tiers for evt-003 (Neon Nights: Warehouse Project)
    await client.query(`
      INSERT INTO public.event_tiers (id, event_id, name, price, quota, sold, description, color)
      VALUES
        ('tier-nn-raver', 'evt-003', 'Raver Early Access', 350000, 100, 30, 'Masuk sebelum jam 21:00 WIB', '#ec4899'),
        ('tier-nn-fest', 'evt-003', 'Festival Standing', 500000, 300, 80, 'Akses dance floor utama', '#0ea5e9'),
        ('tier-nn-table', 'evt-003', 'Sofa & Table VIP (Per Tiket)', 1200000, 50, 15, 'Sofa reservation + priority bar', '#f59e0b')
      ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        quota = EXCLUDED.quota,
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `);

    // 4. Seed tiers for evt-004 (Autumn Leaves Jazz Session)
    await client.query(`
      INSERT INTO public.event_tiers (id, event_id, name, price, quota, sold, description, color)
      VALUES
        ('tier-jz-bronze', 'evt-004', 'Bronze Seating', 750000, 120, 35, 'Tribun atas dengan akustik jernih', '#d97706'),
        ('tier-jz-silver', 'evt-004', 'Silver Row', 1100000, 150, 50, 'Baris tengah pandangan langsung ke panggung', '#64748b'),
        ('tier-jz-gold', 'evt-004', 'Gold Front Row', 1800000, 60, 18, 'Baris paling depan + Cocktail Dinner', '#eab308')
      ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        quota = EXCLUDED.quota,
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `);

    console.log('✓ Multi-events and tiers seeded successfully on Supabase PostgreSQL!');
  } catch (err) {
    console.error('Multi-event seeding error:', err);
  } finally {
    await client.end();
  }
}

seedMultiEvents();
