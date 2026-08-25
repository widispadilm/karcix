import pg from 'pg';
const { Client } = pg;

const SQL_REALTIME = `
-- Enable REPLICA IDENTITY FULL for detailed payload
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.event_tiers REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'event_tiers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_tiers;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'customers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
  END IF;
END $$;
`;

async function run() {
  console.log('Connecting to Supabase PostgreSQL for Realtime Publication setup...');
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
    console.log('Running Realtime publication SQL...');
    await client.query(SQL_REALTIME);
    console.log('✓ Supabase Realtime publication enabled successfully for orders, event_tiers, events, and customers!');
    await client.end();
  } catch (err) {
    console.error('Error enabling realtime:', err);
    try { await client.end(); } catch {}
  }
}

run();
