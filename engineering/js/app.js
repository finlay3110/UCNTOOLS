// ============ TAB SWITCHING (top bar + bottom mobile bar, kept in sync) ============
const allTabBtns = document.querySelectorAll('.tab-btn, .bottom-tab-btn');
const panels = document.querySelectorAll('.panel');

function activateTab(name){
  allTabBtns.forEach(b=>{
    const isMatch = b.dataset.tab === name;
    b.classList.toggle('active', isMatch);
    b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    // Roving tabindex: only the selected tab in each bar is a tab stop, so
    // Tab moves past the tablist and the arrow keys move within it.
    b.tabIndex = isMatch ? 0 : -1;
  });
  panels.forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
}

allTabBtns.forEach(btn=>{
  btn.addEventListener('click', ()=> activateTab(btn.dataset.tab));

  btn.addEventListener('keydown', e=>{
    const KEYS = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1};
    const isEdge = e.key === 'Home' || e.key === 'End';
    if(!(e.key in KEYS) && !isEdge) return;
    e.preventDefault();

    // Move within the bar the focused tab belongs to, so the visible bar
    // (top on desktop, bottom on phone) is the one that gets focus. Tabs the
    // Setup module switches have hidden are skipped rather than focused.
    const bar = [...btn.closest('[role="tablist"]').querySelectorAll('[role="tab"]')]
      .filter(t => !t.hidden);
    const from = bar.indexOf(btn);
    if(from === -1) return;
    const to = isEdge
      ? (e.key === 'Home' ? 0 : bar.length - 1)
      : (from + KEYS[e.key] + bar.length) % bar.length;

    activateTab(bar[to].dataset.tab);
    bar[to].focus();
  });
});

// ============ WARP GUIDE DATA ============
// distance: number of sectors, or Infinity for the all-distance fallback setup
// ucn-lists:warp (from shared/warp.js, written on deploy: edit that file, not this code)
/* Warp travel, shared by Engineering and Helm: the Academy Manual's setups by
   distance (Appendix F), the field setups from the UCN "Effective Guide to
   Warp" (Tactical Aids: warp-guide.pdf), and its Elite Hidden Tactic, an
   easter egg behind a pin pad. ucnWarpExtras(el, eliteEl) fills el with the
   field setups and the hidden tactic (or puts the tactic in eliteEl, when
   given) and wires up the pad; each tool styles them.
   Plain ES5, as some of the tools are. */
// distance: sectors, or Infinity for the setup that goes any distance.
var UCN_WARP_TABLE = [
  { distance:5,  warpLevel:'Warp 4', warpPower:'210%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'8.40U/s', travelTime:'~21s' },
  { distance:10, warpLevel:'Warp 3', warpPower:'135%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'4.05U/s', travelTime:'57s' },
  { distance:15, warpLevel:'Warp 2', warpPower:'160%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'3.20U/s', travelTime:'1m 39s' },
  { distance:20, warpLevel:'Warp 2', warpPower:'155%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'3.10U/s', travelTime:'2m 14s' },
  { distance:25, warpLevel:'Warp 2', warpPower:'150%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'3.00U/s', travelTime:'2m 52s' },
  { distance:30, warpLevel:'Warp 2', warpPower:'145%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'2.90U/s', travelTime:'3m 32s' },
  { distance:35, warpLevel:'Warp 2', warpPower:'145%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'2.90U/s', travelTime:'4m 07s' },
  { distance:40, warpLevel:'Warp 2', warpPower:'145%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'2.90U/s', travelTime:'4m 40s' },
  { distance:45, warpLevel:'Warp 2', warpPower:'140%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'2.80U/s', travelTime:'5m 26s' },
  { distance:50, warpLevel:'Warp 2', warpPower:'140%', warpCoolant:'100%', reactorPower:'100%', reactorCoolant:'0%',  topSpeed:'2.80U/s', travelTime:'6m 02s' },
  { distance:Infinity, warpLevel:'Warp 1', warpPower:'125%', warpCoolant:'55%', reactorPower:'170%', reactorCoolant:'45%', topSpeed:'1.25U/s', travelTime:'—' }
];

var UCN_WARP_FIELD = [
  { title: 'Long distance &amp; heat effective',
    rows: [['Warp', '2'], ['Warp power', '136%'], ['Warp coolant', '100%'], ['Top speed', '2.72U/s'],
      ['Warp drain', '3.1 energy/s'], ['Total drain', '3.6 energy/s'], ['Distance', '416U (~21 sectors)']],
    note: 'The warp drive never builds heat in this setup: only the energy stored on the ship limits you. You&rsquo;ll arrive with drained power cells, but you&rsquo;ll get there.' },
  { title: 'Very long distance',
    rows: [['Warp', '1'], ['Warp', '149% power, 70% coolant'], ['Reactor', '149% power, 30% coolant'], ['Manoeuvring', '100% power'],
      ['Scanners', '100% power'], ['Every other system', '0% power'], ['Top speed', '1.49U/s'], ['Distance', 'Unlimited']],
    note: 'Everything except manoeuvring and scanners is switched off; those two stay online so you can avoid obstacles and scan incoming enemies. To keep more systems online, put more power and coolant into the reactor and take some from warp. The balance point is fine, so err on the side of the reactor.' },
  { title: 'Warp 4 quick',
    rows: [['Warp', '4'], ['Warp power', '300%'], ['Warp coolant', '100%'], ['Top speed', '12U/s (theoretical)'],
      ['Max time', '20 seconds'], ['Distance', '110U (~5.5 sectors)']],
    warn: 'Warning: this will completely destroy your warp drive. Don&rsquo;t take it lightly, and drop out of warp before the 20 seconds are up. If you don&rsquo;t, you may not be able to leave warp 4: the drive keeps overheating and destroys itself as you try to repair it.' }
];

// The pin is 1337, "elite" as a hacker writes it, which the clue gives away on purpose.
var UCN_ELITE_PIN = '1337';

function ucnWarpExtras(el, eliteEl) {
  var html = '<h2 class="mt">Field Setups</h2>' +
    '<p class="panel-sub">Tried-and-tested setups from the UCN <a href="../tactical-aids/#doc=pdfs/engineering/warp-guide.pdf" target="_blank" rel="noopener">Effective Guide to Warp</a>, for when the table above isn&rsquo;t the whole story.</p>' +
    '<div class="dc-groups">';
  for (var i = 0; i < UCN_WARP_FIELD.length; i++) {
    var c = UCN_WARP_FIELD[i];
    html += '<div class="setup-card"><h3>' + c.title + '</h3>';
    for (var j = 0; j < c.rows.length; j++) html += '<div class="setup-row"><span class="k">' + c.rows[j][0] + '</span><span class="v">' + c.rows[j][1] + '</span></div>';
    html += c.warn ? '<p class="setup-note setup-warn">' + c.warn + '</p>' : '<p class="setup-note">' + c.note + '</p>';
    html += '</div>';
  }
  var keys = '';
  for (var d = 1; d <= 9; d++) keys += '<button type="button" data-key="' + d + '">' + d + '</button>';
  html += '</div>';
  var elite = '<h2 class="mt">Elite Hidden Tactic</h2>' +
    '<div class="setup-card donut">' +
      '<div class="elite-lock">' +
        '<p class="setup-note pin-lead">Classified. Enter the four-digit code to unlock.</p>' +
        '<div class="pin-dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div>' +
        '<p class="pin-status" role="status" aria-live="polite"></p>' +
        '<div class="pin-pad" role="group" aria-label="Code pad">' + keys +
          '<button type="button" data-key="clear" class="small">Clear</button><button type="button" data-key="0">0</button>' +
          '<button type="button" data-key="back" class="small" aria-label="Delete last digit">&#9003;</button></div>' +
        '<p class="setup-note pin-clue">Clue: how does a hacker write <b>ELITE</b>?</p>' +
      '</div>' +
      '<div class="elite-tactic" hidden>' +
        '<h3 tabindex="-1">How to Pull a Sick Donut</h3>' +
        '<ol><li>Increase manoeuvring to max on Engineering.</li><li>Go into warp 3.</li><li>Turn heavily, 180&deg;.</li>' +
          '<li>Combat manoeuvre to the side, and adjust to hold the circle.</li><li>Come out of warp.</li></ol>' +
        '<svg viewBox="0 0 260 170" role="img" aria-label="Diagram: you circle round the target while staying locked on to it">' +
          '<ellipse cx="130" cy="80" rx="100" ry="62" fill="none" stroke="#8FA0BE" stroke-width="2" stroke-dasharray="10 9"/>' +
          '<path d="M122 72l8-8 8 8-8 8z" fill="#EAF0FB"/>' +
          '<text x="130" y="100" text-anchor="middle" fill="#8FA0BE" font-size="11" font-family="Exo 2, sans-serif">THEM</text>' +
          '<path class="you" d="M9 0L-7-7V7z" fill="#DD7A2B"/>' +
          '<text class="you-label" y="-11" text-anchor="middle" fill="#DD7A2B" font-size="11" font-weight="700" font-family="Exo 2, sans-serif">YOU</text>' +
          '<path d="M226 62l3 12-10-6" fill="none" stroke="#8FA0BE" stroke-width="2"/>' +
          '<text x="130" y="163" text-anchor="middle" fill="#8FA0BE" font-size="10" font-family="Exo 2, sans-serif">Circle the target while staying locked on</text>' +
        '</svg>' +
        '<p class="setup-note setup-warn">Do not tell Dent if manoeuvre performed.</p>' +
      '</div>' +
    '</div>';
  if (eliteEl && eliteEl !== el) { el.innerHTML = html; eliteEl.innerHTML = elite; el = eliteEl; }
  else el.innerHTML = html + elite;

  // You on the dotted orbit (centre 130,80, radii 100 by 62) at angle th, nose along it, clockwise.
  var ship = el.querySelector('.you'), label = el.querySelector('.you-label');
  function place(th) {
    var at = 'translate(' + (130 + 100 * Math.cos(th)).toFixed(1) + ' ' + (80 + 62 * Math.sin(th)).toFixed(1) + ')';
    ship.setAttribute('transform', at + ' rotate(' + (Math.atan2(62 * Math.cos(th), -100 * Math.sin(th)) * 180 / Math.PI).toFixed(1) + ')');
    label.setAttribute('transform', at);
  }
  place(-0.72);   // top right, until it moves
  // Circles once every 6 s from the unlock; stays parked where reduced motion is asked for.
  function orbit() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var t0 = 0;
    (function frame(now) {
      t0 = t0 || now;
      place(-0.72 + (now - t0) / 6000 * 2 * Math.PI);
      requestAnimationFrame(frame);
    })(0);
  }

  var lock = el.querySelector('.elite-lock'), status = el.querySelector('.pin-status');
  var dots = el.querySelectorAll('.pin-dots span'), entered = '';
  function show(text, state) {
    for (var k = 0; k < dots.length; k++) dots[k].className = k < entered.length ? 'on' : '';
    status.textContent = text;
    status.className = 'pin-status' + (state ? ' ' + state : '');
  }
  el.querySelector('.pin-pad').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null, key = b && b.getAttribute('data-key');
    if (!key || entered.length === 4) return;   // a full code is being checked
    if (key === 'clear') entered = '';
    else if (key === 'back') entered = entered.slice(0, -1);
    else entered += key;
    show(entered.length ? entered.length + ' of 4' : '');
    if (entered.length < 4) return;
    if (entered === UCN_ELITE_PIN) {
      show('Access granted', 'granted');
      setTimeout(function () {
        lock.hidden = true;
        el.querySelector('.elite-tactic').hidden = false;
        orbit();
        el.querySelector('.elite-tactic h3').focus();
      }, 600);
    } else {
      show('Access denied', 'denied');
      lock.className = 'elite-lock shake';
      setTimeout(function () { lock.className = 'elite-lock'; entered = ''; show(''); }, 800);
    }
  });
}
// ucn-lists:end
const WARP_TABLE = UCN_WARP_TABLE;

const warpBody = document.getElementById('warpTableBody');
const sectorInput = document.getElementById('sectorInput');
const sectorClear = document.getElementById('sectorClear');
const warpNote = document.getElementById('warpNote');
const warpIntro = document.getElementById('warpIntro');
const modeBtns = document.querySelectorAll('.mode-btn');
const distanceControls = document.getElementById('distanceControls');
const levelControls = document.getElementById('levelControls');
const warpLevelBtns = document.querySelectorAll('#warpLevelBtns button');

let warpMode = 'distance'; // 'distance' | 'level' | 'all'
let selectedLevel = null;  // '1' | '2' | '3' | '4'

const MODE_INTROS = {
  distance: 'Enter a distance to see the recommended warp setup. If your distance falls between two tabled entries, both bracketing rows are shown. Leave blank to see the all-distance (∞) setup.',
  level: 'Pick a warp level to see every tabled distance that uses it.',
  all: 'Every tabled distance and its recommended setup, in order.'
};

function distLabel(row){
  return row.distance === Infinity ? '∞' : row.distance + ' sectors';
}

function renderRow(row, cls){
  return `<tr class="${cls || ''}">
    <td data-label="Distance">${distLabel(row)}</td>
    <td data-label="Warp Level">${row.warpLevel}</td>
    <td data-label="Warp Power">${row.warpPower}</td>
    <td data-label="Warp Coolant">${row.warpCoolant}</td>
    <td data-label="Reactor Power">${row.reactorPower}</td>
    <td data-label="Reactor Coolant">${row.reactorCoolant}</td>
    <td data-label="Top Speed">${row.topSpeed}</td>
    <td data-label="Travel Time">${row.travelTime}</td>
  </tr>`;
}

function renderByDistance(){
  const raw = sectorInput.value.trim();

  // A number input reports value === '' for input it holds but cannot parse
  // ('-', '.', '1e', '1-2'), which is indistinguishable from an empty field
  // unless badInput is checked. Without this, a half-typed number silently
  // renders the infinity setup as though it were the answer.
  // (Pure letters never get this far - the browser drops those keystrokes.)
  if(sectorInput.validity && sectorInput.validity.badInput){
    warpBody.innerHTML = '';
    warpNote.textContent = 'That is not a number \u2014 enter a sector count, e.g. 6.';
    return;
  }

  if(raw === ''){
    const infRow = WARP_TABLE[WARP_TABLE.length - 1];
    warpBody.innerHTML = renderRow(infRow, 'exact-highlight');
    warpNote.textContent = 'Showing the all-distance (\u221E) setup. Enter a sector count above for a distance-specific recommendation.';
    return;
  }

  const n = Number(raw);
  if(!Number.isFinite(n) || n <= 0){
    warpBody.innerHTML = '';
    warpNote.textContent = 'Enter a positive number of sectors.';
    return;
  }

  const tabled = WARP_TABLE.filter(r => r.distance !== Infinity);
  const exact = tabled.find(r => r.distance === n);

  if(exact){
    warpBody.innerHTML = renderRow(exact, 'exact-highlight');
    warpNote.textContent = `Exact match for ${n} sectors.`;
    return;
  }

  if(n < tabled[0].distance){
    warpBody.innerHTML = renderRow(tabled[0], 'bracket-highlight');
    warpNote.textContent = `${n} sectors is below the shortest tabled distance (${tabled[0].distance}) \u2014 showing the nearest entry.`;
    return;
  }

  if(n > tabled[tabled.length - 1].distance){
    const last = tabled[tabled.length - 1];
    const inf = WARP_TABLE[WARP_TABLE.length - 1];
    warpBody.innerHTML = renderRow(last, 'bracket-highlight') + renderRow(inf, 'bracket-highlight');
    warpNote.textContent = `${n} sectors is beyond the longest tabled distance (${last.distance}) \u2014 showing the longest tabled entry and the all-distance (\u221E) setup.`;
    return;
  }

  // n is inside the tabled range and not an exact match, so a bracketing
  // pair is guaranteed to exist by this point.
  let lower, upper;
  for(let i = 0; i < tabled.length - 1; i++){
    if(tabled[i].distance <= n && tabled[i+1].distance >= n){
      lower = tabled[i];
      upper = tabled[i+1];
      break;
    }
  }
  warpBody.innerHTML = renderRow(lower, 'bracket-highlight') + renderRow(upper, 'bracket-highlight');
  warpNote.textContent = `${n} sectors falls between ${lower.distance} and ${upper.distance} sectors \u2014 showing both bracketing setups.`;
}

function renderByLevel(){
  if(!selectedLevel){
    warpBody.innerHTML = '';
    warpNote.textContent = 'Choose a warp level above.';
    return;
  }
  const label = 'Warp ' + selectedLevel;
  const matches = WARP_TABLE.filter(r => r.warpLevel === label);
  if(matches.length === 0){
    warpBody.innerHTML = '';
    warpNote.textContent = `No tabled distances use ${label}.`;
    return;
  }
  warpBody.innerHTML = matches.map(r => renderRow(r, 'bracket-highlight')).join('');

  // The infinity row is a distance-agnostic fallback rather than a tabled
  // distance, so saying "all tabled distances" would contradict the row on
  // screen - Warp 1 matches nothing but that fallback.
  const tabledMatches = matches.filter(r => r.distance !== Infinity);
  if(tabledMatches.length === 0){
    warpNote.textContent = `${label} is only used by the all-distance (∞) setup — no specific tabled distance uses it.`;
  } else if(matches.length > tabledMatches.length){
    warpNote.textContent = `Showing all tabled distances that use ${label}, plus the all-distance (∞) setup.`;
  } else {
    warpNote.textContent = `Showing all tabled distances that use ${label}.`;
  }
}

function renderAll(){
  warpBody.innerHTML = WARP_TABLE.map(r => renderRow(r)).join('');
  warpNote.textContent = `Showing all ${WARP_TABLE.length} tabled setups.`;
}

function renderWarpTable(){
  if(warpMode === 'distance') renderByDistance();
  else if(warpMode === 'level') renderByLevel();
  else renderAll();
}

modeBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    modeBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    modeBtns.forEach(b=>b.setAttribute('aria-pressed', String(b === btn)));
    warpMode = btn.dataset.mode;
    warpIntro.innerHTML = MODE_INTROS[warpMode];
    distanceControls.style.display = (warpMode === 'distance') ? 'flex' : 'none';
    levelControls.style.display = (warpMode === 'level') ? 'flex' : 'none';
    renderWarpTable();
  });
});

warpLevelBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    warpLevelBtns.forEach(b=>{
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    selectedLevel = btn.dataset.level;
    renderWarpTable();
  });
});

sectorInput.addEventListener('input', renderWarpTable);
sectorClear.addEventListener('click', ()=>{ sectorInput.value=''; renderWarpTable(); });

warpIntro.innerHTML = MODE_INTROS[warpMode];
renderWarpTable();

// ============ SPIKE TIMER ============
// Seconds a spike holds at spike power before it must be reset, from a cold
// start, by coolant 0/25/50/75/100% (Academy Manual Table E-1). null: holds
// indefinitely. RESET_AT is the heat reading it should be reset at.
const SPIKE_COOLANT = [0, 25, 50, 75, 100];
const SPIKE_HOLD = {
  150: [67, 460, null, null, null],
  200: [26, 44, 107, null, null],
  250: [12, 18, 27, 44, 101],
  300: [5, 8, 11, 15, 22],
};
const SPIKE_RESET_AT = {
  150: [95, 95], 200: [90, 95, 95], 250: [85, 90, 95, 95, 95], 300: [70, 80, 90, 95, 95],
};
// Power climbs about 1.67 s per 50% (Table 3-5): 300% takes about 7 s.
const spikeClimb = power => (power - 100) / 50 * 5 / 3;

const spikeBox = document.getElementById('spikeBox');
const spikeClock = document.getElementById('spikeClock');
const spikeStatus = document.getElementById('spikeStatus');
const spikeStart = document.getElementById('spikeStart');
let spikePower = 300, spikeCoolant = 0, spikeFrom = 0, spikeTicker = 0;

const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const inWords = s => s < 60 ? s + ' s' : Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's';
// Only on a change: rewriting a live region makes screen readers repeat it every tick.
const sayStatus = text => { if (spikeStatus.textContent !== text) spikeStatus.textContent = text; };

function renderSpike(){
  const i = SPIKE_COOLANT.indexOf(spikeCoolant);
  const hold = SPIKE_HOLD[spikePower][i], climb = spikeClimb(spikePower);
  const resetAt = SPIKE_RESET_AT[spikePower][i];
  if (!spikeTicker) {
    spikeBox.classList.remove('reset');
    spikeStart.textContent = 'Start spike';
    spikeStart.disabled = hold === null;
    spikeClock.textContent = hold === null ? '∞' : mmss(hold);
    sayStatus(hold === null
      ? `${spikePower}% holds indefinitely on ${spikeCoolant}% coolant: no reset needed for heat.`
      : `About ${Math.round(climb)} s to climb to ${spikePower}%, then hold for ${inWords(hold)} and reset at about ${resetAt}°.`);
    return;
  }
  const t = (performance.now() - spikeFrom) / 1000;
  if (t < climb) {
    spikeClock.textContent = mmss(climb - t);
    sayStatus(`Climbing to ${spikePower}%.`);
  } else if (t < climb + hold) {
    spikeClock.textContent = mmss(climb + hold - t);
    sayStatus(`Holding at ${spikePower}%. Reset when this runs out, or at about ${resetAt}°.`);
  } else if (!spikeBox.classList.contains('reset')) {
    spikeClock.textContent = '0:00';
    spikeBox.classList.add('reset');
    spikeStart.textContent = 'Done';
    sayStatus(`Reset now: ${spikePower}% has reached its safe limit.`);
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  }
}

function stopSpike(){ clearInterval(spikeTicker); spikeTicker = 0; renderSpike(); }

[['#spikePowerBtns', 'power', v => { spikePower = v; }], ['#spikeCoolantBtns', 'coolant', v => { spikeCoolant = v; }]]
  .forEach(([group, key, set]) => {
    const btns = document.querySelectorAll(group + ' button');
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      set(Number(btn.dataset[key]));
      stopSpike();   // a new plan starts from the top
    }));
  });

spikeStart.addEventListener('click', () => {
  if (spikeTicker) { stopSpike(); return; }
  spikeFrom = performance.now();
  spikeTicker = setInterval(renderSpike, 200);
  spikeStart.textContent = 'Stop';
  renderSpike();
});
renderSpike();

// ============ DAMAGE CONTROL DATA ============
const SHIP_DATA = {
  havock:{
    name:'UCS Havock',
    map:'ship-maps/HAVOCK_SHIP_MAP.pdf',
    groups:[
      {
        title:'OCPs',
        rows:[
          ['Manoeuvring', 'Bridge (by helm)'],
          ['Impulse', 'Engineering Corridor (by engineering aux screen)'],
          ['Missiles', 'Engineering Corridor (middle)'],
        ]
      },
      {
        title:'Crystals',
        note:'Charger located in the Ready Room',
        rows:[
          ['Beams', 'Ready Room'],
          ['Shields (Fore/Front)', 'Bridge'],
          ['Shields (Aft/Rear)', 'Engineering (mid)'],
        ]
      },
      {
        title:'Destabilisation Conduits',
        rows:[
          ['1', 'Bridge'],
          ['2', 'Ready Room'],
          ['3', 'Engineering (by OCP locker)'],
          ['4', 'Engineering (by aux engineering screen)'],
          ['5', 'Ready Room'],
        ]
      }
    ]
  },
  takanami:{
    name:'UCS Takanami',
    map:'ship-maps/Takanami_Ship_Map.pdf',
    groups:[
      {
        title:'OCPs',
        rows:[
          ['Manoeuvring', 'Bridge (by nav station)'],
          ['Impulse', 'Midship'],
          ['Missiles', 'Aft Engineering'],
        ]
      },
      {
        title:'Crystals',
        note:'Charger located in Medbay',
        rows:[
          ['Beams', 'Medbay'],
          ['Shields (Fore/Front)', 'Bridge'],
          ['Shields (Aft/Rear)', 'Engineering'],
        ]
      },
      {
        title:'Destabilisation Conduits',
        rows:[
          ['1', 'Bridge'],
          ['2', 'Engineering'],
          ['3', 'Cargo Bay'],
          ['4', 'Midship (by aux engineering screen)'],
          ['5', 'Medbay'],
        ]
      }
    ]
  }
};

const shipSelect = document.getElementById('shipSelect');
const viewMapBtn = document.getElementById('viewMapBtn');
const dcGroups = document.getElementById('dcGroups');

function renderShip(){
  const ship = SHIP_DATA[shipSelect.value];
  dcGroups.innerHTML = ship.groups.map(g => `
    <div class="dc-card">
      <h3>${g.title}</h3>
      ${g.note ? `<p class="dc-note">${g.note}</p>` : ''}
      ${g.rows.map(([k,v]) => `<div class="dc-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
    </div>
  `).join('');
}

viewMapBtn.addEventListener('click', ()=>{
  const ship = SHIP_DATA[shipSelect.value];
  window.open(ship.map, '_blank', 'noopener');
});

shipSelect.addEventListener('change', renderShip);
renderShip();

// ============ MODULE VISIBILITY ============
// Setup decides which reference tabs exist for this mission. Tabs are hidden
// rather than removed so their panels keep working if a section is switched
// back on mid-mission.
function setModuleVisibility(modules){
  document.querySelectorAll('[role="tab"][data-module]').forEach(tab=>{
    tab.hidden = !modules[tab.dataset.module];
  });

  // If the tab that was open has just been hidden, fall back to Setup rather
  // than leaving the page on a panel with no way back to it.
  const active = document.querySelector('[role="tab"][aria-selected="true"]');
  if(!active || active.hidden) activateTab('setup');
}

// Field setups and the Elite Hidden Tactic, from the Effective Guide to Warp.
ucnWarpExtras(document.getElementById('warpExtras'));

// Shared with js/mission.js, which loads after this file.
window.UCN = { SHIP_DATA, activateTab, setModuleVisibility, setShip(v){
  if(shipSelect.value !== v){ shipSelect.value = v; renderShip(); }
} };
