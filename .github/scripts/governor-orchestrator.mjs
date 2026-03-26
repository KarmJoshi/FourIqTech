import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';

// ═══════════════════════════════════════════════════════════════════════
// 🧠 FOURIQTECH GOVERNOR — "The Strategic Brain"
// ═══════════════════════════════════════════════════════════════════════
// Purpose: Fully autonomous agency management.
// Pipeline:
//   1. AI picks a "Normal" niche and global city.
//   2. AI decides if it's time to "Hunt" or "Send".
//   3. AI executes Lead Hunter or Outreach Agent.
// ═══════════════════════════════════════════════════════════════════════

const JOURNAL_PATH = path.join(process.cwd(), '.github/growth_journal.json');
const LEADS_CSV_PATH = path.join(process.cwd(), '.github/leads_database.csv');

const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

let aiClient = API_KEYS.length > 0 ? new GoogleGenAI({ apiKey: API_KEYS[0] }) : null;

// Helper: Get City Timezone (Placeholder - simplified for demo)
function isBusinessHours(city) {
    // In a production app, we'd use a timezone library. 
    // Here we'll simulate a 9AM-5PM check.
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17;
}

async function getNextStrategy() {
    const prompt = `
        You are the CEO of FourIqTech, an autonomous high-end web agency.
        Your goal is to scale revenue by picking the best "normal" markets to target.
        
        RULES:
        1. NICHE: Strictly focus on "Luxury Hair & Beauty Salons" (Tier-1 establishments).
        2. CITIES: Target Global High-Net-Worth hubs (London, NYC, Dubai, Sydney, Toronto, Paris, Monaco).
        3. TARGET: Salon Owners and High-End Brand Managers.
        4. STRATEGY: Focus on booking high-ticket discovery calls to show how a bespoke React/GSAP digital experience will capture elite global clientele from their local competitors.
        
        Output a JSON object:
        {
            "niche": "Luxury Hair & Beauty Salon",
            "city": "e.g., Dubai",
            "search_query": "exclusive high end hair beauty salon Dubai Marina",
            "reasoning": "Explain why this tier-1 salon in this specific luxury hub needs a technical surge to outperform global competitors and capture high-spending clients."
        }
    `;

    try {
        if (!aiClient) throw new Error("No Gemini API Key found.");
        const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash-lite' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error('❌ Strategy Error:', err.message);
        return {
            niche: "Shop Owner",
            city: "London",
            search_query: "independent boutique shop London",
            reasoning: "Fallback to local shop targeting."
        };
    }
}

async function orchestrate() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🧠 FOURIQTECH GOVERNOR — AUTONOMOUS BRAIN (V3)         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    const strategy = await getNextStrategy();
    console.log(`\n🎯 AI TARGET: ${strategy.niche} in ${strategy.city}`);
    console.log(`📝 REASONING: ${strategy.reasoning}`);

    // Update Journal
    const journal = fs.existsSync(JOURNAL_PATH) ? JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8')) : [];
    journal.push({ date: new Date().toISOString(), ...strategy });
    fs.writeFileSync(JOURNAL_PATH, JSON.stringify(journal, null, 2));

    const leadsCount = fs.existsSync(LEADS_CSV_PATH) ? fs.readFileSync(LEADS_CSV_PATH, 'utf8').split('\n').filter(l => l.trim()).length - 1 : 0;
    console.log(`📊 DATABASE STATUS: ${leadsCount} leads found.`);

    // 🏹 ACTION 1: HUNTING (Always look for new leads if below threshold)
    if (leadsCount < 100) { 
        console.log(`\n🏹 ACTION: Triggering Lead Hunter for ${strategy.niche}...`);
        try {
            execSync(`NODE_OPTIONS="--no-warnings" node .github/scripts/lead-hunter.mjs --query "${strategy.search_query}" --city "${strategy.city}"`, { stdio: 'inherit' });
        } catch (e) {
            console.error('❌ Lead Hunter failed.');
        }
    }

    // 🚀 ACTION 2: OUTREACH (Re-enabled! Autonomous dispatch)
    if (leadsCount > 0) {
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 18) { // 9 AM - 6 PM
            console.log(`\n🚀 ACTION: Triggering Rainmaker Outreach Agent...`);
            try {
                execSync(`NODE_OPTIONS="--no-warnings" node .github/scripts/seo-outreach-agent.mjs`, { stdio: 'inherit' });
            } catch (e) {
                console.error('❌ Outreach Agent failed.');
            }
        } else {
            console.log(`\n💤 ACTION: Professional window closed (${hour}:00). Rainmaker sleeping.`);
        }
    }

    console.log('\n🧠 GOVERNOR: Cycle complete. ✅');
}

orchestrate().catch(console.error);
