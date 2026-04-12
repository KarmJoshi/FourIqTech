import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  try {
    console.log("🔍 Verifying Database Connection (Prisma 7 Adapter)...");
    const leadCount = await prisma.lead.count();
    const stagingCount = await prisma.stagingItem.count();
    const logCount = await prisma.activityLog.count();
    const journalCount = await prisma.journalEntry.count();
    
    console.log(`✅ Success! Database stats:`);
    console.log(`   - Leads: ${leadCount}`);
    console.log(`   - Staging Items: ${stagingCount}`);
    console.log(`   - Activity Logs: ${logCount}`);
    console.log(`   - Journal Entries: ${journalCount}`);
    
  } catch (err) {
    console.error("❌ Verification Failed:", err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verify();
