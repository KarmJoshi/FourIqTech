import fs from 'fs';
import path from 'path';

const CWD = process.cwd();
const BLOG_DATA = path.join(CWD, 'src/data/blogPosts.ts');
const GSC_REPORT = path.join(CWD, '.github/gsc-reports/latest.json');
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const CONTENT_STRATEGY = path.join(MEMORY_DIR, 'content-strategy.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function ensureDir() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function extractBlogInventory() {
  try {
    const content = fs.readFileSync(BLOG_DATA, 'utf8');
    const slugs = [...content.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
    const titles = [...content.matchAll(/title:\s*'([^']+)'/g)].map((match) => match[1]);
    return slugs.map((slug, index) => ({ slug: `blog/${slug}`, title: titles[index] || slug }));
  } catch {
    return [];
  }
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s/-]+/)
    .filter((token) => token.length > 2);
}

function buildBriefFromPage(page) {
  const tokens = tokenize(page.slug);
  const primary = tokens.slice(0, 4).join(' ');
  const secondary = tokens.slice(2, 7).join(' ');
  return {
    target_slug: page.slug,
    target_page: page.page,
    brief_type: 'refresh_or_support',
    primary_keyword: primary,
    secondary_keywords: [secondary].filter(Boolean),
    search_intent: page.isTargeted ? 'commercial' : 'informational',
    objective: page.position <= 10 ? 'Push high-potential page into stronger page-1 positions' : 'Improve visibility and CTR',
    recommended_format: page.isTargeted ? 'support_article_or_case_study' : 'refresh_existing_article',
  };
}

export function buildContentStrategy() {
  ensureDir();
  const report = readJson(GSC_REPORT, {});
  const inventory = extractBlogInventory();
  const rising = report?.categories?.rising_stars || [];
  const underperformers = report?.categories?.underperformers || [];

  const briefs = rising.slice(0, 8).map((page) => buildBriefFromPage(page));
  const refreshQueue = underperformers.slice(0, 8).map((page) => ({
    slug: page.slug,
    page: page.page,
    position: page.position,
    impressions: page.impressions,
    action: 'refresh_or_consolidate',
    reason: page.action,
  }));

  const pruneCandidates = underperformers
    .filter((page) => Number(page.impressions || 0) < 5 && Number(page.position || 100) > 25)
    .map((page) => ({
      slug: page.slug,
      page: page.page,
      reason: 'Low impressions and weak rankings indicate weak standalone value.',
      action: 'consider_prune_or_merge',
    }));

  const snapshot = {
    generated_at: new Date().toISOString(),
    inventory_count: inventory.length,
    briefs,
    refresh_queue: refreshQueue,
    prune_candidates: pruneCandidates,
  };

  fs.writeFileSync(CONTENT_STRATEGY, JSON.stringify(snapshot, null, 2));
  return snapshot;
}
