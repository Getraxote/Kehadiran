# Tanda Kehadiran — Yayasan Al-Kahfi

Aplikasi web ringan (GitHub Pages + Firebase) untuk mencatat kehadiran perkumpulan: tombol hadir aktif hanya di dalam radius GPS, QR Code cadangan, pencatatan "lagi ngapain", daftar "Siapa di Sini" langsung, papan apresiasi, rekap, dan ekspor Excel/CSV.

## Isi folder

| Berkas | Fungsi |
|---|---|
| `index.html` | Kerangka halaman |
| `js/config.js` | **Satu-satunya berkas yang perlu Anda ubah**: lokasi, radius, kegiatan, Firebase, email pengurus |
| `js/app.js` | Tampilan dan alur |
| `js/store.js` | Penyimpanan data (mode demo atau Firebase) |
| `js/util.js`, `js/qr.js` | Fungsi bantu, poin/streak, ekspor Excel, pembuat QR (tanpa pustaka luar) |
| `assets/`, `icons/` | Gaya, logo, ikon aplikasi |
| `manifest.webmanifest`, `sw.js` | Agar bisa dipasang di layar utama HP dan dibuka kembali tanpa internet |
| `firestore.rules` | Aturan keamanan, ditempel di Firebase Console |

## Mengubah lokasi, radius, dan kegiatan

Semuanya di `js/config.js`. Selama `configAdalahSumber: true`, nilai di berkas itu **selalu menang**; tidak ada data lama di database yang bisa menimpanya. Setelah mengedit, unggah ulang berkas ke GitHub, tunggu ±1 menit, lalu muat ulang halaman (di HP, tutup lalu buka lagi aplikasinya).

Titik koordinat paling mudah didapat dengan: buka Google Maps, tekan lama di titik basecamp, lalu salin dua angka yang muncul (lintang, bujur).

Jika ingin pengurus bisa mengubah lokasi dari menu **Pengurus** (tanpa edit berkas), ganti menjadi `configAdalahSumber: false`.

## Pasang di GitHub Pages

1. Buat repository publik di github.com, misalnya `kehadiran`.
2. **Add file → Upload files**, seret **isi** folder ini (bukan folder pembungkusnya; `index.html` harus di lapisan paling atas), lalu **Commit changes**.
3. **Settings → Pages → Branch: `main`, folder `/ (root)` → Save**.
4. Alamatnya: `https://NAMA-GITHUB.github.io/kehadiran/`.

## Menyiapkan Firebase (proyek `kehadiran-5dc1b` sudah ada di config.js)

1. **Authentication → Sign-in method**: aktifkan **Anonymous** (untuk anggota biasa) dan **Google** (untuk pengurus).
2. **Authentication → Settings → Authorized domains → Add domain**: `NAMA-GITHUB.github.io` (tanpa `https://` dan tanpa nama folder).
3. **Firestore Database → Create database** (lokasi `asia-southeast2` Jakarta, mode production).
4. Tab **Rules**: hapus isinya, tempel isi `firestore.rules` (email pengurus sudah `getramaz@gmail.com`), klik **Publish**. Email di rules harus sama dengan `adminEmails` di `config.js`.

## Pemakaian pertama

1. Buka aplikasi → menu **Pengurus** → **Masuk dengan Google** memakai akun pengurus.
2. Di bagian **Anggota**, tempel daftar nama (satu per baris). Anggota baru **harus didaftarkan dulu**; aturan database menolak absen dari nama yang tidak terdaftar.
3. Bagian **QR Code** → **Aktifkan QR Code** → **Cetak**, lalu tempel di basecamp.
4. Bagikan alamat aplikasi ke anggota. Mereka tidak perlu login: cukup pilih nama, pilih kegiatan, tekan **Isi Tanda Kehadiran**.

## Cara kerja singkat

- **GPS:** tombol aktif bila jarak ≤ radius. Jika akurasi GPS lebih buruk dari radius, anggota diberi peringatan dan diarahkan memakai QR.
- **QR:** memindai QR dengan kamera HP membuka aplikasi dan membuka izin absen selama 3 jam di perangkat itu.
- **Satu catatan per orang per hari.** Bisa memperbarui kegiatan, menekan Pulang, dan Masuk Lagi di hari yang sama. Yang lupa Pulang otomatis hilang dari "Siapa di Sini" setelah 8 jam (`autoPulangJam`).
- **Poin** dihitung dari data, bukan disimpan: hadir +10, catatan kontribusi +5, bonus streak pekan beruntun. Angkanya di `config.js`.
- **Rekap:** per tanggal, per anggota, dan tabel rinci. Pengurus dapat mengunduh `.xlsx` (3 lembar) atau `.csv` (pemisah titik koma, cocok untuk Excel berbahasa Indonesia) dan menghapus catatan yang salah.

## Catatan keamanan (jujur)

- Anggota tidak login, jadi **siapa pun yang tahu alamat aplikasi dapat membaca daftar kehadiran** dan, secara teknis, mengisi atas nama orang lain. Cocok untuk kelompok yang saling percaya; jangan menaruh informasi sensitif di catatan kontribusi dan jangan menyebar alamat aplikasi sembarangan.
- Pemeriksaan GPS dilakukan di HP anggota, sehingga bisa dipalsukan oleh yang paham teknis. Pemeriksaan radius ini untuk mencegah salah klik, bukan melawan kecurangan.
- Hanya akun di `adminEmails` yang dapat mengubah anggota/pengaturan atau menghapus catatan (ditegakkan oleh `firestore.rules`).

## Kuota gratis Firebase (Spark)

20.000 tulis dan 50.000 baca per hari. Aplikasi menyimpan cache di perangkat sehingga pembukaan berulang hanya membaca data yang berubah. Untuk puluhan anggota ini sangat cukup.

## Setelah mengubah berkas

Naikkan angka `VERSION` di `sw.js` (`kehadiran-v1` → `kehadiran-v2`) supaya cache lama di HP anggota diganti.

## Mencoba tanpa Firebase

Ubah `enabled: true` menjadi `enabled: false` di `js/config.js`. Aplikasi berjalan dalam **mode demo** dengan data contoh yang hanya tersimpan di browser, lengkap dengan simulasi "di lokasi / di luar".
