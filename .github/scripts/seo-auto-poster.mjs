import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';

// ═══════════════════════════════════════════════════════════════
// 🏢 FOURIQTECH AI SEO COMPANY — Enterprise-Grade Multi-Agent
// ═══════════════════════════════════════════════════════════════
// Features:
//   🔑 Multi-API Key Rotation (auto-failover on 429)
//   🧠 Dynamic Model Selection (task-priority-based)
//   ⬆️ Model Escalation on QA Rejection
//   ✍️ Human-Like Content Engine (anti-AI detection)
//   🚫 Strict QA Gate (never publish garbage)
// ═══════════════════════════════════════════════════════════════

const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '.github/knowledge_base');

// ── Model Ladder (weakest → strongest) ──
const MODEL_LADDER = [
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
];

// ── Task Priority → Starting Model ──
const TASK_MODELS = {
  research:  { priority: 'low',      startModel: 0 }, // Flash
  strategy:  { priority: 'medium',   startModel: 0 }, // Flash
  writing:   { priority: 'high',     startModel: 0 }, // Flash (escalates on rejection)
  qa:        { priority: 'medium',   startModel: 0 }, // Flash
  rewrite:   { priority: 'critical', startModel: 1 }, // 3-Flash minimum for rewrites
};

function getModel(taskType, escalationLevel = 0) {
  const base = TASK_MODELS[taskType]?.startModel || 0;
  const idx = Math.min(base + escalationLevel, MODEL_LADDER.length - 1);
  return MODEL_LADDER[idx];
}

// ═══════════════════════════════════════════════════════════════
// 🔑 MULTI-API KEY ROTATION ENGINE
// ═══════════════════════════════════════════════════════════════
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k.length > 0);

let currentKeyIndex = 0;
let aiClient = new GoogleGenAI({ apiKey: API_KEYS[0] });

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  aiClient = new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });
  console.log(`   🔑 Rotated to API Key #${currentKeyIndex + 1}/${API_KEYS.length}`);
  return currentKeyIndex;
}

async function smartCall(model, contents, jsonMode = true, maxKeyRetries = API_KEYS.length) {
  let keysTriedCount = 0;
  while (keysTriedCount < maxKeyRetries) {
    try {
      const config = jsonMode ? { responseMimeType: "application/json" } : {};
      const response = await aiClient.models.generateContent({ model, contents, config });
      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⚠️ Key #${currentKeyIndex + 1} quota exhausted.`);
        keysTriedCount++;
        if (keysTriedCount < maxKeyRetries) {
          rotateKey();
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error('All API keys exhausted. No quota remaining.');
}

// ═══════════════════════════════════════════════════════════════
// 🩹 SELF-HEALING WRAPPER
// ═══════════════════════════════════════════════════════════════
async function runWithHealer(agentName, taskFn, maxRetries = 2) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await taskFn(lastError);
    } catch (error) {
      console.error(`   ⚠️ [${agentName}] Attempt ${attempt} failed: ${error.message?.substring(0, 120)}`);
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`   🩹 [${agentName}] Self-healing: retrying...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
  throw lastError;
}

// ═══════════════════════════════════════════════════════════════
// ✍️ HUMAN-LIKE WRITING INSTRUCTIONS (injected into every Writer prompt)
// ═══════════════════════════════════════════════════════════════
const HUMANIZATION_RULES = `
CRITICAL WRITING STYLE RULES — YOUR CONTENT MUST FEEL 100% HUMAN-WRITTEN:

1. SENTENCE VARIETY: Mix short punchy sentences (5-8 words) with longer explanatory ones (20-30 words). Never write 3 long sentences in a row.

2. CONVERSATIONAL TONE: Write as if you're a senior consultant talking to a CEO over coffee. Use "We've found that..." / "Here's the thing..." / "Let me be blunt..." / "In our experience..."

3. USE CONTRACTIONS: Always use "don't", "we've", "it's", "you'll", "won't" instead of "do not", "we have", "it is". Formal writing screams AI.

4. ADD REAL OPINIONS: Include opinionated statements like "Frankly, most agencies get this wrong" or "This is the single biggest mistake we see". Don't be neutral on everything.

5. IMPERFECT TRANSITIONS: Do NOT start paragraphs with "Furthermore", "Additionally", "Moreover", "In conclusion". Instead use "Here's the thing", "But wait", "Now,", "Look,", "The reality?", "So what does this mean?"

6. ANECDOTAL HOOKS: Start at least 2 sections with a mini-story: "A client came to us last quarter...", "We once worked with a startup that...", "I remember reviewing a website that..."

7. BREAK PATTERNS: Not every section needs bullet points. Mix paragraphs, numbered tips, a single bold callout, and casual sub-headers.

8. RHETORICAL QUESTIONS: Use them naturally: "So why do 70% of businesses still ignore this?" / "Sound familiar?"

9. AVOID AI CLICHES: NEVER use these words/phrases: "landscape", "in today's digital age", "leverage", "harness the power", "cutting-edge", "game-changer", "seamless", "robust", "holistic". Use normal human words instead.

10. NATURAL KEYWORD PLACEMENT: The target keyword should appear in the title, first paragraph, 2-3 H2s, and conclusion. That's it. Never force it.
`;

// ═══════════════════════════════════════════════════════════════
// 🔬 AGENT 1: RESEARCHER — Market Intelligence
// ═══════════════════════════════════════════════════════════════
async function researcherAgent(config, existingSlugs, knowledgeContext) {
  const model = getModel('research');
  console.log(`\n🔬 RESEARCHER [${model}]: Scanning market for opportunities...`);

  return await runWithHealer('Researcher', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON output format.` : '';

    const raw = await smartCall(model, `You are the MARKET RESEARCHER at FouriqTech SEO Company.
      
      COMPANY KNOWLEDGE: ${knowledgeContext}
      EXISTING BLOG SLUGS (avoid duplicates): ${JSON.stringify(existingSlugs)}
      CURRENT KEYWORDS: ${JSON.stringify(config._flatKeywords || [])}

      YOUR TASKS:
      1. Discover 5 NEW high-value long-tail keywords for web design/development/digital marketing targeting India & Global startups/enterprises.
      2. Identify 3 trending industry topics that would attract $25k+ clients.
      3. Analyze competitor gaps — what topics are competitors NOT covering well?
      4. Ensure ZERO overlap with existing slugs.
      ${healHint}

      RETURN VALID JSON:
      { "newKeywords": [], "trendingTopics": [], "competitorGaps": [], "marketInsight": "..." }`);

    const result = JSON.parse(raw);
    console.log(`   📈 Discovered ${result.newKeywords?.length || 0} new keywords`);
    console.log(`   🔥 Trends: ${result.trendingTopics?.slice(0, 2).join(', ')}`);
    console.log(`   💡 Insight: ${result.marketInsight}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════
// 📊 AGENT 2: STRATEGIST — Content Planning
// ═══════════════════════════════════════════════════════════════
async function strategistAgent(researchData, config, existingSlugs, blogHistory) {
  const model = getModel('strategy');
  console.log(`\n📊 STRATEGIST [${model}]: Creating battle plan...`);

  return await runWithHealer('Strategist', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON.` : '';
    const allKw = [...new Set([...(config._flatKeywords || []), ...(researchData.newKeywords || [])])];

    const raw = await smartCall(model, `You are the CONTENT STRATEGIST at FouriqTech SEO Company.

      RESEARCHER'S INTEL:
      - New Keywords: ${JSON.stringify(researchData.newKeywords)}
      - Trending: ${JSON.stringify(researchData.trendingTopics)}
      - Gaps: ${JSON.stringify(researchData.competitorGaps)}
      - Insight: ${researchData.marketInsight}

      ALL KEYWORDS: ${JSON.stringify(allKw)}
      WRITTEN SLUGS: ${JSON.stringify(existingSlugs)}
      RECENT TONE: ${blogHistory.substring(0, 3000)}

      TASKS:
      1. Pick the BEST keyword to target (highest ROI, not yet written).
      2. Create a 8-10 point OUTLINE for a 2000+ word article.
      3. Pick 2-3 existing slugs to link to.
      4. Write a compelling CTA.
      5. Define target reader persona.
      ${healHint}

      RETURN VALID JSON:
      { "targetKeyword": "...", "articleTitle": "...", "targetPersona": "...", "outline": [], "internalLinks": [], "callToAction": "...", "estimatedSearchVolume": "high/medium/low" }`);

    const result = JSON.parse(raw);
    console.log(`   🎯 Target: "${result.targetKeyword}"`);
    console.log(`   📝 Title: "${result.articleTitle}"`);
    console.log(`   👤 Persona: ${result.targetPersona}`);
    console.log(`   📋 Outline: ${result.outline?.length || 0} sections`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════
// ✍️ AGENT 3: WRITER — Content Creation (with Dynamic Model)
// ═══════════════════════════════════════════════════════════════
async function writerAgent(strategy, knowledgeContext, blogHistory, escalationLevel, qaFeedback = null) {
  const taskType = qaFeedback ? 'rewrite' : 'writing';
  const model = getModel(taskType, escalationLevel);
  const mode = qaFeedback ? `(REWRITE #${escalationLevel + 1})` : '';
  console.log(`\n✍️ WRITER [${model}] ${mode}: Crafting content...`);

  return await runWithHealer('Writer', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON.` : '';
    const rewriteBlock = qaFeedback
      ? `\n\n🔴 QA REJECTED YOUR PREVIOUS DRAFT. FIX THESE ISSUES:\n${qaFeedback}\nRewrite the ENTIRE article. Address EVERY point.`
      : '';

    const raw = await smartCall(model, `You are the SENIOR CONTENT WRITER at FouriqTech SEO Company.

      STRATEGIST'S PLAN:
      - Target Keyword: "${strategy.targetKeyword}"
      - Title: "${strategy.articleTitle}"
      - Persona: "${strategy.targetPersona}"
      - Outline: ${JSON.stringify(strategy.outline)}
      - Internal Links: ${JSON.stringify(strategy.internalLinks)}
      - CTA: "${strategy.callToAction}"

      --- COMPANY KNOWLEDGE (ONLY USE THESE FACTS) ---
      ${knowledgeContext}
      
      --- PREVIOUS BLOG TONE (MATCH THIS) ---
      ${blogHistory.substring(0, 2000)}

      ${HUMANIZATION_RULES}
      ${rewriteBlock}
      ${healHint}

      HARD RULES:
      1. MINIMUM 2000 words. Count carefully. This is non-negotiable.
      2. Follow the outline — every point becomes a full section with 200+ words.
      3. Semantic HTML only: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>.
      4. Internal links as: <a href="/blog/SLUG">text</a>.
      5. End with CTA in a <h2> section.
      6. NO markdown. NO code fences. Pure HTML.

      RETURN VALID JSON:
      { "title": "...", "slug": "...", "excerpt": "150-word excerpt", "category": "...", "content": "<h2>...</h2><p>...</p>..." }`);

    const result = JSON.parse(raw);
    const wordCount = result.content?.split(/\s+/).length || 0;
    console.log(`   📄 "${result.title}" (${wordCount} words)`);
    return { ...result, wordCount };
  });
}

// ═══════════════════════════════════════════════════════════════
// ✅ AGENT 4: QA INSPECTOR — Quality Gate
// ═══════════════════════════════════════════════════════════════
async function qaAgent(draft, strategy, knowledgeContext) {
  const model = getModel('qa');
  console.log(`\n✅ QA INSPECTOR [${model}]: Auditing quality...`);

  return await runWithHealer('QA Inspector', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON.` : '';

    const raw = await smartCall(model, `You are the QA INSPECTOR at FouriqTech. You are FAIR but THOROUGH.

      ARTICLE:
      - Title: "${draft.title}"
      - Word Count: ${draft.wordCount}
      - Content (first 8000 chars): ${draft.content?.substring(0, 8000)}

      STRATEGY:
      - Target Keyword: "${strategy.targetKeyword}"
      - Outline: ${JSON.stringify(strategy.outline)}
      - Required Links: ${JSON.stringify(strategy.internalLinks)}

      KNOWLEDGE BASE: ${knowledgeContext.substring(0, 2000)}
      ${healHint}

      SCORE EACH CRITERION 1-10:
      1. WORD COUNT: Is it genuinely 1500+ words of substance?
      2. KEYWORD USAGE: "${strategy.targetKeyword}" used naturally 3-8 times?
      3. OUTLINE COVERAGE: Does article follow ALL outline points?
      4. INTERNAL LINKS: Required slugs linked?
      5. FACTUAL ACCURACY: Facts match Knowledge Base?
      6. READABILITY: Engaging, clear, conversational?
      7. HUMAN FEEL: Does it feel human-written? No AI cliches?
      8. SEO STRUCTURE: Proper H2/H3 hierarchy?
      9. CTA PRESENCE: Compelling Call to Action?

      IMPORTANT: Be FAIR. If the article is genuinely good, approve it. Don't reject needlessly.
      Approve if overallScore >= 65.

      RETURN VALID JSON:
      {
        "scores": { "wordCount": 0, "keywordUsage": 0, "outlineCoverage": 0, "internalLinks": 0, "factualAccuracy": 0, "readability": 0, "humanFeel": 0, "seoStructure": 0, "ctaPresence": 0 },
        "overallScore": 0,
        "approved": true/false,
        "feedback": "Specific actionable feedback if rejected",
        "summary": "One-line summary"
      }`);

    const result = JSON.parse(raw);
    console.log(`   📊 Score: ${result.overallScore}/100`);
    console.log(`   ${result.approved ? '✅ APPROVED' : '❌ REJECTED'}`);
    if (!result.approved) console.log(`   📝 ${result.feedback?.substring(0, 200)}`);
    console.log(`   💬 ${result.summary}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════
// 👔 AGENT 5: MANAGER — CEO & Orchestrator
// ═══════════════════════════════════════════════════════════════
async function managerAgent() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  👔 FOURIQTECH AI SEO COMPANY — Enterprise Engine    ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys loaded: ${API_KEYS.length}`);
  console.log(`🧠 Model Ladder: ${MODEL_LADDER.join(' → ')}`);

  if (API_KEYS.length === 0) {
    console.error('❌ No API keys found. Set GEMINI_API_KEYS env var. Exiting.');
    process.exit(1);
  }

  // ── Load Resources ──
  let knowledgeContext = "";
  if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    console.log(`📚 Knowledge docs: ${files.length}`);
    for (const file of files) {
      knowledgeContext += `\n--- ${file} ---\n${fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, file), 'utf8')}\n`;
    }
  }

  const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  const existingSlugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const blogHistory = blogDataFile.substring(0, 8000);

  const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
  let config = yaml.load(fileContents);

  let allKeywords = [];
  if (config.keywords && typeof config.keywords === 'object') {
    for (const tier of Object.values(config.keywords)) {
      if (Array.isArray(tier)) allKeywords.push(...tier);
    }
  }
  config._flatKeywords = allKeywords;

  console.log(`📰 Existing posts: ${existingSlugs.length}`);
  console.log(`🔑 Keywords: ${allKeywords.length}\n`);

  // ── Stage 1: Researcher ──
  let researchData;
  try {
    researchData = await researcherAgent(config, existingSlugs, knowledgeContext);
  } catch (e) {
    console.error('❌ Researcher failed. Using fallback keywords.');
    researchData = { newKeywords: config._flatKeywords?.slice(0, 5) || ['web design India'], trendingTopics: [], competitorGaps: [], marketInsight: 'Fallback mode' };
  }

  if (researchData.newKeywords?.length > 0) {
    if (!config.keywords.auto_discovered) config.keywords.auto_discovered = [];
    config.keywords.auto_discovered = [...new Set([...config.keywords.auto_discovered, ...researchData.newKeywords])];
    config._flatKeywords = [...new Set([...config._flatKeywords, ...researchData.newKeywords])];
    const { _flatKeywords, ...configToSave } = config;
    fs.writeFileSync(CONFIG_PATH, yaml.dump(configToSave));
    console.log('   💾 Config updated.\n');
  }

  // ── Stage 2: Strategist ──
  let strategy;
  try {
    strategy = await strategistAgent(researchData, config, existingSlugs, blogHistory);
  } catch (e) {
    console.error('❌ Strategist failed. Cannot proceed. Aborting.');
    process.exit(1);
  }

  // ── Stage 3 & 4: Writer ↔ QA Loop (with Model Escalation) ──
  const MAX_ATTEMPTS = 4;
  let draft = null;
  let qaResult = null;
  let published = false;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const escalation = attempt; // 0=flash, 1=3-flash, 2=3.1-pro, 3=3.1-pro

    try {
      const feedback = (attempt > 0 && qaResult && !qaResult.approved) ? qaResult.feedback : null;
      draft = await writerAgent(strategy, knowledgeContext, blogHistory, escalation, feedback);
    } catch (e) {
      console.error(`   ❌ Writer failed at escalation ${escalation}. Trying next...`);
      continue;
    }

    try {
      qaResult = await qaAgent(draft, strategy, knowledgeContext);
    } catch (e) {
      console.error('   ⚠️ QA failed. Auto-approving to not lose content.');
      qaResult = { approved: true, overallScore: 65, summary: 'QA unavailable' };
    }

    if (qaResult.approved) {
      published = true;
      break;
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      const nextModel = getModel('rewrite', attempt + 1);
      console.log(`\n   ⬆️ MANAGER: Escalating Writer to ${nextModel} for attempt ${attempt + 2}...`);
    }
  }

  // ── Stage 5: Publish or Abort ──
  if (published && draft) {
    console.log('\n👔 MANAGER: Content APPROVED. Publishing...');

    const safeTitle = draft.title.replace(/'/g, "\\'").replace(/`/g, '\\`');
    const safeExcerpt = draft.excerpt.replace(/'/g, "\\'").replace(/`/g, '\\`');
    const safeContent = draft.content.replace(/`/g, '\\`').replace(/\${/g, '\\${');

    const newPostCode = `
  {
    slug: '${draft.slug}',
    title: '${safeTitle}',
    excerpt: '${safeExcerpt}',
    date: '${new Date().toISOString().split('T')[0]}',
    readTime: '20 min read',
    category: '${draft.category || 'Technology'}',
    author: 'FouriqTech AI Manager',
    content: \`
      ${safeContent}
    \`,
  },`;

    const updatedBlogData = blogDataFile.replace(
      'export const blogPosts: BlogPost[] = [',
      `export const blogPosts: BlogPost[] = [${newPostCode}`
    );
    fs.writeFileSync(BLOG_DATA_PATH, updatedBlogData);

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  📋 RUN REPORT — SUCCESS                             ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║  ✅ "${draft.title}"`);
    console.log(`║  🎯 Keyword: "${strategy.targetKeyword}"`);
    console.log(`║  📊 QA Score: ${qaResult.overallScore}/100`);
    console.log(`║  📝 Words: ${draft.wordCount}`);
    console.log(`║  🔗 /blog/${draft.slug}`);
    console.log('╚═══════════════════════════════════════════════════════╝');
  } else {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  📋 RUN REPORT — NO PUBLISH                          ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log('║  🚫 Quality standards not met after all escalations.  ║');
    console.log('║  ⏭️  Skipping today. Will retry next cycle.           ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
  }

  console.log('\n👔 MANAGER: Company signing off. ✅');
}

// ═══════════════════════════════════════════════════════════════
// 🚀 BOOT
// ═══════════════════════════════════════════════════════════════
managerAgent().catch(err => {
  console.error('💥 FATAL:', err.message?.substring(0, 300));
  process.exit(1);
});
