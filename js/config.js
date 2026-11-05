/* =========================================================
   PENGATURAN ELEVAREE — satu tempat untuk semua halaman
   Isi bagian bertanda GANTI / CONTOH sebelum website online.
   ========================================================= */
window.ELEVAREE = {
  // Nomor WhatsApp Elevaree, format internasional tanpa + / spasi. GANTI, contoh: '6281234567890'.
  // Selama kosong, WhatsApp terbuka dengan pesan siap kirim dan pengguna memilih kontak sendiri.
  waNumber: '',

  // URL Web App Google Apps Script (tools/google-sheets-form.gs) agar pendaftar & pesanan tercatat di Google Sheets.
  formEndpoint: '',

  // ---- TES LEVEL (tes-level.html) ----
  // Peserta mengisi data diri dulu (jadi data marketing, masuk Sheet "Tes Level"), lalu tes berjalan ketat.
  // Pembatasan di browser hanya pencegah, bukan jaminan mutlak.
  levelTest: {
    strict: true,          // matikan copy/cut/paste/seleksi/klik kanan/cetak & pantau pindah tab
    blockPaste: true,      // false = tempel (paste) diizinkan di kolom data diri
    maxWarnings: 3,        // pindah tab/jendela sebanyak ini -> tes dihentikan
    minutesAdult: 15,      // batas waktu tes dewasa/remaja
    minutesKids: 8,        // batas waktu tes anak
    cooldownHours: 24,     // jeda sebelum perangkat yang sama boleh tes lagi (0 = tanpa jeda; otomatis nonaktif saat formEndpoint kosong / mode demo)
  },

  // ---- HARGA PER GELOMBANG (10 sesi) ----
  // CONTOH: 150.000 untuk semua program — belum ada keputusan final. Ganti per program jika berbeda.
  prices: {
    kids: 150000,
    teens: 150000,
    general: 150000,
    ielts: 150000,
    business: 150000,
  },

  // ---- GELOMBANG KELAS ----
  // Kelas dibuka tiap tanggal 10 dan 25. Jika jatuh di Sabtu/Minggu, gelombang mulai Senin berikutnya.
  // Setiap gelombang = 10 hari efektif (Senin–Jumat), sekitar 2 minggu. Tanggal dihitung otomatis.
  batches: {
    startDays: [10, 25],
    sessions: 10,            // jumlah sesi (hari efektif) per gelombang
    closeBeforeDays: 3,      // pendaftaran ditutup 3 hari sebelum mulai (H-3)
    show: 4,                 // jumlah gelombang yang ditampilkan di halaman program

    // Penyesuaian satu gelombang, kuncinya tanggal nominal 'YYYY-MM-DD'.
    // start = tanggal mulai pengganti, note = catatan yang tampil di gelombang itu.
    // Mis. 25 Des 2026 libur Natal. (Sesi yang jatuh di hari libur dalam gelombang diganti di hari lain
    // sesuai kesepakatan murid, tutor, dan Elevaree — itu diatur di luar website.)
    overrides: {
      '2026-12-25': { start: '2026-12-28', note: { id: 'Mulai Senin 28 Des karena 25 Des libur Natal.', en: 'Starts Monday 28 Dec because 25 Dec is a public holiday.' } },
    },

    // Jam kelas per program (berlaku untuk setiap gelombang). time: pagi | siang | sore | malam.
    // CONTOH: Kids pagi & malam sesuai kebutuhan (sore anak-anak mengaji); jam persisnya GANTI sesuai kenyataan.
    // Program lain masih contoh. level bersifat opsional.
    slots: {
      kids: [
        { id: 'kids-pagi', time: 'pagi', start: '08:00', end: '09:00', teacher: 'Miss Nadia', capacity: 6 },
        { id: 'kids-malam', time: 'malam', start: '19:30', end: '20:30', teacher: 'Miss Nadia', capacity: 6 },
      ],
      teens: [
        { id: 'teens-sore', time: 'sore', start: '16:00', end: '17:00', teacher: 'Mr. Dani', capacity: 8 },
        { id: 'teens-malam', time: 'malam', start: '19:30', end: '20:30', teacher: 'Mr. Dani', capacity: 8 },
      ],
      general: [
        { id: 'general-pagi', time: 'pagi', start: '08:00', end: '09:00', teacher: 'Mr. Dani', capacity: 8 },
        { id: 'general-malam', time: 'malam', start: '20:00', end: '21:00', teacher: 'Mr. Dani', capacity: 8 },
      ],
      ielts: [
        { id: 'ielts-pagi', time: 'pagi', start: '09:00', end: '10:30', teacher: 'Mr. Arif', capacity: 6 },
        { id: 'ielts-malam', time: 'malam', start: '19:00', end: '20:30', teacher: 'Mr. Arif', capacity: 6 },
      ],
      business: [
        { id: 'business-siang', time: 'siang', start: '12:00', end: '13:00', teacher: 'Miss Laras', capacity: 6 },
        { id: 'business-malam', time: 'malam', start: '19:00', end: '20:00', teacher: 'Miss Laras', capacity: 6 },
      ],
    },

    // Kursi TERISI per gelombang. Kunci = tanggal nominal gelombang, lalu id jam kelas = jumlah terisi.
    // Update angka ini setiap ada pembayaran yang terverifikasi. Tidak ditulis = 0 terisi.
    // Jika terisi >= kapasitas, jam kelas tampil "Penuh". CONTOH angka di bawah.
    booked: {
      '2026-11-10': { 'kids-pagi': 4, 'kids-malam': 6, 'ielts-pagi': 6, 'ielts-malam': 6, 'teens-sore': 3, 'general-pagi': 7, 'business-siang': 2 },
      '2026-11-25': { 'kids-pagi': 1, 'kids-malam': 2, 'teens-sore': 1, 'ielts-pagi': 2, 'general-pagi': 1 },
      '2026-12-10': { 'kids-pagi': 0 },
    },
  },

  // ---- PEMBAYARAN ----
  payment: {
    deadlineHours: 24,     // batas waktu pembayaran setelah pesanan dibuat
    uniqueCode: true,      // tambahkan 3 digit unik di nominal transfer agar mudah dicocokkan
    // Rekening tujuan. GANTI nomor & nama pemilik rekening. Rekening dengan nomor kosong tidak ditampilkan.
    banks: [
      { bank: 'BCA', number: '', holder: '' },
      { bank: 'Mandiri', number: '', holder: '' },
    ],
    // Gambar QRIS statis, mis. 'assets/img/qris.png'. Kosong = tampil pesan "belum dipasang".
    qrisImage: '',
    // Opsional: URL server yang membuat transaksi Midtrans/Xendit dan membalas JSON { "redirect_url": "..." }.
    // Kosong = pembayaran manual (transfer/QRIS + konfirmasi WhatsApp).
    gatewayEndpoint: '',
  },
};
