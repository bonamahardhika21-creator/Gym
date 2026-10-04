// Service worker Gym Log: aplikasi tetap bisa dibuka tanpa internet.
// Strategi: tampilkan dari cache dulu, perbarui di latar belakang.
const C = 'gymlog-v1';
const A = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request;
  // Hanya GET ke situs sendiri. Sinkron ke Google Sheets (POST/lintas domain) tidak disentuh.
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(C).then(c =>
      c.match(r, { ignoreSearch: true }).then(m => {
        const f = fetch(r).then(n => { if (n.ok) c.put(r, n.clone()); return n; }).catch(() => m);
        return m || f;
      })
    )
  );
});
