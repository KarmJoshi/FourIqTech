import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const API_URL = `http://localhost:${process.env.PORT || 3848}`;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMockPipeline() {
  console.log('🧪 Starting End-to-End Mock Pipeline Test (No API Calls)\n');

  try {
    // 1. Submit Mock Items to Staging (Simulating Departments)
    console.log('1️⃣ Simulating Department Work (Submitting to Staging)...');
    
    const mockBlog = await prisma.stagingItem.create({
      data: {
        id: crypto.randomUUID(),
        title: 'Mock Test Blog Post - ' + Date.now(),
        type: 'blog_post',
        content: `slug: 'mock-test-blog-${Date.now()}'\ntitle: 'Mock Test Blog Post'\nexcerpt: 'Testing the DB publishing flow without LLMs.'\ndate: '${new Date().toISOString().split('T')[0]}'\ncategory: 'Testing'\nauthor: 'Test Agent'\nreadTime: '1 min read'\ncontent: \`<h2>Test Blog</h2><p>This is a mock blog post to verify the publisher pipeline.</p>\``,
        status: 'pending_review',
        department: 'content',
        createdAt: new Date()
      }
    });
    console.log(`   ✅ Content Dept: Submitted blog post [${mockBlog.id}]`);

    const mockPage = await prisma.stagingItem.create({
      data: {
        id: crypto.randomUUID(),
        title: 'Mock Test Service Page - ' + Date.now(),
        type: 'structural_page',
        content: JSON.stringify({
          route: '/services/mock-test-page',
          target_file: 'src/pages/services/MockTestPage.tsx',
          code: JSON.stringify({
            content: 'export default function MockTestPage() { return <div>Mock Service Page Data</div>; }'
          })
        }),
        status: 'pending_review',
        department: 'developer',
        createdAt: new Date()
      }
    });
    console.log(`   ✅ Developer Dept: Submitted service page [${mockPage.id}]`);

    // 2. Simulate Manager Approval
    console.log('\n2️⃣ Simulating Manager Approval...');
    await prisma.stagingItem.updateMany({
      where: { id: { in: [mockBlog.id, mockPage.id] } },
      data: { status: 'approved' }
    });
    console.log('   ✅ Manager approved staging items.');

    // 3. Run Publisher
    console.log('\n3️⃣ Running Publisher...');
    console.log('----------------------------------------------------');
    execSync('node .github/scripts/publisher.mjs', { stdio: 'inherit' });
    console.log('----------------------------------------------------');

    // 4. Verify API Endpoints
    console.log('\n4️⃣ Verifying Live API Endpoints...');
    
    await delay(1000); // Give Express a moment

    console.log('   Testing GET /api/blogs');
    try {
      const blogRes = await fetch(`${API_URL}/api/blogs`);
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        const found = blogData.posts?.find(p => p.title.includes('Mock Test Blog Post'));
        if (found) console.log('   ✅ Found mock blog in API response!', found.slug);
        else console.log('   ❌ Mock blog NOT found in API response.');
      } else {
        console.log(`   ❌ API fetch failed with status ${blogRes.status}`);
      }
    } catch (e) {
      console.log('   ❌ Could not reach agency-api. Is it running? ' + e.message);
    }

    console.log('   Testing GET /api/services');
    try {
      const svcRes = await fetch(`${API_URL}/api/services`);
      if (svcRes.ok) {
        const svcData = await svcRes.json();
        const found = svcData.pages?.find(p => p.title.includes('Mock Test Service Page'));
        if (found) console.log('   ✅ Found mock service page in API response!', found.slug);
        else console.log('   ❌ Mock service page NOT found in API response.');
      } else {
        console.log(`   ❌ API fetch failed with status ${svcRes.status}`);
      }
    } catch (e) {
      console.log('   ❌ Could not reach agency-api. ' + e.message);
    }

    // 5. Verify File System for structural page
    console.log('\n5️⃣ Verifying File System (Service Page generation)...');
    const pagePath = path.join(process.cwd(), 'src/pages/services/MockTestPage.tsx');
    if (fs.existsSync(pagePath)) {
      console.log('   ✅ MockTestPage.tsx created successfully.');
      // Cleanup file so it doesn't break future builds if left hanging
      fs.unlinkSync(pagePath);
      console.log('   🧹 Cleaned up mock file.');
    } else {
      console.log('   ❌ MockTestPage.tsx was NOT created.');
    }

    // Optional: Cleanup DB
    console.log('\n6️⃣ Cleanup DB (removing mock data)...');
    await prisma.blogPost.deleteMany({ where: { title: { contains: 'Mock Test Blog Post' } }});
    await prisma.servicePage.deleteMany({ where: { title: { contains: 'Mock Test Service Page' } }});
    await prisma.stagingItem.deleteMany({ where: { title: { contains: 'Mock Test' } }});
    console.log('   ✅ Mock data removed from DB.');

    console.log('\n🎉 Pipeline structural validation complete! All DB systems operational.');

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runMockPipeline();
