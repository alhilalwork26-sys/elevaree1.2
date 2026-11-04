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

const LEAD_SHEET = 'Pendaftar';
const LEAD_COLUMNS = [
  ['sentAt', 'Waktu daftar'], ['name', 'Nama'], ['for', 'Untuk'], ['child', 'Nama anak'], ['age', 'Usia anak'],
  ['program', 'Program'], ['time', 'Waktu belajar'], ['wa', 'WhatsApp'], ['email', 'Email'], ['note', 'Tujuan / catatan'],
  ['lang', 'Bahasa'], ['page', 'Halaman'],
];

/** GET ?action=seats → { ok, booked: { '2026-11-10': { 'kids-pagi': 3 } } } */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'seats') return json_({ ok: true, booked: seats_() });
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
    if (p.type === 'order') return saveOrder_(p);
    appendRow_(sheet_(LEAD_SHEET, LEAD_COLUMNS), LEAD_COLUMNS, p);
    return ok_();
  } finally {
    lock.releaseLock();
  }
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
