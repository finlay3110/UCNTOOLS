// Checks the sums in scan.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { LEVELS, TOLERANCE, START, locked, newContact, match, period, peak, wavePath, time } from './scan.js';

// A repeatable "random" for the checks.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

assert.deepEqual(LEVELS, [1, 2]);

// Contacts: the right number of waveforms, off the slider ends, never already locked at the start.
for (let i = 0; i < 500; i++) {
  for (const n of LEVELS) {
    const c = newContact(n, rand);
    assert.equal(c.length, n);
    for (const w of c) assert.ok(w.length >= 10 && w.length <= 90 && w.height >= 10 && w.height <= 90, JSON.stringify(w));
    assert.ok(!locked(Array(n).fill(START), c), 'not locked before you start');
  }
}
// Even a contact that would land on the start is moved off it.
let k = 0;
const lands = () => [0.5, 0.5, 0.1, 0.9][k++ % 4];   // 50, 50 (on the start), then 18, 82
assert.deepEqual(newContact(1, lands), [{ length: 18, height: 82 }]);

// Locking: every waveform within TOLERANCE on both sliders.
const t = [{ length: 40, height: 60 }, { length: 70, height: 20 }];
assert.ok(locked([{ length: 40, height: 60 }, { length: 70, height: 20 }], t), 'exact');
assert.ok(locked([{ length: 40 + TOLERANCE, height: 60 - TOLERANCE }, { length: 70, height: 20 }], t), 'at the edge');
assert.ok(!locked([{ length: 40 + TOLERANCE + 1, height: 60 }, { length: 70, height: 20 }], t), 'length just out');
assert.ok(!locked([{ length: 40, height: 60 }, { length: 70, height: 20 + TOLERANCE + 1 }], t), 'second waveform out');

// Match: 100 when exact, 2 off for each step, never below 0.
assert.equal(match({ length: 40, height: 60 }, { length: 40, height: 60 }), 100);
assert.equal(match({ length: 45, height: 58 }, { length: 40, height: 60 }), 86);
assert.equal(match({ length: 0, height: 0 }, { length: 100, height: 100 }), 0);

// Drawing: longer length, longer period; more height, taller peak; the path spans the width.
assert.ok(period(80) > period(20) && peak(80) > peak(20));
const d = wavePath({ length: 50, height: 50 }, 320, 50);
assert.ok(d.startsWith('M0 50.0') && d.includes('L320 '), d.slice(0, 40));

assert.equal(time(6.34), '6.3s'); assert.equal(time(64), '1m 04s');

console.log('scan trainer: all checks passed');
