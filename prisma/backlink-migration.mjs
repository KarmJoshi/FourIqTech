import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_DATABASE_URL });

async function main() {
  console.log('🔗 Creating Backlink System tables...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS "LinkOpportunity" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "type" TEXT NOT NULL,
      "targetUrl" TEXT NOT NULL,
      "targetDomain" TEXT NOT NULL,
      "contactEmail" TEXT,
      "contactName" TEXT,
      "status" TEXT NOT NULL DEFAULT 'found',
      "ourContent" TEXT,
      "outreachEmail" TEXT,
      "pitchAngle" TEXT,
      "relevanceScore" DOUBLE PRECISION DEFAULT 0,
      "domainAuthority" INTEGER,
      "targetKeyword" TEXT,
      "notes" TEXT,
      "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "pitchedAt" TIMESTAMP(3),
      "wonAt" TIMESTAMP(3),
      "campaignId" TEXT,
      CONSTRAINT "LinkOpportunity_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "LinkCampaign" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "name" TEXT NOT NULL,
      "strategy" TEXT NOT NULL,
      "targetNiche" TEXT,
      "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "status" TEXT NOT NULL DEFAULT 'active',
      "targetCount" INTEGER NOT NULL DEFAULT 0,
      "pitchedCount" INTEGER NOT NULL DEFAULT 0,
      "wonCount" INTEGER NOT NULL DEFAULT 0,
      "notes" TEXT,
      CONSTRAINT "LinkCampaign_pkey" PRIMARY KEY ("id")
    )`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS "LinkOpportunity_status_idx" ON "LinkOpportunity"("status")`,
    `CREATE INDEX IF NOT EXISTS "LinkOpportunity_type_idx" ON "LinkOpportunity"("type")`,
    `CREATE INDEX IF NOT EXISTS "LinkOpportunity_targetDomain_idx" ON "LinkOpportunity"("targetDomain")`,
    `CREATE INDEX IF NOT EXISTS "LinkCampaign_status_idx" ON "LinkCampaign"("status")`,
  ];

  let success = 0;
  for (const sql of statements) {
    try { await pool.query(sql); success++; }
    catch (e) { if (!e.message.includes('already exists')) console.error('  ❌', e.message.substring(0, 80)); else success++; }
  }

  console.log(`✅ Done: ${success}/${statements.length} statements`);
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
