import pkgPg from 'pg';
const { Pool } = pkgPg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
});

async function applySearchPerformanceTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS "SearchPerformance" (
      "id" TEXT NOT NULL,
      "dateRangeStart" TEXT NOT NULL,
      "dateRangeEnd" TEXT NOT NULL,
      "totalClicks" INTEGER NOT NULL,
      "totalImpressions" INTEGER NOT NULL,
      "avgPosition" DOUBLE PRECISION NOT NULL,
      "avgCtr" DOUBLE PRECISION NOT NULL,
      "page1Count" INTEGER NOT NULL,
      "fullReport" JSONB,
      "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "SearchPerformance_pkey" PRIMARY KEY ("id")
    );
  `;

  console.log('🚀 Creating SearchPerformance table...');
  try {
    await pool.query(sql);
    console.log('✅ Table created successfully!');
  } catch (err) {
    console.error('❌ Failed to create table:', err.message);
  } finally {
    await pool.end();
  }
}

applySearchPerformanceTable();
