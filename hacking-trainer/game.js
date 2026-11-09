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

// m:ss.s, the way run times and best times are shown.
export function time(ms) {
  const t = Math.round(ms / 100);
  return Math.floor(t / 600) + ':' + String(Math.floor(t / 10) % 60).padStart(2, '0') + '.' + (t % 10);
}

// Adds a finished attempt to the records for its level, and says which bests it
// beat. wins counts breaches that took effect, full or partial.
export function record(records, level, g, ms) {
  const r = records[level] = { runs: 0, wins: 0, bestMs: null, bestPct: 0, ...records[level] };
  const beat = { time: g.won && (r.bestMs === null || ms < r.bestMs), score: g.applied > r.bestPct };
  r.runs++;
  if (g.applied) r.wins++;
  if (beat.time) r.bestMs = Math.round(ms);
  if (beat.score) r.bestPct = g.applied;
  return beat;
}
