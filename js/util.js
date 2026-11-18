/* Fungsi bantu: tanggal, jarak GPS, poin & streak, ekspor CSV / XLSX. Tanpa dependensi. */
window.TKU = (function () {
  'use strict';

  /* ---------- teks & tanggal ---------- */
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };

  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function dayNum(str) {
    var p = str.split('-').map(Number);
    return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5);
  }
  function fromDayNum(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function addDays(str, n) { return fromDayNum(dayNum(str) + n); }
  function weekIdx(str) { return Math.floor((dayNum(str) + 3) / 7); }   // pekan mulai Senin
  function dateOf(str) { var p = str.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }

  var fmtLong = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var fmtShort = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  var fmtDay = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  var fmtMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
  function tglPanjang(s) { return fmtLong.format(dateOf(s)); }
  function tglPendek(s) { return fmtShort.format(dateOf(s)); }
  function tglHari(s) { return fmtDay.format(dateOf(s)); }
  function bulan(s) { return fmtMonth.format(dateOf(s)); }
  function jam(ms) { var d = new Date(ms); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function durasi(ms) {
    var m = Math.round(ms / 60000);
    if (m < 1) return '< 1 mnt';
    if (m < 60) return m + ' mnt';
    var h = Math.floor(m / 60), r = m % 60;
    return h + ' j' + (r ? ' ' + r + ' mnt' : '');
  }
  function lalu(ms) {
    var s = Math.max(0, Date.now() - ms) / 1000;
    if (s < 60) return 'baru saja';
    if (s < 3600) return Math.floor(s / 60) + ' mnt lalu';
    if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
    return Math.floor(s / 86400) + ' hari lalu';
  }
  function hariRel(str) {
    var t = todayStr();
    if (str === t) return 'Hari ini';
    if (str === addDays(t, -1)) return 'Kemarin';
    return tglHari(str);
  }

  /* ---------- jarak ---------- */
  function haversine(lat1, lng1, lat2, lng2) {
    var R = 6371000, rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function jarak(m) {
    if (m < 1000) return Math.round(m) + ' m';
    return (m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',') + ' km';
  }

  /* ---------- tampilan ---------- */
  function inisial(nama) {
    var p = String(nama || '?').trim().split(/\s+/);
    return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }
  var WARNA = ['#1b6a43', '#0d5a8f', '#a87a10', '#6a3d9a', '#b4442f', '#2a7f8e', '#4d6b1f', '#8a3b6b'];
  function warna(nama) {
    var h = 0, s = String(nama || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return WARNA[h % WARNA.length];
  }
  function acak(n) {
    var a = new Uint8Array(n), out = '';
    (window.crypto || window.msCrypto).getRandomValues(a);
    for (var i = 0; i < n; i++) out += 'abcdefghjkmnpqrstuvwxyz23456789'[a[i] % 31];
    return out;
  }

  /* ---------- statistik, poin, streak ---------- */
  var tglTerakhirAktif = function (c) {
    var t = c.masuk || 0;
    (c.riwayat || []).forEach(function (r) { if (r.t > t) t = r.t; });
    return t;
  };

  function periode(kode) {
    var t = todayStr();
    if (kode === 'bulan') return { dari: t.slice(0, 8) + '01', sampai: t, label: 'Bulan ini' };
    if (kode === '30') return { dari: addDays(t, -29), sampai: t, label: '30 hari terakhir' };
    return { dari: '0000-01-01', sampai: '9999-12-31', label: 'Semua' };
  }

  var LENCANA = [
    { k: 'pemula', ikon: 'sprout', nama: 'Langkah Pertama', ket: 'Hadir untuk pertama kali' },
    { k: 'konsisten', ikon: 'flame', nama: 'Konsisten', ket: 'Hadir 3 pekan berturut-turut' },
    { k: 'rajin', ikon: 'star', nama: 'Rajin 10', ket: 'Hadir 10 kali' },
    { k: 'pencatat', ikon: 'pencil', nama: 'Rajin Mencatat', ket: '5 kali mengisi catatan kontribusi' },
    { k: 'pagi', ikon: 'sun', nama: 'Si Pagi', ket: '3 kali datang sebelum jam 08.00' }
  ];

  /* Hitung statistik tiap anggota. Poin dihitung dari data (bukan disimpan),
     jadi kalau aturan poin diubah pengurus, papan apresiasi ikut menyesuaikan. */
  function hitungStatistik(checkins, settings, dari, sampai) {
    var P = settings.poin, per = {}, now = todayStr(), cw = weekIdx(now);
    checkins.forEach(function (c) { (per[c.memberId] = per[c.memberId] || []).push(c); });
    return Object.keys(per).map(function (id) {
      var docs = per[id].slice().sort(function (a, b) { return a.tanggal < b.tanggal ? -1 : 1; });
      var pekan = [], posisi = {}, run = 0, prev = null, terpanjang = 0, pertamaPekan = {};
      docs.forEach(function (d) {
        var w = weekIdx(d.tanggal);
        if (pertamaPekan[w] == null) { pertamaPekan[w] = d.tanggal; pekan.push(w); }
      });
      pekan.forEach(function (w) {
        run = (prev !== null && w === prev + 1) ? run + 1 : 1;
        posisi[w] = run; prev = w;
        if (run > terpanjang) terpanjang = run;
      });
      var lastW = pekan.length ? pekan[pekan.length - 1] : null;
      var streak = (lastW !== null && (lastW === cw || lastW === cw - 1)) ? posisi[lastW] : 0;
      var pekanIni = lastW === cw;

      var dalam = docs.filter(function (d) { return d.tanggal >= dari && d.tanggal <= sampai; });
      var nCatatan = dalam.filter(function (d) { return (d.catatan || '').trim(); }).length;
      var bonus = 0;
      pekan.forEach(function (w) {
        var t = pertamaPekan[w];
        if (t >= dari && t <= sampai) bonus += P.streakBonus * Math.min(posisi[w] - 1, P.streakMaks);
      });
      var nCatatanAll = docs.filter(function (d) { return (d.catatan || '').trim(); }).length;
      var nPagi = docs.filter(function (d) { return new Date(d.masuk).getHours() < 8; }).length;
      var lencana = [];
      if (docs.length >= 1) lencana.push('pemula');
      if (terpanjang >= 3) lencana.push('konsisten');
      if (docs.length >= 10) lencana.push('rajin');
      if (nCatatanAll >= 5) lencana.push('pencatat');
      if (nPagi >= 3) lencana.push('pagi');
      return {
        memberId: id,
        nama: docs[docs.length - 1].nama,
        hadir: dalam.length,
        catatan: nCatatan,
        bonus: bonus,
        poin: dalam.length * P.hadir + nCatatan * P.catatan + bonus,
        streak: streak, pekanIni: pekanIni, terpanjang: terpanjang,
        terakhir: docs[docs.length - 1].tanggal,
        totalHadir: docs.length,
        lencana: lencana
      };
    });
  }

  function urutkan(stat) {
    return stat.slice().sort(function (a, b) {
      return (b.poin - a.poin) || (b.hadir - a.hadir) || a.nama.localeCompare(b.nama);
    });
  }

  /* ---------- CSV ---------- */
  function aman(v) {   // cegah "CSV injection": sel yang diawali = + - @ dianggap rumus oleh Excel
    var s = v == null ? '' : String(v);
    return /^[=+\-@\t\r]/.test(s) && isNaN(Number(s)) ? "'" + s : s;
  }
  function csv(rows) {
    var body = rows.map(function (r) {
      return r.map(function (v) {
        var s = aman(v);
        return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(';');
    }).join('\r\n');
    return new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
  }

  /* ---------- XLSX minimal (ZIP tanpa kompresi) ---------- */
  var CRC = (function () {
    var t = [], c, n, k;
    for (n = 0; n < 256; n++) {
      c = n;
      for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function zip(files) {   // files: [{name, data(Uint8Array)}]
    var enc = new TextEncoder(), parts = [], central = [], offset = 0;
    var d = new Date(), dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, f.data);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true);
      ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true); ch.setUint32(20, size, true);
      ch.setUint32(24, size, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + size;
    });
    var cdSize = central.reduce(function (a, p) { return a + p.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]),
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function xmlEsc(s) {
    return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function kolom(i) {
    var s = '';
    for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s;
    return s;
  }
  function xlsx(sheets) {   // sheets: [{nama, baris:[[...]], lebar:[...]}], baris pertama = judul kolom
    var enc = new TextEncoder();
    var files = [];
    function add(name, text) { files.push({ name: name, data: enc.encode(text) }); }
    add('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      sheets.map(function (s, i) {
        return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
      }).join('') + '</Types>');
    add('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    add('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
      sheets.map(function (s, i) {
        return '<sheet name="' + xmlEsc(s.nama.replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>';
      }).join('') + '</sheets></workbook>');
    add('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      sheets.map(function (s, i) {
        return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>';
      }).join('') +
      '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    add('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>' +
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FF125136"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>');
    sheets.forEach(function (s, i) {
      var x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>';
      if (s.lebar) x += '<cols>' + s.lebar.map(function (w, j) {
        return '<col min="' + (j + 1) + '" max="' + (j + 1) + '" width="' + w + '" customWidth="1"/>';
      }).join('') + '</cols>';
      x += '<sheetData>';
      s.baris.forEach(function (r, ri) {
        x += '<row r="' + (ri + 1) + '">';
        r.forEach(function (v, ci) {
          var ref = kolom(ci) + (ri + 1), st = ri === 0 ? ' s="1"' : '';
          if (v == null || v === '') x += '<c r="' + ref + '"' + st + '/>';
          else if (typeof v === 'number' && isFinite(v)) x += '<c r="' + ref + '"' + st + '><v>' + v + '</v></c>';
          else x += '<c r="' + ref + '"' + st + ' t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(v) + '</t></is></c>';
        });
        x += '</row>';
      });
      x += '</sheetData>';
      if (s.baris.length > 1) x += '<autoFilter ref="A1:' + kolom(s.baris[0].length - 1) + s.baris.length + '"/>';
      x += '</worksheet>';
      add('xl/worksheets/sheet' + (i + 1) + '.xml', x);
    });
    return zip(files);
  }

  function unduh(blob, nama) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nama;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  return {
    esc: esc, pad2: pad2, todayStr: todayStr, dayNum: dayNum, addDays: addDays, weekIdx: weekIdx,
    tglPanjang: tglPanjang, tglPendek: tglPendek, tglHari: tglHari, bulan: bulan, jam: jam, durasi: durasi,
    lalu: lalu, hariRel: hariRel, haversine: haversine, jarak: jarak, inisial: inisial, warna: warna, acak: acak,
    aktifTerakhir: tglTerakhirAktif, periode: periode, LENCANA: LENCANA,
    hitungStatistik: hitungStatistik, urutkan: urutkan, csv: csv, xlsx: xlsx, unduh: unduh
  };
})();
