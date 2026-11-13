// The four Bridge Drills, from the UCN Academy Manual. No page code here, so
// test.js can check every question in Node.
import { ICONS } from './icons.js';

// Pictures some questions show: a radar icon, a contact colour, an ordnance mark.
const ship = key => `<span class="pic ship">${ICONS[key]}</span>`;
const blip = colour => `<span class="pic blip" style="background:${colour}"></span>`;
const chevron = colour => `<span class="pic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 8-16 8 5-8z" fill="${colour}"/></svg></span>`;
const gear = '<span class="pic"><svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#c9d2ee" stroke-width="2">' +
  '<circle cx="12" cy="12" r="5"/><path d="M12 2.5v3.5M12 18v3.5M2.5 12H6M18 12h3.5M5.3 5.3l2.5 2.5M16.2 16.2l2.5 2.5M18.7 5.3l-2.5 2.5M7.8 16.2l-2.5 2.5"/></g></svg></span>';

// A question: the prompt, an optional picture, the answer, wrong options (a
// round shows up to three of them) and why the answer is right.
const q = (prompt, answer, wrong, why, pic = '') => ({ prompt, pic, answer, wrong, why });
const others = (list, pick, not) => list.filter(x => x !== not).map(pick);

// ---- Radar recognition: Appendix B, contact colours (3.2), ordnance marks, signal channels.
const CLASSES = [
  ['drone', 'Drone'], ['fighter', 'Starfighter'], ['shuttle', 'Shuttle'], ['freighter', 'Freighter'],
  ['frigate', 'Frigate'], ['destroyer', 'Destroyer'], ['cruiser', 'Cruiser'], ['battlecruiser', 'Battlecruiser'],
  ['battleship', 'Battleship'], ['carrier', 'Carrier'], ['small_station', 'Small station'],
];
const ADVICE = [
  ['drone', 'Drone', 'A threat in proportion to their numbers (mines, distraction, scouting)'],
  ['fighter', 'Starfighter', 'Work out the subclass: interceptor, gunship or bomber'],
  ['frigate', 'Frigate', 'Track its movement and support Helm'],
  ['destroyer', 'Destroyer', 'High threat: heavy shields, nukes and EMPs likely'],
  ['cruiser', 'Cruiser', 'Assess its role fast: missile-heavy or beam-heavy?'],
  ['battlecruiser', 'Battlecruiser', 'Avoid it, or commit fully with several ordnance strikes'],
  ['battleship', 'Battleship', 'Only attack if there is no other option'],
];
const IFF = [['#3B6BFF', 'UCN'], ['#2FB574', 'Allied'], ['#DC143C', 'Hostile'], ['#E3C23E', 'Unknown'], ['#8C98BF', 'Unscanned']];
const MARKS = [[chevron('#F2C230'), 'Torpedo'], [chevron('#B9BFCC'), 'HVLI'], [chevron('#FF6B1A'), 'Nuke'], [chevron('#7B4DFF'), 'EMP'], [gear, 'Mine']];
const RED = 'Red (gravitational)', GREEN = 'Green (biological / thermal)', BLUE = 'Blue (electrical)';

const radar = [
  ...CLASSES.map(c => q('Which ship class is this radar icon?', c[1], others(CLASSES, x => x[1], c),
    `That is the ${c[1].toLowerCase()} icon. Icons run roughly by ship size, with a lot of overlap, so confirm with a scan.`, ship(c[0]))),
  ...ADVICE.map(a => q(`What does the Academy Manual advise for a ${a[1].toLowerCase()}?`, a[2], others(ADVICE, x => x[2], a),
    `Appendix B's advice for a ${a[1].toLowerCase()}: ${a[2].charAt(0).toLowerCase() + a[2].slice(1)}.`, ship(a[0]))),
  ...IFF.map(c => q('On the radar, a contact this colour is…', c[1], others(IFF, x => x[1], c),
    'Contact colours: UCN blue, allied green, hostile crimson, unknown yellow, unscanned grey. Missions can change them.', blip(c[0]))),
  ...MARKS.map(m => q('On Tactical, this mark is…', m[1], others(MARKS, x => x[1], m),
    'Torpedoes are yellow chevrons, HVLIs grey, nukes orange and EMPs purple; a mine is a gear-shaped mark.', m[0])),
  q('A ship arriving at warp shows first on which radar channel?', RED, [GREEN, BLUE],
    'Gravitational (red) picks up planets, asteroids, wormholes and ships at warp, so a warp arrival shows there first.'),
  q('An explosion spikes which radar channel?', GREEN, [RED, BLUE],
    'Biological / thermal (green) shows explosions, ships, stations and planets: explosions spike it.'),
  q('Beam fire and EMPs agitate which radar channel?', BLUE, [RED, GREEN],
    'Electrical (blue) shows ships, beam fire, mines and nebulae: beams and EMPs agitate it.'),
  q('A nebula shows as strong fuzz on which radar channel?', BLUE, [RED, GREEN],
    'Nebulae read as strong fuzz on the electrical (blue) channel.'),
  q('How far do the long-range sensors see?', '30U', ['5U', '10U', '60U'],
    'Long-range sensors cover 30U. Tactical shows only 5U.'),
  q('How far does the Tactical display show?', '5U', ['2U', '10U', '30U'],
    'Helm, Weapons and Drones see 5U on Tactical, which does see into nebulae that close.'),
  q('A nebula hides contacts from which display?', 'Long-range sensors', ['The Strategic Map', 'Tactical, within 5U', 'None of them'],
    'Nebulae block long-range sensor contacts in and behind them, but not the Strategic Map\'s scan circles, and Tactical still sees in within 5U.'),
];

// ---- Ordnance choice: Tables 3-19 and 3-20, and Missiles' weapon choice (3.7, 5.3).
const ordnance = [
  q('A hostile is 0.8U off your bow and you need to hit it now. Which do you load?', 'Torpedo', ['HVLI', 'EMP', 'Nuke'],
    'Torpedoes have no minimum range. HVLIs only reach full damage after about 1U, and EMPs and nukes need 1.25U or more.'),
  q('A slow cruiser is 6.3U dead ahead, lined up and not turning. Which can reach it?', 'HVLI', ['Torpedo', 'EMP', 'Nuke'],
    'HVLIs fly to 6.75U; torpedoes, EMPs and nukes reach 5.4U without the tractor. HVLIs reward good alignment.'),
  q('A heavily shielded destroyer is at 3U and you want its shields down before the beams go in.', 'EMP', ['HVLI', 'Mine', 'Torpedo'],
    'EMPs collapse shields: their damage goes into the shields, never the hull.'),
  q('A nimble frigate is jinking about at 3U.', 'Torpedo', ['HVLI', 'Mine', 'Nuke'],
    'Torpedoes home in once within 1.2U, so they suit manoeuvring targets. HVLIs fly straight and never correct.'),
  q('A hostile is chasing you along your exact track.', 'Mine', ['HVLI', 'EMP', 'Nuke'],
    'Mines are area denial: one comes to rest 1U behind the ship, right in a pursuer\'s path. Coordinate with Helm.'),
  q('Command has authorised a decisive strike on a big target 3U away, well clear of friendlies.', 'Nuke', ['EMP', 'HVLI', 'Mine'],
    'Nukes are decisive but need authorisation and distance: the 1U blast hurts anything near it, friendlies included.'),
  q('A hostile is 1.1U away. Which of these is safe to fire?', 'Torpedo', ['EMP', 'Nuke', 'Mine'],
    'EMPs and nukes need at least 1.25U or their 1U blast catches you. Mines are laid behind the ship, not fired.'),
  q('How far apart should mines be laid?', '1.2U or more', ['0.6U', '1U', 'Side by side'],
    'Mines trigger at 0.6U and blast across 1U, so mines closer than 1.2U set each other off.'),
  q('How long after release is a mine armed?', '10 seconds', ['1 second', '5 seconds', '27 seconds'],
    'Mines arm 10 seconds after release. They leave at 6U a minute, so they stop 1U behind the ship.'),
  q('Something comes within 0.6U of a mine. What happens?', 'It explodes a second later', ['It explodes at once', 'Nothing until it touches', 'It homes in on it'],
    'Mines trigger at 0.6U and detonate one second later, across a 1U blast.'),
  q('What does an EMP damage?', 'Shields only', ['Hull only', 'Systems', 'Everything within 1U'],
    'EMPs never carry damage through to hull or systems, which is why dropping shields just before one lands makes it harmless.'),
  q('When does an HVLI reach full damage?', 'After about 2 seconds of flight', ['At once', 'Only at maximum range', 'Once it homes in'],
    'HVLIs need about 2 seconds, roughly 1U, before they hit at full damage: hence the 1U minimum range.'),
  q('From how close does a torpedo home in on its target?', '1.2U', ['0.5U', '2U', '5.4U'],
    'Torpedoes fly straight, then home once the target is within 1.2U. Nukes and EMPs only home within 0.5U.'),
  q('How big is a nuke or EMP blast?', '1U', ['0.5U', '2U', '5U'],
    'Both blast across 1U, so fire them from at least 1.25U.'),
  q('How far can a torpedo reach without the tractor?', '5.4U', ['1.2U', '6.75U', '30U'],
    'Torpedoes, EMPs and nukes reach 5.4U; HVLIs 6.75U.'),
  q('Which flies fastest?', 'HVLI', ['Torpedo', 'EMP', 'Nuke'],
    'HVLIs fly at 0.5U a second (13.5 s to full range); the others at 0.2U a second (27 s).'),
  q('When does the missile console show "LOCKED ON"?', 'When a loaded tube has a firing solution', ['As soon as a target is selected', 'Only for nukes', 'Once the missile hits'],
    'Selecting a target is not a lock: only a loaded tube with a valid firing solution shows LOCKED ON.'),
  q('A mine goes off. How hard does it hit?', 'As hard as a nuke', ['Like a torpedo', 'Like an HVLI', 'Shields only, like an EMP'],
    'A mine delivers the same force as a standard nuke, set off by proximity instead of a launch.'),
  q('You fire a homing missile without a lock. What happens?', 'It flies straight along the tube\'s bearing', ['It won\'t launch', 'It homes on the nearest ship', 'It comes back'],
    'Without a lock it still launches, but straight along its bearing rather than on an intercept.'),
];

// ---- Callouts: the manual's standard calls, station by station (chapters 1 and 4–7, Appendix E).
const callouts = [
  q("You're on Radar. Something you can't identify yet appears at bearing 315.", 'Unknown contact, bearing 315.',
    ['Hostile frigate bearing 315!', 'Contact!', 'Captain, I think there might be something out there.'],
    'Call first, refine second: say what you know now, and refine it once it is scanned.'),
  q('Radar has scanned that contact: a hostile frigate at 315, closing fast.', 'Hostile frigate bearing 315, closing at speed.',
    ['Unknown contact, bearing 315.', 'Frigate!', "Captain, I've scanned it and I think it's a frigate."],
    'Refine the first call with what the scan showed: type, bearing, and what it is doing.'),
  q("You're on Beams and the front shields are down to 20%.", 'Front shields at 20%.',
    ['Shields low!', "We're taking fire!", 'Shields at 20%.'],
    'Facing first, then condition. "A shield report without a facing is not a report. It is a mood."'),
  q("You're on Engineering. Helm asks for a thruster spike, but the thrusters are already overheating.", 'Deny. Thrusters overheating.',
    ['No.', 'Spike thrusters.', "Thrusters are a bit warm, but I'll try."],
    'Confirm or deny, and always give the reason with a denial.'),
  q("You're on Engineering. The shield spike is over and you're bringing the power back down.", 'Spike complete, resetting shields.',
    ['Done.', 'Shields boosted.', 'Deny. Shields too hot.'],
    'Reset discipline: say the spike has ended and what you are resetting.'),
  q("You're on Missiles and have just fired a nuke at a target close to the ship.", 'Nuke away, danger close.',
    ['Fire!', 'Missiles away.', 'Target shield down.'],
    'Name the weapon and the danger, so Helm and Beams can react.'),
  q("You're on Missiles and a friendly drone is sitting in your firing line.", 'Clear the line.',
    ['Firing anyway.', "Drone, you're a bit in the way.", 'Nuke loaded.'],
    'Clear the Line: whatever is in the firing line moves out of it before you shoot.'),
  q("You're on Missiles and have just dropped a mine behind the ship.", 'Mine deployed.',
    ['Fire!', 'Mine held.', 'Slug window open.'],
    'Helm has to know at once: a mine stays dangerous to you too, long after the fight.'),
  q("You're the Captain and want Helm to pick the targets during the fight.", 'Helm, tactical lead.',
    ['Helm, you choose.', 'Everyone, shoot whatever you like.', 'Weapons, hold fire.'],
    'Assign the tactical lead explicitly: often Helm.'),
  q("You're the Captain and want the destroyer crippled, not destroyed.", 'Disable, do not destroy.',
    ['Destroy the destroyer.', 'Weapons, fire at will.', 'Break contact.'],
    'Give intent, not micromanagement: say the outcome you want.'),
  q("You're the Captain. The fight has turned against you and you want out.", 'Break contact.',
    ['Run!', 'Hold position.', 'Disable, do not destroy.'],
    'One clear call of intent: break contact, and let each station act on it.'),
  q("You're the First Officer. The Captain gave Navigation an order and you want it acknowledged.", 'Confirm order received.',
    ['Did you get that?', 'Captain, repeat the order.', 'All stations, quiet for Command.'],
    'The First Officer chases each order until someone acknowledges it.'),
  q("You're the First Officer. The bridge is noisy and the Captain needs to give an order.", 'All stations, quiet for Command.',
    ['Everyone shut up!', 'Red Alert.', 'Comms, summarise for Captain.'],
    'A short, clear call that clears the channel for Command.'),
  q("You're on Comms with an urgent message from Command.", 'Captain, priority message from Command.',
    ['Captain, Comms has an update when ready.', "Command says there's something happening near the station and they're worried about it.", 'Captain! Captain! Captain!'],
    'Interrupt only for urgent traffic, and say it is priority. Then summarise, rather than reading it out word for word.'),
  q("You're on Comms with a routine update while the Captain is busy.", 'Captain, Comms has an update when ready.',
    ['Captain, priority message from Command.', 'Captain! Captain! Captain!', 'Captain, listen to this.'],
    "Don't interrupt for routine traffic: flag it, and wait to be asked."),
  q("You're on Comms. Command has authorised nuclear release.", 'Weapons, nuclear authorisation granted.',
    ['Nuke them!', 'Weapons, nuclear authorisation denied.', 'Captain, I think we can nuke now.'],
    'Comms relays the authorisation to Weapons, plainly.'),
  q("You're on Navigation and have plotted Helm's route with the first white waypoint.", 'Helm, route plotted - White 1.',
    ['Helm, follow the white thing.', 'Helm, turn bearing 090.', 'Blue 1 Objective marked.'],
    'Name the colour and number so Helm finds it at a glance: white is route and course.'),
  q("You're on Navigation and have marked a minefield as the second hazard.", 'Minefield hazard Pink 2 marked.',
    ['Minefield hazard Red 2 marked.', 'Minefield hazard White 2 marked.', 'There are mines somewhere.'],
    'Pink (magenta) is hazards; red is known hostiles and white is the route.'),
  q("You're on Radar after the fight, and long-range sensors show no hostiles.", 'All clear.',
    ["We're safe now.", 'Stand down, everyone.', 'Unknown contact, bearing 315.'],
    '"All clear" means no hostiles on long-range sensors. It does not mean safe.'),
  q("You're on Dock & Drone and a drone is heading back to dock overheated.", 'Engineering, hot drone returning.',
    ['Drone recovered.', 'Drone lost.', 'Request Dock power.'],
    'Warn Engineering: a hot drone in the wrong bay dumps its heat into the docks.'),
  q("You're on Beams. HVLIs are inbound and you want Engineering ready before they hit.", 'Engineering, prepare to spike front shields. HVLIs inbound.',
    ['Spike!', 'Engineering, reset shields.', 'Front shields at 50%.'],
    'Prepare first, mark second: name the system and the threat, so Engineering is on the right control in time.'),
  q('Unknown contacts lie ahead and the Captain wants the bridge ready to act.', 'Yellow Alert. Unknown contacts ahead.',
    ['Red Alert.', 'Reset Alert. Return to normal operations.', 'Everyone, get ready!'],
    'Yellow means prepare; Red means act now. Give the reason whenever the alert state changes.'),
  q("You're on Damage Control. The beams are being repaired and will be back in about 30 seconds.", 'Beams under repair. Repair complete in 30 seconds.',
    ['Fixing stuff.', 'Beams offline.', 'Ship repair status green.'],
    'Say what is under repair and when it will be back. "Status green" is only for when every repair is done.'),
];

// ---- Damage Control: where the kit is on each ship (the Engineering tool's
// Damage Control tables, and the deck plans in Appendix H), then the manual's 3.11.
// Map spots are pixels on the cropped deck plans in maps/.
const SHIPS = [
  { name: 'UCS Takanami', map: 'takanami', w: 1050, h: 360,
    areas: ['Bridge', 'Midship', 'Medbay', 'Cargo Bay', 'Engineering'],
    kit: [
      ['the Manoeuvring OCP', 'Bridge', 'by the Navigation station', 821, 241],
      ['the Impulse OCP', 'Midship', 'in the corridor between the cargo bay and the bridge', 492, 145],
      ['the Missiles OCP', 'Engineering', 'in the aft engineering corridor', 181, 181],
      ['the Beams crystal', 'Medbay', '', 559, 75],
      ['the Front Shields crystal', 'Bridge', 'by the front viewscreen', 848, 130],
      ['the Rear Shields crystal', 'Engineering', '', 207, 195],
      ['switch 1', 'Bridge', '', 666, 128],
      ['switch 2', 'Engineering', '', 181, 199],
      ['switch 3', 'Cargo Bay', '', 408, 290],
      ['switch 4', 'Midship', 'by the aux engineering screen', 503, 217],
      ['switch 5', 'Medbay', '', 517, 122],
      ['the crystal restabiliser', 'Medbay', '', 608, 97],
      ['the spare OCP cupboard', 'Midship', '', 490, 227],
    ] },
  { name: 'UCS Havock', map: 'havock', w: 680, h: 330,
    areas: ['Bridge', 'Ready Room', 'Engineering'],
    kit: [
      ['the Manoeuvring OCP', 'Bridge', 'by Helm', 588, 141],
      ['the Impulse OCP', 'Engineering', 'by the aux engineering screen', 311, 135],
      ['the Missiles OCP', 'Engineering', 'in the middle of the corridor', 260, 137],
      ['the Beams crystal', 'Ready Room', '', 373, 107],
      ['the Front Shields crystal', 'Bridge', '', 628, 248],
      ['the Rear Shields crystal', 'Engineering', 'in the middle of the corridor', 217, 148],
      ['switch 1', 'Bridge', '', 459, 296],
      ['switch 2', 'Ready Room', '', 363, 43],
      ['switch 3', 'Engineering', 'by the OCP locker', 179, 142],
      ['switch 4', 'Engineering', 'by the aux engineering screen', 367, 148],
      ['switch 5', 'Ready Room', '', 353, 100],
      ['the crystal restabiliser', 'Ready Room', '', 297, 115],
      ['the spare OCP locker', 'Engineering', 'at the aft end of the corridor', 140, 137],
    ] },
];
// The deck plan with the spot circled, shown once the question is answered.
const spot = (s, x, y) => `<span class="pic map"><svg viewBox="0 0 ${s.w} ${s.h}" role="img" aria-label="${s.name} deck plan, with it circled">` +
  `<image href="maps/${s.map}.jpg" width="${s.w}" height="${s.h}"/>` +
  `<circle class="ring" cx="${x}" cy="${y}" r="${Math.round(s.w * 0.036)}" stroke-width="${Math.round(s.w * 0.008)}"/></svg></span>`;
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
const where = (s, [item, area, detail, x, y]) => ({
  ...q(`On the ${s.name}, where is ${item}?`, area, s.areas.filter(a => a !== area),
    `${cap(item)}${/^switch/.test(item) ? ` (Destabilisation Conduit ${item.slice(-1)})` : ''} is ${({ Bridge: 'on the Bridge', Midship: 'midship', Engineering: 'in Engineering' })[area] || 'in the ' + area}${detail ? ', ' + detail : ''}.`),
  reveal: spot(s, x, y),
});

const damage = [
  ...SHIPS.flatMap(s => s.kit.map(k => where(s, k))),
  q('Which systems do OCPs protect?', 'Manoeuvring, Impulse and Missiles', ['Beams, Front and Rear Shields', 'Reactor, Warp and Scanners', 'Every system on the ship'],
    'Overcurrent Protectors sacrifice themselves in a surge to protect Manoeuvring, Impulse and Missiles.'),
  q('Which systems need a Masahirite crystal?', 'Front Shields, Rear Shields and Beams', ['Manoeuvring, Impulse and Missiles', 'Warp and Scanners', 'Only the Reactor'],
    'Crystals keep the tunable systems calibrated: both shield generators and the beams.'),
  q('You put an OCP in a receptacle and it shows green. The OCP is…', 'Working', ['Broken', 'Not detected', 'Overheating'],
    'Green is a working OCP, red or flashing is broken, and blue means none is detected. Crystals use the same colours.'),
  q('You put an OCP in a receptacle and it flashes red. The OCP is…', 'Broken', ['Working', 'Not detected', 'Charging'],
    "Red or flashing is broken. You can't tell a broken OCP by sight, so never mix spent ones in with the spares."),
  q('An OCP receptacle shows blue. That means…', 'No OCP is detected', ['The OCP is working', 'The OCP is broken', 'The system is cold'],
    'Blue means nothing is detected: green is working, red or flashing is broken.'),
  q('How many spare OCPs does a ship usually start with?', 'Four', ['Two', 'Three', 'Six'],
    'Three fitted and four spares in the spare OCP cupboard.'),
  q('How long does a crystal take to restabilise?', 'Five minutes', ['One minute', 'Two minutes', 'Ten minutes'],
    'Restabilising takes five minutes, so put a destabilised crystal in as soon as you can.'),
  q('A system shows bright red at −100% and JUDITH says "Manual Repair Required!" What does the manual repair do?', 'Takes it to −99%, then SPANRs do the rest',
    ['Repairs it fully', 'Takes it to 0%', 'Nothing until the SPANRs arrive'],
    'A manual repair only takes the system from −100% to −99%. The SPANRs finish the job.'),
  q('The warp core is unstable and switch 3 shows red. What do you do with it?', 'Flip it to the other side, either way, until its light is green',
    ['Flip it up, never down', 'Leave it for the Chief Engineer', 'Flip every switch on the ship'],
    'Flip the switch inside to the opposite side: either way works. When every red light is green, the immediate danger is over.'),
  q("The warp core countdown shows 10 seconds or less and there's no call from the Captain. Who may eject the core?", 'Any crew member',
    ['Only the Captain', 'Only the Chief Engineer', 'Only Damage Control'],
    "Ideally the Captain decides, but at 10 seconds or less anyone may eject it. SOLIS: lives matter more than the warp core."),
  q('From 0%, how long do two SPANRs take to repair a system?', '1m 11s', ['2m 23s', '48s', '36s'],
    'Table 3-28: one SPANR takes 2m 23s from 0%, two take 1m 11s, three 48s and four 36s. They stack.'),
];

// Where the Academy Manual covers each question: a page of the PDF and its
// section, for the "Read it in the manual" link once it's answered.
const MANUAL_REFS = {
  icons: [125, 'Appendix B: Radar icons'], scanning: [29, '3.2 Scanning'], displays: [14, '2.0 Reading the Battlespace'],
  ordnance: [39, '3.7 Ordnance'], comms: [8, '1.1 Communication'], deck: [141, 'Appendix H: Deck plans'], repair: [56, '3.11 System Repair'],
};
const tag = (list, pick) => list.forEach(x => { const [page, section] = MANUAL_REFS[pick(x)]; x.manual = { page, section }; });
tag(radar, x => x.pic.includes('class="pic ship"') ? 'icons' : /display|sensors see/.test(x.prompt) ? 'displays'
  : x.prompt.startsWith('On Tactical') ? 'ordnance' : 'scanning');
tag(ordnance, () => 'ordnance');
tag(callouts, () => 'comms');
tag(damage, x => x.reveal ? 'deck' : 'repair');
// The manual opens in Tactical Aids, which asks its agreement questions first.
export const manualLink = page => '../tactical-aids/#doc=pdfs/general-info/UCN-Academy-Manual.pdf&page=' + page;

export const DRILLS = {
  radar: { label: 'Radar recognition', questions: radar },
  ordnance: { label: 'Ordnance choice', questions: ordnance },
  callouts: { label: 'Callouts', questions: callouts },
  damage: { label: 'Damage Control', questions: damage },
};
export const ROUND = 10;

// A repeatable random (shared/challenge.js): the same seed always deals the same
// round, which is how a friend can be challenged to it.
import { seeded, newSeed, toB64, fromB64 } from '../shared/challenge.js';
export { seeded, newSeed };

// A challenge in a link: the drill, the round's seed, and the sender's name,
// score and time. Anyone can make a link, so reading one checks everything.
export const challengeLink = c => toB64(JSON.stringify({ d: c.drill, s: c.seed, n: c.name || '', sc: c.score, t: Math.round(c.ms) }));
export function readChallenge(text) {
  let o;
  try { o = JSON.parse(fromB64(String(text))); } catch (e) { return null; }
  const whole = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  if (!o || !Object.hasOwn(DRILLS, o.d) || !whole(o.s, 1, 2147483646) || !whole(o.sc, 0, ROUND) || !whole(o.t, 0, 36e5)) return null;
  const name = typeof o.n === 'string' ? o.n.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40) : '';
  return { drill: o.d, seed: o.s, name, score: o.sc, ms: o.t };
}
// Who did better: more right, then the faster time. Above 0 if a beat b.
export const compare = (a, b) => a.score - b.score || b.ms - a.ms;

export function shuffle(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A round: ROUND questions from a drill in random order, each with its answer
// and up to three of its wrong options, shuffled together.
export function newRound(drill, random = Math.random) {
  return shuffle(DRILLS[drill].questions, random).slice(0, ROUND)
    .map(x => ({ ...x, options: shuffle([x.answer, ...shuffle(x.wrong, random).slice(0, 3)], random) }));
}

// m:ss.s, as round times are shown.
export function time(ms) {
  const t = Math.round(ms / 100);
  return Math.floor(t / 600) + ':' + String(Math.floor(t / 10) % 60).padStart(2, '0') + '.' + (t % 10);
}

// Adds a finished round to the records, and says whether it is a new best:
// more right, or as many right in less time.
export function record(records, drill, score, ms) {
  const r = records[drill] = { runs: 0, bestScore: 0, bestMs: null, ...records[drill] };
  const best = score > r.bestScore || (score > 0 && score === r.bestScore && (r.bestMs === null || ms < r.bestMs));
  r.runs++;
  if (best) { r.bestScore = score; r.bestMs = Math.round(ms); }
  return best;
}
