import { addDays, format } from "date-fns";
import { db } from "./client";
import {
  activity,
  approvalSteps,
  attachments,
  checklists,
  checklistItems,
  comments,
  conversationMembers,
  conversations,
  departments,
  documents,
  documentVersions,
  eventParticipants,
  events,
  folders,
  formFields,
  formTemplates,
  memberships,
  messageReactions,
  messages,
  milestones,
  notifications,
  organizations,
  plans,
  projectMembers,
  projects,
  projectStatuses,
  requests,
  roles,
  subscriptions,
  taskCollaborators,
  taskLabels,
  taskLabelLinks,
  tasks,
  users,
} from "./schema";
import { todayISO } from "@/lib/utils";
import { hashPassword } from "@/lib/password";
import { DEFAULT_ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/rbac";

function day(offset: number) {
  return format(addDays(new Date(`${todayISO()}T00:00:00+07:00`), offset), "yyyy-MM-dd");
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

function at(date: string, time: string) {
  return `${date}T${time}:00+07:00`;
}

export function seed() {
  db.delete(subscriptions).run();
  db.delete(plans).run();
  db.delete(activity).run();
  db.delete(notifications).run();
  db.delete(messageReactions).run();
  db.delete(messages).run();
  db.delete(conversationMembers).run();
  db.delete(conversations).run();
  db.delete(approvalSteps).run();
  db.delete(requests).run();
  db.delete(formFields).run();
  db.delete(formTemplates).run();
  db.delete(eventParticipants).run();
  db.delete(events).run();
  db.delete(documentVersions).run();
  db.delete(documents).run();
  db.delete(folders).run();
  db.delete(attachments).run();
  db.delete(checklistItems).run();
  db.delete(checklists).run();
  db.delete(comments).run();
  db.delete(taskLabelLinks).run();
  db.delete(taskLabels).run();
  db.delete(taskCollaborators).run();
  db.delete(tasks).run();
  db.delete(milestones).run();
  db.delete(projectStatuses).run();
  db.delete(projectMembers).run();
  db.delete(projects).run();
  db.delete(roles).run();
  db.delete(memberships).run();
  db.delete(departments).run();
  db.delete(users).run();
  db.delete(organizations).run();

  const passwordHash = hashPassword("kullo123");
  const orgId = "org_nusantara";

  db.insert(organizations)
    .values({
      id: orgId,
      name: "Nusantara Digital",
      slug: "nusantara",
      address: "Jl. Prof. Dr. Satrio No. 18, Kuningan, Jakarta Selatan",
      timezone: "Asia/Jakarta",
      workStart: "09:00",
      workEnd: "18:00",
      plan: "business",
    })
    .run();

  const people = [
    ["usr_alya", "Alya Prameswari", "alya@nusantara.id", "Chief Executive Officer", "0812-1100-2211", "#0f6cbd"],
    ["usr_maya", "Maya Kusuma", "maya@nusantara.id", "Head of Marketing", "0812-1100-2212", "#c239b3"],
    ["usr_rizky", "Rizky Pratama", "rizky@nusantara.id", "Head of Technology", "0812-1100-2213", "#038387"],
    ["usr_sinta", "Sinta Dewi", "sinta@nusantara.id", "Sales Lead", "0812-1100-2214", "#107c10"],
    ["usr_fajar", "Fajar Nugroho", "fajar@nusantara.id", "Finance Manager", "0812-1100-2215", "#8a6d00"],
    ["usr_budi", "Budi Santoso", "budi@nusantara.id", "Product Designer", "0812-1100-2216", "#8764b8"],
    ["usr_nadia", "Nadia Rahmawati", "nadia@nusantara.id", "Content Strategist", "0812-1100-2217", "#ca5010"],
    ["usr_dimas", "Dimas Saputra", "dimas@agencymitra.id", "External Brand Partner", "0812-1100-2218", "#498205"],
  ] as const;

  for (const [id, name, email, title, phone, color] of people) {
    db.insert(users).values({ id, name, email, passwordHash, title, phone, avatarColor: color }).run();
  }

  const depts = [
    ["dep_people", "People & Ops", "usr_alya", "#8764b8"],
    ["dep_marketing", "Marketing", "usr_maya", "#c239b3"],
    ["dep_tech", "Technology", "usr_rizky", "#0f6cbd"],
    ["dep_sales", "Sales", "usr_sinta", "#107c10"],
    ["dep_finance", "Finance", "usr_fajar", "#8a6d00"],
  ] as const;
  for (const [id, name, head, color] of depts) {
    db.insert(departments).values({ id, orgId, name, headUserId: head, color }).run();
  }

  const members = [
    ["mem_alya", "usr_alya", "owner", "dep_people", null],
    ["mem_maya", "usr_maya", "manager", "dep_marketing", "usr_alya"],
    ["mem_rizky", "usr_rizky", "manager", "dep_tech", "usr_alya"],
    ["mem_sinta", "usr_sinta", "leader", "dep_sales", "usr_alya"],
    ["mem_fajar", "usr_fajar", "manager", "dep_finance", "usr_alya"],
    ["mem_budi", "usr_budi", "staff", "dep_tech", "usr_rizky"],
    ["mem_nadia", "usr_nadia", "staff", "dep_marketing", "usr_maya"],
    ["mem_dimas", "usr_dimas", "guest", "dep_marketing", "usr_maya"],
  ] as const;
  for (const [id, userId, role, departmentId, managerId] of members) {
    db.insert(memberships)
      .values({ id, orgId, userId, role, departmentId, managerId, status: "active" })
      .run();
  }

  for (const key of ["owner", "admin", "manager", "leader", "staff", "guest"]) {
    db.insert(roles)
      .values({
        id: `role_${key}`,
        orgId,
        key,
        name: ROLE_LABELS[key],
        permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS[key]),
        system: true,
      })
      .run();
  }

  const projectRows = [
    {
      id: "prj_kullo",
      code: "KUL-01",
      name: "Peluncuran Kullo 1.0",
      description:
        "Merilis workspace pertama Kullo: autentikasi, organisasi, proyek, tugas, dan alur persetujuan dasar untuk 30 organisasi beta.",
      departmentId: "dep_tech",
      managerId: "usr_rizky",
      ownerId: "usr_alya",
      status: "active",
      priority: "high",
      startDate: day(-33),
      dueDate: day(34),
      progress: 62,
      members: ["usr_alya", "usr_rizky", "usr_budi", "usr_maya", "usr_nadia"],
    },
    {
      id: "prj_campaign",
      code: "MKT-04",
      name: "Kampanye Q4",
      description:
        "Kampanye peluncuran kuartal keempat: cerita pelanggan, webinar, dan konten mingguan untuk tim operasional.",
      departmentId: "dep_marketing",
      managerId: "usr_maya",
      ownerId: "usr_maya",
      status: "active",
      priority: "medium",
      startDate: day(-19),
      dueDate: day(27),
      progress: 45,
      members: ["usr_maya", "usr_nadia", "usr_budi", "usr_dimas"],
    },
    {
      id: "prj_crm",
      code: "SLS-02",
      name: "Migrasi CRM Sales",
      description:
        "Memindahkan pipeline, kontak, dan riwayat aktivitas dari spreadsheet ke CRM baru tanpa kehilangan konteks.",
      departmentId: "dep_sales",
      managerId: "usr_sinta",
      ownerId: "usr_alya",
      status: "planning",
      priority: "high",
      startDate: day(-7),
      dueDate: day(73),
      progress: 18,
      members: ["usr_alya", "usr_sinta"],
    },
    {
      id: "prj_finance",
      code: "FIN-07",
      name: "Penutupan Buku 2026",
      description:
        "Rekonsiliasi, jurnal penyesuaian, dan anggaran 2027. Ditahan sampai data bank November lengkap.",
      departmentId: "dep_finance",
      managerId: "usr_fajar",
      ownerId: "usr_alya",
      status: "on_hold",
      priority: "medium",
      startDate: day(7),
      dueDate: day(84),
      progress: 30,
      members: ["usr_alya", "usr_fajar"],
    },
    {
      id: "prj_portal",
      code: "KUL-09",
      name: "Portal Klien",
      description: "Portal baca-saja agar klien dapat melihat progres proyek dan dokumen yang dibagikan.",
      departmentId: "dep_tech",
      managerId: "usr_rizky",
      ownerId: "usr_alya",
      status: "completed",
      priority: "medium",
      startDate: day(-98),
      dueDate: day(-9),
      progress: 100,
      members: ["usr_rizky", "usr_budi"],
    },
    {
      id: "prj_onboarding",
      code: "OPS-03",
      name: "Onboarding Karyawan Baru",
      description:
        "Menyiapkan handbook, jadwal orientasi, dan buddy system untuk tiga karyawan yang bergabung bulan ini.",
      departmentId: "dep_people",
      managerId: "usr_alya",
      ownerId: "usr_alya",
      status: "active",
      priority: "low",
      startDate: day(-24),
      dueDate: day(22),
      progress: 55,
      members: ["usr_alya", "usr_maya", "usr_nadia"],
    },
  ];

  for (const p of projectRows) {
    db.insert(projects)
      .values({
        id: p.id,
        orgId,
        departmentId: p.departmentId,
        code: p.code,
        name: p.name,
        description: p.description,
        ownerId: p.ownerId,
        managerId: p.managerId,
        status: p.status,
        priority: p.priority,
        startDate: p.startDate,
        dueDate: p.dueDate,
        progress: p.progress,
      })
      .run();
    for (const userId of p.members) {
      db.insert(projectMembers).values({ projectId: p.id, userId, role: userId === p.managerId ? "manager" : "member" }).run();
    }
    const statuses = [
      ["backlog", "Backlog", "open"],
      ["todo", "To Do", "open"],
      ["progress", "In Progress", "active"],
      ["review", "In Review", "review"],
      ["done", "Done", "done"],
    ] as const;
    statuses.forEach(([slug, name, category], index) => {
      db.insert(projectStatuses)
        .values({ id: `st_${p.id}_${slug}`, projectId: p.id, name, position: index, category })
        .run();
    });
  }

  const milestoneRows = [
    ["prj_kullo", "Beta tertutup siap", day(23)],
    ["prj_kullo", "Peluncuran publik", day(34)],
    ["prj_campaign", "Webinar pelanggan", day(18)],
    ["prj_crm", "Data lama bersih", day(40)],
    ["prj_portal", "Serah terima klien", day(-9)],
  ] as const;
  milestoneRows.forEach(([projectId, name, dueDate], index) => {
    db.insert(milestones)
      .values({ id: `ms_${index + 1}`, projectId, name, dueDate, done: index === 4, position: index })
      .run();
  });

  const labelRows = [
    ["lbl_design", "design", "#8764b8"],
    ["lbl_backend", "backend", "#038387"],
    ["lbl_content", "content", "#c239b3"],
    ["lbl_ops", "operations", "#8a6d00"],
    ["lbl_research", "research", "#107c10"],
  ] as const;
  for (const [id, name, color] of labelRows) {
    db.insert(taskLabels).values({ id, orgId, name, color }).run();
  }

  type TaskRow = {
    id: string;
    project: string;
    title: string;
    status: string;
    priority: string;
    assignee: string | null;
    reporter: string;
    due: string;
    start?: string;
    estimate?: number;
    description?: string;
    labels?: string[];
    collaborators?: string[];
  };

  const taskRows: TaskRow[] = [
    { id: "tsk_01", project: "prj_kullo", title: "Finalisasi alur onboarding organisasi", status: "progress", priority: "high", assignee: "usr_rizky", reporter: "usr_alya", due: day(4), start: day(-6), estimate: 16, description: "Pastikan pengguna baru bisa membuat organisasi, mengundang dua anggota, dan membuat proyek pertama tanpa bantuan.", labels: ["lbl_backend", "lbl_research"] },
    { id: "tsk_02", project: "prj_kullo", title: "Desain ulang halaman harga", status: "review", priority: "medium", assignee: "usr_budi", reporter: "usr_rizky", due: day(2), start: day(-5), estimate: 8, description: "Tiga paket, tanpa angka karangan. Tampilkan batas anggota dan proyek secara jujur.", labels: ["lbl_design"] },
    { id: "tsk_03", project: "prj_kullo", title: "Uji isolasi data antarorganisasi", status: "todo", priority: "urgent", assignee: "usr_rizky", reporter: "usr_alya", due: day(10), estimate: 12, description: "Setiap query produk harus memakai org_id dari sesi. Uji akses lintas organisasi pada tugas, dokumen, dan pesan.", labels: ["lbl_backend"] },
    { id: "tsk_04", project: "prj_kullo", title: "Tulis panduan 5 menit pertama", status: "progress", priority: "medium", assignee: "usr_nadia", reporter: "usr_maya", due: day(6), start: day(-3), estimate: 5, description: "Satu halaman: membuat proyek, menugaskan tugas, memindahkan status, dan mengundang anggota.", labels: ["lbl_content"] },
    { id: "tsk_05", project: "prj_kullo", title: "Audit aksesibilitas sidebar", status: "backlog", priority: "low", assignee: "usr_budi", reporter: "usr_rizky", due: day(17), estimate: 4, description: "Fokus keyboard, kontras label, dan ukuran target sentuh di 390px.", labels: ["lbl_design"] },
    { id: "tsk_06", project: "prj_kullo", title: "Rilis beta tertutup", status: "todo", priority: "high", assignee: "usr_rizky", reporter: "usr_alya", due: day(23), estimate: 6, collaborators: ["usr_alya", "usr_maya"], description: "Kirim undangan ke 30 organisasi, siapkan kanal umpan balik, dan jadwalkan sesi pendampingan." },
    { id: "tsk_07", project: "prj_kullo", title: "Siapkan environment demo", status: "done", priority: "medium", assignee: "usr_rizky", reporter: "usr_alya", due: day(-7), estimate: 3 },
    { id: "tsk_08", project: "prj_kullo", title: "Checklist rilis App Router", status: "done", priority: "low", assignee: "usr_budi", reporter: "usr_rizky", due: day(-11), estimate: 2 },
    { id: "tsk_09", project: "prj_campaign", title: "Kalender konten November", status: "progress", priority: "medium", assignee: "usr_nadia", reporter: "usr_maya", due: day(0), start: day(-4), estimate: 4, description: "Dua belas slot konten, satu cerita pelanggan per minggu, dan pengingat webinar.", labels: ["lbl_content"] },
    { id: "tsk_10", project: "prj_campaign", title: "Landing page studi kasus", status: "review", priority: "high", assignee: "usr_budi", reporter: "usr_maya", due: day(-2), start: day(-9), estimate: 10, description: "Halaman studi kasus dengan angka yang bisa diverifikasi. Jangan mengarang metrik.", labels: ["lbl_design", "lbl_content"], collaborators: ["usr_nadia", "usr_dimas"] },
    { id: "tsk_11", project: "prj_campaign", title: "Aset kampanye LinkedIn", status: "todo", priority: "medium", assignee: "usr_nadia", reporter: "usr_maya", due: day(7), estimate: 6, labels: ["lbl_content"] },
    { id: "tsk_12", project: "prj_campaign", title: "Brief webinar pelanggan", status: "backlog", priority: "low", assignee: "usr_maya", reporter: "usr_maya", due: day(12), estimate: 3, labels: ["lbl_content"] },
    { id: "tsk_13", project: "prj_campaign", title: "Laporan performa Oktober", status: "done", priority: "medium", assignee: "usr_maya", reporter: "usr_alya", due: day(-5), estimate: 2 },
    { id: "tsk_14", project: "prj_crm", title: "Pemetaan pipeline lama", status: "progress", priority: "high", assignee: "usr_sinta", reporter: "usr_alya", due: day(6), start: day(-5), estimate: 14, description: "Petakan 6 tahap pipeline lama ke tahap baru. Tandai kontak tanpa pemilik.", labels: ["lbl_research"] },
    { id: "tsk_15", project: "prj_crm", title: "Bersihkan 1.240 kontak duplikat", status: "todo", priority: "medium", assignee: "usr_sinta", reporter: "usr_sinta", due: day(14), estimate: 9 },
    { id: "tsk_16", project: "prj_crm", title: "Pilih vendor integrasi", status: "backlog", priority: "high", assignee: "usr_alya", reporter: "usr_sinta", due: day(22), estimate: 5 },
    { id: "tsk_17", project: "prj_crm", title: "Uji coba impor kontak", status: "backlog", priority: "low", assignee: "usr_sinta", reporter: "usr_sinta", due: day(32), estimate: 4 },
    { id: "tsk_18", project: "prj_finance", title: "Rekonsiliasi bank November", status: "todo", priority: "high", assignee: "usr_fajar", reporter: "usr_alya", due: day(27), estimate: 12, labels: ["lbl_ops"] },
    { id: "tsk_19", project: "prj_finance", title: "Template jurnal penyesuaian", status: "progress", priority: "medium", assignee: "usr_fajar", reporter: "usr_fajar", due: day(20), start: day(-2), estimate: 6, labels: ["lbl_ops"] },
    { id: "tsk_20", project: "prj_finance", title: "Review anggaran 2027", status: "backlog", priority: "medium", assignee: "usr_alya", reporter: "usr_fajar", due: day(37), estimate: 8 },
    { id: "tsk_21", project: "prj_portal", title: "Rilis portal klien v1", status: "done", priority: "medium", assignee: "usr_budi", reporter: "usr_rizky", due: day(-14), estimate: 10 },
    { id: "tsk_22", project: "prj_portal", title: "Dokumentasi handover", status: "done", priority: "low", assignee: "usr_rizky", reporter: "usr_budi", due: day(-11), estimate: 3 },
    { id: "tsk_23", project: "prj_onboarding", title: "Perbarui handbook karyawan", status: "review", priority: "medium", assignee: "usr_maya", reporter: "usr_alya", due: day(1), start: day(-8), estimate: 7, labels: ["lbl_content"] },
    { id: "tsk_24", project: "prj_onboarding", title: "Jadwal sesi orientasi Desember", status: "todo", priority: "low", assignee: "usr_alya", reporter: "usr_alya", due: day(12), estimate: 2 },
    { id: "tsk_25", project: "prj_onboarding", title: "Survei pengalaman onboarding", status: "progress", priority: "medium", assignee: "usr_nadia", reporter: "usr_maya", due: day(4), start: day(-2), estimate: 5, labels: ["lbl_research"] },
  ];

  const statusMap: Record<string, string> = {
    backlog: "backlog",
    todo: "todo",
    progress: "progress",
    review: "review",
    done: "done",
  };

  taskRows.forEach((t, index) => {
    const statusSlug = statusMap[t.status] ?? "todo";
    db.insert(tasks)
      .values({
        id: t.id,
        orgId,
        projectId: t.project,
        number: index + 1,
        title: t.title,
        description: t.description ?? null,
        statusId: `st_${t.project}_${statusSlug}`,
        priority: t.priority,
        assigneeId: t.assignee,
        reporterId: t.reporter,
        startDate: t.start ?? null,
        dueDate: t.due,
        estimateHours: t.estimate ?? null,
        createdAt: hoursAgo(200 - index * 5),
        updatedAt: hoursAgo(index + 1),
      })
      .run();
    if (t.assignee) {
      db.insert(taskCollaborators).values({ taskId: t.id, userId: t.assignee }).run();
    }
    for (const userId of t.collaborators ?? []) {
      db.insert(taskCollaborators).values({ taskId: t.id, userId }).run();
    }
    for (const labelId of t.labels ?? []) {
      db.insert(taskLabelLinks).values({ taskId: t.id, labelId }).run();
    }
  });

  const cl = (id: string, taskId: string, items: Array<[string, boolean]>) => {
    db.insert(checklists).values({ id, taskId }).run();
    items.forEach(([text, done], position) => {
      db.insert(checklistItems)
        .values({ id: `${id}_${position}`, checklistId: id, text, done, position })
        .run();
    });
  };
  cl("chk_01", "tsk_01", [
    ["Form register + buat organisasi", true],
    ["Undangan anggota dengan peran", false],
    ["Proyek pertama otomatis dibuat", false],
    ["Toast dan empty state diperiksa", false],
  ]);
  cl("chk_03", "tsk_03", [
    ["Query tugas memakai org_id", true],
    ["Dokumen dan pesan dicek", false],
    ["Uji dua organisasi paralel", false],
  ]);
  cl("chk_09", "tsk_09", [
    ["Dua belas slot terisi", true],
    ["Cerita pelanggan (yang sudah setuju)", false],
    ["Aset visual siap", false],
  ]);

  const commentRows = [
    ["cmt_01", "tsk_01", "usr_alya", "Untuk onboarding, tahan dulu fitur undangan massal. Satu per satu lebih jelas untuk beta.", 30],
    ["cmt_02", "tsk_01", "usr_rizky", "@Alya Prameswari setuju. Saya sudah pasang validasi email dan peran di server, bukan hanya di form.", 26],
    ["cmt_03", "tsk_01", "usr_budi", "Empty state untuk anggota baru sudah saya rapikan. Screenshot ada di dokumen proyek.", 20],
    ["cmt_04", "tsk_02", "usr_rizky", "Halaman harga pakai label â€œHubungi kamiâ€ untuk Pro dan Business, karena harga belum ditetapkan.", 18],
    ["cmt_05", "tsk_02", "usr_maya", "Copy-nya sudah saya baca. Tolong jangan tambahkan angka pengguna atau testimoni yang belum ada.", 12],
    ["cmt_06", "tsk_09", "usr_nadia", "Slot 8 dan 12 masih kosong. Saya butuh konfirmasi topik webinar sebelum mengisi.", 8],
    ["cmt_07", "tsk_09", "usr_maya", "Isi dengan panduan 5 menit dan alur persetujuan. Dua-duanya sudah bisa dipakai di produk.", 5],
    ["cmt_08", "tsk_10", "usr_dimas", "Aset brand dari sisi mitra sudah masuk. Jangan pakai foto stok tanpa izin.", 4],
    ["cmt_09", "tsk_23", "usr_alya", "Handbook versi baru harus mencantumkan jam kerja dan kanal bantuan yang benar.", 3],
  ] as const;
  for (const [id, taskId, authorId, body, hours] of commentRows) {
    db.insert(comments).values({ id, taskId, authorId, body, createdAt: hoursAgo(hours) }).run();
  }

  db.insert(attachments)
    .values([
      { id: "att_01", orgId, taskId: "tsk_01", name: "onboarding-flow.pdf", kind: "pdf", size: 420_000 },
      { id: "att_02", orgId, taskId: "tsk_02", name: "harga-desktop.png", kind: "png", size: 780_000 },
      { id: "att_03", orgId, taskId: "tsk_10", name: "studi-kasus-brief.docx", kind: "docx", size: 96_000 },
    ])
    .run();

  const convRows = [
    ["cnv_umum", "channel", "umum", "Pengumuman dan percakapan lintas tim", null, null],
    ["cnv_kullo", "project", "peluncuran-kullo", "Kanal proyek Peluncuran Kullo 1.0", "prj_kullo", "dep_tech"],
    ["cnv_marketing", "department", "marketing", "Koordinasi tim Marketing", null, "dep_marketing"],
    ["cnv_dm_am", "dm", "Alya Prameswari", "Percakapan langsung", null, null],
  ] as const;
  for (const [id, kind, name, description, projectId, departmentId] of convRows) {
    db.insert(conversations).values({ id, orgId, kind, name, description, projectId, departmentId }).run();
  }

  const membershipsFor: Record<string, string[]> = {
    cnv_umum: people.map((p) => p[0]),
    cnv_kullo: ["usr_alya", "usr_rizky", "usr_budi", "usr_nadia"],
    cnv_marketing: ["usr_maya", "usr_nadia", "usr_dimas"],
    cnv_dm_am: ["usr_alya", "usr_maya"],
  };
  for (const [conversationId, userIds] of Object.entries(membershipsFor)) {
    for (const userId of userIds) {
      db.insert(conversationMembers).values({ conversationId, userId }).run();
    }
  }

  const msgRows = [
    ["msg_01", "cnv_umum", "usr_alya", "Selamat pagi. Mulai minggu ini, update proyek cukup di Kullo. Tidak perlu thread email terpisah.", 46],
    ["msg_02", "cnv_umum", "usr_maya", "Siap. Tim Marketing sudah memindahkan kalender konten ke proyek Kampanye Q4.", 44],
    ["msg_03", "cnv_umum", "usr_rizky", "Reminder: sprint review Kullo 1.0 hari Selasa jam 10. Agenda ada di kalender.", 41],
    ["msg_04", "cnv_umum", "usr_fajar", "Untuk penggantian biaya, mohon lampirkan bukti transfer di form. Prosesnya jadi lebih cepat.", 39],
    ["msg_05", "cnv_umum", "usr_nadia", "Handbook baru sudah masuk review. Tolong cek bagian jam kerja dan kanal bantuan.", 30],
    ["msg_06", "cnv_umum", "usr_budi", "Aset desain kampanye saya taruh di folder Marketing. Versi final ditandai v3.", 24],
    ["msg_07", "cnv_kullo", "usr_rizky", "Isolasi data sudah saya uji untuk tugas dan proyek. Dokumen dan pesan menyusul hari ini.", 10],
    ["msg_08", "cnv_kullo", "usr_budi", "Halaman harga versi review sudah bisa dilihat. Fokusnya ke batas anggota dan proyek, tanpa angka karangan.", 8],
    ["msg_09", "cnv_kullo", "usr_alya", "Bagus. Jangan tambahkan testimoni sebelum ada pelanggan yang benar-benar setuju namanya dicantumkan.", 7],
    ["msg_10", "cnv_kullo", "usr_nadia", "Panduan 5 menit saya tulis berdasarkan alur yang sudah jalan, bukan fitur roadmap.", 5],
    ["msg_11", "cnv_marketing", "usr_maya", "Webinar kita butuh tanggal final. Usulan: 26 November, jam 14.00 WIB.", 12],
    ["msg_12", "cnv_marketing", "usr_nadia", "Bisa. Saya siapkan halaman pendaftaran dan tiga email pengingat?", 11],
    ["msg_13", "cnv_marketing", "usr_dimas", "Untuk aset mitra, saya kirim versi transparan sore ini.", 9],
    ["msg_14", "cnv_dm_am", "usr_maya", "Alya, untuk cuti Nadia tanggal 20â€“22, saya sudah review. Saya teruskan ke People & Ops.", 6],
    ["msg_15", "cnv_dm_am", "usr_alya", "Terima kasih. Pastikan handover konten November tercatat di tugasnya.", 5],
  ] as const;
  for (const [id, conversationId, authorId, body, hours] of msgRows) {
    db.insert(messages).values({ id, conversationId, authorId, body, createdAt: hoursAgo(hours) }).run();
  }
  db.insert(messageReactions).values([
    { messageId: "msg_01", userId: "usr_maya", emoji: "ðŸ‘" },
    { messageId: "msg_01", userId: "usr_rizky", emoji: "ðŸ‘" },
    { messageId: "msg_03", userId: "usr_budi", emoji: "ðŸ‘€" },
    { messageId: "msg_10", userId: "usr_alya", emoji: "ðŸŽ‰" },
  ]).run();

  const folderRows = [
    ["fld_company", "Company", "company", null],
    ["fld_marketing", "Marketing", "department", "dep_marketing"],
    ["fld_tech", "Technology", "department", "dep_tech"],
    ["fld_finance", "Finance", "department", "dep_finance"],
    ["fld_people", "People & Ops", "department", "dep_people"],
  ] as const;
  for (const [id, name, scope, departmentId] of folderRows) {
    db.insert(folders).values({ id, orgId, name, scope, departmentId }).run();
  }

  const docRows = [
    ["doc_handbook", "Company Handbook 2026.pdf", "pdf", 2_420_000, 3, "usr_alya", "company", "fld_company", null],
    ["doc_brand", "Brand Guidelines.pdf", "pdf", 8_100_000, 2, "usr_maya", "company", "fld_marketing", null],
    ["doc_brief", "Kampanye Q4 â€” Brief.docx", "docx", 640_000, 1, "usr_maya", "project", "fld_marketing", "prj_campaign"],
    ["doc_spec", "Kullo 1.0 â€” Product Spec.pdf", "pdf", 1_800_000, 2, "usr_rizky", "project", "fld_tech", "prj_kullo"],
    ["doc_arch", "Arsitektur Data v2.md", "md", 84_000, 2, "usr_rizky", "department", "fld_tech", null],
    ["doc_budget", "Anggaran 2027 â€” Draft.xlsx", "xlsx", 420_000, 1, "usr_fajar", "company", "fld_finance", null],
    ["doc_onboard", "Template Onboarding.pptx", "pptx", 5_200_000, 1, "usr_alya", "department", "fld_people", null],
    ["doc_leave", "Rekap Cuti 2026.csv", "csv", 96_000, 1, "usr_alya", "company", "fld_people", null],
  ] as const;
  for (const [id, name, kind, size, version, ownerId, visibility, folderId, projectId] of docRows) {
    db.insert(documents)
      .values({ id, orgId, name, kind, size, version, ownerId, visibility, folderId, projectId, createdAt: hoursAgo(300) })
      .run();
  }
  const versionRows = [
    ["dv_1", "doc_handbook", 1, "Versi awal 2026", 240],
    ["dv_2", "doc_handbook", 2, "Revisi jam kerja", 120],
    ["dv_3", "doc_handbook", 3, "Tambahan kanal bantuan", 40],
    ["dv_4", "doc_spec", 1, "Draft awal", 200],
    ["dv_5", "doc_spec", 2, "Persetujuan beta", 60],
  ] as const;
  for (const [id, documentId, version, note, hours] of versionRows) {
    db.insert(documentVersions)
      .values({ id, documentId, version, note, authorId: "usr_alya", createdAt: hoursAgo(hours) })
      .run();
  }

  const eventRows = [
    ["evt_01", "Sprint review Kullo 1.0", "meeting", day(2), "10:00", "11:00", "Ruang Garuda", "prj_kullo", "usr_rizky"],
    ["evt_02", "Sinkron kampanye Q4", "meeting", day(0), "14:00", "14:30", "Google Meet", "prj_campaign", "usr_maya"],
    ["evt_03", "1:1 Alya & Maya", "personal", day(1), "09:30", "10:00", "Ruang Merapi", null, "usr_alya"],
    ["evt_04", "Townhall November", "company", day(6), "15:00", "16:00", "Auditorium", null, "usr_alya"],
    ["evt_05", "Batas laporan performa Oktober", "deadline", day(-2), "00:00", "23:59", null, "prj_campaign", "usr_maya"],
    ["evt_06", "Demo beta untuk calon pelanggan", "meeting", day(10), "13:00", "14:00", "Google Meet", "prj_kullo", "usr_alya"],
    ["evt_07", "Deadline penutupan buku", "deadline", day(27), "00:00", "23:59", null, "prj_finance", "usr_fajar"],
    ["evt_08", "Orientasi karyawan baru", "company", day(12), "09:00", "12:00", "Ruang Flores", "prj_onboarding", "usr_alya"],
  ] as const;
  for (const [id, title, kind, date, start, end, location, projectId, createdBy] of eventRows) {
    db.insert(events)
      .values({
        id,
        orgId,
        title,
        kind,
        startsAt: at(date, start),
        endsAt: at(date, end),
        allDay: start === "00:00",
        location,
        projectId,
        createdBy,
      })
      .run();
  }
  const participants: Array<[string, string]> = [
    ["evt_01", "usr_alya"], ["evt_01", "usr_rizky"], ["evt_01", "usr_budi"], ["evt_01", "usr_nadia"],
    ["evt_02", "usr_maya"], ["evt_02", "usr_nadia"], ["evt_02", "usr_dimas"],
    ["evt_03", "usr_alya"], ["evt_03", "usr_maya"],
    ["evt_04", "usr_alya"], ["evt_04", "usr_maya"], ["evt_04", "usr_rizky"], ["evt_04", "usr_sinta"], ["evt_04", "usr_fajar"], ["evt_04", "usr_budi"], ["evt_04", "usr_nadia"],
    ["evt_06", "usr_alya"], ["evt_06", "usr_rizky"],
    ["evt_08", "usr_alya"], ["evt_08", "usr_maya"],
  ];
  for (const [eventId, userId] of participants) {
    db.insert(eventParticipants).values({ eventId, userId }).run();
  }

  const templates = [
    ["tpl_cuti", "cuti", "Permintaan Cuti", "Ajukan cuti tahunan, sakit, atau izin darurat.", "leave", [
      ["Jenis cuti", "select", true, ["Cuti tahunan", "Sakit", "Izin darurat"]],
      ["Tanggal mulai", "date", true, null],
      ["Tanggal selesai", "date", true, null],
      ["Alasan", "textarea", true, null],
    ]],
    ["tpl_reimb", "reimbursement", "Penggantian biaya", "Klaim biaya operasional dengan bukti transaksi.", "finance", [
      ["Tanggal transaksi", "date", true, null],
      ["Kategori", "select", true, ["Perjalanan", "Konsumsi", "Peralatan", "Lainnya"]],
      ["Jumlah (IDR)", "number", true, null],
      ["Deskripsi", "textarea", true, null],
    ]],
    ["tpl_beli", "purchase", "Permintaan pembelian", "Ajukan pembelian barang atau jasa.", "finance", [
      ["Item", "text", true, null],
      ["Jumlah (IDR)", "number", true, null],
      ["Vendor", "text", false, null],
      ["Urgensi", "select", true, ["Rendah", "Sedang", "Tinggi"]],
      ["Justifikasi", "textarea", true, null],
    ]],
    ["tpl_trip", "business-trip", "Perjalanan dinas", "Rencanakan perjalanan dinas dan estimasi biayanya.", "operations", [
      ["Tujuan", "text", true, null],
      ["Tanggal berangkat", "date", true, null],
      ["Durasi (hari)", "number", true, null],
      ["Estimasi biaya (IDR)", "number", true, null],
    ]],
    ["tpl_it", "it-support", "Dukungan IT", "Laporkan gangguan perangkat atau akses.", "operations", [
      ["Kategori", "select", true, ["Perangkat", "Akses", "Jaringan", "Lainnya"]],
      ["Deskripsi", "textarea", true, null],
      ["Prioritas", "select", true, ["Rendah", "Sedang", "Tinggi"]],
    ]],
    ["tpl_umum", "general", "Permintaan umum", "Permintaan umum yang tidak masuk kategori lain.", "general", [
      ["Subjek", "text", true, null],
      ["Detail", "textarea", true, null],
    ]],
  ] as const;
  for (const [id, key, name, description, category, fields] of templates) {
    db.insert(formTemplates).values({ id, orgId, key, name, description, category }).run();
    fields.forEach((field, index) => {
      const [label, type, required, options] = field;
      db.insert(formFields)
        .values({
          id: `${id}_f${index}`,
          templateId: id,
          label,
          type,
          required,
          options: options ? JSON.stringify(options) : null,
          position: index,
        })
        .run();
    });
  }

  const reqRows = [
    ["req_01", "tpl_cuti", "usr_nadia", "Cuti tahunan â€” 20â€“22 November", null, JSON.stringify({ "Jenis cuti": "Cuti tahunan", "Tanggal mulai": day(12), "Tanggal selesai": day(14), Alasan: "Acara keluarga di Yogyakarta." }), "pending", 1, 20],
    ["req_02", "tpl_reimb", "usr_budi", "Penggantian biaya transport klien", 850_000, JSON.stringify({ "Tanggal transaksi": day(-3), Kategori: "Perjalanan", "Jumlah (IDR)": 850000, Deskripsi: "Transport ke kantor klien Bandung, dua perjalanan." }), "pending", 2, 26],
    ["req_03", "tpl_beli", "usr_maya", "Pembelian laptop desain", 18_500_000, JSON.stringify({ Item: "Laptop 32GB RAM", "Jumlah (IDR)": 18500000, Vendor: "Mitra Teknologi", Urgensi: "Sedang", Justifikasi: "Penggantian perangkat tim desain yang sudah 5 tahun." }), "approved", 1, 72],
    ["req_04", "tpl_trip", "usr_sinta", "Perjalanan dinas Surabaya", 4_200_000, JSON.stringify({ Tujuan: "Surabaya", "Tanggal berangkat": day(18), "Durasi (hari)": 2, "Estimasi biaya (IDR)": 4200000 }), "revision", 1, 50],
    ["req_05", "tpl_it", "usr_nadia", "Akses ke folder brand", null, JSON.stringify({ Kategori: "Akses", Deskripsi: "Butuh akses edit ke folder Brand Guidelines untuk memperbarui aset kampanye.", Prioritas: "Sedang" }), "submitted", 1, 9],
  ] as const;
  for (const [id, templateId, requesterId, title, amount, data, status, currentStep, hours] of reqRows) {
    db.insert(requests)
      .values({
        id,
        orgId,
        templateId,
        requesterId,
        title,
        amount,
        data,
        status,
        currentStep,
        createdAt: hoursAgo(hours),
        updatedAt: hoursAgo(Math.max(hours - 4, 1)),
      })
      .run();
  }

  db.insert(approvalSteps)
    .values([
      { id: "aps_01", requestId: "req_01", position: 1, approverId: "usr_maya", status: "pending" },
      { id: "aps_02", requestId: "req_02", position: 1, approverId: "usr_rizky", status: "approved", note: "Bukti sesuai.", decidedAt: hoursAgo(20) },
      { id: "aps_03", requestId: "req_02", position: 2, approverId: "usr_fajar", status: "pending" },
      { id: "aps_04", requestId: "req_03", position: 1, approverId: "usr_alya", status: "approved", note: "Disetujui, anggaran perangkat tersedia.", decidedAt: hoursAgo(48) },
      { id: "aps_05", requestId: "req_04", position: 1, approverId: "usr_alya", status: "revision", note: "Lampirkan rincian biaya hotel dan transport.", decidedAt: hoursAgo(30) },
      { id: "aps_06", requestId: "req_05", position: 1, approverId: "usr_rizky", status: "pending" },
    ])
    .run();

  db.insert(plans)
    .values([
      { id: "plan_free", key: "free", name: "Free", memberLimit: 5, projectLimit: 3, features: JSON.stringify(["1 organisasi", "5 anggota", "3 proyek", "Kanban dan list", "Chat dasar"]) },
      { id: "plan_pro", key: "pro", name: "Pro", memberLimit: 25, projectLimit: null, features: JSON.stringify(["1 organisasi", "25 anggota", "Proyek tanpa batas", "Chat penuh", "Laporan lanjutan", "Persetujuan lanjutan"]) },
      { id: "plan_business", key: "business", name: "Business", memberLimit: null, projectLimit: null, features: JSON.stringify(["Organisasi tanpa batas", "Anggota sesuai kebutuhan", "Proyek tanpa batas", "Dukungan prioritas", "Kontrol izin lanjutan"]) },
    ])
    .run();

  db.insert(subscriptions)
    .values({ id: "sub_01", orgId, planId: "plan_business", status: "active", renewsAt: day(52) })
    .run();

  const activities = [
    ["act_01", "usr_nadia", "task", "tsk_09", "mengubah status", "Kalender konten November â†’ In Progress", 3],
    ["act_02", "usr_budi", "task", "tsk_10", "mengunggah lampiran", "studi-kasus-brief.docx", 4],
    ["act_03", "usr_maya", "comment", "tsk_09", "berkomentar", "Isi dengan panduan 5 menit dan alur persetujuan.", 5],
    ["act_04", "usr_rizky", "task", "tsk_01", "memperbarui", "Checklist onboarding: 1 dari 4 selesai", 6],
    ["act_05", "usr_alya", "request", "req_03", "menyetujui", "Pembelian laptop desain", 8],
    ["act_06", "usr_sinta", "project", "prj_crm", "menambahkan anggota", "Alya Prameswari ke Migrasi CRM Sales", 12],
    ["act_07", "usr_fajar", "request", "req_02", "meneruskan", "Penggantian biaya transport klien ke level 2", 20],
    ["act_08", "usr_dimas", "document", "doc_brand", "mengunggah versi", "Brand Guidelines v2", 26],
    ["act_09", "usr_maya", "event", "evt_02", "membuat agenda", "Sinkron kampanye Q4", 30],
    ["act_10", "usr_budi", "task", "tsk_05", "membuat tugas", "Audit aksesibilitas sidebar", 34],
  ] as const;
  for (const [id, actorId, entityType, entityId, verb, meta, hours] of activities) {
    db.insert(activity)
      .values({ id, orgId, actorId, entityType, entityId, verb, meta, createdAt: hoursAgo(hours) })
      .run();
  }

  const notificationRows = [
    ["ntf_01", "usr_alya", "approval", "Pembelian menunggu persetujuan", "Maya Kusuma mengajukan pembelian laptop desain.", "/app/approvals", 2],
    ["ntf_02", "usr_alya", "task", "Tugas urgent ditugaskan", "Uji isolasi data antarorganisasi ditugaskan ke Rizky.", "/app/tasks?task=tsk_03", 3],
    ["ntf_03", "usr_alya", "mention", "Anda disebut di komentar", "Rizky Pratama menyebut Anda di onboarding organisasi.", "/app/tasks?task=tsk_01", 6],
    ["ntf_04", "usr_alya", "message", "Pesan baru di #peluncuran-kullo", "Nadia: panduan 5 menit sudah ditulis.", "/app/chat?c=cnv_kullo", 12],
    ["ntf_05", "usr_alya", "document", "Dokumen dibagikan", "Brand Guidelines v2 dibagikan oleh Dimas.", "/app/documents", 26],
    ["ntf_06", "usr_maya", "approval", "Cuti menunggu persetujuan", "Nadia Rahmawati mengajukan cuti tahunan.", "/app/approvals", 5],
    ["ntf_07", "usr_rizky", "approval", "Penggantian biaya menunggu persetujuan", "Budi Santoso mengajukan penggantian biaya transport.", "/app/approvals", 7],
    ["ntf_08", "usr_fajar", "approval", "Penggantian biaya di level 2", "Penggantian biaya Budi Santoso menunggu keputusan Anda.", "/app/approvals", 20],
  ] as const;
  for (const [id, userId, kind, title, body, href, hours] of notificationRows) {
    db.insert(notifications)
      .values({ id, orgId, userId, kind, title, body, href, createdAt: hoursAgo(hours), readAt: hours > 18 ? hoursAgo(hours - 1) : null })
      .run();
  }

  console.log("Seed complete: Nusantara Digital, 8 members, 6 projects, 25 tasks.");
}

seed();
