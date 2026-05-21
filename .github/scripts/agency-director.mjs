import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getModelsForRole, smartCall, sleep, logActivity } from './agency-core.mjs';
import { compileMemory, recordAction, recordPattern, trackKeyword, addToBlacklist, closeMemory } from './memory-compiler.mjs';

// ═══════════════════════════════════════════════════════════════════════
// 👔 AGENCY DIRECTOR v2.0 — Memory-Powered Strategic Brain
// ═══════════════════════════════════════════════════════════════════════
// The Director is the TOP-LEVEL decision maker. It:
//   1. Loads FULL agency memory (4 layers)
//   2. Analyzes current state + opportunities
//   3. Makes a strategic decision (which department to run)
//   4. Dispatches the chosen department
//   5. Reviews output quality
//   6. Records everything for future learning
//
// KEY DIFFERENCE from v1: The Director now has FULL CONTEXT.
// It knows what worked, what failed, what's stuck, and what to avoid.
// It's not guessing — it's making informed decisions based on data.
// ═══════════════════════════════════════════════════════════════════════

const CWD = process.cwd();
const DEPARTMENTS = {
  content:    '.github/scripts/seo-auto-poster.mjs',
  structural: '.github/scripts/seo-dev-agent.mjs',
  technical:  '.github/scripts/technical-seo-agent.mjs',
  backlinks:  '.github/scripts/backlink-agent.mjs',
};

// DB connection
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1: SITUATION REPORT — Full memory-powered context
// ═══════════════════════════════════════════════════════════════════════
async function gatherSitRep() {
  console.log('\n📊 PHASE 1: Building Situation Report from Memory...');
  
  // Compile full memory context
  const memory = await compileMemory('director');
  console.log(`   🧠 Memory loaded: ${memory.context.length} chars of context`);

  // Get additional real-time data
  const sitrep = { memoryContext: memory.context };

  // Content team status
  try {
    const blogCount = await prisma.blogPost.count({ where: { isLive: true } });
    const recentBlogs = await prisma.blogPost.findMany({
      where: { isLive: true }, orderBy: { createdAt: 'desc' }, take: 5,
      select: { title: true, slug: true, targetKeyword: true, qaScore: true, createdAt: true }
    });
    sitrep.content = { total: blogCount, recent: recentBlogs };
    console.log(`   ✍️ Content: ${blogCount} posts | Latest: "${recentBlogs[0]?.title || 'none'}"`);
  } catch { sitrep.content = { total: 0, recent: [] }; }

  // Structural team status
  try {
    const pageCount = await prisma.servicePage.count({ where: { isLive: true } });
    sitrep.structural = { total: pageCount };
    console.log(`   🏗️ Structural: ${pageCount} service pages`);
  } catch { sitrep.structural = { total: 0 }; }

  // Technical team status
  try {
    const lastAudit = await prisma.techAuditReport.findFirst({ orderBy: { date: 'desc' } });
    sitrep.technical = lastAudit ? { lastScore: lastAudit.overallScore, lastRun: lastAudit.date } : { lastScore: null, lastRun: null };
    console.log(`   🛡️ Technical: Last score ${sitrep.technical.lastScore || 'N/A'}/100`);
  } catch { sitrep.technical = { lastScore: null, lastRun: null }; }

  // Staging queue
  try {
    const pending = await prisma.stagingItem.count({ where: { status: 'pending_review' } });
    sitrep.pendingReviews = pending;
    console.log(`   📋 Pending reviews: ${pending}`);
  } catch { sitrep.pendingReviews = 0; }

  // GSC latest
  try {
    const latestGsc = await prisma.gscDailySnapshot.findFirst({ orderBy: { date: 'desc' } });
    if (latestGsc) {
      sitrep.gsc = { clicks: latestGsc.totalClicks, impressions: latestGsc.totalImpressions, position: latestGsc.avgPosition, pages: latestGsc.pageCount };
      console.log(`   📈 GSC: ${latestGsc.totalClicks} clicks | Position: ${latestGsc.avgPosition?.toFixed(1)}`);
    } else {
      // Fallback to old SearchPerformance table
      const legacy = await prisma.searchPerformance.findFirst({ orderBy: { generatedAt: 'desc' } });
      sitrep.gsc = legacy ? { clicks: legacy.totalClicks, impressions: legacy.totalImpressions, position: legacy.avgPosition } : null;
    }
  } catch { sitrep.gsc = null; }

  // Recent insights
  try {
    const insights = await prisma.gscInsight.findMany({ orderBy: { generatedAt: 'desc' }, take: 5 });
    sitrep.insights = insights.map(i => i.insightText);
  } catch { sitrep.insights = []; }

  // Recent journal (last 5 decisions)
  try {
    const journal = await prisma.journalEntry.findMany({ orderBy: { date: 'desc' }, take: 5 });
    sitrep.recentDecisions = journal.map(j => ({ date: j.date, decision: j.decision, success: j.dispatchSuccess }));
  } catch { sitrep.recentDecisions = []; }

  return sitrep;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2: STRATEGIC DECISION — AI with full memory context
// ═══════════════════════════════════════════════════════════════════════
async function makeDecision(sitrep) {
  console.log('\n🧠 PHASE 2: Making Strategic Decision...');
  
  const models = await getModelsForRole('manager');
  const raw = await smartCall(models, `You are the Agency Director — a 20-year veteran SEO strategist running an autonomous agency.

${sitrep.memoryContext}

═══ REAL-TIME STATUS ═══
- Content: ${sitrep.content?.total || 0} blog posts published
- Service Pages: ${sitrep.structural?.total || 0} deployed
- Technical Health: ${sitrep.technical?.lastScore || 'Unknown'}/100
- Pending Reviews: ${sitrep.pendingReviews}
- GSC: ${sitrep.gsc ? `${sitrep.gsc.clicks} clicks, avg position ${sitrep.gsc.position?.toFixed(1)}` : 'No data'}

═══ RECENT INSIGHTS ═══
${sitrep.insights?.length > 0 ? sitrep.insights.join('\n') : 'No insights yet — system is new.'}

═══ LAST 5 DECISIONS ═══
${sitrep.recentDecisions?.map(d => `${new Date(d.date).toLocaleDateString()}: ${d.decision} (${d.success ? 'success' : 'failed'})`).join('\n') || 'No history yet.'}

═══ YOUR TASK ═══
Based on ALL the context above, decide:
1. Which department should run? (content | structural | technical | backlinks)
2. What specific orders should they follow?
3. Should you run a quality audit? (randomly ~30% of the time)
4. Any cross-department coordination needed?

DECISION RULES:
- If no content published in 3+ days → prioritize content
- If technical score < 80 → prioritize technical
- If a keyword is stuck (position 8-15 for 2+ weeks) → content to support it
- If recent decisions all failed → try a different department
- Respect the blacklist — don't repeat failed strategies
- Balance: don't run the same department 3x in a row

Return JSON:
{
  "department": "content" | "structural" | "technical" | "backlinks",
  "orders": "Specific instructions for the team (2-3 sentences)",
  "run_quality_audit": true/false,
  "cross_dept_orders": "string or null",
  "reasoning": "Why this decision (2-3 sentences)",
  "confidence": 1-10,
  "agency_health": 1-10,
  "target_keyword": "keyword to focus on (if applicable)",
  "playbook": "which strategy to use (ctr_optimization, cluster_support, content_refresh, technical_fix, etc)"
}`, 'Director');

  try {
    const decision = JSON.parse(raw);
    console.log(`   🎯 Decision: ${decision.department?.toUpperCase()}`);
    console.log(`   📋 Orders: ${decision.orders}`);
    console.log(`   💪 Confidence: ${decision.confidence}/10 | Health: ${decision.agency_health}/10`);
    console.log(`   🎮 Playbook: ${decision.playbook}`);
    return decision;
  } catch (e) {
    console.error(`   ⚠️ Failed to parse decision. Defaulting to content.`);
    return { department: 'content', orders: 'Write a new article', confidence: 3, agency_health: 5, playbook: 'content_general' };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: QUALITY AUDIT — Random inspection from DB
// ═══════════════════════════════════════════════════════════════════════
async function runQualityAudit() {
  console.log('\n🎲 PHASE 3: Quality Audit (Surprise Inspection)...');
  
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isLive: true }, orderBy: { createdAt: 'desc' }, take: 10,
      select: { title: true, content: true, slug: true, qaScore: true }
    });

    if (posts.length === 0) { console.log('   ⚠️ No posts to audit.'); return null; }

    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    console.log(`   🔍 Inspecting: "${randomPost.title}"`);

    const models = await getModelsForRole('qa');
    const raw = await smartCall(models, `You are a Senior Editorial Director doing a surprise quality audit.

ARTICLE: "${randomPost.title}"
CONTENT (first 2500 chars):
${(randomPost.content || '').substring(0, 2500)}

AUDIT CRITERIA:
1. Authority & Expertise (expert-level or generic?)
2. SEO Strength (keywords natural? H-tags correct?)
3. Lead Generation (CTAs? Push toward services?)
4. Originality (new insights or regurgitation?)
5. Technical Depth (metrics, code examples, real data?)

Return JSON:
{
  "article_title": "string",
  "overall_score": 1-10,
  "verdict": "PUBLISH" | "NEEDS_REVISION" | "REWRITE",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "feedback": "Brutally honest 1-2 sentence feedback"
}`, 'QA Auditor');

    const audit = JSON.parse(raw);
    console.log(`   📊 Score: ${audit.overall_score}/10 | Verdict: ${audit.verdict}`);

    // Update the post's QA score in DB
    await prisma.blogPost.update({
      where: { slug: randomPost.slug },
      data: { qaScore: audit.overall_score * 10 }
    }).catch(() => {});

    // Learn from the audit
    if (audit.overall_score >= 8) {
      await recordPattern('winning', 'content', `High-quality article pattern: "${randomPost.title}" scored ${audit.overall_score}/10. Strengths: ${audit.strengths?.join(', ')}`, 0.7, audit);
    } else if (audit.overall_score <= 4) {
      await recordPattern('failing', 'content', `Low-quality article: "${randomPost.title}" scored ${audit.overall_score}/10. Issues: ${audit.weaknesses?.join(', ')}`, 0.7, audit);
    }

    return audit;
  } catch (e) {
    console.log(`   ⚠️ Audit failed: ${e.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 4: DISPATCH — Execute the chosen department
// ═══════════════════════════════════════════════════════════════════════
function dispatchDepartment(decision) {
  const dept = decision.department;
  const script = DEPARTMENTS[dept];
  if (!script) { console.error(`   ❌ Unknown department: ${dept}`); return false; }

  console.log(`\n⚡ PHASE 4: Dispatching ${dept.toUpperCase()} TEAM...`);

  // Write orders for the department to read
  const ordersPath = path.join(CWD, '.github/director_orders.json');
  fs.writeFileSync(ordersPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    department: dept,
    orders: decision.orders,
    playbook: decision.playbook,
    target_keyword: decision.target_keyword || null,
    cross_dept: decision.cross_dept_orders || null,
  }, null, 2));

  if (process.env.DRY_RUN === 'true') {
    console.log('   🧪 DRY_RUN: Skipping execution.');
    return true;
  }

  try {
    console.log(`   🚀 Executing: node --env-file=.env ${script}`);
    execSync(`node --env-file=.env ${script}`, { stdio: 'inherit', cwd: CWD, timeout: 300000 });
    console.log(`   ✅ ${dept.toUpperCase()} completed.`);
    return true;
  } catch (e) {
    console.error(`   ❌ ${dept.toUpperCase()} failed: ${e.message?.substring(0, 100)}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 5: AUTO-REVIEW — Check staging queue
// ═══════════════════════════════════════════════════════════════════════
async function autoReview() {
  console.log('\n👀 PHASE 5: Auto-Review...');
  
  const pending = await prisma.stagingItem.findFirst({
    where: { status: 'pending_review' }, orderBy: { createdAt: 'desc' }
  });

  if (!pending) { console.log('   ✅ No pending items.'); return; }

  console.log(`   🧠 Reviewing: "${pending.title}"`);
  const models = await getModelsForRole('manager');
  
  const raw = await smartCall(models, `You are reviewing work from your ${pending.department} team.

ITEM: "${pending.title}" (${pending.type})
CONTENT PREVIEW:
${(pending.content || '').substring(0, 2000)}

Is this good enough to publish? Check:
1. Is it complete and well-structured?
2. Does it represent the brand properly?
3. Is it technically sound?

Return JSON: { "verdict": "approved" or "rejected", "feedback": "1 sentence", "confidence": 1-10 }`, 'Reviewer');

  try {
    const review = JSON.parse(raw);
    console.log(`   👔 Verdict: ${review.verdict.toUpperCase()} — ${review.feedback}`);

    await prisma.stagingItem.update({
      where: { id: pending.id },
      data: {
        status: review.verdict,
        managerReview: { verdict: review.verdict, feedback: review.feedback, reviewedAt: new Date().toISOString() },
        ...(review.verdict === 'approved' ? { publishedAt: new Date() } : {})
      }
    });

    if (review.verdict === 'approved') {
      console.log(`   🚀 Spawning publisher...`);
      try { execSync('node --env-file=.env .github/scripts/publisher.mjs', { stdio: 'inherit', cwd: CWD }); } catch {}
    }
  } catch (e) {
    console.log(`   ⚠️ Review failed: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 6: RECORD & LEARN — Update memory
// ═══════════════════════════════════════════════════════════════════════
async function recordCycle(sitrep, decision, audit, success) {
  console.log('\n📋 PHASE 6: Recording to Memory...');

  // Update AgentState (working memory)
  await prisma.agentState.upsert({
    where: { id: 'global' },
    update: {
      lastDecision: decision.department,
      lastCycleAt: new Date(),
      cycleCount: { increment: 1 },
      currentOrders: decision.orders ? { department: decision.department, orders: decision.orders } : undefined,
    },
    create: { id: 'global', lastDecision: decision.department, lastCycleAt: new Date(), cycleCount: 1 }
  }).catch(() => {});

  // Record journal entry
  const cycleCount = await prisma.journalEntry.count();
  await prisma.journalEntry.create({
    data: {
      cycle: cycleCount + 1,
      decision: decision.department,
      reasoning: decision.reasoning || '',
      confidence: decision.confidence,
      agencyHealth: decision.agency_health,
      scoredRecommendation: decision.playbook,
      recommendedOrders: { orders: decision.orders, target: decision.target_keyword },
      crossDeptOrders: decision.cross_dept_orders,
      qualityAudit: audit ? { score: audit.overall_score, verdict: audit.verdict } : null,
      dispatchSuccess: success,
    }
  }).catch(e => console.log(`   ⚠️ Journal write failed: ${e.message}`));

  // Record action for learning engine
  await recordAction(
    decision.department,
    decision.playbook || `${decision.department}_general`,
    decision.target_keyword || null,
    decision.orders,
    sitrep.gsc ? { clicks: sitrep.gsc.clicks, position: sitrep.gsc.position } : null
  );

  // Track keyword if specified
  if (decision.target_keyword) {
    await trackKeyword(decision.target_keyword, decision.department, null);
  }

  // Learn from failure
  if (!success && decision.playbook) {
    await recordPattern('failing', decision.department, `Playbook "${decision.playbook}" failed on this cycle`, 0.4, { decision, success });
  }

  await logActivity('👔', 'director', `Cycle complete: ${decision.department} (${success ? 'success' : 'failed'}) | Health: ${decision.agency_health}/10`, 'info');
  console.log(`   ✅ Cycle recorded to memory.`);
}

// ═══════════════════════════════════════════════════════════════════════
// 💬 CHAT MODE — Talk to the Director
// ═══════════════════════════════════════════════════════════════════════
async function chatMode(question) {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  💬 DIRECTOR CHAT MODE                                    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const memory = await compileMemory('director');
  const models = await getModelsForRole('manager');

  const raw = await smartCall(models, `You are the Agency Director of FourIQ Tech — a brilliant, experienced SEO strategist. You speak directly, with confidence. You know everything about the agency.

${memory.context}

HUMAN ASKS: "${question}"

Respond naturally and conversationally. Be data-driven, reference specific numbers. Keep it under 200 words.`, 'Director Chat', { json: false });

  console.log('\n👔 DIRECTOR:');
  console.log('─'.repeat(60));
  console.log(raw.trim());
  console.log('─'.repeat(60));
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN — The Full Director Cycle
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const chatIdx = args.indexOf('--chat');
  const auditOnly = args.includes('--audit-only');
  const reviewOnly = args.includes('--review-only');

  // Review Only
  if (reviewOnly) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  👔 DIRECTOR — Review Mode                               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    await autoReview();
    await closeMemory();
    await prisma.$disconnect();
    return;
  }

  // Chat Mode
  if (chatIdx !== -1 && args[chatIdx + 1]) {
    await chatMode(args.slice(chatIdx + 1).join(' '));
    await closeMemory();
    await prisma.$disconnect();
    return;
  }

  // ═══ FULL STRATEGIC CYCLE ═══
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  👔 AGENCY DIRECTOR v2.0 — Memory-Powered Brain           ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  ⏰ ${new Date().toISOString()}`);
  console.log('║  🧠 Memory System: Active');
  console.log('║  📊 4-Layer Context: Loading...');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Phase 1: Situation Report
  const sitrep = await gatherSitRep();

  // Phase 2: Strategic Decision
  const decision = await makeDecision(sitrep);

  // Phase 3: Quality Audit (if decided)
  let audit = null;
  if (decision.run_quality_audit || auditOnly) {
    audit = await runQualityAudit();
  } else {
    console.log('\n🎲 PHASE 3: Quality Audit → Skipped this cycle.');
  }

  if (auditOnly) {
    await recordCycle(sitrep, decision, audit, null);
    await closeMemory();
    await prisma.$disconnect();
    return;
  }

  // Phase 4: Dispatch
  const success = dispatchDepartment(decision);

  // Wait for department to submit work
  if (success) {
    console.log('\n⏳ Waiting for department output...');
    await sleep(5000);
    await autoReview();
  }

  // Phase 6: Record & Learn
  await recordCycle(sitrep, decision, audit, success);

  // Final Report
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📋 DIRECTOR CYCLE COMPLETE                               ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🎯 Deployed: ${decision.department?.toUpperCase()}`);
  console.log(`║  🎮 Playbook: ${decision.playbook}`);
  console.log(`║  💪 Confidence: ${decision.confidence}/10`);
  console.log(`║  ❤️  Health: ${decision.agency_health}/10`);
  if (audit) console.log(`║  🎲 Audit: ${audit.overall_score}/10 (${audit.verdict})`);
  console.log(`║  ✅ Result: ${success ? 'SUCCESS' : 'FAILED'}`);
  console.log('╚═══════════════════════════════════════════════════════════╝');

  await closeMemory();
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('💥 DIRECTOR FATAL:', err.message);
  process.exit(1);
});
