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
  console.log('Connecting to database...');
  await prisma.$connect();
  console.log('Connected.');

  console.log('\n--- Searching Staging Items for Micro-Frontends ---');
  const stagingItems = await prisma.stagingItem.findMany();
  for (const item of stagingItems) {
    if (item.id.includes('stg-054') || item.title.toLowerCase().includes('micro-frontends')) {
      console.log('Found matching staging item:', {
        id: item.id,
        type: item.type,
        status: item.status,
        title: item.title,
        createdAt: item.createdAt,
        publishedAt: item.publishedAt,
        metadata: item.metadata
      });
    }
  }

  console.log('\n--- Searching Blog Posts for Micro-Frontends ---');
  const blogPosts = await prisma.blogPost.findMany();
  for (const post of blogPosts) {
    if (post.slug.includes('micro-frontends')) {
      console.log('Found matching blog post:', {
        id: post.id,
        slug: post.slug,
        title: post.title,
        isLive: post.isLive,
        qaScore: post.qaScore,
        structure: post.structure,
        createdAt: post.createdAt
      });
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
