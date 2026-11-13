// Checks the user guide covers every tool the homepage links to, with its
// screenshot, and that every tool has its Get latest version link. Run: node guide/test.js (CI runs it when the homepage or guide changes).
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
  const page = fs.readFileSync(path.join(ROOT, t, 'index.html'), 'utf8');
  assert.ok(page.includes('data-ucn-latest') && page.includes('ucn-lists:latest '), `${t}/ has no Get latest version link (see shared/latest.js)`);
}
// Back up & Restore (TOOL_KEYS on the homepage) covers every key a tool saves
// under, so a tool added or changed without it isn't quietly left out of backups.
const listIn = name => [...(home.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`)) || [])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const backedUp = listIn('TOOL_KEYS'), notBackedUp = listIn('NOT_BACKED_UP');
assert.ok(backedUp.includes('ucnScanTrainer') && notBackedUp.length, 'TOOL_KEYS and NOT_BACKED_UP were found in index.html');
// Left out on purpose: an 18-hour mission from a Mission QR (stale by any restore), and Tactical Aids' per-PDF agreement.
const LEFT_OUT = ['ucnMission_v1', 'ucnAgreed:'];
const sources = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return ['vendor', 'tests', 'test', 'tools', 'build', 'node_modules', 'songs', 'pdfs'].includes(e.name) ? [] : sources(p);
  return /\.(html|js)$/.test(e.name) && e.name !== 'sw.js' ? [p] : [];
});
for (const t of tools) {
  for (const f of sources(path.join(ROOT, t))) {
    const src = fs.readFileSync(f, 'utf8');
    const keys = [...src.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g),
      ...src.matchAll(/\b(?:[A-Z0-9_]*KEY[A-Z0-9_]*|K_[A-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
    for (const k of keys) {
      assert.ok(backedUp.some(p => k.startsWith(p)) || notBackedUp.includes(k) || LEFT_OUT.includes(k),
        `${path.relative(ROOT, f)} saves "${k}", which Back up & Restore leaves out: add it to TOOL_KEYS in index.html`);
    }
  }
}
for (const [, src] of guide.matchAll(/<img src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(__dirname, src)), `missing image ${src}`);
// Both voices are written wherever one is.
assert.equal((guide.match(/class="(?:what )?v-plain"/g) || []).length, (guide.match(/class="(?:what )?v-cadet"/g) || []).length, 'every plain passage has a Cadet one');
console.log(`guide: covers all ${tools.length} tools, and backups cover their saved data`);
