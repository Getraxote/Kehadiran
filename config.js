/* Pengaturan aplikasi. Panduan pengisian ada di PANDUAN.md.
   firebase.enabled = false -> mode demo (data hanya di HP ini, tanpa server). */
window.KEHADIRAN = {
  nama: "Yayasan Al-Kahfi",
  lokasi: { nama: "Basecamp", lat: -6.2, lng: 106.8, radius: 100 },   // ganti dengan titik basecamp (meter)
  anggota: ["Contoh Satu", "Contoh Dua", "Contoh Tiga"],             // daftar nama pilihan
  kegiatan: ["Nongkrong / diskusi", "Persiapan acara", "Rapat", "Eksekusi proyek"],
  qrToken: "ganti-dengan-kode-acak",                                 // untuk QR Code lokasi
  adminEmails: ["email-pengurus@gmail.com"],                         // huruf kecil, sama dengan firestore.rules
  firebase: { enabled: false, apiKey: "", authDomain: "", projectId: "", appId: "" }
};
