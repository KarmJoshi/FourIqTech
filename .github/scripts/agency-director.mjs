import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import { buildOpportunitySnapshot } from './seo-opportunity-engine.mjs';
import { recordDirectorAction, buildPlaybookScores } from './seo-learning-engine.mjs';

// ═══════════════════════════════════════════════════════════════════════
// 👔 FOURIQTECH AGENCY DIRECTOR — "The 20-Year Expert" v1.0
// ═══════════════════════════════════════════════════════════════════════
// The top-level Strategic Brain that sits above all 3 departments:
//   ✍️ CONTENT TEAM     → seo-auto-poster.mjs  (Writes blog posts)
//   🏗️ STRUCTURAL TEAM  → seo-dev-agent.mjs    (Builds landing pages)
//   🛡️ TECHNICAL TEAM   → technical-seo-agent.mjs (Site health & speed)
//
// Architecture:
//   📊 SITREP           → Gathers intelligence from all department logs
//   🧠 STRATEGIC BRAIN  → Gemini 3.1 Pro makes the call (billed key)
//   🎲 QUALITY AUDIT    → Random "surprise inspection" of recent work
//   ⚡ DISPATCH          → Executes the chosen department
//   📋 JOURNAL          → Logs every decision for accountability
//   💬 CHAT MODE        → Talk to the Director via --chat flag
// ═══════════════════════════════════════════════════════════════════════

// ── Paths ──
const PUBLISH_LOG      = path.join(process.cwd(), '.github/publish_log.json');
const TECH_LOG         = path.join(process.cwd(), '.github/technical_seo_log.json');
const GSC_REPORT       = path.join(process.cwd(), '.github/gsc-reports/latest.json');
const BLOG_DATA        = path.join(process.cwd(), 'src/data/blogPosts.ts');
const APP_TSX          = path.join(process.cwd(), 'src/App.tsx');
const CONFIG_PATH      = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const DIRECTOR_JOURNAL = path.join(process.cwd(), '.github/director_journal.json');
const OPPORTUNITY_SNAPSHOT = path.join(process.cwd(), '.github/seo-memory/latest-opportunities.json');

// ── Department Scripts ──
const DEPARTMENTS = {
  content:    '.github/scripts/seo-auto-poster.mjs',
  structural: '.github/scripts/seo-dev-agent.mjs',
  technical:  '.github/scripts/technical-seo-agent.mjs',
};

// ── API Setup (Separate billed key for Director) ──
const PRO_KEY = process.env.GEMINI_PRO_API_KEY || '';
const FREE_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

// Director uses Pro key; falls back to free keys if not set
const directorKey = PRO_KEY || FREE_KEYS[0] || '';
if (!directorKey) {
  console.error('💥 FATAL: No API keys found. Set GEMINI_PRO_API_KEY or GEMINI_API_KEYS in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: directorKey });

// Director model hierarchy — prefers Pro, falls back gracefully
const DIRECTOR_MODELS = [
  'gemini-3.1-pro-preview', 
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

// ═══════════════════════════════════════════════════════════════════════
// 🔧 UTILITIES
// ═══════════════════════════════════════════════════════════════════════

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function loadJournal() {
  try { return JSON.parse(fs.readFileSync(DIRECTOR_JOURNAL, 'utf8')); }
  catch { return { entries: [], total_cycles: 0 }; }
}

function saveJournal(journal) {
  fs.writeFileSync(DIRECTOR_JOURNAL, JSON.stringify(journal, null, 2));
}

async function directorCall(prompt, jsonMode = true) {
  for (const model of DIRECTOR_MODELS) {
    try {
      console.log(`   🧠 [Director] Thinking with ${model}...`);
      const config = jsonMode ? { responseMimeType: "application/json" } : {};
      const resp = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
      return resp.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error(`   ⚠️ Model ${model} failed: ${err.message?.substring(0, 80)}. Falling back...`);
    }
  }
  throw new Error('All Director models exhausted.');
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 PHASE 1: SITUATION REPORT (SitRep)
// ═══════════════════════════════════════════════════════════════════════

function gatherSitRep() {
  console.log('\n📊 PHASE 1: Gathering Situation Report...');
  const sitrep = {};

  // Content Team Status
  const publishLog = readJsonSafe(PUBLISH_LOG);
  if (publishLog) {
    const entries = Array.isArray(publishLog) ? publishLog : (publishLog.entries || []);
    sitrep.content_team = {
      total_published: entries.length,
      last_3: entries.slice(-3).map(e => ({
        title: e.title || e.slug,
        date: e.published_at || e.date,
        qa_score: e.qa_score || 'N/A',
      })),
    };
    console.log(`   ✍️  Content Team: ${entries.length} articles published`);
  } else {
    sitrep.content_team = { total_published: 0, last_3: [] };
    console.log('   ✍️  Content Team: No publish log found');
  }

  // Blog count from source
  try {
    const blogData = fs.readFileSync(BLOG_DATA, 'utf8');
    const slugs = [...blogData.matchAll(/slug:\s*'([^']+)'/g)];
    sitrep.total_blog_posts = slugs.length;
    console.log(`   📰 Total blog posts in codebase: ${slugs.length}`);
  } catch {
    sitrep.total_blog_posts = 0;
  }

  // Structural Team Status (service pages from App.tsx)
  try {
    const appCode = fs.readFileSync(APP_TSX, 'utf8');
    const serviceRoutes = [...appCode.matchAll(/path="\/services\/([^"]+)"/g)].map(m => m[1]);
    sitrep.structural_team = {
      deployed_service_pages: serviceRoutes.length,
      routes: serviceRoutes,
    };
    console.log(`   🏗️  Structural Team: ${serviceRoutes.length} service pages deployed`);
  } catch {
    sitrep.structural_team = { deployed_service_pages: 0, routes: [] };
  }

  // Technical Team Status
  const techLog = readJsonSafe(TECH_LOG);
  if (techLog) {
    sitrep.technical_team = {
      last_run: techLog.last_run,
      fixes_applied: techLog.applied_fixes?.length || 0,
    };
    console.log(`   🛡️  Technical Team: Last ran ${techLog.last_run || 'never'}`);
  } else {
    sitrep.technical_team = { last_run: 'never', fixes_applied: 0 };
    console.log('   🛡️  Technical Team: No log found');
  }

  // GSC Rankings (if available)
  const gscReport = readJsonSafe(GSC_REPORT);
  if (gscReport?.summary) {
    sitrep.gsc = {
      total_clicks: gscReport.summary.total_clicks,
      total_impressions: gscReport.summary.total_impressions,
      avg_position: gscReport.summary.avg_position,
      pages_on_page_1: gscReport.summary.pages_on_page_1,
    };
    console.log(`   📈 GSC: ${gscReport.summary.total_clicks} clicks | Avg Position: ${gscReport.summary.avg_position}`);
  } else {
    sitrep.gsc = null;
    console.log('   📈 GSC: No report available');
  }

  try {
    const opportunitySnapshot = buildOpportunitySnapshot();
    const playbookScores = buildPlaybookScores();
    sitrep.opportunity_engine = {
      recommended_department: opportunitySnapshot.recommended_department,
      recommended_orders: opportunitySnapshot.recommended_orders,
      top_opportunities: opportunitySnapshot.top_opportunities.slice(0, 5),
      department_scores: opportunitySnapshot.departments.map((item) => ({
        department: item.department,
        adjusted_score: item.adjusted_score,
        recent_success_rate: item.recent_success_rate,
        playbook_average_success: item.playbook_average_success,
      })),
      best_playbooks: playbookScores.slice(0, 5),
    };
    console.log(`   🧠 Opportunity Engine: ${opportunitySnapshot.recommended_department.toUpperCase()} leads this cycle`);
  } catch (e) {
    sitrep.opportunity_engine = null;
    console.log(`   ⚠️ Opportunity Engine unavailable: ${e.message}`);
  }

  // Journal history
  const journal = loadJournal();
  sitrep.previous_decisions = journal.entries.slice(-5).map(e => ({
    date: e.date,
    decision: e.decision,
    department: e.department,
  }));
  sitrep.total_director_cycles = journal.total_cycles;

  return sitrep;
}

// ═══════════════════════════════════════════════════════════════════════
// 🧠 PHASE 2: STRATEGIC DECISION
// ═══════════════════════════════════════════════════════════════════════

async function makeStrategicDecision(sitrep) {
  console.log('\n🧠 PHASE 2: Making Strategic Decision...');

  const recommendedDepartment = sitrep.opportunity_engine?.recommended_department || 'content';
  const recommendedOrders = sitrep.opportunity_engine?.recommended_orders || [];

  const raw = await directorCall(`You are the Agency Director of FouriqTech — a 20-year veteran SEO strategist who has built and scaled agencies from $0 to $10M ARR. You are brutally honest, data-driven, and have zero tolerance for mediocre work.

You manage 3 autonomous departments:
1. **Content Team** (seo-auto-poster.mjs): Writes deep-dive blog posts to build authority
2. **Structural Team** (seo-dev-agent.mjs): Builds high-conversion React landing pages autonomously
3. **Technical Team** (technical-seo-agent.mjs): Audits site speed, Core Web Vitals, meta tags

═══ CURRENT AGENCY STATUS ═══
${JSON.stringify(sitrep, null, 2)}

═══ SCORED RECOMMENDATION FROM OPPORTUNITY ENGINE ═══
- Recommended department: ${recommendedDepartment}
- Recommended orders:
${recommendedOrders.map((order, index) => `${index + 1}. ${order}`).join('\n') || '1. No scored opportunities found'}

═══ YOUR TASK ═══
Based on the current situation, decide. Treat the scored recommendation as the default unless you have a strong, explicit reason to override it:
1. Which ONE department should run next? (content, structural, or technical)
2. Should you run a quality audit on recent content? (true/false — do this randomly ~30% of the time, or if you suspect quality issues)
3. Any cross-department orders? (e.g., "Content team should write articles linking to the new service page")
4. Your strategic reasoning as a 20-year expert

Return a JSON object:
{
  "department": "content" | "structural" | "technical",
  "run_quality_audit": true | false,
  "cross_department_orders": "string or null",
  "reasoning": "Your expert strategic reasoning",
  "confidence": 1-10,
  "agency_health_score": 1-10
}`);

  try {
    const decision = JSON.parse(raw);
    console.log(`   🎯 Decision: Deploy → ${decision.department?.toUpperCase()} TEAM`);
    console.log(`   📋 Reasoning: ${decision.reasoning?.substring(0, 120)}...`);
    console.log(`   💪 Confidence: ${decision.confidence}/10 | Agency Health: ${decision.agency_health_score}/10`);
    if (decision.cross_department_orders) {
      console.log(`   📢 Cross-Dept Order: ${decision.cross_department_orders}`);
    }
    return decision;
  } catch (e) {
    console.error(`   ⚠️ Failed to parse decision, defaulting to Content Team.`);
    return { department: 'content', run_quality_audit: false, reasoning: 'Fallback', confidence: 3, agency_health_score: 5 };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🎲 PHASE 3: QUALITY AUDIT (Surprise Inspection)
// ═══════════════════════════════════════════════════════════════════════

async function runQualityAudit() {
  console.log('\n🎲 PHASE 3: Running Quality Audit (Surprise Inspection)...');

  // Pick a random recent blog post
  let blogContent = '';
  let blogTitle = '';
  try {
    const blogData = fs.readFileSync(BLOG_DATA, 'utf8');
    const titles = [...blogData.matchAll(/title:\s*'([^']+)'/g)].map(m => m[1]);
    const slugs = [...blogData.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

    if (titles.length === 0) {
      console.log('   ⚠️ No blog posts to audit.');
      return null;
    }

    // Pick from the last 10 posts (most recent)
    const recentCount = Math.min(10, titles.length);
    const randomIdx = Math.floor(Math.random() * recentCount);
    blogTitle = titles[randomIdx];
    const blogSlug = slugs[randomIdx];

    // Extract the content for that post
    const contentMatch = blogData.match(new RegExp(`slug:\\s*'${blogSlug}'[\\s\\S]*?content:\\s*\`([\\s\\S]*?)\``, 'm'));
    blogContent = contentMatch ? contentMatch[1].substring(0, 3000) : 'Content not extractable';

    console.log(`   🔍 Inspecting: "${blogTitle}"`);
  } catch (e) {
    console.log(`   ⚠️ Could not load blog data: ${e.message}`);
    return null;
  }

  const raw = await directorCall(`You are a Senior Editorial Director with 20 years in SEO content strategy. You've just pulled a RANDOM article from the production site for a surprise quality audit. You are known for being brutally honest — mediocre work does not pass your desk.

═══ ARTICLE UNDER REVIEW ═══
Title: "${blogTitle}"
Content (first 3000 chars):
${blogContent}

═══ YOUR AUDIT CRITERIA ═══
1. **Authority & Expertise** (Does it sound like a 20-year expert wrote it, or a junior intern?)
2. **SEO Strength** (Are keywords naturally woven in? Is the H-tag structure correct?)
3. **Lead Generation** (Does it push the reader toward FouriqTech's services? Are there CTAs?)
4. **Originality** (Does it say something new, or is it generic regurgitation?)
5. **Brand Voice** (Does it match a "Premium, Elite Agency" tone?)

Return a JSON object:
{
  "article_title": "string",
  "overall_score": 1-10,
  "verdict": "PUBLISH" | "NEEDS_REVISION" | "REWRITE",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "specific_feedback": "Your brutally honest feedback as a 20-year expert",
  "rewrite_order": "string or null (specific instructions if verdict is REWRITE)"
}`);

  try {
    const audit = JSON.parse(raw);
    console.log(`   📊 Score: ${audit.overall_score}/10 | Verdict: ${audit.verdict}`);
    if (audit.specific_feedback) {
      console.log(`   💬 Feedback: ${audit.specific_feedback.substring(0, 150)}...`);
    }
    return audit;
  } catch {
    console.log('   ⚠️ Audit parse failed.');
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ⚡ PHASE 4: DEPARTMENT DISPATCH
// ═══════════════════════════════════════════════════════════════════════

function dispatchDepartment(decision) {
  const department = decision.department;
  const scriptPath = DEPARTMENTS[department];
  if (!scriptPath) {
    console.error(`   ❌ Unknown department: ${department}`);
    return false;
  }

  console.log(`\n⚡ PHASE 4: Dispatching ${department.toUpperCase()} TEAM...`);
  
  // Write CEO Orders for the agent to read
  const ordersPath = path.join(process.cwd(), '.github/director_orders.json');
  fs.writeFileSync(ordersPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    department: department,
    reasoning: decision.reasoning,
    cross_department_orders: decision.cross_department_orders || "None. Continue standard operations.",
    agency_health_score: decision.agency_health_score
  }, null, 2));

  console.log(`   📜 CEO Orders drafted to director_orders.json`);
  console.log(`   🚀 Executing: node --env-file=.env ${scriptPath}`);

  if (process.env.DRY_RUN === 'true') {
    console.log('   🧪 DRY_RUN: Skipping actual execution.');
    return true;
  }

  try {
    execSync(`node --env-file=.env ${scriptPath}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 300000, // 5 minute timeout per department
    });
    console.log(`   ✅ ${department.toUpperCase()} TEAM completed successfully.`);
    return true;
  } catch (e) {
    console.error(`   ❌ ${department.toUpperCase()} TEAM failed: ${e.message?.substring(0, 100)}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 📋 PHASE 5: JOURNAL ENTRY
// ═══════════════════════════════════════════════════════════════════════

function writeJournal(sitrep, decision, audit, dispatchSuccess) {
  console.log('\n📋 PHASE 5: Writing Director Journal...');

  const journal = loadJournal();

  const entry = {
    date: new Date().toISOString(),
    cycle: journal.total_cycles + 1,
    sitrep_summary: {
      blog_posts: sitrep.total_blog_posts,
      service_pages: sitrep.structural_team?.deployed_service_pages || 0,
      gsc_clicks: sitrep.gsc?.total_clicks || 'N/A',
      opportunity_leader: sitrep.opportunity_engine?.recommended_department || null,
    },
    decision: decision.department,
    reasoning: decision.reasoning,
    confidence: decision.confidence,
    agency_health: decision.agency_health_score,
    scored_recommendation: sitrep.opportunity_engine?.recommended_department || null,
    recommended_orders: sitrep.opportunity_engine?.recommended_orders || [],
    cross_dept_orders: decision.cross_department_orders || null,
    quality_audit: audit ? {
      article: audit.article_title,
      score: audit.overall_score,
      verdict: audit.verdict,
    } : null,
    dispatch_success: dispatchSuccess,
  };

  journal.entries.push(entry);
  journal.total_cycles += 1;

  // Keep only last 50 entries to prevent bloat
  if (journal.entries.length > 50) {
    journal.entries = journal.entries.slice(-50);
  }

  saveJournal(journal);
  console.log(`   ✅ Cycle #${entry.cycle} logged to director_journal.json`);
}

function recordLearningSnapshot(sitrep, decision) {
  const topOpportunity = sitrep.opportunity_engine?.top_opportunities?.[0] || null;
  if (!topOpportunity) return;

  recordDirectorAction({
    department: decision.department,
    playbook: topOpportunity.playbook || topOpportunity.department,
    target_slug: typeof topOpportunity.target === 'string'
      ? topOpportunity.target.replace(/^https?:\/\/[^/]+\//, '')
      : null,
    target: topOpportunity.target,
    opportunity_id: topOpportunity.id,
    opportunity_type: topOpportunity.type,
    baseline: {
      clicks: topOpportunity.clicks,
      impressions: topOpportunity.impressions,
      ctr: topOpportunity.ctr,
      position: topOpportunity.position,
    },
    score: topOpportunity.score,
    recommendation: sitrep.opportunity_engine?.recommended_department || null,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 💬 CHAT MODE — Talk to the Director
// ═══════════════════════════════════════════════════════════════════════

async function chatMode(question) {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  💬 AGENCY DIRECTOR — Chat Mode                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const sitrep = gatherSitRep();
  const journal = loadJournal();

  const raw = await directorCall(`You are the Agency Director of FouriqTech — a brilliant, experienced (20+ years) SEO strategist. You speak directly, with confidence and a touch of humor. You know everything about the agency's current state.

═══ CURRENT AGENCY STATUS ═══
${JSON.stringify(sitrep, null, 2)}

═══ RECENT DIRECTOR DECISIONS ═══
${JSON.stringify(journal.entries.slice(-5), null, 2)}

═══ HUMAN ASKS ═══
"${question}"

Respond naturally and conversationally as the Agency Director. Be data-driven, reference specific numbers from the SitRep. If the human asks about performance, quote the actual metrics. If they ask for advice, give a strong, opinionated recommendation. Keep it under 200 words.`, false);

  console.log('\n👔 DIRECTOR:');
  console.log('─'.repeat(60));
  console.log(raw.trim());
  console.log('─'.repeat(60));
}

// ═══════════════════════════════════════════════════════════════════════
// 📋 PHASE 5: AUTO-REVIEW (The Director as QA Boss)
// ═══════════════════════════════════════════════════════════════════════

async function runAutoReview() {
  const STAGING_PATH = path.join(process.cwd(), '.github/staging/staging.json');
  console.log('\n👀 PHASE 5: Autonomous Review Gate...');
  
  try {
    const staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
    const pending = staging.queue.filter(i => i.status === 'pending_review');

    if (pending.length === 0) {
      console.log('   ✅ No pending items found in staging queue.');
      return;
    }

    const latest = pending[0];
    console.log(`   🧠 Reviewing [${latest.id}] "${latest.title}"...`);

    // The Director (3.1 Pro) does a quick check of the content
    const review = await directorCall(`You are the Agency Director reviewing work from your ${latest.department}.
    
    ITEM TITLE: ${latest.title}
    TYPE: ${latest.type}
    METADATA: ${JSON.stringify(latest.metadata)}
    CONTENT PREVIEW (First 2000 chars):
    ${latest.content.substring(0, 2000)}
    
    DECISION CRITERIA:
    1. If it's a blog post, does it have a clear H1, intros, and high word count?
    2. If it's a tech patch, does it look like valid code?
    3. Is it logically sound and represents FouriqTech properly?

    Return a JSON object:
    {
      "verdict": "approved" or "rejected",
      "feedback": "Your 1-sentence feedback to the team",
      "confidence": 1-10
    }`);

    const result = JSON.parse(review);
    
    console.log(`   👔 VERDICT: [${result.verdict.toUpperCase()}] — ${result.feedback}`);

    // DIRECTLY UPDATE STAGING FILE
    const emoji = result.verdict === 'approved' ? '✅' : '❌';
    latest.status = result.verdict;
    latest.manager_review = {
      verdict: result.verdict,
      feedback: `[AUTO-DIRECTOR] ${result.feedback}`,
      reviewed_at: new Date().toISOString()
    };
    
    if (result.verdict === 'approved') {
        latest.published_at = new Date().toISOString();
    }

    // Save back to disk
    fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2));
    console.log(`   📦 SUCCESS: Item ${latest.id} successfully reviewed and ${result.verdict}.`);

    // IF APPROVED, SPAWN THE PUBLISHER
    if (result.verdict === 'approved') {
      console.log(`   🚀 DEPLOYING: Spawning Publisher for ${latest.id}...`);
      execSync('node --env-file=.env .github/scripts/publisher.mjs', { stdio: 'inherit' });
    }

  } catch (err) {
    console.error(`   ❌ Auto-Review failed: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN — The Agency Director's Daily Cycle
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  // ── Parse CLI flags ──
  const args = process.argv.slice(2);
  const chatIdx = args.indexOf('--chat');
  const auditOnly = args.includes('--audit-only');
  const reviewOnly = args.includes('--review-only');

  // ── Review Only Mode ──
  if (reviewOnly) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  👔 AGENCY DIRECTOR — Standalone Review Mode            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    await runAutoReview();
    return;
  }

  // ── Chat Mode ──
  if (chatIdx !== -1 && args[chatIdx + 1]) {
    await chatMode(args[chatIdx + 1]);
    return;
  }

  // ── Full Director Cycle ──
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  👔 FOURIQTECH AGENCY DIRECTOR v1.0                     ║');
  console.log('║  "The 20-Year Expert" — Strategic Brain                 ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  ⏰ ${new Date().toISOString()}`);
  console.log(`║  🧠 Model: ${DIRECTOR_MODELS[0]}`);
  console.log(`║  🔑 Key: ${PRO_KEY ? 'BILLED (Pro)' : 'FREE TIER (Flash)'}`);
  console.log(`║  📊 Opportunity Engine: ${OPPORTUNITY_SNAPSHOT}`);
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Phase 1: SitRep
  const sitrep = gatherSitRep();

  // Phase 2: Strategic Decision
  const decision = await makeStrategicDecision(sitrep);

  // Phase 3: Quality Audit (if Director decided or audit-only mode)
  let audit = null;
  if (decision.run_quality_audit || auditOnly) {
    audit = await runQualityAudit();
  } else {
    console.log('\n🎲 PHASE 3: Quality Audit → Skipped this cycle.');
  }

  // If audit-only mode, stop here
  if (auditOnly) {
    console.log('\n🛑 AUDIT-ONLY mode. Skipping dispatch.');
    writeJournal(sitrep, decision, audit, null);
    return;
  }

  // Phase 4: Dispatch
  const success = dispatchDepartment(decision);

  // Give local scripts a tiny bit of time to submit their staging work
  if (success) {
    console.log('\n⏳ Waiting for department to submit work to staging...');
    await new Promise(r => setTimeout(r, 5000));
    await runAutoReview();
  }

  // Phase 5: Journal
  writeJournal(sitrep, decision, audit, success);
  recordLearningSnapshot(sitrep, decision);

  // ── Final Report ──
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📋 DIRECTOR CYCLE COMPLETE                             ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🎯 Deployed: ${decision.department?.toUpperCase()} TEAM`);
  console.log(`║  💪 Confidence: ${decision.confidence}/10`);
  console.log(`║  ❤️  Agency Health: ${decision.agency_health_score}/10`);
  if (audit) {
    console.log(`║  🎲 Audit: "${audit.article_title?.substring(0, 40)}..." → ${audit.verdict} (${audit.overall_score}/10)`);
  }
  console.log(`║  ✅ Dispatch: ${success ? 'SUCCESS' : 'FAILED'}`);
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n👔 DIRECTOR: Signing off. The agency is in good hands. ✅');
}

main().catch(err => {
  console.error('💥 DIRECTOR FATAL:', err.message);
  process.exit(1);
});
