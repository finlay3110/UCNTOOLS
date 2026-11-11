// The Scan Trainer's sums, with no page code, so test.js can check them in Node.
// Modelled on the in-game scan as it plays: each scan is two stages; in each,
// sliders (one at level 1, two at level 2) hide a setting. The further off
// they are, the noisier the signal; on target it comes clean, and held there
// it locks. Tuned by eye from gameplay, not taken from the game.

export const LEVELS = [1, 2];     // sliders per stage
export const STAGES = 2;          // a scan is [1/2] then [2/2]
export const LOCK_ERROR = 0.05;   // total slider error (0–1 each) under which the signal is clean
export const HOLD = 2;            // seconds held clean before it locks
export const CYCLES = 6;          // waves across the trace

// Our own names for the signal being tuned.
export const NAMES = [
  'Subspace harmonic drift', 'Tachyon echo alignment', 'Ion wake calibration', 'Hull resonance sweep',
  'Gravimetric phase match', 'Thermal bloom filter', 'Neutrino scatter trim', 'Plasma whistle tuning',
  'Ghost-band suppression', 'Kettle static filter', 'Quantum flutter damping', 'Biscuit tin interference',
];

// Total distance of the sliders from their targets.
export const error = (values, target) => target.reduce((sum, t, i) => sum + Math.abs(values[i] - t), 0);
export const clean = (values, target) => error(values, target) < LOCK_ERROR;

// The signal in words, for screen readers and the status line.
export function quality(e) {
  return e < LOCK_ERROR ? 'clean' : e < 0.15 ? 'strong' : e < 0.35 ? 'fair' : 'weak';
}

// A stage: its name, the hidden setting, and where the sliders start (well off it).
export function newStage(sliders, rand = Math.random, avoid = '') {
  let name;
  do name = NAMES[Math.floor(rand() * NAMES.length)]; while (name === avoid);
  const target = Array.from({ length: sliders }, () => 0.1 + rand() * 0.8);
  let start;
  do start = target.map(() => rand()); while (error(start, target) < 0.3);
  return { name, target, start };
}

// One colour's line of the trace, w × h px, for a slider error e. The three
// colours (k = -1, 0, 1) drift apart in period and phase as e grows, and
// noise scaled by e is added on top; at e = 0 they are the same clean wave.
export function tracePath(e, k, w, h, rand = Math.random) {
  const err = Math.min(e, 1), a = h * 0.34, mid = h / 2;
  const turns = CYCLES * (1 + k * 0.3 * err), shift = k * err * 2.4;
  let d = '';
  for (let x = 0; x <= w; x += 3) {
    const y = mid - a * Math.sin(2 * Math.PI * turns * x / w + shift) + (rand() * 2 - 1) * h * 0.42 * err;
    d += (x ? 'L' : 'M') + x + ' ' + Math.max(1, Math.min(h - 1, y)).toFixed(1);
  }
  return d;
}

// "6.3s", "1m 04s".
export function time(s) {
  if (s < 60) return s.toFixed(1) + 's';
  const r = Math.round(s);
  return Math.floor(r / 60) + 'm ' + String(r % 60).padStart(2, '0') + 's';
}
