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
    cells: Array.from({ length: size * size }, () => ({ trap: false, open: false, flag: false, near: 0 })),
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

// Traps go down on the first probe, never on it or next to it, so the first
// probe is always safe and always opens up an area to work from.
function layTraps(g, first, random) {
  const clear = new Set([first, ...neighbours(g, first)]);
  const spots = g.cells.map((_, i) => i).filter(i => !clear.has(i));
  for (let n = 0; n < g.traps; n++) {
    const k = n + Math.floor(random() * (spots.length - n));   // a shuffle, stopped once enough are picked
    [spots[n], spots[k]] = [spots[k], spots[n]];
    g.cells[spots[n]].trap = true;
  }
  g.cells.forEach((cell, i) => { cell.near = neighbours(g, i).filter(j => g.cells[j].trap).length; });
  g.started = true;
}

export function probe(g, i, random = Math.random) {
  if (g.over || g.cells[i].open || g.cells[i].flag) return;
  if (!g.started) layTraps(g, i, random);
  if (g.cells[i].trap) { g.cells[i].open = true; g.over = true; return; }
  // Open the node, and keep opening outwards through every node with no traps around it.
  const queue = [i];
  while (queue.length) {
    const j = queue.pop(), cell = g.cells[j];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    g.opened++;
    if (cell.near === 0) queue.push(...neighbours(g, j));
  }
  if (g.opened === g.size * g.size - g.traps) { g.over = true; g.won = true; }
}

export function toggleFlag(g, i) {
  if (!g.over && !g.cells[i].open) g.cells[i].flag = !g.cells[i].flag;
}

export const trapsLeft = g => g.traps - g.cells.filter(c => c.flag).length;
