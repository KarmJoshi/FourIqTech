import fs from 'fs';
import path from 'path';
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

// ── API KEY SELECTION (Mode-aware: free vs paid) ──
function getApiMode() {
  // Check settings file first (set by UI toggle)
  try {
    const settingsPath = path.join(CWD, '.github/staging/system-settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.apiMode) return settings.apiMode;
    }
  } catch {}
  // Fallback to env var
  return process.env.GEMINI_API_MODE || 'free';
}

const API_MODE = getApiMode();
const FREE_KEYS = (process.env.GEMINI_FREE_KEY || process.env.GEMINI_API_KEYS || '')
  .replace(/["']/g, '').split(',').map(k => k.trim()).filter(k => k.length > 0);
const PAID_KEYS = (process.env.GEMINI_PAID_KEY || '')
  .replace(/["']/g, '').split(',').map(k => k.trim()).filter(k => k.length > 0);

// Pick keys based on mode
const API_KEYS = API_MODE === 'paid' && PAID_KEYS.length > 0 ? PAID_KEYS : FREE_KEYS;
console.log(`   🔑 API Mode: ${API_MODE.toUpperCase()} | Keys: ${API_KEYS.length}`);

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

// Model presets — fallback defaults per role
// Free tier (May 2026): gemini-3.5-flash-preview, gemini-3-flash-preview, gemini-2.5-flash, gemini-2.0-flash
export const MODELS = {
  manager:         ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  content_manager: ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  researcher:      ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.0-flash'],
  writer:          ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  architect:       ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  qa:              ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  scanner:         ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.0-flash'],
  builder:         ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  auditor:         ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
  browser:         ['gemini-3.5-flash-preview', 'gemini-3-flash-preview', 'gemini-2.0-flash'],
};

const SETTINGS_PATH = path.join(CWD, '.github/staging/system-settings.json');

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    }
  } catch (e) {}
  return {};
}

/**
 * Fetch dynamic model fallback arrays for a given role based on stored settings.
 * Priority: JSON settings > Database > Hardcoded MODELS
 * The user-selected model is ALWAYS tried first. Hardcoded defaults are appended as fallbacks.
 */
export async function getModelsForRole(role) {
  let userSelected = null;

  // Try JSON file first (set by UI)
  const settings = readSettings();
  if (settings.agentModels?.[role]) {
    const assigned = settings.agentModels[role];
    userSelected = Array.isArray(assigned) ? assigned[0] : assigned;
  }
  
  // Fallback to database if no JSON setting
  if (!userSelected) {
    try {
      const config = await prisma.agencyConfig.findUnique({ where: { id: 'default' } });
      if (config?.agentModels?.[role]) {
        const assigned = config.agentModels[role];
        userSelected = Array.isArray(assigned) ? assigned[0] : assigned;
      }
    } catch (e) {
      // DB error, fallback silently
    }
  }

  // Build final model array: user selection first, then hardcoded fallbacks
  const defaults = MODELS[role] || ['gemini-2.5-flash', 'gemini-2.0-flash'];
  
  if (userSelected) {
    // Deduplicate: user's pick first, then defaults (excluding the pick)
    const fallbacks = defaults.filter(m => m !== userSelected);
    return [userSelected, ...fallbacks];
  }
  
  return defaults;
}

/**
 * Call AI model with smart fallback and rate-limit handling.
 * @param {string[]|string} modelArrayOrRole - Model IDs to try in order, or a string role to fetch dynamic models
 * @param {string} contents - The prompt text
 * @param {string} agentName - For logging
 * @param {object} options - { json: bool, maxTokens: number }
 */
export async function smartCall(modelArrayOrRole, contents, agentName = 'AI', options = {}) {
  let models = [];
  if (typeof modelArrayOrRole === 'string' && Object.keys(MODELS).includes(modelArrayOrRole.toLowerCase())) {
     models = await getModelsForRole(modelArrayOrRole.toLowerCase());
  } else {
     models = Array.isArray(modelArrayOrRole) ? modelArrayOrRole : [modelArrayOrRole];
  }
  const { json = true, maxTokens = 8192 } = options;

  // NOTE: googleSearch grounding and JSON response mime type are mutually exclusive.
  const useGrounding = !json;

  for (const model of models) {
    let rateLimitTries = 0;
    let backoffMs = 5000;
    let withGrounding = useGrounding;
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes max per model
    const startTime = Date.now();

    console.log(`   🚀 [${agentName}] Trying model: ${model}...`);
    while (true) {
      try {
        const config = { maxOutputTokens: maxTokens };
        if (json) config.responseMimeType = "application/json";
        if (withGrounding) config.tools = [{ googleSearch: {} }];

        const resp = await aiClient.models.generateContent({
          model,
          contents: contents,
          config
        });
        // Free tier: 6s gap between successful calls
        await sleep(6000);
        const text = typeof resp.text === 'function' ? resp.text() : resp.text;
        if (!text) {
          console.log(`   ⚠️ [${agentName}] Model returned empty response. Retrying...`);
          continue;
        }
        return text;
      } catch (err) {
        const errStr = String(err.status || err.message || '').toLowerCase();
        const elapsed = Date.now() - startTime;

        // 503 = server overloaded — retry INDEFINITELY (doesn't cost quota)
        if (err.status === 503 || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('overloaded')) {
          if (elapsed > maxWaitTime) {
            console.log(`   ⏰ [${agentName}] Model ${model} overloaded for 5+ min. Trying next model...`);
            break;
          }
          console.log(`   ⏳ [${agentName}] Server busy (503). Retrying in ${backoffMs/1000}s... (${Math.round(elapsed/1000)}s elapsed)`);
          await sleep(backoffMs);
          backoffMs = Math.min(backoffMs * 1.5, 30000); // Cap at 30s between retries
          continue;
        }

        // 429 = quota exhausted — retry with key rotation
        if (err.status === 429 || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
          rateLimitTries++;
          if (rateLimitTries > API_KEYS.length * 3) {
            console.log(`   💀 [${agentName}] All keys exhausted for ${model}. Trying next model...`);
            break;
          }
          console.log(`   ⏳ [${agentName}] Rate limit (429). Backing off ${backoffMs/1000}s...`);
          await sleep(backoffMs);
          if (API_KEYS.length > 1) rotateKey();
          backoffMs = Math.min(backoffMs * 2, 60000);
          continue;
        }

        // 404 = model doesn't exist — skip immediately
        if (errStr.includes('404')) {
          console.log(`   ❌ [${agentName}] Model ${model} not found (404). Skipping...`);
          break;
        }

        // 400 with grounding = model doesn't support it — retry without
        if (errStr.includes('400') && withGrounding) {
          console.log(`   ⚠️  [${agentName}] Model ${model} rejected grounding. Retrying without...`);
          withGrounding = false;
          continue;
        }

        // 400/500 = bad request or server error — skip to next model
        if (errStr.includes('400') || errStr.includes('500')) {
          console.log(`   ❌ [${agentName}] Model ${model} error (${err.status}). Falling back...`);
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

export async function loadStaging() {
  const items = await prisma.stagingItem.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const stats = {
    total_submitted: items.length,
    approved: items.filter(i => i.status === 'approved').length,
    rejected: items.filter(i => i.status === 'rejected').length,
    pending: items.filter(i => i.status === 'pending_review').length,
    approval_rate: items.length > 0 
      ? Math.round((items.filter(i => i.status === 'approved').length / items.length) * 100) + '%' 
      : '0%'
  };

  return { queue: items, stats };
}

/**
 * Submit work to the staging area for Manager review.
 */
export async function submitToStaging(item) {
  const count = await prisma.stagingItem.count();
  const id = `stg-${String(count + 1).padStart(3, '0')}`;
  
  let draftPath = item.draft_path || null;
  if (item.content && !draftPath) {
    const filename = `${id}_${Date.now()}.txt`;
    const relativePath = path.join('.github/staging/drafts', filename);
    const fullPath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(path.dirname(fullPath))) fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, item.content);
    draftPath = relativePath;
  }

  const settings = readSettings();
  const isAutoCommit = settings.isAutoCommit === true;

  const entry = await prisma.stagingItem.create({
    data: {
      id,
      type: item.type || 'other',
      department: item.department || 'Unknown',
      status: isAutoCommit ? 'approved' : 'pending_review',
      createdAt: new Date(),
      title: item.title || 'Untitled',
      content: item.content || null,
      summary: item.summary || {},
      draftPath,
      codePath: item.code_path || null,
      diffPath: item.diff_path || null,
      metadata: item.metadata || {},
      publishedAt: isAutoCommit ? new Date() : null,
    }
  });
  
  if (isAutoCommit) {
    await logActivity('🚀', item.department, `AUTO-COMMIT: "${item.title}" approved and marked for publication`, 'publish');
    console.log(`   🚀 AUTO-COMMIT enabled. Item ${id} marked as APPROVED.`);
  } else {
    await logActivity('📝', item.department, `Submitted "${item.title}" to staging (${id})`, 'staging');
    console.log(`   📝 STAGING: "${item.title}" → ${id} (pending_review)`);
  }
  
  return id;
}

export async function reviewStagingItem(stagingId, verdict, feedback) {
  const updateData = {
    status: verdict,
    managerReview: {
      verdict,
      feedback,
      reviewed_at: new Date().toISOString(),
    }
  };
  
  if (verdict === 'approved') {
    updateData.publishedAt = new Date();
  } else if (verdict === 'rejected') {
    updateData.revisionCount = { increment: 1 };
  }
  
  const item = await prisma.stagingItem.update({
    where: { id: stagingId },
    data: updateData
  });
  
  const emoji = verdict === 'approved' ? '✅' : '❌';
  await logActivity(emoji, 'manager', `${verdict.toUpperCase()}: "${item.title}" — ${feedback}`, 'review');
  console.log(`   👔 MANAGER ${emoji}: ${verdict.toUpperCase()} "${item.title}" → "${feedback}"`);
  return item;
}

export async function getPendingItems() {
  return await prisma.stagingItem.findMany({
    where: { status: 'pending_review' },
    orderBy: { createdAt: 'desc' }
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 📋 ACTIVITY LOGGER — Real-time feed for the dashboard
// ═══════════════════════════════════════════════════════════════════════

export async function logActivity(emoji, source, message, type = 'info') {
  const entry = await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      emoji,
      source,
      message,
      type,
      timestamp: new Date()
    }
  });
  
  console.log(`   🕒 ACTIVITY [${type}]: ${message}`);
  return entry;
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

export async function loadJournal() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { date: 'desc' },
    take: 50
  });
  return { entries, total_cycles: entries.length };
}

export async function appendJournalEntry(entry) {
  const count = await prisma.journalEntry.count();
  const cycle = count + 1;
  const entryId = crypto.createHash('md5').update(`${cycle}-${new Date().toISOString()}`).digest('hex');

  const result = await prisma.journalEntry.create({
    data: {
      id: entryId,
      date: new Date(),
      cycle: cycle,
      sitrepSummary: entry.sitrep_summary || {},
      decision: entry.decision || 'unknown',
      reasoning: entry.reasoning || '',
      confidence: entry.confidence || null,
      agencyHealth: entry.agency_health || null,
      scoredRecommendation: entry.scored_recommendation || null,
      recommendedOrders: entry.recommended_orders || {},
      crossDeptOrders: entry.cross_dept_orders || null,
      qualityAudit: entry.quality_audit || {},
      dispatchSuccess: entry.dispatch_success || false,
    }
  });
  return result;
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
