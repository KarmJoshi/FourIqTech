  import fs from 'fs';
import path from 'path';
import { buildPlaybookScores } from './seo-learning-engine.mjs';
// import { syncTaskRegistry } from './seo-task-registry.mjs';
// import { buildInternalLinkPlan } from './seo-internal-link-engine.mjs';
// import { buildRiskReport } from './seo-risk-engine.mjs';
// import { buildContentStrategy } from './seo-content-strategy-engine.mjs';
import { buildCompetitorIntelligence } from './seo-competitor-intelligence.mjs';
// import { buildDuplicateGuard } from './seo-duplicate-guard.mjs';

const CWD = process.cwd();
const GSC_REPORT = path.join(CWD, '.github/gsc-reports/latest.json');
const DIRECTOR_JOURNAL = path.join(CWD, '.github/director_journal.json');
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const SNAPSHOT_PATH = path.join(MEMORY_DIR, 'latest-opportunities.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function normalizePosition(position) {
  if (!Number.isFinite(position)) return 0;
  if (position <= 3) return 10;
  if (position <= 5) return 9;
  if (position <= 10) return 8;
  if (position <= 15) return 6;
  if (position <= 20) return 4;
  if (position <= 30) return 2;
  return 1;
}

function inferDepartment(item) {
  const text = `${item.type || ''} ${item.description || ''}`.toLowerCase();
  if (text.includes('internal link') || text.includes('supporting article') || text.includes('pillar') || text.includes('cluster')) {
    return 'structural';
  }
  if (text.includes('rewrite') || text.includes('article') || text.includes('content') || text.includes('ctr') || text.includes('title') || text.includes('meta')) {
    return 'content';
  }
  if (text.includes('schema') || text.includes('core web vitals') || text.includes('speed') || text.includes('technical') || text.includes('index') || text.includes('crawl')) {
    return 'technical';
  }
  return item.type === 'supporting_content' ? 'structural' : 'content';
}

function inferPlaybook(item, department) {
  const text = `${item.type || ''} ${item.description || ''}`.toLowerCase();
  if (text.includes('ctr') || text.includes('title') || text.includes('meta')) return 'ctr_optimization';
  if (text.includes('supporting article') || text.includes('internal link') || text.includes('cluster')) return 'cluster_support';
  if (text.includes('pillar')) return 'pillar_expansion';
  if (text.includes('rewrite') || text.includes('refresh')) return 'content_refresh';
  if (text.includes('technical') || text.includes('schema') || text.includes('crawl') || text.includes('speed')) return 'technical_fix';
  return `${department}_general`;
}

function scoreOpportunity(item) {
  const clicks = Number(item.clicks || 0);
  const impressions = Number(item.impressions || 0);
  const ctr = Number(item.ctr || 0);
  const position = Number(item.position || 100);
  const priority = item.priority || 'P2';

  const impact = clamp((Math.log10(impressions + 10) * 2.8) + (position <= 15 ? 2 : 0), 1, 10);
  const confidence = clamp((position <= 15 ? 4 : 2) + (impressions >= 50 ? 2 : 0) + (ctr < 2 ? 1 : 0), 1, 10);
  const businessValueBase = priority === 'P0' ? 9 : priority === 'P1' ? 7 : 5;
  const serviceBonus = (item.target?.includes('/services/') || item.description?.toLowerCase().includes('service')) ? 2 : 0;
  const businessValue = clamp(businessValueBase + serviceBonus, 1, 10);
  
  const effort = clamp(
    (item.type === 'technical_fix' ? 6 : 0) +
    (item.type === 'supporting_content' ? 5 : 0) +
    (item.type === 'refresh' || item.type === 'ctr_optimization' ? 3 : 0) +
    (clicks === 0 && position > 20 ? 1 : 0),
    2,
    10
  );

  const urgency = clamp((position <= 10 ? 3 : position <= 20 ? 2 : 1) + (ctr < 1 ? 2 : 0), 1, 10);
  const score = Number((((impact * confidence * businessValue) / effort) + urgency).toFixed(2));

  return {
    impact: Number(impact.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    business_value: Number(businessValue.toFixed(2)),
    effort: Number(effort.toFixed(2)),
    urgency: Number(urgency.toFixed(2)),
    score,
    position_score: normalizePosition(position),
  };
}

function scoreDepartmentMix(opportunities) {
  const departments = {
    content: { score: 0, opportunities: [] },
    structural: { score: 0, opportunities: [] },
    technical: { score: 0, opportunities: [] },
  };

  for (const opportunity of opportunities) {
    const department = opportunity.department;
    if (!departments[department]) continue;
    departments[department].score += opportunity.score;
    departments[department].opportunities.push(opportunity);
  }

  for (const department of Object.keys(departments)) {
    departments[department].score = Number(departments[department].score.toFixed(2));
    departments[department].opportunities = departments[department].opportunities
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  return departments;
}

function addFallbackTechnicalOpportunity(report) {
  const underperformers = report?.categories?.underperformers || [];
  if (underperformers.length === 0) return [];

  return [{
    priority: 'P1',
    type: 'technical_fix',
    description: `Audit technical blockers for ${underperformers[0].slug || 'underperforming pages'} before further content investment.`,
    target: underperformers[0].page || null,
    clicks: underperformers[0].clicks || 0,
    impressions: underperformers[0].impressions || 0,
    ctr: underperformers[0].ctr || 0,
    position: underperformers[0].position || 35,
  }];
}

function buildOpportunities(report) {
  const actionItems = Array.isArray(report?.action_items) ? report.action_items : [];
  const keywordOps = Array.isArray(report?.opportunity_keywords) ? report.opportunity_keywords : [];

  const normalized = [
    ...actionItems.map((item) => ({
      ...item,
      clicks: item.clicks || 0,
      impressions: item.impressions || 0,
      ctr: item.ctr || 0,
      position: item.position || 18,
    })),
    ...keywordOps.map((item) => ({
      priority: item.opportunity === 'HIGH' ? 'P0' : 'P1',
      type: 'ctr_optimization',
      description: item.action,
      target: item.query,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: item.ctr,
      position: item.position,
    })),
    ...addFallbackTechnicalOpportunity(report),
  ];

  return normalized.map((item, index) => {
    const metrics = scoreOpportunity(item);
    return {
      id: `opp-${index + 1}`,
      department: inferDepartment(item),
      priority: item.priority || 'P2',
      type: item.type || 'generic',
      description: item.description || 'Untitled opportunity',
      target: item.target || null,
      clicks: Number(item.clicks || 0),
      impressions: Number(item.impressions || 0),
      ctr: Number(item.ctr || 0),
      position: Number(item.position || 100),
      playbook: inferPlaybook(item, inferDepartment(item)),
      ...metrics,
    };
  }).sort((a, b) => b.score - a.score);
}

function getRecentDepartmentPerformance() {
  const journal = readJson(DIRECTOR_JOURNAL, { entries: [] });
  const recent = journal.entries.slice(-12);
  const stats = {
    content: { runs: 0, success: 0 },
    structural: { runs: 0, success: 0 },
    technical: { runs: 0, success: 0 },
  };

  for (const entry of recent) {
    const department = entry.decision;
    if (!stats[department]) continue;
    stats[department].runs += 1;
    if (entry.dispatch_success) stats[department].success += 1;
  }

  return stats;
}

function buildPlaybookIndex() {
  const scores = buildPlaybookScores();
  return Object.fromEntries(scores.map((item) => [item.playbook, item]));
}

export async function buildOpportunitySnapshot() {
  const pkgPrisma = await import('@prisma/client');
  const { PrismaClient } = pkgPrisma.default || pkgPrisma;
  
  let prisma;
  try {
    prisma = new PrismaClient();
    await prisma.$connect();
  } catch {
    const pkgPg = await import('pg');
    const { Pool } = pkgPg.default || pkgPg;
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }

  const latestGsc = await prisma.searchPerformance.findFirst({
    orderBy: { generatedAt: 'desc' }
  });

  const report = latestGsc?.fullReport || {};
  const opportunities = buildOpportunities(report);
  const registry = { collisions: [] }; // syncTaskRegistry(opportunities);
  const performance = getRecentDepartmentPerformance();
  const playbooks = buildPlaybookIndex();
  const internalLinks = { plans: [] }; // buildInternalLinkPlan();
  const contentStrategy = { briefs: [] }; // buildContentStrategy();
  const duplicateGuard = []; // buildDuplicateGuard([...]);

  const blockedIds = new Set(registry.collisions.filter((item) => item.blocked).map((item) => item.opportunity_id));
  const warnIds = new Set(registry.collisions.filter((item) => !item.blocked && item.severity === 'medium').map((item) => item.opportunity_id));

  for (const opportunity of opportunities) {
    if (blockedIds.has(opportunity.id)) {
      opportunity.score = Number((opportunity.score * 0.35).toFixed(2));
      opportunity.risk_flag = 'probable_duplicate_intent';
      opportunity.risk_level = 'high';
    } else if (warnIds.has(opportunity.id)) {
      opportunity.score = Number((opportunity.score * 0.82).toFixed(2));
      opportunity.risk_flag = 'possible_overlap';
      opportunity.risk_level = 'medium';
    } else {
      opportunity.risk_level = 'low';
    }
  }

  const departments = scoreDepartmentMix(opportunities);
  const riskReport = { risks: [] }; // buildRiskReport(opportunities);

  for (const department of Object.keys(departments)) {
    const runs = performance[department].runs;
    const successRate = runs > 0 ? performance[department].success / runs : 0.6;
    const playbook = playbooks[department];
    const playbookBonus = playbook ? Math.max(-0.15, Math.min(0.25, (playbook.average_success || 0) / 20)) : 0;
    const multiplier = 0.85 + successRate * 0.3 + playbookBonus;
    departments[department].adjusted_score = Number((departments[department].score * multiplier).toFixed(2));
    departments[department].recent_runs = runs;
    departments[department].recent_success_rate = Number((successRate * 100).toFixed(1));
    departments[department].playbook_average_success = playbook?.average_success || 0;
  }

  const rankedDepartments = Object.entries(departments)
    .map(([department, data]) => ({ department, ...data }))
    .sort((a, b) => b.adjusted_score - a.adjusted_score);

  const snapshot = {
    generated_at: new Date().toISOString(),
    source: 'postgresql_search_performance',
    top_opportunities: opportunities.slice(0, 10),
    collisions: registry.collisions.slice(0, 10),
    blocked_collisions: registry.collisions.filter((item) => item.blocked).slice(0, 10),
    internal_link_plan: internalLinks.plans.slice(0, 8),
    risk_report: riskReport,
    content_strategy: contentStrategy,
    duplicate_guard: duplicateGuard,
    departments: rankedDepartments,
    recommended_department: rankedDepartments[0]?.department || 'content',
    recommended_orders: rankedDepartments[0]?.opportunities?.slice(0, 3).map(item => item.description) || [],
  };

  await prisma.$disconnect();

  ensureMemoryDir();
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  return snapshot;
}
