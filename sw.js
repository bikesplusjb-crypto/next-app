// Service worker: keeps the app shell (the one HTML file, the manifest and the icons)
// on the device so ZigZag Mind, and its crisis screens, open with no connection.
// It caches nothing else. Plan, history and prefs live only in localStorage and never
// pass through here. tel: and sms: links never reach a service worker, so they work offline.
// Bump CACHE whenever a shell file other than index.html changes.
const CACHE = "zz-shell-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const NETWORK_TIMEOUT_MS = 3000;

const abs = p => new URL(p, self.location).href;
const SHELL_URLS = SHELL.map(abs);
const INDEX = abs("./index.html");
const PAGE_URLS = [abs("./"), INDEX];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate"){ event.respondWith(openPage(req)); return; }
  const key = url.origin + url.pathname;
  if (SHELL_URLS.includes(key) && !url.search) event.respondWith(caches.match(key).then(hit => hit || fetch(req)));
});

// Pages: try the network for the newest version, but never wait more than a few seconds.
// No connection, or a slow one, falls back to the saved copy of index.html.
async function openPage(req){
  const cache = await caches.open(CACHE);
  try {
    const res = await withTimeout(fetch(req), NETWORK_TIMEOUT_MS);
    const url = new URL(req.url);
    if (res.ok && !url.search && PAGE_URLS.includes(url.origin + url.pathname)) await cache.put(INDEX, res.clone());
    return res;
  } catch (_){
    return (await cache.match(INDEX)) || (await cache.match(abs("./"))) || Response.error();
  }
}

function withTimeout(promise, ms){
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}
