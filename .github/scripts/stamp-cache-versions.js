// Songbook, Tactical Aids and Mess Log serve their files from the offline cache
// until their service worker's version string changes, and Mission Companion
// and Engineering ask for a bump on every change too. Stamp each one with a
// hash of the files it caches, so every deploy that changes them reaches
// phones that already have the tool, without anyone bumping a version by hand.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? listFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]
  ).sort();
}

function hash12(files) {
  const h = crypto.createHash('sha256');
  for (const f of files) h.update(fs.readFileSync(f));
  return h.digest('hex').slice(0, 12);
}

function stamp(tool, pattern, value, files) {
  const sw = path.join(ROOT, tool, 'sw.js');
  const src = fs.readFileSync(sw, 'utf8');
  if (!pattern.test(src)) throw new Error(`${tool}/sw.js: version line not found`);
  fs.writeFileSync(sw, src.replace(pattern, (_, before, after) => before + value(hash12(files)) + after));
  console.log(`${tool}: ${value(hash12(files))}`);
}

const inTool = (tool, skip) => listFiles(path.join(ROOT, tool))
  .filter(f => !skip.includes(path.relative(path.join(ROOT, tool), f)));

// Same scheme the Mess Log has always used: sha256 of its four cached files, in this order.
stamp('messtracker', /(var CACHE_VERSION = 'ucn-mess-log-)[0-9a-f]+(';)/, h => h,
  ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'].map(f => path.join(ROOT, 'messtracker', f)));
// songs.json is fetched network-first, so editing a song (in songs/) needs no new cache.
stamp('songbook', /(var VERSION = 'ucn-songbook-)[^']+(';)/, h => h,
  inTool('songbook', ['sw.js', 'songs.json']).filter(f => !path.relative(path.join(ROOT, 'songbook'), f).startsWith('songs' + path.sep)));
// manifest.json is fetched network-first and rebuilt on deploy.
stamp('tactical-aids', /(const CACHE_VERSION = ')[^']+(';)/, h => h, inTool('tactical-aids', ['sw.js', 'manifest.json']));
stamp('mission-companion', /(const CACHE_VERSION = 'ucn-mission-companion-)[^']+(';)/, h => h, inTool('mission-companion', ['sw.js']));
stamp('engineering', /(const CACHE = 'ucn-eng-)[^']+(';)/, h => h, inTool('engineering', ['sw.js']));
