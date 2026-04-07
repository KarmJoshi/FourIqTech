import puppeteer from 'puppeteer';
import fs from 'fs';

async function testScraperV2(keyword) {
  let browser = null;
  try {
    console.log(`\n🕵️ DEEP DEBUG: Testing Puppeteer for: "${keyword}"`);
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`📡 Navigating to Google...`);
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=en`, { waitUntil: 'networkidle2' });
    
    // Check for Consent Button (Wait 3s for any overlays)
    await new Promise(r => setTimeout(r, 2000));
    
    const consentButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const active = buttons.find(b => b.innerText.includes('Accept all') || b.innerText.includes('I agree'));
      if (active) {
        active.click();
        return true;
      }
      return false;
    });
    
    if (consentButton) {
      console.log(`👆 Clicked Consent Button. Waiting for refresh...`);
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log(`📸 Taking screenshot...`);
    await page.screenshot({ path: 'tmp/google_debug.png' });
    
    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('h3')).map(h3 => {
        const title = h3.innerText;
        const anchor = h3.closest('a');
        const parent = h3.closest('div.g') || h3.closest('div.tF2Cxc') || h3.parentElement.parentElement;
        const snippet = parent ? parent.innerText.substring(0, 200) : 'N/A';
        return { title, link: anchor ? anchor.href : 'N/A', snippet };
      });
      return items.filter(i => i.title.length > 5 && i.link.includes('http')).slice(0, 10);
    });
    
    console.log(`✅ DISCOVERED RESULTS: ${results.length}`);
    results.forEach((r, i) => console.log(`   [${i+1}] ${r.title}`));

  } catch (e) {
    console.error(`💥 ERROR: ${e.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

testScraperV2('nextjs saas authentication');
