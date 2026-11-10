import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  departments,
  memberships,
  organizations,
  projectMembers,
  projectStatuses,
  projects,
  roles,
  tasks,
  users,
} from "@/db/schema";
import { DEFAULT_ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/rbac";
import { newId, todayISO } from "@/lib/utils";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "organisasi"
  );
}

export async function uniqueSlug(tx: Tx, name: string) {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while ((await tx.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, slug)))[0]) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

/**
 * Creates a complete starter workspace: organization, owner user, default
 * department + roles, an onboarding project with statuses and three tasks.
 * Used by self-serve registration and by approved demo/paid requests.
 */
export async function provisionWorkspace(
  tx: Tx,
  input: {
    orgName: string;
    name: string;
    email: string;
    passwordHash: string;
    plan?: string;
  },
) {
  const orgId = newId("org");
  const userId = newId("usr");
  const deptId = newId("dep");
  const slug = await uniqueSlug(tx, input.orgName);

  await tx.insert(organizations).values({
    id: orgId,
    name: input.orgName.trim(),
    slug,
    timezone: "Asia/Jakarta",
    workStart: "09:00",
    workEnd: "18:00",
    plan: input.plan ?? "free",
  });

  await tx.insert(users).values({
    id: userId,
    name: input.name.trim(),
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    title: "Pemilik Organisasi",
    avatarColor: "#0f6cbd",
  });

  await tx.insert(departments).values({ id: deptId, orgId, name: "Umum", headUserId: userId, color: "#0f6cbd" });

  await tx.insert(memberships).values({
    id: newId("mem"),
    orgId,
    userId,
    role: "owner",
    departmentId: deptId,
    status: "active",
  });

  for (const key of ["owner", "admin", "manager", "leader", "staff", "guest"]) {
    await tx.insert(roles).values({
      id: newId("role"),
      orgId,
      key,
      name: ROLE_LABELS[key],
      permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS[key]),
      system: true,
    });
  }

  const projectId = newId("prj");
  await tx.insert(projects).values({
    id: projectId,
    orgId,
    departmentId: deptId,
    code: "ONB-01",
    name: "Onboarding Kullo",
    description: "Proyek contoh untuk langkah pertama: undang tim, buat tugas, dan pindahkan status di papan.",
    ownerId: userId,
    managerId: userId,
    status: "active",
    priority: "medium",
    startDate: todayISO(),
    dueDate: todayISO(),
    progress: 0,
  });
  await tx.insert(projectMembers).values({ projectId, userId, role: "owner" });

  const statusIds: Record<string, string> = {};
  for (const [position, name] of ["Backlog", "To Do", "In Progress", "In Review", "Done"].entries()) {
    const id = newId("pst");
    statusIds[name] = id;
    await tx.insert(projectStatuses).values({
      id,
      projectId,
      name,
      position,
      category: name === "Done" ? "done" : "open",
    });
  }

  const starterTasks = [
    ["Undang anggota tim pertama", "Buka Pengaturan > Anggota, masukkan email rekan kerja, lalu pilih peran.", "To Do", "high"],
    ["Buat proyek kedua", "Gunakan tombol Buat proyek di halaman Proyek. Kode proyek harus unik di organisasi.", "Backlog", "medium"],
    ["Coba papan Kanban", "Pindahkan tugas ini ke In Progress, lalu ke Done untuk melihat progres proyek berubah.", "In Progress", "low"],
  ] as const;

  for (const [index, [title, description, status, priority]] of starterTasks.entries()) {
    await tx.insert(tasks).values({
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
      startDate: todayISO(),
      dueDate: todayISO(),
    });
  }

  return { orgId, userId };
}
