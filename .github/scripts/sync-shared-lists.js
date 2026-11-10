// Writes shared/ucn-lists.json (the operations and the rank ladder),
// shared/profile.js (the shared name and rank), shared/share.js (the Share
// log button) and shared/offline-sw.js (five tools' offline copy) into every
// tool that keeps a
// copy, between "ucn-lists:<part>" and "ucn-lists:end" marker lines, in that
// tool's own syntax. Each tool stays one self-contained, offline page. The
// deploy runs it, so editing the shared files alone updates every tool; run it
// locally to update the repo copies too:
//   node .github/scripts/sync-shared-lists.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const { operations, ranks } = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/ucn-lists.json'), 'utf8'));

// The file is edited by hand: refuse to ship a list that would break the tools.
const isText = v => typeof v === 'string' && v.trim() === v && v !== '';
if (!Array.isArray(operations) || !operations.length || !operations.every(o => isText(o.name) && isText(o.type)))
  throw new Error('shared/ucn-lists.json: every operation needs a non-empty "name" and "type"');
if (!Array.isArray(ranks) || !ranks.length || !ranks.every(r => isText(r.name) && (r.alt === undefined || isText(r.alt))))
  throw new Error('shared/ucn-lists.json: every rank needs a non-empty "name"');
for (const [what, list] of [['operation', operations], ['rank', ranks]]) {
  const seen = new Set();
  for (const { name } of list) {
    if (seen.has(name.toUpperCase())) throw new Error(`shared/ucn-lists.json: ${what} "${name}" is listed twice`);
    seen.add(name.toUpperCase());
  }
}

const q = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const dq = s => JSON.stringify(s);
const html = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const comma = (list, i) => (i < list.length - 1 ? ',' : '');
const names = ranks.map(r => r.name);

// Pack items onto lines no longer than `width`, the first line after `head`.
function pack(head, items, sep, width, indent) {
  const lines = [];
  let line = head;
  items.forEach((item, i) => {
    const piece = item + (i < items.length - 1 ? sep.trimEnd() : '');
    if (line.trim() && (line + piece).length > width) { lines.push(line.trimEnd()); line = indent; }
    line += piece + (i < items.length - 1 ? sep.slice(sep.trimEnd().length) : '');
  });
  lines.push(line);
  return lines;
}

function byType(types) {
  return types.map(type => ({ type, names: operations.filter(o => o.type === type).map(o => o.name) }));
}
const typesInOrder = [...new Set(operations.map(o => o.type))];

// Each returns the lines of one declaration, unindented.
const FORMAT = {
  'mc-ranks': () => [`var RANKS = [${names.map(q).join(',')}];`],
  'mc-operations': () => {
    const groups = byType(typesInOrder);
    return ['var OPERATIONS_BY_TYPE = [', ...groups.flatMap((g, i) => [
      `  {type:${q(g.type)}, names:[`,
      ...g.names.map((n, j) => `    ${q(n)}${comma(g.names, j)}`),
      `  ]}${comma(groups, i)}`,
    ]), '];'];
  },
  'eng-ranks': () => ['const RANKS = [', ...pack('  ', names.map(q).map(s => s + ','), ' ', 76, '  '), '];'],
  'eng-operations': () => ['const OPERATIONS = [', ...operations.map(o => `  [${q(o.name)}, ${q(o.type)}],`), '];'],
  'nav-operations': () => ['var MISSION_OPERATIONS = [',
    ...operations.map((o, i) => `  { name:${dq(o.name)}, type:${dq(o.type)} }${comma(operations, i)}`), '];'],
  'nav-ranks': () => {
    const w = Math.max(...names.map(n => q(n).length)) + 1;
    return ['var RANKS = [', ...ranks.map((r, i) =>
      `  { name:${(q(r.name) + ',').padEnd(w)} alt:${q(r.alt || r.name)} }${comma(ranks, i)}`), '];'];
  },
  'comms-operations': () => ['const OPERATIONS = {',
    ...operations.map((o, i) => `  ${q(o.name)}: ${q(o.type)}${comma(operations, i)}`), '};'],
  // General Log shows them grouped by type, each group alphabetical.
  'glog-operations': () => {
    const sorted = byType([...typesInOrder].sort()).map(g => ({ ...g, names: [...g.names].sort() }));
    const all = sorted.flatMap(g => g.names);
    let k = 0;
    return ['var OPERATIONS = [', ...sorted.flatMap(g => [`  /* ${g.type} */`,
      ...g.names.map(n => `  { name: ${q(n)}, type: ${q(g.type)} }${comma(all, k++)}`)]), '];'];
  },
  'spaced-ranks': () => pack('var RANKS = [', names.map(q), ', ', 94, '  ').map((l, i, a) => i === a.length - 1 ? l + '];' : l),
  'compact-ranks': () => pack('var RANKS = [', names.map(q), ',', 86, '  ').map((l, i, a) => i === a.length - 1 ? l + '];' : l),
  'option-ranks': () => names.map(n => `<option value="${html(n.toUpperCase())}">${html(n)}</option>`),
  // The Mess Log's built-in menu (used before it has ever been online) is the
  // published messtracker/menu.csv, so the two can never drift apart.
  'mess-menu': () => {
    const csv = fs.readFileSync(path.join(ROOT, 'messtracker/menu.csv'), 'utf8');
    const header = csv.split('\n')[0].toLowerCase().split(',').map(h => h.trim());
    if (!header.includes('name') || csv.trim().split('\n').length < 2)
      throw new Error('messtracker/menu.csv needs a header row with a Name column, and at least one drink');
    if (/<\/script/i.test(csv)) throw new Error('messtracker/menu.csv cannot contain a closing script tag');
    return [`var DEFAULT_MENU_CSV = ${JSON.stringify(csv)};`];
  },
  profile: () => sharedCode('profile.js'),
  share: () => sharedCode('share.js'),
  'offline-sw': () => sharedCode('offline-sw.js'),
};

function sharedCode(name) {
  const code = fs.readFileSync(path.join(ROOT, 'shared', name), 'utf8').trimEnd();
  if (/<\/script/i.test(code)) throw new Error(`shared/${name} cannot contain a closing script tag`);
  return code.split('\n');
}

const TARGETS = [
  ['mission-companion/index.html', ['mc-ranks', 'mc-operations']],
  ['engineering/js/mission.js', ['eng-ranks', 'eng-operations', 'share']],
  ['engineering/index.html', ['profile']],
  ['navigation/index.html', ['nav-operations', 'nav-ranks', 'profile', 'share']],
  ['commslog/js/app.js', ['comms-operations', 'share']],
  ['commslog/index.html', ['profile']],
  ['generallog/index.html', ['glog-operations', 'spaced-ranks', 'profile', 'share']],
  ['messtracker/index.html', ['spaced-ranks', 'profile', 'mess-menu']],
  ['idcard/index.html', ['option-ranks', 'profile']],
  ['missionstats/src/index.template.html', ['compact-ranks', 'profile']],
  ['missionstats/index.html', ['compact-ranks', 'profile']], // the built copy, so no rebuild is needed
  ['commslog/sw.js', ['offline-sw']],
  ['idcard/sw.js', ['offline-sw']],
  ['shipsearch/sw.js', ['offline-sw']],
  ['missionstats/sw.js', ['offline-sw']],
  ['hacking-trainer/sw.js', ['offline-sw']],
  ['hacking-trainer/index.html', ['profile']],
  ['tractor-drones/sw.js', ['offline-sw']],
  ['bridge-drills/sw.js', ['offline-sw']],
  ['bridge-drills/index.html', ['profile']],
];

let changed = 0;
for (const [file, lists] of TARGETS) {
  const full = path.join(ROOT, file);
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  for (const list of lists) {
    const start = lines.findIndex(l => l.includes(`ucn-lists:${list} `));
    const end = lines.findIndex((l, i) => i > start && l.includes('ucn-lists:end'));
    if (start < 0 || end < 0) throw new Error(`${file}: markers for ${list} not found`);
    const indent = lines[start].match(/^\s*/)[0];
    lines.splice(start + 1, end - start - 1, ...FORMAT[list]().map(l => indent + l));
  }
  const out = lines.join('\n');
  if (out !== fs.readFileSync(full, 'utf8')) { fs.writeFileSync(full, out); changed++; console.log('updated', file); }
}
console.log(`${operations.length} operations, ${ranks.length} ranks; ${changed} file(s) changed`);
