/* Service worker Tanda Kehadiran.
   Menyimpan berkas aplikasi di cache supaya bisa dibuka lagi tanpa internet.
   Setelah mengubah berkas aplikasi, naikkan VERSION agar cache lama diganti. */
const VERSION = 'kehadiran-v9';
const EXTERNAL = 'kehadiran-external';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './assets/style.css', './assets/logo.png',
  './js/config.js', './js/util.js', './js/qr.js', './js/store.js', './js/reveal.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-64.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== EXTERNAL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isExternalAsset(url) {
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' ||
    (url.hostname === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.destination === 'audio' || req.destination === 'video' || req.headers.has('range')) return;   // media: biar browser yang mengurus

  // Berkas aplikasi sendiri: jaringan dulu (pembaruan cepat sampai), cache bila offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            const key = req.mode === 'navigate' ? './index.html' : req;
            caches.open(VERSION).then((c) => c.put(key, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
    return;
  }

  // Font dan SDK Firebase: cache dulu, perbarui di belakang layar.
  if (isExternalAsset(url)) {
    event.respondWith(
      caches.open(EXTERNAL).then((cache) =>
        cache.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
  }
});
