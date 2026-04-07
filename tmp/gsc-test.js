const https = require('https');
const { URLSearchParams } = require('url');

async function test() {
  const CLIENT_ID = process.env.GSC_CLIENT_ID || '21943831838-1ah4tta0g25iikoqfp8oorjspc43ee9e.apps.googleusercontent.com';
  const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;

  if (!CLIENT_SECRET || !REFRESH_TOKEN) {
    console.log('❌ MISSING credentials in .env');
    return;
  }

  const postData = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token'
  }).toString();

  const options = {
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const exchange = () => new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  try {
    const tokens = await exchange();
    if (!tokens.access_token) {
      console.log('❌ AUTH FAILED:', tokens);
      return;
    }
    console.log('✅ AUTH SUCCESS');

    const getSites = () => new Promise((resolve, reject) => {
      const siteOpt = {
        hostname: 'www.googleapis.com',
        path: '/webmasters/v3/sites',
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      };
      const req = https.request(siteOpt, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.end();
    });

    const sites = await getSites();
    console.log('--- FOUND PROPERTIES ---');
    if (sites.siteEntry) {
      sites.siteEntry.forEach(s => console.log('📍 ' + s.siteUrl));
    } else {
      console.log('No sites found.', sites);
    }

  } catch (e) {
    console.log('❌ CRASH:', e.message);
  }
}

test();
