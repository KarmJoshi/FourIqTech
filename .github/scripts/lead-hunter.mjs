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

// --- Helper: Read Existing Leads to avoid duplicates ---
function getExistingEmails() {
  if (!fs.existsSync(LEADS_CSV_PATH)) return new Set();
  const content = fs.readFileSync(LEADS_CSV_PATH, 'utf-8');
  const emails = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  return new Set(emails.map(e => e.toLowerCase()));
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
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    const response = await fetch(url, { signal: controller.signal });
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
        return !lower.includes('.png') && !lower.includes('.jpg') && !lower.includes('sentry');
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
  console.log(`\n🕵️  HUNTER: Initiating deep-scan for "${query}"...`);
  
  try {
    const searchResult = await search(query, { safeSearch: SafeSearchType.OFF });
    const results = searchResult.results || [];
    
    if (!results || results.length === 0) {
      console.log(`   ❌ No results found for ${query}`);
      return;
    }

    console.log(`   🔍 Found ${results.length} organic sites. Beginning crawl...`);
    
    const existingEmails = getExistingEmails();
    const viableLeads = [];

    // Process top 5 results
    for (let i = 0; i < Math.min(6, results.length); i++) {
        const lead = results[i];
        
        // Skip directory sites like Yelp, Tripadvisor, Facebook
        if (lead.link.includes('yelp.') || lead.link.includes('tripadvisor.') || lead.link.includes('facebook.') || lead.link.includes('instagram.')) {
            continue;
        }

        console.log(`   🌐 Crawling: ${lead.title.substring(0, 30)}...`);
        
        // Find a competitor (the guy right below him on Google)
        let competitorUrl = "N/A";
        for (let j = i + 1; j < results.length; j++) {
            if (!results[j].link.includes('yelp.') && !results[j].link.includes('facebook.')) {
                competitorUrl = results[j].link;
                break;
            }
        }

        const { email, cms } = await findLeadDetails(lead.link);
        
        if (email) {
            if (existingEmails.has(email)) {
                console.log(`      ⚠️ Skipped: ${email} (Already in database)`);
            } else {
                console.log(`      ✅ Found Lead: ${email} [CMS: ${cms}]`);
                viableLeads.push({
                    company: lead.title.replace(/,/g, ''),
                    url: lead.link,
                    email: email,
                    cms: cms,
                    competitor: competitorUrl,
                    city: city
                });
                existingEmails.add(email);
            }
        } else {
            console.log(`      ❌ No email found on site. CMS: ${cms}`);
        }
    }

    // Save to CSV
    if (viableLeads.length > 0) {
        let csvContent = "";
        
        if (!fs.existsSync(LEADS_CSV_PATH)) {
            csvContent += "Company Name,Website,Email,CMS,City,Competitor URL\n";
        }
        
        viableLeads.forEach(lead => {
            csvContent += `${lead.company},${lead.url},${lead.email},${lead.cms},${lead.city},${lead.competitor}\n`;
        });
        
        fs.appendFileSync(LEADS_CSV_PATH, csvContent);
        console.log(`\n   💾 Successfully saved ${viableLeads.length} new leads to leads_database.csv!`);
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
  console.log('║  🏹 FOURIQTECH LEAD HUNTER AGENT                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  // Parse CLI args (Governor Agent support)
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
    // The Matrix of default targets
    // Small Business Target Matrix
    const queries = [
      { q: "high end physiotherapy clinic London", city: "London" },
      { q: "luxury hair salon New York", city: "New York" },
      { q: "boutique dental practice Sydney", city: "Sydney" },
      { q: "premium real estate agency Dubai", city: "Dubai" },
      { q: "successful law firm Toronto", city: "Toronto" }
    ];
    const target = queries[Math.floor(Math.random() * queries.length)];
    await huntLeads(target.q, target.city);
  }
  
  console.log('\n🏹 HUNTER: Cycle complete. ✅');
}

main();
