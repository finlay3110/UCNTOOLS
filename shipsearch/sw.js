/* UCN Ship Search service worker: keeps the tool's files on the device so it
   opens with no signal. Network first, so a new deploy shows up on the next
   online visit; the cache is only the fallback. */
var CACHE = 'ucn-shipsearch-v1';
var PREFIX = 'ucn-shipsearch-';
var FILES = [
  "./",
  "index.html",
  "UCN_Ship_Allocation_Rota.pdf"
];
// Third-party files the tool loads. Fetched with CORS so they can be stored.
var REMOTE = [];
var REMOTE_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // cache:'reload' so the stored copy comes from the network, not the HTTP cache.
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }))
      .then(function () {
        // Best effort: a CDN hiccup must not stop the tool's own files being stored.
        return Promise.all(REMOTE.map(function (u) {
          return c.add(new Request(u, { mode: 'cors', cache: 'reload' })).catch(function () {});
        }));
      });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    // Only this tool's old caches: the other UCN tools share this origin and its cache storage.
    return Promise.all(keys.map(function (k) {
      return k !== CACHE && k.indexOf(PREFIX) === 0 ? caches.delete(k) : null;
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin && REMOTE_HOSTS.indexOf(url.hostname) === -1) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res.status === 200 || res.type === 'opaque') {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { return c.put(req, copy); }).catch(function () {});
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (req.mode === 'navigate') return caches.match('index.html');
      return Response.error();
    });
  }));
});
