import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { logActivity } from './agency-core.mjs';

// ═══════════════════════════════════════════════════════════════════════
// 🚀 THE PUBLISHER — Gatekeeper to Production
// ═══════════════════════════════════════════════════════════════════════
// This is the ONLY script authorized to write to production files.
// It scans the staging queue for items explicitly marked `approved` by the Manager
// and deploys them to the codebase.
// ═══════════════════════════════════════════════════════════════════════

const STAGING_PATH = path.join(process.cwd(), '.github/staging/staging.json');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const APP_TSX_PATH = path.join(process.cwd(), 'src/App.tsx');

function readJson(filePath, def) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return def;
  }
}

function injectRouteIntoApp(routePath, componentPath) {
  let appCode = fs.readFileSync(APP_TSX_PATH, 'utf8');
  
  // Basic check to see if route already imported or exists
  if (appCode.includes(`path="${routePath}"`)) return false;

  const compName = componentPath.split('/').pop().replace('.tsx', '');
  
  // Inject Import — handle both single and double quote styles
  const importLine = `import ${compName} from "./pages/services/${compName}";`;
  if (!appCode.includes(compName)) {
    // Find the last import line and add after it
    const importLines = appCode.split('\n');
    let lastImportIdx = 0;
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trimStart().startsWith('import ')) lastImportIdx = i;
    }
    importLines.splice(lastImportIdx + 1, 0, importLine);
    appCode = importLines.join('\n');
  }

  // Inject Route — insert BEFORE the catch-all "*" route, not after </Routes>
  const routeElement = `              <Route path="${routePath}" element={<${compName} />} />`;
  const catchAllPattern = /(\s*<Route\s+path="\*")/;
  if (catchAllPattern.test(appCode)) {
    appCode = appCode.replace(catchAllPattern, `${routeElement}\n$1`);
  } else {
    // Fallback: insert before </Routes>
    appCode = appCode.replace('</Routes>', `${routeElement}\n            </Routes>`);
  }

  fs.writeFileSync(APP_TSX_PATH, appCode);
  return true;
}

async function publishApprovedItems() {
  const staging = readJson(STAGING_PATH, { queue: [], stats: {} });
  let publishedCount = 0;

  for (const item of staging.queue) {
    if (item.status === 'approved' && !item.is_published) {
      console.log(`\n📦 PUBLISHER: Deploying [${item.id}] ${item.title}...`);
      
      try {
        if (item.type === 'blog_post') {
          // payload is the raw newPost string block
          let blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
          const updated = blogDataFile.replace(
            'export const blogPosts: BlogPost[] = [',
            `export const blogPosts: BlogPost[] = [${item.content}`
          );
          fs.writeFileSync(BLOG_DATA_PATH, updated);
          
        } else if (item.type === 'landing_page') {
          const payload = JSON.parse(item.content);
          const fullTargetPath = path.join(process.cwd(), payload.target_file);
          const dirPath = path.dirname(fullTargetPath);
          if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
          
          // Handle double-nested JSON: agent sometimes wraps code in {"filename":"...","content":"..."}
          let finalCode = payload.code;
          try {
            const inner = JSON.parse(finalCode);
            if (inner.content && typeof inner.content === 'string') {
              finalCode = inner.content;
              console.log(`   🔧 Unwrapped nested JSON for ${payload.target_file}`);
            }
          } catch { /* not nested JSON, use as-is */ }
          
          fs.writeFileSync(fullTargetPath, finalCode, 'utf8');
          injectRouteIntoApp(payload.route, payload.target_file);

        } else if (item.type === 'technical_patch') {
          const payload = JSON.parse(item.content);
          const cleanPath = payload.target_file.startsWith('/') ? payload.target_file.slice(1) : payload.target_file;
          const fullPath = path.join(process.cwd(), cleanPath);
          fs.writeFileSync(fullPath, payload.code, 'utf8');
        }

        item.status = 'published';
        item.is_published = true;
        item.published_at = new Date().toISOString();
        publishedCount++;

        logActivity('📣', 'publisher', `Deployed ${item.type}: "${item.title}" to production`, 'publish');
        console.log(`   ✅ Success!`);

      } catch (e) {
        console.error(`   ❌ Failed to deploy ${item.id}:`, e.message);
        logActivity('❌', 'publisher', `Failed to deploy ${item.title}: ${e.message}`, 'error');
      }
    }
  }

  if (publishedCount > 0) {
    // Recalculate stats
    const q = staging.queue;
    staging.stats = {
      total_submitted: q.length,
      approved: q.filter(i => i.status === 'approved').length,
      rejected: q.filter(i => i.status === 'rejected').length,
      pending: q.filter(i => i.status === 'pending_review').length,
      published: q.filter(i => i.status === 'published').length,
      approval_rate: q.length > 0 
        ? Math.round(((q.filter(i => i.status === 'approved').length + q.filter(i => i.status === 'published').length) / q.length) * 100) + '%' 
        : '0%'
    };
    
    fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2));
    console.log(`\n🎉 PUBLISHER: Finished deploying ${publishedCount} items.`);
    
    // ── Auto-Commit Section ──
    if (process.env.GITHUB_ACTIONS === 'true') {
      try {
        console.log(`\n👔 CI DETECTED: Committing and pushing ${publishedCount} changes...`);
        execSync('git config --global user.name "FouriqTech AI Agent"');
        execSync('git config --global user.email "ai-agent@fouriqtech.com"');
        execSync('git add .');
        // Include [skip ci] to prevent recursive triggers
        execSync(`git commit -m "[AI-AGENCY] Published ${publishedCount} items [skip ci]"`);
        execSync('git push');
        console.log('   ✅ Git push successful.');
      } catch (gitErr) {
        console.error('   ❌ Git commit/push failed:', gitErr.message);
      }
    } else {
      console.log(`\n💡 LOCAL RUN: Skipping auto-commit. (Only triggers in Cloud environment)`);
    }

  } else {
    console.log(`\n💤 PUBLISHER: No approved items found to deploy.`);
  }
}

publishApprovedItems().catch(e => {
  console.error('Publisher failed:', e);
});
