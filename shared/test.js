// Checks shared/mission.js, which Mission Companion, the homepage and the
// player tools share. Run: node shared/test.js (CI runs it on every change).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const store = new Map();
let now = Date.UTC(2026, 10, 14, 19);
const box = { localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) },
  JSON, btoa, atob, escape, unescape, encodeURIComponent, decodeURIComponent, Object, Date: { now: () => now } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'mission.js'), 'utf8'), box);

// The stations are the tools' own.
const roles = (file, name) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  .match(new RegExp(`var ${name} = (\\[[^\\]]*\\])`))[1].replace(/'/g, '"'));
assert.deepEqual([...box.UCN_STATIONS], [...roles('mission-companion/index.html', 'SHIP_ROLES'), ...roles('mission-companion/index.html', 'SHUTTLE_ROLES')]);

// A mission reads back from its link, accents and all; blank crew places are left out.
const m = { operation: 'OPERATION SILENT HARBOUR', type: 'Frontline', ship: 'UCS Takanami',
  crew: [{ role: 'Captain', name: 'Zoë' }, { role: 'Helm', name: '' }, { role: 'Comms', name: 'Ash' }] };
const back = box.ucnReadMissionLink(box.ucnMissionLink(m));
assert.deepEqual(JSON.parse(JSON.stringify(back)), { ...m, crew: [m.crew[0], m.crew[2]] });

// Anyone can make a link: only text of sensible length and real stations get through.
const link = o => Buffer.from(JSON.stringify(o)).toString('base64url');
assert.equal(box.ucnReadMissionLink('nonsense'), null);
assert.equal(box.ucnReadMissionLink(link({ o: '', s: '', c: [] })), null, 'nothing in it');
const odd = box.ucnReadMissionLink(link({ o: 'x'.repeat(200), t: 7, s: '<b>\nShip</b>', c: [['Cook', 'Bo'], ['Helm', 5], ['Radar', 'Cy\u0000'], 'junk', null] }));
assert.equal(odd.operation.length, 80);
assert.equal(odd.type, '');
assert.equal(odd.ship, '<b> Ship</b>', 'kept as plain text, shown with textContent');
assert.deepEqual(JSON.parse(JSON.stringify(odd.crew)), [{ role: 'Radar', name: 'Cy' }]);

// Saved for one session: gone after 18 hours. The station comes from the shared name by default.
assert.equal(box.ucnMission(), null);
assert.ok(box.ucnSaveMission(back));
assert.equal(box.ucnMission().ship, 'UCS Takanami');
assert.equal(box.ucnMissionStation('ash'), 'Comms');
assert.equal(box.ucnMissionStation('Nobody'), '');
store.set('ucnProfile_v1', JSON.stringify({ name: ' Zoë ' }));
assert.equal(box.ucnMissionStation(), 'Captain');
now += 19 * 3600e3;
assert.equal(box.ucnMission(), null, 'an old mission no longer fills anything');
store.set('ucnMission_v1', '{broken');
assert.equal(box.ucnMission(), null);

console.log('shared: all checks passed');
