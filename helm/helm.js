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
