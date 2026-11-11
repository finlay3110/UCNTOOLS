/* "Get latest version", on every tool: a link marked data-ucn-latest drops
   this tool's offline copy (its service worker, and the caches holding its
   files) and reloads it from the site. Saved data in localStorage is kept, and
   the other tools' offline copies are left alone. With no signal it stops
   first, so the tool is never left with no copy at all. Plain ES5. */
function ucnGetLatest(e) {
  e.preventDefault();
  if (!confirm('Get the latest version of this tool?\n\nIt reloads from the site. Your saved logs and settings are kept.')) return;
  var base = new URL('./', location.href).href;
  var noop = function () {};
  // Is the site reachable? No tool keeps its sw.js offline, and a fresh query
  // gets past the browser's cache, so only the site can answer with it.
  var online = new Promise(function (ok, fail) {
    setTimeout(fail, 8000);   // Wi-Fi that is joined but passes nothing just hangs
    fetch(base + 'sw.js?latest=' + Date.now(), { cache: 'no-store' }).then(function (res) {
      if (res.ok && /javascript/.test(res.headers.get('content-type') || '')) ok(); else fail();
    }, fail);
  });
  online.then(function () {
    var regs = 'serviceWorker' in navigator ? navigator.serviceWorker.getRegistrations().catch(function () { return []; }) : Promise.resolve([]);
    var drop = window.caches ? caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return caches.open(k).then(function (c) { return c.keys(); }).then(function (reqs) {
          var ours = reqs.some(function (r) { return r.url.indexOf(base) === 0; });
          return ours ? caches.delete(k) : null;
        });
      }));
    }).catch(noop) : null;
    return Promise.all([drop, regs.then(function (all) {
      return Promise.all(all.filter(function (r) { return r.scope === base; }).map(function (r) { return r.unregister().catch(noop); }));
    })]);
  }).then(function () {
    location.reload();
  }, function () {
    alert('Can’t reach the site right now, so this tool’s offline copy is kept. Try again when you have signal.');
  });
}
(function () {
  var links = document.querySelectorAll('[data-ucn-latest]');
  for (var i = 0; i < links.length; i++) links[i].addEventListener('click', ucnGetLatest);
})();
