// Hacking Trainer rules, as the UCN Academy Manual (3.9) describes Bridge
// Command hacking. No page code here, so test.js can check them in Node.

// apply: the progress (%) at which a partial breach can be applied.
export const LEVELS = {
  basic:     { label: 'Basic',     size: 6,  traps: 4,  apply: 60 },
  secure:    { label: 'Secure',    size: 8,  traps: 10, apply: 70 },
  hardened:  { label: 'Hardened',  size: 10, traps: 25, apply: 80 },
  fortified: { label: 'Fortified', size: 12, traps: 36, apply: 100 },
};

export function newGame(size, traps, apply = 100) {
  return {
    size, traps, apply, started: false, over: false, won: false, opened: 0, strikes: 0,
    applied: 0,   // the breach % that took effect, once over (0 = nothing)
    cells: Array.from({ length: size * size }, () => ({ trap: false, open: false, near: 0 })),
  };
}

// The up-to-8 nodes touching node i, diagonals included.
export function neighbours(g, i) {
  const r = Math.floor(i / g.size), c = i % g.size, out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if ((dr || dc) && rr >= 0 && cc >= 0 && rr < g.size && cc < g.size) out.push(rr * g.size + cc);
    }
  }
  return out;
}

// The nodes a probe of node i opens: it, and outwards through every node with no routines around it.
function spread(g, i) {
  const seen = new Set([i]), queue = [i];
  while (queue.length) {
    const j = queue.pop();
    if (g.cells[j].near) continue;
    for (const n of neighbours(g, j)) if (!seen.has(n) && !g.cells[n].open) { seen.add(n); queue.push(n); }
  }
  return seen;
}

// Defence routines go down on the first probe, never on it or next to it, so
// the first probe is always safe and always opens up an area to work from. A
// layout that first probe would clear in one go is dealt again: a one-tap
// breach would be a best time nobody could beat.
function layTraps(g, first, random) {
  const clear = new Set([first, ...neighbours(g, first)]);
  const spots = g.cells.map((_, i) => i).filter(i => !clear.has(i));
  do {
    g.cells.forEach(cell => { cell.trap = false; });
    for (let n = 0; n < g.traps; n++) {
      const k = n + Math.floor(random() * (spots.length - n));   // a shuffle, stopped once enough are picked
      [spots[n], spots[k]] = [spots[k], spots[n]];
      g.cells[spots[n]].trap = true;
    }
    g.cells.forEach((cell, i) => { cell.near = neighbours(g, i).filter(j => g.cells[j].trap).length; });
  } while (spread(g, first).size === g.size * g.size - g.traps);
  g.started = true;
}

// Hacking in progress: how much of the grid's safe nodes are clear, as a whole percentage (100 only when breached).
export const cleared = g => Math.floor(100 * g.opened / (g.size * g.size - g.traps));

export const canApply = g => g.started && !g.over && cleared(g) >= g.apply;

function end(g, applied) { g.over = true; g.applied = applied; }

export function probe(g, i, random = Math.random) {
  if (g.over || g.cells[i].open) return;
  if (!g.started) layTraps(g, i, random);
  if (g.cells[i].trap) {
    // The first defence routine is marked; the second ends the attempt. Past
    // the Apply threshold, the breach still applies what it had.
    g.cells[i].open = true;
    if (++g.strikes === 2) end(g, cleared(g) >= g.apply ? cleared(g) : 0);
    return;
  }
  for (const j of spread(g, i)) { g.cells[j].open = true; g.opened++; }
  if (g.opened === g.size * g.size - g.traps) { g.won = true; end(g, 100); }
}

// Bank the breach at its current progress.
export function apply(g) { if (canApply(g)) end(g, cleared(g)); }

// Around the grid (manual 3.9 and Table 3-7): how hacked the target system is,
// and how hot your Scanners are. Both carry over from one attempt to the next.
export const newSession = () => ({ hacked: 0, heat: 0 });

// Time passing: a 100% hack wears off in about 3 minutes, and each 10% of
// coolant cools the Scanners 0.5° a second. With none, they don't cool.
export function elapse(s, seconds, coolant) {
  s.hacked = Math.max(0, s.hacked - seconds * 100 / 180);
  s.heat = Math.max(0, s.heat - seconds * coolant / 20);
}

// A finished attempt adds half its applied breach to the target and, however
// it ended, dumps 20–40° into the Scanners (which take damage at 100°).
// Returns the heat it dumped.
export function endAttempt(s, applied, random = Math.random) {
  const heat = 20 + Math.floor(random() * 21);
  s.hacked = Math.min(100, s.hacked + applied / 2);
  s.heat = Math.min(100, s.heat + heat);
  return heat;
}

// How well a target system at 100% power still works: a full hack takes 75 points off.
export const effectiveness = hacked => 100 - 0.75 * hacked;

// What that does to each system (manual 3.9.5; shields from Table 3-18). e is
// the effectiveness above, 25–100 (%).
const one = x => Math.round(x * 10) / 10;
const shieldDamage = e => (e >= 50 ? (100 - e) / 5 : 10 + (50 - e) / 10);
export const SYSTEMS = {
  beams:       { label: 'Beams',       effect: e => `their beams fire every ${one(600 / e)} s instead of 6` },
  missiles:    { label: 'Missiles',    effect: e => `their missiles take ${one(100 / e)} times as long to reload` },
  impulse:     { label: 'Impulse',     effect: e => `their top speed drops to ${Math.round(e)}% of normal` },
  manoeuvring: { label: 'Manoeuvring', effect: e => `they turn at ${Math.round(e)}% of their normal rate` },
  warp:        { label: 'Warp',        effect: e => `their warp speed drops to ${Math.round(e)}% of normal` },
  shields:     { label: 'Shields',     effect: e => `their shields take ${one(shieldDamage(e))}% more damage and recharge at ${Math.round(e)}% of normal speed` },
};

// The manual's training benchmark: a full breach on Secure in under 40 seconds
// without triggering a single defence routine.
export const academyStandard = (level, g, ms) => level === 'secure' && g.won && g.strikes === 0 && ms < 40000;

// m:ss.s, the way run times and best times are shown.
export function time(ms) {
  const t = Math.round(ms / 100);
  return Math.floor(t / 600) + ':' + String(Math.floor(t / 10) % 60).padStart(2, '0') + '.' + (t % 10);
}

// Adds a finished attempt to the records for its level, and says which bests it
// beat (and whether it met the Academy standard for the first time). wins
// counts breaches that took effect, full or partial.
export function record(records, level, g, ms) {
  const r = records[level] = { runs: 0, wins: 0, bestMs: null, bestPct: 0, ...records[level] };
  const beat = { time: g.won && (r.bestMs === null || ms < r.bestMs), score: g.applied > r.bestPct, academy: academyStandard(level, g, ms) && !r.academy };
  r.runs++;
  if (g.applied) r.wins++;
  if (beat.time) r.bestMs = Math.round(ms);
  if (beat.score) r.bestPct = g.applied;
  if (beat.academy) r.academy = true;
  return beat;
}
