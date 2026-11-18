/* Pembuat QR Code kecil tanpa dependensi (mode byte, koreksi galat M, versi 1-20).
   Dipakai pengurus untuk mencetak QR statis di lokasi.
   API: TKQR.svg(teks, {skala, margin, warna, latar}) -> string SVG */
window.TKQR = (function () {
  'use strict';

  // Tabel untuk koreksi galat tingkat M, indeks = versi (0 tidak dipakai)
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26];
  var NUM_BLOCKS    = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];
  var MAX_VER = 20;

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }
  function dataCodewords(ver) {
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
  }

  function utf8(str) {
    return Array.prototype.slice.call(new TextEncoder().encode(str));
  }

  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function rsDivisor(deg) {
    var res = [], i, j;
    for (i = 0; i < deg - 1; i++) res.push(0);
    res.push(1);
    var root = 1;
    for (i = 0; i < deg; i++) {
      for (j = 0; j < res.length; j++) {
        res[j] = gfMul(res[j], root);
        if (j + 1 < res.length) res[j] ^= res[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return res;
  }
  function rsRemainder(data, divisor) {
    var res = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ res.shift();
      res.push(0);
      divisor.forEach(function (coef, i) { res[i] ^= gfMul(coef, factor); });
    });
    return res;
  }

  function buildCodewords(bytes, ver) {
    var cap = dataCodewords(ver) * 8, bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4);
    put(bytes.length, ver <= 9 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (var j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      data.push(v);
    }
    // Pecah jadi blok, hitung ECC, lalu sisipkan (interleave)
    var nb = NUM_BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver];
    var raw = Math.floor(rawModules(ver) / 8);
    var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var blocks = [], div = rsDivisor(eccLen), k = 0;
    for (i = 0; i < nb; i++) {
      var dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1));
      k += dat.length;
      var ecc = rsRemainder(dat, div);
      if (i < nShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var out = [];
    for (i = 0; i < blocks[0].length; i++) {
      blocks.forEach(function (blk, j) {
        if (i !== shortLen - eccLen || j >= nShort) out.push(blk[i]);
      });
    }
    return out;
  }

  function make(text, forcedMask) {
    var bytes = utf8(text), ver;
    for (ver = 1; ver <= MAX_VER; ver++) {
      var need = 4 + (ver <= 9 ? 8 : 16) + bytes.length * 8;
      if (need <= dataCodewords(ver) * 8) break;
    }
    if (ver > MAX_VER) throw new Error('Teks terlalu panjang untuk QR');
    var size = ver * 4 + 17;
    var mod = [], fn = [], y, x;
    for (y = 0; y < size; y++) { mod.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function setFn(px, py, dark) {
      if (px < 0 || py < 0 || px >= size || py >= size) return;
      mod[py][px] = !!dark; fn[py][px] = true;
    }

    // pola pewaktu
    for (var i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    // pola pencari
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(cx + dx, cy + dy, d !== 2 && d !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    // pola penyelaras
    var pos = [];
    if (ver > 1) {
      var n = Math.floor(ver / 7) + 2;
      var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
      pos = [6];
      for (var p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
    }
    pos.forEach(function (ax, ai) {
      pos.forEach(function (ay, aj) {
        if ((ai === 0 && aj === 0) || (ai === 0 && aj === pos.length - 1) || (ai === pos.length - 1 && aj === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++)
          setFn(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      });
    });
    // bit format (ditulis dulu dengan topeng 0 agar area terkunci), bit versi
    function formatBits(mask) {
      var data = (0 << 3) | mask, rem = data;   // ECC M = 00
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      return ((data << 10) | rem) ^ 0x5412;
    }
    function drawFormat(mask) {
      var bits = formatBits(mask), i;
      function b(k) { return ((bits >>> k) & 1) !== 0; }
      for (i = 0; i <= 5; i++) setFn(8, i, b(i));
      setFn(8, 7, b(6)); setFn(8, 8, b(7)); setFn(7, 8, b(8));
      for (i = 9; i < 15; i++) setFn(14 - i, 8, b(i));
      for (i = 0; i < 8; i++) setFn(size - 1 - i, 8, b(i));
      for (i = 8; i < 15; i++) setFn(8, size - 15 + i, b(i));
      setFn(8, size - 8, true);
    }
    drawFormat(0);
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vb = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var c = ((vb >>> i) & 1) !== 0, a = size - 11 + i % 3, bb = Math.floor(i / 3);
        setFn(a, bb, c); setFn(bb, a, c);
      }
    }

    // tempatkan data
    var cw = buildCodewords(bytes, ver), bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var xx = right - j, upward = ((right + 1) & 2) === 0;
          var yy = upward ? size - 1 - vert : vert;
          if (!fn[yy][xx] && bi < cw.length * 8) {
            mod[yy][xx] = ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
            bi++;
          }
        }
      }
    }

    // pilih topeng terbaik berdasarkan penalti
    function maskCond(m, mx, my) {
      switch (m) {
        case 0: return (mx + my) % 2 === 0;
        case 1: return my % 2 === 0;
        case 2: return mx % 3 === 0;
        case 3: return (mx + my) % 3 === 0;
        case 4: return (Math.floor(mx / 3) + Math.floor(my / 2)) % 2 === 0;
        case 5: return mx * my % 2 + mx * my % 3 === 0;
        case 6: return (mx * my % 2 + mx * my % 3) % 2 === 0;
        default: return ((mx + my) % 2 + mx * my % 3) % 2 === 0;
      }
    }
    function applyMask(m) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++)
        if (!fn[yy][xx] && maskCond(m, xx, yy)) mod[yy][xx] = !mod[yy][xx];
    }
    function penalty() {
      var score = 0, yy, xx, k, run, last;
      function lines(get) {
        for (var a = 0; a < size; a++) {
          run = 1; last = get(a, 0);
          var hist = [get(a, 0) ? 1 : 0];
          for (var b = 1; b < size; b++) {
            var v = get(a, b);
            if (v === last) { run++; if (run === 5) score += 3; else if (run > 5) score++; }
            else { run = 1; last = v; }
            hist.push(v ? 1 : 0);
          }
          var s = hist.join('');
          var re = /(?=(10111010000|00001011101))/g, mt;
          while ((mt = re.exec(s))) { score += 40; re.lastIndex = mt.index + 1; }
        }
      }
      lines(function (a, b) { return mod[a][b]; });
      lines(function (a, b) { return mod[b][a]; });
      for (yy = 0; yy < size - 1; yy++) for (xx = 0; xx < size - 1; xx++) {
        var c = mod[yy][xx];
        if (c === mod[yy][xx + 1] && c === mod[yy + 1][xx] && c === mod[yy + 1][xx + 1]) score += 3;
      }
      var dark = 0;
      for (yy = 0; yy < size; yy++) for (xx = 0; xx < size; xx++) if (mod[yy][xx]) dark++;
      var total = size * size;
      k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      return score + Math.max(0, k) * 10;
    }
    var best = 0, bestScore = Infinity;
    for (var m = 0; m < 8 && forcedMask == null; m++) {
      applyMask(m); drawFormat(m);
      var sc = penalty();
      if (sc < bestScore) { bestScore = sc; best = m; }
      applyMask(m);   // batalkan (XOR dua kali)
    }
    if (forcedMask != null) best = forcedMask;
    applyMask(best); drawFormat(best);
    mod.mask = best;
    return { size: size, version: ver, modules: mod };
  }

  function svg(text, opt) {
    opt = opt || {};
    var q = make(text), margin = opt.margin == null ? 4 : opt.margin, s = q.size + margin * 2;
    var d = '';
    for (var y = 0; y < q.size; y++) {
      var x = 0;
      while (x < q.size) {
        if (q.modules[y][x]) {
          var x0 = x;
          while (x < q.size && q.modules[y][x]) x++;
          d += 'M' + (x0 + margin) + ' ' + (y + margin) + 'h' + (x - x0) + 'v1h-' + (x - x0) + 'z';
        } else x++;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + ' ' + s + '" shape-rendering="crispEdges" role="img" aria-label="QR Code">' +
      '<rect width="' + s + '" height="' + s + '" fill="' + (opt.latar || '#fff') + '"/>' +
      '<path d="' + d + '" fill="' + (opt.warna || '#000') + '"/></svg>';
  }

  return { svg: svg, make: make };
})();
