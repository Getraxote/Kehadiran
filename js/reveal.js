/* Kejutan rekap bulanan ala "Wrapped": slide bergantian dengan animasi, suara sintetis (WebAudio,
   tanpa berkas audio), konfeti, dan kartu gambar yang bisa disimpan.
   API: TKReveal.main(data, { onTutup }) — data disusun oleh app.js. */
window.TKReveal = (function () {
  'use strict';
  var E = window.TKU.esc;
  var ctx = null, muted = false, timers = [], raf = 0, root = null, cv = null, g2 = null, parts = [];
  var idx = 0, slides = [], data = null, tombol = null, stage = null, onTutup = null;
  var kurangGerak = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- suara ---------- */
  function audio() {
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (C) { try { ctx = new C(); } catch (e) { ctx = null; } } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, t0, dur, type, vol) {
    if (muted || !ctx) return;
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + t0;
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t0, dur, vol, f0, f1) {
    if (muted || !ctx) return;
    var n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), i;
    for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime + t0;
    s.buffer = b; f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t);
  }
  var sintetis = {
    whoosh: function () { noise(0, 0.35, 0.22, 400, 3200); },
    ting: function () { tone(1318, 0, 0.5, 'sine', 0.2); tone(1760, 0.08, 0.6, 'sine', 0.13); },
    drum: function (sec) {
      var t = 0, gap = 0.18;
      while (t < sec) { noise(t, 0.07, 0.3, 160, 90); tone(95, t, 0.09, 'triangle', 0.22); t += gap; gap = Math.max(0.045, gap * 0.93); }
    },
    fanfare: function () {
      var n = [523.25, 659.25, 783.99, 1046.5];
      n.forEach(function (f, i) { tone(f, i * 0.12, 0.5, 'sawtooth', 0.1); tone(f * 2, i * 0.12, 0.4, 'square', 0.035); });
      n.forEach(function (f) { tone(f, 0.55, 1.2, 'sawtooth', 0.08); });
    }
  };

  /* Berkas audio sendiri (opsional, diatur di js/config.js → audio). Yang dikosongkan memakai suara sintetis. */
  var A = (window.TK_CONFIG && window.TK_CONFIG.audio) || {}, musik = null, fadeT = 0;
  function putarBerkas(url, vol) {
    if (muted) return;
    try { var a = new Audio(url); a.volume = vol; var pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) { /* abaikan */ }
  }
  var sfx = {};
  ['whoosh', 'ting', 'drum', 'fanfare'].forEach(function (n) {
    sfx[n] = function (arg) {
      var f = A.sfx && A.sfx[n];
      if (f) putarBerkas(f, A.volumeSfx != null ? A.volumeSfx : 0.9); else sintetis[n](arg);
    };
  });
  function fade(a, ke, ms, selesai) {
    clearInterval(fadeT);
    var dari = a.volume, t0 = Date.now();
    fadeT = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      try { a.volume = Math.max(0, Math.min(1, dari + (ke - dari) * k)); } catch (e) { /* abaikan */ }
      if (k >= 1) { clearInterval(fadeT); if (selesai) selesai(); }
    }, 50);
  }
  function mulaiMusik() {
    if (!A.musik || musik) return;
    try {
      musik = new Audio(A.musik); musik.loop = true; musik.volume = 0; musik.muted = muted;
      var pr = musik.play(); if (pr && pr.catch) pr.catch(function () {});
      fade(musik, A.volumeMusik != null ? A.volumeMusik : 0.4, 2000);
    } catch (e) { musik = null; }
  }
  function henti() {
    if (!musik) return;
    var m = musik; musik = null;
    fade(m, 0, 900, function () { try { m.pause(); } catch (e) { /* abaikan */ } });
  }

  /* ---------- konfeti & angka ---------- */
  function ukur() { if (cv) { cv.width = window.innerWidth; cv.height = window.innerHeight; } }
  function konfeti(n) {
    if (kurangGerak || !cv) return;
    var w = cv.width, h = cv.height, warna = ['#edba3b', '#2f8f57', '#ffffff', '#46b872', '#f7ecc9', '#6fb7ff'], i;
    for (i = 0; i < n; i++) {
      parts.push({ x: w / 2 + (Math.random() - 0.5) * w * 0.3, y: h * 0.55, vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 16 - 6,
        s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: warna[Math.floor(Math.random() * warna.length)], life: 1 });
    }
    if (!raf) raf = requestAnimationFrame(gambarKonfeti);
  }
  function gambarKonfeti() {
    g2.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(function (p) { return p.y < cv.height + 30 && p.life > 0; });
    parts.forEach(function (p) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.004;
      g2.save(); g2.globalAlpha = Math.max(0, p.life); g2.translate(p.x, p.y); g2.rotate(p.r);
      g2.fillStyle = p.c; g2.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g2.restore();
    });
    raf = parts.length ? requestAnimationFrame(gambarKonfeti) : 0;
  }
  function hitung(node, ke, dec, dur) {
    var fmt = function (v) { return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)); };
    if (kurangGerak || !ke) { node.textContent = fmt(ke); return; }
    var t0 = performance.now(); dur = dur || 1400;
    (function langkah(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      node.textContent = fmt(ke * e);
      if (k < 1 && root) requestAnimationFrame(langkah);
    })(t0);
  }
  function tunda(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function angkaOtomatis(el) {
    Array.prototype.forEach.call(el.querySelectorAll('[data-to]'), function (n) { hitung(n, parseFloat(n.dataset.to), parseInt(n.dataset.dec || '0', 10)); });
  }

  /* ---------- susunan slide ---------- */
  function susun(d) {
    var S = [], s = d.saya;
    S.push({ tombol: 'Mulai', html: '<p class="rv-eyebrow">' + E(d.org) + '</p><h1 class="rv-h">Rekap<br>' + E(d.bulan) + '</h1><p class="rv-p">Ada kejutan untukmu, <b>' + E(d.nama) + '</b>.</p>' });
    S.push({
      html: '<p class="rv-eyebrow">Kita bersama</p><h2 class="rv-h2">Begini ramainya ' + E(d.bulan.split(' ')[0]) + '</h2><div class="rv-stats">' +
        stat(d.komunitas.total, 'kali kehadiran') + stat(d.komunitas.anggota, 'orang ikut meramaikan') + stat(d.komunitas.hari, 'hari berkumpul') + '</div>',
      masuk: angkaOtomatis
    });
    if (s.hadir > 0) {
      S.push({
        html: '<p class="rv-eyebrow">Kamu</p><h2 class="rv-h2">Kamu hadir</h2><div class="rv-big"><b data-to="' + s.hadir + '">0</b></div><p class="rv-p">kali bulan ini' +
          '.' + '</p>',
        masuk: angkaOtomatis
      });
      if (s.kegiatan) S.push({ html: '<p class="rv-eyebrow">Andalanmu</p><h2 class="rv-h2">Kegiatan yang paling sering kamu lakukan</h2><div class="rv-kegiatan">' + E(s.kegiatan) + '</div>', masuk: function () { sfx.ting(); } });
    } else {
      S.push({ html: '<p class="rv-eyebrow">Kamu</p><h2 class="rv-h2">Bulan ini kamu belum kelihatan</h2><p class="rv-p">Tak apa. Pintunya selalu terbuka, kursinya masih hangat.</p>' });
    }
    if (d.lencanaBaru.length) {
      S.push({
        kunci: true,
        html: '<p class="rv-eyebrow">Terbuka!</p><h2 class="rv-h2">Lencana baru untukmu</h2><div class="rv-cards">' + d.lencanaBaru.map(function (l) {
          return '<div class="rv-card hide"><span class="rv-ic">' + l.ikon + '</span><div><b>' + E(l.nama) + '</b><small>' + E(l.ket) + '</small></div></div>';
        }).join('') + '</div>',
        masuk: function (el, selesai) {
          Array.prototype.forEach.call(el.querySelectorAll('.rv-card'), function (c, i) {
            tunda(function () { c.classList.remove('hide'); c.classList.add('rv-pop'); sfx.ting(); konfeti(45); }, 500 + i * 1000);
          });
          tunda(selesai, 700 + d.lencanaBaru.length * 1000);
        }
      });
    }
    if (d.podium.length) {
      S.push({
        kunci: true,
        html: '<p class="rv-eyebrow">Drumroll…</p><h2 class="rv-h2">Tiga teratas bulan ini</h2><div class="rv-podium">' + [2, 1, 3].map(function (r) {
          var x = d.podium[r - 1];
          return x ? '<div class="rv-pod p' + r + ' hide' + (x.saya ? ' me' : '') + '" data-r="' + r + '"><span class="rk">' + r + '</span>' + x.av + '<div class="nm">' + E(x.nama) + '</div><div class="pt">' + x.poin + '</div><small>poin</small></div>' : '<div class="rv-pod none"></div>';
        }).join('') + '</div>',
        masuk: function (el, selesai) {
          var urut = d.podium.map(function (x, i) { return i + 1; }).reverse(), t = Math.round((A.drumDetik || 2.2) * 1000) + 100;
          var dd = A.drumDetik || 2.2;
          sfx.drum(dd);
          urut.forEach(function (r) {
            tunda(function () {
              var p = el.querySelector('.rv-pod[data-r="' + r + '"]');
              if (p) { p.classList.remove('hide'); p.classList.add('rv-pop'); }
              if (r === 1) { sfx.fanfare(); konfeti(110); } else sfx.ting();
            }, t);
            t += r === 2 ? 1400 : 1000;
          });
          tunda(selesai, t + 500);
        }
      });
    }
    if (d.peringkat) {
      var r = d.peringkat;
      S.push({
        html: '<p class="rv-eyebrow">Posisimu</p><h2 class="rv-h2">' + (r.rank === 1 ? 'Kamu juaranya!' : r.rank <= 3 ? 'Kamu masuk podium!' : 'Kamu terus melaju') + '</h2><div class="rv-big"><small>#</small><b data-to="' + r.rank + '">0</b></div><p class="rv-p">dari ' + r.total + ' orang yang ikut meramaikan.</p>',
        masuk: function (el) { angkaOtomatis(el); if (r.rank <= 3) { sfx.fanfare(); konfeti(80); } else sfx.ting(); }
      });
    }
    if (d.penghargaan.length) {
      S.push({
        html: '<p class="rv-eyebrow">Penghargaan</p><h2 class="rv-h2">Yang paling mencuri perhatian</h2><div class="rv-cards">' + d.penghargaan.map(function (a, i) {
          return '<div class="rv-card rv-in" style="animation-delay:' + (0.25 + i * 0.35) + 's"><span class="rv-ic">' + a.ikon + '</span><div><b>' + E(a.label) + '</b><small>' + E(a.nama) + ' · ' + E(a.nilai) + '</small></div></div>';
        }).join('') + '</div>',
        masuk: function () { sfx.ting(); }
      });
    }
    S.push({
      tombol: 'Selesai',
      html: '<p class="rv-eyebrow">Sampai jumpa</p><h2 class="rv-h2">Terima kasih sudah jadi bagian dari ' + E(d.bulan.split(' ')[0]) + '</h2><p class="rv-p">Bulan baru, cerita baru. Papan bulan ini kembali rahasia sampai tanggal 1.</p>' +
        '<button class="btn gold" data-rv="simpan" style="margin-top:6px">Simpan kartu sebagai gambar</button>',
      masuk: function () { sfx.fanfare(); konfeti(90); }
    });
    return S;
  }
  function stat(n, label) { return '<div class="rv-stat"><b data-to="' + n + '">0</b><span>' + label + '</span></div>'; }

  /* ---------- kartu gambar ---------- */
  function simpanGambar() {
    var d = data, c = document.createElement('canvas'), x = c.getContext('2d'), W = 1080, H = 1350;
    c.width = W; c.height = H;
    var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0e2a51'); g.addColorStop(0.5, '#0f4a4e'); g.addColorStop(1, '#1c7442');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(70,184,114,.25)'; x.beginPath(); x.arc(W, 0, 520, 0, 7); x.fill();
    var fam = "'Roboto Condensed','Arial Narrow',Arial,sans-serif";
    function teks(t, px, y, warna, tebal, rata) { x.font = (tebal ? '700 ' : '400 ') + px + 'px ' + fam; x.fillStyle = warna; x.textAlign = rata || 'center'; x.fillText(t, W / 2, y); }
    function gambar(im) {
      if (im) { x.save(); x.beginPath(); x.arc(W / 2, 170, 80, 0, 7); x.clip(); x.drawImage(im, W / 2 - 80, 90, 160, 160); x.restore(); }
      teks(d.org.toUpperCase(), 40, 320, '#f7ecc9', true);
      teks('REKAP ' + d.bulan.toUpperCase(), 84, 430, '#ffffff', true);
      teks(d.nama, 64, 560, '#edba3b', true);
      var s = d.saya, y = 700;
      if (s.hadir > 0) { teks(String(s.hadir), 220, y + 120, '#ffffff', true); teks('kali hadir', 44, y + 190, '#d6e6dc'); y += 280; }
      if (d.peringkat) { teks('Peringkat #' + d.peringkat.rank + ' dari ' + d.peringkat.total, 52, y + 40, '#edba3b', true); y += 110; }
      d.lencanaBaru.slice(0, 4).forEach(function (l, i) { teks('★ ' + l.nama, 44, y + 20 + i * 62, '#ffffff', true); });
      teks(d.org + ' · Tanda Kehadiran', 32, H - 60, 'rgba(255,255,255,.7)');
      c.toBlob(function (blob) {
        if (!blob) return;
        var f = new File([blob], 'rekap-' + d.kunci + '.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: 'Rekap ' + d.bulan }).catch(function () {}); return; }
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      }, 'image/png');
    }
    var im = new Image(); im.onload = function () { gambar(im); }; im.onerror = function () { gambar(null); }; im.src = d.logo;
  }

  /* ---------- kendali ---------- */
  function tampil(i) {
    idx = i; timers.forEach(clearTimeout); timers = [];
    var sl = slides[i];
    stage.innerHTML = '<div class="rv-slide rv-in">' + sl.html + '</div>';
    Array.prototype.forEach.call(root.querySelectorAll('.rv-dots i'), function (n, k) { n.className = k <= i ? 'on' : ''; });
    tombol.textContent = sl.tombol || 'Lanjut';
    tombol.disabled = !!sl.kunci;
    if (i > 0) sfx.whoosh();
    if (sl.masuk) sl.masuk(stage.firstChild, function () { tombol.disabled = false; tombol.focus(); });
    if (sl.kunci) tunda(function () { tombol.disabled = false; }, 12000);   // jaga-jaga agar tidak macet
    if (!sl.kunci) tombol.focus();
  }
  function lanjut() {
    if (tombol.disabled) return;
    if (idx === 0) { audio(); mulaiMusik(); }
    if (idx >= slides.length - 1) tutup(); else tampil(idx + 1);
  }
  function tutup() {
    timers.forEach(clearTimeout); timers = [];
    if (raf) cancelAnimationFrame(raf);
    raf = 0; parts = [];
    document.removeEventListener('keydown', tombolKeyboard, true);
    window.removeEventListener('resize', ukur);
    if (root) root.remove();
    root = null; document.body.classList.remove('gated');
    henti();
    if (ctx) { try { ctx.close(); } catch (e) { /* abaikan */ } ctx = null; }
    if (onTutup) onTutup();
  }
  function tombolKeyboard(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.preventDefault(); tutup(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); lanjut(); }
  }

  function main(d, opsi) {
    if (root) return;
    data = d; onTutup = opsi && opsi.onTutup; muted = false; idx = 0;
    slides = susun(d);
    root = document.createElement('div');
    root.className = 'rv'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Rekap ' + d.bulan);
    root.innerHTML = '<canvas class="rv-conf" aria-hidden="true"></canvas><div class="rv-top"><div class="rv-dots" aria-hidden="true">' +
      slides.map(function () { return '<i></i>'; }).join('') + '</div><button class="rv-btn" data-rv="suara" aria-pressed="false">Suara: nyala</button><button class="rv-btn" data-rv="lewati">Lewati</button></div>' +
      '<div class="rv-stage"></div><button class="btn gold lg rv-next" data-rv="lanjut">Mulai</button>';
    document.body.appendChild(root); document.body.classList.add('gated');
    cv = root.querySelector('.rv-conf'); g2 = cv.getContext('2d'); ukur(); window.addEventListener('resize', ukur);
    stage = root.querySelector('.rv-stage'); tombol = root.querySelector('.rv-next');
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rv]'); if (!b) return;
      var k = b.dataset.rv;
      if (k === 'lanjut') lanjut();
      else if (k === 'lewati') tutup();
      else if (k === 'suara') { muted = !muted; if (musik) musik.muted = muted; b.textContent = 'Suara: ' + (muted ? 'mati' : 'nyala'); b.setAttribute('aria-pressed', String(muted)); }
      else if (k === 'simpan') simpanGambar();
    });
    document.addEventListener('keydown', tombolKeyboard, true);
    tampil(0);
  }
  return { main: main };
})();
