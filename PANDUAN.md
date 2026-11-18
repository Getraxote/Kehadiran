# Panduan Tanda Kehadiran (GitHub Pages + Firebase)

Tanpa Firebase, aplikasi berjalan dalam **mode demo** (data hanya di HP masing-masing). Untuk dipakai bersama, ikuti langkah berikut (sekitar 15 menit).

## 1. Buat proyek Firebase
1. Buka https://console.firebase.google.com, **Create a project**.
2. Klik ikon Web `</>` untuk menambah aplikasi web, lalu salin `apiKey`, `authDomain`, `projectId`, `appId`.

## 2. Aktifkan login
Menu **Build > Authentication > Sign-in method**:
- Aktifkan **Anonymous** (dipakai anggota, tanpa perlu akun).
- Aktifkan **Google** (dipakai pengurus).
- Tab **Settings > Authorized domains**: tambahkan `namaanda.github.io` (tanpa https dan tanpa nama folder).

## 3. Database dan aturan
1. **Build > Firestore Database > Create database**, mode **production**.
2. Tab **Rules**: tempel isi `firestore.rules`, ganti `email-pengurus@gmail.com` dengan email pengurus, lalu **Publish**.

## 4. Isi config.js
- `firebase.enabled: true` dan isi keempat nilai Firebase.
- `lokasi`: lat/lng basecamp (klik kanan titik di Google Maps untuk menyalin koordinat) dan `radius` dalam meter. Saran radius 80 sampai 150 m agar tahan akurasi GPS di dalam ruangan.
- `anggota`, `kegiatan`: daftar pilihan.
- `qrToken`: kata acak panjang. `adminEmails`: sama dengan di firestore.rules.

## 5. Unggah ke GitHub Pages
Unggah seluruh isi folder ke repositori, aktifkan **Settings > Pages**. Alamat HTTPS dari GitHub Pages sudah memenuhi syarat GPS browser.

## 6. QR Code (opsional)
Masuk sebagai pengurus di tab **Pengurus**, tekan **Tampilkan QR Code lokasi**, cetak dan tempel di basecamp. Memindainya membuka aplikasi dan melewati pengecekan GPS.

## Catatan
- Poin: 10 per hari hadir, +2 per hari streak berjalan.
- Pembatasan lokasi dijalankan di browser, jadi bisa dipalsukan oleh orang yang sengaja. QR yang tersebar juga bisa dipakai dari jauh. Cocok untuk perkumpulan yang saling percaya, bukan untuk absensi yang butuh bukti ketat.
- Semua yang sudah masuk (anonim) bisa melihat nama dan kegiatan hari itu. Hanya pengurus yang bisa menghapus catatan dan mengunduh CSV.
- Setelah mengubah berkas, naikkan `VERSION` di `sw.js`.
- Batas gratis Firebase (Spark) sangat cukup untuk puluhan anggota.
