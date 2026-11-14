// The Scan Trainer's sums, with no page code, so test.js can check them in Node.
// Modelled on how the scan behaves in the game (Empty Epsilon, which Bridge
// Command runs), in our own code: each scan is a few stages; in each, sliders
// (one at level 1 up to four at level 4) hide a setting. The total distance
// of the sliders from it drives the trace: the three waves slide sideways at
// their own speeds, stretch and drown in noise, and turn back the moment a
// slider passes its setting. Within 0.05 they pull together by themselves
// over a second, show LOCKED, and the stage is done at two seconds.

export const LEVELS = [1, 2, 3, 4];               // sliders per stage
export const STAGES = { 1: 2, 2: 2, 3: 3, 4: 4 }; // stages per scan: [1/2] [2/2] at levels 1 and 2, [1/4]… at level 4; level 3's is a guess
export const LOCK_ERROR = 0.05;   // total slider error under which the signal locks
export const LOCK_DELAY = 2;      // seconds in the lock: pulling together for half of it, LOCKED for the rest

// Our own names for the signal being tuned.
export const NAMES = [
  'Subspace harmonic drift', 'Tachyon echo alignment', 'Ion wake calibration', 'Hull resonance sweep',
  'Gravimetric phase match', 'Thermal bloom filter', 'Neutrino scatter trim', 'Plasma whistle tuning',
  'Ghost-band suppression', 'Kettle static filter', 'Quantum flutter damping', 'Biscuit tin interference',
];

// Total distance of the sliders from their targets, as the game counts it at
// every level: four sliders show nothing but noise until they are all close.
export const error = (values, target) => target.reduce((sum, t, i) => sum + Math.abs(values[i] - t), 0);
export const clean = (values, target) => error(values, target) < LOCK_ERROR;

// The signal in words, for screen readers and the status line.
export function quality(e) {
  return e < LOCK_ERROR ? 'clean' : e < 0.15 ? 'strong' : e < 0.35 ? 'fair' : 'weak';
}

// The error the trace shows: the real one, until the signal is in the lock;
// then it fades to nothing over the first half of the lock, so the waves pull
// together by themselves even while a slider is still moving.
export function shownError(e, heldSeconds) {
  return e < LOCK_ERROR ? e * Math.max(0, 1 - heldSeconds / (LOCK_DELAY / 2)) : e;
}

// A stage: its name, the hidden setting, where the sliders start (each at
// least 0.2 off its own setting), and how many waves span the trace (2 to 5).
export function newStage(sliders, rand = Math.random, avoid = '') {
  let name;
  do name = NAMES[Math.floor(rand() * NAMES.length)]; while (name === avoid);
  const target = Array.from({ length: sliders }, () => rand());
  const start = target.map(t => { let v; do v = rand(); while (Math.abs(v - t) < 0.2); return v; });
  return { name, target, start, waves: 2 + rand() * 3 };
}

// One colour's wave (c = 0 red, 1 green, 2 blue) for a shown error e, t
// seconds into the scan, with waves across the trace. Its sideways shift grows
// with the error at its own rate (red slowest, blue fastest), so moving a
// slider slides the three apart and they turn back as it passes its setting;
// all three also drift slowly with time. Red keeps its width; green and blue
// stretch with the error. Error past 1 counts as 1.
export function wave(e, c, t, waves) {
  const err = Math.min(Math.abs(e), 1);
  return { shift: t + err * (100 + 45 * c), turns: waves * (1 + err * 2.2 * c), noise: err };
}

// That wave as an SVG path, w × h px: the noise fades the wave out in favour
// of random jitter, so at e = 0 the three colours draw the same clean line.
export function tracePath(e, c, w, h, t = 0, waves = 3, rand = Math.random) {
  const { shift, turns, noise } = wave(e, c, t, waves), a = h * 0.4, mid = h / 2;
  let d = '';
  for (let x = 0; x <= w; x += 3) {
    const f = (1 - noise) * Math.sin(2 * Math.PI * turns * x / w + shift) + noise * (rand() * 2 - 1);
    d += (x ? 'L' : 'M') + x + ' ' + Math.max(1, Math.min(h - 1, mid - f * a)).toFixed(1);
  }
  return d;
}

// A repeatable random sequence (shared/challenge.js), so a challenge gives a friend
// the same contact: every stage's name, hidden setting and starting sliders.
import { seeded, newSeed, toB64, fromB64 } from '../shared/challenge.js';
export { seeded, newSeed };

// A challenge in a link: the level and seed that made the contact, and the
// sender's name and time. Anyone can make a link, so reading one checks everything.
export const challengeLink = c => toB64(JSON.stringify({ l: c.level, s: c.seed, t: Math.round(c.ms), n: c.name || '' }));
export function readChallenge(text) {
  let o;
  try { o = JSON.parse(fromB64(String(text))); } catch (e) { return null; }
  const whole = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  if (!o || !LEVELS.includes(o.l) || !whole(o.s, 1, 2147483646) || !whole(o.t, 1, 36e5)) return null;
  const name = typeof o.n === 'string' ? o.n.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40) : '';
  return { level: o.l, seed: o.s, ms: o.t, name };
}
// Who scanned the same contact faster: above 0 if a beat b; within a twentieth of a second is a dead heat.
export const compare = (a, b) => (Math.abs(b.ms - a.ms) < 50 ? 0 : b.ms - a.ms);

// Adds a finished scan to its level's records; true if it is a new best time.
export function record(records, level, ms) {
  const r = records[level] = { scans: 0, bestMs: null, ...records[level] };
  r.scans++;
  const best = r.bestMs === null || ms < r.bestMs;
  if (best) r.bestMs = Math.round(ms);
  return best;
}

// "6.3s", "1m 04s".
export function time(s) {
  if (s < 60) return s.toFixed(1) + 's';
  const r = Math.round(s);
  return Math.floor(r / 60) + 'm ' + String(r % 60).padStart(2, '0') + 's';
}
