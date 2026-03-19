import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════
// 🏢 FOURIQTECH AI SEO ENGINE — Enterprise Grade v4.0
// ═══════════════════════════════════════════════════════════════════════
// Autonomous SEO content engine with:
//   🔑 Multi-API Key Rotation       🧠 Dynamic Model Escalation
//   🔬 SEO-Intelligent Research      📊 Topical Authority Clustering
//   🎯 Lead Intent Scoring Gate      🔍 SERP Structure Analysis
//   🧬 Semantic Keyword Clustering   💰 Conversion Block Injection
//   🔗 Intelligent Internal Linking  🏛️ Topic Authority Expansion
//   🔬 Technical Depth Detection     👔 Enterprise Audience Filter
//   ✍️ Technical Content w/ Code     ✅ Strict QA (90+ to publish)
//   📋 Technical SEO Automation      🚫 Max 1 article/day
// V4.0 ADDITIONS:
//   🔍 GSC-Informed Research         🔧 Auto-Fix Loop (targeted rewrites)
//   📊 Cluster-Based Publishing      🗺️ Auto-Sitemap Updates
// ═══════════════════════════════════════════════════════════════════════

const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '.github/knowledge_base');
const PUBLISH_LOG_PATH = path.join(process.cwd(), '.github/publish_log.json');
const CONTENT_PIPELINE_PATH = path.join(process.cwd(), '.github/content_pipeline.json');
const RESEARCH_TEMP_PATH = path.join(process.cwd(), 'seo_research_temp.md');
const GSC_REPORT_PATH = path.join(process.cwd(), '.github/gsc-reports/latest.json');
const SITEMAP_PATH = path.join(process.cwd(), 'public/sitemap.xml');

// ── V7.0: Topic Cluster Map Path ──
const CLUSTER_MAP_PATH = path.join(process.cwd(), '.github/knowledge_base/cluster_map.json');

// ── V5.0: RAG Memory System Paths ──
const RAG_DIR = path.join(process.cwd(), '.github/knowledge_base/rag_memory');
const RAG_WINNING = path.join(RAG_DIR, 'winning_patterns.json');
const RAG_FAILED = path.join(RAG_DIR, 'failed_patterns.json');
const RAG_KEYWORD_HISTORY = path.join(RAG_DIR, 'keyword_history.json');
const RAG_ARTICLES_DIR = path.join(RAG_DIR, 'articles');
const RAG_GSC_SNAPSHOTS = path.join(RAG_DIR, 'gsc_snapshots');


// ── Task-Specific AI Models & Fallback (Free-Tier Optimized) ──
function getModels(taskType, escalation = 0) {
  const tasks = {
    'research':      ['gemini-3.1-flash-lite-preview', 'gemini-2.5-flash', 'gemini-3-flash-preview'],
    'lead_scoring':  ['gemini-3.1-flash-lite-preview', 'gemini-2.5-flash'],
    'strategy':      ['gemini-2.5-flash', 'gemini-3-flash-preview'],
    'writing':       ['gemini-3-flash-preview', 'gemini-2.5-flash'],
    'rewrite':       ['gemini-3-flash-preview', 'gemini-2.5-flash'],
    'qa':            ['gemini-3-flash-preview', 'gemini-2.5-flash']
  };
  return tasks[taskType] || ['gemini-2.5-flash'];
}

// ── Multi-API Key Rotation & Rate Limit Handling ──
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

let currentKeyIdx = 0;
if (API_KEYS.length > 0) {
  process.env.GEMINI_API_KEY = API_KEYS[0];
}
let aiClient = API_KEYS.length > 0 ? new GoogleGenAI({ apiKey: API_KEYS[0] }) : null;

function rotateKey() {
  currentKeyIdx = (currentKeyIdx + 1) % API_KEYS.length;
  const nextKey = API_KEYS[currentKeyIdx];
  process.env.GEMINI_API_KEY = nextKey;
  aiClient = new GoogleGenAI({ apiKey: nextKey });
  console.log(`   🔑 Rotated → Key #${currentKeyIdx + 1}/${API_KEYS.length}`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

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

          if (tries % 2 !== 0 && API_KEYS.length > 1) {
            rotateKey();
          } else {
            backoffMs *= 2;
          }
          continue;
        }

        const errStr = String(err.status || err.message || '').toLowerCase();
        if (errStr.includes('404') || errStr.includes('400') || errStr.includes('503') || errStr.includes('500') || errStr.includes('high demand')) {
           console.log(`   ❌ Model ${model} unavailable (Error: ${err.status || 'Overloaded'}). Falling back...`);
           break;
        }
        throw err;
      }
    }
    console.log(`   ⚠️ Exhausted all rate limit retries for ${model}. Switching to fallback model...`);
  }
  throw new Error('All models, API keys, and backoff attempts exhausted.');
}

async function healedCall(agent, fn, retries = 2) {
  let lastErr = null;
  for (let i = 1; i <= retries; i++) {
    try {
      return await fn(lastErr);
    }
    catch (e) {
      console.error(`   ⚠️ [${agent}] Attempt ${i}: ${e.message?.substring(0, 120)}`);
      lastErr = e;
      if (i < retries) {
        console.log(`   🩹 [${agent}] Self-healing: cooling down for 10s...`);
        await sleep(10000);
      }
    }
  }
  throw lastErr;
}

// ── Publish Log (track daily count) ──
function getTodayPublishCount() {
  try {
    const log = JSON.parse(fs.readFileSync(PUBLISH_LOG_PATH, 'utf8'));
    const today = new Date().toISOString().split('T')[0];
    return (log[today] || 0);
  } catch { return 0; }
}

function incrementPublishCount() {
  let log = {};
  try { log = JSON.parse(fs.readFileSync(PUBLISH_LOG_PATH, 'utf8')); } catch {}
  const today = new Date().toISOString().split('T')[0];
  log[today] = (log[today] || 0) + 1;
  fs.writeFileSync(PUBLISH_LOG_PATH, JSON.stringify(log, null, 2));
}

// ── Content Pipeline (future topic storage) ──
function loadContentPipeline() {
  try { return JSON.parse(fs.readFileSync(CONTENT_PIPELINE_PATH, 'utf8')); }
  catch { return { topics: [], last_updated: null }; }
}

function saveContentPipeline(pipeline) {
  pipeline.last_updated = new Date().toISOString();
  fs.writeFileSync(CONTENT_PIPELINE_PATH, JSON.stringify(pipeline, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════
// 📦 V5: RAG MEMORY SYSTEM — Self-Learning Brain
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

// ── V6: Helper to load and migrate history on read ──
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
          published_date: pDate,
          word_count: r.word_count || 0,
          keyword_primary: r.keyword || '',
          keyword_density: 0,
          internal_links_injected: 0,
          qa_score: r.qa_score || 0,
          human_tone_score: r.human_tone || 0,
          rewrite_attempts: 0,
          schema_injected: false,
          lead_score: 7,
          business_relevance: 7,
          intent_type: 'informational',
          cluster: r.cluster || ''
        },
        performance: {
          day1_indexed: null,
          day3_impressions: null,
          day7_ctr: null,
          day14_avg_position: null,
          day28_classification: "pending"
        },
        check_schedule: {
          day1_due: addDays(pDate, 1),
          day3_due: addDays(pDate, 3),
          day7_due: addDays(pDate, 7),
          day14_due: addDays(pDate, 14),
          day28_due: addDays(pDate, 28),
          last_checked: null
        }
      };
    }
    return r;
  });
  if (mutated) saveRagFile(RAG_KEYWORD_HISTORY, history);
  return history;
}

// Save article to RAG memory after publishing
function saveArticleToRag(draft, strategy, research, qaResult, rewriteAttempts, linksInjected) {
  ensureRagDirs();
  const todayStr = new Date().toISOString().split('T')[0];
  const kwDensity = draft.wordCount > 0 ? Number(((draft.keywordCount / draft.wordCount) * 100).toFixed(2)) : 0;
  
  const record = {
    article_id: draft.slug,
    metadata: {
      published_date: todayStr,
      word_count: draft.wordCount,
      keyword_primary: strategy.primary_keyword,
      keyword_density: kwDensity,
      internal_links_injected: linksInjected || 0,
      qa_score: qaResult?.overallScore || 0,
      human_tone_score: qaResult?.scores?.human_tone || 0,
      rewrite_attempts: rewriteAttempts || 0,
      schema_injected: true,
      lead_score: 7, 
      business_relevance: 7, 
      intent_type: research?.search_intent || 'informational',
      cluster: strategy.cluster_topic || ''
    },
    performance: {
      day1_indexed: null,
      day3_impressions: null,
      day7_ctr: null,
      day14_avg_position: null,
      day28_classification: "pending"
    },
    check_schedule: {
      day1_due: addDays(todayStr, 1),
      day3_due: addDays(todayStr, 3),
      day7_due: addDays(todayStr, 7),
      day14_due: addDays(todayStr, 14),
      day28_due: addDays(todayStr, 28),
      last_checked: null
    }
  };

  // Save article content
  const articlePath = path.join(RAG_ARTICLES_DIR, `${draft.slug}.md`);
  const articleMd = `# ${draft.title}\n\n**Keyword:** ${strategy.primary_keyword}\n**Date:** ${todayStr}\n**Words:** ${draft.wordCount}\n**QA:** ${record.metadata.qa_score}/100\n\n---\n\n${(draft.content || '').replace(/<[^>]+>/g, ' ').substring(0, 3000)}`;
  fs.writeFileSync(articlePath, articleMd);

  // Load and migrate keyword history, then push
  const history = loadAndMigrateHistory();
  history.push(record);
  saveRagFile(RAG_KEYWORD_HISTORY, history);

  console.log(`   📦 RAG: Saved article "${draft.slug}" to memory`);
  console.log(`   📦 RAG: Keyword history now has ${history.length} entries`);
}

// Load winning patterns for the Writer to learn from
function loadWinningPatterns() {
  const winning = loadRagFile(RAG_WINNING, []);
  if (winning.length === 0) return '';
  // Get top 3 winners
  const top3 = winning.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 3);
  return `\n\n═══ RAG WINNING PATTERNS (replicate these) ═══\nThese are your TOP performing articles. Mimic their structure, tone, and length:\n${top3.map(w => `- "${w.keyword}" → ${w.word_count} words, ${w.clicks} clicks, CTR ${w.ctr}%, Avg Pos ${w.position}`).join('\n')}\n`;
}

// V7: Improves keyword selection by avoiding patterns that previously failed QA or ranking
function loadFailurePatterns() {
  const failed = loadRagFile(RAG_FAILED, []);
  if (failed.length === 0) return '';
  const patterns = failed.slice(-5).map(f => {
    const issues = [];
    if (f.word_count && f.word_count < 2000) issues.push(`low word count (${f.word_count})`);
    if (f.qa_score && f.qa_score < 85) issues.push(`low QA score (${f.qa_score})`);
    if (f.position === 'unranked') issues.push('never indexed');
    else if (f.position && f.position > 50) issues.push(`poor position (${f.position})`);
    return `- "${f.keyword}" failed: ${issues.join(', ') || 'unknown reason'}`;
  });
  return `\n═══ RAG FAILURE PATTERNS — AVOID THESE MISTAKES ═══\nThese keyword types have failed before — avoid similar angles:\n${patterns.join('\n')}\n`;
}

// V7: Improves topical authority by tracking which clusters are complete vs incomplete
function loadClusterMap() {
  try { return JSON.parse(fs.readFileSync(CLUSTER_MAP_PATH, 'utf8')); }
  catch { return { clusters: [] }; }
}

// V7: Updates the cluster map after every publish to track authority building progress
function updateClusterMap(strategy, draft) {
  const map = loadClusterMap();
  const clusterName = strategy.cluster_topic || '';
  if (!clusterName) return;

  let cluster = map.clusters.find(c => c.cluster_name === clusterName);
  if (!cluster) {
    cluster = {
      cluster_name: clusterName,
      pillar_slug: null,
      pillar_published: false,
      supporting_articles: [],
      target_supporting_count: 5,
      cluster_complete: false
    };
    map.clusters.push(cluster);
  }

  const articleType = strategy.article_type || 'supporting';
  if (articleType === 'pillar') {
    cluster.pillar_slug = draft.slug;
    cluster.pillar_published = true;
  } else {
    if (!cluster.supporting_articles.includes(draft.slug)) {
      cluster.supporting_articles.push(draft.slug);
    }
  }

  if (cluster.supporting_articles.length >= cluster.target_supporting_count) {
    cluster.cluster_complete = true;
  }

  fs.writeFileSync(CLUSTER_MAP_PATH, JSON.stringify(map, null, 2));
  console.log(`   🗺️ CLUSTER MAP: Updated "${clusterName}" (${cluster.supporting_articles.length}/${cluster.target_supporting_count} supporting articles)`);
}

// V7: Prioritizes filling incomplete clusters over starting new ones
function getIncompleteClusterContext() {
  const map = loadClusterMap();
  const incomplete = map.clusters.filter(c => c.pillar_published && !c.cluster_complete);
  if (incomplete.length === 0) return '';
  const lines = incomplete.map(c => `- "${c.cluster_name}": ${c.supporting_articles.length}/${c.target_supporting_count} supporting articles (NEEDS ${c.target_supporting_count - c.supporting_articles.length} MORE)`);
  return `\n═══ INCOMPLETE CLUSTERS — PRIORITIZE THESE ═══\nThese clusters have a pillar article but need more supporting articles. Fill these gaps FIRST before starting a new cluster:\n${lines.join('\n')}\n`;
}

// ── V6: Multi-Stage Feedback Engine ──
function runFeedbackChecks(gscInsights) {
  if (!gscInsights || !gscInsights.page_analysis) {
    console.log("   📊 No GSC data available — skipping feedback checks");
    return;
  }
  const history = loadAndMigrateHistory();
  const winning = loadRagFile(RAG_WINNING, []);
  const failed = loadRagFile(RAG_FAILED, []);
  const todayStr = new Date().toISOString().split('T')[0];
  let updated = false;

  const optQueuePath = path.join(process.cwd(), '.github/gsc-reports/optimization_queue.json');
  let optQueue = [];
  try { optQueue = JSON.parse(fs.readFileSync(optQueuePath, 'utf8')); } catch {}

  const updatedHistory = history.map(entry => {
    if (entry.performance.day28_classification !== 'pending') return entry;

    const pageData = gscInsights.page_analysis.find(p => p.page?.includes(entry.article_id));
    
    // Day 1 Check
    if (todayStr >= entry.check_schedule.day1_due && entry.performance.day1_indexed === null) {
      if (pageData && pageData.impressions >= 1) {
        entry.performance.day1_indexed = true;
      } else {
        entry.performance.day1_indexed = false;
        console.log(`   ⚠️ [${entry.article_id}] not indexed at Day 1`);
      }
      updated = true;
    }

    // Day 3 Check
    if (todayStr >= entry.check_schedule.day3_due && entry.performance.day3_impressions === null) {
      entry.performance.day3_impressions = pageData?.impressions || 0;
      if (entry.performance.day3_impressions === 0) {
        console.log(`   ⚠️ Zero impressions at Day 3: ${entry.article_id}`);
      }
      updated = true;
    }

    // Day 7 Check
    if (todayStr >= entry.check_schedule.day7_due && entry.performance.day7_ctr === null) {
      entry.performance.day7_ctr = pageData?.ctr || 0;
      if (entry.performance.day7_ctr < 0.5 && (pageData?.impressions || 0) > 50) {
        console.log(`   📝 Low CTR at Day 7 for ${entry.article_id} — title may need rewrite`);
        optQueue.push({ slug: entry.article_id, issue: "low_ctr", ctr: pageData.ctr, impressions: pageData.impressions, flagged_date: todayStr });
      }
      updated = true;
    }

    // Day 14 Check
    if (todayStr >= entry.check_schedule.day14_due && entry.performance.day14_avg_position === null) {
      entry.performance.day14_avg_position = pageData?.position || 0;
      if (pageData && pageData.position > 50) {
        console.log(`   🔴 Position > 50 at Day 14 for ${entry.article_id} — content may need expansion`);
        optQueue.push({ slug: entry.article_id, issue: "low_position", position: pageData.position, flagged_date: todayStr });
      }
      updated = true;
    }

    // Day 28 Check
    if (todayStr >= entry.check_schedule.day28_due && entry.performance.day28_classification === 'pending') {
      const pos = pageData?.position || 999;
      const ctr = pageData?.ctr || 0;
      const imp = pageData?.impressions || 0;
      
      if (pos <= 10 && ctr > 2) {
        entry.performance.day28_classification = 'winner';
        winning.push({
          slug: entry.article_id, keyword: entry.metadata.keyword_primary,
          word_count: entry.metadata.word_count, qa_score: entry.metadata.qa_score,
          human_tone: entry.metadata.human_tone_score,
          clicks: pageData?.clicks || 0, impressions: imp,
          ctr: ctr, position: pos,
          date: entry.metadata.published_date
        });
        console.log(`   🏆 RAG: "${entry.metadata.keyword_primary}" → WINNER PATTERN`);
      } else if (pos > 10 && pos <= 30) {
        entry.performance.day28_classification = 'rising';
        entry.check_schedule.day45_due = addDays(entry.metadata.published_date, 45);
        console.log(`   📈 RAG: "${entry.metadata.keyword_primary}" → RISING PATTERN`);
      } else {
        entry.performance.day28_classification = 'failed';
        failed.push({
          slug: entry.article_id, keyword: entry.metadata.keyword_primary,
          word_count: entry.metadata.word_count, qa_score: entry.metadata.qa_score,
          position: pos === 999 ? 'unranked' : pos,
          clicks: pageData?.clicks || 0,
          date: entry.metadata.published_date
        });
        console.log(`   ❌ RAG: "${entry.metadata.keyword_primary}" → FAILED PATTERN`);
      }
      updated = true;
    }
    
    if (updated) {
      entry.check_schedule.last_checked = todayStr;
    }
    return entry;
  });

  if (updated) {
    saveRagFile(RAG_KEYWORD_HISTORY, updatedHistory);
    saveRagFile(RAG_WINNING, winning);
    saveRagFile(RAG_FAILED, failed);
    if (optQueue.length > 0) {
      if (!fs.existsSync(path.dirname(optQueuePath))) fs.mkdirSync(path.dirname(optQueuePath), { recursive: true });
      fs.writeFileSync(optQueuePath, JSON.stringify(optQueue, null, 2));
    }
    console.log(`   📦 RAG: Feedback checks completed and updated.`);
  }
}

// Load keyword history for the Researcher to avoid repeats
function getKeywordHistoryContext() {
  const history = loadAndMigrateHistory();
  if (history.length === 0) return '';
  const keywords = history.map(h => h.metadata?.keyword_primary || h.keyword);
  return `\n\nRAG KEYWORD HISTORY (DO NOT repeat these):\n${keywords.join(', ')}`;
}

// ═══════════════════════════════════════════════════════════════════════
// 🕸️ V5: SPIDER AGENT — Reverse Internal Link Injection
// ═══════════════════════════════════════════════════════════════════════
function spiderReverseLink(newSlug, newTitle, newKeyword, blogDataFile) {
  console.log(`\n🕸️ SPIDER: Reverse-linking to new article "${newSlug}"...`);
  let updatedBlogData = blogDataFile;
  let injectedCount = 0;

  // Find existing slugs and their content boundaries
  const slugMatches = [...updatedBlogData.matchAll(/slug:\s*'([^']+)'/g)];
  const existingSlugs = slugMatches.map(m => m[1]).filter(s => s !== newSlug);

  // For each existing article, check if it mentions the keyword topic
  const keywordWords = newKeyword.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  for (const slug of existingSlugs) {
    if (injectedCount >= 3) break; // Max 3 reverse links

    // Find content section for this slug
    const slugIdx = updatedBlogData.indexOf(`slug: '${slug}'`);
    if (slugIdx === -1) continue;

    // Find the content field
    const contentStart = updatedBlogData.indexOf('content: `', slugIdx);
    if (contentStart === -1) continue;
    const contentEnd = updatedBlogData.indexOf('`,', contentStart + 10);
    if (contentEnd === -1) continue;

    const existingContent = updatedBlogData.substring(contentStart, contentEnd);

    // Check if already linked to newSlug
    if (existingContent.includes(`/blog/${newSlug}`)) continue;

    // Check if content is semantically related (shares keyword words)
    const lowerContent = existingContent.toLowerCase();
    const matchCount = keywordWords.filter(w => lowerContent.includes(w)).length;

    if (matchCount >= 2) {
      // Find a good insertion point (before FAQ or before last </p>)
      const faqMarker = existingContent.match(/<h2[^>]*>.*(?:FAQ|Frequently)/i);
      let insertPoint;
      if (faqMarker) {
        insertPoint = existingContent.indexOf(faqMarker[0]) + contentStart;
      } else {
        // Insert before the last paragraph
        const lastP = existingContent.lastIndexOf('</p>');
        insertPoint = lastP > 0 ? lastP + contentStart : -1;
      }

      if (insertPoint > 0 && insertPoint < contentEnd) {
        const linkHtml = `<p>You might also find our guide on <a href="/blog/${newSlug}">${newTitle}</a> useful for deeper insights on this topic.</p>\n`;
        updatedBlogData = updatedBlogData.slice(0, insertPoint) + linkHtml + updatedBlogData.slice(insertPoint);
        injectedCount++;
        console.log(`   🔗 SPIDER: Injected link in "${slug}" → "/blog/${newSlug}"`);
      }
    }
  }

  if (injectedCount === 0) {
    console.log(`   🕸️ SPIDER: No semantically related articles found for reverse linking.`);
  } else {
    console.log(`   🕸️ SPIDER: ${injectedCount} reverse links injected into existing articles.`);
  }

  return { updated: updatedBlogData, injectedCount };
}

// Orphan page detection
function detectOrphanPages(blogDataFile) {
  const slugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const orphans = [];

  for (const slug of slugs) {
    // Count how many times this slug appears as a link target
    const linkPattern = new RegExp(`/blog/${slug}["']`, 'g');
    const linkCount = (blogDataFile.match(linkPattern) || []).length;
    // Subtract 1 for the slug declaration itself
    if (linkCount <= 1) {
      orphans.push(slug);
    }
  }

  if (orphans.length > 0) {
    console.log(`   🕸️ SPIDER: Found ${orphans.length} orphan pages: ${orphans.join(', ')}`);
  }
  return orphans;
}

// ═══════════════════════════════════════════════════════════════════════
// 🔧 V5: OPTIMIZER AGENT — Stale Content, Schema, Title Rewrite
// ═══════════════════════════════════════════════════════════════════════
function injectSchemaMarkup(draft, strategy) {
  let content = draft.content || '';

  // Check if FAQ schema already exists
  if (content.includes('application/ld+json')) return content;

  // Build FAQ schema from any H3 question/answer pairs
  const faqRegex = /<h3>(.*?\?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
  const faqs = [];
  let match;
  while ((match = faqRegex.exec(content)) !== null) {
    faqs.push({
      '@type': 'Question',
      name: match[1].replace(/<[^>]+>/g, ''),
      acceptedAnswer: {
        '@type': 'Answer',
        text: match[2].replace(/<[^>]+>/g, '').substring(0, 500)
      }
    });
  }

  if (faqs.length >= 2) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs
    };
    const schemaTag = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
    // Inject at the end of the content
    content = content + `\n${schemaTag}`;
    console.log(`   📋 SCHEMA: Injected FAQPage schema with ${faqs.length} Q&As`);
  }

  // Add Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: draft.title,
    description: draft.excerpt,
    author: { '@type': 'Organization', name: 'FouriqTech' },
    publisher: { '@type': 'Organization', name: 'FouriqTech' },
    datePublished: new Date().toISOString().split('T')[0],
    keywords: strategy.primary_keyword
  };
  const articleSchemaTag = `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`;
  content = content + `\n${articleSchemaTag}`;
  console.log(`   📋 SCHEMA: Injected Article schema`);

  return content;
}

// Detect stale articles from GSC data
function findStaleArticles(gscInsights, blogDataFile) {
  if (!gscInsights?.page_analysis) return [];
  const stale = [];
  const today = new Date();

  // Find articles published > 90 days ago with dropping rank  
  const dates = [...blogDataFile.matchAll(/date:\s*'(\d{4}-\d{2}-\d{2})'/g)].map(m => m[1]);
  const slugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

  for (let i = 0; i < slugs.length; i++) {
    const pubDate = new Date(dates[i]);
    const daysSince = Math.floor((today - pubDate) / (1000 * 60 * 60 * 24));
    if (daysSince < 90) continue;

    const pageData = gscInsights.page_analysis?.find(p => p.page?.includes(slugs[i]));
    if (pageData && pageData.position > 10) {
      stale.push({ slug: slugs[i], position: pageData.position, daysSince, clicks: pageData.clicks });
    }
  }

  if (stale.length > 0) {
    console.log(`   🔧 OPTIMIZER: ${stale.length} stale articles detected (>90 days old, pos > 10)`);
  }
  return stale;
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 V5: GSC DIAGNOSTIC ANALYST — Root Cause Analysis
// ═══════════════════════════════════════════════════════════════════════
async function gscDiagnosticAgent(gscInsights) {
  if (!gscInsights?.summary) return null;

  const models = getModels('research');
  console.log(`\n📊 GSC DIAGNOSTIC: Running Root Cause Analysis...`);

  try {
    return await healedCall('GSC Diagnostic', async (prevErr) => {
      const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

      const raw = await smartCall(models, `You are a Google Search Console performance analyst for FouriqTech.com.

GSC PERFORMANCE DATA:
${JSON.stringify(gscInsights.summary, null, 2)}

PAGE ANALYSIS:
${JSON.stringify((gscInsights.page_analysis || []).slice(0, 15), null, 2)}

QUERY ANALYSIS:
${JSON.stringify((gscInsights.query_analysis || []).slice(0, 20), null, 2)}

${fix}

Analyze this GSC data and produce a diagnostic report. For EACH finding, identify:
1. The pattern (what the data shows)
2. The root cause (WHY this is happening)
3. The specific action to fix it

Categories of diagnosis:
- HIGH_IMP_LOW_CTR: Pages with impressions > 50 but CTR < 2% → Title/meta needs rewriting
- LOW_IMP_HIGH_CTR: Good CTR but few impressions → Low volume keyword, find bigger one
- DROPPING: Pages that lost position → Content is stale, needs refresh
- RISING: Pages gaining position → Double down with supporting content
- UNINDEXED: Pages with zero impressions → Technical issue or no backlinks

RETURN VALID JSON:
{
  "overall_health": "good/warning/critical",
  "total_clicks": 0,
  "total_impressions": 0,
  "findings": [
    {
      "type": "HIGH_IMP_LOW_CTR",
      "slug": "article-slug",
      "data": "100 impressions, 0.5% CTR",
      "diagnosis": "Title is generic and not compelling",
      "action": "Rewrite title to include power words and specific numbers",
      "priority": "high"
    }
  ],
  "recommended_next_action": "What the engine should do next cycle",
  "strategy_adjustment": "Any changes to the overall content strategy"
}`, 'GSC Diagnostic');

      const result = JSON.parse(raw);
      console.log(`   📊 Health: ${result.overall_health}`);
      console.log(`   📊 Findings: ${result.findings?.length || 0}`);
      console.log(`   📊 Next: ${result.recommended_next_action}`);

      // Save diagnostic report
      const diagnosticPath = path.join(process.cwd(), '.github/gsc-reports/diagnostic.md');
      const reportMd = `# 📊 GSC Diagnostic Report — ${new Date().toISOString().split('T')[0]}\n\n**Health:** ${result.overall_health}\n\n## Findings\n${(result.findings || []).map(f => `### ${f.type}: ${f.slug || 'General'}\n- **Data:** ${f.data}\n- **Diagnosis:** ${f.diagnosis}\n- **Action:** ${f.action}\n- **Priority:** ${f.priority}`).join('\n\n')}\n\n## Recommended Next Action\n${result.recommended_next_action}\n\n## Strategy Adjustment\n${result.strategy_adjustment || 'None'}`;
      fs.writeFileSync(diagnosticPath, reportMd);
      console.log(`   📊 Diagnostic report saved → gsc-reports/diagnostic.md`);

      return result;
    });
  } catch (e) {
    console.error(`   ⚠️ GSC Diagnostic failed: ${e.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🧠 V6: META-MANAGER DECISION ENGINE
// ═══════════════════════════════════════════════════════════════════════
function metaManagerDecision(gscInsights, gscDiag, publishCount, staleArticles, orphanPages) {
  console.log(`\n🧠 META-MANAGER: Making autonomous decision...`);

  const history = loadAndMigrateHistory();
  const lastArticle = history.length > 0 ? history[history.length - 1] : null;
  const leadScoreVal = lastArticle?.metadata?.lead_score || 7;
  const businessRelVal = lastArticle?.metadata?.business_relevance || 7;
  
  // Calculate Base Publish Score
  const gscHealthScore = gscDiag?.overall_health === 'good' ? 8 : (gscDiag?.overall_health === 'warning' ? 5 : 3);
  let publish_score = (leadScoreVal * 0.35) + ((10 - 5) * 0.25) + (businessRelVal * 0.25) + (gscHealthScore * 0.15);
  publish_score = Number(publish_score.toFixed(1));

  const decisionObj = {
    action: 'publish',
    score: publish_score,
    reasoning: '',
    confidence: 'low'
  };

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat

  // Rule 1: No weekends for B2B
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    decisionObj.action = 'optimize';
    decisionObj.reasoning = 'Weekend - B2B audience offline';
  }
  // Rule 2: Already published today
  else if (publishCount >= 1) {
    decisionObj.action = 'wait';
    decisionObj.reasoning = 'Daily limit reached';
  }
  // Rule 3: Stale content is urgent
  else if (staleArticles.length > 0) {
    const worst = staleArticles.sort((a, b) => b.position - a.position)[0];
    decisionObj.action = 'publish_and_flag';
    decisionObj.reasoning = `Stale content flagged: ${worst.slug}`;
    decisionObj.staleArticle = worst;
  }
  // Rule 4: Orphan pages need links
  else if (orphanPages.length > 0) {
    decisionObj.action = 'publish';
    decisionObj.reasoning = `${orphanPages.length} orphan pages need internal linking`;
  }
  // Default
  else {
    decisionObj.action = 'publish';
    decisionObj.reasoning = 'Standard publishing cycle based on scoring metrics';
  }

  // Calculate Confidence
  if (decisionObj.score >= 7.5 && staleArticles.length === 0 && orphanPages.length === 0) {
    decisionObj.confidence = 'high';
  } else if (decisionObj.score >= 5.0 && decisionObj.score < 7.5) {
    decisionObj.confidence = 'medium';
  } else {
    decisionObj.confidence = 'low';
  }

  console.log(`   🧠 DECISION: ${decisionObj.action.toUpperCase()} | Score: ${decisionObj.score}/10 | Confidence: ${decisionObj.confidence.toUpperCase()} | ${decisionObj.reasoning}`);

  // Log decision
  const logPath = path.join(process.cwd(), '.github/gsc-reports/decision_log.json');
  let dlog = [];
  try { dlog = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch {}
  dlog.push({
    timestamp: new Date().toISOString(),
    action: decisionObj.action,
    score: decisionObj.score,
    confidence: decisionObj.confidence,
    reasoning: decisionObj.reasoning
  });
  if (dlog.length > 10) dlog = dlog.slice(-10);
  if (!fs.existsSync(path.dirname(logPath))) fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify(dlog, null, 2));

  return decisionObj;
}

// ── V6: Drift Control System ──
function runDriftCheck(gscInsights) {
  const today = new Date();
  if (today.getDay() !== 0) return; // Only run on Sunday

  const driftPath = path.join(process.cwd(), '.github/drift_detected.json');
  const history = loadAndMigrateHistory();
  const decisionLogPath = path.join(process.cwd(), '.github/gsc-reports/decision_log.json');
  let dlog = [];
  try { dlog = JSON.parse(fs.readFileSync(decisionLogPath, 'utf8')); } catch {}

  const signals = [];
  
  // 1. QA Drift
  const last5QA = history.slice(-5).filter(h => h.metadata?.qa_score !== undefined);
  if (last5QA.filter(h => h.metadata.qa_score < 88).length >= 3) {
    signals.push("QA_DRIFT");
  }

  // 2. Decision Drift
  const last10Decisions = dlog.slice(-10);
  let consecutiveWait = 0;
  for (const dec of last10Decisions) {
    if (dec.action === 'wait') consecutiveWait++;
    else consecutiveWait = 0;
    if (consecutiveWait >= 5) {
      signals.push("DECISION_DRIFT");
      break;
    }
  }

  // 3. Indexing Drift
  if (gscInsights?.summary) {
    if (gscInsights.summary.total_impressions === 0 && gscInsights.summary.total_pages_tracked > 5) {
      signals.push("INDEXING_DRIFT");
    }
  }

  // 4. CTR Drift
  const prevGscPath = path.join(process.cwd(), '.github/gsc-reports/previous.json');
  if (fs.existsSync(prevGscPath) && gscInsights?.summary?.avg_ctr) {
    try {
      const prevReport = JSON.parse(fs.readFileSync(prevGscPath, 'utf8'));
      if (prevReport.summary?.avg_ctr > 0) {
        const drop = (prevReport.summary.avg_ctr - gscInsights.summary.avg_ctr) / prevReport.summary.avg_ctr;
        if (drop > 0.2) signals.push("CTR_DRIFT");
      }
    } catch {}
  }

  if (signals.length > 0) {
    const reportPath = path.join(process.cwd(), '.github/gsc-reports/drift_report.md');
    fs.writeFileSync(driftPath, JSON.stringify({ detected_at: new Date().toISOString(), signals, paused: true }, null, 2));
    
    const reportMd = `# ⚠️ Drift Detected — ${new Date().toISOString().split('T')[0]}
## Signals
${signals.map(s => `- ${s}`).join('\n')}

## Last 5 QA Scores
${last5QA.map(h => `- ${h.metadata.keyword_primary}: ${h.metadata.qa_score}`).join('\n')}

## Last 5 Decisions
${last10Decisions.slice(-5).map(d => `- [${d.action}] Score ${d.score}: ${d.reasoning}`).join('\n')}

## Recommended Action
Investigate the identified drifts. Pause automation or review prompt constraints if QA scores are dropping consistently.

## Auto-Resume
System will auto-resume after 7 days unless drift_detected.json is manually deleted.`;
    
    fs.writeFileSync(reportPath, reportMd);
    console.log(`   ⚠️ DRIFT DETECTED: ${signals.join(', ')}. Publishing paused.`);
    console.log(`   📋 Report saved → .github/gsc-reports/drift_report.md`);
  } else {
    // Check if auto-resume is needed
    if (fs.existsSync(driftPath)) {
      try {
        const driftData = JSON.parse(fs.readFileSync(driftPath, 'utf8'));
        const daysSince = Math.floor((new Date() - new Date(driftData.detected_at)) / (1000 * 60 * 60 * 24));
        if (daysSince >= 7) {
          fs.unlinkSync(driftPath);
          console.log(`   ✅ DRIFT: Auto-resume after 7 days`);
        }
      } catch {}
    } else {
      console.log(`   ✅ DRIFT CHECK: No drift signals detected`);
    }
  }
}



function loadGscInsights() {
  try {
    if (!fs.existsSync(GSC_REPORT_PATH)) {
      console.log('   📊 No GSC report found. Running without search data.');
      return null;
    }
    const report = JSON.parse(fs.readFileSync(GSC_REPORT_PATH, 'utf8'));
    console.log(`   📊 GSC data loaded (${report.generated_at})`);
    console.log(`   ⭐ Rising Stars: ${report.for_auto_poster?.rising_star_slugs?.length || 0}`);
    console.log(`   🎯 Boost keywords: ${report.for_auto_poster?.boost_keywords?.length || 0}`);
    return report;
  } catch (e) {
    console.log(`   ⚠️ GSC report parse error: ${e.message}. Continuing without it.`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🗺️ V4: AUTO-SITEMAP UPDATER — Append new URLs after publishing
// ═══════════════════════════════════════════════════════════════════════
function updateSitemap(slug) {
  // We now use regenerateFullSitemap for consistency
  regenerateFullSitemap();
}

function regenerateFullSitemap() {
  try {
    console.log('   🗺️ Regenerating full sitemap...');
    const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
    const slugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
    
    let entries = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Static Pages
    const staticPages = [
      { loc: 'https://www.fouriqtech.com/', freq: 'weekly', p: '1.0' },
      { loc: 'https://www.fouriqtech.com/blog', freq: 'daily', p: '0.8' },
      { loc: 'https://www.fouriqtech.com/services/custom-saas-platform-development', freq: 'monthly', p: '0.9' },
      { loc: 'https://www.fouriqtech.com/services/legacy-web-application-modernization', freq: 'monthly', p: '0.9' },
    ];

    for (const page of staticPages) {
      entries += `  <url>\n    <loc>${page.loc}</loc>\n    <changefreq>${page.freq}</changefreq>\n    <priority>${page.p}</priority>\n  </url>\n`;
    }

    // Dynamic Blog Posts
    for (const slug of slugs) {
      entries += `  <url>\n    <loc>https://www.fouriqtech.com/blog/${slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    entries += `</urlset>`;
    fs.writeFileSync(SITEMAP_PATH, entries);
    console.log(`   🗺️ Sitemap fully regenerated with ${staticPages.length + slugs.length} URLs.`);
  } catch (e) {
    console.error(`   ⚠️ Sitemap regeneration failed: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔬 RESEARCHER — SEO Research + SERP Analysis + Semantic Clustering
// ═══════════════════════════════════════════════════════════════════════
async function researcherAgent(config, existingSlugs, knowledgeCtx) {
  const models = getModels('research');
  console.log(`\n🔬 RESEARCHER: Deep keyword + SERP + semantic analysis...`);

  return await healedCall('Researcher', async (prevErr) => {
    const fix = prevErr ? `\nFIX PREVIOUS ERROR: "${prevErr.message}". Ensure valid JSON.` : '';

    // V7: Load keyword history for anti-cannibalization
    const history = loadAndMigrateHistory();
    const usedKeywords = history.map(h => h.metadata?.keyword_primary || '').filter(k => k);
    const recentClusters = history
      .filter(h => {
        const pubDate = h.metadata?.published_date;
        if (!pubDate) return false;
        const daysSince = Math.floor((new Date() - new Date(pubDate)) / (1000 * 60 * 60 * 24));
        return daysSince <= 14;
      })
      .map(h => h.metadata?.cluster || '');
    // V7: Load failure patterns for avoidance context
    const failureCtx = loadFailurePatterns();
    // V7: Load cluster map for gap-filling context
    const clusterCtx = getIncompleteClusterContext();

    const raw = await smartCall(models, `You are an expert SEO keyword researcher for FouriqTech, a web design & development agency targeting global startups and enterprises ($25k+ budgets).

COMPANY CONTEXT: ${knowledgeCtx}
EXISTING BLOG SLUGS (DO NOT DUPLICATE): ${JSON.stringify(existingSlugs)}
CURRENT KEYWORDS: ${JSON.stringify(config._flatKeywords || [])}

${failureCtx}

${clusterCtx}

═══ PHASE 1: KEYWORD EXPANSION ═══
Generate 40 keyword candidates across ALL of these FouriqTech service areas (8 keywords per area):

SERVICE AREAS:
1. React and Next.js development
2. B2B SaaS dashboards
3. Enterprise web applications
4. Legacy system modernization
5. UI/UX for data-heavy products

For EACH service area, generate 8 keywords using these patterns:
- "why is [X] slow"
- "how to fix [X] in production"
- "[X] not working with large dataset"
- "best way to build [X] for enterprise"
- "[X] vs [Y] for enterprise performance"
- "how to optimize [X] for B2B SaaS"
- "[X] performance audit"
- "reducing [X] load time in production"

═══ PHASE 2: FILTER (STRICT) ═══
Remove ANY keyword that matches these conditions:
1. Keyword already exists in this list: ${JSON.stringify(usedKeywords)}
2. Keyword is a variation of any keyword published in the last 14 days (same root topic words)
3. Keyword targets the same root topic as 2+ recent articles. Recent clusters to AVOID: ${JSON.stringify([...new Set(recentClusters)])}
4. Keyword difficulty above 7 AND intent is not problem-based
Log every rejected keyword and the reason it was rejected in the "rejected_keywords" array.

═══ PHASE 3: SCORE ═══
Score every remaining keyword using this formula:
Final Score = (Lead Intent × 0.35) + (Business Relevance × 0.25) + (Low Competition × 0.25) + (Indexing Speed × 0.15)

- Lead Intent: probability searcher becomes a paying client (1-10)
- Business Relevance: how closely FouriqTech services solve this problem (1-10)
- Low Competition: ability for a DR 5 domain to rank (1-10, where 10 = very easy)
- Indexing Speed: probability Google indexes within 7 days (1-10)

Hard reject if Lead Intent below 5.
Hard reject if Business Relevance below 7.
Hard reject if Final Score below 6.0.

═══ PHASE 4: SELECT AND CLASSIFY ═══
Pick the single highest scoring keyword. Then classify it:
- PILLAR: if the topic is broad enough to support 5+ sub-articles and no pillar exists for this cluster yet — target word count 2500-3000
- SUPPORTING: if a related pillar article already exists in keyword history — target word count 2200-2500
- PROGRAMMATIC: if the topic fits a repeatable template pattern like "how to fix X in React" — target word count 1500-1800

═══ SERP STRUCTURE ANALYSIS ═══
For the selected keyword, analyze what the top 10 ranking articles would look like.

═══ SEMANTIC KEYWORD CLUSTER ═══
Generate 15-30 related semantic keywords organized into categories.

${fix}

RETURN VALID JSON:
{
  "primary_keyword": "selected keyword from Phase 4",
  "article_type": "pillar/supporting/programmatic",
  "target_word_count": 2200,
  "secondary_keywords": ["kw1", "kw2", "kw3", "kw4"],
  "keyword_difficulty": "low/medium",
  "search_intent": "informational/commercial/transactional",
  "content_angle": "What makes our article unique",
  "competitor_gap_analysis": "What competitors are NOT covering",
  "estimated_volume": "high/medium/low",
  "rejected_keywords": [{"keyword": "kw", "reason": "duplicate"}],
  "selection_reasoning": "Why this keyword won Phase 3-4",
  "serp_analysis": {
    "avg_word_count": 2200,
    "common_h2_headings": ["heading1", "heading2", "heading3"],
    "common_h3_headings": ["sub1", "sub2"],
    "has_code_examples": true,
    "has_faq": true,
    "has_tables_checklists": false,
    "content_gaps": ["gap1", "gap2", "gap3"],
    "serp_summary": "Summary of what competitors cover and miss"
  },
  "semantic_cluster": {
    "primary": "the primary keyword",
    "supporting_longtail": ["kw1", "kw2", "kw3", "kw4", "kw5"],
    "problem_based": ["problem1", "problem2", "problem3", "problem4"],
    "technology_specific": ["tech1", "tech2", "tech3"],
    "architecture_specific": ["arch1", "arch2", "arch3"]
  }
}`, 'Researcher');

    const result = JSON.parse(raw);
    console.log(`   🎯 Primary: "${result.primary_keyword}" [${result.keyword_difficulty}]`);
    console.log(`   🔍 Intent: ${result.search_intent}`);
    console.log(`   💡 Angle: ${result.content_angle}`);
    console.log(`   📋 Type: ${result.article_type || 'supporting'} | Target: ${result.target_word_count || 2200} words`);
    console.log(`   🚫 Rejected: ${result.rejected_keywords?.length || 0} keywords filtered`);
    console.log(`   🔎 SERP: avg ${result.serp_analysis?.avg_word_count || '?'} words, ${result.serp_analysis?.content_gaps?.length || 0} gaps found`);
    console.log(`   🧬 Semantic cluster: ${Object.values(result.semantic_cluster || {}).flat().length} keywords`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 🧑‍💻 V5: KEYWORD REALISM AGENT — Human Search Simplification
// ═══════════════════════════════════════════════════════════════════════
// Intercepts AI-generated keywords and converts them to what humans
// ACTUALLY type into Google. Strips filler words, shortens phrases,
// and generates natural variations.
// ═══════════════════════════════════════════════════════════════════════
const AI_FILLER_WORDS = new Set([
  'enterprise', 'comprehensive', 'advanced', 'strategies', 'solutions',
  'services', 'methodology', 'implementation', 'architecture',
  'optimization', 'leveraging', 'utilizing', 'innovative', 'cutting-edge',
  'next-generation', 'state-of-the-art', 'high-performance', 'scalable',
  'robust', 'seamless', 'holistic', 'transformative', 'strategic',
  'dynamic', 'systematic', 'integrated', 'professional', 'premium',
  'best-in-class', 'world-class', 'mission-critical'
]);

function quickSimplifyKeyword(keyword) {
  const words = keyword.toLowerCase().split(/\s+/);
  const cleaned = words.filter(w => !AI_FILLER_WORDS.has(w));
  // If we stripped too much, keep the original minus only the worst offenders
  if (cleaned.length < 2) return words.filter(w => !['comprehensive','leveraging','utilizing','holistic'].includes(w)).join(' ');
  return cleaned.join(' ');
}

async function keywordRealismAgent(research) {
  const models = getModels('research');
  console.log(`\n🧑‍💻 KEYWORD REALISM: Humanizing AI keyword...`);
  console.log(`   📥 Original: "${research.primary_keyword}"`);

  // Quick rule-based check first
  const wordCount = research.primary_keyword.split(/\s+/).length;
  const quickSimplified = quickSimplifyKeyword(research.primary_keyword);

  // If keyword is already short and natural, skip the AI call
  if (wordCount <= 4 && quickSimplified === research.primary_keyword.toLowerCase()) {
    console.log(`   ✅ Already natural (${wordCount} words). No changes needed.`);
    return research;
  }

  return await healedCall('Keyword Realism', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(models, `You are a search behavior expert. Your job is to convert AI-generated keywords into what REAL HUMANS actually type into Google.

AI-GENERATED KEYWORD: "${research.primary_keyword}"
QUICK SIMPLIFIED VERSION: "${quickSimplified}"

═══ RULES ═══
1. Real humans type SHORT queries (2-4 words ideal, max 5 words).
2. Real humans DON'T use formal words like: enterprise, comprehensive, methodology, leveraging, strategic, holistic, transformative, innovative.
3. Real humans use PROBLEM language: "react app slow", "nextjs build error", "webpack bundle too big".
4. Real humans use SIMPLE language: "react performance tips" NOT "react application performance optimization strategies".
5. Keep the CORE MEANING. Don't change the topic, just simplify the phrasing.

═══ EXAMPLES ═══
"enterprise react application performance audit services" → "react performance audit"
"comprehensive nextjs server side rendering optimization" → "nextjs ssr optimization"
"advanced react dashboard performance optimization strategies" → "react dashboard performance"
"enterprise continuous integration deployment strategies" → "CI/CD pipeline setup"
"implementing micro frontend architecture in nextjs for enterprise" → "nextjs micro frontend"
"optimizing react bundle size for large scale applications" → "react bundle size optimization"

${fix}

Generate 5-8 human variations and pick the BEST one as the new primary keyword.

RETURN VALID JSON:
{
  "original_keyword": "${research.primary_keyword}",
  "naturalness_score": 0,
  "is_natural": false,
  "normalized_primary": "short human keyword here",
  "human_variations": ["var1", "var2", "var3", "var4", "var5"],
  "reasoning": "Why the original is unnatural and what humans actually search"
}`, 'Keyword Realism');

    const result = JSON.parse(raw);

    console.log(`   🎯 Naturalness Score: ${result.naturalness_score}/10`);
    console.log(`   📤 Normalized: "${result.normalized_primary}"`);
    console.log(`   🔄 Variations: ${result.human_variations?.join(', ')}`);

    // Apply the normalization
    if (result.naturalness_score < 7) {
      // Move original to secondary keywords, use normalized as primary
      const originalKw = research.primary_keyword;
      research.primary_keyword = result.normalized_primary;
      research.secondary_keywords = [
        originalKw,
        ...(result.human_variations || []).slice(0, 3),
        ...(research.secondary_keywords || [])
      ];
      // Deduplicate
      research.secondary_keywords = [...new Set(research.secondary_keywords)];
      console.log(`   ✅ Keyword REPLACED: "${originalKw}" → "${result.normalized_primary}"`);
    } else {
      console.log(`   ✅ Keyword is already natural enough. Keeping original.`);
      // Still add variations as secondary keywords
      research.secondary_keywords = [
        ...(result.human_variations || []).slice(0, 3),
        ...(research.secondary_keywords || [])
      ];
      research.secondary_keywords = [...new Set(research.secondary_keywords)];
    }

    return research;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 🎯 LEAD SCORER — Intent Detection & Priority Gate
// ═══════════════════════════════════════════════════════════════════════
async function leadScorerAgent(research, knowledgeCtx) {
  const models = getModels('lead_scoring');
  console.log(`\n🎯 LEAD SCORER: Evaluating keyword business value...`);

  return await healedCall('Lead Scorer', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(models, `You are an enterprise lead qualification expert for FouriqTech, a premium web design & development agency targeting global startups and enterprises ($25k+ budgets).

KEYWORD TO EVALUATE: "${research.primary_keyword}"
SEARCH INTENT: ${research.search_intent}
CONTENT ANGLE: ${research.content_angle}

COMPANY SERVICES:
- Custom Web Application Development (React, Next.js, TypeScript)
- Enterprise Performance Optimization
- High-end UI/UX Design (GSAP, Framer Motion)
- Digital Marketing & SEO
- E-commerce Development

SCORING INSTRUCTIONS:
Classify this keyword into one of three intent categories:

1. LEARNING INTENT
   Example: "what is micro frontend architecture"
   Traffic potential: High | Lead potential: Low
   
2. PROBLEM-SOLVING INTENT
   Example: "react dashboard slow performance"
   Traffic potential: Medium | Lead potential: Medium
   
3. BUYER / COMMERCIAL INTENT
   Example: "enterprise react performance optimization service"
   Traffic potential: Low | Lead potential: Very High

Score each dimension from 0-10:

- Lead Intent Score: How likely is the searcher to become a paying client?
  (0 = pure curiosity, 10 = actively looking to hire)
- Business Relevance: How closely does this align with FouriqTech services?
  (0 = completely unrelated, 10 = core service offering)
- Traffic Potential: How much search volume does this keyword get?
  (0 = almost none, 10 = very high volume)
- Competition Difficulty: How hard is it to rank for this keyword?
  (0 = very easy, 10 = extremely competitive)

Final Priority Score = (Lead Intent * 0.35) + (Business Relevance * 0.30) + (Traffic Potential * 0.20) + ((10 - Competition) * 0.15)

${fix}

RETURN VALID JSON:
{
  "intent_category": "learning/problem_solving/buyer_commercial",
  "lead_intent_score": 0,
  "business_relevance": 0,
  "traffic_potential": 0,
  "competition_difficulty": 0,
  "final_priority_score": 0.0,
  "reasoning": "Brief explanation of why this keyword scores this way",
  "recommendation": "proceed/skip"
}`, 'Lead Scorer');

    const result = JSON.parse(raw);
    
    // Recalculate the final priority score on our side for consistency
    result.final_priority_score = parseFloat((
      (result.lead_intent_score * 0.35) +
      (result.business_relevance * 0.30) +
      (result.traffic_potential * 0.20) +
      ((10 - result.competition_difficulty) * 0.15)
    ).toFixed(2));

    // Apply the gate rule
    result.passes_gate = result.lead_intent_score >= 6 && result.business_relevance >= 7;

    console.log(`   📊 Intent: ${result.intent_category}`);
    console.log(`   🎯 Lead Score: ${result.lead_intent_score}/10 | Business Rel: ${result.business_relevance}/10`);
    console.log(`   📈 Traffic: ${result.traffic_potential}/10 | Competition: ${result.competition_difficulty}/10`);
    console.log(`   ⭐ Final Priority: ${result.final_priority_score}/10`);
    console.log(`   ${result.passes_gate ? '✅ PASSES GATE' : '🚫 FAILS GATE (Lead<6 or Business<7)'}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 STRATEGIST — Topical Authority, Smart Linking, Topic Expansion
// ═══════════════════════════════════════════════════════════════════════
async function strategistAgent(research, leadScore, config, existingSlugs, existingTitles, blogHistory) {
  const models = getModels('strategy');
  console.log(`\n📊 STRATEGIST: Building topical authority plan...`);

  return await healedCall('Strategist', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    // Build slug-title map for intelligent linking
    const slugTitleMap = existingSlugs.map((slug, i) => `- /blog/${slug} → "${existingTitles[i] || slug}"`).join('\n');

    const raw = await smartCall(models, `You are a senior SEO content strategist for FouriqTech.

RESEARCHER'S FINDINGS:
- Primary Keyword: "${research.primary_keyword}"
- Secondary Keywords: ${JSON.stringify(research.secondary_keywords)}
- Search Intent: ${research.search_intent}
- Content Angle: ${research.content_angle}
- Competitor Gap: ${research.competitor_gap_analysis}

LEAD INTENT ANALYSIS:
- Intent Category: ${leadScore.intent_category}
- Lead Score: ${leadScore.lead_intent_score}/10
- Business Relevance: ${leadScore.business_relevance}/10
- Priority Score: ${leadScore.final_priority_score}/10

SERP STRUCTURE DATA:
${JSON.stringify(research.serp_analysis, null, 2)}

SEMANTIC KEYWORD CLUSTER:
${JSON.stringify(research.semantic_cluster, null, 2)}

═══ EXISTING BLOG PAGES (for intelligent internal linking) ═══
${slugTitleMap}

EXISTING KEYWORDS: ${JSON.stringify(config._flatKeywords || [])}

YOUR TASKS:

1. INTELLIGENT INTERNAL LINKING:
   ⚠️ INTERNAL LINK RULE — CRITICAL:
   You may ONLY select slugs from the EXISTING BLOG PAGES list above. Do not invent slugs. Do not predict future article slugs. Do not use slugs you think might exist. Only use slugs confirmed in the list above. If fewer than 4 valid slugs exist, use all available ones and supplement with homepage "/" and contact page "/#contact" links.

   From the existing pages above, select exactly 4-6 that are TOPICALLY RELEVANT to this article.
   Also ALWAYS include "/" (homepage) and "/#contact" (services).
   Do NOT select random pages. Each link must be justified by topical overlap.

2. ARTICLE OUTLINE (SCANNABLE ENGINEERING FORMAT):
   Create a detailed outline following this structure, incorporating SERP analysis data to BEAT competitors:
   - H1: Title (SEO-optimized)
   - Introduction (hook + what reader will learn)
   - Quick Summary Section
   - H2: Problem Overview (why this matters)
   - H2: Technical Explanation (core concepts)
   - H2: Implementation Guide
   - Code Example Slot
   - **MID-ARTICLE CTA SLOT** (conversion block after implementation)
   - H2: Optimization Techniques (with bullet list)
   - H2: Best Practices (Do/Don't list)
   - **EXPERT AUTHORITY BLOCK** (why FouriqTech has expertise)
   - H2: FAQ (4-5 questions)
   - H2: Conclusion with **FINAL CONVERSION CTA**

   IMPORTANT: Your outline must address ALL content gaps from the SERP analysis.
   NOTE: Add "Key Insight" blocks to at least 2 sections.

3. TOPIC AUTHORITY EXPANSION:
   Generate 5-10 supporting article ideas that build topical authority around this keyword cluster.
   These should cover different angles, depth levels, and related sub-topics.

4. SEMANTIC KEYWORD INTEGRATION TARGETS:
   From the semantic cluster, select 8-12 keywords the Writer MUST naturally integrate.

5. NO DUPLICATE KEYWORDS: Ensure primary_keyword is not already targeted.

${fix}

RETURN VALID JSON:
{
  "primary_keyword": "${research.primary_keyword}",
  "secondary_keywords": ${JSON.stringify(research.secondary_keywords)},
  "article_title": "SEO-optimized title with primary keyword",
  "cluster_topic": "Name of the topic cluster",
  "cluster_future_articles": ["future1", "future2", "future3", "future4", "future5", "future6", "future7"],
  "article_outline": [
    "Introduction: hook and overview (80-120 words)",
    "Quick Summary Section",
    "H2: Problem Overview section description",
    "H2: Technical explanation section",
    "H2: Implementation guide with steps",
    "Code Example Slot",
    "MID-ARTICLE CTA: Conversion block",
    "H2: Optimization techniques (with bullet list)",
    "H2: Best practices (Do/Don't list)",
    "EXPERT AUTHORITY BLOCK",
    "H2: FAQ with 4-5 questions",
    "H2: Conclusion with FINAL CONVERSION CTA"
  ],
  "internal_link_targets": ["slug1", "slug2", "slug3", "slug4"],
  "internal_link_reasoning": ["reason for link1", "reason for link2"],
  "external_authority_links": ["https://example.com relevant-resource"],
  "target_persona": "Who reads this",
  "call_to_action": "CTA text",
  "semantic_keywords_to_integrate": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8"]
}`, 'Strategist');

    const result = JSON.parse(raw);
    console.log(`   📝 Title: "${result.article_title}"`);
    console.log(`   🏗️ Cluster: ${result.cluster_topic}`);
    console.log(`   📋 Outline: ${result.article_outline?.length} sections (incl. conversion blocks)`);
    console.log(`   🔗 Links: ${result.internal_link_targets?.length} internal (auto-selected) + ${result.external_authority_links?.length} external`);
    console.log(`   🌱 Future topics: ${result.cluster_future_articles?.length} expansion articles`);
    console.log(`   🧬 Semantic targets: ${result.semantic_keywords_to_integrate?.length} keywords to integrate`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ✍️ WRITER — Enterprise Content Engine with Conversion Blocks
// ═══════════════════════════════════════════════════════════════════════
async function writerAgent(strategy, research, knowledgeCtx, blogHistory, escalation, qaFeedback = null) {
  const taskType = qaFeedback ? 'rewrite' : 'writing';
  const models = getModels(taskType, escalation);
  const mode = qaFeedback ? `(REWRITE #${escalation + 1})` : '';
  console.log(`\n✍️ WRITER ${mode}: Producing expert content...`);

  return await healedCall('Writer', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON with HTML content.` : '';
    const rewriteBlock = qaFeedback
      ? `\n\n🔴 QA REJECTED YOUR DRAFT. FIX ALL OF THESE:\n${qaFeedback}\nRewrite the ENTIRE article from scratch addressing every issue.`
      : '';

    const semanticKws = strategy.semantic_keywords_to_integrate || [];
    const failureCtx = loadFailurePatterns();

    const raw = await smartCall(models, `You are a senior technical content writer for FouriqTech. Your goal is to write an article that rivals Stripe, Vercel, or Cloudflare engineering blogs in readability, technical authority, and scannability.

STRATEGY BRIEF:
- Primary Keyword: "${strategy.primary_keyword}"
- Secondary Keywords: ${JSON.stringify(strategy.secondary_keywords)}
- Title: "${strategy.article_title}"
- Outline: ${JSON.stringify(strategy.article_outline)}
- Internal Links: ${JSON.stringify(strategy.internal_link_targets)}
- External Links: ${JSON.stringify(strategy.external_authority_links)}
- CTA: "${strategy.call_to_action}"
- Persona: "${strategy.target_persona}"

SEMANTIC KEYWORDS TO INTEGRATE (use at least 8-12 naturally):
${JSON.stringify(semanticKws)}

SERP COMPETITIVE INTELLIGENCE:
${JSON.stringify(research.serp_analysis, null, 2)}

--- COMPANY FACTS (USE ONLY THESE) ---
${knowledgeCtx}

--- TONE REFERENCE ---
${blogHistory.substring(0, 2000)}

${failureCtx}

${rewriteBlock}
${fix}

═══ ENTERPRISE AUDIENCE FILTER (CRITICAL) ═══
NEVER explain basic concepts like "What is React?", "What is JavaScript?", "What is CSS?", "What is Node.js?".
ASSUME the reader is a senior engineer, VP of Engineering, CTO, or technical architect.
Focus ONLY on:
- Architecture decisions and trade-offs
- Scalability challenges and solutions
- Performance engineering techniques
- System design patterns
- Enterprise development workflows
- Data-driven decision making
Avoid: Beginner tutorials, obvious definitions, "getting started" content, introductory explanations.

═══ MANDATORY CONVERSION BLOCKS ═══

1. MID-ARTICLE CTA (place AFTER the Implementation Guide section):
   Insert a conversion-focused paragraph wrapped in:
   <div class="cta-block"><h3>Need Expert Help?</h3><p>[Specific consulting offer related to article topic, mentioning FouriqTech expertise]</p><a href="/#contact">Get a Free Consultation</a></div>

2. EXPERT AUTHORITY BLOCK (place AFTER Best Practices):
   A paragraph explaining why FouriqTech has specific expertise in this domain.
   Reference actual tech stack (React, Next.js, TypeScript, GSAP, Framer Motion).
   Mention experience with enterprise clients and $25k+ projects.

3. FINAL CONVERSION CTA (at the end of Conclusion):
   A clear consulting offer or solution pitch.
   Include: <a href="/#contact">Contact FouriqTech</a>

═══ STRICT ENGINEERING BLOG FORMATTING RULES ═══

1. MAX PARAGRAPH LENGTH: 50-80 words maximum. NEVER write a "wall of text".
2. MANDATORY BULLET LISTS: Every major H2 section MUST contain at least one bulleted or numbered list.
3. KEY INSIGHT BLOCKS: Insert 2 to 4 using: <blockquote><strong>Key Insight:</strong> [insight]</blockquote>
4. TECHNICAL CODE BLOCKS: Provide at least 1-2 practical code examples using <pre><code class="language-javascript">...</code></pre>.
5. VISUAL BREAKS: Mix paragraphs, lists, code, and insights constantly.
6. QUICK SUMMARY: After the introduction, provide a "Quick Summary" section.
7. DO/DON'T LIST: In "Best Practices" section, format as a clear Do and Don't list.

═══ TECHNICAL DEPTH REQUIREMENTS ═══
Your article MUST include ALL of these:
1. At least ONE real code example demonstrating the concept
2. At least ONE real-world engineering scenario (describe a concrete situation)
3. At least ONE performance metric or benchmark (numbers, percentages, ms)
4. At least ONE implementation workflow (step-by-step process)

═══ YOUR VOICE — STUDY THIS EXAMPLE AND REPLICATE THE STYLE NOT THE WORDS ═══
"We had a dashboard rendering 8000 candlesticks every 500ms via WebSocket. React re-rendered the entire chart on every tick. By tick 200 the browser tab was consuming 1.4GB of RAM and Chrome was throttling our requestAnimationFrame callbacks. We tried React.memo first. Obviously. Didn't help — the data reference was new on every WebSocket message so memo never short-circuited. Then we tried useRef to store the chart instance and push delta updates only. Better, but now we had stale closure bugs that took two days to find. What actually worked: move the chart off the React render cycle entirely. OffscreenCanvas in a Web Worker, postMessage the data, let the Worker own the animation loop. React just mounts a canvas element and forgets it. Frame rate went from 12FPS to stable 58FPS. Memory dropped to 180MB. The trade-off nobody mentions: debugging is a nightmare. You lose React DevTools visibility into anything in the Worker. Error boundaries don't catch Worker exceptions. You need your own error reporting via postMessage. Annoying but not hard."

WHY THIS IS HUMAN:
- Opens with a specific broken situation, not a definition
- Real numbers: 8000 candlesticks, 500ms, 1.4GB, 12FPS, 58FPS, 180MB
- Shows two things that FAILED before the solution
- Solution has a named downside
- Sentence length varies from 4 words to 25 words
- Slightly irritated casual tone

MANDATORY RULES (HARD FAIL IF VIOLATED):
1. Start the article MID-THOUGHT. Never with a definition.
2. Show minimum 2 failed approaches before the solution.
3. Show minimum 2 trade-offs with specific downsides named.
4. Include minimum 3 specific performance numbers in the article.
5. State opinions as facts, not suggestions.
6. One section must be noticeably shorter than others.
7. FAQ answers must read like Slack messages, not documentation.
8. NEVER use: In this article, Lets explore, It is worth noting, This guide will, By the end of this, In todays world, Let us dive in, Without further ado.

═══ 🚫 BANNED AI VOCABULARY (INSTANT FAIL IF USED) ═══
NEVER use ANY of these words or phrases. If you catch yourself writing one, DELETE IT and rephrase:
delve, tapestry, crucial, comprehensive, navigate, landscape, leverage, utilize, cutting-edge, game-changer, paradigm, synergy, robust, seamless, holistic, multifaceted, nuanced, intricate, pivotal, transformative, revolutionize, empower, harness, facilitate, streamline, elevate, in conclusion, furthermore, moreover, it's worth noting, it's important to note, in today's world, in today's digital age, in this article we will, let's dive in, without further ado, at the end of the day, needless to say, it goes without saying, as we all know, the fact of the matter, first and foremost, last but not least, in a nutshell, by and large, when it comes to, in order to, due to the fact that, on the other hand, having said that, that being said, it should be noted, interestingly enough, moving forward, let's explore, this guide will, by the end of this, in this article

═══ SECTION-LEVEL KEYWORD ENFORCEMENT ═══
After completing each H2 section, before moving to the next, verify the primary keyword "${strategy.primary_keyword}" appears in that section at least once. If missing, add it naturally before continuing. Every H2 section must contain the primary keyword.

═══ GENERAL WRITING RULES ═══
1. MINIMUM 2200 words. Count before returning. Do not estimate.
2. Use primary keyword naturally 15+ times across the full article. Every H2 section must contain it at least once.
3. Integrate at least 8 semantic keywords from the cluster naturally.
4. Internal links: <a href="/blog/SLUG">descriptive text</a> for every slug in the list. Minimum 4 internal links.
5. ALSO link to: <a href="/">FouriqTech</a> and <a href="/#contact">our services</a>.
6. External links: <a href="URL" target="_blank" rel="noopener">text</a> to 1-2 authority sources.
7. Code examples: Use <pre><code class="language-javascript">...</code></pre> format.
8. FAQ: Each question as <h3>, answer as <p>.
9. Semantic HTML only. NO markdown. NO code fences.
10. Vary sentence length. Use contractions. Be conversational but authoritative.
11. NEVER use: "landscape", "leverage", "harness", "cutting-edge", "game-changer", "seamless", "robust", "holistic", "in today's digital age".

═══ PRE-PUBLISH CHECKLIST — COMPLETE BEFORE RETURNING JSON ═══
Step 1: Count occurrences of primary keyword "${strategy.primary_keyword}" in your content. If count is below 15, add it naturally to every H2 section that is missing it. Do not return until count is 15+.
Step 2: Count occurrences of href='/blog/' in your HTML. If below 4, inject the required internal links from the internal_link_targets list into relevant paragraphs now. Also confirm href='/' and href='/#contact' exist.
Step 3: Count your words. If below 2200, expand the implementation section with one more real-world scenario. Do not return until word count is 2200+.
Step 4: Confirm one external link exists with target='_blank' rel='noopener'.
Only return JSON after ALL 4 steps pass.

═══ META GENERATION ═══
Also generate SEO meta data for this article.

RETURN VALID JSON:
{
  "title": "Article title with keyword",
  "slug": "url-friendly-slug",
  "excerpt": "150-word compelling description for search results",
  "category": "Category",
  "meta_title": "SEO title tag (max 60 chars)",
  "meta_description": "Meta description (max 155 chars)",
  "schema_headline": "Schema.org headline",
  "content": "<h1>...</h1><p>...</p>...(full HTML article)..."
}`, 'Writer');

    const result = JSON.parse(raw);
    const wordCount = result.content?.split(/\s+/).length || 0;

    // Count primary keyword occurrences
    const kwCount = (result.content?.toLowerCase().match(new RegExp(strategy.primary_keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

    // Count semantic keyword integration
    const semanticHits = semanticKws.filter(kw =>
      result.content?.toLowerCase().includes(kw.toLowerCase())
    ).length;

    console.log(`   📄 "${result.title}" (${wordCount} words)`);
    console.log(`   🔑 Keyword "${strategy.primary_keyword}" used ${kwCount} times`);
    console.log(`   🧬 Semantic keywords integrated: ${semanticHits}/${semanticKws.length}`);
    return { ...result, wordCount, keywordCount: kwCount, semanticHits };
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ✅ QA INSPECTOR — Strict Quality Gate with Technical Depth & Conversion Checks
// ═══════════════════════════════════════════════════════════════════════
async function qaAgent(draft, strategy, knowledgeCtx) {
  const models = getModels('qa');
  console.log(`\n✅ QA INSPECTOR: Running strict audit...`);

  return await healedCall('QA Inspector', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    // Pre-compute basic checks
    const content = draft.content || '';
    const lowerContent = content.toLowerCase();
    const wordCount = draft.wordCount || 0;
    const kwCount = draft.keywordCount || 0;
    const kwDensity = wordCount > 0 ? ((kwCount / wordCount) * 100).toFixed(2) : 0;

    // Formatting & Visual Break Checks
    const codeBlockCount = (content.match(/<pre|<code/gi) || []).length;
    const listCount = (content.match(/<ul|<ol/gi) || []).length;
    const insightCount = (content.match(/<blockquote><strong>Key Insight:<\/strong>/gi) || []).length;
    const hasFAQ = lowerContent.includes('frequently asked') || lowerContent.includes('faq') || (content.match(/<h3>/g) || []).length >= 3;
    const internalLinkCount = (content.match(/href="\/blog\//g) || []).length;
    const externalLinkCount = (content.match(/target="_blank"/g) || []).length;

    // Conversion Block Checks
    const hasMidCTA = lowerContent.includes('cta-block') || lowerContent.includes('need expert help');
    const hasExpertBlock = lowerContent.includes('fouriqtech') && (lowerContent.includes('expertise') || lowerContent.includes('specialize'));
    const hasFinalCTA = lowerContent.includes('/#contact') || lowerContent.includes('contact fouriqtech');

    // Technical Depth Checks
    const hasCodeExample = codeBlockCount >= 1;
    const hasMetricOrBenchmark = (lowerContent.match(/\d+\s*(ms|millisecond|percent|%|fps|kb|mb|second|minute|x faster|latency)/gi) || []).length >= 1;

    // Semantic keyword count
    const semanticHits = draft.semanticHits || 0;

    // Redundancy check
    const redundancyCount = (lowerContent.match(/enterprise performance|enterprise scalability|enterprise user experience|in today's digital age/gi) || []).length;

    // Beginner content check
    const beginnerCount = (lowerContent.match(/what is react|what is javascript|what is css|what is node|what is html|getting started with/gi) || []).length;

    const raw = await smartCall(models, `You are the QA Inspector for a top-tier Engineering Blog (like Stripe/Vercel). You are STRICT but FAIR.

You have TWO JOBS:
1. Check technical SEO quality (word count, links, keywords, etc.)
2. CHECK IF THE CONTENT SOUNDS LIKE AI-GENERATED TEXT. This is your MOST IMPORTANT job.

ARTICLE METRICS (PRE-COMPUTED):
- Word Count: ${wordCount} (Target: 2200+)
- Keyword Density: ${kwDensity}% (Target: ~1%)
- Secondary Keywords: ${JSON.stringify(strategy.secondary_keywords)}
- Code Examples: ${codeBlockCount} (Target: 2+)
- Bullet/Numbered Lists: ${listCount}
- Key Insight Blocks: ${insightCount} (Target: 2-4)
- Has FAQ Section: ${hasFAQ}
- Internal Links: ${internalLinkCount} (Target: 4-6)
- External Links: ${externalLinkCount}
- Redundant Buzzwords Found: ${redundancyCount}
- Beginner Explanations Found: ${beginnerCount} (Target: 0)

CONVERSION BLOCKS:
- Mid-Article CTA: ${hasMidCTA ? 'PRESENT' : 'MISSING'}
- Expert Authority Block: ${hasExpertBlock ? 'PRESENT' : 'MISSING'}
- Final Conversion CTA: ${hasFinalCTA ? 'PRESENT' : 'MISSING'}

TECHNICAL DEPTH:
- Code Example: ${hasCodeExample ? 'PRESENT' : 'MISSING'}
- Performance Metric/Benchmark: ${hasMetricOrBenchmark ? 'PRESENT' : 'MISSING'}
- Semantic Keywords Integrated: ${semanticHits} (Target: 8+)

ARTICLE CONTENT (first 10000 chars):
${content.substring(0, 10000)}

STRATEGY PLAN:
- Required Internal Link Slugs: ${JSON.stringify(strategy.internal_link_targets)}
- Required External Links: ${JSON.stringify(strategy.external_authority_links)}

${fix}

═══ QA CHECKLIST — SCORE EACH 1-10 ═══

1. PARAGRAPH_LENGTH: Are paragraphs consistently short (under 80 words)?
2. VISUAL_BREAKS: Enough bullet lists (${listCount}) and Key Insight blocks (${insightCount})?
3. TECHNICAL_AUTHORITY: At least 2 code examples (${codeBlockCount}) and actionable advice?
4. REDUNDANCY: Varied writing? Not repeating buzzwords? (${redundancyCount} found)
5. KEYWORD_USAGE: Primary used naturally? (${kwCount} times, ${kwDensity}%). Secondaries included?
6. WORD_COUNT: Genuinely 2000+ words of substance? (${wordCount} words)
7. INTERNAL_LINKS: 4-6 relevant internal links? (${internalLinkCount} found)
8. EXTERNAL_LINKS: At least 1 authority external link? (${externalLinkCount} found)
9. CONVERSION_BLOCKS: All 3 CTA blocks present? Mid-CTA(${hasMidCTA}), Expert(${hasExpertBlock}), Final(${hasFinalCTA})
10. TECHNICAL_DEPTH: Code example, real-world scenario, metrics, workflow present?
11. ENTERPRISE_TONE: No beginner explanations (${beginnerCount} found)? Written for senior engineers?
12. SEMANTIC_COVERAGE: At least 8 semantic keywords integrated? (${semanticHits} found)
13. HUMAN_TONE: Does this sound like a REAL human engineer wrote it? Check for:
    - Banned AI words (delve, tapestry, crucial, comprehensive, leverage, utilize, seamless, robust, holistic, transformative, pivotal, harness, streamline, elevate, nuanced, multifaceted, intricate, paradigm, synergy, cutting-edge, game-changer, furthermore, moreover, in conclusion, it's worth noting, in today's world, without further ado, let's dive in, needless to say, first and foremost, let's explore, this guide will, by the end of this, in this article)
    - Starts mid-thought without formal introductions or definitions?
    - Uses highly specific numbers and names concrete trade-offs/failures?
    - Opinions stated as hard facts ("DOM-based charts don't scale. That's not an opinion.")?
    - Varies sentence lengths wildly (e.g., 4 words next to 25 words)?
    - Answers FAQs like casual Slack messages between engineers?
    - Skips transition phrases completely?
    Score 1-3 if ANY banned words found or formal structure is used. Score 4-6 if tone is just okay but still slightly robotic. Score 7-10 if it genuinely sounds like an imperfect, grizzled senior engineer.

SCORING RULES:
- Each of the 13 criteria is scored 1-10, for a total of 130 raw points.
- Normalize: overallScore = round((sum / 130) * 100)
- Article PASSES if overallScore >= 80
- CRITICAL: If human_tone score is below 5, the article MUST FAIL regardless of other scores.
- Be FAIR: if the article genuinely covers the topic well AND sounds human, approve it.

RETURN VALID JSON:
{
  "scores": {
    "paragraph_length": 0,
    "visual_breaks": 0,
    "technical_authority": 0,
    "redundancy": 0,
    "keyword_usage": 0,
    "word_count": 0,
    "internal_links": 0,
    "external_links": 0,
    "conversion_blocks": 0,
    "technical_depth": 0,
    "enterprise_tone": 0,
    "semantic_coverage": 0,
    "human_tone": 0
  },
  "overallScore": 0,
  "approved": false,
  "issues": ["issue1", "issue2"],
  "ai_words_found": ["word1", "word2"],
  "feedback": "Detailed actionable feedback if rejected",
  "summary": "One-line quality summary"
}`, 'QA Inspector');

    const result = JSON.parse(raw);

    // V5: Hard fail if human_tone is too low (AI-detected content)
    if (result.scores?.human_tone && result.scores.human_tone < 5) {
      result.approved = false;
      result.issues = result.issues || [];
      result.issues.unshift(`🚨 AI TONE DETECTED (human_tone: ${result.scores.human_tone}/10). Content sounds robotic.`);
      if (result.ai_words_found?.length > 0) {
        result.issues.push(`Banned AI words found: ${result.ai_words_found.join(', ')}`);
      }
      result.feedback = (result.feedback || '') + '\n\nCRITICAL: Rewrite with human voice. Use contractions, first person, admit a mistake, vary sentence lengths wildly, and remove ALL banned AI vocabulary.';
      console.log(`   🚨 ANTI-AI GATE: FAILED (human_tone: ${result.scores.human_tone}/10)`);
      if (result.ai_words_found?.length > 0) {
        console.log(`   🚫 Banned words: ${result.ai_words_found.join(', ')}`);
      }
    }

    console.log(`   📊 Score: ${result.overallScore}/100 ${result.approved ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.issues?.length > 0) console.log(`   🔍 Issues: ${result.issues.slice(0, 3).join('; ')}`);
    console.log(`   💬 ${result.summary}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 👔 MANAGER — CEO & Orchestrator (V4.0)
// ═══════════════════════════════════════════════════════════════════════
async function managerAgent() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🧠 FOURIQTECH AI SEO ENGINE v5.0 — Autonomous Intel  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys: ${API_KEYS.length} | 🧠 Models: 3.1-flash-lite → 2.5-flash → 3.0-flash`);

  // V4.1: Ensure sitemap is fully in sync at the start of every run
  try { regenerateFullSitemap(); } catch (e) {}

  if (API_KEYS.length === 0) {
    console.error('❌ No API keys. Set GEMINI_API_KEYS. Exiting.');
    process.exit(1);
  }

  // ── V5: Check daily publish limit via Meta-Manager ──
  const todayCount = getTodayPublishCount();
  console.log(`📰 Published today: ${todayCount}/1`);

  // ── V5: Load GSC Insights ──
  const gscInsights = loadGscInsights();

  // ── V6: Drift Control System ──
  runDriftCheck(gscInsights);

  const driftPath = path.join(process.cwd(), '.github/drift_detected.json');
  if (fs.existsSync(driftPath)) {
    try {
      const driftData = JSON.parse(fs.readFileSync(driftPath, 'utf8'));
      if (driftData.paused) {
        const daysSince = Math.floor((new Date() - new Date(driftData.detected_at)) / (1000 * 60 * 60 * 24));
        if (daysSince >= 7) {
          fs.unlinkSync(driftPath);
        } else {
          console.log('\n⚠️ System paused due to drift. Delete .github/drift_detected.json to resume manually.');
          process.exit(0);
        }
      }
    } catch {}
  }

  // ── V6: Multi-Stage Feedback Engine ──
  console.log(`\n📦 RAG: Running multi-stage feedback checks...`);
  runFeedbackChecks(gscInsights);

  // ── V5: GSC Diagnostic Agent (Root Cause Analysis) ──
  let gscDiag = null;
  if (gscInsights) {
    gscDiag = await gscDiagnosticAgent(gscInsights);
  }

  // ── Load Resources ──
  let knowledgeCtx = "";
  if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    console.log(`📚 Knowledge docs: ${files.length}`);
    for (const f of files) {
      knowledgeCtx += `\n--- ${f} ---\n${fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, f), 'utf8')}\n`;
    }
  }

  let blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  const existingSlugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const existingTitles = [...blogDataFile.matchAll(/title:\s*'([^']+)'/g)].map(m => m[1]);
  const blogHistory = blogDataFile.substring(0, 8000);

  const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8');
  let config = yaml.load(configRaw);

  let flatKw = [];
  if (config.keywords && typeof config.keywords === 'object') {
    for (const tier of Object.values(config.keywords)) {
      if (Array.isArray(tier)) flatKw.push(...tier);
    }
  }
  config._flatKeywords = flatKw;

  console.log(`📰 Existing posts: ${existingSlugs.length} | 🔑 Keywords: ${flatKw.length}`);

  // V5: Detect stale articles and orphan pages
  const staleArticles = findStaleArticles(gscInsights, blogDataFile);
  const orphanPages = detectOrphanPages(blogDataFile);

  // ═══ V5: META-MANAGER AUTONOMOUS DECISION ═══
  const decision = metaManagerDecision(gscInsights, gscDiag, todayCount, staleArticles, orphanPages);
  if (decision.action === 'wait') {
    console.log('\n🧠 META-MANAGER: Decided to WAIT. Signing off. ✅');
    process.exit(0);
  }
  if (decision.action === 'optimize') {
    console.log('\n🧠 META-MANAGER: Weekend optimization mode. Signing off. ✅');
    process.exit(0);
  }

  // V4: Inject GSC boost keywords into the keyword pool
  if (gscInsights?.for_auto_poster?.boost_keywords?.length > 0) {
    const boostKws = gscInsights.for_auto_poster.boost_keywords;
    config._flatKeywords = [...new Set([...config._flatKeywords, ...boostKws])];
    console.log(`📊 V4: Injected ${boostKws.length} GSC opportunity keywords into research pool`);
  }

  // V4: Log rising stars for the Researcher to consider
  const risingStarCtx = gscInsights?.for_auto_poster?.rising_star_slugs?.length > 0
    ? `\n\nGSC RISING STARS (position 8-15, need supporting articles): ${gscInsights.for_auto_poster.rising_star_slugs.join(', ')}`
    : '';
  // V5: Add RAG keyword history and winning patterns to context
  knowledgeCtx += getKeywordHistoryContext();
  knowledgeCtx += loadWinningPatterns();

  console.log('');


  // ══════════════════════════════════════
  // Stage 1: Researcher (SERP + Semantic)
  // ══════════════════════════════════════
  let research;
  try { research = await researcherAgent(config, existingSlugs, knowledgeCtx); }
  catch (e) {
    console.error('❌ Researcher failed. Using fallback.');
    research = {
      primary_keyword: 'enterprise react performance audit methodology',
      secondary_keywords: ['react rendering bottlenecks', 'react profiler optimization', 'react memory leak detection', 'react bundle analysis'],
      search_intent: 'commercial', content_angle: 'enterprise audit methodology', competitor_gap_analysis: 'N/A',
      keyword_difficulty: 'medium', estimated_volume: 'medium',
      serp_analysis: { avg_word_count: 2200, common_h2_headings: [], common_h3_headings: [], has_code_examples: true, has_faq: true, has_tables_checklists: false, content_gaps: [], serp_summary: 'N/A' },
      semantic_cluster: { primary: 'enterprise react performance audit methodology', supporting_longtail: [], problem_based: [], technology_specific: [], architecture_specific: [] }
    };
  }

  // ══════════════════════════════════════
  // Stage 1.5: V5 Keyword Realism (Human Search Simplification)
  // ══════════════════════════════════════
  try { research = await keywordRealismAgent(research); }
  catch (e) {
    console.error(`   ⚠️ Keyword Realism failed: ${e.message}. Continuing with original keyword.`);
  }

  // Save new keywords to config
  if (research.primary_keyword) {
    if (!config.keywords.auto_discovered) config.keywords.auto_discovered = [];
    const newKws = [research.primary_keyword, ...(research.secondary_keywords || [])];
    // Also include semantic cluster keywords
    const semanticAll = Object.values(research.semantic_cluster || {}).flat().filter(k => typeof k === 'string');
    const allNewKws = [...newKws, ...semanticAll];
    config.keywords.auto_discovered = [...new Set([...config.keywords.auto_discovered, ...allNewKws])];
    config._flatKeywords = [...new Set([...config._flatKeywords, ...allNewKws])];
    const { _flatKeywords, ...save } = config;
    fs.writeFileSync(CONFIG_PATH, yaml.dump(save));
    console.log('   💾 Keywords saved.\n');
  }

  // ══════════════════════════════════════
  // Stage 2: Lead Intent Scoring Gate
  // ══════════════════════════════════════
  let leadScore;
  try { leadScore = await leadScorerAgent(research, knowledgeCtx); }
  catch (e) {
    console.error('❌ Lead Scorer failed. Assuming keyword passes gate.');
    leadScore = {
      intent_category: 'problem_solving', lead_intent_score: 7, business_relevance: 8,
      traffic_potential: 6, competition_difficulty: 5, final_priority_score: 7.0,
      reasoning: 'Fallback assumption', recommendation: 'proceed', passes_gate: true
    };
  }

  // ── GATE CHECK ──
  if (!leadScore.passes_gate) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🚫 KEYWORD REJECTED — Low Lead/Business Value          ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Keyword: "${research.primary_keyword}"`);
    console.log(`║  Lead Intent: ${leadScore.lead_intent_score}/10 (need ≥6)`);
    console.log(`║  Business Relevance: ${leadScore.business_relevance}/10 (need ≥7)`);
    console.log(`║  Reason: ${leadScore.reasoning}`);
    console.log('║  Skipping. Will find a better keyword next cycle.       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    // Still write to temp file for visibility
    writeResearchTempFile(research, leadScore, null, null);
    console.log('\n👔 MANAGER: Engine signing off. ✅');
    process.exit(0);
  }

  // ── DEV AGENT INTERCEPTION ──
  if (leadScore.intent_category === 'buyer_commercial' && leadScore.lead_intent_score >= 8) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🚀 HIGH BUYER INTENT DETECTED — Routing to Dev Agent   ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Keyword: "${research.primary_keyword}"`);
    console.log(`║  Lead Score: ${leadScore.lead_intent_score}/10`);
    console.log('║  This keyword needs a landing page, not a blog post.    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    try {
      const QUEUE_PATH = path.join(process.cwd(), '.github/dev-tasks/queue.json');
      let queue = { tasks: [], completed: [] };
      if (fs.existsSync(QUEUE_PATH)) {
        queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
      }
      
      const routeSlug = research.primary_keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const componentName = routeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      
      queue.tasks.push({
        id: crypto.randomUUID(),
        type: 'landing_page',
        status: 'pending',
        created_at: new Date().toISOString(),
        keyword: research.primary_keyword,
        secondary_keywords: research.secondary_keywords,
        route: `/services/${routeSlug}`,
        page_title: `${componentName} Services`,
        target_file: `src/pages/services/${componentName}.tsx`,
        seo: {
          meta_title: `${research.primary_keyword} | FouriqTech`,
          meta_description: `Premium ${research.primary_keyword} services by FouriqTech.`
        },
        design_brief: { "note": "Use the /dev-tasks workflow to complete the brief and build the page." }
      });
      
      queue.last_updated = new Date().toISOString();
      fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
      console.log('   ✅ Task queued in .github/dev-tasks/queue.json');
      
    } catch (e) {
      console.error(`   ❌ Failed to queue task: ${e.message}`);
    }
    
    writeResearchTempFile(research, leadScore, null, null);
    console.log('\n👔 MANAGER: Engine signing off. ✅');
    process.exit(0);
  }

  // ══════════════════════════════════════
  // Stage 3: Strategist
  // ══════════════════════════════════════
  let strategy;
  try { strategy = await strategistAgent(research, leadScore, config, existingSlugs, existingTitles, blogHistory); }
  catch (e) { console.error('❌ Strategist failed. Aborting.'); process.exit(1); }

  // ── Save future topics to content pipeline ──
  if (strategy.cluster_future_articles?.length > 0) {
    const pipeline = loadContentPipeline();
    const existingTopics = new Set(pipeline.topics.map(t => t.title));
    for (const topic of strategy.cluster_future_articles) {
      if (!existingTopics.has(topic)) {
        pipeline.topics.push({
          title: topic,
          cluster: strategy.cluster_topic,
          source_keyword: research.primary_keyword,
          added_date: new Date().toISOString().split('T')[0],
          status: 'queued'
        });
      }
    }
    saveContentPipeline(pipeline);
    console.log(`   📋 Content pipeline: ${pipeline.topics.length} total topics saved`);
  }

  // ── Write Research to Temp File ──
  writeResearchTempFile(research, leadScore, strategy, null);

  // ══════════════════════════════════════
  // Stage 4 & 5: Writer ↔ QA Loop
  // ══════════════════════════════════════
  const MAX_ATTEMPTS = 4;
  let draft = null;
  let qaResult = null;
  let published = false;
  let finalAttemptCount = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    finalAttemptCount = attempt + 1;
    // Writer
    try {
      const feedback = (attempt > 0 && qaResult && !qaResult.approved) ? qaResult.feedback : null;
      draft = await writerAgent(strategy, research, knowledgeCtx, blogHistory, attempt, feedback);
    } catch (e) {
      console.error(`   ❌ Writer failed (escalation ${attempt}). Continuing...`);
      continue;
    }

    // QA
    try { qaResult = await qaAgent(draft, strategy, knowledgeCtx); }
    catch (e) {
      console.error('   ⚠️ QA failed. Cannot auto-approve under strict rules. Continuing...');
      qaResult = { approved: false, overallScore: 0, feedback: 'QA engine unavailable', issues: ['QA unavailable'] };
    }

    if (qaResult.approved && qaResult.overallScore >= 90) {
      published = true;
      break;
    }

    if (qaResult.overallScore >= 90 && !qaResult.approved) {
      qaResult.approved = true;
      published = true;
      break;
    }

    // V4: Auto-fix — if score is 80-89, try targeted fixes before full rewrite
    if (qaResult.overallScore >= 80 && qaResult.overallScore < 90 && draft) {
      console.log(`\n   🔧 V4 AUTO-FIX: Score ${qaResult.overallScore}/100 — attempting targeted fixes...`);
      
      // Auto-fix: Boost internal links if insufficient
      const internalLinkCount = (draft.content?.match(/href="\/blog\//g) || []).length;
      if (internalLinkCount < 4) {
        const linksToAdd = existingSlugs
          .filter(s => !draft.content?.includes(s))
          .slice(0, 4 - internalLinkCount);
        let fixedContent = draft.content;
        const existingTitlesMap = existingSlugs.map((s, i) => ({ slug: s, title: existingTitles[i] || s }));
        for (const linkSlug of linksToAdd) {
          const linkTitle = existingTitlesMap.find(e => e.slug === linkSlug)?.title || linkSlug;
          // Insert before the FAQ section
          const faqMarker = fixedContent.match(/<h2[^>]*>.*(?:FAQ|Frequently)/i);
          if (faqMarker) {
            const insertPoint = fixedContent.indexOf(faqMarker[0]);
            const linkHtml = `<p>For more insights, explore our guide on <a href="/blog/${linkSlug}">${linkTitle}</a>.</p>\n\n`;
            fixedContent = fixedContent.slice(0, insertPoint) + linkHtml + fixedContent.slice(insertPoint);
          }
        }
        draft.content = fixedContent;
        console.log(`   🔗 Auto-injected ${linksToAdd.length} internal links`);
      }

      // Auto-fix: Boost word count if below 2000
      if (draft.wordCount < 2000) {
        console.log(`   📝 Word count ${draft.wordCount} < 2000 — will be addressed in rewrite`);
      }

      // Re-count after fixes
      draft.wordCount = draft.content?.split(/\s+/).length || 0;
      const kwCountFixed = (draft.content?.toLowerCase().match(new RegExp(strategy.primary_keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      draft.keywordCount = kwCountFixed;
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      console.log(`\n   ⬆️ ESCALATING → ${getModels('rewrite', attempt + 1)[0]} (attempt ${attempt + 2}/${MAX_ATTEMPTS})`);
    }
  }

  // Update temp file with QA results
  writeResearchTempFile(research, leadScore, strategy, qaResult);

  // ══════════════════════════════════════
  // Stage 6: Publish or Skip
  // ══════════════════════════════════════
  if (published && draft) {
    console.log('\n👔 PUBLISHING approved content...');

    // V5: Inject Schema Markup (FAQ + Article)
    draft.content = injectSchemaMarkup(draft, strategy);

    const safe = s => (s || '').replace(/'/g, "\\'").replace(/`/g, '\\`').replace(/\${/g, '\\${');

    const newPost = `
  {
    slug: '${safe(draft.slug)}',
    title: '${safe(draft.title)}',
    excerpt: '${safe(draft.excerpt)}',
    date: '${new Date().toISOString().split('T')[0]}',
    readTime: '${Math.ceil(draft.wordCount / 200)} min read',
    category: '${safe(draft.category)}',
    author: 'FouriqTech AI Manager',
    content: \`
      ${(draft.content || '').replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
  },`;

    let updated = blogDataFile.replace(
      'export const blogPosts: BlogPost[] = [',
      `export const blogPosts: BlogPost[] = [${newPost}`
    );

    // V5: Spider Agent — Reverse link injection into existing articles
    const spiderRes = spiderReverseLink(draft.slug, draft.title, strategy.primary_keyword, updated);
    updated = spiderRes.updated;
    let linksInjected = spiderRes.injectedCount;

    fs.writeFileSync(BLOG_DATA_PATH, updated);
    incrementPublishCount();

    // V4: Auto-update sitemap
    updateSitemap(draft.slug);

    // V6: Save to RAG Memory (with rewrite limits and link counts)
    saveArticleToRag(draft, strategy, research, qaResult, finalAttemptCount, linksInjected);

    // V7: Update Cluster Map Tracking
    updateClusterMap(strategy, draft);

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📋 RUN REPORT — ✅ PUBLISHED                            ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  📝 "${draft.title}"`);
    console.log(`║  🎯 Keyword: "${strategy.primary_keyword}"`);
    console.log(`║  📊 QA Score: ${qaResult.overallScore}/100`);
    console.log(`║  📏 Words: ${draft.wordCount}`);
    console.log(`║  🎯 Lead Score: ${leadScore.lead_intent_score}/10 | Biz Rel: ${leadScore.business_relevance}/10`);
    console.log(`║  🧬 Semantic: ${draft.semanticHits} KWs integrated`);
    console.log(`║  🏗️ Cluster: ${strategy.cluster_topic} (${strategy.article_type || 'supporting'})`);
    console.log(`║  🕸️ Spider: Reverse links injected`);
    console.log(`║  📋 Schema: FAQ + Article injected`);
    console.log(`║  📦 RAG: Saved to memory`);
    console.log(`║  🗺️ Map: Cluster progress tracked`);
    console.log(`║  🔗 /blog/${draft.slug}`);
    console.log('╚═══════════════════════════════════════════════════════════╝');
  } else {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📋 RUN REPORT — 🚫 NOT PUBLISHED                       ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Score: ${qaResult?.overallScore || 0}/100 (need 90+)`);
    console.log('║  Quality standards not met after all escalations.        ║');
    console.log('║  Skipping. Will retry next cycle.                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
  }

  console.log('\n👔 MANAGER: Engine signing off. ✅');
}

// ═══════════════════════════════════════════════════════════════════════
// 📝 RESEARCH TEMP FILE WRITER
// ═══════════════════════════════════════════════════════════════════════
function writeResearchTempFile(research, leadScore, strategy, qaResult) {
  try {
    const semanticCluster = research.semantic_cluster || {};
    const allSemantic = [
      ...(semanticCluster.supporting_longtail || []),
      ...(semanticCluster.problem_based || []),
      ...(semanticCluster.technology_specific || []),
      ...(semanticCluster.architecture_specific || [])
    ];

    const outlinePart = strategy
      ? (strategy.article_outline || []).map(s => "- " + s).join('\n')
      : '*(Strategy not yet generated)*';

    const linkPart = strategy
      ? `- **Internal Targets:** ${(strategy.internal_link_targets || []).join(', ')}\n- **Link Reasoning:** ${(strategy.internal_link_reasoning || []).join('; ')}\n- **External Targets:** ${(strategy.external_authority_links || []).join(', ')}`
      : '*(Strategy not yet generated)*';

    const qaPart = qaResult
      ? `- **Score:** ${qaResult.overallScore}/100 ${qaResult.approved ? '✅ PASSED' : '❌ FAILED'}\n- **Issues:** ${(qaResult.issues || []).join('; ')}\n- **Summary:** ${qaResult.summary || 'N/A'}`
      : '*(Not yet evaluated)*';

    const futureTopics = strategy?.cluster_future_articles
      ? strategy.cluster_future_articles.map(t => "- " + t).join('\n')
      : '*(Not yet generated)*';

    const content = `# SEO Automation Research Log — V4.0

> **Generated at:** ${new Date().toISOString()}
> Each blog generation cycle **overwrites** this file so you can monitor the AI's thought process.

---

## 🎯 Lead Intent Analysis

| Metric | Score |
|---|---|
| **Intent Category** | ${leadScore.intent_category} |
| **Lead Intent Score** | ${leadScore.lead_intent_score}/10 |
| **Business Relevance** | ${leadScore.business_relevance}/10 |
| **Traffic Potential** | ${leadScore.traffic_potential}/10 |
| **Competition Difficulty** | ${leadScore.competition_difficulty}/10 |
| **Final Priority Score** | ${leadScore.final_priority_score}/10 |
| **Gate Result** | ${leadScore.passes_gate ? '✅ PASSED' : '🚫 REJECTED'} |

**Reasoning:** ${leadScore.reasoning || 'N/A'}

---

## 🔬 Research Data

**Primary Keyword:** ${research.primary_keyword}
**Difficulty:** ${research.keyword_difficulty || 'N/A'}
**Intent:** ${research.search_intent || 'N/A'}
**Angle:** ${research.content_angle || 'N/A'}
**Competitor Gap:** ${research.competitor_gap_analysis || 'N/A'}
**Secondary Keywords:** ${(research.secondary_keywords || []).join(', ')}

---

## 🔍 SERP Structure Analysis

| Metric | Value |
|---|---|
| **Avg Word Count** | ${research.serp_analysis?.avg_word_count || 'N/A'} |
| **Code Examples** | ${research.serp_analysis?.has_code_examples ? 'Yes' : 'No'} |
| **FAQ Sections** | ${research.serp_analysis?.has_faq ? 'Yes' : 'No'} |
| **Tables/Checklists** | ${research.serp_analysis?.has_tables_checklists ? 'Yes' : 'No'} |

**Common H2 Headings:** ${(research.serp_analysis?.common_h2_headings || []).join(', ')}
**Content Gaps:** ${(research.serp_analysis?.content_gaps || []).join(', ')}
**SERP Summary:** ${research.serp_analysis?.serp_summary || 'N/A'}

---

## 🧬 Semantic Keyword Cluster (${allSemantic.length} keywords)

**Supporting Long-tail:** ${(semanticCluster.supporting_longtail || []).join(', ')}
**Problem-based:** ${(semanticCluster.problem_based || []).join(', ')}
**Technology-specific:** ${(semanticCluster.technology_specific || []).join(', ')}
**Architecture-specific:** ${(semanticCluster.architecture_specific || []).join(', ')}

${strategy ? `**Integration Targets (8-12):** ${(strategy.semantic_keywords_to_integrate || []).join(', ')}` : ''}

---

## 📊 Strategy & Outline

**Title:** ${strategy?.article_title || '*(Not yet generated)*'}
**Cluster:** ${strategy?.cluster_topic || '*(Not yet generated)*'}
**Target Persona:** ${strategy?.target_persona || 'N/A'}

### Article Outline
${outlinePart}

### Link Strategy
${linkPart}

---

## 🌱 Topic Authority Expansion

${futureTopics}

---

## ✅ QA Results

${qaPart}
`;
    fs.writeFileSync(RESEARCH_TEMP_PATH, content);
    console.log('   📝 Research log updated → seo_research_temp.md');
  } catch (err) {
    console.error('❌ Failed to write seo_research_temp.md:', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 BOOT
// ═══════════════════════════════════════════════════════════════════════
managerAgent().catch(err => {
  console.error('💥 FATAL:', err.message?.substring(0, 300));
  process.exit(1);
});
