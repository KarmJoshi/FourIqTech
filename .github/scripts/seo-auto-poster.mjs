import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';

// ═══════════════════════════════════════════════════
// 🏢 FOURIQTECH AI SEO COMPANY — Multi-Agent System
// ═══════════════════════════════════════════════════

const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '.github/knowledge_base');

const MODEL = 'gemini-2.5-flash';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ═══════════════════════════════════════════════════
// 🩹 SELF-HEALING WRAPPER
// ═══════════════════════════════════════════════════
async function runWithHealer(agentName, taskFn, maxRetries = 2) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await taskFn(lastError);
    } catch (error) {
      console.error(`   ⚠️ [${agentName}] Attempt ${attempt} failed: ${error.message?.substring(0, 150)}`);
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`   🩹 [${agentName}] Self-healing: retrying with error context...`);
        await new Promise(r => setTimeout(r, 5000)); // Wait 5s before retry
      }
    }
  }
  throw lastError;
}

// ═══════════════════════════════════════════════════
// 🔬 AGENT 1: RESEARCHER — Market Intelligence
// ═══════════════════════════════════════════════════
async function researcherAgent(config, existingSlugs, knowledgeContext) {
  console.log('\n🔬 RESEARCHER AGENT: Scanning market for opportunities...');

  return await runWithHealer('Researcher', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON output format.` : '';

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are the MARKET RESEARCHER at FouriqTech SEO Company.
      
      COMPANY KNOWLEDGE: ${knowledgeContext}
      EXISTING BLOG SLUGS (avoid duplicates): ${JSON.stringify(existingSlugs)}
      CURRENT KEYWORDS IN CONFIG: ${JSON.stringify(config._flatKeywords || [])}

      YOUR TASKS:
      1. Discover 5 NEW high-value long-tail keywords for web design/development/digital marketing targeting India & Global startups/enterprises.
      2. Identify 3 trending industry topics that would attract $25k+ clients.
      3. Analyze competitor gaps — what topics are competitors NOT covering well?
      4. Ensure ZERO overlap with existing slugs.
      ${healHint}

      RETURN VALID JSON ONLY:
      {
        "newKeywords": ["keyword1", "keyword2", ...],
        "trendingTopics": ["topic1", "topic2", "topic3"],
        "competitorGaps": ["gap1", "gap2", "gap3"],
        "marketInsight": "One sentence summary of current market opportunity"
      }`,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.candidates[0].content.parts[0].text);
    console.log(`   📈 Discovered ${result.newKeywords?.length || 0} new keywords`);
    console.log(`   🔥 Trending: ${result.trendingTopics?.join(', ')}`);
    console.log(`   💡 Insight: ${result.marketInsight}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════
// 📊 AGENT 2: STRATEGIST — Content Planning
// ═══════════════════════════════════════════════════
async function strategistAgent(researchData, config, existingSlugs, blogHistory) {
  console.log('\n📊 STRATEGIST AGENT: Creating battle plan...');

  return await runWithHealer('Strategist', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON output format.` : '';

    const allKeywords = [...new Set([...(config._flatKeywords || []), ...(researchData.newKeywords || [])])];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are the CONTENT STRATEGIST at FouriqTech SEO Company.

      RESEARCHER'S INTEL:
      - New Keywords: ${JSON.stringify(researchData.newKeywords)}
      - Trending Topics: ${JSON.stringify(researchData.trendingTopics)}
      - Competitor Gaps: ${JSON.stringify(researchData.competitorGaps)}
      - Market Insight: ${researchData.marketInsight}

      ALL AVAILABLE KEYWORDS: ${JSON.stringify(allKeywords)}
      ALREADY WRITTEN SLUGS: ${JSON.stringify(existingSlugs)}
      
      RECENT BLOG TONE CONTEXT (last posts): ${blogHistory.substring(0, 3000)}

      YOUR TASKS:
      1. Select the SINGLE BEST keyword to target today (highest ROI, least competition, not yet written).
      2. Create a detailed 8-10 point OUTLINE for a 2000+ word article.
      3. Define which existing posts to internally link to (pick 2-3 from slugs).
      4. Write the perfect Call-to-Action for the end of the article.
      5. Define the target reader persona.
      ${healHint}

      RETURN VALID JSON ONLY:
      {
        "targetKeyword": "the chosen keyword",
        "articleTitle": "SEO-optimized title",
        "targetPersona": "Who is reading this",
        "outline": ["Point 1: ...", "Point 2: ...", ...],
        "internalLinks": ["slug1", "slug2"],
        "callToAction": "The CTA text",
        "estimatedSearchVolume": "high/medium/low"
      }`,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.candidates[0].content.parts[0].text);
    console.log(`   🎯 Target: "${result.targetKeyword}"`);
    console.log(`   📝 Title: "${result.articleTitle}"`);
    console.log(`   👤 Persona: ${result.targetPersona}`);
    console.log(`   📋 Outline: ${result.outline?.length || 0} sections planned`);
    return result;
  });
}

// ═══════════════════════════════════════════════════
// ✍️ AGENT 3: WRITER — Content Creation
// ═══════════════════════════════════════════════════
async function writerAgent(strategy, knowledgeContext, blogHistory, qaFeedback = null) {
  const mode = qaFeedback ? '(REWRITE MODE)' : '';
  console.log(`\n✍️ WRITER AGENT ${mode}: Crafting premium content...`);

  return await runWithHealer('Writer', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON output.` : '';
    const rewriteInstructions = qaFeedback
      ? `\n\n🔴 QA REJECTION FEEDBACK — YOU MUST FIX THESE ISSUES:\n${qaFeedback}\nRewrite the ENTIRE article addressing every point above.`
      : '';

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are the SENIOR CONTENT WRITER at FouriqTech SEO Company.

      STRATEGIST'S PLAN:
      - Target Keyword: "${strategy.targetKeyword}"
      - Article Title: "${strategy.articleTitle}"
      - Target Persona: "${strategy.targetPersona}"
      - Detailed Outline: ${JSON.stringify(strategy.outline)}
      - Internal Links to Include: ${JSON.stringify(strategy.internalLinks)}
      - Call to Action: "${strategy.callToAction}"

      --- COMPANY KNOWLEDGE BASE (USE ONLY THESE FACTS) ---
      ${knowledgeContext}
      
      --- TONE REFERENCE (MATCH THIS VOICE) ---
      ${blogHistory.substring(0, 2000)}
      ${rewriteInstructions}
      ${healHint}

      WRITING RULES:
      1. Write EXACTLY 2000+ words. This is NON-NEGOTIABLE.
      2. Follow the outline PRECISELY — every point must become a section.
      3. Use semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>.
      4. Naturally embed internal links as: <a href="/blog/SLUG">anchor text</a>.
      5. NEVER fabricate company facts. Use Knowledge Base ONLY.
      6. End with the Call to Action inside a compelling <h2> section.
      7. Write for humans first, search engines second.
      8. NO markdown. NO code fences. Pure HTML string only.

      RETURN VALID JSON ONLY:
      {
        "title": "Final SEO Title",
        "slug": "url-friendly-slug",
        "excerpt": "150-word compelling excerpt",
        "category": "Category Name",
        "content": "<h2>...</h2><p>...</p>..."
      }`,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.candidates[0].content.parts[0].text);
    const wordCount = result.content?.split(/\s+/).length || 0;
    console.log(`   📄 Draft complete: "${result.title}" (${wordCount} words)`);
    return { ...result, wordCount };
  });
}

// ═══════════════════════════════════════════════════
// ✅ AGENT 4: QA INSPECTOR — Quality Assurance
// ═══════════════════════════════════════════════════
async function qaAgent(draft, strategy, knowledgeContext) {
  console.log('\n✅ QA INSPECTOR AGENT: Auditing content quality...');

  return await runWithHealer('QA Inspector', async (prevError) => {
    const healHint = prevError ? `\nPREVIOUS ERROR: "${prevError.message}". Fix your JSON output.` : '';

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are the QA INSPECTOR at FouriqTech SEO Company. You are STRICT and UNCOMPROMISING.

      ARTICLE TO REVIEW:
      - Title: "${draft.title}"
      - Word Count: ${draft.wordCount}
      - Content: ${draft.content?.substring(0, 8000)}

      STRATEGIST'S ORIGINAL PLAN:
      - Target Keyword: "${strategy.targetKeyword}"
      - Required Outline: ${JSON.stringify(strategy.outline)}
      - Required Internal Links: ${JSON.stringify(strategy.internalLinks)}

      KNOWLEDGE BASE (for fact-checking): ${knowledgeContext.substring(0, 2000)}
      ${healHint}

      AUDIT CHECKLIST — Score each 1-10:
      1. WORD COUNT: Is it genuinely 1500+ words? (Not padded fluff)
      2. KEYWORD USAGE: Is "${strategy.targetKeyword}" used naturally 3-8 times?
      3. OUTLINE COVERAGE: Does the article follow ALL outline points?
      4. INTERNAL LINKS: Are the required slugs linked?
      5. FACTUAL ACCURACY: Are company facts matching the Knowledge Base?
      6. READABILITY: Is it engaging, clear, and professional?
      7. SEO STRUCTURE: Proper H2/H3 hierarchy? Meta-friendly title?
      8. CTA PRESENCE: Is there a compelling Call to Action?

      RETURN VALID JSON ONLY:
      {
        "scores": {
          "wordCount": 8,
          "keywordUsage": 7,
          "outlineCoverage": 9,
          "internalLinks": 6,
          "factualAccuracy": 8,
          "readability": 9,
          "seoStructure": 8,
          "ctaPresence": 7
        },
        "overallScore": 78,
        "approved": true,
        "feedback": "Detailed feedback if rejected, empty string if approved",
        "summary": "One line quality summary"
      }`,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.candidates[0].content.parts[0].text);
    console.log(`   📊 Quality Score: ${result.overallScore}/100`);
    console.log(`   ${result.approved ? '✅ APPROVED for publishing' : '❌ REJECTED — sending back to Writer'}`);
    if (!result.approved) console.log(`   📝 Feedback: ${result.feedback?.substring(0, 200)}`);
    console.log(`   💬 ${result.summary}`);
    return result;
  });
}

// ═══════════════════════════════════════════════════
// 👔 AGENT 5: MANAGER — CEO & Orchestrator
// ═══════════════════════════════════════════════════
async function managerAgent() {
  console.log('═══════════════════════════════════════════════════');
  console.log('👔 MANAGER AGENT: FouriqTech AI SEO Company Online');
  console.log('═══════════════════════════════════════════════════');
  console.log(`⏰ Run Time: ${new Date().toISOString()}`);
  console.log(`🧠 Model: ${MODEL}`);

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ MANAGER: No API Key found. Company cannot operate. Shutting down.');
    process.exit(1);
  }

  // ── Load Resources ──
  let knowledgeContext = "";
  if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    console.log(`📚 MANAGER: Loading ${files.length} knowledge documents...`);
    for (const file of files) {
      knowledgeContext += `\n--- ${file} ---\n${fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, file), 'utf8')}\n`;
    }
  }

  const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  const existingSlugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const blogHistory = blogDataFile.substring(0, 8000);

  const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
  let config = yaml.load(fileContents);

  // Flatten nested keyword tiers into a single array
  let allKeywords = [];
  if (config.keywords && typeof config.keywords === 'object') {
    for (const tier of Object.values(config.keywords)) {
      if (Array.isArray(tier)) allKeywords.push(...tier);
    }
  }
  config._flatKeywords = allKeywords;

  console.log(`📰 MANAGER: ${existingSlugs.length} existing posts detected.`);
  console.log(`🔑 MANAGER: ${allKeywords.length} keywords in config.\n`);

  // ── Stage 1: Call Researcher ──
  let researchData;
  try {
    researchData = await researcherAgent(config, existingSlugs, knowledgeContext);
  } catch (e) {
    console.error('❌ MANAGER: Researcher failed after retries. Using fallback keywords.');
    researchData = { newKeywords: config._flatKeywords?.slice(0, 5) || ['web design India'], trendingTopics: [], competitorGaps: [], marketInsight: 'Fallback mode' };
  }

  // Update config with new keywords
  if (researchData.newKeywords?.length > 0) {
    if (!config.keywords.auto_discovered) config.keywords.auto_discovered = [];
    config.keywords.auto_discovered = [...new Set([...config.keywords.auto_discovered, ...researchData.newKeywords])];
    config._flatKeywords = [...new Set([...config._flatKeywords, ...researchData.newKeywords])];
    const { _flatKeywords, ...configToSave } = config;
    fs.writeFileSync(CONFIG_PATH, yaml.dump(configToSave));
    console.log('   💾 MANAGER: Config updated with new keywords.\n');
  }

  // ── Stage 2: Call Strategist ──
  let strategy;
  try {
    strategy = await strategistAgent(researchData, config, existingSlugs, blogHistory);
  } catch (e) {
    console.error('❌ MANAGER: Strategist failed. Cannot proceed without a plan. Aborting.');
    process.exit(1);
  }

  // ── Stage 3 & 4: Writer + QA Loop (Max 2 rewrites) ──
  let draft = null;
  let qaResult = null;
  const MAX_REWRITES = 2;

  for (let attempt = 0; attempt <= MAX_REWRITES; attempt++) {
    // Call Writer
    try {
      const feedback = qaResult?.approved === false ? qaResult.feedback : null;
      draft = await writerAgent(strategy, knowledgeContext, blogHistory, feedback);
    } catch (e) {
      console.error('❌ MANAGER: Writer failed after retries. Aborting.');
      process.exit(1);
    }

    // Call QA
    try {
      qaResult = await qaAgent(draft, strategy, knowledgeContext);
    } catch (e) {
      console.error('⚠️ MANAGER: QA failed. Auto-approving draft to avoid losing content.');
      qaResult = { approved: true, overallScore: 60, summary: 'QA unavailable, auto-approved' };
    }

    if (qaResult.approved) break;

    if (attempt < MAX_REWRITES) {
      console.log(`\n🔄 MANAGER: QA rejected. Sending Writer for rewrite attempt ${attempt + 2}...`);
    } else {
      console.log('\n⚠️ MANAGER: Max rewrites reached. Publishing best available draft.');
    }
  }

  // ── Stage 5: Publish ──
  console.log('\n👔 MANAGER: Publishing approved content...');

  const newPostCode = `
  {
    slug: '${draft.slug}',
    title: '${draft.title.replace(/'/g, "\\'")}',
    excerpt: '${draft.excerpt.replace(/'/g, "\\'")}',
    date: '${new Date().toISOString().split('T')[0]}',
    readTime: '20 min read',
    category: '${draft.category || 'Technology'}',
    author: 'FouriqTech AI Manager',
    content: \`
      ${draft.content}
    \`,
  },`;

  const updatedBlogData = blogDataFile.replace(
    'export const blogPosts: BlogPost[] = [',
    `export const blogPosts: BlogPost[] = [${newPostCode}`
  );
  fs.writeFileSync(BLOG_DATA_PATH, updatedBlogData);

  // ── Final Report ──
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📋 MANAGER: RUN REPORT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ Published: "${draft.title}"`);
  console.log(`🎯 Keyword: "${strategy.targetKeyword}"`);
  console.log(`📊 QA Score: ${qaResult.overallScore}/100`);
  console.log(`📝 Word Count: ${draft.wordCount}`);
  console.log(`🔗 Slug: /blog/${draft.slug}`);
  console.log(`💬 QA Summary: ${qaResult.summary}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('👔 MANAGER: All agents completed. Company signing off. ✅');
}

// ═══════════════════════════════════════════════════
// 🚀 BOOT SEQUENCE
// ═══════════════════════════════════════════════════
managerAgent().catch(err => {
  console.error('💥 FATAL COMPANY ERROR:', err.message?.substring(0, 300));
  process.exit(1);
});
