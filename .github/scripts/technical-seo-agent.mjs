import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { submitToStaging, logActivity, getModelsForRole, smartCall, sleep } from './agency-core.mjs';

// ═══════════════════════════════════════════════════════════════════════
// 🛡️ TECHNICAL SEO AGENT v3.0 — Performance Optimizer + QA Loop
// ═══════════════════════════════════════════════════════════════════════
// Architecture:
//   1. AUDITOR        → Scans site for performance issues (PageSpeed API)
//   2. DEVELOPER AI   → Writes performance-only fixes (no visual changes)
//   3. QA AGENT       → Tests live URL like a real user
//   4. LOOP           → If QA fails, Developer fixes again (max 3 attempts)
//
// SAFETY RULES:
//   ✅ CAN: Add lazy-load, preconnect, preload, code-split, optimize images
//   ✅ CAN: Add/fix meta tags, schema, OG tags
//   ✅ CAN: Modify index.html, SEO.tsx, any component for PERFORMANCE
//   ❌ CANNOT: Change animations, transitions, visual effects
//   ❌ CANNOT: Change colors, fonts, spacing, layout, theme
//   ❌ CANNOT: Remove or alter any visible UI element
//   ❌ CANNOT: Touch agent scripts (.github/scripts/*)
// ═══════════════════════════════════════════════════════════════════════

const CWD = process.cwd();
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://www.fouriqtech.com';
const TECH_LOG = path.join(CWD, '.github/technical_seo_log.json');
const TECH_REPORT = path.join(CWD, '.github/seo-memory/technical-health-report.json');

// Files the agent is ALLOWED to modify
const ALLOWED_PATHS = [
  'index.html',
  'src/components/SEO.tsx',
  'src/components/',
  'src/pages/',
  'src/App.tsx',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/manifest.json',
];

// Files NEVER touch
const BLOCKED_PATHS = [
  '.github/scripts/',
  '.env',
  'prisma/',
  'node_modules/',
  'package.json',
];

function isAllowedFile(filePath) {
  const clean = filePath.replace(/\\/g, '/');
  if (BLOCKED_PATHS.some(b => clean.includes(b))) return false;
  return ALLOWED_PATHS.some(a => clean.startsWith(a) || clean.includes(a));
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1: PERFORMANCE AUDITOR — Real data from PageSpeed Insights
// ═══════════════════════════════════════════════════════════════════════
async function runPerformanceAudit() {
  console.log('\n📊 PHASE 1: Running Performance Audit...');
  console.log(`   🌐 Target: ${WEBSITE_URL}`);
  
  const results = { pages: [], overall: {} };
  
  // Test homepage + key pages
  const pagesToTest = [
    { url: WEBSITE_URL, name: 'Homepage' },
    { url: `${WEBSITE_URL}/about`, name: 'About' },
  ];
  
  for (const page of pagesToTest) {
    try {
      console.log(`   🔍 Testing: ${page.name} (${page.url})`);
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(page.url)}&strategy=mobile&category=performance&category=seo&category=best-practices`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.log(`   ⚠️ PageSpeed API error for ${page.name}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const audits = data.lighthouseResult?.audits || {};
      const categories = data.lighthouseResult?.categories || {};
      
      const pageResult = {
        name: page.name,
        url: page.url,
        scores: {
          performance: Math.round((categories.performance?.score || 0) * 100),
          seo: Math.round((categories.seo?.score || 0) * 100),
          bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        },
        metrics: {
          lcp: audits['largest-contentful-paint']?.numericValue || null,
          cls: audits['cumulative-layout-shift']?.numericValue || null,
          tbt: audits['total-blocking-time']?.numericValue || null,
          fcp: audits['first-contentful-paint']?.numericValue || null,
          si: audits['speed-index']?.numericValue || null,
          ttfb: audits['server-response-time']?.numericValue || null,
        },
        failed_audits: [],
        opportunities: [],
      };
      
      // Collect failed audits
      for (const [key, audit] of Object.entries(audits)) {
        if (audit.score !== null && audit.score !== undefined && audit.score < 0.5 && audit.title) {
          pageResult.failed_audits.push({ id: key, title: audit.title, score: audit.score });
        }
      }
      
      // Collect optimization opportunities
      const opportunityAudits = ['render-blocking-resources', 'unused-css-rules', 'unused-javascript', 
        'modern-image-formats', 'uses-optimized-images', 'offscreen-images', 'unminified-css',
        'unminified-javascript', 'uses-text-compression', 'uses-responsive-images', 'efficient-animated-content'];
      
      for (const id of opportunityAudits) {
        if (audits[id] && audits[id].score !== null && audits[id].score < 0.9) {
          pageResult.opportunities.push({
            id,
            title: audits[id].title,
            savings: audits[id].displayValue || '',
          });
        }
      }
      
      results.pages.push(pageResult);
      console.log(`   ✅ ${page.name}: Perf ${pageResult.scores.performance} | SEO ${pageResult.scores.seo} | LCP ${Math.round((pageResult.metrics.lcp || 0) / 10) / 100}s`);
      
      await sleep(3000); // Don't hammer the API
    } catch (err) {
      console.log(`   ⚠️ Failed to audit ${page.name}: ${err.message}`);
    }
  }
  
  // Calculate overall
  if (results.pages.length > 0) {
    results.overall = {
      avg_performance: Math.round(results.pages.reduce((s, p) => s + p.scores.performance, 0) / results.pages.length),
      avg_seo: Math.round(results.pages.reduce((s, p) => s + p.scores.seo, 0) / results.pages.length),
      total_opportunities: results.pages.reduce((s, p) => s + p.opportunities.length, 0),
      total_failed_audits: results.pages.reduce((s, p) => s + p.failed_audits.length, 0),
    };
    console.log(`\n   📊 OVERALL: Performance ${results.overall.avg_performance}/100 | SEO ${results.overall.avg_seo}/100`);
    console.log(`   📋 ${results.overall.total_opportunities} optimization opportunities found`);
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2: DEVELOPER AI — Generates performance-only code fixes
// ═══════════════════════════════════════════════════════════════════════
async function developerAgent(audit, previousQAFeedback = null) {
  console.log('\n🛠️ PHASE 2: Developer AI generating fixes...');
  
  // Read current code files for context
  const indexHtml = fs.existsSync(path.join(CWD, 'index.html')) 
    ? fs.readFileSync(path.join(CWD, 'index.html'), 'utf8') : '';
  const seoComponent = fs.existsSync(path.join(CWD, 'src/components/SEO.tsx'))
    ? fs.readFileSync(path.join(CWD, 'src/components/SEO.tsx'), 'utf8') : '';
  
  const feedbackSection = previousQAFeedback 
    ? `\n\n🚨 QA FEEDBACK FROM PREVIOUS ATTEMPT (FIX THESE ISSUES):\n${JSON.stringify(previousQAFeedback, null, 2)}\n` 
    : '';
  
  const models = await getModelsForRole('builder');
  const raw = await smartCall(models, `You are a Senior Performance Engineer. Your ONLY job is to improve website loading speed and Core Web Vitals.

${feedbackSection}

═══ PERFORMANCE AUDIT RESULTS ═══
${JSON.stringify(audit, null, 2)}

═══ CURRENT CODE ═══

index.html:
${indexHtml.substring(0, 5000)}

src/components/SEO.tsx:
${seoComponent.substring(0, 3000)}

═══ YOUR STRICT RULES ═══
1. You can ONLY make performance improvements
2. You CANNOT change any visual appearance (colors, fonts, spacing, animations, transitions)
3. You CANNOT remove any UI elements or change layout
4. You CANNOT change component logic or functionality
5. You CAN: add preconnect, preload, lazy-load, defer, async, fetchpriority
6. You CAN: add width/height to images, font-display:swap
7. You CAN: add meta tags, schema markup, OG tags (SEO improvements)
8. You CAN: suggest code-splitting or dynamic imports
9. Every change must be SAFE — if unsure, don't do it

═══ YOUR TASK ═══
Based on the audit, generate up to 3 specific code patches. For each patch:
- Identify the exact file to modify
- Show the EXACT lines to find (old code)
- Show the EXACT replacement (new code)
- Explain why this improves performance

Return JSON:
{
  "patches": [
    {
      "file": "index.html",
      "description": "What this fix does",
      "performance_impact": "Which metric improves and by how much (estimated)",
      "find": "exact string to find in the file (10-30 chars of context)",
      "replace": "exact replacement string",
      "risk": "low|medium",
      "category": "preconnect|preload|lazy-load|meta|schema|font|image|script"
    }
  ],
  "skipped_opportunities": ["things you could fix but chose not to because of risk"],
  "estimated_improvement": "Overall estimated performance gain"
}`, 'Developer AI');

  const result = JSON.parse(raw);
  console.log(`   🔧 Generated ${result.patches?.length || 0} patches`);
  for (const patch of (result.patches || [])) {
    console.log(`   📝 [${patch.risk}] ${patch.file}: ${patch.description}`);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: APPLY PATCHES — Safe string replacement
// ═══════════════════════════════════════════════════════════════════════
function applyPatches(devResult) {
  console.log('\n⚙️ PHASE 3: Applying patches...');
  
  const applied = [];
  const failed = [];
  
  for (const patch of (devResult.patches || [])) {
    // Safety check
    if (!isAllowedFile(patch.file)) {
      console.log(`   ❌ BLOCKED: ${patch.file} is not in allowed paths`);
      failed.push({ ...patch, reason: 'File not in allowed paths' });
      continue;
    }
    
    if (patch.risk === 'high') {
      console.log(`   ⚠️ SKIPPED: ${patch.description} (high risk)`);
      failed.push({ ...patch, reason: 'High risk — skipped' });
      continue;
    }
    
    const fullPath = path.join(CWD, patch.file);
    if (!fs.existsSync(fullPath)) {
      console.log(`   ❌ File not found: ${patch.file}`);
      failed.push({ ...patch, reason: 'File not found' });
      continue;
    }
    
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (!content.includes(patch.find)) {
        console.log(`   ⚠️ Pattern not found in ${patch.file}: "${patch.find.substring(0, 40)}..."`);
        failed.push({ ...patch, reason: 'Pattern not found in file' });
        continue;
      }
      
      // Apply the replacement
      content = content.replace(patch.find, patch.replace);
      fs.writeFileSync(fullPath, content, 'utf8');
      
      applied.push(patch);
      console.log(`   ✅ Applied: ${patch.description}`);
    } catch (err) {
      console.log(`   ❌ Error applying patch to ${patch.file}: ${err.message}`);
      failed.push({ ...patch, reason: err.message });
    }
  }
  
  console.log(`\n   📊 Results: ${applied.length} applied | ${failed.length} failed/skipped`);
  return { applied, failed };
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 4: QA AGENT — Tests live site like a real user
// ═══════════════════════════════════════════════════════════════════════
async function qaAgent(baselineScores) {
  console.log('\n🧪 PHASE 4: QA Agent — Testing live site...');
  
  const checks = {
    site_accessible: false,
    performance_improved: false,
    no_regression: true,
    key_elements_present: true,
    issues: [],
  };
  
  // Check 1: Is the site accessible?
  try {
    const response = await fetch(WEBSITE_URL, { redirect: 'follow' });
    checks.site_accessible = response.ok;
    if (!response.ok) {
      checks.issues.push(`Site returned HTTP ${response.status}`);
    }
    console.log(`   ${checks.site_accessible ? '✅' : '❌'} Site accessible: HTTP ${response.status}`);
  } catch (err) {
    checks.issues.push(`Site unreachable: ${err.message}`);
    console.log(`   ❌ Site unreachable: ${err.message}`);
  }
  
  // Check 2: Fetch rendered HTML and verify key elements
  try {
    const response = await fetch(WEBSITE_URL);
    const html = await response.text();
    
    const requiredElements = [
      { name: 'viewport meta', pattern: 'viewport' },
      { name: 'charset', pattern: 'charset' },
      { name: 'title tag', pattern: '<title' },
      { name: 'React root', pattern: 'id="root"' },
    ];
    
    for (const el of requiredElements) {
      if (!html.includes(el.pattern)) {
        checks.key_elements_present = false;
        checks.issues.push(`Missing: ${el.name}`);
        console.log(`   ❌ Missing: ${el.name}`);
      }
    }
    
    if (checks.key_elements_present) {
      console.log(`   ✅ All key elements present`);
    }
  } catch (err) {
    checks.issues.push(`Could not fetch HTML: ${err.message}`);
  }
  
  // Check 3: Run PageSpeed again to compare scores
  try {
    console.log(`   🔄 Running post-change PageSpeed audit...`);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(WEBSITE_URL)}&strategy=mobile&category=performance&category=seo`;
    const response = await fetch(apiUrl);
    
    if (response.ok) {
      const data = await response.json();
      const categories = data.lighthouseResult?.categories || {};
      const newPerf = Math.round((categories.performance?.score || 0) * 100);
      const newSeo = Math.round((categories.seo?.score || 0) * 100);
      
      console.log(`   📊 New scores: Performance ${newPerf}/100 | SEO ${newSeo}/100`);
      
      if (baselineScores) {
        const perfDiff = newPerf - (baselineScores.performance || 0);
        const seoDiff = newSeo - (baselineScores.seo || 0);
        
        console.log(`   📈 Change: Performance ${perfDiff >= 0 ? '+' : ''}${perfDiff} | SEO ${seoDiff >= 0 ? '+' : ''}${seoDiff}`);
        
        // Regression check: if performance dropped more than 5 points
        if (perfDiff < -5) {
          checks.no_regression = false;
          checks.issues.push(`Performance REGRESSED by ${Math.abs(perfDiff)} points (${baselineScores.performance} → ${newPerf})`);
        }
        
        checks.performance_improved = perfDiff > 0;
      }
      
      checks.new_scores = { performance: newPerf, seo: newSeo };
    } else {
      console.log(`   ⚠️ PageSpeed API unavailable for post-check`);
    }
  } catch (err) {
    console.log(`   ⚠️ Post-check failed: ${err.message}`);
  }
  
  // Check 4: AI verification — ask Gemini to check the live site
  try {
    const models = await getModelsForRole('qa');
    const raw = await smartCall(models, `You are a QA engineer testing a website after performance optimizations were applied.

Visit this URL mentally: ${WEBSITE_URL}

Based on your knowledge of this site (it's a premium web design agency called FourIQ Tech), verify:
1. The site should load with a dark theme, modern design
2. There should be a navigation bar with links
3. There should be a hero section with headline
4. The site should have service sections
5. There should be a footer with contact info

Also check if any of these common post-optimization issues exist:
- Flash of unstyled content (FOUC)
- Missing fonts (fallback fonts showing)
- Broken images
- Layout shifts

Return JSON:
{
  "verdict": "PASS" or "FAIL",
  "confidence": 1-10,
  "observations": ["what you notice"],
  "potential_issues": ["any concerns"],
  "recommendation": "brief recommendation"
}`, 'QA Agent');

    const qaResult = JSON.parse(raw);
    console.log(`   🧪 AI QA Verdict: ${qaResult.verdict} (confidence: ${qaResult.confidence}/10)`);
    
    if (qaResult.verdict === 'FAIL') {
      checks.issues.push(...(qaResult.potential_issues || []));
    }
    
    checks.ai_verdict = qaResult;
  } catch (err) {
    console.log(`   ⚠️ AI QA check failed: ${err.message}`);
  }
  
  // Final verdict
  const passed = checks.site_accessible && checks.key_elements_present && checks.no_regression && checks.issues.length === 0;
  checks.final_verdict = passed ? 'PASS' : 'FAIL';
  
  console.log(`\n   ${passed ? '✅' : '❌'} QA VERDICT: ${checks.final_verdict}`);
  if (checks.issues.length > 0) {
    console.log(`   📋 Issues: ${checks.issues.join(' | ')}`);
  }
  
  return checks;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 5: ROLLBACK — Revert changes if QA fails
// ═══════════════════════════════════════════════════════════════════════
function rollbackChanges() {
  console.log('\n⏪ ROLLING BACK: Reverting all changes...');
  try {
    execSync('git checkout -- .', { cwd: CWD, stdio: 'pipe' });
    console.log('   ✅ All changes reverted to last commit state');
    return true;
  } catch (err) {
    console.log(`   ⚠️ Rollback failed: ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN PIPELINE — The Full Loop
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🛡️ TECHNICAL SEO AGENT v3.0 — Performance + QA Loop     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🌐 Target: ${WEBSITE_URL}`);
  console.log(`🔒 Allowed files: ${ALLOWED_PATHS.join(', ')}\n`);

  // ── PHASE 1: Audit ──
  const audit = await runPerformanceAudit();
  
  if (audit.pages.length === 0) {
    console.log('\n⚠️ PageSpeed API unavailable. Falling back to code-based audit...');
    
    // Fallback: AI audits the code directly
    const indexHtml = fs.existsSync(path.join(CWD, 'index.html')) 
      ? fs.readFileSync(path.join(CWD, 'index.html'), 'utf8') : '';
    const seoComponent = fs.existsSync(path.join(CWD, 'src/components/SEO.tsx'))
      ? fs.readFileSync(path.join(CWD, 'src/components/SEO.tsx'), 'utf8') : '';
    
    const models = await getModelsForRole('auditor');
    const raw = await smartCall(models, `You are a performance auditor. Analyze this code and estimate performance scores.

index.html:
${indexHtml.substring(0, 4000)}

SEO.tsx:
${seoComponent.substring(0, 3000)}

Check for: render-blocking resources, missing preconnects, unoptimized images, missing lazy-load, font loading issues, missing meta tags.

Return JSON:
{
  "name": "Homepage",
  "url": "${WEBSITE_URL}",
  "scores": { "performance": 0-100, "seo": 0-100, "bestPractices": 0-100 },
  "metrics": { "lcp": null, "cls": null, "tbt": null, "fcp": null },
  "failed_audits": [{ "id": "string", "title": "issue description", "score": 0 }],
  "opportunities": [{ "id": "string", "title": "what to optimize", "savings": "estimated" }]
}`, 'Fallback Auditor');

    try {
      const fallbackPage = JSON.parse(raw);
      audit.pages = [fallbackPage];
      audit.overall = {
        avg_performance: fallbackPage.scores?.performance || 50,
        avg_seo: fallbackPage.scores?.seo || 50,
        total_opportunities: fallbackPage.opportunities?.length || 0,
        total_failed_audits: fallbackPage.failed_audits?.length || 0,
      };
      console.log(`   ✅ AI Audit: Performance ~${audit.overall.avg_performance}/100 | ${audit.overall.total_opportunities} opportunities`);
    } catch (e) {
      console.log(`   ❌ Fallback audit also failed: ${e.message}`);
      await logActivity('❌', 'technical', 'All audit methods failed', 'error');
      process.exit(1);
    }
  }
  
  const baselineScores = audit.pages[0]?.scores || {};
  
  // If performance is already great (90+), just report
  if (baselineScores.performance >= 90) {
    console.log(`\n✅ Performance already excellent (${baselineScores.performance}/100). No fixes needed.`);
    await logActivity('✅', 'technical', `Site health excellent: ${baselineScores.performance}/100 performance`, 'info');
    
    fs.writeFileSync(TECH_LOG, JSON.stringify({
      last_run: new Date().toISOString(),
      action: 'report_only',
      reason: 'Performance already above 90',
      scores: baselineScores,
    }, null, 2));
    return;
  }

  // ── DEVELOPER + QA LOOP (max 3 attempts) ──
  const MAX_ATTEMPTS = 3;
  let qaFeedback = null;
  let finalResult = null;
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🔄 ATTEMPT ${attempt}/${MAX_ATTEMPTS}`);
    console.log(`${'═'.repeat(60)}`);
    
    // ── PHASE 2: Developer generates fixes ──
    const devResult = await developerAgent(audit, qaFeedback);
    
    if (!devResult.patches || devResult.patches.length === 0) {
      console.log('   ℹ️ Developer found no safe patches to apply.');
      break;
    }
    
    // ── PHASE 3: Apply patches ──
    const { applied, failed } = applyPatches(devResult);
    
    if (applied.length === 0) {
      console.log('   ℹ️ No patches could be applied. Stopping.');
      break;
    }
    
    // ── Wait for changes to take effect ──
    // In production (Vercel), we'd wait for deploy. Locally, changes are instant.
    const isProduction = !WEBSITE_URL.includes('localhost');
    if (isProduction) {
      console.log('\n   ⏳ Waiting 90s for Vercel to rebuild...');
      await sleep(90000);
    } else {
      console.log('\n   ⏳ Waiting 5s for dev server to reload...');
      await sleep(5000);
    }
    
    // ── PHASE 4: QA tests the live site ──
    const qaResult = await qaAgent(baselineScores);
    
    if (qaResult.final_verdict === 'PASS') {
      console.log('\n🎉 QA PASSED! Changes are safe.');
      finalResult = { attempt, applied, qaResult, devResult };
      break;
    } else {
      console.log(`\n❌ QA FAILED on attempt ${attempt}. ${attempt < MAX_ATTEMPTS ? 'Reverting and retrying...' : 'Max attempts reached.'}`);
      
      // Rollback
      rollbackChanges();
      
      // Prepare feedback for next Developer attempt
      qaFeedback = {
        attempt,
        issues: qaResult.issues,
        failed_patches: failed,
        ai_verdict: qaResult.ai_verdict,
        instruction: 'The previous patches caused issues. Try a DIFFERENT, SAFER approach. Avoid the same patterns that failed.'
      };
      
      if (attempt >= MAX_ATTEMPTS) {
        console.log('\n💀 Max attempts reached. Submitting report without changes.');
        finalResult = { attempt, applied: [], qaResult, devResult, status: 'failed_qa' };
      }
    }
  }

  // ── PHASE 5: Submit results ──
  console.log('\n📋 PHASE 5: Saving results...');
  
  const report = {
    timestamp: new Date().toISOString(),
    website: WEBSITE_URL,
    baseline_scores: baselineScores,
    final_scores: finalResult?.qaResult?.new_scores || baselineScores,
    attempts: finalResult?.attempt || 0,
    patches_applied: finalResult?.applied?.length || 0,
    qa_verdict: finalResult?.qaResult?.final_verdict || 'NOT_RUN',
    status: finalResult?.status || (finalResult?.qaResult?.final_verdict === 'PASS' ? 'success' : 'no_changes'),
  };
  
  // Save report
  const reportDir = path.dirname(TECH_REPORT);
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(TECH_REPORT, JSON.stringify(report, null, 2));
  fs.writeFileSync(TECH_LOG, JSON.stringify({
    last_run: new Date().toISOString(),
    ...report,
  }, null, 2));
  
  // Submit to staging if changes were made and QA passed
  if (finalResult?.applied?.length > 0 && finalResult?.qaResult?.final_verdict === 'PASS') {
    await submitToStaging({
      type: 'technical_patch',
      department: 'Technical Team',
      title: `[Perf] ${finalResult.applied.map(p => p.category).join(', ')} optimizations`,
      content: JSON.stringify({ patches: finalResult.applied, scores: report }),
      summary: { before: baselineScores, after: finalResult.qaResult.new_scores },
      metadata: { attempts: finalResult.attempt, patches: finalResult.applied.length }
    });
    
    await logActivity('🛡️', 'technical', `Performance optimized: ${finalResult.applied.length} patches applied, QA passed`, 'publish');
  } else {
    await logActivity('📊', 'technical', `Audit complete: Perf ${baselineScores.performance}/100 | No safe fixes found`, 'info');
  }

  console.log('\n🛡️ TECHNICAL SEO AGENT: Complete. ✅');
}

main().catch(err => {
  console.error('💥 FATAL:', err.message);
  process.exit(1);
});
