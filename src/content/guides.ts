export type Guide = {
  slug: string;
  category: "Panduan" | "Alur kerja" | "Rilis" | "Prinsip";
  title: string;
  excerpt: string;
  minutes: number;
  sections: Array<{ heading: string; body: string[] }>;
};

export const GUIDES: Guide[] = [
  {
    slug: "panduan-5-menit",
    category: "Panduan",
    title: "Panduan 5 menit pertama",
    excerpt: "Buat organisasi, undang dua anggota, buat proyek, lalu selesaikan tugas pertama.",
    minutes: 5,
    sections: [
      {
        heading: "1. Buat organisasi",
        body: [
          "Saat mendaftar, Kullo membuat satu organisasi atas nama Anda. Isi nama perusahaan, alamat, jam kerja, dan zona waktu di Pengaturan > Organisasi.",
          "Jam kerja dan zona waktu dipakai untuk menghitung jadwal dan menampilkan tanggal. Atur sekali di awal agar jadwal tim tidak perlu diperbaiki belakangan.",
        ],
      },
      {
        heading: "2. Undang anggota",
        body: [
          "Buka Pengaturan > Anggota, masukkan email, lalu pilih peran. Kullo membuat tautan undangan sekali pakai yang dapat Anda salin dan kirim lewat kanal apa pun.",
          "Mulai dengan Manajer untuk kepala tim, Pemimpin tim untuk koordinator, dan Staf untuk anggota. Peran dapat diubah kapan saja.",
        ],
      },
      {
        heading: "3. Buat proyek pertama",
        body: [
          "Di Proyek > Buat proyek, isi kode, nama, departemen, manajer, dan tanggal. Kullo membuat lima status bawaan: Backlog, To Do, In Progress, In Review, Done.",
          "Satu proyek pertama sudah cukup. Tambahkan struktur lain setelah tim terbiasa dengan alurnya.",
        ],
      },
      {
        heading: "4. Selesaikan tugas pertama",
        body: [
          "Tambahkan tugas dari papan proyek, tetapkan PIC, lalu pindahkan statusnya. Setiap perubahan masuk ke riwayat aktivitas dan, bila ada penerima, ke notifikasi.",
          "Buka My Work untuk melihat tugas yang baru ditugaskan kepada Anda, lengkap dengan tenggat dan prioritas.",
        ],
      },
    ],
  },
  {
    slug: "alur-kerja-tugas",
    category: "Alur kerja",
    title: "Alur tugas dari pengajuan sampai selesai",
    excerpt: "Lima status, empat prioritas, dan riwayat aktivitas yang tidak bisa dilewati.",
    minutes: 6,
    sections: [
      {
        heading: "Status bawaan",
        body: [
          "Backlog, To Do, In Progress, In Review, Done. Admin proyek dapat mengubah status, tetapi urutan bawaan sudah cukup untuk sebagian besar tim.",
          "Saat semua tugas masuk Done, progres proyek dihitung ulang. Progres tidak diketik manual.",
        ],
      },
      {
        heading: "Prioritas",
        body: [
          "Urgent, High, Medium, Low. Prioritas dipakai untuk menyusun urutan tampilan dan penanda warna, bukan untuk menggantikan tenggat.",
          "Tenggat menjawab kapan pekerjaan selesai. Prioritas menjawab apa yang dipilih lebih dulu saat waktu terbatas.",
        ],
      },
      {
        heading: "Diskusi dan lampiran",
        body: [
          "Setiap tugas punya ruang diskusi sendiri: komentar, balasan, mention dengan @nama, lampiran, dan riwayat aktivitas.",
          "Perubahan status, prioritas, PIC, dan tenggat juga tercatat, sehingga riwayat pekerjaan tidak tertinggal di pesan pribadi.",
        ],
      },
    ],
  },
  {
    slug: "alur-persetujuan",
    category: "Alur kerja",
    title: "Alur persetujuan bertingkat",
    excerpt: "Dari pengirim ke atasan, lalu ke pihak yang berwenang, dengan keputusan yang tercatat.",
    minutes: 6,
    sections: [
      {
        heading: "Tiga tahap",
        body: [
          "Pengirim mengisi formulir dan mengirim. Formulir diperiksa ulang di server sebelum disimpan.",
          "Tahap pertama biasanya atasan langsung. Tahap kedua memeriksa kecukupan anggaran, misalnya kepala departemen Keuangan.",
          "Setelah semua tahap disetujui, status menjadi Disetujui dan riwayat keputusan tersimpan lengkap.",
        ],
      },
      {
        heading: "Keputusan",
        body: [
          "Approver dapat menyetujui, menolak, atau meminta revisi. Catatan wajib diisi bila hasilnya bukan persetujuan.",
          "Server selalu menolak persetujuan atas pengajuan sendiri, meskipun tampilan antarmuka berubah.",
        ],
      },
      {
        heading: "Notifikasi",
        body: [
          "Setiap keputusan menghasilkan notifikasi dalam aplikasi yang mengarah ke pengajuan terkait.",
          "Email dan WhatsApp belum aktif pada versi ini. Kami tidak menjanjikan kanal yang belum berjalan.",
        ],
      },
    ],
  },
  {
    slug: "catatan-rilis",
    category: "Rilis",
    title: "Catatan rilis v1.0",
    excerpt: "Modul yang tersedia hari ini dan yang masih ada di peta jalan.",
    minutes: 4,
    sections: [
      {
        heading: "Tersedia sekarang",
        body: [
          "Autentikasi, sesi aman, dan pengaturan organisasi. Dashboard, My Work, Proyek (ringkasan, papan, daftar, lini masa, file), dan Tugas.",
          "Tim dan departemen, Chat dengan kanal proyek, Kalender, serta Dokumen dengan versi dan izin.",
          "Formulir dan Permintaan, Persetujuan bertingkat, Laporan dengan ekspor CSV, dan Pengaturan termasuk matriks izin.",
          "Pencarian global dengan Ctrl+K dan notifikasi dalam aplikasi.",
        ],
      },
      {
        heading: "Masih di peta jalan",
        body: [
          "Asisten AI, otomatisasi alur kerja, integrasi eksternal, serta notifikasi email dan push.",
          "Timesheet, ekspor XLSX, dan sinkronisasi kalender eksternal.",
        ],
      },
      {
        heading: "Yang belum dibangun",
        body: [
          "Penggajian, akuntansi, pajak, kasir, inventori, rekrutmen, absensi GPS, aplikasi seluler, dan video konferensi.",
          "Semua itu ditahan agar tim fokus pada manajemen pekerjaan sampai kebutuhan pasar terbukti.",
        ],
      },
    ],
  },
  {
    slug: "panduan-peran-dan-izin",
    category: "Panduan",
    title: "Peran, izin, dan data antarorganisasi",
    excerpt: "Peran bawaan, matriks izin yang dapat diubah, dan isolasi data di server.",
    minutes: 7,
    sections: [
      {
        heading: "Peran bawaan",
        body: [
          "Pemilik organisasi, administrator, manajer, pemimpin tim, staf, dan tamu.",
          "Pemilik organisasi selalu memiliki akses penuh. Peran lain mengikuti matriks izin di Pengaturan > Peran dan Izin.",
        ],
      },
      {
        heading: "Izin diperiksa di server",
        body: [
          "Setiap permintaan membaca peran dari basis data, bukan dari antarmuka. Menyembunyikan tombol bukan pengamanan.",
          "Data setiap organisasi disaring dengan organisasi aktif pada sesi. Akses lintas organisasi ditolak.",
        ],
      },
      {
        heading: "Tindakan yang dibatasi",
        body: [
          "Memberi persetujuan, mengelola anggota, mengubah peran, dan mengarsipkan proyek memerlukan izin khusus.",
          "Staf dapat mengubah tugas yang ditugaskan atau dilaporkan kepadanya, tetapi tidak menghapus tugas orang lain.",
        ],
      },
    ],
  },
];

export function guideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}

export type FAQ = { question: string; answer: string; anchor?: string };

export const SUPPORT_FAQ: FAQ[] = [
  {
    anchor: "faq",
    question: "Apakah Kullo gratis dicoba?",
    answer:
      "Ya. Paket Gratis memuat 1 organisasi dengan 5 anggota dan 3 proyek. Tidak perlu kartu kredit dan tidak ada masa uji coba yang berakhir diam-diam.",
  },
  {
    question: "Berapa harga paket Pro dan Bisnis?",
    answer:
      "Belum ditetapkan. Harga sedang divalidasi lewat riset pasar, jadi kami belum menampilkan angka rupiah. Untuk kebutuhan saat ini, hubungi tim lewat formulir kontak.",
  },
  {
    question: "Di mana data organisasi saya disimpan?",
    answer:
      "Data disimpan di basis data dan dienkripsi saat transit dengan HTTPS. Setiap baris membawa ID organisasi, dan server menolak akses lintas organisasi.",
  },
  {
    question: "Apakah ada notifikasi email?",
    answer:
      "Belum. Versi ini mengirim notifikasi di dalam aplikasi. Email, push peramban, dan WhatsApp masih di peta jalan dan belum berjalan.",
  },
  {
    question: "Apakah alur persetujuan bisa diubah?",
    answer:
      "Bisa. Jumlah tahap dan approver diatur di Pengaturan > Pengaturan persetujuan. Penyusunan alur visual yang lebih lengkap menyusul.",
  },
  {
    anchor: "keamanan",
    question: "Bagaimana kata sandi dan sesi diamankan?",
    answer:
      "Kata sandi di-hash dengan scrypt dan garam unik. Sesi disimpan sebagai token acak yang di-hash, dikirim lewat cookie HttpOnly, dan berakhir setelah 7 hari.",
  },
  {
    question: "Apakah Kullo punya aplikasi seluler?",
    answer:
      "Belum. Antarmuka web responsif sampai 390px dan cukup untuk memeriksa tugas, memperbarui status, chat, dan menyetujui. Aplikasi Android dan iOS belum ada di peta jalan dekat.",
  },
  {
    anchor: "hubungi",
    question: "Bagaimana menghubungi tim Kullo?",
    answer:
      "Gunakan formulir di halaman ini atau kirim email ke halo@kullo.app. Pesan masuk ke antrean dukungan dan dibalas lewat email Anda.",
  },
];

export type RoadmapPhase = {
  phase: string;
  title: string;
  status: "Tersedia" | "Berjalan" | "Peta jalan";
  items: string[];
};

export const ROADMAP: RoadmapPhase[] = [
  {
    phase: "Fase 1",
    title: "Ruang kerja inti",
    status: "Tersedia",
    items: ["Autentikasi dan organisasi", "Anggota, departemen, peran", "Dashboard dan My Work", "Proyek dan tugas", "Papan, daftar, komentar, lampiran", "Notifikasi dan riwayat aktivitas"],
  },
  {
    phase: "Fase 2",
    title: "Kolaborasi tim",
    status: "Tersedia",
    items: ["Chat dan kanal proyek", "Kalender", "Dokumen dan versi", "Pencarian global", "Mention dan notifikasi lanjutan"],
  },
  {
    phase: "Fase 3",
    title: "Operasional bisnis",
    status: "Tersedia",
    items: ["Pembuat formulir dan template", "Permintaan internal", "Persetujuan bertingkat", "Reimbursement, cuti, lembur", "Laporan lanjutan"],
  },
  {
    phase: "Fase 4",
    title: "Kecerdasan dan otomatisasi",
    status: "Peta jalan",
    items: ["Asisten kerja AI", "Ringkasan proyek", "Pembuat tugas dari bahasa alami", "Otomatisasi alur", "Integrasi eksternal"],
  },
];

export const PRINCIPLES = [
  { title: "Kejelasan lebih dulu", body: "Halaman hanya menampilkan yang dibutuhkan untuk keputusan berikutnya. Detail disusun bertahap, bukan sekaligus." },
  { title: "Tampilan tanpa gangguan", body: "Satu aksen warna, border tipis, dan status ditandai dengan warna kecil, bukan blok besar." },
  { title: "Navigasi cepat", body: "Sidebar tetap, pencarian global dengan Ctrl+K, dan setiap daftar menyimpan konteksnya." },
  { title: "Komponen konsisten", body: "Tabel, kartu, dialog, dan tombol memakai ukuran dan radius yang sama di seluruh modul." },
  { title: "Hierarki informasi", body: "Judul, data utama, lalu konteks. Angka penting lebih besar dari penjelasannya." },
  { title: "Aksi sesuai konteks", body: "Aksi muncul di tempat tugas itu berada, bukan tombol global untuk satu baris." },
  { title: "Pengalaman responsif", body: "Desktop menjadi ruang kerja utama; 390px berfokus pada membaca tugas, memperbarui status, chat, dan persetujuan." },
];
