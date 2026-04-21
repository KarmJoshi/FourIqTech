import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rawKeys = process.env.VITE_GEMINI_API_KEYS || "";
const API_KEYS = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
let keyIdx = 0;
function getKey() { const k = API_KEYS[keyIdx]; keyIdx = (keyIdx + 1) % API_KEYS.length; return k; }

const EMAIL_SYSTEM_PROMPT = `You are an advanced website audit and outreach intelligence agent.

Your task is to analyze a target business website and one direct competitor, identify REAL performance and SEO gaps, and generate a highly credible, non-generic outreach message.

STRICT RULES:
- DO NOT fabricate data (no fake numbers like "you are losing 3 leads/day")
- DO NOT make unverifiable claims about revenue or rankings
- ONLY use observable or logically inferable insights. Use phrases like "this can lead to", "this typically affects", "this may reduce"
- Avoid generic marketing language, buzzwords ("skyrocket", "boost"), fake urgency, or fluff
- Output must feel like a human expert, not mass outreach spam
- Tone: Direct, Observational, Non-salesy, Confident but not exaggerated.
- NO "hope you are doing well"

YOUR ANALYSIS MUST COVER:
1. Performance (load behavior, JS/CSS limits, mobile drops)
2. SEO / Structure (Title/meta, Headings, internal links)
3. UX Signals (visual stability, layout shifts)

COMPETITOR DIFFERENCE:
Identify 2-3 REAL differences where the competitor implemented something better. Explain it in simple terms that impact user experience or search visibility.

BUSINESS IMPACT (CRITICAL):
Translate technical issues into REALISTIC business implications. Focus on user drop-off, slower perceived speed, reduced engagement, and lower conversion likelihood. DO NOT claim exact revenue or exact lead losses.

EMAIL GENERATION:
1. Personalized observation (not generic intro)
2. Specific issue found
3. Competitor comparison (real, not forced)
4. Business impact (realistic, not inflated)
5. Soft CTA: "Would 10 minutes this week work for a quick walkthrough?"
6. Sign off as 'Karm / FourIqTech'

FORMAT: Respond ONLY with valid JSON matching this structure exactly:
{
  "subject": "Under 8 words, observational and specific",
  "body": "Email body (max 120-150 words) with \\n for line breaks.",
  "problemTitle": "3-5 plain-English words describing the main issue",
  "problemDetail": "1-2 sentences summarizing key findings and competitor advantage",
  "businessImpact": "1-2 sentences with realistic, inferable business implication (no exact numbers)",
  "likelyFix": "Outcome-focused fix without buzzwords",
  "ownerName": "Extract owner first name from site text if visible, else use 'there'"
}`;

async function callGemini(prompt) {
  const apiKey = getKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
  const payload = {
    system_instruction: { parts: [{ text: EMAIL_SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 2048, temperature: 0.3 }
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const d = await res.json();
  return d?.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function main() {
  const leads = await prisma.lead.findMany({ include: { draftEmail: true } });
  console.log(`🔄 Rewriting emails for ${leads.length} leads with new Business Impact prompt...\n`);

  let success = 0, skipped = 0;
  for (const lead of leads) {
    await new Promise(r => setTimeout(r, 3500)); // throttle
    try {
      const dataPayload = {
        businessName: lead.businessName,
        website: lead.website,
        niche: lead.niche,
        location: lead.location,
        auditScore: lead.auditScore,
        seoIssues: lead.seoIssues,
        competitorName: lead.competitorName,
        competitorScore: lead.competitorScore,
        competitorGaps: lead.competitorGaps,
        businessImpact: lead.businessImpact,
      };

      const raw = await callGemini(JSON.stringify(dataPayload, null, 2));
      if (!raw) { console.log(`  ⚠️  ${lead.businessName}: Gemini returned nothing`); skipped++; continue; }

      let draft;
      try { draft = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
      catch { console.log(`  ⚠️  ${lead.businessName}: JSON parse failed`); skipped++; continue; }

      // Update lead meta fields
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          problemTitle: draft.problemTitle || lead.problemTitle,
          problemDetail: draft.problemDetail || lead.problemDetail,
          businessImpact: draft.businessImpact || lead.businessImpact,
          likelyFix: draft.likelyFix || lead.likelyFix,
        }
      });


      // Update or create draft email
      if (lead.draftEmail) {
        await prisma.draftEmail.update({
          where: { id: lead.draftEmail.id },
          data: { subject: draft.subject, body: draft.body }
        });
      } else {
        await prisma.draftEmail.create({
          data: {
            id: `email-rewrite-${lead.id}`,
            leadId: lead.id,
            subject: draft.subject,
            angle: "Business Impact Rewrite",
            sentFrom: "hello@fouriqtech.com",
            body: draft.body,
            deliveryStatus: "drafted"
          }
        });
      }

      console.log(`  ✅ ${lead.businessName}: "${draft.subject}"`);
      success++;
    } catch (e) {
      console.log(`  ❌ ${lead.businessName}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Done! ${success} emails rewritten, ${skipped} skipped.`);
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
