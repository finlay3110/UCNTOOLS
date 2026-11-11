// The Crew Rota's logic, with no page code, so test.js can check it in Node.

// The stations, as Mission Companion, General Log and Mission Stats list them
// (test.js checks they still match), most important first: with fewer players
// than stations, the shuffle fills them from the top.
export const SHIP_STATIONS = ['Captain', 'First Officer', 'Helm', 'Navigation', 'Comms', 'Power Management',
  'Damage Control', 'Radar', 'Drone Operator', 'Beams', 'Missiles'];
export const SHUTTLE_STATIONS = ['Shuttle Helm', 'Shuttle Generalist', 'Shuttle Engineer'];
export const STATIONS = [...SHIP_STATIONS, ...SHUTTLE_STATIONS];
export const SHIPS = ['UCS Takanami', 'UCS Havock'];
export const KEY = 'ucnCrewRota_v1';

const MAX_NAME = 40, MAX_PLAYERS = 30;
export const cleanName = s => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
const same = (a, b) => a.toLowerCase() === b.toLowerCase();

// A rota: the session's date and ship, who is there, and each station in use
// with who is on it. auto marks a station the shuffle filled, which the next
// shuffle may change; a pick made by hand is kept.
export function blankRota(date, ship = '', players = [], shuttle = false) {
  return { date, ship, players: [...players], crew: (shuttle ? STATIONS : SHIP_STATIONS).map(role => ({ role, name: '', auto: false })) };
}

// How often each person has had each station, and the station they had last,
// from past rotas: { date: { ship, crew } }. The rota for `notDate` is left out.
export function pastStations(history, notDate) {
  const times = new Map(), last = new Map();
  for (const date of Object.keys(history).filter(d => d !== notDate).sort()) {
    for (const { role, name } of history[date].crew) {
      if (!name) continue;
      const k = name.toLowerCase() + '|' + role;
      times.set(k, (times.get(k) || 0) + 1);
      last.set(name.toLowerCase(), role);
    }
  }
  return { times, last, count: (name, role) => times.get(name.toLowerCase() + '|' + role) || 0 };
}

export function shuffled(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fills the stations not picked by hand, so each person gets the stations
// they've had least, and not the one they had last time. Many random tries,
// each filling stations one at a time with the fairest person left; the
// fairest whole rota wins, and ties go to chance so a reshuffle changes it.
export function fairShuffle(rota, history, random = Math.random, tries = 300) {
  const isKept = c => c.name && !c.auto;
  const kept = rota.crew.filter(isKept).map(c => c.name);
  const free = rota.players.filter(p => !kept.some(k => same(k, p)));
  const open = rota.crew.filter(c => !isKept(c)).slice(0, free.length);
  const past = pastStations(history, rota.date);
  const cost = (p, role) => past.count(p, role) * 10 + (past.last.get(p.toLowerCase()) === role ? 25 : 0);

  let best = null, bestCost = Infinity;
  for (let t = 0; t < tries && bestCost > 0; t++) {
    const pool = shuffled(free, random), pick = new Map();
    let total = 0;
    for (const s of shuffled(open, random)) {
      let who = null, c = Infinity;
      for (const p of pool) if (!pick.has(p) && cost(p, s.role) < c) { who = p; c = cost(p, s.role); }
      pick.set(who, s.role);
      total += c;
    }
    if (total < bestCost) { bestCost = total; best = pick; }
  }
  const byRole = new Map([...(best || [])].map(([p, role]) => [role, p]));
  return { ...rota, crew: rota.crew.map(c => isKept(c) ? c : { role: c.role, name: byRole.get(c.role) || '', auto: byRole.has(c.role) }) };
}

// Everyone who is there but not on a station.
export const spare = rota => rota.players.filter(p => !rota.crew.some(c => c.name && same(c.name, p)));

// "Sat 14 Nov 2026", the same on every phone (toLocaleDateString isn't).
export function dayText(date) {
  const d = new Date(date + 'T12:00:00Z');
  if (isNaN(d)) return date;
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' +
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

// The rota as a message for Discord or WhatsApp.
export function asText(rota) {
  const when = rota.date ? dayText(rota.date) : '';
  const lines = ['Crew rota' + [rota.ship, when].filter(Boolean).map(x => ' · ' + x).join('')];
  for (const c of rota.crew) if (c.name) lines.push(`${c.role}: ${c.name}`);
  const rest = spare(rota);
  if (rest.length) lines.push(`Not on a station: ${rest.join(', ')}`);
  return lines.join('\n');
}

// A rota in a link: compact JSON, base64url. Station numbers stand in for names.
const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0)));

export function encode(rota) {
  return b64(JSON.stringify({ d: rota.date, s: rota.ship, c: rota.crew.map(c => [STATIONS.indexOf(c.role), c.name]), p: spare(rota) }));
}

// Reads a rota from a link. Anyone can make a link, so everything is checked,
// and anything that isn't a station, a date or a short name is dropped.
export function decode(text) {
  let o;
  try { o = JSON.parse(unb64(String(text))); } catch (e) { return null; }
  if (!o || typeof o !== 'object' || !Array.isArray(o.c)) return null;
  const date = typeof o.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.d) ? o.d : '';
  const crew = [], players = [];
  const add = n => { if (n && players.length < MAX_PLAYERS && !players.some(p => same(p, n))) players.push(n); };
  for (const entry of o.c.slice(0, STATIONS.length)) {
    if (!Array.isArray(entry)) continue;
    const role = STATIONS[entry[0]], name = cleanName(typeof entry[1] === 'string' ? entry[1] : '');
    if (!role || crew.some(c => c.role === role)) continue;
    crew.push({ role, name, auto: false });
    add(name);
  }
  if (!crew.length) return null;
  for (const n of Array.isArray(o.p) ? o.p : []) if (typeof n === 'string') add(cleanName(n));
  crew.sort((a, b) => STATIONS.indexOf(a.role) - STATIONS.indexOf(b.role));
  return { date, ship: typeof o.s === 'string' ? cleanName(o.s) : '', players, crew };
}

// Reads the saved state, whatever is in storage: a fresh one if it's missing or damaged.
export function readSaved(raw, today) {
  try {
    const o = JSON.parse(raw);
    const r = o && o.current;
    if (r && typeof r.date === 'string' && Array.isArray(r.players) && Array.isArray(r.crew) &&
        r.crew.every(c => c && STATIONS.includes(c.role) && typeof c.name === 'string')) {
      return { current: r, history: o.history && typeof o.history === 'object' ? o.history : {} };
    }
  } catch (e) { /* fall through */ }
  return { current: blankRota(today), history: {} };
}

// Saves the rota as its date's entry in the history too, so past sessions
// count towards fairness without anyone having to archive them. A rota with
// nobody on a station leaves no entry.
export function withHistory(saved) {
  const history = { ...saved.history }, r = saved.current;
  if (r.date) {
    if (r.crew.some(c => c.name)) history[r.date] = { ship: r.ship, crew: r.crew.filter(c => c.name).map(({ role, name }) => ({ role, name })) };
    else delete history[r.date];
  }
  return { current: r, history };
}
