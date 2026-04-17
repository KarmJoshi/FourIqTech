import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';
import crypto from 'crypto';
import { submitToStaging, logActivity, getModelsForRole } from './agency-core.mjs';

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

async function getModels(taskType) {
  const roleMap = { scanning: 'scanner', architecting: 'architect' };
  return await getModelsForRole(roleMap[taskType] || taskType);
}

// ── Multi-API Key Rotation ──
const PRO_KEY = process.env.GEMINI_PRO_API_KEY || '';
const OTHER_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .replace(/["']/g, '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

// Prioritize Pro Key (Billed) and deduplicate with others
const API_KEYS = [...new Set([PRO_KEY, ...OTHER_KEYS])].filter(k => k.length > 0);

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

async function smartCall(modelArray, contents, agentName = 'AI', requireJson = true) {
  const models = Array.isArray(modelArray) ? modelArray : [modelArray];

  for (const model of models) {
    let tries = 0;
    let backoffMs = 5000;

    console.log(`   🚀 [${agentName}] Trying model: ${model}...`);
    while (tries < API_KEYS.length * 2) {
      try {
        const config = {};
        if (requireJson) config.responseMimeType = "application/json";

        const resp = await aiClient.models.generateContent({
          model, 
          contents: contents, 
          config
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

// ═══════════════════════════════════════════════════════════════════════
// 🌐 ROUTER INJECTOR — Adds the page to App.tsx
// ═══════════════════════════════════════════════════════════════════════
function injectRouteIntoApp(routePath, componentPath) {
  const componentName = path.basename(componentPath, '.tsx');
  let appCode = fs.readFileSync(APP_TSX_PATH, 'utf8');

  if (appCode.includes(`path="${routePath}"`)) return;

  const importAnchor = 'import AgentManager';
  if (appCode.includes(importAnchor)) {
    const importStatement = `import ${componentName} from "./pages/services/${componentName}";\n`;
    appCode = appCode.replace(importAnchor, importStatement + importAnchor);
  }

  const routeAnchor = '{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}';
  if (appCode.includes(routeAnchor)) {
    const routeStatement = `\n              <Route path="${routePath}" element={<${componentName} />} />`;
    appCode = appCode.replace(routeAnchor, routeAnchor + routeStatement);
  }

  fs.writeFileSync(APP_TSX_PATH, appCode);
  console.log(`   🛣️ Injected route ${routePath} into App.tsx`);
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
// 📋 CEO EXECUTIVE ORDERS
// ═══════════════════════════════════════════════════════════════════════
function loadDirectorOrders() {
  const ordersPath = path.join(process.cwd(), '.github/director_orders.json');
  try {
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    return `\n\n👔 EXECUTIVE ORDERS FROM AGENCY DIRECTOR:\nDepartment: ${orders.department}\nReasoning: ${orders.reasoning}\nOrders: ${orders.cross_department_orders}\nAgency Health: ${orders.agency_health_score}/10\n\nYOU MUST STRICTLY FOLLOW THESE ORDERS WHEN CHOOSING THE ROUTE AND KEYWORD.`;
  } catch {
    return "";
  }
}

function hasFreshStructuralOrders() {
  const ordersPath = path.join(process.cwd(), '.github/director_orders.json');
  try {
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const orderDate = orders.timestamp.split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return orderDate === today && orders.department === 'structural';
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔍 MARKET SCANNER — Find high buyer-intent keywords for landing pages
// ═══════════════════════════════════════════════════════════════════════
async function marketScannerAgent(config, existingRoutes, existingSlugs, knowledgeCtx) {
  const models = await getModels('scanning');
  console.log(`\n🔍 MARKET SCANNER: Finding commercial-intent keywords for landing pages...`);
  const directorOrders = loadDirectorOrders();

  return await healedCall('Market Scanner', async (prevErr) => {
    const fix = prevErr ? `\nFIX PREVIOUS ERROR: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(models, `You are an Elite Growth Hacker and Revenue Strategist with 15 years of experience generating millions in inbound B2B pipeline. FouriqTech is your client — a premium global web design & development agency targeting enterprises and startups with $25k+ budgets.
${directorOrders}

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

    let cleanRaw = raw.trim();
    if (cleanRaw.includes('```')) {
      cleanRaw = cleanRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    console.log(`[DEBUG] Raw AI Output:\n${cleanRaw}\n`);
    const result = JSON.parse(cleanRaw);

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
  const models = await getModels('architecting');
  console.log(`\n🏛️ PAGE ARCHITECT: Designing landing page structure...`);

  // Pre-calculate target file name to assist the AI and ensure consistency
  const routeSlug = scanResult.proposed_route.split('/').pop() || 'service-page';
  const componentName = routeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const targetFile = `src/pages/services/${componentName}.tsx`;

  return await healedCall('Page Architect', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Ensure you return a complete, valid JSON object with all required fields.` : '';

    const raw = await smartCall(models, `You are an elite, World-Class Conversion Rate Optimization (CRO) Architect and UX Director who has designed 8-figure SaaS landing pages. You work for FouriqTech.

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
Do NOT write placeholders. Write real, polished, HEAVY, long-form marketing copy.
This is a premium enterprise service landing page, not a light summary. Each section should have dense, explanatory paragraphs.
Use the primary keyword naturally 3-5 times across the page.
Use each secondary keyword at least once.

IMPORTANT INTERLINKING: Do NOT use '#' or generic links for CTAs. You MUST link all CTAs to exactly '/#contact' so users can actually reach us.

${fix}

RETURN VALID JSON:
{
  "page_title": "${scanResult.page_title}",
  "route": "${scanResult.proposed_route}",
  "target_file": "${targetFile}",
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

    // Robust JSON parsing
    let cleanRaw = raw.trim();
    if (cleanRaw.includes('```')) {
      cleanRaw = cleanRaw.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
    }
    
    const result = JSON.parse(cleanRaw);
    
    // Ensure critical fields exist
    result.page_title = result.page_title || scanResult.page_title;
    result.route = result.route || scanResult.proposed_route;
    result.target_file = result.target_file || targetFile;
    result.sections = result.sections || [];

    console.log(`   📐 Page: "${result.page_title}"`);
    console.log(`   📄 Target: ${result.target_file}`);
    console.log(`   🔧 Sections: ${result.sections.length}`);
    console.log(`   🏷️  SEO: "${result.seo?.meta_title || 'N/A'}"`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 🏗️ PAGE BUILDER — Generates Production-Ready React Code
// ═══════════════════════════════════════════════════════════════════════
async function pageBuilderAgent(pageDesign, designSystemCtx) {
  const models = await getModelsForRole('builder');
  console.log(`\n🏗️ PAGE BUILDER: Assembling React Component...`);

  const componentName = path.basename(pageDesign.target_file, '.tsx');

  return await healedCall('Page Builder', async (prevErr) => {
    const fix = prevErr ? `\n⚠️ PREVIOUS ATTEMPT FAILED: "${prevErr.message}". YOU MUST ENSURE THE CODE IS COMPLETE AND EXPORTED.` : '';

    const raw = await smartCall(models, `You are a Senior Frontend Engineer at FouriqTech. Your job is to output a single, complete, production-ready React (.tsx) landing page component based on the Page Architect's Blueprint.

⚠️ MANDATORY: Name the main function exactly: "export default function ${componentName}() { ... }"

⚠️ CRITICAL RULES ⚠️
1. Output ONLY the raw TypeScript React code. NO markdown code blocks (\`\`\`tsx). NO explanations. Just code.
2. The component MUST use lucide-react icons, framer-motion, and the design system Tailwind classes (e.g., text-gradient, glass-card, liquid-blob).
3. Include all necessary imports at the top:
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';
// Import all used icons from 'lucide-react'.

4. Implement all sections exactly as specified in the Architect Blueprint. Write polished, hardcoded text.
5. ⚠️ CRITICAL: Ensure the page is dense and CONTENT-HEAVY. Do not output a skeletal prototype. Flesh it out with dense, rich paragraphs, ensuring every feature and solution has substantial descriptive text. It should feel like a multi-thousand-dollar service page.
6. ⚠️ ALL call-to-action buttons MUST link to \`/#contact\` using standard anchor \`<a href="/#contact">\` or Next.js-style routing patterns. Do NOT use dead '#' links.

═══ DESIGN SYSTEM ═══
${designSystemCtx}

═══ ARCHITECT BLUEPRINT ═══
${JSON.stringify(pageDesign, null, 2)}
${fix}`, 'Page Builder', false);

    let cleanedCode = raw.trim();
    if (cleanedCode.startsWith('\`\`\`tsx')) cleanedCode = cleanedCode.replace(/^\`\`\`tsx\n/, '');
    if (cleanedCode.startsWith('\`\`\`typescript')) cleanedCode = cleanedCode.replace(/^\`\`\`typescript\n/, '');
    if (cleanedCode.startsWith('\`\`\`')) cleanedCode = cleanedCode.replace(/^\`\`\`\n/, '');
    if (cleanedCode.endsWith('\`\`\`')) cleanedCode = cleanedCode.slice(0, -3).trim();

    // Auto-fix missing export default if the function itself exists
    if (!cleanedCode.includes('export default')) {
      if (cleanedCode.includes(`function ${componentName}`)) {
        cleanedCode = cleanedCode.replace(`function ${componentName}`, `export default function ${componentName}`);
      } else {
        // Fallback: append it if we can find a likely candidate or just wrap it
        throw new Error("Generated code is missing 'export default'. The model failed to provide the entry point.");
      }
    }

    return cleanedCode;
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

  // 👔 Absolute Manger Authority: Only run if commanded
  if (!hasFreshStructuralOrders() && !process.env.FORCE_PUBLISH) {
    console.log(`🛑 MANAGER OVERRIDE: No explicit orders from the Agency Director today to build a page. Standing down.`);
    process.exit(0);
  } else {
    console.log(`👔 DIRECTOR ORDERS DETECTED: Proceeding with landing page architecture...`);
  }

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

  const allRoutes = existingRoutes;

  console.log(`\n🛣️  Existing service routes: ${existingRoutes.length}`);
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
  // Stage 3: Page Builder (Autonomous Coding)
  // ══════════════════════════════════════
  let tsxCode;
  try {
    tsxCode = await pageBuilderAgent(pageDesign, designSystemCtx);
  } catch (e) {
    console.error(`❌ Page Builder failed: ${e.message}`);
    process.exit(1);
  }

  // ══════════════════════════════════════
  // Stage 4: Deploy (Save & Route) -> Redirected to Staging
  // ══════════════════════════════════════
  const targetFile = pageDesign.target_file || 'src/pages/services/GeneratedPage.tsx';
  const fileName = targetFile.split('/').pop();
  
  const payload = JSON.stringify({
    target_file: targetFile,
    route: pageDesign.route,
    code: tsxCode
  });

  if (process.env.DRY_RUN === 'true') {
    console.log(`\n🧪 DRY_RUN: Landing page generated but NOT submitted to Staging.`);
    console.log(`📄 PREVIEW ${targetFile}:\n${tsxCode.substring(0, 500)}...`);
  } else {
    console.log(`\n📦 SUBMITTING to Manager Staging Queue...`);
    await submitToStaging({
      type: 'landing_page',
      department: 'Structural Team',
      title: fileName,
      content: payload,
      metadata: { lead_score: scanResult.lead_score, keyword: scanResult.primary_keyword, route: pageDesign.route }
    });
    await logActivity('Structural Team', `🏗️ Submitted new landing page "${fileName}" to Staging Queue.`, "publish");

    console.log(`\n📦 STAGED: ${targetFile} successfully queued for Manager review.`);
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📋 STRUCTURAL TEAM REPORT — ⏳ STAGED                  ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🎯 Keyword: "${scanResult.primary_keyword}"`);
  console.log(`║  🛣️  Route: ${pageDesign.route}`);
  console.log(`║  📄 Component: ${targetFile}`);
  console.log(`║  💰 Lead Score: ${scanResult.lead_score}/10`);
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
