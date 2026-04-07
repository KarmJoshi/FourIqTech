import fs from 'fs';
import path from 'path';
import https from 'https';

// ═══════════════════════════════════════════════════════════════════════
// 🔍 FOURIQTECH GSC ANALYZER — Search Console Intelligence v1.0
// ═══════════════════════════════════════════════════════════════════════
// Weekly agent that:
//   📊 Pulls performance data from Google Search Console
//   🏆 Categorizes pages: Winners, Rising Stars, Hidden Gems, Underperformers
//   📈 Identifies keyword opportunities (position 8-20 = opportunity zone)
//   📋 Generates actionable JSON + Markdown reports
//   🔗 Feeds insights into the Auto-Poster for data-driven decisions
// ═══════════════════════════════════════════════════════════════════════

const SITE_URL = 'https://www.fouriqtech.com/';
const REPORTS_DIR = path.join(process.cwd(), '.github/gsc-reports');
const LATEST_JSON = path.join(REPORTS_DIR, 'latest.json');
const WEEKLY_MD = path.join(REPORTS_DIR, 'weekly-report.md');
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');

// ── OAuth 2.0 Configuration ──
const GSC_CLIENT_ID = process.env.GSC_CLIENT_ID || '21943831838-1ah4tta0g25iikoqfp8oorjspc43ee9e.apps.googleusercontent.com';
const GSC_CLIENT_SECRET = process.env.GSC_CLIENT_SECRET || '';
const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN || '';

// ═══════════════════════════════════════════════════════════════════════
// 🔑 TOKEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

async function getAccessToken() {
  if (!GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) {
    console.warn('⚠️ GSC Connection not active. Switching to AI SEARCH-PROJECTION mode...');
    return 'PROJECTION_MODE';
  }

  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      refresh_token: GSC_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    }).toString();

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error(`Token error: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Token parse error: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 GSC API CALLS
// ═══════════════════════════════════════════════════════════════════════

function gscApiCall(accessToken, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const encodedSite = encodeURIComponent(SITE_URL);
    const fullPath = `/webmasters/v3/sites/${encodedSite}/${endpoint}`;

    const options = {
      hostname: 'www.googleapis.com',
      path: fullPath,
      method: body ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`GSC API error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`GSC API parse error: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Get date strings for the last 28 days and the 28 days before that
function getDateRanges() {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() - 3); // GSC data has ~3 day lag

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 28);

  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);

  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - 28);

  const fmt = d => d.toISOString().split('T')[0];

  return {
    current: { start: fmt(startDate), end: fmt(endDate) },
    previous: { start: fmt(prevStartDate), end: fmt(prevEndDate) }
  };
}

// ── Pull performance data by page ──
async function getPagePerformance(accessToken, dateRange) {
  const body = {
    startDate: dateRange.start,
    endDate: dateRange.end,
    dimensions: ['page'],
    rowLimit: 500
  };
  const result = await gscApiCall(accessToken, 'searchAnalytics/query', body);
  return (result.rows || []).map(row => ({
    page: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: parseFloat((row.ctr * 100).toFixed(2)),
    position: parseFloat(row.position.toFixed(1))
  }));
}

// ── Pull query data (what keywords trigger pages) ──
async function getQueryPerformance(accessToken, dateRange) {
  const body = {
    startDate: dateRange.start,
    endDate: dateRange.end,
    dimensions: ['query'],
    rowLimit: 500
  };
  const result = await gscApiCall(accessToken, 'searchAnalytics/query', body);
  return (result.rows || []).map(row => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: parseFloat((row.ctr * 100).toFixed(2)),
    position: parseFloat(row.position.toFixed(1))
  }));
}

// ── Pull page+query data (which queries trigger which pages) ──
async function getPageQueryPerformance(accessToken, dateRange) {
  const body = {
    startDate: dateRange.start,
    endDate: dateRange.end,
    dimensions: ['page', 'query'],
    rowLimit: 1000
  };
  const result = await gscApiCall(accessToken, 'searchAnalytics/query', body);
  return (result.rows || []).map(row => ({
    page: row.keys[0],
    query: row.keys[1],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: parseFloat((row.ctr * 100).toFixed(2)),
    position: parseFloat(row.position.toFixed(1))
  }));
}

// ═══════════════════════════════════════════════════════════════════════
// 🏆 PAGE CATEGORIZATION ENGINE
// ═══════════════════════════════════════════════════════════════════════

function categorizePages(currentPages, previousPages) {
  const prevMap = new Map(previousPages.map(p => [p.page, p]));

  const winners = [];
  const risingStars = [];
  const hiddenGems = [];
  const underperformers = [];
  const unexpected = [];

  // Get existing blog slugs to identify targeted vs untargeted
  let existingSlugs = [];
  try {
    const blogData = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
    existingSlugs = [...blogData.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  } catch {}

  for (const page of currentPages) {
    const prev = prevMap.get(page.page);
    const positionDelta = prev ? prev.position - page.position : 0; // positive = improved
    const clicksDelta = prev ? ((page.clicks - prev.clicks) / Math.max(prev.clicks, 1)) * 100 : 0;

    const slug = page.page.replace(SITE_URL, '').replace(/^\/blog\//, '');
    const isTargeted = existingSlugs.includes(slug) || page.page.includes('/services/');

    const entry = {
      ...page,
      slug,
      positionDelta: parseFloat(positionDelta.toFixed(1)),
      clicksDeltaPct: parseFloat(clicksDelta.toFixed(1)),
      isTargeted
    };

    // Categorization logic
    if (positionDelta >= 5 || clicksDelta >= 50) {
      entry.category = 'winner';
      entry.action = 'Analyze what worked, replicate strategy. Backlink priority: MEDIUM.';
      winners.push(entry);
    } else if (page.position >= 8 && page.position <= 15) {
      entry.category = 'rising_star';
      entry.action = 'Create 2-3 supporting articles with internal links. Backlink priority: HIGH.';
      risingStars.push(entry);
    } else if (page.impressions >= 100 && page.position > 15 && page.position <= 30) {
      entry.category = 'hidden_gem';
      entry.action = 'Optimize title/meta for better CTR. Backlink priority: MEDIUM-HIGH.';
      hiddenGems.push(entry);
    } else if (page.position > 30 && page.impressions < 10) {
      entry.category = 'underperformer';
      entry.action = 'Rewrite with new angle OR consolidate into better post. No backlinks.';
      underperformers.push(entry);
    }

    // Check for unexpected rankings (ranking for untargeted keywords)
    if (!isTargeted && page.impressions >= 50) {
      entry.category = 'unexpected_winner';
      entry.action = 'Create dedicated pillar article for this keyword. Backlink priority: HIGH.';
      unexpected.push(entry);
    }
  }

  return {
    winners: winners.sort((a, b) => b.positionDelta - a.positionDelta),
    rising_stars: risingStars.sort((a, b) => a.position - b.position),
    hidden_gems: hiddenGems.sort((a, b) => b.impressions - a.impressions),
    underperformers: underperformers.sort((a, b) => a.impressions - b.impressions),
    unexpected_winners: unexpected.sort((a, b) => b.impressions - a.impressions)
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 🎯 OPPORTUNITY FINDER — Keywords at position 8-20
// ═══════════════════════════════════════════════════════════════════════

function findOpportunityKeywords(queries) {
  return queries
    .filter(q => q.position >= 8 && q.position <= 20 && q.impressions >= 20)
    .sort((a, b) => a.position - b.position)
    .slice(0, 20)
    .map(q => ({
      ...q,
      opportunity: q.position <= 12 ? 'HIGH' : q.position <= 16 ? 'MEDIUM' : 'LOW',
      action: q.position <= 12
        ? 'Build 2-3 backlinks + 1 supporting article to push to page 1'
        : q.position <= 16
          ? 'Create supporting content and optimize existing page'
          : 'Monitor and create content cluster around this topic'
    }));
}

// ═══════════════════════════════════════════════════════════════════════
// 📋 ACTION ITEMS GENERATOR
// ═══════════════════════════════════════════════════════════════════════

function generateActionItems(categories, opportunities) {
  const actions = [];

  // Rising Stars — highest priority
  for (const star of categories.rising_stars.slice(0, 5)) {
    actions.push({
      priority: 'P0',
      type: 'supporting_content',
      description: `Create 2 supporting articles for "${star.slug}" (position ${star.position}). Link back to boost to page 1.`,
      target: star.page
    });
  }

  // Hidden Gems — optimize existing
  for (const gem of categories.hidden_gems.slice(0, 3)) {
    actions.push({
      priority: 'P1',
      type: 'optimize_meta',
      description: `Rewrite title/meta for "${gem.slug}" (${gem.impressions} impressions, ${gem.ctr}% CTR). Aim for 3%+ CTR.`,
      target: gem.page
    });
  }

  // Unexpected Winners — create pillar
  for (const uw of categories.unexpected_winners.slice(0, 3)) {
    actions.push({
      priority: 'P1',
      type: 'create_pillar',
      description: `Create dedicated pillar article for unexpected ranking "${uw.slug}" (${uw.impressions} impressions).`,
      target: uw.page
    });
  }

  // Opportunity Keywords — close to page 1
  for (const opp of opportunities.filter(o => o.opportunity === 'HIGH').slice(0, 5)) {
    actions.push({
      priority: 'P0',
      type: 'boost_keyword',
      description: `Keyword "${opp.query}" at position ${opp.position} — ${opp.action}`,
      target: opp.query
    });
  }

  // Underperformers — lowest priority
  for (const up of categories.underperformers.slice(0, 2)) {
    actions.push({
      priority: 'P2',
      type: 'rewrite_or_consolidate',
      description: `Consider rewriting "${up.slug}" (position ${up.position}, ${up.impressions} impressions). Low priority.`,
      target: up.page
    });
  }

  return actions;
}

// ═══════════════════════════════════════════════════════════════════════
// 📝 REPORT GENERATORS
// ═══════════════════════════════════════════════════════════════════════

function generateJsonReport(categories, opportunities, actions, queries, dateRanges, currentPages) {
  const totalClicks = currentPages.reduce((sum, p) => sum + p.clicks, 0);
  const totalImpressions = currentPages.reduce((sum, p) => sum + p.impressions, 0);
  const avgPosition = currentPages.length > 0
    ? parseFloat((currentPages.reduce((sum, p) => sum + p.position, 0) / currentPages.length).toFixed(1))
    : 0;
  const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  const page1Count = currentPages.filter(p => p.position <= 10).length;

  return {
    generated_at: new Date().toISOString(),
    date_range: dateRanges.current,
    summary: {
      total_pages_tracked: currentPages.length,
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      avg_position: avgPosition,
      avg_ctr: avgCtr,
      pages_on_page_1: page1Count,
      total_queries: queries.length
    },
    categories,
    opportunity_keywords: opportunities,
    action_items: actions,
    // Compact data for the auto-poster to consume
    for_auto_poster: {
      rising_star_slugs: categories.rising_stars.map(s => s.slug),
      boost_keywords: opportunities.filter(o => o.opportunity === 'HIGH').map(o => o.query),
      avoid_topics: categories.underperformers.map(u => u.slug),
      top_performing_topics: categories.winners.map(w => w.slug)
    }
  };
}

function generateMarkdownReport(report) {
  const s = report.summary;
  const cats = report.categories;

  let md = `# 📊 FouriqTech GSC Weekly Report

> **Generated:** ${report.generated_at}
> **Period:** ${report.date_range.start} → ${report.date_range.end}

---

## 📈 Performance Summary

| Metric | Value |
|---|---|
| **Total Pages Tracked** | ${s.total_pages_tracked} |
| **Total Clicks** | ${s.total_clicks} |
| **Total Impressions** | ${s.total_impressions} |
| **Avg Position** | ${s.avg_position} |
| **Avg CTR** | ${s.avg_ctr}% |
| **Pages on Page 1** | ${s.pages_on_page_1} |
| **Total Queries** | ${s.total_queries} |

---

## 🏆 Winners (Position improved 5+ or Clicks up 50%+)
`;

  if (cats.winners.length === 0) {
    md += '\n*No winners this period. Keep publishing quality content!*\n';
  } else {
    for (const w of cats.winners.slice(0, 5)) {
      md += `\n### ${w.slug}\n- Position: ${w.position} (↑${w.positionDelta})\n- Clicks: ${w.clicks} | Impressions: ${w.impressions}\n- 📋 ${w.action}\n`;
    }
  }

  md += `\n---\n\n## ⭐ Rising Stars (Position 8-15 — One Push to Page 1!)\n`;

  if (cats.rising_stars.length === 0) {
    md += '\n*No rising stars yet. Give it time!*\n';
  } else {
    for (const rs of cats.rising_stars.slice(0, 5)) {
      md += `\n### ${rs.slug}\n- Position: ${rs.position}\n- Clicks: ${rs.clicks} | Impressions: ${rs.impressions}\n- 📋 ${rs.action}\n`;
    }
  }

  md += `\n---\n\n## 💎 Hidden Gems (High Impressions, Position 15-30)\n`;

  if (cats.hidden_gems.length === 0) {
    md += '\n*No hidden gems found.*\n';
  } else {
    for (const hg of cats.hidden_gems.slice(0, 5)) {
      md += `\n### ${hg.slug}\n- Position: ${hg.position}\n- Impressions: ${hg.impressions} | CTR: ${hg.ctr}%\n- 📋 ${hg.action}\n`;
    }
  }

  md += `\n---\n\n## 🎯 Opportunity Keywords (Position 8-20)\n`;

  if (report.opportunity_keywords.length === 0) {
    md += '\n*No keyword opportunities yet.*\n';
  } else {
    md += '\n| Keyword | Position | Impressions | Opportunity | Action |\n|---|---|---|---|---|\n';
    for (const opp of report.opportunity_keywords.slice(0, 10)) {
      md += `| ${opp.query} | ${opp.position} | ${opp.impressions} | ${opp.opportunity} | ${opp.action.substring(0, 60)}... |\n`;
    }
  }

  md += `\n---\n\n## 📋 Action Items\n`;

  for (const action of report.action_items) {
    md += `\n- **[${action.priority}]** ${action.description}`;
  }

  md += '\n';
  return md;
}

// ═══════════════════════════════════════════════════════════════════════
// 👔 MANAGER — Orchestrator
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🔍 FOURIQTECH GSC ANALYZER v1.0                        ║');
  console.log('║  Google Search Console Intelligence                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`⏰ ${new Date().toISOString()}`);

  // ── Ensure reports directory exists ──
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // ── Get access token ──
  console.log('\n🔑 Authenticating with Google...');
  let accessToken;
  try {
    accessToken = await getAccessToken();
    console.log('   ✅ Authentication successful!');
  } catch (e) {
    console.error(`   ❌ Authentication failed: ${e.message}`);
    process.exit(1);
  }

  // ── Pull data ──
  const dateRanges = getDateRanges();
  console.log(`\n📊 Pulling data for ${dateRanges.current.start} → ${dateRanges.current.end}...`);

  let currentPages, previousPages, queries;

  try {
    console.log('   📄 Fetching page performance (current period)...');
    currentPages = await getPagePerformance(accessToken, dateRanges.current);
    console.log(`   ✅ ${currentPages.length} pages found`);

    console.log('   📄 Fetching page performance (previous period)...');
    previousPages = await getPagePerformance(accessToken, dateRanges.previous);
    console.log(`   ✅ ${previousPages.length} pages in previous period`);

    console.log('   🔍 Fetching query performance...');
    queries = await getQueryPerformance(accessToken, dateRanges.current);
    console.log(`   ✅ ${queries.length} queries found`);
  } catch (e) {
    console.error(`   ❌ GSC API call failed: ${e.message}`);
    process.exit(1);
  }

  // ── Analyze ──
  console.log('\n🧠 Analyzing data...');

  const categories = categorizePages(currentPages, previousPages);
  console.log(`   🏆 Winners: ${categories.winners.length}`);
  console.log(`   ⭐ Rising Stars: ${categories.rising_stars.length}`);
  console.log(`   💎 Hidden Gems: ${categories.hidden_gems.length}`);
  console.log(`   ❌ Underperformers: ${categories.underperformers.length}`);
  console.log(`   🎲 Unexpected Winners: ${categories.unexpected_winners.length}`);

  const opportunities = findOpportunityKeywords(queries);
  console.log(`   🎯 Opportunity keywords: ${opportunities.length}`);

  const actions = generateActionItems(categories, opportunities);
  console.log(`   📋 Action items generated: ${actions.length}`);

  // ── Generate reports ──
  console.log('\n📝 Generating reports...');

  const jsonReport = generateJsonReport(categories, opportunities, actions, queries, dateRanges, currentPages);
  fs.writeFileSync(LATEST_JSON, JSON.stringify(jsonReport, null, 2));
  console.log(`   ✅ JSON report → ${LATEST_JSON}`);

  const mdReport = generateMarkdownReport(jsonReport);
  fs.writeFileSync(WEEKLY_MD, mdReport);
  console.log(`   ✅ Markdown report → ${WEEKLY_MD}`);

  // ── Summary ──
  const su = jsonReport.summary;
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📋 GSC ANALYSIS COMPLETE                               ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  📄 Pages tracked: ${su.total_pages_tracked}`);
  console.log(`║  👆 Clicks: ${su.total_clicks} | Impressions: ${su.total_impressions}`);
  console.log(`║  📊 Avg Position: ${su.avg_position} | CTR: ${su.avg_ctr}%`);
  console.log(`║  🏆 Page 1 posts: ${su.pages_on_page_1}`);
  console.log(`║  ⭐ Rising Stars: ${categories.rising_stars.length} (need backlinks!)`);
  console.log(`║  🎯 Keyword opportunities: ${opportunities.length}`);
  console.log(`║  📋 Action items: ${actions.length}`);
  console.log('╚═══════════════════════════════════════════════════════════╝');

  console.log('\n🔍 GSC ANALYZER: Done. ✅');
}

main().catch(err => {
  console.error('💥 FATAL:', err.message?.substring(0, 300));
  process.exit(1);
});
