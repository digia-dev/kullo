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
    tagline: "Ringkasan pekerjaan hari ini",
    group: "Ruang kerja",
    icon: "layout",
    summary: "Tugas, proyek, agenda, dan keputusan yang menunggu dalam satu layar.",
    description:
      "Dashboard adalah halaman pertama setelah masuk. Isinya mengikuti peran dan izin Anda: staf melihat pekerjaan sendiri, manajer melihat beban tim.",
    capabilities: [
      "Tugas tertunda, jatuh tempo hari ini, terlambat, dan selesai",
      "Progres proyek aktif dan tenggat terdekat",
      "Aktivitas terbaru dari seluruh organisasi",
      "Aksi cepat untuk tugas, proyek, pesan, dokumen, agenda, dan permintaan",
    ],
    route: "/app/dashboard",
  },
  {
    slug: "my-work",
    number: "02",
    name: "My Work",
    tagline: "Daftar kerja pribadi",
    group: "Ruang kerja",
    icon: "check-square",
    summary: "Tugas yang ditugaskan, Anda buat, dan Anda ikuti, dengan filter yang sama di setiap tampilan.",
    description:
      "My Work adalah titik awal hari kerja. Tampilan daftar, papan, dan kalender memakai filter yang sama, dan setiap perubahan masuk ke riwayat aktivitas.",
    capabilities: [
      "Filter Ditugaskan, Dibuat, Diikuti, Selesai, dan Terlambat",
      "Tampilan daftar, papan, dan kalender dari satu sumber data",
      "Prioritas harian, catatan pribadi, dan tenggat terdekat",
      "Ubah status, prioritas, tenggat, komentar, dan lampiran",
    ],
    route: "/app/my-work",
  },
  {
    slug: "projects",
    number: "03",
    name: "Proyek",
    tagline: "Rencana dan progres proyek",
    group: "Ruang kerja",
    icon: "folder-kanban",
    summary: "Setiap proyek punya kode, pemilik, anggota, milestone, dan progres yang dihitung dari status tugas.",
    description:
      "Proyek menyatukan rencana dan pekerjaan. Anda dapat membuka overview, papan, daftar, lini masa, kalender, dan file dari data proyek yang sama.",
    capabilities: [
      "Buat, ubah, duplikat, arsipkan, dan atur anggota proyek",
      "Enam tampilan: overview, papan, daftar, lini masa, kalender, file",
      "Milestone dan tenggat per proyek",
      "Riwayat aktivitas proyek",
    ],
    route: "/app/projects",
  },
  {
    slug: "tasks",
    number: "04",
    name: "Tugas",
    tagline: "Satu pekerjaan, satu catatan",
    group: "Ruang kerja",
    icon: "list-checks",
    summary: "Setiap tugas punya PIC, status, prioritas, tenggat, lampiran, dan diskusi sendiri.",
    description:
      "Tugas adalah unit terkecil di Kullo. Statusnya mengikuti alur proyek, prioritas memakai empat tingkat, dan setiap perubahan tercatat.",
    capabilities: [
      "Alur status dari Backlog sampai Done",
      "Prioritas Urgent, High, Medium, dan Low",
      "Checklist, subtugas, label, lampiran, dan log waktu",
      "Komentar dengan mention dan riwayat aktivitas",
    ],
    route: "/app/tasks",
  },
  {
    slug: "teams",
    number: "05",
    name: "Tim",
    tagline: "Orang dan struktur organisasi",
    group: "Kelola",
    icon: "users",
    summary: "Direktori anggota, departemen, kepala departemen, dan struktur organisasi.",
    description:
      "Struktur organisasi menentukan siapa yang memantau siapa. Data seperti nomor telepon hanya terlihat sesuai izin.",
    capabilities: [
      "Direktori anggota dengan jabatan, departemen, dan manajer",
      "Departemen beserta kepala dan beban kerja",
      "Tim proyek dengan leader dan aktivitas",
      "Undang anggota dan ubah peran",
    ],
    route: "/app/teams",
  },
  {
    slug: "chat",
    number: "06",
    name: "Chat",
    tagline: "Percakapan yang terhubung ke pekerjaan",
    group: "Kolaborasi",
    icon: "message-square",
    summary: "Kanal departemen, kanal proyek, dan pesan langsung agar percakapan tidak tersebar.",
    description:
      "Chat terhubung ke proyek. Pesan dapat diubah menjadi tugas, dan aktivitas proyek muncul di kanalnya.",
    capabilities: [
      "Pesan langsung, grup, kanal proyek, dan kanal departemen",
      "Balasan, reaksi, mention, lampiran, dan penanda belum dibaca",
      "Pencarian pesan dalam percakapan",
      "Ubah pesan menjadi tugas",
    ],
    route: "/app/chat",
  },
  {
    slug: "calendar",
    number: "07",
    name: "Kalender",
    tagline: "Agenda dan tenggat",
    group: "Kolaborasi",
    icon: "calendar-days",
    summary: "Agenda pribadi, rapat tim, tenggat proyek, dan acara perusahaan dalam satu tampilan.",
    description:
      "Kalender menampilkan acara dari beberapa sumber dan mengikuti zona waktu organisasi.",
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
    tagline: "Berkas dengan versi dan izin",
    group: "Kolaborasi",
    icon: "folder-open",
    summary: "Pusat berkas perusahaan dengan folder, versi, dan izin akses.",
    description:
      "Folder mengikuti struktur perusahaan, departemen, proyek, dan pribadi. Akses mengikuti izin organisasi dan folder.",
    capabilities: [
      "Folder perusahaan, departemen, proyek, dan pribadi",
      "Unggah, unduh, pratinjau, ubah nama, pindah, dan hapus",
      "Versi dokumen beserta catatan perubahan",
      "Izin akses dan label",
    ],
    route: "/app/documents",
  },
  {
    slug: "requests",
    number: "09",
    name: "Formulir dan Permintaan",
    tagline: "Pengajuan internal",
    group: "Operasional",
    icon: "file-text",
    summary: "Enam template siap pakai dan pembuat formulir untuk kebutuhan internal lain.",
    description:
      "Setiap pengajuan melewati alur bertingkat: pengirim, atasan, sampai keputusan akhir yang tercatat.",
    capabilities: [
      "Template cuti, reimbursement, pembelian, perjalanan dinas, dukungan IT, dan umum",
      "Pembuat formulir: teks, angka, tanggal, dropdown, pilihan, dan berkas",
      "Validasi di server sebelum data disimpan",
      "Status pengajuan dan riwayat keputusan",
    ],
    route: "/app/requests",
  },
  {
    slug: "approvals",
    number: "10",
    name: "Persetujuan",
    tagline: "Keputusan yang tercatat",
    group: "Operasional",
    icon: "badge-check",
    summary: "Kotak masuk persetujuan dengan alur bertingkat, catatan, dan riwayat lengkap.",
    description:
      "Setiap keputusan menyimpan approver, waktu, dan catatan. Persetujuan atas pengajuan sendiri selalu diblokir.",
    capabilities: [
      "Kotak masuk persetujuan dan riwayat",
      "Setujui, tolak, atau minta revisi dengan catatan",
      "Alur bertingkat dengan delegasi",
      "Notifikasi dalam aplikasi untuk setiap keputusan",
    ],
    route: "/app/approvals",
  },
  {
    slug: "reports",
    number: "11",
    name: "Laporan",
    tagline: "Data kerja untuk keputusan",
    group: "Operasional",
    icon: "bar-chart-3",
    summary: "Tugas, proyek, tim, dan waktu dihitung dari data yang benar-benar ada di ruang kerja.",
    description:
      "Laporan dapat difilter per rentang tanggal, departemen, proyek, dan anggota, lalu diekspor ke CSV.",
    capabilities: [
      "Analitik tugas: total, selesai, tertunda, terlambat, dan laju penyelesaian",
      "Analitik proyek: aktif, selesai, terlambat, dan progres",
      "Beban kerja per anggota dan per departemen",
      "Filter tanggal dan ekspor CSV",
    ],
    route: "/app/reports",
  },
  {
    slug: "settings",
    number: "12",
    name: "Pengaturan",
    tagline: "Aturan organisasi",
    group: "Kelola",
    icon: "settings",
    summary: "Profil, anggota, departemen, peran, izin, dan preferensi dalam satu tempat.",
    description:
      "Pengaturan dipakai pemilik organisasi dan administrator untuk mengelola struktur dan aturan organisasi.",
    capabilities: [
      "Profil pribadi, keamanan, dan preferensi notifikasi",
      "Profil organisasi, jam kerja, dan zona waktu",
      "Anggota, departemen, peran, dan matriks izin",
      "Pengaturan proyek dan alur persetujuan",
    ],
    route: "/app/settings",
  },
];

export const MODULE_GROUPS: ModuleGroup[] = ["Ruang kerja", "Kolaborasi", "Operasional", "Kelola"];

export function moduleBySlug(slug: string) {
  return MODULES.find((module) => module.slug === slug);
}
