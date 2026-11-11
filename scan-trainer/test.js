// Checks the sums in scan.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { LEVELS, STAGES, LOCK_ERROR, HOLD, NAMES, error, clean, quality, newStage, tracePath, time } from './scan.js';

// A repeatable "random" for the checks.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

assert.deepEqual(LEVELS, [1, 2]);
assert.equal(STAGES, 2);
assert.ok(HOLD > 0);
assert.equal(new Set(NAMES).size, NAMES.length, 'no name twice');

// Stages: one hidden setting per slider, kept off the ends, sliders starting well off it.
for (let i = 0; i < 500; i++) {
  for (const n of LEVELS) {
    const s = newStage(n, rand);
    assert.equal(s.target.length, n); assert.equal(s.start.length, n);
    for (const t of s.target) assert.ok(t >= 0.1 && t <= 0.9, t);
    for (const v of s.start) assert.ok(v >= 0 && v <= 1, v);
    assert.ok(error(s.start, s.target) >= 0.3, 'starts noisy');
    assert.ok(NAMES.includes(s.name));
  }
}
// The second stage never repeats the first's name.
for (let i = 0; i < 200; i++) { const a = newStage(1, rand); assert.notEqual(newStage(1, rand, a.name).name, a.name); }

// Error and clean: the total over every slider, clean under LOCK_ERROR.
assert.equal(error([0.5], [0.5]), 0);
assert.ok(Math.abs(error([0.4, 0.7], [0.5, 0.6]) - 0.2) < 1e-12);
assert.ok(clean([0.52], [0.5]));
assert.ok(!clean([0.5 + LOCK_ERROR], [0.5]), 'the edge is not clean');
assert.ok(!clean([0.5, 0.2], [0.5, 0.6]), 'one slider right is not enough at level 2');
assert.ok(clean([0.51, 0.61], [0.5, 0.6]));
assert.equal(quality(0.01), 'clean'); assert.equal(quality(0.1), 'strong'); assert.equal(quality(0.2), 'fair'); assert.equal(quality(0.6), 'weak');

// The trace: on target the three colours draw the same clean line; off target they differ.
const zero = () => 0.5;   // no noise
const lines = e => [-1, 0, 1].map(k => tracePath(e, k, 300, 60, zero));
assert.equal(new Set(lines(0)).size, 1, 'one clean wave');
assert.equal(new Set(lines(0.5)).size, 3, 'three drifting lines');
const ys = d => d.split(/[ML]/).filter(Boolean).map(p => +p.split(' ')[1]);
for (const d of [...lines(0), ...lines(5)]) for (const y of ys(d)) assert.ok(y >= 1 && y <= 59, 'stays in the box');
assert.ok(tracePath(0, 0, 300, 60, zero).startsWith('M0 30.0'));

assert.equal(time(6.34), '6.3s'); assert.equal(time(64), '1m 04s');

console.log('scan trainer: all checks passed');
