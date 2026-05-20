import dotenv from 'dotenv';
dotenv.config();
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';

// ═══════════════════════════════════════════════════════════════════════
// 📊 GSC DATA INGESTION — Pulls Search Console data into memory tables
// ═══════════════════════════════════════════════════════════════════════
// Runs daily. Pulls page-level and query-level metrics from GSC API.
// Stores in: GscDailySnapshot, GscPageMetric, GscQueryMetric
// Then generates: GscInsight (rising, declining, opportunities)
// ═══════════════════════════════════════════════════════════════════════

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GSC_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GSC_CLIENT_SECRET = process.env.GSC_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;
const SITE_URL = process.env.WEBSITE_URL || 'https://www.fouriqtech.com';

// ═══════════════════════════════════════════════════════════════════════
// AUTH — Get access token from refresh token
// ═══════════════════════════════════════════════════════════════════════
async function getAccessToken() {
  if (!GSC_REFRESH_TOKEN || !GSC_CLIENT_ID || !GSC_CLIENT_SECRET) {
    console.log('   ⚠️ GSC credentials not configured. Skipping live data pull.');
    return null;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      refresh_token: GSC_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    console.error('   ❌ Failed to get access token:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

// ═══════════════════════════════════════════════════════════════════════
// FETCH — Pull data from GSC API
// ═══════════════════════════════════════════════════════════════════════
async function fetchGscData(accessToken, startDate, endDate, dimensions = ['page']) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: 1000,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error(`   ❌ GSC API error: ${err.substring(0, 200)}`);
    return [];
  }

  const data = await response.json();
  return data.rows || [];
}

// ═══════════════════════════════════════════════════════════════════════
// STORE — Save data to database
// ═══════════════════════════════════════════════════════════════════════
async function storeSnapshot(date, pageRows, queryRows) {
  // Calculate totals
  const totalClicks = pageRows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = pageRows.reduce((s, r) => s + r.impressions, 0);
  const avgPosition = pageRows.length > 0 ? pageRows.reduce((s, r) => s + r.position, 0) / pageRows.length : 0;
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

  // Daily snapshot
  await prisma.gscDailySnapshot.upsert({
    where: { date: new Date(date) },
    update: { totalClicks, totalImpressions, avgPosition, avgCtr, pageCount: pageRows.length, topPages: pageRows.slice(0, 20), topQueries: queryRows.slice(0, 20) },
    create: { date: new Date(date), totalClicks, totalImpressions, avgPosition, avgCtr, pageCount: pageRows.length, topPages: pageRows.slice(0, 20), topQueries: queryRows.slice(0, 20) },
  });

  // Page-level metrics
  for (const row of pageRows) {
    const pageUrl = row.keys?.[0] || row.page || '';
    if (!pageUrl) continue;
    
    await prisma.gscPageMetric.upsert({
      where: { date_pageUrl: { date: new Date(date), pageUrl } },
      update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
      create: { date: new Date(date), pageUrl, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
    }).catch(() => {}); // Skip duplicates silently
  }

  // Query-level metrics
  for (const row of queryRows) {
    const query = row.keys?.[0] || row.query || '';
    if (!query) continue;

    await prisma.gscQueryMetric.upsert({
      where: { date_query: { date: new Date(date), query } },
      update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position, pageUrl: row.keys?.[1] || null },
      create: { date: new Date(date), query, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position, pageUrl: row.keys?.[1] || null },
    }).catch(() => {});
  }

  console.log(`   ✅ Stored: ${pageRows.length} pages, ${queryRows.length} queries for ${date}`);
}

// ═══════════════════════════════════════════════════════════════════════
// INSIGHTS — Generate insights by comparing data over time
// ═══════════════════════════════════════════════════════════════════════
async function generateInsights() {
  console.log('\n🧠 Generating insights...');
  
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Get recent page metrics
  const recentPages = await prisma.gscPageMetric.findMany({
    where: { date: { gte: sevenDaysAgo } },
    orderBy: { date: 'desc' },
  });

  const olderPages = await prisma.gscPageMetric.findMany({
    where: { date: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
  });

  // Group by page
  const recentByPage = {};
  for (const m of recentPages) {
    if (!recentByPage[m.pageUrl]) recentByPage[m.pageUrl] = [];
    recentByPage[m.pageUrl].push(m);
  }

  const olderByPage = {};
  for (const m of olderPages) {
    if (!olderByPage[m.pageUrl]) olderByPage[m.pageUrl] = [];
    olderByPage[m.pageUrl].push(m);
  }

  const insights = [];

  for (const [pageUrl, metrics] of Object.entries(recentByPage)) {
    const avgRecent = {
      clicks: metrics.reduce((s, m) => s + m.clicks, 0) / metrics.length,
      impressions: metrics.reduce((s, m) => s + m.impressions, 0) / metrics.length,
      position: metrics.reduce((s, m) => s + m.position, 0) / metrics.length,
    };

    const olderMetrics = olderByPage[pageUrl] || [];
    if (olderMetrics.length === 0) {
      // New page appearing in search
      if (avgRecent.impressions > 10) {
        insights.push({
          type: 'new_keyword',
          pageUrl,
          insightText: `New page appearing in search: ${pageUrl} (${Math.round(avgRecent.impressions)} impressions/day, position ${avgRecent.position.toFixed(1)})`,
          metricsAfter: avgRecent,
          changePeriod: '7d',
          confidence: 0.8,
        });
      }
      continue;
    }

    const avgOlder = {
      clicks: olderMetrics.reduce((s, m) => s + m.clicks, 0) / olderMetrics.length,
      impressions: olderMetrics.reduce((s, m) => s + m.impressions, 0) / olderMetrics.length,
      position: olderMetrics.reduce((s, m) => s + m.position, 0) / olderMetrics.length,
    };

    const positionChange = avgOlder.position - avgRecent.position; // Positive = improved

    if (positionChange > 3) {
      insights.push({
        type: 'rising_star',
        pageUrl,
        insightText: `Rising: ${pageUrl} improved ${positionChange.toFixed(1)} positions (${avgOlder.position.toFixed(1)} → ${avgRecent.position.toFixed(1)})`,
        metricsBefore: avgOlder,
        metricsAfter: avgRecent,
        changePeriod: '7d',
        confidence: Math.min(0.9, positionChange / 10),
      });
    } else if (positionChange < -3) {
      insights.push({
        type: 'declining',
        pageUrl,
        insightText: `Declining: ${pageUrl} dropped ${Math.abs(positionChange).toFixed(1)} positions (${avgOlder.position.toFixed(1)} → ${avgRecent.position.toFixed(1)})`,
        metricsBefore: avgOlder,
        metricsAfter: avgRecent,
        changePeriod: '7d',
        confidence: Math.min(0.9, Math.abs(positionChange) / 10),
      });
    }

    // Opportunity: high impressions but low CTR
    if (avgRecent.impressions > 50 && avgRecent.position <= 20 && avgRecent.position > 5) {
      insights.push({
        type: 'opportunity',
        pageUrl,
        insightText: `Opportunity: ${pageUrl} has ${Math.round(avgRecent.impressions)} impressions at position ${avgRecent.position.toFixed(1)} — optimize title/description for better CTR`,
        metricsAfter: avgRecent,
        changePeriod: '7d',
        confidence: 0.7,
      });
    }
  }

  // Store insights
  for (const insight of insights) {
    await prisma.gscInsight.create({ data: insight }).catch(() => {});
  }

  console.log(`   ✅ Generated ${insights.length} insights`);
  return insights;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📊 GSC DATA INGESTION — Memory Update                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const accessToken = await getAccessToken();
  
  if (accessToken) {
    // Pull last 7 days of data
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`\n📥 Pulling GSC data: ${sevenDaysAgo} → ${today}`);
    
    const pageRows = await fetchGscData(accessToken, sevenDaysAgo, today, ['page']);
    const queryRows = await fetchGscData(accessToken, sevenDaysAgo, today, ['query']);
    
    console.log(`   📄 Pages: ${pageRows.length} | Queries: ${queryRows.length}`);
    
    if (pageRows.length > 0 || queryRows.length > 0) {
      await storeSnapshot(today, pageRows, queryRows);
    }
  } else {
    console.log('\n⚠️ No GSC access token. Using existing data for insights.');
  }

  // Generate insights from whatever data we have
  await generateInsights();

  // Update keyword memory from query data
  const recentQueries = await prisma.gscQueryMetric.findMany({
    where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    orderBy: { impressions: 'desc' },
    take: 50,
  });

  for (const q of recentQueries) {
    await prisma.keywordMemory.upsert({
      where: { keyword: q.query },
      update: { currentPosition: q.position, lastTargeted: new Date() },
      create: { keyword: q.query, currentPosition: q.position, bestPosition: q.position, status: q.position <= 10 ? 'ranked' : 'active' },
    }).catch(() => {});
  }

  console.log(`\n✅ GSC ingestion complete. ${recentQueries.length} keywords tracked.`);
  await prisma.$disconnect();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
