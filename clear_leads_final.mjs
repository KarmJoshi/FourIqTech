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
  console.log('🧹 Clearing Lead Database...');
  const emails = await prisma.draftEmail.deleteMany();
  const leads = await prisma.lead.deleteMany();
  console.log(`✅ Deleted ${emails.count} draft emails.`);
  console.log(`✅ Deleted ${leads.count} leads.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
