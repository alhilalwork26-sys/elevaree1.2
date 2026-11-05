/* Halaman admin Elevaree — mengatur teks & pengaturan lewat Google Apps Script. */
(function () {
  'use strict';
  var C = window.ELEVAREE || {};
  var H = window.ELV_CONTENT;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var PAGES = [
    ['index.html', 'Beranda'],
    ['english-for-kids.html', 'English for Kids'],
    ['english-for-teens.html', 'English for Teens'],
    ['general-english.html', 'General English'],
    ['ielts-toefl-prep.html', 'IELTS & TOEFL Prep'],
    ['business-english.html', 'Business English'],
    ['daftar.html', 'Pendaftaran'],
    ['tes-level.html', 'Tes level'],
    ['tentang.html', 'Tentang kami'],
    ['kebijakan-privasi.html', 'Kebijakan privasi'],
    ['syarat-ketentuan.html', 'Syarat & ketentuan'],
    ['404.html', 'Halaman 404'],
    ['js:main.js', 'Beranda — teks dinamis (katalog, journey, dll.)'],
    ['js:daftar.js', 'Pendaftaran — teks dinamis (langkah, ringkasan, pesan)'],
    ['js:tes-level.js', 'Tes level — teks dinamis (hasil, level, rekomendasi)'],
    ['quiz:tes-level.js', 'Tes level — soal & pilihan jawaban'],
    ['js:config.js', 'Catatan libur / gelombang'],
  ];
  var STR = "'(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\"";
  var PRICE_LABELS = { kids: 'English for Kids', teens: 'English for Teens', general: 'General English', ielts: 'IELTS & TOEFL Prep', business: 'Business English' };
  var ERRORS = {
    auth: 'Kata sandi salah.',
    locked: 'Terlalu banyak percobaan salah. Coba lagi 10 menit lagi.',
    'no-password': 'Kata sandi admin belum dibuat di Apps Script (Script properties → ADMIN_PASSWORD).',
    network: 'Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.',
    payload: 'Data tidak valid.',
    action: 'Perintah tidak dikenal.',
  };

  var password = '';
  var remote = { content: {}, settings: {} };
  var pageCache = {};           // file -> [{k, id, en, ctx}]
  var pending = {};             // k -> {id, en}
  var currentFile = PAGES[0][0];
  var settingsDirty = false;

  /* ---------- server ---------- */
  function post(action, payload) {
    var body = new URLSearchParams({ type: 'admin', password: password, action: action });
    if (payload !== undefined) body.set('payload', JSON.stringify(payload));
    return fetch(C.formEndpoint, { method: 'POST', body: body })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; });
  }
  function load() {
    return fetch(C.formEndpoint + (C.formEndpoint.indexOf('?') >= 0 ? '&' : '?') + 'action=content&t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.ok) remote = { content: d.content || {}, settings: d.settings || {} }; })
      .catch(function () { /* tetap pakai data kosong */ });
  }

  /* ---------- masuk ---------- */
  function showPanel() {
    $('.js-login').hidden = true;
    $('.js-panel').hidden = false;
    $('.js-logout').hidden = false;
    $('.js-savebar').hidden = false;
    load().then(function () { buildPageSelect(); renderRows(); renderSettings(); });
  }
  $('.js-login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('.js-login-err');
    if (!C.formEndpoint) { err.textContent = 'formEndpoint di js/config.js masih kosong. Pasang Google Apps Script dulu (lihat tools/google-sheets-form.gs).'; return; }
    password = $('.js-pw').value;
    err.textContent = 'Memeriksa…';
    post('verify').then(function (r) {
      if (r.ok) { try { sessionStorage.setItem('elv-admin', password); } catch (x) { /* abaikan */ } err.textContent = ''; showPanel(); }
      else err.textContent = ERRORS[r.error] || 'Gagal masuk.';
    });
  });
  $('.js-logout').addEventListener('click', function () {
    try { sessionStorage.removeItem('elv-admin'); } catch (x) { /* abaikan */ }
    location.reload();
  });
  try {
    var saved = sessionStorage.getItem('elv-admin');
    if (saved && C.formEndpoint) {
      password = saved;
      post('verify').then(function (r) { if (r.ok) showPanel(); else password = ''; });
    }
  } catch (x) { /* abaikan */ }

  /* ---------- tab ---------- */
  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (o) { o.setAttribute('aria-selected', o === t); });
      $('.js-tab-text').hidden = t.dataset.tab !== 'text';
      $('.js-tab-settings').hidden = t.dataset.tab !== 'settings';
    });
  });

  /* ---------- teks ---------- */
  function buildPageSelect() {
    var sel = $('.js-page');
    sel.innerHTML = '';
    PAGES.forEach(function (p) { var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; sel.appendChild(o); });
    sel.value = currentFile;
  }
  function ctxLabel(el) {
    var c = el.closest('nav, header, footer, section, main, aside, form');
    if (!c) return 'Halaman';
    if (c.tagName === 'NAV') return 'Menu atas';
    if (c.tagName === 'FOOTER') return 'Footer';
    if (c.id) return '#' + c.id;
    return (c.className && String(c.className).split(' ')[0]) || c.tagName.toLowerCase();
  }
  function unq(lit) {
    return lit.slice(1, -1).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, function (m, c) {
      if (c[0] === 'u' && c.length === 5) return String.fromCharCode(parseInt(c.slice(1), 16));
      if (c[0] === 'x' && c.length === 3) return String.fromCharCode(parseInt(c.slice(1), 16));
      return c === 'n' ? '\n' : c === 't' ? '\t' : c;
    });
  }
  function scanJs(file, quiz) {
    if (pageCache[file]) return Promise.resolve(pageCache[file]);
    return fetch(file.replace(/^(js|quiz):/, 'js/') + '?t=' + Date.now()).then(function (r) { return r.text(); }).then(function (src) {
      var seen = {}, rows = [], m, re;
      function add(k, id, en, ctx, q) { if (seen[k] || !H.norm(id)) return; seen[k] = 1; rows.push({ k: k, id: id, en: en, ctx: ctx, q: q }); }
      if (!quiz) {
        re = new RegExp('\\{\\s*id:\\s*(' + STR + ')\\s*,\\s*en:\\s*(' + STR + ')\\s*\\}', 'g');
        while ((m = re.exec(src))) { var id = unq(m[1]); add(H.hash(H.norm(id)), id, unq(m[2]), 'Skrip', false); }
      } else {
        var one = new RegExp('\\b[qp]:\\s*(' + STR + ')', 'g');
        while ((m = one.exec(src))) { var q = unq(m[1]); add('q' + H.hash(H.norm(q)), q, '', 'Soal / bacaan', true); }
        var arr = /\bo:\s*\[([^\]]*)\]/g, lit = new RegExp(STR, 'g'), a, b;
        while ((a = arr.exec(src))) { lit.lastIndex = 0; while ((b = lit.exec(a[1]))) { var o = unq(b[0]); add('q' + H.hash(H.norm(o)), o, '', 'Pilihan jawaban', true); } }
      }
      pageCache[file] = rows;
      return rows;
    });
  }
  function scan(file) {
    if (/^js:/.test(file)) return scanJs(file, false);
    if (/^quiz:/.test(file)) return scanJs(file, true);
    if (pageCache[file]) return Promise.resolve(pageCache[file]);
    return fetch(file + '?t=' + Date.now()).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var seen = {}, rows = [];
      doc.querySelectorAll('[data-en]').forEach(function (el) {
        if (el.closest('script, template, noscript')) return;
        var inner = el.innerHTML;
        if (!H.norm(inner)) return;
        var k = H.hash(H.norm(inner));
        if (seen[k]) return;
        seen[k] = 1;
        rows.push({ k: k, id: inner.trim(), en: (el.getAttribute('data-en') || '').trim(), ctx: ctxLabel(el) });
      });
      pageCache[file] = rows;
      return rows;
    });
  }
  function valueOf(row) {
    return pending[row.k] || remote.content[row.k] || { id: row.id, en: row.en };
  }
  function isLive(row) { return !!remote.content[row.k]; }

  function renderRows() {
    var box = $('.js-rows');
    $('.js-text-err').textContent = '';
    box.textContent = 'Memuat…';
    scan(currentFile).then(function (rows) {
      var q = $('.js-q').value.trim().toLowerCase();
      var only = $('.js-only').checked;
      box.textContent = '';
      var shown = 0;
      rows.forEach(function (row) {
        var v = valueOf(row);
        if (only && !pending[row.k] && !isLive(row)) return;
        if (q && (v.id + ' ' + v.en + ' ' + row.id).toLowerCase().indexOf(q) < 0) return;
        box.appendChild(rowEl(row));
        shown++;
      });
      if (!shown) box.textContent = 'Tidak ada teks yang cocok.';
    }).catch(function () { box.textContent = ''; $('.js-text-err').textContent = 'Gagal membaca halaman ini.'; });
  }
  function rowEl(row) {
    var el = document.createElement('div');
    var v = valueOf(row);
    el.className = 'row' + (pending[row.k] ? ' is-dirty' : '') + (isLive(row) ? ' is-live' : '');
    var meta = document.createElement('div');
    meta.className = 'row__meta';
    var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = row.ctx;
    meta.appendChild(tag);
    if (isLive(row)) { var live = document.createElement('span'); live.textContent = 'sudah diubah'; meta.appendChild(live); }
    el.appendChild(meta);
    var cols = document.createElement('div');
    cols.className = 'row__cols';
    var tid = field(row.q ? 'Teks' : 'Indonesia', v.id), ten = field('English', v.en);
    cols.appendChild(tid.label);
    if (row.q) cols.style.gridTemplateColumns = '1fr'; else cols.appendChild(ten.label);
    el.appendChild(cols);
    var foot = document.createElement('div');
    foot.className = 'row__foot';
    var orig = document.createElement('span');
    orig.textContent = 'Asli: ' + plain(row.id).slice(0, 80) + (plain(row.id).length > 80 ? '…' : '');
    var reset = document.createElement('button');
    reset.type = 'button'; reset.className = 'link'; reset.textContent = 'Kembalikan ke asli';
    foot.appendChild(orig); foot.appendChild(reset);
    el.appendChild(foot);

    function change() {
      pending[row.k] = { id: tid.area.value, en: row.q ? '' : ten.area.value };
      el.classList.add('is-dirty');
      updateBar();
    }
    tid.area.addEventListener('input', change);
    ten.area.addEventListener('input', change);
    reset.addEventListener('click', function () {
      pending[row.k] = { id: row.id, en: row.en };
      tid.area.value = row.id; ten.area.value = row.en;
      el.classList.add('is-dirty');
      updateBar();
    });
    return el;
  }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' ').trim(); }
  function field(label, value) {
    var l = document.createElement('label');
    var s = document.createElement('span'); s.textContent = label;
    var a = document.createElement('textarea'); a.value = value; a.rows = Math.max(2, Math.min(7, Math.ceil(value.length / 38)));
    a.spellcheck = true;
    l.appendChild(s); l.appendChild(a);
    return { label: l, area: a };
  }
  $('.js-page').addEventListener('change', function (e) { currentFile = e.target.value; renderRows(); });
  var qTimer;
  $('.js-q').addEventListener('input', function () { clearTimeout(qTimer); qTimer = setTimeout(renderRows, 200); });
  $('.js-only').addEventListener('change', renderRows);

  /* ---------- pengaturan ---------- */
  function setting(path, fallback) {
    var cur = remote.settings;
    for (var i = 0; i < path.length; i++) { if (cur == null) break; cur = cur[path[i]]; }
    return cur != null ? cur : fallback;
  }
  function renderSettings() {
    $('.js-wa').value = setting(['waNumber'], C.waNumber || '');
    var pr = $('.js-prices'); pr.innerHTML = '';
    Object.keys(PRICE_LABELS).forEach(function (k) {
      var l = document.createElement('label'); l.className = 'field';
      var s = document.createElement('span'); s.textContent = PRICE_LABELS[k];
      var i = document.createElement('input'); i.type = 'number'; i.min = 0; i.step = 1000; i.dataset.price = k;
      i.value = setting(['prices', k], (C.prices || {})[k] != null ? C.prices[k] : '');
      l.appendChild(s); l.appendChild(i); pr.appendChild(l);
    });
    $('.js-deadline').value = setting(['payment', 'deadlineHours'], (C.payment || {}).deadlineHours || 24);
    var banks = setting(['payment', 'banks'], (C.payment || {}).banks || []);
    $('.js-banks').innerHTML = '';
    (banks.length ? banks : [{}]).forEach(addBank);
    $('.js-qris').value = setting(['payment', 'qrisImage'], (C.payment || {}).qrisImage || '');
    var booked = setting(['booked'], (C.batches || {}).booked || null);
    $('.js-booked').value = booked ? JSON.stringify(booked, null, 2) : '';
  }
  function addBank(b) {
    b = b || {};
    var row = document.createElement('div'); row.className = 'bank';
    [['bank', 'Bank'], ['number', 'Nomor rekening'], ['holder', 'Atas nama']].forEach(function (f) {
      var i = document.createElement('input'); i.type = 'text'; i.placeholder = f[1]; i.setAttribute('aria-label', f[1]);
      i.dataset.f = f[0]; i.value = b[f[0]] || ''; row.appendChild(i);
    });
    var x = document.createElement('button'); x.type = 'button'; x.className = 'btn btn--ghost btn--sm'; x.textContent = 'Hapus'; x.setAttribute('aria-label', 'Hapus rekening');
    x.addEventListener('click', function () { row.remove(); markSettings(); });
    row.appendChild(x);
    $('.js-banks').appendChild(row);
  }
  $('.js-add-bank').addEventListener('click', function () { if ($('.js-banks').children.length < 6) { addBank({}); markSettings(); } });
  $('.js-tab-settings').addEventListener('input', markSettings);
  function markSettings() { settingsDirty = true; updateBar(); }

  function collectSettings() {
    var err = $('.js-set-err'); err.textContent = '';
    var out = { waNumber: $('.js-wa').value.replace(/\D/g, ''), prices: {}, payment: { banks: [] } };
    document.querySelectorAll('[data-price]').forEach(function (i) { if (i.value !== '') out.prices[i.dataset.price] = Number(i.value); });
    if ($('.js-deadline').value) out.payment.deadlineHours = Number($('.js-deadline').value);
    document.querySelectorAll('.js-banks .bank').forEach(function (r) {
      var b = {}; r.querySelectorAll('input').forEach(function (i) { b[i.dataset.f] = i.value.trim(); });
      if (b.bank || b.number || b.holder) out.payment.banks.push(b);
    });
    out.payment.qrisImage = $('.js-qris').value.trim();
    var raw = $('.js-booked').value.trim();
    if (raw) {
      try { out.booked = JSON.parse(raw); } catch (e) { err.textContent = 'Kolom kursi manual bukan JSON yang valid.'; return null; }
    } else out.booked = {};
    return out;
  }

  /* ---------- simpan ---------- */
  function msg(text, ok) { var m = $('.js-msg'); m.textContent = text; m.classList.toggle('ok', !!ok); }
  function updateBar() {
    var n = Object.keys(pending).length;
    $('.js-save').disabled = !(n || settingsDirty);
    msg(n || settingsDirty ? (n ? n + ' teks diubah' : '') + (n && settingsDirty ? ' · ' : '') + (settingsDirty ? 'pengaturan diubah' : '') + ' — belum disimpan' : 'Belum ada perubahan.');
  }
  function originalOf(k) {
    for (var f in pageCache) { for (var i = 0; i < pageCache[f].length; i++) if (pageCache[f][i].k === k) return pageCache[f][i]; }
    return null;
  }
  $('.js-save').addEventListener('click', function () {
    var btn = $('.js-save');
    var changes = {}, n = 0;
    Object.keys(pending).forEach(function (k) {
      var o = originalOf(k), v = pending[k];
      if (!v.id.trim() && !v.en.trim()) return;
      changes[k] = (o && v.id === o.id && (o.q || v.en === o.en)) ? null : { id: v.id, en: v.en };
      n++;
    });
    var settings = settingsDirty ? collectSettings() : null;
    if (settingsDirty && !settings) return;
    btn.disabled = true; msg('Menyimpan…');
    var jobs = [];
    if (n) jobs.push(post('saveContent', changes).then(function (r) { r._k = 'c'; return r; }));
    if (settings) jobs.push(post('saveSettings', settings).then(function (r) { r._k = 's'; return r; }));
    Promise.all(jobs).then(function (res) {
      var bad = res.filter(function (r) { return !r.ok; })[0];
      if (bad) { msg(ERRORS[bad.error] || 'Gagal menyimpan.'); btn.disabled = false; return; }
      Object.keys(changes).forEach(function (k) { if (changes[k] === null) delete remote.content[k]; else remote.content[k] = changes[k]; });
      if (settings) remote.settings = settings;
      pending = {}; settingsDirty = false;
      H.cache({ content: remote.content, settings: remote.settings });
      msg('Tersimpan ✓ Muat ulang website untuk melihat hasilnya.', true);
      btn.disabled = true;
      renderRows();
    });
  });
  window.addEventListener('beforeunload', function (e) { if (Object.keys(pending).length || settingsDirty) { e.preventDefault(); e.returnValue = ''; } });
})();
