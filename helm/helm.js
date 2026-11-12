// The Helm tool's figures and sums, from the UCN Academy Manual, with no page
// code, so test.js can check them in Node.

// Ship handling at 100% (Appendix H). Speeds are U a second.
export const SHIPS = {
  takanami: { name: 'UCS Takanami', cls: 'Hoplite Class Destroyer', impulse: 0.10, accel: 0.02, toFull: 5, turn: 10, shields: '200:200', hull: 250 },
  havock: { name: 'UCS Havock', cls: 'Skirmish Class Frigate', impulse: 0.125, accel: 0.025, toFull: 5, turn: 14, shields: '200:200', hull: 200 },
};
export const SECTOR = 20;   // U across a sector

// Seconds to cover d U on impulse from a standstill: speeding up steadily to
// top speed over toFull seconds, then cruising. Speed scales with impulse
// effectiveness (shortcut: the manual gives no acceleration above 100%, so the
// ramp is kept at toFull seconds whatever the power).
export function impulseTime(ship, d, pct = 100) {
  const v = ship.impulse * pct / 100;
  if (!(v > 0) || !(d >= 0)) return Infinity;
  const ramp = v * ship.toFull / 2;   // distance covered while speeding up
  return d <= ramp ? Math.sqrt(2 * d * ship.toFull / v) : ship.toFull + (d - ramp) / v;
}

// Warp is 1U a second per level at 100%, scaling with warp power.
export const warpSpeed = (level, pct = 100) => level * pct / 100;
export const warpTime = (level, d, pct = 100) => (warpSpeed(level, pct) > 0 && d >= 0 ? d / warpSpeed(level, pct) : Infinity);

// Turning is immediate, at the full rate, which scales with manoeuvring effectiveness.
export const turnTime = (ship, deg, pct = 100) => (pct > 0 ? deg / (ship.turn * pct / 100) : Infinity);

export const bearing = b => ((Math.round(b * 10) / 10 % 360) + 360) % 360;
export const reciprocal = b => bearing(b + 180);

// The shorter way round from heading to target. Bearings run clockwise, so a
// positive turn is to starboard.
export function turn(heading, target) {
  const d = ((bearing(target) - bearing(heading)) % 360 + 540) % 360 - 180;
  return { deg: Math.abs(d), dir: d === 0 ? 'none' : Math.abs(d) === 180 ? 'either' : d > 0 ? 'starboard' : 'port' };
}

// Combat manoeuvre's reserve refills in about 20 s at 100%, faster or slower
// with the average of impulse and manoeuvring effectiveness.
export const rechargeTime = (impulsePct, manoeuvrePct) => {
  const avg = (impulsePct + manoeuvrePct) / 2;
  return avg > 0 ? 20 * 100 / avg : Infinity;
};

// "4.0s", "1m 05s", "—".
export function time(s) {
  if (!isFinite(s)) return '—';
  if (s < 60) return s.toFixed(1) + 's';
  const r = Math.round(s), m = Math.floor(r / 60);
  return m >= 60 ? Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm' : m + 'm ' + String(r % 60).padStart(2, '0') + 's';
}

// The advanced manoeuvres (Appendix G), with the manual's calls. page is the PDF page.
export const MANOEUVRES = [
  { title: 'About Face', page: 136,
    purpose: 'A rapid 180° turn to present the aft of the ship to the enemy: protect a weak forward shield, reset the engagement, or start a controlled withdrawal.',
    use: 'The forward shield is failing, the rear shield is stronger, or you need to open distance while keeping protection towards the threat.',
    avoid: 'The rear shield is weaker, there are hazards behind the ship, or the turn would break an essential firing line at the wrong moment.',
    steps: ['“Prepare About Face.”', 'Beams confirms: “Rear shield stronger” or “Forward shield failing.”', 'Helm requests support if needed: “Spike manoeuvring.”',
      'Helm turns through 180°, avoiding over-rotation and watching for hazards.', 'Beams confirms: “Aft presented.”', 'Engineering resets as required: “Reset manoeuvring.”'] },
  { title: 'Breakthrough', page: 137,
    purpose: 'A short warp burst through or past the enemy, so they have to turn while you present the rear shield. You make the enemy do the turning.',
    use: 'The forward shield is weakening but can survive the pass, the rear shield is fresher, or a slow-turning ship needs to change shield facing fast. Good against large or slow enemies.',
    avoid: 'The forward shield is already failing, the route is cluttered, collision risk is high, mines or hazards are ahead, or Engineering can’t support a warp burst.',
    steps: ['“Prepare Breakthrough.”', 'Beams confirms: “Front shield holding” / “Rear shield stronger.”', 'Helm calls: “Spike front shields. Spike manoeuvring. Reset warp.”',
      'Helm reduces impulse and turns to a clear line past or between hostiles, not committing until the route is safe.', 'Once aligned: “Reset manoeuvring. Warp burst on my mark.”',
      'Helm makes a short warp burst past the enemy, forcing them to turn towards the rear shield.', 'If appropriate, Helm drops warp and calls: “Fire mine.”',
      'Missiles deploys the mine, which travels about 1U behind the ship before arming.', 'Once clear, keep opening distance for the front shield to recover, or call an About Face to bring the forward weapons back on.'] },
  { title: 'Special Delivery', page: 138,
    purpose: 'Carry an armed mine to the enemy at warp: the tractor holds it while Helm delivers it. Best against stationary, slow or predictable targets.',
    use: 'The enemy is stationary, on a predictable course, or unlikely to evade before the mine arrives. Works from 10U or more if the target position holds.',
    avoid: 'The enemy is moving unpredictably, the route is cluttered, the ship can’t safely enter warp, Cargo Docks can’t be powered, or friendly craft are near the line.',
    steps: ['“Prepare Special Delivery.”', 'Radar confirms: “Target stationary” or “Target course predictable.”', 'Helm lines up on a straight delivery line towards the target position.',
      'Engineering boosts Cargo Docks to about 230%, with 100% coolant.', 'Engineering drops warp power to 48%.', 'The tractor operator sets the tractor to its maximum 2U range to Hold the mine at 1U.',
      'Helm calls: “Drop mine.”', 'Missiles deploys the mine.', 'Tractor confirms: “Mine held.”',
      'Helm engages Warp 1 and holds the line, with no course changes, or the mine is lost from the tractor.', 'Near the target, Helm and the tractor coordinate the release so the mine arms and detonates by the target.',
      'Once delivered: “Mine away” / “Clear delivery line.”', 'Helm breaks away, continues past, or prepares for follow-up fire.'] },
  { title: 'Longbow Shot', page: 139,
    purpose: 'A long-range shot on Radar’s bearing, with the tractor pushing the ordnance out as it launches, to hit targets beyond Tactical’s range.',
    use: 'The target is beyond Tactical range but on Radar, stationary, or locked before it left Tactical. Best with HVLIs or homing ordnance.',
    avoid: 'Radar can’t give a reliable bearing, the target is moving unpredictably, friendly assets are near the line, or Helm can’t hold a steady heading.',
    steps: ['“Prepare Longbow Shot.”', 'Radar calls: “Target bearing 042.”', 'Helm turns to the bearing and steadies: “On bearing.”',
      'For homing missiles, Missiles locks while it can: “Lock held.”', 'For HVLIs, Helm and Radar refine the line: “Bearing steady” / “Adjust left two degrees.”',
      'The tractor operator sets the tractor forward, 2U range, Push.', 'Engineering boosts Cargo Docks if required: “Boost Cargo Docks.”', 'Missiles fires on command: “Longbow away.”',
      'The tractor pushes the ordnance forward as it leaves the ship.', 'Radar calls corrections or impact: “Shot tracking” / “Target manoeuvring” / “Impact expected.”'] },
  { title: 'Monkey at the Zoo', page: 140,
    purpose: 'Retreat astern with the bow on the pursuer, drop a mine, pass beyond it, then push it at the enemy with the forward tractor.',
    use: 'Withdrawing in reverse with the bow facing a pursuer: to break the chase, force them to turn, or deliver a mine without closing.',
    avoid: 'Friendly assets are between you and the enemy, the pursuer is manoeuvring unpredictably, or Helm can’t hold a straight withdrawal.',
    steps: ['“Prepare Monkey at the Zoo.”', 'Helm confirms the enemy is dead ahead and withdraws at full reverse impulse: “Retreating astern.”',
      'The tractor operator sets the beam forward, heading 0°, 2U range, Push: “Tractor configured.”', 'Engineering raises impulse to 110% if needed: “Impulse boosted.”',
      'Missiles deploys the mine: “Mine away.”', 'The ship keeps reversing and passes beyond the mine before it arms.',
      'With the mine ahead of the ship, the tractor pushes it towards the pursuer.', 'Helm holds bearing and reverse speed: “Holding line.”',
      'Radar or Weapons watches the pursuer: “Target continuing pursuit” / “Target altering course.”',
      'Once the mine has gone off, been avoided, or left tractor range: “Mine clear.”', 'Engineering resets impulse when directed.'] },
];

// Each manoeuvre as a diagram that can play, in a 300 by 170 box seen from
// above. Keys are [seconds, x, y, heading]; heading 0 points right, 90 down.
// Between keys a ship slides in a straight line and turns the shorter way.
// Drawn from the manual's steps (it has no figures), so positions are illustrative.
const arc = (t0, t1, cx, cy, r, from, to, n = 4) => Array.from({ length: n + 1 }, (_, i) => {
  const th = (from + (to - from) * i / n) * Math.PI / 180, dir = to > from ? 90 : -90;
  return [+(t0 + (t1 - t0) * i / n).toFixed(2), +(cx + r * Math.cos(th)).toFixed(1), +(cy + r * Math.sin(th)).toFixed(1), from + (to - from) * i / n + dir];
});
export const DEMOS = {
  'About Face': {
    dur: 9.5,
    alt: 'You start nose-on to the enemy with a failing front shield, turn through 180 degrees, and open distance with the rear shield towards them.',
    you: { keys: [[0, 180, 85, 180], ...arc(1.5, 4.5, 180, 70, 15, 90, 270), [6, 180, 55, 360], [8.5, 260, 55, 360]], shields: ['#ee7b7b', '#2FB574'] },
    enemy: { keys: [[0, 50, 85, 0]], label: 'ENEMY', fire: [[0, 9.5]] },
    captions: [[0, 'Front shield failing, rear stronger: “Prepare About Face.”'], [1.5, 'Helm turns through 180°, with a manoeuvring spike if needed.'],
      [4.5, 'Beams: “Aft presented.” The fresh rear shield takes the fire.'], [6, 'Open distance while the front shield recovers.']],
  },
  Breakthrough: {
    dur: 11,
    alt: 'You line up a clear path past a large enemy, warp burst past it so it has to turn, and drop a mine behind you.',
    you: { keys: [[0, 40, 95, 0], [1.5, 40, 95, 0], [3, 55, 90, -12], [4, 55, 90, -12], [5, 250, 48, -12], [5.8, 265, 45, -12], [8.5, 290, 40, -12]], shields: ['#e8c547', '#2FB574'] },
    enemy: { keys: [[0, 170, 100, 180], [5, 170, 100, 180], [7.5, 170, 100, 330]], label: 'ENEMY', big: true, fire: [[0, 4.5], [7.5, 11]] },
    mine: { keys: [[5.8, 263, 45, 0], [6.8, 249, 48, 0]] },
    captions: [[0, 'Front shield holding, rear stronger: “Prepare Breakthrough.”'], [1.5, 'Reduce impulse and turn to a clear line past the enemy.'],
      [3, '“Reset manoeuvring. Warp burst on my mark.”'], [4, 'A short warp burst past them: now they have to turn.'],
      [5.8, '“Fire mine.” It drifts about 1U behind you before arming.'], [7.5, 'Their fire meets your fresher rear shield. Keep opening distance.']],
  },
  'Special Delivery': {
    dur: 11,
    alt: 'The tractor holds a mine ahead of you while you carry it at Warp 1 in a dead straight line, release it near a stationary target, and break away.',
    you: { keys: [[0, 30, 85, 0], [3, 30, 85, 0], [7, 200, 85, 0], [7.6, 212, 78, -35], [9, 240, 40, -50]], tractor: [[2, 7]] },
    enemy: { keys: [[0, 265, 85, 180]], label: 'TARGET' },
    mine: { keys: [[1.5, 42, 85, 0], [2.5, 48, 85, 0], [3, 48, 85, 0], [7, 218, 85, 0], [8, 250, 85, 0]], until: 8 },
    blast: [255, 85, 8, 9.5],
    captions: [[0, 'Target stationary: “Prepare Special Delivery.” Line up a straight run.'], [1.5, 'Docks up, warp power to 48%. “Drop mine.” The tractor holds it 1U ahead.'],
      [3, 'Warp 1, dead straight: any course change loses the mine.'], [7, 'Near the target: “Mine away.” Helm breaks off.'], [8, 'The mine arms and detonates by the target.']],
  },
  'Longbow Shot': {
    dur: 10,
    alt: 'The target is beyond Tactical range. You turn to the bearing Radar gives, and the tractor pushes the shot out so it reaches the target.',
    you: { keys: [[0, 50, 125, -120], [1.5, 50, 125, -120], [3.5, 50, 125, -25]], tractor: [[4, 6]] },
    enemy: { keys: [[0, 249, 32, 155]], label: 'TARGET' },
    shot: { keys: [[5, 59, 121, -25], [6, 100, 102, -25], [7.6, 245, 34, -25]], until: 7.6 },
    ring: [50, 125, 42, 'Tactical range'],
    blast: [249, 32, 7.6, 9],
    captions: [[0, 'Radar: “Target bearing 065.” It is beyond Tactical range.'], [1.5, 'Helm turns to the bearing and steadies: “On bearing.”'],
      [3.5, 'Tractor forward, 2U, Push. Missiles fires: “Longbow away.”'], [5, 'The tractor pushes the shot out, carrying it far past normal range.'], [7.6, 'Radar: “Impact expected.”']],
  },
  'Monkey at the Zoo': {
    dur: 11,
    alt: 'You retreat in reverse with your bow to the pursuer, leave a mine ahead of your bow, then push it into the pursuer with the forward tractor.',
    you: { keys: [[0, 120, 85, 180], [8, 250, 85, 180], [11, 270, 85, 180]], tractor: [[4.5, 7.8]] },
    enemy: { keys: [[0, 40, 85, 0], [8, 120, 85, 0]], label: 'PURSUER' },
    mine: { keys: [[2.5, 161, 85, 0], [4.5, 161, 85, 0], [7.8, 128, 85, 0]], until: 7.8 },
    blast: [126, 85, 7.8, 9.3],
    captions: [[0, 'Enemy dead ahead: full reverse impulse, “Retreating astern.”'], [1.2, 'Tractor forward, 0°, 2U, Push: “Tractor configured.”'],
      [2.5, '“Mine away.” Keep reversing, past the mine before it arms.'], [4.5, 'The tractor pushes the mine at the pursuer: “Holding line.”'], [7.8, '“Mine clear.”']],
  },
};

// Where a ship or object is at time t: clamped to its first and last keys.
export function pose(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  const i = keys.findIndex(k => k[0] >= t);
  if (i < 0) return keys[keys.length - 1].slice(1);
  const [t0, x0, y0, a0] = keys[i - 1], [t1, x1, y1, a1] = keys[i];
  const f = (t - t0) / (t1 - t0), turn = ((a1 - a0) % 360 + 540) % 360 - 180;
  return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, a0 + turn * f];
}

// Is it on stage at t: from its first key until its until (or the end).
export const shown = (thing, t, dur) => t >= thing.keys[0][0] && t <= (thing.until ?? dur);

// The caption for time t.
export const caption = (demo, t) => demo.captions.reduce((c, [at, text]) => (at <= t ? text : c), demo.captions[0][1]);

// Before engaging warp (5.1).
export const WARP_CHECKS = [
  'The route is clear, or being watched',
  'Navigation has confirmed the destination',
  'Radar is watching for hazards',
  'Engineering knows the power and coolant it will need',
  'The Captain has authorised the move',
];

export const CALLS = {
  engineering: ['“Spike impulse.”', '“Spike manoeuvring.”', '“Boost warp.”', '“Reset impulse.”'],
  respond: ['“Clear the Line.”', '“Danger Close, bearing 090.”', '“Open distance.”', '“Mine deployed.”', '“EMP away.” / “Nuke away.”'],
  useful: ['“Closing to engage.”', '“Disengaging.”', '“Confirm target priority?”'],
};
