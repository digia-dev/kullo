"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db/client";
import {
  activity,
  approvalSteps,
  attachments,
  checklistItems,
  commentAttachments,
  checklists,
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
  messageAttachments,
  milestones,
  notifications,
  organizations,
  projectMembers,
  projects,
  projectStatuses,
  requests,
  roles,
  tasks,
  taskDependencies,
  taskLabelLinks,
  taskLabels,
  timeLogs,
  users,
} from "@/db/schema";
import { requireApp, type AppContext, newInviteToken } from "@/lib/auth";
import { can, PermissionError } from "@/lib/rbac";
import { hashPassword } from "@/lib/password";
import { newId, nowISO, todayISO } from "@/lib/utils";

export type ActionResult = { ok: boolean; error?: string; id?: string; token?: string; message?: string };

function fail(error: unknown): ActionResult {
  if (error instanceof PermissionError) return { ok: false, error: error.message };
  console.error(error);
  return { ok: false, error: "Tindakan gagal. Periksa isian lalu coba lagi." };
}

function refresh() {
  revalidatePath("/app", "layout");
}

function log(ctx: AppContext, entityType: string, entityId: string, verb: string, meta: string | null = null) {
  db.insert(activity)
    .values({
      id: newId("act"),
      orgId: ctx.org.id,
      actorId: ctx.user.id,
      entityType,
      entityId,
      verb,
      meta,
      createdAt: nowISO(),
    })
    .run();
}

function notify(ctx: AppContext, userId: string, kind: string, title: string, body: string, href: string) {
  if (userId === ctx.user.id) return;
  const membership = db
    .select()
    .from(memberships)
    .where(and(eq(memberships.orgId, ctx.org.id), eq(memberships.userId, userId)))
    .get();
  if (membership) {
    try {
      const prefs = JSON.parse(membership.notificationPrefs || "{}") as Record<string, boolean>;
      const key = kind === "project" ? "task" : kind;
      if (prefs[key] === false) return;
    } catch {
      /* ignore malformed prefs */
    }
  }
  db.insert(notifications)
    .values({ id: newId("ntf"), orgId: ctx.org.id, userId, kind, title, body, href })
    .run();
}

const UPLOAD_KINDS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg", "gif", "webp", "zip", "txt", "csv", "md"];

type StoredFile =
  | { ok: true; id: string; name: string; kind: string; size: number }
  | { ok: false; error: string };

type StoredVersionFile =
  | { ok: true; storageKey: string; name: string; kind: string; size: number }
  | { ok: false; error: string };

/** Simpan berkas versi dokumen tanpa membuat baris documents baru (file lama tetap di riwayat). */
async function storeVersionFile(file: FormDataEntryValue | null): Promise<StoredVersionFile> {
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Pilih file yang akan diunggah." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "Ukuran file maksimal 10 MB." };
  const kind = (file.name.split(".").pop() ?? "file").toLowerCase();
  if (!UPLOAD_KINDS.includes(kind)) {
    return { ok: false, error: "Jenis file tidak didukung. Gunakan PDF, Office, gambar, ZIP, TXT, CSV, atau MD." };
  }
  const id = newId("ver");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || `file.${kind}`;
  const storageKey = path.posix.join("versions", `${id}-${safeName}`);
  const absolute = path.join(process.cwd(), "data", "uploads", storageKey);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, Buffer.from(await file.arrayBuffer()));
  return { ok: true, storageKey, name: file.name, kind, size: file.size };
}

function ensureDocumentFolder(orgId: string, name: string, options: { scope?: string; projectId?: string | null }) {
  const existing = db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.orgId, orgId),
        eq(folders.name, name),
        options.projectId ? eq(folders.projectId, options.projectId) : isNull(folders.projectId),
      ),
    )
    .get();
  if (existing) return existing.id;
  const id = newId("fld");
  db.insert(folders)
    .values({
      id,
      orgId,
      name,
      scope: options.scope ?? "company",
      projectId: options.projectId ?? null,
      createdAt: nowISO(),
    })
    .run();
  return id;
}

async function storeUploadedFile(
  ctx: AppContext,
  file: FormDataEntryValue | null,
  options: { folder: string; scope?: string; projectId?: string | null },
): Promise<StoredFile> {  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Pilih file yang akan diunggah." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "Ukuran file maksimal 10 MB." };
  const kind = (file.name.split(".").pop() ?? "file").toLowerCase();
  if (!UPLOAD_KINDS.includes(kind)) {
    return { ok: false, error: "Jenis file tidak didukung. Gunakan PDF, Office, gambar, ZIP, TXT, CSV, atau MD." };
  }
  const folderId = ensureDocumentFolder(ctx.org.id, options.folder, { scope: options.scope, projectId: options.projectId });
  const id = newId("doc");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || `file.${kind}`;
  const storageKey = path.posix.join(ctx.org.id, `${id}-${safeName}`);
  const absolute = path.join(process.cwd(), "data", "uploads", storageKey);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, Buffer.from(await file.arrayBuffer()));
  db.transaction((tx) => {
    tx.insert(documents)
      .values({
        id,
        orgId: ctx.org.id,
        folderId,
        name: file.name,
        kind,
        size: file.size,
        version: 1,
        ownerId: ctx.user.id,
        visibility: "company",
        projectId: options.projectId ?? null,
        storageKey,
        createdAt: nowISO(),
      })
      .run();
    tx.insert(documentVersions)
      .values({ id: newId("dvr"), documentId: id, version: 1, note: "Versi awal", authorId: ctx.user.id, createdAt: nowISO() })
      .run();
  });
  log(ctx, "document", id, "mengunggah file", file.name);
  return { ok: true, id, name: file.name, kind, size: file.size };
}

function text(formData: FormData, key: string) {  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optional(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function memberCheck(orgId: string, userId: string) {
  return db
    .select()
    .from(memberships)
    .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, userId), eq(memberships.status, "active")))
    .get();
}

/* ------------------------------ Tasks ------------------------------ */

export async function createTaskAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.create")) throw new PermissionError("Anda tidak memiliki izin membuat tugas.");
    const title = text(formData, "title");
    if (title.length < 3) return { ok: false, error: "Judul tugas minimal 3 karakter." };
    const projectId = optional(formData, "projectId");
    const project = projectId
      ? db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get()
      : null;
    if (projectId && !project) return { ok: false, error: "Proyek tidak ditemukan di organisasi ini." };
    const assigneeId = optional(formData, "assigneeId");
    if (assigneeId && !memberCheck(ctx.org.id, assigneeId)) return { ok: false, error: "PIC bukan anggota organisasi." };
    const requestedStatusId = optional(formData, "statusId");
    if (requestedStatusId && project) {
      const status = db.select().from(projectStatuses).where(and(eq(projectStatuses.id, requestedStatusId), eq(projectStatuses.projectId, project.id))).get();
      if (!status) return { ok: false, error: "Status bukan milik proyek ini." };
    }
    // Tugas berproyek selalu punya status: pakai yang diminta, atau status pertama proyek.
    let statusId = requestedStatusId ?? null;
    if (project && !requestedStatusId) {
      const firstStatus = db
        .select()
        .from(projectStatuses)
        .where(eq(projectStatuses.projectId, project.id))
        .orderBy(projectStatuses.position)
        .get();
      statusId = firstStatus?.id ?? null;
    }
    const max = db
      .select({ value: sql<number>`coalesce(max(${tasks.number}), 0)` })
      .from(tasks)
      .where(eq(tasks.orgId, ctx.org.id))
      .get();
    const number = (max?.value ?? 0) + 1;
    const id = newId("tsk");
    const createdStatus = statusId
      ? db.select().from(projectStatuses).where(eq(projectStatuses.id, statusId)).get()
      : null;
    db.insert(tasks)
      .values({
        id,
        orgId: ctx.org.id,
        projectId,
        number,
        title,
        description: optional(formData, "description"),
        statusId,
        priority: text(formData, "priority") || "medium",
        assigneeId,
        reporterId: ctx.user.id,
        parentTaskId: optional(formData, "parentTaskId"),
        startDate: optional(formData, "startDate"),
        dueDate: optional(formData, "dueDate"),
        estimateHours: text(formData, "estimateHours") ? Number(text(formData, "estimateHours")) : null,
        completedAt: createdStatus?.category === "done" ? nowISO() : null,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      })
      .run();
    if (projectId && assigneeId) {
      const existing = db
        .select()
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, assigneeId)))
        .get();
      if (!existing) db.insert(projectMembers).values({ projectId, userId: assigneeId, role: "member" }).run();
    }
    log(ctx, "task", id, "membuat tugas", title);
    if (assigneeId) notify(ctx, assigneeId, "task", "Tugas baru ditugaskan", `${title} ditugaskan kepada Anda.`, `/app/tasks?task=${id}`);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function updateTaskAction(taskId: string, patch: Record<string, string | null>): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    if (!["owner", "admin", "manager", "leader"].includes(ctx.membership.role) && task.assigneeId !== ctx.user.id && task.reporterId !== ctx.user.id) {
      throw new PermissionError("Anda hanya dapat mengubah tugas yang ditugaskan atau Anda buat.");
    }
    const allowed = ["title", "description", "statusId", "priority", "assigneeId", "dueDate", "startDate", "estimateHours", "projectId"];
    const updates: Record<string, unknown> = { updatedAt: nowISO() };
    const labels: string[] = [];
    const previousStatus = task.statusId
      ? db.select().from(projectStatuses).where(eq(projectStatuses.id, task.statusId)).get()
      : null;
    for (const [key, value] of Object.entries(patch)) {
      if (!allowed.includes(key)) continue;
      if (key === "statusId" && value) {
        const status = db.select().from(projectStatuses).where(eq(projectStatuses.id, value)).get();
        if (!status) return { ok: false, error: "Status tidak valid." };
        if (task.projectId && status.projectId !== task.projectId) return { ok: false, error: "Status bukan milik proyek ini." };
        const wasDone = previousStatus?.category === "done";
        const isDone = status.category === "done";
        if (isDone && !wasDone) updates.completedAt = nowISO();
        if (!isDone && wasDone) updates.completedAt = null;
        labels.push(`status menjadi ${status.name}`);
      }
      if (key === "assigneeId" && value && !memberCheck(ctx.org.id, value)) {
        return { ok: false, error: "PIC bukan anggota organisasi." };
      }
      if (key === "title" && (!value || value.trim().length < 3)) return { ok: false, error: "Judul minimal 3 karakter." };
      if (key === "estimateHours") updates[key] = value ? Number(value) : null;
      else updates[key] = value || null;
    }
    db.update(tasks).set(updates).where(eq(tasks.id, taskId)).run();
    if (patch.assigneeId && patch.assigneeId !== task.assigneeId) {
      notify(ctx, patch.assigneeId, "task", "Tugas ditugaskan kepada Anda", task.title, `/app/tasks?task=${taskId}`);
      const project = task.projectId ? db.select().from(projects).where(eq(projects.id, task.projectId)).get() : null;
      if (project) {
        const existing = db.select().from(projectMembers).where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, patch.assigneeId))).get();
        if (!existing) db.insert(projectMembers).values({ projectId: project.id, userId: patch.assigneeId, role: "member" }).run();
      }
    }
    log(ctx, "task", taskId, "memperbarui", labels.length ? labels.join(", ") : Object.keys(patch).join(", "));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function archiveTaskAction(taskId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.delete")) throw new PermissionError("Hanya pemilik proyek atau admin yang dapat menghapus tugas.");
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    db.update(tasks).set({ archivedAt: nowISO(), updatedAt: nowISO() }).where(eq(tasks.id, taskId)).run();
    log(ctx, "task", taskId, "mengarsipkan tugas", task.title);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addChecklistItemAction(taskId: string, label: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    if (!label.trim()) return { ok: false, error: "Tuliskan item checklist." };
    let checklist = db.select().from(checklists).where(eq(checklists.taskId, taskId)).get();
    if (!checklist) {
      checklist = { id: newId("chk"), taskId, title: "Checklist", position: 0 };
      db.insert(checklists).values(checklist).run();
    }
    db.insert(checklistItems)
      .values({ id: newId("chi"), checklistId: checklist.id, text: label.trim(), position: 99 })
      .run();
    log(ctx, "task", taskId, "menambah checklist", label.trim());
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleChecklistItemAction(itemId: string, done: boolean): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const item = db.select().from(checklistItems).where(eq(checklistItems.id, itemId)).get();
    if (!item) return { ok: false, error: "Item tidak ditemukan." };
    const checklist = db.select().from(checklists).where(eq(checklists.id, item.checklistId)).get();
    const task = checklist ? db.select().from(tasks).where(eq(tasks.id, checklist.taskId)).get() : null;
    if (!task || task.orgId !== ctx.org.id) return { ok: false, error: "Item tidak ditemukan." };
    db.update(checklistItems).set({ done }).where(eq(checklistItems.id, itemId)).run();
    log(ctx, "task", task.id, done ? "menyelesaikan checklist" : "membuka checklist", item.text);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addCommentAction(taskId: string, body: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "comment.create")) throw new PermissionError("Anda tidak dapat menulis komentar.");
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    if (body.trim().length < 1) return { ok: false, error: "Tuliskan komentar terlebih dahulu." };
    db.insert(comments)
      .values({ id: newId("cmt"), taskId, authorId: ctx.user.id, body: body.trim(), createdAt: nowISO() })
      .run();
    if (task.assigneeId && task.assigneeId !== ctx.user.id) {
      notify(ctx, task.assigneeId, "comment", "Komentar baru", `${ctx.user.name}: ${body.trim().slice(0, 90)}`, `/app/tasks?task=${taskId}`);
    }
    log(ctx, "task", taskId, "berkomentar", body.trim().slice(0, 120));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addCommentWithFilesAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "comment.create")) throw new PermissionError("Anda tidak dapat menulis komentar.");
    const taskId = text(formData, "taskId");
    const body = text(formData, "body");
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (!body && files.length === 0) return { ok: false, error: "Tulis komentar atau lampirkan gambar." };
    if (files.length > 4) return { ok: false, error: "Maksimal 4 gambar per komentar." };
    const project = task.projectId
      ? db.select().from(projects).where(eq(projects.id, task.projectId)).get()
      : null;
    const documentIds: string[] = [];
    for (const file of files) {
      const stored = await storeUploadedFile(ctx, file, {
        folder: project?.name ?? "Komentar tugas",
        scope: project ? "project" : "company",
        projectId: task.projectId ?? null,
      });
      if (!stored.ok) return { ok: false, error: stored.error };
      documentIds.push(stored.id);
    }
    const commentId = newId("cmt");
    db.transaction((tx) => {
      tx.insert(comments)
        .values({ id: commentId, taskId, authorId: ctx.user.id, body, createdAt: nowISO() })
        .run();
      if (documentIds.length > 0) {
        tx.insert(commentAttachments)
          .values(documentIds.map((documentId) => ({ commentId, documentId })))
          .run();
      }
    });
    if (task.assigneeId && task.assigneeId !== ctx.user.id) {
      notify(ctx, task.assigneeId, "comment", "Komentar baru", `${ctx.user.name}: ${(body || "Mengirim gambar").slice(0, 90)}`, `/app/tasks?task=${taskId}`);
    }
    log(ctx, "task", taskId, "berkomentar", body || `${documentIds.length} gambar`);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function createTaskLabelAction(name: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return { ok: false, error: "Nama label tidak boleh kosong." };
    if (clean.length > 24) return { ok: false, error: "Nama label maksimal 24 karakter." };
    const rows = db.select().from(taskLabels).where(eq(taskLabels.orgId, ctx.org.id)).all();
    const existing = rows.find((row) => row.name.toLowerCase() === clean.toLowerCase());
    if (existing) return { ok: true, id: existing.id };
    const id = newId("lbl");
    db.insert(taskLabels).values({ id, orgId: ctx.org.id, name: clean, color: "#0f6cbd" }).run();
    log(ctx, "label", id, "membuat label", clean);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error) as { ok: false; error: string };
  }
}

export async function addTimeLogAction(taskId: string, minutes: number, note: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 1440) return { ok: false, error: "Masukkan waktu antara 1 dan 1440 menit." };
    db.insert(timeLogs)
      .values({ id: newId("tim"), taskId, userId: ctx.user.id, minutes: Math.round(minutes), note: note.trim() || null, loggedOn: todayISO() })
      .run();
    log(ctx, "task", taskId, "mencatat waktu", `${Math.round(minutes)} menit`);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addTaskDependencyAction(taskId: string, dependsOnId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    if (taskId === dependsOnId) return { ok: false, error: "Tugas tidak dapat bergantung pada dirinya sendiri." };
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    const dependency = db.select().from(tasks).where(and(eq(tasks.id, dependsOnId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task || !dependency) return { ok: false, error: "Tugas tidak ditemukan." };
    const edges = db.select().from(taskDependencies).all();
    if (edges.some((edge) => edge.taskId === taskId && edge.dependsOnId === dependsOnId)) {
      return { ok: false, error: "Dependensi ini sudah ada." };
    }
    const reaches = (start: string, target: string) => {
      const stack = [start];
      const seen = new Set<string>();
      while (stack.length) {
        const current = stack.pop() as string;
        if (current === target) return true;
        if (seen.has(current)) continue;
        seen.add(current);
        for (const edge of edges) if (edge.taskId === current) stack.push(edge.dependsOnId);
      }
      return false;
    };
    if (reaches(dependsOnId, taskId)) {
      return { ok: false, error: "Dependensi melingkar: tugas ini sudah menjadi prasyarat tugas tersebut." };
    }
    db.insert(taskDependencies).values({ taskId, dependsOnId }).run();
    log(ctx, "task", taskId, "menambahkan dependensi", dependency.title);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function removeTaskDependencyAction(taskId: string, dependsOnId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    const dependency = db.select().from(tasks).where(and(eq(tasks.id, dependsOnId), eq(tasks.orgId, ctx.org.id))).get();
    if (!dependency) return { ok: false, error: "Dependensi tidak ditemukan." };
    db.delete(taskDependencies).where(and(eq(taskDependencies.taskId, taskId), eq(taskDependencies.dependsOnId, dependsOnId))).run();
    log(ctx, "task", taskId, "menghapus dependensi", dependency.title);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addAttachmentAction(taskId: string, name: string, size: number): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    if (name.trim().length < 2) return { ok: false, error: "Nama lampiran terlalu pendek." };
    db.insert(attachments)
      .values({ id: newId("att"), orgId: ctx.org.id, taskId, name: name.trim(), kind: name.split(".").pop() ?? "file", size: Math.max(0, size) })
      .run();
    log(ctx, "task", taskId, "menambahkan lampiran", name.trim());
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Projects ------------------------------ */

export async function createProjectAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.create")) throw new PermissionError("Anda tidak memiliki izin membuat proyek.");
    const name = text(formData, "name");
    const code = text(formData, "code").toUpperCase();
    if (name.length < 3) return { ok: false, error: "Nama proyek minimal 3 karakter." };
    if (code.length < 2) return { ok: false, error: "Kode proyek minimal 2 karakter." };
    const duplicate = db.select().from(projects).where(and(eq(projects.orgId, ctx.org.id), eq(projects.code, code))).get();
    if (duplicate) return { ok: false, error: "Kode proyek sudah dipakai. Gunakan kode lain." };
    const startDate = optional(formData, "startDate");
    const dueDate = optional(formData, "dueDate");
    if (startDate && dueDate && dueDate < startDate) return { ok: false, error: "Tenggat tidak boleh sebelum tanggal mulai." };
    const departmentId = optional(formData, "departmentId");
    if (departmentId && !db.select().from(departments).where(and(eq(departments.id, departmentId), eq(departments.orgId, ctx.org.id))).get()) {
      return { ok: false, error: "Departemen tidak ditemukan." };
    }
    const id = newId("prj");
    db.transaction((tx) => {
      tx.insert(projects)
        .values({
          id,
          orgId: ctx.org.id,
          departmentId,
          code,
          name,
          description: optional(formData, "description"),
          ownerId: ctx.user.id,
          managerId: optional(formData, "managerId") ?? ctx.user.id,
          status: text(formData, "status") || "planning",
          priority: text(formData, "priority") || "medium",
          startDate,
          dueDate,
          progress: 0,
          createdAt: nowISO(),
        })
        .run();
      tx.insert(projectMembers).values({ projectId: id, userId: ctx.user.id, role: "owner" }).run();
      const managerId = optional(formData, "managerId");
      if (managerId && managerId !== ctx.user.id) tx.insert(projectMembers).values({ projectId: id, userId: managerId, role: "manager" }).run();
      ["Backlog", "To Do", "In Progress", "In Review", "Done"].forEach((statusName, position) => {
        tx.insert(projectStatuses)
          .values({
            id: newId("pst"),
            projectId: id,
            name: statusName,
            position,
            category: statusName === "Done" ? "done" : position === 3 ? "review" : position === 2 ? "active" : "open",
          })
          .run();
      });
    });
    log(ctx, "project", id, "membuat proyek", name);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function updateProjectAction(projectId: string, formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError();
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };
    const name = text(formData, "name");
    if (name.length < 3) return { ok: false, error: "Nama proyek minimal 3 karakter." };
    const startDate = optional(formData, "startDate");
    const dueDate = optional(formData, "dueDate");
    if (startDate && dueDate && dueDate < startDate) return { ok: false, error: "Tenggat tidak boleh sebelum tanggal mulai." };
    db.update(projects)
      .set({
        name,
        description: optional(formData, "description"),
        departmentId: optional(formData, "departmentId"),
        managerId: optional(formData, "managerId"),
        status: text(formData, "status") || project.status,
        priority: text(formData, "priority") || project.priority,
        startDate,
        dueDate,
      })
      .where(eq(projects.id, projectId))
      .run();
    log(ctx, "project", projectId, "memperbarui proyek", name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function archiveProjectAction(projectId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.archive")) throw new PermissionError("Anda tidak dapat mengarsipkan proyek.");
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };
    db.update(projects).set({ archivedAt: nowISO(), status: "completed" }).where(eq(projects.id, projectId)).run();
    log(ctx, "project", projectId, "mengarsipkan proyek", project.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function duplicateProjectAction(projectId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.create")) throw new PermissionError();
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };
    const id = newId("prj");
    const codeBase = `${project.code}-2`;
    let code = codeBase;
    let suffix = 2;
    while (db.select().from(projects).where(and(eq(projects.orgId, ctx.org.id), eq(projects.code, code))).get()) {
      code = `${codeBase}-${suffix++}`;
    }
    db.transaction((tx) => {
      tx.insert(projects)
        .values({
          id,
          orgId: ctx.org.id,
          departmentId: project.departmentId,
          code,
          name: `${project.name} (salinan)`,
          description: project.description,
          ownerId: ctx.user.id,
          managerId: project.managerId,
          status: "planning",
          priority: project.priority,
          startDate: project.startDate,
          dueDate: project.dueDate,
          progress: 0,
        })
        .run();
      tx.insert(projectMembers).values({ projectId: id, userId: ctx.user.id, role: "owner" }).run();
      const sourceStatuses = db.select().from(projectStatuses).where(eq(projectStatuses.projectId, projectId)).all();
      for (const status of sourceStatuses) {
        tx.insert(projectStatuses)
          .values({ id: newId("pst"), projectId: id, name: status.name, position: status.position, category: status.category })
          .run();
      }
    });
    log(ctx, "project", id, "menduplikasi proyek", project.name);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function addProjectMemberAction(projectId: string, userId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError();
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };
    if (!memberCheck(ctx.org.id, userId)) return { ok: false, error: "Pengguna bukan anggota aktif organisasi." };
    const existing = db.select().from(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))).get();
    if (existing) return { ok: false, error: "Anggota ini sudah ada di proyek." };
    db.insert(projectMembers).values({ projectId, userId, role: "member" }).run();
    notify(ctx, userId, "project", "Anda ditambahkan ke proyek", project.name, `/app/projects/${projectId}/overview`);
    log(ctx, "project", projectId, "menambahkan anggota", userId);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function removeProjectMemberAction(projectId: string, userId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError();
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };
    if (userId === project.ownerId || userId === project.managerId) return { ok: false, error: "Pemilik dan manajer proyek tidak dapat dikeluarkan." };
    db.delete(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))).run();
    log(ctx, "project", projectId, "mengeluarkan anggota", userId);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleMilestoneAction(milestoneId: string, done: boolean): Promise<ActionResult> {  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError();
    const milestone = db.select().from(milestones).where(eq(milestones.id, milestoneId)).get();
    if (!milestone) return { ok: false, error: "Milestone tidak ditemukan." };
    const project = db.select().from(projects).where(eq(projects.id, milestone.projectId)).get();
    if (!project || project.orgId !== ctx.org.id) return { ok: false, error: "Milestone tidak ditemukan." };
    db.update(milestones).set({ done }).where(eq(milestones.id, milestoneId)).run();
    log(ctx, "project", project.id, done ? "menyelesaikan milestone" : "membuka milestone", milestone.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addMilestoneAction(projectId: string, name: string, dueDate: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError();
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };
    if (name.trim().length < 2) return { ok: false, error: "Nama milestone terlalu pendek." };
    db.insert(milestones).values({ id: newId("mil"), projectId, name: name.trim(), dueDate: dueDate || null, position: 99 }).run();
    log(ctx, "project", projectId, "menambah milestone", name.trim());
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Board columns (tahapan proyek) ------------------------------ */

const STATUS_CATEGORIES = ["open", "active", "review", "blocked", "done"] as const;

function cleanStatusName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function statusNameTaken(projectId: string, name: string, exceptId?: string) {
  const rows = db.select().from(projectStatuses).where(eq(projectStatuses.projectId, projectId)).all();
  const key = name.toLowerCase();
  return rows.some((row) => row.id !== exceptId && row.name.toLowerCase() === key);
}

/** Ambil status + proyeknya, dipastikan masih dalam organisasi aktif. */
function loadStatus(statusId: string, ctx: AppContext) {
  const status = db.select().from(projectStatuses).where(eq(projectStatuses.id, statusId)).get();
  if (!status) return null;
  const project = db.select().from(projects).where(and(eq(projects.id, status.projectId), eq(projects.orgId, ctx.org.id))).get();
  if (!project) return null;
  return { status, project };
}

export async function createStatusAction(projectId: string, name: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError("Anda tidak memiliki izin mengubah tahapan proyek.");
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };
    const clean = cleanStatusName(name);
    if (clean.length < 2) return { ok: false, error: "Nama tahap minimal 2 karakter." };
    if (clean.length > 30) return { ok: false, error: "Nama tahap maksimal 30 karakter." };
    if (statusNameTaken(projectId, clean)) return { ok: false, error: "Nama tahap sudah dipakai di proyek ini." };
    const rows = db.select().from(projectStatuses).where(eq(projectStatuses.projectId, projectId)).all();
    if (rows.length >= 12) return { ok: false, error: "Satu proyek maksimal 12 tahap." };
    const position = rows.reduce((max, row) => Math.max(max, row.position), -1) + 1;
    db.insert(projectStatuses).values({ id: newId("pst"), projectId, name: clean, position, category: "open" }).run();
    log(ctx, "project", projectId, "menambah tahap papan", clean);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateStatusAction(statusId: string, patch: { name?: string; category?: string }): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError("Anda tidak memiliki izin mengubah tahapan proyek.");
    const found = loadStatus(statusId, ctx);
    if (!found) return { ok: false, error: "Tahap tidak ditemukan." };
    const updates: { name?: string; category?: string } = {};
    const labels: string[] = [];
    if (typeof patch.name === "string") {
      const clean = cleanStatusName(patch.name);
      if (clean.length < 2) return { ok: false, error: "Nama tahap minimal 2 karakter." };
      if (clean.length > 30) return { ok: false, error: "Nama tahap maksimal 30 karakter." };
      if (clean !== found.status.name && statusNameTaken(found.status.projectId, clean, statusId)) {
        return { ok: false, error: "Nama tahap sudah dipakai di proyek ini." };
      }
      if (clean !== found.status.name) {
        updates.name = clean;
        labels.push(`tahap menjadi ${clean}`);
      }
    }
    if (typeof patch.category === "string") {
      if (!STATUS_CATEGORIES.includes(patch.category as (typeof STATUS_CATEGORIES)[number])) {
        return { ok: false, error: "Kategori tahap tidak dikenal." };
      }
      if (patch.category !== found.status.category) {
        updates.category = patch.category;
        labels.push(`kategori menjadi ${patch.category}`);
      }
    }
    if (Object.keys(updates).length === 0) return { ok: true };
    db.update(projectStatuses).set(updates).where(eq(projectStatuses.id, statusId)).run();
    log(ctx, "project", found.status.projectId, "mengubah tahap papan", labels.join(", "));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function reorderStatusAction(statusId: string, direction: -1 | 1): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError("Anda tidak memiliki izin mengubah tahapan proyek.");
    const found = loadStatus(statusId, ctx);
    if (!found) return { ok: false, error: "Tahap tidak ditemukan." };
    const rows = db
      .select()
      .from(projectStatuses)
      .where(eq(projectStatuses.projectId, found.status.projectId))
      .orderBy(projectStatuses.position)
      .all();
    const index = rows.findIndex((row) => row.id === statusId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= rows.length) return { ok: false, error: "Tahap sudah berada di ujung." };
    db.update(projectStatuses).set({ position: target }).where(eq(projectStatuses.id, rows[index].id)).run();
    db.update(projectStatuses).set({ position: index }).where(eq(projectStatuses.id, rows[target].id)).run();
    log(ctx, "project", found.status.projectId, "mengurutkan tahap papan", `${found.status.name} ke posisi ${target + 1}`);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteStatusAction(statusId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "project.edit")) throw new PermissionError("Anda tidak memiliki izin mengubah tahapan proyek.");
    const found = loadStatus(statusId, ctx);
    if (!found) return { ok: false, error: "Tahap tidak ditemukan." };
    const rows = db.select().from(projectStatuses).where(eq(projectStatuses.projectId, found.status.projectId)).all();
    if (rows.length <= 1) return { ok: false, error: "Tahap terakhir proyek tidak dapat dihapus." };
    const usage = db.select({ id: tasks.id }).from(tasks).where(eq(tasks.statusId, statusId)).all();
    if (usage.length > 0) {
      return { ok: false, error: `Masih ada ${usage.length} tugas pada tahap ini. Pindahkan tugas tersebut dulu.` };
    }
    db.delete(projectStatuses).where(eq(projectStatuses.id, statusId)).run();
    log(ctx, "project", found.status.projectId, "menghapus tahap papan", found.status.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setTaskLabelsAction(taskId: string, labelIds: string[]): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    const unique = Array.from(new Set(labelIds.filter((id) => Boolean(id))));
    const rows = unique.length
      ? db.select().from(taskLabels).where(and(eq(taskLabels.orgId, ctx.org.id), inArray(taskLabels.id, unique))).all()
      : [];
    if (rows.length !== unique.length) return { ok: false, error: "Label tidak ditemukan di organisasi ini." };
    db.delete(taskLabelLinks).where(eq(taskLabelLinks.taskId, taskId)).run();
    if (rows.length) {
      db.insert(taskLabelLinks)
        .values(rows.map((row) => ({ taskId, labelId: row.id })))
        .run();
    }
    log(ctx, "task", taskId, "mengubah label", rows.map((row) => row.name).join(", ") || "tanpa label");
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Chat ------------------------------ */

export async function sendMessageAction(conversationId: string, body: string, replyToId?: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const membership = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!membership) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    if (!body.trim()) return { ok: false, error: "Pesan tidak boleh kosong." };
    let reply = replyToId ?? null;
    if (reply) {
      const target = db.select().from(messages).where(eq(messages.id, reply)).get();
      if (!target || target.conversationId !== conversationId) reply = null;
    }
    db.insert(messages)
      .values({ id: newId("msg"), conversationId, authorId: ctx.user.id, body: body.trim(), replyToId: reply, createdAt: nowISO() })
      .run();
    db.update(conversationMembers).set({ lastReadAt: nowISO() }).where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id))).run();
    const others = db.select().from(conversationMembers).where(eq(conversationMembers.conversationId, conversationId)).all();
    for (const member of others) {
      if (member.userId !== ctx.user.id) {
        notify(ctx, member.userId, "message", "Pesan baru", `${ctx.user.name}: ${body.trim().slice(0, 100)}`, `/app/chat?c=${conversationId}`);
      }
    }
    log(ctx, "conversation", conversationId, "mengirim pesan", body.trim().slice(0, 120));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const CHANNEL_ICONS = ["hash", "star", "heart", "pin"] as const;

export async function createChannelAction(
  name: string,
  icon: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const ctx = await requireApp();
  try {
    const clean = name.trim().replace(/\s+/g, " ");
    if (clean.length < 2) return { ok: false, error: "Nama kanal minimal 2 karakter." };
    if (clean.length > 60) return { ok: false, error: "Nama kanal maksimal 60 karakter." };
    const iconKey = (CHANNEL_ICONS as readonly string[]).includes(icon) ? icon : "hash";
    const existing = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.orgId, ctx.org.id), eq(conversations.kind, "channel")))
      .all();
    if (existing.some((row) => row.name.toLowerCase() === clean.toLowerCase())) {
      return { ok: false, error: "Nama kanal sudah dipakai." };
    }
    const id = newId("cnv");
    db.transaction((tx) => {
      tx.insert(conversations)
        .values({ id, orgId: ctx.org.id, kind: "channel", name: clean, icon: iconKey, createdAt: nowISO() })
        .run();
      tx.insert(conversationMembers).values({ conversationId: id, userId: ctx.user.id, role: "admin" }).run();
    });
    log(ctx, "conversation", id, "membuat kanal", clean);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error) as { ok: false; error: string };
  }
}

export async function createConversationAction(
  memberIds: string[],
  groupName?: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const ctx = await requireApp();
  try {
    const unique = Array.from(new Set(memberIds.filter((id) => id && id !== ctx.user.id)));
    if (unique.length === 0) return { ok: false, error: "Pilih minimal satu anggota." };
    for (const id of unique) {
      if (!memberCheck(ctx.org.id, id)) return { ok: false, error: "Anggota tidak ditemukan di organisasi ini." };
    }

    if (unique.length === 1) {
      const direct = db
        .select()
        .from(conversations)
        .where(and(eq(conversations.orgId, ctx.org.id), eq(conversations.kind, "dm")))
        .all();
      for (const conversation of direct) {
        const members = db
          .select()
          .from(conversationMembers)
          .where(eq(conversationMembers.conversationId, conversation.id))
          .all();
        if (
          members.length === 2 &&
          members.some((member) => member.userId === ctx.user.id) &&
          members.some((member) => member.userId === unique[0])
        ) {
          return { ok: true, id: conversation.id };
        }
      }
    }

    const people: Array<{ name: string }> = [];
    for (const id of unique) {
      const person = db.select().from(users).where(eq(users.id, id)).get();
      if (!person) return { ok: false, error: "Anggota tidak ditemukan." };
      people.push(person);
    }

    const kind = unique.length === 1 ? "dm" : "group";
    const title =
      groupName?.trim() ||
      (unique.length === 1
        ? people[0].name
        : `${people.slice(0, 3).map((person) => person.name.split(" ")[0]).join(", ")}${people.length > 3 ? ` +${people.length - 3}` : ""}`);

    const id = newId("cnv");
    db.transaction((tx) => {
      tx.insert(conversations).values({ id, orgId: ctx.org.id, kind, name: title, createdAt: nowISO() }).run();
      tx.insert(conversationMembers)
        .values([
          { conversationId: id, userId: ctx.user.id, role: "admin" },
          ...unique.map((userId) => ({ conversationId: id, userId, role: "member" })),
        ])
        .run();
    });
    log(ctx, "conversation", id, "membuat percakapan", title);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error) as { ok: false; error: string };
  }
}

export async function renameConversationAction(conversationId: string, name: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const conversation = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.orgId, ctx.org.id)))
      .get();
    if (!conversation) return { ok: false, error: "Percakapan tidak ditemukan." };
    const member = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!member) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    if (conversation.kind === "project") return { ok: false, error: "Nama kanal proyek mengikuti nama proyek." };
    const clean = name.trim();
    if (clean.length < 2) return { ok: false, error: "Nama percakapan minimal 2 karakter." };
    if (clean.length > 60) return { ok: false, error: "Nama percakapan maksimal 60 karakter." };
    db.update(conversations).set({ name: clean }).where(eq(conversations.id, conversationId)).run();
    log(ctx, "conversation", conversationId, "mengganti nama percakapan", clean);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteConversationAction(conversationId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const conversation = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.orgId, ctx.org.id)))
      .get();
    if (!conversation) return { ok: false, error: "Percakapan tidak ditemukan." };
    const member = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!member) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    db.delete(conversations).where(eq(conversations.id, conversationId)).run();
    log(ctx, "conversation", conversationId, "menghapus percakapan", conversation.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function editMessageAction(messageId: string, body: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const message = db.select().from(messages).where(eq(messages.id, messageId)).get();
    if (!message) return { ok: false, error: "Pesan tidak ditemukan." };
    if (message.authorId !== ctx.user.id) return { ok: false, error: "Anda hanya dapat mengubah pesan sendiri." };
    if (!body.trim()) return { ok: false, error: "Pesan tidak boleh kosong." };
    db.update(messages).set({ body: body.trim() }).where(eq(messages.id, messageId)).run();
    log(ctx, "message", messageId, "mengubah pesan", body.trim().slice(0, 120));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteMessageAction(messageId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const message = db.select().from(messages).where(eq(messages.id, messageId)).get();
    if (!message) return { ok: false, error: "Pesan tidak ditemukan." };
    if (message.authorId !== ctx.user.id) return { ok: false, error: "Anda hanya dapat menghapus pesan sendiri." };
    db.delete(messages).where(eq(messages.id, messageId)).run();
    log(ctx, "message", messageId, "menghapus pesan", message.body.slice(0, 120));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addConversationMemberAction(conversationId: string, userId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const conversation = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.orgId, ctx.org.id)))
      .get();
    if (!conversation) return { ok: false, error: "Percakapan tidak ditemukan." };
    const actor = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!actor) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    if (conversation.kind === "dm") return { ok: false, error: "Pesan langsung hanya berisi dua peserta." };
    if (actor.role !== "admin") return { ok: false, error: "Hanya admin percakapan yang dapat menambah anggota." };
    if (!memberCheck(ctx.org.id, userId)) return { ok: false, error: "Anggota tidak ditemukan." };
    const existing = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)))
      .get();
    if (existing) return { ok: true };
    db.insert(conversationMembers).values({ conversationId, userId, role: "member" }).run();
    if (conversation.kind === "group") {
      db.update(conversations).set({ kind: "group" }).where(eq(conversations.id, conversationId)).run();
    }
    notify(ctx, userId, "message", "Anda ditambahkan ke percakapan", conversation.name, `/app/chat?c=${conversationId}`);
    log(ctx, "conversation", conversationId, "menambah anggota", userId);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function removeConversationMemberAction(conversationId: string, userId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const conversation = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.orgId, ctx.org.id)))
      .get();
    if (!conversation) return { ok: false, error: "Percakapan tidak ditemukan." };
    const actor = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!actor) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    if (conversation.kind === "dm" && userId !== ctx.user.id) {
      return { ok: false, error: "Pesan langsung tidak dapat mengeluarkan peserta lain." };
    }
    if (userId !== ctx.user.id && conversation.kind !== "dm" && actor.role !== "admin") {
      return { ok: false, error: "Hanya admin percakapan yang dapat mengeluarkan anggota." };
    }
    const target = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)))
      .get();
    if (!target) return { ok: false, error: "Anggota tidak ditemukan di percakapan ini." };
    if (target.role === "admin") {
      const admins = db
        .select()
        .from(conversationMembers)
        .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.role, "admin")))
        .all();
      if (admins.length <= 1) {
        return {
          ok: false,
          error:
            userId === ctx.user.id
              ? "Angkat admin lain sebelum keluar dari percakapan."
              : "Tidak dapat mengeluarkan admin terakhir. Angkat admin lain terlebih dahulu.",
        };
      }
    }
    db.delete(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)))
      .run();
    log(ctx, "conversation", conversationId, userId === ctx.user.id ? "keluar dari percakapan" : "mengeluarkan anggota", userId);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setConversationMemberRoleAction(conversationId: string, userId: string, role: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (role !== "admin" && role !== "member") return { ok: false, error: "Peran tidak dikenal." };
    const conversation = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.orgId, ctx.org.id)))
      .get();
    if (!conversation) return { ok: false, error: "Percakapan tidak ditemukan." };
    if (conversation.kind === "dm") return { ok: false, error: "Pesan langsung tidak memiliki admin." };
    const actor = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!actor) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    if (actor.role !== "admin") return { ok: false, error: "Hanya admin percakapan yang dapat mengubah peran anggota." };
    const target = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)))
      .get();
    if (!target) return { ok: false, error: "Anggota tidak ditemukan di percakapan ini." };
    if (target.role === role) return { ok: true };
    if (target.role === "admin" && role === "member") {
      const admins = db
        .select()
        .from(conversationMembers)
        .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.role, "admin")))
        .all();
      if (admins.length <= 1) return { ok: false, error: "Percakapan harus memiliki minimal satu admin." };
    }
    db.update(conversationMembers)
      .set({ role })
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)))
      .run();
    log(ctx, "conversation", conversationId, role === "admin" ? "menjadikan admin" : "mencabut admin", userId);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function uploadTaskAttachmentAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const taskId = text(formData, "taskId");
    const task = db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.orgId, ctx.org.id))).get();
    if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    const project = task.projectId
      ? db.select().from(projects).where(eq(projects.id, task.projectId)).get()
      : null;
    const stored = await storeUploadedFile(ctx, formData.get("file"), {
      folder: project?.name ?? "Lampiran tugas",
      scope: project ? "project" : "company",
      projectId: task.projectId ?? null,
    });
    if (!stored.ok) return { ok: false, error: stored.error };
    db.insert(attachments)
      .values({
        id: newId("att"),
        orgId: ctx.org.id,
        taskId,
        documentId: stored.id,
        name: stored.name,
        kind: stored.kind,
        size: stored.size,
        createdAt: nowISO(),
      })
      .run();
    log(ctx, "task", taskId, "mengunggah lampiran", stored.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTaskAttachmentAction(attachmentId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.edit")) throw new PermissionError();
    const row = db
      .select()
      .from(attachments)
      .where(and(eq(attachments.id, attachmentId), eq(attachments.orgId, ctx.org.id)))
      .get();
    if (!row) return { ok: false, error: "Lampiran tidak ditemukan." };
    if (row.taskId) {
      const task = db.select().from(tasks).where(and(eq(tasks.id, row.taskId), eq(tasks.orgId, ctx.org.id))).get();
      if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
    }
    const doc = row.documentId
      ? db.select().from(documents).where(and(eq(documents.id, row.documentId), eq(documents.orgId, ctx.org.id))).get()
      : null;
    const versionRows = doc ? db.select().from(documentVersions).where(eq(documentVersions.documentId, doc.id)).all() : [];
    const keys = new Set<string>();
    if (doc?.storageKey) keys.add(doc.storageKey);
    for (const version of versionRows) if (version.storageKey) keys.add(version.storageKey);

    db.delete(attachments).where(eq(attachments.id, row.id)).run();
    if (doc) db.delete(documents).where(eq(documents.id, doc.id)).run();
    for (const key of keys) {
      try {
        await fs.unlink(path.join(process.cwd(), "data", "uploads", key));
      } catch {
        /* file mungkin sudah tidak ada */
      }
    }
    if (row.taskId) log(ctx, "task", row.taskId, "menghapus lampiran", row.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function sendChatAttachmentAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const conversationId = text(formData, "conversationId");
    const membership = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!membership) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    const conversation = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.orgId, ctx.org.id)))
      .get();
    if (!conversation) return { ok: false, error: "Percakapan tidak ditemukan." };
    const stored = await storeUploadedFile(ctx, formData.get("file"), { folder: "Chat", scope: "company" });
    if (!stored.ok) return { ok: false, error: stored.error };
    const caption = text(formData, "body");
    const replyToId = optional(formData, "replyToId");
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(stored.kind);
    const messageId = newId("msg");
    db.transaction((tx) => {
      tx.insert(messages)
        .values({
          id: messageId,
          conversationId,
          authorId: ctx.user.id,
          body: caption || (isImage ? "Mengirim gambar" : stored.name),
          replyToId: replyToId ?? null,
          createdAt: nowISO(),
        })
        .run();
      tx.insert(messageAttachments).values({ messageId, documentId: stored.id }).run();
    });
    const others = db.select().from(conversationMembers).where(eq(conversationMembers.conversationId, conversationId)).all();
    for (const member of others) {
      if (member.userId !== ctx.user.id) {
        notify(ctx, member.userId, "message", "Lampiran baru", `${ctx.user.name}: ${caption || stored.name}`, `/app/chat?c=${conversationId}`);
      }
    }
    log(ctx, "conversation", conversationId, "mengirim lampiran", stored.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function reactToMessageAction(messageId: string, emoji: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const message = db.select().from(messages).where(eq(messages.id, messageId)).get();
    if (!message) return { ok: false, error: "Pesan tidak ditemukan." };
    const conversation = db.select().from(conversations).where(eq(conversations.id, message.conversationId)).get();
    if (!conversation || conversation.orgId !== ctx.org.id) return { ok: false, error: "Pesan tidak ditemukan." };
    const existing = db
      .select()
      .from(messageReactions)
      .where(and(eq(messageReactions.messageId, messageId), eq(messageReactions.userId, ctx.user.id), eq(messageReactions.emoji, emoji)))
      .get();
    if (existing) {
      db.delete(messageReactions)
        .where(and(eq(messageReactions.messageId, messageId), eq(messageReactions.userId, ctx.user.id), eq(messageReactions.emoji, emoji)))
        .run();
    } else {
      db.insert(messageReactions).values({ messageId, userId: ctx.user.id, emoji }).run();
    }
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function messageToTaskAction(messageId: string, projectId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "task.create")) throw new PermissionError();
    const message = db.select().from(messages).where(eq(messages.id, messageId)).get();
    if (!message) return { ok: false, error: "Pesan tidak ditemukan." };
    const project = db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get();
    if (!project) return { ok: false, error: "Pilih proyek yang valid." };
    const status = db.select().from(projectStatuses).where(eq(projectStatuses.projectId, projectId)).orderBy(projectStatuses.position).get();
    const max = db
      .select({ value: sql<number>`coalesce(max(${tasks.number}), 0)` })
      .from(tasks)
      .where(eq(tasks.orgId, ctx.org.id))
      .get();
    const id = newId("tsk");
    db.insert(tasks)
      .values({
        id,
        orgId: ctx.org.id,
        projectId,
        number: (max?.value ?? 0) + 1,
        title: message.body.slice(0, 90),
        description: `Dibuat dari pesan chat:\n\n${message.body}`,
        statusId: status?.id ?? null,
        priority: "medium",
        reporterId: ctx.user.id,
        assigneeId: ctx.user.id,
        dueDate: todayISO(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      })
      .run();
    log(ctx, "task", id, "membuat tugas dari pesan", message.body.slice(0, 80));
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function markConversationReadAction(conversationId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    db.update(conversationMembers)
      .set({ lastReadAt: nowISO() })
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .run();
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Calendar ------------------------------ */

export async function createEventAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const title = text(formData, "title");
    const date = text(formData, "date");
    const start = text(formData, "startTime") || "09:00";
    const end = text(formData, "endTime") || "10:00";
    if (title.length < 3) return { ok: false, error: "Nama agenda minimal 3 karakter." };
    if (!date) return { ok: false, error: "Pilih tanggal agenda." };
    if (end < start) return { ok: false, error: "Waktu selesai tidak boleh sebelum waktu mulai." };
    const id = newId("evt");
    db.insert(events)
      .values({
        id,
        orgId: ctx.org.id,
        title,
        description: optional(formData, "description"),
        kind: text(formData, "kind") || "meeting",
        startsAt: `${date}T${start}:00+07:00`,
        endsAt: `${date}T${end}:00+07:00`,
        location: optional(formData, "location"),
        projectId: optional(formData, "projectId"),
        createdBy: ctx.user.id,
      })
      .run();
    db.insert(eventParticipants).values({ eventId: id, userId: ctx.user.id, response: "accepted" }).run();
    const participantIds = formData.getAll("participants").map(String).filter(Boolean);
    for (const userId of participantIds) {
      if (userId === ctx.user.id) continue;
      if (!memberCheck(ctx.org.id, userId)) continue;
      db.insert(eventParticipants).values({ eventId: id, userId, response: "invited" }).run();
      notify(ctx, userId, "event", "Undangan agenda", `${title} Â· ${date} ${start}`, "/app/calendar");
    }
    log(ctx, "event", id, "membuat agenda", title);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function updateEventAction(eventId: string, formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const event = db.select().from(events).where(and(eq(events.id, eventId), eq(events.orgId, ctx.org.id))).get();
    if (!event) return { ok: false, error: "Agenda tidak ditemukan." };
    const title = text(formData, "title");
    const date = text(formData, "date");
    const start = text(formData, "startTime") || "09:00";
    const end = text(formData, "endTime") || "10:00";
    if (title.length < 3) return { ok: false, error: "Nama agenda minimal 3 karakter." };
    if (!date) return { ok: false, error: "Pilih tanggal agenda." };
    if (end < start) return { ok: false, error: "Waktu selesai tidak boleh sebelum waktu mulai." };
    db.update(events)
      .set({
        title,
        description: optional(formData, "description"),
        kind: text(formData, "kind") || "meeting",
        startsAt: `${date}T${start}:00+07:00`,
        endsAt: `${date}T${end}:00+07:00`,
        location: optional(formData, "location"),
        projectId: optional(formData, "projectId"),
      })
      .where(eq(events.id, eventId))
      .run();
    log(ctx, "event", eventId, "memperbarui agenda", title);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const event = db.select().from(events).where(and(eq(events.id, eventId), eq(events.orgId, ctx.org.id))).get();
    if (!event) return { ok: false, error: "Agenda tidak ditemukan." };
    if (event.createdBy !== ctx.user.id && !["owner", "admin"].includes(ctx.membership.role)) {
      throw new PermissionError("Hanya pembuat agenda atau admin yang dapat menghapus.");
    }
    db.delete(eventParticipants).where(eq(eventParticipants.eventId, eventId)).run();
    db.delete(events).where(eq(events.id, eventId)).run();
    log(ctx, "event", eventId, "menghapus agenda", event.title);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Documents ------------------------------ */

export async function addDocumentAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat mengunggah dokumen.");
    const name = text(formData, "name");
    if (name.length < 2) return { ok: false, error: "Nama dokumen terlalu pendek." };
    const folderId = optional(formData, "folderId");
    if (folderId && !db.select().from(folders).where(and(eq(folders.id, folderId), eq(folders.orgId, ctx.org.id))).get()) {
      return { ok: false, error: "Folder tidak ditemukan." };
    }
    const id = newId("doc");
    const kind = name.split(".").pop()?.toLowerCase() ?? "file";
    db.insert(documents)
      .values({
        id,
        orgId: ctx.org.id,
        folderId,
        name,
        kind,
        size: Number(text(formData, "size") || 0),
        version: 1,
        ownerId: ctx.user.id,
        visibility: text(formData, "visibility") || "company",
        projectId: optional(formData, "projectId"),
        createdAt: nowISO(),
      })
      .run();
    db.insert(documentVersions)
      .values({ id: newId("dvr"), documentId: id, version: 1, note: "Versi awal", authorId: ctx.user.id, createdAt: nowISO() })
      .run();
    log(ctx, "document", id, "mengunggah dokumen", name);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function archiveDocumentAction(documentId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat menghapus dokumen.");
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    db.update(documents).set({ isTrashed: true, deletedAt: nowISO() }).where(eq(documents.id, documentId)).run();
    log(ctx, "document", documentId, "memindahkan dokumen ke arsip", doc.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function restoreDocumentAction(documentId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat memulihkan dokumen.");
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    db.update(documents).set({ isTrashed: false, deletedAt: null }).where(eq(documents.id, documentId)).run();
    log(ctx, "document", documentId, "memulihkan dokumen dari arsip", doc.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteDocumentAction(documentId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat menghapus dokumen.");
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    const versionRows = db.select().from(documentVersions).where(eq(documentVersions.documentId, documentId)).all();
    const keys = new Set<string>();
    if (doc.storageKey) keys.add(doc.storageKey);
    for (const row of versionRows) if (row.storageKey) keys.add(row.storageKey);
    db.delete(documents).where(eq(documents.id, documentId)).run();
    for (const key of keys) {
      try {
        await fs.unlink(path.join(process.cwd(), "data", "uploads", key));
      } catch {
        /* file mungkin sudah tidak ada */
      }
    }
    log(ctx, "document", documentId, "menghapus dokumen permanen", doc.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function createFolderAction(name: string, parentId?: string | null): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat membuat folder.");
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return { ok: false, error: "Nama folder tidak boleh kosong." };
    if (clean.length > 60) return { ok: false, error: "Nama folder maksimal 60 karakter." };
    if (parentId) {
      const parent = db.select().from(folders).where(and(eq(folders.id, parentId), eq(folders.orgId, ctx.org.id))).get();
      if (!parent) return { ok: false, error: "Folder induk tidak ditemukan." };
    }
    const id = newId("fld");
    db.insert(folders).values({ id, orgId: ctx.org.id, name: clean, parentId: parentId ?? null, scope: "company" }).run();
    log(ctx, "folder", id, "membuat folder", clean);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function moveDocumentAction(documentId: string, folderId: string | null): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat memindahkan dokumen.");
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    if (folderId) {
      const folder = db.select().from(folders).where(and(eq(folders.id, folderId), eq(folders.orgId, ctx.org.id))).get();
      if (!folder) return { ok: false, error: "Folder tujuan tidak ditemukan." };
    }
    db.update(documents).set({ folderId }).where(eq(documents.id, documentId)).run();
    log(ctx, "document", documentId, "memindahkan dokumen", folderId ?? "Semua file");
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function copyDocumentAction(documentId: string, folderId?: string | null): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat menyalin dokumen.");
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    if (folderId) {
      const folder = db.select().from(folders).where(and(eq(folders.id, folderId), eq(folders.orgId, ctx.org.id))).get();
      if (!folder) return { ok: false, error: "Folder tujuan tidak ditemukan." };
    }
    const id = newId("doc");
    const dot = doc.name.lastIndexOf(".");
    const copyName = dot > 0 ? `${doc.name.slice(0, dot)} (salinan)${doc.name.slice(dot)}` : `${doc.name} (salinan)`;
    let storageKey: string | null = null;
    if (doc.storageKey) {
      const base = path.posix.basename(doc.storageKey).replace(/^[^-]+-/, "");
      storageKey = path.posix.join(path.posix.dirname(doc.storageKey), `${id}-${base}`);
      try {
        await fs.copyFile(
          path.join(process.cwd(), "data", "uploads", doc.storageKey),
          path.join(process.cwd(), "data", "uploads", storageKey),
        );
      } catch {
        storageKey = null;
      }
    }
    db.transaction((tx) => {
      tx.insert(documents)
        .values({
          id,
          orgId: ctx.org.id,
          folderId: folderId ?? doc.folderId,
          name: copyName,
          kind: doc.kind,
          size: doc.size,
          version: 1,
          ownerId: ctx.user.id,
          visibility: doc.visibility,
          projectId: doc.projectId,
          departmentId: doc.departmentId,
          storageKey,
          createdAt: nowISO(),
        })
        .run();
      tx.insert(documentVersions)
        .values({
          id: newId("dvr"),
          documentId: id,
          version: 1,
          note: `Salinan dari ${doc.name}`,
          name: copyName,
          kind: doc.kind,
          size: doc.size,
          storageKey,
          authorId: ctx.user.id,
          createdAt: nowISO(),
        })
        .run();
    });
    log(ctx, "document", id, "menyalin dokumen", doc.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function uploadDocumentAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat mengunggah dokumen.");
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Pilih file yang akan diunggah." };
    if (file.size > 10 * 1024 * 1024) return { ok: false, error: "Ukuran file maksimal 10 MB." };
    const allowed = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg", "webp", "zip", "txt", "csv", "md"];
    const kind = (file.name.split(".").pop() ?? "file").toLowerCase();
    if (!allowed.includes(kind)) return { ok: false, error: "Jenis file tidak didukung. Gunakan PDF, Office, gambar, ZIP, TXT, CSV, atau MD." };
    const folderId = optional(formData, "folderId");
    if (folderId && !db.select().from(folders).where(and(eq(folders.id, folderId), eq(folders.orgId, ctx.org.id))).get()) {
      return { ok: false, error: "Folder tidak ditemukan." };
    }
    const projectId = optional(formData, "projectId");
    if (projectId && !db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, ctx.org.id))).get()) {
      return { ok: false, error: "Proyek tidak ditemukan." };
    }
    const id = newId("doc");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const storageKey = path.posix.join(ctx.org.id, `${id}-${safeName}`);
    const absolute = path.join(process.cwd(), "data", "uploads", storageKey);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, Buffer.from(await file.arrayBuffer()));
    const name = text(formData, "name") || file.name;
    db.transaction((tx) => {
      tx.insert(documents)
        .values({
          id,
          orgId: ctx.org.id,
          folderId,
          name,
          kind,
          size: file.size,
          version: 1,
          ownerId: ctx.user.id,
          visibility: text(formData, "visibility") || "company",
          projectId,
          storageKey,
          createdAt: nowISO(),
        })
        .run();
      tx.insert(documentVersions)
        .values({
          id: newId("dvr"),
          documentId: id,
          version: 1,
          note: "Versi awal",
          name,
          kind,
          size: file.size,
          storageKey,
          authorId: ctx.user.id,
          createdAt: nowISO(),
        })
        .run();
    });
    log(ctx, "document", id, "mengunggah dokumen", name);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

/** Simpan metadata berkas versi saat ini agar tetap tersedia di riwayat (recycle file lama). */
function snapshotCurrentVersion(documentId: string, actorId: string) {
  const doc = db.select().from(documents).where(eq(documents.id, documentId)).get();
  if (!doc) return;
  const row = db
    .select()
    .from(documentVersions)
    .where(and(eq(documentVersions.documentId, documentId), eq(documentVersions.version, doc.version)))
    .get();
  if (!row) {
    db.insert(documentVersions)
      .values({
        id: newId("dvr"),
        documentId,
        version: doc.version,
        note: "Versi saat ini",
        name: doc.name,
        kind: doc.kind,
        size: doc.size,
        storageKey: doc.storageKey,
        authorId: actorId,
        createdAt: nowISO(),
      })
      .run();
    return;
  }
  if (!row.storageKey && doc.storageKey) {
    db.update(documentVersions)
      .set({ name: doc.name, kind: doc.kind, size: doc.size, storageKey: doc.storageKey })
      .where(eq(documentVersions.id, row.id))
      .run();
  }
}

export async function replaceDocumentFileAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat mengganti file dokumen.");
    const documentId = text(formData, "documentId");
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    const stored = await storeVersionFile(formData.get("file"));
    if (!stored.ok) return { ok: false, error: stored.error };
    snapshotCurrentVersion(documentId, ctx.user.id);
    const nextVersion = doc.version + 1;
    db.transaction((tx) => {
      tx.insert(documentVersions)
        .values({
          id: newId("dvr"),
          documentId,
          version: nextVersion,
          note: text(formData, "note") || `Revisi: ${stored.name}`,
          name: stored.name,
          kind: stored.kind,
          size: stored.size,
          storageKey: stored.storageKey,
          authorId: ctx.user.id,
          createdAt: nowISO(),
        })
        .run();
      tx.update(documents)
        .set({ storageKey: stored.storageKey, kind: stored.kind, size: stored.size, version: nextVersion })
        .where(eq(documents.id, documentId))
        .run();
    });
    log(ctx, "document", documentId, `mengganti file dokumen (v${nextVersion})`, stored.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function restoreDocumentVersionAction(documentId: string, versionId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError("Anda tidak dapat memulihkan versi dokumen.");
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    const version = db
      .select()
      .from(documentVersions)
      .where(and(eq(documentVersions.id, versionId), eq(documentVersions.documentId, documentId)))
      .get();
    if (!version) return { ok: false, error: "Versi tidak ditemukan." };
    if (!version.storageKey) return { ok: false, error: "Versi ini tidak menyimpan berkas (hanya catatan)." };
    snapshotCurrentVersion(documentId, ctx.user.id);
    const nextVersion = doc.version + 1;
    const kind = version.kind ?? doc.kind;
    const size = version.size ?? doc.size;
    db.transaction((tx) => {
      tx.insert(documentVersions)
        .values({
          id: newId("dvr"),
          documentId,
          version: nextVersion,
          note: `Dipulihkan dari v${version.version}`,
          name: version.name ?? doc.name,
          kind,
          size,
          storageKey: version.storageKey,
          authorId: ctx.user.id,
          createdAt: nowISO(),
        })
        .run();
      tx.update(documents)
        .set({ storageKey: version.storageKey, kind, size, version: nextVersion })
        .where(eq(documents.id, documentId))
        .run();
    });
    log(ctx, "document", documentId, `memulihkan versi v${version.version}`, doc.name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addDocumentVersionAction(documentId: string, note: string): Promise<ActionResult> {  const ctx = await requireApp();
  try {
    if (!can(ctx, "document.manage")) throw new PermissionError();
    const doc = db.select().from(documents).where(and(eq(documents.id, documentId), eq(documents.orgId, ctx.org.id))).get();
    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };
    const next = doc.version + 1;
    db.update(documents).set({ version: next }).where(eq(documents.id, documentId)).run();
    db.insert(documentVersions)
      .values({ id: newId("dvr"), documentId, version: next, note: note.trim() || `Versi ${next}`, authorId: ctx.user.id, createdAt: nowISO() })
      .run();
    log(ctx, "document", documentId, "menambah versi", `v${next}`);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Requests & approvals ------------------------------ */

export async function submitRequestAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "request.create")) throw new PermissionError();
    const templateId = text(formData, "templateId");
    const template = templateId
      ? db.select().from(formTemplates).where(and(eq(formTemplates.id, templateId), eq(formTemplates.orgId, ctx.org.id))).get()
      : null;
    if (!template) return { ok: false, error: "Pilih template permintaan." };
    const title = text(formData, "title");
    if (title.length < 3) return { ok: false, error: "Judul permintaan minimal 3 karakter." };
    const fields = db.select().from(formFields).where(eq(formFields.templateId, templateId)).orderBy(formFields.position).all();
    const data: Record<string, string | number> = {};
    for (const field of fields) {
      const raw = text(formData, `field_${field.id}`);
      if (field.required && !raw) return { ok: false, error: `${field.label} wajib diisi.` };
      if (!raw) continue;
      data[field.label] = field.type === "number" ? Number(raw) : raw;
    }
    const amountRaw = data["Jumlah (IDR)"] ?? data["Estimasi biaya (IDR)"];
    const amount = typeof amountRaw === "number" ? amountRaw : null;

    const self = ctx.user.id;
    const managerId = ctx.membership.managerId && ctx.membership.managerId !== self ? ctx.membership.managerId : null;
    const owner = db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(and(eq(memberships.orgId, ctx.org.id), eq(memberships.role, "owner"), eq(memberships.status, "active")))
      .get();
    const finance = db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(and(eq(memberships.orgId, ctx.org.id), eq(memberships.role, "manager"), eq(memberships.status, "active")))
      .all()
      .find((row) => row.userId !== self);
    const level1 = managerId ?? (owner?.userId !== self ? owner?.userId : null) ?? finance?.userId;
    if (!level1) return { ok: false, error: "Tidak ada approver lain di organisasi. Undang minimal satu manajer." };

    const requestId = newId("req");
    db.transaction((tx) => {
      tx.insert(requests)
        .values({
          id: requestId,
          orgId: ctx.org.id,
          templateId,
          requesterId: ctx.user.id,
          title,
          amount,
          data: JSON.stringify(data),
          status: "pending",
          currentStep: 1,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        })
        .run();
      tx.insert(approvalSteps)
        .values({ id: newId("aps"), requestId, position: 1, approverId: level1, status: "pending" })
        .run();
      const level2 = amount && amount >= 1_000_000 ? finance?.userId ?? null : null;
      if (level2 && level2 !== level1 && level2 !== self) {
        tx.insert(approvalSteps)
          .values({ id: newId("aps"), requestId, position: 2, approverId: level2, status: "pending" })
          .run();
      }
    });
    notify(ctx, level1, "approval", "Permintaan baru menunggu persetujuan", title, "/app/approvals");
    log(ctx, "request", requestId, "mengirim permintaan", title);
    refresh();
    return { ok: true, id: requestId };
  } catch (error) {
    return fail(error);
  }
}

export async function decideRequestAction(requestId: string, decision: "approved" | "rejected" | "revision", note: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "approval.decide")) throw new PermissionError("Anda tidak memiliki izin memberi keputusan.");
    const request = db.select().from(requests).where(and(eq(requests.id, requestId), eq(requests.orgId, ctx.org.id))).get();
    if (!request) return { ok: false, error: "Permintaan tidak ditemukan." };
    if (request.requesterId === ctx.user.id) return { ok: false, error: "Anda tidak dapat menyetujui permintaan sendiri." };
    if (!["pending", "submitted"].includes(request.status)) return { ok: false, error: "Permintaan ini sudah diputuskan." };
    const steps = db.select().from(approvalSteps).where(eq(approvalSteps.requestId, requestId)).orderBy(approvalSteps.position).all();
    const current = steps.find((step) => step.position === request.currentStep);
    if (!current) return { ok: false, error: "Tahap persetujuan tidak ditemukan." };
    if (current.approverId !== ctx.user.id) return { ok: false, error: "Anda bukan approver pada tahap ini." };
    if (current.status !== "pending") return { ok: false, error: "Tahap ini sudah diputuskan." };
    if (decision !== "approved" && !note.trim()) return { ok: false, error: "Catatan wajib diisi untuk penolakan atau permintaan revisi." };

    db.transaction((tx) => {
      tx.update(approvalSteps)
        .set({ status: decision, note: note.trim() || null, decidedAt: nowISO() })
        .where(eq(approvalSteps.id, current.id))
        .run();
      if (decision === "approved") {
        const next = steps.find((step) => step.position > current.position && step.status === "pending");
        if (next) {
          tx.update(requests).set({ currentStep: next.position, updatedAt: nowISO(), status: "pending" }).where(eq(requests.id, requestId)).run();
        } else {
          tx.update(requests).set({ status: "approved", updatedAt: nowISO() }).where(eq(requests.id, requestId)).run();
        }
      } else {
        tx.update(requests).set({ status: decision === "revision" ? "revision" : "rejected", updatedAt: nowISO() }).where(eq(requests.id, requestId)).run();
      }
    });

    if (decision === "approved") {
      const next = steps.find((step) => step.position > current.position && step.status === "pending");
      if (next) notify(ctx, next.approverId, "approval", "Permintaan naik ke tahap berikutnya", request.title, "/app/approvals");
      else notify(ctx, request.requesterId, "approval", "Permintaan disetujui", request.title, "/app/requests");
    } else {
      notify(ctx, request.requesterId, "approval", decision === "revision" ? "Permintaan perlu revisi" : "Permintaan ditolak", `${request.title}${note ? ` â€” ${note}` : ""}`, "/app/requests");
    }
    log(ctx, "request", requestId, decision === "approved" ? "menyetujui" : decision === "rejected" ? "menolak" : "meminta revisi", request.title);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Settings ------------------------------ */

export async function changePasswordAction(currentPassword: string, nextPassword: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const { verifyPassword } = await import("@/lib/password");
    if (!verifyPassword(currentPassword, ctx.user.passwordHash)) return { ok: false, error: "Kata sandi saat ini tidak cocok." };
    if (nextPassword.length < 8) return { ok: false, error: "Kata sandi baru minimal 8 karakter." };
    db.update(users).set({ passwordHash: hashPassword(nextPassword) }).where(eq(users.id, ctx.user.id)).run();
    log(ctx, "user", ctx.user.id, "mengubah kata sandi", null);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {  const ctx = await requireApp();
  try {
    const name = text(formData, "name");
    if (name.length < 2) return { ok: false, error: "Nama minimal 2 karakter." };
    db.update(users)
      .set({ name, title: optional(formData, "title"), phone: optional(formData, "phone") })
      .where(eq(users.id, ctx.user.id))
      .run();
    log(ctx, "user", ctx.user.id, "memperbarui profil", name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateAvatarAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Pilih gambar profil." };
    if (file.size > 200 * 1024) return { ok: false, error: "Ukuran foto maksimal 200 KB." };
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return { ok: false, error: "Gunakan gambar JPG, PNG, atau WebP." };
    }
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const key = path.posix.join("avatars", `${ctx.user.id}-${Date.now()}.${extension}`);
    const absolute = path.join(process.cwd(), "data", "uploads", key);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, Buffer.from(await file.arrayBuffer()));
    const previous = ctx.user.avatarKey;
    db.update(users).set({ avatarKey: key }).where(eq(users.id, ctx.user.id)).run();
    if (previous) {
      try {
        await fs.unlink(path.join(process.cwd(), "data", "uploads", previous));
      } catch {
        /* previous file already gone */
      }
    }
    log(ctx, "user", ctx.user.id, "memperbarui foto profil", null);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function removeAvatarAction(): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (ctx.user.avatarKey) {
      try {
        await fs.unlink(path.join(process.cwd(), "data", "uploads", ctx.user.avatarKey));
      } catch {
        /* already gone */
      }
    }
    db.update(users).set({ avatarKey: null }).where(eq(users.id, ctx.user.id)).run();
    log(ctx, "user", ctx.user.id, "menghapus foto profil", null);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateOrganizationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "org.manage")) throw new PermissionError("Hanya owner dan admin yang dapat mengubah organisasi.");
    const name = text(formData, "name");
    if (name.length < 2) return { ok: false, error: "Nama organisasi minimal 2 karakter." };
    const workStart = text(formData, "workStart") || "09:00";
    const workEnd = text(formData, "workEnd") || "18:00";
    if (workEnd <= workStart) return { ok: false, error: "Jam selesai harus setelah jam mulai." };
    db.update(organizations)
      .set({
        name,
        address: optional(formData, "address"),
        timezone: text(formData, "timezone") || "Asia/Jakarta",
        workStart,
        workEnd,
      })
      .where(eq(organizations.id, ctx.org.id))
      .run();
    log(ctx, "organization", ctx.org.id, "memperbarui organisasi", name);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateNotificationPrefsAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const keys = ["task", "comment", "mention", "approval", "message", "event", "document"];
    const prefs: Record<string, boolean> = {};
    for (const key of keys) prefs[key] = formData.get(`pref_${key}`) === "on";
    db.update(memberships).set({ notificationPrefs: JSON.stringify(prefs) }).where(eq(memberships.id, ctx.membership.id)).run();
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function inviteMemberAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "member.manage")) throw new PermissionError("Anda tidak dapat mengundang anggota.");
    const email = text(formData, "email").toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Alamat email tidak valid." };
    const role = text(formData, "role") || "staff";
    if (!["admin", "manager", "leader", "staff", "guest"].includes(role)) return { ok: false, error: "Peran tidak valid." };
    const departmentId = optional(formData, "departmentId");
    if (departmentId && !db.select().from(departments).where(and(eq(departments.id, departmentId), eq(departments.orgId, ctx.org.id))).get()) {
      return { ok: false, error: "Departemen tidak ditemukan." };
    }
    const existingMember = db
      .select()
      .from(memberships)
      .where(and(eq(memberships.orgId, ctx.org.id), eq(memberships.status, "active")))
      .all()
      .find((membership) => {
        const row = db.select().from(users).where(eq(users.id, membership.userId)).get();
        return row?.email === email;
      });
    if (existingMember) return { ok: false, error: "Email ini sudah menjadi anggota organisasi." };
    let user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      user = {
        id: newId("usr"),
        name: email.split("@")[0],
        email,
        passwordHash: hashPassword(newId("tmp")),
        title: "Anggota baru",
        phone: null,
        avatarColor: "#0f6cbd",
        avatarKey: null,
        createdAt: nowISO(),
      };
      db.insert(users).values(user).run();
    }
    const already = db
      .select()
      .from(memberships)
      .where(and(eq(memberships.orgId, ctx.org.id), eq(memberships.userId, user.id)))
      .get();
    if (already) return { ok: false, error: "Pengguna ini sudah memiliki keanggotaan di organisasi Anda." };
    const { token, hash } = newInviteToken();
    db.insert(memberships)
      .values({
        id: newId("mem"),
        orgId: ctx.org.id,
        userId: user.id,
        role,
        departmentId,
        managerId: ctx.user.id,
        status: "invited",
        inviteTokenHash: hash,
        inviteExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .run();
    log(ctx, "organization", ctx.org.id, "mengundang anggota", email);
    refresh();
    return { ok: true, token, message: `Undangan untuk ${email} dibuat. Tautan berlaku 7 hari.` };
  } catch (error) {
    return fail(error);
  }
}

export async function updateMemberRoleAction(membershipId: string, role: string, departmentId: string | null): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "member.manage")) throw new PermissionError();
    if (!["admin", "manager", "leader", "staff", "guest"].includes(role)) return { ok: false, error: "Peran tidak valid." };
    const membership = db.select().from(memberships).where(and(eq(memberships.id, membershipId), eq(memberships.orgId, ctx.org.id))).get();
    if (!membership) return { ok: false, error: "Anggota tidak ditemukan." };
    if (membership.role === "owner") return { ok: false, error: "Peran owner tidak dapat diubah dari halaman ini." };
    if (membership.userId === ctx.user.id) return { ok: false, error: "Anda tidak dapat mengubah peran sendiri." };
    if (departmentId && !db.select().from(departments).where(and(eq(departments.id, departmentId), eq(departments.orgId, ctx.org.id))).get()) {
      return { ok: false, error: "Departemen tidak ditemukan." };
    }
    db.update(memberships).set({ role, departmentId }).where(eq(memberships.id, membershipId)).run();
    log(ctx, "member", membership.userId, "mengubah peran", role);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setMemberStatusAction(membershipId: string, status: "active" | "disabled"): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "member.manage")) throw new PermissionError();
    const membership = db.select().from(memberships).where(and(eq(memberships.id, membershipId), eq(memberships.orgId, ctx.org.id))).get();
    if (!membership) return { ok: false, error: "Anggota tidak ditemukan." };
    if (membership.role === "owner") return { ok: false, error: "Owner tidak dapat dinonaktifkan." };
    if (membership.userId === ctx.user.id) return { ok: false, error: "Anda tidak dapat menonaktifkan akun sendiri." };
    db.update(memberships).set({ status }).where(eq(memberships.id, membershipId)).run();
    log(ctx, "member", membership.userId, status === "disabled" ? "menonaktifkan anggota" : "mengaktifkan anggota", null);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function createDepartmentAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "department.manage")) throw new PermissionError();
    const name = text(formData, "name");
    if (name.length < 2) return { ok: false, error: "Nama departemen minimal 2 karakter." };
    const duplicate = db.select().from(departments).where(and(eq(departments.orgId, ctx.org.id), eq(departments.name, name))).get();
    if (duplicate) return { ok: false, error: "Departemen dengan nama ini sudah ada." };
    const id = newId("dep");
    db.insert(departments)
      .values({ id, orgId: ctx.org.id, name, headUserId: optional(formData, "headUserId"), color: text(formData, "color") || "#0f6cbd" })
      .run();
    log(ctx, "department", id, "membuat departemen", name);
    refresh();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function updateDepartmentAction(departmentId: string, name: string, headUserId: string | null): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "department.manage")) throw new PermissionError();
    const dept = db.select().from(departments).where(and(eq(departments.id, departmentId), eq(departments.orgId, ctx.org.id))).get();
    if (!dept) return { ok: false, error: "Departemen tidak ditemukan." };
    if (name.trim().length < 2) return { ok: false, error: "Nama departemen minimal 2 karakter." };
    if (headUserId && !memberCheck(ctx.org.id, headUserId)) return { ok: false, error: "Kepala departemen bukan anggota aktif." };
    db.update(departments).set({ name: name.trim(), headUserId }).where(eq(departments.id, departmentId)).run();
    log(ctx, "department", departmentId, "memperbarui departemen", name.trim());
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateRolePermissionsAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    if (!can(ctx, "role.manage")) throw new PermissionError("Hanya owner dan admin yang dapat mengubah izin.");
    const roleKey = text(formData, "roleKey");
    if (roleKey === "owner") return { ok: false, error: "Izin owner tidak dapat dikurangi." };
    const role = db.select().from(roles).where(and(eq(roles.orgId, ctx.org.id), eq(roles.key, roleKey))).get();
    if (!role) return { ok: false, error: "Peran tidak ditemukan." };
    const permissions = formData.getAll("permissions").map(String);
    db.update(roles).set({ permissions: JSON.stringify(permissions) }).where(eq(roles.id, role.id)).run();
    log(ctx, "role", role.id, "memperbarui izin", `${roleKey}: ${permissions.length} izin`);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------ Notifications ------------------------------ */

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const row = db.select().from(notifications).where(and(eq(notifications.id, notificationId), eq(notifications.userId, ctx.user.id))).get();
    if (!row) return { ok: false, error: "Notifikasi tidak ditemukan." };
    db.update(notifications).set({ readAt: nowISO() }).where(eq(notifications.id, notificationId)).run();
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    db.update(notifications)
      .set({ readAt: nowISO() })
      .where(and(eq(notifications.orgId, ctx.org.id), eq(notifications.userId, ctx.user.id), isNull(notifications.readAt)))
      .run();
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function signOutAction() {
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
  const { redirect } = await import("next/navigation");
  redirect("/");
}
