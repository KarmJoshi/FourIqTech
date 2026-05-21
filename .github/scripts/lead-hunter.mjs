#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🕵️ LEAD HUNTER v5 — No Puppeteer, Gemini Grounding Only
 * ═══════════════════════════════════════════════════════════════════════
 * Finds businesses with bad websites, audits them via AI, drafts
 * personalized cold emails. No browser needed.
 *
 * Usage: node lead-hunter.mjs "dental clinics in Houston" 5
 * ═══════════════════════════════════════════════════════════════════════
 */

import dotenv from 'dotenv';
dotenv.config();
import { getModelsForRole, smartCall, sleep, logActivity, getApiKeyCount } from './agency-core.mjs';

import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1: FIND BUSINESSES — Via Gemini Google Search Grounding
// ═══════════════════════════════════════════════════════════════════════
async function findBusinesses(niche, count) {
  console.log(`\n🔍 Finding ${count} businesses in: "${niche}"...`);
  
  const models = await getModelsForRole('scanner');
  const raw = await smartCall(models, `Search Google Maps and Google Search for: "${niche}"

Find ${count} real businesses that likely have outdated or slow websites. Look for:
- Small/medium businesses (not big chains)
- Businesses with websites that look old or have issues
- Businesses that would benefit from a website redesign

For each business, provide:
- Business name
- Website URL (if they have one)
- Location/city
- What they do (1 sentence)
- Why their website might need help (based on what you can see)

Return JSON:
{
  "businesses": [
    {
      "name": "Business Name",
      "website": "https://their-website.com",
      "location": "City, State",
      "niche": "${niche}",
      "description": "What they do",
      "website_issue": "Why their site needs help (slow, outdated design, no mobile, etc)"
    }
  ]
}`, 'Lead Finder');

  try {
    const parsed = JSON.parse(raw);
    console.log(`   ✅ Found ${parsed.businesses?.length || 0} businesses`);
    return parsed.businesses || [];
  } catch {
    console.log('   ❌ Failed to parse business list');
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2: AUDIT WEBSITE — AI analyzes their site via grounding
// ═══════════════════════════════════════════════════════════════════════
async function auditWebsite(business) {
  console.log(`   🔍 Auditing: ${business.name} (${business.website})...`);
  
  if (!business.website || business.website === 'N/A') {
    return { score: 20, issues: ['No website found'], recommendation: 'They need a website built from scratch' };
  }

  const models = await getModelsForRole('auditor');
  const raw = await smartCall(models, `Analyze this business website: ${business.website}

You are a website audit expert. Check this site for:
1. Loading speed (is it slow?)
2. Mobile responsiveness (does it work on phones?)
3. Design quality (modern or outdated?)
4. SEO basics (meta tags, headings, content)
5. Security (HTTPS?)
6. Call-to-action (can visitors easily contact them?)

Be specific — mention actual problems you can observe.

Return JSON:
{
  "score": 0-100 (overall website quality),
  "speed_issue": "specific speed problem or 'OK'",
  "design_issue": "specific design problem or 'OK'",
  "mobile_issue": "specific mobile problem or 'OK'",
  "seo_issue": "specific SEO problem or 'OK'",
  "top_problem": "The single biggest issue (1 sentence)",
  "business_impact": "How this problem costs them money (1 sentence)",
  "recommended_fix": "What we would do to fix it (1 sentence)"
}`, 'Site Auditor');

  try {
    return JSON.parse(raw);
  } catch {
    return { score: 50, top_problem: 'Could not fully audit', recommended_fix: 'Manual review needed' };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: FIND CONTACT — Get their email via grounding
// ═══════════════════════════════════════════════════════════════════════
async function findContact(business) {
  const models = await getModelsForRole('scanner');
  const raw = await smartCall(models, `Find the contact email for this business:
Name: ${business.name}
Website: ${business.website || 'unknown'}
Location: ${business.location}

Search their website, Google, and any directories for their email address.
Look for: contact page, about page, footer, Google Maps listing.

Return JSON:
{
  "email": "their@email.com or null if not found",
  "source": "where you found it (contact page, Google Maps, etc)",
  "owner_name": "owner/manager name if findable, or null"
}`, 'Contact Finder');

  try {
    return JSON.parse(raw);
  } catch {
    return { email: null, source: null, owner_name: null };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 4: DRAFT EMAIL — Personalized, human, data-driven
// ═══════════════════════════════════════════════════════════════════════
async function draftEmail(business, audit, contact) {
  const models = await getModelsForRole('link_pitcher');
  const raw = await smartCall(models, `You are writing a cold email that MUST get a reply. Not a "nice" email — a COMPELLING one.

YOU ARE: Karm Joshi, founder of FourIQ Tech — we build high-performance websites for businesses.
TARGET: ${business.name} (${business.niche}) in ${business.location}
THEIR WEBSITE: ${business.website}
THEIR BIGGEST PROBLEM: ${audit.top_problem || 'slow/outdated website'}
MONEY THEY'RE LOSING: ${audit.business_impact || 'losing customers to competitors'}
THEIR AUDIT SCORE: ${audit.score || '?'}/100
CONTACT NAME: ${contact.owner_name || 'there'}

═══ THE PSYCHOLOGY OF EMAILS THAT GET REPLIES ═══

The email must create a "gap" — show them something they didn't know about their own business that's costing them money RIGHT NOW. Then offer to close that gap for free.

STRUCTURE (follow exactly):
1. HOOK (first line): A specific, surprising fact about THEIR website that they probably don't know. Not generic — something that makes them think "wait, really?"
2. COST (1 sentence): Translate that problem into lost revenue/customers. Use a number.
3. PROOF (1 sentence): Show you actually looked at their site (mention a specific page, element, or issue)
4. OFFER (1 sentence): Offer something free and low-commitment (not "let's hop on a call")
5. SIGN OFF: Just your name. No "looking forward to hearing from you."

TOTAL LENGTH: 4-6 sentences. Under 80 words. That's it.

═══ RULES ═══
- NO: "I hope this finds you well"
- NO: "I came across your website"  
- NO: "In today's digital world"
- NO: "I'd love to hop on a quick call"
- NO: compliments about their business
- NO: explaining who you are or what you do
- NO: multiple CTAs or questions
- YES: One specific problem + one specific number + one free offer
- YES: Sound like a text message from a smart friend, not a sales pitch

═══ EXAMPLES OF EMAILS THAT GET 40%+ REPLY RATES ═══

Example 1:
"Hey Mike — your homepage loads in 8.2 seconds on mobile. Google's data shows that 53% of visitors leave after 3 seconds, so you're probably losing half your traffic before they see anything. I recorded a 2-minute Loom showing the exact 3 images causing it. Want me to send it over? — Karm"

Example 2:
"Hey Sarah — I ran your site through Google's speed test and it scored 23/100 on mobile. For a dentist in Austin, that means when someone searches 'dentist near me' on their phone, Google is literally pushing your competitors above you because of load time alone. I can show you the specific fix (it's one image file) — want me to send a screenshot? — Karm"

Example 3:
"Hey — quick heads up: ${business.name}'s site is showing a 'Not Secure' warning on Chrome. About 85% of people won't fill out a contact form on a site with that warning. The fix takes about 10 minutes. Want me to send you the steps? — Karm"

NOW WRITE THE EMAIL FOR ${business.name}. Make it impossible to ignore.

Return JSON:
{ "subject": "short, curiosity-driven subject (under 6 words, no caps lock, no emoji)", "body": "the email body" }`, 'Email Drafter');

  try {
    return JSON.parse(raw);
  } catch {
    return { subject: `Quick note about ${business.name}`, body: raw || '' };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 5: STORE — Save lead to database
// ═══════════════════════════════════════════════════════════════════════
async function storeLead(business, audit, contact, email) {
  const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  
  try {
    await prisma.lead.create({
      data: {
        id: leadId,
        businessName: business.name,
        niche: business.niche || 'unknown',
        location: business.location || 'unknown',
        source: 'ai-hunter-v5',
        website: business.website || null,
        contactEmail: contact.email || null,
        problemTitle: audit.top_problem || null,
        problemDetail: audit.business_impact || null,
        businessImpact: audit.recommended_fix || null,
        confidence: audit.score ? String(audit.score) : null,
        status: contact.email ? 'drafted' : 'collected',
        auditScore: audit.score || null,
        seoIssues: { speed: audit.speed_issue, design: audit.design_issue, mobile: audit.mobile_issue, seo: audit.seo_issue },
        collectedAt: new Date(),
        lastTouchedAt: new Date(),
      }
    });

    // Store draft email if we have contact
    if (contact.email && email) {
      await prisma.draftEmail.create({
        data: {
          id: `email-${leadId}`,
          leadId,
          subject: email.subject || 'Website improvement opportunity',
          angle: audit.top_problem || 'general',
          sentFrom: 'hello@fouriqtech.com',
          body: email.body || '',
          deliveryStatus: 'draft',
        }
      });
    }

    console.log(`   ✅ Stored: ${business.name} (score: ${audit.score}/100)`);
    return leadId;
  } catch (e) {
    console.error(`   ❌ Store failed: ${e.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const niche = args[0] || 'dental clinics in Houston';
  const count = parseInt(args[1]) || 5;

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🕵️ LEAD HUNTER v5 — Gemini Grounding (No Puppeteer)      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`🎯 Niche: "${niche}"`);
  console.log(`📊 Target: ${count} leads`);
  console.log(`🔑 API Keys: ${getApiKeyCount()}\n`);

  if (getApiKeyCount() === 0) {
    console.error('❌ No API keys.');
    process.exit(1);
  }

  // Phase 1: Find businesses
  const businesses = await findBusinesses(niche, count);
  if (businesses.length === 0) {
    console.log('\n❌ No businesses found. Try a different niche.');
    process.exit(1);
  }

  let stored = 0;

  // Process each business
  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 [${i + 1}/${businesses.length}] ${biz.name}`);
    
    // Phase 2: Audit
    const audit = await auditWebsite(biz);
    await sleep(3000);
    
    // Phase 3: Find contact
    const contact = await findContact(biz);
    await sleep(3000);
    
    // Phase 4: Draft email (only if we have contact)
    let email = null;
    if (contact.email) {
      email = await draftEmail(biz, audit, contact);
      await sleep(3000);
    } else {
      console.log(`   ⚠️ No email found — lead saved without draft`);
    }
    
    // Phase 5: Store
    const id = await storeLead(biz, audit, contact, email);
    if (id) stored++;
  }

  await logActivity('🕵️', 'outreach', `Lead Hunter: Found ${stored} leads in "${niche}"`, 'info');

  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║  📋 LEAD HUNTER — COMPLETE                                 ║`);
  console.log(`╠═══════════════════════════════════════════════════════════╣`);
  console.log(`║  🎯 Niche: ${niche}`);
  console.log(`║  📊 Found: ${businesses.length} businesses`);
  console.log(`║  ✅ Stored: ${stored} leads (with audits + emails)`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('💥 FATAL:', err.message);
  process.exit(1);
});
