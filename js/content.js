/* =========================================================
   Konten yang diatur admin (admin.html).
   - Teks: setiap elemen [data-en] punya kunci = hash teks Indonesia aslinya di HTML.
     Admin menyimpan pengganti { id, en } per kunci di Google Sheet.
   - Pengaturan: nomor WhatsApp, harga, pembayaran, kursi manual.
   Dimuat setelah config.js dan sebelum main.js. Pakai cache localStorage agar
   perubahan tampil tanpa kedip, lalu menyegarkan cache di latar belakang.
   ========================================================= */
(function () {
  'use strict';
  var C = (window.ELEVAREE = window.ELEVAREE || {});
  var CACHE = 'elv-content';

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  function keyOf(el) {
    if (!el.hasAttribute('data-ck')) el.setAttribute('data-ck', hash(norm(el.innerHTML)));
    return el.getAttribute('data-ck');
  }

  /* hanya tag teks sederhana yang boleh lewat; semua yang lain jadi teks biasa */
  var OK = { B: 1, STRONG: 1, I: 1, EM: 1, BR: 1, SMALL: 1, SPAN: 1 };
  function walk(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 1) {
        if (!OK[c.tagName]) { c.replaceWith(document.createTextNode(c.textContent)); return; }
        Array.prototype.slice.call(c.attributes).forEach(function (a) {
          if (!(c.tagName === 'SPAN' && a.name === 'class' && /^[\w\- ]*$/.test(a.value))) c.removeAttribute(a.name);
        });
        walk(c);
      } else if (c.nodeType !== 3) c.remove();
    });
  }
  function clean(html) {
    var t = document.createElement('template');
    t.innerHTML = String(html);
    walk(t.content);
    return t.innerHTML;
  }

  /* ---- teks yang dibuat oleh skrip ({id, en} dan soal tes level) ---- */
  var store = {};
  var memo = new WeakMap();
  function plain(html) { var d = document.createElement('div'); d.innerHTML = clean(html); return d.textContent; }
  /* Teks asli yang memuat markup tetap boleh memuat markup; selain itu hanya teks biasa. */
  function fit(orig, next) { return /[<&]/.test(orig) ? clean(next) : plain(next); }
  function ov(o) {
    if (!o || typeof o !== 'object' || typeof o.id !== 'string') return o;
    var hit = store[hash(norm(o.id))];
    if (!hit) return o;
    var m = memo.get(o);
    if (m && m.src === hit) return m.out;
    var out = { id: hit.id ? fit(o.id, hit.id) : o.id, en: hit.en ? fit(o.en || '', hit.en) : o.en };
    memo.set(o, { src: hit, out: out });
    return out;
  }
  function ovq(str) {
    if (typeof str !== 'string') return str;
    var hit = store['q' + hash(norm(str))];
    return hit && hit.id ? plain(hit.id) : str;
  }

  function applyText(content) {
    if (!content) return;
    store = content;
    var en = document.documentElement.lang === 'en';
    Array.prototype.forEach.call(document.querySelectorAll('[data-en]'), function (el) {
      var o = content[keyOf(el)];
      if (!o) return;
      if (typeof o.en === 'string' && o.en) el.setAttribute('data-en', clean(o.en));
      if (typeof o.id === 'string' && o.id) el.innerHTML = clean(o.id);
      if (en && typeof o.en === 'string' && o.en) el.innerHTML = clean(o.en);
    });
  }

  function applySettings(s) {
    if (!s || typeof s !== 'object') return;
    if (typeof s.waNumber === 'string') C.waNumber = s.waNumber;
    if (s.prices && typeof s.prices === 'object') {
      C.prices = C.prices || {};
      Object.keys(s.prices).forEach(function (k) { if (isFinite(s.prices[k])) C.prices[k] = Number(s.prices[k]); });
    }
    if (s.payment && typeof s.payment === 'object') {
      C.payment = C.payment || {};
      if (isFinite(s.payment.deadlineHours)) C.payment.deadlineHours = Number(s.payment.deadlineHours);
      if (Array.isArray(s.payment.banks)) C.payment.banks = s.payment.banks;
      if (typeof s.payment.qrisImage === 'string') C.payment.qrisImage = s.payment.qrisImage;
    }
    if (s.booked && typeof s.booked === 'object') {
      C.batches = C.batches || {};
      C.batches.booked = s.booked;
    }
  }

  function read() { try { return JSON.parse(localStorage.getItem(CACHE)) || null; } catch (e) { return null; } }
  function write(d) { try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) { /* abaikan */ } }

  var cached = read();
  if (cached) { applySettings(cached.settings); applyText(cached.content); }

  window.ELV_CONTENT = { hash: hash, norm: norm, clean: clean, keyOf: keyOf, cache: write, ov: ov, ovq: ovq };

  if (!C.formEndpoint) return;
  var ctrl = window.AbortController ? new AbortController() : null;
  var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 6000) : 0;
  fetch(C.formEndpoint + (C.formEndpoint.indexOf('?') >= 0 ? '&' : '?') + 'action=content', ctrl ? { signal: ctrl.signal } : {})
    .then(function (r) { return r.json(); })
    .then(function (d) {
      clearTimeout(timer);
      if (!d || !d.ok) return;
      var fresh = { content: d.content || {}, settings: d.settings || {} };
      var changed = JSON.stringify(fresh) !== JSON.stringify(cached || {});
      write(fresh);
      if (!changed) return;
      applySettings(fresh.settings);
      applyText(fresh.content);
      window.dispatchEvent(new Event('elv:content')); // gambar ulang teks buatan skrip
      window.dispatchEvent(new Event('elv:seats')); // gambar ulang harga & gelombang
    })
    .catch(function () { clearTimeout(timer); });
})();
