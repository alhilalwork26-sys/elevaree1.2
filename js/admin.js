/* Panel admin Elevaree — mengatur teks & pengaturan, terhubung langsung ke website utama
   (pratinjau langsung, pemeriksaan sambungan tiap halaman, tombol "Edit halaman ini" di website). */
(function () {
  'use strict';
  var C = window.ELEVAREE || {};
  var H = window.ELV_CONTENT;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

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
  ];
  var SCRIPTS = [
    ['js:main.js', 'Beranda — teks dinamis (katalog, journey, dll.)', 'index.html'],
    ['js:daftar.js', 'Pendaftaran — teks dinamis (langkah, ringkasan)', 'daftar.html'],
    ['js:tes-level.js', 'Tes level — teks dinamis (hasil, level)', 'tes-level.html'],
    ['quiz:tes-level.js', 'Tes level — soal & pilihan jawaban', 'tes-level.html'],
    ['js:config.js', 'Catatan libur / gelombang', 'index.html'],
  ];
  var PRICE_LABELS = { kids: 'English for Kids', teens: 'English for Teens', general: 'General English', ielts: 'IELTS & TOEFL Prep', business: 'Business English' };
  var TITLES = { ringkasan: 'Ringkasan', teks: 'Teks website', pengaturan: 'Pengaturan' };
  var ERRORS = {
    auth: 'Kata sandi salah.',
    locked: 'Terlalu banyak percobaan salah. Coba lagi 10 menit lagi.',
    'no-password': 'Kata sandi admin belum dibuat di Apps Script (Script properties → ADMIN_PASSWORD).',
    network: 'Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.',
    payload: 'Data tidak valid.',
    action: 'Perintah tidak dikenal.',
  };
  var STR = "'(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\"";

  var password = '';
  var remote = { content: {}, settings: {} };
  var loadOk = true;
  var pageCache = {};
  var pending = {};
  var currentFile = PAGES[0][0];
  var settingsDirty = false;
  var previewLang = 'id';
  var view = 'ringkasan';
  var savedLang = null;
  try { savedLang = localStorage.getItem('elv-lang'); } catch (e) { /* abaikan */ }

  /* ---------- util ---------- */
  var toastT;
  function toast(text) {
    var t = $('.js-toast');
    t.textContent = text; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' ').trim(); }
  function rp(n) { return 'Rp' + Number(n).toLocaleString('id-ID'); }
  function countUp(el, to) {
    to = Number(to) || 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || to === 0) { el.textContent = to; return; }
    var t0 = null;
    (function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 900, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
    setTimeout(function () { el.textContent = to; }, 1100);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.btn');
    if (!b || b.disabled) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    var rip = document.createElement('span');
    rip.className = 'rip';
    rip.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(rip); setTimeout(function () { rip.remove(); }, 650);
  });
  $('.js-theme').addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('elv-theme', next); } catch (e) { /* abaikan */ }
  });

  /* ---------- mode demo ----------
     Selama formEndpoint kosong, admin berjalan tanpa server: kata sandi demo, editan disimpan di
     localStorage browser ini saja (dibaca js/content.js). Kata sandi demo ini tampak di kode publik,
     jadi JANGAN dipakai untuk produksi — isi formEndpoint dan buat ADMIN_PASSWORD di Apps Script. */
  var DEMO = !C.formEndpoint;
  var DEMO_PASSWORD = 'Admin123';
  function demoRead() { try { return JSON.parse(localStorage.getItem('elv-content')) || { content: {}, settings: {} }; } catch (e) { return { content: {}, settings: {} }; } }
  function demoPost(action, payload) {
    if (password !== DEMO_PASSWORD) return Promise.resolve({ ok: false, error: 'auth' });
    if (action === 'saveContent') {
      var d = demoRead();
      Object.keys(payload).forEach(function (k) { if (payload[k] === null) delete d.content[k]; else d.content[k] = payload[k]; });
      H.cache(d);
    } else if (action === 'saveSettings') {
      var e = demoRead(); e.settings = payload; H.cache(e);
    }
    return Promise.resolve({ ok: true });
  }

  /* ---------- server ---------- */
  function post(action, payload) {
    if (DEMO) return demoPost(action, payload);
    var body = new URLSearchParams({ type: 'admin', password: password, action: action });
    if (payload !== undefined) body.set('payload', JSON.stringify(payload));
    return fetch(C.formEndpoint, { method: 'POST', body: body })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; });
  }
  function load() {
    if (DEMO) { var d = demoRead(); remote = { content: d.content || {}, settings: d.settings || {} }; return Promise.resolve(); }
    return fetch(C.formEndpoint + (C.formEndpoint.indexOf('?') >= 0 ? '&' : '?') + 'action=content&t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.ok) { remote = { content: d.content || {}, settings: d.settings || {} }; loadOk = true; } else loadOk = false; })
      .catch(function () { loadOk = false; });
  }

  /* ---------- masuk ---------- */
  function enter() {
    $('.js-gate').classList.add('is-out');
    setTimeout(function () { $('.js-gate').hidden = true; }, 600);
    $('.js-app').hidden = false;
    try { localStorage.setItem('elv-admin-on', '1'); } catch (e) { /* abaikan */ }
    load().then(function () {
      var dot = $('.js-src-dot'), txt = $('.js-src');
      if (DEMO) { dot.className = 'dot js-src-dot demo'; txt.textContent = 'Mode demo · di browser ini'; }
      else if (loadOk) { dot.className = 'dot js-src-dot ok'; txt.textContent = 'Terhubung ke Google Sheet'; }
      else { dot.className = 'dot js-src-dot bad'; txt.textContent = 'Server tidak merespons'; }
      buildPageSelect(); renderSettings(); route();
    });
  }
  if (DEMO) $('.js-login-demo').hidden = false;
  $('.js-login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('.js-login-err');
    password = $('.js-pw').value;
    err.textContent = 'Memeriksa…';
    post('verify').then(function (r) {
      if (r.ok) { try { sessionStorage.setItem('elv-admin', password); } catch (x) { /* abaikan */ } err.textContent = ''; enter(); }
      else {
        err.textContent = ERRORS[r.error] || 'Gagal masuk.';
        var c = $('.js-card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
      }
    });
  });
  $('.js-logout').addEventListener('click', function () {
    try { sessionStorage.removeItem('elv-admin'); localStorage.removeItem('elv-admin-on'); } catch (x) { /* abaikan */ }
    restoreLang();
    location.href = 'admin.html';
  });
  try {
    var saved = sessionStorage.getItem('elv-admin');
    if (saved) { password = saved; post('verify').then(function (r) { if (r.ok) enter(); else password = ''; }); }
  } catch (x) { /* abaikan */ }

  /* ---------- navigasi ---------- */
  function route() {
    var h = (location.hash || '#ringkasan').slice(1).split('/');
    var name = TITLES[h[0]] ? h[0] : 'ringkasan';
    if (name === 'teks' && h[1]) {
      var known = PAGES.concat(SCRIPTS).some(function (p) { return p[0] === decodeURIComponent(h[1]); });
      currentFile = known ? decodeURIComponent(h[1]) : PAGES[0][0];
    }
    show(name);
  }
  function show(name) {
    view = name;
    $$('.js-view').forEach(function (v) { v.hidden = v.dataset.view !== name; });
    $$('.js-nav a').forEach(function (a, i) {
      if (a.dataset.view === name) { a.setAttribute('aria-current', 'page'); $('.js-ind').style.transform = 'translateY(' + i * 46 + 'px)'; }
      else a.removeAttribute('aria-current');
    });
    $('.js-title').textContent = TITLES[name];
    window.scrollTo(0, 0);
    if (name === 'ringkasan') renderDash();
    if (name === 'teks') { $('.js-page').value = currentFile; renderRows(); setFrame(); }
  }
  window.addEventListener('hashchange', function () { if (!$('.js-app').hidden) route(); });

  /* ---------- ringkasan ---------- */
  function renderDash() {
    var n = Object.keys(remote.content).length;
    countUp($('[data-s=edits]'), n);
    var prices = Object.assign({}, C.prices || {}, (remote.settings || {}).prices || {});
    var vals = Object.keys(prices).map(function (k) { return Number(prices[k]); }).filter(isFinite);
    $('.js-price').textContent = vals.length ? rp(Math.min.apply(null, vals)) : '–';
    var wa = (remote.settings || {}).waNumber != null ? remote.settings.waNumber : (C.waNumber || '');
    $('.js-wastat').textContent = wa ? 'Terpasang' : 'Belum diisi';
    $('.js-wanum').textContent = wa ? '+' + wa : 'Isi di Pengaturan';

    var box = $('.js-pages'); box.innerHTML = '';
    var linked = 0;
    $('.js-of').textContent = 'dari ' + PAGES.length + ' halaman';
    $('[data-s=linked]').textContent = 0;
    PAGES.forEach(function (p, i) {
      var a = document.createElement('a');
      a.className = 'pg'; a.href = '#teks/' + p[0]; a.style.animation = 'fadeUp .5s var(--ease) both'; a.style.animationDelay = i * 30 + 'ms';
      var dot = document.createElement('i'); dot.className = 'dot';
      var nm = document.createElement('span'); nm.textContent = p[1];
      var em = document.createElement('em'); em.textContent = 'memeriksa…';
      a.appendChild(dot); a.appendChild(nm); a.appendChild(em); box.appendChild(a);
      fetch(p[0] + '?t=' + Date.now()).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
        var ok = /js\/content\.js/.test(html);
        dot.className = 'dot ' + (ok ? 'ok' : 'bad'); em.textContent = ok ? 'tersambung' : 'belum tersambung';
        if (ok) { linked++; $('[data-s=linked]').textContent = linked; }
      }).catch(function () { dot.className = 'dot bad'; em.textContent = 'gagal dimuat'; });
    });

    var list = $('.js-recent'); list.innerHTML = '';
    var keys = Object.keys(remote.content).reverse().slice(0, 6);
    if (!keys.length) { var e = document.createElement('li'); e.className = 'empty'; e.textContent = 'Belum ada teks yang diubah.'; list.appendChild(e); }
    keys.forEach(function (k, i) {
      var v = remote.content[k], li = document.createElement('li');
      li.style.animationDelay = i * 50 + 'ms';
      li.textContent = plain(v.id).slice(0, 80) || '(kosong)';
      if (v.en) { var s = document.createElement('small'); s.textContent = 'EN: ' + plain(v.en).slice(0, 80); li.appendChild(s); }
      list.appendChild(li);
    });
  }

  /* ---------- editor teks ---------- */
  function buildPageSelect() {
    var sel = $('.js-page'); sel.innerHTML = '';
    var g1 = document.createElement('optgroup'); g1.label = 'Halaman';
    PAGES.forEach(function (p) { var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; g1.appendChild(o); });
    var g2 = document.createElement('optgroup'); g2.label = 'Teks dari skrip';
    SCRIPTS.forEach(function (p) { var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; g2.appendChild(o); });
    sel.appendChild(g1); sel.appendChild(g2);
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
  function valueOf(row) { return pending[row.k] || remote.content[row.k] || { id: row.id, en: row.en }; }
  function isLive(row) { return !!remote.content[row.k]; }

  var renderToken = 0;
  function renderRows() {
    var box = $('.js-rows'), token = ++renderToken;
    box.innerHTML = '';
    for (var i = 0; i < 5; i++) { var sk = document.createElement('div'); sk.className = 'skel'; box.appendChild(sk); }
    scan(currentFile).then(function (rows) {
      if (token !== renderToken) return;
      var q = $('.js-q').value.trim().toLowerCase();
      var only = $('.js-only').checked;
      box.innerHTML = '';
      var shown = 0;
      rows.forEach(function (row) {
        var v = valueOf(row);
        if (only && !pending[row.k] && !isLive(row)) return;
        if (q && (v.id + ' ' + v.en + ' ' + row.id).toLowerCase().indexOf(q) < 0) return;
        var el = rowEl(row);
        el.style.setProperty('--n', Math.min(shown, 14));
        box.appendChild(el); shown++;
      });
      if (!shown) { var e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Tidak ada teks yang cocok.'; box.appendChild(e); }
    }).catch(function () { if (token === renderToken) box.innerHTML = '<div class="empty">Gagal membaca halaman ini.</div>'; });
  }
  function field(label, value) {
    var l = document.createElement('label');
    var s = document.createElement('span'); s.textContent = label;
    var a = document.createElement('textarea'); a.value = value; a.rows = Math.max(2, Math.min(7, Math.ceil(value.length / 34)));
    l.appendChild(s); l.appendChild(a);
    return { label: l, area: a };
  }
  function rowEl(row) {
    var el = document.createElement('div');
    var v = valueOf(row);
    el.className = 'row' + (pending[row.k] ? ' is-dirty' : '');
    var meta = document.createElement('div'); meta.className = 'row__meta';
    var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = row.ctx; meta.appendChild(tag);
    var state = document.createElement('span');
    function setState() {
      if (pending[row.k]) { state.className = 'tag tag--dirty'; state.textContent = 'belum disimpan'; }
      else if (isLive(row)) { state.className = 'tag tag--live'; state.textContent = 'sudah diubah'; }
      else { state.className = ''; state.textContent = ''; }
    }
    setState(); meta.appendChild(state); el.appendChild(meta);
    var cols = document.createElement('div'); cols.className = 'row__cols';
    var tid = field(row.q ? 'Teks' : 'Indonesia', v.id), ten = field('English', v.en);
    cols.appendChild(tid.label);
    if (row.q) cols.style.gridTemplateColumns = '1fr'; else cols.appendChild(ten.label);
    el.appendChild(cols);
    var foot = document.createElement('div'); foot.className = 'row__foot';
    var orig = document.createElement('span');
    var po = plain(row.id);
    orig.textContent = 'Asli: ' + po.slice(0, 70) + (po.length > 70 ? '…' : '');
    var reset = document.createElement('button'); reset.type = 'button'; reset.className = 'link'; reset.textContent = 'Kembalikan ke asli';
    foot.appendChild(orig); foot.appendChild(reset); el.appendChild(foot);

    function change() {
      pending[row.k] = { id: tid.area.value, en: row.q ? '' : ten.area.value };
      el.classList.add('is-dirty'); setState(); updateBar(); schedulePush();
    }
    tid.area.addEventListener('input', change);
    ten.area.addEventListener('input', change);
    tid.area.addEventListener('focus', function () { focusPreview(row, 'id'); });
    ten.area.addEventListener('focus', function () { focusPreview(row, 'en'); });
    reset.addEventListener('click', function () {
      pending[row.k] = { id: row.id, en: row.en };
      tid.area.value = row.id; ten.area.value = row.en;
      el.classList.add('is-dirty'); setState(); updateBar(); schedulePush();
    });
    return el;
  }
  $('.js-page').addEventListener('change', function (e) { location.hash = '#teks/' + e.target.value; });
  var qTimer;
  $('.js-q').addEventListener('input', function () { clearTimeout(qTimer); qTimer = setTimeout(renderRows, 200); });
  $('.js-only').addEventListener('change', renderRows);

  /* ---------- pratinjau langsung ---------- */
  var frame = $('.js-frame'), fw = $('.js-fw'), pushT;
  function previewFile() {
    for (var i = 0; i < SCRIPTS.length; i++) if (SCRIPTS[i][0] === currentFile) return SCRIPTS[i][2];
    return currentFile;
  }
  function setFrame() {
    var f = previewFile();
    $('.js-url').textContent = f;
    $('.js-open').href = f;
    fitFrame();
    if (frame.dataset.f === f) { pushDraft(); return; }
    fw.classList.remove('is-ready');
    frame.dataset.f = f;
    frame.src = f + '?preview=1';
  }
  /* desktop: halaman digambar selebar 1280px lalu diperkecil agar muat; HP: selebar 390px */
  function fitFrame() {
    var stage = $('.stage');
    if (!stage || !stage.clientWidth) return;
    var mobile = $('[data-pd=mobile]').getAttribute('aria-pressed') === 'true';
    var W = mobile ? 390 : 1280, avail = stage.clientWidth - 32, h = stage.clientHeight - 32;
    var s = Math.min(1, avail / W);
    fw.style.width = Math.round(W * s) + 'px';
    fw.style.height = h + 'px';
    frame.style.width = W + 'px';
    frame.style.height = Math.round(h / s) + 'px';
    frame.style.transform = s < 1 ? 'scale(' + s + ')' : '';
  }
  window.addEventListener('resize', fitFrame);
  function merged() { return Object.assign({}, remote.content, pending); }
  function pushDraft() {
    try { var w = frame.contentWindow; if (w && w.ELV_CONTENT && w.ELV_CONTENT.preview) w.ELV_CONTENT.preview(merged()); } catch (e) { /* belum siap */ }
  }
  function schedulePush() { clearTimeout(pushT); pushT = setTimeout(pushDraft, 120); }
  function setPreviewLang(l) {
    previewLang = l;
    $$('[data-pl]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pl === l); });
    try {
      var b = frame.contentDocument.querySelector('.lang__btn[data-lang="' + l + '"]');
      if (b && !b.classList.contains('is-active')) b.click();
      pushDraft();
    } catch (e) { /* belum siap */ }
  }
  function focusPreview(row, lang) {
    if (row.q) return;
    setPreviewLang(lang);
    try { frame.contentWindow.ELV_CONTENT.locate(row.k); } catch (e) { /* abaikan */ }
  }
  frame.addEventListener('load', function () {
    fitFrame();
    fw.classList.add('is-ready');
    pushDraft();
    if (previewLang === 'en') setPreviewLang('en');
  });
  $$('[data-pl]').forEach(function (b) { b.addEventListener('click', function () { setPreviewLang(b.dataset.pl); }); });
  $$('[data-pd]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-pd]').forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
      fitFrame();
    });
  });
  $('.js-reload').addEventListener('click', function () { fw.classList.remove('is-ready'); try { frame.contentWindow.location.reload(); } catch (e) { frame.src = frame.src; } });
  $$('.mtabs [data-pane]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.mtabs [data-pane]').forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
      $('.view--teks').dataset.pane = b.dataset.pane;
    });
  });
  function restoreLang() {
    try { if (savedLang == null) localStorage.removeItem('elv-lang'); else localStorage.setItem('elv-lang', savedLang); } catch (e) { /* abaikan */ }
  }
  window.addEventListener('pagehide', restoreLang);

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
  $('[data-view=pengaturan]').addEventListener('input', markSettings);
  function markSettings() { settingsDirty = true; updateBar(); }

  function collectSettings() {
    var err = $('.js-set-err'); err.textContent = '';
    var out = { waNumber: $('.js-wa').value.replace(/\D/g, ''), prices: {}, payment: { banks: [] } };
    $$('[data-price]').forEach(function (i) { if (i.value !== '') out.prices[i.dataset.price] = Number(i.value); });
    if ($('.js-deadline').value) out.payment.deadlineHours = Number($('.js-deadline').value);
    $$('.js-banks .bank').forEach(function (r) {
      var b = {}; $$('input', r).forEach(function (i) { b[i.dataset.f] = i.value.trim(); });
      if (b.bank || b.number || b.holder) out.payment.banks.push(b);
    });
    out.payment.qrisImage = $('.js-qris').value.trim();
    var raw = $('.js-booked').value.trim();
    if (raw) {
      try { out.booked = JSON.parse(raw); } catch (e) { err.textContent = 'Kolom kursi manual bukan JSON yang valid.'; location.hash = '#pengaturan'; return null; }
    } else out.booked = {};
    return out;
  }

  /* ---------- simpan ---------- */
  function msg(text, cls) {
    $('.js-msg').textContent = text;
    $('.js-state').className = 'state js-state' + (cls ? ' ' + cls : '');
    $('.js-state .dot').className = 'dot' + (cls === 'ok' ? ' ok' : '');
  }
  function updateBar() {
    var n = Object.keys(pending).length;
    $('.js-save').disabled = !(n || settingsDirty);
    if (n || settingsDirty) msg((n ? n + ' teks' : '') + (n && settingsDirty ? ' + ' : '') + (settingsDirty ? 'pengaturan' : '') + ' belum disimpan', 'is-dirty');
    else msg('Tidak ada perubahan');
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
    if (n) jobs.push(post('saveContent', changes));
    if (settings) jobs.push(post('saveSettings', settings));
    Promise.all(jobs).then(function (res) {
      var bad = res.filter(function (r) { return !r.ok; })[0];
      if (bad) { msg(ERRORS[bad.error] || 'Gagal menyimpan.', 'is-dirty'); toast(ERRORS[bad.error] || 'Gagal menyimpan.'); btn.disabled = false; return; }
      Object.keys(changes).forEach(function (k) { if (changes[k] === null) delete remote.content[k]; else remote.content[k] = changes[k]; });
      if (settings) remote.settings = settings;
      pending = {}; settingsDirty = false;
      H.cache({ content: remote.content, settings: remote.settings });
      msg('Tersimpan', 'ok');
      toast(DEMO ? 'Tersimpan di browser ini ✓' : 'Tersimpan ✓ Website menampilkannya saat dimuat ulang');
      btn.disabled = true;
      if (view === 'teks') { renderRows(); pushDraft(); }
      if (view === 'ringkasan') renderDash();
    });
  });
  window.addEventListener('beforeunload', function (e) { if (Object.keys(pending).length || settingsDirty) { e.preventDefault(); e.returnValue = ''; } });
})();
