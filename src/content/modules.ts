export type ModuleGroup = "Ruang kerja" | "Kolaborasi" | "Operasional" | "Kelola";

export type ModuleDef = {
  slug: string;
  number: string;
  name: string;
  tagline: string;
  group: ModuleGroup;
  icon: string;
  summary: string;
  description: string;
  capabilities: string[];
  route: string;
};

export const MODULES: ModuleDef[] = [
  {
    slug: "dashboard",
    number: "01",
    name: "Dashboard",
    tagline: "Ringkasan aktivitas kerja",
    group: "Ruang kerja",
    icon: "layout",
    summary: "Hari ini Anda dalam satu layar: tugas, proyek, agenda, dan hal yang menunggu keputusan.",
    description:
      "Dashboard adalah halaman pertama setelah masuk. Widget-nya mengikuti peran dan izin pengguna, sehingga seorang staf melihat pekerjaannya sendiri sementara manajemen melihat beban tim.",
    capabilities: [
      "Ringkasan tugas pribadi: tertunda, jatuh hari ini, terlambat, selesai",
      "Progres proyek aktif beserta tenggat terdekat",
      "Feed aktivitas kronologis dari seluruh organisasi",
      "Aksi cepat: tugas, proyek, pesan, dokumen, agenda, permintaan",
    ],
    route: "/app/dashboard",
  },
  {
    slug: "my-work",
    number: "02",
    name: "My Work",
    tagline: "Pusat kerja pribadi",
    group: "Ruang kerja",
    icon: "check-square",
    summary: "Semua yang menyangkut Anda: yang ditugaskan, yang Anda buat, yang diikuti.",
    description:
      "My Work adalah titik awal hari kerja. Tampilan list, board, dan kalender berbagi filter yang sama, dan setiap aksi mencatat perubahan ke activity log.",
    capabilities: [
      "Filter Ditugaskan, Dibuat, Diikuti, Selesai, Terlambat",
      "Tampilan list, board, dan kalender dari satu sumber data",
      "Prioritas harian, catatan pribadi, dan tenggat terdekat",
      "Ubah status, prioritas, tenggat, komentar, dan lampiran",
    ],
    route: "/app/my-work",
  },
  {
    slug: "projects",
    number: "03",
    name: "Proyek",
    tagline: "Manajemen proyek",
    group: "Ruang kerja",
    icon: "folder-kanban",
    summary: "Proyek dengan enam tampilan: overview, board, list, timeline, kalender, dan file.",
    description:
      "Setiap proyek memiliki kode, pemilik, manajer, anggota, milestone, status, prioritas, dan progres yang dihitung dari status tugasnya sendiri.",
    capabilities: [
      "Create, edit, duplicate, archive, dan anggota proyek",
      "Enam tampilan: overview, board, list, timeline, kalender, files",
      "Milestone dan tenggat per proyek",
      "Riwayat aktivitas proyek",
    ],
    route: "/app/projects",
  },
  {
    slug: "tasks",
    number: "04",
    name: "Tugas",
    tagline: "Manajemen tugas",
    group: "Ruang kerja",
    icon: "list-checks",
    summary: "Setiap pekerjaan punya identitas, PIC, status, prioritas, tenggat, dan diskusi sendiri.",
    description:
      "Tugas adalah unit terkecil di Kullo. Status mengikuti alur kerja proyek, prioritas memakai empat tingkat, dan seluruh perubahan tercatat.",
    capabilities: [
      "Status Backlog → To Do → In Progress → In Review → Done",
      "Prioritas urgent, high, medium, low",
      "Checklist, subtugas, label, lampiran, dan log waktu",
      "Komentar dengan mention dan riwayat aktivitas",
    ],
    route: "/app/tasks",
  },
  {
    slug: "teams",
    number: "05",
    name: "Tim",
    tagline: "Tim & organisasi",
    group: "Kelola",
    icon: "users",
    summary: "Direktori karyawan, departemen, kepala departemen, dan struktur organisasi.",
    description:
      "Struktur organisasi menentukan siapa yang memantau siapa. Data sensitif seperti nomor telepon hanya terlihat sesuai izin.",
    capabilities: [
      "Direktori karyawan dengan jabatan, departemen, dan manajer",
      "Departemen beserta kepala dan beban kerja",
      "Tim proyek dengan leader dan aktivitas tim",
      "Undang anggota dan ubah peran",
    ],
    route: "/app/teams",
  },
  {
    slug: "chat",
    number: "06",
    name: "Chat",
    tagline: "Komunikasi internal",
    group: "Kolaborasi",
    icon: "message-square",
    summary: "Kanal departemen, kanal proyek, dan pesan langsung agar percakapan tidak tersebar.",
    description:
      "Chat terhubung ke proyek: pesan dapat diubah menjadi tugas, dan aktivitas proyek muncul di kanalnya.",
    capabilities: [
      "Direct message, group chat, kanal proyek, kanal departemen",
      "Balasan, reaksi, mention, lampiran, dan penanda belum dibaca",
      "Cari pesan dalam percakapan",
      "Ubah pesan menjadi tugas",
    ],
    route: "/app/chat",
  },
  {
    slug: "calendar",
    number: "07",
    name: "Kalender",
    tagline: "Jadwal & agenda",
    group: "Kolaborasi",
    icon: "calendar-days",
    summary: "Agenda pribadi, rapat tim, tenggat proyek, dan acara perusahaan dalam satu tampilan.",
    description:
      "Kalender menampilkan enam jenis acara dan tetap mengikuti zona waktu organisasi.",
    capabilities: [
      "Tampilan hari, minggu, bulan, dan agenda",
      "Acara pribadi, rapat tim, tenggat proyek, dan acara perusahaan",
      "Peserta, lokasi, proyek terkait, dan lampiran",
      "Pengingat dalam aplikasi dan filter per jenis acara",
    ],
    route: "/app/calendar",
  },
  {
    slug: "documents",
    number: "08",
    name: "Dokumen",
    tagline: "File & dokumen",
    group: "Kolaborasi",
    icon: "folder-open",
    summary: "Pusat penyimpanan perusahaan dengan folder, versi, dan izin akses.",
    description:
      "Struktur folder mengikuti perusahaan, departemen, proyek, dan pribadi. Akses mengikuti izin organisasi dan folder.",
    capabilities: [
      "Folder company, department, project, dan personal",
      "Unggah, unduh, pratinjau, rename, pindah, dan hapus",
      "Versi dokumen beserta catatan perubahan",
      "Izin akses dan penandaan label",
    ],
    route: "/app/documents",
  },
  {
    slug: "requests",
    number: "09",
    name: "Form & Permintaan",
    tagline: "Pengajuan internal",
    group: "Operasional",
    icon: "file-text",
    summary: "Enam template siap pakai dan form builder untuk kebutuhan internal lainnya.",
    description:
      "Setiap pengajuan melewati alur kerja multi-level: pengirim, atasan, sampai keputusan akhir tercatat.",
    capabilities: [
      "Cut, reimbursement, pembelian, perjalanan dinas, IT support, umum",
      "Form builder: teks, angka, tanggal, dropdown, pilihan, berkas",
      "Validasi di server, bukan hanya di formulir",
      "Status pengajuan dan riwayat keputusan",
    ],
    route: "/app/requests",
  },
  {
    slug: "approvals",
    number: "10",
    name: "Persetujuan",
    tagline: "Approval workflow",
    group: "Operasional",
    icon: "badge-check",
    summary: "Kotak masuk persetujuan dengan multi-level, catatan, dan riwayat lengkap.",
    description:
      "Setiap keputusan menyimpan identitas approver, waktu keputusan, dan catatan. Persetujuan diri sendiri selalu diblokir.",
    capabilities: [
      "Kotak masuk persetujuan dan riwayat",
      "Setujui, tolak, atau minta revisi beserta catatan",
      "Alur multi-level dengan delegasi",
      "Notifikasi dalam aplikasi untuk setiap keputusan",
    ],
    route: "/app/approvals",
  },
  {
    slug: "reports",
    number: "11",
    name: "Laporan",
    tagline: "Laporan kinerja",
    group: "Operasional",
    icon: "bar-chart-3",
    summary: "Tugas, proyek, tim, dan waktu dihitung dari data yang benar-benar ada di workspace.",
    description:
      "Laporan dapat difilter per rentang tanggal, departemen, proyek, dan karyawan, lalu diekspor ke CSV.",
    capabilities: [
      "Analitik tugas: total, selesai, tertunda, terlambat, laju penyelesaian",
      "Analitik proyek: aktif, selesai, terlambat, progres",
      "Beban kerja per anggota dan per departemen",
      "Filter tanggal dan ekspor CSV",
    ],
    route: "/app/reports",
  },
  {
    slug: "settings",
    number: "12",
    name: "Pengaturan",
    tagline: "Konfigurasi organisasi",
    group: "Kelola",
    icon: "settings",
    summary: "Profil, anggota, departemen, role, izin, dan preferensi dalam satu tempat.",
    description:
      "Pengaturan adalah tempat owner dan administrator mengelola struktur dan aturan organisasi.",
    capabilities: [
      "Profil pribadi, keamanan, dan preferensi notifikasi",
      "Profil organisasi, jam kerja, dan zona waktu",
      "Anggota, departemen, role, dan matriks izin",
      "Pengaturan proyek dan alur kerja persetujuan",
    ],
    route: "/app/settings",
  },
];

export const MODULE_GROUPS: ModuleGroup[] = ["Ruang kerja", "Kolaborasi", "Operasional", "Kelola"];

export function moduleBySlug(slug: string) {
  return MODULES.find((module) => module.slug === slug);
}
