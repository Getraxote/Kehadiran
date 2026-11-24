# Tanda Kehadiran — Yayasan Al-Kahfi

Aplikasi web ringan (GitHub Pages + Firebase) untuk mencatat kehadiran perkumpulan: masuk dengan Google, tombol hadir aktif hanya di dalam radius GPS, QR Code cadangan, pencatatan "lagi ngapain", papan apresiasi, rekap, dan ekspor Excel/CSV.

## Isi folder

| Berkas | Fungsi |
|---|---|
| `index.html` | Kerangka halaman |
| `js/config.js` | **Berkas utama yang Anda ubah**: lokasi, radius, kegiatan, Firebase, email pengurus |
| `js/app.js` | Tampilan dan alur |
| `js/store.js` | Penyimpanan data (mode demo atau Firebase) |
| `js/util.js`, `js/qr.js` | Fungsi bantu, poin/streak, ekspor Excel, pembuat QR (tanpa pustaka luar) |
| `assets/`, `icons/` | Gaya, logo, ikon aplikasi |
| `manifest.webmanifest`, `sw.js` | Agar bisa dipasang di layar utama HP |
| `firestore.rules` | Aturan keamanan, ditempel di Firebase Console |

## Cara anggota memakai

1. Buka alamat aplikasi → muncul pop-up **Masuk dengan Google**.
2. Pertama kali: pop-up **Siapa namamu di sini?**. Anggota mengisi **nama panggilan sendiri**, lalu lanjut. Nama tidak boleh kembar. Foto profil Google otomatis menjadi ikon.
3. Aktifkan lokasi (tekan **Cek Lokasi Saya**). Di dalam radius, tombol **Isi Tanda Kehadiran** aktif. Anggota memilih kegiatan, menulis catatan (opsional), lalu menekan tombol.
4. Menu di pojok kanan atas (foto/nama): ubah nama panggilan, keluar.

Pengurus tidak perlu lagi mengetik daftar nama: anggota mendaftar sendiri. Pengurus bisa **menonaktifkan** (blokir absen) atau **menghapus** (reset profil) anggota di menu Pengurus.

## Mengubah lokasi, radius, dan kegiatan

Semuanya di `js/config.js`. Selama `configAdalahSumber: true`, nilai di berkas itu **selalu menang** atas data lama di database. Setelah mengedit, unggah ulang ke GitHub, tunggu ±1 menit, lalu muat ulang (di HP, tutup lalu buka lagi aplikasinya). Koordinat termudah: Google Maps → tekan lama di titik basecamp → salin dua angka (lintang, bujur).

## Pasang di GitHub Pages

1. Buat repository publik di github.com, misalnya `kehadiran`.
2. **Add file → Upload files**, seret **isi** folder ini (`index.html` harus di lapisan paling atas), lalu **Commit changes**.
3. **Settings → Pages → Branch: `main`, folder `/ (root)` → Save**.
4. Alamatnya: `https://NAMA-GITHUB.github.io/kehadiran/`.

## Menyiapkan Firebase (proyek `kehadiran-5dc1b` sudah ada di config.js)

1. **Authentication → Sign-in method**: aktifkan **Google**. (Login Anonymous **tidak** diperlukan lagi.)
2. **Authentication → Settings → Authorized domains → Add domain**: `NAMA-GITHUB.github.io` (tanpa `https://`, tanpa nama folder). Tanpa ini pop-up login gagal.
3. **Firestore Database → Create database** (lokasi `asia-southeast2` Jakarta, mode production).
4. Tab **Rules**: hapus isinya, tempel isi `firestore.rules` **yang terbaru dari folder ini** (email pengurus sudah `getramaz@gmail.com`), klik **Publish**. Aturan lama tidak cocok dengan versi ini.

Pengurus = akun Google yang emailnya ada di `adminEmails` (config.js) dan di `firestore.rules`. Pengurus masuk lewat pop-up yang sama dengan anggota; menu **Pengurus** muncul di menu akun.

## Pemakaian pertama (pengurus)

1. Buka aplikasi, masuk dengan Google, isi nama panggilan.
2. Menu **Pengurus → QR Code → Aktifkan QR Code → Cetak**, tempel di basecamp.
3. Bagikan alamat aplikasi ke anggota. Selesai.

## Cara kerja singkat

- **GPS:** tombol aktif bila jarak ≤ radius. Bila akurasi GPS lebih buruk dari radius, anggota diberi peringatan dan diarahkan memakai QR.
- **QR:** memindai QR dengan kamera HP membuka aplikasi dan membuka izin absen 3 jam di perangkat itu.
- **Satu catatan per orang per hari.** Bisa memperbarui kegiatan, menekan Pulang, dan Masuk Lagi. Yang lupa Pulang hilang dari "Siapa di Sini" setelah 8 jam (`autoPulangJam`).
- **Poin** dihitung dari data: hadir +10, catatan kontribusi +5, bonus streak pekan beruntun (angka di `config.js`).
- **Rekap:** per tanggal, per anggota, tabel rinci. Pengurus mengunduh `.xlsx` (3 lembar) atau `.csv` (pemisah titik koma) dan menghapus catatan yang salah.
- **Musik dan sfx sendiri:** taruh berkas (disarankan `.mp3`) di `assets/audio/`, lalu isi namanya di `js/config.js` bagian `audio` (`musik`, dan `sfx` untuk `whoosh`, `ting`, `drum`, `fanfare`). Musik diputar berulang dengan fade in/out mulai saat anggota menekan "Mulai"; tombol "Suara" membisukan semuanya. Yang dikosongkan memakai suara sintetis bawaan. Bila memakai berkas drum sendiri, isi `drumDetik` sesuai lamanya supaya podium muncul tepat setelahnya. Pakai audio buatan sendiri atau berlisensi bebas, dan usahakan ukuran musik di bawah 2 MB agar cepat dimuat di HP.
- **Beberapa lokasi:** di `js/config.js` bagian `lokasi` berisi daftar `{ nama, lat, lng, radius }`. Tambahkan satu baris untuk lokasi kedua (contoh sudah ada, dikomentari). Tombol hadir aktif bila anggota berada di radius salah satu lokasi, dan nama lokasinya ikut tercatat (kolom Lokasi di Rekap dan Excel). **Setelah menambah lokasi kedua, salin ulang `firestore.rules` ke Firebase Console lalu Publish**, karena aturan baru mengizinkan kolom `lokasi`.
- **Tanpa jam pulang:** tidak ada tombol Pulang. Anggota tampil di "Siapa di Sini" selama sekian jam sejak kegiatan terakhirnya (Pengurus → Poin & pengaturan).
- **Rahasia sampai tanggal 1:** anggota yang membuka Rekap atau Apresiasi disambut layar gelap bertuliskan tanggal pembukaan dan hitung mundur; tombolnya membuka hasil bulan lalu. untuk anggota, halaman Rekap dan papan Apresiasi hanya menampilkan data sampai akhir bulan lalu. Hasil bulan berjalan baru terbuka saat bulan berganti. Pengurus tetap bisa melihat semuanya kapan saja.
- **Kejutan bulanan:** saat anggota pertama kali membuka aplikasi di bulan baru, muncul layar penuh berisi animasi, suara (dibuat langsung oleh browser, tanpa berkas audio), konfeti, lencana baru, podium, dan penghargaan, dengan tombol simpan kartu sebagai gambar. Muncul sekali per anggota per bulan (ditandai di browser anggota) dan bisa diputar ulang dari halaman Rekap/Apresiasi. Pengurus dapat memratinjau dari Pengurus → Data & ekspor.
- Bila anggota mengganti nama panggilan, catatan lama di rekap tetap memakai nama saat itu.

## Catatan keamanan (jujur)

- Hanya akun Google yang bisa membaca data; pengunjung tanpa login tidak bisa. **Tetapi siapa pun yang punya akun Google dan tahu alamat aplikasi dapat mendaftar sendiri** dan melihat daftar kehadiran. Jangan sebar alamat sembarangan; pengurus bisa menonaktifkan/menghapus akun yang tidak dikenal. Jika perlu, kunci lebih ketat dengan persetujuan pengurus (belum dipasang; bisa ditambahkan).
- Absen hanya bisa dilakukan atas nama akun sendiri (diperiksa aturan database), jadi tidak bisa mengisi untuk orang lain.
- Pemeriksaan radius dilakukan di HP anggota sehingga bisa dipalsukan oleh yang paham teknis. Ini untuk mencegah salah klik, bukan melawan kecurangan. 
- Hanya pengurus yang dapat menghapus catatan atau menonaktifkan anggota.

## Kuota gratis Firebase (Spark)

20.000 tulis dan 50.000 baca per hari. Aplikasi menyimpan cache di perangkat sehingga pembukaan berulang hanya membaca data yang berubah. Untuk puluhan anggota ini cukup.

## Setelah mengubah berkas

Naikkan angka `VERSION` di `sw.js` (`kehadiran-v7` → `kehadiran-v8`, dan angka `?v=` di `index.html`) supaya cache lama di HP anggota diganti.

## Mencoba tanpa Firebase

Ubah `enabled: true` menjadi `enabled: false` di `js/config.js`. Mode demo: "Masuk (simulasi Google)", data contoh tersimpan di browser, dan ada tombol simulasi "Di lokasi / Di luar" di panel GPS.
