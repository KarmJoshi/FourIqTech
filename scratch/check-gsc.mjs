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

async function check() {
  const latestGsc = await prisma.searchPerformance.findFirst({
    orderBy: { generatedAt: 'desc' }
  });
  console.log(JSON.stringify(latestGsc, null, 2));
  process.exit(0);
}
check();
