import https from 'https';
import { URLSearchParams } from 'url';

const CLIENT_ID = process.env.GSC_CLIENT_ID || '21943831838-1ah4tta0g25iikoqfp8oorjspc43ee9e.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;

async function test() {
  if (!CLIENT_SECRET || !REFRESH_TOKEN) {
    console.log('❌ MISSING credentials in .env (Check GSC_CLIENT_SECRET and GSC_REFRESH_TOKEN)');
    return;
  }

  const postData = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token'
  }).toString();

  const exchange = () => new Promise((resolve, reject) => {
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
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  try {
    const tokens = await exchange();
    if (!tokens.access_token) {
      console.log('❌ AUTH FAILED (Refresh Token might be invalid):', tokens);
      return;
    }
    console.log('✅ AUTH SUCCESS: Access token verified.');

    const getSites = () => new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'www.googleapis.com',
        path: '/webmasters/v3/sites',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.end();
    });

    const sites = await getSites();
    console.log('--- FOUND GSC PROPERTIES ---');
    if (sites.siteEntry) {
      sites.siteEntry.forEach(s => console.log('📍 ' + s.siteUrl));
    } else {
      console.log('No sites found in this account.', sites);
    }
  } catch (e) {
    console.log('❌ CRASH:', e.message);
  }
}

test();
