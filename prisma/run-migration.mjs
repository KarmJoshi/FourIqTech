import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_DATABASE_URL });

async function main() {
  console.log('🔌 Connecting to database (direct)...');
  
  // Check existing tables
  const existing = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  const existingTables = existing.rows.map(r => r.tablename);
  console.log(`📋 Existing tables (${existingTables.length}): ${existingTables.join(', ')}`);
  
  // New tables to create
  const newTables = [
    'AgentState', 'AgentAction', 'ActionOutcome', 
    'GscDailySnapshot', 'GscPageMetric', 'GscQueryMetric', 'GscInsight',
    'PlaybookStat', 'LearnedPattern', 'KeywordMemory', 
    'MonthlySummary', 'Blacklist', 'CompanyContext', 'TopicCluster', 'TechAuditReport'
  ];
  
  const toCreate = newTables.filter(t => !existingTables.includes(t));
  console.log(`\n🆕 Tables to create (${toCreate.length}): ${toCreate.join(', ')}`);
  
  if (toCreate.length === 0) {
    console.log('✅ All tables already exist. Checking for column updates...');
  }

  // Run the SQL statements one by one
  const statements = [
    // Layer 1: Working Memory
    `CREATE TABLE IF NOT EXISTS "AgentState" (
      "id" TEXT NOT NULL DEFAULT 'global',
      "currentOrders" JSONB,
      "activeTasks" JSONB,
      "lastCycleAt" TIMESTAMP(3),
      "lastDecision" TEXT,
      "cycleCount" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AgentState_pkey" PRIMARY KEY ("id")
    )`,

    // Layer 2: Short-Term Memory
    `CREATE TABLE IF NOT EXISTS "AgentAction" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "department" TEXT NOT NULL,
      "playbook" TEXT NOT NULL,
      "targetSlug" TEXT,
      "targetUrl" TEXT,
      "description" TEXT,
      "baseline" JSONB,
      "score" DOUBLE PRECISION,
      CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "ActionOutcome" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "actionId" TEXT NOT NULL UNIQUE,
      "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "metricsCurrent" JSONB,
      "delta" JSONB,
      "successScore" DOUBLE PRECISION NOT NULL,
      "verdict" TEXT NOT NULL,
      CONSTRAINT "ActionOutcome_pkey" PRIMARY KEY ("id")
    )`,

    // GSC Data
    `CREATE TABLE IF NOT EXISTS "GscDailySnapshot" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "date" TIMESTAMP(3) NOT NULL UNIQUE,
      "totalClicks" INTEGER NOT NULL,
      "totalImpressions" INTEGER NOT NULL,
      "avgPosition" DOUBLE PRECISION NOT NULL,
      "avgCtr" DOUBLE PRECISION NOT NULL,
      "pageCount" INTEGER NOT NULL,
      "topPages" JSONB,
      "topQueries" JSONB,
      "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "GscDailySnapshot_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "GscPageMetric" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "date" TIMESTAMP(3) NOT NULL,
      "pageUrl" TEXT NOT NULL,
      "clicks" INTEGER NOT NULL DEFAULT 0,
      "impressions" INTEGER NOT NULL DEFAULT 0,
      "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "position" DOUBLE PRECISION NOT NULL DEFAULT 100,
      CONSTRAINT "GscPageMetric_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "GscPageMetric_date_pageUrl_key" UNIQUE ("date", "pageUrl")
    )`,

    `CREATE TABLE IF NOT EXISTS "GscQueryMetric" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "date" TIMESTAMP(3) NOT NULL,
      "query" TEXT NOT NULL,
      "pageUrl" TEXT,
      "clicks" INTEGER NOT NULL DEFAULT 0,
      "impressions" INTEGER NOT NULL DEFAULT 0,
      "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "position" DOUBLE PRECISION NOT NULL DEFAULT 100,
      CONSTRAINT "GscQueryMetric_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "GscQueryMetric_date_query_key" UNIQUE ("date", "query")
    )`,

    `CREATE TABLE IF NOT EXISTS "GscInsight" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "type" TEXT NOT NULL,
      "pageUrl" TEXT,
      "query" TEXT,
      "insightText" TEXT NOT NULL,
      "metricsBefore" JSONB,
      "metricsAfter" JSONB,
      "changePeriod" TEXT,
      "confidence" DOUBLE PRECISION,
      CONSTRAINT "GscInsight_pkey" PRIMARY KEY ("id")
    )`,

    // Layer 3: Long-Term Memory
    `CREATE TABLE IF NOT EXISTS "PlaybookStat" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "playbook" TEXT NOT NULL UNIQUE,
      "totalRuns" INTEGER NOT NULL DEFAULT 0,
      "successCount" INTEGER NOT NULL DEFAULT 0,
      "failureCount" INTEGER NOT NULL DEFAULT 0,
      "neutralCount" INTEGER NOT NULL DEFAULT 0,
      "avgSuccessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "bestResult" JSONB,
      "worstResult" JSONB,
      "lastRunAt" TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PlaybookStat_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "LearnedPattern" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "type" TEXT NOT NULL,
      "department" TEXT NOT NULL,
      "pattern" TEXT NOT NULL,
      "evidence" JSONB,
      "confidence" DOUBLE PRECISION NOT NULL,
      "timesProven" INTEGER NOT NULL DEFAULT 1,
      "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      CONSTRAINT "LearnedPattern_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "KeywordMemory" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "keyword" TEXT NOT NULL UNIQUE,
      "firstTargeted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastTargeted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "timesTargeted" INTEGER NOT NULL DEFAULT 1,
      "bestPosition" DOUBLE PRECISION,
      "currentPosition" DOUBLE PRECISION,
      "status" TEXT NOT NULL DEFAULT 'active',
      "department" TEXT,
      "cluster" TEXT,
      "notes" TEXT,
      CONSTRAINT "KeywordMemory_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "MonthlySummary" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "month" TEXT NOT NULL UNIQUE,
      "totalClicks" INTEGER NOT NULL DEFAULT 0,
      "totalImpressions" INTEGER NOT NULL DEFAULT 0,
      "avgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "articlesPublished" INTEGER NOT NULL DEFAULT 0,
      "pagesCreated" INTEGER NOT NULL DEFAULT 0,
      "techFixesApplied" INTEGER NOT NULL DEFAULT 0,
      "directorCycles" INTEGER NOT NULL DEFAULT 0,
      "topWin" TEXT,
      "topLoss" TEXT,
      "keyInsights" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MonthlySummary_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "Blacklist" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "type" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "attempts" INTEGER NOT NULL DEFAULT 1,
      CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Blacklist_type_value_key" UNIQUE ("type", "value")
    )`,

    // Layer 4: Institutional Knowledge
    `CREATE TABLE IF NOT EXISTS "CompanyContext" (
      "id" TEXT NOT NULL DEFAULT 'default',
      "name" TEXT NOT NULL DEFAULT 'FourIQ Tech',
      "website" TEXT NOT NULL DEFAULT 'https://www.fouriqtech.com',
      "about" TEXT,
      "services" JSONB,
      "targetAudience" JSONB,
      "brandVoice" TEXT,
      "goals" JSONB,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CompanyContext_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "TopicCluster" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "name" TEXT NOT NULL UNIQUE,
      "pillarPage" TEXT,
      "pillarKeyword" TEXT,
      "supportingPages" JSONB,
      "status" TEXT NOT NULL DEFAULT 'growing',
      "authority" DOUBLE PRECISION,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TopicCluster_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "TechAuditReport" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "overallScore" INTEGER NOT NULL,
      "perfScore" INTEGER,
      "seoScore" INTEGER,
      "patchesApplied" INTEGER NOT NULL DEFAULT 0,
      "qaVerdict" TEXT,
      "modules" JSONB,
      "recommendations" JSONB,
      CONSTRAINT "TechAuditReport_pkey" PRIMARY KEY ("id")
    )`,

    // Add new columns to existing tables (safe — IF NOT EXISTS)
    `ALTER TABLE "AgencyConfig" ADD COLUMN IF NOT EXISTS "apiMode" TEXT DEFAULT 'free'`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "targetKeyword" TEXT`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "cluster" TEXT`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "qaScore" INTEGER`,
    `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "structure" TEXT`,
    `ALTER TABLE "ServicePage" ADD COLUMN IF NOT EXISTS "targetKeyword" TEXT`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS "AgentAction_timestamp_idx" ON "AgentAction"("timestamp")`,
    `CREATE INDEX IF NOT EXISTS "AgentAction_department_idx" ON "AgentAction"("department")`,
    `CREATE INDEX IF NOT EXISTS "GscDailySnapshot_date_idx" ON "GscDailySnapshot"("date")`,
    `CREATE INDEX IF NOT EXISTS "GscPageMetric_pageUrl_idx" ON "GscPageMetric"("pageUrl")`,
    `CREATE INDEX IF NOT EXISTS "GscPageMetric_date_idx" ON "GscPageMetric"("date")`,
    `CREATE INDEX IF NOT EXISTS "GscQueryMetric_query_idx" ON "GscQueryMetric"("query")`,
    `CREATE INDEX IF NOT EXISTS "GscQueryMetric_date_idx" ON "GscQueryMetric"("date")`,
    `CREATE INDEX IF NOT EXISTS "GscInsight_type_idx" ON "GscInsight"("type")`,
    `CREATE INDEX IF NOT EXISTS "KeywordMemory_status_idx" ON "KeywordMemory"("status")`,
    `CREATE INDEX IF NOT EXISTS "LearnedPattern_department_idx" ON "LearnedPattern"("department")`,
    `CREATE INDEX IF NOT EXISTS "TechAuditReport_date_idx" ON "TechAuditReport"("date")`,
    `CREATE INDEX IF NOT EXISTS "BlogPost_cluster_idx" ON "BlogPost"("cluster")`,
    `CREATE INDEX IF NOT EXISTS "BlogPost_targetKeyword_idx" ON "BlogPost"("targetKeyword")`,

    // Foreign key
    `DO $$ BEGIN
      ALTER TABLE "ActionOutcome" ADD CONSTRAINT "ActionOutcome_actionId_fkey" 
        FOREIGN KEY ("actionId") REFERENCES "AgentAction"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$`,

    // Seed institutional knowledge
    `INSERT INTO "CompanyContext" ("id", "name", "website", "about", "services", "targetAudience", "brandVoice", "goals", "updatedAt")
     VALUES ('default', 'FourIQ Tech', 'https://www.fouriqtech.com', 
       'Premium web design & development agency specializing in enterprise React/Next.js applications, custom SaaS platforms, and legacy modernization.',
       '["Web Design & Development", "Custom SaaS Platform Development", "Legacy Application Modernization", "SEO Services", "Digital Strategy"]'::jsonb,
       '["Global Startups", "Enterprise Companies", "E-commerce Businesses", "Service-based Businesses"]'::jsonb,
       'Professional, technical, authoritative. Write like a senior engineer sharing hard-won knowledge. Data-driven, specific, no fluff.',
       '{"primary": "Generate 20-30 qualified leads per month", "timeline": "6-12 months"}'::jsonb,
       CURRENT_TIMESTAMP)
     ON CONFLICT ("id") DO NOTHING`,
  ];

  let success = 0;
  let failed = 0;

  for (const sql of statements) {
    try {
      await pool.query(sql);
      success++;
    } catch (err) {
      // Ignore "already exists" errors
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        success++;
      } else {
        failed++;
        console.error(`   ❌ Failed: ${err.message.substring(0, 100)}`);
      }
    }
  }

  console.log(`\n✅ Migration complete: ${success} statements succeeded, ${failed} failed`);
  
  // Verify
  const after = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log(`📋 Total tables now: ${after.rows.length}`);
  console.log(`   ${after.rows.map(r => r.tablename).join(', ')}`);
  
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
