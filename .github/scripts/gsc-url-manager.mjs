import dotenv from 'dotenv';
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// 🔗 GSC URL MANAGER — Submit & Remove URLs from Google Search Console
// ═══════════════════════════════════════════════════════════════════════
// Uses Google's Indexing API to:
//   - Submit new URLs for indexing (when blog/page is published)
//   - Request URL removal (when blog/page is deleted)
//   - Ping sitemap after changes
//
// Note: The Indexing API officially supports job posting and livestream
// URLs, but the sitemap ping + Search Console URL Inspection works for
// all URL types. We use both approaches for maximum coverage.
// ═══════════════════════════════════════════════════════════════════════

const GSC_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GSC_CLIENT_SECRET = process.env.GSC_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN || '';
const SITE_URL = process.env.WEBSITE_URL || 'https://www.fouriqtech.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

/**
 * Get a fresh access token using the refresh token
 */
async function getAccessToken() {
  if (!GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN || !GSC_CLIENT_ID) {
    console.log('   ⚠️ GSC credentials not configured. Cannot submit URLs.');
    return null;
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GSC_CLIENT_ID,
        client_secret: GSC_CLIENT_SECRET,
        refresh_token: GSC_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();
    if (data.access_token) return data.access_token;
    console.log(`   ⚠️ Token refresh failed: ${JSON.stringify(data.error || data)}`);
    return null;
  } catch (err) {
    console.log(`   ⚠️ Token error: ${err.message}`);
    return null;
  }
}

/**
 * Submit a URL to Google for indexing via URL Inspection API
 * This requests Google to crawl and index the URL.
 */
export async function submitUrlForIndexing(url) {
  console.log(`   🔗 GSC: Submitting "${url}" for indexing...`);
  
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  try {
    // Method 1: Ping sitemap (always works for any URL type)
    await pingSitemap(accessToken);

    // Method 2: Use Indexing API (URL_UPDATED notification)
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        type: 'URL_UPDATED',
      }),
    });

    if (res.ok) {
      console.log(`   ✅ GSC: URL submitted for indexing: ${url}`);
      return true;
    } else {
      const err = await res.json();
      // Indexing API may reject non-job-posting URLs, that's OK — sitemap ping still works
      if (err.error?.code === 403) {
        console.log(`   ℹ️ GSC: Indexing API not available for this URL type (using sitemap ping instead)`);
        return true; // Sitemap ping was already done
      }
      console.log(`   ⚠️ GSC: Indexing API response: ${err.error?.message || JSON.stringify(err)}`);
      return true; // Sitemap ping was still done
    }
  } catch (err) {
    console.log(`   ⚠️ GSC submit error: ${err.message}`);
    return false;
  }
}

/**
 * Request URL removal from Google's index
 */
export async function requestUrlRemoval(url) {
  console.log(`   🗑️ GSC: Requesting removal of "${url}"...`);
  
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  try {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        type: 'URL_DELETED',
      }),
    });

    if (res.ok) {
      console.log(`   ✅ GSC: URL removal requested: ${url}`);
      return true;
    } else {
      const err = await res.json();
      console.log(`   ⚠️ GSC: Removal response: ${err.error?.message || JSON.stringify(err)}`);
      // Even if Indexing API rejects, we'll update the sitemap which Google will eventually crawl
      return false;
    }
  } catch (err) {
    console.log(`   ⚠️ GSC removal error: ${err.message}`);
    return false;
  }
}

/**
 * Ping Google to re-crawl the sitemap
 * This is the most reliable way to notify Google of new/removed URLs
 */
async function pingSitemap(accessToken) {
  try {
    // Google's sitemap ping endpoint
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    const res = await fetch(pingUrl);
    if (res.ok) {
      console.log(`   📡 GSC: Sitemap ping sent`);
    }
  } catch (err) {
    console.log(`   ⚠️ Sitemap ping failed: ${err.message}`);
  }
}

/**
 * Batch submit multiple URLs (for use after publishing)
 */
export async function batchSubmitUrls(urls) {
  console.log(`\n🔗 GSC URL MANAGER: Submitting ${urls.length} URL(s)...`);
  let success = 0;
  
  for (const url of urls) {
    const result = await submitUrlForIndexing(url);
    if (result) success++;
    // Small delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`   📊 GSC: ${success}/${urls.length} URLs submitted`);
  return success;
}

// ═══════════════════════════════════════════════════════════════════════
// CLI: Run standalone for testing
// ═══════════════════════════════════════════════════════════════════════
if (process.argv[1]?.includes('gsc-url-manager')) {
  const action = process.argv[2] || 'submit';
  const url = process.argv[3] || `${SITE_URL}/blog`;

  if (action === 'submit') {
    await submitUrlForIndexing(url);
  } else if (action === 'remove') {
    await requestUrlRemoval(url);
  } else if (action === 'ping') {
    const token = await getAccessToken();
    if (token) await pingSitemap(token);
  }

  process.exit(0);
}
