/* Elevaree — tes level bahasa Inggris (penempatan CEFR A1–C1) → rekomendasi program
   Soal ada di BANK_ADULT (13+) dan BANK_KIDS (7–12). Tambah/ubah soal cukup di dua daftar itu. */
(() => {
  const C = window.ELEVAREE || {};
  const BT = window.ELV_BATCH;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
    raw(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; },
  };
  let lang = document.documentElement.lang === 'en' ? 'en' : 'id';
  const ovr = (o) => (window.ELV_CONTENT ? window.ELV_CONTENT.ov(o) : o);
  const t = (o) => (o == null ? '' : typeof o === 'string' ? o : ((o = ovr(o)), o[lang] || o.id));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Bank soal ----------
     l = tingkat (0 = A1 … 4 = C1) · s = g (grammar) / v (vocab) / r (reading) · o = pilihan, a = indeks jawaban benar · p = teks bacaan */
  const BANK_ADULT = [
    { l: 0, s: 'g', q: 'She ___ a teacher.', o: ['is', 'are', 'am', 'be'], a: 0 },
    { l: 0, s: 'g', q: 'I ___ coffee every morning.', o: ['drink', 'drinks', 'drinking', 'am drink'], a: 0 },
    { l: 0, s: 'v', q: 'Which word is a fruit?', o: ['chair', 'apple', 'door', 'table'], a: 1 },
    { l: 0, s: 'g', q: '"___ is your name?" — "My name is Rina."', o: ['What', 'Where', 'Who', 'When'], a: 0 },
    { l: 1, s: 'g', q: 'Yesterday we ___ to the market.', o: ['go', 'went', 'goes', 'going'], a: 1 },
    { l: 1, s: 'g', q: "There aren't ___ apples left.", o: ['any', 'some', 'a', 'much'], a: 0 },
    { l: 1, s: 'v', q: 'The opposite of "cheap" is ___.', o: ['small', 'slow', 'expensive', 'young'], a: 2 },
    { l: 1, s: 'g', q: 'He is taller ___ his brother.', o: ['than', 'then', 'that', 'as'], a: 0 },
    { l: 2, s: 'g', q: "If it rains tomorrow, we ___ at home.", o: ['stay', 'will stay', 'would stay', 'stayed'], a: 1 },
    { l: 2, s: 'g', q: 'I have lived in Bandung ___ 2019.', o: ['for', 'from', 'since', 'during'], a: 2 },
    { l: 2, s: 'g', q: "I'm looking forward ___ you next week.", o: ['to see', 'to seeing', 'seeing', 'for seeing'], a: 1 },
    { l: 2, s: 'r', p: 'Dina usually walks to work, but today it was raining, so she took the bus. She arrived ten minutes late.', q: 'Why did Dina take the bus?', o: ['She was late for work.', 'It was raining.', 'She did not like walking.', 'Her office was far away.'], a: 1 },
    { l: 3, s: 'g', q: 'By the time we arrived, the film ___.', o: ['already started', 'has already started', 'had already started', 'was already starting'], a: 2 },
    { l: 3, s: 'g', q: 'She suggested ___ a taxi because it was late.', o: ['to take', 'taking', 'take', 'took'], a: 1 },
    { l: 3, s: 'v', q: 'The company decided to ___ the meeting because the manager was ill.', o: ['prevent', 'pretend', 'postpone', 'prefer'], a: 2 },
    { l: 3, s: 'g', q: 'If I had known about the traffic, I ___ earlier.', o: ['would leave', 'left', 'will leave', 'would have left'], a: 3 },
    { l: 4, s: 'g', q: 'Not only ___ late, but he also forgot the documents.', o: ['he was', 'was he', 'did he', 'he did be'], a: 1 },
    { l: 4, s: 'v', q: 'Her argument was so ___ that nobody could disagree with it.', o: ['compulsive', 'complacent', 'competent', 'compelling'], a: 3 },
    { l: 4, s: 'g', q: 'Had I known about the risks, I ___ the contract.', o: ["wouldn't have signed", "won't sign", "didn't sign", "hadn't signed"], a: 0 },
    { l: 4, s: 'r', p: '"What a delightful day," she muttered, staring at her broken umbrella as the rain soaked through her coat.', q: 'What does her comment suggest?', o: ['She is enjoying the weather.', 'She is actually annoyed.', 'She wants to buy a new coat.', 'She is waiting for the rain to stop.'], a: 1 },
  ];
  const BANK_KIDS = [
    { s: 'v', q: '🐱  This is a ___.', o: ['dog', 'cat', 'bird', 'fish'], a: 1 },
    { s: 'v', q: '☀️  What colour is the sun?', o: ['blue', 'green', 'yellow', 'black'], a: 2 },
    { s: 'g', q: 'I ___ seven years old.', o: ['is', 'are', 'am', 'be'], a: 2 },
    { s: 'g', q: 'She has two ___.', o: ['book', 'books', 'bookes', 'bookies'], a: 1 },
    { s: 'v', q: '✏️  What do you do with a pencil?', o: ['eat', 'write', 'sleep', 'swim'], a: 1 },
    { s: 'g', q: 'He ___ football every Sunday.', o: ['play', 'playing', 'plays', 'to play'], a: 2 },
    { s: 'g', q: '___ you like pizza?', o: ['Do', 'Does', 'Is', 'Are'], a: 0 },
    { s: 'g', q: 'Yesterday I ___ a movie with my family.', o: ['watch', 'watches', 'watched', 'watching'], a: 2 },
    { s: 'g', q: 'An elephant is ___ than a mouse.', o: ['big', 'bigger', 'biggest', 'more big'], a: 1 },
    { s: 'r', p: 'Tom has a red ball. He plays with it in the park every afternoon.', q: 'Where does Tom play with his ball?', o: ['At school', 'In the park', 'At home', 'In the kitchen'], a: 1 },
  ];

  const LEVELS = [
    { code: 'A0', name: { id: 'Pemula', en: 'Beginner' }, desc: { id: 'Kamu baru memulai, dan itu titik awal yang bagus. Fokus awalmu: kosakata sehari-hari, kalimat sederhana, dan berani mengucapkannya.', en: "You're just starting out — a great place to be. Your first focus: everyday vocabulary, simple sentences, and speaking up." } },
    { code: 'A1', name: { id: 'Dasar', en: 'Elementary' }, desc: { id: 'Kamu bisa memahami dan memakai kalimat dasar untuk memperkenalkan diri dan kebutuhan sehari-hari. Selanjutnya: bercerita tentang masa lalu dan rencana.', en: 'You can understand and use basic sentences to introduce yourself and cover daily needs. Next: talking about the past and your plans.' } },
    { code: 'A2', name: { id: 'Pra-menengah', en: 'Pre-intermediate' }, desc: { id: 'Kamu bisa bercakap dalam situasi yang akrab: belanja, bertanya arah, bercerita singkat. Selanjutnya: menyampaikan pendapat dan alasan dengan lebih lancar.', en: 'You can hold conversations in familiar situations: shopping, directions, short stories. Next: giving opinions and reasons more fluently.' } },
    { code: 'B1', name: { id: 'Menengah', en: 'Intermediate' }, desc: { id: 'Kamu cukup mandiri: bisa mengobrol topik umum, menulis teks sederhana, dan memahami inti percakapan. Selanjutnya: ketepatan tata bahasa dan kosakata yang lebih kaya.', en: 'You are fairly independent: you can chat about general topics, write simple texts and follow the main points. Next: grammatical accuracy and richer vocabulary.' } },
    { code: 'B2', name: { id: 'Menengah atas', en: 'Upper-intermediate' }, desc: { id: 'Kamu lancar dan spontan di banyak situasi, termasuk topik kerja atau akademik. Selanjutnya: nuansa, struktur argumen, dan gaya formal.', en: 'You are fluent and spontaneous in many situations, including work or academic topics. Next: nuance, argument structure and formal style.' } },
    { code: 'C1', name: { id: 'Mahir', en: 'Advanced' }, desc: { id: 'Bahasa Inggrismu sudah sangat kuat. Selanjutnya: pengasahan untuk tujuan khusus seperti IELTS/TOEFL skor tinggi, presentasi, atau negosiasi.', en: 'Your English is very strong. Next: polish for specific goals such as a high IELTS/TOEFL score, presentations or negotiation.' } },
  ];
  const KID_LEVELS = [
    { code: 'Pre-A1', name: { id: 'Starter', en: 'Starter' }, desc: { id: 'Si kecil baru mulai mengenal bahasa Inggris. Lewat lagu, cerita, dan permainan, ia akan cepat berani bicara.', en: 'Your child is just meeting English. Through songs, stories and games, they will soon gain the courage to speak.' } },
    { code: 'A1', name: { id: 'Explorer', en: 'Explorer' }, desc: { id: 'Si kecil sudah mengenal kosakata dan kalimat dasar. Selanjutnya: bercerita tentang kegiatan sehari-hari dan membaca cerita pendek.', en: 'Your child knows basic words and sentences. Next: talking about daily activities and reading short stories.' } },
    { code: 'A2', name: { id: 'Adventurer', en: 'Adventurer' }, desc: { id: 'Si kecil sudah cukup lancar dengan kalimat sederhana dan bentuk lampau. Selanjutnya: bercerita lebih panjang dan percaya diri tampil di depan kelas.', en: 'Your child is quite comfortable with simple sentences and the past tense. Next: longer stories and confident class presentations.' } },
  ];
  const SKILLS = { g: { id: 'Tata bahasa', en: 'Grammar' }, v: { id: 'Kosakata', en: 'Vocabulary' }, r: { id: 'Membaca', en: 'Reading' } };

  const PROGS = {
    kids: { title: 'English for Kids', slug: 'english-for-kids', img: 'kids-trio.png', color: 'mustard' },
    teens: { title: 'English for Teens', slug: 'english-for-teens', img: 'teen-girl.png', color: 'lime' },
    general: { title: 'General English', slug: 'general-english', img: 'adult-man.png', color: 'sage' },
    ielts: { title: 'IELTS & TOEFL Prep', slug: 'ielts-toefl-prep', img: 'scholar-man.png', color: 'peach' },
    business: { title: 'Business English', slug: 'business-english', img: 'worker-woman.png', color: 'lilac' },
  };

  const AUD = [
    { key: 'kids', title: { id: 'Anak saya', en: 'My child' }, sub: { id: 'Usia 7–12 tahun · dikerjakan bersama orang tua', en: 'Ages 7–12 · taken together with a parent' } },
    { key: 'teens', title: { id: 'Remaja', en: 'Teenager' }, sub: { id: 'Usia 13–17 tahun', en: 'Ages 13–17' } },
    { key: 'adult', title: { id: 'Dewasa', en: 'Adult' }, sub: { id: 'Usia 18 tahun ke atas', en: 'Ages 18 and up' } },
  ];
  const GOAL = [
    { key: 'general', title: { id: 'Percakapan sehari-hari', en: 'Everyday conversation' }, sub: { id: 'Lancar ngobrol, traveling, pergaulan', en: 'Fluent chat, travel, socialising' } },
    { key: 'ielts', title: { id: 'Beasiswa / IELTS-TOEFL', en: 'Scholarship / IELTS-TOEFL' }, sub: { id: 'Skor tes untuk kuliah atau beasiswa', en: 'Test score for study or scholarships' } },
    { key: 'business', title: { id: 'Karier & pekerjaan', en: 'Career & work' }, sub: { id: 'Meeting, email, presentasi, interview', en: 'Meetings, emails, presentations, interviews' } },
  ];

  const TX = {
    qOf: { id: 'Soal {n} dari {t}', en: 'Question {n} of {t}' },
    next: { id: 'Lanjut', en: 'Continue' }, finish: { id: 'Lihat hasil', en: 'See my result' },
    idk: { id: 'Saya tidak tahu', en: "I don't know" },
    hintAud: { id: 'Pilih dulu siapa yang akan tes.', en: 'Choose who is taking the test first.' },
    hintGoal: { id: 'Pilih juga tujuan utamamu.', en: 'Pick your main goal too.' },
    hintReady: { id: 'Siap! Tidak ada jawaban salah yang dihukum — jawab jujur saja.', en: 'Ready! Nothing is penalised — just answer honestly.' },
    qUnit: { id: 'soal', en: 'questions' },
    timeKids: { id: '±3 menit', en: '~3 minutes' }, timeAdult: { id: '±6 menit', en: '~6 minutes' },
    resTitle: { id: 'Level kamu: {code} · {name}', en: 'Your level: {code} · {name}' },
    resTitleKids: { id: 'Level si kecil: {code} · {name}', en: "Your child's level: {code} · {name}" },
    score: { id: '{n}/{t} benar', en: '{n}/{t} correct' },
    recTitle: { id: 'Program yang cocok untukmu', en: 'The programme for you' },
    recTitleKids: { id: 'Program yang cocok untuk si kecil', en: 'The programme for your child' },
    nextBatch: { id: 'Gelombang terdekat', en: 'Next batch' },
    left: { id: 'tersisa {n} kursi', en: '{n} seats left' },
    noBatch: { id: 'Jadwal gelombang berikutnya segera dibuka.', en: 'The next batch will open soon.' },
    join: { id: 'Daftar program ini', en: 'Enrol in this programme' },
    trial: { id: 'Coba kelas percobaan', en: 'Try a trial class' },
    detail: { id: 'Lihat detail program', en: 'View programme details' },
    why: {
      kids: { id: 'Belajar sambil bermain dengan tutor ramah anak, kelas 60 menit pagi atau malam.', en: 'Learn through play with a kid-friendly tutor in 60-minute morning or evening classes.' },
      teens: { id: 'Fokus diskusi, presentasi, dan percaya diri bicara, sesuai dunia remaja.', en: 'Focused on discussion, presentation and speaking confidence, made for teenagers.' },
      general: { id: 'Percakapan sehari-hari dengan tutor yang menyesuaikan levelmu.', en: 'Everyday conversation with a tutor who adapts to your level.' },
      ielts: { id: 'Strategi, latihan soal, dan simulasi tes IELTS/TOEFL sesuai levelmu.', en: 'Strategy, practice and mock tests for IELTS/TOEFL matched to your level.' },
      business: { id: 'Meeting, email, presentasi, dan interview kerja dalam bahasa Inggris.', en: 'Meetings, emails, presentations and job interviews in English.' },
    },
    foundation: { id: 'Levelmu masih di bawah B1, jadi kami sarankan mulai dari General English untuk membangun fondasi, lalu lanjut ke {p}.', en: "Your level is still below B1, so we suggest starting with General English to build a foundation, then moving on to {p}." },
    waMsg: { id: 'Halo Elevaree! Hasil tes level saya: {code} ({name}), skor {n}/{t}. Rekomendasi: {prog}. Saya ingin konsultasi jadwal dan program yang cocok.', en: 'Hi Elevaree! My level test result: {code} ({name}), score {n}/{t}. Recommended: {prog}. I would like advice on the right schedule and programme.' },
  };

  /* ---------- State ---------- */
  const state = { aud: '', goal: '', quiz: [], i: 0, picked: null, answers: [], view: 'intro' };
  const views = $$('.lv-view');
  const toastEl = $('.toast');
  let toastT;
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 1800); };

  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const isKids = () => state.aud === 'kids';

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
    $$('[data-en-label]').forEach((el) => { if (!el.dataset.idLabel) el.dataset.idLabel = el.getAttribute('aria-label'); el.setAttribute('aria-label', next === 'en' ? el.dataset.enLabel : el.dataset.idLabel); });
    document.title = next === 'en' ? document.documentElement.dataset.titleEn : titleId;
    $$('.lang__btn').forEach((b) => { b.classList.toggle('is-active', b.dataset.lang === next); b.setAttribute('aria-pressed', b.dataset.lang === next); });
    renderAll();
  }
  $$('.lang__btn').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang === lang) return; store.raw('elv-lang', b.dataset.lang); applyLang(b.dataset.lang); }));
  $('.theme-btn').addEventListener('click', () => {
    const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', n);
    store.raw('elv-theme', n);
  });

  /* ---------- Tampilan ---------- */
  function show(name, dir = 1) {
    const cur = views.find((v) => !v.hidden);
    const target = views.find((v) => v.dataset.view === name);
    const enter = () => {
      views.forEach((v) => { v.hidden = v !== target; v.classList.remove('is-in-right', 'is-in-left', 'is-out'); });
      state.view = name;
      void target.offsetWidth;
      target.classList.add(dir < 0 ? 'is-in-left' : 'is-in-right');
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      const focusEl = $('#lv-q', target) || $('.lv-rtitle', target) || $('.reg-title', target);
      if (focusEl && name !== 'intro') focusEl.focus({ preventScroll: true });
      renderAll();
    };
    if (cur && cur !== target && !reduceMotion) { cur.style.setProperty('--dir', dir); cur.classList.add('is-out'); setTimeout(enter, 200); } else enter();
  }

  function setProgress() {
    const bar = $('.reg-progress span');
    const f = state.view === 'intro' ? 0.03 : state.view === 'quiz' ? (state.i + (state.picked != null ? 1 : 0.4)) / state.quiz.length : 1;
    bar.style.setProperty('--progress', Math.min(1, f));
    const count = $('.js-count');
    if (state.view === 'quiz') count.innerHTML = `<b>${state.i + 1}</b> / ${state.quiz.length}`;
    else if (state.view === 'result') count.innerHTML = `<span>${lang === 'en' ? 'Result' : 'Hasil'}</span>`;
    else count.innerHTML = `<span>${lang === 'en' ? 'Level test' : 'Tes level'}</span>`;
  }

  /* ---------- Pembuka ---------- */
  function choiceHTML(list, cur, i) {
    return list.map((o, n) => `
      <button type="button" class="lv-choice${cur === o.key ? ' is-on' : ''}" role="radio" aria-checked="${cur === o.key}" data-key="${o.key}" style="--i:${n + i}">
        <span class="lv-choice__body"><b>${t(o.title)}</b><small>${t(o.sub)}</small></span>
        <span class="lv-choice__check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
      </button>`).join('');
  }
  function renderIntro() {
    $('.js-aud').innerHTML = choiceHTML(AUD, state.aud, 0);
    const needGoal = state.aud && !isKids();
    $('.js-goal-wrap').hidden = !needGoal;
    $('.js-goal').innerHTML = needGoal ? choiceHTML(GOAL, state.goal, 0) : '';
    const n = isKids() ? BANK_KIDS.length : BANK_ADULT.length;
    $('.js-meta-q').textContent = `${state.aud ? n : BANK_ADULT.length} ${t(TX.qUnit)}`;
    $('.js-meta-time').textContent = t(isKids() ? TX.timeKids : TX.timeAdult);
    const ready = !!state.aud && (isKids() || !!state.goal);
    $('.js-start').disabled = !ready;
    $('.js-start-hint').textContent = ready ? t(TX.hintReady) : t(state.aud ? TX.hintGoal : TX.hintAud);
  }

  /* ---------- Soal ---------- */
  const ovq = (x) => (window.ELV_CONTENT ? window.ELV_CONTENT.ovq(x) : x);
  function buildQuiz() {
    const bank = isKids() ? BANK_KIDS : BANK_ADULT;
    state.quiz = bank.map((q) => {
      const opts = shuffle(q.o.map((text, idx) => ({ text: ovq(text), ok: idx === q.a })));
      return { l: q.l, s: q.s, p: ovq(q.p), q: ovq(q.q), opts };
    });
    state.i = 0; state.picked = null; state.answers = [];
  }
  function renderQuiz() {
    const q = state.quiz[state.i];
    if (!q) return;
    $('.js-skill').textContent = t(SKILLS[q.s]);
    $('.js-qn').textContent = t(TX.qOf).replace('{n}', state.i + 1).replace('{t}', state.quiz.length);
    const pass = $('.js-passage');
    pass.hidden = !q.p;
    pass.textContent = q.p || '';
    $('#lv-q').textContent = q.q;
    const idk = { text: t(TX.idk), idk: true };
    $('.js-opts').innerHTML = [...q.opts, idk].map((o, n) => `
      <button type="button" class="lv-opt${o.idk ? ' lv-opt--idk' : ''}${state.picked === n ? ' is-on' : ''}" role="radio" aria-checked="${state.picked === n}" data-n="${n}" style="--i:${n}">
        <span class="lv-opt__key">${o.idk ? '–' : n + 1}</span>
        <span class="lv-opt__text">${esc(o.text)}</span>
      </button>`).join('');
    const last = state.i === state.quiz.length - 1;
    $('.js-next-label').textContent = t(last ? TX.finish : TX.next);
    $('.js-next').disabled = state.picked == null;
  }
  function pick(n) {
    state.picked = n;
    $$('.lv-opt').forEach((b) => { const on = +b.dataset.n === n; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
    $('.js-next').disabled = false;
    setProgress();
  }
  function advance() {
    if (state.picked == null) return;
    const q = state.quiz[state.i];
    const o = q.opts[state.picked];
    state.answers.push({ l: q.l, s: q.s, ok: !!(o && o.ok), idk: !o });
    state.picked = null;
    if (state.i < state.quiz.length - 1) {
      state.i++;
      const sec = $('[data-view="quiz"]');
      sec.classList.remove('is-in-right'); void sec.offsetWidth; sec.classList.add('is-in-right');
      renderQuiz(); setProgress();
      $('#lv-q').focus({ preventScroll: true });
    } else finish();
  }

  /* ---------- Hasil ---------- */
  function score() {
    const total = state.answers.length;
    const right = state.answers.filter((a) => a.ok).length;
    let idx;
    if (isKids()) idx = right <= 3 ? 0 : right <= 6 ? 1 : 2;
    else {
      // naik level selama ≥3 dari 4 soal pada tingkat itu benar, berurutan dari A1
      idx = 0;
      for (let l = 0; l < 5; l++) {
        const rows = state.answers.filter((a) => a.l === l);
        if (rows.filter((a) => a.ok).length >= 3) idx = l + 1; else break;
      }
    }
    const skills = {};
    state.answers.forEach((a) => { const s = skills[a.s] || (skills[a.s] = { ok: 0, n: 0 }); s.n++; if (a.ok) s.ok++; });
    return { total, right, idx, skills };
  }
  function recommend(idx) {
    if (isKids()) return { prog: 'kids' };
    if (state.aud === 'teens') return state.goal === 'ielts' && idx >= 3 ? { prog: 'ielts' } : { prog: 'teens' };
    if (state.goal === 'ielts') return idx >= 3 ? { prog: 'ielts' } : { prog: 'general', then: 'ielts' };
    if (state.goal === 'business') return idx >= 2 ? { prog: 'business' } : { prog: 'general', then: 'business' };
    return { prog: 'general' };
  }
  let result = null;
  function finish() {
    const sc = score();
    const lv = (isKids() ? KID_LEVELS : LEVELS)[sc.idx];
    const rec = recommend(sc.idx);
    result = { ...sc, level: lv, rec };
    store.set('elv-level', { code: lv.code, name: lv.name.id, program: rec.prog, score: `${sc.right}/${sc.total}`, aud: state.aud, goal: state.goal, at: Date.now() });
    show('result');
  }
  function ringAnimate(frac) {
    const fg = $('.lv-ring__fg');
    const len = 2 * Math.PI * 54;
    fg.style.strokeDasharray = len;
    fg.style.strokeDashoffset = len;
    if (reduceMotion) { fg.style.strokeDashoffset = len * (1 - frac); return; }
    void fg.getBoundingClientRect();
    fg.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1) .25s';
    requestAnimationFrame(() => { fg.style.strokeDashoffset = len * (1 - frac); });
  }
  function waText() {
    const p = PROGS[result.rec.prog];
    return t(TX.waMsg).replace('{code}', result.level.code).replace('{name}', t(result.level.name)).replace('{n}', result.right).replace('{t}', result.total).replace('{prog}', p.title);
  }
  function renderResult() {
    if (!result) return;
    const { level, right, total, skills, rec } = result;
    const kids = isKids();
    $('.js-lv').textContent = level.code;
    $('.js-score').textContent = t(TX.score).replace('{n}', right).replace('{t}', total);
    $('.lv-ring').setAttribute('aria-label', `${level.code}, ${right}/${total}`);
    $('.lv-rtitle').textContent = t(kids ? TX.resTitleKids : TX.resTitle).replace('{code}', level.code).replace('{name}', t(level.name));
    $('.js-rdesc').textContent = t(level.desc);

    $('.js-skills').innerHTML = Object.keys(skills).map((k, n) => {
      const s = skills[k]; const pct = Math.round((s.ok / s.n) * 100);
      return `<div class="lv-skill" style="--i:${n}"><span>${t(SKILLS[k])}</span><div class="lv-skill__bar"><i style="--w:${pct}%"></i></div><b>${s.ok}/${s.n}</b></div>`;
    }).join('');

    const p = PROGS[rec.prog];
    const nb = BT ? BT.next(rec.prog) : null;
    let batchLine = `<span>${t(TX.noBatch)}</span>`;
    if (nb) batchLine = `<span>${t(TX.nextBatch)} <b>${BT.range(nb, lang)}</b> · ${t(TX.left).replace('{n}', nb.totalLeft || '')}</span>`;
    if (nb && !nb.totalLeft) batchLine = `<span>${t(TX.nextBatch)} <b>${BT.range(nb, lang)}</b></span>`;
    const foundation = rec.then ? `<p class="lv-rec__foundation">${t(TX.foundation).replace('{p}', PROGS[rec.then].title)}</p>` : '';
    const q = `program=${rec.prog}`;
    $('.js-rec').innerHTML = `
      <div class="lv-rec__card bg-${p.color}">
        <div class="lv-rec__text">
          <p class="lv-rec__eyebrow">${t(kids ? TX.recTitleKids : TX.recTitle)}</p>
          <h2>${p.title}</h2>
          <p>${t(TX.why[rec.prog])}</p>
          ${foundation}
          <p class="lv-rec__batch"><i></i>${batchLine}</p>
          <div class="lv-rec__cta">
            <a class="btn btn--maroon" href="daftar.html?${q}&paket=batch"><span>${t(TX.join)}</span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            <a class="btn btn--outline" href="daftar.html?${q}&paket=trial"><span>${t(TX.trial)}</span></a>
          </div>
          <a class="link-arrow lv-rec__more" href="${p.slug}.html">${t(TX.detail)}</a>
        </div>
        <div class="lv-rec__img"><img src="assets/img/${p.img}" alt="" /></div>
      </div>`;
    $('.js-wa').href = `https://wa.me/${C.waNumber || ''}?text=${encodeURIComponent(waText())}`;
    // animasi hanya saat tampil pertama / ganti hasil
    ringAnimate(total ? right / total : 0);
    requestAnimationFrame(() => $$('.lv-skill__bar i').forEach((i) => i.classList.add('is-in')));
  }

  function renderAll() {
    if (state.view === 'intro') renderIntro();
    else if (state.view === 'quiz') renderQuiz();
    else if (state.view === 'result') renderResult();
    setProgress();
  }

  /* ---------- Interaksi ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.js-aud .lv-choice');
    if (a) { state.aud = a.dataset.key; if (isKids()) state.goal = ''; renderIntro(); return; }
    const g = e.target.closest('.js-goal .lv-choice');
    if (g) { state.goal = g.dataset.key; renderIntro(); return; }
    if (e.target.closest('.js-start')) { buildQuiz(); show('quiz'); return; }
    const o = e.target.closest('.lv-opt');
    if (o) { pick(+o.dataset.n); return; }
    if (e.target.closest('.js-next')) { advance(); return; }
    if (e.target.closest('.js-retake')) { result = null; state.aud = ''; state.goal = ''; show('intro', -1); return; }
  });
  document.addEventListener('keydown', (e) => {
    if (state.view !== 'quiz' || e.metaKey || e.ctrlKey || e.altKey) return;
    const q = state.quiz[state.i];
    if (/^[1-9]$/.test(e.key) && q && +e.key <= q.opts.length) { pick(+e.key - 1); e.preventDefault(); }
    else if (e.key === '0' || e.key === '-') { pick(q.opts.length); e.preventDefault(); }
    else if (e.key === 'Enter' && state.picked != null && document.activeElement && !document.activeElement.matches('.js-next, a')) { advance(); e.preventDefault(); }
  });

  /* ---------- Mulai ---------- */
  const params = new URLSearchParams(location.search);
  if (params.get('untuk') === 'anak' || params.get('for') === 'kids') state.aud = 'kids';
  if (lang === 'en') applyLang('en'); else renderAll();
})();
