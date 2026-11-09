/* UCN Comms Log service worker: keeps the tool's files on the device so it
   opens with no signal. Its settings are here; how it works is shared/offline-sw.js. */
var CACHE = 'ucn-commslog-v2';
var PREFIX = 'ucn-commslog-';
var FILES = [
  "./",
  "css/style.css",
  "fonts/Exo2-Bold.ttf",
  "fonts/Exo2-Regular.ttf",
  "fonts/Exo2-SemiBold.ttf",
  "fonts/Orbitron-Black.ttf",
  "fonts/Orbitron-Bold.ttf",
  "img/ucn-logo-navy.png",
  "img/ucn-logo-white.png",
  "index.html",
  "js/app.js",
  "js/pdf-export.js",
  "js/vendor/jspdf.umd.min.js",
  "js/vendor/ucn-fonts.js",
  "js/vendor/ucn-logo.js",
  "manifest.webmanifest",
  "img/icon-192.png",
  "img/icon-512.png",
  "img/apple-touch-icon.png"
];
// Third-party files the tool loads. Fetched with CORS so they can be stored.
var REMOTE = [];
// ucn-lists:offline-sw (from shared/offline-sw.js, written on deploy: edit that file, not this code)
/* The offline copy for the tools that had none of their own: Comms Log,
   ID Card, Ship Search, Mission Stats and Hacking Trainer. Each sw.js sets CACHE, PREFIX,
   FILES and REMOTE above this. Network first, so a new deploy shows up on the
   next visit; the cache is only the fallback. Plain ES5. */
var REMOTE_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
// On Wi-Fi that is joined but passes nothing, a request neither answers nor
// fails for a long time: after this long the saved copy is used instead, and
// the network still refreshes it when it does answer.
var NET_TIMEOUT = 3000;
// Once a request has timed out, the page's other files don't each wait again.
var offlineUntil = 0;

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

function fromNetwork(req) {
  return fetch(req).then(function (res) {
    offlineUntil = 0;
    if (res.status === 200 || res.type === 'opaque') {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { return c.put(req, copy); }).catch(function () {});
    }
    return res;
  });
}

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined);
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin && REMOTE_HOSTS.indexOf(url.hostname) === -1) return;
  e.respondWith(new Promise(function (resolve) {
    var done = false;
    function answer(res) { if (!done && res) { done = true; resolve(res); } }
    var wait = Date.now() < offlineUntil ? 0 : NET_TIMEOUT;
    var timer = setTimeout(function () {
      offlineUntil = Date.now() + 30000;
      fromCache(req).then(answer);
    }, wait);
    fromNetwork(req).then(function (res) { clearTimeout(timer); answer(res); }, function () {
      clearTimeout(timer);
      fromCache(req).then(function (hit) { answer(hit || Response.error()); });
    });
  }));
});
// ucn-lists:end
