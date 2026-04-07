import puppeteer from 'puppeteer';

async function testScraper(keyword) {
  let browser = null;
  try {
    console.log(`\n🕵️ DEBUG: Testing Puppeteer Scraper for: "${keyword}"`);
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=en`);
    await new Promise(r => setTimeout(r, 3000));
    
    // Test different selectors
    const data = await page.evaluate(() => {
      const results = [];
      // Common Google Organic Result Containers
      const items = document.querySelectorAll('div.g, div.tF2Cxc, div.v7W49e > div');
      
      items.forEach((item, index) => {
        const titleEl = item.querySelector('h3');
        const linkEl = item.querySelector('a');
        const snippetEl = item.querySelector('.VwiC3b, .yXK7lf, .MUxGbd, .yDYNvb');
        
        if (titleEl && linkEl) {
          results.push({
            pos: index + 1,
            title: titleEl.innerText,
            link: linkEl.href,
            snippet: snippetEl ? snippetEl.innerText : 'N/A'
          });
        }
      });
      return {
        count: results.length,
        html_preview: document.body.innerHTML.substring(0, 1000),
        found: results.slice(0, 3)
      };
    });
    
    console.log(`✅ RESULTS FOUND: ${data.count}`);
    console.log(JSON.stringify(data.found, null, 2));
    
    if (data.count === 0) {
      console.log('❌ CSS SELECTORS FAILED. Trying fallback...');
    }

  } catch (e) {
    console.error(`💥 ERROR: ${e.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

testScraper('nextjs saas architecture');
