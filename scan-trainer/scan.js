// The Scan Trainer's sums, with no page code, so test.js can check them in Node.
// A waveform is { length, height }, each 0–100 as its sliders read.

// Waveforms to lock: level 1 is one, level 2 is two.
export const LEVELS = [1, 2];
// How close each slider must be to the contact's, out of 100, to lock.
export const TOLERANCE = 3;
// Where the sliders start for every contact.
export const START = { length: 50, height: 50 };

const pick = rand => 10 + Math.round(rand() * 80);   // kept off the slider ends

const near = (a, b) => Math.abs(a.length - b.length) <= TOLERANCE && Math.abs(a.height - b.height) <= TOLERANCE;

// Every waveform of yours sits on the contact's.
export const locked = (yours, theirs) => theirs.every((t, i) => near(yours[i], t));

// A new contact's waveforms, none already locked from the starting sliders,
// so every scan needs each waveform set.
export function newContact(count, rand = Math.random) {
  return Array.from({ length: count }, () => {
    let w;
    do w = { length: pick(rand), height: pick(rand) }; while (near(START, w));
    return w;
  });
}

// How well one of your waveforms matches the contact's, 0–100: 100 when exact,
// falling 2 a step for each slider step off.
export const match = (yours, theirs) =>
  Math.max(0, 100 - 2 * (Math.abs(yours.length - theirs.length) + Math.abs(yours.height - theirs.height)));

// Slider value to drawing: length to the wave's period in px, height to its peak in px.
export const period = length => 28 + length * 1.7;
export const peak = height => 3 + height * 0.27;   // up to 30px, inside its 35px half of the scope

// An SVG path of the waveform, w px wide, centred on y = mid, shifted by phase (radians).
export function wavePath(wave, w, mid, phase = 0) {
  const p = period(wave.length), a = peak(wave.height);
  let d = '';
  for (let x = 0; x <= w; x += 2) d += (x ? 'L' : 'M') + x + ' ' + (mid - a * Math.sin(2 * Math.PI * x / p + phase)).toFixed(1);
  return d;
}

// "6.3s", "1m 04s".
export function time(s) {
  if (s < 60) return s.toFixed(1) + 's';
  const r = Math.round(s);
  return Math.floor(r / 60) + 'm ' + String(r % 60).padStart(2, '0') + 's';
}
