/* Tanda Kehadiran — tampilan & alur. Semua teks dari pengguna di-escape (TKU.esc) sebelum masuk ke HTML. */
(function () {
  'use strict';
  var Store = window.TKStore, S = Store.state, U = window.TKU, E = U.esc;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  function lsGet(k, st) { try { return (st || localStorage).getItem(k); } catch (e) { return null; } }
  function lsSet(k, v, st) { try { (st || localStorage).setItem(k, v); } catch (e) { /* abaikan */ } }
  function lsDel(k, st) { try { (st || localStorage).removeItem(k); } catch (e) { /* abaikan */ } }

  /* ---------- ikon ---------- */
  var IC = {
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    clip: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M17 20h4M20 17v.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    locate: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    sheet: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'
  };
  function ic(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }
  function fotoDari(id) {
    var m = id && S.members.filter(function (x) { return x.id === id; })[0];
    return m && m.foto && /^https:\/\//.test(m.foto) ? m.foto : '';
  }
  function av(nama, cls, id, foto) {
    foto = foto || fotoDari(id);
    if (foto && !/^https:\/\//.test(foto)) foto = '';
    return '<span class="av ' + (cls || '') + '" style="background:' + U.warna(nama) + '">' + E(U.inisial(nama)) +
      (foto ? '<img data-fb="1" src="' + E(foto) + '" alt="" referrerpolicy="no-referrer" loading="lazy">' : '') + '</span>';
  }

  /* ---------- status UI ---------- */
  var ui = {
    periode: 'bulan',
    rekap: { dari: '', sampai: '', member: '', kegiatan: '', tab: 'tanggal' },
    draft: { aktivitas: '', lain: '', catatan: '' },
    selesai: null, editProfil: false, menu: false
  };
  // Identitas anggota = akun Google yang sedang masuk (tidak ada lagi memilih nama dari daftar).
  Object.defineProperty(ui.draft, 'memberId', { enumerable: true, get: function () { return S.user ? S.user.uid : ''; } });
  var rute = '', tertunda = false;

  /* ---------- helper data ---------- */
  function cfg() { return S.settings; }
  function memberById(id) { return S.members.filter(function (m) { return m.id === id; })[0]; }
  function cekById(id) { return S.checkins.filter(function (c) { return c.id === id; })[0]; }
  function milik() { return ui.draft.memberId ? cekById(U.todayStr() + '_' + ui.draft.memberId) : null; }
  function aktifList() { return S.members.filter(function (m) { return m.aktif !== false; }); }
  function sedangHadir() {
    var today = U.todayStr(), batas = cfg().autoPulangJam * 3600e3, now = Date.now();
    return S.checkins.filter(function (c) {
      return c.tanggal === today && c.keluar == null && now - U.aktifTerakhir(c) < batas;
    }).sort(function (a, b) { return U.aktifTerakhir(b) - U.aktifTerakhir(a); });
  }
  function aktivitasStr(c) {
    var seen = [];
    (c.riwayat || []).forEach(function (r) { if (r.a && seen.indexOf(r.a) < 0) seen.push(r.a); });
    if (!seen.length && c.aktivitas) seen.push(c.aktivitas);
    return seen.join(' → ');
  }
  function kegiatanTerbaru(n) {
    var ev = [];
    S.checkins.forEach(function (c) {
      var r = c.riwayat && c.riwayat.length ? c.riwayat : [{ a: c.aktivitas, t: c.masuk }];
      r.forEach(function (x, i) {
        ev.push({ nama: c.nama, a: x.a, t: x.t, tanggal: c.tanggal, catatan: i === r.length - 1 ? c.catatan : '', awal: i === 0 });
      });
    });
    return ev.sort(function (a, b) { return b.t - a.t; }).slice(0, n);
  }
  function isAdmin() { return Store.isAdmin(); }
  function salamWaktu() {
    var h = new Date().getHours();
    return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
  }

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg, bad) {
    var t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = 'toast'; }, 3600);
  }

  /* ---------- GPS ---------- */
  var Geo = { state: 'idle', pos: null, watch: null, sim: lsGet('tk_sim') || 'off' };
  function geoMulai() {
    if (Geo.sim !== 'off') { Geo.state = 'ok'; paintLive(); return; }
    if (!('geolocation' in navigator)) { Geo.state = 'unsupported'; paintLive(); return; }
    if (!window.isSecureContext) { Geo.state = 'insecure'; paintLive(); return; }
    Geo.state = 'locating'; paintLive();
    if (Geo.watch != null) navigator.geolocation.clearWatch(Geo.watch);
    Geo.watch = navigator.geolocation.watchPosition(function (p) {
      Geo.pos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy || 0, ts: Date.now() };
      Geo.state = 'ok'; paintLive();
    }, function (e) {
      Geo.state = e.code === 1 ? 'denied' : 'error'; paintLive();
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 25000 });
  }
  function posisiEfektif() {
    var s = cfg();
    if (Geo.sim === 'in') return { lat: s.lat + 0.00011, lng: s.lng + 0.00007, acc: 9 };
    if (Geo.sim === 'out') return { lat: s.lat + 0.012, lng: s.lng, acc: 9 };
    return Geo.pos;
  }
  function geoInfo() {
    var s = cfg();
    if (s.lat == null || s.lng == null) return { st: 'nolokasi' };
    if (Geo.state !== 'ok') return { st: Geo.state };
    var p = posisiEfektif();
    if (!p) return { st: 'locating' };
    var d = U.haversine(p.lat, p.lng, s.lat, s.lng);
    return { st: 'ok', dist: d, acc: p.acc, inside: d <= s.radius, rendah: p.acc > s.radius };
  }
  function qrSah() {
    var s = cfg(), o = null;
    try { o = JSON.parse(lsGet('tk_qr', sessionStorage)); } catch (e) { o = null; }
    return !!(s.qrAktif && s.qrToken && o && o.t === s.qrToken && Date.now() - o.ts < 3 * 3600e3);
  }
  function bolehAbsen() {
    var g = geoInfo();
    return (g.st === 'ok' && g.inside) || qrSah();
  }

  function panelGps() {
    var g = geoInfo(), s = cfg(), k = 'info', judul = '', teks = '', ikon = 'locate', aksi = '', meter = '', tone = '';
    var lokasi = E(s.lokasiNama);
    if (qrSah() && !(g.st === 'ok' && g.inside)) {
      tone = 'ok'; ikon = 'qr'; judul = 'Terverifikasi lewat QR';
      teks = 'QR di ' + lokasi + ' sudah dipindai, jadi kamu boleh mengisi kehadiran walau GPS tidak akurat.';
    } else if (g.st === 'nolokasi') {
      tone = 'warn'; ikon = 'alert'; judul = 'Titik lokasi belum diatur';
      teks = 'Pengurus belum menentukan titik ' + lokasi + '. Sementara itu, pakai QR Code di lokasi.';
    } else if (g.st === 'idle') {
      ikon = 'locate'; judul = 'Cek lokasimu dulu';
      teks = 'Tombol kehadiran aktif kalau kamu berada dalam radius ' + s.radius + ' m dari ' + lokasi + '.';
      aksi = '<button class="btn sm" data-act="geo-start">' + ic('locate') + ' Cek Lokasi Saya</button>';
    } else if (g.st === 'locating') {
      judul = 'Mencari sinyal GPS…'; teks = 'Biarkan halaman ini terbuka. Di tempat terbuka biasanya lebih cepat.';
      ikon = null;
    } else if (g.st === 'denied') {
      tone = 'bad'; ikon = 'alert'; judul = 'Izin lokasi ditolak';
      teks = 'Aktifkan izin lokasi untuk situs ini di pengaturan browser, lalu coba lagi. Atau scan QR di lokasi.';
      aksi = '<button class="btn sm ghost" data-act="geo-start">Coba lagi</button>';
    } else if (g.st === 'unsupported' || g.st === 'insecure') {
      tone = 'bad'; ikon = 'alert'; judul = 'GPS tidak tersedia';
      teks = g.st === 'insecure' ? 'GPS hanya berfungsi di alamat https://. Gunakan QR Code di lokasi.' : 'Browser ini tidak mendukung GPS. Gunakan QR Code di lokasi.';
    } else if (g.st === 'error') {
      tone = 'warn'; ikon = 'alert'; judul = 'Lokasi belum terbaca';
      teks = 'Sinyal GPS belum ditemukan. Coba keluar ruangan atau scan QR di lokasi.';
      aksi = '<button class="btn sm ghost" data-act="geo-start">Coba lagi</button>';
    } else if (g.inside) {
      tone = 'ok'; ikon = 'checkc'; judul = 'Kamu di area ' + lokasi;
      teks = 'Jarak ' + U.jarak(g.dist) + ' dari titik lokasi · akurasi ±' + Math.round(g.acc) + ' m.';
      meter = '<div class="meter" aria-hidden="true"><i style="width:' + Math.max(6, 100 - g.dist / s.radius * 100) + '%"></i></div>';
    } else {
      tone = 'warn'; ikon = 'pin'; judul = 'Di luar area ' + lokasi;
      teks = 'Kamu ' + U.jarak(g.dist) + ' dari titik lokasi (batas ' + s.radius + ' m). Mendekatlah, atau scan QR di lokasi.';
      meter = '<div class="meter" aria-hidden="true"><i style="width:' + Math.max(4, Math.min(100, s.radius / g.dist * 100)) + '%"></i></div>';
      aksi = '<button class="btn sm ghost" data-act="geo-start">Perbarui</button>';
    }
    if (g.st === 'ok' && g.rendah && !qrSah()) {
      teks += ' <b>Akurasi GPS rendah (±' + Math.round(g.acc) + ' m)</b> — coba di tempat terbuka atau pakai QR.';
    }
    var demo = Store.mode === 'demo' && s.lat != null ? '<div class="demo-note"><span>Simulasi (mode demo):</span>' +
      '<span class="seg" role="group" aria-label="Simulasi lokasi">' +
      [['off', 'GPS asli'], ['in', 'Di lokasi'], ['out', 'Di luar']].map(function (o) {
        return '<button data-act="sim" data-v="' + o[0] + '" aria-pressed="' + (Geo.sim === o[0]) + '">' + o[1] + '</button>';
      }).join('') + '</span></div>' : '';
    return '<div class="gps ' + tone + '"><div class="badge">' + (ikon ? ic(ikon) : '<span class="spin"></span>') + '</div>' +
      '<div style="flex:1;min-width:0"><h3>' + judul + '</h3><p>' + teks + '</p>' + meter +
      (aksi ? '<div class="acts">' + aksi + '</div>' : '') + '</div></div>' + demo;
  }

  /* ---------- kerangka halaman ---------- */
  function waves() {
    return '<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<linearGradient id="gw1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f9b58" stop-opacity=".9"/><stop offset="1" stop-color="#1b6a43" stop-opacity=".65"/></linearGradient></defs>' +
      '<path d="M760 0C690 90 800 160 740 250C690 330 800 380 770 400L1200 400L1200 0Z" fill="url(#gw1)"/>' +
      '<path d="M900 0C840 80 930 150 880 230C840 300 940 360 920 400L1200 400L1200 0Z" fill="#46b872" opacity=".22"/>' +
      '<path d="M0 270C160 230 260 335 420 305C540 283 610 345 700 400L0 400Z" fill="#0d2f4b" opacity=".55"/>' +
      '<path d="M0 335C200 295 330 385 520 335S760 305 860 365" stroke="#fff" stroke-opacity=".13" stroke-width="2" fill="none"/>' +
      '<path d="M0 355C220 320 340 400 540 355S780 330 880 390" stroke="#fff" stroke-opacity=".09" stroke-width="2" fill="none"/></svg>';
  }
  function pageHead(judul, ket) {
    return '<section class="page-h">' + waves() + '<div class="wrap"><h1>' + judul + '</h1>' + (ket ? '<p>' + ket + '</p>' : '') + '</div></section>';
  }
  function memuat() {
    return '<div class="wrap" style="padding:60px 0"><div class="card empty"><span class="spin" style="margin:0 auto 12px"></span><b>Memuat data…</b>Menyambungkan ke server.</div></div>';
  }
  function kosong(ikon, judul, teks) {
    return '<div class="empty">' + ic(ikon) + '<b>' + judul + '</b>' + teks + '</div>';
  }

  /* ---------- BERANDA ---------- */
  function kartuHadir(c) {
    return '<div class="who"><div class="top">' + av(c.nama, 'live', c.memberId) + '<div><div class="nm">' + E(c.nama) + '</div>' +
      '<div class="tm">' + ic('clock') + ' sejak ' + U.jam(c.masuk) + ' · ' + U.lalu(c.masuk) + '</div></div></div>' +
      '<div class="act"><span class="tag">' + E(c.aktivitas || '—') + '</span></div>' +
      (c.catatan ? '<div class="note">' + E(c.catatan) + '</div>' : '') + '</div>';
  }
  function ctaHero() {
    var m = milik();
    if (ui.draft.memberId && m && m.keluar == null) {
      return '<a class="btn gold lg" href="#/hadir">' + ic('checkc') + ' Sudah hadir · Ubah kegiatan</a>';
    }
    if (bolehAbsen()) return '<a class="btn gold lg" href="#/hadir">Isi Tanda Kehadiran</a>';
    return '<button class="btn gold lg" disabled aria-disabled="true">Isi Tanda Kehadiran</button>';
  }
  function home() {
    var s = cfg(), now = sedangHadir(), today = U.todayStr(), me = memberById(ui.draft.memberId);
    var hariIni = S.checkins.filter(function (c) { return c.tanggal === today; }).length;
    var bulanIni = S.checkins.filter(function (c) { return c.tanggal >= today.slice(0, 8) + '01'; }).length;
    var P = U.periode('bulan');
    var rank = U.urutkan(U.hitungStatistik(S.checkins, s, P.dari, P.sampai)).filter(function (r) { return r.poin > 0; }).slice(0, 3);
    var feed = kegiatanTerbaru(6);
    return '<section class="hero">' + waves() + '<div class="wrap"><div>' +
      '<h1>' + E(s.appName) + '</h1><div class="sub">' + E(s.orgName) + '</div>' +
      '<p class="hello">' + salamWaktu() + (me ? ', <b>' + E(me.nama.split(' ')[0]) + '</b>' : '') + '. ' + U.tglPanjang(today) +
      '. Datang ke ' + E(s.lokasiNama) + ', isi kehadiran, dan ceritakan kamu lagi ngapain.</p>' +
      '<div class="row" data-live="cta">' + ctaHero() + '<a class="btn ghost light" href="#/siapa">' + ic('users') + ' Siapa di sini (' + now.length + ')</a></div></div>' +
      '<div class="card" data-live="gps">' + panelGps() + '</div></div></section>' +

      '<div class="wrap"><div class="grid g4 keep2 lift">' +
      stat(now.length, 'Di ' + E(s.lokasiNama) + ' sekarang') + stat(hariIni, 'Hadir hari ini') +
      stat(bulanIni, 'Kehadiran bulan ini') + stat(aktifList().length, 'Anggota terdaftar') + '</div>' +

      '<section class="sec"><div class="sec-h"><div><h2>Sedang di ' + E(s.lokasiNama) + '</h2><span class="uline"></span></div><a href="#/siapa">Lihat semua →</a></div>' +
      (now.length ? '<div class="grid g4">' + now.slice(0, 4).map(kartuHadir).join('') + '</div>' :
        '<div class="card">' + kosong('users', 'Belum ada yang merapat', 'Jadilah yang pertama hadir hari ini!') + '</div>') + '</section>' +

      '<section class="sec cols" style="margin-bottom:44px"><div><div class="sec-h"><div><h2>Kegiatan Terbaru</h2><span class="uline"></span></div><a href="#/rekap">Rekap →</a></div>' +
      '<div class="card">' + (feed.length ? '<div class="feed">' + feed.map(function (f) {
        return '<div class="it"><div class="ic">' + ic(f.awal ? 'pin' : 'pulse') + '</div><div><b>' + E(f.nama) + ' · ' + E(f.a || '—') + '</b>' +
          '<small>' + U.hariRel(f.tanggal) + ', ' + U.jam(f.t) + (f.catatan ? ' — ' + E(f.catatan) : '') + '</small></div></div>';
      }).join('') + '</div>' : kosong('cal', 'Belum ada kegiatan', 'Kegiatan akan muncul di sini setelah ada yang hadir.')) + '</div></div>' +
      '<div><div class="sec-h"><div><h2>Apresiasi ' + U.bulan(today).split(' ')[0] + '</h2><span class="uline"></span></div><a href="#/apresiasi">Papan →</a></div>' +
      '<div class="card">' + (rank.length ? '<ul class="list-ic">' + rank.map(function (r, i) {
        return '<li><span class="ic">' + (i + 1) + '</span><span>' + E(r.nama) + '<small>' + r.hadir + ' kali hadir' + (r.streak > 1 ? ' · ' + r.streak + ' pekan beruntun' : '') + '</small></span><span class="r">' + r.poin + '</span></li>';
      }).join('') + '</ul>' : kosong('trophy', 'Papan masih kosong', 'Poin pertama bulan ini menunggumu.')) + '</div></div></section></div>';
  }
  function stat(n, t) { return '<div class="card stat"><b>' + n + '</b><span>' + t + '</span></div>'; }

  /* ---------- ISI KEHADIRAN ---------- */
  function tombolKirim() {
    var d = ui.draft, m = milik(), ok = bolehAbsen(), a = aktivitasFinal(), h = '';
    if (!d.memberId) return '<button class="btn gold lg block" disabled>Masuk dulu</button>';
    if (S.profil && S.profil.aktif === false) return '<button class="btn gold lg block" disabled>Akunmu dinonaktifkan pengurus</button>';
    if (m && m.keluar == null) {
      return '<div class="two"><button class="btn lg" data-act="update"' + (a ? '' : ' disabled') + '>' + ic('check') + ' Perbarui Kegiatan</button>' +
        '<button class="btn lg ghost" data-act="pulang">' + ic('out') + ' Pulang</button></div>' +
        (a ? '' : '<p class="hint" style="color:var(--muted);font-size:13px;margin:8px 0 0">Pilih kegiatan baru untuk memperbarui.</p>');
    }
    var off = !ok || !a;
    if (!ok) h = 'Tombol aktif saat kamu berada di area ' + E(cfg().lokasiNama) + ' atau sudah memindai QR di lokasi.';
    else if (!a) h = 'Pilih dulu kegiatanmu.';
    return '<button class="btn gold lg block" data-act="absen"' + (off ? ' disabled aria-disabled="true"' : '') + '>' + ic('checkc') + ' ' + (m ? 'Masuk Lagi' : 'Isi Tanda Kehadiran') + '</button>' +
      (h ? '<p style="color:var(--muted);font-size:13px;margin:8px 0 0;text-align:center">' + h + '</p>' : '');
  }
  function aktivitasFinal() {
    var d = ui.draft;
    return d.aktivitas === '__lain' ? (d.lain || '').trim().slice(0, 60) : d.aktivitas;
  }
  function hadir() {
    var s = cfg(), d = ui.draft, me = memberById(d.memberId), m = milik();
    var kiri = '';
    if (m && !d._init) {   // isi ulang form dari catatan hari ini bila sudah ada
      if (s.kategori.indexOf(m.aktivitas) >= 0) { d.aktivitas = m.aktivitas; d.lain = ''; } else { d.aktivitas = '__lain'; d.lain = m.aktivitas; }
      d.catatan = m.catatan || ''; d._init = true;
    }
    if (ui.selesai && ui.selesai.memberId === d.memberId && Date.now() - ui.selesai.ts < 25000) {
      var P = U.periode('bulan');
      var st = U.hitungStatistik(S.checkins, s, P.dari, P.sampai).filter(function (x) { return x.memberId === d.memberId; })[0];
      kiri += '<div class="banner ok">' + ic('checkc') + '<div><b>Tercatat! Terima kasih, ' + E(me ? me.nama.split(' ')[0] : '') + '.</b><br>' +
        (st ? 'Poinmu bulan ini <b>' + st.poin + '</b>' + (st.streak ? ' · streak ' + st.streak + ' pekan' : '') + '.' : '') + '</div></div>';
    }
    if (qrSah()) kiri += '<div class="banner info">' + ic('qr') + '<div>Terverifikasi lewat <b>QR Code</b> di lokasi.</div></div>';
    if (m) {
      kiri += m.keluar == null
        ? '<div class="banner ok">' + ic('pin') + '<div><b>Kamu tercatat hadir sejak ' + U.jam(m.masuk) + '.</b><br>Kegiatan sekarang: ' + E(m.aktivitas) + '. Ganti kegiatan di bawah kalau sudah pindah, atau tekan Pulang.</div></div>'
        : '<div class="banner info">' + ic('out') + '<div><b>Kamu sudah pulang pukul ' + U.jam(m.keluar) + '.</b><br>Kembali lagi? Tekan Masuk Lagi.</div></div>';
    }
    kiri += '<div class="me-box">' + av(me ? me.nama : '?', '', d.memberId, S.user && S.user.foto) + '<span class="nm">' + E(me ? me.nama : '') + '</span><button class="btn sm soft" style="margin-left:auto" data-act="ubah-profil">Ubah nama</button></div>';
    if (me && me.aktif === false) kiri += '<div class="banner bad" style="margin-top:12px">' + ic('alert') + '<div><b>Akunmu dinonaktifkan pengurus.</b><br>Hubungi pengurus bila ini keliru.</div></div>';

    kiri += '<div class="step" style="margin-top:22px"><b>1</b><h3>Lagi ngapain?</h3></div><div class="chips" role="group" aria-label="Kegiatan">' +
      s.kategori.map(function (k) { return '<button class="chip" data-act="pilih-kegiatan" data-v="' + E(k) + '" aria-pressed="' + (d.aktivitas === k) + '">' + E(k) + '</button>'; }).join('') +
      '<button class="chip" data-act="pilih-kegiatan" data-v="__lain" aria-pressed="' + (d.aktivitas === '__lain') + '">Lainnya…</button></div>' +
      (d.aktivitas === '__lain' ? '<div class="fld" style="margin-top:10px"><input type="text" id="lain" maxlength="60" data-k="lain" value="' + E(d.lain) + '" placeholder="Tulis kegiatanmu" aria-label="Kegiatan lainnya"></div>' : '');

    kiri += '<div class="step" style="margin-top:22px"><b>2</b><h3>Catatan kontribusi <small style="font:400 13px var(--body);color:var(--muted)">(opsional, +' + s.poin.catatan + ' poin)</small></h3></div>' +
      '<div class="fld"><textarea id="catatan" maxlength="280" data-k="catatan" placeholder="Contoh: membantu menyusun jadwal santunan anak yatim" aria-label="Catatan kontribusi">' + E(d.catatan) + '</textarea></div>' +
      '<div data-live="submit">' + tombolKirim() + '</div>';

    var kanan = '<div class="card" data-live="gps">' + panelGps() + '</div>' +
      '<div class="card" style="margin-top:18px"><h3 style="font-size:20px;margin-bottom:8px">Cara kerjanya</h3>' +
      '<div class="bd">' + ic('locate') + '<div>Tombol hanya aktif bila GPS HP-mu berada dalam radius <b>' + s.radius + ' m</b> dari ' + E(s.lokasiNama) + '.</div></div>' +
      (s.qrAktif ? '<div class="bd">' + ic('qr') + '<div>GPS susah di dalam ruangan? Scan <b>QR Code</b> yang ditempel di lokasi dengan kamera HP.</div></div>' : '') +
      '<div class="bd">' + ic('trophy') + '<div>Setiap kehadiran bernilai <b>+' + s.poin.hadir + ' poin</b>. Hadir beberapa pekan berturut-turut menambah bonus.</div></div></div>';
    return pageHead('Isi Tanda Kehadiran', 'Pastikan kamu ada di area ' + E(s.lokasiNama) + ', lalu ceritakan kegiatanmu.') +
      '<div class="wrap page-body"><div class="cols"><div class="card">' + kiri + '</div><div>' + kanan + '</div></div></div>';
  }

  /* ---------- aksi absen ---------- */
  var sibuk = false;
  async function simpanAbsen(mode) {
    if (sibuk) return;
    var d = ui.draft, me = memberById(d.memberId);
    if (!me) return toast('Lengkapi profilmu dulu', true);
    var today = U.todayStr(), id = today + '_' + me.id, ex = cekById(id), now = Date.now();
    var a = aktivitasFinal(), cat = (d.catatan || '').trim().slice(0, 280);
    try {
      sibuk = true;
      if (mode === 'pulang') {
        await Store.updateCheckin(id, { keluar: now });
        toast('Sampai jumpa, ' + me.nama.split(' ')[0] + '! Hati-hati di jalan.');
      } else {
        if (!a) return toast('Pilih kegiatanmu dulu', true);
        if (mode === 'absen' && !bolehAbsen()) return toast('Kamu belum berada di area lokasi', true);
        if (mode === 'update') {
          var patch = { catatan: cat || (ex && ex.catatan) || '' };
          if (ex.aktivitas !== a) { patch.aktivitas = a; patch.riwayat = (ex.riwayat || []).concat([{ a: a, t: now }]).slice(-40); }
          await Store.updateCheckin(id, patch);
          toast('Kegiatan diperbarui.');
        } else if (ex) {
          await Store.updateCheckin(id, {
            keluar: null, aktivitas: a, catatan: cat || ex.catatan || '',
            riwayat: (ex.riwayat || []).concat([{ a: a, t: now }]).slice(-40)
          });
          ui.selesai = { memberId: me.id, ts: now };
        } else {
          var g = geoInfo(), rec = {
            id: id, tanggal: today, memberId: me.id, nama: me.nama, aktivitas: a, catatan: cat,
            masuk: now, keluar: null, metode: g.st === 'ok' && g.inside ? 'gps' : 'qr', riwayat: [{ a: a, t: now }]
          };
          if (g.st === 'ok') rec.jarak = Math.round(g.dist);
          await Store.createCheckin(rec);
          ui.selesai = { memberId: me.id, ts: now };
          toast('Kehadiran tercatat. Terima kasih, ' + me.nama.split(' ')[0] + '!');
        }
      }
      lsSet('tk_me', me.id);
    } catch (e) {
      toast('Gagal menyimpan: ' + (e.code || e.message || e), true);
    } finally { sibuk = false; }
    render();
  }

  /* ---------- SIAPA DI SINI ---------- */
  function siapa() {
    var s = cfg(), now = sedangHadir(), today = U.todayStr();
    var pulang = S.checkins.filter(function (c) { return c.tanggal === today && now.indexOf(c) < 0; })
      .sort(function (a, b) { return (b.keluar || b.masuk) - (a.keluar || a.masuk); });
    var hitung = {};
    now.forEach(function (c) { hitung[c.aktivitas] = (hitung[c.aktivitas] || 0) + 1; });
    var ringkas = Object.keys(hitung).map(function (k) { return '<span class="tag">' + E(k) + ' · ' + hitung[k] + '</span>'; }).join(' ');
    var body = '<div class="card" style="margin-bottom:18px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:220px"><div style="display:flex;align-items:center;gap:10px"><span class="dot"></span><h2 style="font-size:30px">' + now.length + ' orang di ' + E(s.lokasiNama) + '</h2></div>' +
      (ringkas ? '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">' + ringkas + '</div>' : '<p style="margin:6px 0 0;color:var(--muted)">Belum ada yang merapat.</p>') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn gold" data-act="ajak">' + ic('share') + ' Ajak Merapat</button><a class="btn ghost" href="#/hadir">Isi Kehadiran</a></div></div>';
    body += now.length ? '<div class="grid g3">' + now.map(kartuHadir).join('') + '</div>' :
      '<div class="card">' + kosong('users', 'Sepi dulu nih', 'Ajak teman-teman merapat lewat tombol di atas.') + '</div>';
    if (pulang.length) {
      body += '<section class="sec"><div class="sec-h"><div><h2>Sudah pulang hari ini</h2><span class="uline"></span></div></div><div class="card pad0"><div class="rows">' +
        pulang.map(function (c) {
          return '<div class="row-l" style="grid-template-columns:44px 1fr auto">' + av(c.nama, 'sm', c.memberId) + '<div><div class="nm">' + E(c.nama) + '</div><div class="meta"><span>' + E(aktivitasStr(c)) + '</span></div></div>' +
            '<div class="meta" style="text-align:right">' + U.jam(c.masuk) + (c.keluar ? ' – ' + U.jam(c.keluar) : ' · lupa pulang') + '</div></div>';
        }).join('') + '</div></div></section>';
    }
    return pageHead('Siapa di Sini?', 'Daftar langsung anggota yang sedang berada di ' + E(s.lokasiNama) + ' beserta kegiatannya.') +
      '<div class="wrap page-body">' + body + '</div>';
  }
  function ajak() {
    var now = sedangHadir(), s = cfg(), url = location.origin + location.pathname;
    var teks = now.length
      ? 'Ada ' + now.length + ' orang di ' + s.lokasiNama + ' sekarang (' + now.slice(0, 4).map(function (c) { return c.nama.split(' ')[0]; }).join(', ') + (now.length > 4 ? ', dll' : '') + '). Yuk merapat!'
      : 'Yuk merapat ke ' + s.lokasiNama + '!';
    if (navigator.share) { navigator.share({ title: s.appName, text: teks, url: url }).catch(function () {}); return; }
    window.open('https://wa.me/?text=' + encodeURIComponent(teks + ' ' + url), '_blank', 'noopener');
  }

  /* ---------- APRESIASI ---------- */
  function apresiasi() {
    var s = cfg(), P = U.periode(ui.periode);
    var stat = U.hitungStatistik(S.checkins, s, P.dari, P.sampai);
    var urut = U.urutkan(stat.filter(function (x) { return x.poin > 0; }));
    var tabs = [['bulan', 'Bulan ini'], ['30', '30 hari'], ['semua', 'Semua']].map(function (t) {
      return '<button role="tab" data-act="periode" data-v="' + t[0] + '" aria-selected="' + (ui.periode === t[0]) + '">' + t[1] + '</button>';
    }).join('');
    var top = urut.slice(0, 3);
    var urutan = [top[1], top[0], top[2]], kelas = ['p2', 'p1', 'p3'], no = [2, 1, 3];
    var pod = top.length ? '<div class="podium">' + urutan.map(function (r, i) {
      return r ? '<div class="pd ' + kelas[i] + '"><span class="rk">' + no[i] + '</span>' + av(r.nama, '', r.memberId) + '<div class="nm">' + E(r.nama) + '</div><div class="pt">' + r.poin + '</div><small>' + r.hadir + ' kali hadir</small></div>' : '<div></div>';
    }).join('') + '</div>' : '';
    var meId = ui.draft.memberId;
    var daftar = urut.length ? '<div class="card pad0"><div class="rows">' + urut.map(function (r, i) {
      return '<div class="row-l' + (r.memberId === meId ? ' me' : '') + '"><div class="n">' + (i + 1) + '</div><div><div class="nm">' + E(r.nama) + (r.memberId === meId ? ' <span class="tag g">kamu</span>' : '') + '</div>' +
        '<div class="meta"><span>' + r.hadir + ' hadir</span>' + (r.streak ? '<span>' + ic('flame') + ' ' + r.streak + ' pekan beruntun</span>' : '') +
        (r.lencana.length ? '<span class="lenc">' + r.lencana.map(function (k) { var l = U.LENCANA.filter(function (x) { return x.k === k; })[0]; return '<span title="' + E(l.nama) + '">' + ic(l.ikon) + '</span>'; }).join('') + '</span>' : '') + '</div></div>' +
        '<div class="pt">' + r.poin + '<small>poin</small></div></div>';
    }).join('') + '</div></div>' : '<div class="card">' + kosong('trophy', 'Belum ada poin di periode ini', 'Hadir dan isi kegiatan untuk mulai mengumpulkan poin.') + '</div>';

    function terbaik(f, label, ikon, sat) {
      var b = stat.slice().sort(function (a, c) { return f(c) - f(a) || a.nama.localeCompare(c.nama); })[0];
      return b && f(b) > 0 ? '<div class="award"><div class="ic">' + ic(ikon) + '</div><div><small>' + label + '</small><b>' + E(b.nama) + '</b> <span class="tag">' + f(b) + ' ' + sat + '</span></div></div>' : '';
    }
    var awards = terbaik(function (x) { return x.hadir; }, 'Paling rajin', 'star', 'kali hadir') +
      terbaik(function (x) { return x.streak; }, 'Streak pekan terpanjang (saat ini)', 'flame', 'pekan') +
      terbaik(function (x) { return x.catatan; }, 'Paling rajin mencatat kontribusi', 'pencil', 'catatan');

    var info = '<div class="card"><h3 style="font-size:20px;margin-bottom:6px">Cara dapat poin</h3>' +
      '<div class="bd">' + ic('check') + '<div>Hadir: <b>+' + s.poin.hadir + '</b> per hari</div></div>' +
      '<div class="bd">' + ic('pencil') + '<div>Mengisi catatan kontribusi: <b>+' + s.poin.catatan + '</b></div></div>' +
      '<div class="bd">' + ic('flame') + '<div>Streak: hadir minimal sekali di pekan berturut-turut, bonus <b>+' + s.poin.streakBonus + '</b> × pekan ke-n (maks ' + s.poin.streakMaks + 'x)</div></div>' +
      '<p style="color:var(--muted);font-size:13px;margin:10px 0 0">Papan ini untuk saling mengapresiasi, bukan untuk menghukum yang berhalangan hadir.</p></div>';
    var lencana = '<div class="card" style="margin-top:18px"><h3 style="font-size:20px;margin-bottom:6px">Lencana</h3>' + U.LENCANA.map(function (l) {
      return '<div class="bd"><span class="lenc"><span>' + ic(l.ikon) + '</span></span><div><b>' + l.nama + '</b><br><small style="color:var(--muted)">' + l.ket + '</small></div></div>';
    }).join('') + '</div>';

    return pageHead('Papan Apresiasi', 'Terima kasih untuk semua yang sudah meramaikan ' + E(s.orgName) + '. Poin dan streak dihitung otomatis dari kehadiran.') +
      '<div class="wrap page-body"><div class="tabs" role="tablist" style="margin-bottom:16px">' + tabs + '</div>' +
      '<div class="cols"><div>' + pod + daftar + '</div><div>' +
      (awards ? '<div class="card" style="margin-bottom:18px"><h3 style="font-size:20px;margin-bottom:4px">Penghargaan · ' + P.label + '</h3>' + awards + '</div>' : '') + info + lencana + '</div></div></div>';
  }

  /* ---------- REKAP ---------- */
  function rekapRows() {
    var f = ui.rekap, today = U.todayStr();
    if (!f.dari) { f.dari = today.slice(0, 8) + '01'; f.sampai = today; }
    return S.checkins.filter(function (c) {
      return c.tanggal >= f.dari && c.tanggal <= f.sampai && (!f.member || c.memberId === f.member) &&
        (!f.kegiatan || (c.riwayat || []).some(function (r) { return r.a === f.kegiatan; }) || c.aktivitas === f.kegiatan);
    }).sort(function (a, b) { return a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : b.masuk - a.masuk; });
  }
  function ringkasAnggota(rows) {
    var per = {}, hariBerkumpul = {};
    rows.forEach(function (c) {
      hariBerkumpul[c.tanggal] = 1;
      var o = per[c.memberId] = per[c.memberId] || { nama: c.nama, hadir: 0, ms: 0, terakhir: '', akt: {} };
      o.hadir++; o.nama = c.nama; if (c.keluar) o.ms += c.keluar - c.masuk;
      if (c.tanggal > o.terakhir) o.terakhir = c.tanggal;
      (c.riwayat || [{ a: c.aktivitas }]).forEach(function (r) { if (r.a) o.akt[r.a] = (o.akt[r.a] || 0) + 1; });
    });
    var n = Object.keys(hariBerkumpul).length;
    return Object.keys(per).map(function (k) {
      var o = per[k], top = Object.keys(o.akt).sort(function (a, b) { return o.akt[b] - o.akt[a]; })[0] || '';
      return { id: k, nama: o.nama, hadir: o.hadir, ms: o.ms, terakhir: o.terakhir, pct: n ? Math.round(o.hadir / n * 100) : 0, top: top };
    }).sort(function (a, b) { return b.hadir - a.hadir || a.nama.localeCompare(b.nama); });
  }
  function rekap() {
    var f = ui.rekap, s = cfg(), today = U.todayStr();
    if (!f.dari) { f.dari = today.slice(0, 8) + '01'; f.sampai = today; }
    var rows = rekapRows(), ang = ringkasAnggota(rows);
    var hari = {}; rows.forEach(function (c) { (hari[c.tanggal] = hari[c.tanggal] || []).push(c); });
    var tglList = Object.keys(hari).sort().reverse();
    var kegiatanOpsi = s.kategori.slice();
    S.checkins.forEach(function (c) { (c.riwayat || []).forEach(function (r) { if (r.a && kegiatanOpsi.indexOf(r.a) < 0) kegiatanOpsi.push(r.a); }); });
    var admin = isAdmin();

    var filter = '<div class="card" style="margin-bottom:18px"><div class="filters">' +
      '<div class="fld"><label for="f-dari">Dari</label><input type="date" id="f-dari" data-k="rekap.dari" value="' + f.dari + '"></div>' +
      '<div class="fld"><label for="f-sampai">Sampai</label><input type="date" id="f-sampai" data-k="rekap.sampai" value="' + f.sampai + '"></div>' +
      '<div class="fld"><label for="f-m">Anggota</label><select id="f-m" data-k="rekap.member"><option value="">Semua anggota</option>' +
      S.members.map(function (m) { return '<option value="' + E(m.id) + '"' + (f.member === m.id ? ' selected' : '') + '>' + E(m.nama) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="f-k">Kegiatan</label><select id="f-k" data-k="rekap.kegiatan"><option value="">Semua kegiatan</option>' +
      kegiatanOpsi.map(function (k) { return '<option' + (f.kegiatan === k ? ' selected' : '') + ' value="' + E(k) + '">' + E(k) + '</option>'; }).join('') + '</select></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (admin
        ? '<button class="btn sm" data-act="ekspor-xlsx">' + ic('sheet') + ' Excel</button><button class="btn sm ghost" data-act="ekspor-csv">' + ic('dl') + ' CSV</button>'
        : '<a class="btn sm ghost" href="#/pengurus" title="Ekspor khusus pengurus">' + ic('shield') + ' Ekspor (pengurus)</a>') + '</div></div></div>';

    var tiles = '<div class="grid g4 keep2" style="margin-bottom:18px">' + stat(rows.length, 'Total kehadiran') + stat(ang.length, 'Anggota hadir') + stat(tglList.length, 'Hari berkumpul') +
      stat(tglList.length ? (rows.length / tglList.length).toFixed(1).replace('.', ',') : '0', 'Rata-rata per hari') + '</div>';

    var tabs = '<div class="tabs" role="tablist" style="margin-bottom:14px">' + [['tanggal', 'Per Tanggal'], ['anggota', 'Per Anggota'], ['tabel', 'Tabel Rinci']].map(function (t) {
      return '<button role="tab" data-act="rekap-tab" data-v="' + t[0] + '" aria-selected="' + (f.tab === t[0]) + '">' + t[1] + '</button>';
    }).join('') + '</div>';

    var isi = '';
    if (!rows.length) isi = '<div class="card">' + kosong('clip', 'Tidak ada data', 'Ubah rentang tanggal atau filter di atas.') + '</div>';
    else if (f.tab === 'tanggal') {
      isi = tglList.slice(0, 60).map(function (t) {
        return '<div class="day-card"><header><b>' + U.tglPanjang(t) + '</b><span class="tag g">' + hari[t].length + ' hadir</span></header><div class="body">' +
          hari[t].sort(function (a, b) { return a.masuk - b.masuk; }).map(function (c) {
            return '<div class="p">' + av(c.nama, 'sm', c.memberId) + '<span class="nm">' + E(c.nama) + '</span><span class="tag">' + E(aktivitasStr(c)) + '</span><small>' + U.jam(c.masuk) + (c.keluar ? '–' + U.jam(c.keluar) : '') + '</small>' +
              (c.catatan ? '<small style="flex-basis:100%;padding-left:44px">“' + E(c.catatan) + '”</small>' : '') + '</div>';
          }).join('') + '</div></div>';
      }).join('') + (tglList.length > 60 ? '<p class="empty">Menampilkan 60 tanggal terbaru dari ' + tglList.length + '. Persempit rentang tanggal untuk melihat yang lain.</p>' : '');
    } else if (f.tab === 'anggota') {
      isi = '<div class="tbl-w"><table class="t"><thead><tr><th>Nama</th><th class="n">Hadir</th><th class="n">% hari berkumpul</th><th class="n">Total jam</th><th>Kegiatan terbanyak</th><th>Terakhir</th></tr></thead><tbody>' +
        ang.map(function (a) {
          return '<tr><td><b>' + E(a.nama) + '</b></td><td class="n">' + a.hadir + '</td><td class="n">' + a.pct + '%</td><td class="n">' + (a.ms ? (a.ms / 3600e3).toFixed(1).replace('.', ',') : '—') + '</td><td>' + E(a.top) + '</td><td class="nowrap">' + U.tglPendek(a.terakhir) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    } else {
      var batas = 300;
      isi = '<div class="tbl-w"><table class="t"><thead><tr><th>Tanggal</th><th>Nama</th><th>Masuk</th><th>Pulang</th><th>Durasi</th><th>Kegiatan</th><th>Catatan</th><th>Via</th>' + (admin ? '<th></th>' : '') + '</tr></thead><tbody>' +
        rows.slice(0, batas).map(function (c) {
          return '<tr><td class="nowrap">' + U.tglPendek(c.tanggal) + '</td><td><b>' + E(c.nama) + '</b></td><td>' + U.jam(c.masuk) + '</td><td>' + (c.keluar ? U.jam(c.keluar) : '<span class="mut">—</span>') + '</td>' +
            '<td class="nowrap">' + (c.keluar ? U.durasi(c.keluar - c.masuk) : '<span class="mut">—</span>') + '</td><td>' + E(aktivitasStr(c)) + '</td><td>' + E(c.catatan || '') + '</td><td>' + (c.metode === 'qr' ? 'QR' : 'GPS') + '</td>' +
            (admin ? '<td><button class="btn sm danger" data-act="hapus-cek" data-id="' + E(c.id) + '" aria-label="Hapus catatan ' + E(c.nama) + '">' + ic('trash') + '</button></td>' : '') + '</tr>';
        }).join('') + '</tbody></table></div>' + (rows.length > batas ? '<p class="empty">Menampilkan ' + batas + ' dari ' + rows.length + ' baris. Ekspor untuk data lengkap.</p>' : '');
    }
    return pageHead('Rekap Kehadiran', 'Riwayat siapa saja yang hadir pada setiap tanggal. Data dimuat ' + (window.TK_CONFIG.defaults.riwayatHari) + ' hari terakhir.') +
      '<div class="wrap page-body">' + filter + tiles + tabs + isi + '</div>';
  }
  function barisEkspor() {
    return rekapRows().slice().sort(function (a, b) { return a.tanggal < b.tanggal ? -1 : a.tanggal > b.tanggal ? 1 : a.masuk - b.masuk; });
  }
  function ekspor(jenis) {
    var rows = barisEkspor(), f = ui.rekap, s = cfg();
    if (!rows.length) return toast('Tidak ada data untuk diekspor', true);
    var hariNama = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var judul = ['Tanggal', 'Hari', 'Nama', 'Masuk', 'Pulang', 'Durasi (menit)', 'Kegiatan', 'Catatan', 'Via', 'Jarak saat absen (m)'];
    var detail = [judul].concat(rows.map(function (c) {
      return [c.tanggal, hariNama[new Date(c.tanggal + 'T12:00:00').getDay()], c.nama, U.jam(c.masuk), c.keluar ? U.jam(c.keluar) : '',
        c.keluar ? Math.round((c.keluar - c.masuk) / 60000) : '', aktivitasStr(c), c.catatan || '', c.metode === 'qr' ? 'QR' : 'GPS', c.jarak == null ? '' : c.jarak];
    }));
    var nama = 'kehadiran_' + f.dari + '_sd_' + f.sampai;
    if (jenis === 'csv') { U.unduh(U.csv(detail), nama + '.csv'); return toast('CSV diunduh.'); }
    var stat = U.hitungStatistik(S.checkins, s, f.dari, f.sampai), pm = {};
    stat.forEach(function (x) { pm[x.memberId] = x; });
    var ang = [['Nama', 'Hadir (hari)', '% hari berkumpul', 'Total jam', 'Kegiatan terbanyak', 'Terakhir hadir', 'Poin periode ini', 'Streak (pekan)']].concat(
      ringkasAnggota(rows).map(function (a) {
        var p = pm[a.id] || {};
        return [a.nama, a.hadir, a.pct, Math.round(a.ms / 3600e3 * 10) / 10, a.top, a.terakhir, p.poin || 0, p.streak || 0];
      }));
    var hari = {}; rows.forEach(function (c) { (hari[c.tanggal] = hari[c.tanggal] || []).push(c.nama); });
    var tg = [['Tanggal', 'Jumlah hadir', 'Daftar nama']].concat(Object.keys(hari).sort().map(function (t) { return [t, hari[t].length, hari[t].join(', ')]; }));
    U.unduh(U.xlsx([
      { nama: 'Rekap Kehadiran', baris: detail, lebar: [12, 10, 24, 8, 8, 14, 34, 44, 7, 18] },
      { nama: 'Per Anggota', baris: ang, lebar: [24, 12, 18, 11, 26, 14, 16, 14] },
      { nama: 'Per Tanggal', baris: tg, lebar: [12, 13, 90] }
    ]), nama + '.xlsx');
    toast('Excel diunduh.');
  }

  /* ---------- PENGURUS ---------- */
  function urlQr() {
    return location.origin + location.pathname + '?qr=' + encodeURIComponent(cfg().qrToken || '');
  }
  function pengurus() {
    var s = cfg(), u = S.user;
    if (Store.mode === 'cloud' && !isAdmin()) {
      return pageHead('Pengurus', 'Masuk dengan akun Google pengurus untuk mengelola anggota, lokasi, dan ekspor data.') +
        '<div class="wrap page-body"><div class="card" style="max-width:520px;margin-inline:auto;text-align:center">' +
        ic('shield').replace('class="i"', 'class="i" style="width:44px;height:44px;color:var(--g600)"') +
        (u ? '<h2 style="margin:10px 0 6px">Menu ini khusus pengurus</h2><p style="color:var(--muted)">Kamu masuk sebagai <b>' + E(u.email) + '</b>. Email pengurus diatur di <code>config.js</code> dan <code>firestore.rules</code>.</p><a class="btn" href="#/">Kembali ke Beranda</a>'
          : '<h2 style="margin:10px 0 6px">Masuk sebagai pengurus</h2><p style="color:var(--muted)">Anggota biasa tidak perlu masuk. Cukup pilih nama di halaman Isi Kehadiran.</p><button class="btn" data-act="masuk-google">Masuk dengan Google</button>') +
        '</div></div>';
    }
    var aktif = S.members.filter(function (m) { return m.aktif !== false; }).length;
    var anchors = [['lokasi', 'Lokasi & radius'], ['anggota', 'Anggota'], ['kegiatan', 'Kegiatan'], ['qr', 'QR Code'], ['poin', 'Poin'], ['data', 'Data']]
      .map(function (a) { return '<a href="#/pengurus" data-act="gulir" data-v="' + a[0] + '">' + a[1] + '</a>'; }).join('');

    var lokasi = '<section class="card asec" id="a-lokasi"><h2>' + ic('pin') + ' Lokasi & radius</h2><p class="d">Titik pusat basecamp dan seberapa jauh anggota boleh berada saat mengisi kehadiran.</p>' +
      '<div class="fld"><label for="l-nama">Nama lokasi</label><input type="text" id="l-nama" value="' + E(s.lokasiNama) + '" maxlength="60"></div>' +
      '<div class="two"><div class="fld"><label for="l-lat">Lintang (latitude)</label><input type="number" step="any" id="l-lat" value="' + (s.lat == null ? '' : s.lat) + '" placeholder="-6.1754"></div>' +
      '<div class="fld"><label for="l-lng">Bujur (longitude)</label><input type="number" step="any" id="l-lng" value="' + (s.lng == null ? '' : s.lng) + '" placeholder="106.8272"></div></div>' +
      '<p style="margin:0 0 14px"><button class="btn sm soft" data-act="lokasi-saya">' + ic('locate') + ' Pakai lokasi saya sekarang</button> ' +
      (s.lat != null ? '<a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps?q=' + s.lat + ',' + s.lng + '">Lihat di Google Maps ↗</a>' : '') + '</p>' +
      '<div class="fld"><label for="l-r">Radius: <b id="l-rv">' + s.radius + ' m</b></label><input type="range" id="l-r" min="20" max="500" step="10" value="' + s.radius + '" data-out="#l-rv"><small>Saran 50–150 m. GPS HP biasanya akurat ±10–30 m di tempat terbuka, lebih buruk di dalam gedung.</small></div>' +
      '<button class="btn" data-act="simpan-lokasi">Simpan lokasi</button></section>';

    var anggota = '<section class="card asec" id="a-anggota"><h2>' + ic('users') + ' Anggota <span class="tag g">' + aktif + ' aktif</span></h2><p class="d">Anggota mendaftar sendiri lewat Google dan menentukan nama panggilannya. <b>Nonaktifkan</b> untuk menghentikan absen seseorang, <b>hapus</b> untuk mereset profilnya (ia bisa mendaftar ulang).</p>' +
            '<div style="margin-top:16px">' + (S.members.length ? S.members.map(function (m) {
        return '<div class="mrow' + (m.aktif === false ? ' off' : '') + '">' + av(m.nama, 'sm', m.id) + '<span class="nm">' + E(m.nama) + '</span>' +
          '<button class="btn sm ' + (m.aktif === false ? 'soft' : 'ghost') + '" data-act="anggota-toggle" data-id="' + E(m.id) + '">' + (m.aktif === false ? 'Aktifkan' : 'Nonaktifkan') + '</button>' +
          '<button class="btn sm danger" data-act="anggota-hapus" data-id="' + E(m.id) + '" aria-label="Hapus ' + E(m.nama) + '">' + ic('trash') + '</button></div>';
      }).join('') : '<p style="color:var(--muted)">Belum ada anggota.</p>') + '</div></section>';

    var kegiatan = '<section class="card asec" id="a-kegiatan"><h2>' + ic('clip') + ' Pilihan kegiatan</h2><p class="d">Daftar jawaban untuk “Lagi ngapain?”. Anggota juga bisa menulis kegiatan lain.</p><div id="katList">' +
      s.kategori.map(function (k) { return katRow(k); }).join('') + '</div><div style="display:flex;gap:8px;margin-top:6px"><button class="btn sm soft" data-act="kat-tambah">' + ic('plus') + ' Tambah</button><button class="btn sm" data-act="kat-simpan">Simpan pilihan</button></div></section>';

    var kunci = !!window.TK_CONFIG.configAdalahSumber;
    var infoKunci = function (id, ikon, judul, isi) {
      return '<section class="card asec" id="a-' + id + '"><h2>' + ic(ikon) + ' ' + judul + '</h2><div class="banner info" style="margin:12px 0 0">' + ic('info') + '<div>' + isi + '</div></div></section>';
    };
    if (kunci) {
      lokasi = infoKunci('lokasi', 'pin', 'Lokasi & radius', 'Diatur lewat <code>js/config.js</code>: <b>' + E(s.lokasiNama) + '</b>, radius <b>' + s.radius + ' m</b>, titik ' +
        (s.lat == null ? 'belum diisi' : '<a target="_blank" rel="noopener" href="https://www.google.com/maps?q=' + s.lat + ',' + s.lng + '">' + s.lat.toFixed(6) + ', ' + s.lng.toFixed(6) + ' ↗</a>') +
        '. Untuk mengubahnya, edit berkas itu lalu unggah ulang ke GitHub.');
      kegiatan = infoKunci('kegiatan', 'clip', 'Pilihan kegiatan', 'Diatur lewat <code>js/config.js</code>: ' + s.kategori.map(E).join(', ') + '.');
    }
    var qr = '<section class="card asec" id="a-qr"><h2>' + ic('qr') + ' QR Code lokasi</h2><p class="d">Cadangan bila GPS dalam ruangan kurang akurat. Cetak, tempel di basecamp; anggota memindai dengan kamera HP.</p>';
    if (!s.qrToken) qr += '<button class="btn" data-act="qr-buat">Aktifkan QR Code</button>';
    else {
      var svg = '';
      try { svg = TKQR.svg(urlQr(), { margin: 2, warna: '#0e4430' }); } catch (e) { svg = '<p>QR gagal dibuat</p>'; }
      qr += '<div class="qr-box"><div class="q">' + svg + '</div><div><label style="display:flex;gap:10px;align-items:center;font-weight:600;margin-bottom:12px"><input type="checkbox" id="qr-aktif" data-act="qr-aktif"' + (s.qrAktif ? ' checked' : '') + ' style="width:20px;height:20px;accent-color:var(--g600)"> QR Code diizinkan untuk absen</label>' +
        '<div class="code">' + E(urlQr()) + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sm" data-act="qr-cetak">' + ic('print') + ' Cetak</button>' +
        '<button class="btn sm ghost" data-act="qr-salin">' + ic('copy') + ' Salin tautan</button>' + (window.TK_CONFIG.defaults.qrToken ? '' : '<button class="btn sm danger" data-act="qr-baru">Buat QR baru</button>') + '</div>' +
        '<p style="font-size:13px;color:var(--muted);margin:12px 0 0">“Buat QR baru” membuat QR lama tidak berlaku (misalnya bila fotonya tersebar). QR bersifat statis dan tetap bisa difoto orang, jadi cocok untuk perkumpulan yang saling percaya.</p></div></div>';
    }
    qr += '</section>';

    var poin = '<section class="card asec" id="a-poin"><h2>' + ic('trophy') + ' Poin & pengaturan</h2><p class="d">Poin dihitung otomatis dari data kehadiran, jadi perubahan di sini langsung berlaku ke papan apresiasi.</p>' +
      '<div class="two"><div class="fld"><label for="p-h">Poin per hari hadir</label><input type="number" id="p-h" min="0" max="100" value="' + s.poin.hadir + '"></div>' +
      '<div class="fld"><label for="p-c">Bonus catatan kontribusi</label><input type="number" id="p-c" min="0" max="100" value="' + s.poin.catatan + '"></div>' +
      '<div class="fld"><label for="p-s">Bonus streak per pekan beruntun</label><input type="number" id="p-s" min="0" max="100" value="' + s.poin.streakBonus + '"></div>' +
      '<div class="fld"><label for="p-m">Maksimum pengali streak</label><input type="number" id="p-m" min="0" max="20" value="' + s.poin.streakMaks + '"></div></div>' +
      '<div class="fld"><label for="p-a">Otomatis dianggap pulang setelah (jam)</label><input type="number" id="p-a" min="1" max="24" value="' + s.autoPulangJam + '"><small>Yang lupa menekan “Pulang” akan hilang dari “Siapa di Sini” setelah sekian jam.</small></div>' +
      '<div class="fld"><label for="p-o">Nama organisasi</label><input type="text" id="p-o" value="' + E(s.orgName) + '" maxlength="60"></div>' +
      '<button class="btn" data-act="simpan-poin">Simpan</button></section>';

    var data = '<section class="card asec" id="a-data"><h2>' + ic('sheet') + ' Data & ekspor</h2><p class="d">Unduh rekap kehadiran. Rentang tanggal dan filter diatur di halaman Rekap.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="ekspor-xlsx">' + ic('sheet') + ' Unduh Excel (.xlsx)</button><button class="btn ghost" data-act="ekspor-csv">' + ic('dl') + ' Unduh CSV</button><a class="btn soft" href="#/rekap">Buka Rekap</a></div>' +
      '<p style="font-size:13px;color:var(--muted);margin:12px 0 0">Ekspor mengikuti filter terakhir di halaman Rekap (bawaan: bulan ini). Total ' + S.checkins.length + ' catatan dimuat.</p>' +
      (Store.mode === 'demo' ? '<hr style="border:0;border-top:1px dashed var(--line);margin:16px 0"><p style="margin:0 0 10px"><b>Mode demo:</b> data contoh tersimpan di browser ini saja.</p><button class="btn danger sm" data-act="demo-reset">Kembalikan data contoh</button>'
        : '<hr style="border:0;border-top:1px dashed var(--line);margin:16px 0"><p style="margin:0;font-size:13px;color:var(--muted)">Masuk sebagai <b>' + E(u && u.email) + '</b> · <a href="#/pengurus" data-act="admin-keluar">Keluar</a></p>') + '</section>';

    return pageHead('Pengurus', 'Atur lokasi, anggota, kegiatan, QR Code, dan unduh rekap kehadiran.') +
      '<div class="wrap page-body"><div class="anchors">' + anchors + '</div>' +
      (Store.mode === 'demo' ? '<div class="banner warn">' + ic('alert') + '<div><b>Mode demo.</b> Menu ini terbuka tanpa login karena data hanya di perangkat ini. Setelah Firebase aktif, hanya akun Google pengurus yang bisa masuk.</div></div>' : '') +
      lokasi + anggota + kegiatan + qr + poin + data + '</div>';
  }
  function katRow(v) {
    return '<div class="kat"><input type="text" maxlength="40" value="' + E(v) + '" aria-label="Nama kegiatan"><button class="btn sm danger" data-act="kat-hapus" aria-label="Hapus">' + ic('x') + '</button></div>';
  }
  async function aksiAdmin(fn, ok) {
    try { await fn(); if (ok) toast(ok); } catch (e) { toast('Gagal: ' + (e.code || e.message || e), true); }
    render();
  }

  /* ---------- MASUK, PROFIL, MENU PENGGUNA ---------- */
  var gateKey = '', usrSig = '';
  var G_LOGO = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  function loginHTML() {
    var s = cfg(), demo = Store.mode === 'demo';
    return '<div class="gate-card" role="dialog" aria-modal="true" aria-labelledby="gt"><img class="gate-logo" src="assets/logo.png" alt="" width="72" height="72">' +
      '<h2 id="gt">Masuk dulu, yuk</h2><p>Masuk dengan akun Google untuk mengisi kehadiran di <b>' + E(s.orgName) + '</b>. Kamu akan menentukan nama panggilanmu sendiri, dan foto profil Google jadi ikonmu.</p>' +
      '<button class="btn lg block gbtn" data-act="masuk-google">' + G_LOGO + (demo ? ' Masuk (simulasi Google)' : ' Masuk dengan Google') + '</button>' +
      '</div>';
  }
  function profilHTML(edit) {
    var u = S.user, m = S.profil, s = cfg();
    var nama = m ? m.nama : (u.name || '').split(' ')[0].slice(0, 30);
    return '<div class="gate-card" role="dialog" aria-modal="true" aria-labelledby="gt"><div class="gate-av">' + av(nama || '?', '', u.uid, u.foto) + '</div>' +
      '<h2 id="gt">' + (edit ? 'Ubah nama panggilan' : 'Siapa namamu di sini?') + '</h2>' +
      '<p>' + (edit ? '' : 'Halo' + (u.name ? ', ' + E(u.name.split(' ')[0]) : '') + '! ') + 'Nama panggilan ini tampil di Siapa di Sini, papan apresiasi, dan rekap.</p>' +
      '<div class="fld" style="text-align:left"><label for="pf-nama">Nama panggilan</label><input type="text" id="pf-nama" maxlength="30" value="' + E(nama) + '" autocomplete="nickname"></div>' +
      '<p class="galat" id="pf-err" role="alert"></p>' +
      '<div class="two" style="margin-top:6px">' + (edit ? '<button class="btn ghost" data-act="batal-profil">Batal</button>' : '<button class="btn ghost" data-act="keluar">Keluar</button>') +
      '<button class="btn" data-act="simpan-profil">' + (edit ? 'Simpan' : 'Simpan & lanjut') + '</button></div></div>';
  }
  function renderGate() {
    var g = $('#gate'), u = S.user, key = '';
    if (S.authReady && !u) key = 'login';
    else if (u && S.membersLoaded && !S.profil) key = 'baru';
    else if (u && S.profil && ui.editProfil) key = 'edit';
    if (key === gateKey) return;
    gateKey = key;
    g.hidden = !key; document.body.classList.toggle('gated', !!key);
    $('#view').setAttribute('aria-hidden', key ? 'true' : 'false');
    g.innerHTML = key === 'login' ? loginHTML() : key ? profilHTML(key === 'edit') : '';
    if (key) setTimeout(function () { var f = g.querySelector('input[type=text],button'); if (f) f.focus(); }, 60);
  }
  async function simpanProfil() {
    var err = $('#pf-err'), baru = !S.profil, nama = ($('#pf-nama').value || '').trim().replace(/\s+/g, ' ');
    if (nama.length < 2 || nama.length > 30) { err.textContent = 'Nama panggilan 2–30 karakter.'; return; }
    if (S.members.some(function (m) { return m.id !== S.user.uid && m.nama.toLowerCase() === nama.toLowerCase(); })) {
      err.textContent = 'Nama itu sudah dipakai anggota lain. Tambahkan inisial atau nama belakang.'; return;
    }
    try {
      await Store.saveProfil(nama);
      ui.editProfil = false; toast(baru ? 'Selamat datang, ' + nama + '!' : 'Nama diperbarui.'); render();
    } catch (e) { err.textContent = 'Gagal menyimpan: ' + (e.code || e.message || e); }
  }
  function setMenu(on) {
    ui.menu = on;
    var m = $('#umenu'), b = $('#usr .chip-u');
    if (m) m.hidden = !on;
    if (b) b.setAttribute('aria-expanded', String(on));
  }
  function chipUser(paksa) {
    var u = S.user, m = S.profil, el = $('#usr');
    var sig = [u && u.uid, m && m.nama, u && u.foto, isAdmin()].join('|');
    if (sig === usrSig && !paksa) return;
    usrSig = sig;
    if (!u) { el.innerHTML = ''; ui.menu = false; return; }
    var nama = m ? m.nama : (u.name || '');
    el.innerHTML = '<button class="chip-u" data-act="menu-user" aria-haspopup="true" aria-expanded="' + ui.menu + '" aria-label="Menu akun">' + av(nama, 'sm', u.uid, u.foto) +
      '<span class="un">' + E(nama.split(' ')[0]) + '</span></button>' +
      '<div class="umenu" id="umenu"' + (ui.menu ? '' : ' hidden') + '><div class="uh"><b>' + E(nama) + '</b><small>' + E(u.email || '') + '</small></div>' +
      '<button data-act="ubah-profil">' + ic('pencil') + ' Ubah nama panggilan</button>' +
      (isAdmin() ? '<a href="#/pengurus">' + ic('shield') + ' Pengurus</a>' : '') +
      '<button data-act="keluar">' + ic('out') + ' Keluar</button></div>';
  }

  /* ---------- router & render ---------- */
  var RUTE = {
    '': ['Beranda', home], beranda: ['Beranda', home], hadir: ['Isi Kehadiran', hadir], siapa: ['Siapa di Sini', siapa],
    apresiasi: ['Apresiasi', apresiasi], rekap: ['Rekap', rekap], pengurus: ['Pengurus', pengurus]
  };
  var MENU = [['', 'Beranda', 'home'], ['hadir', 'Isi Kehadiran', 'checkc'], ['siapa', 'Siapa di Sini', 'users'], ['apresiasi', 'Apresiasi', 'trophy'], ['rekap', 'Rekap', 'clip'], ['pengurus', 'Pengurus', 'shield']];
  function rutaSaatIni() {
    var h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return RUTE[h] ? (h === 'beranda' ? '' : h) : '';
  }
  function pasangKerangka() {
    var s = cfg(), kata = s.orgName.split(' ');
    $('#brandName').innerHTML = kata.length > 1 ? E(kata[0]) + '<br>' + E(kata.slice(1).join(' ')) : E(s.orgName);
    $('#ftrBrand').innerHTML = ic('home') + ' ' + E(s.appName);
    $('#ftrCopy').textContent = '© ' + new Date().getFullYear() + ' ' + s.orgName;
    $('#ftrAdmin').innerHTML = ic('shield') + ' Pengurus';
    $('#ftrAdmin').hidden = !isAdmin();
    $('#ftrMode').innerHTML = Store.mode === 'demo' ? '<span class="pill gold">Mode demo</span>' :
      '<span class="pill ' + (S.error ? 'bad' : 'ok') + '">' + (S.error ? 'Terputus' : 'Terhubung') + '</span>';
    var r = rutaSaatIni();
    $('#nav').innerHTML = MENU.filter(function (m) { return m[0] !== 'hadir' && (m[0] !== 'pengurus' || isAdmin()); }).map(function (m) {
      return '<a href="#/' + m[0] + '"' + (m[0] === r ? ' aria-current="page"' : '') + '>' + m[1] + '</a>';
    }).join('');
    var tb = [['', 'Beranda', 'home'], ['siapa', 'Siapa', 'users'], ['hadir', 'Hadir', 'check'], ['apresiasi', 'Apresiasi', 'trophy'], ['rekap', 'Rekap', 'clip']];
    $('#tabbar').innerHTML = tb.map(function (m) {
      var cur = m[0] === r ? ' aria-current="page"' : '';
      return m[0] === 'hadir' ? '<a class="mid" href="#/hadir"' + cur + '><span class="c">' + ic('check') + '</span>Hadir</a>'
        : '<a href="#/' + m[0] + '"' + cur + '>' + ic(m[2]) + m[1] + '</a>';
    }).join('');
    document.title = RUTE[r][0] + ' · ' + s.appName + ' ' + s.orgName;
    banner(); chipUser(); renderGate();
  }
  function banner() {
    var el = $('#sys'), e = S.error, pesan = '', bad = false;
    if (Store.mode === 'demo') pesan = '<b>Mode demo</b> — data hanya tersimpan di perangkat ini. Sambungkan Firebase lewat <code>js/config.js</code> agar dipakai bersama (lihat PANDUAN.md).';
    else if (e) {
      bad = true;
      var map = {
        'config-kosong': 'Konfigurasi Firebase di <b>js/config.js</b> masih kosong.',
        'sdk-gagal': 'Tidak bisa memuat Firebase. Periksa koneksi internet lalu muat ulang.',
        'permission-denied': 'Akses database ditolak. Pasang <b>firestore.rules</b> terbaru di Firebase Console (dan pastikan sudah masuk dengan Google).',
        'auth/operation-not-allowed': 'Aktifkan metode masuk <b>Google</b> di Firebase Console → Authentication → Sign-in method.',
        'auth/unauthorized-domain': 'Tambahkan alamat situs ini di Firebase → Authentication → Authorized domains.'
      };
      pesan = map[e] || ('Kesalahan: ' + E(e));
    } else if (!navigator.onLine) pesan = '<b>Offline</b> — perubahan akan dikirim saat internet tersambung kembali.';
    el.hidden = !pesan; el.className = 'sys' + (bad ? ' bad' : ''); el.innerHTML = pesan;
  }
  function render(naikLagi) {
    var r = rutaSaatIni();
    if (naikLagi) window.scrollTo(0, 0);
    rute = r; tertunda = false;
    pasangKerangka();
    var v = $('#view');
    v.innerHTML = (!S.ready && r !== 'pengurus') ? memuat() : RUTE[r][1]();
  }
  function jadwalkanRender() {
    var a = document.activeElement, r = rutaSaatIni();
    if (r === 'pengurus') { pasangKerangka(); return; }   // jangan hapus isian yang belum disimpan
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && $('#view').contains(a)) { tertunda = true; pasangKerangka(); return; }
    render();
  }
  function paintLive() {
    $$('[data-live="gps"]').forEach(function (el) { el.innerHTML = panelGps(); });
    $$('[data-live="cta"]').forEach(function (el) {
      el.innerHTML = ctaHero() + '<a class="btn ghost light" href="#/siapa">' + ic('users') + ' Siapa di sini (' + sedangHadir().length + ')</a>';
    });
    $$('[data-live="submit"]').forEach(function (el) { el.innerHTML = tombolKirim(); });
  }

  /* ---------- event ---------- */
  document.addEventListener('click', function (ev) {
    if (ui.menu && !ev.target.closest('#usr')) setMenu(false);
    var el = ev.target.closest('[data-act]');
    if (!el) return;
    var a = el.dataset.act, v = el.dataset.v, id = el.dataset.id, d = ui.draft, s = cfg();
    if (ui.menu && a !== 'menu-user') setMenu(false);
    switch (a) {
      case 'geo-start': geoMulai(); break;
      case 'sim': Geo.sim = v; lsSet('tk_sim', v); if (v === 'off') { Geo.state = 'idle'; geoMulai(); } else { Geo.state = 'ok'; paintLive(); } break;
      case 'masuk-google': Store.signIn().catch(function (e) { toast('Gagal masuk: ' + (e.code || e.message), true); }); break;
      case 'keluar': setMenu(false); Promise.resolve(Store.signOut()).then(function () { d._init = false; ui.editProfil = false; render(); }); break;
      case 'ubah-profil': setMenu(false); ui.editProfil = true; renderGate(); break;
      case 'batal-profil': ui.editProfil = false; renderGate(); break;
      case 'simpan-profil': simpanProfil(); break;
      case 'menu-user': setMenu(!ui.menu); break;
      case 'pilih-kegiatan': d.aktivitas = v; render(); if (v === '__lain') { var l = $('#lain'); if (l) l.focus(); } break;
      case 'absen': simpanAbsen('absen'); break;
      case 'update': simpanAbsen('update'); break;
      case 'pulang': simpanAbsen('pulang'); break;
      case 'periode': ui.periode = v; render(); break;
      case 'rekap-tab': ui.rekap.tab = v; render(); break;
      case 'ajak': ajak(); break;
      case 'ekspor-xlsx': ekspor('xlsx'); break;
      case 'ekspor-csv': ekspor('csv'); break;
      case 'hapus-cek': if (confirm('Hapus catatan kehadiran ini? Tindakan ini tidak bisa dibatalkan.')) aksiAdmin(function () { return Store.deleteCheckin(id); }, 'Catatan dihapus.'); break;
      case 'gulir': ev.preventDefault(); { var t = $('#a-' + v); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } break;
      case 'admin-keluar': ev.preventDefault(); Store.signOut().then(function () { render(); }); break;
      case 'lokasi-saya':
        if (!navigator.geolocation) return toast('Browser tidak mendukung GPS', true);
        toast('Mengambil lokasi…');
        navigator.geolocation.getCurrentPosition(function (p) {
          $('#l-lat').value = p.coords.latitude.toFixed(6); $('#l-lng').value = p.coords.longitude.toFixed(6);
          toast('Lokasi terisi (akurasi ±' + Math.round(p.coords.accuracy) + ' m). Jangan lupa Simpan.');
        }, function () { toast('Lokasi tidak bisa dibaca. Cek izin lokasi.', true); }, { enableHighAccuracy: true, timeout: 20000 });
        break;
      case 'simpan-lokasi': {
        var lat = parseFloat($('#l-lat').value), lng = parseFloat($('#l-lng').value);
        if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return toast('Isi lintang & bujur yang valid', true);
        aksiAdmin(function () { return Store.saveSettings({ lokasiNama: $('#l-nama').value.trim() || 'Basecamp', lat: lat, lng: lng, radius: parseInt($('#l-r').value, 10) }); }, 'Lokasi disimpan.');
        break;
      }
      case 'anggota-toggle': { var mm = memberById(id); aksiAdmin(function () { return Store.updateMember(id, { aktif: mm.aktif === false }); }); break; }
      case 'anggota-hapus': { var m2 = memberById(id); if (confirm('Hapus ' + m2.nama + ' dari daftar? Riwayat kehadirannya tetap tersimpan.')) aksiAdmin(function () { return Store.deleteMember(id); }, 'Anggota dihapus.'); break; }
      case 'kat-tambah': { var w = document.createElement('div'); w.innerHTML = katRow(''); $('#katList').appendChild(w.firstChild); $$('#katList input').pop().focus(); break; }
      case 'kat-hapus': el.closest('.kat').remove(); break;
      case 'kat-simpan': {
        var list = $$('#katList input').map(function (i) { return i.value.trim(); }).filter(function (x, i, arr) { return x && arr.indexOf(x) === i; });
        if (!list.length) return toast('Minimal satu pilihan kegiatan', true);
        aksiAdmin(function () { return Store.saveSettings({ kategori: list }); }, 'Pilihan kegiatan disimpan.');
        break;
      }
      case 'qr-buat': case 'qr-baru':
        if (a === 'qr-baru' && !confirm('Buat QR baru? QR lama (yang sudah dicetak) tidak akan berlaku lagi.')) break;
        aksiAdmin(function () { return Store.saveSettings({ qrToken: U.acak(8), qrAktif: true }); }, 'QR Code baru dibuat.'); break;
      case 'qr-aktif': aksiAdmin(function () { return Store.saveSettings({ qrAktif: $('#qr-aktif').checked }); }, $('#qr-aktif').checked ? 'QR diaktifkan.' : 'QR dinonaktifkan.'); break;
      case 'qr-salin':
        if (navigator.clipboard) navigator.clipboard.writeText(urlQr()).then(function () { toast('Tautan disalin.'); }, function () { toast('Gagal menyalin', true); });
        break;
      case 'qr-cetak': {
        var svg = TKQR.svg(urlQr(), { margin: 2 });
        $('#qrPrint').innerHTML = '<img src="assets/logo.png" alt=""><h1>' + E(s.appName) + '</h1><p><b>' + E(s.orgName) + '</b> · ' + E(s.lokasiNama) + '</p>' + svg + '<p>Scan dengan kamera HP untuk mengisi tanda kehadiran.</p><small>' + E(urlQr()) + '</small>';
        setTimeout(function () { window.print(); }, 60);
        break;
      }
      case 'simpan-poin': {
        var n = function (sel, mn, mx) { return Math.max(mn, Math.min(mx, parseInt($(sel).value, 10) || 0)); };
        aksiAdmin(function () {
          return Store.saveSettings({
            poin: { hadir: n('#p-h', 0, 100), catatan: n('#p-c', 0, 100), streakBonus: n('#p-s', 0, 100), streakMaks: n('#p-m', 0, 20) },
            autoPulangJam: n('#p-a', 1, 24) || 8, orgName: $('#p-o').value.trim() || s.orgName
          });
        }, 'Pengaturan disimpan.');
        break;
      }
      case 'demo-reset': if (confirm('Kembalikan semua data demo ke contoh awal?')) Store.reset().then(function () { toast('Data contoh dikembalikan.'); render(); }); break;
    }
  });

  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.dataset.out) { $(el.dataset.out).textContent = el.value + ' m'; }
    var k = el.dataset.k;
    if (!k) return;
    var p = k.split('.'), o = p.length > 1 ? ui[p[0]] : ui.draft, key = p.length > 1 ? p[1] : p[0];
    o[key] = el.value;
    if (k === 'lain') { paintLive(); }
  });
  document.addEventListener('change', function (ev) {
    var k = ev.target.dataset.k;
    if (k && k.indexOf('rekap.') === 0) render();
  });
  document.addEventListener('focusout', function () {
    setTimeout(function () {
      var a = document.activeElement;
      if (tertunda && !(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) render();
    }, 200);
  });
  window.addEventListener('hashchange', function () { render(true); });
  window.addEventListener('afterprint', function () { $('#qrPrint').innerHTML = ''; });
  window.addEventListener('online', banner); window.addEventListener('offline', banner);

  /* ---------- mulai ---------- */
  (function bacaQr() {
    var u = new URL(location.href), q = u.searchParams.get('qr');
    if (!q) return;
    lsSet('tk_qr', JSON.stringify({ t: q, ts: Date.now() }), sessionStorage);
    u.searchParams.delete('qr');
    history.replaceState(null, '', u.pathname + (u.search || '') + '#/hadir');
  })();

  ['settings', 'members', 'checkins', 'auth'].forEach(function (ev) { Store.on(ev, jadwalkanRender); });
  // Foto yang gagal dimuat dibuang (inisial tetap terlihat).
  document.addEventListener('error', function (e) { var t = e.target; if (t && t.tagName === 'IMG' && t.dataset.fb) t.remove(); }, true);

  Store.on('error', function () { pasangKerangka(); if (!S.ready) { S.ready = true; } jadwalkanRender(); });
  var qrDicek = false;
  Store.on('settings', function () {
    if (qrDicek || !S.settingsLoaded) return; qrDicek = true;
    var o = null; try { o = JSON.parse(lsGet('tk_qr', sessionStorage)); } catch (e) { o = null; }
    if (o && !qrSah()) toast('QR Code ini sudah tidak berlaku. Minta pengurus untuk QR terbaru.', true);
  });

  render();
  Store.init().then(function () {
    render();
    // mulai GPS otomatis hanya bila izin sudah pernah diberikan; selain itu tunggu tombol (tidak mengagetkan)
    if (Geo.sim !== 'off') { Geo.state = 'ok'; paintLive(); }
    else if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (r) { if (r.state === 'granted') geoMulai(); }).catch(function () {});
    }
  });
  setInterval(function () { var r = rutaSaatIni(); if (r === '' || r === 'siapa' || r === 'hadir') jadwalkanRender(); }, 60000);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
