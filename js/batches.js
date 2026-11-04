/* Elevaree — logika gelombang (batch) kelas
   Aturan ada di js/config.js → batches. Dipakai oleh halaman program & halaman daftar.
   - Gelombang dibuka tiap tanggal startDays (10 & 25). Jatuh di Sabtu/Minggu → mulai Senin berikutnya.
   - Satu gelombang = `sessions` hari efektif (Senin–Jumat).
   - Pendaftaran ditutup `closeBeforeDays` hari sebelum mulai. */
(() => {
  const C = window.ELEVAREE || {};
  const B = C.batches || {};
  const DAY = 864e5;

  const MONTHS = {
    id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  const WEEKDAYS = { id: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };
  const TIME_NAME = {
    pagi: { id: 'Pagi', en: 'Morning' }, siang: { id: 'Siang', en: 'Midday' },
    sore: { id: 'Sore', en: 'Afternoon' }, malam: { id: 'Malam', en: 'Evening' },
  };

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
  const nextWeekday = (d) => { let x = new Date(d); while (isWeekend(x)) x = addDays(x, 1); return x; };
  const sessionDates = (start, n) => {
    const out = []; let d = new Date(start);
    while (out.length < n) { if (!isWeekend(d)) out.push(new Date(d)); d = addDays(d, 1); }
    return out;
  };

  const sessions = B.sessions || 10;
  const closeBefore = B.closeBeforeDays == null ? 3 : B.closeBeforeDays;
  const startDays = B.startDays || [10, 25];
  const slotsOf = (program) => (B.slots || {})[program] || [];

  /* ---------- Kursi terisi ----------
     B.booked  = pendaftar di luar website (manual, mis. lewat WhatsApp).
     remote    = hitungan otomatis dari Google Sheets (tools/google-sheets-form.gs → doGet).
     Kursi terisi = manual + remote. */
  let remote = {};
  const bookedFor = (key) => {
    const out = {};
    [(B.booked || {})[key], remote[key]].forEach((m) => Object.keys(m || {}).forEach((id) => { out[id] = (out[id] || 0) + (+m[id] || 0); }));
    return out;
  };
  const SEATS_KEY = 'elv-seats';
  const SEATS_TTL = 60e3;
  let seatsReq = null;
  /** Ambil jumlah kursi terisi dari Google Sheets. Gagal/tidak diatur → pakai angka manual saja. */
  function loadSeats({ force = false } = {}) {
    if (!C.formEndpoint) return Promise.resolve(false);
    if (!force) {
      try {
        const c = JSON.parse(sessionStorage.getItem(SEATS_KEY));
        if (c && Date.now() - c.t < SEATS_TTL) { remote = c.booked || {}; return Promise.resolve(true); }
      } catch (e) { /* abaikan */ }
      if (seatsReq) return seatsReq;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    seatsReq = fetch(`${C.formEndpoint}${C.formEndpoint.includes('?') ? '&' : '?'}action=seats`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => {
        if (!j || !j.ok || !j.booked) return false;
        remote = j.booked;
        try { sessionStorage.setItem(SEATS_KEY, JSON.stringify({ t: Date.now(), booked: remote })); } catch (e) { /* abaikan */ }
        window.dispatchEvent(new Event('elv:seats'));
        return true;
      })
      .catch(() => false)
      .finally(() => { clearTimeout(timer); seatsReq = null; });
    return seatsReq;
  }

  /** Semua gelombang yang belum selesai, urut dari yang terdekat. */
  function all(now = new Date()) {
    const today = startOfDay(now);
    const list = [];
    for (let k = -1; k <= 6; k++) {
      startDays.forEach((day) => {
        const nominal = new Date(today.getFullYear(), today.getMonth() + k, day);
        const key = iso(nominal);
        const ov = (B.overrides || {})[key] || {};
        const start = ov.start ? parse(ov.start) : nextWeekday(nominal);
        const dates = sessionDates(start, sessions);
        const end = dates[dates.length - 1];
        if (end < today) return; // sudah selesai
        const closeAt = addDays(start, -closeBefore);
        let phase = 'open';
        if (today >= start) phase = 'running';
        else if (today > closeAt) phase = 'closed';
        list.push({
          key, start, end, dates, closeAt, phase, note: ov.note || null,
          daysToClose: Math.round((closeAt - today) / DAY),
          done: dates.filter((d) => d <= today).length,
          today,
        });
      });
    }
    return list.sort((a, b) => a.start - b.start);
  }

  /** Tambahkan jam kelas, sisa kursi, dan status untuk satu program. */
  function decorate(b, program) {
    const booked = bookedFor(b.key);
    const slots = slotsOf(program).map((s) => {
      const used = Math.min(Math.max(+booked[s.id] || 0, 0), s.capacity);
      const left = s.capacity - used;
      return Object.assign({}, s, { booked: used, left, full: left === 0, low: left > 0 && left <= 2 });
    });
    const totalLeft = slots.reduce((n, s) => n + s.left, 0);
    let status = b.phase; // running | closed
    if (b.phase === 'open') status = !slots.length ? 'open' : totalLeft === 0 ? 'full' : totalLeft <= 2 ? 'low' : 'open';
    return Object.assign({}, b, { program, slots, totalLeft, status, joinable: b.phase === 'open' && slots.some((s) => !s.full) });
  }

  const forProgram = (program, { now, limit } = {}) => all(now).slice(0, limit || B.show || 4).map((b) => decorate(b, program));
  const next = (program, now) => all(now).map((b) => decorate(b, program)).find((b) => b.joinable) || null;
  const find = (program, key, now) => { const b = all(now).find((x) => x.key === key); return b ? decorate(b, program) : null; };

  /* ---------- format ---------- */
  const day = (d, lang = 'id') => `${d.getDate()} ${MONTHS[lang][d.getMonth()]}`;
  const range = (b, lang = 'id') => `${day(b.start, lang)} – ${day(b.end, lang)} ${b.end.getFullYear()}`;
  const timeLabel = (s) => `${s.start.replace(':', '.')}–${s.end.replace(':', '.')}`;
  const tt = (o, lang) => (o == null ? '' : typeof o === 'string' ? o : o[lang] || o.id);

  window.ELV_BATCH = {
    all, forProgram, next, find, slots: slotsOf, loadSeats,
    sessions, closeBefore, startDays,
    day, range, timeLabel, tt, iso, parse,
    MONTHS, WEEKDAYS, TIME_NAME,
  };
  loadSeats(); // kursi terisi diperbarui otomatis; halaman menggambar ulang lewat event 'elv:seats'
})();
