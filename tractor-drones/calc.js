// Tractor beam and drone figures from the UCN Academy Manual (3.8 and 3.10).
// No page code here, so test.js can check them in Node.

// Straight lines between the manual's rows: exact on each row, a fair guess between.
function between(rows, x) {
  if (x <= rows[0][0]) return rows[0][1];
  for (let i = 1; i < rows.length; i++) {
    const [x1, y1] = rows[i - 1], [x2, y2] = rows[i];
    if (x <= x2) return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
  }
  return rows[rows.length - 1][1];
}

// Table 3-21: the beam covers a fixed area, so a wider arc reaches less far.
// [arc in degrees, reach in U]
export const TRACTOR = [[6, 2], [10.5, 1.5], [22.5, 1], [45, 0.73], [90, 0.5]];
export const tractorReach = arc => between(TRACTOR, arc);

// 3.8.4: the widest arc that still pushes each kind of ordnance far enough,
// when it is caught at the beam's full reach.
export const DEFENCE = [
  { what: 'Torpedo', maxArc: 17, goal: 'break its lock: push it more than 1.2U from its target' },
  { what: 'Nuke or EMP', maxArc: 23, goal: 'beat the blast: push it at least 1U clear' },
  { what: 'Mine', maxArc: 67, goal: 'avoid the trigger: push it outside 0.6U (its 1U blast can still reach you if it goes off later)' },
];

// Table 3-22: how strongly the beam drags each size of target, with Cargo
// Docks at 100% and at 200–300%.
export const DRAG = [
  ['Missiles, mines', 'Rapid', 'Immediate'],
  ['Probes, light drones', 'Strong', 'Rapid'],
  ['Shuttle, fighter', 'Useful', 'Strong'],
  ['Gunship, corvette', 'Limited', 'Useful'],
  ['Frigate, destroyer', 'Weak', 'Limited'],
  ['Cruiser', 'Very weak', 'Weak'],
  ['Battleship, carrier', 'Negligible', 'Very weak'],
  ['Stations, huge objects', 'None practical', 'None practical'],
];

// Tables 3-26 and 3-27, by scanner effectiveness (%): probes scan 5U per 100%,
// and drone control range grows with roughly its square.
export const probeRadius = eff => 5 * eff / 100;
export const DRONE = [[100, 78], [150, 175], [200, 311], [250, 486], [300, 700]];
export const droneRange = eff => between(DRONE, eff);
