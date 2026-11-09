// Hacking Trainer rules. No page code here, so test.js can check them in Node.

export const LEVELS = {
  basic:     { label: 'Basic',     size: 6,  traps: 4 },
  secure:    { label: 'Secure',    size: 8,  traps: 10 },
  hardened:  { label: 'Hardened',  size: 10, traps: 25 },
  fortified: { label: 'Fortified', size: 12, traps: 36 },
};

export function newGame(size, traps) {
  return {
    size, traps, started: false, over: false, won: false, opened: 0,
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

// The nodes a probe of node i opens: it, and outwards through every node with no traps around it.
function spread(g, i) {
  const seen = new Set([i]), queue = [i];
  while (queue.length) {
    const j = queue.pop();
    if (g.cells[j].near) continue;
    for (const n of neighbours(g, j)) if (!seen.has(n) && !g.cells[n].open) { seen.add(n); queue.push(n); }
  }
  return seen;
}

// Traps go down on the first probe, never on it or next to it, so the first
// probe is always safe and always opens up an area to work from. A layout that
// first probe would clear in one go is dealt again: a one-tap win would be a
// best time nobody could beat.
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

export function probe(g, i, random = Math.random) {
  if (g.over || g.cells[i].open) return;
  if (!g.started) layTraps(g, i, random);
  if (g.cells[i].trap) { g.cells[i].open = true; g.over = true; return; }
  for (const j of spread(g, i)) { g.cells[j].open = true; g.opened++; }
  if (g.opened === g.size * g.size - g.traps) { g.over = true; g.won = true; }
}

// The score: how much of the network is open, as a whole percentage (100 only for a win).
export const cleared = g => Math.floor(100 * g.opened / (g.size * g.size - g.traps));

// m:ss.s, the way run times and best times are shown.
export function time(ms) {
  const t = Math.round(ms / 100);
  return Math.floor(t / 600) + ':' + String(Math.floor(t / 10) % 60).padStart(2, '0') + '.' + (t % 10);
}

// Adds a finished run to the records for its level, and says which bests it beat.
export function record(records, level, g, ms) {
  const r = records[level] = { runs: 0, wins: 0, bestMs: null, bestPct: 0, ...records[level] };
  const pct = cleared(g);
  const beat = { time: g.won && (r.bestMs === null || ms < r.bestMs), score: pct > r.bestPct };
  r.runs++;
  if (g.won) r.wins++;
  if (beat.time) r.bestMs = Math.round(ms);
  if (beat.score) r.bestPct = pct;
  return beat;
}
