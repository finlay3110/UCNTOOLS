// Checks the figures in calc.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { TRACTOR, tractorReach, DEFENCE, DRAG, probeRadius, DRONE, droneRange } from './calc.js';

// Exact on the manual's rows (Tables 3-21, 3-26, 3-27).
for (const [arc, reach] of TRACTOR) assert.equal(tractorReach(arc), reach);
for (const [eff, range] of DRONE) assert.equal(droneRange(eff), range);
assert.equal(probeRadius(100), 5);
assert.equal(probeRadius(230), 11.5, 'the manual\'s coverage figure: 230% scans 11.5U');
assert.equal(probeRadius(300), 15);

// Between rows, and past the ends.
assert.equal(tractorReach(16.5), 1.25);
assert.equal(tractorReach(3), 2, 'no reach beyond the 2U maximum');
assert.equal(tractorReach(120), 0.5, 'no reach below the widest arc\'s');
assert.equal(droneRange(125), 126.5);
for (let a = 6; a < 90; a++) assert.ok(tractorReach(a + 1) < tractorReach(a), 'a wider arc never reaches further');

// Missile defence: torpedoes need the narrowest beam, mines the widest (3.8.4).
assert.deepEqual(DEFENCE.map(d => d.maxArc), [17, 23, 67]);
assert.equal(DRAG.length, 8);
assert.ok(DRAG.every(r => r.length === 3));

console.log('tractor-drones: all checks passed');
