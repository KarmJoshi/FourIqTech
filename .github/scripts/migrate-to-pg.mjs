import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const CWD = process.cwd();

// Paths to JSON files
const LEADS_PATH = path.join(CWD, 'public/collected_leads.json');
const STAGING_PATH = path.join(CWD, '.github/staging/staging.json');
const ACTIVITY_PATH = path.join(CWD, '.github/staging/activity_log.json');
const JOURNAL_PATH = path.join(CWD, '.github/director_journal.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

async function migrate() {
  console.log("Starting Migration via PG Driver...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // Migrate Leads
    const leads = readJson(LEADS_PATH, []);
    console.log(`Migrating ${leads.length} leads...`);
    for (const lead of leads) {
      await client.query(`
        INSERT INTO "Lead" (
          "id", "businessName", "niche", "location", "source", "website", "contactEmail", 
          "competitorName", "competitorWebsite", "reviewsSnapshot", "problemTitle", 
          "problemDetail", "businessImpact", "likelyFix", "confidence", "status", 
          "collectedAt", "lastTouchedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT ("id") DO NOTHING
      `, [
        lead.id, lead.businessName, lead.niche, lead.location, lead.source, lead.website || null,
        lead.contactEmail || null, lead.competitorName || null, lead.competitorWebsite || null,
        lead.reviewsSnapshot || null, lead.problemTitle || null, lead.problemDetail || null,
        lead.businessImpact || null, lead.likelyFix || null, lead.confidence || null,
        lead.status || 'new', new Date(lead.collectedAt || Date.now()), new Date(lead.lastTouchedAt || Date.now())
      ]);

      if (lead.draftEmail && lead.draftEmail.id) {
        await client.query(`
          INSERT INTO "DraftEmail" (
            "id", "leadId", "subject", "angle", "sentFrom", "body", "deliveryStatus", "sentAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT ("id") DO NOTHING
        `, [
          lead.draftEmail.id, lead.id, lead.draftEmail.subject || '', lead.draftEmail.angle || '',
          lead.draftEmail.sentFrom || '', lead.draftEmail.body || '',
          lead.draftEmail.deliveryStatus || 'ready', lead.draftEmail.sentAt ? new Date(lead.draftEmail.sentAt) : null
        ]);
      }
    }

    // Migrate Staging
    const staging = readJson(STAGING_PATH, { queue: [] });
    console.log(`Migrating ${staging.queue.length} staging items...`);
    for (const item of staging.queue) {
      await client.query(`
        INSERT INTO "StagingItem" (
          "id", "type", "department", "status", "createdAt", "title", "content", 
          "summary", "draftPath", "codePath", "diffPath", "metadata", 
          "managerReview", "revisionCount", "publishedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT ("id") DO NOTHING
      `, [
        item.id, item.type || 'other', item.department || 'Unknown', item.status || 'pending_review',
        new Date(item.created_at || Date.now()), item.title || 'Untitled', item.content || null,
        item.summary ? JSON.stringify(item.summary) : null, item.draft_path || null,
        item.code_path || null, item.diff_path || null, 
        item.metadata ? JSON.stringify(item.metadata) : null,
        item.manager_review ? JSON.stringify(item.manager_review) : null,
        item.revision_count || 0, item.published_at ? new Date(item.published_at) : null
      ]);
    }

    // Migrate Activity Log
    const log = readJson(ACTIVITY_PATH, { entries: [] });
    console.log(`Migrating ${log.entries.length} activity entries...`);
    for (const entry of log.entries) {
      await client.query(`
        INSERT INTO "ActivityLog" ("id", "emoji", "source", "message", "type", "timestamp")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("id") DO NOTHING
      `, [
        entry.id, entry.emoji || null, entry.source || 'system', entry.message || '',
        entry.type || 'info', new Date(entry.timestamp || Date.now())
      ]);
    }

    // Migrate Journal
    const journal = readJson(JOURNAL_PATH, { entries: [] });
    console.log(`Migrating ${journal.entries.length} journal entries...`);
    for (const entry of journal.entries) {
      const entryId = crypto.createHash('md5').update(`${entry.cycle}-${entry.date}`).digest('hex');
      await client.query(`
        INSERT INTO "JournalEntry" (
          "id", "date", "cycle", "sitrepSummary", "decision", "reasoning", 
          "confidence", "agencyHealth", "scoredRecommendation", "recommendedOrders", 
          "crossDeptOrders", "qualityAudit", "dispatchSuccess"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT ("id") DO NOTHING
      `, [
        entryId, new Date(entry.date || entry.timestamp || Date.now()), entry.cycle,
        entry.sitrep_summary ? JSON.stringify(entry.sitrep_summary) : null,
        entry.decision || 'unknown', entry.reasoning || '', entry.confidence || null,
        entry.agency_health || null, entry.scored_recommendation || null,
        entry.recommended_orders ? JSON.stringify(entry.recommended_orders) : null,
        entry.cross_dept_orders || null,
        entry.quality_audit ? JSON.stringify(entry.quality_audit) : null,
        entry.dispatch_success !== undefined ? entry.dispatch_success : null
      ]);
    }

    console.log("✅ Migration Complete!");
  } catch (err) {
    console.error("❌ Migration Failed:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
