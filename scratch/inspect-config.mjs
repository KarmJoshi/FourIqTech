import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
const prisma = new PrismaClient();

async function checkConfig() {
  try {
    const config = await prisma.agencyConfig.findUnique({ where: { id: 'default' } });
    console.log('--- Agency Config ---');
    console.log(JSON.stringify(config, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
