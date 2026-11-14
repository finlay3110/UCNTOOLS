// Checks the sums in scan.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { LEVELS, STAGES, LOCK_ERROR, LOCK_DELAY, NAMES, error, clean, quality, shownError, newStage, wave, tracePath, time,
  seeded, newSeed, challengeLink, readChallenge, compare, record } from './scan.js';

// A repeatable "random" for the checks.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

assert.deepEqual(LEVELS, [1, 2, 3, 4]);
assert.deepEqual(STAGES, { 1: 2, 2: 2, 3: 3, 4: 4 });
assert.equal(LOCK_DELAY, 2);
assert.equal(new Set(NAMES).size, NAMES.length, 'no name twice');

// Stages: one hidden setting per slider, each slider starting at least 0.2 off its own; 2 to 5 waves.
for (let i = 0; i < 500; i++) {
  for (const n of LEVELS) {
    const s = newStage(n, rand);
    assert.equal(s.target.length, n); assert.equal(s.start.length, n);
    s.target.forEach((t, j) => { assert.ok(t >= 0 && t <= 1, t); assert.ok(s.start[j] >= 0 && s.start[j] <= 1); assert.ok(Math.abs(s.start[j] - t) >= 0.2, 'starts well off'); });
    assert.ok(s.waves >= 2 && s.waves <= 5, s.waves);
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
// Every level counts the plain total, as the game does: at level 4, 1% off on each slider locks, 2% off does not.
assert.ok(Math.abs(error([0.4, 0.6, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]) - 0.2) < 1e-12);
assert.ok(clean([0.51, 0.49, 0.51, 0.49], [0.5, 0.5, 0.5, 0.5]));
assert.ok(!clean([0.52, 0.48, 0.52, 0.48], [0.5, 0.5, 0.5, 0.5]));
assert.ok(!clean([0.5, 0.5, 0.2], [0.5, 0.5, 0.5]), 'every slider counts at level 3');

// In the lock the shown error fades to nothing over half the delay; outside it, it is the real one.
assert.equal(shownError(0.04, 0), 0.04);
assert.ok(Math.abs(shownError(0.04, LOCK_DELAY / 4) - 0.02) < 1e-12, 'half way through the pull');
assert.equal(shownError(0.04, LOCK_DELAY / 2), 0);
assert.equal(shownError(0.3, 5), 0.3, 'out of the lock nothing fades');
assert.equal(quality(0.01), 'clean'); assert.equal(quality(0.1), 'strong'); assert.equal(quality(0.2), 'fair'); assert.equal(quality(0.6), 'weak');

// The waves: each colour shifts sideways with the error at its own rate (red
// slowest), so all three move as a slider does; the shift grows with distance
// either side of the setting, so they turn back as the slider passes it.
const shifts = e => [0, 1, 2].map(c => wave(e, c, 0, 3).shift);
assert.deepEqual(shifts(0), [0, 0, 0], 'on target: in step');
assert.deepEqual(shifts(0.1).map(v => +v.toFixed(6)), [10, 14.5, 19], 'different speeds, red slowest');
const sweep = [0.3, 0.4, 0.5, 0.6, 0.7].map(v => wave(error([v], [0.5]), 0, 0, 3).shift);
assert.ok(sweep[0] > sweep[1] && sweep[1] > sweep[2] && sweep[2] < sweep[3] && sweep[3] < sweep[4], 'they turn back at the setting');
assert.equal(wave(0.4, 0, 0, 3).turns, 3, 'red keeps its width');
assert.ok(wave(0.4, 2, 0, 3).turns > wave(0.4, 1, 0, 3).turns && wave(0.4, 1, 0, 3).turns > 3, 'green and blue stretch, blue more');
assert.equal(wave(0, 0, 2.5, 3).shift, 2.5, 'all drift with time');
assert.equal(wave(7, 0, 0, 3).noise, 1, 'error past 1 counts as 1');
// The trace: on target the three colours draw the same clean line; off target they differ.
const zero = () => 0.5;   // no jitter
const lines = (e, t = 0) => [0, 1, 2].map(c => tracePath(e, c, 300, 60, t, 3, zero));
assert.equal(new Set(lines(0)).size, 1, 'one clean wave');
assert.equal(new Set(lines(0, 4.2)).size, 1, 'still one wave as it drifts');
assert.equal(new Set(lines(0.3)).size, 3, 'three lines apart');
const ys = d => d.split(/[ML]/).filter(Boolean).map(p => +p.split(' ')[1]);
for (const d of [...lines(0), ...lines(0.5), ...lines(5)]) for (const y of ys(d)) assert.ok(y >= 1 && y <= 59, 'stays in the box');
assert.ok(tracePath(0, 0, 300, 60, 0, 3, zero).startsWith('M0 30.0'));
assert.equal(new Set(ys(tracePath(1, 0, 300, 60, 0, 3, zero))).size, 1, 'at full error the wave is gone: only noise (flat here)');

// Challenges: the same seed gives the same contact, every stage, waves and all.
const contact = seed => { const r = seeded(seed), a = newStage(4, r); return [a, newStage(4, r, a.name)]; };
const sd = newSeed();
assert.ok(Number.isInteger(sd) && sd >= 1 && sd <= 2147483646);
assert.deepEqual(contact(sd), contact(sd));
assert.notDeepEqual(contact(12345), contact(54321));
// A link reads back; a bad or tampered one is refused; names are tidied.
const c = { level: 2, seed: 987654321, ms: 6342.4, name: 'Zoë  \n Ash' };
assert.deepEqual(readChallenge(challengeLink(c)), { level: 2, seed: 987654321, ms: 6342, name: 'Zoë Ash' });
const link = o => Buffer.from(JSON.stringify(o)).toString('base64url');
assert.equal(readChallenge('nonsense'), null);
assert.equal(readChallenge(link({ l: 5, s: 5, t: 100 })), null, 'no level 5');
assert.equal(readChallenge(link({ l: 4, s: 5, t: 100 })).level, 4);
assert.equal(readChallenge(link({ l: 1, s: 0, t: 100 })), null, 'bad seed');
assert.equal(readChallenge(link({ l: 1, s: 5, t: -1 })), null, 'bad time');
assert.equal(readChallenge(link({ l: 1, s: 5, t: 100, n: 'x'.repeat(99) })).name.length, 40);
// Faster wins; a twentieth of a second either way is a dead heat.
assert.ok(compare({ ms: 5000 }, { ms: 6000 }) > 0);
assert.ok(compare({ ms: 7000 }, { ms: 6000 }) < 0);
assert.equal(compare({ ms: 6020 }, { ms: 6000 }), 0);
// Records: scans counted, best time kept.
const recs = {};
assert.equal(record(recs, 1, 8000.4), true);
assert.equal(record(recs, 1, 9000), false);
assert.equal(record(recs, 1, 7000), true);
assert.deepEqual(recs, { 1: { scans: 3, bestMs: 7000 } });

assert.equal(time(6.34), '6.3s'); assert.equal(time(64), '1m 04s');

console.log('scan trainer: all checks passed');
