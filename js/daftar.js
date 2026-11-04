/* Elevaree — alur pendaftaran: program → paket & jadwal → data diri → tinjau & bayar → pembayaran */
(() => {
  const C = window.ELEVAREE || {};
  const PAY = C.payment || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } },
    raw(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; },
  };
  let lang = document.documentElement.lang === 'en' ? 'en' : 'id';
  const t = (o) => (o == null ? '' : typeof o === 'string' ? o : o[lang] || o.id);
  const fmt = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Data ---------- */
  const PRICES = C.prices || {};
  const PROGS = [
    { key: 'kids', title: 'English for Kids', img: 'kids-trio.png', color: 'mustard', tag: { id: 'Usia 7–12 · Belajar sambil bermain', en: 'Ages 7–12 · Learn through play' } },
    { key: 'teens', title: 'English for Teens', img: 'teen-girl.png', color: 'lime', tag: { id: 'Usia 13–17 · Diskusi & presentasi', en: 'Ages 13–17 · Discussion & presentation' } },
    { key: 'general', title: 'General English', img: 'adult-man.png', color: 'sage', tag: { id: 'Dewasa · Percakapan sehari-hari', en: 'Adults · Everyday conversation' } },
    { key: 'ielts', title: 'IELTS & TOEFL Prep', img: 'scholar-man.png', color: 'peach', tag: { id: 'Pencari beasiswa · Strategi & simulasi tes', en: 'Scholarship seekers · Strategy & mock tests' } },
    { key: 'business', title: 'Business English', img: 'worker-woman.png', color: 'lilac', tag: { id: 'Pekerja · Meeting, email & interview', en: 'Professionals · Meetings, emails & interviews' } },
  ];
  const BT = window.ELV_BATCH;
  const SESSIONS = BT ? BT.sessions : 10;
  const WEEKS = Math.ceil(SESSIONS / 5);
  const PACKS = {
    trial: { name: { id: 'Kelas Percobaan', en: 'Trial Class' }, info: { id: '1 sesi · termasuk tes penempatan', en: '1 session · includes placement test' }, price: () => 0 },
    batch: { name: { id: 'Gelombang', en: 'Batch' }, info: { id: `${SESSIONS} sesi · ${WEEKS} minggu · Senin–Jumat`, en: `${SESSIONS} sessions · ${WEEKS} weeks · Mon–Fri` }, price: (p) => PRICES[p] || 0 },
  };
  const DAYS = [['sen', 'Sen', 'Mon'], ['sel', 'Sel', 'Tue'], ['rab', 'Rab', 'Wed'], ['kam', 'Kam', 'Thu'], ['jum', 'Jum', 'Fri'], ['sab', 'Sab', 'Sat'], ['min', 'Min', 'Sun']];
  const TIMES = [['pagi', 'Pagi', 'Morning'], ['siang', 'Siang', 'Afternoon'], ['sore', 'Sore', 'Late afternoon'], ['malam', 'Malam', 'Evening']];
  const banks = (PAY.banks || []).filter((b) => b.number);
  const METHODS = [
    { key: 'transfer', name: { id: 'Transfer bank', en: 'Bank transfer' }, info: (PAY.banks || []).map((b) => b.bank).join(', ') || 'Bank', icon: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 9l9-5 9 5M7 13v4M12 13v4M17 13v4"/>' },
    { key: 'qris', name: { id: 'QRIS', en: 'QRIS' }, info: { id: 'GoPay, OVO, DANA, ShopeePay, m-banking', en: 'GoPay, OVO, DANA, ShopeePay, mobile banking' }, icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3M14 21h1"/><path class="ico-scan" d="M2 12h20"/>' },
    PAY.gatewayEndpoint && { key: 'gateway', name: { id: 'Bayar online', en: 'Pay online' }, info: { id: 'Kartu, virtual account, e-wallet', en: 'Card, virtual account, e-wallet' }, icon: '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>' },
  ].filter(Boolean);

  const TX = {
    from: { id: 'mulai', en: 'from' }, perMonth: { id: '/gelombang', en: '/batch' }, free: { id: 'Gratis', en: 'Free' },
    pack: { id: 'Paket', en: 'Package' }, schedule: { id: 'Jadwal', en: 'Schedule' }, learner: { id: 'Peserta', en: 'Learner' },
    contact: { id: 'Kontak', en: 'Contact' }, subtotal: { id: 'Subtotal', en: 'Subtotal' }, discount: { id: 'Diskon', en: 'Discount' },
    unique: { id: 'Kode unik', en: 'Unique code' }, edit: { id: 'Ubah', en: 'Edit' }, flexible: { id: 'Fleksibel', en: 'Flexible' },
    next: { id: 'Lanjut', en: 'Continue' }, order: { id: 'Buat pesanan', en: 'Place order' }, sendTrial: { id: 'Kirim pendaftaran', en: 'Submit registration' },
    trialTitle: { id: 'Konfirmasi pendaftaran', en: 'Confirm registration' }, trialEyebrow: { id: 'Tinjau', en: 'Review' },
    payTitle: { id: 'Sedikit lagi!', en: 'Almost there!' }, payEyebrow: { id: 'Tinjau & bayar', en: 'Review & payment' },
    noteTrial: { id: 'Kelas percobaan tidak dipungut biaya.', en: 'The trial class is free of charge.' },
    notePrice: { id: 'Harga dalam Rupiah, sudah termasuk materi.', en: 'Prices in IDR, materials included.' },
    errName: { id: 'Mohon isi nama lengkap.', en: 'Please enter your full name.' },
    errChild: { id: 'Mohon isi nama anak.', en: "Please enter your child's name." },
    errAge: { id: 'Usia 4–17 tahun.', en: 'Age 4–17.' },
    errWa: { id: 'Nomor WhatsApp belum valid, contoh: 0812-3456-7890.', en: 'Enter a valid WhatsApp number, e.g. 0812-3456-7890.' },
    errEmail: { id: 'Mohon isi email yang valid untuk bukti pembayaran.', en: 'Please enter a valid email for your receipt.' },
    errEmailFmt: { id: 'Format email belum benar.', en: 'Please check the email format.' },
    errAgree: { id: 'Centang persetujuan ini untuk melanjutkan.', en: 'Please tick this to continue.' },
    errTime: { id: 'Pilih minimal satu waktu belajar.', en: 'Pick at least one preferred time.' },
    promoOk: { id: 'Kode promo dipakai.', en: 'Promo code applied.' }, promoBad: { id: 'Kode promo tidak ditemukan.', en: 'Promo code not found.' },
    promoTrial: { id: 'Kode promo hanya untuk paket berbayar.', en: 'Promo codes apply to paid packages only.' },
    copied: { id: 'Disalin!', en: 'Copied!' },
    noBatch: { id: 'Belum ada gelombang yang dibuka untuk program ini. Tanyakan lewat WhatsApp.', en: 'No batch is open for this programme yet. Ask us on WhatsApp.' },
    errSlot: { id: 'Pilih gelombang dan jam kelas dulu.', en: 'Please choose a batch and a class time.' },
    batchGone: { id: 'Gelombang atau jam kelas yang kamu pilih sudah tidak tersedia. Silakan pilih lagi.', en: 'The batch or class time you chose is no longer available. Please choose again.' },
    seatsLeft: { id: 'kursi tersisa', en: 'seats left' }, seatLeft: { id: 'kursi tersisa', en: 'seat left' }, fullTxt: { id: 'Penuh', en: 'Full' },
    registerBy: { id: 'daftar s.d.', en: 'register by' },
    batchRow: { id: 'Gelombang', en: 'Batch' }, timeRow: { id: 'Jam kelas', en: 'Class time' },
    stOpen: { id: 'Dibuka', en: 'Open' }, stLow: { id: 'Hampir penuh', en: 'Almost full' }, stFull: { id: 'Penuh', en: 'Full' },
    wlAsk: { id: 'Gelombang atau jam yang kamu cari penuh?', en: 'Is the batch or time you want full?' },
    wlLink: { id: 'Tanya daftar tunggu via WhatsApp', en: 'Ask about the waitlist on WhatsApp' },
    nameLabelChild: { id: 'Nama orang tua / wali', en: "Parent / guardian's name" }, nameLabel: { id: 'Nama lengkap', en: 'Full name' },
  };

  /* ---------- Elemen ---------- */
  const steps = $$('.reg-step');
  const form = $('.reg-form');
  const nextBtn = $('.js-next');
  const backBtn = $('.js-back');
  const finalEl = $('.reg-step--final');

  /* ---------- Status ---------- */
  const blank = { step: 0, program: '', pack: '', batch: '', slot: '', days: [], times: [], who: 'self', name: '', child: '', age: '', wa: '', email: '', note: '', promo: '', method: METHODS[0] ? METHODS[0].key : 'transfer' };
  let state = Object.assign({}, blank, store.get('elv-reg') || {});
  let order = store.get('elv-order');
  // data dari versi lama (paket Bulanan/Program Penuh) tidak dipakai lagi
  if (!PACKS[state.pack]) state.pack = '';
  if (order && !PACKS[order.pack]) { order = null; store.del('elv-order'); }
  const params = new URLSearchParams(location.search);
  if (params.get('program') && PROGS.some((p) => p.key === params.get('program'))) { state.program = params.get('program'); if (state.step === 0) state.step = 1; }
  if (params.get('paket') && PACKS[params.get('paket')]) state.pack = params.get('paket');
  // dari jadwal gelombang di halaman program: gelombang & jam kelas langsung terpilih
  if (params.get('gelombang') && state.program && BT) {
    const pb = BT.find(state.program, params.get('gelombang'));
    const ps = pb && pb.phase === 'open' && pb.slots.find((x) => x.id === params.get('slot') && !x.full);
    if (pb && pb.phase === 'open') { state.pack = 'batch'; state.batch = pb.key; state.slot = ps ? ps.id : ''; state.step = ps ? 2 : 1; }
  }
  if (params.get('kelas')) state.note = '';
  if (params.get('kelas') && !state.note) state.note = (lang === 'en' ? 'Interested in: ' : 'Tertarik kelas: ') + params.get('kelas');
  if (state.step > 3) state.step = 3;
  const save = () => store.set('elv-reg', state);

  /* ---------- Harga ---------- */
  const isTrial = () => state.pack === 'trial';
  const subtotal = () => (state.program && state.pack ? PACKS[state.pack].price(state.program) : 0);
  const discount = (sub) => {
    const p = state.promo && (C.promos || {})[state.promo];
    if (!p || !sub) return 0;
    return Math.min(sub, p.type === 'percent' ? Math.round(sub * p.value) : p.value);
  };
  const total = () => { const s = subtotal(); return s - discount(s); };

  /* ---------- Bahasa & tema ---------- */
  const original = new WeakMap();
  const titleId = document.title;
  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    $$('[data-en]').forEach((el) => {
      if (!original.has(el)) original.set(el, el.innerHTML);
      el.innerHTML = next === 'en' ? el.dataset.en : original.get(el);
    });
    $$('[data-en-ph]').forEach((el) => { if (!el.dataset.idPh) el.dataset.idPh = el.placeholder; el.placeholder = next === 'en' ? el.dataset.enPh : el.dataset.idPh; });
    $$('[data-en-label]').forEach((el) => { if (!el.dataset.idLabel) el.dataset.idLabel = el.getAttribute('aria-label'); el.setAttribute('aria-label', next === 'en' ? el.dataset.enLabel : el.dataset.idLabel); });
    document.title = next === 'en' ? document.documentElement.dataset.titleEn : titleId;
    $$('.lang__btn').forEach((b) => { b.classList.toggle('is-active', b.dataset.lang === next); b.setAttribute('aria-pressed', b.dataset.lang === next); });
    renderAll();
  }
  $$('.lang__btn').forEach((b) => b.addEventListener('click', () => { store.raw('elv-lang', b.dataset.lang); applyLang(b.dataset.lang); }));
  $('.theme-btn').addEventListener('click', () => {
    const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', n);
    store.raw('elv-theme', n);
  });

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 1800);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) { /* abaikan */ } ta.remove();
    }
    toast(t(TX.copied));
  }

  /* ---------- Render pilihan ---------- */
  const CHECK = '<span class="opt__check"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></span>';
  function renderPrograms() {
    $('.js-programs').innerHTML = PROGS.map((p, i) => `
      <button type="button" class="opt${state.program === p.key ? ' is-on' : ''}" role="radio" aria-checked="${state.program === p.key}" data-program="${p.key}" style="--i:${i}">
        <span class="opt__thumb bg-${p.color}"><img src="assets/img/${p.img}" alt="" /></span>
        <span class="opt__body"><b>${esc(p.title)}</b><small>${esc(t(p.tag))}</small></span>
        <span class="opt__price"><small>${t(TX.from)}</small>${fmt(PRICES[p.key] || 0)}<small>${t(TX.perMonth)}</small></span>
        ${CHECK}
      </button>`).join('');
  }
  function renderPacks() {
    const prog = state.program;
    $('.js-packs').innerHTML = Object.entries(PACKS).map(([k, pk], i) => {
      const price = prog ? pk.price(prog) : 0;
      const was = pk.was && prog ? pk.was(prog) : 0;
      return `
      <button type="button" class="opt opt--pack${state.pack === k ? ' is-on' : ''}" role="radio" aria-checked="${state.pack === k}" data-pack="${k}" style="--i:${i}">
        ${pk.badge ? `<span class="opt__badge">${esc(t(pk.badge))}</span>` : ''}
        <span class="opt__body"><b>${esc(t(pk.name))}</b><small>${esc(t(pk.info))}</small></span>
        <span class="opt__price">${price ? fmt(price) : t(TX.free)}${was ? `<s>${fmt(was)}</s>` : ''}</span>
        ${CHECK}
      </button>`;
    }).join('');
  }
  function renderChips() {
    $('.js-days').innerHTML = DAYS.map(([k, i, e]) => `<label><input type="checkbox" value="${k}" ${state.days.includes(k) ? 'checked' : ''} /><span>${lang === 'en' ? e : i}</span></label>`).join('');
    $('.js-times').innerHTML = TIMES.map(([k, i, e]) => `<label><input type="checkbox" value="${k}" ${state.times.includes(k) ? 'checked' : ''} /><span>${lang === 'en' ? e : i}</span></label>`).join('');
  }
  const CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
  const openBatches = (program) => (BT ? BT.forProgram(program, { limit: 5 }).filter((b) => b.phase === 'open') : []);
  function renderBatchPicker() {
    const isBatch = state.pack === 'batch';
    $('.js-batch-wrap').hidden = !isBatch;
    $('.js-trial-only').hidden = state.pack !== 'trial';
    if (!isBatch) return;
    const list = openBatches(state.program);
    if (!list.some((b) => b.key === state.batch)) { const first = list.find((b) => b.joinable); state.batch = first ? first.key : ''; state.slot = ''; save(); }
    const stLabel = { open: t(TX.stOpen), low: t(TX.stLow), full: t(TX.stFull) };
    $('.js-batches').innerHTML = list.length ? list.map((b, i) => {
      const full = b.status === 'full';
      const noteTxt = b.note ? ` · ${BT.tt(b.note, lang)}` : '';
      return `
      <button type="button" class="opt opt--batch${state.batch === b.key ? ' is-on' : ''}${full ? ' is-disabled' : ''}" role="radio" aria-checked="${state.batch === b.key}" ${full ? 'aria-disabled="true"' : ''} data-batch="${b.key}" style="--i:${i}">
        <span class="opt__body"><b>${esc(BT.range(b, lang))}</b><small>${SESSIONS} ${lang === 'en' ? 'sessions' : 'sesi'} · ${lang === 'en' ? 'Mon–Fri' : 'Senin–Jumat'} · ${t(TX.registerBy)} ${BT.day(b.closeAt, lang)}${esc(noteTxt)}</small></span>
        <span class="chip-st is-${b.status}">${stLabel[b.status]}</span>
        ${CHECK}
      </button>`;
    }).join('') : `<p class="reg-note">${t(TX.noBatch)}</p>`;
    const cur = list.find((b) => b.key === state.batch);
    if (cur && !cur.slots.some((x) => x.id === state.slot && !x.full)) { state.slot = ''; save(); }
    $('.js-slot-wrap').hidden = !cur;
    $('.js-slots').innerHTML = cur ? cur.slots.map((x, i) => {
      const seats = x.full ? t(TX.fullTxt) : `${x.left} ${x.left === 1 ? t(TX.seatLeft) : t(TX.seatsLeft)}`;
      return `
      <button type="button" class="opt opt--slot${state.slot === x.id ? ' is-on' : ''}${x.full ? ' is-disabled' : ''}" role="radio" aria-checked="${state.slot === x.id}" ${x.full ? 'aria-disabled="true"' : ''} data-slot="${x.id}" style="--i:${i}">
        <span class="opt__icon">${CLOCK}</span>
        <span class="opt__body"><b>${t(BT.TIME_NAME[x.time])} · ${BT.timeLabel(x)} WIB</b><small>${esc(x.teacher || '')} · <span class="seat-${x.full ? 'full' : x.low ? 'low' : 'ok'}">${seats}</span></small></span>
        ${CHECK}
      </button>`;
    }).join('') : '';
    $('.js-batch-note').innerHTML = `${t(TX.wlAsk)} <a href="#" class="js-wl">${t(TX.wlLink)}</a>`;
  }
  function renderPay() {
    $('.js-pay').innerHTML = METHODS.map((m, i) => `
      <button type="button" class="opt opt--pay${state.method === m.key ? ' is-on' : ''}" role="radio" aria-checked="${state.method === m.key}" data-method="${m.key}" style="--i:${i}">
        <span class="opt__icon"><svg viewBox="0 0 24 24">${m.icon}</svg></span>
        <span class="opt__body"><b>${esc(t(m.name))}</b><small>${esc(t(m.info))}</small></span>
        ${CHECK}
      </button>`).join('');
  }
  const progOf = (k) => PROGS.find((p) => p.key === k);
  // data gelombang dari pilihan saat ini (state) atau dari pesanan yang sudah dibuat (disimpan lengkap)
  function batchData(src) {
    if (src.pack !== 'batch' || !src.batch || !BT) return null;
    if (src.batchStart) return { start: BT.parse(src.batchStart), end: BT.parse(src.batchEnd), slot: { time: src.slotTime, start: src.slotStart, end: src.slotEnd, teacher: src.teacher } };
    const b = BT.find(src.program, src.batch);
    const sl = b && b.slots.find((x) => x.id === src.slot);
    return b && sl ? { start: b.start, end: b.end, slot: sl, batch: b } : null;
  }
  const slotText = (d) => `${t(BT.TIME_NAME[d.slot.time])} ${BT.timeLabel(d.slot)} WIB`;
  const scheduleText = (o = state) => {
    if (o.pack === 'batch') {
      const d = batchData(o);
      return d ? `${BT.range(d, lang)} · ${slotText(d)}` : t(TX.flexible);
    }
    const d = o.days.map((k) => { const r = DAYS.find((x) => x[0] === k); return lang === 'en' ? r[2] : r[1]; }).join(', ');
    const tm = o.times.map((k) => { const r = TIMES.find((x) => x[0] === k); return lang === 'en' ? r[2] : r[1]; }).join(', ');
    return [d, tm].filter(Boolean).join(' · ') || t(TX.flexible);
  };
  const scheduleRows = (o = state) => {
    if (o.pack === 'batch') {
      const d = batchData(o);
      if (d) return [[t(TX.batchRow), BT.range(d, lang)], [t(TX.timeRow), slotText(d)]];
    }
    return [[t(TX.schedule), scheduleText(o)]];
  };
  function renderReview() {
    const p = progOf(state.program);
    const rows = [
      ['Program', p ? p.title : '—', 0],
      [t(TX.pack), state.pack ? `${t(PACKS[state.pack].name)} · ${t(PACKS[state.pack].info)}` : '—', 1],
      [t(TX.schedule), scheduleText(), 1],
      [t(TX.learner), state.who === 'child' ? `${state.child} (${state.age} ${lang === 'en' ? 'y.o.' : 'thn'}) — ${state.name}` : state.name, 2],
      [t(TX.contact), [state.wa, state.email].filter(Boolean).join(' · '), 2],
    ];
    $('.js-review').innerHTML = rows.map(([k, v, s]) => `
      <div class="review__row"><span>${esc(k)}</span><b>${esc(v || '—')}</b><button type="button" class="review__edit" data-goto="${s}">${t(TX.edit)}</button></div>`).join('');
    const trial = isTrial();
    $('.js-promo-wrap').hidden = trial || !Object.keys(C.promos || {}).length;
    $('.js-pay-wrap').hidden = trial;
    $('.js-step3-title').textContent = trial ? t(TX.trialTitle) : t(TX.payTitle);
    $('.js-step3-eyebrow').textContent = trial ? t(TX.trialEyebrow) : t(TX.payEyebrow);
    $('#r-promo').value = state.promo;
  }

  /* ---------- Ringkasan (samping & bawah) ---------- */
  let shownTotal = 0;
  let tweenRaf = 0;
  function tweenTotal(to) {
    const els = [$('.js-sum-total'), $('.js-nav-total')];
    if (reduceMotion) { els.forEach((e) => { e.textContent = to ? fmt(to) : t(TX.free); }); shownTotal = to; return; }
    cancelAnimationFrame(tweenRaf);
    const from = shownTotal; const start = performance.now();
    const step = (now) => {
      const k = Math.max(0, Math.min((now - start) / 500, 1));
      const v = from + (to - from) * (1 - Math.pow(1 - k, 3));
      shownTotal = v;
      els.forEach((e) => { e.textContent = to === 0 && k === 1 ? (state.pack ? t(TX.free) : 'Rp0') : fmt(v); });
      if (k < 1) tweenRaf = requestAnimationFrame(step);
    };
    tweenRaf = requestAnimationFrame(step);
    els.forEach((e) => { e.classList.remove('is-bump'); void e.offsetWidth; e.classList.add('is-bump'); });
  }
  function renderSummary() {
    // di langkah pembayaran, ringkasan membaca dari pesanan yang sudah dibuat
    const o = state.step === 4 && order ? order : null;
    const src = o || state;
    const p = progOf(src.program);
    const thumb = $('.reg-sum__thumb');
    thumb.className = 'reg-sum__thumb' + (p ? ` bg-${p.color}` : '');
    thumb.innerHTML = p ? `<img src="assets/img/${p.img}" alt="" />` : '';
    $('.js-sum-title').textContent = p ? p.title : (lang === 'en' ? 'No programme yet' : 'Belum pilih program');
    $('.js-sum-pack').textContent = src.pack ? `${t(PACKS[src.pack].name)} · ${t(PACKS[src.pack].info)}` : '—';
    const trial = src.pack === 'trial';
    const sub = o ? o.subtotal : subtotal();
    const disc = o ? o.discount : discount(sub);
    const promo = o ? o.promo : state.promo;
    const rows = scheduleRows(src);
    if (src.pack && !trial) rows.push([t(TX.subtotal), fmt(sub)]);
    if (disc) rows.push([`${t(TX.discount)} (${promo})`, '−' + fmt(disc)]);
    if (o && o.unique) rows.push([t(TX.unique), '+' + fmt(o.unique)]);
    $('.js-sum-rows').innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('.js-sum-note').textContent = src.pack ? (trial ? t(TX.noteTrial) : t(TX.notePrice)) : '';
    tweenTotal(o ? o.total : sub - disc);
  }

  function renderAll() {
    renderPrograms(); renderPacks(); renderBatchPicker(); renderChips(); renderPay(); renderReview(); renderSummary(); updateNav();
    $('.js-name-label').textContent = state.who === 'child' ? t(TX.nameLabelChild) : t(TX.nameLabel);
    $('.js-email-opt').hidden = !!state.pack && !isTrial();
    if (state.step === 4 && order) renderFinal();
  }

  /* ---------- Isian data diri ---------- */
  function fillForm() {
    ['name', 'child', 'age', 'wa', 'email', 'note'].forEach((k) => { form.elements[k].value = state[k] || ''; });
    form.querySelector(`input[name="who"][value="${state.who}"]`).checked = true;
    $('.child-only', form).hidden = state.who !== 'child';
  }
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.name in state) state[el.name] = el.value;
    if (el.name === 'who') { state.who = el.value; $('.child-only', form).hidden = state.who !== 'child'; $('.js-name-label').textContent = state.who === 'child' ? t(TX.nameLabelChild) : t(TX.nameLabel); }
    const f = el.closest('.ufield'); if (f) { f.classList.remove('is-invalid'); const er = $('.err', f); if (er) er.textContent = ''; }
    save(); updateNav();
  });
  $$('input[name="who"]', form).forEach((r) => r.addEventListener('change', () => {
    state.who = r.value; $('.child-only', form).hidden = state.who !== 'child';
    $('.js-name-label').textContent = state.who === 'child' ? t(TX.nameLabelChild) : t(TX.nameLabel); save();
  }));
  const normWa = (v) => { let d = String(v).replace(/\D/g, ''); if (d.startsWith('0')) d = '62' + d.slice(1); else if (d.startsWith('8')) d = '62' + d; return d; };
  function validateData() {
    let first = null;
    const bad = (name, msg) => {
      const el = form.elements[name]; const f = el.closest('.ufield');
      f.classList.add('is-invalid'); $('.err', f).textContent = t(msg); if (!first) first = el;
    };
    $$('.ufield', form).forEach((f) => { f.classList.remove('is-invalid'); const er = $('.err', f); if (er) er.textContent = ''; });
    if (state.name.trim().length < 2) bad('name', TX.errName);
    if (state.who === 'child') {
      if (state.child.trim().length < 2) bad('child', TX.errChild);
      const a = parseInt(state.age, 10); if (!(a >= 4 && a <= 17)) bad('age', TX.errAge);
    }
    const wa = normWa(state.wa); if (wa.length < 10 || wa.length > 15) bad('wa', TX.errWa);
    const email = state.email.trim(); const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!isTrial() && !okEmail) bad('email', email ? TX.errEmailFmt : TX.errEmail);
    else if (email && !okEmail) bad('email', TX.errEmailFmt);
    if (first) first.focus();
    return !first;
  }

  /* ---------- Klik pilihan ---------- */
  document.addEventListener('click', (e) => {
    const prog = e.target.closest('[data-program]');
    if (prog) { if (state.program !== prog.dataset.program) { state.batch = ''; state.slot = ''; } state.program = prog.dataset.program; save(); renderPrograms(); renderPacks(); renderSummary(); updateNav(); return; }
    const pk = e.target.closest('[data-pack]');
    if (pk) { state.pack = pk.dataset.pack; if (isTrial()) state.promo = ''; save(); renderPacks(); renderBatchPicker(); renderSummary(); renderAllLabels(); updateNav(); return; }
    const bt = e.target.closest('[data-batch]');
    if (bt) { if (bt.classList.contains('is-disabled')) return; state.batch = bt.dataset.batch; state.slot = ''; save(); renderBatchPicker(); renderSummary(); updateNav(); return; }
    const sl = e.target.closest('[data-slot]');
    if (sl) { if (sl.classList.contains('is-disabled')) return; state.slot = sl.dataset.slot; save(); renderBatchPicker(); renderSummary(); updateNav(); return; }
    const wl = e.target.closest('.js-wl');
    if (wl) {
      e.preventDefault();
      const pr = progOf(state.program);
      openWa(lang === 'en' ? `Hi Elevaree! The batch or class time I want for ${pr ? pr.title : 'a programme'} is full. Could I join the waitlist or find another option?` : `Halo Elevaree! Gelombang atau jam kelas yang saya mau untuk ${pr ? pr.title : 'program ini'} penuh. Boleh masuk daftar tunggu atau dicarikan pilihan lain?`);
      return;
    }
    const m = e.target.closest('[data-method]');
    if (m) { state.method = m.dataset.method; save(); renderPay(); return; }
    const go = e.target.closest('[data-goto]');
    if (go) { goTo(parseInt(go.dataset.goto, 10)); return; }
    const cp = e.target.closest('[data-copy]');
    if (cp) { copy(cp.dataset.copy); }
  });
  function renderAllLabels() { $('.js-email-opt').hidden = !!state.pack && !isTrial(); }
  [['.js-days', 'days'], ['.js-times', 'times']].forEach(([sel, key]) => {
    $(sel).addEventListener('change', () => {
      state[key] = $$(`${sel} input:checked`).map((c) => c.value);
      save(); renderSummary(); updateNav();
      $('.js-times').closest('.reg-field').classList.remove('is-invalid');
    });
  });
  $('.js-consult').addEventListener('click', (e) => {
    e.preventDefault();
    openWa(lang === 'en' ? "Hi Elevaree! I'm not sure which programme fits me. Could you help me choose?" : 'Halo Elevaree! Saya masih bingung memilih program. Boleh dibantu rekomendasinya?');
  });

  /* ---------- Promo ---------- */
  $('.js-promo-apply').addEventListener('click', () => {
    const code = $('#r-promo').value.trim().toUpperCase();
    const msg = $('.promo__msg');
    if (!code) { state.promo = ''; msg.textContent = ''; save(); renderSummary(); return; }
    if (isTrial()) { msg.textContent = t(TX.promoTrial); msg.className = 'promo__msg is-bad'; return; }
    if ((C.promos || {})[code]) { state.promo = code; msg.textContent = t(TX.promoOk); msg.className = 'promo__msg is-ok'; }
    else { state.promo = ''; msg.textContent = t(TX.promoBad); msg.className = 'promo__msg is-bad'; }
    save(); renderSummary();
  });

  /* ---------- Navigasi langkah ---------- */
  function stepValid(i) {
    if (i === 0) return !!state.program;
    if (i === 1) return !!state.pack && (state.pack === 'batch' ? !!(state.batch && state.slot) : state.times.length > 0);
    return true;
  }
  function updateNav() {
    const s = state.step;
    $('.reg-nav').hidden = s === 4;
    backBtn.hidden = s === 0;
    nextBtn.disabled = s === 0 ? !state.program : s === 1 ? (!state.pack || (state.pack === 'batch' && !(state.batch && state.slot))) : false;
    $('.js-next-label').textContent = s === 3 ? (isTrial() ? t(TX.sendTrial) : t(TX.order)) : t(TX.next);
    $('.js-step-no').textContent = Math.min(s + 1, 4);
    $('.reg-head__step').hidden = s === 4;
    document.body.style.setProperty('--progress', s === 4 ? 1 : (s + 0.5) / 4);
    $('.reg-resume').hidden = !(s === 0 && order && order.status === 'menunggu pembayaran' && Date.now() < order.deadline);
    if (order) $('.js-resume-id').textContent = order.id;
  }
  function goTo(i, push = true) {
    const from = state.step;
    if (i === from) return;
    const dir = i > from ? 1 : -1;
    const out = steps[from]; const inn = steps[i];
    state.step = i; if (i < 4) save();
    if (i === 3) renderReview();
    if (i === 4) renderFinal();
    renderSummary();
    updateNav();
    const show = () => {
      steps.forEach((s) => { s.hidden = s !== inn; s.classList.remove('is-out', 'is-in-left', 'is-in-right'); });
      inn.classList.add(dir > 0 ? 'is-in-right' : 'is-in-left');
      const h = $('h1, h2', inn); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    if (reduceMotion || !out) show();
    else { out.style.setProperty('--dir', dir); out.classList.add('is-out'); setTimeout(show, 220); }
    if (push) history.pushState({ step: i }, '', `#langkah-${i + 1}`);
  }
  window.addEventListener('popstate', (e) => {
    const s = e.state && typeof e.state.step === 'number' ? e.state.step : 0;
    if (state.step === 4 && s < 4 && order && order.status !== 'kelas percobaan') { history.pushState({ step: 4 }, '', '#langkah-5'); return; }
    goTo(s, false);
  });
  backBtn.addEventListener('click', () => {
    if (state.step === 0) return;
    // mundur satu langkah di dalam wizard (tidak bergantung pada riwayat browser, mis. saat dibuka dari tautan jadwal)
    goTo(state.step - 1, false);
    history.replaceState({ step: state.step }, '', `#langkah-${state.step + 1}`);
  });
  nextBtn.addEventListener('click', async () => {
    const s = state.step;
    if (s === 1 && state.pack === 'batch' && !(state.batch && state.slot)) { toast(t(TX.errSlot)); return; }
    if (s === 1 && state.pack === 'trial' && !state.times.length) { $('.js-times').closest('.reg-field').classList.add('is-invalid'); toast(t(TX.errTime)); return; }
    if (!stepValid(s)) return;
    if (s === 2 && !validateData()) return;
    if (s === 3) {
      if (!$('.js-agree').checked) { $('.js-agree-err').textContent = t(TX.errAgree); $('.js-agree').focus(); return; }
      if (form.elements.website.value) return; // bot
      nextBtn.classList.add('is-loading');
      await placeOrder();
      nextBtn.classList.remove('is-loading');
      return;
    }
    goTo(s + 1);
  });
  $('.js-agree').addEventListener('change', () => { $('.js-agree-err').textContent = ''; });

  /* ---------- Pesanan ---------- */
  const makeId = () => {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const r = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    return `ELV-${ymd}-${r}`;
  };
  const waUrl = (text) => `https://wa.me/${C.waNumber || ''}?text=${encodeURIComponent(text)}`;
  const openWa = (text) => window.open(waUrl(text), '_blank', 'noopener');
  const bText = (o) => { const d = batchData(o); return d ? BT.range(d, 'id') : ''; };
  const sText = (o) => { const d = batchData(o); return d ? `${BT.TIME_NAME[d.slot.time].id} ${BT.timeLabel(d.slot)}` : ''; };
  // hasil tes level (tes-level.html) ikut tercatat agar admin menempatkan murid di kelas yang tepat
  const levelText = () => { const l = store.get('elv-level'); return l && l.code ? `${l.code} (${l.score})` : ''; };
  async function toSheet(o, extra = {}) {
    if (!C.formEndpoint) return;
    const body = new URLSearchParams({
      type: 'order', orderId: o.id, status: o.status, program: progOf(o.program).title, package: t(PACKS[o.pack].name),
      days: o.days.join(', '), time: o.times.join(', '), batch: bText(o), slot: sText(o), batchKey: o.batch || '', slotId: o.slot || '', level: levelText(), for: o.who === 'child' ? 'anak' : 'sendiri', name: o.name, child: o.child, age: o.age,
      wa: normWa(o.wa), email: o.email, note: o.note, subtotal: o.subtotal, discount: o.discount, promo: o.promo, unique: o.unique, total: o.total,
      method: o.method, lang, page: location.href, sentAt: new Date().toISOString(), ...extra,
    });
    try { await fetch(C.formEndpoint, { method: 'POST', mode: 'no-cors', body }); } catch (e) { /* tetap lanjut lewat WhatsApp */ }
  }
  async function placeOrder() {
    const trial = isTrial();
    let bd = null;
    if (state.pack === 'batch') {
      // pastikan pilihan masih tersedia (halaman bisa terbuka lama) — kursi terbaru dari Google Sheets
      if (BT) await BT.loadSeats({ force: true });
      const cb = BT && BT.find(state.program, state.batch);
      const cs = cb && cb.slots.find((x) => x.id === state.slot);
      if (!cb || cb.phase !== 'open' || !cs || cs.full) { toast(t(TX.batchGone)); state.batch = ''; state.slot = ''; save(); renderAll(); goTo(1); return; }
      bd = { batch: cb, slot: cs };
    }
    const sub = subtotal(); const disc = discount(sub);
    const unique = !trial && PAY.uniqueCode !== false ? 100 + Math.floor(Math.random() * 900) : 0;
    order = {
      id: makeId(), createdAt: Date.now(), deadline: Date.now() + (PAY.deadlineHours || 24) * 3600e3,
      program: state.program, pack: state.pack, days: state.days.slice(), times: state.times.slice(), who: state.who,
      batch: bd ? bd.batch.key : '', batchStart: bd ? BT.iso(bd.batch.start) : '', batchEnd: bd ? BT.iso(bd.batch.end) : '',
      slot: bd ? bd.slot.id : '', slotTime: bd ? bd.slot.time : '', slotStart: bd ? bd.slot.start : '', slotEnd: bd ? bd.slot.end : '', teacher: bd ? bd.slot.teacher : '',
      name: state.name.trim(), child: state.child.trim(), age: state.age, wa: state.wa.trim(), email: state.email.trim(), note: state.note.trim(),
      subtotal: sub, discount: disc, promo: disc ? state.promo : '', unique, total: sub - disc + unique,
      method: trial ? 'trial' : state.method, status: trial ? 'kelas percobaan' : 'menunggu pembayaran',
    };
    store.set('elv-order', order);
    await Promise.all([toSheet(order), new Promise((r) => setTimeout(r, 700))]);
    if (!trial && order.method === 'gateway' && PAY.gatewayEndpoint) {
      try {
        const res = await fetch(PAY.gatewayEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
        const json = await res.json();
        if (json.redirect_url) { location.href = json.redirect_url; return; }
      } catch (e) { order.method = 'transfer'; store.set('elv-order', order); }
    }
    store.del('elv-reg');
    goTo(4);
  }

  /* ---------- Langkah akhir: pembayaran / selesai ---------- */
  let timer = 0;
  const pad = (n) => String(n).padStart(2, '0');
  function orderSummaryLines(o) {
    const L = lang === 'en';
    const lines = [
      `${L ? 'Order' : 'Pesanan'}: ${o.id}`,
      `Program: ${progOf(o.program).title}`,
      `${L ? 'Package' : 'Paket'}: ${t(PACKS[o.pack].name)} (${t(PACKS[o.pack].info)})`,
      `${L ? 'Schedule' : 'Jadwal'}: ${scheduleText(o)}`,
      o.who === 'child' ? `${L ? 'Learner' : 'Peserta'}: ${o.child} (${o.age} ${L ? 'y.o.' : 'thn'}) — ${L ? 'parent' : 'orang tua'}: ${o.name}` : `${L ? 'Name' : 'Nama'}: ${o.name}`,
    ];
    if (o.email) lines.push(`Email: ${o.email}`);
    if (o.note) lines.push(`${L ? 'Goal' : 'Tujuan'}: ${o.note}`);
    if (o.total) lines.push(`Total: ${fmt(o.total)}${o.discount ? ` (promo ${o.promo})` : ''}`);
    return lines;
  }
  function waMessage(o) {
    const L = lang === 'en';
    if (o.status === 'kelas percobaan') return [L ? "Hi Elevaree! I've registered for a free trial class." : 'Halo Elevaree! Saya sudah mendaftar kelas percobaan gratis.', '', ...orderSummaryLines(o)].join('\n');
    const head = L ? `Hi Elevaree! I've paid for order ${o.id} via ${o.method === 'qris' ? 'QRIS' : 'bank transfer'}. Here is my proof of payment:` : `Halo Elevaree! Saya sudah membayar pesanan ${o.id} lewat ${o.method === 'qris' ? 'QRIS' : 'transfer bank'}. Berikut bukti pembayarannya:`;
    return [head, '', ...orderSummaryLines(o), '', L ? '(attach payment screenshot)' : '(lampirkan foto bukti transfer)'].join('\n');
  }
  function renderFinal() {
    clearInterval(timer);
    const o = order; if (!o) return;
    const L = lang === 'en';
    const prog = progOf(o.program);
    const sumRows = `
      <dl class="final__rows">
        <div><dt>${L ? 'Order no.' : 'No. pesanan'}</dt><dd><button type="button" class="copyable" data-copy="${o.id}">${o.id}<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button></dd></div>
        <div><dt>Program</dt><dd>${esc(prog.title)} · ${esc(t(PACKS[o.pack].name))}</dd></div>
        <div><dt>${L ? 'Schedule' : 'Jadwal'}</dt><dd>${esc(scheduleText(o))}</dd></div>
      </dl>`;
    const check = '<svg class="done-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>';
    const home = `<a href="index.html" class="link-arrow">${L ? 'Back to home' : 'Kembali ke beranda'}</a>`;

    if (o.status === 'kelas percobaan') {
      finalEl.innerHTML = `
        <div class="final final--center">
          ${check}
          <p class="reg-eyebrow"><span>✓</span> ${L ? 'Registration received' : 'Pendaftaran diterima'}</p>
          <h1 class="reg-title">${L ? 'See you in class, ' : 'Sampai jumpa di kelas, '}${esc((o.who === 'child' && o.child ? o.child : o.name).split(' ')[0])}!</h1>
          <p class="reg-sub">${L ? 'Send your details on WhatsApp so our team can schedule your placement test and trial class.' : 'Kirim datamu lewat WhatsApp supaya tim kami bisa menjadwalkan tes penempatan dan kelas percobaanmu.'}</p>
          ${sumRows}
          <div class="final__actions"><a href="${waUrl(waMessage(o))}" target="_blank" rel="noopener" class="btn btn--wa">${WA_ICO}<span>${L ? 'Send on WhatsApp' : 'Kirim lewat WhatsApp'}</span></a>${home}</div>
        </div>`;
      return;
    }
    if (o.status === 'konfirmasi dikirim') {
      finalEl.innerHTML = `
        <div class="final final--center">
          <div class="hourglass" aria-hidden="true"><span></span></div>
          <p class="reg-eyebrow"><span>✓</span> ${L ? 'Payment confirmation sent' : 'Konfirmasi pembayaran terkirim'}</p>
          <h1 class="reg-title">${L ? 'Waiting for verification' : 'Menunggu verifikasi'}</h1>
          <p class="reg-sub">${L ? "We'll verify your payment and send your class schedule on WhatsApp." : 'Tim kami akan memverifikasi pembayaranmu dan mengirim jadwal kelas lewat WhatsApp.'}</p>
          ${sumRows}
          <div class="final__actions"><a href="${waUrl(waMessage(o))}" target="_blank" rel="noopener" class="btn btn--outline">${WA_ICO}<span>${L ? 'Resend confirmation' : 'Kirim ulang konfirmasi'}</span></a>${home}</div>
          <button type="button" class="reg-new js-new">${L ? 'Make a new registration' : 'Buat pendaftaran baru'}</button>
        </div>`;
      return;
    }
    if (Date.now() > o.deadline) {
      finalEl.innerHTML = `
        <div class="final final--center">
          <p class="reg-eyebrow"><span>!</span> ${L ? 'Payment window closed' : 'Batas waktu habis'}</p>
          <h1 class="reg-title">${L ? 'This order has expired' : 'Pesanan ini sudah kedaluwarsa'}</h1>
          <p class="reg-sub">${L ? 'No worries — make a new registration, or message us if you already paid.' : 'Tidak apa-apa — buat pendaftaran baru, atau hubungi kami jika sudah sempat membayar.'}</p>
          ${sumRows}
          <div class="final__actions"><button type="button" class="btn btn--maroon js-new">${L ? 'Register again' : 'Daftar lagi'}</button><a href="${waUrl(waMessage(o))}" target="_blank" rel="noopener" class="link-arrow">${L ? 'I already paid' : 'Saya sudah bayar'}</a></div>
        </div>`;
      return;
    }

    // menunggu pembayaran
    const totalStr = fmt(o.total);
    const last3 = String(o.total).slice(-3);
    const bankHTML = o.method === 'qris'
      ? `<div class="qris">
          <div class="qris__scan">
            <span class="qris__brand">QRIS</span>
            <div class="qris__frame">
              ${PAY.qrisImage
                ? `<img src="${esc(PAY.qrisImage)}" alt="${L ? 'Elevaree QRIS code' : 'Kode QRIS Elevaree'}" />`
                : `<div class="qris__ph"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3M14 21h1"/></svg><span>${L ? 'QRIS image not set yet — fill in <code>payment.qrisImage</code> in <code>js/config.js</code>.' : 'Gambar QRIS belum dipasang — isi <code>payment.qrisImage</code> di <code>js/config.js</code>.'}</span></div>`}
              <i class="qris__corner"></i><i class="qris__corner"></i><i class="qris__corner"></i><i class="qris__corner"></i>
              <span class="qris__laser" aria-hidden="true"></span>
            </div>
            <span class="qris__amount">${totalStr}</span>
          </div>
          <div class="qris__how">
            <div class="qris__phone" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/><path class="qris__beam" d="M9 8h6M9 11h6"/></svg></div>
            <ol>
              <li>${L ? 'Open any e-wallet or mobile banking app.' : 'Buka aplikasi e-wallet atau m-banking apa pun.'}</li>
              <li>${L ? 'Scan the code, or upload it from your gallery.' : 'Pindai kode, atau unggah dari galeri.'}</li>
              <li>${L ? `Enter exactly <b>${totalStr}</b>.` : `Masukkan nominal persis <b>${totalStr}</b>.`}</li>
              <li>${L ? 'Confirm with the button below.' : 'Konfirmasi lewat tombol di bawah.'}</li>
            </ol>
            <a class="btn btn--outline btn--sm qris__dl" ${PAY.qrisImage ? '' : 'hidden'} href="${esc(PAY.qrisImage)}" download="QRIS-Elevaree-${o.id}">
              <svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>${L ? 'Download QRIS' : 'Unduh QRIS'}
            </a>
          </div>
        </div>`
      : banks.length
        ? banks.map((b) => `
          <div class="bank">
            <span class="bank__name">${esc(b.bank)}</span>
            <div><b>${esc(b.number)}</b><small>a.n. ${esc(b.holder || 'Elevaree Academy')}</small></div>
            <button type="button" class="btn btn--outline btn--sm" data-copy="${esc(b.number.replace(/\s/g, ''))}">${L ? 'Copy' : 'Salin'}</button>
          </div>`).join('')
        : `<div class="setup-note">${L ? 'Bank account not set yet — fill in <code>payment.banks</code> in <code>js/config.js</code>.' : 'Rekening belum diatur — isi <code>payment.banks</code> di <code>js/config.js</code>.'}</div>`;
    finalEl.innerHTML = `
      <div class="final">
        <p class="reg-eyebrow"><span>05</span> ${L ? 'Payment' : 'Pembayaran'}</p>
        <h1 class="reg-title">${L ? 'Complete your payment' : 'Selesaikan pembayaran'}</h1>
        <div class="countdown" role="timer"><span>${L ? 'Pay within' : 'Bayar dalam'}</span><b class="js-cd">--:--:--</b></div>

        <div class="amount">
          <small>${L ? 'Total to pay' : 'Total yang dibayar'}</small>
          <div class="amount__row">
            <b>${totalStr.slice(0, -3)}<em>${totalStr.slice(-3)}</em></b>
            <button type="button" class="btn btn--outline btn--sm" data-copy="${o.total}">${L ? 'Copy' : 'Salin'}</button>
          </div>
          ${o.unique ? `<p>${L ? `Transfer the <b>exact</b> amount, including the last 3 digits (<b>${last3}</b>), so we can match your payment automatically.` : `Transfer <b>tepat</b> hingga 3 digit terakhir (<b>${last3}</b>) agar pembayaranmu mudah dicocokkan.`}</p>` : ''}
        </div>

        <div class="pay-to">
          <p class="legend">${o.method === 'qris' ? 'QRIS' : (L ? 'Transfer to' : 'Transfer ke')}</p>
          ${bankHTML}
        </div>

        <ol class="pay-steps"${o.method === 'qris' ? ' hidden' : ''}>
          <li>${L ? 'Pay the exact amount above.' : 'Bayar sesuai nominal di atas.'}</li>
          <li>${L ? 'Save the payment receipt or screenshot.' : 'Simpan bukti atau screenshot pembayaran.'}</li>
          <li>${L ? 'Tap the button below to confirm on WhatsApp.' : 'Tekan tombol di bawah untuk konfirmasi lewat WhatsApp.'}</li>
        </ol>

        ${sumRows}

        <div class="final__actions">
          <button type="button" class="btn btn--wa js-paid">${WA_ICO}<span>${L ? "I've paid — confirm on WhatsApp" : 'Saya sudah bayar — konfirmasi'}</span></button>
          <button type="button" class="link-arrow js-new">${L ? 'Cancel & start over' : 'Batalkan & daftar ulang'}</button>
        </div>
      </div>`;
    const cd = $('.js-cd', finalEl);
    const tick = () => {
      const left = o.deadline - Date.now();
      if (left <= 0) { clearInterval(timer); renderFinal(); return; }
      const h = Math.floor(left / 3600e3), m = Math.floor((left % 3600e3) / 60e3), s = Math.floor((left % 60e3) / 1000);
      cd.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    };
    tick(); timer = setInterval(tick, 1000);
  }
  /* ---------- Confetti (saat pembayaran dikonfirmasi) ---------- */
  function confetti() {
    if (reduceMotion) return;
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:200';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (cv.width = innerWidth * dpr), H = (cv.height = innerHeight * dpr);
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const colors = ['#7a2438', '#ffefef', '#ffe48c', '#f4a6b8', '#b8e0c2', '#c9b6f2', '#ffb48a'];
    const bursts = [[0.25, 0.95, -1], [0.75, 0.95, 1]];
    const ps = [];
    bursts.forEach(([bx, by, side]) => {
      for (let i = 0; i < 70; i++) {
        const a = (-Math.PI / 2) + (Math.random() - 0.5) * 1.1 + side * -0.25;
        const v = (9 + Math.random() * 11) * dpr;
        ps.push({ x: bx * W, y: by * H, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: (6 + Math.random() * 6) * dpr, h: (4 + Math.random() * 5) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[(Math.random() * colors.length) | 0], round: Math.random() < 0.3 });
      }
    });
    const t0 = performance.now();
    (function frame(now) {
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.vy += 0.38 * dpr; p.vx *= 0.992; p.vy *= 0.992; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - Math.max(0, el - 2200) / 800);
        ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.h / 2, 0, 7); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (el < 3000) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  const WA_ICO = '<svg class="wa-ico" viewBox="0 0 24 24"><path d="M20 11.6a8.3 8.3 0 0 1-12.3 7.2L3.5 20l1.3-4A8.3 8.3 0 1 1 20 11.6z"/><path d="M9 8.3c-.3.9.1 2.4 1.5 3.8s2.9 1.9 3.8 1.6l.9-1.2-1.6-.9-.8.6a4.6 4.6 0 0 1-2.1-2.1l.6-.8-.9-1.6z"/></svg>';
  finalEl.addEventListener('click', (e) => {
    if (e.target.closest('.js-paid')) {
      openWa(waMessage(order));
      confetti();
      order.status = 'konfirmasi dikirim'; order.confirmedAt = Date.now();
      store.set('elv-order', order); toSheet(order, { status: 'konfirmasi dikirim' });
      renderFinal(); finalEl.classList.remove('is-in-right'); void finalEl.offsetWidth; finalEl.classList.add('is-in-right');
    }
    if (e.target.closest('.js-new')) {
      store.del('elv-order'); order = null;
      state = Object.assign({}, blank); save(); fillForm(); $('.js-agree').checked = false;
      renderAll(); goTo(0);
    }
  });
  $('.js-resume').addEventListener('click', () => goTo(4));

  /* ---------- Mulai ---------- */
  fillForm();
  if (location.hash === '#langkah-5' && order) state.step = 4;
  steps.forEach((s, i) => { s.hidden = i !== state.step; });
  history.replaceState({ step: state.step }, '', `#langkah-${state.step + 1}`);
  if (lang === 'en') applyLang('en'); else renderAll();
  window.addEventListener('elv:seats', () => { renderBatchPicker(); renderSummary(); updateNav(); });
  steps[state.step].classList.add('is-in-right');
})();
