// Checks the rules in game.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { LEVELS, newGame, neighbours, probe, cleared, time, record } from './game.js';

// A repeatable random, so a failing case can be replayed.
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

for (const [key, { size, traps }] of Object.entries(LEVELS)) {
  for (let seed = 1; seed <= 300; seed++) {
    const g = newGame(size, traps);
    const first = (seed * 7) % (size * size);
    probe(g, first, seeded(seed));
    assert.equal(g.cells.filter(c => c.trap).length, traps, `${key}: wrong number of traps`);
    assert.ok(!g.over, `${key} seed ${seed}: the first probe ended the game`);
    assert.equal(g.cells[first].near, 0, `${key} seed ${seed}: the first probe opened no area`);
    g.cells.forEach((c, i) => {
      assert.equal(c.near, neighbours(g, i).filter(j => g.cells[j].trap).length, `${key}: wrong number`);
      if (c.open && c.near === 0) neighbours(g, i).forEach(j => assert.ok(g.cells[j].open, `${key}: opening stopped early`));
    });
    assert.equal(g.opened, g.cells.filter(c => c.open).length, `${key}: open count drifted`);
    assert.ok(cleared(g) > 0 && cleared(g) < 100, `${key}: score after one probe`);
  }
}

// Win: open every safe node. The score is 100 only then.
{
  const g = newGame(6, 4);
  assert.equal(cleared(g), 0);
  probe(g, 0, seeded(3));
  g.cells.forEach((c, i) => {
    if (c.trap || g.over) return;
    probe(g, i);
    if (!g.won) assert.ok(cleared(g) < 100, 'only a win scores 100');
  });
  assert.ok(g.over && g.won, 'opening every safe node should win');
  assert.equal(cleared(g), 100);
}

// Loss: probing a trap ends it, and nothing opens after that.
{
  const g = newGame(8, 10);
  probe(g, 0, seeded(5));
  const score = cleared(g), safe = g.cells.findIndex(c => !c.trap && !c.open);
  probe(g, g.cells.findIndex(c => c.trap));
  assert.ok(g.over && !g.won, 'probing a trap should lose');
  probe(g, safe);
  assert.ok(!g.cells[safe].open && cleared(g) === score, 'nothing opens once the game is over');
}

// Times.
assert.equal(time(0), '0:00.0');
assert.equal(time(7349), '0:07.3');
assert.equal(time(59999), '1:00.0');
assert.equal(time(65960), '1:06.0');
assert.equal(time(3725000), '62:05.0');

// Records: runs and wins counted, a best only replaced by a better one.
{
  const records = {};
  const lost = { won: false, opened: 16, size: 6, traps: 4 };   // 50% of the 32 safe nodes
  const won = { won: true, opened: 32, size: 6, traps: 4 };
  assert.deepEqual(record(records, 'basic', lost, 4000), { time: false, score: true });
  assert.deepEqual(records.basic, { runs: 1, wins: 0, bestMs: null, bestPct: 50 });
  assert.deepEqual(record(records, 'basic', won, 9000.4), { time: true, score: true });
  assert.deepEqual(record(records, 'basic', won, 12000), { time: false, score: false });
  assert.deepEqual(record(records, 'basic', won, 8000), { time: true, score: false });
  assert.deepEqual(records.basic, { runs: 4, wins: 3, bestMs: 8000, bestPct: 100 });
  assert.equal(records.secure, undefined, 'other levels untouched');
}

console.log('hacking-trainer: all checks passed');
