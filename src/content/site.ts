export const SITE = {
  name: "Kullo",
  tagline: "Work Together. Move Forward.",
  description:
    "Kullo adalah portal kerja yang menyatukan proyek, tugas, percakapan, dokumen, dan persetujuan dalam satu workspace.",
  url: "https://kullo.app",
  email: "halo@kullo.app",
  locale: "Indonesia (Indonesia)",
};

export const PRIMARY_NAV = [
  { href: "/produk", label: "Produk" },
  { href: "/solusi", label: "Solusi" },
  { href: "/harga", label: "Harga" },
  { href: "/sumber-daya", label: "Sumber Daya" },
  { href: "/dukungan", label: "Dukungan" },
];

export const MENU_COLUMNS = [
  {
    title: "Ruang kerja",
    links: [
      { href: "/produk/dashboard", label: "Dashboard" },
      { href: "/produk/my-work", label: "My Work" },
      { href: "/produk/projects", label: "Proyek" },
      { href: "/produk/tasks", label: "Tugas" },
    ],
  },
  {
    title: "Kolaborasi",
    links: [
      { href: "/produk/chat", label: "Chat internal" },
      { href: "/produk/calendar", label: "Kalender" },
      { href: "/produk/documents", label: "Dokumen" },
      { href: "/produk/teams", label: "Tim & orang" },
    ],
  },
  {
    title: "Operasional",
    links: [
      { href: "/produk/requests", label: "Form & permintaan" },
      { href: "/produk/approvals", label: "Persetujuan" },
      { href: "/produk/reports", label: "Laporan" },
      { href: "/produk/settings", label: "Pengaturan" },
    ],
  },
  {
    title: "Untuk tim Anda",
    links: [
      { href: "/solusi#produk", label: "Tim produk" },
      { href: "/solusi#agensi", label: "Agensi & studio" },
      { href: "/solusi#operasional", label: "Operasional" },
      { href: "/solusi#manajemen", label: "Manajemen" },
    ],
  },
];

export const LEGAL_LINKS = [
  { href: "/privasi", label: "Privasi" },
  { href: "/ketentuan", label: "Ketentuan" },
  { href: "/tentang#keamanan", label: "Keamanan" },
  { href: "/dukungan", label: "Kontak" },
];

export const SOLUTIONS = [
  {
    slug: "produk",
    eyebrow: "Tim produk & teknologi",
    title: "Dari backlog ke rilis tanpa kehilangan konteks",
    body:
      "Rencana rilis, backlog, diskusi teknis, dan keputusan produk dalam satu alur. Board membaca status yang sama dengan laporan, sehingga progres tidak perlu dihitung ulang.",
    points: [
      "Backlog, board, dan timeline dari data yang sama",
      "Kanal proyek tempat keputusan teknis tersimpan",
      "Laporan beban kerja per anggota dan per departemen",
    ],
    href: "/produk/projects",
    module: "Proyek",
  },
  {
    slug: "agensi",
    eyebrow: "Agensi & studio",
    title: "Banyak klien, satu cara kerja yang konsisten",
    body:
      "Pisahkan pekerjaan per klien dengan kode proyek dan departemen, tanpa membuat workspace baru setiap kali ada brief. Revisi dan tenggat tetap terlihat oleh tim yang tepat.",
    points: [
      "Proyek berkode untuk setiap klien",
      "Dokumen brief dengan versi dan izin",
      "Persetujuan internal sebelum hasil dikirim",
    ],
    href: "/produk/projects",
    module: "Proyek",
  },
  {
    slug: "operasional",
    eyebrow: "Operasional & keuangan",
    title: "Pengajuan yang bergerak, bukan menumpuk di email",
    body:
      "Cuti, reimbursement, pembelian, dan perjalanan dinas memakai template yang sama. Setiap langkah menyimpan approver, waktu, dan catatan.",
    points: [
      "Template permintaan siap pakai",
      "Alur multi-level dengan jalan revisi",
      "Riwayat keputusan yang bisa diaudit",
    ],
    href: "/produk/approvals",
    module: "Persetujuan",
  },
  {
    slug: "manajemen",
    eyebrow: "Manajemen",
    title: "Satu layar untuk melihat apa yang benar-benar terjadi",
    body:
      "Beban kerja, progres proyek, tugas terlambat, dan keputusan yang menunggu dihitung dari baris nyata. Bukan laporan yang disusun ulang setiap rapat.",
    points: [
      "Dashboard lintas proyek dan departemen",
      "Laporan dengan filter tanggal dan ekspor CSV",
      "Notifikasi keputusan yang menunggu",
    ],
    href: "/produk/reports",
    module: "Laporan",
  },
  {
    slug: "staf",
    eyebrow: "Staf & anggota tim",
    title: "Tahu apa yang harus dikerjakan hari ini",
    body:
      "My Work mengumpulkan tugas yang ditugaskan, dibuat, dan diikuti. Status dapat diperbarui dari ponsel tanpa membuka enam aplikasi.",
    points: [
      "Daftar tugas pribadi dengan prioritas",
      "Ubah status, tenggat, dan komentar",
      "Checklist dan lampiran menempel pada tugas",
    ],
    href: "/produk/my-work",
    module: "My Work",
  },
  {
    slug: "guest",
    eyebrow: "Kolaborator eksternal",
    title: "Akses terbatas yang tetap terkendali",
    body:
      "Klien dan mitra dapat melihat proyek yang dibagikan, membaca dokumen tertentu, dan memberi komentar. Mereka tidak otomatis melihat seluruh organisasi.",
    points: [
      "Peran guest dengan izin terbatas",
      "Akses per proyek dan per dokumen",
      "Komentar tanpa membuka data internal",
    ],
    href: "/produk/teams",
    module: "Tim",
  },
];

export const MEGA_MENU = [
  {
    title: "Ruang kerja",
    links: [
      { href: "/produk/dashboard", label: "Dashboard" },
      { href: "/produk/my-work", label: "My Work" },
      { href: "/produk/projects", label: "Proyek" },
      { href: "/produk/tasks", label: "Tugas" },
    ],
  },
  {
    title: "Kolaborasi",
    links: [
      { href: "/produk/chat", label: "Chat internal" },
      { href: "/produk/calendar", label: "Kalender" },
      { href: "/produk/documents", label: "Dokumen" },
      { href: "/produk/teams", label: "Tim & orang" },
    ],
  },
  {
    title: "Operasional",
    links: [
      { href: "/produk/requests", label: "Form & permintaan" },
      { href: "/produk/approvals", label: "Persetujuan" },
      { href: "/produk/reports", label: "Laporan" },
      { href: "/produk/settings", label: "Pengaturan" },
    ],
  },
  {
    title: "Untuk tim Anda",
    links: [
      { href: "/solusi#produk", label: "Tim produk" },
      { href: "/solusi#agensi", label: "Agensi & studio" },
      { href: "/solusi#operasional", label: "Operasional" },
      { href: "/solusi#manajemen", label: "Manajemen" },
    ],
  },
];

export const HERO_SLIDES = [
  {
    eyebrow: "Kullo Workspace",
    title: "Satu ruang kerja untuk seluruh pekerjaan tim",
    body:
      "Proyek, tugas, percakapan, dokumen, dan persetujuan bertemu di satu tempat. Tidak ada lagi pekerjaan yang hilang di antara aplikasi.",
    primary: { href: "/daftar", label: "Coba Kullo gratis" },
    secondary: { href: "/masuk", label: "Masuk ke demo" },
    art: "hub" as const,
    tone: "dusk" as const,
  },
  {
    eyebrow: "Satu sumber data",
    title: "Dari rencana menjadi hasil, tanpa berpindah aplikasi",
    body:
      "Board, kalender, dan laporan membaca data yang sama. Saat satu tugas bergerak, seluruh tim melihat perubahan yang sama.",
    primary: { href: "/produk", label: "Jelajahi 12 modul" },
    secondary: { href: "/harga", label: "Lihat paket" },
    art: "flow" as const,
    tone: "dawn" as const,
  },
];

export const QUICK_LINKS = [
  { href: "/masuk?next=/app/my-work", label: "Buat tugas pertama Anda", icon: "check" },
  { href: "/produk", label: "Lihat peta 12 modul", icon: "grid" },
  { href: "/sumber-daya/memulai-workspace-pertama", label: "Baca panduan memulai", icon: "book" },
];

export const PRODUCT_CARDS = [
  {
    title: "Proyek yang terlihat jelas",
    copy:
      "Rencana, milestone, dan beban kerja dalam board, list, dan timeline yang membaca data yang sama.",
    href: "/produk/projects",
    cta: "Pelajari proyek",
    art: "board" as const,
  },
  {
    title: "Percakapan yang berujung tindakan",
    copy:
      "Ubah pesan menjadi tugas tanpa menyalin ulang konteks. Kanal proyek dan departemen tetap terhubung.",
    href: "/produk/chat",
    cta: "Pelajari chat",
    art: "chat" as const,
  },
  {
    title: "Dokumen dengan versi dan izin",
    copy:
      "Satu tempat untuk file perusahaan, proyek, tim, dan pribadi — lengkap dengan riwayat versi.",
    href: "/produk/documents",
    cta: "Pelajari dokumen",
    art: "docs" as const,
  },
  {
    title: "Persetujuan yang tidak tertahan",
    copy:
      "Alur multi-level dengan catatan, delegasi, dan riwayat keputusan yang bisa diaudit.",
    href: "/produk/approvals",
    cta: "Pelajari persetujuan",
    art: "approval" as const,
  },
];

export const BUSINESS_CARDS = [
  {
    title: "Tim produk & teknologi",
    copy: "Rencana rilis, backlog, dan diskusi teknis dalam satu alur dari ide ke Done.",
    href: "/solusi#produk",
    cta: "Lihat alur produk",
  },
  {
    title: "Agensi & studio",
    copy: "Kelola banyak klien, brief, revisi, dan tenggat tanpa kehilangan konteks.",
    href: "/solusi#agensi",
    cta: "Lihat alur agensi",
  },
  {
    title: "Operasional & keuangan",
    copy: "Permintaan, persetujuan, dan laporan operasional yang tercatat rapi.",
    href: "/solusi#operasional",
    cta: "Lihat alur operasional",
  },
  {
    title: "Manajemen",
    copy: "Beban kerja, progres, dan keputusan yang menunggu dalam satu layar.",
    href: "/solusi#manajemen",
    cta: "Lihat alur manajemen",
  },
];

export const PLANS = [
  {
    key: "free",
    name: "Free",
    blurb: "Untuk tim kecil yang baru menata cara kerja.",
    price: "Gratis",
    priceNote: "selamanya",
    cta: { label: "Mulai gratis", href: "/daftar" },
    highlighted: false,
    features: [
      "1 organisasi",
      "5 anggota",
      "3 proyek aktif",
      "Tugas tanpa batas",
      "Board, list, dan komentar",
      "Notifikasi dalam aplikasi",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    blurb: "Untuk tim yang bekerja setiap hari di Kullo.",
    price: "Segera diumumkan",
    priceNote: "harga belum ditetapkan",
    cta: { label: "Hubungi kami", href: "/dukungan" },
    highlighted: true,
    features: [
      "1 organisasi",
      "25 anggota",
      "Proyek tanpa batas",
      "Chat, kalender, dan dokumen",
      "Alur persetujuan",
      "Laporan lanjutan",
    ],
  },
  {
    key: "business",
    name: "Business",
    blurb: "Untuk organisasi multi-departemen dan multi-cabang.",
    price: "Hubungi kami",
    priceNote: "penawaran khusus",
    cta: { label: "Bicara dengan kami", href: "/dukungan" },
    highlighted: false,
    features: [
      "Organisasi ganda",
      "Anggota sesuai kebutuhan",
      "Proyek tanpa batas",
      "Role dan izin kustom",
      "Laporan dan ekspor",
      "Dukungan prioritas",
    ],
  },
];

export const PLAN_MATRIX = [
  { feature: "Organisasi", values: ["1", "1", "Banyak"] },
  { feature: "Anggota", values: ["5", "25", "Kustom"] },
  { feature: "Proyek", values: ["3", "Tanpa batas", "Tanpa batas"] },
  { feature: "Tugas", values: ["Tanpa batas", "Tanpa batas", "Tanpa batas"] },
  { feature: "Board & list", values: ["Ya", "Ya", "Ya"] },
  { feature: "Chat", values: ["Dasar", "Lengkap", "Lengkap"] },
  { feature: "Dokumen", values: ["Terbatas", "Diperluas", "Diperluas"] },
  { feature: "Persetujuan", values: ["Dasar", "Multi-level", "Multi-level"] },
  { feature: "Laporan", values: ["Dasar", "Lanjutan", "Lanjutan"] },
  { feature: "AI assistant", values: ["—", "Roadmap", "Roadmap"] },
  { feature: "Dukungan prioritas", values: ["—", "—", "Ya"] },
];

export const FAQ = [
  {
    q: "Apakah Kullo sudah tersedia untuk umum?",
    a: "Kullo berada pada tahap Phase 1: workspace inti sudah dapat dipakai — organisasi, anggota, proyek, tugas, board, komentar, dan notifikasi. Modul kolaborasi dan operasional sedang dilengkapi bertahap.",
  },
  {
    q: "Apakah harga Pro dan Business sudah ada?",
    a: "Belum. Kami tidak menampilkan angka sebelum paket dan harga divalidasi. Halaman ini menampilkan isi paket; harga akan diumumkan saat siap. Sampai saat itu, hubungi kami untuk diskusi.",
  },
  {
    q: "Apakah data antarorganisasi terpisah?",
    a: "Ya. Setiap kueri produk dibatasi oleh organisasi dari sesi pengguna, dan setiap mutasi memeriksa izin di server. ID organisasi lain diperlakukan sebagai tidak ditemukan.",
  },
  {
    q: "Bisakah saya mencoba tanpa membuat akun?",
    a: "Bisa. Halaman masuk menyediakan akun demo untuk organisasi contoh Nusantara Digital. Anda dapat melihat dashboard, proyek, chat, persetujuan, dan laporan dengan data nyata dari database demo.",
  },
  {
    q: "Apakah ada aplikasi mobile?",
    a: "Belum. Antarmuka web sudah responsif untuk melihat tugas, memperbarui status, membaca chat, dan menyetujui permintaan dari ponsel. Aplikasi native berada di luar cakupan MVP.",
  },
  {
    q: "Bagaimana Kullo menangani AI?",
    a: "Asisten AI adalah arah Phase 4, bukan fitur yang diklaim sudah ada. Kami menandainya sebagai roadmap agar tidak ada kemampuan yang dilebih-lebihkan.",
  },
];

export const ARTICLES = [
  {
    slug: "memulai-workspace-pertama",
    title: "Memulai workspace pertama tanpa membuat kekacauan baru",
    excerpt:
      "Urutan yang masuk akal: orang, departemen, satu proyek nyata, lalu tugas yang benar-benar akan dikerjakan minggu ini.",
    category: "Memulai",
    minutes: 6,
    body: [
      {
        h: "Mulai dari orang, bukan dari tool",
        p: "Sebelum membuat proyek, pastikan struktur dasar benar. Undang anggota inti, tentukan departemen, dan pilih satu orang sebagai pemilik workspace. Kullo memakai peran owner, admin, manager, leader, staff, dan guest; setiap peran membawa izin yang berbeda dan dapat diubah di matriks izin.",
      },
      {
        h: "Satu proyek nyata lebih baik dari lima proyek contoh",
        p: "Buat satu proyek yang benar-benar berjalan minggu ini. Isi kode, pemilik, manajer, tanggal mulai, dan tenggat. Tambahkan tiga sampai lima milestone yang bisa diperiksa, bukan daftar keinginan. Progres proyek dihitung dari status tugas, jadi angka itu baru berarti setelah tugasnya nyata.",
      },
      {
        h: "Tentukan arti setiap status",
        p: "Alur default Kullo adalah Backlog, To Do, In Progress, In Review, Done. Sebelum tim memakainya, sepakati satu kalimat untuk masing-masing status. \"In Review\" berarti sudah ada hasil yang bisa dibaca, bukan \"hampir selesai\".",
      },
      {
        h: "Tutup minggu pertama dengan pemeriksaan 15 menit",
        p: "Lihat My Work, board proyek, dan laporan tugas. Cari tugas tanpa PIC, tugas terlambat, dan tugas yang berpindah status tanpa komentar. Perbaiki tiga hal itu, lalu ulangi minggu berikutnya. Kullo tidak akan membuat proses menjadi baik dengan sendirinya; ia hanya membuat proses yang sudah dipilih terlihat.",
      },
    ],
  },
  {
    slug: "membaca-board-tanpa-chaos",
    title: "Membaca board tanpa chaos: satu kebiasaan, tiga aturan",
    excerpt:
      "Board berguna saat kartu bergerak karena alasan yang jelas. Ini aturan yang kami pakai sendiri.",
    category: "Praktik",
    minutes: 5,
    body: [
      {
        h: "Satu kartu, satu pemilik",
        p: "Setiap kartu di board memiliki satu PIC. Kolaborator boleh banyak, tetapi hanya satu orang yang bertanggung jawab memindahkan kartu. Tanpa aturan ini, kartu paling penting justru paling lama diam.",
      },
      {
        h: "Batas pekerjaan berjalan",
        p: "Tentukan berapa kartu yang boleh berada di In Progress untuk satu orang. Jika batas tercapai, pekerjaan baru menunggu di To Do. Ini membuat hambatan terlihat sebagai antrean, bukan sebagai lembur yang tidak tercatat.",
      },
      {
        h: "Definisi selesai yang bisa diperiksa",
        p: "Sebuah kartu hanya masuk Done jika checklist-nya selesai dan hasilnya bisa dibuka orang lain. Komentar \"sudah\" bukan bukti. Di Kullo, checklist dan lampiran menempel pada tugas yang sama sehingga definisi ini bisa diperiksa.",
      },
    ],
  },
  {
    slug: "alur-persetujuan-cuti",
    title: "Merancang alur persetujuan cuti yang tidak menyandera tim",
    excerpt:
      "Multi-level bukan berarti banyak lapisan. Tentukan siapa yang benar-benar perlu memutuskan.",
    category: "Operasional",
    minutes: 7,
    body: [
      {
        h: "Pisahkan pemeriksaan dan keputusan",
        p: "Atasan langsung biasanya memeriksa dampak ke tim; HR memeriksa sisa cuti dan kebijakan. Keduanya boleh berada di alur yang sama, tetapi catat alasan setiap keputusan. Kullo menyimpan approver, waktu, dan catatan pada setiap langkah.",
      },
      {
        h: "Blokir persetujuan diri sendiri",
        p: "Jika pengaju adalah approver, sistem harus menolak keputusan itu — bukan hanya menyembunyikan tombol. Di Kullo, aturan ini diperiksa di server, sehingga tidak bisa dilewati dari antarmuka.",
      },
      {
        h: "Sediakan jalan revisi",
        p: "Banyak pengajuan tidak ditolak, hanya kurang lengkap. Gunakan status Revision requested agar pengaju dapat memperbaiki tanpa membuat permintaan baru. Riwayat tetap tersimpan.",
      },
      {
        h: "Ukur waktu tunggu, bukan jumlah pengajuan",
        p: "Laporan yang berguna adalah waktu dari Submitted ke keputusan akhir dan berapa yang menunggu lebih dari dua hari. Jumlah pengajuan saja mendorong orang membuat lebih banyak formulir, bukan mempercepat keputusan.",
      },
    ],
  },
  {
    slug: "peran-dan-izin",
    title: "Peran dan izin: siapa boleh melihat apa",
    excerpt:
      "RBAC yang baik menjelaskan pekerjaan, bukan hanya memberi centang pada daftar fitur.",
    category: "Tata kelola",
    minutes: 6,
    body: [
      {
        h: "Mulai dari pekerjaan, bukan dari jabatan",
        p: "Tulis tiga hal yang harus bisa dilakukan sebuah peran: melihat proyek departemen, membuat tugas, menyetujui permintaan. Baru setelah itu petakan ke izin. Jabatan berubah, pekerjaan lebih stabil.",
      },
      {
        h: "Izin diperiksa di server",
        p: "Menyembunyikan tombol bukan keamanan. Setiap mutasi di Kullo memeriksa izin organisasi dari sesi, dan setiap kueri dibatasi oleh organisasi tersebut. Ini berlaku untuk halaman, server action, dan ekspor.",
      },
      {
        h: "Guest adalah peran, bukan tautan rahasia",
        p: "Kolaborator eksternal mendapat peran guest dengan izin terbatas. Mereka tidak otomatis melihat seluruh proyek hanya karena memiliki akun.",
      },
      {
        h: "Tinjau matriks setiap kuartal",
        p: "Izin cenderung menumpuk. Tinjau peran yang tidak lagi dipakai, cabut izin yang tidak lagi relevan, dan pastikan owner tidak menjadi satu-satunya orang yang bisa melakukan segalanya.",
      },
    ],
  },
];

export const SUPPORT_TOPICS = [
  { title: "Memulai", body: "Akun, organisasi, undangan anggota, dan proyek pertama." },
  { title: "Proyek & tugas", body: "Board, list, timeline, status, prioritas, dan komentar." },
  { title: "Persetujuan", body: "Template permintaan, alur multi-level, dan riwayat keputusan." },
  { title: "Keamanan", body: "Sesi, kata sandi, peran, dan isolasi data organisasi." },
];

export const FOOTER_COLUMNS = [
  {
    title: "Produk",
    links: [
      { label: "Dashboard", href: "/produk/dashboard" },
      { label: "My Work", href: "/produk/my-work" },
      { label: "Proyek", href: "/produk/projects" },
      { label: "Tugas", href: "/produk/tasks" },
      { label: "Chat", href: "/produk/chat" },
    ],
  },
  {
    title: "Solusi",
    links: [
      { label: "Tim produk", href: "/solusi#produk" },
      { label: "Agensi & studio", href: "/solusi#agensi" },
      { label: "Operasional", href: "/solusi#operasional" },
      { label: "Manajemen", href: "/solusi#manajemen" },
    ],
  },
  {
    title: "Sumber daya",
    links: [
      { label: "Panduan memulai", href: "/sumber-daya/memulai-workspace-pertama" },
      { label: "Praktik board", href: "/sumber-daya/membaca-board-tanpa-chaos" },
      { label: "Alur persetujuan", href: "/sumber-daya/alur-persetujuan-cuti" },
      { label: "Peran & izin", href: "/sumber-daya/peran-dan-izin" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kullo", href: "/tentang" },
      { label: "Roadmap", href: "/tentang#roadmap" },
      { label: "Karier", href: "/tentang#karier" },
      { label: "Kontak", href: "/dukungan" },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Pusat bantuan", href: "/dukungan" },
      { label: "Status produk", href: "/dukungan#status" },
      { label: "Masuk", href: "/masuk" },
      { label: "Buat akun", href: "/daftar" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privasi", href: "/tentang#privasi" },
      { label: "Ketentuan", href: "/tentang#ketentuan" },
      { label: "Keamanan", href: "/tentang#keamanan" },
      { label: "Aksesibilitas", href: "/tentang#aksesibilitas" },
    ],
  },
];

export const DEMO_ACCOUNTS = [
  { email: "alya@nusantara.id", role: "Owner", name: "Alya Prameswari" },
  { email: "maya@nusantara.id", role: "Manager", name: "Maya Kusuma" },
  { email: "rizky@nusantara.id", role: "Manager", name: "Rizky Pratama" },
  { email: "budi@nusantara.id", role: "Staff", name: "Budi Santoso" },
];
