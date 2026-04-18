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

async function testUpsert() {
  console.log('Testing AgencyConfig Upsert...');
  try {
    const payload = {
      manager: ["gemini-3.1-pro-preview", "gemini-3.1-flash-lite-preview", "gemini-3-flash", "gemini-2.5-flash"],
      writer: ["gemini-3-flash", "gemini-3.1-flash-lite-preview", "gemini-3-flash", "gemini-2.5-flash"]
    };

    const config = await prisma.agencyConfig.upsert({
      where: { id: 'default' },
      update: {
        agentModels: payload
      },
      create: { 
        id: 'default',
        agentModels: payload
      }
    });

    console.log('Success!', JSON.stringify(config, null, 2));
  } catch (err) {
    console.error('Failed!', err);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

testUpsert();
