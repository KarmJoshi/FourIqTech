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
const rawKeys = process.env.VITE_GEMINI_API_KEYS || process.env.VITE_GEMINI_PRO_API_KEY || "";
const API_KEYS = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
let keyIdx = 0;
function getKey() { const k = API_KEYS[keyIdx]; keyIdx = (keyIdx + 1) % API_KEYS.length; return k; }

const INSTAGRAM_PROMPT = `You are the Lead Engineer and CEO of FourIqTech, an elite software and IT solutions agency. Your goal is to SHOWCASE your technical expertise and EDUCATE businesses on why high-end technology (React, Next.js, SEO Systems, AI) is their competitive advantage.

CORE PILLARS:
1. React/Next.js Engineering: Explaining speed, scale, and why specific tech matters.
2. Conversion-Focused Design: Why most sites are digital paperweights and how to fix them.
3. Technical SEO: Proving SEO is a system, not magic.
4. AI Automation: Showcasing the power of autonomous agents.

TONE:
- Authority of a CTO, but simple enough for a CEO to understand.
- No "AI fluff". No "supercharge" or "unlock". 
- Short, punchy sentences.

FORMAT MUST BE: AUTHORITY CAROUSEL (3-4 slides).
DESIGN THEMES (Pick one to keep the feed fresh):
- "CYBER_DARK": Deep purple/black, grid lines, glowing assets.
- "MINIMAL_WHITE": Apple-style, white background, bold black serif fonts, clean.
- "CODE_EDITOR": Dark mode coding vibe (Monokai colors), monospace fonts, syntax highlighting style.
- "STREET_VIRAL": High contrast yellow/black, graffiti accents, massive energy.

FORMAT - Return ONLY JSON matching this exactly:
{
  "type": "carousel",
  "topicPillar": "React Engineering" | "Web Design" | "SEO Architecture" | "AI Automation",
  "visualTheme": "CYBER_DARK" | "MINIMAL_WHITE" | "CODE_EDITOR" | "STREET_VIRAL",
  "caption": "Include a viral trend/meme reference if applicable. Educational hook. CTA: DM 'BUILD'.",
  "hashtags": ["#SoftwareDevelopment", "#ReactJS", "#FourIqTech", "#WebTech"],
  "visualPrompt": "Describe a 3D asset matching the theme.",
  "quizData": { 
    "slides": [
      { "heading": "Hook (Use a trending debate or meme if possible)", "body": "Context." },
      { "heading": "The Technology", "body": "Why it matters." },
      { "heading": "The Result", "body": "How it grows businesses." }
    ] 
  }
}`;

async function draftDailyContent() {
  console.log("🧠 Initiating FourIqTech Social Brain...");
  try {
    const apiKey = getKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: INSTAGRAM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: "Generate today's content for FourIqTech." }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
      })
    });

    const data = await res.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) throw new Error("Gemini returned empty response.");

    const parsed = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
    console.log(`✅ Drafted new ${parsed.type} about ${parsed.topicPillar}`);
    console.log("📝 Post Content Preview:", JSON.stringify(parsed, null, 2));

    // Save to Database
    const post = await prisma.socialPost.create({
      data: {
        type: parsed.type,
        topicPillar: parsed.topicPillar,
        caption: parsed.caption,
        hashtags: parsed.hashtags.join(" "),
        visualPrompt: parsed.visualPrompt || null,
        quizData: parsed,
        reelScript: parsed.type === 'reel' ? parsed.reelScript : null,
        status: "draft",
        estimatedCost: 0.005 // Flash Lite inference cost
      }
    });

    console.log(`💾 Staved to database staging queue (ID: ${post.id})`);
  } catch (error) {
    console.error("❌ Agent failed:", error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

draftDailyContent();
