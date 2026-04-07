import fs from 'fs';
import path from 'path';

const CWD = process.cwd();
const BLOG_DATA = path.join(CWD, 'src/data/blogPosts.ts');
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const DUPLICATE_REPORT = path.join(MEMORY_DIR, 'duplicate-guard.json');

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

function similarity(a, b) {
  const at = new Set(tokenize(a));
  const bt = new Set(tokenize(b));
  if (at.size === 0 || bt.size === 0) return 0;
  return [...at].filter((token) => bt.has(token)).length / Math.max(at.size, bt.size);
}

function inventory() {
  try {
    const content = fs.readFileSync(BLOG_DATA, 'utf8');
    const slugs = [...content.matchAll(/slug:\s*'([^']+)'/g)].map((match) => `blog/${match[1]}`);
    const titles = [...content.matchAll(/title:\s*'([^']+)'/g)].map((match) => match[1]);
    return slugs.map((slug, index) => ({ slug, title: titles[index] || slug }));
  } catch {
    return [];
  }
}

export function buildDuplicateGuard(items = []) {
  ensureDir();
  const content = inventory();
  const report = [];

  for (const item of items) {
    const target = item.target || item.description || item.primary_keyword || '';
    const matches = content
      .map((page) => ({ slug: page.slug, title: page.title, score: Number(Math.max(similarity(target, page.slug), similarity(target, page.title)).toFixed(2)) }))
      .filter((match) => match.score >= 0.55)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    report.push({
      target,
      matches,
      verdict: matches.some((match) => match.score >= 0.85) ? 'reject_as_duplicate' : matches.length ? 'prefer_refresh_or_support' : 'safe_new',
    });
  }

  fs.writeFileSync(DUPLICATE_REPORT, JSON.stringify({ generated_at: new Date().toISOString(), report }, null, 2));
  return report;
}
