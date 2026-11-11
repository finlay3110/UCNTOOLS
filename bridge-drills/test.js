// Checks the drills in drills.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { DRILLS, ROUND, newRound, shuffle, time, record, seeded, newSeed, challengeLink, readChallenge, compare, manualLink } from './drills.js';
import { ICONS } from './icons.js';


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
// Damage Control: every map spot sits on its deck plan, and each ship's kit is asked about once.
for (const x of DRILLS.damage.questions.filter(x => x.reveal)) {
  const [, w, h] = x.reveal.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const [, cx, cy] = x.reveal.match(/cx="(\d+)" cy="(\d+)"/).map(Number);
  assert.ok(cx > 0 && cx < w && cy > 0 && cy < h, `${x.prompt}: spot off the map`);
  assert.ok(x.wrong.length >= 2 && !x.wrong.includes(x.answer));
}
assert.equal(DRILLS.damage.questions.filter(x => x.reveal).length, 26, 'thirteen places on each of the two ships');

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

// Challenges: a seed deals the same round every time, links read back, and odd links are refused.
{
  const deal = s => newRound('damage', seeded(s)).map(x => x.prompt + '|' + x.options.join('/')).join('\n');
  assert.equal(deal(12345), deal(12345), 'same seed, same round');
  assert.notEqual(deal(12345), deal(54321));
  for (let i = 0; i < 100; i++) { const s = newSeed(); assert.ok(Number.isInteger(s) && s >= 1 && s <= 2147483646); }
  const c = { drill: 'radar', seed: 777, name: 'Sub Lt Tetra', score: 8, ms: 45123.4 };
  assert.deepEqual(readChallenge(challengeLink(c)), { ...c, ms: 45123 });
  const link = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  assert.equal(readChallenge('nonsense'), null);
  assert.equal(readChallenge(link({ d: 'cooking', s: 1, sc: 1, t: 1 })), null, 'not a drill');
  assert.equal(readChallenge(link({ d: '__proto__', s: 1, sc: 1, t: 1 })), null);
  assert.equal(readChallenge(link({ d: 'radar', s: 0, sc: 1, t: 1 })), null, 'seed 0 would deal nothing random');
  assert.equal(readChallenge(link({ d: 'radar', s: 5, sc: 11, t: 1 })), null, 'more right than questions');
  assert.equal(readChallenge(link({ d: 'radar', s: 5, sc: 3, t: 1, n: '<b>\nhi</b>' + 'x'.repeat(50) })).name.length, 40);
  assert.ok(compare({ score: 9, ms: 90000 }, { score: 8, ms: 10000 }) > 0, 'more right wins');
  assert.ok(compare({ score: 8, ms: 30000 }, { score: 8, ms: 40000 }) > 0, 'then faster');
  assert.equal(compare({ score: 8, ms: 30000 }, { score: 8, ms: 30000 }), 0);
}

// Every question points at its section of the manual, on a real page of it (145 pages).
for (const [key, drill] of Object.entries(DRILLS)) for (const x of drill.questions) {
  assert.ok(x.manual && Number.isInteger(x.manual.page) && x.manual.page >= 1 && x.manual.page <= 145 && x.manual.section, `${key}: "${x.prompt.slice(0, 40)}" has no manual section`);
}
assert.equal(DRILLS.radar.questions.find(x => x.pic.includes('pic ship')).manual.page, 125, 'icons point at Appendix B');
assert.equal(DRILLS.damage.questions.find(x => x.reveal).manual.page, 141, 'locations point at the deck plans');
assert.equal(manualLink(44), '../tactical-aids/#doc=pdfs/general-info/UCN-Academy-Manual.pdf&page=44');

console.log('bridge-drills: all checks passed');
