// Checks the Crew Rota. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SHIP_STATIONS, SHUTTLE_STATIONS, blankRota, fairShuffle, pastStations, spare, asText, encode, decode, readSaved, withHistory } from './rota.js';

const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const PLAYERS = ['Ash', 'Bo', 'Cy', 'Di', 'Ed', 'Flo', 'Gus', 'Hal', 'Ivy', 'Jo', 'Kit'];

// The stations match the other tools' lists, so a rota fills them exactly.
const listIn = (file, name) => {
  const m = readFileSync(new URL(file, import.meta.url), 'utf8').match(new RegExp(`var ${name} = (\\[[^\\]]*\\])`));
  return JSON.parse(m[1].replace(/'/g, '"'));
};
for (const f of ['../mission-companion/index.html', '../generallog/index.html', '../missionstats/index.html']) {
  assert.deepEqual(listIn(f, 'SHIP_ROLES'), SHIP_STATIONS, `${f}: ship stations differ`);
  assert.deepEqual(listIn(f, 'SHUTTLE_ROLES'), SHUTTLE_STATIONS, `${f}: shuttle stations differ`);
}

// A shuffle puts everyone on one station, keeps picks made by hand, and changes with a reshuffle.
{
  let r = blankRota('2026-11-14', 'UCS Takanami', PLAYERS);
  r.crew[0] = { role: 'Captain', name: 'Kit', auto: false };
  const a = fairShuffle(r, {}, seeded(1));
  assert.equal(a.crew[0].name, 'Kit', 'a hand pick is kept');
  assert.deepEqual(a.crew.map(c => c.name).sort(), [...PLAYERS].sort(), 'everyone on exactly one station');
  assert.ok(a.crew.slice(1).every(c => c.auto));
  const again = [2, 3, 4, 5].map(s => fairShuffle(a, {}, seeded(s)).crew.map(c => c.name).join());
  assert.ok(new Set(again).size > 1, 'reshuffling changes it');
  assert.equal(fairShuffle(a, {}, seeded(2)).crew[0].name, 'Kit');
}
// Fewer players than stations: the most important stations are filled.
{
  const r = fairShuffle(blankRota('2026-11-14', '', ['Ash', 'Bo', 'Cy']), {}, seeded(3));
  assert.deepEqual(r.crew.filter(c => c.name).map(c => c.role), ['Captain', 'First Officer', 'Helm']);
}
// More players than stations: the rest are listed as spare.
{
  const r = fairShuffle(blankRota('2026-11-14', '', [...PLAYERS, 'Lu', 'Mo']), {}, seeded(4));
  assert.equal(spare(r).length, 2);
}
// Fairness: someone gets a station they haven't had, and not the one they had last time.
{
  const history = {
    '2026-10-01': { ship: '', crew: [{ role: 'Captain', name: 'Ash' }, { role: 'Helm', name: 'Bo' }] },
    '2026-10-15': { ship: '', crew: [{ role: 'Captain', name: 'Ash' }, { role: 'Helm', name: 'Bo' }] },
    '2026-11-14': { ship: '', crew: [{ role: 'Captain', name: 'Bo' }] }, // today's own entry doesn't count
  };
  assert.equal(pastStations(history, '2026-11-14').count('ash', 'Captain'), 2);
  assert.equal(pastStations(history, '2026-11-14').count('Bo', 'Captain'), 0);
  const r = blankRota('2026-11-14', '', ['Ash', 'Bo']);
  r.crew = r.crew.filter(c => c.role === 'Captain' || c.role === 'Helm');
  for (let s = 1; s <= 20; s++) {
    const out = fairShuffle(r, history, seeded(s));
    assert.equal(out.crew.find(c => c.role === 'Captain').name, 'Bo', `seed ${s}`);
  }
}

// Text for Discord.
{
  const r = { date: '2026-11-14', ship: 'UCS Havock', players: ['Ash', 'Bo', 'Cy'], crew: [{ role: 'Captain', name: 'Ash' }, { role: 'Helm', name: 'Bo' }, { role: 'Radar', name: '' }] };
  assert.equal(asText(r), 'Crew rota · UCS Havock · Sat 14 Nov 2026\nCaptain: Ash\nHelm: Bo\nNot on a station: Cy');
}

// Links: what's encoded reads back, and anything odd in a link is dropped.
{
  const r = fairShuffle(blankRota('2026-11-14', 'UCS Takanami', [...PLAYERS, 'Lu'], true), {}, seeded(5));
  const back = decode(encode(r));
  assert.equal(back.date, r.date);
  assert.equal(back.ship, r.ship);
  assert.deepEqual(back.crew.map(c => [c.role, c.name]), r.crew.map(c => [c.role, c.name]));
  assert.deepEqual([...back.players].sort(), [...r.players].sort());
  assert.ok(back.crew.every(c => !c.auto), 'a shared rota counts as picked by hand');
  const link = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  assert.equal(decode('not a rota'), null);
  assert.equal(decode(link({ d: '2026-11-14', c: [] })), null, 'no stations');
  const odd = decode(link({ d: '<b>', s: 5, c: [[0, 'A'.repeat(99)], [0, 'Twice'], [99, 'Nowhere'], 'junk', [2, '\u0000Bo\n']], p: ['Cy', 7, 'cy'] }));
  assert.equal(odd.date, '');
  assert.equal(odd.ship, '');
  assert.deepEqual(odd.crew.map(c => [c.role, c.name]), [['Captain', 'A'.repeat(40)], ['Helm', 'Bo']]);
  assert.deepEqual(odd.players, ['A'.repeat(40), 'Bo', 'Cy']);
}

// Storage: damaged data starts fresh; each dated rota is kept in the history, and an empty one isn't.
{
  assert.deepEqual(readSaved('{oops', '2026-11-14').current.date, '2026-11-14');
  assert.deepEqual(readSaved(JSON.stringify({ current: { date: 'x', players: [], crew: [{ role: 'Cook', name: '' }] } }), 'd').current.crew.length, SHIP_STATIONS.length);
  const r = { date: '2026-11-14', ship: 'UCS Havock', players: ['Ash'], crew: [{ role: 'Captain', name: 'Ash', auto: true }, { role: 'Helm', name: '', auto: false }] };
  const saved = withHistory({ current: r, history: { '2026-10-01': { ship: '', crew: [] } } });
  assert.deepEqual(saved.history['2026-11-14'], { ship: 'UCS Havock', crew: [{ role: 'Captain', name: 'Ash' }] });
  assert.ok(saved.history['2026-10-01']);
  assert.equal(withHistory({ current: { ...r, crew: [] }, history: saved.history }).history['2026-11-14'], undefined);
}

// shared/rota.js, which the other tools use, reads what the Crew Rota saves.
{
  const store = new Map();
  const sandbox = { localStorage: { getItem: k => store.get(k) ?? null }, JSON };
  vm.runInNewContext(readFileSync(new URL('../shared/rota.js', import.meta.url), 'utf8'), sandbox);
  assert.equal(sandbox.ucnCrewRota(), null, 'no rota yet');
  const r = { date: '2026-11-14', ship: 'UCS Havock', players: ['Ash', 'Bo'], crew: [{ role: 'Captain', name: 'Ash', auto: false }, { role: 'Helm', name: ' bo ', auto: true }] };
  store.set('ucnCrewRota_v1', JSON.stringify(withHistory({ current: r, history: {} })));
  assert.equal(sandbox.ucnCrewRota().crew.length, 2);
  assert.deepEqual({ ...sandbox.ucnRotaFor('Bo') }, { role: 'Helm', ship: 'UCS Havock', date: '2026-11-14' });
  assert.equal(sandbox.ucnRotaFor('Cy'), null);
  store.set('ucnProfile_v1', JSON.stringify({ name: 'ash' }));
  assert.equal(sandbox.ucnRotaFor().role, 'Captain', 'defaults to the shared name');
  store.set('ucnCrewRota_v1', '{broken');
  assert.equal(sandbox.ucnCrewRota(), null);
}

console.log('crew-rota: all checks passed');
