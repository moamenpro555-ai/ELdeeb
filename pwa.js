/* pwa.js — تسجيل الـ Service Worker + زرار تثبيت التطبيق (أندرويد/كروم) + تلميح للآيفون. */
(function () {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (get('deeb_pwa_off')) return;
  var bar;
  function show(text, actionText, action) {
    if (bar) return;
    bar = document.createElement('div'); bar.className = 'pwa_bar'; bar.setAttribute('role', 'dialog');
    var t = document.createElement('span'); t.textContent = text; bar.appendChild(t);
    if (actionText) { var b = document.createElement('button'); b.type = 'button'; b.className = 'pwa_go'; b.textContent = actionText; b.onclick = action; bar.appendChild(b); }
    var x = document.createElement('button'); x.type = 'button'; x.className = 'pwa_x'; x.setAttribute('aria-label', 'إغلاق'); x.textContent = '✕';
    x.onclick = function () { set('deeb_pwa_off', '1'); bar.remove(); }; bar.appendChild(x);
    document.body.appendChild(bar);
  }
  var deferred;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    show('ثبّت تطبيق الديب على موبايلك', 'تثبيت', function () {
      deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; if (bar) { bar.remove(); bar = null; } });
    });
  });
  window.addEventListener('appinstalled', function () { if (bar) { bar.remove(); bar = null; } set('deeb_pwa_off', '1'); });
  // آيفون (Safari): مفيش beforeinstallprompt، فبنعرض التعليمات
  var ua = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  if (ios) setTimeout(function () { show('لتثبيت التطبيق: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»'); }, 2500);
})();
