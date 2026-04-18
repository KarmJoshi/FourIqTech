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

    if (verdict === 'approved') {
      await publishApprovedItem(item);
    }

    const emoji = verdict === 'approved' ? '✅' : '❌';
    await logActivity(emoji, 'manager', `${verdict.toUpperCase()}: "${item.title}" — ${feedback || 'No comment'}`, 'review');

    res.json({ success: true, item });

    if (verdict === 'approved') {
      const publisher = spawn('node', ['.github/scripts/publisher.mjs'], { stdio: 'ignore' });
      publisher.unref();
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
  lead_hunter: 'lead-hunter.mjs'
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

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body: emailBody, fromName, leadId } = req.body;
    console.log(`[Unified API] SENDING EMAIL TO: ${to}`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const info = await transporter.sendMail({
      from: `"${fromName || 'FourIqTech Team'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: emailBody
    });

    // Persistent Status Update in Database
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { 
          status: 'sent', 
          lastTouchedAt: new Date(),
          contactEmail: to // Preserve the corrected email
        }
      });
      await prisma.draftEmail.update({
        where: { leadId: leadId },
        data: { deliveryStatus: 'sent', sentAt: new Date() }
      });
    }

    logActivity('📧', 'outreach', `Email successfully sent to ${to}`, 'info');
    res.json({ success: true, messageId: info.messageId });
  } catch (e) {
    console.error(`[Unified API] ERROR SENDING EMAIL: ${e.message}`);
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

    const contentPath = item.draftPath || item.codePath || item.diffPath;
    if (!contentPath) return res.json({ content: 'No content file associated.' });

    const fullPath = path.join(CWD, contentPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content, path: contentPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET/POST /api/settings — DB-Driven Auto-Pilot Settings
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/settings', async (req, res) => {
  try {
    // Try JSON file first
    const settingsPath = path.join(CWD, '.github/staging/system-settings.json');
    if (fs.existsSync(settingsPath)) {
      const jsonSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      return res.json(jsonSettings);
    }
    // Fallback to database
    let config = await prisma.agencyConfig.findUnique({ where: { id: 'default' } });
    if (!config) {
      config = await prisma.agencyConfig.create({ data: { id: 'default' } });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { isAutoPilot, startTime, cyclesPerDay, agentModels } = req.body;
    
    // Upsert to database
    const config = await prisma.agencyConfig.upsert({
      where: { id: 'default' },
      update: {
        ...(isAutoPilot !== undefined && { isAutoPilot }),
        ...(startTime && { startTime }),
        ...(cyclesPerDay && { cyclesPerDay }),
        ...(agentModels && { agentModels }),
      },
      create: { id: 'default' }
    });
    
    // Also save to JSON file for scripts to read
    const settingsPath = path.join(CWD, '.github/staging/system-settings.json');
    const existing = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {};
    const updated = { ...existing, isAutoPilot, startTime, cyclesPerDay, agentModels };
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));
    
    await logActivity('⚙️', 'system', 'Strategic Auto-Pilot settings updated', 'info');
    res.json({ success: true, settings: config });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

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

        await prisma.lead.upsert({
          where: { id: l.id },
          update: {
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
      const htmlContent = content.match(/content:\s*`([\s\S]*)`/)?.[1]?.trim() || content;

      await prisma.blogPost.upsert({
        where: { slug },
        update: { title, excerpt, content: htmlContent, isLive: true },
        create: {
          slug, title, excerpt, date, readTime,
          category, author, content: htmlContent, isLive: true,
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
        id: true, slug: true, title: true, excerpt: true,
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
    // Ensure agentModels is an object if null
    if (!config.agentModels) config.agentModels = {};
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/config', '/api/settings'], async (req, res) => {
  try {
    const { isAutoPilot, isAutoCommit, startTime, cyclesPerDay, agentModels } = req.body;
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
    
    fs.writeFileSync(settingsPath, JSON.stringify({ ...currentSettings, ...config }, null, 2));

    await logActivity('⚙️', 'system', 'Agency config updated via API', 'info');
    res.json({ success: true, settings: config, config });
  } catch (err) {
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
