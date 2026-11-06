/* UCN Mess Log service worker.
   CACHE_VERSION is the content hash of the files below and is regenerated
   whenever any of them change, so an installed copy never keeps serving a
   stale build. */
var CACHE_VERSION = 'ucn-mess-log-28661b7eef11';

var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (c) {
      return c.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    // Only this app's old caches: the other UCN tools share this origin and its cache storage.
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE_VERSION || k.indexOf('ucn-mess-log-') !== 0 ? null : caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* Cache first: the app is entirely self-contained, so a hit is always
   correct and the tool works on a cold launch with no signal. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') { return; }
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) { return; }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) { return hit; }
      return caches.match('./index.html').then(function (shell) {
        if (shell && e.request.mode === 'navigate') { return shell; }
        return fetch(e.request);
      });
    })
  );
});
