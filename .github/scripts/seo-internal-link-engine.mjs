import fs from 'fs';
import path from 'path';

const CWD = process.cwd();
const BLOG_DATA = path.join(CWD, 'src/data/blogPosts.ts');
const APP_TSX = path.join(CWD, 'src/App.tsx');
const GSC_REPORT = path.join(CWD, '.github/gsc-reports/latest.json');
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const LINK_PLAN = path.join(MEMORY_DIR, 'internal-link-plan.json');

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

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s/-]+/)
    .filter((token) => token.length > 2);
}

function overlapScore(a, b) {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  return overlap / Math.max(aTokens.size, bTokens.size);
}

function extractBlogEntries() {
  try {
    const content = fs.readFileSync(BLOG_DATA, 'utf8');
    const entries = [];
    const slugRegex = /slug:\s*'([^']+)'/g;
    const titleRegex = /title:\s*'([^']+)'/g;
    const slugs = [...content.matchAll(slugRegex)].map((match) => match[1]);
    const titles = [...content.matchAll(titleRegex)].map((match) => match[1]);
    for (let index = 0; index < Math.min(slugs.length, titles.length); index += 1) {
      entries.push({ slug: `blog/${slugs[index]}`, title: titles[index] });
    }
    return entries;
  } catch {
    return [];
  }
}

function extractServiceRoutes() {
  try {
    const content = fs.readFileSync(APP_TSX, 'utf8');
    return [...content.matchAll(/path="(\/services\/[^\"]+)"/g)].map((match) => ({
      slug: match[1].replace(/^\//, ''),
      title: match[1].split('/').pop()?.replace(/-/g, ' ') || match[1],
      type: 'service',
    }));
  } catch {
    return [];
  }
}

function extractGscLeaders() {
  const report = readJson(GSC_REPORT, {});
  const rising = report?.categories?.rising_stars || [];
  return rising.slice(0, 8).map((item) => ({
    slug: item.slug,
    title: item.slug,
    impressions: item.impressions || 0,
    position: item.position || 100,
    page: item.page || null,
    type: item.isTargeted ? 'service' : 'blog',
  }));
}

export function buildInternalLinkPlan() {
  ensureDir();
  const blogEntries = extractBlogEntries();
  const services = extractServiceRoutes();
  const rising = extractGscLeaders();
  const sources = [...blogEntries, ...services];

  const plans = [];

  for (const target of rising) {
    const candidates = sources
      .filter((source) => source.slug !== target.slug)
      .map((source) => ({
        source: source.slug,
        source_title: source.title,
        target: target.slug,
        target_page: target.page,
        overlap: Number(overlapScore(source.title, target.title || target.slug).toFixed(2)),
        target_position: target.position,
        target_impressions: target.impressions,
      }))
      .filter((candidate) => candidate.overlap >= 0.18)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 5);

    if (candidates.length > 0) {
      plans.push({
        target: target.slug,
        target_page: target.page,
        target_position: target.position,
        target_impressions: target.impressions,
        suggested_sources: candidates,
        anchor_direction: `Use natural descriptive anchors related to ${target.slug.replace(/[-/]/g, ' ')}`,
      });
    }
  }

  const snapshot = {
    generated_at: new Date().toISOString(),
    plans,
  };

  fs.writeFileSync(LINK_PLAN, JSON.stringify(snapshot, null, 2));
  return snapshot;
}
