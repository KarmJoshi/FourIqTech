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

import nodemailer from 'nodemailer';
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

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
const DIRECTOR_ORDERS  = path.join(CWD, '.github/director_orders.json');
const STAGING_PATH     = path.join(CWD, '.github/staging/staging.json');
const ACTIVITY_PATH    = path.join(CWD, '.github/staging/activity_log.json');
const PUBLISH_LOG      = path.join(CWD, '.github/publish_log.json');
const TECH_LOG         = path.join(CWD, '.github/technical_seo_log.json');
const BLOG_DATA        = path.join(CWD, 'src/data/blogPosts.ts');
const APP_TSX          = path.join(CWD, 'src/App.tsx');
const SEO_MEMORY_DIR   = path.join(CWD, '.github/seo-memory');
const OPPORTUNITY_PATH = path.join(SEO_MEMORY_DIR, 'latest-opportunities.json');
const TASK_REGISTRY    = path.join(SEO_MEMORY_DIR, 'task-registry.json');
const PLAYBOOK_SCORES  = path.join(SEO_MEMORY_DIR, 'playbook-scores.json');
const OUTCOME_HISTORY  = path.join(SEO_MEMORY_DIR, 'outcome-history.json');
const COMPETITOR_INTEL = path.join(SEO_MEMORY_DIR, 'competitor-intelligence.json');
const SETTINGS_PATH     = path.join(CWD, '.github/staging/system-settings.json');

// ── Department Scripts ──
const DEPARTMENTS = {
  content:    '.github/scripts/seo-auto-poster.mjs',
  structural: '.github/scripts/seo-dev-agent.mjs',
  technical:  '.github/scripts/technical-seo-agent.mjs',
};

// Track running tasks
const runningTasks = {};

// ── Helper: Read JSON safely ──
function readJson(filePath, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

// ── Helper: Log activity ──
function logActivity(emoji, source, message, type = 'info') {
  const log = readJson(ACTIVITY_PATH, { entries: [] });
  log.entries.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    emoji,
    source,
    message,
    type,
    timestamp: new Date().toISOString(),
  });
  log.entries = log.entries.slice(0, 200);
  const dir = path.dirname(ACTIVITY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ACTIVITY_PATH, JSON.stringify(log, null, 2));
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
app.post('/api/director/cycle', (req, res) => {
  if (runningTasks['director']) {
    return res.json({ success: false, message: 'Director cycle is already running.', status: 'busy' });
  }

  console.log(`\n👔 DIRECTOR CYCLE triggered via API`);
  logActivity('👔', 'manager', 'Director strategic cycle started', 'info');

  const child = spawn('node', ['--env-file=.env', '.github/scripts/agency-director.mjs'], {
    cwd: CWD,
    stdio: ['pipe', 'pipe', 'pipe'],
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

  setTimeout(() => {
    if (runningTasks['director']?.id === taskId) {
      child.kill();
      delete runningTasks['director'];
    }
  }, 900000); // 15 min max

  res.json({ success: true, message: 'Director cycle started. Running in background.', taskId, status: 'running' });
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/staging — Staging queue
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/staging', (req, res) => {
  res.json(readJson(STAGING_PATH, { queue: [], stats: {} }));
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/staging — Submit work to the queue
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/staging', async (req, res) => {
  const { type, department, title, content, summary, metadata } = req.body;
  const staging = readJson(STAGING_PATH, { queue: [], stats: {} });
  
  const id = `stg-${(staging.queue.length + 1).toString().padStart(3, '0')}`;
  
  // Also save the raw content to a temp file for previewing if it's large
  const contentFilename = `${id}_${Date.now()}.txt`;
  const contentPath = path.join('.github/staging/drafts', contentFilename);
  const fullContentPath = path.join(CWD, contentPath);
  
  if (!fs.existsSync(path.dirname(fullContentPath))) {
    fs.mkdirSync(path.dirname(fullContentPath), { recursive: true });
  }
  
  fs.writeFileSync(fullContentPath, content || '');

  const newItem = {
    id,
    type: type || 'other',
    department: department || 'Unknown',
    status: 'pending_review',
    created_at: new Date().toISOString(),
    title: title || 'Untitled Submission',
    content: content || '', // Keep small previews in JSON
    draft_path: contentPath,
    summary: summary || {},
    metadata: metadata || {},
    manager_review: null,
    revision_count: 0
  };

  staging.queue.unshift(newItem); // Newest at top
  
  // Update stats
  const q = staging.queue;
  staging.stats = {
    total_submitted: q.length,
    approved: q.filter(i => i.status === 'approved').length,
    rejected: q.filter(i => i.status === 'rejected').length,
    pending: q.filter(i => i.status === 'pending_review').length,
    approval_rate: q.length > 0 ? Math.round((q.filter(i => i.status === 'approved').length / q.length) * 100) + '%' : '0%'
  };

  fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2));
  res.json({ success: true, id });
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/staging/:id/review — Manager reviews a staging item
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/staging/:id/review', (req, res) => {
  const { id } = req.params;
  const { verdict, feedback } = req.body;

  if (!verdict || !['approved', 'rejected'].includes(verdict)) {
    return res.status(400).json({ error: 'verdict must be "approved" or "rejected"' });
  }

  try {
    const staging = readJson(STAGING_PATH, { queue: [] });
    const item = staging.queue.find(i => i.id === id);
    
    if (!item) return res.status(404).json({ error: `Staging item ${id} not found` });
    
    item.status = verdict;
    item.manager_review = {
      verdict,
      feedback: feedback || '',
      reviewed_at: new Date().toISOString(),
    };
    
    if (verdict === 'approved') {
      item.published_at = new Date().toISOString();
    }

    // Recalculate stats
    const q = staging.queue;
    staging.stats = {
      total_submitted: q.length,
      approved: q.filter(i => i.status === 'approved').length,
      rejected: q.filter(i => i.status === 'rejected').length,
      pending: q.filter(i => i.status === 'pending_review').length,
      approval_rate: q.length > 0 
        ? Math.round((q.filter(i => i.status === 'approved').length / q.length) * 100) + '%' 
        : '0%'
    };
    
    fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2));
    
    const emoji = verdict === 'approved' ? '✅' : '❌';
    logActivity(emoji, 'manager', `${verdict.toUpperCase()}: "${item.title}" — ${feedback || 'No comment'}`, 'review');
    
    res.json({ success: true, item });

    // Execute Publisher in background if approved
    if (verdict === 'approved') {
      const publisher = spawn('node', ['.github/scripts/publisher.mjs'], { stdio: 'ignore' });
      publisher.unref(); // Run detached in background
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/activity — Real-time activity feed
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/activity', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const log = readJson(ACTIVITY_PATH, { entries: [] });
  res.json({ entries: log.entries.slice(0, limit) });
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
  });
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/status — Agency health snapshot
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/status', (req, res) => {
  const status = {};

  // Blog count
  try {
    const blogData = fs.readFileSync(BLOG_DATA, 'utf8');
    status.blog_posts = [...blogData.matchAll(/slug:\s*'([^']+)'/g)].length;
  } catch { status.blog_posts = 0; }

  // Service pages
  try {
    const appCode = fs.readFileSync(APP_TSX, 'utf8');
    status.service_pages = [...appCode.matchAll(/path="\/services\/([^"]+)"/g)].length;
  } catch { status.service_pages = 0; }

  // Journal
  try {
    const journal = JSON.parse(fs.readFileSync(DIRECTOR_JOURNAL, 'utf8'));
    status.director_cycles = journal.total_cycles || 0;
    status.last_decision = journal.entries?.slice(-1)[0] || null;
  } catch { status.director_cycles = 0; }

  // Tech log
  try {
    const techLog = JSON.parse(fs.readFileSync(TECH_LOG, 'utf8'));
    status.tech_fixes = techLog.applied_fixes?.length || 0;
  } catch { status.tech_fixes = 0; }

  // Staging
  const staging = readJson(STAGING_PATH, { stats: {} });
  status.staging = staging.stats;

  // Running tasks
  status.running_tasks = Object.keys(runningTasks);

// ═══════════════════════════════════════════════════════════════════════
// NEW: Unified Outreach & Tasks (From Agency Bridge)
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
    const { to, subject, body: emailBody, fromName } = req.body;
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

    logActivity('📧', 'outreach', `Email successfully sent to ${to}`, 'info');
    res.json({ success: true, messageId: info.messageId });
  } catch (e) {
    console.error(`[Unified API] ERROR SENDING EMAIL: ${e.message}`);
    logActivity('❌', 'outreach', `Failed to send email to ${to}: ${e.message}`, 'error');
    res.status(500).json({ success: false, error: e.message });
  }
});

res.json(status);
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/journal — Director decision history
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/journal', (req, res) => {
  try {
    const journal = JSON.parse(fs.readFileSync(DIRECTOR_JOURNAL, 'utf8'));
    res.json(journal);
  } catch {
    res.json({ entries: [], total_cycles: 0 });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/staging/:id/content — Read a staging item's draft content
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/staging/:id/content', (req, res) => {
  const staging = readJson(STAGING_PATH, { queue: [] });
  const item = staging.queue.find(i => i.id === req.params.id);
  
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  const contentPath = item.draft_path || item.code_path || item.diff_path;
  if (!contentPath) return res.json({ content: 'No content file associated.' });
  
  try {
    const fullPath = path.join(CWD, contentPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content, path: contentPath });
  } catch {
    res.json({ content: 'Content file not found on disk.', path: contentPath });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET/POST /api/settings — Strategic Auto-Pilot Settings
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/settings', (req, res) => {
  const settings = readJson(SETTINGS_PATH, {
    isAutoPilot: false,
    startTime: "10:00",
    cyclesPerDay: 1,
    lastRunAt: null
  });
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  try {
    const settings = readJson(SETTINGS_PATH, {});
    const newSettings = { ...settings, ...req.body };
    
    const dir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings, null, 2));
    logActivity('⚙️', 'system', 'Strategic Auto-Pilot settings updated', 'info');
    res.json({ success: true, settings: newSettings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// STRATEGIC SCHEDULER — Heartbeat
// ═══════════════════════════════════════════════════════════════════════
function startScheduler() {
  console.log(`[Scheduler] Strategic heartbeat initialized (Interval: 1m)`);
  
  setInterval(async () => {
    const settings = readJson(SETTINGS_PATH, { isAutoPilot: false });
    if (!settings.isAutoPilot) return;

    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const startTime = settings.startTime || "10:00";
    
    // Simple logic: Trigger if time matches EXACTLY (polled every 60s)
    // For multiple cycles per day, we calculate intervals
    const intervalHours = 24 / (settings.cyclesPerDay || 1);
    const startHour = parseInt(startTime.split(':')[0]);
    const startMin = parseInt(startTime.split(':')[1]);
    
    let shouldTrigger = false;
    for (let i = 0; i < settings.cyclesPerDay; i++) {
        const targetHour = (startHour + (i * intervalHours)) % 24;
        const targetHM = `${String(Math.floor(targetHour)).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
        
        if (currentHM === targetHM) {
            shouldTrigger = true;
            break;
        }
    }

    if (shouldTrigger) {
      const lastRun = settings.lastRunAt ? new Date(settings.lastRunAt).getTime() : 0;
      const oneHour = 60 * 60 * 1000;
      
      // Prevent double-triggering within the same minute or hour
      if (Date.now() - lastRun > oneHour) {
        console.log(`[Scheduler] 🚀 TIME TRIGGER MATCHED (${currentHM}). Dispatching Director Cycle.`);
        logActivity('🚀', 'scheduler', `Time trigger matched (${currentHM}). Strategic Auto-Pilot activated.`, 'info');
        
        // Update last run immediately to prevent race conditions
        settings.lastRunAt = new Date().toISOString();
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

        // Use the manual trigger logic
        const script = '.github/scripts/agency-director.mjs';
        const child = spawn('node', [script], { cwd: CWD, stdio: 'ignore', detached: true });
        child.unref();
      }
    }
  }, 60000); // 1 minute heartbeat
}

// ═══════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  startScheduler();
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log(`║  👔 AGENCY API v2 — Manager Is The Boss — Port ${PORT}          ║`);
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
  console.log('╚═══════════════════════════════════════════════════════════════╝');
});
