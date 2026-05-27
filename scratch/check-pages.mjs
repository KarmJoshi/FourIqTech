import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query('SELECT slug, title, route, "isLive" FROM "ServicePage" ORDER BY "createdAt" DESC LIMIT 10');
console.log('Service Pages in DB:', r.rows.length);
r.rows.forEach(p => console.log(`  ${p.isLive ? '✅' : '❌'} ${p.route} — ${p.title}`));
await pool.end();
