import http from 'http';
import https from 'https';
import { URL } from 'url';
import fs from 'fs';

// ═══════════════════════════════════════════════════════════════════════
// 🔑 GSC OAuth Setup Helper — One-time setup
// ═══════════════════════════════════════════════════════════════════════
// Run this script ONCE to generate your Refresh Token:
//
//   1. Set your Client Secret: export GSC_CLIENT_SECRET="your_secret"
//   2. Run: node .github/scripts/seo-gsc-setup.mjs
//   3. Open the URL in your browser, authorize, and come back
//   4. Copy the Refresh Token and add to GitHub Secrets as GSC_REFRESH_TOKEN
// ═══════════════════════════════════════════════════════════════════════

const CLIENT_ID = '21943831838-1ah4tta0g25iikoqfp8oorjspc43ee9e.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET || '';
const REDIRECT_URI = 'http://localhost:3847/callback';
const SCOPES = 'https://www.googleapis.com/auth/webmasters.readonly';

if (!CLIENT_SECRET) {
  console.error('╔═══════════════════════════════════════════════════════════╗');
  console.error('║  ❌ GSC_CLIENT_SECRET not set!                           ║');
  console.error('╠═══════════════════════════════════════════════════════════╣');
  console.error('║                                                          ║');
  console.error('║  1. Go to Google Cloud Console:                          ║');
  console.error('║     https://console.cloud.google.com/apis/credentials    ║');
  console.error('║                                                          ║');
  console.error('║  2. Find your OAuth 2.0 Client ID                       ║');
  console.error('║                                                          ║');
  console.error('║  3. Copy the Client Secret                              ║');
  console.error('║                                                          ║');
  console.error('║  4. Run this command:                                    ║');
  console.error('║     export GSC_CLIENT_SECRET="your_secret_here"          ║');
  console.error('║     node .github/scripts/seo-gsc-setup.mjs              ║');
  console.error('║                                                          ║');
  console.error('║  NOTE: Add http://localhost:3847/callback as an          ║');
  console.error('║  Authorized Redirect URI in your OAuth client settings.  ║');
  console.error('║                                                          ║');
  console.error('╚═══════════════════════════════════════════════════════════╝');
  process.exit(1);
}

// Build the authorization URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  🔑 GSC OAuth Setup — Step 1                            ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║                                                          ║');
console.log('║  Open this URL in your browser to authorize:             ║');
console.log('║                                                          ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log(`\n🔗 ${authUrl}\n`);
console.log('⏳ Waiting for authorization callback on http://localhost:3847 ...\n');

// Start local server to catch the callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:3847`);

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>❌ Authorization Failed</h1><p>Error: ${error}</p>`);
      console.error(`❌ Authorization failed: ${error}`);
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>❌ No authorization code received</h1>`);
      return;
    }

    console.log('✅ Authorization code received! Exchanging for tokens...\n');

    // Exchange code for tokens
    try {
      const tokens = await exchangeCodeForTokens(code);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>✅ GSC OAuth Setup Complete!</h1>
        <p>You can close this tab and go back to your terminal.</p>
        <p><strong>Your tokens have been printed in the terminal.</strong></p>
      `);

      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║  ✅ GSC OAuth Setup — COMPLETE!                          ║');
      console.log('╠═══════════════════════════════════════════════════════════╣');
      console.log('║                                                          ║');
      console.log('║  Add these as GitHub Secrets:                            ║');
      console.log('║                                                          ║');
      console.log('║  Secret Name: GSC_CLIENT_SECRET                         ║');
      console.log(`║  Value: ${CLIENT_SECRET.substring(0, 10)}...`);
      console.log('║                                                          ║');
      console.log('║  Secret Name: GSC_REFRESH_TOKEN                         ║');
      console.log(`║  Value: ${tokens.refresh_token}`);
      console.log('║                                                          ║');
      console.log('║  Go to:                                                  ║');
      console.log('║  GitHub Repo → Settings → Secrets → Actions             ║');
      console.log('║                                                          ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');

      setTimeout(() => process.exit(0), 1000);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>❌ Token Exchange Failed</h1><p>${e.message}</p>`);
      console.error(`❌ Token exchange failed: ${e.message}`);
      process.exit(1);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(3847, () => {
  console.log('🖥️  Local callback server running on http://localhost:3847');
});

function exchangeCodeForTokens(code) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    }).toString();

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.refresh_token) {
            resolve(parsed);
          } else {
            reject(new Error(`No refresh_token in response: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}
