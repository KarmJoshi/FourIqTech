import fs from 'fs';
import path from 'path';
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

import { githubGetFile, githubPutFile, githubCommitMultiple } from './github-api.mjs';

// ═══════════════════════════════════════════════════════════════════════
// 🚀 PUBLISHER v4 — GitHub API Powered (Works from ANY server)
// ═══════════════════════════════════════════════════════════════════════
// No git CLI needed. Pushes code directly via GitHub REST API.
//   blog_post       → DB only (no file needed)
//   landing_page    → DB + push .tsx file + update App.tsx via GitHub API
//   technical_patch → Push patched file via GitHub API
// ═══════════════════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function logActivity(emoji, source, message, type = 'info') {
  try {
    await prisma.activityLog.create({
      data: { id: crypto.randomUUID(), emoji, source, message, type, timestamp: new Date() }
    });
  } catch (err) {
    console.error('   ⚠️ Activity log failed:', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTE INJECTOR — Updates App.tsx via GitHub API
// ═══════════════════════════════════════════════════════════════════════
async function injectRouteViaAPI(routePath, componentName) {
  console.log(`   🔗 Injecting route ${routePath} into App.tsx...`);
  
  // Get current App.tsx from GitHub
  const appFile = await githubGetFile('src/App.tsx');
  if (!appFile.exists) {
    console.log('   ❌ App.tsx not found on GitHub');
    return null;
  }
  
  let appCode = appFile.content;
  
  // Check if route already exists
  if (appCode.includes(`path="${routePath}"`)) {
    console.log(`   ℹ️ Route ${routePath} already exists in App.tsx`);
    return null;
  }
  
  // Add import
  const importLine = `import ${componentName} from "./pages/services/${componentName}";`;
  if (!appCode.includes(componentName)) {
    const lines = appCode.split('\n');
    let lastImportIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trimStart().startsWith('import ')) lastImportIdx = i;
    }
    lines.splice(lastImportIdx + 1, 0, importLine);
    appCode = lines.join('\n');
  }
  
  // Add route (before the catch-all * route)
  const routeElement = `              <Route path="${routePath}" element={<${componentName} />} />`;
  const catchAllPattern = /(\s*<Route\s+path="\*")/;
  if (catchAllPattern.test(appCode)) {
    appCode = appCode.replace(catchAllPattern, `${routeElement}\n$1`);
  } else {
    appCode = appCode.replace('</Routes>', `${routeElement}\n            </Routes>`);
  }
  
  return appCode;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PUBLISH LOGIC
// ═══════════════════════════════════════════════════════════════════════
async function publishApprovedItems() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🚀 PUBLISHER v4 — GitHub API Powered                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const approvedItems = await prisma.stagingItem.findMany({
    where: { status: 'approved' }
  });

  if (approvedItems.length === 0) {
    console.log('\n💤 No approved items to deploy.');
    return;
  }

  console.log(`\n📦 Found ${approvedItems.length} approved item(s) to deploy.\n`);
  let publishedCount = 0;
  const filesToCommit = []; // Collect files for a single atomic commit

  for (const item of approvedItems) {
    console.log(`\n📦 PUBLISHING [${item.id}] "${item.title}" (${item.type})...`);

    try {
      if (item.type === 'blog_post') {
        // ── BLOG POST → DB only (no file needed) ──
        const content = item.content || '';
        const slug = content.match(/slug:\s*'([^']+)'/)?.[1] || `post-${Date.now()}`;
        const title = content.match(/title:\s*'([^']+)'/)?.[1] || item.title;
        const excerpt = content.match(/excerpt:\s*'([^']+)'/)?.[1] || '';
        const date = content.match(/date:\s*'([^']+)'/)?.[1] || new Date().toISOString().split('T')[0];
        const category = content.match(/category:\s*'([^']+)'/)?.[1] || 'Engineering';
        const author = content.match(/author:\s*'([^']+)'/)?.[1] || 'FouriqTech Engineering';
        const readTime = content.match(/readTime:\s*'([^']+)'/)?.[1] || '5 min read';
        const htmlContent = content.match(/content:\s*`([\s\S]*)`/)?.[1]?.trim() || content;

        // Validation
        if (!title || htmlContent.length < 200) {
          console.log(`   ⚠️ Blog content invalid. Skipping.`);
          continue;
        }

        await prisma.blogPost.upsert({
          where: { slug },
          update: { title, excerpt, content: htmlContent, isLive: true },
          create: { slug, title, excerpt, date, readTime, category, author, content: htmlContent, isLive: true }
        });

        console.log(`   ✅ Blog "${title}" → DB (isLive: true)`);

      } else if (item.type === 'landing_page' || item.type === 'structural_page') {
        // ── LANDING PAGE → DB + push .tsx file via GitHub API ──
        const payload = JSON.parse(item.content || '{}');
        const slug = payload.route?.replace('/services/', '') || `page-${Date.now()}`;
        const componentName = payload.component_name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        
        let finalCode = payload.code || '';
        try {
          const inner = JSON.parse(finalCode);
          if (inner.content) finalCode = inner.content;
          else if (inner.code) finalCode = inner.code;
        } catch { /* not nested */ }

        if (!finalCode || finalCode.length < 100) {
          console.log(`   ⚠️ Page code too short. Skipping.`);
          continue;
        }

        // Save to DB
        await prisma.servicePage.upsert({
          where: { slug },
          update: { component: finalCode, isLive: true },
          create: { slug, title: item.title, component: finalCode, route: payload.route || `/services/${slug}`, isLive: true }
        });

        // Queue the .tsx file for GitHub commit
        const targetFile = payload.target_file || `src/pages/services/${componentName}.tsx`;
        filesToCommit.push({ path: targetFile, content: finalCode });
        
        // Update App.tsx with new route
        const updatedAppTsx = await injectRouteViaAPI(payload.route || `/services/${slug}`, componentName);
        if (updatedAppTsx) {
          filesToCommit.push({ path: 'src/App.tsx', content: updatedAppTsx });
        }

        console.log(`   ✅ Page "${item.title}" → DB + queued for GitHub push`);

      } else if (item.type === 'technical_patch') {
        // ── TECHNICAL PATCH → Push via GitHub API ──
        const payload = JSON.parse(item.content || '{}');
        const targetFile = payload.target_file?.startsWith('/') ? payload.target_file.slice(1) : payload.target_file;
        
        if (targetFile && payload.code) {
          filesToCommit.push({ path: targetFile, content: payload.code });
          console.log(`   ✅ Patch queued: ${targetFile}`);
        }
      }

      // Mark as published
      await prisma.stagingItem.update({
        where: { id: item.id },
        data: { status: 'published', publishedAt: new Date() }
      });
      publishedCount++;
      await logActivity('📣', 'publisher', `Deployed ${item.type}: "${item.title}"`, 'publish');

    } catch (e) {
      console.error(`   ❌ Failed to deploy ${item.id}:`, e.message);
      await logActivity('❌', 'publisher', `Failed: "${item.title}" — ${e.message}`, 'error');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SYNC live_posts.json — Static fallback for when API is unreachable
  // ═══════════════════════════════════════════════════════════════════
  if (publishedCount > 0) {
    try {
      console.log(`\n📄 SYNC: Generating live_posts.json fallback...`);
      const allLivePosts = await prisma.blogPost.findMany({
        where: { isLive: true },
        orderBy: { date: 'desc' }
      });
      const livePostsJson = JSON.stringify({
        posts: allLivePosts.map(p => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          date: p.date,
          readTime: p.readTime,
          category: p.category,
          author: p.author,
          content: p.content
        })),
        updated_at: new Date().toISOString()
      }, null, 2);
      filesToCommit.push({ path: 'public/live_posts.json', content: livePostsJson });
      console.log(`   ✅ live_posts.json queued with ${allLivePosts.length} posts`);
    } catch (e) {
      console.error(`   ⚠️ live_posts.json sync failed: ${e.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUSH TO GITHUB — Single atomic commit for all file changes
  // ═══════════════════════════════════════════════════════════════════
  if (filesToCommit.length > 0) {
    console.log(`\n🐙 GITHUB PUSH: Committing ${filesToCommit.length} file(s)...`);
    
    const result = await githubCommitMultiple(
      filesToCommit,
      `[AI-PUBLISH] Deployed ${publishedCount} improvement(s) + synced live_posts.json`
    );
    
    if (result.success) {
      console.log(`   ✅ Pushed to GitHub: ${result.sha?.substring(0, 7)}`);
      console.log(`   🔄 Vercel will auto-deploy in ~30 seconds`);
      await logActivity('🐙', 'publisher', `Pushed ${filesToCommit.length} files to GitHub (${result.sha?.substring(0, 7)})`, 'publish');
    } else {
      console.error(`   ❌ GitHub push failed: ${result.error}`);
      await logActivity('❌', 'publisher', `GitHub push failed: ${result.error}`, 'error');
    }
  } else if (publishedCount > 0) {
    console.log(`\n✅ ${publishedCount} items published (DB-only, no file changes needed).`);
  }

  console.log(`\n🎉 PUBLISHER: Done. ${publishedCount}/${approvedItems.length} deployed.`);
}

publishApprovedItems()
  .catch(e => console.error('Publisher fatal:', e.message))
  .finally(() => pool.end());
