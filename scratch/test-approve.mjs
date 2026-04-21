import { PrismaClient } from '@prisma/client';
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const item = await prisma.stagingItem.findFirst({ where: { status: 'staged' } });
  if (item) {
    await prisma.stagingItem.update({ where: { id: item.id }, data: { status: 'approved' } });
    console.log('APPROVED:' + item.id);
  } else {
    // If no staged items, just create a mock one.
    const newItem = await prisma.stagingItem.create({
      data: {
        id: "mock-" + Date.now(),
        type: "blog_post",
        title: "Test Publish Post",
        content: `slug: 'test-publish'\ntitle: 'Test Publish Post'\nexcerpt: 'Testing GitHub Push'\ndate: '${new Date().toISOString().split('T')[0]}'\ncategory: 'Engineering'\nauthor: 'FouriqTech Engineering'\nreadTime: '1 min read'\ncontent: \`This is a test post to trigger the publisher and test GitHub push access.\` `,
        status: "approved",
        department: "content",
        createdAt: new Date(),
      }
    });
    console.log('CREATED & APPROVED MOCK:' + newItem.id);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
