import dotenv from 'dotenv';
dotenv.config();
import { getModelsForRole, smartCall, sleep, logActivity, getApiKeyCount } from './agency-core.mjs';
import { compileMemory, recordAction, closeMemory } from './memory-compiler.mjs';
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';

// ═══════════════════════════════════════════════════════════════════════
// 🔗 BACKLINK AGENT v1.0 — Autonomous Link Building System
// ═══════════════════════════════════════════════════════════════════════
// Pipeline:
//   1. OPPORTUNITY FINDER  → Discovers link targets via Gemini grounding
//   2. CONTENT CREATOR     → Writes guest posts / replacement content
//   3. OUTREACH DRAFTER    → Crafts personalized pitch emails
//   4. TRACKER             → Stores everything in DB
//
// Strategies:
//   - Guest Post: Find blogs, write article, draft pitch
//   - Broken Link: Find dead links, create replacement, draft email
//   - Resource Page: Find "best of" lists, draft inclusion pitch
// ═══════════════════════════════════════════════════════════════════════

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const WEBSITE_URL = 'https://www.fouriqtech.com';
const COMPANY_NAME = 'FourIQ Tech';

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1: OPPORTUNITY FINDER — Discovers link targets
// ═══════════════════════════════════════════════════════════════════════
async function findOpportunities(strategy, memory) {
  console.log(`\n🔍 PHASE 1: Finding ${strategy} opportunities...`);
  
  const models = await getModelsForRole('researcher');
  
  // Get existing opportunities to avoid duplicates
  const existing = await prisma.$queryRawUnsafe(
    'SELECT "targetDomain" FROM "LinkOpportunity" LIMIT 100'
  ).catch(() => []);
  const existingDomains = existing.map((r) => r.targetDomain);

  const prompts = {
    guest_post: `You are a link building specialist. Find 5 blogs/websites that accept guest posts in the web development, React, Next.js, SaaS, or enterprise software niche.

REQUIREMENTS:
- Must be active blogs (published in last 6 months)
- Must have a "Write for us" or "Contribute" page, OR accept guest posts
- Domain authority should be medium-high (established blogs, not spam)
- Must be relevant to: web development, React, performance, enterprise apps
- DO NOT include: ${existingDomains.slice(0, 20).join(', ') || 'none yet'}

${memory.context}

Use Google Search to find REAL blogs that accept guest posts right now.

Return JSON:
{
  "opportunities": [
    {
      "targetUrl": "https://blog.example.com/write-for-us",
      "targetDomain": "blog.example.com",
      "contactEmail": "editor@example.com (if findable)",
      "contactName": "Editor name (if findable)",
      "relevanceScore": 0.0-1.0,
      "pitchAngle": "Why they'd want our content (1 sentence)",
      "suggestedTopic": "A topic that fits their blog AND our expertise",
      "notes": "Any useful context about this site"
    }
  ]
}`,

    broken_link: `You are a broken link building specialist. Find 5 authority websites in the web development/tech space that have broken links (404 pages) related to React, Next.js, web performance, or SaaS development.

STRATEGY: Find pages that link to now-dead resources. We can create replacement content and ask them to update the link to point to us.

REQUIREMENTS:
- Target authority sites (tech blogs, documentation sites, resource pages)
- The broken link should be related to topics we cover
- DO NOT include: ${existingDomains.slice(0, 20).join(', ') || 'none yet'}

${memory.context}

Use Google Search to find pages with broken links in our niche.

Return JSON:
{
  "opportunities": [
    {
      "targetUrl": "https://site.com/page-with-broken-link",
      "targetDomain": "site.com",
      "brokenUrl": "https://dead-site.com/old-article",
      "contactEmail": "if findable",
      "relevanceScore": 0.0-1.0,
      "replacementTopic": "What content we should create as replacement",
      "notes": "Context about the broken link"
    }
  ]
}`,

    resource_page: `You are a resource page link builder. Find 5 "best of" lists, resource pages, or tool directories where ${COMPANY_NAME} (a premium React/Next.js web development agency) could be listed.

EXAMPLES of what to find:
- "Best web development agencies 2026"
- "Top React development companies"
- "Enterprise web application development resources"
- "Best SaaS development agencies"

REQUIREMENTS:
- Must be real, active pages (not outdated)
- Must be relevant to web development / enterprise software
- DO NOT include: ${existingDomains.slice(0, 20).join(', ') || 'none yet'}

${memory.context}

Use Google Search to find real resource pages.

Return JSON:
{
  "opportunities": [
    {
      "targetUrl": "https://site.com/best-web-dev-agencies",
      "targetDomain": "site.com",
      "contactEmail": "if findable",
      "relevanceScore": 0.0-1.0,
      "pitchAngle": "Why we should be included",
      "listType": "agency directory / best-of list / resource page",
      "notes": "Context"
    }
  ]
}`
  };

  const raw = await smartCall(models, prompts[strategy] || prompts.guest_post, 'Link Finder');
  
  try {
    const parsed = JSON.parse(raw);
    const opportunities = parsed.opportunities || [];
    console.log(`   ✅ Found ${opportunities.length} opportunities`);
    return opportunities.map(opp => ({ ...opp, type: strategy }));
  } catch (e) {
    console.log(`   ❌ Failed to parse: ${e.message}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2: CONTENT CREATOR — Writes guest posts / replacement content
// ═══════════════════════════════════════════════════════════════════════
async function createContent(opportunity) {
  console.log(`\n✍️ PHASE 2: Creating content for ${opportunity.targetDomain}...`);
  
  const models = await getModelsForRole('writer');
  
  let prompt;
  if (opportunity.type === 'guest_post') {
    prompt = `Write a guest post for ${opportunity.targetDomain}.

TOPIC: ${opportunity.suggestedTopic || 'React/Next.js best practices'}
PITCH ANGLE: ${opportunity.pitchAngle}
AUTHOR: Karm Joshi, Founder of FourIQ Tech (${WEBSITE_URL})

REQUIREMENTS:
- 800-1200 words
- Professional, technical, valuable content
- Include 1-2 natural mentions of FourIQ Tech with link to ${WEBSITE_URL}
- Match the tone of a technical blog
- Include actionable tips, code examples if relevant
- End with a brief author bio

Return the full article text (no JSON, just the content).`;
  } else if (opportunity.type === 'broken_link') {
    prompt = `Create a replacement article for a broken link.

BROKEN URL: ${opportunity.brokenUrl || 'unknown'}
REPLACEMENT TOPIC: ${opportunity.replacementTopic || 'Web development best practices'}
TARGET SITE: ${opportunity.targetDomain}

Write a 600-1000 word article that could serve as a replacement for the dead link.
Make it high-quality, technical, and include a natural link to ${WEBSITE_URL}.

Return the full article text.`;
  } else {
    return null; // Resource pages don't need content
  }

  const content = await smartCall(models, prompt, 'Content Creator', { json: false });
  console.log(`   ✅ Content created: ${content?.length || 0} chars`);
  return content;
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: OUTREACH DRAFTER — Crafts personalized emails
// ═══════════════════════════════════════════════════════════════════════
async function draftOutreach(opportunity, content) {
  console.log(`\n📧 PHASE 3: Drafting outreach for ${opportunity.targetDomain}...`);
  
  const models = await getModelsForRole('writer');
  
  const templates = {
    guest_post: `Write a short, personalized outreach email to pitch a guest post.

TARGET: ${opportunity.targetDomain}
CONTACT: ${opportunity.contactName || 'Editor'}
TOPIC: ${opportunity.suggestedTopic}
PITCH ANGLE: ${opportunity.pitchAngle}

FROM: Karm Joshi, Founder @ FourIQ Tech

RULES:
- Keep it under 150 words
- Be direct, no fluff
- Mention something specific about their blog
- Propose the topic clearly
- Don't be salesy
- Professional but friendly tone

Return JSON:
{ "subject": "email subject line", "body": "email body text" }`,

    broken_link: `Write a broken link outreach email.

TARGET: ${opportunity.targetDomain}
PAGE WITH BROKEN LINK: ${opportunity.targetUrl}
BROKEN URL: ${opportunity.brokenUrl}
OUR REPLACEMENT: ${WEBSITE_URL}

FROM: Karm Joshi, FourIQ Tech

RULES:
- Be helpful, not pushy
- Point out the broken link politely
- Offer our content as a replacement
- Keep under 120 words

Return JSON:
{ "subject": "email subject line", "body": "email body text" }`,

    resource_page: `Write an outreach email to get listed on a resource page.

TARGET: ${opportunity.targetDomain}
PAGE: ${opportunity.targetUrl}
LIST TYPE: ${opportunity.listType || 'resource page'}
WHY WE FIT: ${opportunity.pitchAngle}

FROM: Karm Joshi, FourIQ Tech (${WEBSITE_URL})
WE ARE: A premium React/Next.js web development agency serving global enterprises

RULES:
- Be concise (under 100 words)
- Explain why we'd be a good addition
- Include our URL
- Professional tone

Return JSON:
{ "subject": "email subject line", "body": "email body text" }`
  };

  const raw = await smartCall(models, templates[opportunity.type] || templates.guest_post, 'Outreach Drafter');
  
  try {
    const email = JSON.parse(raw);
    console.log(`   ✅ Email drafted: "${email.subject}"`);
    return email;
  } catch {
    console.log(`   ⚠️ Email parse failed, using raw text`);
    return { subject: `Collaboration opportunity — ${opportunity.suggestedTopic || 'FourIQ Tech'}`, body: raw };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 4: STORE — Save everything to database
// ═══════════════════════════════════════════════════════════════════════
async function storeOpportunity(opportunity, content, email) {
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "LinkOpportunity" ("id", "type", "targetUrl", "targetDomain", "contactEmail", "contactName", "status", "ourContent", "outreachEmail", "pitchAngle", "relevanceScore", "targetKeyword", "notes", "foundAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    `,
      opportunity.type,
      opportunity.targetUrl,
      opportunity.targetDomain,
      opportunity.contactEmail || null,
      opportunity.contactName || null,
      content ? 'content_ready' : 'found',
      content || null,
      email ? JSON.stringify(email) : null,
      opportunity.pitchAngle || null,
      opportunity.relevanceScore || 0,
      opportunity.suggestedTopic || opportunity.replacementTopic || null,
      opportunity.notes || null
    );
    return true;
  } catch (e) {
    console.error(`   ❌ DB store failed: ${e.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🔗 BACKLINK AGENT v1.0 — Autonomous Link Builder         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 API Keys: ${getApiKeyCount()}\n`);

  if (getApiKeyCount() === 0) {
    console.error('❌ No API keys.');
    process.exit(1);
  }

  // Load memory
  const memory = await compileMemory('content');
  console.log(`🧠 Memory: ${memory.context.length} chars`);

  // Read Director orders to determine strategy
  let strategy = 'guest_post'; // default
  try {
    const fs = await import('fs');
    const path = await import('path');
    const orders = JSON.parse(fs.default.readFileSync(path.default.join(process.cwd(), '.github/director_orders.json'), 'utf8'));
    if (orders.department === 'backlinks') {
      if (orders.orders?.toLowerCase().includes('broken')) strategy = 'broken_link';
      else if (orders.orders?.toLowerCase().includes('resource') || orders.orders?.toLowerCase().includes('directory')) strategy = 'resource_page';
      else strategy = 'guest_post';
    }
  } catch {}

  console.log(`📋 Strategy: ${strategy.replace(/_/g, ' ').toUpperCase()}\n`);

  // Phase 1: Find opportunities
  const opportunities = await findOpportunities(strategy, memory);
  
  if (opportunities.length === 0) {
    console.log('\n⚠️ No opportunities found. Try again later.');
    await logActivity('⚠️', 'backlinks', 'No link opportunities found this cycle', 'info');
    await closeMemory();
    await prisma.$disconnect();
    return;
  }

  await sleep(3000);

  // Phase 2 & 3: For each opportunity, create content and draft outreach
  let stored = 0;
  for (const opp of opportunities.slice(0, 3)) { // Process top 3
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`🎯 Processing: ${opp.targetDomain} (${opp.type})`);
    
    // Create content (for guest posts and broken links)
    let content = null;
    if (opp.type !== 'resource_page') {
      content = await createContent(opp);
      await sleep(3000);
    }
    
    // Draft outreach email
    const email = await draftOutreach(opp, content);
    await sleep(3000);
    
    // Store in DB
    const saved = await storeOpportunity(opp, content, email);
    if (saved) stored++;
  }

  // Record to memory
  await recordAction('backlinks', `${strategy}_campaign`, null, `Found ${opportunities.length} opportunities, processed ${stored}`, null);
  await logActivity('🔗', 'backlinks', `Link building: ${stored} ${strategy.replace(/_/g, ' ')} opportunities ready`, 'publish');

  // Final report
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║  📋 BACKLINK AGENT — COMPLETE                              ║`);
  console.log(`╠═══════════════════════════════════════════════════════════╣`);
  console.log(`║  📋 Strategy: ${strategy.replace(/_/g, ' ')}`);
  console.log(`║  🔍 Found: ${opportunities.length} opportunities`);
  console.log(`║  ✅ Processed: ${stored} (with content + outreach)`);
  console.log(`║  📧 Ready to pitch: ${stored}`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);

  await closeMemory();
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('💥 FATAL:', err.message);
  process.exit(1);
});
