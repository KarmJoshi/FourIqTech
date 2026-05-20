import dotenv from 'dotenv';
dotenv.config();

import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';

// ═══════════════════════════════════════════════════════════════════════
// 🧠 MEMORY COMPILER — Builds contextual memory for each agent
// ═══════════════════════════════════════════════════════════════════════
// This is the CORE of the agency's intelligence. Before any agent runs,
// it calls compileMemory() to get a rich context package that makes
// the agent aware of everything the agency knows.
//
// Usage:
//   import { compileMemory } from './memory-compiler.mjs';
//   const memory = await compileMemory('content');
//   // memory.context → string to inject into AI prompt
//   // memory.data → structured data for code logic
// ═══════════════════════════════════════════════════════════════════════

let prisma;

async function getDb() {
  if (prisma) return prisma;
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    return prisma;
  } catch (err) {
    console.error('Memory Compiler: DB connection failed:', err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// LAYER 1: Working Memory — What's happening right now
// ═══════════════════════════════════════════════════════════════════════
async function getWorkingMemory(db) {
  const state = await db.agentState.findUnique({ where: { id: 'global' } }).catch(() => null);
  const pending = await db.stagingItem.count({ where: { status: 'pending_review' } }).catch(() => 0);
  const config = await db.agencyConfig.findUnique({ where: { id: 'default' } }).catch(() => null);
  
  return {
    currentOrders: state?.currentOrders || null,
    lastDecision: state?.lastDecision || 'unknown',
    cycleCount: state?.cycleCount || 0,
    pendingReviews: pending,
    isAutoPilot: config?.isAutoPilot || false,
    apiMode: config?.apiMode || 'free',
  };
}

// ═══════════════════════════════════════════════════════════════════════
// LAYER 2: Short-Term Memory — Last 30 days
// ═══════════════════════════════════════════════════════════════════════
async function getShortTermMemory(db, department) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Recent actions for this department
  const recentActions = await db.agentAction.findMany({
    where: { department, timestamp: { gte: thirtyDaysAgo } },
    orderBy: { timestamp: 'desc' },
    take: 10,
    include: { outcome: true }
  }).catch(() => []);

  // Recent journal decisions
  const recentDecisions = await db.journalEntry.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    orderBy: { date: 'desc' },
    take: 10,
    select: { date: true, decision: true, reasoning: true, confidence: true, dispatchSuccess: true }
  }).catch(() => []);

  // Recent GSC insights
  const recentInsights = await db.gscInsight.findMany({
    where: { generatedAt: { gte: thirtyDaysAgo } },
    orderBy: { generatedAt: 'desc' },
    take: 10,
    select: { type: true, pageUrl: true, query: true, insightText: true }
  }).catch(() => []);

  // Content published recently
  const recentContent = await db.blogPost.findMany({
    where: { isLive: true, createdAt: { gte: thirtyDaysAgo } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { title: true, slug: true, targetKeyword: true, qaScore: true, structure: true, createdAt: true }
  }).catch(() => []);

  // Latest GSC snapshot
  const latestGsc = await db.gscDailySnapshot.findFirst({
    orderBy: { date: 'desc' }
  }).catch(() => null);

  return {
    recentActions,
    recentDecisions,
    recentInsights,
    recentContent,
    latestGsc,
    departmentRunsLast30Days: recentActions.length,
    successRate: recentActions.length > 0
      ? Math.round((recentActions.filter(a => a.outcome?.verdict === 'positive').length / recentActions.length) * 100)
      : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// LAYER 3: Long-Term Memory — Patterns and accumulated wisdom
// ═══════════════════════════════════════════════════════════════════════
async function getLongTermMemory(db, department) {
  // Playbook performance
  const playbooks = await db.playbookStat.findMany({
    orderBy: { avgSuccessScore: 'desc' },
    take: 10,
  }).catch(() => []);

  // Learned patterns for this department
  const patterns = await db.learnedPattern.findMany({
    where: { department, isActive: true },
    orderBy: { confidence: 'desc' },
    take: 10,
  }).catch(() => []);

  // Blacklisted items
  const blacklist = await db.blacklist.findMany({
    take: 20,
  }).catch(() => []);

  // Keyword memory — stuck and abandoned keywords
  const stuckKeywords = await db.keywordMemory.findMany({
    where: { status: { in: ['stuck', 'abandoned'] } },
    take: 10,
  }).catch(() => []);

  // Best performing keywords
  const winningKeywords = await db.keywordMemory.findMany({
    where: { status: 'ranked', bestPosition: { lte: 10 } },
    orderBy: { bestPosition: 'asc' },
    take: 10,
  }).catch(() => []);

  return {
    playbooks,
    patterns,
    blacklist,
    stuckKeywords,
    winningKeywords,
    bestPlaybook: playbooks[0]?.playbook || 'none',
    worstPlaybook: playbooks[playbooks.length - 1]?.playbook || 'none',
  };
}

// ═══════════════════════════════════════════════════════════════════════
// LAYER 4: Institutional Knowledge — Who we are
// ═══════════════════════════════════════════════════════════════════════
async function getInstitutionalKnowledge(db) {
  const company = await db.companyContext.findUnique({ where: { id: 'default' } }).catch(() => null);
  const clusters = await db.topicCluster.findMany({ take: 20 }).catch(() => []);
  const totalPosts = await db.blogPost.count({ where: { isLive: true } }).catch(() => 0);
  const totalPages = await db.servicePage.count({ where: { isLive: true } }).catch(() => 0);

  return {
    company: company || { name: 'FourIQ Tech', website: 'https://www.fouriqtech.com' },
    clusters,
    totalPosts,
    totalPages,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// CONTEXT BUILDER — Converts structured data into prompt-ready text
// ═══════════════════════════════════════════════════════════════════════
function buildContextString(working, shortTerm, longTerm, institutional, department) {
  const lines = [];
  
  lines.push('═══ AGENCY MEMORY CONTEXT ═══\n');
  
  // Institutional
  lines.push(`COMPANY: ${institutional.company.name} (${institutional.company.website})`);
  lines.push(`ASSETS: ${institutional.totalPosts} blog posts | ${institutional.totalPages} service pages`);
  if (institutional.clusters.length > 0) {
    lines.push(`CLUSTERS: ${institutional.clusters.map(c => c.name).join(', ')}`);
  }
  lines.push('');

  // Working state
  lines.push(`CURRENT STATE:`);
  lines.push(`- Cycle #${working.cycleCount} | Last decision: ${working.lastDecision}`);
  lines.push(`- Pending reviews: ${working.pendingReviews} | API: ${working.apiMode}`);
  if (working.currentOrders) {
    lines.push(`- Active orders: ${JSON.stringify(working.currentOrders)}`);
  }
  lines.push('');

  // Short-term performance
  if (shortTerm.latestGsc) {
    lines.push(`GSC (LATEST):`);
    lines.push(`- Clicks: ${shortTerm.latestGsc.totalClicks} | Impressions: ${shortTerm.latestGsc.totalImpressions}`);
    lines.push(`- Avg Position: ${shortTerm.latestGsc.avgPosition?.toFixed(1)} | Pages: ${shortTerm.latestGsc.pageCount}`);
    lines.push('');
  }

  if (shortTerm.recentInsights.length > 0) {
    lines.push(`RECENT INSIGHTS:`);
    for (const insight of shortTerm.recentInsights.slice(0, 5)) {
      lines.push(`- [${insight.type}] ${insight.insightText}`);
    }
    lines.push('');
  }

  // Department-specific recent history
  if (shortTerm.recentActions.length > 0) {
    lines.push(`YOUR RECENT ACTIONS (${department}):`);
    lines.push(`- Runs in last 30 days: ${shortTerm.departmentRunsLast30Days}`);
    lines.push(`- Success rate: ${shortTerm.successRate !== null ? shortTerm.successRate + '%' : 'Not enough data'}`);
    for (const action of shortTerm.recentActions.slice(0, 5)) {
      const outcome = action.outcome ? ` → ${action.outcome.verdict} (score: ${action.outcome.successScore?.toFixed(1)})` : ' → pending';
      lines.push(`  • ${action.playbook}: ${action.description || action.targetSlug}${outcome}`);
    }
    lines.push('');
  }

  // Long-term patterns
  if (longTerm.patterns.length > 0) {
    lines.push(`LEARNED PATTERNS:`);
    for (const p of longTerm.patterns.slice(0, 5)) {
      lines.push(`- [${p.type}] ${p.pattern} (confidence: ${(p.confidence * 100).toFixed(0)}%)`);
    }
    lines.push('');
  }

  if (longTerm.playbooks.length > 0) {
    lines.push(`PLAYBOOK PERFORMANCE:`);
    for (const pb of longTerm.playbooks.slice(0, 5)) {
      lines.push(`- ${pb.playbook}: ${pb.totalRuns} runs, ${((pb.successCount / Math.max(pb.totalRuns, 1)) * 100).toFixed(0)}% success, avg score ${pb.avgSuccessScore.toFixed(1)}`);
    }
    lines.push('');
  }

  if (longTerm.blacklist.length > 0) {
    lines.push(`BLACKLIST (DO NOT ATTEMPT):`);
    for (const b of longTerm.blacklist.slice(0, 5)) {
      lines.push(`- [${b.type}] "${b.value}" — ${b.reason}`);
    }
    lines.push('');
  }

  if (longTerm.stuckKeywords.length > 0) {
    lines.push(`STUCK/ABANDONED KEYWORDS (avoid):`);
    lines.push(`- ${longTerm.stuckKeywords.map(k => `"${k.keyword}" (tried ${k.timesTargeted}x)`).join(', ')}`);
    lines.push('');
  }

  if (longTerm.winningKeywords.length > 0) {
    lines.push(`TOP RANKING KEYWORDS:`);
    lines.push(`- ${longTerm.winningKeywords.map(k => `"${k.keyword}" (pos ${k.bestPosition})`).join(', ')}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC API — What agents call
// ═══════════════════════════════════════════════════════════════════════

/**
 * Compile full memory context for an agent.
 * @param {string} department - "content" | "structural" | "technical" | "director"
 * @returns {{ context: string, data: object }}
 */
export async function compileMemory(department) {
  const db = await getDb();
  if (!db) {
    return { context: '(Memory unavailable — DB connection failed)', data: {} };
  }

  try {
    const [working, shortTerm, longTerm, institutional] = await Promise.all([
      getWorkingMemory(db),
      getShortTermMemory(db, department),
      getLongTermMemory(db, department),
      getInstitutionalKnowledge(db),
    ]);

    const context = buildContextString(working, shortTerm, longTerm, institutional, department);

    return {
      context,
      data: { working, shortTerm, longTerm, institutional },
    };
  } catch (err) {
    console.error('Memory Compiler error:', err.message);
    return { context: '(Memory compilation failed)', data: {} };
  }
}

/**
 * Record an action taken by an agent (for learning).
 */
export async function recordAction(department, playbook, targetSlug, description, baseline) {
  const db = await getDb();
  if (!db) return null;

  return await db.agentAction.create({
    data: { department, playbook, targetSlug, description, baseline }
  }).catch(() => null);
}

/**
 * Record a learned pattern.
 */
export async function recordPattern(type, department, pattern, confidence, evidence) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.learnedPattern.findFirst({
    where: { department, pattern }
  }).catch(() => null);

  if (existing) {
    return await db.learnedPattern.update({
      where: { id: existing.id },
      data: { timesProven: { increment: 1 }, lastSeen: new Date(), confidence }
    }).catch(() => null);
  }

  return await db.learnedPattern.create({
    data: { type, department, pattern, confidence, evidence }
  }).catch(() => null);
}

/**
 * Add a keyword to memory.
 */
export async function trackKeyword(keyword, department, cluster) {
  const db = await getDb();
  if (!db) return null;

  return await db.keywordMemory.upsert({
    where: { keyword },
    update: { lastTargeted: new Date(), timesTargeted: { increment: 1 } },
    create: { keyword, department, cluster }
  }).catch(() => null);
}

/**
 * Blacklist something that doesn't work.
 */
export async function addToBlacklist(type, value, reason) {
  const db = await getDb();
  if (!db) return null;

  return await db.blacklist.upsert({
    where: { type_value: { type, value } },
    update: { attempts: { increment: 1 }, reason },
    create: { type, value, reason }
  }).catch(() => null);
}

/**
 * Disconnect DB when done.
 */
export async function closeMemory() {
  if (prisma) await prisma.$disconnect();
}
