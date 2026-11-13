/* Saved data the app didn't write itself: a restored backup (from the homepage's
   Restore backup or Restore Mission) is someone else's file, and must only ever
   show as text. And a roster that can't be saved must say so.
   Run from the repo root: node mission-companion/test/saved-data.js
   (needs Playwright: CI installs it; locally, NODE_PATH to an install). */
const { chromium } = require('playwright');
const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
// A plain static server: the app needs a real origin for its storage, not file://.
const server = http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (err, body) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  });
});

(async () => {
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const B = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const errors = [];
  const open = async () => {
    const page = await (await browser.newContext({ viewport: { width: 414, height: 896 } })).newPage();
    page.on('pageerror', e => errors.push(e.message));
    return page;
  };

  // 1. A backup whose ids carry markup: the cards show, and nothing in them runs.
  const evil = 'x"><img src=x onerror="window.__ran=1">';
  let page = await open();
  await page.goto(B);   // seeded from the homepage: the app saves over storage when it's left
  await page.evaluate(id => {
    localStorage.setItem('ucnHasSeenIntro_v1', '1');
    localStorage.setItem('ucnMissionCompanion_v1', JSON.stringify({
      poi: [{ id, sector: 'S1', title: 'Derelict', notes: '' }],
      people: [{ id: id + 'p', name: 'Ash', pronouns: '', affiliation: '', notes: '' }],
      medals: [{ id: id + 'm', crewMember: '', medal: '', reason: '' }],
    }));
    localStorage.setItem('ucnPlayerRoster_v1', JSON.stringify([{ id: id + 'r', name: 'Bo', callsign: '', pronouns: '', role: '' }]));
  }, evil);
  await page.goto(B + 'mission-companion/');
  await page.evaluate(() => document.getElementById('btnMoreRoster').click());
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => window.__ran), undefined, 'markup in a saved id ran');
  assert.equal(await page.locator('#poiList .card').getAttribute('data-id'), evil, 'the id is kept, as text');
  assert.equal(await page.locator('#poiList [data-field="title"]').inputValue(), 'Derelict');
  assert.equal(await page.locator('#rosterList [data-field="name"]').inputValue(), 'Bo');
  await page.context().close();

  // 2. Storage full: the roster says it wasn't saved, once, not on every keystroke.
  page = await open();
  await page.goto(B);
  await page.evaluate(() => localStorage.setItem('ucnHasSeenIntro_v1', '1'));
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'ucnPlayerRoster_v1') throw new DOMException('full', 'QuotaExceededError');
      return set.call(this, k, v);
    };
  });
  const alerts = [];
  page.on('dialog', d => { alerts.push(d.message()); d.accept(); });
  await page.goto(B + 'mission-companion/');
  await page.evaluate(() => document.getElementById('btnMoreRoster').click());
  await page.click('#btnAddRosterPlayer');
  await page.locator('#rosterList [data-field="name"]').pressSequentially('Cy');
  assert.equal(alerts.length, 1, 'one warning, not one per keystroke');
  assert.match(alerts[0], /could NOT be saved/);
  await page.setInputFiles('#importRosterInput', { name: 'roster.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schema: 'ucn.player.roster/2', players: [{ name: 'Di', callsign: '', pronouns: '', role: '' }] })) });
  await page.waitForFunction(() => /imported/.test(document.getElementById('toast').textContent));
  assert.match(await page.textContent('#toast'), /NOT saved$/, 'the import says it was not saved');
  await page.context().close();

  assert.deepEqual(errors, []);
  console.log('mission companion saved data: all checks passed');
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
