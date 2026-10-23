/* intro.js — تسلسل الافتتاحية. بيشتغل مرة واحدة في الجلسة، وفيه زرار تخطي. */
(function () {
  var root = document.documentElement, el = document.getElementById('intro');
  if (!el || !root.classList.contains('in_play')) return;
  var stage = el.querySelector('.in_stage'), flash = el.querySelector('.in_flash'), title = el.querySelector('.in_title');
  var timers = [], ended = false;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function end() {
    if (ended) return; ended = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem('deeb_intro', '1'); } catch (e) {}
    el.classList.add('in_out');
    root.classList.remove('in_play'); root.classList.add('in_done');
    setTimeout(function () { el.style.display = 'none'; }, 1000);
  }
  // الـ in_play بيتشال فورًا فالـ overlay بيختفي بسرعة: نحافظ عليه لحد ما الـ fade يخلص
  function endSmooth() {
    if (ended) return; ended = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem('deeb_intro', '1'); } catch (e) {}
    el.classList.add('in_out');
    root.classList.add('in_done');
    setTimeout(function () { root.classList.remove('in_play'); el.style.display = 'none'; }, 950);
  }
  el.querySelector('.in_skip').onclick = endSmooth;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') endSmooth(); });
  at(1500, function () { stage.classList.add('eyes'); flash.classList.add('go'); });
  at(2700, function () { title.classList.add('on'); stage.classList.add('roar'); });
  at(4100, function () { title.classList.remove('on'); stage.classList.add('dive'); stage.style.transform = 'translate(-50%,-50%) scale(45)'; });
  at(6100, function () { flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); });
  at(6500, endSmooth);
})();
