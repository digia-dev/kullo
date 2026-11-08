"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import {
  activity,
  conversationMembers,
  conversations,
  departments,
  formFields,
  formTemplates,
  memberships,
  messages,
  notifications,
  organizations,
  projectMembers,
  projectStatuses,
  projects,
  roles,
  tasks,
  users,
} from "@/db/schema";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { DEFAULT_ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/rbac";
import { newId, todayISO } from "@/lib/utils";

export type AuthState = { error?: string; ok?: boolean };

const loginSchema = z.object({
  email: z.string().trim().email("Alamat email tidak valid."),
  password: z.string().min(1, "Masukkan kata sandi."),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().email("Alamat email tidak valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
  orgName: z.string().trim().min(2, "Nama organisasi minimal 2 karakter."),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "organisasi";
}

const TEMPLATES = [
  {
    key: "cuti",
    name: "Permintaan Cuti",
    description: "Ajukan cuti tahunan, sakit, atau izin darurat.",
    category: "leave",
    fields: [
      ["Jenis cuti", "select", true, ["Cuti tahunan", "Sakit", "Izin darurat"]],
      ["Tanggal mulai", "date", true, null],
      ["Tanggal selesai", "date", true, null],
      ["Alasan", "textarea", true, null],
    ],
  },
  {
    key: "reimbursement",
    name: "Reimbursement",
    description: "Klaim biaya operasional dengan bukti yang jelas.",
    category: "finance",
    fields: [
      ["Tanggal transaksi", "date", true, null],
      ["Kategori", "select", true, ["Perjalanan", "Konsumsi", "Peralatan", "Lainnya"]],
      ["Jumlah (IDR)", "number", true, null],
      ["Deskripsi", "textarea", true, null],
    ],
  },
  {
    key: "purchase",
    name: "Purchase Request",
    description: "Ajukan pembelian barang atau jasa.",
    category: "finance",
    fields: [
      ["Item", "text", true, null],
      ["Jumlah (IDR)", "number", true, null],
      ["Vendor", "text", false, null],
      ["Urgensi", "select", true, ["Rendah", "Sedang", "Tinggi"]],
      ["Justifikasi", "textarea", true, null],
    ],
  },
  {
    key: "business-trip",
    name: "Business Trip",
    description: "Rencanakan perjalanan dinas dan estimasi biayanya.",
    category: "operations",
    fields: [
      ["Tujuan", "text", true, null],
      ["Tanggal berangkat", "date", true, null],
      ["Durasi (hari)", "number", true, null],
      ["Estimasi biaya (IDR)", "number", true, null],
    ],
  },
  {
    key: "it-support",
    name: "IT Support",
    description: "Laporkan gangguan perangkat atau akses.",
    category: "operations",
    fields: [
      ["Kategori", "select", true, ["Perangkat", "Akses", "Jaringan", "Lainnya"]],
      ["Deskripsi", "textarea", true, null],
      ["Prioritas", "select", true, ["Rendah", "Sedang", "Tinggi"]],
    ],
  },
  {
    key: "general",
    name: "General Request",
    description: "Permintaan umum yang tidak masuk kategori lain.",
    category: "general",
    fields: [
      ["Subjek", "text", true, null],
      ["Detail", "textarea", true, null],
    ],
  },
] as const;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali isian." };

  const user = db.select().from(users).where(eq(users.email, parsed.data.email.toLowerCase())).get();
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { error: "Email atau kata sandi tidak cocok. Coba lagi." };
  }

  await createSession(user.id);
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/app/dashboard");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    orgName: formData.get("orgName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali isian." };

  const email = parsed.data.email.toLowerCase();
  const exists = db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
  if (exists) return { error: "Email ini sudah terdaftar. Masuk dengan akun tersebut." };

  const orgId = newId("org");
  const userId = newId("usr");
  const deptId = newId("dep");
  const baseSlug = slugify(parsed.data.orgName);
  let slug = baseSlug;
  let suffix = 2;
  while (db.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, slug)).get()) {
    slug = `${baseSlug}-${suffix++}`;
  }

  try {
    db.transaction((tx) => {
      tx.insert(organizations)
        .values({
          id: orgId,
          name: parsed.data.orgName.trim(),
          slug,
          timezone: "Asia/Jakarta",
          workStart: "09:00",
          workEnd: "18:00",
          plan: "free",
        })
        .run();

      tx.insert(users)
        .values({
          id: userId,
          name: parsed.data.name.trim(),
          email,
          passwordHash: hashPassword(parsed.data.password),
          title: "Organization Owner",
          avatarColor: "#365fd1",
        })
        .run();

      tx.insert(departments)
        .values({ id: deptId, orgId, name: "Umum", headUserId: userId, color: "#365fd1" })
        .run();

      tx.insert(memberships)
        .values({
          id: newId("mem"),
          orgId,
          userId,
          role: "owner",
          departmentId: deptId,
          status: "active",
        })
        .run();

      for (const key of ["owner", "admin", "manager", "leader", "staff", "guest"]) {
        tx.insert(roles)
          .values({
            id: newId("role"),
            orgId,
            key,
            name: ROLE_LABELS[key],
            permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS[key]),
            system: true,
          })
          .run();
      }

      const projectId = newId("prj");
      tx.insert(projects)
        .values({
          id: projectId,
          orgId,
          departmentId: deptId,
          code: "ONB-01",
          name: "Onboarding Kullo",
          description:
            "Proyek contoh untuk langkah pertama: undang tim, buat tugas, dan pindahkan status di papan.",
          ownerId: userId,
          managerId: userId,
          status: "active",
          priority: "medium",
          startDate: todayISO(),
          dueDate: todayISO(),
          progress: 0,
        })
        .run();
      tx.insert(projectMembers).values({ projectId, userId, role: "owner" }).run();

      const statusIds: Record<string, string> = {};
      for (const [position, name] of ["Backlog", "To Do", "In Progress", "In Review", "Done"].entries()) {
        const id = newId("pst");
        statusIds[name] = id;
        tx.insert(projectStatuses)
          .values({ id, projectId, name, position, category: name === "Done" ? "done" : "open" })
          .run();
      }

      const starterTasks = [
        ["Undang anggota tim pertama", "Buka Pengaturan › Anggota, masukkan email rekan kerja, lalu pilih peran.", "To Do", "high"],
        ["Buat proyek kedua", "Gunakan tombol Buat proyek di halaman Proyek. Kode proyek harus unik di organisasi.", "Backlog", "medium"],
        ["Coba papan Kanban", "Pindahkan tugas ini ke In Progress, lalu ke Done untuk melihat progres proyek berubah.", "In Progress", "low"],
      ] as const;
      for (const [index, [title, description, status, priority]] of starterTasks.entries()) {
        tx.insert(tasks)
          .values({
            id: newId("tsk"),
            orgId,
            projectId,
            number: index + 1,
            title,
            description,
            statusId: statusIds[status],
            priority,
            assigneeId: userId,
            reporterId: userId,
            dueDate: todayISO(),
          })
          .run();
      }

      const conversationId = newId("cnv");
      tx.insert(conversations)
        .values({
          id: conversationId,
          orgId,
          kind: "channel",
          name: "umum",
          description: "Pengumuman dan percakapan lintas tim",
        })
        .run();
      tx.insert(conversationMembers).values({ conversationId, userId }).run();
      tx.insert(messages)
        .values({
          id: newId("msg"),
          conversationId,
          authorId: userId,
          body: "Selamat datang di Kullo. Kanal ini untuk seluruh tim. Mulai dengan mengundang anggota di Pengaturan.",
        })
        .run();

      for (const template of TEMPLATES) {
        const templateId = newId("tpl");
        tx.insert(formTemplates)
          .values({
            id: templateId,
            orgId,
            key: template.key,
            name: template.name,
            description: template.description,
            category: template.category,
          })
          .run();
        template.fields.forEach((field, index) => {
          const [label, type, required, options] = field;
          tx.insert(formFields)
            .values({
              id: newId("fld"),
              templateId,
              label,
              type,
              required,
              options: options ? JSON.stringify(options) : null,
              position: index,
            })
            .run();
        });
      }

      tx.insert(activity)
        .values({
          id: newId("act"),
          orgId,
          actorId: userId,
          entityType: "organization",
          entityId: orgId,
          verb: "membuat organisasi",
          meta: parsed.data.orgName.trim(),
        })
        .run();

      tx.insert(notifications)
        .values({
          id: newId("ntf"),
          orgId,
          userId,
          kind: "welcome",
          title: "Selamat datang di Kullo",
          body: "Tiga tugas contoh sudah disiapkan. Mulai dari mengundang anggota tim.",
          href: "/app/dashboard",
        })
        .run();
    });
  } catch {
    return { error: "Organisasi gagal dibuat. Coba lagi dengan nama organisasi lain." };
  }

  await createSession(userId);
  redirect("/app/dashboard");
}
