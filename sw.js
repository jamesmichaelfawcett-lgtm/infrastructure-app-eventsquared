// Klik Tech PWA — minimal service worker.
// Goal: make the app installable and let the shell (HTML/CSS/JS/icons) load
// even on a flaky connection. Live infrastructure data always goes straight
// to the network — it is never cached, so you always see current state.

const CACHE_NAME = 'klik-tech-shell-v1';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './lib/klik_app.css',
  './lib/klik_app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests on our own origin (the static app shell).
  // Everything else — API calls to api.klik.co, POSTs, auth, live data —
  // is left completely alone and goes straight to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
