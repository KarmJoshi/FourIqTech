import fs from 'fs';
import path from 'path';
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

async function forceSync() {
  console.log('🔄 Forcing Page Index Sync via DB Adapter...');
  
  try {
    const allBlogs = await prisma.blogPost.findMany({ where: { isLive: true } });
    fs.writeFileSync(path.join(process.cwd(), 'public/live_posts.json'), JSON.stringify({ posts: allBlogs }, null, 2));
    console.log(`✅ Synced ${allBlogs.length} Blog Posts to UI index.`);
    
    const allServices = await prisma.servicePage.findMany({ where: { isLive: true } });
    fs.writeFileSync(path.join(process.cwd(), 'public/live_pages.json'), JSON.stringify({ pages: allServices }, null, 2));
    console.log(`✅ Synced ${allServices.length} Service Pages to UI index.`);
    
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

forceSync();
