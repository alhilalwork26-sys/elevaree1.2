#!/usr/bin/env python3
"""
Membuat halaman detail program (english-for-kids.html, dst.) dari satu template,
lalu halaman pendukung lewat build_pages.py (daftar, tentang, privasi, syarat, 404).

Navbar, footer, form pendaftaran, dan tombol WhatsApp diambil langsung dari index.html,
jadi cukup jalankan ulang skrip ini setiap kali index.html atau isi program di bawah diubah:

    python3 tools/build_programs.py

Setiap teks ditulis berpasangan: (Bahasa Indonesia, English).
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# ISI PROGRAM — ubah di sini. Angka yang belum pasti ditandai "CONTOH".
# ---------------------------------------------------------------------------
PROGRAMS = [
    {
        "slug": "english-for-kids",
        "skills": ["Phonics", "Vocabulary", "Speaking", "Listening", "Storytelling"],
        "prereq": [("Tidak perlu bisa bahasa Inggris — ada tes penempatan", "No English needed — we start with a placement test"), ("Laptop atau tablet dengan kamera dan mikrofon", "A laptop or tablet with a camera and mic")],
        "include_extra": ("star", ("Show Day di akhir program", "Show Day at the end of the programme")),
        "banner": {"cat": ("Anak", "Kids"), "level": ("Pemula", "Beginner"), "rating": "4.9", "reviews": 128,  # CONTOH
                   "length": ("60 menit · 10 sesi", "60 min · 10 sessions"), "teacher": "Miss Nadia", "teacher_img": "guru-1.png", "teacher_bg": "lime"},
        "key": "kids",          # nilai program di form pendaftaran
        "wa": "kids",           # pesan WhatsApp siap kirim
        "cat": "kids",          # kategori kelas terkait di katalog
        "color": "mustard",
        "img": "kids-trio.png",
        "img_alt": ("Tiga anak duduk bersama dan tertawa", "Three kids sitting together and laughing"),
        "title": "English for Kids",
        "tag": ("Usia 7–12 tahun", "Ages 7–12"),
        "lead": (
            "Kelas bahasa Inggris live online yang seru untuk anak 7–12 tahun. Lewat games, lagu, cerita, dan role-play, anak belajar berani bicara — bukan sekadar menghafal.",
            "A fun, live online English class for kids aged 7–12. Through games, songs, stories, and role-play, kids learn to speak up — not just memorise.",
        ),
        "facts": [
            ("Usia 7–12 tahun", "Ages 7–12"),
            ("Kelas live online", "Live online class"),
            ("Senin–Jumat · 60 menit", "Mon–Fri · 60 min"),
            ("Diakhiri Show Day", "Ends with Show Day"),
        ],
        "fit": [
            (("Masih malu bicara", "Still shy to speak"), ("Anak sebenarnya paham sedikit, tapi belum berani bicara bahasa Inggris.", "Your child understands a little but isn't confident speaking English yet.")),
            (("Bosan cara menghafal", "Bored of memorising"), ("Anak lebih cepat belajar lewat permainan, cerita, dan praktik langsung.", "Your child learns faster through games, stories, and hands-on practice.")),
            (("Belajar aman dari rumah", "Learn safely from home"), ("Orang tua ingin anak belajar tanpa perlu antar-jemput ke tempat kursus.", "You want your child to learn without the commute to a course centre.")),
            (("Ingin nilai sekolah naik", "Better school grades"), ("Fondasi listening dan speaking yang kuat membantu pelajaran bahasa Inggris di sekolah.", "Strong listening and speaking foundations help with English at school.")),
        ],
        "modules": [
            (("Phonics & Pengucapan", "Phonics & Pronunciation"), ("Mengenal bunyi huruf agar anak bisa membaca dan mengucapkan kata dengan benar.", "Learning letter sounds so kids can read and pronounce words correctly.")),
            (("Kosakata Lewat Games", "Vocabulary Through Games"), ("Kata-kata sehari-hari dipelajari lewat permainan, gambar, dan lagu.", "Everyday words learned through games, pictures, and songs.")),
            (("Percakapan Sehari-hari", "Everyday Conversation"), ("Memperkenalkan diri, bertanya, dan menjawab dalam situasi sederhana.", "Introducing yourself, asking, and answering in simple situations.")),
            (("Storytelling", "Storytelling"), ("Mendengar dan menceritakan ulang cerita pendek untuk melatih kelancaran.", "Listening to and retelling short stories to build fluency.")),
            (("Membaca & Menulis Dasar", "Basic Reading & Writing"), ("Membaca teks pendek dan menulis kalimat sederhana.", "Reading short texts and writing simple sentences.")),
            (("Persiapan Show Day", "Show Day Preparation"), ("Latihan presentasi singkat untuk ditampilkan di depan orang tua.", "Rehearsing a short presentation to perform for parents.")),
        ],
        "outcomes": [
            ("Berani bertanya dan menjawab dalam bahasa Inggris", "Confident asking and answering in English"),
            ("Kosakata sehari-hari bertambah", "A bigger everyday vocabulary"),
            ("Pengucapan lebih jelas berkat phonics", "Clearer pronunciation thanks to phonics"),
            ("Tampil percaya diri di Show Day", "Performing confidently on Show Day"),
        ],
        "summary": [
            (("Format", "Format"), ("Live lewat video call", "Live via video call")),
            (("Jadwal", "Schedule"), ("Senin–Jumat", "Mon–Fri")),
            (("Durasi", "Length"), ("60 menit per sesi", "60 min per session")),
            (("Program", "Programme"), ("2 minggu (10 sesi)", "2 weeks (10 sessions)")),
            (("Laporan", "Report"), ("Laporan kemajuan untuk orang tua", "Progress report for parents")),
        ],
        "faq": [
            (("Anak saya belum bisa bahasa Inggris sama sekali, bisa ikut?", "My child knows no English at all — can they join?"),
             ("Bisa. Tes penempatan membantu kami menempatkan anak di level yang sesuai, termasuk level pemula.", "Yes. The placement test helps us put your child in the right level, including beginner.")),
            (("Apakah orang tua harus mendampingi?", "Do parents need to sit in?"),
             ("Tidak wajib. Kami sarankan orang tua membantu menyiapkan perangkat dan koneksi di awal kelas.", "Not required. We suggest parents help set up the device and connection at the start of class.")),
            (("Apa itu Show Day?", "What is Show Day?"),
             ("Di akhir program, anak tampil presentasi singkat dalam bahasa Inggris dan orang tua diundang menonton.", "At the end of the programme, kids give a short English presentation and parents are invited to watch.")),
        ],
    },
    {
        "slug": "english-for-teens",
        "skills": ["Conversation", "Presentation", "Debate", "Grammar", "Essay Writing"],
        "prereq": [("Bisa membaca kalimat sederhana dalam bahasa Inggris", "Can read simple English sentences"), ("Laptop, tablet, atau HP dengan kamera dan mikrofon", "A laptop, tablet, or phone with a camera and mic")],
        "include_extra": ("star", ("Proyek presentasi akhir", "A final presentation project")),
        "banner": {"cat": ("Remaja", "Teens"), "level": ("Pemula–Menengah", "Beginner–Intermediate"), "rating": "4.8", "reviews": 86,  # CONTOH
                   "length": ("60 menit · 10 sesi", "60 min · 10 sessions"), "teacher": "Mr. Dani", "teacher_img": "guru-4.png", "teacher_bg": "peach"},
        "key": "teens", "wa": "teens", "cat": "teens",
        "color": "lime",
        "img": "teen-girl.png",
        "img_alt": ("Remaja perempuan tersenyum saat belajar", "A smiling teenage girl studying"),
        "title": "English for Teens",
        "tag": ("Usia 13–17 tahun", "Ages 13–17"),
        "lead": (
            "Bangun rasa percaya diri berbahasa Inggris untuk sekolah, lomba, dan masa depan — lewat diskusi, debat ringan, dan presentasi.",
            "Build English confidence for school, competitions, and the future — through discussion, friendly debate, and presentations.",
        ),
        "facts": [
            ("Usia 13–17 tahun", "Ages 13–17"),
            ("Kelas live online", "Live online class"),
            ("Fokus speaking & presentasi", "Speaking & presentation focus"),
            ("Tes penempatan", "Placement test"),
        ],
        "fit": [
            (("Paham grammar, kaku bicara", "Know grammar, stiff speaking"), ("Nilai tertulis bagus, tapi masih ragu saat harus bicara.", "Good written grades but still hesitant when speaking.")),
            (("Persiapan presentasi & lomba", "Presentations & competitions"), ("Butuh latihan tampil di depan kelas atau lomba bahasa Inggris.", "Need practice presenting in class or at English competitions.")),
            (("Ingin nilai sekolah naik", "Better school grades"), ("Memperkuat reading, writing, dan grammar yang dipakai di sekolah.", "Strengthen the reading, writing, and grammar used at school.")),
            (("Rencana kuliah ke luar negeri", "Planning to study abroad"), ("Mulai membangun kemampuan bahasa Inggris akademik sejak dini.", "Start building academic English early.")),
        ],
        "modules": [
            (("Confident Conversation", "Confident Conversation"), ("Ngobrol lancar tentang topik sehari-hari dan minat remaja.", "Chatting fluently about everyday topics and teen interests.")),
            (("Grammar dalam Praktik", "Grammar in Use"), ("Grammar yang langsung dipakai saat bicara dan menulis.", "Grammar you use straight away when speaking and writing.")),
            (("Presentation Skills", "Presentation Skills"), ("Menyusun dan membawakan presentasi yang jelas dan menarik.", "Structuring and delivering clear, engaging presentations.")),
            (("Debat & Diskusi", "Debate & Discussion"), ("Menyampaikan pendapat dan menanggapi argumen dengan sopan.", "Sharing opinions and responding to arguments politely.")),
            (("Reading & Writing untuk Sekolah", "Reading & Writing for School"), ("Memahami teks dan menulis esai pendek yang terstruktur.", "Understanding texts and writing short, structured essays.")),
            (("Proyek Akhir", "Final Project"), ("Presentasi proyek pribadi sebagai penutup program.", "A personal project presentation to wrap up the programme.")),
        ],
        "outcomes": [
            ("Lancar berdiskusi dalam bahasa Inggris", "Discuss topics fluently in English"),
            ("Presentasi lebih terstruktur dan meyakinkan", "Structured, convincing presentations"),
            ("Grammar lebih akurat saat bicara", "More accurate grammar when speaking"),
            ("Menulis esai pendek dengan rapi", "Write neat short essays"),
        ],
        "summary": [
            (("Format", "Format"), ("Live lewat video call", "Live via video call")),
            (("Usia", "Ages"), ("13–17 tahun", "13–17")),
            (("Durasi", "Length"), ("60 menit per sesi (CONTOH)", "60 min per session (SAMPLE)")),
            (("Level", "Level"), ("Sesuai hasil tes penempatan", "Based on placement test")),
        ],
        "faq": [
            (("Apakah materinya sesuai pelajaran sekolah?", "Does it follow the school curriculum?"),
             ("Materi melengkapi pelajaran sekolah, dengan porsi lebih besar untuk latihan bicara.", "It complements school lessons, with more time for speaking practice.")),
            (("Bisa untuk persiapan lomba?", "Can it help with competitions?"),
             ("Bisa. Sampaikan saat pendaftaran supaya guru menyesuaikan latihannya.", "Yes. Mention it when you register so the teacher can tailor the practice.")),
            (("Kelasnya grup atau privat?", "Group or private classes?"),
             ("Hubungi kami untuk pilihan format kelas yang tersedia saat ini.", "Contact us for the class formats currently available.")),
        ],
    },
    {
        "slug": "general-english",
        "skills": ["Conversation", "Pronunciation", "Listening", "Practical Grammar", "Travel English"],
        "prereq": [("Semua level bisa ikut — level ditentukan lewat tes penempatan", "All levels welcome — you are placed with a short test"), ("Laptop, tablet, atau HP dengan kamera dan mikrofon", "A laptop, tablet, or phone with a camera and mic")],
        "include_extra": ("star", ("Latihan percakapan di setiap sesi", "Conversation practice every session")),
        "banner": {"cat": ("Dewasa", "Adults"), "level": ("Semua level", "All levels"), "rating": "4.8", "reviews": 64,  # CONTOH
                   "length": ("60 menit · 10 sesi", "60 min · 10 sessions"), "teacher": "Mr. Dani", "teacher_img": "guru-4.png", "teacher_bg": "peach"},
        "key": "general", "wa": "general", "cat": "adult",
        "color": "sage",
        "img": "adult-man.png",
        "img_alt": ("Pria dewasa berkacamata", "An adult man wearing glasses"),
        "title": "General English",
        "tag": ("Untuk dewasa", "For adults"),
        "lead": (
            "Lancar ngobrol bahasa Inggris untuk kebutuhan sehari-hari — traveling, pertemanan, hingga persiapan tinggal di luar negeri. Belajar santai, tanpa takut salah.",
            "Speak everyday English with ease — for travel, friendships, or moving abroad. Relaxed learning, no fear of mistakes.",
        ),
        "facts": [
            ("Untuk dewasa", "For adults"),
            ("Kelas live online", "Live online class"),
            ("Fokus conversation", "Conversation focus"),
            ("Semua level", "All levels"),
        ],
        "fit": [
            (("Paham, tapi takut bicara", "Understand, but afraid to speak"), ("Bisa membaca dan mendengar, tapi lidah terasa kaku saat bicara.", "You can read and listen, but freeze up when speaking.")),
            (("Persiapan traveling", "Getting ready to travel"), ("Ingin percaya diri bertanya, memesan, dan berkenalan saat ke luar negeri.", "Want to ask, order, and meet people confidently abroad.")),
            (("Mulai lagi dari awal", "Starting over"), ("Sudah lama tidak memakai bahasa Inggris dan ingin menyegarkannya.", "Haven't used English in years and want to refresh it.")),
            (("Ngobrol dengan teman asing", "Chat with foreign friends"), ("Ingin lebih nyambung dengan teman, keluarga, atau komunitas internasional.", "Want to connect better with international friends, family, or communities.")),
        ],
        "modules": [
            (("Everyday Conversation", "Everyday Conversation"), ("Percakapan untuk situasi sehari-hari yang paling sering ditemui.", "Conversations for the most common everyday situations.")),
            (("Pengucapan & Kelancaran", "Pronunciation & Fluency"), ("Bicara lebih jelas dan natural tanpa terlalu lama berpikir.", "Speaking more clearly and naturally without overthinking.")),
            (("Grammar Praktis", "Practical Grammar"), ("Grammar inti yang benar-benar dipakai dalam percakapan.", "Core grammar you actually use in conversation.")),
            (("Listening Bahasa Asli", "Real-World Listening"), ("Memahami bahasa Inggris dari film, video, dan podcast.", "Understanding English from films, videos, and podcasts.")),
            (("Travel & Social English", "Travel & Social English"), ("Bahasa untuk perjalanan, restoran, hotel, dan berkenalan.", "Language for travel, restaurants, hotels, and meeting people.")),
            (("Menyampaikan Pendapat", "Expressing Opinions"), ("Berani berpendapat dan bercerita panjang dengan runtut.", "Sharing opinions and telling longer stories clearly.")),
        ],
        "outcomes": [
            ("Ngobrol tanpa terlalu lama berpikir", "Chat without overthinking"),
            ("Lebih paham percakapan natural", "Better understanding of natural speech"),
            ("Pengucapan lebih jelas", "Clearer pronunciation"),
            ("Berani menyampaikan pendapat", "Confident sharing your opinions"),
        ],
        "summary": [
            (("Format", "Format"), ("Live lewat video call", "Live via video call")),
            (("Untuk", "For"), ("Dewasa, semua level", "Adults, all levels")),
            (("Durasi", "Length"), ("60 menit per sesi (CONTOH)", "60 min per session (SAMPLE)")),
            (("Jadwal", "Schedule"), ("Disesuaikan saat pendaftaran", "Arranged when you register")),
        ],
        "faq": [
            (("Saya mulai dari nol, bisa ikut?", "I'm starting from zero — can I join?"),
             ("Bisa. Tes penempatan membantu menentukan level awal yang pas untukmu.", "Yes. The placement test helps find the right starting level for you.")),
            (("Jadwalnya bisa menyesuaikan jam kerja?", "Can the schedule fit my working hours?"),
             ("Tulis waktu yang kamu inginkan di form pendaftaran, tim kami akan mencarikan jadwal yang paling pas.", "Add your preferred times on the registration form and our team will find the best fit.")),
        ],
    },
    {
        "slug": "ielts-toefl-prep",
        "skills": ["Listening", "Reading", "Academic Writing", "Speaking", "Test Strategy"],
        "prereq": [("Disarankan sudah di level menengah (B1) atau setara", "Recommended: intermediate level (B1) or equivalent"), ("Punya target skor atau persyaratan beasiswa", "A target score or scholarship requirement in mind")],
        "include_extra": ("star", ("Simulasi tes lengkap dengan feedback", "Full mock tests with feedback")),
        "banner": {"cat": ("Beasiswa", "Scholarship"), "level": ("Menengah–Lanjut", "Intermediate–Advanced"), "rating": "4.9", "reviews": 152,  # CONTOH
                   "length": ("90 menit · 10 sesi", "90 min · 10 sessions"), "teacher": "Mr. Arif", "teacher_img": "guru-2.png", "teacher_bg": "butter"},
        "key": "ielts", "wa": "ielts", "cat": "scholar",
        "color": "peach",
        "img": "scholar-man.png",
        "img_alt": ("Pemuda bertopi, pencari beasiswa", "A young man in a hat, a scholarship seeker"),
        "title": "IELTS & TOEFL Prep",
        "tag": ("Untuk pencari beasiswa", "For scholarship seekers"),
        "lead": (
            "Persiapan terarah untuk meraih skor IELTS atau TOEFL yang dibutuhkan beasiswa impianmu — strategi tiap bagian tes, latihan simulasi, dan feedback detail.",
            "Focused preparation to reach the IELTS or TOEFL score your dream scholarship needs — section-by-section strategy, mock tests, and detailed feedback.",
        ),
        "facts": [
            ("Mahasiswa & pencari beasiswa", "Students & scholarship seekers"),
            ("Kelas live online", "Live online class"),
            ("IELTS & TOEFL", "IELTS & TOEFL"),
            ("Latihan simulasi tes", "Mock tests"),
        ],
        "fit": [
            (("Daftar beasiswa luar negeri", "Applying for scholarships abroad"), ("Butuh skor tes bahasa sebagai syarat beasiswa atau kampus tujuan.", "You need a test score for your scholarship or target university.")),
            (("Skor belum mencukupi", "Score not high enough yet"), ("Sudah pernah tes, tapi skornya masih di bawah target.", "You've taken the test before but scored below your target.")),
            (("Bingung strategi", "Unsure of strategy"), ("Belum tahu cara menghadapi bagian speaking dan writing.", "You're not sure how to tackle the speaking and writing sections.")),
            (("Waktu persiapan terbatas", "Limited prep time"), ("Butuh persiapan yang terarah agar waktu belajar efektif.", "You need focused prep to make your study time count.")),
        ],
        "modules": [
            (("Tes Diagnostik & Target Skor", "Diagnostic Test & Target Score"), ("Mengukur skor awal dan menyusun rencana belajar sesuai target.", "Measuring your starting score and planning around your target.")),
            (("Strategi Listening", "Listening Strategies"), ("Teknik menangkap informasi penting dan menghindari jebakan soal.", "Techniques to catch key information and avoid trick questions.")),
            (("Strategi Reading", "Reading Strategies"), ("Skimming, scanning, dan mengelola waktu membaca.", "Skimming, scanning, and managing reading time.")),
            (("Writing Terstruktur", "Structured Writing"), ("Menyusun esai dan laporan yang jelas sesuai kriteria penilaian.", "Writing clear essays and reports that meet the marking criteria.")),
            (("Latihan Speaking + Feedback", "Speaking Practice + Feedback"), ("Simulasi wawancara speaking dengan masukan langsung dari guru.", "Mock speaking interviews with direct feedback from your teacher.")),
            (("Simulasi Tes Lengkap", "Full Mock Tests"), ("Latihan seperti tes sungguhan untuk mengukur kesiapan.", "Real test-style practice to measure your readiness.")),
        ],
        "outcomes": [
            ("Tahu posisi skor dan jarak ke target", "Know your score and the gap to your target"),
            ("Punya strategi untuk tiap bagian tes", "A strategy for every test section"),
            ("Esai lebih terstruktur", "Better-structured essays"),
            ("Lebih tenang saat tes speaking", "Calmer in the speaking test"),
        ],
        "summary": [
            (("Format", "Format"), ("Live lewat video call", "Live via video call")),
            (("Tes", "Tests"), ("IELTS & TOEFL", "IELTS & TOEFL")),
            (("Durasi", "Length"), ("90 menit per sesi (CONTOH)", "90 min per session (SAMPLE)")),
            (("Termasuk", "Includes"), ("Tes diagnostik & simulasi", "Diagnostic & mock tests")),
        ],
        "faq": [
            (("IELTS atau TOEFL, mana yang perlu saya ambil?", "IELTS or TOEFL — which do I need?"),
             ("Tergantung persyaratan beasiswa atau kampus tujuan. Kami bantu cek saat konsultasi.", "It depends on your scholarship or university requirements. We'll help you check during consultation.")),
            (("Apakah skornya dijamin?", "Is my score guaranteed?"),
             ("Tidak ada yang bisa menjamin skor, tapi kami membantu dengan strategi, latihan, dan feedback agar kamu siap.", "No one can guarantee a score, but we help you get ready with strategy, practice, and feedback.")),
            (("Berapa lama waktu persiapannya?", "How long does preparation take?"),
             ("Tergantung skor awal dan target. Tes diagnostik di awal membantu menyusun rencana yang realistis.", "It depends on your starting score and target. The diagnostic test helps build a realistic plan.")),
        ],
    },
    {
        "slug": "business-english",
        "skills": ["Email Writing", "Meetings", "Presentation", "Negotiation", "Job Interview"],
        "prereq": [("Disarankan level menengah (B1) atau setara", "Recommended: intermediate level (B1) or equivalent"), ("Sedang bekerja atau sedang mencari kerja", "Currently working or job hunting")],
        "include_extra": ("star", ("Studi kasus dari dunia kerja", "Real workplace case studies")),
        "banner": {"cat": ("Pekerja", "Professionals"), "level": ("Menengah", "Intermediate"), "rating": "4.8", "reviews": 71,  # CONTOH
                   "length": ("60 menit · 10 sesi", "60 min · 10 sessions"), "teacher": "Miss Laras", "teacher_img": "guru-3.png", "teacher_bg": "lilac"},
        "key": "business", "wa": "business", "cat": "work",
        "color": "lilac",
        "img": "worker-woman.png",
        "img_alt": ("Pekerja profesional tersenyum", "A smiling professional"),
        "title": "Business English",
        "tag": ("Untuk pekerja", "For professionals"),
        "lead": (
            "Komunikasi profesional dalam bahasa Inggris — memimpin meeting, menulis email, presentasi ke klien, hingga lolos interview kerja.",
            "Professional communication in English — leading meetings, writing emails, presenting to clients, and acing job interviews.",
        ),
        "facts": [
            ("Karyawan & pencari kerja", "Employees & job seekers"),
            ("Kelas live online", "Live online class"),
            ("Studi kasus dunia kerja", "Real workplace cases"),
            ("Tes penempatan", "Placement test"),
        ],
        "fit": [
            (("Sering meeting dengan asing", "Meetings with international teams"), ("Rutin berkomunikasi dengan klien, atasan, atau rekan dari luar negeri.", "You regularly talk with clients, managers, or colleagues abroad.")),
            (("Banyak menulis email", "Lots of emails & reports"), ("Ingin email dan laporan terdengar jelas, sopan, dan profesional.", "You want emails and reports to sound clear, polite, and professional.")),
            (("Persiapan interview kerja", "Job interview prep"), ("Melamar ke perusahaan yang mewajibkan interview bahasa Inggris.", "You're applying to companies that interview in English.")),
            (("Ingin naik karier", "Career growth"), ("Menargetkan promosi atau pindah ke perusahaan multinasional.", "You're aiming for a promotion or a multinational company.")),
        ],
        "modules": [
            (("Email Profesional", "Professional Emails"), ("Menulis email yang ringkas, jelas, dan sesuai etika bisnis.", "Writing concise, clear emails with the right business tone.")),
            (("Meeting & Diskusi", "Meetings & Discussions"), ("Menyampaikan ide, bertanya, dan menanggapi dalam meeting.", "Sharing ideas, asking questions, and responding in meetings.")),
            (("Presentasi & Pitching", "Presentations & Pitching"), ("Membawakan presentasi yang meyakinkan untuk tim atau klien.", "Delivering convincing presentations to teams or clients.")),
            (("Dasar Negosiasi", "Negotiation Basics"), ("Ungkapan dan strategi untuk bernegosiasi dengan sopan.", "Phrases and strategies for polite negotiation.")),
            (("Small Talk & Networking", "Small Talk & Networking"), ("Membangun hubungan kerja lewat obrolan ringan.", "Building work relationships through small talk.")),
            (("Latihan Interview Kerja", "Job Interview Practice"), ("Simulasi interview dengan pertanyaan yang sering muncul.", "Mock interviews with the most common questions.")),
        ],
        "outcomes": [
            ("Email lebih jelas dan profesional", "Clearer, more professional emails"),
            ("Aktif dan percaya diri di meeting", "Active and confident in meetings"),
            ("Presentasi lebih meyakinkan", "More convincing presentations"),
            ("Jawaban interview lebih terstruktur", "Better-structured interview answers"),
        ],
        "summary": [
            (("Format", "Format"), ("Live lewat video call", "Live via video call")),
            (("Untuk", "For"), ("Karyawan, profesional & pencari kerja", "Employees, professionals & job seekers")),
            (("Durasi", "Length"), ("60 menit per sesi (CONTOH)", "60 min per session (SAMPLE)")),
            (("Jadwal", "Schedule"), ("Disesuaikan saat pendaftaran", "Arranged when you register")),
        ],
        "faq": [
            (("Bisa untuk pelatihan tim kantor?", "Can you train our office team?"),
             ("Hubungi kami lewat WhatsApp untuk membahas kebutuhan tim atau perusahaanmu.", "Message us on WhatsApp to discuss your team's or company's needs.")),
            (("Materinya bisa disesuaikan bidang kerja?", "Can lessons match my industry?"),
             ("Sampaikan bidang kerjamu saat pendaftaran agar contoh latihannya lebih relevan.", "Tell us your field when you register so practice examples feel relevant.")),
            (("Jadwalnya bisa setelah jam kerja?", "Can classes be after work hours?"),
             ("Tulis waktu yang kamu inginkan di form pendaftaran, tim kami akan mencarikan jadwal yang paling pas.", "Add your preferred times on the registration form and our team will find the best fit.")),
        ],
    },
]

# Profil mentor (CONTOH — samakan dengan data guru asli)
TEACHERS = {
    "Miss Nadia": {"img": "guru-1.png", "bg": "lime", "role": "English for Kids",
                   "bio": ("Spesialis kelas anak. Percaya anak paling cepat belajar lewat permainan, lagu, dan cerita.", "Kids' class specialist who believes children learn fastest through games, songs, and stories."),
                   "exp": ("6 tahun mengajar anak", "6 years teaching kids"), "edu": ("S1 Pendidikan Bahasa Inggris", "B.Ed. English Education"),
                   "certs": [("IELTS", "7.5"), ("TESOL", "")]},
    "Mr. Arif": {"img": "guru-2.png", "bg": "butter", "role": "IELTS & TOEFL",
                 "bio": ("Membantu pejuang beasiswa menyusun strategi tes, esai, dan latihan speaking.", "Helps scholarship hopefuls build test strategy, essays, and speaking practice."),
                 "exp": ("7 tahun persiapan tes", "7 years of test prep"), "edu": ("S2 Linguistik Terapan", "M.A. Applied Linguistics"),
                 "certs": [("IELTS", "8.5"), ("TOEFL iBT", "112")]},
    "Miss Laras": {"img": "guru-3.png", "bg": "lilac", "role": "Business English",
                   "bio": ("Pernah bekerja di perusahaan multinasional; fokus pada komunikasi kerja yang praktis.", "Former multinational professional focused on practical workplace communication."),
                   "exp": ("5 tahun mengajar profesional", "5 years teaching professionals"), "edu": ("S1 Sastra Inggris", "B.A. English Literature"),
                   "certs": [("IELTS", "8.0"), ("CELTA", "")]},
    "Mr. Dani": {"img": "guru-4.png", "bg": "peach", "role": "Teens & Conversation",
                 "bio": ("Membuat peserta berani bicara lewat diskusi, debat ringan, dan topik yang mereka sukai.", "Gets learners talking through discussion, friendly debate, and topics they love."),
                 "exp": ("4 tahun mengajar", "4 years teaching"), "edu": ("S1 Hubungan Internasional", "B.A. International Relations"),
                 "certs": [("TOEFL iBT", "108"), ("TEFL", "")]},
}

UI = {
    "home": ("Beranda", "Home"),
    "programs": ("Program", "Programs"),
    "trial": ("Daftar kelas percobaan", "Book a trial class"),
    "ask_wa": ("Tanya via WhatsApp", "Ask on WhatsApp"),
    "tab_sum": ("Ringkasan", "Overview"), "tab_sched": ("Jadwal", "Schedule"), "tab_curr": ("Kurikulum", "Curriculum"),
    "tab_mentor": ("Mentor", "Mentor"),
    "learn_title": ("Yang akan kamu pelajari", "What you'll learn"),
    "skills_title": ("Keterampilan yang kamu kuasai", "Skills you'll gain"),
    "fit_title2": ("Cocok untuk kamu yang…", "Right for you if…"),
    "prereq_title": ("Prasyarat", "Prerequisites"),
    "sched_title2": ("Jadwal gelombang kelas", "Class batch schedule"),
    "sch_off": ("Berjalan / ditutup", "Running / closed"),
    "curr_title": ("Kurikulum program", "Programme curriculum"),
    "mentor_title": ("Kenalan dengan mentormu", "Meet your mentor"),
    "faq_title2": ("Pertanyaan seputar program ini", "Questions about this programme"),
    "buy_now": ("Daftar sekarang", "Register now"), "try_free": ("Coba gratis", "Try free"), "share": ("Bagikan", "Share"),
    "includes_title": ("Kelas ini termasuk", "This class includes"), "live_badge": ("Kelas live", "Live class"),
    "inc_live": ("Kelas live lewat video call", "Live classes via video call"),
    "inc_place": ("Tes penempatan di awal", "Placement test to start"),
    "inc_report": ("Laporan kemajuan berkala", "Regular progress reports"),
    "inc_cert": ("Sertifikat penyelesaian", "Certificate of completion"),
    "inc_device": ("Belajar dari laptop, tablet, atau HP", "Learn on laptop, tablet, or phone"),
    "experience": ("Pengalaman", "Experience"), "education": ("Pendidikan", "Education"),
    "reviews": ("ulasan", "reviews"),
    "max": ("Maks.", "Max."),
    "per_class": ("peserta/kelas", "learners/class"),
    "learners": ("peserta", "learners"),
    "lang_line": ("Bahasa Inggris · penjelasan Bahasa Indonesia bila perlu", "Taught in English · Indonesian support when needed"),
    "taught_by": ("Diajar oleh", "Taught by"),
    "cert": ("Termasuk sertifikat", "Certificate included"),
    "fit_eyebrow": ("Cocok untuk", "Who it's for"),
    "fit_title": ("Program Ini Cocok<br/>untuk Kamu yang…", "This Programme Is<br/>Right for You If…"),
    "sch_eyebrow": ("Jadwal kelas", "Class schedule"),
    "sch_title": ("Jadwal Kelas<br/>Minggu Ini", "This Week's<br/>Class Schedule"),
    "sch_ok": ("Tersedia", "Available"),
    "sch_low": ("Hampir penuh", "Almost full"),
    "sch_full": ("Penuh", "Full"),
    "sch_note": ("Semua waktu dalam WIB. Pilih kelas yang tersedia untuk langsung mendaftar. Butuh jadwal lain? Tanyakan lewat WhatsApp.",
                 "All times in WIB (UTC+7). Pick an available class to register right away. Need another time? Ask us on WhatsApp."),
    "mod_eyebrow": ("Materi", "Curriculum"),
    "mod_title": ("Yang Akan<br/>Kamu Pelajari", "What You'll<br/>Learn"),
    "module": ("Modul", "Module"),
    "out_eyebrow": ("Hasil belajar", "Outcomes"),
    "out_title": ("Setelah Program Ini,<br/>Kamu Bisa…", "After This Programme,<br/>You'll Be Able To…"),
    "summary": ("Ringkasan program", "Programme summary"),
    "price": ("Biaya", "Fee"),
    "price_val": ("Hubungi kami", "Contact us"),
    "free_trial": ("Kelas percobaan pertama gratis.", "Your first trial class is free."),
    "rel_eyebrow": ("Kelas terkait", "Related classes"),
    "rel_title": ("Kelas Pilihan<br/>di Program Ini", "Featured Classes<br/>in This Programme"),
    "faq_title": ("Pertanyaan Seputar<br/>Program Ini", "Questions About<br/>This Programme"),
    "other_eyebrow": ("Program lain", "Other programmes"),
    "other_title": ("Jelajahi<br/>Program Lainnya", "Explore Other<br/>Programmes"),
    "cta_eyebrow": ("Siap mulai?", "Ready to start?"),
    "cta_title": ("Coba dulu kelasnya,<br/>gratis.", "Try a class first —<br/>it's free."),
    "cta_text": ("Daftar kelas percobaan, ikuti tes penempatan singkat, lalu rasakan sendiri suasana kelas live Elevaree.",
                 "Book a trial class, take a short placement test, and experience an Elevaree live class for yourself."),
}

# ---------------------------------------------------------------------------
# Pembantu
# ---------------------------------------------------------------------------
esc = lambda s: html.escape(s, quote=True)


def tx(tag, pair, cls="", extra="", raw=False):
    """Elemen dengan teks Indonesia + atribut data-en untuk tombol bahasa."""
    idt, en = pair
    body = idt if raw else esc(idt)
    en_attr = en if raw else esc(en)
    if raw:
        en_attr = en_attr.replace('"', "&quot;")
    c = f' class="{cls}"' if cls else ""
    return f'<{tag}{c}{extra} data-en="{en_attr}">{body}</{tag}>'


ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>'
DIAG = '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>'
WA_ICO = ('<svg class="wa-ico" viewBox="0 0 24 24"><path d="M20 11.6a8.3 8.3 0 0 1-12.3 7.2L3.5 20l1.3-4A8.3 8.3 0 1 1 20 11.6z"/>'
          '<path d="M9 8.3c-.3.9.1 2.4 1.5 3.8s2.9 1.9 3.8 1.6l.9-1.2-1.6-.9-.8.6a4.6 4.6 0 0 1-2.1-2.1l.6-.8-.9-1.6z"/></svg>')


SEP = '<span class="crumbs__sep" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></span>'
STAR_PATH = 'M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z'
STARS = "".join(f'<svg viewBox="0 0 24 24"><path d="{STAR_PATH}"/></svg>' for _ in range(5))
ICO_STAR = f'<svg viewBox="0 0 24 24"><path d="{STAR_PATH}"/></svg>'
ICO_USERS = '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.5a6.5 6.5 0 0 1 3 5.5"/></svg>'
ICO_CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
ICO_GLOBE = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.8 2.5 14.2 0 17M12 3.5c-2.5 2.8-2.5 14.2 0 17"/></svg>'
ICO_AWARD = '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7"/></svg>'


def shared_parts():
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    head = src[: src.index("<body>")]
    nav = src[src.index("  <!-- ================= NAV"): src.index("  <main>")]
    tail = src[src.index("  <!-- ================= FOOTER"):]
    # tautan bagian halaman utama -> index.html#bagian
    fix = lambda s: re.sub(r'href="#(beranda|program|kelas|alur|testimoni|faq|guru)"', r'href="index.html#\1"', s)
    nav = fix(nav).replace(' class="is-active"', "", 1)
    tail = fix(tail)
    return head, nav, tail


def page(p, head, nav, tail):
    title_id = f"{p['title']} — Elevaree Academy"
    title_en = f"{p['title']} — Elevaree Academy"
    desc_id, desc_en = p["lead"]
    h = head
    h = re.sub(r"<title>.*?</title>", f"<title>{esc(title_id)}</title>", h, flags=re.S)
    h = re.sub(r'<meta name="description" content=".*?" />', f'<meta name="description" content="{esc(desc_id)}" />', h, flags=re.S)
    h = h.replace('<html lang="id">', f'<html lang="id" data-title-en="{esc(title_en)}" data-desc-en="{esc(desc_en)}">', 1)

    b = p["banner"]
    facts = "".join(f'<li>{CHECK}{tx("span", f)}</li>' for f in p["facts"])
    fit = "".join(
        f'<article class="pd-fit__card" data-reveal style="--delay:{i * .06:.2f}s"><span class="pd-fit__num">0{i + 1}</span>'
        f'{tx("h3", t)}{tx("p", d)}</article>'
        for i, (t, d) in enumerate(p["fit"])
    )
    mods = "".join(
        f'<article class="pd-mod" data-reveal style="--delay:{(i % 2) * .08:.2f}s">'
        f'<span class="pd-mod__label">{tx("span", UI["module"])} {i + 1:02d}</span>'
        f'{tx("h3", t)}{tx("p", d)}</article>'
        for i, (t, d) in enumerate(p["modules"])
    )
    outs = "".join(f'<li data-reveal style="--delay:{i * .06:.2f}s"><span class="pd-out__dot">{CHECK}</span>{tx("span", o)}</li>' for i, o in enumerate(p["outcomes"]))
    summ = "".join(f'<div>{tx("dt", k)}{tx("dd", v)}</div>' for k, v in p["summary"])
    summ += f'<div>{tx("dt", UI["price"])}{tx("dd", UI["price_val"])}</div>'
    faq = "".join(
        f'<div class="faq__item{" is-open" if i == 0 else ""}" data-reveal style="--delay:{i * .04:.2f}s">'
        f'<button class="faq__q" aria-expanded="{"true" if i == 0 else "false"}"><span class="faq__n">({i + 1:02d})</span>{tx("span", q)}<i class="faq__icon"></i></button>'
        f'<div class="faq__a"><div>{tx("p", a)}</div></div></div>'
        for i, (q, a) in enumerate(p["faq"])
    )
    outs_grid = "".join(
        f'<li data-reveal style="--delay:{i * .05:.2f}s"><span class="pd-check">{CHECK}</span>{tx("span", o)}</li>'
        for i, o in enumerate(p["outcomes"]))
    skills = "".join(f'<li style="--i:{i}">{esc(k)}</li>' for i, k in enumerate(p["skills"]))
    fit_list = "".join(f'<li data-reveal style="--delay:{i * .05:.2f}s">{tx("b", t)}{tx("span", d)}</li>' for i, (t, d) in enumerate(p["fit"]))
    prereq = "".join(f'<li>{tx("span", x)}</li>' for x in p["prereq"])
    tch = TEACHERS[b["teacher"]]
    certs = "".join(f'<li><b>{esc(c)}</b>{(" " + esc(v)) if v else ""}</li>' for c, v in tch["certs"])
    mentor = f'''<article class="mentor" data-reveal>
            <div class="mentor__photo bg-{tch["bg"]}"><img src="assets/img/{tch["img"]}" alt="Foto {esc(b["teacher"])}" loading="lazy" /></div>
            <div class="mentor__body">
              <b class="mentor__name">{esc(b["teacher"])}</b><span class="mentor__role">{esc(tch["role"])}</span>
              {tx("p", tch["bio"], "mentor__bio")}
              <dl class="mentor__facts"><div>{tx("dt", UI["experience"])}{tx("dd", tch["exp"])}</div><div>{tx("dt", UI["education"])}{tx("dd", tch["edu"])}</div></dl>
              <ul class="mentor__certs">{certs}</ul>
            </div>
          </article>'''
    inc_icons = {
        "video": '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10.5 5-3v9l-5-3"/>',
        "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
        "doc": '<rect x="5" y="3.5" width="14" height="17" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',
        "chart": '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
        "star": STAR_PATH and f'<path d="{STAR_PATH}"/>',
        "award": '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7"/>',
        "device": '<rect x="2.5" y="4.5" width="14" height="10" rx="2"/><path d="M6 18.5h7M17.5 9.5h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z"/>',
    }
    inc_items = [("video", UI["inc_live"]), ("clock", b["length"]), ("doc", UI["inc_place"]), ("chart", UI["inc_report"]),
                 p["include_extra"], ("award", UI["inc_cert"]), ("device", UI["inc_device"])]
    includes = "".join(f'<li style="--i:{i}"><svg viewBox="0 0 24 24">{inc_icons[k]}</svg>{tx("span", v)}</li>' for i, (k, v) in enumerate(inc_items))
    others = "".join(
        f'<a href="{o["slug"]}.html" class="pd-other bg-{o["color"]}" data-reveal style="--delay:{i * .06:.2f}s">'
        f'{tx("span", o["tag"], "pd-other__tag")}<b>{esc(o["title"])}</b>'
        f'<img src="assets/img/{o["img"]}" alt="" loading="lazy" /><span class="pd-other__go">{DIAG}</span></a>'
        for i, o in enumerate([o for o in PROGRAMS if o["slug"] != p["slug"]])
    )

    main = f'''  <main class="pd">
    <!-- ================= BANNER PROGRAM ================= -->
    <section class="pd-hero">
      <div class="container">
        <div class="pdh">
          <div class="pdh__copy">
            <nav class="crumbs fade-in" style="--d:.05s" aria-label="Breadcrumb">
              <a href="index.html" data-en="{UI["home"][1]}">{UI["home"][0]}</a>{SEP}
              <a href="index.html#program" data-en="{UI["programs"][1]}">{UI["programs"][0]}</a>{SEP}
              <b aria-current="page">{esc(p["title"])}</b>
            </nav>
            <div class="pdh__tags fade-in" style="--d:.15s">
              <span class="pdh__tag pdh__tag--cat"><svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8 20.5h8M12 16.5v4"/></svg>{tx("span", b["cat"])}</span>
              <span class="pdh__tag"><svg viewBox="0 0 24 24"><path d="M4 20V4M4 20h16M9 16v-4M14 16V8M19 16v-6"/></svg>{tx("span", b["level"])}</span>
            </div>
            <h1 class="hero__title pdh__title"><span class="line"><span>{esc(p["title"])}</span></span></h1>
            {tx("p", p["lead"], "pdh__lead fade-in", ' style="--d:.5s"')}
            <ul class="pdh__meta fade-in" style="--d:.65s">
              <li class="pdh__rating"><b>{b["rating"]}</b><span class="stars" aria-hidden="true">{STARS}</span><u>(<span>{b["reviews"]}</span> {tx("span", UI["reviews"])})</u></li>
              <li>{ICO_USERS}<span>{tx("span", UI["max"])} <span data-capacity="{p["key"]}">6</span> {tx("span", UI["per_class"])}</span></li>
              <li>{ICO_CLOCK}{tx("span", b["length"])}</li>
            </ul>
            <p class="pdh__lang fade-in" style="--d:.75s">{ICO_GLOBE}{tx("span", UI["lang_line"])}</p>
            <div class="pdh__foot fade-in" style="--d:.85s">
              <div class="pdh__author">
                <span class="pdh__avatar bg-{b["teacher_bg"]}"><img src="assets/img/{b["teacher_img"]}" alt="" /></span>
                <span>{tx("small", UI["taught_by"])}<b>{esc(b["teacher"])}</b></span>
              </div>
              <a href="daftar.html?paket=trial&amp;program={p["key"]}" data-trial data-free data-program="{p["key"]}" class="btn btn--maroon">{tx("span", UI["trial"])}{ARROW}</a>
              <a href="#kontak" data-wa="{p["wa"]}" class="btn btn--light">{WA_ICO}{tx("span", UI["ask_wa"])}</a>
            </div>
          </div>
          <div class="pdh__media">
            <div class="pdh__photo bg-{p["color"]}"><img src="assets/img/{p["img"]}" alt="{esc(p["img_alt"][0])}" /></div>
            <span class="pdh__chip pdh__chip--a"><i>{ICO_STAR}</i><span>Rating {b["rating"]}</span></span>
            <span class="pdh__chip pdh__chip--b"><i>{ICO_AWARD}</i>{tx("span", UI["cert"])}</span>
            <span class="pdh__chip pdh__chip--c"><i>{ICO_USERS}</i><span>{tx("span", UI["max"])} <span data-capacity="{p["key"]}">6</span> {tx("span", UI["learners"])}</span></span>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= TAB NAVIGASI ================= -->
    <nav class="pd-tabs" aria-label="Bagian halaman">
      <div class="container pd-tabs__inner">
        <a href="#ringkasan" class="is-active">{tx("span", UI["tab_sum"])}</a>
        <a href="#jadwal">{tx("span", UI["tab_sched"])}</a>
        <a href="#kurikulum">{tx("span", UI["tab_curr"])}</a>
        <a href="#mentor">{tx("span", UI["tab_mentor"])}</a>
        <a href="#faq">FAQ</a>
        <span class="pd-tabs__ink" aria-hidden="true"></span>
      </div>
    </nav>

    <div class="container pd-body">
      <div class="pd-main">
        <!-- RINGKASAN -->
        <section class="pd-sec" id="ringkasan">
          {tx("h2", UI["learn_title"], "pd-h", " data-reveal")}
          {tx("p", p["lead"], "pd-lead", " data-reveal")}
          <ul class="pd-checks">{outs_grid}</ul>
          {tx("h3", UI["skills_title"], "pd-h3", " data-reveal")}
          <ul class="pd-skills" data-reveal>{skills}</ul>
          {tx("h3", UI["fit_title2"], "pd-h3", " data-reveal")}
          <ul class="pd-fitlist">{fit_list}</ul>
          {tx("h3", UI["prereq_title"], "pd-h3", " data-reveal")}
          <ul class="pd-bullets" data-reveal>{prereq}</ul>
        </section>

        <!-- JADWAL -->
        <section class="pd-sec" id="jadwal">
          <div class="pd-sec__head">
            {tx("h2", UI["sched_title2"], "pd-h", " data-reveal")}
            <ul class="sched-legend" data-reveal>
              <li><i class="dot-ok"></i>{tx("span", UI["sch_ok"])}</li>
              <li><i class="dot-low"></i>{tx("span", UI["sch_low"])}</li>
              <li><i class="dot-full"></i>{tx("span", UI["sch_full"])}</li>
              <li><i class="dot-off"></i>{tx("span", UI["sch_off"])}</li>
            </ul>
          </div>
          <div class="sched bt" data-schedule="{p["key"]}" data-reveal></div>
        </section>

        <!-- KURIKULUM -->
        <section class="pd-sec" id="kurikulum">
          {tx("h2", UI["curr_title"], "pd-h", " data-reveal")}
          <div class="pd-mods">{mods}</div>
        </section>

        <!-- MENTOR -->
        <section class="pd-sec" id="mentor">
          {tx("h2", UI["mentor_title"], "pd-h", " data-reveal")}
          {mentor}
        </section>

        <!-- FAQ -->
        <section class="pd-sec" id="faq">
          {tx("h2", UI["faq_title2"], "pd-h", " data-reveal")}
          <div class="faq">{faq}</div>
        </section>
      </div>

      <!-- KARTU PENDAFTARAN (menempel) -->
      <aside class="buy" aria-label="Pendaftaran {esc(p["title"])}">
        <div class="buy__media bg-{p["color"]}">
          <img src="assets/img/{p["img"]}" alt="" />
          <span class="buy__live"><i></i>{tx("span", UI["live_badge"])}</span>
        </div>
        <div class="buy__price" data-price="{p["key"]}"></div>
        <a href="daftar.html?program={p["key"]}" class="btn btn--maroon buy__main">{tx("span", UI["buy_now"])}{ARROW}</a>
        <div class="buy__row">
          <a href="daftar.html?paket=trial&amp;program={p["key"]}" data-trial data-free data-program="{p["key"]}" class="btn btn--outline btn--sm">{tx("span", UI["try_free"])}</a>
          <button type="button" class="btn btn--outline btn--sm js-share"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>{tx("span", UI["share"])}</button>
        </div>
        {tx("p", UI["includes_title"], "buy__title")}
        <ul class="buy__list">{includes}</ul>
      </aside>
    </div>

    <!-- ================= KELAS TERKAIT ================= -->
    <section class="section section--soft">
      <div class="container">
        <div class="head-split">
          {tx("p", UI["rel_eyebrow"], "eyebrow", " data-reveal")}
          {tx("h2", UI["rel_title"], "h2", ' data-reveal style="--delay:.06s"', raw=True)}
        </div>
        <div class="pd-related" data-related="{p["cat"]}" data-reveal></div>
      </div>
    </section>

    <!-- ================= PROGRAM LAIN ================= -->
    <section class="section section--soft">
      <div class="container">
        <div class="head-split">
          {tx("p", UI["other_eyebrow"], "eyebrow", " data-reveal")}
          {tx("h2", UI["other_title"], "h2", ' data-reveal style="--delay:.06s"', raw=True)}
        </div>
        <div class="pd-others">{others}</div>
      </div>
    </section>

    <!-- ================= CTA ================= -->
    <section class="cta-wrap">
      <div class="container">
        <div class="cta" data-reveal>
          <div>
            {tx("p", UI["cta_eyebrow"], "cta__eyebrow")}
            {tx("h2", UI["cta_title"], "cta__title", raw=True)}
            {tx("p", UI["cta_text"], "cta__text")}
          </div>
          <a href="daftar.html?paket=trial&amp;program={p["key"]}" data-trial data-free data-program="{p["key"]}" class="btn btn--butter">{tx("span", UI["trial"])}{ARROW}</a>
        </div>
      </div>
    </section>
  </main>

'''
    return f'{h}<body class="page-program">\n  <div class="scroll-progress" aria-hidden="true"></div>\n\n{nav}{main}{tail}'


def main():
    head, nav, tail = shared_parts()
    for p in PROGRAMS:
        out = ROOT / f"{p['slug']}.html"
        out.write_text(page(p, head, nav, tail), encoding="utf-8")
        print("ditulis:", out.name)
    # halaman pendukung (daftar, tentang, privasi, syarat, 404)
    import build_pages
    build_pages.main()


if __name__ == "__main__":
    main()
