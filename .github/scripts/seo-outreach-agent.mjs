import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

// ═══════════════════════════════════════════════════════════════════════
// 📩 FOURIQTECH OUTBOUND SALES AGENT — "The Rainmaker V2"
// ═══════════════════════════════════════════════════════════════════════
// Pipeline:
//   🎯 Reads from leads_database.csv (No manual approval bottleneck).
//   ✍️ PITCH ARCHITECT: Deep-analyzes the lead and generates a custom pitch 
//       comparing them to their hyper-local competitor from the CSV.
//   🚀 DISPATCHER: Safely sends via Nodemailer SMTP.
// ═══════════════════════════════════════════════════════════════════════

const LEADS_CSV_PATH = path.join(process.cwd(), '.github/leads_database.csv');
const OUTREACH_LOG_PATH = path.join(process.cwd(), '.github/outreach_log.json');

const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = process.env.SMTP_PORT || 465;
const SMTP_USER = process.env.SMTP_USER || ''; 
const SMTP_PASS = process.env.SMTP_PASS || '';

let aiClient = API_KEYS.length > 0 ? new GoogleGenAI({ apiKey: API_KEYS[0] }) : null;

async function generatePitch(target) {
  const prompt = `
    You are an Elite B2B Sales Executive at FourIqTech, a premium global web development agency.
    You have a proven track record of booking meetings with a "Surgeon-like" technical audit pitch.
    
    TARGET PROSPECT:
    - Company Name: ${target.company}
    - Location: ${target.city}
    - Their Website: ${target.website} 
    - Nearby Competitor Link: ${target.competitor}
    
    YOUR GOAL: Write a short, highly personalized cold email to the owner.
    
    RULES:
    1. Do NOT sound like a typical "SEO Agency" spammer. 
    2. We ONLY sell high-end, interactive websites built with React/GSAP.
    3. THE STRATEGY: Mention their competitor by Name or Link (${target.competitor}). 
       - If the prospect has a website: "I noticed your website is 3s slower than [Competitor], which is costing you local searches in ${target.city}."
       - If their website is missing/broken: "I noticed you lack a digital presence compared to [Competitor]. You're giving them your ${target.city} clients for free."
    4. Keep it exactly under 100 words. Executives delete long emails.
    5. Call to Action (CTA): A low-friction ask for a 10-minute discovery chat to show them the solution.
    
    Return a valid JSON object:
    {
      "subject_line": "A compelling, non-spammy subject line targeting their brand",
      "email_body": "The actual email content in clean HTML (<p>, <br> tags). Include a professional sign-off from 'Karm Joshi | Executive | FourIqTech'."
    }
  `;

  try {
    if (!aiClient) {
      console.log(`   ⚠️ [LOCAL TEST] No Gemini API Key found. Simulating AI output for ${target.company}...`);
      return {
        subject_line: `Quick question about ${target.company}'s digital presence`,
        email_body: `<p>Hi there,</p><p>I noticed your website is slightly behind <b>${target.competitor}</b> in page speed, which is costing you local searches in ${target.city}. We specialize in high-end, fast React sites that capture high-net-worth clients.</p><p>Do you have 10 minutes to chat next week?</p><br><p>Best,</p><p>Karm Joshi | Executive | FourIqTech</p>`
      };
    }

    const resp = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(resp.candidates[0].content.parts[0].text);
  } catch (err) {
    console.error('❌ Failed to generate pitch:', err.message);
    throw err;
  }
}

async function sendEmail(target, pitch, isDraftMode = true) {
  console.log(`\n📧 Preparing email for: ${target.company} (${target.email})`);
  console.log(`   📌 Strategy Subject: ${pitch.subject_line}`);
  
  if (isDraftMode || !SMTP_USER || !SMTP_PASS) {
    console.log(`   ⚠️ [DRAFT MODE / NO SECRETS] Email generated but not sent over network.`);
    return { status: 'draft_saved', subject: pitch.subject_line, body: pitch.email_body };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Karm Joshi | FourIqTech" <${SMTP_USER}>`, // Using standard variable interpolation
      to: target.email,
      subject: pitch.subject_line,
      html: pitch.email_body,
    });
    console.log(`   ✅ Email sent! Message ID: ${info.messageId}`);
    return { status: 'sent', messageId: info.messageId, subject: pitch.subject_line };
  } catch (error) {
    console.error(`   ❌ Failed to send email via Hostinger SMTP: ${error.message}`);
    return { status: 'failed', error: error.message };
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📩 FOURIQTECH RAINMAKER (V2) - CSV AUTONOMOUS DISPATCH ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  if (!fs.existsSync(LEADS_CSV_PATH)) {
    console.log(`   ⚠️ No database found at ${LEADS_CSV_PATH}. Run the Lead Hunter first.`);
    process.exit(0);
  }

  const csvData = fs.readFileSync(LEADS_CSV_PATH, 'utf8').split('\n');
  const headers = csvData[0].split(',');
  const targets = [];

  for (let i = 1; i < csvData.length; i++) {
    if (!csvData[i].trim()) continue;
    const cols = csvData[i].split(',');
    targets.push({
      company: cols[0],
      website: cols[1],
      email: cols[2],
      city: cols[3],
      competitor: cols[4]
    });
  }

  const log = fs.existsSync(OUTREACH_LOG_PATH) ? JSON.parse(fs.readFileSync(OUTREACH_LOG_PATH, 'utf8')) : [];
  const pendingTargets = targets.filter(t => !log.find(l => l.email === t.email && l.status === 'sent'));

  if (pendingTargets.length === 0) {
    console.log('   ✅ No pending leads in the database to dispatch.');
    process.exit(0);
  }

  const batch = pendingTargets.slice(0, 3); // Max 3 emails per run to protect domain health.
  console.log(`   🚀 Rainmaker executing against ${batch.length} high-value targets...`);

  // Simple Business Hours check (9 AM - 5 PM)
  const currentHour = new Date().getHours();
  if (currentHour < 9 || currentHour > 17) {
    console.log(`   💤 Current hour (${currentHour}) is outside professional window. Skipping dispatch.`);
    process.exit(0);
  }

  for (const target of batch) {
    const pitch = await generatePitch(target);
    const result = await sendEmail(target, pitch, true); // Set to false when SMTP relies are fixed
    
    log.push({
      date: new Date().toISOString(),
      email: target.email,
      company: target.company,
      ...result
    });
  }

  fs.writeFileSync(OUTREACH_LOG_PATH, JSON.stringify(log, null, 2));
  console.log('\n👔 SALES AGENT: Outbound Rainmaker cycle complete. ✅');
}

main().catch(console.error);
