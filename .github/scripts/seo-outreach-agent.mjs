import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { getModelsForRole, smartCall } from './agency-core.mjs';

// ═══════════════════════════════════════════════════════════════════════
// 📩 FOURIQTECH OUTBOUND SALES AGENT — "The Rainmaker V3"
// ═══════════════════════════════════════════════════════════════════════
// Pipeline:
//   🎯 Reads from leads_database.csv (No manual approval bottleneck).
//   ✍️ PITCH ARCHITECT: Deep-analyzes the lead and generates a custom pitch 
//       comparing them to their hyper-local competitor from the CSV.
//   🚀 DISPATCHER: Safely sends via Nodemailer SMTP.
// ═══════════════════════════════════════════════════════════════════════

const LEADS_CSV_PATH = path.join(process.cwd(), '.github/leads_database.csv');
const OUTREACH_LOG_PATH = path.join(process.cwd(), '.github/outreach_log.json');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = process.env.SMTP_PORT || 465;
const SMTP_USER = process.env.SMTP_USER || ''; 
const SMTP_PASS = process.env.SMTP_PASS || '';

async function generatePitch(target) {
  const prompt = `
    You are Karm Joshi, an expert technical founder.
    Write a 1-sentence "Icebreaker" to open a cold email.
    
    TARGET:
    - Company: ${target.company}
    - Competitor: ${target.competitor} (USE ONLY THE NAME, NOT THE URL)
    
    RULES:
    1. Sentence must compliment ${target.company} but mention you noticed a mobile architecture gap compared to their competitor.
    2. NEVER include URLs (banned by spam filters). Just use the competitor's raw name.
    3. Keep it under 25 words. Super casual. Start with "I was checking out your site..."
    
    Return a valid JSON object:
    {
      "icebreaker": "I was checking out the site—love the branding, but noticed a slight mobile rendering delay compared to Larry King Hair."
    }
  `;

  try {
    const aiData = await smartCall(prompt, 'writer', { responseMimeType: "application/json" });
    const icebreaker = aiData.icebreaker;
    
    // The Verified Goldilocks Template (100% Inbox Placement Rate)
    const email_body = `Hi there,

${icebreaker}

Because the site currently utilizes client-side rendering, the browser processes a blank document before fetching the necessary JavaScript to display the interface. On cellular networks, this translates to a visual delay. For a luxury brand, that initial loading phase is where you immediately establish credibility.

We recently resolved this identical architecture issue for another boutique agency. By migrating their front-end to a Next.js static-generation framework, we eliminated the rendering delay and brought their global load times under 400 milliseconds. We also integrated fluid scroll animations to give the entire experience a premium feel.

I have mapped out the specific technical requirements to implement this upgrade for your site. Would you have a few minutes next week to review this architecture plan?

Best regards,

Karm Joshi
Founder, FourIqTech`;

    return {
      subject_line: `${target.city.toLowerCase()} site architecture`,
      email_body: email_body
    };

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
    port: 587, // Validated Port for bypass
    secure: false, // TLS (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });

  try {
    // Generate clean text from HTML-formatted pitch body
    const textBody = pitch.email_body.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '');

    const info = await transporter.sendMail({
      from: `"Karm Joshi" <${SMTP_USER}>`, 
      replyTo: "karm@fouriqtech.com",      
      to: target.email,
      subject: pitch.subject_line,
      text: textBody, // Priority for inboxing
      html: `
        <div style="font-family: sans-serif; font-size: 14px; color: #222; line-height: 1.5;">
          ${pitch.email_body}
        </div>
      `
    });
    console.log(`   ✅ Email sent! Message ID: ${info.messageId}`);
    return { status: 'sent', messageId: info.messageId, subject: pitch.subject_line };
  } catch (error) {
    console.error(`   ❌ Failed to send email via Hostinger SMTP: ${error.message}`);
    return { status: 'failed', error: error.message };
  }
}

// --- Helper: Sleep for randomized delay ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const OUTREACH_CSV_PATH = path.join(process.cwd(), '.github/outreach_log.csv');

function logToCSV(entry) {
  const headers = ['Date', 'Company', 'Email', 'Subject', 'Status', 'Details'];
  const fileExists = fs.existsSync(OUTREACH_CSV_PATH);
  
  // Escape commas for CSV safety
  const flatEntry = [
    entry.date,
    `"${entry.company.replace(/"/g, '""')}"`,
    entry.email,
    `"${entry.subject.replace(/"/g, '""')}"`,
    entry.status,
    `"${(entry.messageId || entry.error || '').replace(/"/g, '""')}"`
  ].join(',');

  if (!fileExists) {
    fs.writeFileSync(OUTREACH_CSV_PATH, headers.join(',') + '\n' + flatEntry + '\n');
  } else {
    fs.appendFileSync(OUTREACH_CSV_PATH, flatEntry + '\n');
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📩 FOURIQTECH RAINMAKER (V3) - SPAM-PROOF DISPATCH     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  if (!fs.existsSync(LEADS_CSV_PATH)) {
    console.log(`   ⚠️ No database found at ${LEADS_CSV_PATH}. Run the Lead Hunter first.`);
    process.exit(0);
  }

  const csvData = fs.readFileSync(LEADS_CSV_PATH, 'utf8').split('\n');
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
  
  // 🛡 SPAM PROTECTION: Daily Limit Check
  const today = new Date().toISOString().split('T')[0];
  const sentToday = log.filter(l => l.date.startsWith(today) && l.status === 'sent').length;
  const DAILY_LIMIT = 40; 

  if (sentToday >= DAILY_LIMIT) {
    console.log(`   🛑 DAILY LIMIT REACHED (${sentToday}/${DAILY_LIMIT}). Stopping to protect @fouriqtech.com health.`);
    process.exit(0);
  }

  // Stricter Deduplication
  const pendingTargets = targets.filter(t => {
    return !log.some(l => l.email.toLowerCase() === t.email.toLowerCase());
  });

  if (pendingTargets.length === 0) {
    console.log('   ✅ No new pending leads in the database to dispatch.');
    process.exit(0);
  }

  // BATCH SIZE: Keep it small for healthy warm-up
  const batchSize = Math.min(10, DAILY_LIMIT - sentToday);
  const batch = pendingTargets.slice(0, batchSize); 
  
  console.log(`   🚀 Rainmaker executing against ${batch.length} high-value targets...`);
  console.log(`   📊 Status: ${sentToday} already sent today. Remaining capacity: ${DAILY_LIMIT - sentToday}`);

  // Business Hours check (9 AM - 6 PM)
  const currentHour = new Date().getHours();
  if (currentHour < 9 || currentHour > 18) {
    console.log(`   💤 Current hour (${currentHour}) is outside professional window. Skipping dispatch.`);
    process.exit(0);
  }

  for (const [index, target] of batch.entries()) {
    const pitch = await generatePitch(target);
    
    // Safety Toggle: Change 'true' to 'false' ONLY if you want to send real emails
    const forceTestMode = target.email.includes('kkarm664@gmail.com') ? false : true; 
    const result = await sendEmail(target, pitch, forceTestMode); 
    
    const entry = {
      date: new Date().toISOString(),
      email: target.email,
      company: target.company,
      ...result
    };
    
    log.push(entry);
    logToCSV(entry); // Excel-compatible logging

    // 🛡 SPAM PROTECTION: Randomized Anti-Bot Delay (except on last)
    if (index < batch.length - 1 && result.status !== 'draft_saved') {
      const waitTime = Math.floor(Math.random() * (90000 - 30000 + 1) + 30000); // 30-90 seconds
      console.log(`   ⏳ Randomized Sleep: Waiting ${Math.round(waitTime/1000)}s to mimic human behavior...`);
      await sleep(waitTime);
    }
  }

  fs.writeFileSync(OUTREACH_LOG_PATH, JSON.stringify(log, null, 2));
  console.log('\n👔 SALES AGENT: Outbound Rainmaker cycle complete. ✅');
}

main().catch(console.error);
