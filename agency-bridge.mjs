import http from 'http';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = 3001;
const SCRIPTS = {
  writer: 'sample-article-gen.mjs',
  auditor: 'seo-engine-test.mjs',
  outreach: 'backlink-campaign-agent.mjs',
  lead_hunter: 'lead-hunter-test.mjs'
};

const server = http.createServer((req, res) => {
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

  if (req.method === 'POST' && req.url === '/run-task') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { task } = JSON.parse(body);
        const scriptName = SCRIPTS[task];

        if (!scriptName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Unknown task: ${task}` }));
          return;
        }

        console.log(`[Agency Bridge] EXECUTING: node ${scriptName}`);
        
        exec(`node ${scriptName}`, (error, stdout, stderr) => {
          const response = {
            success: !error,
            stdout,
            stderr,
            error: error ? error.message : null
          };
          
          res.writeHead(error ? 500 : 200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Agency Bridge live at http://localhost:${PORT}`);
  console.log(`Zero-dependency mode active. Ready for scripts: ${Object.keys(SCRIPTS).join(', ')}`);
});
