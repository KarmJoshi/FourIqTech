import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// 🚀 THE PUBLISHER v3 — DB-Native Production Gateway
// ═══════════════════════════════════════════════════════════════════════
// Reads approved items from PostgreSQL StagingItem table.
//   blog_post      → Insert into BlogPost table (isLive: true)
//   landing_page   → Insert into ServicePage table (isLive: true)
//   technical_patch → Write code file + git commit
// ═══════════════════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const APP_TSX_PATH = path.join(process.cwd(), 'src/App.tsx');

function injectRouteIntoApp(routePath, componentPath) {
  let appCode = fs.readFileSync(APP_TSX_PATH, 'utf8');
  if (appCode.includes(`path="${routePath}"`)) return false;

  const compName = componentPath.split('/').pop().replace('.tsx', '');
  const importLine = `import ${compName} from "./pages/services/${compName}";`;
  
  if (!appCode.includes(compName)) {
    const importLines = appCode.split('\n');
    let lastImportIdx = 0;
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trimStart().startsWith('import ')) lastImportIdx = i;
    }
    importLines.splice(lastImportIdx + 1, 0, importLine);
    appCode = importLines.join('\n');
  }

  const routeElement = `              <Route path="${routePath}" element={<${compName} />} />`;
  const catchAllPattern = /(\s*<Route\s+path="\*")/;
  if (catchAllPattern.test(appCode)) {
    appCode = appCode.replace(catchAllPattern, `${routeElement}\n$1`);
  } else {
    appCode = appCode.replace('</Routes>', `${routeElement}\n            </Routes>`);
  }

  fs.writeFileSync(APP_TSX_PATH, appCode);
  return true;
}

async function logActivity(emoji, source, message, type = 'info') {
  try {
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        emoji, source, message, type,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error('   ⚠️ Activity log failed:', err.message);
  }
}

async function publishApprovedItems() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🚀 PUBLISHER v3 — DB-Native Production Gateway          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Get approved but not yet published items
  const approvedItems = await prisma.stagingItem.findMany({
    where: { status: 'approved' }
  });

  if (approvedItems.length === 0) {
    console.log('\n💤 No approved items to deploy.');
    return;
  }

  console.log(`\n📦 Found ${approvedItems.length} approved item(s) to deploy.\n`);
  let publishedCount = 0;
  let codeChanged = false;

  for (const item of approvedItems) {
    console.log(`\n📦 PUBLISHING [${item.id}] "${item.title}" (${item.type})...`);

    try {
      if (item.type === 'blog_post') {
        // ── BLOG POST → Insert into BlogPost table ──
        const content = item.content || '';
        
        // Parse blog metadata from content (AI generates in specific format)
        const slug = content.match(/slug:\s*'([^']+)'/)?.[1] || `post-${Date.now()}`;
        const title = content.match(/title:\s*'([^']+)'/)?.[1] || item.title;
        const excerpt = content.match(/excerpt:\s*'([^']+)'/)?.[1] || '';
        const date = content.match(/date:\s*'([^']+)'/)?.[1] || new Date().toISOString().split('T')[0];
        const category = content.match(/category:\s*'([^']+)'/)?.[1] || 'Engineering';
        const author = content.match(/author:\s*'([^']+)'/)?.[1] || 'FouriqTech Engineering';
        const readTime = content.match(/readTime:\s*'([^']+)'/)?.[1] || '5 min read';
        const htmlContent = content.match(/content:\s*`([\s\S]*)`/)?.[1]?.trim() || content;

        // Check for duplicate slug
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) {
          console.log(`   ⚠️ Blog "${slug}" already exists. Updating...`);
          await prisma.blogPost.update({
            where: { slug },
            data: { title, excerpt, content: htmlContent, isLive: true }
          });
        } else {
          await prisma.blogPost.create({
            data: {
              slug, title, excerpt, date, readTime,
              category, author, content: htmlContent, isLive: true,
            }
          });
        }

        console.log(`   ✅ Blog "${title}" → DB (isLive: true)`);

      } else if (item.type === 'landing_page' || item.type === 'structural_page') {
        // ── LANDING PAGE → Insert into ServicePage table + write .tsx file ──
        const payload = JSON.parse(item.content || '{}');
        const slug = payload.route?.replace('/services/', '') || `page-${Date.now()}`;
        
        let finalCode = payload.code || '';
        try {
          const inner = JSON.parse(finalCode);
          if (inner.content) finalCode = inner.content;
          else if (inner.code) finalCode = inner.code;
        } catch { /* not nested */ }

        // Save to DB
        const existingPage = await prisma.servicePage.findUnique({ where: { slug } });
        if (existingPage) {
          await prisma.servicePage.update({
            where: { slug },
            data: { component: finalCode, isLive: true }
          });
        } else {
          await prisma.servicePage.create({
            data: {
              slug,
              title: item.title,
              component: finalCode,
              route: payload.route || `/services/${slug}`,
              isLive: true,
            }
          });
        }

        // Also write the .tsx file for static rendering
        if (payload.target_file) {
          const fullPath = path.join(process.cwd(), payload.target_file);
          const dirPath = path.dirname(fullPath);
          if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(fullPath, finalCode, 'utf8');
          injectRouteIntoApp(payload.route, payload.target_file);
          codeChanged = true;
        }

        console.log(`   ✅ Page "${item.title}" → DB + file system`);

      } else if (item.type === 'technical_patch') {
        // ── TECHNICAL PATCH → Write code, needs git commit ──
        const payload = JSON.parse(item.content || '{}');
        const cleanPath = payload.target_file?.startsWith('/') 
          ? payload.target_file.slice(1) : payload.target_file;
        
        if (cleanPath && payload.code) {
          const fullPath = path.join(process.cwd(), cleanPath);
          fs.writeFileSync(fullPath, payload.code, 'utf8');
          codeChanged = true;
          console.log(`   ✅ Patch applied to ${cleanPath}`);
        }
      }

      // Mark as published in DB
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

  console.log(`\n🎉 PUBLISHER: Deployed ${publishedCount}/${approvedItems.length} items.`);

  // ── Auto-Commit & Sync ──
  // To ensure Git has something to track even for DB-only changes (like blogs), we sync to JSON
  try {
    const allBlogs = await prisma.blogPost.findMany({ where: { isLive: true } });
    fs.writeFileSync(path.join(process.cwd(), 'public/live_posts.json'), JSON.stringify({ posts: allBlogs }, null, 2));
    
    const allServices = await prisma.servicePage.findMany({ where: { isLive: true } });
    fs.writeFileSync(path.join(process.cwd(), 'public/live_pages.json'), JSON.stringify({ pages: allServices }, null, 2));
  } catch (syncErr) {
    console.error('   ⚠️ Sync to JSON failed:', syncErr.message);
  }

  // Load settings to check for auto-commit
  let isAutoCommit = process.env.GITHUB_ACTIONS === 'true';
  try {
    const dbSettings = await prisma.agencyConfig.findUnique({ where: { id: 'default' }});
    if (dbSettings && dbSettings.isAutoCommit) {
      isAutoCommit = true;
    } else {
      // Fallback
      const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.github/staging/system-settings.json'), 'utf8'));
      if (settings.isAutoCommit) isAutoCommit = true;
    }
  } catch (e) {
    console.error('   ⚠️ Could not load settings:', e.message);
  }

  if (publishedCount > 0 && isAutoCommit) {
    try {
      console.log(`\n👔 CI/AUTO-COMMIT: Stage, Commit & Push...`);
      
      const REPO_URL = 'https://github.com/KarmJoshi/FourIqTech.git';
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      
      if (!GITHUB_TOKEN) {
        console.warn('   ⚠️ No GITHUB_TOKEN found in environment. Pushing via local credentials...');
      } else {
        console.log(`   🔑 Token detected (Length: ${GITHUB_TOKEN.length}). Forcing authenticated push...`);
      }

      // 🛡️ PRO-ACTIVE GIT HEALING
      // Detect correct branch
      let branch = 'main';
      try {
        const detected = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        if (detected && detected !== 'HEAD') {
            branch = detected;
        }
      } catch (e) {
        console.log('   ⚠️ Could not detect branch, defaulting to main.');
      }

      const authenticatedUrl = GITHUB_TOKEN 
        ? REPO_URL.replace('https://', `https://${GITHUB_TOKEN}@`)
        : REPO_URL;

      console.log(`   🔄 Syncing to branch: ${branch}...`);
      
      try {
        execSync('git remote remove origin', { stdio: 'ignore' });
      } catch (e) {}
      
      // Inject authenticated URL
      execSync(`git remote add origin ${authenticatedUrl}`);

      execSync('git config user.name "FourIqTech AI Publisher"');
      execSync('git config user.email "ai-publisher@fouriqtech.com"');
      
      execSync('git add .');
      const status = execSync('git status --porcelain').toString();
      
      if (status) {
        execSync(`git commit -m "[AI-PUBLISH] Deployed ${publishedCount} improvements"`);
        console.log(`   📤 Pushing changes to ${branch}...`);
        
        console.log(`   📥 Pulling latest changes from remote to avoid conflicts...`);
        try {
           execSync(`git pull --rebase origin ${branch}`);
        } catch (pullErr) {
           console.log(`   ⚠️ Rebase failed, attempting standard merge-pull...`);
           execSync(`git pull origin ${branch}`);
        }

        // STRICT PUSH
        execSync(`git push -u origin ${branch}`);
        
        console.log('   ✅ Git push successful.');
        await logActivity('🐙', 'publisher', `Successfully pushed ${publishedCount} changes to ${branch}`, 'info');
      } else {
        console.log('   ℹ️ No changes to commit.');
      }
    } catch (gitErr) {
      const errorMsg = gitErr.stderr?.toString() || gitErr.message;
      console.error('   ❌ Git operation failed:', errorMsg);
      await logActivity('⚠️', 'publisher', `Auto-commit failed: ${errorMsg.substring(0, 100)}`, 'error');
    }
  } else if (publishedCount > 0) {
    console.log(`\n💡 LOCAL: Published ${publishedCount} items. (Auto-commit disabled in settings)`);
  }
}


publishApprovedItems()
  .catch(e => console.error('Publisher fatal:', e))
  .finally(() => pool.end());
