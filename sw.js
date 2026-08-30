/* AHW Quizverse service worker v2 - (c) 2026 AHW Quizverse / All VU Students.
   NETWORK-FIRST strategy: har visit par fresh code milta hai (no stale-cache
   bug), aur internet na ho to cache se offline chalta hai.
   Bump CACHE name whenever you want to force-invalidate old clients. */
const CACHE = "ahw-quizverse-v2";
const CORE = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/compiler.js",
  "data/mcqs.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "og-banner.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  /* network-first: fresh content when online, cache fallback when offline */
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req).then(hit => hit || caches.match("index.html"))
    )
  );
});
