import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';
import crypto from 'crypto';
import { submitToStaging, logActivity, getModelsForRole } from './agency-core.mjs';
import { spawn } from 'child_process';

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

// 💡 SEO SERVICE MAPPING — For Internal Link Hardening
const SERVICE_PAGES = [
  { keywords: ['saas', 'custom platform', 'product development', 'software architecture'], url: '/services/custom-saas-platform-development', title: 'Custom SaaS Platform Development' },
  { keywords: ['modernization', 'legacy', 'strangler fig', 'refactoring', 'technical debt'], url: '/services/legacy-web-application-modernization', title: 'Legacy Web Application Modernization' },
  { keywords: ['performance', 'optimization', 'latency', 'core web vitals', 'speed'], url: '/blog/nextjs-enterprise-performance-optimization-scalability-speed', title: 'Next.js Enterprise Performance Optimization' },
  { keywords: ['design system', 'ui/ux', 'atomic design', 'component library'], url: '/blog/enterprise-react-design-system-implementation', title: 'Enterprise React Design System Implementation' }
];
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
// ── API KEY ROTATION ──
const PRO_KEY = process.env.GEMINI_PRO_API_KEY || '';
const OTHER_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .replace(/["']/g, '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

// Prioritize Pro Key (Billed) and deduplicate with others
const API_KEYS = [...new Set([PRO_KEY, ...OTHER_KEYS])].filter(k => k.length > 0);

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

async function getModels(taskType) {
  // Map local task names to the global roles defined in the Matrix UI
  const roleMap = { 
    writing: 'writer', 
    research: 'researcher', 
    manager: 'content_manager', // Now uses the granular content strategist role
    qa: 'qa' 
  };
  const targetRole = roleMap[taskType] || taskType;
  return await getModelsForRole(targetRole);
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
          model, contents, config: { 
            responseMimeType: "application/json", 
            maxOutputTokens: 8192,
            tools: [{ googleSearch: {} }]
          }
        });
        await sleep(3000);
        return resp.candidates[0].content.parts[0].text;
      } catch (err) {
        if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          console.log(`   ⏳ Rate limit hit! Backing off for ${backoffMs / 1000}s...`);
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

function getWeeklyPublishCount() {
  try {
    const log = JSON.parse(fs.readFileSync(PUBLISH_LOG_PATH, 'utf8'));
    const now = new Date();
    return Object.keys(log).filter(date => {
      const diff = now - new Date(date);
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).reduce((sum, date) => sum + log[date], 0);
  } catch { return 0; }
}

function incrementPublishCount() {
  let log = {};
  try { log = JSON.parse(fs.readFileSync(PUBLISH_LOG_PATH, 'utf8')); } catch { }
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
// 🕸️ SPIDER AGENT — Internal Link Hardening (Forward & Reverse)
// ═══════════════════════════════════════════════════════════════════════

/**
 * SPIDER FORWARD: Injects links TO existing articles/services INTO the new draft.
 */
// Helper: derive short, natural anchor text (2-5 words) from a blog title
function shortAnchorText(title) {
  // Strip common filler words and take first 3-4 meaningful words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'with', 'how', 'why', 'what', 'is', 'are', 'as']);
  const words = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  return words.slice(0, 3).join(' ') || title.split(' ').slice(0, 3).join(' ');
}

function spiderForwardLink(content, brief, blogDataFile) {
  console.log(`\n🕸️ SPIDER: Forward-linking from new article...`);
  let updatedContent = content;
  let linksAdded = 0;

  // 1. Check for Service Page matches first (High Value) — use short anchor text
  for (const service of SERVICE_PAGES) {
    if (linksAdded >= 1) break; // Max 1 service link per post
    const match = service.keywords.find(kw => updatedContent.toLowerCase().includes(kw));
    if (match && !updatedContent.includes(service.url)) {
      // Use the matched keyword itself (2-4 words) as the anchor, not the full title
      const anchorText = match;
      const regex = new RegExp(`(?<!<a[^>]*>)(${match})`, 'gi');
      updatedContent = updatedContent.replace(regex, `<a href="${service.url}">${anchorText}</a>`);
      linksAdded++;
      console.log(`   🔗 SPIDER: Linked to Service with anchor: "${anchorText}"`);
    }
  }

  // 2. Check for Pillar/Related Blog matches — Max 3 total, short natural anchor text
  const slugMatches = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)];
  const titleMatches = [...blogDataFile.matchAll(/title:\s*'([^']+)'/g)];

  for (let i = 0; i < slugMatches.length; i++) {
    if (linksAdded >= 3) break; // Max 3 total internal links (Rule 2)
    const slug = slugMatches[i][1];
    const title = titleMatches[i] ? titleMatches[i][1] : 'related article';

    // Relevance check: does the title share meaningful words with this content?
    const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const matchedWord = titleWords.find(w => updatedContent.toLowerCase().includes(w));

    if (matchedWord && !updatedContent.includes(`/blog/${slug}`) && slug !== brief.slug) {
      // Build a 2-5 word natural anchor from the context of the matched word
      const anchor = shortAnchorText(title);
      // Find a natural inline location: find the matched word in a <p> and wrap it
      const inlineRegex = new RegExp(`(?<!<a[^>]*)\\b(${matchedWord}(s|ing|ed)?)\\b(?![^<]*<\/a>)`, 'i');
      if (inlineRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(inlineRegex, `<a href="/blog/${slug}">${anchor}</a>`);
        linksAdded++;
        console.log(`   🔗 SPIDER: Linked to Pillar with anchor: "${anchor}"`);
      }
    }
  }

  return updatedContent;
}

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
// 📋 CEO EXECUTIVE ORDERS
// ═══════════════════════════════════════════════════════════════════════
function loadDirectorOrders() {
  const ordersPath = path.join(process.cwd(), '.github/director_orders.json');
  try {
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    return `\n\n👔 EXECUTIVE ORDERS FROM AGENCY DIRECTOR:\nDepartment: ${orders.department}\nReasoning: ${orders.reasoning}\nOrders: ${orders.cross_department_orders}\nAgency Health: ${orders.agency_health_score}/10\n\nYOU MUST STRICTLY FOLLOW THESE ORDERS IN YOUR CONTENT STRATEGY.`;
  } catch {
    return "";
  }
}

function hasFreshDirectorOrders() {
  const ordersPath = path.join(process.cwd(), '.github/director_orders.json');
  try {
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const orderDate = orders.timestamp.split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return orderDate === today && orders.department === 'content';
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔬 RESEARCHER — Keyword Discovery + SERP Analysis + Semantic Clusters
// ═══════════════════════════════════════════════════════════════════════
async function researcherAgent(existingSlugs, knowledgeCtx, ragCtx) {
  const models = await getModels('research');
  console.log(`\n🔬 RESEARCHER: Deep keyword + SERP analysis...`);
  const directorOrders = loadDirectorOrders();

  return await healedCall('Researcher', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';
    const clusterCtx = getClusterContext();

    const raw = await smartCall(models, `You are a top-tier SEO Data Scientist with 10+ years of experience analyzing Google algorithms and SERP volatility for enterprise tech companies. FouriqTech is your client — a premium web design & development agency targeting global startups and enterprises.
${directorOrders}

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
- **INFORMATION GAIN**: Focus on topics where we can provide unique, technical value.
- Avoid keywords you see in the existing slugs or RAG history
- Consider filling gaps in incomplete clusters
- Analyze what top-ranking competitors cover and miss

═══ SIGNATURE PILLAR TRAITS (ENFORCE) ═══
1. Technical Depth (Code snippets, architecture diagrams description)
2. Negative Knowledge (What NOT to do, common pitfalls)
3. Performance Metrics (Benchmarks, TBT/LCP impact)
4. Case Study Bias (Real-world scenarios over generic advice)

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
// 🌐 SCRAPER — Live SERP Data Extraction (Headless with Fallback)
// ═══════════════════════════════════════════════════════════════════════
async function scrapeSerp(keyword) {
  let browser = null;
  try {
    console.log(`\n🕵️ SCRAPER: Launching headless browser for real-time SERP scrape...`);
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // --- TRY GOOGLE FIRST ---
    console.log(`   🌐 Primary Attempt: Google Search for "${keyword}"`);
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=en`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    let serpData = await page.evaluate(() => {
      if (document.body.innerText.includes('unusual traffic') || document.querySelector('#captcha-form')) return null;
      
      const results = [];
      const items = document.querySelectorAll('div.tF2Cxc, div.g');
      items.forEach((item, index) => {
        if (index >= 10) return;
        const titleEl = item.querySelector('h3');
        const snippetEl = item.querySelector('.VwiC3b, .yXK7lf, .MUxGbd, .yDYNvb');
        if (titleEl) {
          results.push({
            position: index + 1,
            title: titleEl.innerText || '',
            snippet: snippetEl ? snippetEl.innerText : ''
          });
        }
      });

      // --- EXTRACT SERP FEATURES ---
      const paa = Array.from(document.querySelectorAll('.iD87jt, .dn799b, .s67bU')).map(el => el.innerText).filter(t => t.includes('?'));
      const featured = document.querySelector('.LGOv1b, .hp00ve, .XnoxBy, .DI6Ybe')?.innerText || null;
      
      return { results, paa, featured_snippet: featured };
    });

    let results = serpData?.results || [];
    const paa = serpData?.paa || [];
    const featured = serpData?.featured_snippet;

    // --- FALLBACK TO DUCKDUCKGO IF BLOCKED ---
    if (!results || results.length === 0) {
      console.log(`   ⚠️ Google blocked us (CAPTCHA). Falling back to DuckDuckGo...`);
      await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));

      results = await page.evaluate(() => {
        const items = document.querySelectorAll('.result');
        const data = [];
        items.forEach((item, index) => {
          if (index >= 10) return;
          const titleEl = item.querySelector('.result__title');
          const snippetEl = item.querySelector('.result__snippet');
          if (titleEl) {
            data.push({
              position: index + 1,
              title: titleEl.innerText || '',
              snippet: snippetEl ? snippetEl.innerText : ''
            });
          }
        });
        return data;
      });
    }

    console.log(`   ✅ Extracted ${results.length} live organic results.`);
    return { 
      results, 
      paa: paa || [], 
      featured_snippet: featured || null,
      source: results.length > 0 ? 'Google' : 'Fallback' 
    };
  } catch (err) {
    console.error(`   ❌ Scraper failed: ${err.message}`);
    return { results: [], paa: [], featured_snippet: null, source: 'Error' };
  } finally {
    if (browser) await browser.close();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🧠 AI MANAGER — The Strategic Brain (Replaces Strategist + Lead Scorer + Meta-Manager)
// ═══════════════════════════════════════════════════════════════════════
async function aiManagerAgent(research, gscInsights, ragCtx, orphanPages, existingSlugs, existingTitles, knowledgeCtx, liveSerpData) {
  const models = await getModels('manager');
  console.log(`\n🧠 AI MANAGER: Creating strategy brief...`);

  return await healedCall('AI Manager', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const gscSummary = gscInsights?.summary ? JSON.stringify(gscInsights.summary) : 'No GSC data yet — site is new.';
    const slugTitleMap = existingSlugs.map((s, i) => `/blog/${s} → "${existingTitles[i] || s}"`).join('\n');

    const liveSerpSection = liveSerpData && liveSerpData.length > 0
      ? `\n3.5 LIVE COMPETITOR SEARCH RESULTS (TODAY):\nThis is what ranks on Page 1 for "${research.primary_keyword}" RIGHT NOW:\n${liveSerpData.map(r => `[#${r.position}] Title: "${r.title}"\n    Snippet: "${r.snippet}"`).join('\n')}\n-> MANAGER INSTRUCTION: Read these exact titles. Your "angle" and "competitor_gap" must directly exploit a weakness in these specific 10 results.`
      : `\n3.5 LIVE COMPETITOR SEARCH RESULTS:\n(Live scrape failed. Fall back to Researcher's guessed SERP gap).`;

    const raw = await smartCall(models, `You are the SEO Account Manager at FouriqTech's autonomous SEO agency. You have 10 years of experience as an expert SEO manager scaling enterprise tech companies. You make ALL strategic content decisions to drive maximum ranking and ROI. No human is involved.

CRITICAL CONSTRAINTS:
1. You ONLY manage the BLOG. You cannot change the website's core pages, general meta tags, or design. Your strategy must focus purely on inbound content marketing via blog articles.
2. If Google Search Console (GSC) data is missing or empty, do not worry. This just means you are in "Discovery & Growth Mode." Rely entirely on the Researcher's SERP analysis and the Cluster Map to build raw topical authority from scratch.

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
- SERP Data: ${JSON.stringify(research.serp_analysis)}
- Semantic Keywords: ${JSON.stringify(research.semantic_keywords)}
${liveSerpSection}

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
- How long should it be? IMPORTANT: The Writer produces articles in a single JSON payload. Set realistic targets between 800-1100 words. Because this is a dense engineering case study format, 1000 words is the absolute sweet spot. Anything above 1200 will get truncated and break the JSON.
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
  "target_words": 1000,
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
async function writerAgent(brief, knowledgeCtx, rewriteFeedback = null) {
  const models = await getModels('writing');
  console.log(`\n✍️ WRITER: Producing content...${rewriteFeedback ? ' (REWRITE ATTEMPT)' : ''}`);

  return await healedCall('Writer', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON with HTML content.` : '';

    const feedbackSection = rewriteFeedback ? `\n\n🚨 URGENT FEEDBACK FROM QA EDITOR 🚨\n${rewriteFeedback}\n\n` : '';

    const raw = await smartCall(models, `You are a senior software architect and performance engineer writing a real-world engineering case study based on production incidents.

Your job is NOT to explain concepts.
Your job is to document a real failure, investigation, and fix with measurable outcomes.
${feedbackSection}
---
## 🎯 INPUT
Target audience: Senior engineers, architects, CTOs
Topic: "${brief.article_title}"
Primary Keyword: "${brief.keyword}"

THE MANAGER'S BRIEF:
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

---
## 🚫 HARD RULES (ABSOLUTE)
* Do NOT write generic explanations
* Do NOT define basic concepts
* Do NOT use filler phrases
* Do NOT write like a tutorial or guide
* Do NOT make claims without numbers

If any section lacks metrics, scale, or technical depth → You MUST rewrite it before continuing.

---
## 🧠 MANDATORY OUTPUT STRUCTURE

### 0. THE SNIPPET TRAP (MANDATORY FOR GOOGLE)
Check the SERP STRATEGY in the brief:
${JSON.stringify(brief.serp_strategy || {})}

One of your H2 or H3 sections MUST explicitly answer the 'target_snippet_question'.
* IF format is 'definition': Write a 40-60 word authoritative answer immediately after the heading. **Use bolding for the primary answer.**
* IF format is 'list': Provide a high-quality bulleted list of 5-8 items.
* Also, naturally integrate answers to these PAA questions: ${JSON.stringify(brief.serp_strategy?.paa_integration || [])}

### 1. INCIDENT REPORT (START HERE)
Describe a real production issue:
* Include scale (RPS, tenants, regions)
* Include measurable problem (TTFB, latency, etc.)
Example: "At ~2.1M monthly requests across 14 regions, TTFB increased from 120ms to 450ms..."

### 2. WRONG ASSUMPTIONS
Explain what was initially believed:
* What you thought was the issue
* Why that assumption was wrong

### 3. DEBUGGING PROCESS (CRITICAL)
Step-by-step investigation:
* Tools used (logs, tracing, metrics)
* What was measured
* How the bottleneck was isolated

### 4. ROOT CAUSE
Explain the exact technical failure:
* Be specific (middleware, DB call, cache miss, etc.)
* Include timing breakdown if possible

### 5. IMPLEMENTATION FIX
Show:
* Code snippet OR architecture change
* Why this fix works at system level

### 6. MEASURED RESULTS
Include BEFORE vs AFTER:
* TTFB, latency, execution time, p95 if possible
Example: "TTFB reduced from 450ms → 180ms (p95 over 24h)"

### 7. UNEXPECTED PROBLEM (MANDATORY)
Describe something that broke AFTER the fix:
* Consistency issues, propagation delays, cache bugs, or scaling issues.
Explain why it happened and how it was mitigated.

### 8. REQUEST LIFECYCLE BREAKDOWN
Explain the optimized flow step-by-step:
1. Request enters edge
2. Middleware execution (with timing)
3. Data resolution
4. Rendering
5. Response
Include latency per step if possible.

### 9. TRADE-OFF ANALYSIS
Explain:
* When this solution is NOT ideal
* Scaling limits (10k, 100k tenants)
* Alternative approaches

### 10. STRONG OPINION (NO NEUTRAL ENDING)
End with a clear stance:
Example: "If your middleware depends on a database call, your architecture is already broken."

---
## 📊 STYLE
* Write like an internal engineering report
* Use precise technical language (TTFB, p95, cold start, edge runtime)
* Keep sentences tight and information-dense
* No storytelling fluff

---
## 🔍 SEO REQUIREMENTS
* Naturally include "${brief.keyword}"
* Primary keyword "${brief.keyword}": use a MAXIMUM of 5 times in the entire article.
* NEVER capitalize the keyword mid-sentence unless it is a proper noun.
* Maximum 3-4 internal links per article using ONLY 2-5 word natural anchors.
* Mention "FouriqTech" a MAXIMUM of 2 times.

---
## ✅ SELF-VALIDATION CHECK (MANDATORY)
Before outputting, verify:
* At least 3 numeric metrics included
* At least 1 debugging process described
* At least 1 unexpected issue included
* At least 1 trade-off explained
* No generic phrases

If ANY condition fails → REWRITE.

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
    const kw = brief.keyword || "";
    const kwCount = (result.content?.toLowerCase().match(new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

    console.log(`   📄 "${result.title}" (${wordCount} words)`);
    console.log(`   🔑 Keyword "${brief.keyword}" appears ${kwCount} times`);
    return { ...result, wordCount, keywordCount: kwCount };
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ✅ QA INSPECTOR — 3 Simple Checks, No Rewrite Loop
// ═══════════════════════════════════════════════════════════════════════
async function qaAgent(draft, brief) {
  const models = await getModels('qa');
  console.log(`\n✅ QA INSPECTOR: Validating article...`);

  return await healedCall('QA Inspector', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(models, `You are a merciless, elite Managing Editor for a top-tier tech publication (think Stripe or Vercel engineering blogs) with 10 years of experience. You have a zero-tolerance policy for generic, robotic AI writing. Your job is to aggressively protect FouriqTech's brand reputation. You evaluate articles on FOUR criteria:

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
- (Ignore word count exactness if the technical depth is elite and nothing feels missing.)
Score 1-10. Below 4 = automatic fail.

═══ CHECK 3: COMPLETENESS ═══
Is the article structurally complete as an Engineering Incident Report?
- Starts with an Incident Hook (metrics, scale).
- Explains Debugging, Root Cause, and Fix.
- Has a Trade-off analysis and an Unexpected Problem section.
- Does NOT need an FAQ section or a Call to Action (these are for generic blogs).
- Does not abruptly end mid-sentence.
Score 1-10. Below 4 = automatic fail.

═══ CHECK 4: NATURAL READABILITY (anti-spam check) ═══
This is an explicit Google spam and over-optimization check. Be very strict here.
- KEYWORD DENSITY: Count how many times "${brief.keyword}" appears. If it appears more than 5 times, deduct 2 points automatically. If more than 8 times, score is automatic 3/10.
- CAPITALIZATION: Is the keyword ever capitalized unnaturally mid-sentence (e.g. "Custom SaaS Platform Development is" instead of "custom SaaS platform development")? If yes, deduct 2 points.
- ANCHOR TEXT: Are any internal link anchors longer than 6 words or full article titles? If yes, deduct 2 points per violation.
- BRAND SPAM: Is "FouriqTech" mentioned more than 2 times? If yes, deduct 1 point per extra mention.
- REPETITIVE PHRASING: Does the article reuse the same sentence patterns or lead-ins repeatedly? If yes, deduct 1-2 points.
- FORCED PROMOTION: Does the article push "$25k+ projects" or heavy brand promotion where it doesn't fit? Deduct 2 points.
Score 1-10. Below 5 = automatic fail (Google spam risk).

OVERALL: Average the 4 scores (human_tone + brief_compliance + completeness + natural_readability). Article passes if overall >= 6.5/10 AND no individual score is below its fail threshold.

PRIORITY: Helpfulness > Technical Accuracy > Natural Readability > SEO optimization.
Be FAIR. If the article is genuinely good, sounds human, and is not spammy, pass it.

${fix}

RETURN VALID JSON:
{
  "human_tone": 0,
  "brief_compliance": 0,
  "completeness": 0,
  "natural_readability": 0,
  "score": 0,
  "passed": false,
  "issues": ["issue1 if any"],
  "summary": "One-line quality verdict"
}`, 'QA Inspector');

    const result = JSON.parse(raw);
    // Recalculate overall score using all 4 dimensions
    const avg = Math.round(((result.human_tone || 0) + (result.brief_compliance || 0) + (result.completeness || 0) + (result.natural_readability || 0)) / 4 * 10);
    result.score = avg;
    result.passed = avg >= 65
      && (result.human_tone || 0) >= 5
      && (result.brief_compliance || 0) >= 4
      && (result.completeness || 0) >= 4
      && (result.natural_readability || 0) >= 5; // New gate: spam check must pass

    console.log(`   📊 Human Tone: ${result.human_tone}/10 | Brief: ${result.brief_compliance}/10 | Complete: ${result.completeness}/10 | Natural: ${result.natural_readability}/10`);
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
  try { regenerateFullSitemap(); } catch { }

  // 👔 Manger Override: If the Director specifically ordered a post today, bypass velocity limits.
  const overrideVelocity = process.env.FORCE_PUBLISH || hasFreshDirectorOrders();

  // Check weekly velocity (2x/week limit)
  const weeklyCount = getWeeklyPublishCount();
  console.log(`📅 Published this week: ${weeklyCount}/2 (Target: 2x/week)`);

  if (weeklyCount >= 2 && !overrideVelocity) {
    console.log(`🛑 VELOCITY GOVERNOR: Weekly limit reached. Skipping to prevent SpamBrain detection.`);
    process.exit(0);
  }

  // Check daily limit
  const todayCount = getTodayPublishCount();
  console.log(`📰 Published today: ${todayCount}/1`);
  if (todayCount >= 1 && !overrideVelocity) {
    console.log('🧠 Daily limit reached. Signing off. ✅');
    process.exit(0);
  }

  if (overrideVelocity) {
    console.log(`👔 DIRECTOR OVERRIDE ACTIVE: Bypassing standard velocity limits...`);
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
  // Stage 1.5: LIVE SERP SCRAPER
  // ══════════════════════════════════════
  let liveSerpData = null;
  if (research.primary_keyword) {
    liveSerpData = await scrapeSerp(research.primary_keyword);
  }

  // ══════════════════════════════════════
  // Stage 2: AI MANAGER (Strategy)
  // ══════════════════════════════════════
  let brief;
  try { brief = await aiManagerAgent(research, gscInsights, ragCtx, orphanPages, existingSlugs, existingTitles, knowledgeCtx, liveSerpData); }
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
  // Stage 3 & 4: WRITER + QA FEEDBACK LOOP
  // ══════════════════════════════════════
  let draft;
  let qa;
  let maxRetries = 2; // Up to 2 rewrites if QA fails
  let rewriteFeedback = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      draft = await writerAgent(brief, knowledgeCtx, rewriteFeedback);
    } catch (e) {
      console.error(`❌ Writer failed on attempt ${attempt}:`, e.message);
      if (attempt === maxRetries) {
        writeResearchLog(research, brief, null);
        process.exit(1);
      }
      continue;
    }

    try {
      qa = await qaAgent(draft, brief);
    } catch (e) {
      console.error(`⚠️ QA Agent failed unexpectedly on attempt ${attempt}.`);
      if (attempt === maxRetries) {
        writeResearchLog(research, brief, null);
        process.exit(0);
      }
      continue;
    }

    if (qa.passed) {
      break; // It passed QA! Exit the rewrite loop.
    } else {
      console.log(`\n⚠️ QA REJECTED ARTICLE (Attempt ${attempt}/${maxRetries}). Sending back to Writer...`);
      const issues = (qa.issues || []).join('\\n- ');
      rewriteFeedback = `PREVIOUS DRAFT REJECTED.\\nYour previous draft scored ${qa.score}/100 and failed QA for the following reasons:\\n- ${issues}\\n\\nYou MUST fix these exact issues in this rewrite. DO NOT repeat the same mistakes. Keep the parts that were good, but strictly fix the problems noted above. Ensure it sounds like a human engineer, not AI.`;

      // If we've reached max retries and it still fails, the loop ends and it's marked as failed.
    }
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

    // Hardened Internal Linking (Forward)
    draft.content = spiderForwardLink(draft.content, brief, blogDataFile);

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

    if (process.env.DRY_RUN === 'true') {
      console.log(`\n🧪 DRY_RUN: Post generated but NOT submitted to Staging.`);
      console.log(`📄 PREVIEW NEW POST:\n${newPost}`);
    } else {
      console.log(`\n📦 SUBMITTING to Manager Staging Queue...`);
      await submitToStaging({
        type: 'blog_post',
        department: 'Content Team',
        title: draft.title,
        content: newPost,
        metadata: { word_count: draft.wordCount, qa_score: qa.score, human_tone: qa.human_tone, keyword: brief.keyword }
      });
      await logActivity('Content Team', `✍️ Submitted new blog post "${draft.title}" to Staging Queue.`, "publish");

      incrementPublishCount();
      // Only regenerate full sitemap when it's ACTUALLY published, maybe we leave it up to the Publisher script.
      saveArticleToRag(draft, brief, research, qa);
      updateClusterMap(brief, draft);
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📋 V8 RUN REPORT — ✅ PUBLISHED                        ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  📝 "${draft.title}"`);
    console.log(`║  🎯 Keyword: "${brief.keyword}"`);
    console.log(`║  📊 QA: ${qa.score}/100 | Human Tone: ${qa.human_tone}/10`);
    console.log(`║  📏 Words: ${draft.wordCount}`);
    console.log(`║  🏗️ Cluster: ${brief.cluster}`);
    console.log(`║  🕸️ Spider: Linked`);
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

  // TRIGGER PUBLISHER IF AUTO-COMMIT IS ON
  try {
    const settingsPath = path.join(process.cwd(), '.github/staging/system-settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.isAutoCommit === true) {
        console.log('🚀 AUTO-COMMIT: Triggering Publisher script...');
        const pub = spawn('node', ['--env-file=.env', '.github/scripts/publisher.mjs'], {
          cwd: process.cwd(),
          stdio: 'inherit'
        });
        pub.on('close', (code) => {
          console.log(`🚀 PUBLISHER exited with code ${code}`);
        });
      }
    }
  } catch (e) {
    console.error('⚠️ Could not trigger auto-publisher:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 BOOT
// ═══════════════════════════════════════════════════════════════════════
engine().catch(err => {
  console.error('💥 FATAL:', err.message?.substring(0, 300));
  process.exit(1);
});
