import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';

// ═══════════════════════════════════════════════════════════════════════
// 🏢 FOURIQTECH AI SEO ENGINE — Professional Grade v2.0
// ═══════════════════════════════════════════════════════════════════════
// Autonomous SEO content engine with:
//   🔑 Multi-API Key Rotation       🧠 Dynamic Model Escalation
//   🔬 SEO-Intelligent Research      📊 Topical Authority Clustering
//   ✍️ Technical Content w/ Code     ✅ Strict QA (80+ to publish)
//   🔗 Internal Linking System       📋 Technical SEO Automation
//   👔 Manager w/ Publishing Rules   🚫 Max 2 articles/day
// ═══════════════════════════════════════════════════════════════════════

const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '.github/knowledge_base');
const PUBLISH_LOG_PATH = path.join(process.cwd(), '.github/publish_log.json');

// ── Model Ladder ──
const MODEL_LADDER = [
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
];

const TASK_MODELS = {
  research:  { start: 0 },
  strategy:  { start: 0 },
  writing:   { start: 0 },
  rewrite:   { start: 1 },
  qa:        { start: 0 },
};

function getModel(taskType, escalation = 0) {
  const base = TASK_MODELS[taskType]?.start || 0;
  return MODEL_LADDER[Math.min(base + escalation, MODEL_LADDER.length - 1)];
}

// ── Multi-API Key Rotation ──
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

let currentKeyIdx = 0;
let aiClient = API_KEYS.length > 0 ? new GoogleGenAI({ apiKey: API_KEYS[0] }) : null;

function rotateKey() {
  currentKeyIdx = (currentKeyIdx + 1) % API_KEYS.length;
  aiClient = new GoogleGenAI({ apiKey: API_KEYS[currentKeyIdx] });
  console.log(`   🔑 Rotated → Key #${currentKeyIdx + 1}/${API_KEYS.length}`);
}

async function smartCall(model, contents) {
  let tries = 0;
  while (tries < API_KEYS.length) {
    try {
      const resp = await aiClient.models.generateContent({
        model, contents, config: { responseMimeType: "application/json" }
      });
      return resp.candidates[0].content.parts[0].text;
    } catch (err) {
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        tries++;
        if (tries < API_KEYS.length) { rotateKey(); await sleep(2000); continue; }
      }
      throw err;
    }
  }
  throw new Error('All API keys exhausted.');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function healedCall(agent, fn, retries = 2) {
  let lastErr = null;
  for (let i = 1; i <= retries; i++) {
    try { return await fn(lastErr); }
    catch (e) {
      console.error(`   ⚠️ [${agent}] Attempt ${i}: ${e.message?.substring(0, 120)}`);
      lastErr = e;
      if (i < retries) { console.log(`   🩹 [${agent}] Retrying...`); await sleep(3000); }
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

// ═══════════════════════════════════════════════════════════════════════
// 🔬 RESEARCHER — SEO-Intelligent Keyword Discovery
// ═══════════════════════════════════════════════════════════════════════
async function researcherAgent(config, existingSlugs, knowledgeCtx) {
  const model = getModel('research');
  console.log(`\n🔬 RESEARCHER [${model}]: Deep keyword analysis...`);

  return await healedCall('Researcher', async (prevErr) => {
    const fix = prevErr ? `\nFIX PREVIOUS ERROR: "${prevErr.message}". Ensure valid JSON.` : '';

    const raw = await smartCall(model, `You are an expert SEO keyword researcher for FouriqTech, a web design & development agency targeting global startups and enterprises ($25k+ budgets).

COMPANY CONTEXT: ${knowledgeCtx}
EXISTING BLOG SLUGS (DO NOT DUPLICATE): ${JSON.stringify(existingSlugs)}
CURRENT KEYWORDS: ${JSON.stringify(config._flatKeywords || [])}

YOUR MISSION: Find the single best SEO opportunity for a new blog post.

KEYWORD SELECTION CRITERIA (STRICT):
- MUST be a long-tail keyword (4+ words)
- MUST have low or medium competition
- MUST have clear search intent (informational, commercial, or transactional)
- MUST be specific and actionable, NOT broad

GOOD keyword examples:
- "gsap animation performance optimization"
- "nextjs api routes best practices"
- "react custom hooks performance guide"
- "website speed optimization checklist 2026"

BAD keyword examples (NEVER use these):
- "web development" (too broad)
- "frontend development" (too broad)
- "javascript tutorial" (too generic)
- "web design India" (already covered)

ALSO PROVIDE:
- 4 secondary keywords related to the primary
- The user's search intent (informational / commercial / transactional)
- A unique content angle competitors are missing
- A competitor gap analysis

${fix}

RETURN VALID JSON:
{
  "primary_keyword": "specific long-tail keyword here",
  "secondary_keywords": ["kw1", "kw2", "kw3", "kw4"],
  "keyword_difficulty": "low/medium",
  "search_intent": "informational/commercial/transactional",
  "content_angle": "What makes our article unique",
  "competitor_gap_analysis": "What competitors are NOT covering",
  "estimated_volume": "high/medium/low"
}`);

    const result = JSON.parse(raw);
    console.log(`   🎯 Primary: "${result.primary_keyword}" [${result.keyword_difficulty}]`);
    console.log(`   🔍 Intent: ${result.search_intent}`);
    console.log(`   💡 Angle: ${result.content_angle}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 STRATEGIST — Topical Authority & Clustering (SCANNABLE ENGINEERING FORMAT)
// ═══════════════════════════════════════════════════════════════════════
async function strategistAgent(research, config, existingSlugs, blogHistory) {
  const model = getModel('strategy');
  console.log(`\n📊 STRATEGIST [${model}]: Building topical authority plan...`);

  return await healedCall('Strategist', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    const raw = await smartCall(model, `You are a senior SEO content strategist for FouriqTech.

RESEARCHER'S FINDINGS:
- Primary Keyword: "${research.primary_keyword}"
- Secondary Keywords: ${JSON.stringify(research.secondary_keywords)}
- Search Intent: ${research.search_intent}
- Content Angle: ${research.content_angle}
- Competitor Gap: ${research.competitor_gap_analysis}

EXISTING SLUGS: ${JSON.stringify(existingSlugs)}
EXISTING KEYWORDS: ${JSON.stringify(config._flatKeywords || [])}

YOUR TASKS:

1. TOPICAL AUTHORITY CLUSTER: Identify which topic cluster this article belongs to and list 4-5 related future article ideas for the cluster.

2. ARTICLE OUTLINE (SCANNABLE ENGINEERING FORMAT): Create a detailed outline following this EXACT Stripe/Vercel engineering blog structure:
   - H1: Title (SEO-optimized)
   - Introduction (hook + what reader will learn)
   - Quick Summary Section
   - H2: Problem Overview (why this matters)
   - H2: Technical Explanation (core concepts)
   - H2: Implementation Guide
   - Code Example Slot
   - H2: Optimization Techniques (with bullet list)
   - H2: Best Practices (Do/Don't list)
   - H2: FAQ (4-5 questions)
   - H2: Conclusion

   NOTE: Add "Key Insight" blocks to at least 2 sections in the outline.

3. INTERNAL LINKING: Select 3-5 existing slugs to link to. ALSO always link to services (/services) and homepage (/).

4. NO DUPLICATE KEYWORDS: Ensure primary_keyword is not already targeted.

${fix}

RETURN VALID JSON:
{
  "primary_keyword": "${research.primary_keyword}",
  "secondary_keywords": ${JSON.stringify(research.secondary_keywords)},
  "article_title": "SEO-optimized title with primary keyword",
  "cluster_topic": "Name of the topic cluster",
  "cluster_future_articles": ["future1", "future2", "future3", "future4"],
  "article_outline": [
    "Introduction: hook and overview (80-120 words)",
    "Quick Summary Section",
    "H2: Problem Overview section description",
    "H2: Technical explanation section",
    "H2: Implementation guide with steps",
    "Code Example Slot",
    "H2: Optimization techniques (with bullet list)",
    "H2: Best practices (Do/Don't list)",
    "H2: FAQ with 4-5 questions",
    "H2: Conclusion with CTA"
  ],
  "internal_link_targets": ["slug1", "slug2", "slug3"],
  "external_authority_links": ["https://example.com relevant-resource"],
  "target_persona": "Who reads this",
  "call_to_action": "CTA text"
}`);

    const result = JSON.parse(raw);
    console.log(`   📝 Title: "${result.article_title}"`);
    console.log(`   🏗️ Cluster: ${result.cluster_topic}`);
    console.log(`   📋 Outline: ${result.article_outline?.length} sections`);
    console.log(`   🔗 Links: ${result.internal_link_targets?.length} internal + ${result.external_authority_links?.length} external`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ✍️ WRITER — Technical Content Engine (Stripe/Vercel Engineering Style)
// ═══════════════════════════════════════════════════════════════════════
async function writerAgent(strategy, knowledgeCtx, blogHistory, escalation, qaFeedback = null) {
  const taskType = qaFeedback ? 'rewrite' : 'writing';
  const model = getModel(taskType, escalation);
  const mode = qaFeedback ? `(REWRITE #${escalation + 1})` : '';
  console.log(`\n✍️ WRITER [${model}] ${mode}: Producing expert content...`);

  return await healedCall('Writer', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON with HTML content.` : '';
    const rewriteBlock = qaFeedback
      ? `\n\n🔴 QA REJECTED YOUR DRAFT. FIX ALL OF THESE:\n${qaFeedback}\nRewrite the ENTIRE article from scratch addressing every issue.`
      : '';

    const raw = await smartCall(model, `You are a senior technical content writer for FouriqTech. Your goal is to write an article that rivals Stripe, Vercel, or Cloudflare engineering blogs in readability, technical authority, and scannability.

STRATEGY BRIEF:
- Primary Keyword: "${strategy.primary_keyword}"
- Secondary Keywords: ${JSON.stringify(strategy.secondary_keywords)}
- Title: "${strategy.article_title}"
- Outline: ${JSON.stringify(strategy.article_outline)}
- Internal Links: ${JSON.stringify(strategy.internal_link_targets)}
- External Links: ${JSON.stringify(strategy.external_authority_links)}
- CTA: "${strategy.call_to_action}"
- Persona: "${strategy.target_persona}"

--- COMPANY FACTS (USE ONLY THESE) ---
${knowledgeCtx}

--- TONE REFERENCE ---
${blogHistory.substring(0, 2000)}

${rewriteBlock}
${fix}

═══ STRICT ENGINEERING BLOG FORMATTING RULES ═══

1. MAX PARAGRAPH LENGTH: 50–80 words maximum. NEVER write a "wall of text". If a thought requires more words, break it into a new paragraph or a bullet list.
2. MANDATORY BULLET LISTS: Convert long technical explanations into scannable <ul><li> elements. EVERY major H2 section MUST contain at least one bulleted or numbered list.
3. KEY INSIGHT BLOCKS: Insert 2 to 4 highlight boxes using this EXACT HTML: 
   <blockquote><strong>Key Insight:</strong> [Your high-value insight here]</blockquote>
4. TECHNICAL CODE BLOCKS: Provide at least 1-2 practical code examples using <pre><code class="language-javascript">...</code></pre>.
5. VISUAL BREAKS: Do not allow long continuous text. Mix paragraphs, lists, code, and insights constantly to optimize for "scanning behavior".
6. QUICK SUMMARY: After the introduction, provide a "Quick Summary" section.
7. DO/DON'T LIST: In the "Best Practices" section, format it as a clear Do and Don't list.

═══ TONE REQUIREMENTS ═══
- 70% educational (teach the reader something valuable)
- 20% technical insight (show expertise with specifics)
- 10% promotional (mention FouriqTech naturally, not forced)

═══ GENERAL WRITING RULES ═══
1. MINIMUM 2000 words. Non-negotiable. Expand with technical specifics, not fluff.
2. Use primary keyword naturally 5-8 times. Use each secondary keyword 2-3 times.
3. Internal links: <a href="/blog/SLUG">descriptive text</a> for every slug in the list.
4. ALSO link to: <a href="/">FouriqTech</a> and <a href="/#contact">our services</a>.
5. External links: <a href="URL" target="_blank" rel="noopener">text</a> to 1-2 authority sources.
6. Code examples: Use <pre><code class="language-javascript">...</code></pre> format.
7. FAQ: Each question as <h3>, answer as <p>.
8. Semantic HTML only. NO markdown. NO code fences.
9. Vary sentence length. Use contractions. Be conversational.
10. NEVER use: "landscape", "leverage", "harness", "cutting-edge", "game-changer", "seamless", "robust", "holistic", "in today's digital age".

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
}`);

    const result = JSON.parse(raw);
    const wordCount = result.content?.split(/\s+/).length || 0;

    // Count keyword occurrences
    const kwCount = (result.content?.toLowerCase().match(new RegExp(strategy.primary_keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

    console.log(`   📄 "${result.title}" (${wordCount} words)`);
    console.log(`   🔑 Keyword "${strategy.primary_keyword}" used ${kwCount} times`);
    return { ...result, wordCount, keywordCount: kwCount };
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ✅ QA INSPECTOR — Strict Quality Gate (Score ≥ 80 to publish)
// ═══════════════════════════════════════════════════════════════════════
async function qaAgent(draft, strategy, knowledgeCtx) {
  const model = getModel('qa');
  console.log(`\n✅ QA INSPECTOR [${model}]: Running strict audit...`);

  return await healedCall('QA Inspector', async (prevErr) => {
    const fix = prevErr ? `\nFIX: "${prevErr.message}". Return valid JSON.` : '';

    // Pre-compute basic checks
    const content = draft.content || '';
    const lowerContent = content.toLowerCase();
    const primaryKw = strategy.primary_keyword.toLowerCase();
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
    
    // Redundancy check heuristic (simple count of common enterprise fluff phrases)
    const redundancyCount = (lowerContent.match(/enterprise performance|enterprise scalability|enterprise user experience|in today's digital age/gi) || []).length;

    const raw = await smartCall(model, `You are the QA Inspector for a top-tier Engineering Blog (like Stripe/Vercel). You are STRICT but FAIR.

ARTICLE METRICS (PRE-COMPUTED):
- Word Count: ${wordCount} (Target: 2000+)
- Keyword Density: ${kwDensity}% (Target: ~1%)
- Secondary Keywords: ${JSON.stringify(strategy.secondary_keywords)}
- Code Examples: ${codeBlockCount} (Target: 2+)
- Bullet/Numbered Lists: ${listCount}
- Key Insight Blocks: ${insightCount} (Target: 2-4)
- Has FAQ Section: ${hasFAQ}
- Internal Links: ${internalLinkCount}
- External Links: ${externalLinkCount}
- Redundant Buzzwords Found: ${redundancyCount}

ARTICLE CONTENT (first 10000 chars):
${content.substring(0, 10000)}

STRATEGY PLAN:
- Required Internal Link Slugs: ${JSON.stringify(strategy.internal_link_targets)}
- Required External Links: ${JSON.stringify(strategy.external_authority_links)}

${fix}

═══ QA CHECKLIST — SCORE EACH 1-10 ═══

1. PARAGRAPH_LENGTH: Are paragraphs consistently short (under 80 words)? Are there walls of text?
2. VISUAL_BREAKS: Are there enough bullet lists (${listCount}) and Key Insight blocks (${insightCount}) to make it scannable?
3. TECHNICAL_AUTHORITY: Are there at least 2 code examples (${codeBlockCount}) and actionable technical advice?
4. REDUNDANCY: Is the writing varied? Does it repeat phrases like "enterprise performance" constantly? (${redundancyCount} found)
5. KEYWORD_USAGE: Primary used naturally? (${kwCount} times, ${kwDensity}%). Secondary keywords included?
6. WORD_COUNT: Is it genuinely 2000+ words of substance? (${wordCount} words detected)
7. INTERNAL_LINKS: At least 3 internal links present? (${internalLinkCount} found)
8. EXTERNAL_LINKS: At least 1 authority external link? (${externalLinkCount} found)
9. HEADING_STRUCTURE: Proper H1 > H2 > H3 hierarchy? Quick summary and FAQ present?
10. OVERALL_TONE: Does it sound like a premium engineering blog (Stripe/Vercel) rather than cheap SEO content?

SCORING RULES:
- Each criterion is 1-10 points. Avoid giving 10 unless it is perfect.
- Overall score = sum of all points (max 100)
- Article PASSES if overallScore >= 80
- Be FAIR: if the article genuinely covers the topic well in a scannable format, approve it.

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
    "heading_structure": 0,
    "overall_tone": 0
  },
  "overallScore": 0,
  "approved": false,
  "issues": ["issue1", "issue2"],
  "feedback": "Detailed actionable feedback if rejected",
  "summary": "One-line quality summary"
}`);

    const result = JSON.parse(raw);
    console.log(`   📊 Score: ${result.overallScore}/100 ${result.approved ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.issues?.length > 0) console.log(`   🔍 Issues: ${result.issues.slice(0, 3).join('; ')}`);
    console.log(`   💬 ${result.summary}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 👔 MANAGER — CEO & Orchestrator
// ═══════════════════════════════════════════════════════════════════════
async function managerAgent() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  👔 FOURIQTECH AI SEO ENGINE v2.0 — Professional Grade  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys: ${API_KEYS.length} | 🧠 Models: ${MODEL_LADDER.join(' → ')}`);

  if (API_KEYS.length === 0) {
    console.error('❌ No API keys. Set GEMINI_API_KEYS. Exiting.');
    process.exit(1);
  }

  // ── Check daily publish limit ──
  const todayCount = getTodayPublishCount();
  if (todayCount >= 2) {
    console.log('🚫 MANAGER: Daily limit reached (2 articles). Skipping this run.');
    process.exit(0);
  }
  console.log(`📰 Published today: ${todayCount}/2`);

  // ── Load Resources ──
  let knowledgeCtx = "";
  if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    console.log(`📚 Knowledge docs: ${files.length}`);
    for (const f of files) {
      knowledgeCtx += `\n--- ${f} ---\n${fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, f), 'utf8')}\n`;
    }
  }

  const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  const existingSlugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
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

  console.log(`📰 Existing posts: ${existingSlugs.length} | 🔑 Keywords: ${flatKw.length}\n`);

  // ── Stage 1: Researcher ──
  let research;
  try { research = await researcherAgent(config, existingSlugs, knowledgeCtx); }
  catch (e) {
    console.error('❌ Researcher failed. Using fallback.');
    research = {
      primary_keyword: 'react performance optimization techniques',
      secondary_keywords: ['react rendering', 'react memo', 'useMemo performance', 'react profiler'],
      search_intent: 'informational', content_angle: 'practical guide', competitor_gap_analysis: 'N/A',
      keyword_difficulty: 'medium'
    };
  }

  // Save new keywords to config
  if (research.primary_keyword) {
    if (!config.keywords.auto_discovered) config.keywords.auto_discovered = [];
    const newKws = [research.primary_keyword, ...(research.secondary_keywords || [])];
    config.keywords.auto_discovered = [...new Set([...config.keywords.auto_discovered, ...newKws])];
    config._flatKeywords = [...new Set([...config._flatKeywords, ...newKws])];
    const { _flatKeywords, ...save } = config;
    fs.writeFileSync(CONFIG_PATH, yaml.dump(save));
    console.log('   💾 Keywords saved.\n');
  }

  // ── Stage 2: Strategist ──
  let strategy;
  try { strategy = await strategistAgent(research, config, existingSlugs, blogHistory); }
  catch (e) { console.error('❌ Strategist failed. Aborting.'); process.exit(1); }

  // ── Stage 3 & 4: Writer ↔ QA Loop with Escalation ──
  const MAX_ATTEMPTS = 4;
  let draft = null;
  let qaResult = null;
  let published = false;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Writer
    try {
      const feedback = (attempt > 0 && qaResult && !qaResult.approved) ? qaResult.feedback : null;
      draft = await writerAgent(strategy, knowledgeCtx, blogHistory, attempt, feedback);
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

    if (qaResult.approved && qaResult.overallScore >= 80) {
      published = true;
      break;
    }

    if (qaResult.overallScore >= 80 && !qaResult.approved) {
      qaResult.approved = true;
      published = true;
      break;
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      const next = getModel('rewrite', attempt + 1);
      console.log(`\n   ⬆️ ESCALATING → ${next} (attempt ${attempt + 2}/${MAX_ATTEMPTS})`);
    }
  }

  // ── Stage 5: Publish or Skip ──
  if (published && draft) {
    console.log('\n👔 PUBLISHING approved content...');

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

    const updated = blogDataFile.replace(
      'export const blogPosts: BlogPost[] = [',
      `export const blogPosts: BlogPost[] = [${newPost}`
    );
    fs.writeFileSync(BLOG_DATA_PATH, updated);
    incrementPublishCount();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📋 RUN REPORT — ✅ PUBLISHED                            ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  📝 "${draft.title}"`);
    console.log(`║  🎯 Keyword: "${strategy.primary_keyword}"`);
    console.log(`║  📊 QA Score: ${qaResult.overallScore}/100`);
    console.log(`║  📏 Words: ${draft.wordCount}`);
    console.log(`║  🏗️ Cluster: ${strategy.cluster_topic}`);
    console.log(`║  🔗 /blog/${draft.slug}`);
    console.log('╚═══════════════════════════════════════════════════════════╝');
  } else {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📋 RUN REPORT — 🚫 NOT PUBLISHED                       ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Score: ${qaResult?.overallScore || 0}/100 (need 80+)`);
    console.log('║  Quality standards not met after all escalations.        ║');
    console.log('║  Skipping. Will retry next cycle.                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
  }

  console.log('\n👔 MANAGER: Engine signing off. ✅');
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 BOOT
// ═══════════════════════════════════════════════════════════════════════
managerAgent().catch(err => {
  console.error('💥 FATAL:', err.message?.substring(0, 300));
  process.exit(1);
});
