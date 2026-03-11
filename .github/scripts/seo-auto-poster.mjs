import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { GoogleGenAI } from '@google/genai';

const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  console.log('🤖 FouriqTech SEO Master Agent: Initiating Full Pipeline...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY environment variable. Exiting.');
    process.exit(1);
  }

  // 1. Load Config and Data
  const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
  let config = yaml.load(fileContents);
  const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
  
  // Extract Current Keywords
  const allKeywords = [
    ...(config.keywords.tier_1_local || []),
    ...(config.keywords.tier_2_marketing || []),
    ...(config.keywords.tier_3_longtail || []),
    ...(config.keywords.tier_4_services || [])
  ];

  // 2. AGENT TASK 1: KEYWORD DISCOVERY & EXPANSION
  // If we are running low on keywords or just want to continuously expand
  console.log('🔍 TASK 1: Analyzing current keyword landscape and discovering new gaps...');
  const keywordPrompt = `
    You are an expert SEO Strategist for FouriqTech (a web design/digital marketing agency targeting India and Global Startups).
    Here are our current target keywords: ${JSON.stringify(allKeywords.slice(0, 15))}
    
    Task: Discover 5 NEW, high-intent, low-competition long-tail keywords specific to India or global enterprise businesses that we are NOT targeting yet. Focus on high-budget clients ($25k+).
    Return ONLY a JSON array of strings.
  `;

  try {
    const keywordResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: keywordPrompt,
      config: { responseMimeType: "application/json" }
    });
    const newKeywords = JSON.parse(keywordResponse.text);
    console.log('📈 Discovered New Keywords:', newKeywords);
    
    // Automatically inject new keywords into the YAML config
    if (newKeywords && Array.isArray(newKeywords)) {
      if (!config.keywords.auto_discovered) config.keywords.auto_discovered = [];
      const trulyNew = newKeywords.filter(k => !allKeywords.includes(k) && !config.keywords.auto_discovered.includes(k));
      config.keywords.auto_discovered.push(...trulyNew);
      fs.writeFileSync(CONFIG_PATH, yaml.dump(config), 'utf8');
      console.log('✅ Updated fouriqtech-seo-config.yaml with new discovered keywords.');
    }
  } catch (e) {
    console.log('⚠️ Failed to discover new keywords, continuing with existing list.');
  }

  // Combine newly discovered keywords
  const completeKeywordList = [...allKeywords, ...(config.keywords.auto_discovered || [])];

  // Find the next UNUSED keyword
  let targetKeyword = null;
  for (const keyword of completeKeywordList) {
    if (!blogDataFile.toLowerCase().includes(keyword.toLowerCase())) {
      targetKeyword = keyword;
      break;
    }
  }

  if (!targetKeyword) {
    console.log('✅ All keywords covered! Waiting for next cycle to discover more.');
    process.exit(0);
  }

  console.log(`\n🎯 TASK 2: Targeting Keyword -> "${targetKeyword}"`);

  // Extract slugs of existing posts for internal linking
  const existingSlugsRegex = /slug:\s*'([^']+)'/g;
  const existingSlugs = [];
  let match;
  while ((match = existingSlugsRegex.exec(blogDataFile)) !== null) {
    existingSlugs.push(match[1]);
  }

  // 3. AGENT TASK 3 & 4: COMPETITOR RESEARCH & CONTENT CREATION
  const contentPrompt = `
    You are an elite SEO Content Architect for FouriqTech.
    Your objective is to write a highly authoritative, 1500+ word blog post optimized for the keyword: "${targetKeyword}".

    REQUIREMENTS:
    1. Competitor Analysis Built-In: Write content that is more comprehensive than the top 10 Google results. Include actionable steps, global market context, and pricing/ROI estimates where applicable.
    2. Format: Semantic HTML (Returns <h2>, <h3>, <p>, <ul> tags directly as a string, no markdown wrappers).
    3. Length: 1500+ words minimum.
    4. Internal Linking: Naturally mention and create HTML anchor tags (<a href="/blog/[slug]">) linking to these existing posts where relevant: ${JSON.stringify(existingSlugs)}. Include at least 3 internal links.
    5. SEO: Emphasize business growth at a national (India) and Global enterprise level.
    
    RETURN EXCLUSIVELY VALID JSON:
    {
      "title": "A catchy, SEO optimized title under 60 chars",
      "slug": "url-friendly-slug",
      "excerpt": "Compelling meta description under 160 chars.",
      "readTime": "X min read",
      "category": "Web Design OR Digital Marketing OR Guides",
      "content": "<h2>...HTML content...</h2>"
    }
  `;

  console.log('🧠 TASK 3 & 4: Generating Competitor-beating Content & Internal Links (Gemini 2.5 Pro)...');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: contentPrompt,
      config: { responseMimeType: "application/json" }
    });

    const postData = JSON.parse(response.text);

    // 4. AGENT TASK 5: INJECT CONTENT
    const newPostBlock = `
  {
    slug: '${postData.slug}',
    title: '${postData.title}',
    excerpt: '${postData.excerpt}',
    date: '${new Date().toISOString().split('T')[0]}',
    readTime: '${postData.readTime}',
    category: '${postData.category}',
    author: 'FouriqTech AI Manager',
    content: \`
      ${postData.content}
    \`,
  },`;

    const injectionMarker = "export const blogPosts: BlogPost[] = [";
    const newBlogDataFile = blogDataFile.replace(
      injectionMarker, 
      `${injectionMarker}\n${newPostBlock}`
    );

    fs.writeFileSync(BLOG_DATA_PATH, newBlogDataFile, 'utf8');

    console.log(`✅ SUCCESS: Generated, linked, and published -> ${postData.title}`);

  } catch (error) {
    console.error('❌ Failed to generate SEO content:', error);
    process.exit(1);
  }
}

run();
