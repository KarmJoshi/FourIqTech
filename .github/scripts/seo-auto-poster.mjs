import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════
// 🏢 FOURIQTECH AI SEO ENGINE — V8.0 "Autonomous Agency"
// ═══════════════════════════════════════════════════════════════════════
// A fully autonomous SEO agency powered by AI.
//
// Architecture:
//   🔬 RESEARCHER   → Finds keywords, analyzes SERP, builds semantic clusters
//   🧠 AI MANAGER   → Reads all data, creates dynamic strategy briefs
//   ✍️ WRITER       → Executes the Manager's brief with creative freedom
//   ✅ QA INSPECTOR → 3-check validation (human tone, brief compliance, completeness)
//   📦 PUBLISHER    → Automated: Spider links, Schema, Sitemap, Git push
//
// Philosophy: The AI Manager makes ALL strategic decisions.
//             No hardcoded rules. No human involvement. Ever.
// ═══════════════════════════════════════════════════════════════════════

// ── Paths ──
const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '.github/knowledge_base');
const PUBLISH_LOG_PATH = path.join(process.cwd(), '.github/publish_log.json');
const CONTENT_PIPELINE_PATH = path.join(process.cwd(), '.github/content_pipeline.json');
const RESEARCH_TEMP_PATH = path.join(process.cwd(), 'seo_research_temp.md');
const GSC_REPORT_PATH = path.join(process.cwd(), '.github/gsc-reports/latest.json');
const SITEMAP_PATH = path.join(process.cwd(), 'public/sitemap.xml');
const CLUSTER_MAP_PATH = path.join(process.cwd(), '.github/knowledge_base/cluster_map.json');
const RAG_DIR = path.join(process.cwd(), '.github/knowledge_base/rag_memory');
const RAG_WINNING = path.join(RAG_DIR, 'winning_patterns.json');
const RAG_FAILED = path.join(RAG_DIR, 'failed_patterns.json');
const RAG_KEYWORD_HISTORY = path.join(RAG_DIR, 'keyword_history.json');
const RAG_ARTICLES_DIR = path.join(RAG_DIR, 'articles');
const RAG_GSC_SNAPSHOTS = path.join(RAG_DIR, 'gsc_snapshots');

// ═══════════════════════════════════════════════════════════════════════
// 🔑 MULTI-API KEY ROTATION & SMART CALL ENGINE
// ═══════════════════════════════════════════════════════════════════════
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

let currentKeyIdx = 0;
if (API_KEYS.length > 0) process.env.GEMINI_API_KEY = API_KEYS[0];
let aiClient = API_KEYS.length > 0 ? new GoogleGenAI({ apiKey: API_KEYS[0] }) : null;

function rotateKey() {
  currentKeyIdx = (currentKeyIdx + 1) % API_KEYS.length;
  const nextKey = API_KEYS[currentKeyIdx];
  process.env.GEMINI_API_KEY = nextKey;
  aiClient = new GoogleGenAI({ apiKey: nextKey });
  console.log(`   🔑 Rotated → Key #${currentKeyIdx + 1}/${API_KEYS.length}`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getModels(taskType) {
  const tasks = {
    'research':  ['gemini-2.5-flash', 'gemini-3-flash-preview'],
    'manager':   ['gemini-2.5-flash', 'gemini-3-flash-preview'],
    'writing':   ['gemini-3-flash-preview', 'gemini-2.5-flash'],
    'qa':        ['gemini-2.5-flash', 'gemini-3-flash-preview']
  };
  return tasks[taskType] || ['gemini-2.5-flash'];
}

async function smartCall(modelArray, contents, agentName = 'AI') {
  const models = Array.isArray(modelArray) ? modelArray : [modelArray];
  for (const model of models) {
    let tries = 0;
    let backoffMs = 5000;
    console.log(`   🚀 [${agentName}] Trying model: ${model}...`);
    while (tries < API_KEYS.length * 2) {
      try {
        const resp = await aiClient.models.generateContent({
          model, contents, config: { responseMimeType: "application/json" }
        });
        await sleep(3000);
        return resp.candidates[0].content.parts[0].text;
      } catch (err) {
        if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          console.log(`   ⏳ Rate limit hit! Backing off for ${backoffMs/1000}s...`);
          await sleep(backoffMs);
          tries++;
          if (tries % 2 !== 0 && API_KEYS.length > 1) rotateKey();
          else backoffMs *= 2;
          continue;
        }
        const errStr = String(err.status || err.message || '').toLowerCase();
        if (errStr.includes('404') || errStr.includes('400') || errStr.includes('503') || errStr.includes('500') || errStr.includes('high demand')) {
          console.log(`   ❌ Model ${model} unavailable. Falling back...`);
          break;
        }
        throw err;
      }
    }
  }
  throw new Error('All models and API keys exhausted.');
}

async function healedCall(agent, fn, retries = 3) {
  let lastErr = null;
  for (let i = 1; i <= retries; i++) {
    try { return await fn(lastErr); }
    catch (e) {
      console.error(`   ⚠️ [${agent}] Attempt ${i}: ${e.message?.substring(0, 120)}`);
      lastErr = e;
      if (i < retries) {
        console.log(`   🩹 [${agent}] Self-healing: cooling down for 8s...`);
        await sleep(8000);
      }
    }
  }
  throw lastErr;
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 INFRASTRUCTURE — Publish Log, Content Pipeline, GSC Loader
// ═══════════════════════════════════════════════════════════════════════
function getTodayPublishCount() {
  try {
    const log = JSON.parse(fs.readFileSync(PUBLISH_LOG_PATH, 'utf8'));
    return log[new Date().toISOString().split('T')[0]] || 0;
  } catch { return 0; }
}

function incrementPublishCount() {
  let log = {};
  try { log = JSON.parse(fs.readFileSync(PUBLISH_LOG_PATH, 'utf8')); } catch {}
  const today = new Date().toISOString().split('T')[0];
  log[today] = (log[today] || 0) + 1;
  fs.writeFileSync(PUBLISH_LOG_PATH, JSON.stringify(log, null, 2));
}

function loadContentPipeline() {
  try { return JSON.parse(fs.readFileSync(CONTENT_PIPELINE_PATH, 'utf8')); }
  catch { return { topics: [], last_updated: null }; }
}

function saveContentPipeline(pipeline) {
  pipeline.last_updated = new Date().toISOString();
  fs.writeFileSync(CONTENT_PIPELINE_PATH, JSON.stringify(pipeline, null, 2));
}

function loadGscInsights() {
  try {
    if (!fs.existsSync(GSC_REPORT_PATH)) {
      console.log('   📊 No GSC report found. Running without search data.');
      return null;
    }
    const report = JSON.parse(fs.readFileSync(GSC_REPORT_PATH, 'utf8'));
    console.log(`   📊 GSC data loaded (${report.generated_at})`);
    return report;
  } catch (e) {
    console.log(`   ⚠️ GSC report parse error. Continuing without it.`);
    return null;
  }
}

function loadKnowledgeBase() {
  let ctx = "";
  if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    console.log(`📚 Knowledge docs: ${files.length}`);
    for (const f of files) {
      ctx += `\n--- ${f} ---\n${fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, f), 'utf8')}\n`;
    }
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════
// 📦 RAG MEMORY SYSTEM — Self-Learning Brain
// ═══════════════════════════════════════════════════════════════════════
function ensureRagDirs() {
  [RAG_DIR, RAG_ARTICLES_DIR, RAG_GSC_SNAPSHOTS].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function loadRagFile(filePath, fallback = []) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

function saveRagFile(filePath, data) {
  ensureRagDirs();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function loadAndMigrateHistory() {
  const rawHistory = loadRagFile(RAG_KEYWORD_HISTORY, []);
  let mutated = false;
  const history = rawHistory.map(r => {
    if ('prediction' in r || !r.metadata) {
      mutated = true;
      const pDate = r.published_date || new Date().toISOString().split('T')[0];
      return {
        article_id: r.slug,
        metadata: {
          published_date: pDate, word_count: r.word_count || 0,
          keyword_primary: r.keyword || '', keyword_density: 0,
          internal_links_injected: 0, qa_score: r.qa_score || 0,
          human_tone_score: r.human_tone || 0, rewrite_attempts: 0,
          schema_injected: false, lead_score: 7, business_relevance: 7,
          intent_type: 'informational', cluster: r.cluster || ''
        },
        performance: {
          day1_indexed: null, day3_impressions: null, day7_ctr: null,
          day14_avg_position: null, day28_classification: "pending"
        },
        check_schedule: {
          day1_due: addDays(pDate, 1), day3_due: addDays(pDate, 3),
          day7_due: addDays(pDate, 7), day14_due: addDays(pDate, 14),
          day28_due: addDays(pDate, 28), last_checked: null
        }
      };
    }
    return r;
  });
  if (mutated) saveRagFile(RAG_KEYWORD_HISTORY, history);
  return history;
}

function saveArticleToRag(draft, brief, research, qaResult) {
  ensureRagDirs();
  const todayStr = new Date().toISOString().split('T')[0];
  const kwDensity = draft.wordCount > 0 ? Number(((draft.keywordCount / draft.wordCount) * 100).toFixed(2)) : 0;

  const record = {
    article_id: draft.slug,
    metadata: {
      published_date: todayStr, word_count: draft.wordCount,
      keyword_primary: brief.keyword, keyword_density: kwDensity,
      internal_links_injected: 0, qa_score: qaResult?.score || 0,
      human_tone_score: qaResult?.human_tone || 0, rewrite_attempts: 0,
      schema_injected: true, lead_score: 7, business_relevance: 7,
      intent_type: research?.search_intent || 'informational',
      cluster: brief.cluster || ''
    },
    performance: {
      day1_indexed: null, day3_impressions: null, day7_ctr: null,
      day14_avg_position: null, day28_classification: "pending"
    },
    check_schedule: {
      day1_due: addDays(todayStr, 1), day3_due: addDays(todayStr, 3),
      day7_due: addDays(todayStr, 7), day14_due: addDays(todayStr, 14),
      day28_due: addDays(todayStr, 28), last_checked: null
    }
  };

  const articlePath = path.join(RAG_ARTICLES_DIR, `${draft.slug}.md`);
  const articleMd = `# ${draft.title}\n\n**Keyword:** ${brief.keyword}\n**Date:** ${todayStr}\n**Words:** ${draft.wordCount}\n**QA:** ${qaResult?.score || 0}/100\n\n---\n\n${(draft.content || '').replace(/<[^>]+>/g, ' ').substring(0, 3000)}`;
  fs.writeFileSync(articlePath, articleMd);

  const history = loadAndMigrateHistory();
  history.push(record);
  saveRagFile(RAG_KEYWORD_HISTORY, history);
  console.log(`   📦 RAG: Saved "${draft.slug}" to memory (${history.length} total entries)`);
}

function getRagContext() {
  const history = loadAndMigrateHistory();
  const winning = loadRagFile(RAG_WINNING, []);
  const failed = loadRagFile(RAG_FAILED, []);
  const usedKeywords = history.map(h => h.metadata?.keyword_primary || '').filter(k => k);

  let ctx = `\nPUBLISHED KEYWORDS (${usedKeywords.length} total — DO NOT repeat):\n${usedKeywords.join(', ')}\n`;

  if (winning.length > 0) {
    const top = winning.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);
    ctx += `\nWINNING PATTERNS (replicate these styles):\n${top.map(w => `- "${w.keyword}" → ${w.word_count} words, ${w.clicks} clicks, CTR ${w.ctr}%, Pos ${w.position}`).join('\n')}\n`;
  }

  if (failed.length > 0) {
    ctx += `\nFAILED PATTERNS (avoid these approaches):\n${failed.slice(-5).map(f => `- "${f.keyword}" → QA ${f.qa_score || '?'}/100, Pos ${f.position || 'unranked'}`).join('\n')}\n`;
  }

  return ctx;
}

// ── GSC Feedback Engine ──
function runFeedbackChecks(gscInsights) {
  if (!gscInsights?.page_analysis) {
    console.log("   📊 No GSC page data available — skipping feedback checks");
    return;
  }
  const history = loadAndMigrateHistory();
  const winning = loadRagFile(RAG_WINNING, []);
  const failed = loadRagFile(RAG_FAILED, []);
  const todayStr = new Date().toISOString().split('T')[0];
  let updated = false;

  const updatedHistory = history.map(entry => {
    if (entry.performance.day28_classification !== 'pending') return entry;
    const pageData = gscInsights.page_analysis.find(p => p.page?.includes(entry.article_id));

    // Day 28 final classification
    if (todayStr >= entry.check_schedule.day28_due && entry.performance.day28_classification === 'pending') {
      const pos = pageData?.position || 999;
      const ctr = pageData?.ctr || 0;
      const imp = pageData?.impressions || 0;

      if (pos <= 10 && ctr > 2) {
        entry.performance.day28_classification = 'winner';
        winning.push({
          slug: entry.article_id, keyword: entry.metadata.keyword_primary,
          word_count: entry.metadata.word_count, qa_score: entry.metadata.qa_score,
          clicks: pageData?.clicks || 0, ctr, position: pos,
          date: entry.metadata.published_date
        });
        console.log(`   🏆 RAG: "${entry.metadata.keyword_primary}" → WINNER`);
      } else if (pos > 10 && pos <= 30) {
        entry.performance.day28_classification = 'rising';
        console.log(`   📈 RAG: "${entry.metadata.keyword_primary}" → RISING`);
      } else {
        entry.performance.day28_classification = 'failed';
        failed.push({
          slug: entry.article_id, keyword: entry.metadata.keyword_primary,
          word_count: entry.metadata.word_count, qa_score: entry.metadata.qa_score,
          position: pos === 999 ? 'unranked' : pos,
          date: entry.metadata.published_date
        });
        console.log(`   ❌ RAG: "${entry.metadata.keyword_primary}" → FAILED`);
      }
      updated = true;
    }
    return entry;
  });

  if (updated) {
    saveRagFile(RAG_KEYWORD_HISTORY, updatedHistory);
    saveRagFile(RAG_WINNING, winning);
    saveRagFile(RAG_FAILED, failed);
    console.log(`   📦 RAG: Feedback checks completed.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🕸️ SPIDER AGENT — Reverse Internal Link Injection + Orphan Detection
// ═══════════════════════════════════════════════════════════════════════
function spiderReverseLink(newSlug, newTitle, newKeyword, blogDataFile) {
  console.log(`\n🕸️ SPIDER: Reverse-linking to "${newSlug}"...`);
  let updatedBlogData = blogDataFile;
  let injectedCount = 0;
  const slugMatches = [...updatedBlogData.matchAll(/slug:\s*'([^']+)'/g)];
  const existingSlugs = slugMatches.map(m => m[1]).filter(s => s !== newSlug);
  const keywordWords = newKeyword.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  for (const slug of existingSlugs) {
    if (injectedCount >= 3) break;
    const slugIdx = updatedBlogData.indexOf(`slug: '${slug}'`);
    if (slugIdx === -1) continue;
    const contentStart = updatedBlogData.indexOf('content: `', slugIdx);
    if (contentStart === -1) continue;
    const contentEnd = updatedBlogData.indexOf('`,', contentStart + 10);
    if (contentEnd === -1) continue;
    const existingContent = updatedBlogData.substring(contentStart, contentEnd);
    if (existingContent.includes(`/blog/${newSlug}`)) continue;
    const lowerContent = existingContent.toLowerCase();
    const matchCount = keywordWords.filter(w => lowerContent.includes(w)).length;

    if (matchCount >= 2) {
      const faqMarker = existingContent.match(/<h2[^>]*>.*(?:FAQ|Frequently)/i);
      let insertPoint;
      if (faqMarker) insertPoint = existingContent.indexOf(faqMarker[0]) + contentStart;
      else {
        const lastP = existingContent.lastIndexOf('</p>');
        insertPoint = lastP > 0 ? lastP + contentStart : -1;
      }
      if (insertPoint > 0 && insertPoint < contentEnd) {
        const linkHtml = `<p>You might also find our guide on <a href="/blog/${newSlug}">${newTitle}</a> useful for deeper insights on this topic.</p>\n`;
        updatedBlogData = updatedBlogData.slice(0, insertPoint) + linkHtml + updatedBlogData.slice(insertPoint);
        injectedCount++;
        console.log(`   🔗 SPIDER: Injected link in "${slug}"`);
      }
    }
  }
  if (injectedCount === 0) console.log(`   🕸️ SPIDER: No related articles found for reverse linking.`);
  return { updated: updatedBlogData, injectedCount };
}

function detectOrphanPages(blogDataFile) {
  const slugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const orphans = [];
  for (const slug of slugs) {
    const linkPattern = new RegExp(`/blog/${slug}["']`, 'g');
    const linkCount = (blogDataFile.match(linkPattern) || []).length;
    if (linkCount <= 1) orphans.push(slug);
  }
  if (orphans.length > 0) console.log(`   🕸️ SPIDER: ${orphans.length} orphan pages detected`);
  return orphans;
}

// ═══════════════════════════════════════════════════════════════════════
// 📋 SCHEMA MARKUP INJECTION
// ═══════════════════════════════════════════════════════════════════════
function injectSchemaMarkup(draft) {
  let content = draft.content || '';
  if (content.includes('application/ld+json')) return content;

  const faqRegex = /<h3>(.*?\?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
  const faqs = [];
  let match;
  while ((match = faqRegex.exec(content)) !== null) {
    faqs.push({
      '@type': 'Question',
      name: match[1].replace(/<[^>]+>/g, ''),
      acceptedAnswer: { '@type': 'Answer', text: match[2].replace(/<[^>]+>/g, '').substring(0, 500) }
    });
  }
  if (faqs.length >= 2) {
    content += `\n<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs })}</script>`;
    console.log(`   📋 SCHEMA: FAQPage with ${faqs.length} Q&As`);
  }

  content += `\n<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: draft.title, description: draft.excerpt,
    author: { '@type': 'Organization', name: 'FouriqTech' },
    publisher: { '@type': 'Organization', name: 'FouriqTech' },
    datePublished: new Date().toISOString().split('T')[0],
    keywords: draft.keyword
  })}</script>`;
  console.log(`   📋 SCHEMA: Article schema injected`);
  return content;
}

// ═══════════════════════════════════════════════════════════════════════
// 🗺️ SITEMAP REGENERATOR
// ═══════════════════════════════════════════════════════════════════════
function regenerateFullSitemap() {
  try {
    const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
    const slugs = [...new Set([...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]))];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const staticPages = [
      { loc: 'https://www.fouriqtech.com/', freq: 'weekly', p: '1.0' },
      { loc: 'https://www.fouriqtech.com/blog', freq: 'daily', p: '0.8' },
      { loc: 'https://www.fouriqtech.com/services/custom-saas-platform-development', freq: 'monthly', p: '0.9' },
      { loc: 'https://www.fouriqtech.com/services/legacy-web-application-modernization', freq: 'monthly', p: '0.9' },
    ];
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${page.loc}</loc>\n    <changefreq>${page.freq}</changefreq>\n    <priority>${page.p}</priority>\n  </url>\n`;
    }
    for (const slug of slugs) {
      xml += `  <url>\n    <loc>https://www.fouriqtech.com/blog/${slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
    xml += `</urlset>\n`;
    fs.writeFileSync(SITEMAP_PATH, xml);
    console.log(`   🗺️ Sitemap regenerated (${staticPages.length + slugs.length} URLs)`);
  } catch (e) {
    console.error(`   ⚠️ Sitemap error: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🗺️ CLUSTER MAP — Topical Authority Tracking
// ═══════════════════════════════════════════════════════════════════════
function loadClusterMap() {
  try { return JSON.parse(fs.readFileSync(CLUSTER_MAP_PATH, 'utf8')); }
  catch { return { clusters: [] }; }
}

function updateClusterMap(brief, draft) {
  const map = loadClusterMap();
  const clusterName = brief.cluster || '';
  if (!clusterName) return;

  let cluster = map.clusters.find(c => c.cluster_name === clusterName);
  if (!cluster) {
    cluster = { cluster_name: clusterName, pillar_slug: null, pillar_published: false, supporting_articles: [], target_supporting_count: 5, cluster_complete: false };
    map.clusters.push(cluster);
  }

  if (brief.article_type === 'pillar') {
    cluster.pillar_slug = draft.slug;
    cluster.pillar_published = true;
  } else if (!cluster.supporting_articles.includes(draft.slug)) {
    cluster.supporting_articles.push(draft.slug);
  }

  if (cluster.supporting_articles.length >= cluster.target_supporting_count) cluster.cluster_complete = true;
  fs.writeFileSync(CLUSTER_MAP_PATH, JSON.stringify(map, null, 2));
  console.log(`   🗺️ CLUSTER: "${clusterName}" updated (${cluster.supporting_articles.length}/${cluster.target_supporting_count})`);
}

function getClusterContext() {
  const map = loadClusterMap();
  const incomplete = map.clusters.filter(c => !c.cluster_complete);
  if (incomplete.length === 0) return 'No existing clusters yet.';
  return incomplete.map(c => `- "${c.cluster_name}": ${c.supporting_articles.length}/${c.target_supporting_count} articles, pillar: ${c.pillar_published ? 'YES' : 'NO'}`).join('\n');
}

// ═══════════════════════════════════════════════════════════════════════
// 🔬 RESEARCHER — Keyword Discovery + SERP Analysis + Semantic Clusters
// ═══════════════════════════════════════════════════════════════════════
async function researcherAgent(existingSlugs, knowledgeCtx, ragCtx) {
  const models = getModels('research');
  console.log(`\n🔬 RESEARCHER: Deep keyword + SERP analysis...`);

  return await healedCall('Researcher', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';
    const clusterCtx = getClusterContext();

    const raw = await smartCall(models, `You are an expert SEO keyword researcher for FouriqTech, a premium web design & development agency targeting global startups and enterprises.

COMPANY CONTEXT:
${knowledgeCtx}

EXISTING BLOG SLUGS (do not duplicate): ${JSON.stringify(existingSlugs)}

${ragCtx}

CLUSTER STATUS:
${clusterCtx}

YOUR MISSION: Find ONE high-value keyword that will drive qualified leads to FouriqTech.

FouriqTech specializes in:
1. React and Next.js enterprise development
2. B2B SaaS dashboard design & optimization
3. Enterprise web application architecture
4. Legacy system modernization
5. High-performance UI/UX for data-heavy products

REQUIREMENTS:
- Pick a keyword real humans actually search for (2-5 words, natural language)
- Prioritize problem-based keywords ("react dashboard slow", "nextjs build error")
- Avoid keywords you see in the existing slugs or RAG history
- Consider filling gaps in incomplete clusters
- Analyze what top-ranking competitors cover and miss

${fix}

RETURN VALID JSON:
{
  "primary_keyword": "short, natural keyword",
  "secondary_keywords": ["variation1", "variation2", "variation3"],
  "keyword_difficulty": "low/medium/high",
  "search_intent": "informational/commercial/transactional",
  "content_angle": "What makes our article unique — one sentence",
  "competitor_gap": "What competitors are NOT covering",
  "article_type": "pillar/supporting",
  "serp_analysis": {
    "avg_word_count": 2000,
    "has_code_examples": true,
    "has_faq": true,
    "content_gaps": ["gap1", "gap2", "gap3"],
    "serp_summary": "What the top results look like"
  },
  "semantic_keywords": ["related1", "related2", "related3", "related4", "related5", "related6", "related7", "related8"]
}`, 'Researcher');

    const result = JSON.parse(raw);
    console.log(`   🎯 Keyword: "${result.primary_keyword}" [${result.keyword_difficulty}]`);
    console.log(`   🔍 Intent: ${result.search_intent}`);
    console.log(`   💡 Angle: ${result.content_angle}`);
    console.log(`   📋 Type: ${result.article_type} | SERP avg: ${result.serp_analysis?.avg_word_count || '?'} words`);
    console.log(`   🧬 Semantic cluster: ${result.semantic_keywords?.length || 0} keywords`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 🧠 AI MANAGER — The Strategic Brain (Replaces Strategist + Lead Scorer + Meta-Manager)
// ═══════════════════════════════════════════════════════════════════════
async function aiManagerAgent(research, gscInsights, ragCtx, orphanPages, existingSlugs, existingTitles, knowledgeCtx) {
  const models = getModels('manager');
  console.log(`\n🧠 AI MANAGER: Creating strategy brief...`);

  return await healedCall('AI Manager', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const gscSummary = gscInsights?.summary ? JSON.stringify(gscInsights.summary) : 'No GSC data yet — site is new.';
    const slugTitleMap = existingSlugs.map((s, i) => `/blog/${s} → "${existingTitles[i] || s}"`).join('\n');

    const raw = await smartCall(models, `You are the SEO Account Manager at FouriqTech's autonomous SEO agency. You make ALL strategic decisions. No human is involved.

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

═══ YOUR DATA SOURCES ═══

1. GOOGLE SEARCH CONSOLE PERFORMANCE:
${gscSummary}

2. RAG MEMORY (what worked and failed):
${ragCtx}

3. RESEARCHER'S FINDINGS FOR TODAY:
- Keyword: "${research.primary_keyword}"
- Secondary: ${JSON.stringify(research.secondary_keywords)}
- Intent: ${research.search_intent}
- Angle: ${research.content_angle}
- Competitor Gap: ${research.competitor_gap}
- Article Type: ${research.article_type}
- SERP Data: ${JSON.stringify(research.serp_analysis)}
- Semantic Keywords: ${JSON.stringify(research.semantic_keywords)}

4. CLUSTER STATUS:
${getClusterContext()}

5. ORPHAN PAGES (need internal links): ${orphanPages.length > 0 ? orphanPages.join(', ') : 'None'}

6. EXISTING PAGES:
${slugTitleMap}

7. COMPANY CONTEXT:
${knowledgeCtx}

═══ YOUR JOB ═══

Think like a real SEO account manager. Based on ALL the data above, create a strategy brief for today's article. Consider:

- Is this keyword worth pursuing? If not, suggest a better one.
- What tone should the article use? (casual, technical, authoritative, storytelling)
- How long should it be? IMPORTANT: The Writer produces articles in a single generation. Set realistic targets between 1200-1800 words. Anything above 2000 will get cut short. Use the SERP data as a reference but stay within this practical range.
- Which existing pages should it link to? (pick 3-5 from the list above)
- What specific angle beats the competition?
- Should we prioritize filling a cluster gap or starting a new topic?

You are the boss. The Writer will follow YOUR instructions exactly. Make them specific and actionable.

${fix}

RETURN VALID JSON:
{
  "decision": "publish/skip",
  "skip_reason": "only if decision is skip",
  "keyword": "the primary keyword to target",
  "article_title": "compelling SEO-optimized title",
  "cluster": "topic cluster name",
  "article_type": "pillar/supporting",
  "target_words": 1500,
  "tone": "Describe the exact tone and voice in one sentence",
  "angle": "Specific angle that beats competitors — 2-3 sentences",
  "structure_notes": "Brief structure guidance, NOT a rigid 25-section outline",
  "internal_links": ["/blog/slug1", "/blog/slug2", "/blog/slug3"],
  "external_links": ["https://relevant-authority-source.com"],
  "semantic_keywords_to_use": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "special_instructions": "Any specific instructions based on today's data",
  "reasoning": "Why you made these decisions — 2-3 sentences"
}`, 'AI Manager');

    const result = JSON.parse(raw);
    console.log(`   🧠 Decision: ${result.decision?.toUpperCase()}`);
    console.log(`   📝 Title: "${result.article_title}"`);
    console.log(`   🎯 Keyword: "${result.keyword}"`);
    console.log(`   🏗️ Cluster: ${result.cluster}`);
    console.log(`   📏 Target: ${result.target_words} words | Tone: ${result.tone}`);
    console.log(`   🔗 Links: ${result.internal_links?.length || 0} internal + ${result.external_links?.length || 0} external`);
    console.log(`   💭 Reasoning: ${result.reasoning}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ✍️ WRITER — Creative Content Engine (No Rigid Rules)
// ═══════════════════════════════════════════════════════════════════════
async function writerAgent(brief, knowledgeCtx) {
  const models = getModels('writing');
  console.log(`\n✍️ WRITER: Producing content...`);

  return await healedCall('Writer', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON with HTML content.` : '';

    const raw = await smartCall(models, `You are a senior engineer at FouriqTech writing a blog post. You are NOT a content writer — you are an engineer who happens to be sharing what you know.

THE MANAGER'S BRIEF:
- Title: "${brief.article_title}"
- Keyword: "${brief.keyword}"
- Target Length: ~${brief.target_words} words
- Tone: ${brief.tone}
- Angle: ${brief.angle}
- Structure: ${brief.structure_notes}
- Link to these pages: ${JSON.stringify(brief.internal_links)}
- External sources: ${JSON.stringify(brief.external_links)}
- Work in these related terms naturally: ${JSON.stringify(brief.semantic_keywords_to_use)}
- Special notes: ${brief.special_instructions || 'None'}

COMPANY FACTS (reference when relevant):
${knowledgeCtx}

═══ HOW TO WRITE ═══

Write like you're explaining something to a fellow senior engineer over coffee. Here's what that sounds like:

"We had a dashboard rendering 8000 candlesticks every 500ms via WebSocket. React re-rendered the entire chart on every tick. By tick 200 the browser tab was consuming 1.4GB of RAM. We tried React.memo first. Obviously. Didn't help — the data reference was new on every message. What actually worked: move the chart off the React render cycle entirely. OffscreenCanvas in a Web Worker."

Notice:
- Starts with a real situation, not a definition
- Uses specific numbers (8000, 500ms, 1.4GB)
- Shows what failed before what worked
- Short sentences mixed with longer ones
- No corporate fluff

DO:
- Start mid-thought. Jump right into the problem or scenario.
- Use real numbers, metrics, and tool names
- Share what FAILED before sharing the solution
- Name specific tradeoffs and downsides
- Use contractions (don't, won't, it's)
- Vary sentence length wildly
- Include 1-2 code examples if relevant
- Include a FAQ section with casual, direct answers
- Link naturally to the internal pages from the brief

DON'T:
- Start with "In today's world" or any generic intro
- Define basic concepts (reader is a senior engineer)
- Use filler words: comprehensive, leverage, seamless, holistic, cutting-edge, robust, delve, crucial, transformative, navigate, paradigm
- Write walls of text — keep paragraphs short (3-4 sentences max)
- Force the keyword unnaturally — use it where it flows

Format in semantic HTML. No markdown. Use <h1>, <h2>, <h3>, <p>, <ul>, <li>, <pre><code>, <blockquote>, <a href>.

${fix}

RETURN VALID JSON:
{
  "title": "Article title",
  "slug": "url-friendly-slug",
  "excerpt": "One compelling sentence for search results",
  "category": "Category name",
  "content": "<h1>...</h1><p>...</p>...(full HTML article)..."
}`, 'Writer');

    const result = JSON.parse(raw);
    const wordCount = result.content?.split(/\s+/).length || 0;
    const kwCount = (result.content?.toLowerCase().match(new RegExp(brief.keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

    console.log(`   📄 "${result.title}" (${wordCount} words)`);
    console.log(`   🔑 Keyword "${brief.keyword}" appears ${kwCount} times`);
    return { ...result, wordCount, keywordCount: kwCount };
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ✅ QA INSPECTOR — 3 Simple Checks, No Rewrite Loop
// ═══════════════════════════════════════════════════════════════════════
async function qaAgent(draft, brief) {
  const models = getModels('qa');
  console.log(`\n✅ QA INSPECTOR: Validating article...`);

  return await healedCall('QA Inspector', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(models, `You are the editorial quality gate for FouriqTech's engineering blog. You have THREE jobs:

ARTICLE TO REVIEW (first 8000 chars):
${(draft.content || '').substring(0, 8000)}

ARTICLE METADATA:
- Word Count: ${draft.wordCount}
- Target Words: ${brief.target_words}
- Target Keyword: "${brief.keyword}" (appears ${draft.keywordCount} times)
- Manager's Tone Instruction: "${brief.tone}"
- Manager's Angle: "${brief.angle}"

═══ CHECK 1: HUMAN READABILITY (most important) ═══
Does this read like a real human engineer wrote it?
- Does it start mid-thought (not with a generic intro)?
- Are there specific numbers, metrics, or tool names?
- Does it mention failures or tradeoffs (not just the happy path)?
- Are sentence lengths varied?
- Is it free of corporate AI buzzwords (comprehensive, leverage, seamless, robust, holistic, etc)?
Score 1-10. Below 5 = automatic fail.

═══ CHECK 2: BRIEF COMPLIANCE ═══
Did the Writer follow the Manager's brief?
- Is the tone roughly what was requested?
- Is the angle covered?
- Are internal links present?
- Is the word count in a reasonable range (±30% of target)?
Score 1-10. Below 4 = automatic fail.

═══ CHECK 3: COMPLETENESS ═══
Is the article structurally complete?
- Has a clear beginning (not a definition, but a hook)
- Has substantive technical content in the middle
- Has a conclusion or call-to-action
- Has at least a basic FAQ section
Score 1-10. Below 4 = automatic fail.

OVERALL: Average the 3 scores. Article passes if overall >= 6/10 AND no individual score is below its fail threshold.

Be FAIR. If the article is genuinely good and sounds human, pass it. Don't nitpick.

${fix}

RETURN VALID JSON:
{
  "human_tone": 0,
  "brief_compliance": 0,
  "completeness": 0,
  "score": 0,
  "passed": false,
  "issues": ["issue1 if any"],
  "summary": "One-line quality verdict"
}`, 'QA Inspector');

    const result = JSON.parse(raw);
    // Recalculate overall score
    const avg = Math.round(((result.human_tone || 0) + (result.brief_compliance || 0) + (result.completeness || 0)) / 3 * 10);
    result.score = avg;
    result.passed = avg >= 60 && (result.human_tone || 0) >= 5 && (result.brief_compliance || 0) >= 4 && (result.completeness || 0) >= 4;

    console.log(`   📊 Human Tone: ${result.human_tone}/10 | Brief: ${result.brief_compliance}/10 | Complete: ${result.completeness}/10`);
    console.log(`   📊 Overall: ${result.score}/100 ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.issues?.length > 0) console.log(`   🔍 Issues: ${result.issues.join('; ')}`);
    console.log(`   💬 ${result.summary}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 📝 RESEARCH LOG WRITER
// ═══════════════════════════════════════════════════════════════════════
function writeResearchLog(research, brief, qa) {
  try {
    const content = `# SEO Engine V8 — Research Log

> **Generated:** ${new Date().toISOString()}

---

## 🔬 Research
**Keyword:** ${research.primary_keyword}
**Intent:** ${research.search_intent}
**Angle:** ${research.content_angle}
**SERP Avg:** ${research.serp_analysis?.avg_word_count || '?'} words
**Gaps:** ${(research.serp_analysis?.content_gaps || []).join(', ')}

---

## 🧠 Manager's Strategy
**Decision:** ${brief?.decision || 'N/A'}
**Title:** ${brief?.article_title || 'N/A'}
**Target:** ${brief?.target_words || '?'} words
**Tone:** ${brief?.tone || 'N/A'}
**Angle:** ${brief?.angle || 'N/A'}
**Reasoning:** ${brief?.reasoning || 'N/A'}

---

## ✅ QA Result
${qa ? `**Score:** ${qa.score}/100 ${qa.passed ? '✅ PASSED' : '❌ FAILED'}
**Human Tone:** ${qa.human_tone}/10
**Brief Compliance:** ${qa.brief_compliance}/10
**Completeness:** ${qa.completeness}/10
**Summary:** ${qa.summary}` : '*(Not yet evaluated)*'}
`;
    fs.writeFileSync(RESEARCH_TEMP_PATH, content);
  } catch (err) {
    console.error('❌ Failed to write research log:', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN ENGINE — The Autonomous Pipeline
// ═══════════════════════════════════════════════════════════════════════
async function engine() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🧠 FOURIQTECH SEO ENGINE V8.0 — Autonomous Agency     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys: ${API_KEYS.length}`);

  if (API_KEYS.length === 0) {
    console.error('❌ No API keys. Set GEMINI_API_KEYS. Exiting.');
    process.exit(1);
  }

  // Sync sitemap at start
  try { regenerateFullSitemap(); } catch {}

  // Check daily limit
  const todayCount = getTodayPublishCount();
  console.log(`📰 Published today: ${todayCount}/1`);
  if (todayCount >= 1) {
    console.log('🧠 Daily limit reached. Signing off. ✅');
    process.exit(0);
  }

  // Load all context
  const gscInsights = loadGscInsights();
  const knowledgeCtx = loadKnowledgeBase();
  const ragCtx = getRagContext();

  // Run feedback checks
  console.log(`\n📦 RAG: Running feedback checks...`);
  runFeedbackChecks(gscInsights);

  // Load blog data
  let blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  const existingSlugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const existingTitles = [...blogDataFile.matchAll(/title:\s*'([^']+)'/g)].map(m => m[1]);
  const orphanPages = detectOrphanPages(blogDataFile);
  console.log(`📰 Existing posts: ${existingSlugs.length}`);

  // ══════════════════════════════════════
  // Stage 1: RESEARCHER
  // ══════════════════════════════════════
  let research;
  try { research = await researcherAgent(existingSlugs, knowledgeCtx, ragCtx); }
  catch (e) {
    console.error('❌ Researcher failed:', e.message);
    process.exit(1);
  }

  // ══════════════════════════════════════
  // Stage 2: AI MANAGER (Strategy)
  // ══════════════════════════════════════
  let brief;
  try { brief = await aiManagerAgent(research, gscInsights, ragCtx, orphanPages, existingSlugs, existingTitles, knowledgeCtx); }
  catch (e) {
    console.error('❌ AI Manager failed:', e.message);
    process.exit(1);
  }

  // Manager decided to skip?
  if (brief.decision === 'skip') {
    console.log(`\n🧠 MANAGER: Decided to SKIP today.`);
    console.log(`   📋 Reason: ${brief.skip_reason}`);
    writeResearchLog(research, brief, null);
    process.exit(0);
  }

  // Save future topics to content pipeline
  if (research.semantic_keywords?.length > 0) {
    const pipeline = loadContentPipeline();
    const existingTopics = new Set(pipeline.topics.map(t => t.title));
    for (const kw of research.semantic_keywords) {
      if (!existingTopics.has(kw)) {
        pipeline.topics.push({ title: kw, cluster: brief.cluster, added_date: new Date().toISOString().split('T')[0], status: 'queued' });
      }
    }
    saveContentPipeline(pipeline);
  }

  // ══════════════════════════════════════
  // Stage 3: WRITER
  // ══════════════════════════════════════
  let draft;
  try { draft = await writerAgent(brief, knowledgeCtx); }
  catch (e) {
    console.error('❌ Writer failed:', e.message);
    writeResearchLog(research, brief, null);
    process.exit(1);
  }

  // ══════════════════════════════════════
  // Stage 4: QA INSPECTOR (Pass or Skip — No Loop)
  // ══════════════════════════════════════
  let qa;
  try { qa = await qaAgent(draft, brief); }
  catch (e) {
    console.error('⚠️ QA failed. Skipping this article to be safe.');
    writeResearchLog(research, brief, null);
    process.exit(0);
  }

  writeResearchLog(research, brief, qa);

  // ══════════════════════════════════════
  // Stage 5: PUBLISH or SKIP + LEARN
  // ══════════════════════════════════════
  if (qa.passed) {
    console.log('\n📦 PUBLISHING approved content...');

    // Inject schema
    draft.content = injectSchemaMarkup(draft);
    draft.keyword = brief.keyword;

    const safe = s => (s || '').replace(/'/g, "\\'").replace(/`/g, '\\`').replace(/\${/g, '\\${');
    const newPost = `
  {
    slug: '${safe(draft.slug)}',
    title: '${safe(draft.title)}',
    excerpt: '${safe(draft.excerpt)}',
    date: '${new Date().toISOString().split('T')[0]}',
    readTime: '${Math.ceil(draft.wordCount / 200)} min read',
    category: '${safe(draft.category)}',
    author: 'FouriqTech Engineering',
    content: \`
      ${(draft.content || '').replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
  },`;

    let updated = blogDataFile.replace(
      'export const blogPosts: BlogPost[] = [',
      `export const blogPosts: BlogPost[] = [${newPost}`
    );

    // Spider: reverse link injection
    const spiderRes = spiderReverseLink(draft.slug, draft.title, brief.keyword, updated);
    updated = spiderRes.updated;

    fs.writeFileSync(BLOG_DATA_PATH, updated);
    incrementPublishCount();
    regenerateFullSitemap();
    saveArticleToRag(draft, brief, research, qa);
    updateClusterMap(brief, draft);

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📋 V8 RUN REPORT — ✅ PUBLISHED                        ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  📝 "${draft.title}"`);
    console.log(`║  🎯 Keyword: "${brief.keyword}"`);
    console.log(`║  📊 QA: ${qa.score}/100 | Human Tone: ${qa.human_tone}/10`);
    console.log(`║  📏 Words: ${draft.wordCount}`);
    console.log(`║  🏗️ Cluster: ${brief.cluster}`);
    console.log(`║  🕸️ Spider: ${spiderRes.injectedCount} reverse links`);
    console.log(`║  🔗 /blog/${draft.slug}`);
    console.log('╚═══════════════════════════════════════════════════════════╝');
  } else {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📋 V8 RUN REPORT — 🚫 SKIPPED (Learning)              ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  QA Score: ${qa.score}/100 | Human Tone: ${qa.human_tone}/10`);
    console.log(`║  Issues: ${(qa.issues || []).join('; ')}`);
    console.log('║  Logged to RAG memory. Manager will adapt next cycle.   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    // Log the failure so Manager learns
    const failed = loadRagFile(RAG_FAILED, []);
    failed.push({
      keyword: brief.keyword, qa_score: qa.score,
      human_tone: qa.human_tone, issues: qa.issues,
      date: new Date().toISOString().split('T')[0]
    });
    saveRagFile(RAG_FAILED, failed);
  }

  console.log('\n🧠 ENGINE V8: Signing off. ✅');
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 BOOT
// ═══════════════════════════════════════════════════════════════════════
engine().catch(err => {
  console.error('💥 FATAL:', err.message?.substring(0, 300));
  process.exit(1);
});
