/* sw.js — Service Worker لمنصة الديب.
   القواعد: بنخزّن ملفات الموقع الثابتة بس (نفس الدومين). مفيش API ولا فيديو ولا أي دومين تاني بيتخزّن أبدًا،
   عشان بيانات الطالب والحصص المحمية ما تتسرّبش في كاش الجهاز. */
var VER = 'deeb-v2';
var PRECACHE = ['offline.html', 'css/plat.css', 'css/wow.css', 'css/deeb.css', 'image/deeb-logo.webp', 'image/icons/icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;      // API والفيديو والدومينات التانية: مباشرة من النت
  if (/\/(api)\//.test(url.pathname)) return;

  // صفحات HTML: النت أولًا (عشان التحديثات توصل)، ولو مفيش نت صفحة "مفيش اتصال"
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') > -1) {
    e.respondWith(fetch(req).catch(function () { return caches.match('offline.html'); }));
    return;
  }
  // JS و CSS: النت أولًا (عشان أي تعديل يوصل فورًا)، والكاش بس لو مفيش اتصال
  if (req.destination === 'script' || req.destination === 'style') {
    e.respondWith(fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') { var copy = res.clone(); caches.open(VER).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return caches.match(req); }));
    return;
  }
  // الصور والخطوط: من الكاش فورًا وتتحدّث في الخلفية
  e.respondWith(caches.open(VER).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
