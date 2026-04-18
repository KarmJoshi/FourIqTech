import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLeads() {
  const count = await prisma.lead.count();
  const sample = await prisma.lead.findFirst();
  console.log(`Lead Count: ${count}`);
  console.log(`Sample Lead Intelligence:`, {
    businessName: sample?.businessName,
    problemTitle: sample?.problemTitle,
    problemDetail: sample?.problemDetail || "MISSING"
  });
  process.exit(0);
}

checkLeads().catch(e => { console.error(e); process.exit(1); });
