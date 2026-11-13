/* Find my ship: an exact slot names the ship; any other time names each ship's
   nearest slot that day, public ones unless private slots are shown.
   Run from the repo root: node shipsearch/test.js (needs Playwright: CI installs it). */
const { chromium } = require('playwright');
const assert = require('assert');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  const find = async (date, time, privateToo = false) => {
    await page.fill('#dtDate', date);
    await page.fill('#dtTime', time);
    await page.setChecked('#showPrivate', privateToo);
    await page.click('#searchBtn');
    return (await page.innerText('#resultArea')).replace(/\s+/g, ' ').trim();
  };
  // Wednesday 11 November 2026, and Saturday the 14th.
  assert.match(await find('2026-11-11', '19:15'), /^UCS Takanami/);
  assert.equal(await find('2026-11-11', '19:05'), 'No mission starts at 19:05. Nearest: UCS Havock 19:00 · UCS Takanami 19:15');
  assert.equal(await find('2026-11-14', '09:00'), 'No mission starts at 09:00. Nearest: UCS Havock 09:45 · UCS Takanami 10:00');
  assert.equal(await find('2026-11-11', '11:05'), 'No mission starts at 11:05. Nearest: UCS Havock 17:00 · UCS Takanami 17:15', 'private slots stay hidden');
  assert.equal(await find('2026-11-11', '11:05', true), 'No mission starts at 11:05. Nearest: UCS Havock 11:00 (private) · UCS Takanami 11:15 (private)');
  assert.deepEqual(errors, []);
  console.log('ship search: all checks passed');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
