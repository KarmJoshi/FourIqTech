import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';

// ═══════════════════════════════════════════════════════════════════════
// 🏢 FOURIQTECH AI SEO ENGINE — Enterprise Grade v3.0
// ═══════════════════════════════════════════════════════════════════════
// Autonomous SEO content engine with:
//   🔑 Multi-API Key Rotation       🧠 Dynamic Model Escalation
//   🔬 SEO-Intelligent Research      📊 Topical Authority Clustering
//   🎯 Lead Intent Scoring Gate      🔍 SERP Structure Analysis
//   🧬 Semantic Keyword Clustering   💰 Conversion Block Injection
//   🔗 Intelligent Internal Linking  🏛️ Topic Authority Expansion
//   🔬 Technical Depth Detection     👔 Enterprise Audience Filter
//   ✍️ Technical Content w/ Code     ✅ Strict QA (80+ to publish)
//   📋 Technical SEO Automation      🚫 Max 2 articles/day
// ═══════════════════════════════════════════════════════════════════════

const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '.github/knowledge_base');
const PUBLISH_LOG_PATH = path.join(process.cwd(), '.github/publish_log.json');
const CONTENT_PIPELINE_PATH = path.join(process.cwd(), '.github/content_pipeline.json');
const RESEARCH_TEMP_PATH = path.join(process.cwd(), 'seo_research_temp.md');

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
// 🔬 RESEARCHER — SEO Research + SERP Analysis + Semantic Clustering
// ═══════════════════════════════════════════════════════════════════════
async function researcherAgent(config, existingSlugs, knowledgeCtx) {
  const models = getModels('research');
  console.log(`\n🔬 RESEARCHER: Deep keyword + SERP + semantic analysis...`);

  return await healedCall('Researcher', async (prevErr) => {
    const fix = prevErr ? `\nFIX PREVIOUS ERROR: "${prevErr.message}". Ensure valid JSON.` : '';

    const raw = await smartCall(models, `You are an expert SEO keyword researcher for FouriqTech, a web design & development agency targeting global startups and enterprises ($25k+ budgets).

COMPANY CONTEXT: ${knowledgeCtx}
EXISTING BLOG SLUGS (DO NOT DUPLICATE): ${JSON.stringify(existingSlugs)}
CURRENT KEYWORDS: ${JSON.stringify(config._flatKeywords || [])}

YOUR MISSION: Find the single best SEO opportunity for a new blog post.

═══ KEYWORD SELECTION CRITERIA (STRICT) ═══
- MUST be a long-tail keyword (4+ words)
- MUST have low or medium competition
- MUST have clear search intent (informational, commercial, or transactional)
- MUST be specific and actionable, NOT broad
- PRIORITIZE keywords with problem-solving or buyer/commercial intent over pure learning intent

GOOD keyword examples:
- "enterprise react performance optimization service"
- "nextjs api routes best practices for scale"
- "react dashboard slow performance debugging"
- "website speed optimization audit enterprise"

BAD keyword examples (NEVER use these):
- "web development" (too broad)
- "what is react" (beginner / low lead value)
- "javascript tutorial" (too generic)
- "web design India" (already covered)

═══ SERP STRUCTURE ANALYSIS ═══
For the target keyword, analyze what the top 10 ranking articles would look like and extract:
- Average word count
- Common H2 headings used
- Common H3 headings
- Whether code examples are present
- Whether FAQs are present
- Whether tables or checklists are used
- Content gaps NOT covered by competitors

═══ SEMANTIC KEYWORD CLUSTER ═══
Generate 15-30 related semantic keywords organized into categories:
- Supporting long-tail keywords
- Problem-based keywords (what problems the reader has)
- Technology-specific keywords
- Architecture-specific keywords

${fix}

RETURN VALID JSON:
{
  "primary_keyword": "specific long-tail keyword here",
  "secondary_keywords": ["kw1", "kw2", "kw3", "kw4"],
  "keyword_difficulty": "low/medium",
  "search_intent": "informational/commercial/transactional",
  "content_angle": "What makes our article unique",
  "competitor_gap_analysis": "What competitors are NOT covering",
  "estimated_volume": "high/medium/low",
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
    console.log(`   🔎 SERP: avg ${result.serp_analysis?.avg_word_count || '?'} words, ${result.serp_analysis?.content_gaps?.length || 0} gaps found`);
    console.log(`   🧬 Semantic cluster: ${Object.values(result.semantic_cluster || {}).flat().length} keywords`);
    return result;
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

═══ TONE REQUIREMENTS ═══
- 65% educational (teach something valuable to senior engineers)
- 20% technical insight (show expertise with specifics, benchmarks, metrics)
- 15% promotional (mention FouriqTech naturally through conversion blocks)

═══ GENERAL WRITING RULES ═══
1. MINIMUM 2000 words. Non-negotiable. Expand with technical specifics.
2. Use primary keyword naturally 5-8 times. Use each secondary keyword 2-3 times.
3. Integrate at least 8 semantic keywords from the cluster naturally.
4. Internal links: <a href="/blog/SLUG">descriptive text</a> for every slug in the list.
5. ALSO link to: <a href="/">FouriqTech</a> and <a href="/#contact">our services</a>.
6. External links: <a href="URL" target="_blank" rel="noopener">text</a> to 1-2 authority sources.
7. Code examples: Use <pre><code class="language-javascript">...</code></pre> format.
8. FAQ: Each question as <h3>, answer as <p>.
9. Semantic HTML only. NO markdown. NO code fences.
10. Vary sentence length. Use contractions. Be conversational but authoritative.
11. NEVER use: "landscape", "leverage", "harness", "cutting-edge", "game-changer", "seamless", "robust", "holistic", "in today's digital age".

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

ARTICLE METRICS (PRE-COMPUTED):
- Word Count: ${wordCount} (Target: 2000+)
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

SCORING RULES:
- Each of the 12 criteria is scored 1-10 points, for a total of 120 raw points.
- Normalize: overallScore = round((sum / 120) * 100)
- Article PASSES if overallScore >= 80
- Be FAIR: if the article genuinely covers the topic well, approve it.

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
    "semantic_coverage": 0
  },
  "overallScore": 0,
  "approved": false,
  "issues": ["issue1", "issue2"],
  "feedback": "Detailed actionable feedback if rejected",
  "summary": "One-line quality summary"
}`, 'QA Inspector');

    const result = JSON.parse(raw);
    console.log(`   📊 Score: ${result.overallScore}/100 ${result.approved ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.issues?.length > 0) console.log(`   🔍 Issues: ${result.issues.slice(0, 3).join('; ')}`);
    console.log(`   💬 ${result.summary}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 👔 MANAGER — CEO & Orchestrator (V3.0)
// ═══════════════════════════════════════════════════════════════════════
async function managerAgent() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  👔 FOURIQTECH AI SEO ENGINE v3.0 — Enterprise Grade    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys: ${API_KEYS.length} | 🧠 Models: 3.1-flash-lite → 2.5-flash → 3.0-flash`);

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

  console.log(`📰 Existing posts: ${existingSlugs.length} | 🔑 Keywords: ${flatKw.length}\n`);

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
      
      const crypto = require('crypto');
      const routeSlug = research.primary_keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const componentName = routeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      
      queue.tasks.push({
        id: crypto.randomUUID(),
        type: 'landing_page',
        status: 'pending',
        created_at: new Date().toISOString(),
        keyword: research.primary_keyword,
        secondary_keywords: research.secondary_keywords,
        route: `/services/\${routeSlug}`,
        page_title: `\${componentName} Services`,
        target_file: `src/pages/services/\${componentName}.tsx`,
        seo: {
          meta_title: `\${research.primary_keyword} | FouriqTech`,
          meta_description: `Premium \${research.primary_keyword} services by FouriqTech.`
        },
        design_brief: { "note": "Use the /dev-tasks workflow to complete the brief and build the page." }
      });
      
      queue.last_updated = new Date().toISOString();
      fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
      console.log('   ✅ Task queued in .github/dev-tasks/queue.json');
      
    } catch (e) {
      console.error(`   ❌ Failed to queue task: \${e.message}`);
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

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
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
    console.log(`║  🎯 Lead Score: ${leadScore.lead_intent_score}/10 | Biz Rel: ${leadScore.business_relevance}/10`);
    console.log(`║  🧬 Semantic: ${draft.semanticHits} KWs integrated`);
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

    const content = `# SEO Automation Research Log — V3.0

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
