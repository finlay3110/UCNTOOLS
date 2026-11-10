// Checks the drills in drills.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { DRILLS, ROUND, newRound, shuffle, time, record } from './drills.js';
import { ICONS } from './icons.js';

// A repeatable random, so a failing case can be replayed.
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

// Every question is answerable: one right answer, distinct wrong options, and a reason.
for (const [key, drill] of Object.entries(DRILLS)) {
  assert.ok(drill.questions.length >= ROUND + 5, `${key}: enough questions for varied rounds`);
  const prompts = new Set();
  for (const x of drill.questions) {
    const id = `${key}: "${x.prompt.slice(0, 50)}"`;
    assert.ok(x.answer && x.why && x.prompt, `${id} is missing a part`);
    assert.ok(x.wrong.length >= 2, `${id} needs at least two wrong options`);
    assert.ok(!x.wrong.includes(x.answer), `${id} lists its answer as wrong`);
    assert.equal(new Set(x.wrong).size, x.wrong.length, `${id} repeats a wrong option`);
    prompts.add(x.prompt + x.pic);
  }
  assert.equal(prompts.size, drill.questions.length, `${key}: two questions are the same`);
}
// Every radar icon is asked about.
for (const k of Object.keys(ICONS)) assert.ok(DRILLS.radar.questions.some(x => x.pic.includes(ICONS[k])), `no question shows the ${k} icon`);

// Rounds: ten different questions, each answer offered exactly once among up to four options.
for (const key of Object.keys(DRILLS)) {
  for (let s = 1; s <= 50; s++) {
    const round = newRound(key, seeded(s));
    assert.equal(round.length, ROUND);
    assert.equal(new Set(round.map(x => x.prompt + x.pic)).size, ROUND, `${key} seed ${s}: a question repeats`);
    for (const x of round) {
      assert.equal(x.options.filter(o => o === x.answer).length, 1);
      assert.equal(new Set(x.options).size, x.options.length);
      assert.ok(x.options.length >= 3 && x.options.length <= 4);
    }
  }
}
const order = s => newRound('callouts', seeded(s)).map(x => x.prompt).join();
assert.notEqual(order(1), order(2), 'rounds are shuffled');
assert.deepEqual(shuffle([1, 2, 3], seeded(4)).sort(), [1, 2, 3]);

// Times.
assert.equal(time(0), '0:00.0');
assert.equal(time(65960), '1:06.0');

// Records: a new best is more right, or as many right in less time.
{
  const records = {};
  assert.equal(record(records, 'radar', 0, 50000), false, 'nothing right is no best');
  assert.equal(record(records, 'radar', 7, 60000), true);
  assert.equal(record(records, 'radar', 6, 30000), false, 'fewer right, however fast');
  assert.equal(record(records, 'radar', 7, 55000), true, 'as many right, faster');
  assert.equal(record(records, 'radar', 7, 58000), false);
  assert.equal(record(records, 'radar', 10, 90000), true);
  assert.deepEqual(records.radar, { runs: 6, bestScore: 10, bestMs: 90000 });
  assert.equal(records.ordnance, undefined, 'other drills untouched');
}

console.log('bridge-drills: all checks passed');
