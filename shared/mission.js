/* The mission Mission Companion shares by QR code: its operation, type, ship
   and crew, so each player's tools fill themselves in. Plain ES5, as some of
   the tools are.
   - ucnMissionLink(m) packs { operation, type, ship, crew: [{ role, name }] }
     into a link; ucnReadMissionLink(text) unpacks one, checking everything,
     since anyone can make a link.
   - ucnSaveMission(m) keeps it on this device; ucnMission() reads it back,
     for 18 hours: a mission is one session, not next month's.
   - ucnMissionStation(name) is the station it gives that person (by default
     whoever set their name in the tools).
   - ucnSharedMission(ids) fills a tool's empty fields from it, once the tool
     has put its own saved values back. ids maps operation, type, ship, captain
     and role to a field id, or { select, other } for a list with an Other box;
     name is the field saying whose station to fill. With shipWithOperation, a
     ship list that always has a choice is set whenever the operation was blank. */
var UCN_STATIONS = ['Captain', 'First Officer', 'Helm', 'Navigation', 'Comms', 'Power Management',
  'Damage Control', 'Radar', 'Drone Operator', 'Beams', 'Missiles', 'Shuttle Helm', 'Shuttle Generalist', 'Shuttle Engineer'];
function ucnMissionText(v, max) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').slice(0, max) : '';
}
function ucnMissionClean(o) {
  if (!o || typeof o !== 'object') return null;
  var m = { operation: ucnMissionText(o.operation, 80), type: ucnMissionText(o.type, 40), ship: ucnMissionText(o.ship, 60), crew: [] };
  var crew = Object.prototype.toString.call(o.crew) === '[object Array]' ? o.crew : [];
  for (var i = 0; i < crew.length && m.crew.length < UCN_STATIONS.length; i++) {
    var c = crew[i] || {}, name = ucnMissionText(c.name, 40);
    if (name && UCN_STATIONS.indexOf(c.role) !== -1) m.crew.push({ role: c.role, name: name });
  }
  return m.operation || m.ship || m.crew.length ? m : null;
}
function ucnMissionLink(m) {
  var o = { o: m.operation || '', t: m.type || '', s: m.ship || '', c: [] };
  for (var i = 0; i < m.crew.length; i++) if (m.crew[i].name) o.c.push([m.crew[i].role, m.crew[i].name]);
  return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function ucnReadMissionLink(text) {
  try {
    var o = JSON.parse(decodeURIComponent(escape(atob(String(text).replace(/-/g, '+').replace(/_/g, '/')))));
    var crew = [];
    for (var i = 0; o && o.c && i < o.c.length; i++) if (o.c[i]) crew.push({ role: o.c[i][0], name: o.c[i][1] });
    return ucnMissionClean({ operation: o.o, type: o.t, ship: o.s, crew: crew });
  } catch (e) { return null; }
}
function ucnSaveMission(m) {
  try { localStorage.setItem('ucnMission_v1', JSON.stringify({ mission: m, savedAt: Date.now() })); return true; }
  catch (e) { return false; }
}
function ucnMission() {
  try {
    var o = JSON.parse(localStorage.getItem('ucnMission_v1'));
    return o && Date.now() - o.savedAt < 18 * 3600e3 ? ucnMissionClean(o.mission) : null;
  } catch (e) { return null; }
}
function ucnMissionStation(name) {
  if (name === undefined) {
    try { name = (JSON.parse(localStorage.getItem('ucnProfile_v1')) || {}).name; } catch (e) { name = ''; }
  }
  name = String(name || '').replace(/^\s+|\s+$/g, '').toLowerCase();
  var m = ucnMission();
  for (var i = 0; name && m && i < m.crew.length; i++) if (m.crew[i].name.toLowerCase() === name) return m.crew[i].role;
  return '';
}
function ucnSharedMission(ids) {
  var get = function (id) { return id ? document.getElementById(id) : null; };
  function fire(el, type) {
    var ev = document.createEvent('Event');
    ev.initEvent(type, true, true);
    el.dispatchEvent(ev);
  }
  // A ship is the same ship as "UCS HAVOCK", "Havock" or "havock".
  var norm = function (s) { return String(s || '').toUpperCase().replace(/^U[CN]S\s+/, '').replace(/^\s+|\s+$/g, ''); };
  function isEmpty(spec) {
    var el = get(typeof spec === 'string' ? spec : spec && spec.select);
    return !!el && !el.value;
  }
  // Fills one field, as if typed or picked, so the tool saves it its own way.
  function put(spec, value, force) {
    var el = get(typeof spec === 'string' ? spec : spec && spec.select);
    if (!el || !value || (el.value && !force)) return;
    if (el.tagName !== 'SELECT') {
      el.value = value; fire(el, 'input'); fire(el, 'change'); fire(el, 'blur');
      return;
    }
    for (var i = 0; i < el.options.length; i++) {
      var o = el.options[i];
      if (o.value && /other/i.test(o.value) === false && (norm(o.value) === norm(value) || norm(o.text) === norm(value))) {
        el.value = o.value; fire(el, 'change');
        return;
      }
    }
    var other = get(spec.other);
    if (!other) return;
    for (var j = 0; j < el.options.length; j++) {
      if (/other/i.test(el.options[j].value)) {
        el.value = el.options[j].value; fire(el, 'change');
        other.value = value; fire(other, 'input'); fire(other, 'change');
        return;
      }
    }
  }
  function fill() {
    var m = ucnMission();
    if (!m) return;
    var fresh = isEmpty(ids.operation);
    put(ids.operation, m.operation);
    put(ids.type, m.type);
    put(ids.ship, m.ship, fresh && ids.shipWithOperation);
    if (ids.captain) {
      for (var i = 0; i < m.crew.length; i++) if (m.crew[i].role === 'Captain') put(ids.captain, m.crew[i].name);
    }
    if (ids.role) {
      var nameEl = get(ids.name);
      put(ids.role, ucnMissionStation(nameEl && nameEl.value ? nameEl.value : undefined));
    }
  }
  // After the tool's own saved values, and after the shared name, are back.
  if (document.readyState === 'complete') setTimeout(fill, 0);
  else window.addEventListener('load', function () { setTimeout(fill, 0); });
}
