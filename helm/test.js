// Checks the figures and sums in helm.js. Run: node test.js (CI runs it on every change).
import assert from 'node:assert/strict';
import { SHIPS, SECTOR, impulseTime, warpSpeed, warpTime, turnTime, bearing, reciprocal, turn, rechargeTime, time, MANOEUVRES, WARP_CHECKS, CALLS,
  DEMOS, pose, shown, caption } from './helm.js';

const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);
const { takanami: T, havock: H } = SHIPS;

// The deck plans' figures: 6 and 7.5U a minute, 10° and 14° a second.
close(T.impulse * 60, 6, 'Takanami impulse');
close(H.impulse * 60, 7.5, 'Havock impulse');
assert.equal(T.turn, 10); assert.equal(H.turn, 14);
close(T.impulse / T.toFull, T.accel, 'Takanami reaches full impulse in 5 s');
close(H.impulse / H.toFull, H.accel, 'Havock reaches full impulse in 5 s');

// Impulse from a standstill: speeding up for 5 s (0.25U on the Takanami), then cruising.
close(impulseTime(T, 0.25), 5, 'the ramp alone');
close(impulseTime(T, 1.25), 5 + 1 / 0.1, 'ramp then 1U at 0.1U/s');
close(impulseTime(T, 0.0625), Math.sqrt(2 * 0.0625 * 5 / 0.1), 'short hop, still speeding up');
assert.ok(impulseTime(T, 10, 200) < impulseTime(T, 10, 100), 'more impulse power is quicker');
assert.ok(impulseTime(H, 10) < impulseTime(T, 10), 'the Havock is quicker');
assert.equal(impulseTime(T, 10, 0), Infinity);
close(impulseTime(T, SECTOR), 5 + (20 - 0.25) / 0.1, 'a sector');

// Warp: 1U a second per level at 100%, scaling with power (the warp table's 2 at 160% is 3.2U/s).
close(warpSpeed(2, 160), 3.2, 'warp 2 at 160%');
close(warpSpeed(4, 210), 8.4, 'warp 4 at 210%');
close(warpTime(3, 30), 10, '30U at warp 3');
assert.equal(warpTime(1, 10, 0), Infinity);

// Turning, at the full rate straight away.
close(turnTime(T, 180), 18, 'Takanami turns 180° in 18 s');
close(turnTime(H, 180, 200), 180 / 28, 'Havock at 200% manoeuvring');

// Bearings.
assert.equal(bearing(-10), 350); assert.equal(bearing(720), 0); assert.equal(bearing(359.96), 0);
assert.equal(reciprocal(42), 222); assert.equal(reciprocal(315), 135); assert.equal(reciprocal(180), 0);
assert.deepEqual(turn(350, 10), { deg: 20, dir: 'starboard' }, 'across north, to starboard');
assert.deepEqual(turn(10, 350), { deg: 20, dir: 'port' });
assert.deepEqual(turn(90, 90), { deg: 0, dir: 'none' });
assert.deepEqual(turn(0, 180), { deg: 180, dir: 'either' });
assert.deepEqual(turn(0, 270), { deg: 90, dir: 'port' });

// Combat manoeuvre recharge: 20 s at 100%; the manual's example of 200% and 100% averages 150%, about 13 s.
close(rechargeTime(100, 100), 20, 'standard recharge');
assert.equal(Math.round(rechargeTime(100, 200)), 13);
assert.equal(rechargeTime(0, 0), Infinity);

assert.equal(time(4), '4.0s'); assert.equal(time(65), '1m 05s'); assert.equal(time(3725), '1h 02m'); assert.equal(time(Infinity), '—');

// Every manoeuvre is complete and points at its page of the manual (Appendix G, pages 136–140).
assert.equal(MANOEUVRES.length, 5);
for (const m of MANOEUVRES) {
  assert.ok(m.title && m.purpose && m.use && m.avoid && m.steps.length >= 6, m.title);
  assert.ok(m.page >= 136 && m.page <= 140, m.title + ' page');
}
assert.equal(WARP_CHECKS.length, 5);

// The diagrams: one per manoeuvre, keys in time order within the run, everything inside the box.
assert.deepEqual(Object.keys(DEMOS), MANOEUVRES.map(m => m.title));
for (const [name, d] of Object.entries(DEMOS)) {
  assert.ok(d.dur > 0 && d.alt && d.captions.length >= 3, name);
  for (const thing of ['you', 'enemy', 'mine', 'shot'].map(k => d[k]).filter(Boolean)) {
    thing.keys.forEach((k, i) => {
      assert.equal(k.length, 4, name);
      assert.ok(k[0] >= 0 && k[0] <= d.dur && (!i || k[0] > thing.keys[i - 1][0]), `${name}: keys in order`);
      assert.ok(k[1] >= 0 && k[1] <= 300 && k[2] >= 0 && k[2] <= 170, `${name}: ${k} inside the box`);
    });
  }
  d.captions.forEach(([at], i) => assert.ok(at >= 0 && at < d.dur && (!i || at > d.captions[i - 1][0]), `${name}: captions in order`));
  if (d.blast) assert.ok(d.blast[2] < d.blast[3] && d.blast[3] <= d.dur, name);
}
// Moving and turning between keys: halfway is halfway, and the turn takes the shorter way.
const keys = [[0, 0, 0, 170], [2, 100, 50, -170]];
assert.deepEqual(pose(keys, -1), [0, 0, 170], 'before the first key');
assert.deepEqual(pose(keys, 1), [50, 25, 180], 'halfway, turning through 180 not the long way');
assert.deepEqual(pose(keys, 5), [100, 50, -170], 'after the last key');
// About Face really does turn 180°: nose to the enemy at the start, tail to them after.
const af = DEMOS['About Face'].you.keys;
assert.equal(((pose(af, 0)[2] % 360) + 360) % 360, 180);
assert.equal(((pose(af, 6)[2] % 360) + 360) % 360, 0);
// On stage only from its first key until it is used up.
const mine = DEMOS['Special Delivery'].mine;
assert.ok(!shown(mine, 1, 11) && shown(mine, 5, 11) && !shown(mine, 8.5, 11));
assert.equal(caption(DEMOS['Monkey at the Zoo'], 0), DEMOS['Monkey at the Zoo'].captions[0][1]);
assert.equal(caption(DEMOS['Monkey at the Zoo'], 8), '“Mine clear.”');
assert.ok(CALLS.engineering.length && CALLS.respond.length && CALLS.useful.length);

console.log('helm: all checks passed');
