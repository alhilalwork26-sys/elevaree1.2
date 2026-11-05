/**
 * Elevaree — penerima pendaftaran & pesanan ke Google Sheets
 *
 * CARA PASANG (sekali saja, ±5 menit):
 * 1. Buat Google Sheet baru, beri nama misalnya "Pendaftaran Elevaree".
 * 2. Di Sheet itu buka menu Extensions → Apps Script.
 * 3. Hapus isi editor, tempel SELURUH isi file ini, lalu klik Save.
 * 4. Klik Deploy → New deployment → ikon roda → pilih "Web app".
 *      - Execute as : Me
 *      - Who has access : Anyone
 *    Klik Deploy, izinkan akses akun Google Anda.
 * 5. Salin "Web app URL" (berakhiran /exec).
 * 6. Buka js/config.js, isi formEndpoint dengan URL tadi. Selesai.
 *
 * CATATAN: kolom Sheet "Pesanan" bertambah (Gelombang, Jam kelas, Kode gelombang, Kode jam kelas, Level tes). Jika Anda sudah memakai versi lama,
 *   hapus sheet "Pesanan" lama (atau ganti namanya) supaya sheet baru dibuat dengan kolom yang benar.
 *
 * Hasilnya:
 * - Sheet "Pesanan": satu baris per pesanan dari halaman daftar.html. Saat peserta menekan
 *   "Saya sudah bayar", kolom Status pesanan yang sama diperbarui menjadi "konfirmasi dikirim".
 *   Setelah Anda cek mutasi rekening, ubah Status menjadi "lunas" secara manual.
 * - Sheet "Pendaftar": kiriman lain (mis. form lama) tetap dicatat di sini.
 *
 * KURSI OTOMATIS:
 * - Website membaca jumlah kursi terisi dari alamat  <Web app URL>?action=seats
 * - Yang dihitung: pesanan paket gelombang berstatus "lunas", ditambah pesanan "menunggu pembayaran" /
 *   "konfirmasi dikirim" yang masuk dalam HOLD_HOURS terakhir (kursi ditahan sementara).
 *   Status lain ("batal", "kedaluwarsa", dll.) tidak dihitung → kursi otomatis terbuka lagi.
 * - Cukup ubah kolom Status di Sheet "Pesanan" menjadi "lunas" setelah cek mutasi. Selesai.
 * - Murid yang daftar lewat WhatsApp (bukan website): tambahkan di js/config.js → batches.booked.
 *
 * TES LEVEL (tes-level.html): peserta mengisi data diri dulu. Datanya masuk ke sheet "Tes Level"
 *   (satu baris per peserta; kolom Status berubah mulai → selesai / dihentikan, plus level, skor, rekomendasi program).
 *   Dipakai untuk marketing: hubungi peserta lewat WhatsApp/email sesuai persetujuan yang mereka berikan.
 *
 * HALAMAN ADMIN (admin.html):
 * - Di Apps Script buka Project Settings (ikon roda) → Script properties → Add script property:
 *     Property: ADMIN_PASSWORD   Value: (kata sandi panjang pilihan Anda, mis. 4 kata acak)
 *   Lalu buka  https://<domain-anda>/admin.html  dan masuk dengan kata sandi itu.
 * - Teks hasil edit disimpan di sheet "Konten", pengaturan (WhatsApp, harga, rekening, kursi manual) di sheet "Pengaturan".
 *   Keduanya dibuat otomatis. Jangan ubah isinya langsung kecuali Anda tahu caranya; pakai admin.html.
 * - Salah kata sandi 5x berturut-turut mengunci login admin selama 10 menit.
 *
 * Jika Anda mengubah kode ini, buat versi baru: Deploy → Manage deployments → Edit → New version.
 */

const ORDER_SHEET = 'Pesanan';
const ORDER_COLUMNS = [
  ['sentAt', 'Waktu'],
  ['orderId', 'No. pesanan'],
  ['status', 'Status'],
  ['program', 'Program'],
  ['package', 'Paket'],
  ['batch', 'Gelombang'],
  ['slot', 'Jam kelas'],
  ['batchKey', 'Kode gelombang'],
  ['slotId', 'Kode jam kelas'],
  ['days', 'Hari (kelas percobaan)'],
  ['time', 'Waktu (kelas percobaan)'],
  ['for', 'Untuk'],
  ['name', 'Nama'],
  ['child', 'Nama anak'],
  ['age', 'Usia anak'],
  ['wa', 'WhatsApp'],
  ['email', 'Email'],
  ['note', 'Tujuan / catatan'],
  ['level', 'Level (tes online)'],
  ['subtotal', 'Subtotal'],
  ['discount', 'Diskon'],
  ['promo', 'Kode promo'],
  ['unique', 'Kode unik'],
  ['total', 'Total transfer'],
  ['method', 'Metode'],
  ['lang', 'Bahasa'],
];

const HOLD_HOURS = 48; // lama kursi ditahan untuk pesanan yang belum lunas
const PAID_STATUS = 'lunas';
const HOLD_STATUS = ['menunggu pembayaran', 'konfirmasi dikirim'];

const LEVEL_SHEET = 'Tes Level';
const LEVEL_COLUMNS = [
  ['sentAt', 'Waktu'], ['id', 'ID tes'], ['status', 'Status'], ['name', 'Nama'], ['child', 'Nama anak'], ['age', 'Usia anak'],
  ['wa', 'WhatsApp'], ['email', 'Email'], ['city', 'Kota'], ['source', 'Tahu dari'], ['aud', 'Untuk'], ['goal', 'Tujuan'],
  ['level', 'Level'], ['score', 'Skor'], ['program', 'Rekomendasi program'], ['warnings', 'Peringatan pindah tab'], ['reason', 'Alasan berhenti'], ['lang', 'Bahasa'],
];

const LEAD_SHEET = 'Pendaftar';
const LEAD_COLUMNS = [
  ['sentAt', 'Waktu daftar'], ['name', 'Nama'], ['for', 'Untuk'], ['child', 'Nama anak'], ['age', 'Usia anak'],
  ['program', 'Program'], ['time', 'Waktu belajar'], ['wa', 'WhatsApp'], ['email', 'Email'], ['note', 'Tujuan / catatan'],
  ['lang', 'Bahasa'], ['page', 'Halaman'],
];

const CONTENT_SHEET = 'Konten';
const CONTENT_COLUMNS = [['key', 'Kunci'], ['id', 'Indonesia'], ['en', 'English'], ['at', 'Diubah']];
const SETTINGS_SHEET = 'Pengaturan';

/** GET ?action=seats → { ok, booked: { '2026-11-10': { 'kids-pagi': 3 } } } */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'seats') return json_({ ok: true, booked: seats_() });
  if (action === 'content') return json_({ ok: true, content: content_(), settings: settings_() });
  return json_({ ok: true });
}

function seats_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('seats');
  if (hit) return JSON.parse(hit);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDER_SHEET);
  const booked = {};
  if (sheet && sheet.getLastRow() > 1) {
    const col = (key) => ORDER_COLUMNS.findIndex((c) => c[0] === key);
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, ORDER_COLUMNS.length).getValues();
    const now = Date.now();
    rows.forEach((r) => {
      const batch = String(r[col('batchKey')] || '').trim();
      const slot = String(r[col('slotId')] || '').trim();
      if (!batch || !slot) return;
      const status = String(r[col('status')] || '').trim().toLowerCase();
      let counts = status === PAID_STATUS;
      if (!counts && HOLD_STATUS.indexOf(status) >= 0) {
        const at = new Date(r[col('sentAt')]).getTime();
        counts = !isNaN(at) && now - at < HOLD_HOURS * 3600e3;
      }
      if (!counts) return;
      booked[batch] = booked[batch] || {};
      booked[batch][slot] = (booked[batch][slot] || 0) + 1;
    });
  }
  cache.put('seats', JSON.stringify(booked), 20); // 20 detik, agar Sheet tidak dibaca berlebihan
  return booked;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    if (p.website) return ok_(); // kiriman bot
    if (p.type === 'admin') return admin_(p);
    if (p.type === 'level') return saveLevel_(p);
    if (p.type === 'order') return saveOrder_(p);
    appendRow_(sheet_(LEAD_SHEET, LEAD_COLUMNS), LEAD_COLUMNS, p);
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

/* ---------- ADMIN: teks website & pengaturan ---------- */
function content_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('content');
  if (hit) return JSON.parse(hit);
  const out = {};
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONTENT_SHEET);
  if (sheet && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues().forEach((r) => {
      if (r[0]) out[String(r[0])] = { id: String(r[1]), en: String(r[2]) };
    });
  }
  try { cache.put('content', JSON.stringify(out), 60); } catch (err) { /* terlalu besar untuk cache */ }
  return out;
}

function settings_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return {};
  try { return JSON.parse(sheet.getRange(2, 2).getValue()) || {}; } catch (err) { return {}; }
}

function safeEq_(a, b) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function admin_(p) {
  const pw = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!pw) return json_({ ok: false, error: 'no-password' });
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('adminFails') || 0);
  if (fails >= 5) return json_({ ok: false, error: 'locked' });
  if (!safeEq_(String(p.password || ''), pw)) {
    cache.put('adminFails', String(fails + 1), 600);
    return json_({ ok: false, error: 'auth' });
  }
  cache.remove('adminFails');
  if (p.action === 'verify') return json_({ ok: true });
  if (p.action === 'saveContent') return saveContent_(p);
  if (p.action === 'saveSettings') return saveSettings_(p);
  return json_({ ok: false, error: 'action' });
}

function saveContent_(p) {
  let changes;
  try { changes = JSON.parse(p.payload); } catch (err) { return json_({ ok: false, error: 'payload' }); }
  const sheet = sheet_(CONTENT_SHEET, CONTENT_COLUMNS);
  const rows = {};
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues().forEach((r) => { if (r[0]) rows[String(r[0])] = r; });
  }
  const now = new Date().toISOString();
  Object.keys(changes).forEach((k) => {
    if (!/^[a-z0-9]{1,12}$/.test(k)) return;
    const v = changes[k];
    if (v === null) { delete rows[k]; return; }
    if (typeof v.id !== 'string' || typeof v.en !== 'string') return;
    rows[k] = [k, v.id.slice(0, 3000), v.en.slice(0, 3000), now];
  });
  const list = Object.keys(rows).slice(0, 3000).map((k) => rows[k]);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).clearContent();
  if (list.length) sheet.getRange(2, 1, list.length, 4).setNumberFormat('@').setValues(list);
  CacheService.getScriptCache().remove('content');
  return json_({ ok: true, count: list.length });
}

function saveSettings_(p) {
  let s;
  try { s = JSON.parse(p.payload); } catch (err) { return json_({ ok: false, error: 'payload' }); }
  const clean = {};
  if (typeof s.waNumber === 'string') clean.waNumber = s.waNumber.replace(/\D/g, '').slice(0, 20);
  if (s.prices && typeof s.prices === 'object') {
    clean.prices = {};
    Object.keys(s.prices).forEach((k) => {
      const n = Number(s.prices[k]);
      if (/^[a-z]{1,20}$/.test(k) && isFinite(n) && n >= 0 && n <= 100000000) clean.prices[k] = Math.round(n);
    });
  }
  if (s.payment && typeof s.payment === 'object') {
    clean.payment = {};
    const h = Number(s.payment.deadlineHours);
    if (isFinite(h) && h > 0 && h <= 720) clean.payment.deadlineHours = h;
    if (Array.isArray(s.payment.banks)) {
      clean.payment.banks = s.payment.banks.slice(0, 6).map((b) => ({
        bank: String((b && b.bank) || '').slice(0, 40),
        number: String((b && b.number) || '').replace(/[^0-9 \-]/g, '').slice(0, 40),
        holder: String((b && b.holder) || '').slice(0, 80),
      }));
    }
    if (typeof s.payment.qrisImage === 'string') clean.payment.qrisImage = s.payment.qrisImage.slice(0, 300);
  }
  if (s.booked && typeof s.booked === 'object') clean.booked = s.booked;
  const sheet = sheet_(SETTINGS_SHEET, [['key', 'Kunci'], ['value', 'Nilai (JSON)']]);
  sheet.getRange(2, 1, 1, 2).setNumberFormat('@').setValues([['settings', JSON.stringify(clean)]]);
  return json_({ ok: true });
}

/* Tes level: satu baris per peserta (data marketing). Status diperbarui: mulai → selesai / dihentikan. */
function saveLevel_(p) {
  const sheet = sheet_(LEVEL_SHEET, LEVEL_COLUMNS);
  const col = (key) => LEVEL_COLUMNS.findIndex((c) => c[0] === key) + 1;
  const id = String(p.id || '').slice(0, 40);
  if (!/^LV[A-Z0-9]{4,30}$/.test(id)) return ok_();
  const ids = sheet.getLastRow() > 1 ? sheet.getRange(2, col('id'), sheet.getLastRow() - 1, 1).getValues() : [];
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      ['status', 'level', 'score', 'program', 'warnings', 'reason'].forEach((k) => {
        if (p[k] !== undefined && (k === 'status' || p[k] !== '')) sheet.getRange(i + 2, col(k)).setValue(String(p[k]).slice(0, 200));
      });
      return ok_();
    }
  }
  p.sentAt = new Date().toISOString();
  appendRow_(sheet, LEVEL_COLUMNS, p);
  return ok_();
}

function saveOrder_(p) {
  const sheet = sheet_(ORDER_SHEET, ORDER_COLUMNS);
  // pesanan yang sudah ada? cukup perbarui statusnya
  const ids = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] && ids[i][0] === p.orderId) {
      sheet.getRange(i + 2, 3).setValue(p.status || '');
      CacheService.getScriptCache().remove('seats');
      return ok_();
    }
  }
  appendRow_(sheet, ORDER_COLUMNS, p);
  CacheService.getScriptCache().remove('seats');
  return ok_();
}

function sheet_(name, columns) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(columns.map((c) => c[1]));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold');
  }
  return sheet;
}

function appendRow_(sheet, columns, p) {
  // tanda kutip di depan nomor WA agar tidak berubah jadi angka/notasi ilmiah
  sheet.appendRow(columns.map(([key]) => {
    const v = String(p[key] || '').slice(0, 1000);
    return key === 'wa' && v ? "'" + v : v;
  }));
}

function ok_() {
  return json_({ ok: true });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
