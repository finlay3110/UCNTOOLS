/* ============================================================
   UCN General Log — offline shell.

   Deliberately conservative: the page is network-first, so a new deploy
   always wins and nobody can get wedged on a stale build. The cache is
   only there for when the network is slow or absent.

   Bump CACHE whenever the shell list changes; activate deletes every
   other cache this origin holds.
   ============================================================ */
var CACHE = 'ucn-general-log-v1';

var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

/* How long to wait for the network before serving a cached copy, when we
   have one. With nothing cached we keep waiting rather than fail early. */
var NET_TIMEOUT = 3000;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    // Only this app's old caches: the other UCN tools share this origin and its cache storage.
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        return key === CACHE || key.indexOf('ucn-general-log-') !== 0 ? Promise.resolve() : caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function store(request, response) {
  if (response && response.ok && response.type === 'basic') {
    var copy = response.clone();
    caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
  }
  return response;
}

function cached(request) {
  return caches.match(request, { ignoreSearch: true }).then(function (hit) {
    return hit || caches.match('./index.html');
  });
}

/* Network first, cache as the safety net. */
function navigateStrategy(request) {
  return new Promise(function (resolve) {
    var settled = false;

    function win(response) {
      if (settled) { return; }
      settled = true;
      resolve(response);
    }

    /* Pre-empt a stalled network only if there is something to fall back to. */
    var timer = setTimeout(function () {
      if (settled) { return; }
      cached(request).then(function (hit) {
        if (hit) { win(hit); }
      });
    }, NET_TIMEOUT);

    fetch(request).then(function (response) {
      clearTimeout(timer);
      store(request, response);
      win(response);
    }, function () {
      clearTimeout(timer);
      cached(request).then(function (hit) {
        win(hit || new Response(
          'UCN General Log is offline and has nothing cached yet. ' +
          'Reconnect once and it will work offline from then on.',
          { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        ));
      });
    });
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') { return; }

  var url;
  try { url = new URL(request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) { return; }

  if (request.mode === 'navigate') {
    event.respondWith(navigateStrategy(request));
    return;
  }

  /* Icons and the manifest are versioned by the cache name, so cache first. */
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(function (hit) {
      if (hit) { return hit; }
      return fetch(request).then(function (response) {
        return store(request, response);
      });
    })
  );
});
