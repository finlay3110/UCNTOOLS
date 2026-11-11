/* The crew rota made in the Crew Rota tool on this device, for the tools that
   can fill themselves in from it. ucnCrewRota() is the rota, or null: its
   date, ship and crew ([{ role, name }], stations in use only).
   ucnRotaFor(name) is the station and ship it gives that person (by default
   whoever set their name in the tools), or null. Plain ES5, as some of the
   tools are. */
function ucnCrewRota() {
  try {
    var r = JSON.parse(localStorage.getItem('ucnCrewRota_v1')).current;
    if (!r || !r.crew || !r.crew.length) return null;
    var crew = [];
    for (var i = 0; i < r.crew.length; i++) {
      var c = r.crew[i];
      if (c && typeof c.role === 'string' && typeof c.name === 'string') crew.push({ role: c.role, name: c.name });
    }
    return { date: String(r.date || ''), ship: String(r.ship || ''), crew: crew };
  } catch (e) { return null; }
}
function ucnRotaFor(name) {
  if (name === undefined) {
    try { name = (JSON.parse(localStorage.getItem('ucnProfile_v1')) || {}).name; } catch (e) { name = ''; }
  }
  name = String(name || '').trim().toLowerCase();
  var r = ucnCrewRota();
  if (!name || !r) return null;
  for (var i = 0; i < r.crew.length; i++) {
    if (r.crew[i].name.trim().toLowerCase() === name) return { role: r.crew[i].role, ship: r.ship, date: r.date };
  }
  return null;
}
