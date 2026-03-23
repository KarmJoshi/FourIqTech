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
        1. Niche must be a high-ticket "Small Business" (e.g., Luxury Hair Salons, Specialist Dental Clinics, Boutique Law Firms, Private Medical Clinics).
        2. City must be a major global hub (London, NYC, Sydney, Toronto, Dubai).
        3. Strategy: Focus on niches where businesses often have slow, outdated WordPress sites.
        
        Output a JSON object:
        {
            "niche": "e.g., Luxury Hair Salon",
            "city": "e.g., London",
            "search_query": "e.g., luxury hair salon London with website",
            "reasoning": "A 1-sentence explanation focusing on why this niche needs a performance upgrade."
        }
    `;

    try {
        if (!aiClient) throw new Error("No Gemini API Key found.");
        const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash-lite' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    } catch (err) {
        console.error('❌ Strategy Error:', err.message);
        return {
            niche: "Hair Salon",
            city: "London",
            search_query: "luxury hair salon high end London",
            reasoning: "Fallback to London Salons due to API error."
        };
    }
}

async function orchestrate() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🧠 FOURIQTECH GOVERNOR — AUTONOMOUS BRAIN              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    const strategy = await getNextStrategy();
    console.log(`\n🎯 AI TARGET: ${strategy.niche} in ${strategy.city}`);
    console.log(`📝 REASONING: ${strategy.reasoning}`);

    // Update Journal
    const journal = fs.existsSync(JOURNAL_PATH) ? JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8')) : [];
    journal.push({ date: new Date().toISOString(), ...strategy });
    fs.writeFileSync(JOURNAL_PATH, JSON.stringify(journal, null, 2));

    // Decision Logic: User requested focus on Lead Generation
    const leadsCount = fs.existsSync(LEADS_CSV_PATH) ? fs.readFileSync(LEADS_CSV_PATH, 'utf8').split('\n').filter(l => l.trim()).length - 1 : 0;

    console.log(`📊 DATABASE STATUS: ${leadsCount} leads found.`);

    // Prioritize Hunting (User: "i want an leads")
    if (leadsCount < 50) { 
        console.log(`\n🏹 ACTION: Database small (${leadsCount}/50). Triggering Lead Hunter for ${strategy.niche}...`);
        try {
            execSync(`NODE_OPTIONS="--no-warnings" node .github/scripts/lead-hunter.mjs --query "${strategy.search_query}" --city "${strategy.city}"`, { stdio: 'inherit' });
        } catch (e) {
            console.error('❌ Lead Hunter failed.');
        }
    } else {
        console.log(`\n💤 ACTION: Database sufficient (${leadsCount} leads). Skipping hunt for domain safety.`);
        // Note: Outreach Agent is disabled per user request: "i don't want to work on the email outreaching"
    }

    console.log('\n🧠 GOVERNOR: Cycle complete. ✅');
}

orchestrate().catch(console.error);
