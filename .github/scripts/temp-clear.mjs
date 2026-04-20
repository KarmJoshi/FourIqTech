import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing lead database...');
  
  const emails = await prisma.draftEmail.deleteMany();
  console.log(`✅ Deleted ${emails.count} draft emails.`);
  
  const leads = await prisma.lead.deleteMany();
  console.log(`✅ Deleted ${leads.count} leads.`);
  
  console.log('✨ All leads and draft emails have been removed.');
}

main()
  .catch((e) => {
    console.error('❌ Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
