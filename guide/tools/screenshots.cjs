// Takes the guide's phone screenshots (guide/img/<tool>.jpg), one per tool the
// homepage links to. Serve the site locally first, from the folder above UCNTOOLS:
//   python3 -m http.server 8765
// then run:  node guide/tools/screenshots.cjs http://localhost:8765/UCNTOOLS/
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..', '..');
const base = process.argv[2] || 'http://localhost:8765/UCNTOOLS/';
const tools = [...new Set([...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .matchAll(/class="(?:subtool-item|card-btn)" href="([a-z-]+)\/"/g)].map(m => m[1]))];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1.5 });
  // Skip first-visit screens, so each picture shows the tool itself.
  await ctx.addInitScript(() => { try { localStorage.setItem('ucnHasSeenIntro_v1', '1'); } catch (e) {} });
  for (const tool of tools) {
    const page = await ctx.newPage();
    await page.goto(base + tool + '/', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, 'guide', 'img', tool + '.jpg'), type: 'jpeg', quality: 72 });
    await page.close();
    console.log('guide/img/' + tool + '.jpg');
  }
  await browser.close();
})();
