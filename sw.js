// UCN Portal service worker.
//
// The portal is one page whose CSS, script, and logo are all inlined, so the
// entire offline shell is index.html itself. The tools the cards link to live
// in sub-folders of this worker's scope, and their requests are deliberately
// left alone: tools with their own worker handle themselves, the rest go
// straight to the network exactly as they did when hosted separately.

const CACHE = 'ucn-portal-v1';
const SHELL = './index.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.add(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    // Only this app's old caches: the other UCN tools share this origin and its cache storage.
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('ucn-portal-') && key !== CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;
  const root = new URL('./', self.location).pathname;
  if(url.pathname !== root && url.pathname !== root + 'index.html') return;

  // Network first, so a redeployed portal is picked up on the next online
  // visit rather than being pinned to whatever was cached at install time.
  const saved = () => caches.match(request).then(hit => hit || caches.match(SHELL));
  const network = fetch(request).then(response => {
    if(response.ok){
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  });
  // On Wi-Fi that is joined but passes nothing, the fetch hangs rather than
  // failing, so after 3 seconds the saved page is used; the network still
  // refreshes it when it answers.
  event.respondWith(new Promise(resolve => {
    let done = false;
    const answer = res => { if(!done && res){ done = true; resolve(res); } };
    const timer = setTimeout(() => saved().then(answer), 3000);
    network.then(res => { clearTimeout(timer); answer(res); },
                 () => { clearTimeout(timer); saved().then(hit => answer(hit || Response.error())); });
  }));
});
