import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('🧹 Clearing all outreach data...');
  
  // Delete in correct order (foreign keys)
  const r1 = await pool.query('DELETE FROM "DraftEmail"');
  console.log(`  Deleted ${r1.rowCount} draft emails`);
  
  const r2 = await pool.query('DELETE FROM "Lead"');
  console.log(`  Deleted ${r2.rowCount} leads`);
  
  const r3 = await pool.query('DELETE FROM "LinkOpportunity"');
  console.log(`  Deleted ${r3.rowCount} link opportunities`);
  
  console.log('✅ All outreach data cleared. Fresh start.');
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
