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
// ═══════════════════════════════════════════════════════════════════════
// PHASE 4: DRAFT EMAIL — Professional HTML email with visual audit
// ═══════════════════════════════════════════════════════════════════════
async function draftEmail(business, audit, contact) {
  const models = await getModelsForRole('link_pitcher');
  
  // Generate the email copy (plain text version for the AI to write)
  const raw = await smartCall(models, `Write a cold email for a local business owner. Keep it simple.

TARGET: ${business.name} (${business.niche}) in ${business.location}
WEBSITE: ${business.website}
PROBLEM: ${audit.top_problem || 'website issues'}
IMPACT: ${audit.business_impact || 'losing customers'}
SCORE: ${audit.score || '?'}/100
CONTACT: ${contact.owner_name || 'there'}

RULES:
- 3-4 sentences only
- Plain English (they're not tech people)
- Mention ONE specific problem you noticed on their site
- Explain how it costs them customers (not technical terms)
- Offer a free report showing what to fix
- NO jargon: no "SEO", "responsive", "SSL", "Core Web Vitals"
- Sound professional but friendly

Return JSON:
{ "subject": "short subject (under 8 words)", "body": "plain text email body", "problem_summary": "1 sentence problem for the visual card" }`, 'Email Drafter');

  let emailData = { subject: '', body: '', problem_summary: '' };
  try { emailData = JSON.parse(raw); } catch { emailData = { subject: `About ${business.name}'s website`, body: raw || '', problem_summary: audit.top_problem || '' }; }

  // Build professional HTML email
  const score = audit.score || 40;
  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 70 ? 'Fair' : score >= 40 ? 'Needs Work' : 'Poor';
  
  const issues = [
    audit.speed_issue && audit.speed_issue !== 'OK' ? `⚠️ ${audit.speed_issue}` : null,
    audit.design_issue && audit.design_issue !== 'OK' ? `⚠️ ${audit.design_issue}` : null,
    audit.mobile_issue && audit.mobile_issue !== 'OK' ? `⚠️ ${audit.mobile_issue}` : null,
    audit.seo_issue && audit.seo_issue !== 'OK' ? `⚠️ ${audit.seo_issue}` : null,
  ].filter(Boolean).slice(0, 3);

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

<!-- Header -->
<div style="background:#111;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">FourIQ Tech</h1>
  <p style="margin:4px 0 0;color:#888;font-size:12px;">Web Performance & Design Experts</p>
</div>

<!-- Body -->
<div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
  
  <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi ${contact.owner_name || 'there'},</p>
  
  <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 24px;">${emailData.body}</p>

  <!-- Score Card -->
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;">
    <p style="margin:0 0 8px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Website Health Score — ${business.name}</p>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <span style="font-size:36px;font-weight:700;color:${scoreColor};">${score}</span>
      <span style="font-size:14px;color:#666;">/100 — <strong style="color:${scoreColor};">${scoreLabel}</strong></span>
    </div>
    <div style="background:#e5e7eb;border-radius:99px;height:8px;overflow:hidden;">
      <div style="background:${scoreColor};height:100%;width:${score}%;border-radius:99px;"></div>
    </div>
    ${issues.length > 0 ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">${issues.map(i => `<p style="margin:6px 0;color:#555;font-size:13px;">${i}</p>`).join('')}</div>` : ''}
  </div>

  <p style="color:#333;font-size:15px;line-height:1.6;margin:24px 0 0;">I've put together a free one-page report showing exactly what to fix and how it'll help you get more customers. No strings attached.</p>

  <p style="color:#333;font-size:15px;line-height:1.6;margin:16px 0 0;"><strong>Want me to send it over?</strong></p>

</div>

<!-- Footer -->
<div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px;">
  <p style="margin:0;color:#333;font-size:14px;font-weight:600;">Karm Joshi</p>
  <p style="margin:2px 0 0;color:#666;font-size:13px;">Founder, FourIQ Tech</p>
  <p style="margin:8px 0 0;color:#888;font-size:12px;">
    🌐 <a href="https://www.fouriqtech.com" style="color:#2563eb;text-decoration:none;">fouriqtech.com</a> &nbsp;|&nbsp; 📞 +91 81403 71710
  </p>
</div>

</div>
</body>
</html>`;

  return { 
    subject: emailData.subject, 
    body: emailData.body, // Plain text version
    htmlBody, // Rich HTML version
    problem_summary: emailData.problem_summary 
  };
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
          body: email.htmlBody || email.body || '',
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
