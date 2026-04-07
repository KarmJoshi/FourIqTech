import https from 'https';

const GSC_CLIENT_ID = process.env.GSC_CLIENT_ID || '21943831838-1ah4tta0g25iikoqfp8oorjspc43ee9e.apps.googleusercontent.com';
const GSC_CLIENT_SECRET = process.env.GSC_CLIENT_SECRET;
const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;

async function run() {
  if (!GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) {
    console.log("No GSC credentials found in env.");
    return;
  }

  // Get token
  const postData = new URLSearchParams({
    client_id: GSC_CLIENT_ID,
    client_secret: GSC_CLIENT_SECRET,
    refresh_token: GSC_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  }).toString();

  const accessToken = await new Promise((resolve, reject) => {
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
          resolve(parsed.access_token);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  if (!accessToken) {
    console.log("Failed to get access token");
    return;
  }

  // Get sites
  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.googleapis.com',
      path: '/webmasters/v3/sites',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log("AVAILABLE GSC PROPERTIES:");
        try {
          const parsed = JSON.parse(data);
          if (parsed.siteEntry) {
            parsed.siteEntry.forEach(s => console.log(`  - ${s.siteUrl}`));
          } else {
            console.log("No sites found.", parsed);
          }
        } catch(e) {
          console.log("Error parsing sites output", data);
        }
        resolve();
      });
    });
    req.on('error', reject);
    req.end();
  });
}

run();
