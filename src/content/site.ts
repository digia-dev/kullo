export const SITE = {
  name: "Kullo",
  tagline: "Kerja tim, satu tempat.",
  description:
    "Kullo menyatukan proyek, tugas, chat, dokumen, dan persetujuan dalam satu ruang kerja. Satu basis data, satu set izin.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://kullo.web.id",
  email: "halo@kullo.app",
  locale: "Indonesia",
};

export const PRIMARY_NAV = [
  { href: "/produk", label: "Produk" },
  { href: "/solusi", label: "Solusi" },
  { href: "/harga", label: "Harga" },
  { href: "/sumber-daya", label: "Sumber daya" },
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
      { href: "/produk/teams", label: "Tim dan orang" },
    ],
  },
  {
    title: "Operasional",
    links: [
      { href: "/produk/requests", label: "Formulir dan permintaan" },
      { href: "/produk/approvals", label: "Persetujuan" },
      { href: "/produk/reports", label: "Laporan" },
      { href: "/produk/settings", label: "Pengaturan" },
    ],
  },
  {
    title: "Untuk tim Anda",
    links: [
      { href: "/solusi#produk", label: "Tim produk" },
      { href: "/solusi#agensi", label: "Agensi dan studio" },
      { href: "/solusi#operasional", label: "Operasional" },
      { href: "/solusi#manajemen", label: "Manajemen" },
    ],
  },
];

export const LEGAL_LINKS = [
  { href: "/privasi", label: "Privasi" },
  { href: "/ketentuan", label: "Ketentuan" },
  { href: "/dukungan#keamanan", label: "Keamanan" },
  { href: "/dukungan", label: "Kontak" },
];

export const SOLUTIONS = [
  {
    slug: "produk",
    eyebrow: "Tim produk dan teknologi",
    title: "Rilis tepat waktu dengan konteks yang tetap utuh",
    body:
      "Backlog, papan, keputusan teknis, dan laporan membaca data yang sama. Saat satu tugas berpindah status, progres proyek ikut berubah tanpa dihitung ulang.",
    points: [
      "Backlog, papan, dan lini masa dari satu sumber data",
      "Kanal proyek tempat keputusan teknis tersimpan",
      "Beban kerja per anggota dan per departemen",
    ],
    href: "/produk/projects",
    module: "Proyek",
  },
  {
    slug: "agensi",
    eyebrow: "Agensi dan studio",
    title: "Banyak klien, satu cara kerja",
    body:
      "Pisahkan pekerjaan per klien lewat kode proyek dan departemen. Anda tidak perlu membuat ruang kerja baru setiap kali menerima brief.",
    points: [
      "Kode proyek untuk setiap klien",
      "Dokumen brief dengan versi dan izin",
      "Persetujuan internal sebelum hasil dikirim",
    ],
    href: "/produk/projects",
    module: "Proyek",
  },
  {
    slug: "operasional",
    eyebrow: "Operasional dan keuangan",
    title: "Pengajuan selesai, bukan menumpuk di email",
    body:
      "Cuti, reimbursement, pembelian, dan perjalanan dinas memakai formulir yang sama. Setiap langkah menyimpan approver, waktu, dan catatan.",
    points: [
      "Enam template permintaan siap pakai",
      "Alur persetujuan bertingkat dengan jalur revisi",
      "Riwayat keputusan yang bisa diperiksa",
    ],
    href: "/produk/approvals",
    module: "Persetujuan",
  },
  {
    slug: "manajemen",
    eyebrow: "Manajemen",
    title: "Lihat pekerjaan yang berjalan, bukan laporan bulan lalu",
    body:
      "Beban kerja, progres proyek, tugas terlambat, dan keputusan yang menunggu dihitung dari data yang sudah ada. Anda tidak perlu menyusun ulang laporan setiap rapat.",
    points: [
      "Ringkasan lintas proyek dan departemen",
      "Filter tanggal, departemen, dan proyek",
      "Notifikasi keputusan yang menunggu",
    ],
    href: "/produk/reports",
    module: "Laporan",
  },
  {
    slug: "staf",
    eyebrow: "Staf dan anggota tim",
    title: "Tahu apa yang perlu dikerjakan hari ini",
    body:
      "My Work mengumpulkan tugas yang ditugaskan, Anda buat, dan Anda ikuti. Status bisa diperbarui dari ponsel tanpa membuka aplikasi lain.",
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
    title: "Beri akses terbatas, tetap terkendali",
    body:
      "Klien dan mitra dapat melihat proyek yang dibagikan, membaca dokumen tertentu, dan memberi komentar. Mereka tidak otomatis melihat seluruh organisasi.",
    points: [
      "Peran tamu dengan izin terbatas",
      "Akses per proyek dan per dokumen",
      "Komentar tanpa membuka data internal",
    ],
    href: "/produk/teams",
    module: "Tim",
  },
];

export const QUICK_LINKS = [
  { href: "/masuk?next=/app/my-work", label: "Buat tugas pertama", icon: "check" },
  { href: "/produk", label: "Lihat 12 modul", icon: "grid" },
  { href: "/sumber-daya/panduan-5-menit", label: "Baca panduan memulai", icon: "book" },
];

export const PLANS = [
  {
    key: "free",
    name: "Gratis",
    blurb: "Untuk tim kecil yang baru menata cara kerja.",
    price: "Gratis",
    priceNote: "tanpa kartu kredit",
    cta: { label: "Mulai gratis", href: "/daftar" },
    highlighted: false,
    features: [
      "1 organisasi",
      "5 anggota",
      "3 proyek aktif",
      "Tugas tanpa batas",
      "Papan dan daftar",
      "Notifikasi dalam aplikasi",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    blurb: "Untuk tim yang memakai Kullo setiap hari.",
    price: "Rp399.000",
    priceNote: "per bulan · hingga 25 anggota",
    cta: { label: "Pilih Pro", href: "/daftar?plan=pro" },
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
    name: "Bisnis",
    blurb: "Untuk organisasi lintas departemen dan cabang.",
    price: "Rp1.199.000",
    priceNote: "per bulan · hingga 100 anggota",
    cta: { label: "Pilih Bisnis", href: "/daftar?plan=business" },
    highlighted: false,
    features: [
      "Beberapa organisasi",
      "Hingga 100 anggota",
      "Proyek tanpa batas",
      "Peran dan izin kustom",
      "Laporan dan ekspor",
      "Dukungan prioritas",
    ],
  },
];

export const PLAN_MATRIX = [
  { feature: "Organisasi", values: ["1", "1", "Banyak"] },
  { feature: "Anggota", values: ["5", "25", "Hingga 100"] },
  { feature: "Proyek", values: ["3", "Tanpa batas", "Tanpa batas"] },
  { feature: "Tugas", values: ["Tanpa batas", "Tanpa batas", "Tanpa batas"] },
  { feature: "Papan dan daftar", values: ["Ya", "Ya", "Ya"] },
  { feature: "Chat internal", values: ["Dasar", "Lengkap", "Lengkap"] },
  { feature: "Dokumen", values: ["Terbatas", "Diperluas", "Diperluas"] },
  { feature: "Persetujuan", values: ["Dasar", "Bertingkat", "Bertingkat"] },
  { feature: "Laporan", values: ["Dasar", "Lanjutan", "Lanjutan"] },
  { feature: "Asisten AI", values: ["Tidak", "Rencana", "Rencana"] },
  { feature: "Dukungan prioritas", values: ["Tidak", "Tidak", "Ya"] },
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
      { label: "Agensi dan studio", href: "/solusi#agensi" },
      { label: "Operasional", href: "/solusi#operasional" },
      { label: "Manajemen", href: "/solusi#manajemen" },
    ],
  },
  {
    title: "Sumber daya",
    links: [
      { label: "Panduan memulai", href: "/sumber-daya/panduan-5-menit" },
      { label: "Praktik papan", href: "/sumber-daya/membaca-board-tanpa-chaos" },
      { label: "Alur persetujuan", href: "/sumber-daya/alur-persetujuan-cuti" },
      { label: "Peran dan izin", href: "/sumber-daya/peran-dan-izin" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kullo", href: "/tentang" },
      { label: "Peta jalan", href: "/tentang#roadmap" },
      { label: "Kontak", href: "/dukungan#hubungi" },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Pusat bantuan", href: "/dukungan" },
      { label: "Keamanan", href: "/dukungan#keamanan" },
      { label: "Masuk", href: "/masuk" },
      { label: "Buat akun", href: "/daftar" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privasi", href: "/privasi" },
      { label: "Ketentuan", href: "/ketentuan" },
      { label: "Keamanan", href: "/dukungan#keamanan" },
    ],
  },
];
