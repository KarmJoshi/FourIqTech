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

async function main() {
  const lead = await prisma.lead.findFirst({
    include: { draftEmail: true },
    orderBy: { collectedAt: 'desc' }
  });
  
  if (!lead) {
    console.log("No leads found in DB.");
    return;
  }

  console.log("\n--- 🔎 LEAD AUDIT RESULTS ---");
  console.log(`Business: ${lead.businessName}`);
  console.log(`Website: ${lead.website}`);
  console.log(`Problem: ${lead.problemTitle}`);
  console.log(`Layman Detail: ${lead.problemDetail}`);
  console.log(`Business Impact: ${lead.businessImpact}`);
  
  if (lead.draftEmail) {
    console.log("\n--- ✉️  GENERATED EMAIL (MIRROR PSYCHOLOGY) ---");
    console.log(`Subject: ${lead.draftEmail.subject}`);
    console.log(`\n${lead.draftEmail.body}`);
  } else {
    console.log("\n--- ⚠️  NO EMAIL DRAFTED (PROBABLY QUOTA ERROR) ---");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
