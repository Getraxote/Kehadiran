/* Lapisan data. Dua "mesin" dengan antarmuka sama:
     - demo  : localStorage di perangkat ini (config.js -> enabled: false)
     - cloud : Firebase Firestore + Authentication (config.js -> enabled: true)
   UI hanya bicara dengan window.TKStore, jadi tidak peduli mesin mana yang dipakai.

   Model data:
     members/{uid}   profil anggota (nama panggilan, foto Google). Dibuat sendiri oleh anggota.
     checkins/{tgl_uid}  satu catatan per anggota per hari.
 */
window.TKStore = (function () {
  'use strict';
  var CFG = window.TK_CONFIG, D = CFG.defaults, U = window.TKU;
  var SDK = '10.14.1', BASE = 'https://www.gstatic.com/firebasejs/' + SDK + '/';

  var S = {
    mode: CFG.enabled ? 'cloud' : 'demo',
    ready: false, authReady: false, membersLoaded: false,
    settings: null, settingsLoaded: false,
    members: [], checkins: [], user: null, profil: null, error: null, fromCache: false
  };
  var handlers = {};
  function on(ev, cb) { (handlers[ev] = handlers[ev] || []).push(cb); }
  function emit(ev) { (handlers[ev] || []).forEach(function (cb) { try { cb(); } catch (e) { console.error(e); } }); }

  function gabung(raw) {
    var s = Object.assign({}, D, raw || {});
    s.poin = Object.assign({}, D.poin, (raw && raw.poin) || {});
    if (!Array.isArray(s.kategori) || !s.kategori.length) s.kategori = D.kategori.slice();
    if (CFG.configAdalahSumber) {   // nilai di js/config.js menang atas apa pun yang tersimpan di database
      ['lokasiNama', 'lat', 'lng', 'radius'].forEach(function (k) { if (D[k] != null) s[k] = D[k]; });
      if (D.kategori && D.kategori.length) s.kategori = D.kategori.slice();
      if (D.qrToken) s.qrToken = D.qrToken;
    }
    return s;
  }
  S.settings = gabung({});
  function urutNama(a, b) { return String(a.nama).localeCompare(String(b.nama), 'id'); }
  function hitungProfil() {
    S.profil = S.user ? (S.members.filter(function (m) { return m.id === S.user.uid; })[0] || null) : null;
  }
  function isAdminEmail(e) {
    e = String(e || '').toLowerCase();
    return (CFG.adminEmails || []).map(function (x) { return String(x).toLowerCase(); }).indexOf(e) !== -1;
  }

  /* =================== MESIN DEMO =================== */
  var demo = (function () {
    var KEY = 'tk_demo_v2', UKEY = 'tk_demo_user', raw = null;

    function rng(seed) {   // mulberry32: acak yang bisa diulang
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function hash(str) {
      var h = 2166136261;
      for (var i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
      return (h >>> 0) / 4294967296;
    }

    function seed() {
      var r = rng(20261118), now = Date.now(), today = U.todayStr();
      var nama = ['Ahmad Fauzi', 'Siti Aisyah', 'Muhammad Rizky', 'Nur Hidayah', 'Budi Santoso', 'Dewi Lestari',
        'Hasan Basri', 'Fatimah Zahra', 'Yusuf Ibrahim', 'Rina Marlina', 'Andi Pratama', 'Maya Sari'];
      var bobot = [.62, .55, .4, .5, .3, .45, .25, .35, .2, .3, .15, .22];
      var kegiatan = D.kategori.concat(['Piket / bersih-bersih']);
      var catatan = ['Menyusun jadwal kegiatan bulan depan', 'Membantu persiapan acara santunan', 'Diskusi program beasiswa',
        'Merapikan inventaris perlengkapan', 'Menyiapkan proposal donatur', 'Rapat koordinasi pengurus', 'Membuat desain spanduk'];
      var members = nama.map(function (n, i) { return { id: 'demo' + (i + 1), nama: n, foto: '', aktif: true, dibuat: now - 9e9 }; });
      var checkins = {};
      for (var off = 60; off >= 1; off--) {
        var tgl = U.addDays(today, -off);
        var dow = new Date(tgl + 'T12:00:00').getDay();
        members.forEach(function (m, i) {
          var p = bobot[i] * (dow === 0 || dow === 6 ? 1.1 : 0.75);
          if (r() > p * 0.9) return;
          var jamMasuk = 8 + Math.floor(r() * 10), mnt = Math.floor(r() * 60);
          var d = new Date(tgl + 'T00:00:00'); d.setHours(jamMasuk, mnt);
          var masuk = d.getTime(), keluar = masuk + (60 + Math.floor(r() * 240)) * 60000;
          var a = kegiatan[Math.floor(r() * kegiatan.length)];
          var id = tgl + '_' + m.id;
          checkins[id] = {
            id: id, tanggal: tgl, memberId: m.id, nama: m.nama, aktivitas: a,
            catatan: r() < 0.4 ? catatan[Math.floor(r() * catatan.length)] : '',
            masuk: masuk, keluar: keluar, metode: r() < 0.12 ? 'qr' : 'gps', jarak: Math.floor(r() * 70),
            riwayat: [{ a: a, t: masuk }]
          };
        });
      }
      // hari ini: beberapa orang sedang di lokasi
      [[0, 'Rapat', 150, 'Rapat koordinasi pengurus'], [1, 'Persiapan Acara', 95, 'Menyiapkan acara santunan'],
        [3, 'Nongkrong / Diskusi', 40, ''], [5, 'Eksekusi Proyek', 25, 'Membuat desain spanduk']].forEach(function (h) {
        var m = members[h[0]], masuk = now - h[2] * 60000;
        if (U.todayStr(new Date(masuk)) !== today) masuk = now - 60000;
        var id = today + '_' + m.id;
        checkins[id] = { id: id, tanggal: today, memberId: m.id, nama: m.nama, aktivitas: h[1], catatan: h[3],
          masuk: masuk, keluar: null, metode: 'gps', jarak: 12 + h[0] * 7, riwayat: [{ a: h[1], t: masuk }] };
      });
      return {
        settings: { lokasiNama: 'Basecamp', lat: -6.175392, lng: 106.827153, radius: 150, qrToken: U.acak(8), qrAktif: true },
        members: members, checkins: checkins
      };
    }

    function muatUser() { try { return JSON.parse(localStorage.getItem(UKEY)); } catch (e) { return null; } }
    function load() {
      try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { raw = null; }
      if (!raw || !raw.members) { raw = seed(); save(); }
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(raw)); } catch (e) { console.warn(e); } }
    function publish() {
      S.settings = gabung(raw.settings);
      S.settingsLoaded = true;
      S.members = raw.members.slice().sort(urutNama);
      S.checkins = Object.keys(raw.checkins).map(function (k) { return raw.checkins[k]; });
      hitungProfil();
      emit('settings'); emit('members'); emit('checkins');
    }
    function init() {
      load();
      S.user = muatUser();
      S.authReady = true; S.membersLoaded = true; S.ready = true;
      publish(); emit('auth');
      window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); publish(); } });
      return Promise.resolve();
    }
    function mutate(fn) { fn(raw); save(); publish(); return Promise.resolve(); }

    return {
      init: init,
      createCheckin: function (rec) { return mutate(function (r) { r.checkins[rec.id] = rec; }); },
      updateCheckin: function (id, patch) { return mutate(function (r) { Object.assign(r.checkins[id], patch); }); },
      deleteCheckin: function (id) { return mutate(function (r) { delete r.checkins[id]; }); },
      saveSettings: function (patch) { return mutate(function (r) { r.settings = Object.assign({}, r.settings, patch); }); },
      saveProfil: function (nama) {
        return mutate(function (r) {
          var m = r.members.filter(function (x) { return x.id === S.user.uid; })[0];
          if (m) m.nama = nama;
          else r.members.push({ id: S.user.uid, nama: nama, foto: S.user.foto || '', aktif: true, dibuat: Date.now() });
        });
      },
      updateMember: function (id, patch) {
        return mutate(function (r) { r.members.forEach(function (m) { if (m.id === id) Object.assign(m, patch); }); });
      },
      deleteMember: function (id) { return mutate(function (r) { r.members = r.members.filter(function (m) { return m.id !== id; }); }); },
      signIn: function () {
        S.user = { uid: 'demo-me', name: 'Pengguna Demo', email: 'demo@contoh.id', foto: '', isAdmin: true };
        try { localStorage.setItem(UKEY, JSON.stringify(S.user)); } catch (e) { /* abaikan */ }
        publish(); emit('auth'); return Promise.resolve();
      },
      signOut: function () {
        try { localStorage.removeItem(UKEY); } catch (e) { /* abaikan */ }
        S.user = null; publish(); emit('auth'); return Promise.resolve();
      },
      reset: function () {
        localStorage.removeItem(KEY); localStorage.removeItem(UKEY);
        S.user = null; load(); publish(); emit('auth'); return Promise.resolve();
      }
    };
  })();

  /* =================== MESIN CLOUD (Firebase) =================== */
  var cloud = (function () {
    var A, Au, F, app, auth, db, unsubs = [], readyTimer = null;

    function galat(e) {
      var kode = (e && (e.code || e.message)) || String(e);
      S.error = kode;
      console.error('[Firebase]', e);
      emit('error');
    }
    function tunggu(p, ms) {   // saat offline, tulis ke antrean lokal dan janji baru selesai bila online
      return Promise.race([p, new Promise(function (res) { setTimeout(function () { res('antre'); }, ms || 6000); })]);
    }

    function pasang() {
      if (unsubs.length) return;
      unsubs.push(F.onSnapshot(F.doc(db, 'settings', 'main'), function (snap) {
        S.settings = gabung(snap.exists() ? snap.data() : {});
        S.settingsLoaded = true; emit('settings');
      }, galat));
      unsubs.push(F.onSnapshot(F.collection(db, 'members'), function (snap) {
        S.members = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }).sort(urutNama);
        S.membersLoaded = true; hitungProfil(); emit('members');
      }, galat));
      var sejak = U.addDays(U.todayStr(), -(D.riwayatHari || 180));
      unsubs.push(F.onSnapshot(F.query(F.collection(db, 'checkins'), F.where('tanggal', '>=', sejak)), function (snap) {
        S.checkins = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        S.fromCache = snap.metadata.fromCache;
        S.ready = true; S.error = null; emit('checkins');
      }, galat));
      readyTimer = setTimeout(function () { if (!S.ready) { S.ready = true; emit('checkins'); } }, 7000);
    }
    function lepas() {
      unsubs.forEach(function (f) { try { f(); } catch (e) { /* abaikan */ } });
      unsubs = []; clearTimeout(readyTimer);
      S.members = []; S.checkins = []; S.profil = null; S.membersLoaded = false; S.settingsLoaded = false;
    }

    async function init() {
      var fb = CFG.firebase || {};
      if (!fb.apiKey || !fb.projectId) { S.error = 'config-kosong'; S.ready = true; emit('error'); return; }
      try {
        var mods = await Promise.all([
          import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js')
        ]);
        A = mods[0]; Au = mods[1]; F = mods[2];
        app = A.initializeApp(fb);
        auth = Au.getAuth(app);
        try {
          db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
        } catch (e) { db = F.getFirestore(app); }
      } catch (e) { S.error = 'sdk-gagal'; S.ready = true; emit('error'); return; }

      Au.onAuthStateChanged(auth, function (u) {
        S.authReady = true;
        if (!u) {
          lepas(); S.user = null; S.ready = true; emit('auth'); emit('members');
          return;
        }
        S.user = { uid: u.uid, name: u.displayName || u.email, email: (u.email || '').toLowerCase(), foto: u.photoURL || '', isAdmin: isAdminEmail(u.email) };
        hitungProfil(); emit('auth'); pasang();
      });
      window.addEventListener('online', function () { emit('checkins'); });
      window.addEventListener('offline', function () { emit('checkins'); });
    }

    var ref = function (col, id) { return F.doc(db, col, id); };
    return {
      init: init,
      createCheckin: function (rec) {
        var data = Object.assign({}, rec); delete data.id;   // id hanya nama dokumen, bukan isi (aturan menolak field di luar daftar)
        return tunggu(F.setDoc(ref('checkins', rec.id), data));
      },
      updateCheckin: function (id, patch) { return tunggu(F.updateDoc(ref('checkins', id), patch)); },
      deleteCheckin: function (id) { return F.deleteDoc(ref('checkins', id)); },
      saveSettings: function (patch) { return F.setDoc(ref('settings', 'main'), patch, { merge: true }); },
      saveProfil: function (nama) {
        var r = ref('members', S.user.uid);
        if (S.profil) return F.updateDoc(r, { nama: nama, foto: S.user.foto || '' });
        return F.setDoc(r, { nama: nama, foto: S.user.foto || '', aktif: true, dibuat: Date.now() });
      },
      updateMember: function (id, patch) { return F.updateDoc(ref('members', id), patch); },
      deleteMember: function (id) { return F.deleteDoc(ref('members', id)); },
      signIn: async function () {
        var p = new Au.GoogleAuthProvider();
        p.setCustomParameters({ prompt: 'select_account' });
        try { await Au.signInWithPopup(auth, p); }
        catch (e) {
          if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
            await Au.signInWithRedirect(auth, p);
          } else if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) {
            return;
          } else throw e;
        }
      },
      signOut: function () { return Au.signOut(auth); },
      reset: function () { return Promise.resolve(); }
    };
  })();

  var engine = S.mode === 'cloud' ? cloud : demo;
  var api = { state: S, on: on, mode: S.mode };
  ['init', 'createCheckin', 'updateCheckin', 'deleteCheckin', 'saveSettings', 'saveProfil', 'updateMember', 'deleteMember',
    'signIn', 'signOut', 'reset'].forEach(function (k) { api[k] = engine[k]; });
  api.isAdmin = function () { return !!(S.user && S.user.isAdmin); };
  return api;
})();
