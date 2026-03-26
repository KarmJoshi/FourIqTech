import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), '.github');
const LEADS_CSV = path.join(OUTPUT_DIR, 'leads_database.csv');
const OUTREACH_CSV = path.join(OUTPUT_DIR, 'outreach_log.csv');
const TARGETS_JSON = path.join(OUTPUT_DIR, 'outreach_targets.json');
const CRAWL_LOG_JSON = path.join(OUTPUT_DIR, 'lead_crawl_log.json');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0 Safari/537.36';

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (!text) return [];
  const [headerLine, ...lines] = text.split(/\r?\n/);
  const headers = splitCsvLine(headerLine);
  return lines.filter(Boolean).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
}

function writeCsv(filePath, rows, headers) {
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCell(row[header] ?? '')).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function appendJsonLog(filePath, payload) {
  const current = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
  current.unshift(payload);
  fs.writeFileSync(filePath, `${JSON.stringify(current.slice(0, 200), null, 2)}\n`, 'utf8');
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function detectCms(html) {
  const lower = html.toLowerCase();
  if (lower.includes('wp-content') || lower.includes('wp-includes') || lower.includes('wordpress')) return 'WordPress';
  if (lower.includes('cdn.shopify.com') || lower.includes('shopify')) return 'Shopify';
  if (lower.includes('__next') || lower.includes('/_next/')) return 'Next.js';
  if (lower.includes('react') || lower.includes('/assets/index-')) return 'React';
  if (lower.includes('wix')) return 'Wix';
  return 'Custom/Unknown';
}

function extractEmails(html, sourceUrl) {
  const emails = new Set();
  const regex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,})/g;
  for (const match of html.matchAll(regex)) {
    const email = match[1].toLowerCase();
    if (
      email.includes('.png') ||
      email.includes('.jpg') ||
      email.includes('example.com') ||
      email.includes('sentry') ||
      email.includes('wixpress.com') ||
      email.includes('cloudflare') ||
      email.includes('shopify.com') ||
      email.includes('noreply') ||
      email.includes('no-reply')
    ) continue;
    emails.add(email);
  }
  const domain = getDomain(sourceUrl);
  return [...emails].sort((a, b) => emailScore(b, domain) - emailScore(a, domain));
}

function emailScore(email, domain) {
  let score = 0;
  const emailDomain = email.split('@')[1] || '';
  if (domain && emailDomain === domain) score += 20;
  if (domain && emailDomain.endsWith(`.${domain}`)) score += 8;
  if (/hello|info|contact|enquiries|booking|bookings|support|reservations/.test(email)) score += 5;
  if (/noreply|no-reply|privacy|abuse|example|sentry|wixpress|shopify|cloudflare/.test(email)) score -= 50;
  if (domain && emailDomain !== domain && !emailDomain.endsWith(`.${domain}`)) score -= 15;
  return score;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.text();
}

function makeProblem(siteHtml, competitorHtml) {
  const siteLower = siteHtml.toLowerCase();
  const competitorLower = competitorHtml.toLowerCase();

  if ((siteLower.includes('/assets/index-') || siteLower.includes('__next') || siteLower.includes('react')) && !(competitorLower.includes('/assets/index-') || competitorLower.includes('__next'))) {
    return {
      problemTitle: 'First screen may rely too heavily on client-side boot',
      problemDetail: 'The site appears to depend on a JavaScript-heavy front-end before the interface feels fully settled.',
      businessImpact: 'That can soften first impression on mobile during the exact moment a new visitor is deciding whether the brand feels polished and trustworthy.',
      likelyFix: 'Stabilize the opening viewport earlier, reduce client-side boot work, and tighten asset delivery for the first screen.',
      confidence: 'medium',
    };
  }

  if (!siteLower.includes('mailto:') && competitorLower.includes('mailto:')) {
    return {
      problemTitle: 'Inquiry path looks less immediate than the competitor',
      problemDetail: 'The target site appears to hide contact signals more than the competitor experience does.',
      businessImpact: 'Potential clients may delay contacting even when they are interested, simply because the next step is not obvious enough.',
      likelyFix: 'Bring contact cues and trust signals higher in the page flow and reduce friction in the inquiry path.',
      confidence: 'low',
    };
  }

  return {
    problemTitle: 'Digital experience still has room to feel more immediate',
    problemDetail: 'The site communicates the business, but the experience could feel more direct, polished, or conversion-ready for first-time visitors.',
    businessImpact: 'Small friction in trust or clarity can reduce inquiry intent when prospects compare multiple providers.',
    likelyFix: 'Tighten first-screen clarity, trust cues, and the path to inquiry before changing the broader brand presentation.',
    confidence: 'low',
  };
}

function makeEmailDraft(lead) {
  return {
    subject: 'one thing I noticed on your site',
    body: `Hi,\n\nI spent a little time on ${lead.website.replace(/^https?:\/\//, '')} and one thing stood out: ${lead.problemTitle.toLowerCase()}.\n\n${lead.businessImpact}\n\nFrom what I can see, this is likely tied to ${lead.likelyFix.charAt(0).toLowerCase()}${lead.likelyFix.slice(1)}\n\nIf helpful, I can send the 3 changes I would prioritize first based on the current setup.\n\nBest,\nKarm Joshi\nFounder, FourIqTech`,
  };
}

function loadSeeds() {
  const csvRows = parseCsv(LEADS_CSV).map((row) => ({
    companyName: row['Company Name'] || row.company_name || '',
    website: row.Website || row.website || '',
    email: row.Email || row.email || '',
    city: row.City || row.city || '',
    competitorUrl: row['Competitor URL'] || row.competitor_url || '',
    niche: row.Niche || row.niche || '',
  }));

  const jsonRows = fs.existsSync(TARGETS_JSON)
    ? JSON.parse(fs.readFileSync(TARGETS_JSON, 'utf8')).map((row) => ({
        companyName: row.company_name || '',
        website: row.website || '',
        email: row.email || '',
        city: row.city || '',
        competitorUrl: row.competitor_url || '',
        niche: row.niche || '',
      }))
    : [];

  const merged = new Map();
  for (const row of [...csvRows, ...jsonRows]) {
    if (!row.website) continue;
    merged.set(row.website, row);
  }
  return [...merged.values()];
}

async function enrichLead(seed) {
  const websiteHtml = await fetchText(seed.website);
  const competitorHtml = seed.competitorUrl ? await fetchText(seed.competitorUrl).catch(() => '') : '';
  const emails = extractEmails(websiteHtml, seed.website);
  const cms = detectCms(websiteHtml);
  const email = emails[0] || seed.email || '';
  const competitorName = seed.competitorUrl ? getDomain(seed.competitorUrl).split('.')[0] : '';
  const problem = makeProblem(websiteHtml, competitorHtml);
  const draft = makeEmailDraft({ website: seed.website, ...problem });

  return {
    companyName: seed.companyName || getDomain(seed.website),
    website: seed.website,
    email,
    cms,
    city: seed.city || '',
    competitorUrl: seed.competitorUrl || '',
    competitorName,
    niche: seed.niche || '',
    source: 'Existing lead seed + public crawl',
    ...problem,
    draftSubject: draft.subject,
    draftBody: draft.body,
  };
}

async function main() {
  ensureOutputDir();
  const seeds = loadSeeds();
  if (!seeds.length) {
    console.log('No seeded leads found. Add websites to .github/leads_database.csv or .github/outreach_targets.json first.');
    process.exit(0);
  }

  console.log(`🔎 Enriching ${seeds.length} seeded lead(s) from public websites...`);
  const enriched = [];

  for (const seed of seeds) {
    try {
      console.log(`🌐 Crawling ${seed.website}`);
      const row = await enrichLead(seed);
      enriched.push(row);
      console.log(`   ✅ ${row.companyName} | ${row.email || 'no email found'} | ${row.problemTitle}`);
    } catch (error) {
      console.log(`   ⚠️ Skipped ${seed.website}: ${error.message}`);
    }
  }

  writeCsv(LEADS_CSV, enriched.map((row) => ({
    'Company Name': row.companyName,
    Website: row.website,
    Email: row.email,
    CMS: row.cms,
    City: row.city,
    'Competitor URL': row.competitorUrl,
    Niche: row.niche,
    Source: row.source,
    'Problem Title': row.problemTitle,
    'Problem Detail': row.problemDetail,
    'Business Impact': row.businessImpact,
    'Likely Fix': row.likelyFix,
    Confidence: row.confidence,
    'Draft Subject': row.draftSubject,
    'Collected At': new Date().toISOString(),
  })), [
    'Company Name',
    'Website',
    'Email',
    'CMS',
    'City',
    'Competitor URL',
    'Niche',
    'Source',
    'Problem Title',
    'Problem Detail',
    'Business Impact',
    'Likely Fix',
    'Confidence',
    'Draft Subject',
    'Collected At',
  ]);

  fs.writeFileSync(TARGETS_JSON, `${JSON.stringify(enriched.map((row) => ({
    company_name: row.companyName,
    website: row.website,
    email: row.email,
    niche: row.niche,
    city: row.city,
    source: row.source,
    competitor_url: row.competitorUrl,
    competitor_name: row.competitorName,
    problem_title: row.problemTitle,
    problem_detail: row.problemDetail,
    business_impact: row.businessImpact,
    likely_fix: row.likelyFix,
    draft_subject: row.draftSubject,
    draft_body: row.draftBody,
  })), null, 2)}\n`, 'utf8');

  writeCsv(OUTREACH_CSV, enriched.map((row) => ({
    Date: new Date().toISOString(),
    Company: row.companyName,
    Email: row.email,
    Subject: row.draftSubject,
    Status: 'draft_prepared',
    Details: row.problemTitle,
  })), ['Date', 'Company', 'Email', 'Subject', 'Status', 'Details']);

  appendJsonLog(CRAWL_LOG_JSON, {
    ran_at: new Date().toISOString(),
    seeded: seeds.length,
    enriched: enriched.length,
  });

  console.log(`\n✅ Updated:`);
  console.log(`- ${LEADS_CSV}`);
  console.log(`- ${TARGETS_JSON}`);
  console.log(`- ${OUTREACH_CSV}`);
  console.log(`- ${CRAWL_LOG_JSON}`);
  console.log('\nReview draft emails before sending.');
}

main().catch((error) => {
  console.error('💥 Crawl failed:', error.message);
  process.exitCode = 1;
});
