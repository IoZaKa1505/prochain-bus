/* Prochain bus — fonctionnement hors ligne.
   Change VERSION à chaque mise à jour des fichiers pour forcer le rafraîchissement. */
const VERSION = "pb-2026-11-10e";
const SHELL = ["./", "index.html", "bus.js", "data.json", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const font = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !font) return;

  e.respondWith(caches.open(VERSION).then(async cache => {
    const key = req.mode === "navigate" ? "index.html" : req;
    const hit = await cache.match(key, {ignoreSearch: true});
    // Polices : on garde la copie locale. Fichiers de l'app : réponse immédiate, mise à jour en arrière-plan.
    const net = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { if (!font) e.waitUntil(net); return hit; }
    return (await net) || new Response("Hors ligne", {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}});
  }));
});
