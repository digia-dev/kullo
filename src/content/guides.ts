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
    excerpt: "Buat organisasi, undang dua anggota, buat proyek, dan selesaikan tugas pertama.",
    minutes: 5,
    sections: [
      {
        heading: "1. Buat organisasi",
        body: [
          "Saat pertama mendaftar, Kullo membuat satu organisasi atas nama Anda. Isi nama perusahaan, alamat, jam kerja, dan zona waktu di Pengaturan › Organisasi.",
          "Jam kerja dan zona waktu dipakai untuk menghitung jadwal dan tampilan tanggal, jadi atur sekali di awal.",
        ],
      },
      {
        heading: "2. Undang anggota",
        body: [
          "Buka Pengaturan › Anggota, masukkan email dan pilih peran. Kullo membuat tautan undangan sekali pakai yang bisa Anda salin dan kirim lewat kanal apa pun.",
          "Mulailah dengan peran Manager untuk kepala tim, Team Leader untuk koordinator, dan Staff untuk anggota. Peran dapat diubah kapan saja.",
        ],
      },
      {
        heading: "3. Buat proyek pertama",
        body: [
          "Pada Proyek › Buat proyek, isi kode proyek, nama, departemen, manajer, dan tanggal. Kullo membuat lima status bawaan: Backlog, To Do, In Progress, In Review, Done.",
          "Satu proyek pertama sudah cukup. Struktur lain menyusul setelah tim terbiasa.",
        ],
      },
      {
        heading: "4. Selesaikan tugas pertama",
        body: [
          "Tambahkan tugas dari papan proyek, tetapkan PIC, lalu pindahkan status dari kolom ke kolom. Setiap perubahan masuk ke activity log dan, bila ada penerima, ke notifikasi.",
          "Buka My Work untuk melihat tugas yang baru ditugaskan ke Anda, lengkap dengan tenggat dan prioritasnya.",
        ],
      },
    ],
  },
  {
    slug: "alur-kerja-tugas",
    category: "Alur kerja",
    title: "Alur kerja tugas dari pengajuan sampai selesai",
    excerpt: "Lima status, empat prioritas, dan jejak aktivitas yang tidak bisa dilewati.",
    minutes: 6,
    sections: [
      {
        heading: "Status bawaan",
        body: [
          "Backlog → To Do → In Progress → In Review → Done. Admin proyek dapat mengubah status, tetapi urutan default sudah cukup untuk sebagian besar tim.",
          "Ketika semua tugas masuk Done, progres proyek dihitung ulang otomatis. Progres bukan angka yang diketik manual.",
        ],
      },
      {
        heading: "Prioritas",
        body: [
          "Urgent, High, Medium, Low. Prioritas dipakai untuk menyusun urutan tampilan dan penandaan warna, bukan untuk menggantikan tenggat.",
          "Tenggat dan prioritas adalah dua hal berbeda: tenggat kapan selesai, prioritas seberapa penting bila harus memilih.",
        ],
      },
      {
        heading: "Diskusi dan lampiran",
        body: [
          "Setiap tugas memiliki ruang diskusi sendiri: komentar, balasan, mention dengan @nama, lampiran, dan riwayat aktivitas.",
          "Perubahan status, prioritas, PIC, dan tenggat juga tercatat, sehingga tidak perlu ada riwayat di pesan pribadi.",
        ],
      },
    ],
  },
  {
    slug: "alur-persetujuan",
    category: "Alur kerja",
    title: "Alur persetujuan multi-level",
    excerpt: "Bagaimana pengajuan bergerak dari pengirim ke atasan, lalu ke pihak berwenang.",
    minutes: 6,
    sections: [
      {
        heading: "Tiga tahap",
        body: [
          "Pengirim mengisi form dan mengirim. Form divalidasi di server, bukan hanya di peramban.",
          "Tahap pertama biasanya atasan langsung. Tahap kedua kecukupan anggaran, misalnya kepala departemen Finance.",
          "Setelah semua tahap disetujui, status menjadi Approved dan riwayat keputusan lengkap tersimpan.",
        ],
      },
      {
        heading: "Keputusan",
        body: [
          "Approver dapat menyetujui, menolak, atau meminta revisi. Catatan wajib diisi bila hasilnya bukan persetujuan.",
          "Persetujuan atas pengajuan sendiri selalu diblokir oleh server, meski aturannya berbeda di UI.",
        ],
      },
      {
        heading: "Notifikasi",
        body: [
          "Setiap keputusan menghasilkan notifikasi dalam aplikasi yang mengarah ke pengajuan terkait.",
          "Kanal email dan WhatsApp belum aktif pada versi ini. Kami tidak menjanjikan sesuatu yang belum berjalan.",
        ],
      },
    ],
  },
  {
    slug: "catatan-rilis",
    category: "Rilis",
    title: "Catatan rilis v1.0",
    excerpt: "Modul yang tersedia hari ini, dan yang masih ada di peta jalan.",
    minutes: 4,
    sections: [
      {
        heading: "Tersedia sekarang",
        body: [
          "Autentikasi, sesi aman, dan pengaturan organisasi. Dashboard, My Work, Proyek (overview, board, list, timeline, files), dan Tugas.",
          "Tim dan departemen, Chat dengan kanal proyek, Kalender, Dokumen dengan versi dan izin.",
          "Form & Permintaan, Persetujuan multi-level, Laporan dengan ekspor CSV, Pengaturan termasuk matriks izin.",
          "Pencarian global dengan Ctrl+K dan notifikasi dalam aplikasi.",
        ],
      },
      {
        heading: "Masih di peta jalan",
        body: [
          "Asisten AI, otomatisasi alur kerja, integrasi eksternal, dan notifikasi email serta push.",
          "Periode waktu kerja dan timesheet, ekspor XLSX, serta sinkronisasi kalender eksternal.",
        ],
      },
      {
        heading: "Yang sengaja tidak kami bangun",
        body: [
          "Penggajian, akuntansi, pajak, kasir, inventori, rekrutmen, absensi GPS, aplikasi seluler, dan video konferensi.",
          "Kami menahannya agar fokus pada manajemen pekerjaan sampai kebutuhan pasar terbukti.",
        ],
      },
    ],
  },
  {
    slug: "panduan-peran-dan-izin",
    category: "Panduan",
    title: "Peran, izin, dan data antarorganisasi",
    excerpt: "Tujuh peran bawaan, matriks izin yang bisa diubah, dan isolasi data di server.",
    minutes: 7,
    sections: [
      {
        heading: "Peran bawaan",
        body: [
          "Platform Super Admin, Organization Owner, Administrator, Manager, Team Leader, Staff, dan Guest.",
          "Owner selalu memiliki akses penuh. Peran lain mengikuti matriks izin di Pengaturan › Role & Izin.",
        ],
      },
      {
        heading: "Izin diperiksa di server",
        body: [
          "Setiap permintaan membaca role dari basis data, bukan dari antarmuka. Menyembunyikan tombol bukan keamanan.",
          "Data setiap organisasi disaring dengan organisasi aktif pada sesi. Akses silang menghasilkan 403.",
        ],
      },
      {
        heading: "Tindakan yang dibatasi",
        body: [
          "Memberi persetujuan, mengelola anggota, mengubah role, dan mengarsipkan proyek butuh izin khusus.",
          "Staf dapat mengedit tugas yang ditugaskan atau dilaporkan olehnya, tetapi tidak menghapus tugas orang lain.",
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
      "Ya. Paket Free memuat 1 organisasi dengan 5 anggota dan 3 proyek. Tidak ada kartu kredit dan tidak ada masa uji coba yang diam-diam berakhir.",
  },
  {
    question: "Berapa harga paket Pro dan Business?",
    answer:
      "Harga belum ditetapkan dan sedang divalidasi lewat riset pasar. Untuk saat ini kami mengarahkan Anda ke kontak langsung, bukan mengarang angka rupiah.",
  },
  {
    question: "Di mana data organisasi saya disimpan?",
    answer:
      "Data disimpan dalam basis data perusahaan yang dienkripsi saat transit dengan HTTPS. Setiap baris membawa organisasinya, dan server menolak akses lintas organisasi.",
  },
  {
    question: "Apakah ada notifikasi email?",
    answer:
      "Belum. Versi ini mengirim notifikasi dalam aplikasi saja. Email, push peramban, dan WhatsApp ada di peta jalan dan belum kami klaim berjalan.",
  },
  {
    question: "Apakah bisa mengganti alur persetujuan?",
    answer:
      "Ya. Jumlah tahap dan approver dapat diatur di Pengaturan › Pengaturan persetujuan. Tata letak daftarnya sederhana; penyusunan alur lengkap menyusul.",
  },
  {
    anchor: "keamanan",
    question: "Bagaimana keamanan kata sandi dan sesi?",
    answer:
      "Kata sandi di-hash dengan scrypt dan garam unik. Sesi disimpan sebagai token acak yang di-hash, dikirim lewat cookie HttpOnly, dan berakhir setelah 7 hari.",
  },
  {
    question: "Apakah Kullo punya aplikasi seluler?",
    answer:
      "Belum. Versi ini responsif hingga 390px dan cukup untuk memeriksa tugas, memperbarui status, chat, dan menyetujui. Aplikasi asli Android/iOS belum ada di peta jalan dekat.",
  },
  {
    anchor: "hubungi",
    question: "Bagaimana menghubungi tim Kullo?",
    answer:
      "Gunakan formulir di bawah halaman ini atau kirim email ke halo@kullo.app. Setiap pesan masuk ke antrean dukungan kami dan dibalas lewat email Anda.",
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
    title: "Core Workspace",
    status: "Tersedia",
    items: ["Autentikasi dan organisasi", "Anggota, departemen, peran", "Dashboard dan My Work", "Proyek dan tugas", "Board, list, komentar, lampiran", "Notifikasi dan activity log"],
  },
  {
    phase: "Fase 2",
    title: "Team Collaboration",
    status: "Tersedia",
    items: ["Chat dan kanal proyek", "Kalender", "Dokumen dan versi", "Pencarian global", "Mention dan notifikasi lanjutan"],
  },
  {
    phase: "Fase 3",
    title: "Business Operations",
    status: "Tersedia",
    items: ["Form builder dan template", "Permintaan internal", "Persetujuan multi-level", "Reimbursement, cuti, lembur", "Laporan lanjutan"],
  },
  {
    phase: "Fase 4",
    title: "Intelligence & Automation",
    status: "Peta jalan",
    items: ["Asisten kerja AI", "Ringkasan proyek", "Pembuat tugas dari bahasa alami", "Otomatisasi alur", "Integrasi eksternal"],
  },
];

export const PRINCIPLES = [
  { title: "Clarity over Complexity", body: "Halaman hanya menampilkan yang dibutuhkan untuk keputusan berikutnya. Detail disusun bertahap, bukan sekaligus." },
  { title: "Minimal Visual Noise", body: "Satu aksen warna, dua bayangan, dan border tipis. Status ditandai dengan warna kecil, bukan blok besar." },
  { title: "Fast Navigation", body: "Sidebar tetap, pencarian global dengan Ctrl+K, dan setiap daftar menyimpan konteksnya." },
  { title: "Consistent Components", body: "Tabel, kartu, dialog, dan tombol memakai tingkat ukuran dan radius yang sama di seluruh modul." },
  { title: "Information Hierarchy", body: "Judul, data utama, lalu konteks. Angka penting lebih besar dari penjelasannya." },
  { title: "Contextual Actions", body: "Aksi muncul di tempat tugas itu berada. Tidak ada tombol global untuk tindakan yang menyangkut satu baris." },
  { title: "Responsive Experience", body: "Desktop adalah ruang kerja utama; 390px berfokus pada membaca tugas, memperbarui status, chat, dan persetujuan." },
];
