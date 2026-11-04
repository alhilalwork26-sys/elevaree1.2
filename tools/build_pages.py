#!/usr/bin/env python3
"""
Membuat halaman pendukung: tentang.html, kebijakan-privasi.html,
syarat-ketentuan.html, dan 404.html. Dijalankan otomatis oleh build_programs.py.

Semua teks ditulis berpasangan: (Bahasa Indonesia, English).
CATATAN: teks Tentang Kami dan dokumen hukum adalah DRAF — tinjau sebelum dipublikasikan.
"""
import re
from build_programs import ROOT, PROGRAMS, shared_parts, tx, esc, ARROW, CHECK, DIAG, WA_ICO, SEP

# ---------------------------------------------------------------------------
# DATA USAHA — isi sebelum online. Kolom kosong tidak ditampilkan.
# ---------------------------------------------------------------------------
BUSINESS = {
    "legal_name": "",                       # contoh: "PT Elevaree Edukasi Indonesia"
    "address": "",                          # alamat resmi usaha
    "email": "hello@elevaree.academy",      # GANTI dengan email resmi
    "wa": "+62 8xx-xxxx-xxxx",              # GANTI dengan nomor resmi
}
LEGAL_UPDATED = ("1 November 2026", "1 November 2026")


def build(filename, title, desc, body_class, main_html, head, nav, tail, absolute=False):
    t_id, t_en = title
    d_id, d_en = desc
    h = re.sub(r"<title>.*?</title>", f"<title>{esc(t_id)}</title>", head, flags=re.S)
    h = re.sub(r'<meta name="description" content=".*?" />', f'<meta name="description" content="{esc(d_id)}" />', h, flags=re.S)
    h = h.replace('<html lang="id">', f'<html lang="id" data-title-en="{esc(t_en)}" data-desc-en="{esc(d_en)}">', 1)
    page = f'{h}<body class="{body_class}">\n  <div class="scroll-progress" aria-hidden="true"></div>\n\n{nav}{main_html}{tail}'
    if absolute:
        # 404 bisa tampil di alamat mana pun, jadi semua tautan lokal dibuat absolut
        page = re.sub(r'(href|src)="(?!https?:|#|/|mailto:|tel:|data:)([^"]+)"', r'\1="/\2"', page)
    (ROOT / filename).write_text(page, encoding="utf-8")
    print("ditulis:", filename)


def crumbs(label):
    current = tx("b", label, extra=' aria-current="page"')
    return (f'<nav class="crumbs fade-in" style="--d:.05s" aria-label="Breadcrumb">'
            f'<a href="index.html" data-en="Home">Beranda</a>{SEP}{current}</nav>')


def cta(title, text, btn_attr='data-trial'):
    return f'''
    <section class="cta-wrap">
      <div class="container">
        <div class="cta" data-reveal>
          <div>
            {tx("p", ("Siap mulai?", "Ready to start?"), "cta__eyebrow")}
            {tx("h2", title, "cta__title", raw=True)}
            {tx("p", text, "cta__text")}
          </div>
          <a href="daftar.html?paket=trial" class="btn btn--butter">{tx("span", ("Daftar kelas percobaan", "Book a trial class"))}{ARROW}</a>
        </div>
      </div>
    </section>'''


# ---------------------------------------------------------------------------
# 2. TENTANG KAMI  (DRAF — sesuaikan dengan cerita asli Elevaree)
# ---------------------------------------------------------------------------
def page_tentang(head, nav, tail):
    values = [
        (("Berani dulu", "Confidence first"), ("Salah itu bagian dari belajar. Kelas kami dibuat supaya peserta nyaman mencoba dan bicara.", "Mistakes are part of learning. Our classes make it comfortable to try and speak.")),
        (("Seru dan relevan", "Fun and relevant"), ("Materi dekat dengan kehidupan sehari-hari, sekolah, kampus, dan dunia kerja.", "Lessons connect to daily life, school, university, and work.")),
        (("Kemajuan yang terlihat", "Visible progress"), ("Tes penempatan di awal dan evaluasi berkala membuat perkembangan bisa diukur.", "A placement test and regular evaluations make progress measurable.")),
    ]
    values_html = "".join(
        f'<article class="pd-fit__card" data-reveal style="--delay:{i * .08:.2f}s"><span class="pd-fit__num">0{i + 1}</span>{tx("h3", t)}{tx("p", d)}</article>'
        for i, (t, d) in enumerate(values)
    )
    method = [
        ("video", ("Kelas live interaktif", "Live, interactive classes"), ("Belajar langsung bersama guru lewat video call — bisa bertanya dan berlatih bicara.", "Learn directly with a teacher over video call — ask questions and practise speaking.")),
        ("doc", ("Tes penempatan", "Placement test"), ("Setiap peserta mulai dari level yang sesuai kemampuan dan tujuannya.", "Every learner starts at the level that fits their ability and goals.")),
        ("chart", ("Laporan kemajuan", "Progress reports"), ("Perkembangan dipantau supaya peserta dan orang tua tahu hasilnya.", "Progress is tracked so learners and parents can see results.")),
        ("star", ("Praktik nyata", "Real-world practice"), ("Show Day untuk anak, simulasi tes untuk beasiswa, simulasi meeting untuk pekerja.", "Show Day for kids, mock tests for scholarships, mock meetings for professionals.")),
    ]
    icons = {
        "video": '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10.5 5-3v9l-5-3"/>',
        "doc": '<rect x="5" y="3.5" width="14" height="17" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',
        "chart": '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
        "star": '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    }
    method_html = "".join(
        f'<article class="about-method__item" data-reveal style="--delay:{i * .06:.2f}s"><span class="about-method__icon"><svg viewBox="0 0 24 24">{icons[k]}</svg></span>{tx("h3", t)}{tx("p", d)}</article>'
        for i, (k, t, d) in enumerate(method)
    )
    biz = ""
    rows = [(("Nama usaha", "Business name"), BUSINESS["legal_name"]), (("Alamat", "Address"), BUSINESS["address"]),
            (("Email", "Email"), BUSINESS["email"]), (("WhatsApp", "WhatsApp"), BUSINESS["wa"])]
    rows = [(k, v) for k, v in rows if v and "xxx" not in v]
    if BUSINESS["legal_name"]:
        biz = ('<section class="section section--soft"><div class="container"><div class="head-split">'
               + tx("p", ("Informasi usaha", "Business information"), "eyebrow", " data-reveal")
               + '<dl class="about-biz" data-reveal>' + "".join(f'<div>{tx("dt", k)}<dd>{esc(v)}</dd></div>' for k, v in rows) + "</dl>"
               + "</div></div></section>")

    main = f'''  <main class="about-page">
    <section class="hero">
      <div class="container">
        {crumbs(("Tentang Kami", "About Us"))}
        <div class="hero__panel">
          <div class="hero__copy">
            {tx("p", ("Tentang Elevaree", "About Elevaree"), "eyebrow fade-in", ' style="--d:.1s"')}
            <h1 class="hero__title">
              <span class="line">{tx("span", ("Membantu Siapa Pun", "Helping Anyone"))}</span>
              <span class="line"><span>{tx("span", ("Berani Bicara", "Speak English"))}</span></span>
              <span class="line"><span><em class="scribble">{tx("span", ("Bahasa Inggris", "with Confidence"))}<svg viewBox="0 0 220 24" preserveAspectRatio="none" aria-hidden="true"><path d="M3 15 C 50 4, 110 4, 217 12 M 20 20 C 80 13, 140 14, 200 18"/></svg></em></span></span>
            </h1>
            {tx("p", ("Elevaree Academy adalah kursus bahasa Inggris online untuk anak, remaja, dewasa, pencari beasiswa, dan pekerja. Fokus kami sederhana: membuat peserta berani bicara, bukan sekadar hafal teori.", "Elevaree Academy is an online English course for kids, teens, adults, scholarship seekers, and professionals. Our focus is simple: help learners speak up, not just memorise theory."), "hero__lead fade-in", ' style="--d:.7s"')}
            <div class="hero__actions fade-in" style="--d:.85s">
              <a href="daftar.html?paket=trial" class="btn btn--maroon">{tx("span", ("Coba Kelas Gratis", "Try a Free Class"))}{ARROW}</a>
              <a href="index.html#program" class="link-arrow" data-en="See programs">Lihat program</a>
            </div>
          </div>
          <div class="hero__collage">
            <div class="tile tile--lilac tile--a" data-depth="10"><img src="assets/img/kids-duo.png" alt="Dua anak tersenyum" /></div>
            <div class="tile tile--lime tile--b" data-depth="16"><img src="assets/img/guru-1.png" alt="Guru Elevaree" /></div>
            <div class="tile tile--butter tile--c" data-depth="13"><img src="assets/img/worker-woman.png" alt="Peserta profesional" /></div>
            <span class="rec-dot" data-depth="22" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="head-split">
          {tx("p", ("Cerita kami", "Our story"), "eyebrow", " data-reveal")}
          <div class="about-story">
            {tx("h2", ("Berawal dari<br/>Kelas Gratis", "It Started with<br/>Free Classes"), "h2", " data-reveal", raw=True)}
            {tx("p", ("Elevaree berawal dari kelas bahasa Inggris gratis. Dari situ kami melihat pola yang sama: banyak orang sebenarnya paham bahasa Inggris, tapi tidak berani memakainya — takut salah, malu, dan jarang punya kesempatan praktik.", "Elevaree started with free English classes. We kept seeing the same pattern: many people understand English but don't dare to use it — afraid of mistakes, shy, and rarely able to practise."), "", ' data-reveal style="--delay:.06s"')}
            {tx("p", ("Karena itu kami membangun kelas yang berbeda: live, interaktif, dan memberi setiap peserta kesempatan untuk bicara. Dimulai dari program untuk anak, kini Elevaree juga mendampingi remaja, dewasa, pencari beasiswa, dan pekerja.", "So we built a different kind of class: live, interactive, and giving every learner a chance to speak. We began with kids, and now Elevaree also supports teens, adults, scholarship seekers, and professionals."), "", ' data-reveal style="--delay:.12s"')}
            <blockquote class="about-quote" data-reveal style="--delay:.18s">{tx("span", ("“Berani dulu, sempurna kemudian.”", "“Confidence first, perfection later.”"))}</blockquote>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--soft">
      <div class="container">
        <div class="head-split">
          {tx("p", ("Nilai kami", "Our values"), "eyebrow", " data-reveal")}
          {tx("h2", ("Yang Kami Pegang<br/>di Setiap Kelas", "What We Stand For<br/>in Every Class"), "h2", ' data-reveal style="--delay:.06s"', raw=True)}
        </div>
        <div class="pd-fit about-values">{values_html}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="head-split">
          {tx("p", ("Metode", "Method"), "eyebrow", " data-reveal")}
          {tx("h2", ("Cara Kami<br/>Mengajar", "How We<br/>Teach"), "h2", ' data-reveal style="--delay:.06s"', raw=True)}
        </div>
        <div class="about-method">{method_html}</div>
        <div class="stats-row">
          <div class="stat" data-reveal><b><span data-count="5">0</span></b>{tx("span", ("Program sesuai tujuan", "Goal-based programs"))}</div>
          <div class="stat" data-reveal style="--delay:.06s"><b><span data-count="100">0</span>%</b>{tx("span", ("Kelas live online", "Live online classes"))}</div>
          <div class="stat" data-reveal style="--delay:.12s"><b><span data-count="4">0</span></b>{tx("span", ("Keterampilan inti", "Core skills"))}</div>
          <div class="stat" data-reveal style="--delay:.18s"><b><span data-count="5">0</span></b>{tx("span", ("Kelompok peserta", "Learner groups"))}</div>
        </div>
      </div>
    </section>
{biz}{cta(("Yuk, mulai dari<br/>kelas percobaan.", "Let's start with<br/>a trial class."), ("Kenali cara belajar di Elevaree secara langsung, gratis untuk kelas pertama.", "Experience how we teach at Elevaree — your first class is free."))}
  </main>

'''
    build("tentang.html",
          ("Tentang Kami — Elevaree Academy", "About Us — Elevaree Academy"),
          ("Cerita, nilai, dan metode belajar Elevaree Academy, kursus bahasa Inggris online.", "The story, values, and teaching method of Elevaree Academy, an online English course."),
          "page-about", main, head, nav, tail)


# ---------------------------------------------------------------------------
# 3. DOKUMEN HUKUM  (DRAF — minta ditinjau ahli hukum sebelum dipublikasikan)
# ---------------------------------------------------------------------------
NAME = BUSINESS["legal_name"] or "Elevaree Academy"
CONTACT_P = (f"Email: {BUSINESS['email']} · WhatsApp: {BUSINESS['wa']}", f"Email: {BUSINESS['email']} · WhatsApp: {BUSINESS['wa']}")

PRIVACY = [
    {"h": ("Ringkasan", "Summary"), "p": [
        (f"Kebijakan ini menjelaskan data apa yang dikumpulkan {NAME} (“kami”) melalui website ini, untuk apa data itu dipakai, dan apa saja hakmu. Kami berupaya mematuhi Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.",
         f"This policy explains what data {NAME} (“we”) collects through this website, how it is used, and what your rights are. We aim to comply with Indonesia's Personal Data Protection Law (Law No. 27 of 2022)."),
    ]},
    {"h": ("Data yang kami kumpulkan", "Data we collect"), "ul": [
        ("Data form pendaftaran: nama, untuk siapa kelasnya, nama dan usia anak (jika mendaftarkan anak), program, waktu belajar, nomor WhatsApp, email (opsional), dan tujuan belajar.",
         "Registration form data: name, who the class is for, child's name and age (if registering a child), programme, preferred time, WhatsApp number, email (optional), and learning goal."),
        ("Email yang kamu daftarkan untuk menerima kabar dan tips belajar.", "The email you submit to receive news and learning tips."),
        ("Isi percakapan saat kamu menghubungi kami lewat WhatsApp.", "The content of conversations when you contact us on WhatsApp."),
        ("Data teknis seperti alamat IP dan jenis browser yang dicatat oleh penyedia hosting dan layanan pihak ketiga.", "Technical data such as IP address and browser type recorded by our hosting provider and third-party services."),
        ("Pilihan bahasa dan tema tampilan disimpan di perangkatmu (localStorage) dan tidak dikirim ke kami.", "Your language and theme choices are stored on your device (localStorage) and are not sent to us."),
    ]},
    {"h": ("Untuk apa data dipakai", "How we use your data"), "ul": [
        ("Menghubungimu untuk tes penempatan dan kelas percobaan.", "To contact you about the placement test and trial class."),
        ("Mengatur jadwal dan memberikan layanan kursus.", "To arrange schedules and deliver our courses."),
        ("Mengirim info kelas dan tips belajar, jika kamu berlangganan.", "To send class news and learning tips, if you subscribe."),
        ("Meningkatkan kualitas layanan dan website.", "To improve our services and website."),
    ], "p": [("Kami tidak menjual data pribadimu kepada siapa pun.", "We never sell your personal data.")]},
    {"h": ("Data anak", "Children's data"), "p": [
        ("Pendaftaran peserta di bawah 18 tahun dilakukan oleh orang tua atau wali. Dengan mengisi data anak, orang tua atau wali menyetujui pemrosesan data tersebut untuk keperluan layanan kursus.",
         "Learners under 18 must be registered by a parent or guardian. By entering a child's details, the parent or guardian consents to that data being processed to provide the course."),
    ]},
    {"h": ("Layanan pihak ketiga", "Third-party services"), "ul": [
        ("Google (Google Sheets dan Apps Script) untuk menyimpan data form pendaftaran.", "Google (Google Sheets and Apps Script) to store registration form data."),
        ("WhatsApp (Meta) saat kamu menghubungi atau dihubungi oleh kami.", "WhatsApp (Meta) when you contact us or we contact you."),
        ("Google Fonts dan Unsplash untuk huruf dan sebagian gambar di website.", "Google Fonts and Unsplash for fonts and some images on the website."),
        ("Penyedia hosting yang menjalankan website ini.", "The hosting provider that runs this website."),
    ], "p": [("Setiap layanan tersebut memiliki kebijakan privasinya sendiri.", "Each of these services has its own privacy policy.")]},
    {"h": ("Penyimpanan dan keamanan", "Storage and security"), "p": [
        ("Data disimpan selama dibutuhkan untuk memberikan layanan, atau sampai kamu meminta penghapusan. Akses dibatasi hanya untuk tim yang berwenang.",
         "Data is kept for as long as needed to provide our services, or until you ask us to delete it. Access is limited to authorised team members."),
    ]},
    {"h": ("Hak kamu", "Your rights"), "ul": [
        ("Meminta salinan data pribadimu.", "Request a copy of your personal data."),
        ("Memperbaiki data yang tidak akurat.", "Correct inaccurate data."),
        ("Meminta penghapusan data.", "Request deletion of your data."),
        ("Menarik persetujuan dan berhenti berlangganan kapan saja.", "Withdraw consent and unsubscribe at any time."),
    ], "p": [("Untuk menggunakan hak ini, hubungi kami lewat kontak di bawah.", "To exercise these rights, contact us using the details below.")]},
    {"h": ("Perubahan kebijakan", "Changes to this policy"), "p": [
        ("Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan terakhir tercantum di bagian atas halaman.", "We may update this policy from time to time. The last-updated date is shown at the top of this page."),
    ]},
    {"h": ("Hubungi kami", "Contact us"), "p": [CONTACT_P]},
]

TERMS = [
    {"h": ("Tentang ketentuan ini", "About these terms"), "p": [
        (f"Dengan menggunakan website ini atau mendaftar kelas di {NAME}, kamu menyetujui syarat dan ketentuan berikut.", f"By using this website or registering for a class with {NAME}, you agree to the following terms."),
    ]},
    {"h": ("Layanan", "Our service"), "p": [
        ("Elevaree menyediakan kursus bahasa Inggris online yang berlangsung live lewat video call. Rincian tiap program tersedia di halaman program masing-masing.", "Elevaree provides online English courses held live over video call. Details of each programme are on its programme page."),
    ]},
    {"h": ("Pendaftaran dan tes penempatan", "Registration and placement test"), "ul": [
        ("Data yang kamu berikan saat pendaftaran harus benar dan terbaru.", "The information you provide when registering must be accurate and up to date."),
        ("Tes penempatan dipakai untuk menentukan level kelas yang sesuai.", "The placement test is used to determine the right class level."),
        ("Kelas percobaan pertama tidak dipungut biaya.", "The first trial class is free of charge."),
    ]},
    {"h": ("Jadwal dan kehadiran", "Schedule and attendance"), "ul": [
        ("Jadwal kelas disepakati bersama saat pendaftaran.", "Class schedules are agreed at registration."),
        ("Peserta diharapkan hadir tepat waktu dengan perangkat dan koneksi yang siap.", "Learners should join on time with a working device and connection."),
        ("Ketentuan perubahan jadwal dan sesi pengganti disampaikan saat pendaftaran.", "Rules for rescheduling and make-up sessions are shared at registration."),
    ]},
    {"h": ("Biaya dan pembayaran", "Fees and payment"), "p": [
        ("Biaya dan cara pembayaran diinformasikan sebelum kelas berbayar dimulai. Harga yang berlaku adalah harga yang dikonfirmasi tim kami secara tertulis.", "Fees and payment methods are shared before paid classes begin. The applicable price is the one confirmed in writing by our team."),
    ]},
    {"h": ("Pembatalan dan pengembalian dana", "Cancellation and refunds"), "p": [
        ("Ketentuan pembatalan dan pengembalian dana untuk tiap program disampaikan secara tertulis sebelum pembayaran.", "Cancellation and refund terms for each programme are provided in writing before payment."),
    ]},
    {"h": ("Peserta di bawah umur", "Underage learners"), "p": [
        ("Peserta di bawah 18 tahun didaftarkan dan menjadi tanggung jawab orang tua atau wali, termasuk dalam menyiapkan perangkat dan koneksi.", "Learners under 18 are registered by, and are the responsibility of, a parent or guardian, including preparing the device and connection."),
    ]},
    {"h": ("Etika kelas", "Class conduct"), "ul": [
        ("Bersikap sopan kepada guru dan sesama peserta.", "Be respectful to teachers and fellow learners."),
        ("Tidak merekam atau menyebarkan rekaman kelas tanpa izin.", "Do not record or share class recordings without permission."),
        ("Tidak membagikan tautan kelas kepada orang lain.", "Do not share class links with others."),
    ]},
    {"h": ("Materi dan hak cipta", "Materials and copyright"), "p": [
        ("Materi belajar disediakan untuk penggunaan pribadi peserta dan tidak boleh diperjualbelikan atau disebarluaskan tanpa izin.", "Learning materials are for the learner's personal use and may not be sold or distributed without permission."),
    ]},
    {"h": ("Batasan tanggung jawab", "Limitation of liability"), "ul": [
        ("Kami tidak bertanggung jawab atas gangguan yang disebabkan perangkat atau koneksi internet peserta.", "We are not responsible for disruptions caused by the learner's device or internet connection."),
        ("Hasil belajar dipengaruhi oleh usaha dan kehadiran peserta.", "Learning outcomes depend on the learner's effort and attendance."),
        ("Untuk program persiapan tes, kami tidak menjamin skor tertentu.", "For test-preparation programmes, we do not guarantee a specific score."),
    ]},
    {"h": ("Perubahan ketentuan", "Changes to these terms"), "p": [
        ("Ketentuan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan terakhir tercantum di bagian atas halaman.", "These terms may be updated from time to time. The last-updated date is shown at the top of this page."),
    ]},
    {"h": ("Hukum yang berlaku", "Governing law"), "p": [
        ("Ketentuan ini tunduk pada hukum Republik Indonesia. Perselisihan diupayakan diselesaikan secara musyawarah terlebih dahulu.", "These terms are governed by the laws of the Republic of Indonesia. Disputes will first be resolved through discussion in good faith."),
    ]},
    {"h": ("Hubungi kami", "Contact us"), "p": [CONTACT_P]},
]


def legal_page(filename, title, desc, sections, head, nav, tail, other):
    toc = "".join(f'<li><a href="#s{i + 1}">{tx("span", s["h"])}</a></li>' for i, s in enumerate(sections))
    body = ""
    for i, s in enumerate(sections):
        parts = []
        if "ul" in s:
            parts.append("<ul>" + "".join(f"<li>{tx('span', li)}</li>" for li in s["ul"]) + "</ul>")
        parts += [tx("p", p) for p in s.get("p", [])]
        body += f'<section class="legal__sec" id="s{i + 1}"><h2><span class="legal__n">{i + 1:02d}</span>{tx("span", s["h"])}</h2>{"".join(parts)}</section>'
    main = f'''  <main class="legal-page">
    <section class="pd-hero">
      <div class="container">
        {crumbs(title[0])}
        <header class="legal__head">
          <h1 class="hero__title legal__title"><span class="line">{tx("span", title[0])}</span></h1>
          <p class="legal__meta fade-in" style="--d:.4s">{tx("span", ("Terakhir diperbarui:", "Last updated:"))} {tx("span", LEGAL_UPDATED)}</p>
        </header>
        <div class="legal">
          <aside class="legal__toc">
            {tx("b", ("Daftar isi", "Contents"))}
            <ol>{toc}</ol>
            <a href="{other[0]}" class="legal__other">{tx("span", other[1])} {DIAG}</a>
          </aside>
          <article class="legal__body">{body}</article>
        </div>
      </div>
    </section>
  </main>

'''
    build(filename, (f"{title[0][0]} — Elevaree Academy", f"{title[0][1]} — Elevaree Academy"), desc, "page-legal", main, head, nav, tail)


# ---------------------------------------------------------------------------
# 4. 404
# ---------------------------------------------------------------------------
def page_404(head, nav, tail):
    links = "".join(f'<a href="{p["slug"]}.html" class="filter">{esc(p["title"])}</a>' for p in PROGRAMS)
    main = f'''  <main class="nf">
    <section class="pd-hero">
      <div class="container">
        <div class="nf__panel">
          <div class="nf__copy">
            <p class="nf__code fade-in" style="--d:.1s">404</p>
            <h1 class="hero__title nf__title">
              <span class="line">{tx("span", ("Ups, halamannya", "Oops, we couldn't"))}</span>
              <span class="line">{tx("span", ("nggak ketemu.", "find that page."))}</span>
            </h1>
            {tx("p", ("Mungkin tautannya salah ketik atau halamannya sudah dipindah. Yuk, lanjut dari sini:", "The link may be mistyped or the page has moved. Let's carry on from here:"), "hero__lead fade-in", ' style="--d:.55s"')}
            <div class="hero__actions fade-in" style="--d:.7s">
              <a href="index.html" class="btn btn--maroon">{tx("span", ("Kembali ke beranda", "Back to home"))}{ARROW}</a>
              <a href="daftar.html?paket=trial" class="link-arrow" data-en="Book a trial class">Daftar kelas percobaan</a>
            </div>
            <div class="nf__links fade-in" style="--d:.85s">{tx("span", ("Atau lihat program:", "Or explore a programme:"))}<div class="filters">{links}</div></div>
          </div>
          <div class="nf__art">
            <div class="tile tile--lilac nf__tile"><img src="assets/img/kid-boy.png" alt="" /></div>
            <span class="nf__bubble">{tx("span", ("Hmm… di mana ya?", "Hmm… where is it?"))}</span>
          </div>
        </div>
      </div>
    </section>
  </main>

'''
    build("404.html", ("Halaman tidak ditemukan — Elevaree Academy", "Page not found — Elevaree Academy"),
          ("Halaman yang kamu cari tidak ditemukan.", "The page you're looking for could not be found."),
          "page-404", main, head, nav, tail, absolute=True)


def main():
    head, nav, tail = shared_parts()
    # daftar.html sekarang halaman pendaftaran mandiri (ditulis manual + js/daftar.js), tidak dibuat di sini
    page_tentang(head, nav, tail)
    legal_page("kebijakan-privasi.html", (("Kebijakan Privasi", "Privacy Policy"),),
               ("Cara Elevaree Academy mengumpulkan dan melindungi data pribadimu.", "How Elevaree Academy collects and protects your personal data."),
               PRIVACY, head, nav, tail, ("syarat-ketentuan.html", ("Baca Syarat & Ketentuan", "Read the Terms & Conditions")))
    legal_page("syarat-ketentuan.html", (("Syarat & Ketentuan", "Terms & Conditions"),),
               ("Syarat dan ketentuan layanan kursus Elevaree Academy.", "Terms and conditions for Elevaree Academy courses."),
               TERMS, head, nav, tail, ("kebijakan-privasi.html", ("Baca Kebijakan Privasi", "Read the Privacy Policy")))
    page_404(head, nav, tail)


if __name__ == "__main__":
    main()
