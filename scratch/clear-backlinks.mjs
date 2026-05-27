import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query('DELETE FROM "LinkOpportunity"');
console.log('Deleted:', r.rowCount, 'entries');
await pool.end();
