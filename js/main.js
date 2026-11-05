/* Elevaree Academy — interaksi & animasi */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* abaikan */ } },
  };
  let lang = document.documentElement.lang === 'en' ? 'en' : 'id';
  const ovr = (o) => (window.ELV_CONTENT ? window.ELV_CONTENT.ov(o) : o);
  const t = (o) => (typeof o === 'string' ? o : ((o = ovr(o)), o[lang] || o.id));

  /* =========================================================
     PENGATURAN — isi dua hal ini sebelum website dipublikasikan
     ========================================================= */
  // pengaturan bersama ada di js/config.js
  const CONFIG = Object.assign({ waNumber: '', formEndpoint: '' }, window.ELEVAREE || {});

  /* =========================================================
     DATA — katalog kelas & panel alur belajar
     Harga di bawah masih CONTOH; ganti dengan harga asli.
     ========================================================= */
  const CATS = {
    kids: { id: 'Anak', en: 'Kids' },
    teens: { id: 'Remaja', en: 'Teens' },
    adult: { id: 'Dewasa', en: 'Adults' },
    scholar: { id: 'Beasiswa', en: 'Scholarship' },
    work: { id: 'Pekerja', en: 'Professionals' },
  };
  const ICONS = {
    abc: '<path d="M4 18 8 6l4 12M5.5 14h5M14 6h3.5a3 3 0 0 1 0 6H14zm0 6h4a3 3 0 0 1 0 6h-4z"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 20 12z"/><path d="M9 10h6M9 13.5h4"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
    coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
    doc: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    brief: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  };
  const CLASSES = [
    { cat: 'kids', color: 'butter', icon: 'abc', title: 'Phonics Fun', img: 'kid-girl.png', tag: { id: 'Kenal Bunyi, Lancar Membaca', en: 'Sound It Out, Read with Ease' }, mins: 60 },
    { cat: 'kids', color: 'pink', icon: 'chat', title: 'Speaking Club Kids', img: 'kids-duo.png', tag: { id: 'Berani Ngomong, Seru Bareng', en: 'Speak Up & Have Fun' }, mins: 60 },
    { cat: 'teens', color: 'lime', icon: 'mic', title: 'Debate & Presentation', img: 'teen-hood.png', tag: { id: 'Tampil Percaya Diri di Depan', en: 'Speak Up with Confidence' }, mins: 60 },
    { cat: 'teens', color: 'sky', icon: 'pen', title: 'Grammar Booster', img: 'teen-girl.png', tag: { id: 'Tata Bahasa Tanpa Pusing', en: 'Grammar Without the Headache' }, mins: 60 },
    { cat: 'adult', color: 'sage', icon: 'coffee', title: 'Daily Conversation', img: 'adult-man.png', tag: { id: 'Lancar Ngobrol Sehari-hari', en: 'Everyday Talk, Made Easy' }, mins: 60 },
    { cat: 'scholar', color: 'peach', icon: 'cap', title: 'IELTS Preparation', img: 'scholar-man.png', tag: { id: 'Kejar Skor Impianmu', en: 'Chase Your Target Band' }, mins: 90 },
    { cat: 'scholar', color: 'lilac', icon: 'doc', title: 'TOEFL ITP Strategy', img: 'guru-1.png', tag: { id: 'Skor Naik, Peluang Terbuka', en: 'Higher Score, More Doors' }, mins: 90 },
    { cat: 'work', color: 'mustard', icon: 'brief', title: 'Business Communication', img: 'worker-woman.png', tag: { id: 'Profesional di Meeting & Email', en: 'Polished Meetings & Emails' }, mins: 60 },
    { cat: 'work', color: 'butter', icon: 'user', title: 'Job Interview Prep', img: 'guru-2.png', tag: { id: 'Siap Tembus Perusahaan Impian', en: 'Land Your Dream Job' }, mins: 60 },
  ];
  const JOURNEY = [
    { pct: 25, btn: { id: 'Daftar sekarang', en: 'Enroll now' }, icon: '✓', toastB: { id: 'Terdaftar', en: 'Enrolled' }, toastS: { id: 'Hasil tes penempatan: B1', en: 'Placement result: B1' }, status: { id: 'Mendaftar di IELTS & TOEFL Prep…', en: 'Enrolling in IELTS & TOEFL Prep…' } },
    { pct: 50, btn: { id: 'Gabung kelas live', en: 'Join live class' }, icon: '●', toastB: { id: 'Kelas dimulai', en: 'Class started' }, toastS: { id: 'Guru & 8 peserta online', en: 'Teacher & 8 learners online' }, status: { id: 'Kelas live sedang berlangsung…', en: 'Live class in progress…' } },
    { pct: 75, btn: { id: 'Lihat hasil evaluasi', en: 'View evaluation' }, icon: '86', toastB: { id: 'Evaluasi selesai', en: 'Evaluation done' }, toastS: { id: 'Nilai akhir 86/100', en: 'Final score 86/100' }, status: { id: 'Menilai evaluasi akhir…', en: 'Grading the final evaluation…' } },
    { pct: 100, btn: { id: 'Unduh sertifikat', en: 'Download certificate' }, icon: '★', toastB: { id: 'Sertifikat terbit', en: 'Certificate issued' }, toastS: { id: 'ID: ELV-2026-0142', en: 'ID: ELV-2026-0142' }, status: { id: 'Sertifikat siap diunduh', en: 'Certificate ready to download' } },
  ];
  const UI = {
    title: { id: 'Elevaree Academy — Kursus Bahasa Inggris Online', en: 'Elevaree Academy — Online English Courses' },
    desc: { id: 'Kursus bahasa Inggris online dengan kelas live bersama guru, untuk anak, remaja, dewasa, pencari beasiswa, dan pekerja.', en: 'Online English courses with live classes and real teachers, for kids, teens, adults, scholarship seekers, and professionals.' },
    perMonth: { id: '/gelombang', en: '/batch' },
    sessions: { id: 'sesi', en: 'sessions' },
    mins: { id: 'mnt', en: 'min' },
    emailBad: { id: 'Mohon masukkan alamat email yang valid.', en: 'Please enter a valid email address.' },
    emailOk: { id: 'Terima kasih! Kami akan mengirim kabar terbaru ke email kamu.', en: 'Thank you! We\'ll send the latest news to your inbox.' },
  };

  /* ---------- Tema terang / gelap ---------- */
  $('.theme-btn').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    store.set('elv-theme', next);
  });

  /* ---------- Bahasa ID / EN ---------- */
  const original = new WeakMap();
  const PAGE_META = {
    id: document.title,
    en: document.documentElement.dataset.titleEn || '',
    desc: ($('meta[name="description"]') || {}).content || '',
    descEn: document.documentElement.dataset.descEn || '',
  };
  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    $$('[data-en]').forEach((el) => {
      if (!original.has(el)) original.set(el, el.innerHTML);
      el.innerHTML = next === 'en' ? el.dataset.en : (el.__elvId != null ? el.__elvId : original.get(el));
    });
    $$('[data-en-ph]').forEach((el) => {
      if (!el.dataset.idPh) el.dataset.idPh = el.placeholder;
      el.placeholder = next === 'en' ? el.dataset.enPh : el.dataset.idPh;
    });
    $$('[data-en-label]').forEach((el) => {
      if (!el.dataset.idLabel) el.dataset.idLabel = el.getAttribute('aria-label');
      el.setAttribute('aria-label', next === 'en' ? el.dataset.enLabel : el.dataset.idLabel);
    });
    document.title = PAGE_META.en ? (next === 'en' ? PAGE_META.en : PAGE_META.id) : t(UI.title);
    const meta = $('meta[name="description"]');
    if (meta) meta.content = PAGE_META.descEn ? (next === 'en' ? PAGE_META.descEn : PAGE_META.desc) : t(UI.desc);
    $$('.lang__btn').forEach((b) => {
      const on = b.dataset.lang === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
    renderCatalog(currentCat, false);
    renderJourney(activeStep, false);
    renderRelated();
    renderBatches();
    renderPrices();
    $('.newsletter__msg').textContent = '';
    if (typeof renderDone === 'function') renderDone();
  }
  $$('.lang__btn').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    store.set('elv-lang', b.dataset.lang);
    applyLang(b.dataset.lang);
  }));

  /* ---------- Nav: latar, sembunyi, progres, tulisan footer ---------- */
  const nav = $('.nav');
  const progress = $('.scroll-progress');
  const footerWord = $('.footer__word');
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    nav.classList.toggle('is-scrolled', y > 10);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (footerWord && !reduceMotion) {
      const r = footerWord.getBoundingClientRect();
      if (r.top < vh) footerWord.style.setProperty('--wx', `${((r.top - vh) * 0.15).toFixed(1)}px`);
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Menu mobile & dropdown ---------- */
  const toggle = $('.nav__toggle');
  const closeMenu = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    if (open) nav.classList.remove('is-hidden');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('.nav__links a').forEach((a) => a.addEventListener('click', () => { closeMenu(); closeDropdowns(); }));

  const dds = $$('.dd');
  const closeDropdowns = () => dds.forEach((d) => { d.classList.remove('is-open'); $('.dd__btn', d).setAttribute('aria-expanded', 'false'); });
  dds.forEach((d) => {
    $('.dd__btn', d).addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !d.classList.contains('is-open');
      closeDropdowns();
      d.classList.toggle('is-open', open);
      $('.dd__btn', d).setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.dd')) closeDropdowns(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDropdowns(); closeMenu(); } });

  /* ---------- Tautan nav aktif ---------- */
  const navLinks = $$('.nav__links > a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const h = a.getAttribute('href'); const s = h.startsWith('#') ? $(h) : null; if (s) sectionObserver.observe(s); });

  /* ---------- Kolase hero mengikuti mouse ---------- */
  const collage = $('.hero__collage');
  if (collage && canHover && !reduceMotion) {
    const layers = $$('[data-depth]', collage);
    const panel = $('.hero__panel');
    let raf = 0;
    panel.addEventListener('mousemove', (ev) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = panel.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5;
        const y = (ev.clientY - r.top) / r.height - 0.5;
        layers.forEach((el) => {
          const d = parseFloat(el.dataset.depth);
          el.style.translate = `${(-x * d).toFixed(1)}px ${(-y * d).toFixed(1)}px`;
        });
      });
    });
    panel.addEventListener('mouseleave', () => layers.forEach((el) => { el.style.translate = '0 0'; }));
  }

  /* ---------- Reveal saat scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      revealObserver.unobserve(el);
      const done = (ev) => {
        if (ev.target !== el || ev.propertyName !== 'opacity') return;
        el.removeAttribute('data-reveal');
        el.removeEventListener('transitionend', done);
      };
      el.addEventListener('transitionend', done);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal]').forEach((el) => revealObserver.observe(el));

  /* ---------- Counter angka ---------- */
  function countUp(el) {
    const end = parseInt(el.dataset.count, 10);
    if (reduceMotion || end === 0) { el.textContent = end; return; }
    const dur = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { countObserver.unobserve(e.target); countUp(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  /* ---------- Slider program: geser otomatis + filter ---------- */
  const progTrack = $('.prog-track');
  if (progTrack) {
  const progSection = $('#program');
  const progCards = $$('.prog-track > .course');
  const dotsWrap = $('.prog-dots');
  const INTERVAL = 4000;
  let progIndex = 0;
  let progTimer = 0;
  let pausedBy = new Set();           // alasan jeda: hover, fokus, seret, layar, tab
  let autoUntil = 0;                  // selama geser otomatis berjalan, abaikan sinkron scroll
  progSection.style.setProperty('--int', INTERVAL + 'ms');

  const visibleCards = () => progCards.filter((c) => !c.classList.contains('is-hidden'));
  const padLeft = () => parseFloat(getComputedStyle(progTrack).paddingLeft) || 0;
  const maxScroll = () => progTrack.scrollWidth - progTrack.clientWidth;
  // posisi berhenti yang benar-benar bisa dicapai (kartu terakhir bisa berbagi posisi mentok)
  const stops = () => {
    const max = maxScroll();
    const out = [];
    visibleCards().forEach((c) => {
      const x = Math.max(0, Math.min(c.offsetLeft - padLeft(), max));
      if (!out.length || x - out[out.length - 1] > 4) out.push(x);
    });
    return out.length ? out : [0];
  };
  const nearestStop = () => {
    const st = stops();
    let best = 0;
    st.forEach((x, i) => { if (Math.abs(x - progTrack.scrollLeft) < Math.abs(st[best] - progTrack.scrollLeft)) best = i; });
    return best;
  };

  function buildDots() {
    const cards = stops();
    dotsWrap.innerHTML = cards.map((_, i) => `<button class="prog-dot" role="tab" aria-label="Slide ${i + 1}"></button>`).join('');
    $$('.prog-dot', dotsWrap).forEach((d, i) => d.addEventListener('click', () => { goTo(i); restart(); }));
    markDot();
  }
  function markDot() {
    $$('.prog-dot', dotsWrap).forEach((d, i) => {
      d.classList.remove('is-active');
      d.setAttribute('aria-selected', i === progIndex);
    });
    const active = $$('.prog-dot', dotsWrap)[progIndex];
    if (active) { void active.offsetWidth; active.classList.add('is-active'); } // ulang animasi isi
  }
  function goTo(i) {
    const st = stops();
    progIndex = (i + st.length) % st.length;
    const left = st[progIndex];
    autoUntil = performance.now() + 900;
    progTrack.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    markDot();
  }
  function next() {
    // sudah mentok kanan? kembali ke awal
    goTo(progIndex + 1 >= stops().length ? 0 : progIndex + 1);
  }
  function schedule() {
    clearTimeout(progTimer);
    if (reduceMotion || pausedBy.size) return;
    progTimer = setTimeout(() => { next(); schedule(); }, INTERVAL);
  }
  function restart() { markDot(); schedule(); }
  function pause(reason) { pausedBy.add(reason); progSection.classList.add('is-paused'); clearTimeout(progTimer); }
  function resume(reason) {
    pausedBy.delete(reason);
    if (!pausedBy.size) { progSection.classList.remove('is-paused'); restart(); }
  }

  // sinkronkan titik saat digeser manual
  let scrollEnd = 0;
  progTrack.addEventListener('scroll', () => {
    clearTimeout(scrollEnd);
    scrollEnd = setTimeout(() => {
      if (performance.now() < autoUntil) return;
      const best = nearestStop();
      if (best !== progIndex) { progIndex = best; restart(); }
    }, 120);
  }, { passive: true });

  // jeda saat diarahkan mouse, difokus, disentuh, tidak terlihat, atau tab lain
  progTrack.addEventListener('mouseenter', () => pause('hover'));
  progTrack.addEventListener('mouseleave', () => resume('hover'));
  progTrack.addEventListener('focusin', () => pause('focus'));
  progTrack.addEventListener('focusout', () => resume('focus'));
  progTrack.addEventListener('touchstart', () => { pause('touch'); clearTimeout(progTrack._t); }, { passive: true });
  progTrack.addEventListener('touchend', () => { progTrack._t = setTimeout(() => resume('touch'), 2500); }, { passive: true });
  new IntersectionObserver(([e]) => (e.isIntersecting ? resume('view') : pause('view')), { threshold: 0.25 }).observe(progTrack);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause('tab') : resume('tab')));

  $$('[data-prog]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.prog === '1') next(); else goTo(progIndex - 1);
    restart();
  }));
  progTrack.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); restart(); }
    if (e.key === 'ArrowLeft') { goTo(progIndex - 1); restart(); }
  });

  // seret dengan mouse
  (() => {
    let down = false, startX = 0, startLeft = 0, moved = false;
    progTrack.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = progTrack.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) { moved = true; progTrack.classList.add('is-dragging'); }
      if (moved) progTrack.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      progTrack.classList.remove('is-dragging');
      goTo(nearestStop());
    });
    // klik setelah menyeret jangan membuka tautan
    progTrack.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  })();

  // filter: sembunyikan yang tidak cocok, mulai lagi dari awal
  const filters = $$('.filter:not(.cat-tab)');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    filters.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    const f = btn.dataset.filter;
    progTrack.classList.add('is-swap');
    setTimeout(() => {
      progCards.forEach((c) => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f && c.dataset.cat !== 'help'));
      progIndex = 0;
      progTrack.scrollTo({ left: 0, behavior: 'auto' });
      buildDots();
      progTrack.classList.remove('is-swap');
      schedule();
    }, 280);
  }));

  buildDots();
  schedule();
  let rz = 0;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { progIndex = Math.min(progIndex, stops().length - 1); buildDots(); }, 200); });

  } // akhir slider program

  /* ---------- Katalog kelas berjalan ---------- */
  const track = $('.catalog__track');
  let currentCat = 'all';
  function cardHTML(c, i, clone) {
    const hidden = clone ? ' aria-hidden="true" tabindex="-1"' : '';
    const prog = { kids: 'kids', teens: 'teens', adult: 'general', scholar: 'ielts', work: 'business' }[c.cat];
    const nSess = window.ELV_BATCH ? ELV_BATCH.sessions : 10;
    const priceK = 'Rp' + Math.round(((CONFIG.prices || {})[prog] || 0) / 1000) + 'K';
    return `<a href="#kontak" class="ccard" data-trial data-program="${prog}" data-class="${c.title}" style="--i:${i}"${hidden}>
      <div class="ccard__head bg-${c.color}">
        <img class="ccard__img" src="assets/img/${c.img}" alt="" loading="lazy" draggable="false" />
        <span class="ccard__icon"><svg viewBox="0 0 24 24">${ICONS[c.icon]}</svg></span>
        <p class="ccard__tagline">${t(c.tag)}</p>
        <span class="ccard__cat">${t(CATS[c.cat])}</span>
      </div>
      <div class="ccard__body">
        <b>${c.title}</b>
        <div class="ccard__meta">
          <span><svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10.5 5-3v9l-5-3"/></svg>${nSess} ${t(UI.sessions)}</span>
          <span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>${c.mins} ${t(UI.mins)}</span>
        </div>
        <div class="ccard__foot">
          <span class="ccard__price">${priceK}<small>${t(UI.perMonth)}</small></span>
          <span class="ccard__go"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
        </div>
      </div>
    </a>`;
  }
  function renderCatalog(cat, animate = true) {
    if (!track) return;
    currentCat = cat;
    const list = CLASSES.filter((c) => cat === 'all' || c.cat === cat);
    const loop = list.length >= 4 && !reduceMotion;
    const draw = () => {
      let html = list.map((c, i) => cardHTML(c, i, false)).join('');
      if (loop) html += list.map((c, i) => cardHTML(c, i, true)).join('');
      track.innerHTML = html;
      track.classList.toggle('is-static', !loop);
      track.style.setProperty('--dur', `${list.length * 6}s`);
      track.classList.remove('is-swap');
    };
    if (!animate) { draw(); return; }
    track.classList.add('is-swap');
    setTimeout(draw, 260);
  }
  // halaman program: tampilkan kelas dari kategori yang sama
  function renderRelated() {
    $$('[data-related]').forEach((el) => {
      el.innerHTML = CLASSES.filter((c) => c.cat === el.dataset.related).map((c, i) => cardHTML(c, i, false)).join('');
    });
  }

  $$('.cat-tab').forEach((btn) => btn.addEventListener('click', () => {
    $$('.cat-tab').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    renderCatalog(btn.dataset.cat);
  }));

  /* ---------- Alur belajar: panel kanan ikut langkah aktif ---------- */
  const jsteps = $$('.jstep');
  const jlist = $('.journey__steps');
  let activeStep = 0;
  function renderJourney(i, pop = true) {
    activeStep = i;
    if (!jsteps.length) return;
    const d = JOURNEY[i];
    jsteps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    jlist.style.setProperty('--jp', (i / (JOURNEY.length - 1)).toFixed(3));
    $('.mock__bar span').style.width = d.pct + '%';
    $('.mock__pct b').textContent = d.pct + '%';
    const btn = $('.mock__btn');
    btn.dataset.s = i;
    btn.textContent = t(d.btn);
    $('.mock__toast-icon').textContent = d.icon;
    $('.mock__toast-text b').textContent = t(d.toastB);
    $('.mock__toast-text small').textContent = t(d.toastS);
    $('.mock__status').textContent = t(d.status);
    if (pop && !reduceMotion) {
      const toast = $('.mock__toast');
      toast.classList.remove('is-pop');
      void toast.offsetWidth; // ulangi animasi
      toast.classList.add('is-pop');
    }
  }
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = parseInt(e.target.dataset.jstep, 10);
      if (i !== activeStep) renderJourney(i);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  jsteps.forEach((s) => stepObserver.observe(s));

  /* ---------- Testimoni: tombol & seret ---------- */
  const tTrack = $('.testi-track');
  if (tTrack) {
    const step = () => ($('.tcard', tTrack)?.offsetWidth || 300) + 20;
    $$('[data-slide]').forEach((b) => b.addEventListener('click', () => {
      tTrack.scrollBy({ left: step() * parseInt(b.dataset.slide, 10), behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    let down = false, startX = 0, startLeft = 0, moved = false;
    tTrack.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = tTrack.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) { moved = true; tTrack.classList.add('is-dragging'); }
      if (moved) tTrack.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        tTrack.classList.remove('is-dragging');
        const s = step();
        tTrack.scrollTo({ left: Math.round(tTrack.scrollLeft / s) * s, behavior: 'smooth' });
      }
    });
    tTrack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') tTrack.scrollBy({ left: step(), behavior: 'smooth' });
      if (e.key === 'ArrowLeft') tTrack.scrollBy({ left: -step(), behavior: 'smooth' });
    });
  }

  /* ---------- FAQ ---------- */
  const faqItems = $$('.faq__item');
  faqItems.forEach((item) => {
    $('.faq__q', item).addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      faqItems.forEach((o) => { o.classList.remove('is-open'); $('.faq__q', o).setAttribute('aria-expanded', 'false'); });
      if (willOpen) { item.classList.add('is-open'); $('.faq__q', item).setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Form email (belum terhubung ke server) ---------- */
  const form = $('.newsletter');
  const msg = $('.newsletter__msg');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const input = $('input', form);
    if (!input.checkValidity() || !input.value.trim()) { msg.textContent = t(UI.emailBad); input.focus(); return; }
    msg.textContent = t(UI.emailOk);
    form.reset();
  });

  /* =========================================================
     PENDAFTARAN KELAS PERCOBAAN + WHATSAPP
     ========================================================= */
  const PROGRAMS = {
    kids: { id: 'English for Kids', en: 'English for Kids' },
    teens: { id: 'English for Teens', en: 'English for Teens' },
    general: { id: 'General English (dewasa)', en: 'General English (adults)' },
    ielts: { id: 'IELTS & TOEFL Prep', en: 'IELTS & TOEFL Prep' },
    business: { id: 'Business English', en: 'Business English' },
    unsure: { id: 'Belum tahu — minta rekomendasi', en: 'Not sure yet — please recommend' },
  };
  const TIMES = {
    pagi: { id: 'Pagi', en: 'Morning' }, siang: { id: 'Siang', en: 'Afternoon' }, sore: { id: 'Sore', en: 'Late afternoon' },
    malam: { id: 'Malam', en: 'Evening' }, weekend: { id: 'Akhir pekan', en: 'Weekend' },
  };
  const WA_MSG = {
    kids: { id: 'Halo Elevaree! Saya ingin tanya kelas bahasa Inggris untuk anak saya.', en: "Hi Elevaree! I'd like to ask about English classes for my child." },
    teens: { id: 'Halo Elevaree! Saya ingin tanya kelas bahasa Inggris untuk remaja.', en: "Hi Elevaree! I'd like to ask about English classes for teens." },
    ielts: { id: 'Halo Elevaree! Saya sedang persiapan beasiswa dan ingin tanya kelas IELTS/TOEFL.', en: "Hi Elevaree! I'm preparing for a scholarship and would like to ask about IELTS/TOEFL classes." },
    business: { id: 'Halo Elevaree! Saya ingin tanya kelas Business English.', en: "Hi Elevaree! I'd like to ask about Business English classes." },
    price: { id: 'Halo Elevaree! Boleh minta info harga dan promo kelas terbaru?', en: 'Hi Elevaree! Could I get the latest class prices and promos?' },
    schedule: { id: 'Halo Elevaree! Boleh minta jadwal lengkap kelas yang tersedia?', en: 'Hi Elevaree! Could I get the full schedule of available classes?' },
    teach: { id: 'Halo Elevaree! Saya tertarik bergabung sebagai pengajar.', en: "Hi Elevaree! I'm interested in joining as a teacher." },
    general: { id: 'Halo Elevaree! Saya ingin tanya kelas General English untuk dewasa.', en: "Hi Elevaree! I'd like to ask about General English classes for adults." },
    consult: { id: 'Halo Elevaree! Saya masih bingung memilih program. Boleh dibantu rekomendasinya?', en: "Hi Elevaree! I'm not sure which programme fits me. Could you help me choose?" },
    other: { id: 'Halo Elevaree! Saya ingin bertanya tentang kelas bahasa Inggris online.', en: 'Hi Elevaree! I have a question about your online English classes.' },
  };
  const FORM_TXT = {
    errName: { id: 'Mohon isi nama lengkap.', en: 'Please enter your full name.' },
    errChild: { id: 'Mohon isi nama anak.', en: "Please enter your child's name." },
    errAge: { id: 'Usia 4–17 tahun.', en: 'Age 4–17.' },
    errProgram: { id: 'Pilih salah satu program.', en: 'Please choose a program.' },
    errWa: { id: 'Nomor WhatsApp belum valid, contoh: 0812-3456-7890.', en: 'Please enter a valid WhatsApp number, e.g. 0812-3456-7890.' },
    errEmail: { id: 'Format email belum benar.', en: 'Please check the email format.' },
    errConsent: { id: 'Centang persetujuan ini agar kami bisa menghubungimu.', en: 'Please tick this so we can contact you.' },
    sentTitle: { id: 'Pendaftaran terkirim!', en: 'Registration sent!' },
    sentText: { id: 'Terima kasih, {name}. Tim kami akan menghubungimu lewat WhatsApp. Mau lebih cepat? Lanjutkan chat sekarang.', en: "Thank you, {name}. Our team will contact you on WhatsApp. Want it faster? Continue the chat now." },
    stepTitle: { id: 'Satu langkah lagi!', en: 'One more step!' },
    stepText: { id: 'Terima kasih, {name}. Kirim data pendaftaranmu lewat WhatsApp agar tim kami bisa langsung mengatur jadwal kelas percobaan.', en: 'Thank you, {name}. Send your details via WhatsApp so our team can set up your trial class right away.' },
    interested: { id: 'Tertarik kelas: ', en: 'Interested in: ' },
  };
  const waUrl = (text) => `https://wa.me/${CONFIG.waNumber}?text=${encodeURIComponent(text)}`;
  const openWa = (text) => window.open(waUrl(text), '_blank', 'noopener');

  const modal = $('#trial');
  if (modal) {
  const tform = $('.tform', modal);
  const isTrialPage = modal.tagName !== 'DIALOG'; // halaman daftar.html: form tampil langsung
  const field = (name) => tform.elements[name];
  let lastDone = null;

  function showView(name) {
    $$('.modal__view', modal).forEach((v) => { v.hidden = v.dataset.view !== name; });
  }
  function openTrial(program, className) {
    if (lastDone) { tform.reset(); clearErrors(); toggleChild(); lastDone = null; }
    showView('form');
    if (program && PROGRAMS[program]) field('program').value = program;
    if (className && !field('note').value) field('note').value = t(FORM_TXT.interested) + className;
    if (isTrialPage) {
      modal.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    } else {
      if (!modal.open) modal.showModal();
      document.documentElement.classList.add('modal-open');
    }
    const first = [field('name'), field('wa')].find((f) => !f.value) || field('name');
    setTimeout(() => first.focus({ preventScroll: true }), 60);
  }
  function closeTrial() {
    if (!modal.open) return;
    if (reduceMotion) { modal.close(); return; }
    modal.classList.add('is-closing');
    setTimeout(() => { modal.classList.remove('is-closing'); modal.close(); }, 230);
  }
  modal.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));
  modal.addEventListener('cancel', (e) => { e.preventDefault(); closeTrial(); });
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) closeTrial();
  });

  // halaman daftar: pilih program dari tautan, contoh daftar.html?program=ielts
  if (isTrialPage) {
    const q = new URLSearchParams(location.search).get('program');
    if (q && PROGRAMS[q]) field('program').value = q;
  }

  // "Kelas ini untuk": tampilkan kolom anak bila pilih "Anak saya"
  function toggleChild() {
    const child = tform.querySelector('input[name="for"]:checked').value === 'child';
    $('.child-only', tform).hidden = !child;
  }
  $$('input[name="for"]', tform).forEach((r) => r.addEventListener('change', toggleChild));

  // validasi
  const normalizeWa = (v) => {
    let d = v.replace(/\D/g, '');
    if (d.startsWith('0')) d = '62' + d.slice(1);
    else if (d.startsWith('8')) d = '62' + d;
    return d;
  };
  function setErr(input, msg) {
    const wrap = input.closest('.field');
    const box = wrap ? $('.err', wrap) : $('.err--consent', tform);
    if (wrap) wrap.classList.toggle('is-invalid', !!msg);
    box.textContent = msg || '';
  }
  function clearErrors() {
    $$('.err', tform).forEach((e) => { e.textContent = ''; });
    $$('.field', tform).forEach((f) => f.classList.remove('is-invalid'));
  }
  $$('input, select, textarea', tform).forEach((el) => {
    el.addEventListener('input', () => setErr(el, ''));
    el.addEventListener('change', () => setErr(el, ''));
  });
  function validate() {
    clearErrors();
    const bad = [];
    const check = (input, ok, msg) => { if (!ok) { setErr(input, t(msg)); bad.push(input); } };
    const isChild = !$('.child-only', tform).hidden;
    check(field('name'), field('name').value.trim().length >= 2, FORM_TXT.errName);
    if (isChild) {
      check(field('child'), field('child').value.trim().length >= 2, FORM_TXT.errChild);
      const age = parseInt(field('age').value, 10);
      check(field('age'), age >= 4 && age <= 17, FORM_TXT.errAge);
    }
    check(field('program'), !!field('program').value, FORM_TXT.errProgram);
    const wa = normalizeWa(field('wa').value);
    check(field('wa'), wa.length >= 10 && wa.length <= 15, FORM_TXT.errWa);
    const email = field('email').value.trim();
    check(field('email'), !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), FORM_TXT.errEmail);
    check(field('consent'), field('consent').checked, FORM_TXT.errConsent);
    if (bad.length) bad[0].focus();
    return !bad.length;
  }

  function collect() {
    const isChild = !$('.child-only', tform).hidden;
    return {
      name: field('name').value.trim(),
      for: isChild ? 'anak' : 'sendiri',
      child: isChild ? field('child').value.trim() : '',
      age: isChild ? field('age').value : '',
      program: field('program').value,
      time: $$('input[name="time"]:checked', tform).map((c) => c.value),
      wa: normalizeWa(field('wa').value),
      email: field('email').value.trim(),
      note: field('note').value.trim(),
      lang,
      page: location.href,
      sentAt: new Date().toISOString(),
    };
  }
  function summary(d) {
    const L = lang === 'en';
    const lines = [L ? "Hi Elevaree! I'd like to book a free trial class." : 'Halo Elevaree! Saya ingin daftar kelas percobaan gratis.', ''];
    lines.push(`${L ? 'Name' : 'Nama'}: ${d.name}`);
    lines.push(d.child
      ? `${L ? 'For' : 'Untuk'}: ${L ? 'my child' : 'anak saya'} — ${d.child} (${d.age} ${L ? 'y.o.' : 'thn'})`
      : `${L ? 'For' : 'Untuk'}: ${L ? 'myself' : 'saya sendiri'}`);
    lines.push(`Program: ${t(PROGRAMS[d.program])}`);
    if (d.time.length) lines.push(`${L ? 'Preferred time' : 'Waktu'}: ${d.time.map((k) => t(TIMES[k])).join(', ')}`);
    if (d.email) lines.push(`Email: ${d.email}`);
    if (d.note) lines.push(`${L ? 'Goal' : 'Tujuan'}: ${d.note}`);
    return lines.join('\n');
  }
  function renderDone() {
    if (!lastDone) return;
    const k = lastDone.saved ? ['sentTitle', 'sentText'] : ['stepTitle', 'stepText'];
    $('.done-title', modal).textContent = t(FORM_TXT[k[0]]);
    $('.done-text', modal).textContent = t(FORM_TXT[k[1]]).replace('{name}', lastDone.data.name.split(' ')[0]);
    $('.done-wa', modal).href = waUrl(summary(lastDone.data));
  }

  async function sendToSheet(data) {
    if (!CONFIG.formEndpoint) return false;
    const body = new URLSearchParams({ ...data, time: data.time.join(', ') });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      // no-cors: Google Apps Script tidak mengirim header CORS, jadi balasannya tidak bisa dibaca
      await fetch(CONFIG.formEndpoint, { method: 'POST', mode: 'no-cors', body, signal: ctrl.signal });
      return true;
    } catch (e) {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  tform.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (field('website').value) { lastDone = { data: collect(), saved: true }; renderDone(); showView('done'); return; } // bot
    if (!validate()) return;
    const btn = $('.tform__submit', tform);
    btn.classList.add('is-loading');
    const data = collect();
    const [saved] = await Promise.all([sendToSheet(data), new Promise((r) => setTimeout(r, 600))]);
    btn.classList.remove('is-loading');
    lastDone = { data, saved };
    renderDone();
    showView('done');
    $('.done-wa', modal).focus({ preventScroll: true });
  });

  } // akhir form pop-up

  // semua tombol daftar & WhatsApp di halaman (termasuk kartu katalog yang dibuat JS)
  document.addEventListener('click', (e) => {
    const trial = e.target.closest('[data-trial]');
    if (trial) {
      e.preventDefault();
      closeWaPop();
      const prog = trial.dataset.program;
      if (prog === 'unsure') { openWa(t(WA_MSG.consult)); return; }
      const q = new URLSearchParams();
      if (prog) q.set('program', prog);
      if (trial.hasAttribute('data-free')) q.set('paket', 'trial');
      if (trial.dataset.class) q.set('kelas', trial.dataset.class);
      const base = location.pathname.startsWith('/') && document.body.classList.contains('page-404') ? '/daftar.html' : 'daftar.html';
      location.href = base + (q.toString() ? '?' + q : '');
      return;
    }
    const wa = e.target.closest('[data-wa]');
    if (wa && WA_MSG[wa.dataset.wa]) {
      e.preventDefault();
      openWa(t(WA_MSG[wa.dataset.wa]));
      closeWaPop();
    }
  });

  // tombol WhatsApp melayang + menu cepat
  const waFloat = $('.wa-float');
  const waBtn = $('.wa-btn', waFloat);
  const waPop = $('.wa-pop', waFloat);
  function closeWaPop() {
    waFloat.classList.remove('is-open');
    waBtn.setAttribute('aria-expanded', 'false');
    waPop.setAttribute('aria-hidden', 'true');
  }
  waBtn.addEventListener('click', () => {
    const open = !waFloat.classList.contains('is-open');
    waFloat.classList.toggle('is-open', open);
    waBtn.setAttribute('aria-expanded', open);
    waPop.setAttribute('aria-hidden', !open);
    if (open) setTimeout(() => $('.wa-quick button', waPop).focus({ preventScroll: true }), 50);
  });
  $('.wa-pop__close', waPop).addEventListener('click', () => { closeWaPop(); waBtn.focus(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.wa-float')) closeWaPop(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && waFloat.classList.contains('is-open')) { closeWaPop(); waBtn.focus(); } });
  const showWa = () => waFloat.classList.toggle('is-visible', window.scrollY > 400);
  window.addEventListener('scroll', showWa, { passive: true });
  showWa();

  /* ---------- Jadwal gelombang kelas (halaman program) ---------- */
  const BT = {
    open: { id: 'Dibuka', en: 'Open' }, low: { id: 'Hampir penuh', en: 'Almost full' }, full: { id: 'Penuh', en: 'Full' },
    running: { id: 'Berjalan', en: 'Running' }, closed: { id: 'Ditutup', en: 'Closed' },
    runningLong: { id: 'Sedang berjalan', en: 'In progress' }, closedLong: { id: 'Pendaftaran ditutup', en: 'Registration closed' },
    sessions: { id: 'sesi', en: 'sessions' }, weekdays: { id: 'Senin–Jumat', en: 'Monday–Friday' },
    by: { id: 'Daftar paling lambat', en: 'Register by' }, closesIn: { id: 'tutup dalam', en: 'closes in' }, closesToday: { id: 'tutup hari ini', en: 'closes today' },
    days: { id: 'hari', en: 'days' }, day1: { id: 'hari', en: 'day' },
    pick: { id: 'Pilih jam kelas', en: 'Choose a class time' }, choose: { id: 'Pilih kelas', en: 'Choose class' }, waitlist: { id: 'Daftar tunggu', en: 'Join waitlist' },
    left: { id: 'kursi tersisa', en: 'seats left' }, oneLeft: { id: 'kursi tersisa', en: 'seat left' },
    dayOf: { id: 'Hari ke-{n} dari {t}', en: 'Day {n} of {t}' },
    nextBatch: { id: 'Lihat gelombang berikutnya', en: 'See the next batch' },
    runningMsg: { id: 'Gelombang ini sudah berjalan dan pendaftarannya sudah ditutup.', en: 'This batch is already running and registration is closed.' },
    closedMsg: { id: 'Pendaftaran gelombang ini sudah ditutup (tutup {n} hari sebelum mulai).', en: 'Registration for this batch has closed ({n} days before the start).' },
    fullMsg: { id: 'Semua jam kelas di gelombang ini penuh. Masuk daftar tunggu, atau pilih gelombang berikutnya.', en: 'Every class time in this batch is full. Join the waitlist, or choose the next batch.' },
    empty: { id: 'Jadwal sedang disusun. Tanyakan lewat WhatsApp.', en: 'Schedule coming soon. Ask us on WhatsApp.' },
    noteMain: {
      id: 'Gelombang dibuka tiap tanggal {days} (jika jatuh di akhir pekan, mulai Senin berikutnya). Kelas Senin–Jumat selama {n} hari efektif; pendaftaran ditutup {c} hari sebelum mulai. Jika ada hari libur, sesi diganti di hari lain sesuai kesepakatan murid, tutor, dan Elevaree. Semua waktu dalam WIB.',
      en: 'Batches open on the {days} of each month (if that falls on a weekend, the batch starts the following Monday). Classes run Monday–Friday for {n} effective days; registration closes {c} days before the start. If a public holiday falls inside, the session is rescheduled by agreement between learners, tutor, and Elevaree. All times in WIB.',
    },
  };
  const STATUS_DOT = { open: 'ok', low: 'low', full: 'full', running: 'run', closed: 'off' };
  const ICO = {
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  };
  const plural = (n) => `${n} ${n === 1 ? t(BT.day1) : t(BT.days)}`;

  function calendarHTML(b) {
    // kelompokkan per minggu (kolom Senin–Jumat)
    const weeks = [];
    b.dates.forEach((d) => {
      const monday = new Date(d); monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const k = ELV_BATCH.iso(monday);
      let w = weeks.find((x) => x.k === k);
      if (!w) { w = { k, cells: [null, null, null, null, null] }; weeks.push(w); }
      w.cells[(d.getDay() + 6) % 7] = d;
    });
    let i = 0;
    const head = ELV_BATCH.WEEKDAYS[lang].map((x) => `<span>${x}</span>`).join('');
    const rows = weeks.map((w) => w.cells.map((d) => {
      if (!d) return '<i class="bt-cal__blank"></i>';
      const first = d.getDate() === 1 || d === b.dates[0];
      const cls = ['bt-cal__d'];
      if (d <= b.today && b.phase === 'running') cls.push('is-done');
      if (ELV_BATCH.iso(d) === ELV_BATCH.iso(b.today)) cls.push('is-today');
      return `<b class="${cls.join(' ')}" style="--i:${i++}">${d.getDate()}${first ? `<em>${ELV_BATCH.MONTHS[lang][d.getMonth()]}</em>` : ''}</b>`;
    }).join('')).join('');
    return `<div class="bt-cal" aria-hidden="true"><div class="bt-cal__head">${head}</div><div class="bt-cal__grid">${rows}</div></div>`;
  }

  function slotHTML(b, s, i, key) {
    const seats = s.full ? t(BT.full) : `${s.left} ${s.left === 1 ? t(BT.oneLeft) : t(BT.left)}`;
    const fill = Math.round((s.booked / s.capacity) * 100);
    const tn = t(ELV_BATCH.TIME_NAME[s.time]);
    const label = `${ELV_BATCH.range(b, lang)} · ${tn} ${ELV_BATCH.timeLabel(s)}`;
    const inner = `
      <span class="slot__time">${ELV_BATCH.timeLabel(s)}<span> WIB</span></span>
      <b class="slot__level">${tn}${s.level ? ` · Level ${s.level}` : ''}</b>
      <small class="slot__teacher">${s.teacher || ''}</small>
      <span class="slot__seats"><span class="slot__bar"><i style="--fill:${fill}%"></i></span><em>${seats}</em></span>
      <span class="slot__cta">${s.full ? t(BT.waitlist) : t(BT.choose)} →</span>`;
    if (s.full) return `<button type="button" class="slot is-full" style="--i:${i}" data-waitlist="${label}" aria-label="${label}, ${t(BT.full)}">${inner}</button>`;
    const q = new URLSearchParams({ program: key, paket: 'batch', gelombang: b.key, slot: s.id });
    return `<a class="slot${s.low ? ' is-low' : ''}" style="--i:${i}" href="daftar.html?${q}" aria-label="${label}, ${seats}">${inner}</a>`;
  }

  function panelHTML(b, key, active, nextKey) {
    const range = ELV_BATCH.range(b, lang);
    const closeBy = ELV_BATCH.day(b.closeAt, lang);
    let line = '';
    if (b.status === 'open' || b.status === 'low') {
      const left = b.daysToClose === 0 ? t(BT.closesToday) : `${t(BT.closesIn)} ${plural(b.daysToClose)}`;
      line = `<p class="bt-line">${ICO.clock}<span>${t(BT.by)} <b>${closeBy}</b> · ${left}</span></p>`;
    } else if (b.status === 'running') {
      const pct = Math.round((b.done / b.dates.length) * 100);
      line = `<p class="bt-line">${ICO.clock}<span>${t(BT.dayOf).replace('{n}', b.done).replace('{t}', b.dates.length)}</span></p><div class="bt-run"><i style="--pct:${pct}%"></i></div>`;
    }
    const note = b.note ? `<p class="bt-note">${ICO.cal}<span>${ELV_BATCH.tt(b.note, lang)}</span></p>` : '';
    let body = '';
    if (b.status === 'running' || b.status === 'closed') {
      const msg = b.status === 'running' ? t(BT.runningMsg) : t(BT.closedMsg).replace('{n}', ELV_BATCH.closeBefore);
      body = `<div class="bt-msg"><p>${msg}</p>${nextKey ? `<button type="button" class="btn btn--outline btn--sm" data-bt-go="${nextKey}">${t(BT.nextBatch)}</button>` : ''}</div>`;
    } else {
      body = `${b.status === 'full' ? `<div class="bt-msg bt-msg--full"><p>${t(BT.fullMsg)}</p>${nextKey ? `<button type="button" class="btn btn--outline btn--sm" data-bt-go="${nextKey}">${t(BT.nextBatch)}</button>` : ''}</div>` : ''}
        <p class="bt-sub">${t(BT.pick)}</p>
        <div class="bt-slots">${b.slots.map((s, i) => slotHTML(b, s, i, key)).join('')}</div>`;
    }
    return `<div class="bt-panel${active ? ' is-active' : ''}" data-batch="${b.key}" role="tabpanel">
      <header class="bt-head">
        <div><p class="bt-range">${range}</p><p class="bt-meta">${b.dates.length} ${t(BT.sessions)} · ${t(BT.weekdays)}</p></div>
        <span class="bt-badge is-${b.status}">${t(BT[b.status === 'running' ? 'runningLong' : b.status === 'closed' ? 'closedLong' : b.status])}</span>
      </header>
      ${line}${note}
      ${calendarHTML(b)}
      ${body}
    </div>`;
  }

  function renderBatches() {
    if (!window.ELV_BATCH) return;
    $$('[data-schedule]').forEach((el) => {
      const key = el.dataset.schedule;
      const list = ELV_BATCH.forProgram(key);
      if (!list.length || !ELV_BATCH.slots(key).length) { el.innerHTML = `<p class="sched-empty">${t(BT.empty)}</p>`; return; }
      let active = el.dataset.active;
      if (!active || !list.some((b) => b.key === active)) active = (list.find((b) => b.joinable) || list[0]).key;
      el.dataset.active = active;
      const tabs = list.map((b) => `
        <button type="button" class="bt-tab${b.key === active ? ' is-active' : ''}" role="tab" data-batch="${b.key}" aria-selected="${b.key === active}">
          <i class="bt-dot is-${STATUS_DOT[b.status]}"></i><b>${ELV_BATCH.day(b.start, lang)}</b><small>${t(BT[b.status])}</small>
        </button>`).join('');
      const panels = list.map((b, i) => {
        const nx = list.slice(i + 1).find((x) => x.joinable);
        return panelHTML(b, key, b.key === active, nx && nx.key);
      }).join('');
      const days = ELV_BATCH.startDays.join(lang === 'en' ? ' & ' : ' dan ');
      const noteText = t(BT.noteMain).replace('{days}', days).replace('{n}', ELV_BATCH.sessions).replace(/\{c\}/g, ELV_BATCH.closeBefore);
      el.innerHTML = `<div class="bt-tabs" role="tablist">${tabs}</div>${panels}<p class="sched-note">${noteText}</p>`;
    });
  }
  const selectBatch = (el, key) => {
    el.dataset.active = key;
    $$('.bt-tab', el).forEach((b) => { const on = b.dataset.batch === key; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $$('.bt-panel', el).forEach((p) => p.classList.toggle('is-active', p.dataset.batch === key));
  };
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.bt-tab');
    if (tab) { selectBatch(tab.closest('[data-schedule]'), tab.dataset.batch); return; }
    const go = e.target.closest('[data-bt-go]');
    if (go) { selectBatch(go.closest('[data-schedule]'), go.dataset.btGo); return; }
    const wl = e.target.closest('[data-waitlist]');
    if (wl) {
      const prog = (document.querySelector('.pdh__title') || {}).textContent || 'Elevaree';
      openWa(lang === 'en'
        ? `Hi Elevaree! The ${prog.trim()} class for batch ${wl.dataset.waitlist} is full. Could I join the waitlist or find another batch or time?`
        : `Halo Elevaree! Kelas ${prog.trim()} gelombang ${wl.dataset.waitlist} sudah penuh. Boleh saya masuk daftar tunggu atau dicarikan gelombang/jam lain?`);
    }
  });

  /* ---------- Halaman program: harga, tab bagian, bagikan ---------- */
  const rp = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
  function renderPrices() {
    $$('[data-price]').forEach((el) => {
      const key = el.dataset.price;
      const m = (CONFIG.prices || {})[key];
      if (!m) { el.innerHTML = ''; return; }
      const en = lang === 'en';
      const n = window.ELV_BATCH ? ELV_BATCH.sessions : 10;
      const nb = window.ELV_BATCH ? ELV_BATCH.next(key) : null;
      const nextLine = nb
        ? `<p class="buy__next"><i></i><span>${en ? 'Next batch' : 'Gelombang terdekat'} <b>${ELV_BATCH.range(nb, lang)}</b> · ${en ? 'register by' : 'daftar s.d.'} ${ELV_BATCH.day(nb.closeAt, lang)}</span></p>`
        : `<p class="buy__next is-none"><span>${en ? 'The nearest batches are full — ask about the waitlist.' : 'Gelombang terdekat penuh — tanyakan daftar tunggu.'}</span></p>`;
      el.innerHTML = `
        <p class="buy__from">${en ? 'Per batch' : 'Per gelombang'} · ${n} ${en ? 'sessions' : 'sesi'}</p>
        <p class="buy__amount"><b>${rp(m)}</b><span>/${en ? 'batch' : 'gelombang'}</span></p>
        ${nextLine}`;
    });
  }
  const pdTabs = $('.pd-tabs');
  if (pdTabs) {
    const links = $$('a[href^="#"]', pdTabs);
    const ink = $('.pd-tabs__ink', pdTabs);
    const moveInk = (a) => { if (a && ink) { ink.style.width = a.offsetWidth + 'px'; ink.style.transform = `translateX(${a.offsetLeft}px)`; } };
    const setActive = (id) => {
      links.forEach((l) => {
        const on = l.getAttribute('href') === '#' + id;
        l.classList.toggle('is-active', on);
        if (on) { moveInk(l); const box = l.parentElement; if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: l.offsetLeft - 16, behavior: 'smooth' }); }
      });
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-35% 0px -55% 0px' });
    links.forEach((l) => { const sec = $(l.getAttribute('href')); if (sec) obs.observe(sec); });
    window.addEventListener('resize', () => moveInk($('.is-active', pdTabs)));
    requestAnimationFrame(() => moveInk($('.is-active', pdTabs)));
    // sedikit bayangan saat tab menempel
    const sentinel = document.createElement('div'); pdTabs.before(sentinel);
    new IntersectionObserver(([e]) => pdTabs.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);
  }
  $$('.js-share').forEach((btn) => btn.addEventListener('click', async () => {
    const data = { title: document.title, url: location.href.split('#')[0] };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
    } catch (e) { return; }
    const label = btn.querySelector('span');
    const old = label.textContent;
    label.textContent = lang === 'en' ? 'Link copied!' : 'Tautan disalin!';
    btn.classList.add('is-done');
    setTimeout(() => { label.textContent = old; btn.classList.remove('is-done'); }, 1800);
  }));

  /* ---------- Kartu guru: biodata saat hover, sentuh (HP), atau Enter ---------- */
  const gurus = $$('.guru');
  gurus.forEach((g) => {
    const toggle = () => {
      const open = !g.classList.contains('is-open');
      gurus.forEach((o) => o.classList.remove('is-open'));
      g.classList.toggle('is-open', open);
    };
    g.addEventListener('click', toggle);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.guru')) gurus.forEach((g) => g.classList.remove('is-open')); });

  /* ---------- Halaman hukum: tandai bagian yang sedang dibaca ---------- */
  const tocLinks = $$('.legal__toc a[href^="#"]');
  if (tocLinks.length) {
    const tocObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    tocLinks.forEach((l) => { const sec = $(l.getAttribute('href')); if (sec) tocObs.observe(sec); });
  }

  /* ---------- Mulai ---------- */
  renderCatalog('all', false);
  renderRelated();
  renderBatches();
  renderPrices();
  window.addEventListener('elv:seats', () => { renderBatches(); renderPrices(); });
  window.addEventListener('elv:content', () => { renderCatalog(currentCat, false); renderJourney(activeStep, false); renderRelated(); });
  // banner program: kuota maksimum per kelas diambil dari jadwal di config.js
  $$('[data-capacity]').forEach((el) => {
    const caps = (window.ELV_BATCH ? ELV_BATCH.slots(el.dataset.capacity) : []).map((c) => c.capacity);
    if (caps.length) el.textContent = Math.max(...caps);
    else (el.closest('li, .pdh__chip') || el).remove();
  });
  renderJourney(0, false);
  if (lang === 'en') applyLang('en');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
