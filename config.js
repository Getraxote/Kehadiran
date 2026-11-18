/* Pengaturan aplikasi. Panduan pengisian ada di PANDUAN.md.
   firebase.enabled = false -> mode demo (data hanya di HP ini, tanpa server). */
window.KEHADIRAN = {
  nama: "Yayasan Al-Kahfi",
  lokasi: { nama: "Sekre Polowijen", lat: -7.92222616004017,  lng: 112.64070906526774, radius: 50 },   
  kegiatan: ["Nongkrong / diskusi", "Persiapan acara", "Rapat", "Eksekusi proyek"],
  qrToken: "ganti-dengan-kode-acak",                                 
  adminEmails: ["getramaz@gmail.com"],                         
  firebase: { enabled: true, apiKey: "AIzaSyB7ymzEuvTVCCK37-oI3bbKBiwbMKbYhqI",
  authDomain: "kehadiran-5dc1b.firebaseapp.com",
  projectId: "kehadiran-5dc1b", aappId: "1:905083607570:web:926866c921e28d9d6916cb", }
};

