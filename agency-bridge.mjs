import http from 'http';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;
const SCRIPTS = {
  writer: 'seo-auto-poster.mjs',
  auditor: 'seo-dev-agent.mjs',
  outreach: 'seo-outreach-agent.mjs',
  lead_hunter: 'lead-hunter.mjs'
};

const server = http.createServer((req, res) => {
  // 🏥 Health Check for Render
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'live', timestamp: new Date().toISOString() }));
    return;
  }
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    if (req.method === 'POST' && req.url === '/run-task') {
      try {
        const { task, args } = JSON.parse(body);
        const scriptName = SCRIPTS[task];
        if (!scriptName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Unknown task: ${task}` }));
          return;
        }

        const argsString = args && Array.isArray(args) ? args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(' ') : '';
        const cmd = `node .github/scripts/${scriptName} ${argsString}`;
        console.log(`[Agency Bridge] EXECUTING: ${cmd}`);

        exec(cmd, (error, stdout, stderr) => {
          const response = { success: !error, stdout, stderr, error: error ? error.message : null };
          res.writeHead(error ? 500 : 200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    } else if (req.method === 'POST' && req.url === '/send-email') {
      try {
        const { to, subject, body: emailBody, fromName } = JSON.parse(body);
        
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });

        console.log(`[Agency Bridge] SENDING EMAIL TO: ${to}`);

        const info = await transporter.sendMail({
          from: `"${fromName || 'FourIqTech Team'}" <${process.env.SMTP_USER}>`,
          to,
          subject,
          text: emailBody
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: info.messageId }));
      } catch (e) {
        console.error(`[Agency Bridge] ERROR SENDING EMAIL: ${e.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Agency Bridge live at http://localhost:${PORT}`);
  console.log(`SMTP Dispatch Active. Ready for scripts and real-time outreach.`);
});
