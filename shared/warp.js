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
