import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const CWD = process.cwd();
const TARGETS_PATH = path.join(CWD, '.github/outreach_targets.json');
const LOG_PATH = path.join(CWD, '.github/outreach_log.json');

async function importHistory() {
  console.log('--- Historical Outreach Import ---');

  let targets = [];
  try {
    targets = JSON.parse(fs.readFileSync(TARGETS_PATH, 'utf8'));
    console.log(`Found ${targets.length} targets in outreach_targets.json`);
  } catch (e) {
    console.log(`No outreach_targets.json found or invalid JSON`);
  }

  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
    console.log(`Found ${logs.length} entries in outreach_log.json`);
  } catch (e) {
    console.log(`No outreach_log.json found or invalid JSON`);
  }

  let imported = 0;

  for (const t of targets) {
    const id = `hist-${t.website.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Check if it's in the logs as sent or draft_saved
    const logEntry = logs.find(l => l.company === t.company_name);
    // Mark as 'sent' if it was in the log (or we can just respect the user's wish and don't re-pitch them)
    const status = logEntry ? 'sent' : 'researched';
    const deliveryStatus = logEntry ? 'sent' : 'pending';

    try {
      await prisma.lead.upsert({
        where: { id },
        update: {
          status,
          contactEmail: t.email,
          problemTitle: t.problem_title,
          problemDetail: t.problem_detail,
          businessImpact: t.business_impact,
          likelyFix: t.likely_fix
        },
        create: {
          id,
          businessName: t.company_name,
          website: t.website,
          source: t.source,
          contactEmail: t.email,
          niche: t.niche,
          location: t.city,
          collectedAt: new Date(),
          lastTouchedAt: new Date(),
          status,
          problemTitle: t.problem_title,
          problemDetail: t.problem_detail,
          businessImpact: t.business_impact,
          likelyFix: t.likely_fix
        }
      });

      if (t.draft_subject && t.draft_body) {
        await prisma.draftEmail.upsert({
          where: { id: `email-${id}` },
          update: {
            subject: t.draft_subject,
            body: t.draft_body,
            deliveryStatus,
            angle: 'Direct Approach',
            sentFrom: 'director@fouriq.ai'
          },
          create: {
            id: `email-${id}`,
            leadId: id,
            subject: t.draft_subject,
            body: t.draft_body,
            deliveryStatus,
            angle: 'Direct Approach',
            sentFrom: 'director@fouriq.ai'
          }
        });
      }
      
      imported++;
    } catch (e) {
      console.warn(`Error importing ${t.company_name}:`, e.message);
    }
  }

  console.log(`Successfully imported ${imported} historical leads.`);
  process.exit(0);
}

importHistory();
