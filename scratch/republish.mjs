import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
  await prisma.stagingItem.update({
    where: { id: 'stg-033' },
    data: { status: 'approved' }
  });
  console.log('Reset stg-033 to approved.');
  
  const publisher = spawn('node', ['.github/scripts/publisher.mjs'], { stdio: 'inherit' });
  publisher.on('close', () => {
    process.exit(0);
  });
}
fix();
