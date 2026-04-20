import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing leads...');
  await prisma.draftEmail.deleteMany();
  await prisma.lead.deleteMany();
  console.log('✅ Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
