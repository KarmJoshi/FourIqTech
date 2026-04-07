import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════
// 🧱 AGENCY CORE — Shared Utilities for All Agents
// ═══════════════════════════════════════════════════════════════════════
// Every agent imports from this one file. No more duplicated code.
//
//   🔑 API Key Rotation    — Multi-key round-robin with auto-rotate
//   🤖 Smart Model Calls   — Fallback chains, rate-limit handling
//   📝 Staging System      — Central queue for Manager review
//   📋 Activity Logger     — Real-time feed for the dashboard
//   🔧 Browser Toolbox     — Registry of pre-built crawlers
// ═══════════════════════════════════════════════════════════════════════

const CWD = process.cwd();

// ── Paths ──
export const PATHS = {
  staging:          path.join(CWD, '.github/staging/staging.json'),
  stagingDrafts:    path.join(CWD, '.github/staging/drafts'),
  stagingPages:     path.join(CWD, '.github/staging/pages'),
  stagingPatches:   path.join(CWD, '.github/staging/patches'),
  activityLog:      path.join(CWD, '.github/staging/activity_log.json'),
  directorJournal:  path.join(CWD, '.github/director_journal.json'),
  directorOrders:   path.join(CWD, '.github/director_orders.json'),
  publishLog:       path.join(CWD, '.github/publish_log.json'),
  techLog:          path.join(CWD, '.github/technical_seo_log.json'),
  knowledgeBase:    path.join(CWD, '.github/knowledge_base'),
  blogData:         path.join(CWD, 'src/data/blogPosts.ts'),
  appTsx:           path.join(CWD, 'src/App.tsx'),
  seoConfig:        path.join(CWD, 'fouriqtech-seo-config.yaml'),
  gscLatest:        path.join(CWD, '.github/gsc-reports/latest.json'),
  crawlerToolbox:   path.join(CWD, '.github/scripts/crawlers/toolbox-registry.json'),
};

// ── API KEY ROTATION ──
const PRO_KEY = process.env.GEMINI_PRO_API_KEY || '';
const OTHER_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .replace(/["']/g, '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

// Prioritize Pro Key (Billed) and deduplicate with others
const API_KEYS = [...new Set([PRO_KEY, ...OTHER_KEYS])].filter(k => k.length > 0);

let currentKeyIdx = 0;
let aiClient = API_KEYS.length > 0 ? new GoogleGenAI({ apiKey: API_KEYS[0] }) : null;

export function getApiKeyCount() { return API_KEYS.length; }

export function rotateKey() {
  currentKeyIdx = (currentKeyIdx + 1) % API_KEYS.length;
  const nextKey = API_KEYS[currentKeyIdx];
  process.env.GEMINI_API_KEY = nextKey;
  aiClient = new GoogleGenAI({ apiKey: nextKey });
  console.log(`   🔑 Rotated → Key #${currentKeyIdx + 1}/${API_KEYS.length}`);
  return nextKey;
}

export function getAiClient() { return aiClient; }

// ═══════════════════════════════════════════════════════════════════════
// 🤖 SMART MODEL CALLING — with fallback, retry, and rate-limit handling
// ═══════════════════════════════════════════════════════════════════════
export const sleep = ms => new Promise(r => setTimeout(r, ms));

// Model presets — roles mapped to model arrays
export const MODELS = {
  // Manager (THE BOSS) — highest reasoning, used sparingly
  manager:    ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  // Workers — primary PRO options with flash fallback
  researcher: ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  writer:     ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  architect:  ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  qa:         ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  scanner:    ['gemini-2.5-flash', 'gemini-2.0-flash'],
  builder:    ['gemini-2.5-flash', 'gemini-2.0-flash'],
  auditor:    ['gemini-2.5-flash', 'gemini-2.0-flash'],
  browser:    ['gemini-2.5-flash', 'gemini-2.0-flash'],
};

/**
 * Call AI model with smart fallback and rate-limit handling.
 * @param {string[]|string} modelArray - Model IDs to try in order
 * @param {string} contents - The prompt text
 * @param {string} agentName - For logging
 * @param {object} options - { json: bool, maxTokens: number }
 */
export async function smartCall(modelArray, contents, agentName = 'AI', options = {}) {
  const models = Array.isArray(modelArray) ? modelArray : [modelArray];
  const { json = true, maxTokens = 8192 } = options;

  for (const model of models) {
    let tries = 0;
    let backoffMs = 5000;

    console.log(`   🚀 [${agentName}] Trying model: ${model}...`);
    while (tries < API_KEYS.length * 2) {
      try {
        const config = { maxOutputTokens: maxTokens };
        if (json) config.responseMimeType = "application/json";

        const resp = await aiClient.models.generateContent({
          model, 
          contents: contents, 
          config
        });
        await sleep(2000); // Respect rate limits
        return resp.candidates[0].content.parts[0].text;
      } catch (err) {
        if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          console.log(`   ⏳ [${agentName}] Rate limit hit! Backing off for ${backoffMs/1000}s...`);
          await sleep(backoffMs);
          tries++;
          if (tries % 2 !== 0 && API_KEYS.length > 1) {
            rotateKey();
          } else {
            backoffMs = Math.min(backoffMs * 2, 60000);
          }
          continue;
        }
        const errStr = String(err.status || err.message || '').toLowerCase();
        if (errStr.includes('404') || errStr.includes('400') || errStr.includes('503') || errStr.includes('500') || errStr.includes('high demand')) {
          console.log(`   ❌ [${agentName}] Model ${model} unavailable (${err.status || 'Overloaded'}). Falling back...`);
          break;
        }
        throw err;
      }
    }
  }
  throw new Error(`[${agentName}] All models and API keys exhausted.`);
}

/**
 * Auto-retry wrapper with healing feedback
 */
export async function healedCall(agentName, fn, retries = 2) {
  let lastErr = null;
  for (let i = 1; i <= retries; i++) {
    try { return await fn(lastErr); }
    catch (e) {
      console.error(`   ⚠️ [${agentName}] Attempt ${i}: ${e.message?.substring(0, 120)}`);
      lastErr = e;
      if (i < retries) { console.log(`   🩹 Cooling down 10s...`); await sleep(10000); }
    }
  }
  throw lastErr;
}

// ═══════════════════════════════════════════════════════════════════════
// 📝 STAGING SYSTEM — Central queue for Manager review
// ═══════════════════════════════════════════════════════════════════════

function ensureStagingDirs() {
  [PATHS.stagingDrafts, PATHS.stagingPages, PATHS.stagingPatches].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

export function loadStaging() {
  ensureStagingDirs();
  try {
    return JSON.parse(fs.readFileSync(PATHS.staging, 'utf8'));
  } catch {
    const empty = { queue: [], stats: { total_submitted: 0, approved: 0, rejected: 0, pending: 0, approval_rate: '0%' } };
    fs.writeFileSync(PATHS.staging, JSON.stringify(empty, null, 2));
    return empty;
  }
}

export function saveStaging(data) {
  ensureStagingDirs();
  // Recalculate stats
  const q = data.queue || [];
  data.stats = {
    total_submitted: q.length,
    approved: q.filter(i => i.status === 'approved').length,
    rejected: q.filter(i => i.status === 'rejected').length,
    pending: q.filter(i => i.status === 'pending_review').length,
    approval_rate: q.length > 0 
      ? Math.round((q.filter(i => i.status === 'approved').length / q.length) * 100) + '%' 
      : '0%'
  };
  fs.writeFileSync(PATHS.staging, JSON.stringify(data, null, 2));
}

/**
 * Submit work to the staging area for Manager review.
 * @param {object} item - { type, department, title, keyword, summary, draft_path/code_path/diff_path, metadata }
 * @returns {string} The staging ID
 */
export function submitToStaging(item) {
  const staging = loadStaging();
  const id = `stg-${String(staging.stats.total_submitted + 1).padStart(3, '0')}`;
  
  // Ensure we have a physical file for the dashboard to preview
  let draftPath = item.draft_path || null;
  if (item.content && !draftPath) {
    const filename = `${id}_${Date.now()}.txt`;
    const relativePath = path.join('.github/staging/drafts', filename);
    const fullPath = path.join(process.cwd(), relativePath);
    
    if (!fs.existsSync(path.dirname(fullPath))) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    }
    
    fs.writeFileSync(fullPath, item.content);
    draftPath = relativePath;
  }

  const entry = {
    id,
    type: item.type, // 'blog_post', 'landing_page', 'technical_patch'
    department: item.department,
    status: 'pending_review',
    created_at: new Date().toISOString(),
    title: item.title || 'Untitled',
    content: item.content || null,
    summary: item.summary || {},
    draft_path: draftPath,
    code_path: item.code_path || null,
    diff_path: item.diff_path || null,
    metadata: item.metadata || {},
    manager_review: null,
    revision_count: 0,
  };
  
  staging.queue.unshift(entry); // newest first
  saveStaging(staging);
  
  logActivity('📝', item.department, `Submitted "${item.title}" to staging (${id})`, 'staging');
  console.log(`   📝 STAGING: "${item.title}" → ${id} (pending_review)`);
  
  return id;
}

/**
 * Manager reviews a staging item.
 * @param {string} stagingId 
 * @param {string} verdict - 'approved' | 'rejected'
 * @param {string} feedback - Manager's comment
 */
export function reviewStagingItem(stagingId, verdict, feedback) {
  const staging = loadStaging();
  const item = staging.queue.find(i => i.id === stagingId);
  if (!item) throw new Error(`Staging item ${stagingId} not found`);
  
  item.status = verdict;
  item.manager_review = {
    verdict,
    feedback,
    reviewed_at: new Date().toISOString(),
  };
  
  if (verdict === 'approved') {
    item.published_at = new Date().toISOString();
  } else if (verdict === 'rejected') {
    item.revision_count = (item.revision_count || 0) + 1;
  }
  
  saveStaging(staging);
  
  const emoji = verdict === 'approved' ? '✅' : '❌';
  logActivity(emoji, 'manager', `${verdict.toUpperCase()}: "${item.title}" — ${feedback}`, 'review');
  console.log(`   👔 MANAGER ${emoji}: ${verdict.toUpperCase()} "${item.title}" → "${feedback}"`);
}

/**
 * Get all pending items for Manager review.
 */
export function getPendingItems() {
  const staging = loadStaging();
  return staging.queue.filter(i => i.status === 'pending_review');
}

// ═══════════════════════════════════════════════════════════════════════
// 📋 ACTIVITY LOGGER — Real-time feed for the dashboard
// ═══════════════════════════════════════════════════════════════════════

export function logActivity(emoji, source, message, type = 'info') {
  let log;
  try {
    log = JSON.parse(fs.readFileSync(PATHS.activityLog, 'utf8'));
  } catch {
    log = { entries: [] };
  }
  
  log.entries.unshift({
    id: crypto.randomUUID(),
    emoji,
    source,
    message,
    type, // 'info', 'staging', 'review', 'publish', 'error', 'browser'
    timestamp: new Date().toISOString(),
  });
  
  // Keep last 200 entries
  log.entries = log.entries.slice(0, 200);
  
  const logDir = path.dirname(PATHS.activityLog);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(PATHS.activityLog, JSON.stringify(log, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════
// 🔧 BROWSER TOOLBOX — Registry of pre-built crawlers
// ═══════════════════════════════════════════════════════════════════════

export function loadToolboxRegistry() {
  try {
    return JSON.parse(fs.readFileSync(PATHS.crawlerToolbox, 'utf8'));
  } catch {
    return { tools: [] };
  }
}

export function findTool(toolName) {
  const registry = loadToolboxRegistry();
  return registry.tools.find(t => t.name === toolName) || null;
}

export function registerTool(tool) {
  const registry = loadToolboxRegistry();
  const existing = registry.tools.findIndex(t => t.name === tool.name);
  if (existing >= 0) {
    registry.tools[existing] = { ...registry.tools[existing], ...tool, updated_at: new Date().toISOString() };
  } else {
    registry.tools.push({ ...tool, created_at: new Date().toISOString(), fail_count: 0 });
  }
  
  const dir = path.dirname(PATHS.crawlerToolbox);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PATHS.crawlerToolbox, JSON.stringify(registry, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════
// 📂 KNOWLEDGE BASE LOADER
// ═══════════════════════════════════════════════════════════════════════

export function loadKnowledge() {
  let ctx = "";
  if (fs.existsSync(PATHS.knowledgeBase)) {
    const files = fs.readdirSync(PATHS.knowledgeBase).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    for (const f of files) {
      ctx += `\n--- ${f} ---\n${fs.readFileSync(path.join(PATHS.knowledgeBase, f), 'utf8')}\n`;
    }
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════
// 📋 DIRECTOR ORDERS
// ═══════════════════════════════════════════════════════════════════════

export function loadDirectorOrders() {
  try {
    return JSON.parse(fs.readFileSync(PATHS.directorOrders, 'utf8'));
  } catch {
    return null;
  }
}

export function saveDirectorOrders(orders) {
  fs.writeFileSync(PATHS.directorOrders, JSON.stringify(orders, null, 2));
}

export function hasFreshOrders(department) {
  try {
    const orders = JSON.parse(fs.readFileSync(PATHS.directorOrders, 'utf8'));
    const orderDate = orders.timestamp?.split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return orderDate === today && orders.department === department;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 DIRECTOR JOURNAL
// ═══════════════════════════════════════════════════════════════════════

export function loadJournal() {
  try {
    return JSON.parse(fs.readFileSync(PATHS.directorJournal, 'utf8'));
  } catch {
    return { entries: [], total_cycles: 0 };
  }
}

export function appendJournalEntry(entry) {
  const journal = loadJournal();
  journal.total_cycles = (journal.total_cycles || 0) + 1;
  entry.cycle = journal.total_cycles;
  entry.timestamp = new Date().toISOString();
  journal.entries.push(entry);
  // Keep last 50 journal entries
  journal.entries = journal.entries.slice(-50);
  fs.writeFileSync(PATHS.directorJournal, JSON.stringify(journal, null, 2));
  return entry;
}

// ═══════════════════════════════════════════════════════════════════════
// 🛣️ ROUTE HELPERS
// ═══════════════════════════════════════════════════════════════════════

export function getExistingRoutes() {
  try {
    const appContent = fs.readFileSync(PATHS.appTsx, 'utf8');
    return [...appContent.matchAll(/path="([^"]+)"/g)].map(m => m[1]);
  } catch { return ['/', '*']; }
}

export function getExistingBlogSlugs() {
  try {
    const blogData = fs.readFileSync(PATHS.blogData, 'utf8');
    return [...blogData.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  } catch { return []; }
}

// ══ END OF CORE ══
