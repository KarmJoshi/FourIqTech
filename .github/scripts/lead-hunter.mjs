import fs from 'fs';
import path from 'path';
import { search, SafeSearchType } from 'duck-duck-scrape';

// ═══════════════════════════════════════════════════════════════════════
// 🕵️ FOURIQTECH LEAD HUNTER AGENT — "The Radar"
// ═══════════════════════════════════════════════════════════════════════
// Purpose: Automatically scrape DuckDuckGo for high-ticket business leads.
// Pipeline:
//   1. Runs a granular search (e.g., "luxury salon in London").
//   2. Extracts Domains, Names, and Phones from the SERP.
//   3. Crawls the websites to discover Email Addresses.
//   4. Pairs the lead with a local competitor from the same SERP.
//   5. Appends the viable leads to `leads_database.csv` for the Outreach Agent.
// ═══════════════════════════════════════════════════════════════════════

const LEADS_CSV_PATH = path.join(process.cwd(), '.github/leads_database.csv');
const OUTREACH_LOG_PATH = path.join(process.cwd(), '.github/outreach_log.json');

// --- Helper: Get Existing Data to avoid duplicates ---
function getExistingMetadata() {
  const metadata = { emails: new Set(), domains: new Set() };
  
  if (fs.existsSync(LEADS_CSV_PATH)) {
    const content = fs.readFileSync(LEADS_CSV_PATH, 'utf-8').split('\n');
    content.forEach(line => {
      const cols = line.split(',');
      if (cols.length >= 3) {
        if (cols[2]) metadata.emails.add(cols[2].toLowerCase().trim());
        if (cols[1]) try { metadata.domains.add(new URL(cols[1]).hostname.replace('www.', '')); } catch(e) {}
      }
    });
  }

  if (fs.existsSync(OUTREACH_LOG_PATH)) {
    const log = JSON.parse(fs.readFileSync(OUTREACH_LOG_PATH, 'utf-8'));
    log.forEach(entry => {
      if (entry.email) metadata.emails.add(entry.email.toLowerCase().trim());
    });
  }

  return metadata;
}

// --- Helper: Detect if a site is running WordPress ---
function detectWordPress(html) {
  const wpSignatures = [
    'wp-content',
    'wp-includes',
    'wp-json',
    'wp-block-library',
    'wp-emoji-release.min.js',
    'generator" content="WordPress'
  ];
  const lowerHtml = html.toLowerCase();
  const isWP = wpSignatures.some(sig => lowerHtml.includes(sig.toLowerCase()));
  return isWP ? 'WordPress' : 'Unknown/Other';
}

// --- Helper: Crawl a website for an email address and CMS type ---
async function findLeadDetails(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 

    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return { email: null, cms: 'Unknown' };
    
    const html = await response.text();
    const cms = detectWordPress(html);
    
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const matches = html.match(emailRegex);
    
    let email = null;
    if (matches) {
      const validEmails = matches.filter(e => {
        const lower = e.toLowerCase();
        return !lower.includes('.png') && !lower.includes('.jpg') && !lower.includes('sentry') && !lower.includes('email@address.com');
      });
      if (validEmails.length > 0) email = validEmails[0].toLowerCase();
    }
    
    return { email, cms };
  } catch (err) {
    return { email: null, cms: 'Unknown' };
  }
}

// --- Main Hunter Logic ---
async function huntLeads(query, city) {
  // Rotate search platforms by modifying query
  const platforms = ['', 'google maps ', 'yelp ', 'google business '];
  const platformPrefix = platforms[Math.floor(Math.random() * platforms.length)];
  const fullQuery = `${platformPrefix}${query}`;

  console.log(`\n🕵️  HUNTER: Initiating deep-scan for "${fullQuery}" in ${city}...`);
  
  try {
    const searchResult = await search(fullQuery, { safeSearch: SafeSearchType.OFF });
    const results = searchResult.results || [];
    
    if (!results || results.length === 0) {
      console.log(`   ❌ No results found for ${fullQuery}`);
      return;
    }

    console.log(`   🔍 Found ${results.length} organic sites. Checking for duplicates...`);
    
    const metadata = getExistingMetadata();
    const viableLeads = [];

    // Process top 8 results
    for (let i = 0; i < Math.min(10, results.length); i++) {
        const lead = results[i];
        
        // Skip directory sites
        const skipDomains = ['yelp.', 'tripadvisor.', 'facebook.', 'instagram.', 'clutch.co', 'upcity.com'];
        if (skipDomains.some(d => lead.link.includes(d))) continue;

        // Domain-based Deduplication
        let domain = "";
        try { domain = new URL(lead.link).hostname.replace('www.', ''); } catch(e) { continue; }
        
        if (metadata.domains.has(domain)) {
            console.log(`      ⏩ Skipped: ${domain} (Domain already present)`);
            continue;
        }

        console.log(`   🌐 Crawling: ${lead.title.substring(0, 30)}...`);
        
        // Identify Competitor
        let competitorUrl = "N/A";
        for (let j = i + 1; j < results.length; j++) {
            if (!skipDomains.some(d => results[j].link.includes(d))) {
                competitorUrl = results[j].link;
                break;
            }
        }

        const { email, cms } = await findLeadDetails(lead.link);
        
        if (email) {
            if (metadata.emails.has(email)) {
                console.log(`      ⚠️ Skipped: ${email} (Email already in database/log)`);
            } else {
                console.log(`      ✅ Found Lead: ${email} [CMS: ${cms}]`);
                viableLeads.push({
                    company: lead.title.replace(/,/g, '').substring(0, 50),
                    url: lead.link,
                    email: email,
                    cms: cms,
                    competitor: competitorUrl,
                    city: city
                });
                metadata.emails.add(email);
                metadata.domains.add(domain);
            }
        } else {
            console.log(`      ❌ No email found on site. CMS: ${cms}`);
        }
    }

    // Save to CSV
    if (viableLeads.length > 0) {
        let csvContent = "";
        if (!fs.existsSync(LEADS_CSV_PATH) || fs.readFileSync(LEADS_CSV_PATH).length === 0) {
            csvContent += "Company Name,Website,Email,CMS,City,Competitor URL\n";
        }
        
        viableLeads.forEach(lead => {
            csvContent += `${lead.company},${lead.url},${lead.email},${lead.cms},${lead.city},${lead.competitor}\n`;
        });
        
        fs.appendFileSync(LEADS_CSV_PATH, csvContent);
        console.log(`\n   💾 Successfully saved ${viableLeads.length} new unique leads!`);
    } else {
        console.log(`\n   🤷 No new viable leads found in this batch.`);
    }

  } catch (error) {
    console.error('💥 Hunter Error:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 BOOT
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🏹 FOURIQTECH LEAD HUNTER AGENT — "The Radar V2"         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const args = process.argv.slice(2);
  let targetQuery = "";
  let targetCity = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i+1]) targetQuery = args[i+1];
    if (args[i] === '--city' && args[i+1]) targetCity = args[i+1];
  }

  if (targetQuery && targetCity) {
    console.log(`🤖 GOVERNOR SIGNAL: Hunting specifically for "${targetQuery}"...`);
    await huntLeads(targetQuery, targetCity);
  } else {
    // Target Matrix for Small & Big Businesses (Shops/Clinics/Firms)
    const queries = [
      { q: "independent boutique shop London", city: "London" },
      { q: "local hardware store NYC", city: "New York" },
      { q: "private dental clinic Sydney", city: "Sydney" },
      { q: "luxury hair salon Dubai", city: "Dubai" },
      { q: "family law firm Toronto", city: "Toronto" },
      { q: "successful local plumbing business Chicago", city: "Chicago" },
      { q: "high-end auto repair shop Los Angeles", city: "Los Angeles" }
    ];
    const target = queries[Math.floor(Math.random() * queries.length)];
    await huntLeads(target.q, target.city);
  }
  
  console.log('\n🏹 HUNTER: Cycle complete. ✅');
}

main();
