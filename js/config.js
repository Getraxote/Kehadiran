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
  adminEmails: ["getramaz@gmail.com", "ohd8094@gmail.com"],

  // Kunci Firebase BUKAN rahasia; yang melindungi data adalah firestore.rules.
  firebase: {
    apiKey: "AIzaSyB7ymzEuvTVCCK37-oI3bbKBiwbMKbYhqI",
    authDomain: "kehadiran-5dc1b.firebaseapp.com",
    projectId: "kehadiran-5dc1b",
    appId: "1:905083607570:web:926866c921e28d9d6916cb"
  },

  /* Audio untuk layar kejutan bulanan. Taruh berkas di folder assets/audio/ lalu isi namanya di bawah.
     Yang dikosongkan ("") memakai suara sintetis bawaan. Format disarankan .mp3 (kecil, jalan di semua HP).
     Pakai musik/sfx yang kamu punya hak pakainya (buatan sendiri atau berlisensi bebas). */
  audio: {
    musik: "",                 // contoh: "assets/audio/musik.mp3" (diputar berulang dengan fade in/out)
    volumeMusik: 0.4,          // 0 sampai 1
    sfx: {
      whoosh: "",              // pergantian slide, contoh: "assets/audio/whoosh.mp3"
      ting: "",                // lencana / angka muncul
      drum: "",                // gulungan drum sebelum podium
      fanfare: ""              // juara 1 dan penutup
    },
    drumDetik: 2.2,            
    volumeSfx: 0.9
  },

  defaults: {
    orgName: "Yayasan Al-Kahfi",
    appName: "Tanda Kehadiran",

    lokasi: [
      { nama: "Sekre Polowijen", lat: -7.932497637784255, lng: 112.6397824588299, radius: 50 }, 
      { nama: "Sekre Rupat", lat: -7.992633757443084, lng: 112.62637767683425, radius: 50 }
    ],
    kategori: ["Nongkrong dan diskusi", "Persiapan acara", "Rapat", "Kontribusi", "Kajian SM/MT", "Kesekretariatan", "Nge-Plan bareng", "READ", "Literasi (Baca, Pinjam, KP Buku Perpustakaan/ Buletin Ulbab)", "Belajar Kelompok/ Mengerjakan PR Sekolah", "Peran Organisasi"],
    qrAktif: true,
    qrToken: "",               // kosong = dibuat pengurus di menu Pengurus; isi teks acak bila ingin dikunci di sini

    susulanSampaiJam: 12,      // kehadiran susulan boleh diisi sampai jam segini keesokan harinya
    autoPulangJam: 8,          // nama tampil di "Siapa di Sini" selama sekian jam sejak kegiatan terakhirnya
    poin: { hadir: 10, catatan: 5, streakBonus: 5, streakMaks: 4 },
    riwayatHari: 180           // berapa hari ke belakang yang dimuat (menjaga kuota baca Firebase kecil)
  }
};
