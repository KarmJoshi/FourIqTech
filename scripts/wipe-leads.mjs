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

async function clearAll() {
  console.log("Starting full database wipe for Leads and DraftEmails...");
  
  try {
    // Delete Draft Emails first (due to foreign key constraints on Lead)
    const deleteEmails = await prisma.draftEmail.deleteMany({});
    console.log(`Deleted ${deleteEmails.count} draft emails.`);

    // Delete Leads
    const deleteLeads = await prisma.lead.deleteMany({});
    console.log(`Deleted ${deleteLeads.count} leads.`);

    // Clear JSON cache files
    const cwd = process.cwd();
    const collectedLeadsPath = path.join(cwd, 'public/collected_leads.json');
    if (fs.existsSync(collectedLeadsPath)) {
        fs.writeFileSync(collectedLeadsPath, JSON.stringify([]));
        console.log(`Cleared public/collected_leads.json.`);
    }

    console.log("Database reset complete. System ready for a fresh AI Hunt.");
  } catch (error) {
    console.error("Error during reset:", error);
  } finally {
    process.exit(0);
  }
}

clearAll();
