import { PrismaClient } from '@prisma/client';
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const item = await prisma.stagingItem.findFirst({ orderBy: { createdAt: 'desc' } });
  if (item && item.content) {
    console.log(item.content.substring(0, 500));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
