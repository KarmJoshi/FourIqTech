import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════════════
// 👔 AGENCY API SERVER v2 — Manager Is The Boss
// ═══════════════════════════════════════════════════════════════════════
// Non-blocking dispatch, staging queue, real-time activity feed.
//
// NEW ENDPOINTS:
//   GET  /api/staging              → Staging queue (pending/approved/rejected)
//   GET  /api/activity             → Real-time activity feed
//   POST /api/staging/:id/review   → Manager approves/rejects a staging item
//   POST /api/dispatch/:department → Non-blocking department dispatch
//   POST /api/director/cycle       → Full Director cycle
//   GET  /api/status               → Agency health snapshot
//   GET  /api/journal              → Director decision history
// ═══════════════════════════════════════════════════════════════════════

import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import nodemailer from 'nodemailer';
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3848;
const CWD = process.cwd();

// 🏥 Health Check for Render
app.get('/health', (req, res) => {
  res.json({ status: 'live', timestamp: new Date().toISOString(), version: '2.5-unified' });
});

// ── Paths ──
const DIRECTOR_JOURNAL = path.join(CWD, '.github/director_journal.json');
const DIRECTOR_ORDERS = path.join(CWD, '.github/director_orders.json');
const STAGING_PATH = path.join(CWD, '.github/staging/staging.json');
const ACTIVITY_PATH = path.join(CWD, '.github/staging/activity_log.json');
const PUBLISH_LOG = path.join(CWD, '.github/publish_log.json');
const TECH_LOG = path.join(CWD, '.github/technical_seo_log.json');
const BLOG_DATA = path.join(CWD, 'src/data/blogPosts.ts');
const APP_TSX = path.join(CWD, 'src/App.tsx');
const SEO_MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const OPPORTUNITY_PATH = path.join(SEO_MEMORY_DIR, 'latest-opportunities.json');
const TASK_REGISTRY = path.join(SEO_MEMORY_DIR, 'task-registry.json');
const PLAYBOOK_SCORES = path.join(SEO_MEMORY_DIR, 'playbook-scores.json');
const OUTCOME_HISTORY = path.join(SEO_MEMORY_DIR, 'outcome-history.json');
const COMPETITOR_INTEL = path.join(SEO_MEMORY_DIR, 'competitor-intelligence.json');
const SETTINGS_PATH = path.join(CWD, '.github/staging/system-settings.json');
const LIVE_POSTS_PATH = path.join(CWD, 'public/live_posts.json');
const LIVE_ROUTES_PATH = path.join(CWD, 'public/live_routes.json');
const GSC_REPORT_PATH = path.join(CWD, '.github/gsc-reports/latest.json');

// ── Department Scripts ──
const DEPARTMENTS = {
  content: '.github/scripts/seo-auto-poster.mjs',
  structural: '.github/scripts/seo-dev-agent.mjs',
  technical: '.github/scripts/technical-seo-agent.mjs',
  backlinks: '.github/scripts/backlink-agent.mjs',
};

// Track running tasks
const runningTasks = {};

// ── Helper: Read JSON safely ──
function readJson(filePath, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

async function logActivity(emoji, source, message, type = 'info') {
  try {
    const entry = await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        emoji,
        source,
        message,
        type,
        timestamp: new Date()
      }
    });
    return entry;
  } catch (err) {
    console.error('Failed to log activity to DB:', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/dispatch/:department — Non-blocking department dispatch
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/dispatch/:department', (req, res) => {
  const dept = req.params.department;
  const script = DEPARTMENTS[dept];

  if (!script) {
    return res.status(400).json({ error: `Unknown department: ${dept}` });
  }

  // Check if already running
  if (runningTasks[dept]) {
    return res.json({ success: false, message: `${dept} team is already running. Please wait.`, status: 'busy' });
  }

  console.log(`\n⚡ DISPATCH: ${dept.toUpperCase()} TEAM triggered via API`);
  logActivity('⚡', dept, `${dept.toUpperCase()} TEAM dispatched`, 'info');

  // Write orders if provided
  if (req.body.orders) {
    fs.writeFileSync(DIRECTOR_ORDERS, JSON.stringify({
      timestamp: new Date().toISOString(),
      department: dept,
      reasoning: req.body.orders,
      cross_department_orders: req.body.orders,
      agency_health_score: 7,
      source: 'chat_manager'
    }, null, 2));
    logActivity('📜', 'manager', `Orders written for ${dept} team`, 'info');
  }

  // Non-blocking spawn
  const child = spawn('node', ['--env-file=.env', script], {
    cwd: CWD,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let output = '';
  let errorOutput = '';
  const taskId = Date.now().toString(36);

  runningTasks[dept] = {
    id: taskId,
    startedAt: new Date().toISOString(),
    pid: child.pid,
  };

  child.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    // Log significant lines to activity feed
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      if (line.includes('✅') || line.includes('❌') || line.includes('📝') ||
        line.includes('🎯') || line.includes('📦') || line.includes('👔') ||
        line.includes('STAGING') || line.includes('PUBLISHED')) {
        logActivity('🔄', dept, line.replace(/[═╔╗╚╝║╣╠]/g, '').trim(), 'info');
      }
    }
  });

  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  child.on('close', (code) => {
    delete runningTasks[dept];
    if (code === 0) {
      console.log(`   ✅ ${dept.toUpperCase()} TEAM completed.`);
      logActivity('✅', dept, `${dept.toUpperCase()} TEAM completed successfully`, 'info');
    } else {
      console.error(`   ❌ ${dept.toUpperCase()} TEAM failed (exit code ${code}).`);
      logActivity('❌', dept, `${dept.toUpperCase()} TEAM failed: ${errorOutput.substring(0, 200)}`, 'error');
    }
  });

  // Kill after 10 minutes
  setTimeout(() => {
    if (runningTasks[dept]?.id === taskId) {
      child.kill();
      delete runningTasks[dept];
      logActivity('⏰', dept, `${dept.toUpperCase()} TEAM timed out after 10 minutes`, 'error');
    }
  }, 600000);

  // Respond immediately — task is running in background
  res.json({
    success: true,
    department: dept,
    message: `${dept} team dispatched. Running in background.`,
    taskId,
    status: 'running',
  });
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/director/cycle — Full Director cycle (non-blocking)
// ═══════════════════════════════════════════════════════════════════════
// Director Cycle (POST & GET for Cron support)
// ═══════════════════════════════════════════════════════════════════════
function triggerDirectorCycle(req, res, method = 'API') {
  if (runningTasks['director']) {
    const msg = `Director Cycle skip (${method}): Process already active.`;
    console.log(`[Director] ${msg}`);
    logActivity('⚠️', 'manager', msg, 'info');
    if (res) res.json({ success: false, message: 'Director cycle is already running.', status: 'busy' });
    return;
  }

  console.log(`\n👔 DIRECTOR CYCLE triggered via ${method}`);
  logActivity('👔', 'manager', `Director strategic pulse started (${method})`, 'info');

  const child = spawn('node', ['--env-file=.env', '.github/scripts/agency-director.mjs'], {
    cwd: CWD,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  child.on('error', (err) => {
    console.error('Spawn Error:', err);
    logActivity('❌', 'manager', `Spawn Error: ${err.message}`, 'error');
    delete runningTasks['director'];
  });

  const taskId = Date.now().toString(36);
  runningTasks['director'] = { id: taskId, startedAt: new Date().toISOString(), pid: child.pid };

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    for (const line of lines) {
      if (line.includes('✅') || line.includes('❌') || line.includes('📝') ||
        line.includes('🎯') || line.includes('📦') || line.includes('👔') ||
        line.includes('STAGING') || line.includes('Phase') || line.includes('DECISION')) {
        logActivity('👔', 'manager', line.replace(/[═╔╗╚╝║╣╠]/g, '').trim(), 'info');
      }
    }
  });

  child.stderr.on('data', (data) => {
    console.error('Director stderr:', data.toString().substring(0, 200));
  });

  child.on('close', (code) => {
    delete runningTasks['director'];
    if (code === 0) {
      logActivity('✅', 'manager', 'Director cycle completed', 'info');
    } else {
      logActivity('❌', 'manager', 'Director cycle failed', 'error');
    }
  });

  // Safety timeout: 15 mins max
  setTimeout(() => {
    if (runningTasks['director']?.id === taskId) {
      child.kill();
      delete runningTasks['director'];
      console.warn(`[Director] Cycle ${taskId} killed after 15m timeout.`);
    }
  }, 900000);

  if (res) {
    res.json({ success: true, message: `Director cycle started (${method}). Running in background.`, taskId, status: 'running' });
  }
}

app.post('/api/director/cycle', (req, res) => triggerDirectorCycle(req, res, 'POST'));
app.get('/api/director/cycle', (req, res) => triggerDirectorCycle(req, res, 'CRON-GET'));

// ═══════════════════════════════════════════════════════════════════════
// GET /api/staging — Staging queue
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/staging', async (req, res) => {
  try {
    const items = await prisma.stagingItem.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      total_submitted: items.length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      pending: items.filter(i => i.status === 'pending_review').length,
      approval_rate: items.length > 0
        ? Math.round((items.filter(i => i.status === 'approved').length / items.length) * 100) + '%'
        : '0%'
    };

    res.json({ queue: items, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/staging — Submit work to the queue
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/staging', async (req, res) => {
  try {
    const { type, department, title, content, summary, metadata } = req.body;
    const count = await prisma.stagingItem.count();
    const id = `stg-${(count + 1).toString().padStart(3, '0')}`;

    // Save content to file for dashboard preview
    const contentFilename = `${id}_${Date.now()}.txt`;
    const contentPath = path.join('.github/staging/drafts', contentFilename);
    const fullContentPath = path.join(CWD, contentPath);

    if (!fs.existsSync(path.dirname(fullContentPath))) {
      fs.mkdirSync(path.dirname(fullContentPath), { recursive: true });
    }
    fs.writeFileSync(fullContentPath, content || '');

    const newItem = await prisma.stagingItem.create({
      data: {
        id,
        type: type || 'other',
        department: department || 'Unknown',
        status: 'pending_review',
        createdAt: new Date(),
        title: title || 'Untitled Submission',
        content: content || '',
        draftPath: contentPath,
        summary: summary || {},
        metadata: metadata || {},
      }
    });

    res.json({ success: true, id: newItem.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/staging/:id/review — Manager reviews a staging item
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/staging/:id/review', async (req, res) => {
  const { id } = req.params;
  const { verdict, feedback } = req.body;

  if (!verdict || !['approved', 'rejected'].includes(verdict)) {
    return res.status(400).json({ error: 'verdict must be "approved" or "rejected"' });
  }

  try {
    const updateData = {
      status: verdict,
      managerReview: {
        verdict,
        feedback: feedback || '',
        reviewed_at: new Date().toISOString(),
      }
    };

    if (verdict === 'approved') {
      updateData.publishedAt = new Date();
    } else {
      updateData.revisionCount = { increment: 1 };
    }

    const item = await prisma.stagingItem.update({
      where: { id },
      data: updateData
    });

    const emoji = verdict === 'approved' ? '✅' : '❌';
    await logActivity(emoji, 'manager', `${verdict.toUpperCase()}: "${item.title}" — ${feedback || 'No comment'}`, 'review');

    res.json({ success: true, item });

    if (verdict === 'approved') {
      // Trigger publisher via API endpoint (works on Render)
      console.log('   🚀 Triggering publisher...');
      try {
        // Call our own publish endpoint
        fetch(`http://localhost:${PORT}/api/publish`, { method: 'POST' }).catch(() => {});
      } catch {}
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/activity — Real-time activity feed
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const items = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit
    });
    res.json({ entries: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/tasks — Running tasks status
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/tasks', (req, res) => {
  res.json(runningTasks);
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/tasks/:dept/stop — Kill a running task
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/tasks/:dept/stop', (req, res) => {
  const dept = req.params.dept;
  const task = runningTasks[dept];
  if (!task) {
    return res.json({ success: false, message: `No running task for ${dept}` });
  }
  try {
    process.kill(task.pid, 'SIGTERM');
    delete runningTasks[dept];
    logActivity('🛑', dept, `${dept.toUpperCase()} TEAM stopped by user`, 'info');
    res.json({ success: true, message: `${dept} task killed (PID ${task.pid})` });
  } catch (e) {
    delete runningTasks[dept];
    res.json({ success: true, message: `${dept} task cleaned up` });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/intelligence — SEO memory snapshot
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/intelligence', (req, res) => {
  res.json({
    opportunities: readJson(OPPORTUNITY_PATH, {}),
    registry: readJson(TASK_REGISTRY, { collisions: [], opportunities: [] }),
    playbooks: readJson(PLAYBOOK_SCORES, { scores: [] }),
    outcomes: readJson(OUTCOME_HISTORY, []),
    competitor: readJson(COMPETITOR_INTEL, { queries: [] }),
    gsc: readJson(GSC_REPORT_PATH, {}),
  });
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/status — Agency health snapshot
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/status', async (req, res) => {
  const status = {};

  try {
    // Blog count from DB
    status.blog_posts = await prisma.blogPost.count({ where: { isLive: true } });
  } catch { status.blog_posts = 0; }

  try {
    // Service pages from DB + static file
    const dbPages = await prisma.servicePage.count({ where: { isLive: true } });
    let staticPages = 0;
    try {
      const appCode = fs.readFileSync(APP_TSX, 'utf8');
      staticPages = [...appCode.matchAll(/path="\/services\/([^"]+)"/g)].length;
    } catch { }
    status.service_pages = Math.max(dbPages, staticPages);
  } catch { status.service_pages = 0; }

  try {
    // Journal from DB
    const journalEntries = await prisma.journalEntry.findMany({
      orderBy: { date: 'desc' }, take: 1
    });
    status.director_cycles = await prisma.journalEntry.count();
    status.last_decision = journalEntries[0] || null;
  } catch { status.director_cycles = 0; }

  try {
    // Tech log (still file-based)
    const techLog = JSON.parse(fs.readFileSync(TECH_LOG, 'utf8'));
    status.tech_fixes = techLog.applied_fixes?.length || 0;
  } catch { status.tech_fixes = 0; }

  try {
    // Staging from DB
    const q = await prisma.stagingItem.findMany();
    status.staging = {
      total_submitted: q.length,
      approved: q.filter(i => i.status === 'approved').length,
      rejected: q.filter(i => i.status === 'rejected').length,
      pending: q.filter(i => i.status === 'pending_review').length,
      published: q.filter(i => i.status === 'published').length,
      approval_rate: q.length > 0 ? Math.round((q.filter(i => ['approved', 'published'].includes(i.status)).length / q.length) * 100) + '%' : '0%'
    };
  } catch { status.staging = {}; }

  status.running_tasks = Object.keys(runningTasks);

  res.json(status);
});

// ═══════════════════════════════════════════════════════════════════════
// Unified Task Runner & Email
// ═══════════════════════════════════════════════════════════════════════

const TASK_SCRIPTS = {
  writer: 'seo-auto-poster.mjs',
  auditor: 'seo-dev-agent.mjs',
  outreach: 'seo-outreach-agent.mjs',
  lead_hunter: 'lead-hunter.mjs',
  outreach_engine: 'outreach-engine.mjs'
};

app.post('/api/run-task', (req, res) => {
  try {
    const { task, args } = req.body;
    const scriptName = TASK_SCRIPTS[task];
    if (!scriptName) {
      return res.status(400).json({ error: `Unknown task: ${task}` });
    }

    const argsString = args && Array.isArray(args) ? args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(' ') : '';
    const cmd = `node .github/scripts/${scriptName} ${argsString}`;
    console.log(`[Unified API] EXECUTING: ${cmd}`);
    logActivity('🚀', task, `Manual Task Executed: ${task}`, 'info');

    exec(cmd, (error, stdout, stderr) => {
      const response = { success: !error, stdout, stderr, error: error ? error.message : null };
      res.status(error ? 500 : 200).json(response);
    });
  } catch (e) {
    res.status(400).json({ error: 'Invalid Task Payload' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 📬 EMAIL DELIVERABILITY SAFEGUARDS — Keep cold outreach out of spam
// ═══════════════════════════════════════════════════════════════════════
// These don't replace DNS auth (SPF/DKIM/DMARC) or domain warmup — those are
// the foundation. But they handle every content/header signal that code can.
// ═══════════════════════════════════════════════════════════════════════

const FROM_DOMAIN = 'fouriqtech.com';
const FROM_EMAIL = `hello@${FROM_DOMAIN}`;
const REPLY_TO = `karm@${FROM_DOMAIN}`;
const UNSUBSCRIBE_MAILTO = `unsubscribe@${FROM_DOMAIN}`;

// Common spam-trigger words/patterns that hurt inbox placement.
const SPAM_TRIGGERS = [
  /\bfree\b/i, /\bguarantee/i, /\bact now\b/i, /\blimited time\b/i, /\bclick here\b/i,
  /\b100%\b/i, /\brisk[- ]?free\b/i, /\bcash\b/i, /\bcheap\b/i, /\bdiscount\b/i,
  /\bwinner\b/i, /\bcongratulations\b/i, /\burgent\b/i, /\bbuy now\b/i, /\border now\b/i,
  /\$\$\$/, /!!!+/, /\bearn money\b/i, /\bdouble your\b/i, /\bno cost\b/i, /\bspecial promotion\b/i,
];

/** Scan subject+body for spam triggers. Returns array of matched words. */
function scanForSpamTriggers(subject = '', body = '') {
  const text = `${subject}\n${body}`;
  const hits = [];
  for (const re of SPAM_TRIGGERS) {
    const m = text.match(re);
    if (m) hits.push(m[0]);
  }
  // Excessive caps in subject is a classic flag
  const letters = subject.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 6 && letters === letters.toUpperCase()) hits.push('ALL-CAPS subject');
  return hits;
}

/** Ensure an unsubscribe footer exists in HTML and text bodies. */
function ensureUnsubscribeFooter(htmlBody, textBody) {
  const unsubUrl = `mailto:${UNSUBSCRIBE_MAILTO}?subject=Unsubscribe`;
  const hasUnsub = /unsubscribe/i.test(htmlBody || '') || /unsubscribe/i.test(textBody || '');

  let html = htmlBody;
  let text = textBody;

  if (html && !/<\/body>/i.test(html)) html = `${html}`; // no-op guard
  if (html && !hasUnsub) {
    const footer = `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
      You received this because we believe it's relevant to your business. <a href="${unsubUrl}" style="color:#94a3b8;">Unsubscribe</a> · FourIQ Tech, ${FROM_DOMAIN}
    </div>`;
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${footer}</body>`) : `${html}${footer}`;
  }

  if (text && !hasUnsub) {
    text = `${text}\n\n—\nYou received this because we believe it's relevant to your business.\nTo opt out, reply with "unsubscribe" or email ${UNSUBSCRIBE_MAILTO}.\nFourIQ Tech, ${FROM_DOMAIN}`;
  }

  return { html, text };
}

/** Strip HTML to a readable plain-text alternative. */
function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Core email sender shared by the API endpoint and the autonomous sender.
 * Applies every deliverability safeguard in one place.
 * @returns {Promise<{success, messageId?, error?, blocked?, spamTriggers}>}
 */
async function sendEmailCore({ to, subject, body: emailBody, htmlBody, fromName, leadId, force = false }) {
  // Guard 1: valid recipient
  const emailOk = typeof to === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
  if (!emailOk) {
    return { success: false, blocked: true, error: 'Invalid recipient email', spamTriggers: [] };
  }

  // Guard 2: spam-trigger scan
  const spamHits = scanForSpamTriggers(subject, emailBody || htmlBody || '');
  if (spamHits.length >= 3 && !force) {
    return {
      success: false,
      blocked: true,
      error: `Too many spam triggers (${spamHits.join(', ')})`,
      spamTriggers: spamHits,
    };
  }

  // Guard 3: unsubscribe footer + plain-text alternative
  let workingHtml = htmlBody && htmlBody.includes('<') ? htmlBody : null;
  let workingText = emailBody || (workingHtml ? htmlToPlainText(workingHtml) : '');
  const withFooter = ensureUnsubscribeFooter(workingHtml, workingText);
  workingHtml = withFooter.html;
  workingText = withFooter.text;

  const unsubHeaders = {
    'List-Unsubscribe': `<mailto:${UNSUBSCRIBE_MAILTO}?subject=Unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };

  const RESEND_KEY = process.env.RESEND_API_KEY;

  if (RESEND_KEY) {
    const emailPayload = {
      from: `${fromName || 'Karm Joshi'} <${FROM_EMAIL}>`,
      to: [to],
      reply_to: REPLY_TO,
      subject,
      headers: unsubHeaders,
    };
    if (workingHtml) {
      emailPayload.html = workingHtml;
      emailPayload.text = workingText || htmlToPlainText(workingHtml);
    } else {
      emailPayload.text = workingText;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Resend error: ${response.status}`);

    if (leadId) {
      await prisma.lead.update({ where: { id: leadId }, data: { status: 'sent', lastTouchedAt: new Date(), contactEmail: to } }).catch(() => {});
      await prisma.draftEmail.update({ where: { leadId }, data: { deliveryStatus: 'sent', sentAt: new Date() } }).catch(() => {});
    }
    logActivity('📧', 'outreach', `Email sent to ${to} via Resend`, 'info');
    return { success: true, messageId: data.id, spamTriggers: spamHits };
  }

  // SMTP fallback
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const info = await transporter.sendMail({
    from: `"${fromName || 'Karm Joshi'}" <${process.env.SMTP_USER}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    text: workingText,
    ...(workingHtml ? { html: workingHtml } : {}),
    headers: unsubHeaders,
  });
  if (leadId) {
    await prisma.lead.update({ where: { id: leadId }, data: { status: 'sent', lastTouchedAt: new Date(), contactEmail: to } }).catch(() => {});
    await prisma.draftEmail.update({ where: { leadId }, data: { deliveryStatus: 'sent', sentAt: new Date() } }).catch(() => {});
  }
  logActivity('📧', 'outreach', `Email sent to ${to} via SMTP`, 'info');
  return { success: true, messageId: info.messageId, spamTriggers: spamHits };
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body: emailBody, htmlBody, fromName, leadId, force } = req.body;
    console.log(`[Email] Preparing send to: ${to}`);

    const result = await sendEmailCore({ to, subject, body: emailBody, htmlBody, fromName, leadId, force });

    if (!result.success) {
      if (result.blocked) {
        logActivity('⚠️', 'outreach', `Email to ${to} blocked: ${result.error}`, 'error');
        return res.status(422).json({ ...result, hint: 'Rewrite the email or resend with force:true.' });
      }
      return res.status(500).json(result);
    }
    res.json(result);
  } catch (e) {
    console.error(`[Email] ERROR: ${e.message}`);
    logActivity('❌', 'outreach', `Failed to send email: ${e.message}`, 'error');
    res.status(500).json({ success: false, error: e.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════
// GET /api/journal — Director decision history
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/journal', async (req, res) => {
  try {
    const items = await prisma.journalEntry.findMany({
      orderBy: { date: 'desc' },
      take: 50
    });
    res.json({ entries: items, total_cycles: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/staging/:id/content — Read a staging item's draft content
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/staging/:id/content', async (req, res) => {
  try {
    const item = await prisma.stagingItem.findUnique({
      where: { id: req.params.id }
    });

    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Prioritize content stored directly in the database (Reliable for Render/Production)
    if (item.content) {
      return res.json({ content: item.content, source: 'database' });
    }

    // Fallback to file reading if database content is empty
    const contentPath = item.draftPath || item.codePath || item.diffPath;
    if (!contentPath) return res.status(404).json({ error: 'No content for this item.' });

    const fullPath = path.join(CWD, contentPath);
    if (!fs.existsSync(fullPath)) {
       return res.status(404).json({ error: `Associated file not found: ${contentPath}` });
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content, path: contentPath, source: 'filesystem' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 🔗 GET /api/backlinks — Fetch link opportunities
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/backlinks', async (req, res) => {
  try {
    const opportunities = await prisma.$queryRawUnsafe(
      'SELECT * FROM "LinkOpportunity" ORDER BY "foundAt" DESC LIMIT 50'
    );
    res.json({ opportunities });
  } catch (err) {
    res.json({ opportunities: [] });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// (Settings endpoints moved to bottom — see /api/config section)
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// GET /api/leads — Fetch Leads Gathered by the Hunter
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { draftEmail: true },
      orderBy: { collectedAt: 'desc' }
    });
    res.json({ leads });
  } catch (e) {
    res.status(500).json({ error: "Failed to read leads database." });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  if (!id || id === 'undefined' || id === 'null') {
    return res.status(400).json({ success: false, error: "Invalid Lead ID" });
  }

  console.log(`[Unified API] PATCH /api/leads/${id}`, data);
  
  try {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: `Lead ${id} not found in database.` });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        businessName: data.businessName,
        contactEmail: data.contactEmail,
        website: data.website,
        niche: data.niche,
        status: data.status,
        problemTitle: data.problemTitle,
        problemDetail: data.problemDetail,
        location: data.location,
        lastTouchedAt: new Date()
      }
    });

    // Also update any existing draft email with the new contact email if relevant
    if (data.contactEmail) {
       await prisma.draftEmail.updateMany({
         where: { leadId: id },
         data: { sentFrom: data.contactEmail } // Or whichever field holds the recipient normally
       }).catch(() => {});
    }

    await logActivity('✏️', 'outreach', `Lead updated: ${data.businessName || id}`, 'info');
    res.json({ success: true, lead: updatedLead });
  } catch (e) {
    console.error(`[Unified API] Lead Update Error:`, e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});




app.post('/api/leads/sync-scraper', async (req, res) => {
  const GATHERED_LEADS = path.join(CWD, 'public', 'collected_leads.json');
  try {
    if (!fs.existsSync(GATHERED_LEADS)) {
      return res.json({ success: true, count: 0, message: "No scraper data found." });
    }

    const raw = fs.readFileSync(GATHERED_LEADS, 'utf8');
    const leads = JSON.parse(raw);
    let count = 0;

    for (const l of leads) {
      try {
        const collectedDate = l.collectedAt ? new Date(l.collectedAt.replace(' ', 'T')) : new Date();
        const touchedDate = l.lastTouchedAt ? new Date(l.lastTouchedAt.replace(' ', 'T')) : new Date();

        const existing = await prisma.lead.findUnique({ where: { id: l.id } });
        
        // Preserve "sent" status and manual email edits
        const finalStatus = (existing?.status === 'sent' || existing?.status === 'replied') ? existing.status : l.status;
        const finalEmail = (existing?.contactEmail && existing.contactEmail !== 'N/A' && existing.contactEmail !== l.personalEmail) ? existing.contactEmail : (l.personalEmail || l.companyEmail || "N/A");

        await prisma.lead.upsert({
          where: { id: l.id },
          update: {
            businessName: l.businessName,
            niche: l.niche,
            location: l.location,
            source: l.source,
            website: l.website,
            contactEmail: finalEmail,
            competitorName: l.competitorName,
            competitorWebsite: l.competitorWebsite,
            reviewsSnapshot: l.reviewsSnapshot,
            problemTitle: l.problemTitle,
            problemDetail: l.problemDetail,
            businessImpact: l.businessImpact,
            likelyFix: l.likelyFix,
            confidence: l.confidence,
            status: finalStatus,
            collectedAt: collectedDate,
            lastTouchedAt: touchedDate,
          },
          create: {
            id: l.id,
            businessName: l.businessName,
            niche: l.niche,
            location: l.location,
            source: l.source,
            website: l.website,
            contactEmail: l.personalEmail || l.companyEmail || "N/A",
            competitorName: l.competitorName,
            competitorWebsite: l.competitorWebsite,
            reviewsSnapshot: l.reviewsSnapshot,
            problemTitle: l.problemTitle,
            problemDetail: l.problemDetail,
            businessImpact: l.businessImpact,
            likelyFix: l.likelyFix,
            confidence: l.confidence,
            status: l.status,
            collectedAt: collectedDate,
            lastTouchedAt: touchedDate,
          }
        });

        if (l.draftEmail) {
          await prisma.draftEmail.upsert({
            where: { id: l.draftEmail.id || `email-${l.id}` },
            update: {
              subject: l.draftEmail.subject,
              angle: l.draftEmail.angle,
              sentFrom: l.draftEmail.sentFrom,
              body: l.draftEmail.body,
              deliveryStatus: l.draftEmail.deliveryStatus,
            },
            create: {
              id: l.draftEmail.id || `email-${l.id}`,
              leadId: l.id,
              subject: l.draftEmail.subject,
              angle: l.draftEmail.angle,
              sentFrom: l.draftEmail.sentFrom,
              body: l.draftEmail.body,
              deliveryStatus: l.draftEmail.deliveryStatus,
            }
          });
        }
        count++;
      } catch (err) {
        console.error(`[Sync] Failed to upsert lead ${l.id}:`, err.message);
      }
    }

    await logActivity('🔄', 'outreach', `Synchronized ${count} leads from scraper output`, 'info');
    res.json({ success: true, count });
  } catch (e) {
    console.error(`[Sync] Global error:`, e.message);
    res.status(500).json({ error: e.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════
// STRATEGIC SCHEDULER — DB-Driven Heartbeat
// ═══════════════════════════════════════════════════════════════════════
function startScheduler() {
  console.log(`[Scheduler] Strategic heartbeat initialized (Interval: 1m, Source: PostgreSQL)`);

  // ── GSC Auto-Sync: Runs every 6 hours ──
  async function autoSyncGsc() {
    const GSC_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GSC_CLIENT_SECRET_VAL = process.env.GSC_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;
    const SITE_URL = process.env.WEBSITE_URL || 'https://www.fouriqtech.com';

    if (!GSC_REFRESH_TOKEN || !GSC_CLIENT_ID || !GSC_CLIENT_SECRET_VAL) return;

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: GSC_CLIENT_ID, client_secret: GSC_CLIENT_SECRET_VAL, refresh_token: GSC_REFRESH_TOKEN, grant_type: 'refresh_token' }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return;

      // Pull last 4 weeks in weekly chunks
      const today = new Date();
      let pulled = 0;
      for (let i = 0; i < 4; i++) {
        const endDate = new Date(today.getTime() - (i * 7 + 3) * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        const pageRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['page'], rowLimit: 1000 })
        });
        const pageRows = (await pageRes.json()).rows || [];

        const queryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['query'], rowLimit: 1000 })
        });
        const queryRows = (await queryRes.json()).rows || [];

        if (pageRows.length === 0 && queryRows.length === 0) continue;

        const totalClicks = pageRows.reduce((s, r) => s + r.clicks, 0);
        const totalImpressions = pageRows.reduce((s, r) => s + r.impressions, 0);
        const avgPosition = pageRows.length > 0 ? pageRows.reduce((s, r) => s + r.position, 0) / pageRows.length : 0;
        const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

        await prisma.gscDailySnapshot.upsert({
          where: { date: new Date(end) },
          update: { totalClicks, totalImpressions, avgPosition, avgCtr, pageCount: pageRows.length, topPages: pageRows.slice(0, 20), topQueries: queryRows.slice(0, 20) },
          create: { date: new Date(end), totalClicks, totalImpressions, avgPosition, avgCtr, pageCount: pageRows.length, topPages: pageRows.slice(0, 20), topQueries: queryRows.slice(0, 20) },
        });

        for (const row of pageRows) {
          const pageUrl = row.keys?.[0] || '';
          if (!pageUrl) continue;
          await prisma.gscPageMetric.upsert({
            where: { date_pageUrl: { date: new Date(end), pageUrl } },
            update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
            create: { date: new Date(end), pageUrl, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
          }).catch(() => {});
        }

        for (const row of queryRows) {
          const query = row.keys?.[0] || '';
          if (!query) continue;
          await prisma.gscQueryMetric.upsert({
            where: { date_query: { date: new Date(end), query } },
            update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
            create: { date: new Date(end), query, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
          }).catch(() => {});
        }
        pulled++;
      }
      if (pulled > 0) console.log(`[GSC Sync] ✅ Pulled ${pulled} weekly snapshots`);
    } catch (err) {
      console.error('[GSC Sync] ⚠️ Failed:', err.message);
    }
  }

  // Run GSC sync on startup, then every 6 hours
  autoSyncGsc();
  setInterval(autoSyncGsc, 6 * 60 * 60 * 1000);

  // ── Autonomous Outreach Sender: throttled, verified-only, daily-capped ──
  // Defaults OFF. Enable via settings { autoOutreach: true }. Built for
  // deliverability: business-hours only, one email per tick, random jitter,
  // hard daily cap, verified emails only, spam-scanned by sendEmailCore.
  let lastOutreachSendAt = 0;
  async function autoSendOutreach() {
    // 1. Read settings (JSON file — source of truth for agents)
    let settings = {};
    try {
      if (fs.existsSync(SETTINGS_PATH)) settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch { return; }

    const enabled = settings.autoOutreach === true || process.env.OUTREACH_AUTOSEND === 'true';
    if (!enabled) return;

    const dailyCap = Math.max(1, Math.min(50, parseInt(settings.outreachDailyCap) || parseInt(process.env.OUTREACH_DAILY_CAP) || 10));

    // 2. Business-hours gate (IST 9:00–18:00) so sends look human
    const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hour = istNow.getHours();
    if (hour < 9 || hour >= 18) return;

    // 3. Spacing gate: minimum random gap between sends (8–20 min)
    const minGapMs = (8 + Math.random() * 12) * 60 * 1000;
    if (Date.now() - lastOutreachSendAt < minGapMs) return;

    // 4. Daily cap: count emails already sent today
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    let sentToday = 0;
    try {
      sentToday = await prisma.draftEmail.count({ where: { deliveryStatus: 'sent', sentAt: { gte: startOfDay } } });
    } catch { return; }
    if (sentToday >= dailyCap) return;

    // 5. Bounce-rate safety brake: if too many bounces today, pause
    try {
      const bounced = await prisma.draftEmail.count({ where: { deliveryStatus: 'bounced', sentAt: { gte: startOfDay } } });
      if (sentToday > 5 && bounced / Math.max(1, sentToday) > 0.1) {
        logActivity('🛑', 'outreach', `Auto-send paused: bounce rate ${(bounced / sentToday * 100).toFixed(0)}% exceeds 10%`, 'error');
        return;
      }
    } catch {}

    // 6. Pick ONE eligible lead: verified email, drafted, not yet sent
    let lead;
    try {
      lead = await prisma.lead.findFirst({
        where: {
          status: 'drafted',
          confidence: 'verified',
          contactEmail: { not: null },
        },
        orderBy: { collectedAt: 'asc' },
        include: { draftEmail: true },
      });
    } catch (e) {
      // draftEmail relation name may differ; fall back to separate query
      lead = await prisma.lead.findFirst({
        where: { status: 'drafted', confidence: 'verified', contactEmail: { not: null } },
        orderBy: { collectedAt: 'asc' },
      }).catch(() => null);
    }
    if (!lead) return;

    let draft = lead.draftEmail;
    if (!draft) {
      draft = await prisma.draftEmail.findUnique({ where: { leadId: lead.id } }).catch(() => null);
    }
    if (!draft || draft.deliveryStatus !== 'draft') return;

    // 7. Send via shared core (applies all deliverability safeguards)
    try {
      const result = await sendEmailCore({
        to: lead.contactEmail,
        subject: draft.subject,
        htmlBody: draft.body,
        fromName: 'Karm Joshi',
        leadId: lead.id,
      });
      lastOutreachSendAt = Date.now();
      if (result.success) {
        console.log(`[Auto-Outreach] ✅ Sent ${sentToday + 1}/${dailyCap} → ${lead.businessName} (${lead.contactEmail})`);
      } else if (result.blocked) {
        // Mark blocked drafts so we don't retry them forever
        await prisma.draftEmail.update({ where: { leadId: lead.id }, data: { deliveryStatus: 'blocked' } }).catch(() => {});
        logActivity('⚠️', 'outreach', `Auto-send skipped ${lead.businessName}: ${result.error}`, 'error');
      }
    } catch (e) {
      console.error(`[Auto-Outreach] Send failed for ${lead.businessName}: ${e.message}`);
    }
  }

  // Check every 5 minutes; internal gates handle real pacing.
  setInterval(autoSendOutreach, 5 * 60 * 1000);

  setInterval(async () => {
    let config;
    try {
      config = await prisma.agencyConfig.findUnique({ where: { id: 'default' } });
    } catch { return; }

    if (!config || !config.isAutoPilot) return;

    // Convert server UTC time to IST (India Standard Time)
    const now = new Date();
    const istTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istTime = new Date(istTimeString);

    const startTime = config.startTime || "10:00";
    const startHour = parseInt(startTime.split(':')[0]);
    const startMin = parseInt(startTime.split(':')[1]);
    const intervalHours = 24 / (config.cyclesPerDay || 1);

    const currentTotalMinutes = (istTime.getHours() * 60) + istTime.getMinutes();

    let shouldTrigger = false;

    for (let i = 0; i < config.cyclesPerDay; i++) {
      const targetHour = (startHour + (i * intervalHours)) % 24;
      const targetTotalMinutes = (Math.floor(targetHour) * 60) + startMin;

      let diffMinutes = currentTotalMinutes - targetTotalMinutes;
      if (diffMinutes < 0) diffMinutes += (24 * 60);

      if (diffMinutes >= 0 && diffMinutes <= 15) {
        shouldTrigger = true;
        break;
      }
    }

    if (shouldTrigger) {
      const lastRun = config.lastRunAt ? new Date(config.lastRunAt).getTime() : 0;
      const oneHour = 60 * 60 * 1000;

      if (Date.now() - lastRun > oneHour) {
        console.log(`[Scheduler] 🚀 TIME TRIGGER MATCHED. Dispatching Director Cycle.`);
        logActivity('🚀', 'scheduler', `Time trigger matched. Strategic Auto-Pilot activated.`, 'info');

        // Update last run in DB
        await prisma.agencyConfig.update({
          where: { id: 'default' },
          data: { lastRunAt: new Date() }
        });

        triggerDirectorCycle(null, null, 'AUTO-PILOT');
      }
    }
  }, 60000);
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 LIVE PUBLISHING LOGIC — DB-Native
// ═══════════════════════════════════════════════════════════════════════

async function publishApprovedItem(item) {
  try {
    if (item.type === 'blog_post') {
      const content = item.content || '';
      const slug = content.match(/slug:\s*'([^']+)'/)?.[1] || `post-${Date.now()}`;
      const title = content.match(/title:\s*'([^']+)'/)?.[1] || item.title;
      const excerpt = content.match(/excerpt:\s*'([^']+)'/)?.[1] || '';
      const date = content.match(/date:\s*'([^']+)'/)?.[1] || new Date().toISOString().split('T')[0];
      const category = content.match(/category:\s*'([^']+)'/)?.[1] || 'Engineering';
      const author = content.match(/author:\s*'([^']+)'/)?.[1] || 'FouriqTech Engineering';
      const readTime = content.match(/readTime:\s*'([^']+)'/)?.[1] || '5 min read';
      const imageUrl = content.match(/imageUrl:\s*'([^']+)'/)?.[1] || null;
      const htmlContent = content.match(/content:\s*`([\s\S]*)`/)?.[1]?.trim() || content;

      await prisma.blogPost.upsert({
        where: { slug },
        update: { title, excerpt, content: htmlContent, imageUrl, isLive: true },
        create: {
          slug, title, excerpt, date, readTime,
          category, author, content: htmlContent, imageUrl, isLive: true,
        }
      });
      console.log(`   📦 Blog → DB: "${title}" (isLive: true)`);
    }

    if (item.type === 'structural_page' || item.type === 'landing_page') {
      const payload = JSON.parse(item.content || '{}');
      const slug = payload.route?.replace('/services/', '') || `page-${Date.now()}`;

      await prisma.servicePage.upsert({
        where: { slug },
        update: { component: payload.code || '', isLive: true },
        create: {
          slug,
          title: item.title,
          component: payload.code || '',
          route: payload.route || `/services/${slug}`,
          isLive: true,
        }
      });
      console.log(`   🏗️ Page → DB: "${item.title}" (isLive: true)`);
    }
  } catch (err) {
    console.error('❌ Failed to publish item:', err.message);
    logActivity('❌', 'publisher', `Failed to publish: ${err.message}`, 'error');
  }
}


// ═══════════════════════════════════════════════════════════════════════
// 📝 BLOG POSTS API — DB-driven content
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/blogs', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, title: true, excerpt: true, imageUrl: true,
        date: true, readTime: true, category: true, author: true,
        metaTitle: true, metaDesc: true, createdAt: true
      }
    });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug }
    });
    if (!post || !post.isLive) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 🏗️ SERVICE PAGES API — Dynamic landing pages
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/services', async (req, res) => {
  try {
    const pages = await prisma.servicePage.findMany({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, title: true, route: true,
        metaTitle: true, metaDesc: true, createdAt: true
      }
    });
    res.json({ pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/services/:slug', async (req, res) => {
  try {
    const page = await prisma.servicePage.findUnique({
      where: { slug: req.params.slug }
    });
    if (!page || !page.isLive) return res.status(404).json({ error: 'Page not found' });
    res.json({ page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ⚙️ AGENCY CONFIG API — DB-driven settings (replaces JSON file)
// ═══════════════════════════════════════════════════════════════════════

app.get(['/api/config', '/api/settings'], async (req, res) => {
  try {
    let config = await prisma.agencyConfig.findUnique({ where: { id: 'default' } });
    if (!config) {
      config = await prisma.agencyConfig.create({
        data: { id: 'default' }
      });
    }
    if (!config.agentModels) config.agentModels = {};
    
    // Merge apiMode from JSON settings (not stored in DB)
    let apiMode = 'free';
    try {
      const settingsPath = path.join(CWD, '.github/staging/system-settings.json');
      if (fs.existsSync(settingsPath)) {
        const jsonSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        apiMode = jsonSettings.apiMode || 'free';
      }
    } catch {}
    
    res.json({ ...config, apiMode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/config', '/api/settings'], async (req, res) => {
  try {
    const { isAutoPilot, isAutoCommit, startTime, cyclesPerDay, agentModels, apiMode, autoOutreach, outreachDailyCap } = req.body;
    const config = await prisma.agencyConfig.upsert({
      where: { id: 'default' },
      update: {
        ...(isAutoPilot !== undefined && { isAutoPilot }),
        ...(isAutoCommit !== undefined && { isAutoCommit }),
        ...(startTime && { startTime }),
        ...(cyclesPerDay && { cyclesPerDay }),
        ...(agentModels !== undefined && { agentModels }),
      },
      create: { 
        id: 'default',
        isAutoCommit: isAutoCommit !== undefined ? isAutoCommit : false,
        ...(agentModels !== undefined && { agentModels })
      }
    });

    // Mirror to JSON to ensure agency-core.mjs (and agents) can read it cleanly
    const settingsPath = path.join(CWD, '.github/staging/system-settings.json');
    let currentSettings = {};
    try {
      if (fs.existsSync(settingsPath)) currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch(e) {}
    
    // Build merged settings: keep existing JSON values, overlay DB config, then set apiMode
    const dbFields = {
      isAutoPilot: config.isAutoPilot,
      isAutoCommit: config.isAutoCommit,
      startTime: config.startTime,
      cyclesPerDay: config.cyclesPerDay,
      lastRunAt: config.lastRunAt,
      agentModels: config.agentModels,
    };
    const merged = { ...currentSettings, ...dbFields };
    // apiMode is JSON-only (not in DB schema) — always preserve/update it
    if (apiMode !== undefined) {
      merged.apiMode = apiMode;
    }
    // Autonomous outreach settings (JSON-only). Default OFF until DNS auth is ready.
    if (autoOutreach !== undefined) merged.autoOutreach = !!autoOutreach;
    if (outreachDailyCap !== undefined) merged.outreachDailyCap = Math.max(1, Math.min(50, parseInt(outreachDailyCap) || 10));
    
    fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2));

    await logActivity('⚙️', 'system', `Config updated${apiMode ? ` (API Mode: ${apiMode})` : ''}`, 'info');
    res.json({ success: true, settings: { ...merged } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 📸 SOCIAL MEDIA API — Instagram Hub
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/social/posts', async (req, res) => {
  try {
    const posts = await prisma.socialPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/social/posts/draft', (req, res) => {
  const script = '.github/scripts/instagram-agent.mjs';
  console.log(`[Unified API] DISPATCH: Instagram Social Brain triggered`);
  logActivity('🧠', 'social', 'Instagram Content Brain dispatched', 'info');

  const child = spawn('node', [script], { stdio: 'inherit' });
  res.json({ success: true, message: "Social Brain dispatched. Check activity feed." });
});

app.post('/api/social/posts/:id/generate', async (req, res) => {
  const { id } = req.params;
  console.log(`[Unified API] 🎨 VISUALIZER: Generating graphic for post ${id}`);
  logActivity('🎨', 'social', `Visual generation started for post ${id}`, 'info');

  const script = '.github/scripts/social-visualizer.mjs';
  const child = spawn('node', [script, id], { stdio: 'inherit' });
  
  res.json({ success: true, message: "Visual generation dispatched. View progress in logs." });
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/publish — Run publisher logic in-process (GitHub API)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/publish', async (req, res) => {
  console.log('\n🚀 PUBLISH: Triggered via API...');
  
  try {
    // Dynamic import of github-api module
    const { githubGetFile, githubCommitMultiple } = await import('./github-api.mjs');
    
    const approved = await prisma.stagingItem.findMany({ where: { status: 'approved' } });
    if (approved.length === 0) {
      return res.json({ success: true, message: 'No items to publish' });
    }

    const filesToCommit = [];
    let publishedCount = 0;

    for (const item of approved) {
      try {
        if (item.type === 'blog_post') {
          // Blog → DB only
          const content = item.content || '';
          const slug = content.match(/slug:\s*'([^']+)'/)?.[1] || `post-${Date.now()}`;
          const title = content.match(/title:\s*'([^']+)'/)?.[1] || item.title;
          const excerpt = content.match(/excerpt:\s*'([^']+)'/)?.[1] || '';
          const date = content.match(/date:\s*'([^']+)'/)?.[1] || new Date().toISOString().split('T')[0];
          const imageUrl = content.match(/imageUrl:\s*'([^']+)'/)?.[1] || null;
          const htmlContent = content.match(/content:\s*`([\s\S]*)`/)?.[1]?.trim() || content;

          if (htmlContent.length >= 200) {
            await prisma.blogPost.upsert({
              where: { slug },
              update: { title, excerpt, content: htmlContent, imageUrl, isLive: true },
              create: { slug, title, excerpt, date, readTime: '5 min read', category: 'Engineering', author: 'FouriqTech Engineering', content: htmlContent, imageUrl, isLive: true }
            });
          }

        } else if (item.type === 'landing_page' || item.type === 'structural_page') {
          // Landing page → DB + GitHub push
          const payload = JSON.parse(item.content || '{}');
          const slug = payload.route?.replace('/services/', '') || `page-${Date.now()}`;
          const componentName = payload.component_name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
          let code = payload.code || '';
          try { const inner = JSON.parse(code); code = inner.content || inner.code || code; } catch {}

          if (code.length >= 100) {
            await prisma.servicePage.upsert({
              where: { slug },
              update: { component: code, isLive: true },
              create: { slug, title: item.title, component: code, route: payload.route || `/services/${slug}`, isLive: true }
            });

            // Queue file for GitHub
            const targetFile = payload.target_file || `src/pages/services/${componentName}.tsx`;
            filesToCommit.push({ path: targetFile, content: code });

            // Update App.tsx with route
            const appFile = await githubGetFile('src/App.tsx');
            if (appFile.exists && !appFile.content.includes(`path="${payload.route}"`)) {
              let appCode = appFile.content;
              const importLine = `import ${componentName} from "./pages/services/${componentName}";\n`;
              const lines = appCode.split('\n');
              let lastImport = 0;
              for (let i = 0; i < lines.length; i++) { if (lines[i].trimStart().startsWith('import ')) lastImport = i; }
              if (!appCode.includes(componentName)) { lines.splice(lastImport + 1, 0, importLine); appCode = lines.join('\n'); }
              const route = `              <Route path="${payload.route}" element={<${componentName} />} />`;
              appCode = appCode.replace(/(\s*<Route\s+path="\*")/, `${route}\n$1`);
              filesToCommit.push({ path: 'src/App.tsx', content: appCode });
            }
          }

        } else if (item.type === 'technical_patch') {
          const payload = JSON.parse(item.content || '{}');
          if (payload.target_file && payload.code) {
            const targetFile = payload.target_file.startsWith('/') ? payload.target_file.slice(1) : payload.target_file;
            filesToCommit.push({ path: targetFile, content: payload.code });
          }
        }

        await prisma.stagingItem.update({ where: { id: item.id }, data: { status: 'published', publishedAt: new Date() } });
        publishedCount++;
      } catch (e) {
        console.error(`   ❌ Failed: ${item.id} — ${e.message}`);
      }
    }

    // Push all files in one atomic commit
    if (filesToCommit.length > 0) {
      const result = await githubCommitMultiple(filesToCommit, `[AI-PUBLISH] Deployed ${publishedCount} improvement(s)`);
      if (result.success) {
        await logActivity('🐙', 'publisher', `Pushed ${filesToCommit.length} files → ${result.sha?.substring(0, 7)}`, 'publish');
        console.log(`   ✅ GitHub push: ${result.sha?.substring(0, 7)}`);
      } else {
        await logActivity('❌', 'publisher', `Push failed: ${result.error}`, 'error');
      }
    }

    await logActivity('🚀', 'publisher', `Published ${publishedCount} items`, 'publish');
    res.json({ success: true, published: publishedCount, pushed: filesToCommit.length });
  } catch (e) {
    console.error('Publisher error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 📊 GET /api/gsc/analytics — Full GSC analytics data for dashboard graphs
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/gsc/analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // 1. Check if we have fresh data — if not, pull live from GSC
    const latestSnapshot = await prisma.gscDailySnapshot.findFirst({ orderBy: { date: 'desc' } });
    const isStale = !latestSnapshot || (Date.now() - new Date(latestSnapshot.date).getTime()) > 24 * 60 * 60 * 1000;

    if (isStale) {
      // Auto-pull live data from Google Search Console
      const GSC_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const GSC_CLIENT_SECRET_VAL = process.env.GSC_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
      const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;
      const SITE_URL = process.env.WEBSITE_URL || 'https://www.fouriqtech.com';

      if (GSC_REFRESH_TOKEN && GSC_CLIENT_ID && GSC_CLIENT_SECRET_VAL) {
        try {
          // Get access token
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: GSC_CLIENT_ID, client_secret: GSC_CLIENT_SECRET_VAL, refresh_token: GSC_REFRESH_TOKEN, grant_type: 'refresh_token' }),
          });
          const tokenData = await tokenRes.json();

          if (tokenData.access_token) {
            // Pull weekly chunks for the requested period
            const today = new Date();
            const pullWeeks = Math.ceil(days / 7);
            
            for (let i = 0; i < pullWeeks; i++) {
              const endDate = new Date(today.getTime() - (i * 7 + 3) * 24 * 60 * 60 * 1000);
              const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
              const start = startDate.toISOString().split('T')[0];
              const end = endDate.toISOString().split('T')[0];

              // Check if we already have this snapshot
              const existing = await prisma.gscDailySnapshot.findUnique({ where: { date: new Date(end) } });
              if (existing) continue;

              const pageRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['page'], rowLimit: 1000 })
              });
              const pageData = await pageRes.json();
              const pageRows = pageData.rows || [];

              const queryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['query'], rowLimit: 1000 })
              });
              const queryData = await queryRes.json();
              const queryRows = queryData.rows || [];

              if (pageRows.length === 0 && queryRows.length === 0) continue;

              const totalClicks = pageRows.reduce((s, r) => s + r.clicks, 0);
              const totalImpressions = pageRows.reduce((s, r) => s + r.impressions, 0);
              const avgPosition = pageRows.length > 0 ? pageRows.reduce((s, r) => s + r.position, 0) / pageRows.length : 0;
              const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

              await prisma.gscDailySnapshot.upsert({
                where: { date: new Date(end) },
                update: { totalClicks, totalImpressions, avgPosition, avgCtr, pageCount: pageRows.length, topPages: pageRows.slice(0, 20), topQueries: queryRows.slice(0, 20) },
                create: { date: new Date(end), totalClicks, totalImpressions, avgPosition, avgCtr, pageCount: pageRows.length, topPages: pageRows.slice(0, 20), topQueries: queryRows.slice(0, 20) },
              });

              for (const row of pageRows) {
                const pageUrl = row.keys?.[0] || '';
                if (!pageUrl) continue;
                await prisma.gscPageMetric.upsert({
                  where: { date_pageUrl: { date: new Date(end), pageUrl } },
                  update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
                  create: { date: new Date(end), pageUrl, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
                }).catch(() => {});
              }

              for (const row of queryRows) {
                const query = row.keys?.[0] || '';
                if (!query) continue;
                await prisma.gscQueryMetric.upsert({
                  where: { date_query: { date: new Date(end), query } },
                  update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
                  create: { date: new Date(end), query, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
                }).catch(() => {});
              }
            }
            console.log(`   📊 GSC auto-pull complete for ${pullWeeks} weeks`);
          }
        } catch (gscErr) {
          console.error('   ⚠️ GSC auto-pull failed (non-critical):', gscErr.message);
        }
      }
    }

    // 2. Now read from DB (freshly populated or cached)
    const snapshots = await prisma.gscDailySnapshot.findMany({
      where: { date: { gte: since } },
      orderBy: { date: 'asc' },
      select: { date: true, totalClicks: true, totalImpressions: true, avgPosition: true, avgCtr: true, pageCount: true }
    });

    // 3. Top pages (aggregated over period)
    const topPages = await prisma.gscPageMetric.groupBy({
      by: ['pageUrl'],
      where: { date: { gte: since } },
      _sum: { clicks: true, impressions: true },
      _avg: { position: true, ctr: true },
      orderBy: { _sum: { clicks: 'desc' } },
      take: 20,
    });

    // 4. Top queries (aggregated over period)
    const topQueries = await prisma.gscQueryMetric.groupBy({
      by: ['query'],
      where: { date: { gte: since } },
      _sum: { clicks: true, impressions: true },
      _avg: { position: true, ctr: true },
      orderBy: { _sum: { clicks: 'desc' } },
      take: 20,
    });

    // 5. Recent insights
    const insights = await prisma.gscInsight.findMany({
      where: { generatedAt: { gte: since } },
      orderBy: { generatedAt: 'desc' },
      take: 10,
    });

    // 6. Summary totals
    const totalClicks = snapshots.reduce((s, r) => s + r.totalClicks, 0);
    const totalImpressions = snapshots.reduce((s, r) => s + r.totalImpressions, 0);
    const avgPosition = snapshots.length > 0 ? snapshots.reduce((s, r) => s + r.avgPosition, 0) / snapshots.length : 0;
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

    // 7. Comparison with previous period for delta
    const prevStart = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
    const prevSnapshots = await prisma.gscDailySnapshot.findMany({
      where: { date: { gte: prevStart, lt: since } },
      select: { totalClicks: true, totalImpressions: true, avgPosition: true }
    });
    const prevClicks = prevSnapshots.reduce((s, r) => s + r.totalClicks, 0);
    const prevImpressions = prevSnapshots.reduce((s, r) => s + r.totalImpressions, 0);
    const prevPosition = prevSnapshots.length > 0 ? prevSnapshots.reduce((s, r) => s + r.avgPosition, 0) / prevSnapshots.length : 0;

    res.json({
      period: { days, since: since.toISOString() },
      summary: {
        totalClicks,
        totalImpressions,
        avgPosition: +avgPosition.toFixed(1),
        avgCtr: +(avgCtr * 100).toFixed(2),
        pageCount: snapshots.length > 0 ? snapshots[snapshots.length - 1].pageCount : 0,
      },
      delta: {
        clicks: prevClicks > 0 ? +(((totalClicks - prevClicks) / prevClicks) * 100).toFixed(1) : null,
        impressions: prevImpressions > 0 ? +(((totalImpressions - prevImpressions) / prevImpressions) * 100).toFixed(1) : null,
        position: prevPosition > 0 ? +(prevPosition - avgPosition).toFixed(1) : null,
      },
      timeSeries: snapshots.map(s => ({
        date: s.date.toISOString().split('T')[0],
        clicks: s.totalClicks,
        impressions: s.totalImpressions,
        position: +s.avgPosition.toFixed(1),
        ctr: +(s.avgCtr * 100).toFixed(2),
      })),
      topPages: topPages.map(p => ({
        page: p.pageUrl.replace('https://www.fouriqtech.com', ''),
        clicks: p._sum.clicks,
        impressions: p._sum.impressions,
        position: +(p._avg.position || 0).toFixed(1),
        ctr: +((p._avg.ctr || 0) * 100).toFixed(2),
      })),
      topQueries: topQueries.map(q => ({
        query: q.query,
        clicks: q._sum.clicks,
        impressions: q._sum.impressions,
        position: +(q._avg.position || 0).toFixed(1),
        ctr: +((q._avg.ctr || 0) * 100).toFixed(2),
      })),
      insights: insights.map(i => ({
        type: i.type,
        text: i.insightText,
        page: i.pageUrl,
        query: i.query,
        confidence: i.confidence,
        date: i.generatedAt.toISOString().split('T')[0],
      })),
    });
  } catch (err) {
    console.error('GSC Analytics error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 🔄 POST /api/gsc/refresh — Force-pull LIVE daily data from GSC API
// ═══════════════════════════════════════════════════════════════════════
// Unlike the auto-sync (weekly chunks), this pulls daily-level data
// for the freshest possible view. GSC has a ~48-72h delay from Google's side,
// so "live" means the most recent data Google has available.
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/gsc/refresh', async (req, res) => {
  const days = parseInt(req.query.days) || 30;

  const GSC_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GSC_CLIENT_SECRET_VAL = process.env.GSC_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;
  const SITE_URL = process.env.WEBSITE_URL || 'https://www.fouriqtech.com';

  if (!GSC_REFRESH_TOKEN || !GSC_CLIENT_ID || !GSC_CLIENT_SECRET_VAL) {
    return res.status(400).json({ error: 'GSC credentials not configured' });
  }

  try {
    // 1. Get fresh access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: GSC_CLIENT_ID, client_secret: GSC_CLIENT_SECRET_VAL, refresh_token: GSC_REFRESH_TOKEN, grant_type: 'refresh_token' }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'Failed to get GSC access token', details: tokenData.error });
    }

    // 2. Pull DAILY data for the entire period (most granular possible)
    const today = new Date();
    // GSC data is delayed ~3 days, so end date is today - 3
    const endDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    // 3. Pull page-level data with DATE dimension for daily granularity
    const dailyRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['date'], rowLimit: 25000 })
    });
    const dailyData = await dailyRes.json();
    const dailyRows = dailyData.rows || [];

    // 4. Pull page-level aggregated
    const pageRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['page'], rowLimit: 1000 })
    });
    const pageData = await pageRes.json();
    const pageRows = pageData.rows || [];

    // 5. Pull query-level aggregated
    const queryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['query'], rowLimit: 1000 })
    });
    const queryData = await queryRes.json();
    const queryRows = queryData.rows || [];

    // 6. Store daily snapshots in DB
    let upsertedDays = 0;
    for (const row of dailyRows) {
      const dateStr = row.keys[0];
      const dateObj = new Date(dateStr);
      await prisma.gscDailySnapshot.upsert({
        where: { date: dateObj },
        update: { totalClicks: row.clicks, totalImpressions: row.impressions, avgPosition: row.position, avgCtr: row.ctr, pageCount: pageRows.length },
        create: { date: dateObj, totalClicks: row.clicks, totalImpressions: row.impressions, avgPosition: row.position, avgCtr: row.ctr, pageCount: pageRows.length },
      });
      upsertedDays++;
    }

    // 7. Store page metrics (daily by page)
    const pageDateRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['date', 'page'], rowLimit: 25000 })
    });
    const pageDateData = await pageDateRes.json();
    for (const row of (pageDateData.rows || [])) {
      const [dateStr, pageUrl] = row.keys;
      await prisma.gscPageMetric.upsert({
        where: { date_pageUrl: { date: new Date(dateStr), pageUrl } },
        update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
        create: { date: new Date(dateStr), pageUrl, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
      }).catch(() => {});
    }

    // 8. Store query metrics (daily by query)
    const queryDateRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['date', 'query'], rowLimit: 25000 })
    });
    const queryDateData = await queryDateRes.json();
    for (const row of (queryDateData.rows || [])) {
      const [dateStr, query] = row.keys;
      await prisma.gscQueryMetric.upsert({
        where: { date_query: { date: new Date(dateStr), query } },
        update: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
        create: { date: new Date(dateStr), query, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
      }).catch(() => {});
    }

    // 9. Build response with live data (not from DB, directly from what we just pulled)
    const totalClicks = dailyRows.reduce((s, r) => s + r.clicks, 0);
    const totalImpressions = dailyRows.reduce((s, r) => s + r.impressions, 0);
    const avgPosition = dailyRows.length > 0 ? dailyRows.reduce((s, r) => s + r.position, 0) / dailyRows.length : 0;
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

    // 10. Get previous period for delta comparison
    const prevEnd = startDate.toISOString().split('T')[0];
    const prevStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    let prevClicks = 0, prevImpressions = 0, prevPosition = 0;
    try {
      const prevRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: prevStart, endDate: prevEnd, dimensions: ['date'], rowLimit: 25000 })
      });
      const prevData = await prevRes.json();
      const prevRows = prevData.rows || [];
      prevClicks = prevRows.reduce((s, r) => s + r.clicks, 0);
      prevImpressions = prevRows.reduce((s, r) => s + r.impressions, 0);
      prevPosition = prevRows.length > 0 ? prevRows.reduce((s, r) => s + r.position, 0) / prevRows.length : 0;
    } catch (_) {}

    console.log(`   📊 GSC Force Refresh: ${upsertedDays} daily snapshots, ${pageRows.length} pages, ${queryRows.length} queries`);

    res.json({
      refreshed: true,
      pulledAt: new Date().toISOString(),
      dataRange: { start, end, note: 'GSC data has ~48-72h delay from Google. This is the freshest available.' },
      period: { days, since: startDate.toISOString() },
      summary: {
        totalClicks,
        totalImpressions,
        avgPosition: +avgPosition.toFixed(1),
        avgCtr: +(avgCtr * 100).toFixed(2),
        pageCount: pageRows.length,
      },
      delta: {
        clicks: prevClicks > 0 ? +(((totalClicks - prevClicks) / prevClicks) * 100).toFixed(1) : null,
        impressions: prevImpressions > 0 ? +(((totalImpressions - prevImpressions) / prevImpressions) * 100).toFixed(1) : null,
        position: prevPosition > 0 ? +(prevPosition - avgPosition).toFixed(1) : null,
      },
      timeSeries: dailyRows.map(r => ({
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        position: +r.position.toFixed(1),
        ctr: +(r.ctr * 100).toFixed(2),
      })).sort((a, b) => a.date.localeCompare(b.date)),
      topPages: pageRows.slice(0, 20).map(r => ({
        page: (r.keys?.[0] || '').replace('https://www.fouriqtech.com', ''),
        clicks: r.clicks,
        impressions: r.impressions,
        position: +r.position.toFixed(1),
        ctr: +(r.ctr * 100).toFixed(2),
      })),
      topQueries: queryRows.slice(0, 20).map(r => ({
        query: r.keys?.[0] || '',
        clicks: r.clicks,
        impressions: r.impressions,
        position: +r.position.toFixed(1),
        ctr: +(r.ctr * 100).toFixed(2),
      })),
      insights: [],
    });
  } catch (err) {
    console.error('GSC Force Refresh error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  startScheduler();
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log(`║  👔 AGENCY API v3 — Full DB-Driven — Port ${PORT}              ║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  POST /api/dispatch/:dept        → Non-blocking dispatch    ║');
  console.log('║  POST /api/director/cycle         → Full Director cycle     ║');
  console.log('║  GET  /api/staging                → Staging queue           ║');
  console.log('║  POST /api/staging/:id/review     → Approve/Reject item    ║');
  console.log('║  GET  /api/staging/:id/content    → Read draft content      ║');
  console.log('║  GET  /api/activity               → Real-time feed         ║');
  console.log('║  GET  /api/tasks                  → Running tasks          ║');
  console.log('║  GET  /api/status                 → Agency health          ║');
  console.log('║  GET  /api/journal                → Decision history       ║');
  console.log('║  GET  /api/blogs                  → Live blog posts        ║');
  console.log('║  GET  /api/blogs/:slug            → Single blog post       ║');
  console.log('║  GET  /api/services               → Live service pages     ║');
  console.log('║  GET  /api/services/:slug         → Single service page    ║');
  console.log('║  GET  /api/config                 → Agency configuration   ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
});
