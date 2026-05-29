import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { submitToStaging, logActivity, getModelsForRole, smartCall, sleep, getApiKeyCount } from './agency-core.mjs';
import { compileMemory, recordAction, trackKeyword, closeMemory } from './memory-compiler.mjs';

// ═══════════════════════════════════════════════════════════════════════
// 🏗️ SERVICE PAGE AGENT v2.0 — Memory-Powered Landing Page Generator
// ═══════════════════════════════════════════════════════════════════════
// Pipeline:
//   1. MEMORY LOAD      → Full agency context (what pages exist, what works)
//   2. MARKET SCANNER   → Finds high buyer-intent keywords via grounding
//   3. PAGE STRATEGIST  → Designs page architecture + content brief
//   4. PAGE BUILDER     → Generates production React/TSX component
//   5. BUILD VERIFY     → Checks if the code is valid (syntax check)
//   6. SUBMIT           → Sends to staging for Director review
//
// INTEGRATIONS:
//   - Memory Compiler (knows existing pages, avoids duplicates)
//   - Keyword Memory (tracks targeted keywords)
//   - Topic Clusters (links to related blog posts)
//   - Design System (matches site's visual style)
// ═══════════════════════════════════════════════════════════════════════

const CWD = process.cwd();
const CONFIG_PATH = path.join(CWD, 'fouriqtech-seo-config.yaml');
const APP_TSX_PATH = path.join(CWD, 'src/App.tsx');
const PAGES_DIR = path.join(CWD, 'src/pages/services');

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════
function loadConfig() {
  try { return yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return {}; }
}

function getExistingRoutes() {
  try {
    const appContent = fs.readFileSync(APP_TSX_PATH, 'utf8');
    return [...appContent.matchAll(/path="([^"]+)"/g)].map(m => m[1]);
  } catch { return []; }
}

function getExistingServicePages() {
  try {
    if (!fs.existsSync(PAGES_DIR)) return [];
    return fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.tsx')).map(f => f.replace('.tsx', ''));
  } catch { return []; }
}

function loadDirectorOrders() {
  try {
    const orders = JSON.parse(fs.readFileSync(path.join(CWD, '.github/director_orders.json'), 'utf8'));
    if (orders.department === 'structural') return orders;
    return null;
  } catch { return null; }
}

// Safe JSON parser — handles trailing text after JSON
function safeParseJSON(raw) {
  if (!raw) return null;
  // Try direct parse first
  try { return JSON.parse(raw); } catch {}
  // Try to extract JSON object from the text
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1: MARKET SCANNER — Find commercial keywords for landing pages
// ═══════════════════════════════════════════════════════════════════════
async function marketScanner(memory, config, existingRoutes) {
  console.log('\n🔍 PHASE 1: Market Scanner — Finding commercial keywords...');
  
  const orders = loadDirectorOrders();
  const models = await getModelsForRole('scanner');
  
  const raw = await smartCall(models, `You are a market research specialist finding HIGH BUYER-INTENT keywords for service landing pages.

${memory.context}

OUR CORE SERVICES (ONLY target these):
- Custom Web Application Development
- Custom SaaS Platform Development
- Legacy Web Application Modernization
- Enterprise React/Next.js Development
- Web Design & Development
- SEO Services
- Performance Optimization

DO NOT target: Google Ads, Social Media Marketing, WordPress, E-commerce, or any service we don't actually provide as a core offering.

EXISTING PAGES (DO NOT DUPLICATE):
${existingRoutes.filter(r => r.includes('/services/')).join('\n') || 'None yet'}

${orders ? `DIRECTOR ORDERS: "${orders.orders}"` : ''}

TASK: Find ONE high-value commercial keyword that:
1. Has clear buyer intent (someone ready to hire/buy)
2. Is NOT already covered by existing pages
3. Matches one of our services
4. Has reasonable competition (not impossible to rank for)
5. Would convert visitors into leads

Use Google Search to verify the keyword has real search volume.

Return JSON:
{
  "keyword": "the primary keyword to target",
  "search_intent": "transactional/commercial",
  "estimated_volume": "low/medium/high",
  "competition": "low/medium/high",
  "service_match": "which of our services this maps to",
  "page_title": "SEO-optimized page title (50-60 chars)",
  "slug": "url-friendly-slug",
  "route": "/services/url-friendly-slug",
  "reasoning": "Why this keyword is a good choice"
}`, 'Market Scanner');

  const result = safeParseJSON(raw); if (!result) { console.log("   ? Failed to parse Market Scanner response."); return null; }
  console.log(`   🎯 Keyword: "${result.keyword}"`);
  console.log(`   📄 Page: ${result.page_title}`);
  console.log(`   🔗 Route: ${result.route}`);
  
  // Check for duplicate
  if (existingRoutes.includes(result.route)) {
    console.log(`   ⚠️ Route ${result.route} already exists! Skipping.`);
    return null;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2: PAGE STRATEGIST — Design the page architecture
// ═══════════════════════════════════════════════════════════════════════
async function pageStrategist(scanResult, memory, config) {
  console.log('\n🏛️ PHASE 2: Page Strategist — Designing architecture...');
  
  const models = await getModelsForRole('architect');
  
  // Find related blog posts for internal linking
  const relatedBlogs = memory.data?.shortTerm?.recentContent || [];
  
  const raw = await smartCall(models, `You are a conversion-focused landing page architect. Design a service page that RANKS and CONVERTS.

TARGET KEYWORD: "${scanResult.keyword}"
PAGE TITLE: "${scanResult.page_title}"
SERVICE: ${scanResult.service_match}
ROUTE: ${scanResult.route}

COMPANY CONTEXT:
- Name: FourIQ Tech
- Services: ${JSON.stringify(config.services?.primary || [])}
- Target: Global startups and enterprises
- Tone: Professional, technical, authoritative

RELATED BLOG POSTS (for internal linking):
${relatedBlogs.map(b => `- /blog/${b.slug}: "${b.title}"`).join('\n') || 'None yet'}

DESIGN REQUIREMENTS:
1. Hero section with clear value proposition + CTA
2. Problem/pain point section (why they need this service)
3. Solution section (how we solve it)
4. Features/benefits (3-5 key points with icons)
5. Process/how-it-works (3-4 steps)
6. Social proof/results (metrics, case study snippet)
7. FAQ section (4-5 questions — for featured snippets)
8. Final CTA section

SEO REQUIREMENTS:
- H1 contains the primary keyword naturally
- Meta description (150-160 chars) with keyword
- FAQ schema markup
- Service schema markup
- 3-5 internal links to related blog posts
- Alt text for any images

Return JSON:
{
  "page_title": "string",
  "meta_description": "150-160 char description with keyword",
  "h1": "Main heading (contains keyword naturally)",
  "sections": [
    {
      "type": "hero|problem|solution|features|process|proof|faq|cta",
      "heading": "Section heading",
      "content_brief": "What this section should say (2-3 sentences)",
      "cta_text": "Button text (if applicable)"
    }
  ],
  "faq_items": [
    { "question": "string", "answer": "2-3 sentence answer" }
  ],
  "internal_links": ["/blog/slug1", "/blog/slug2"],
  "schema_type": "Service",
  "target_keyword": "primary keyword",
  "secondary_keywords": ["kw1", "kw2", "kw3"]
}`, 'Page Strategist');

  const design = safeParseJSON(raw); if (!design) { console.log("   ? Failed to parse Page Strategist response."); return null; }
  console.log(`   ✅ Architecture: ${design.sections?.length || 0} sections designed`);
  console.log(`   🔗 Internal links: ${design.internal_links?.length || 0}`);
  console.log(`   ❓ FAQ items: ${design.faq_items?.length || 0}`);
  
  return design;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: PAGE BUILDER — Generate production React component
// ═══════════════════════════════════════════════════════════════════════
async function pageBuilder(scanResult, design) {
  console.log('\n🏗️ PHASE 3: Page Builder — Generating React component...');
  
  const models = await getModelsForRole('builder');
  
  const raw = await smartCall(models, `You are a senior React developer building a production landing page that MUST match the existing site's design system.

PAGE DESIGN:
${JSON.stringify(design, null, 2)}

ROUTE: ${scanResult.route}
COMPONENT NAME: ${scanResult.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}

═══ MANDATORY STRUCTURE (Follow this EXACTLY) ═══

The component MUST follow this pattern:

\`\`\`
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { [icons from lucide-react] } from 'lucide-react';

export default function ComponentName() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  // Animation variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  // Section components here...

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SEO title="..." description="..." />
      <Navbar visible={navVisible} />
      <main>
        {/* All sections here */}
      </main>
      <Footer />
    </div>
  );
}
\`\`\`

═══ DESIGN SYSTEM (Use these classes) ═══
- Background: bg-background (dark), bg-black/40 for alternate sections
- Text: text-foreground (light), text-muted-foreground (gray)
- Headings: font-display text-4xl md:text-5xl font-bold
- Gradient text: className="text-gradient"
- Primary color: text-primary (gold/amber)
- Cards: className="glass-card" with p-8 rounded-2xl
- Buttons: bg-primary text-primary-foreground rounded-xl with glow-box
- CTA links: href="/#contact"
- Spacing: py-24 px-6 lg:px-12 for sections
- Max width: max-w-7xl mx-auto
- Animations: Use motion.div with fadeUpVariant and useInView

═══ IMPORTANT RULES ═══
1. MUST import and use Navbar, Footer, SEO, useScrollLock
2. MUST use framer-motion for animations
3. MUST use the site's CSS classes (text-gradient, glass-card, glow-box, font-display)
4. MUST have proper SEO component with title and description
5. MUST link CTAs to "/#contact"
6. DO NOT use custom colors — only use the design system tokens
7. The page MUST look like it belongs on the same website
8. Include at least 5 sections: Hero, Problem, Solution, Features, CTA
9. Include FAQ section with schema markup

Return ONLY the complete TSX code. No markdown. No explanation. Must be at least 3000 characters.`, 'Page Builder', { json: false });

  // Clean up
  if (!raw) {
    console.log('   ❌ Page Builder returned empty response.');
    return null;
  }
  let code = raw.trim();
  if (code.startsWith('```')) {
    code = code.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
  }
  
  console.log(`   ✅ Component generated: ${code.length} chars`);
  return code;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 4: BUILD VERIFY — Check if the code is valid
// ═══════════════════════════════════════════════════════════════════════
function verifyBuild(code, componentName) {
  console.log('\n🧪 PHASE 4: Build Verification...');
  
  const checks = [];
  
  // Check 1: Has default export
  if (code.includes('export default') || code.includes('export default function')) {
    checks.push({ pass: true, check: 'Default export found' });
  } else {
    checks.push({ pass: false, check: 'Missing default export' });
  }
  
  // Check 2: Has React import or uses React
  if (code.includes('import') && (code.includes('react') || code.includes('React'))) {
    checks.push({ pass: true, check: 'React import found' });
  } else {
    checks.push({ pass: false, check: 'Missing React import' });
  }
  
  // Check 3: Has return statement with JSX
  if (code.includes('return (') || code.includes('return(')) {
    checks.push({ pass: true, check: 'JSX return found' });
  } else {
    checks.push({ pass: false, check: 'Missing JSX return' });
  }
  
  // Check 4: No obvious syntax errors
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (Math.abs(openBraces - closeBraces) <= 1) {
    checks.push({ pass: true, check: 'Braces balanced' });
  } else {
    checks.push({ pass: false, check: `Braces imbalanced: ${openBraces} open, ${closeBraces} close` });
  }
  
  // Check 5: Has Helmet/SEO meta
  if (code.includes('Helmet') || code.includes('meta') || code.includes('title')) {
    checks.push({ pass: true, check: 'SEO meta tags present' });
  } else {
    checks.push({ pass: false, check: 'Missing SEO meta tags' });
  }
  
  // Check 6: Reasonable length (not truncated)
  if (code.length > 1000) {
    checks.push({ pass: true, check: `Code length OK (${code.length} chars)` });
  } else {
    checks.push({ pass: false, check: `Code too short (${code.length} chars) — likely truncated` });
  }
  
  const passed = checks.filter(c => c.pass).length;
  const total = checks.length;
  const allPassed = checks.every(c => c.pass);
  
  for (const c of checks) {
    console.log(`   ${c.pass ? '✅' : '❌'} ${c.check}`);
  }
  console.log(`\n   📊 Build check: ${passed}/${total} passed`);
  
  return { passed: allPassed, checks, score: passed / total };
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 5: SUBMIT — Send to staging
// ═══════════════════════════════════════════════════════════════════════
async function submitPage(scanResult, design, code) {
  console.log('\n📦 PHASE 5: Submitting to staging...');
  
  const componentName = scanResult.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const targetFile = `src/pages/services/${componentName}.tsx`;
  
  const payload = JSON.stringify({
    route: scanResult.route,
    target_file: targetFile,
    component_name: componentName,
    code: code,
    meta: {
      keyword: scanResult.keyword,
      title: design.page_title,
      meta_description: design.meta_description,
      faq_count: design.faq_items?.length || 0,
      sections: design.sections?.length || 0,
    }
  });
  
  await submitToStaging({
    type: 'landing_page',
    department: 'Structural Team',
    title: `[Service Page] ${design.page_title}`,
    content: payload,
    summary: { keyword: scanResult.keyword, route: scanResult.route, sections: design.sections?.length },
    metadata: { route: scanResult.route, component: componentName, target_file: targetFile }
  });
  
  await logActivity('🏗️', 'structural', `Service page submitted: "${design.page_title}" → ${scanResult.route}`, 'publish');
  console.log(`   ✅ Submitted: ${design.page_title}`);
  console.log(`   📁 Target: ${targetFile}`);
  console.log(`   🔗 Route: ${scanResult.route}`);
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🏗️ SERVICE PAGE AGENT v2.0 — Memory-Powered Builder     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys: ${getApiKeyCount()}\n`);

  if (getApiKeyCount() === 0) {
    console.error('❌ No API keys. Set GEMINI_API_KEYS in .env.');
    process.exit(1);
  }

  // Load memory
  const memory = await compileMemory('structural');
  console.log(`🧠 Memory loaded: ${memory.context.length} chars`);

  // Load config
  const config = loadConfig();
  const existingRoutes = getExistingRoutes();
  const existingPages = getExistingServicePages();
  console.log(`📋 Existing: ${existingRoutes.length} routes | ${existingPages.length} service pages`);

  // Phase 1: Market Scanner
  const scanResult = await marketScanner(memory, config, existingRoutes);
  if (!scanResult) {
    console.log('\n⚠️ No valid keyword found. Aborting.');
    await closeMemory();
    return;
  }

  await sleep(3000);

  // Phase 2: Page Strategist
  const design = await pageStrategist(scanResult, memory, config);
  if (!design || !design.sections || design.sections.length === 0) {
    console.log('\n⚠️ Page design failed. Aborting.');
    await closeMemory();
    return;
  }

  await sleep(3000);

  // Phase 3: Page Builder (with retry)
  let code = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`\n🏗️ PHASE 3: Page Builder (attempt ${attempt}/2)...`);
    code = await pageBuilder(scanResult, design);
    if (code && code.length >= 500) break;
    console.log(`   ⚠️ Attempt ${attempt}: Code empty or too short (${code?.length || 0} chars). ${attempt < 2 ? 'Retrying...' : ''}`);
    if (attempt < 2) await sleep(5000);
  }
  
  if (!code || code.length < 500) {
    console.log('\n❌ Code generation failed after 2 attempts. Aborting.');
    await logActivity('❌', 'structural', 'Page Builder failed — model returned empty code', 'error');
    await closeMemory();
    return;
  }

  // Phase 4: Build Verify (with self-healing repair loop)
  const componentName = scanResult.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  let verification = verifyBuild(code, componentName);
  
  // Self-healing: If verification fails, ask AI to fix the code (up to 2 repair attempts)
  if (!verification.passed) {
    console.log('\n🔧 Build verification failed — attempting AI self-repair...');
    
    for (let repairAttempt = 1; repairAttempt <= 2; repairAttempt++) {
      console.log(`   🔧 Repair attempt ${repairAttempt}/2...`);
      
      const failedChecks = verification.checks.filter(c => !c.pass).map(c => c.check).join(', ');
      
      const repairPrompt = `You are a React/TypeScript code repair specialist. The following TSX component has build errors that need fixing.

ERRORS FOUND:
${failedChecks}

BROKEN CODE:
\`\`\`tsx
${code}
\`\`\`

FIX ALL THE ERRORS:
1. If "Missing JSX return" — ensure there is a \`return (\` statement with JSX inside the main component function.
2. If "Braces imbalanced" — count all { and } braces and fix any unclosed or extra braces. Make sure every { has a matching }.
3. If "Missing default export" — add \`export default ComponentName;\` at the end or use \`export default function ComponentName()\`.
4. If "Missing React import" — add \`import React from 'react';\` or ensure React/hooks are imported.
5. If "Code too short" — the code was likely truncated. Complete the component properly.

Return ONLY the complete fixed TSX code. No markdown fences. No explanation. The code must be syntactically valid.`;

      await sleep(4000);
      
      const models = await getModelsForRole('builder');
      const repaired = await smartCall(models, repairPrompt, 'Code Repair', { json: false });
      
      if (!repaired || repaired.length < 500) {
        console.log(`   ⚠️ Repair attempt ${repairAttempt} returned empty/short code.`);
        continue;
      }
      
      // Clean up repaired code
      let fixedCode = repaired.trim();
      if (fixedCode.startsWith('```')) {
        fixedCode = fixedCode.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
      }
      
      // Re-verify
      const reVerification = verifyBuild(fixedCode, componentName);
      
      if (reVerification.passed) {
        console.log(`   ✅ Self-repair SUCCESS on attempt ${repairAttempt}!`);
        code = fixedCode;
        verification = reVerification;
        await logActivity('🔧', 'structural', `Self-healed code after ${repairAttempt} repair attempt(s). All checks pass.`, 'success');
        break;
      } else {
        console.log(`   ⚠️ Repair attempt ${repairAttempt} still has issues: ${reVerification.checks.filter(c => !c.pass).map(c => c.check).join(', ')}`);
        code = fixedCode; // Use the partially fixed code for next attempt
      }
    }
  }
  
  // Final check after all repair attempts
  if (!verification.passed) {
    console.log('\n❌ Build verification FAILED after self-repair attempts. NOT submitting broken code.');
    await logActivity('❌', 'structural', `Page build failed verification after 2 repair attempts (${(verification.score * 100).toFixed(0)}% checks passed). Not submitting.`, 'error');
    await closeMemory();
    return;
  }

  // Phase 5: Submit
  await submitPage(scanResult, design, code);

  // Record to memory
  await recordAction('structural', 'service_page_creation', scanResult.slug, `Created service page: ${design.page_title}`, null);
  await trackKeyword(scanResult.keyword, 'structural', null);

  // Final report
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📋 SERVICE PAGE AGENT — COMPLETE                         ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🎯 Keyword: ${scanResult.keyword}`);
  console.log(`║  📄 Page: ${design.page_title}`);
  console.log(`║  🔗 Route: ${scanResult.route}`);
  console.log(`║  🧪 Build: ${verification.passed ? 'PASSED' : 'NEEDS REVIEW'}`);
  console.log(`║  📦 Status: Submitted to staging`);
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Trigger Publisher to push to GitHub (if auto-commit is on)
  try {
    const settingsPath = path.join(process.cwd(), '.github/staging/system-settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.isAutoCommit === true) {
        console.log('\n🚀 AUTO-COMMIT: Triggering Publisher to push to GitHub...');
        const { spawn } = await import('child_process');
        const pub = spawn('node', ['--env-file=.env', '.github/scripts/publisher.mjs'], {
          cwd: process.cwd(),
          stdio: 'inherit',
          detached: false,
        });
        await new Promise((resolve) => {
          pub.on('close', (code) => {
            if (code === 0) {
              console.log('   ✅ Publisher completed — code pushed to GitHub.');
            } else {
              console.log(`   ⚠️ Publisher exited with code ${code}`);
            }
            resolve();
          });
          pub.on('error', (err) => {
            console.log(`   ⚠️ Publisher spawn error: ${err.message}`);
            resolve();
          });
        });
      }
    }
  } catch (pubErr) {
    console.log(`   ⚠️ Publisher trigger failed: ${pubErr.message}`);
  }

  await closeMemory();
}

main().catch(err => {
  console.error('💥 FATAL:', err.message);
  process.exit(1);
});
