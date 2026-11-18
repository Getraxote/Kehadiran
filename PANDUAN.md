# Panduan Tanda Kehadiran (GitHub Pages + Firebase)

Tanpa Firebase, aplikasi berjalan dalam **mode demo** (data hanya di HP masing-masing). Untuk dipakai bersama, ikuti langkah berikut (sekitar 15 menit).

## 1. Buat proyek Firebase
1. Buka https://console.firebase.google.com, **Create a project**.
2. Klik ikon Web `</>` untuk menambah aplikasi web, lalu salin `apiKey`, `authDomain`, `projectId`, `appId`.

## 2. Aktifkan login
Menu **Build > Authentication > Sign-in method**:
- Aktifkan **Google**. Semua anggota dan pengurus masuk dengan akun Gmail, lalu anggota menulis username sendiri saat pertama kali masuk.
- Tab **Settings > Authorized domains**: tambahkan `namaanda.github.io` (tanpa https dan tanpa nama folder).

## 3. Database dan aturan
1. **Build > Firestore Database > Create database**, mode **production**.
2. Tab **Rules**: tempel isi `firestore.rules`, ganti `email-pengurus@gmail.com` dengan email pengurus, lalu **Publish**.

## 4. Isi config.js
- `firebase.enabled: true` dan isi keempat nilai Firebase.
- `lokasi`: lat/lng basecamp (klik kanan titik di Google Maps untuk menyalin koordinat) dan `radius` dalam meter. Saran radius 80 sampai 150 m agar tahan akurasi GPS di dalam ruangan.
- `kegiatan`: daftar pilihan kegiatan.
- `qrToken`: kata acak panjang. `adminEmails`: sama dengan di firestore.rules.

## 5. Unggah ke GitHub Pages
Unggah seluruh isi folder ke repositori, aktifkan **Settings > Pages**. Alamat HTTPS dari GitHub Pages sudah memenuhi syarat GPS browser.

## 6. QR Code (opsional)
Masuk dengan akun pengurus, buka tab **Akun**, tekan **Tampilkan QR Code lokasi**, cetak dan tempel di basecamp. Memindainya membuka aplikasi dan melewati pengecekan GPS.

## Catatan
- Username dipilih sekali saat pertama masuk (bisa diganti di tab Akun). Poin dan peringkat mengikuti akun Gmail, jadi ganti username tidak memecah poin. Username yang sama dengan anggota lain ditolak (dicek di aplikasi, bukan di server).
- Poin: 10 per hari hadir, +2 per hari streak berjalan.
- Pembatasan lokasi dijalankan di browser, jadi bisa dipalsukan oleh orang yang sengaja. QR yang tersebar juga bisa dipakai dari jauh. Cocok untuk perkumpulan yang saling percaya, bukan untuk absensi yang butuh bukti ketat.
- Siapa pun yang punya akun Google dan tahu alamat aplikasinya bisa masuk dan mendaftar username, jadi alamat jangan disebar ke luar perkumpulan.
- Semua yang sudah masuk bisa melihat username dan kegiatan. Email hanya terlihat oleh pemilik dan pengurus. Hanya pengurus yang bisa menghapus catatan dan mengunduh CSV (kolom Email ikut).
- Setelah mengubah berkas, naikkan `VERSION` di `sw.js`.
- Batas gratis Firebase (Spark) sangat cukup untuk puluhan anggota.
