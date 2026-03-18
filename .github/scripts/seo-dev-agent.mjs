import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════
// 🏗️ FOURIQTECH SEO DEV AGENT — Landing Page Task Generator v1.0
// ═══════════════════════════════════════════════════════════════════════
// Autonomous agent that researches commercial keywords, designs landing
// page architecture, and writes tasks to queue.json for Antigravity
// (or a human engineer) to execute safely.
//
//   🔍 Market Scanner     — Finds high buyer-intent keywords
//   🏛️ Page Architect     — Designs component structure + content brief
//   📋 Task Writer        — Writes structured task to queue.json
//
// This script does NOT write any React code. It only writes task specs.
// ═══════════════════════════════════════════════════════════════════════

const CONFIG_PATH       = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH    = path.join(process.cwd(), 'src/data/blogPosts.ts');
const APP_TSX_PATH      = path.join(process.cwd(), 'src/App.tsx');
const KNOWLEDGE_DIR     = path.join(process.cwd(), '.github/knowledge_base');
const QUEUE_PATH        = path.join(process.cwd(), '.github/dev-tasks/queue.json');

// ── AI Models — Gemini 2.5 Flash primary ──
function getModels(taskType) {
  const tasks = {
    'scanning':    ['gemini-2.5-flash', 'gemini-1.5-flash'],
    'architecting': ['gemini-2.5-flash', 'gemini-1.5-flash'],
  };
  return tasks[taskType] || ['gemini-2.5-flash'];
}

// ── Multi-API Key Rotation ──
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .replace(/["']/g, '')
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
          model, 
          contents: contents, 
          config: { responseMimeType: "application/json" }
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
          console.log(`   ❌ Model ${model} unavailable (${err.status || 'Overloaded'}). Falling back...`);
          break;
        }
        throw err;
      }
    }
  }
  throw new Error('All models and API keys exhausted.');
}

async function healedCall(agent, fn, retries = 2) {
  let lastErr = null;
  for (let i = 1; i <= retries; i++) {
    try { return await fn(lastErr); }
    catch (e) {
      console.error(`   ⚠️ [${agent}] Attempt ${i}: ${e.message?.substring(0, 120)}`);
      lastErr = e;
      if (i < retries) { console.log(`   🩹 Cooling down 10s...`); await sleep(10000); }
    }
  }
  throw lastErr;
}

// ── Queue Management ──
function loadQueue() {
  try { return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8')); }
  catch { return { tasks: [], completed: [], last_updated: null }; }
}

function saveQueue(queue) {
  queue.last_updated = new Date().toISOString();
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

// ── Knowledge Base Loader ──
function loadKnowledge() {
  let ctx = "";
  if (fs.existsSync(KNOWLEDGE_DIR)) {
    const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    for (const f of files) {
      ctx += `\n--- ${f} ---\n${fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf8')}\n`;
    }
  }
  return ctx;
}

// ── Extract existing routes from App.tsx ──
function getExistingRoutes() {
  try {
    const appContent = fs.readFileSync(APP_TSX_PATH, 'utf8');
    const routes = [...appContent.matchAll(/path="([^"]+)"/g)].map(m => m[1]);
    return routes;
  } catch { return ['/','*']; }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔍 MARKET SCANNER — Find high buyer-intent keywords for landing pages
// ═══════════════════════════════════════════════════════════════════════
async function marketScannerAgent(config, existingRoutes, existingSlugs, knowledgeCtx) {
  const models = getModels('scanning');
  console.log(`\n🔍 MARKET SCANNER: Finding commercial-intent keywords for landing pages...`);

  return await healedCall('Market Scanner', async (prevErr) => {
    const fix = prevErr ? `\nFIX PREVIOUS ERROR: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(models, `You are a commercial SEO strategist for FouriqTech, a premium global web design & development agency targeting enterprises and startups with $25k+ budgets.

COMPANY CONTEXT:
${knowledgeCtx}

YOUR GOAL: Find the SINGLE BEST keyword that needs a dedicated LANDING PAGE (NOT a blog post).

═══ KEYWORD CRITERIA (STRICT) ═══

A landing page keyword MUST have:
- BUYER / COMMERCIAL INTENT (someone looking to HIRE or BUY a service)
- High business relevance to FouriqTech's service offerings
- Be specific enough to warrant a dedicated service page

GOOD landing page keywords:
- "enterprise react performance optimization services"
- "custom nextjs development company"
- "high performance web application development"
- "react dashboard development agency"
- "website redesign services for enterprise"
- "ecommerce website development company"

BAD keywords (these should be BLOG posts, NOT landing pages):
- "how to optimize react performance" (informational — blog)
- "what is nextjs" (educational — blog)
- "react vs vue comparison" (informational — blog)

═══ EXISTING ROUTES (DO NOT DUPLICATE) ═══
${JSON.stringify(existingRoutes)}

═══ EXISTING BLOG SLUGS (already covered as blog posts) ═══
${JSON.stringify(existingSlugs.slice(0, 20))}

═══ EXISTING KEYWORDS TARGETED ═══
${JSON.stringify(config._flatKeywords?.slice(0, 30) || [])}

${fix}

Think carefully about what a potential enterprise client would search for when looking to hire a web agency. The keyword should convert to a lead.

RETURN VALID JSON:
{
  "primary_keyword": "buyer intent keyword here",
  "secondary_keywords": ["kw1", "kw2", "kw3", "kw4"],
  "search_intent": "commercial/transactional",
  "target_persona": "Who searches this (e.g., CTO, VP Engineering, Startup Founder)",
  "service_alignment": "Which FouriqTech service this maps to",
  "proposed_route": "/services/url-friendly-slug",
  "page_title": "SEO-optimized H1 title for the landing page",
  "lead_score": 8,
  "business_relevance": 9,
  "reasoning": "Why this keyword deserves a dedicated landing page"
}`, 'Market Scanner');

    const result = JSON.parse(raw);

    // Validate the route doesn't already exist
    if (existingRoutes.includes(result.proposed_route)) {
      throw new Error(`Route ${result.proposed_route} already exists. Try again.`);
    }

    console.log(`   🎯 Keyword: "${result.primary_keyword}"`);
    console.log(`   🛣️  Route: ${result.proposed_route}`);
    console.log(`   👤 Persona: ${result.target_persona}`);
    console.log(`   💰 Lead Score: ${result.lead_score}/10 | Biz Rel: ${result.business_relevance}/10`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 🏛️ PAGE ARCHITECT — Design the component structure & content brief
// ═══════════════════════════════════════════════════════════════════════
async function pageArchitectAgent(scanResult, knowledgeCtx, designSystemCtx) {
  const models = getModels('architecting');
  console.log(`\n🏛️ PAGE ARCHITECT: Designing landing page structure...`);

  return await healedCall('Page Architect', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(models, `You are a senior frontend architect and conversion rate optimization expert for FouriqTech.

You are designing a high-converting LANDING PAGE for a premium web design agency.

═══ TARGET KEYWORD ═══
Primary: "${scanResult.primary_keyword}"
Secondary: ${JSON.stringify(scanResult.secondary_keywords)}
Target Persona: ${scanResult.target_persona}
Service Alignment: ${scanResult.service_alignment}

═══ COMPANY CONTEXT ═══
${knowledgeCtx}

═══ DESIGN SYSTEM (MUST FOLLOW) ═══
${designSystemCtx}

═══ PAGE ARCHITECTURE RULES ═══

The page MUST follow this exact section structure for maximum conversion:

1. HERO SECTION
   - Bold headline with primary keyword (use text-gradient for key phrase)
   - Supporting subtext (1-2 sentences, address the persona's pain point)
   - Primary CTA button ("Get a Free Consultation" or similar)
   - Trust signal (e.g., "Trusted by 50+ enterprises globally")

2. PROBLEM SECTION
   - 3-4 pain points the target persona faces
   - Each pain point as a card with an icon, title, and short description
   - Use glass-card styling

3. SOLUTION SECTION
   - How FouriqTech solves each problem
   - 3-4 solution cards with icons
   - Use the card pattern from the design system

4. PROCESS SECTION
   - 4-step numbered process (Discovery → Design → Build → Launch)
   - Horizontal or vertical timeline layout

5. TECH STACK SECTION
   - Grid of technologies used (React, Next.js, TypeScript, GSAP, etc.)
   - Badge/pill styling

6. SOCIAL PROOF SECTION
   - Testimonial-style blocks or metric cards
   - Use stats like "200+ Projects Delivered", "99.9% Uptime", "$25k+ Avg Project"

7. FAQ SECTION
   - 4-5 questions specific to the service
   - Accordion or details/summary pattern

8. FINAL CTA SECTION
   - Strong closing headline
   - CTA button linking to /#contact
   - Brief urgency line

═══ CONTENT BRIEF ═══
For each section, write the ACTUAL content (headlines, descriptions, bullet points).
Do NOT write placeholders. Write real, polished marketing copy.
Use the primary keyword naturally 3-5 times across the page.
Use each secondary keyword at least once.

${fix}

RETURN VALID JSON:
{
  "page_title": "${scanResult.page_title}",
  "route": "${scanResult.proposed_route}",
  "target_file": "src/pages/services/${scanResult.proposed_route.split('/').pop().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}.tsx",
  "seo": {
    "meta_title": "Max 60 chars SEO title with keyword",
    "meta_description": "Max 155 chars compelling meta description"
  },
  "sections": [
    {
      "type": "hero",
      "headline": "Bold H1 headline",
      "highlight_text": "text-gradient portion of headline",
      "subtext": "1-2 supporting sentences",
      "cta_text": "CTA button text",
      "cta_link": "/#contact",
      "trust_signal": "Trust badge text"
    },
    {
      "type": "problems",
      "section_title": "Section title",
      "items": [
        { "icon": "lucide-icon-name", "title": "Pain point", "description": "Explanation" }
      ]
    },
    {
      "type": "solutions",
      "section_title": "Section title",
      "items": [
        { "icon": "lucide-icon-name", "title": "Solution", "description": "Explanation" }
      ]
    },
    {
      "type": "process",
      "section_title": "Section title",
      "steps": [
        { "step": 1, "title": "Step name", "description": "Step detail" }
      ]
    },
    {
      "type": "tech_stack",
      "section_title": "Section title",
      "technologies": ["React", "Next.js", "TypeScript"]
    },
    {
      "type": "social_proof",
      "section_title": "Section title",
      "metrics": [
        { "value": "200+", "label": "Projects Delivered" }
      ]
    },
    {
      "type": "faq",
      "section_title": "Frequently Asked Questions",
      "items": [
        { "question": "FAQ question", "answer": "FAQ answer" }
      ]
    },
    {
      "type": "final_cta",
      "headline": "Closing headline",
      "subtext": "Urgency or value prop",
      "cta_text": "CTA text",
      "cta_link": "/#contact"
    }
  ]
}`, 'Page Architect');

    const result = JSON.parse(raw);
    console.log(`   📐 Page: "${result.page_title}"`);
    console.log(`   📄 Target: ${result.target_file}`);
    console.log(`   🔧 Sections: ${result.sections?.length}`);
    console.log(`   🏷️  SEO: "${result.seo?.meta_title}"`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 👔 MANAGER — Orchestrator
// ═══════════════════════════════════════════════════════════════════════
async function managerAgent() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🏗️ FOURIQTECH SEO DEV AGENT v1.0                       ║');
  console.log('║  Landing Page Task Generator                            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys: ${API_KEYS.length}`);

  if (API_KEYS.length === 0) {
    console.error('❌ No API keys. Set GEMINI_API_KEYS. Exiting.');
    process.exit(1);
  }

  // ── Load queue and check pending task limit ──
  const queue = loadQueue();
  const pendingCount = queue.tasks.filter(t => t.status === 'pending').length;

  if (pendingCount >= 5) {
    console.log(`🚫 Already ${pendingCount} pending tasks in queue. Execute them first via Antigravity.`);
    console.log('   Run /dev-tasks in Antigravity to process pending tasks.');
    process.exit(0);
  }
  console.log(`📋 Queue: ${pendingCount} pending | ${queue.completed.length} completed`);

  // ── Load resources ──
  const knowledgeCtx = loadKnowledge();
  const existingRoutes = getExistingRoutes();

  let designSystemCtx = '';
  const dsPath = path.join(KNOWLEDGE_DIR, 'design_system.md');
  if (fs.existsSync(dsPath)) {
    designSystemCtx = fs.readFileSync(dsPath, 'utf8');
  }

  const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  const existingSlugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

  const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8');
  let config = yaml.load(configRaw);
  let flatKw = [];
  if (config.keywords && typeof config.keywords === 'object') {
    for (const tier of Object.values(config.keywords)) {
      if (Array.isArray(tier)) flatKw.push(...tier);
    }
  }
  config._flatKeywords = flatKw;

  // Also check existing queue task routes
  const queuedRoutes = queue.tasks.map(t => t.route).concat(queue.completed.map(t => t.route));
  const allRoutes = [...existingRoutes, ...queuedRoutes];

  console.log(`🛣️  Existing routes: ${existingRoutes.length} | Queued: ${queuedRoutes.length}`);
  console.log(`📰 Existing blogs: ${existingSlugs.length} | 🔑 Keywords: ${flatKw.length}\n`);

  // ══════════════════════════════════════
  // Stage 1: Market Scanner
  // ══════════════════════════════════════
  let scanResult;
  try {
    scanResult = await marketScannerAgent(config, allRoutes, existingSlugs, knowledgeCtx);
  } catch (e) {
    console.error(`❌ Market Scanner failed: ${e.message}`);
    process.exit(1);
  }

  // Validate lead score gate
  if (scanResult.lead_score < 7 || scanResult.business_relevance < 8) {
    console.log(`\n🚫 Keyword "${scanResult.primary_keyword}" didn't pass the gate.`);
    console.log(`   Lead Score: ${scanResult.lead_score}/10 (need ≥7)`);
    console.log(`   Business Relevance: ${scanResult.business_relevance}/10 (need ≥8)`);
    console.log('   Skipping. Will find a better keyword next cycle.');
    process.exit(0);
  }

  // ══════════════════════════════════════
  // Stage 2: Page Architect
  // ══════════════════════════════════════
  let pageDesign;
  try {
    pageDesign = await pageArchitectAgent(scanResult, knowledgeCtx, designSystemCtx);
  } catch (e) {
    console.error(`❌ Page Architect failed: ${e.message}`);
    process.exit(1);
  }

  // ══════════════════════════════════════
  // Stage 3: Write Task to Queue
  // ══════════════════════════════════════
  const taskId = crypto.randomUUID();

  const task = {
    id: taskId,
    type: 'landing_page',
    status: 'pending',
    created_at: new Date().toISOString(),
    completed_at: null,
    keyword: scanResult.primary_keyword,
    secondary_keywords: scanResult.secondary_keywords,
    route: pageDesign.route,
    page_title: pageDesign.page_title,
    target_file: pageDesign.target_file,
    target_persona: scanResult.target_persona,
    service_alignment: scanResult.service_alignment,
    seo: pageDesign.seo,
    sections: pageDesign.sections,
    lead_score: scanResult.lead_score,
    business_relevance: scanResult.business_relevance,
    reasoning: scanResult.reasoning
  };

  queue.tasks.push(task);
  saveQueue(queue);

  // ── Save keyword to config ──
  if (!config.keywords.auto_discovered) config.keywords.auto_discovered = [];
  const newKws = [scanResult.primary_keyword, ...scanResult.secondary_keywords];
  config.keywords.auto_discovered = [...new Set([...config.keywords.auto_discovered, ...newKws])];
  const { _flatKeywords, ...saveConfig } = config;
  fs.writeFileSync(CONFIG_PATH, yaml.dump(saveConfig));

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📋 TASK CREATED — Ready for Antigravity                 ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🆔 Task ID: ${taskId.substring(0, 8)}...`);
  console.log(`║  🎯 Keyword: "${scanResult.primary_keyword}"`);
  console.log(`║  🛣️  Route: ${pageDesign.route}`);
  console.log(`║  📄 File: ${pageDesign.target_file}`);
  console.log(`║  🔧 Sections: ${pageDesign.sections?.length}`);
  console.log(`║  💰 Lead Score: ${scanResult.lead_score}/10`);
  console.log(`║  📋 Pending tasks: ${queue.tasks.filter(t => t.status === 'pending').length}`);
  console.log('║                                                          ║');
  console.log('║  ➡️  Run /dev-tasks in Antigravity to build this page     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  console.log('\n👔 DEV AGENT: Signing off. ✅');
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 BOOT
// ═══════════════════════════════════════════════════════════════════════
managerAgent().catch(err => {
  console.error('💥 FATAL:', err.message?.substring(0, 300));
  process.exit(1);
});
