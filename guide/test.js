// Checks the user guide covers every tool the homepage links to, with its
// screenshot. Run: node guide/test.js (CI runs it when the homepage or guide changes).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const guide = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const tools = [...new Set([...home.matchAll(/class="(?:subtool-item|card-btn)" href="([a-z-]+)\/"/g)].map(m => m[1]))];
assert.ok(tools.length >= 15, 'the homepage tool links were found');
for (const t of tools) {
  assert.ok(guide.includes(`id="tool-${t}"`), `the guide has no section for ${t}/ (add one with id="tool-${t}")`);
  assert.ok(fs.existsSync(path.join(__dirname, 'img', t + '.jpg')), `no screenshot for ${t}: run node guide/tools/screenshots.cjs`);
}
for (const [, src] of guide.matchAll(/<img src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(__dirname, src)), `missing image ${src}`);
// Both voices are written wherever one is.
assert.equal((guide.match(/class="(?:what )?v-plain"/g) || []).length, (guide.match(/class="(?:what )?v-cadet"/g) || []).length, 'every plain passage has a Cadet one');
console.log(`guide: covers all ${tools.length} tools`);
