import pkgPg from 'pg';
const { Pool } = pkgPg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function applySchema() {
  const client = await pool.connect();
  try {
    console.log('🔧 Applying new tables to PostgreSQL...');

    // BlogPost table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "BlogPost" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "slug" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "excerpt" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "readTime" TEXT NOT NULL DEFAULT '5 min read',
        "category" TEXT NOT NULL DEFAULT 'Engineering',
        "author" TEXT NOT NULL DEFAULT 'FouriqTech Engineering',
        "content" TEXT NOT NULL,
        "metaTitle" TEXT,
        "metaDesc" TEXT,
        "schemaJson" TEXT,
        "isLive" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
      );
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");`);
    console.log('   ✅ BlogPost table created');

    // ServicePage table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ServicePage" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "slug" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "component" TEXT NOT NULL,
        "route" TEXT NOT NULL,
        "metaTitle" TEXT,
        "metaDesc" TEXT,
        "schemaJson" TEXT,
        "isLive" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ServicePage_pkey" PRIMARY KEY ("id")
      );
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "ServicePage_slug_key" ON "ServicePage"("slug");`);
    console.log('   ✅ ServicePage table created');

    // AgencyConfig table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AgencyConfig" (
        "id" TEXT NOT NULL DEFAULT 'default',
        "isAutoPilot" BOOLEAN NOT NULL DEFAULT false,
        "startTime" TEXT NOT NULL DEFAULT '10:00',
        "cyclesPerDay" INTEGER NOT NULL DEFAULT 1,
        "lastRunAt" TIMESTAMP(3),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AgencyConfig_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('   ✅ AgencyConfig table created');

    // Insert default config row
    await client.query(`
      INSERT INTO "AgencyConfig" ("id", "isAutoPilot", "startTime", "cyclesPerDay", "updatedAt")
      VALUES ('default', false, '10:00', 1, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO NOTHING;
    `);
    console.log('   ✅ Default AgencyConfig seeded');

    // Verify
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\n📋 All tables:');
    tables.rows.forEach(r => console.log(`   - ${r.table_name}`));

  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema();
