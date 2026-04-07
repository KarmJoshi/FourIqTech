import fs from 'fs';
import path from 'path';
import { search } from 'duck-duck-scrape';

const CWD = process.cwd();
const GSC_REPORT = path.join(CWD, '.github/gsc-reports/latest.json');
const BLOG_DATA = path.join(CWD, 'src/data/blogPosts.ts');
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const COMPETITOR_REPORT = path.join(MEMORY_DIR, 'competitor-intelligence.json');

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

function blogInventory() {
  try {
    const content = fs.readFileSync(BLOG_DATA, 'utf8');
    return [...content.matchAll(/slug:\s*'([^']+)'/g)].map((match) => `blog/${match[1]}`);
  } catch {
    return [];
  }
}

function overlap(query, title) {
  const q = new Set(tokenize(query));
  const t = new Set(tokenize(title));
  if (q.size === 0 || t.size === 0) return 0;
  return [...q].filter((token) => t.has(token)).length / Math.max(q.size, t.size);
}

function chooseQueries() {
  const report = readJson(GSC_REPORT, {});
  const keywordOps = report?.opportunity_keywords || [];
  const rising = report?.categories?.rising_stars || [];

  const queries = [
    ...keywordOps.map((item) => item.query),
    ...rising.slice(0, 5).map((item) => item.slug?.replace(/^blog\//, '').replace(/-/g, ' ')),
  ].filter(Boolean);

  return [...new Set(queries)].slice(0, 6);
}

export async function buildCompetitorIntelligence() {
  ensureDir();
  const inventory = blogInventory();
  const queries = chooseQueries();
  const results = [];

  for (const query of queries) {
    try {
      const serp = await search(query, { locale: 'en-us', safeSearch: 1 });
      const top = (serp.results || []).slice(0, 5).map((item) => ({
        title: item.title,
        url: item.url,
        hostname: item.hostname,
        description: item.description,
        overlap: Number(overlap(query, item.title).toFixed(2)),
      }));

      const exactInventoryMatches = inventory.filter((slug) => overlap(query, slug) >= 0.45);

      results.push({
        query,
        our_coverage: exactInventoryMatches,
        competitor_results: top,
        gap_signal: exactInventoryMatches.length === 0 ? 'missing_coverage' : 'needs_better_angle',
      });
    } catch (error) {
      results.push({
        query,
        error: error.message,
        competitor_results: [],
        our_coverage: [],
        gap_signal: 'lookup_failed',
      });
    }
  }

  const snapshot = {
    generated_at: new Date().toISOString(),
    queries: results,
  };

  fs.writeFileSync(COMPETITOR_REPORT, JSON.stringify(snapshot, null, 2));
  return snapshot;
}
