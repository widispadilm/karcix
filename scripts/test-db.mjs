import pg from 'pg';
const { Client } = pg;

async function check() {
  const client = new Client({
    host: 'db.yzdgwohfswzdkpmgmcym.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'karcix1234!@',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  // Check schemas and tables
  const tables = await client.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema IN ('public', 'vault')
  `);
  console.log('Tables:', tables.rows);

  // Check vault or secrets
  try {
    const secrets = await client.query(`SELECT * FROM vault.decrypted_secrets`);
    console.log('Secrets:', secrets.rows);
  } catch (e) {
    console.log('No vault access:', e.message);
  }

  await client.end();
}

check();
