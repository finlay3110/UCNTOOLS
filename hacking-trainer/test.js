// Checks the rules in game.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { LEVELS, newGame, neighbours, probe, toggleFlag, trapsLeft } from './game.js';

// A repeatable random, so a failing case can be replayed.
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

for (const [key, { size, traps }] of Object.entries(LEVELS)) {
  for (let seed = 1; seed <= 300; seed++) {
    const g = newGame(size, traps);
    const first = (seed * 7) % (size * size);
    probe(g, first, seeded(seed));
    assert.equal(g.cells.filter(c => c.trap).length, traps, `${key}: wrong number of traps`);
    // (A first probe can win outright on Basic, about 1 game in 90; it can never lose.)
    assert.ok(!(g.over && !g.won), `${key} seed ${seed}: the first probe hit a trap`);
    assert.equal(g.cells[first].near, 0, `${key} seed ${seed}: the first probe opened no area`);
    g.cells.forEach((c, i) => {
      assert.equal(c.near, neighbours(g, i).filter(j => g.cells[j].trap).length, `${key}: wrong number`);
      if (c.open && c.near === 0) neighbours(g, i).forEach(j => assert.ok(g.cells[j].open, `${key}: opening stopped early`));
    });
    assert.equal(g.opened, g.cells.filter(c => c.open).length, `${key}: open count drifted`);
  }
}

// Win: open every safe node.
{
  const g = newGame(6, 4);
  probe(g, 0, seeded(3));
  g.cells.forEach((c, i) => { if (!c.trap) probe(g, i); });
  assert.ok(g.over && g.won, 'opening every safe node should win');
}

// Flags: counted, they block a probe, and probing a trap loses.
{
  const g = newGame(6, 4);
  probe(g, 0, seeded(3));
  const trap = g.cells.findIndex(c => c.trap);
  toggleFlag(g, trap);
  assert.equal(trapsLeft(g), 3);
  probe(g, trap);
  assert.ok(!g.over, 'a flagged node must not be probed');
  toggleFlag(g, trap);
  probe(g, trap);
  assert.ok(g.over && !g.won, 'probing a trap should lose');
  toggleFlag(g, 1);
  assert.equal(trapsLeft(g), 4, 'no flagging once the game is over');
}

console.log('hacking-trainer: all checks passed');
