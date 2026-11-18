/* Pengaturan aplikasi Tanda Kehadiran.
   Panduan pengisian ada di PANDUAN.md.

   enabled: false -> MODE DEMO (data hanya di perangkat ini, tanpa server).
   enabled: true  -> data disimpan di Firebase dan dipakai bersama semua anggota.

   configAdalahSumber: true -> lokasi, radius, nama tempat, pilihan kegiatan (dan QR bila diisi)
                               SELALU diambil dari berkas ini, bukan dari database.
                               Mengubahnya = edit berkas ini lalu unggah ulang ke GitHub.
   configAdalahSumber: false -> nilai di bawah hanya nilai awal; pengurus bisa mengubahnya
                                lewat menu Pengurus dan hasilnya disimpan di database. */
window.TK_CONFIG = {
  enabled: true,
  configAdalahSumber: true,

  // Email Google pengurus. Harus sama persis dengan yang ada di firestore.rules.
  adminEmails: ["getramaz@gmail.com"],

  // Kunci Firebase BUKAN rahasia; yang melindungi data adalah firestore.rules.
  firebase: {
    apiKey: "AIzaSyB7ymzEuvTVCCK37-oI3bbKBiwbMKbYhqI",
    authDomain: "kehadiran-5dc1b.firebaseapp.com",
    projectId: "kehadiran-5dc1b",
    appId: "1:905083607570:web:926866c921e28d9d6916cb"
  },

  defaults: {
    orgName: "Yayasan Al-Kahfi",
    appName: "Tanda Kehadiran",

    lokasiNama: "Polowijen",
    lat: -7.932497637784255,
    lng: 112.6397824588299,
    radius: 50,                // meter

    kategori: ["Nongkrong / Diskusi", "Persiapan Acara", "Rapat", "Eksekusi Proyek"],

    qrAktif: true,
    qrToken: "",               // kosong = dibuat pengurus di menu Pengurus; isi teks acak bila ingin dikunci di sini

    autoPulangJam: 8,          // yang lupa "Pulang" hilang dari "Siapa di Sini" setelah sekian jam
    poin: { hadir: 10, catatan: 5, streakBonus: 5, streakMaks: 4 },
    riwayatHari: 180           // berapa hari ke belakang yang dimuat (menjaga kuota baca Firebase kecil)
  }
};
