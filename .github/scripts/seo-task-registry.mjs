import fs from 'fs';
import path from 'path';

const CWD = process.cwd();
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const TASK_REGISTRY = path.join(MEMORY_DIR, 'task-registry.json');
const BLOG_DATA = path.join(CWD, 'src/data/blogPosts.ts');
const GSC_REPORT = path.join(CWD, '.github/gsc-reports/latest.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function ensureDir() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function extractBlogSlugs() {
  try {
    const blogData = fs.readFileSync(BLOG_DATA, 'utf8');
    return [...blogData.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
  } catch {
    return [];
  }
}

function extractTrackedSlugs() {
  const report = readJson(GSC_REPORT, {});
  const categories = report?.categories || {};
  const slugs = new Set();
  for (const items of Object.values(categories)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (item?.slug) slugs.add(item.slug);
    }
  }
  return [...slugs];
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s/-]+/)
    .filter((token) => token.length > 2);
}

function similarity(a, b) {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  return overlap / Math.max(aTokens.size, bTokens.size);
}

function normalizeTarget(value) {
  return String(value || '')
    .replace(/^https?:\/\/[^/]+\//, '')
    .replace(/^\//, '')
    .trim();
}

function classifyCollision(opportunity, slug, score) {
  const target = normalizeTarget(opportunity.target || opportunity.description);
  const playbook = String(opportunity.playbook || '').toLowerCase();
  const type = String(opportunity.type || '').toLowerCase();

  if (target === slug) {
    if (playbook === 'content_refresh' || type.includes('rewrite') || type.includes('refresh')) {
      return { severity: 'safe_refresh', blocked: false, reason: 'existing_page_refresh' };
    }
    if (playbook === 'cluster_support' || playbook === 'ctr_optimization' || type.includes('supporting') || type.includes('ctr')) {
      return { severity: 'safe_support', blocked: false, reason: 'existing_page_support' };
    }
    return { severity: 'watch', blocked: false, reason: 'same_slug_existing_asset' };
  }

  if (score >= 0.82) {
    return { severity: 'high', blocked: true, reason: 'probable_duplicate_intent' };
  }
  if (score >= 0.68) {
    return { severity: 'medium', blocked: false, reason: 'possible_overlap' };
  }
  return null;
}

export function syncTaskRegistry(opportunities = []) {
  ensureDir();
  const existing = readJson(TASK_REGISTRY, { updated_at: null, slugs: [], opportunities: [], collisions: [] });
  const slugs = [...new Set([...extractBlogSlugs(), ...extractTrackedSlugs()])].sort();

  const collisions = [];
  for (const opportunity of opportunities) {
    const target = opportunity.target || opportunity.description;
    for (const slug of slugs) {
      const score = similarity(target, slug);
      const classification = classifyCollision(opportunity, slug, score);
      if (classification) {
        collisions.push({
          opportunity_id: opportunity.id,
          target,
          existing_slug: slug,
          score: Number(score.toFixed(2)),
          department: opportunity.department,
          playbook: opportunity.playbook || null,
          severity: classification.severity,
          blocked: classification.blocked,
          reason: classification.reason,
        });
      }
    }
  }

  const snapshot = {
    updated_at: new Date().toISOString(),
    slugs,
    opportunities: opportunities.map((item) => ({
      id: item.id,
      department: item.department,
      playbook: item.playbook || null,
      target: item.target,
      description: item.description,
      score: item.score,
    })),
    collisions: collisions.slice(0, 50),
  };

  writeJson(TASK_REGISTRY, snapshot);
  return snapshot;
}

export function getTaskRegistry() {
  return readJson(TASK_REGISTRY, { updated_at: null, slugs: [], opportunities: [], collisions: [] });
}
