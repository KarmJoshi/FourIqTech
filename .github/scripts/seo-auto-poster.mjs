import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';

const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '.github/knowledge_base');

const PRO_MODEL = 'gemini-2.5-flash';
const FLASH_MODEL = 'gemini-2.5-flash';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runWithHealer(task, maxRetries = 2) {
  let lastError = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await task(lastError);
    } catch (error) {
      console.error(`⚠️ Attempt ${i + 1} failed. Error: ${error.message}`);
      lastError = error;
      if (i === maxRetries - 1) throw error;
      console.log('🩹 Initiating Self-Healing sequence...');
    }
  }
}

async function run() {
  console.log('🤖 FouriqTech SEO MASTER AGENT: Initiating Advanced Pipeline...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY. Exiting.');
    process.exit(1);
  }

  // 1. Gather Knowledge & History
  let knowledgeContext = "";
  if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR);
    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.txt')) {
        knowledgeContext += `\n--- SOURCE: ${file} ---\n${fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, file), 'utf8')}\n`;
      }
    }
  }

  const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  const existingSlugs = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const recentBlogs = blogDataFile.substring(0, 10000); // Read first 10k chars for tone context

  const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
  let config = yaml.load(fileContents);

  // 2. BRAIN PHASE: Strategy & Keyword Discovery (Using PRO Model)
  console.log(`🧠 BRAIN PHASE: Strategizing using ${PRO_MODEL}...`);
  const strategyResponse = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `You are the Head of Strategy at FouriqTech. 
    Analyze our Current Config: ${JSON.stringify(config)}
    Analyze our Recent Content History: ${recentBlogs}
    
    TASKS:
    1. Extract 3-5 NEW high-value long-tail keywords for Global/India startups that we haven't targeted.
    2. Pick the BEST keyword from our entire list (new or old) to write about today.
    3. Create a detailed 10-point OUTLINE for a 2000-word blog post on that keyword.
    
    RETURN VALID JSON ONLY:
    { "newKeywords": [], "selectedTarget": "...", "outline": ["...", "..."] }`,
    config: { responseMimeType: "application/json" }
  });

  const strategy = JSON.parse(strategyResponse.candidates[0].content.parts[0].text);
  
  if (strategy.newKeywords && strategy.newKeywords.length > 0) {
    config.keywords = [...new Set([...config.keywords, ...strategy.newKeywords])];
    fs.writeFileSync(CONFIG_PATH, yaml.dump(config));
    console.log('📈 Discovery Complete: Strategy updated with new keywords.');
  }

  const targetKeyword = strategy.selectedTarget;
  console.log(`🎯 Target Selected: "${targetKeyword}"`);

  // 3. MUSCLE PHASE: High-Authority Writing (Using FLASH Model)
  console.log(`✍️ MUSCLE PHASE: Writing deep-dive content using ${FLASH_MODEL}...`);
  
  const contentResponse = await runWithHealer(async (prevError) => {
    const errorFixHint = prevError ? `\n\nCRITICAL: The previous attempt failed with this error: "${prevError.message}". Please adjust your response format to ensure it is valid JSON and follows all constraints.` : "";
    
    return await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `You are a Senior Technical Content Architect.
      TARGET: "${targetKeyword}"
      STRATEGY OUTLINE: ${JSON.stringify(strategy.outline)}
      
      --- KNOWLEDGE BASE ---
      ${knowledgeContext}
      
      --- TONE REFERENCE (PREVIOUS BLOGS) ---
      ${recentBlogs}

      REQUIREMENTS:
      1. Write 2000+ words of extremely high-value content.
      2. Use ONLY facts from Knowledge Base.
      3. Inject internal links: ${JSON.stringify(existingSlugs.slice(0, 3))}.
      4. Format: Semantic HTML only (no markdown code blocks).
      ${errorFixHint}

      RETURN VALID JSON:
      { "title": "...", "excerpt": "...", "slug": "...", "category": "...", "content": "HTML_STRING" }`,
      config: { responseMimeType: "application/json" }
    });
  });

  const post = JSON.parse(contentResponse.candidates[0].content.parts[0].text);

  // 4. DEPLOYMENT PHASE: Injection
  const newPostCode = `
  {
    slug: '${post.slug}',
    title: '${post.title}',
    excerpt: '${post.excerpt}',
    date: '${new Date().toISOString().split('T')[0]}',
    readTime: '20 min read',
    category: '${post.category || 'Technology'}',
    author: 'FouriqTech AI Manager',
    content: \`
      ${post.content}
    \`,
  },`;

  const updatedBlogData = blogDataFile.replace(
    'export const blogPosts: BlogPost[] = [',
    `export const blogPosts: BlogPost[] = [${newPostCode}`
  );

  fs.writeFileSync(BLOG_DATA_PATH, updatedBlogData);
  console.log(`✅ SUCCESS: Published -> ${post.title}`);
}

run().catch(err => {
  console.error('💥 FATAL ERROR:', err);
  process.exit(1);
});
