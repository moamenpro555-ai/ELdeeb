/* intro.js — تسلسل الافتتاحية + صوت مصنوع بالكود (Web Audio). بيشتغل مرة واحدة في الجلسة. */
(function () {
  var root = document.documentElement, el = document.getElementById('intro');
  if (!el || !root.classList.contains('in_play')) return;
  var stage = el.querySelector('.in_stage'), flash = el.querySelector('.in_flash'), title = el.querySelector('.in_title');
  var gate = el.querySelector('.in_gate'), muteBtn = el.querySelector('.in_mute');
  var timers = [], ended = false, started = false, snd = null, muted = false;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  /* ---------------- الصوت ---------------- */
  function Sound() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    var ctx = new AC(), master = ctx.createGain(), comp = ctx.createDynamicsCompressor();
    master.gain.value = 0.9; master.connect(comp); comp.connect(ctx.destination);
    var sr = ctx.sampleRate, brown = ctx.createBuffer(1, sr * 3, sr), white = ctx.createBuffer(1, sr * 2, sr), i, last = 0, d;
    d = brown.getChannelData(0); for (i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    d = white.getChannelData(0); for (i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var curve = new Float32Array(1024); for (i = 0; i < 1024; i++) { var x = i / 512 - 1; curve[i] = Math.tanh(x * 6); }
    function src(buf, loop) { var s = ctx.createBufferSource(); s.buffer = buf; s.loop = !!loop; return s; }
    function osc(type, f) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; }
    function g(v) { var n = ctx.createGain(); n.gain.value = v; return n; }
    function bp(f, q) { var b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; return b; }
    function lp(f) { var b = ctx.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = f; return b; }
    function env(gn, t, a, peak, hold, rel) {
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(peak, t + a);
      gn.gain.setValueAtTime(peak, t + a + hold); gn.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
    }
    var amb;
    return {
      resume: function () { return ctx.resume(); },
      // هدير خلفية + نبض منخفض
      ambient: function (t) {
        var n = src(brown, true), f = lp(220); amb = g(0.0001); n.connect(f); f.connect(amb); amb.connect(master);
        amb.gain.setValueAtTime(0.0001, t); amb.gain.exponentialRampToValueAtTime(0.55, t + 1.8);
        var s = osc('sine', 46), sg = g(0.18); s.connect(sg); sg.connect(amb); n.start(t); s.start(t);
      },
      // شرارة العيون
      ignite: function (t) {
        var n = src(white, false), b = bp(300, 1.2), e = g(0.0001);
        b.frequency.setValueAtTime(300, t); b.frequency.exponentialRampToValueAtTime(3200, t + 0.7);
        n.connect(b); b.connect(e); e.connect(master); env(e, t, 0.05, 0.35, 0.1, 0.7); n.start(t, 0, 1.2);
        var s = osc('sine', 80), se = g(0.0001); s.frequency.setValueAtTime(80, t); s.frequency.exponentialRampToValueAtTime(40, t + 0.6);
        s.connect(se); se.connect(master); env(se, t, 0.01, 0.6, 0.05, 0.6); s.start(t); s.stop(t + 0.9);
      },
      // زمجرة
      growl: function (t, dur) {
        var o = osc('sawtooth', 95); o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(58, t + dur);
        var vib = osc('sine', 27), vg = g(16); vib.connect(vg); vg.connect(o.frequency);
        var f1 = bp(500, 4), f2 = bp(1100, 5), mix = g(1), sh = ctx.createWaveShaper(); sh.curve = curve;
        var am = g(0.55), lfo = osc('sine', 31), lg = g(0.45); lfo.connect(lg); lg.connect(am.gain);
        var out = g(0.0001);
        o.connect(f1); o.connect(f2); f1.connect(mix); f2.connect(mix); mix.connect(sh); sh.connect(am); am.connect(out); out.connect(master);
        env(out, t, 0.18, 0.9, dur - 0.5, 0.45);
        var n = src(white, true), nb = bp(1400, 0.7), ne = g(0.0001); n.connect(nb); nb.connect(ne); ne.connect(master); env(ne, t + 0.05, 0.25, 0.22, dur - 0.7, 0.5);
        var s = osc('sine', 58), sg = g(0.0001); s.frequency.setValueAtTime(58, t); s.frequency.linearRampToValueAtTime(36, t + dur); s.connect(sg); sg.connect(master); env(sg, t, 0.12, 0.8, dur - 0.4, 0.5);
        [o, vib, lfo, n, s].forEach(function (x) { x.start(t); x.stop(t + dur + 0.7); });
      },
      // غطسة جوه البق
      whoosh: function (t, dur) {
        var n = src(white, true), b = bp(150, 0.9), e = g(0.0001);
        b.frequency.setValueAtTime(150, t); b.frequency.exponentialRampToValueAtTime(5200, t + dur);
        n.connect(b); b.connect(e); e.connect(master);
        e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(0.7, t + dur * 0.92); e.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
        n.start(t); n.stop(t + dur + 0.3);
        var s = osc('sine', 120), sg = g(0.0001); s.frequency.setValueAtTime(120, t); s.frequency.exponentialRampToValueAtTime(30, t + dur);
        s.connect(sg); sg.connect(master); sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.5, t + dur * 0.9); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
        s.start(t); s.stop(t + dur + 0.3);
      },
      // ارتطام الوميض
      impact: function (t) {
        var s = osc('sine', 120), e = g(0.0001); s.frequency.setValueAtTime(120, t); s.frequency.exponentialRampToValueAtTime(26, t + 0.9);
        s.connect(e); e.connect(master); env(e, t, 0.005, 1, 0.05, 1.1); s.start(t); s.stop(t + 1.3);
        var n = src(white, false), f = lp(500), ne = g(0.0001); n.connect(f); f.connect(ne); ne.connect(master); env(ne, t, 0.003, 0.6, 0.02, 0.5); n.start(t, 0, 0.7);
      },
      fadeOut: function (sec) {
        var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + sec);
        setTimeout(function () { try { ctx.close(); } catch (e) {} }, sec * 1000 + 200);
      },
      mute: function (m) { master.gain.value = m ? 0 : 0.9; },
      now: function () { return ctx.currentTime; }
    };
  }

  /* ---------------- الإنهاء ---------------- */
  function endSmooth() {
    if (ended) return; ended = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem('deeb_intro', '1'); } catch (e) {}
    if (snd) snd.fadeOut(0.9);
    el.classList.add('in_out'); root.classList.add('in_done');
    setTimeout(function () { root.classList.remove('in_play', 'in_wait'); el.style.display = 'none'; }, 950);
  }

  /* ---------------- التسلسل ---------------- */
  function start(withSound) {
    if (started || ended) return; started = true;
    if (withSound) { try { snd = Sound(); } catch (e) { snd = null; } }
    if (gate) gate.style.display = 'none';
    root.classList.remove('in_wait');
    if (snd) {
      snd.resume(); var t = snd.now() + 0.05;
      snd.ambient(t); snd.ignite(t + 1.5); snd.growl(t + 2.7, 2.3); snd.whoosh(t + 4.1, 2.3); snd.impact(t + 6.4);
      if (muteBtn) { muteBtn.style.display = 'block'; }
    }
    at(1500, function () { stage.classList.add('eyes'); flash.classList.add('go'); });
    at(2700, function () { title.classList.add('on'); stage.classList.add('roar'); });
    at(4100, function () { title.classList.remove('on'); stage.classList.add('dive'); stage.style.transform = 'translate(-50%,-50%) scale(45)'; });
    at(6400, function () { flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); });
    at(6900, endSmooth);
  }

  el.querySelector('.in_skip').onclick = endSmooth;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') endSmooth(); });
  if (muteBtn) muteBtn.onclick = function () { muted = !muted; if (snd) snd.mute(muted); muteBtn.textContent = muted ? '🔇' : '🔊'; };
  if (gate) {
    gate.querySelector('.in_go_snd').onclick = function () { start(true); };
    gate.querySelector('.in_go_mute').onclick = function () { start(false); };
  } else { start(false); }
})();
