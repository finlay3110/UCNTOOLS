// Checks the rules in game.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { LEVELS, newGame, neighbours, probe, cleared, canApply, apply, time, record, newSession, elapse, endAttempt, effectiveness, SYSTEMS } from './game.js';

// A repeatable random, so a failing case can be replayed.
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const safeLeft = g => g.cells.map((c, i) => (!c.trap && !c.open ? i : -1)).filter(i => i >= 0);
const routines = g => g.cells.map((c, i) => (c.trap ? i : -1)).filter(i => i >= 0);

for (const [key, { size, traps, apply: at }] of Object.entries(LEVELS)) {
  for (let seed = 1; seed <= 300; seed++) {
    const g = newGame(size, traps, at);
    const first = (seed * 7) % (size * size);
    probe(g, first, seeded(seed));
    assert.equal(g.cells.filter(c => c.trap).length, traps, `${key}: wrong number of defence routines`);
    assert.ok(!g.over && g.strikes === 0, `${key} seed ${seed}: the first probe ended the attempt`);
    assert.equal(g.cells[first].near, 0, `${key} seed ${seed}: the first probe opened no area`);
    g.cells.forEach((c, i) => {
      assert.equal(c.near, neighbours(g, i).filter(j => g.cells[j].trap).length, `${key}: wrong trace`);
      if (c.open && c.near === 0) neighbours(g, i).forEach(j => assert.ok(g.cells[j].open, `${key}: opening stopped early`));
    });
    assert.equal(g.opened, g.cells.filter(c => c.open).length, `${key}: open count drifted`);
    assert.ok(cleared(g) > 0 && cleared(g) < 100, `${key}: progress after one probe`);
    assert.equal(canApply(g), cleared(g) >= at, `${key}: Apply offered at the wrong progress`);
  }
}

// Full breach: open every safe node. Progress is 100 only then, and it all applies.
{
  const g = newGame(6, 4, 60);
  assert.equal(cleared(g), 0);
  probe(g, 0, seeded(3));
  for (const i of safeLeft(g)) {
    probe(g, i);
    if (!g.won) assert.ok(cleared(g) < 100, 'only a full breach is 100');
  }
  assert.ok(g.over && g.won && g.applied === 100, 'clearing every safe node is a full breach');
}

// Two strikes: the first defence routine is marked and the attempt goes on; the second ends it.
// Below the Apply threshold nothing applies; past it, the partial breach still does.
{
  const g = newGame(8, 10, 70);
  probe(g, 0, seeded(5));
  const [r1, r2] = routines(g);
  const before = cleared(g);
  probe(g, r1);
  assert.ok(!g.over && g.strikes === 1 && g.cells[r1].open, 'one routine marks, but does not end it');
  assert.equal(cleared(g), before, 'a routine is not progress');
  assert.ok(before < 70, 'this layout starts below the threshold');
  probe(g, r2);
  assert.ok(g.over && !g.won && g.applied === 0, 'failed below the threshold: nothing applies');
}
{
  const g = newGame(8, 10, 70);
  probe(g, 0, seeded(5));
  for (const i of safeLeft(g)) { if (cleared(g) >= 75) break; probe(g, i); }
  const [r1, r2] = routines(g), progress = cleared(g);
  probe(g, r1);
  probe(g, r2);
  assert.ok(g.over && !g.won && g.applied === progress && progress >= 70, 'failed past the threshold: the partial breach applies');
  const safe = safeLeft(g)[0];
  probe(g, safe);
  assert.ok(!g.cells[safe].open, 'nothing opens once the attempt is over');
}

// Apply: only from the threshold, and it banks the current progress.
{
  const g = newGame(6, 4, 60);
  apply(g);
  assert.ok(!g.over, 'nothing to apply before the first probe');
  probe(g, 0, seeded(3));
  for (const i of safeLeft(g)) { if (cleared(g) >= 60) break; apply(g); assert.ok(!g.over, 'Apply below the threshold does nothing'); probe(g, i); }
  const progress = cleared(g);
  assert.ok(canApply(g));
  apply(g);
  assert.ok(g.over && !g.won && g.applied === progress, 'Apply banks the current progress');
}

// Fortified: no partial breach, Apply never comes up before the grid is clear.
{
  const g = newGame(12, 36, LEVELS.fortified.apply);
  probe(g, 70, seeded(9));
  for (const i of safeLeft(g)) { assert.ok(!canApply(g), 'Fortified needs full completion'); probe(g, i); }
  assert.ok(g.won && g.applied === 100);
}

// Hack effect vs Scanner heat: every finished attempt costs 20–40°, whatever it achieved.
{
  const s = newSession();
  assert.equal(endAttempt(s, 100, () => 0.5), 30);
  assert.deepEqual(s, { hacked: 50, heat: 30 }, 'a full breach: +50% hacked');
  elapse(s, 36, 0);
  assert.deepEqual(s, { hacked: 30, heat: 30 }, 'the hack wears off over 3 minutes; no coolant, no cooling');
  elapse(s, 20, 10);
  assert.deepEqual(s, { hacked: 30 - 100 / 9, heat: 20 }, '10% coolant cools 0.5° a second');
  assert.equal(endAttempt(s, 0, () => 0), 20, 'a failed attempt still heats the Scanners');
  assert.equal(s.heat, 40);
  assert.equal(endAttempt(s, 72, () => 0.9999), 40);
  assert.equal(s.hacked, 30 - 100 / 9 + 36, 'an applied breach adds half its progress');
  for (let i = 0; i < 4; i++) endAttempt(s, 100);
  assert.deepEqual(s, { hacked: 100, heat: 100 }, 'both stop at 100');
  elapse(s, 600, 100);
  assert.deepEqual(s, { hacked: 0, heat: 0 }, 'and neither goes below 0');
  assert.equal(effectiveness(100), 25, 'a full hack leaves a system at 100% power working at 25%');
  assert.equal(effectiveness(0), 100);
}

// Times.
assert.equal(time(0), '0:00.0');
assert.equal(time(7349), '0:07.3');
assert.equal(time(59999), '1:00.0');
assert.equal(time(65960), '1:06.0');
assert.equal(time(3725000), '62:05.0');

// Records: attempts and breaches counted, a best only replaced by a better one.
{
  const records = {};
  const failed = { won: false, applied: 0 };
  const partial = { won: false, applied: 64 };
  const full = { won: true, applied: 100 };
  assert.deepEqual(record(records, 'basic', failed, 4000), { time: false, score: false, academy: false });
  assert.deepEqual(records.basic, { runs: 1, wins: 0, bestMs: null, bestPct: 0 });
  assert.deepEqual(record(records, 'basic', partial, 3000), { time: false, score: true, academy: false });
  assert.deepEqual(record(records, 'basic', full, 9000.4), { time: true, score: true, academy: false });
  assert.deepEqual(record(records, 'basic', full, 12000), { time: false, score: false, academy: false });
  assert.deepEqual(record(records, 'basic', full, 8000), { time: true, score: false, academy: false });
  assert.deepEqual(records.basic, { runs: 5, wins: 4, bestMs: 8000, bestPct: 100 });
  assert.equal(records.secure, undefined, 'other levels untouched');
}

// The Academy standard: Secure, a full breach under 40 s, no routine triggered. News only the first time.
{
  const records = {};
  const clean = { won: true, applied: 100, strikes: 0 };
  assert.equal(record(records, 'secure', { ...clean, strikes: 1 }, 30000).academy, false, 'a routine was triggered');
  assert.equal(record(records, 'secure', clean, 40000).academy, false, '40 s is not under 40');
  assert.equal(record(records, 'secure', { won: false, applied: 72, strikes: 0 }, 20000).academy, false, 'an applied breach is not a full one');
  assert.equal(record(records, 'basic', clean, 9000).academy, false, 'only Secure counts');
  assert.equal(record(records, 'secure', clean, 39900).academy, true);
  assert.equal(records.secure.academy, true);
  assert.equal(record(records, 'secure', clean, 30000).academy, false, 'already met');
}

// What a hack does to each system, for a target at 100% power.
assert.equal(SYSTEMS.beams.effect(effectiveness(100)), 'their beams fire every 24 s instead of 6');
assert.equal(SYSTEMS.beams.effect(effectiveness(36)), 'their beams fire every 8.2 s instead of 6');
assert.equal(SYSTEMS.missiles.effect(25), 'their missiles take 4 times as long to reload');
assert.equal(SYSTEMS.impulse.effect(25), 'their top speed drops to 25% of normal');
assert.equal(SYSTEMS.shields.effect(25), 'their shields take 12.5% more damage and recharge at 25% of normal speed');
assert.equal(SYSTEMS.shields.effect(50), 'their shields take 10% more damage and recharge at 50% of normal speed');
assert.equal(SYSTEMS.shields.effect(75), 'their shields take 5% more damage and recharge at 75% of normal speed');

console.log('hacking-trainer: all checks passed');
