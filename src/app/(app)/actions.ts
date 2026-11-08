"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db/client";
import {
  activity,
  approvalSteps,
  attachments,
  checklistItems,
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
  milestones,
  notifications,
  organizations,
  projectMembers,
  projects,
  projectStatuses,
  requests,
  roles,
  tasks,
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
  db.insert(notifications)
    .values({ id: newId("ntf"), orgId: ctx.org.id, userId, kind, title, body, href })
    .run();
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
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
    const statusId = optional(formData, "statusId");
    if (statusId && project) {
      const status = db.select().from(projectStatuses).where(and(eq(projectStatuses.id, statusId), eq(projectStatuses.projectId, project.id))).get();
      if (!status) return { ok: false, error: "Status bukan milik proyek ini." };
    }
    const max = db
      .select({ value: sql<number>`coalesce(max(${tasks.number}), 0)` })
      .from(tasks)
      .where(eq(tasks.orgId, ctx.org.id))
      .get();
    const number = (max?.value ?? 0) + 1;
    const id = newId("tsk");
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
    for (const [key, value] of Object.entries(patch)) {
      if (!allowed.includes(key)) continue;
      if (key === "statusId" && value) {
        const status = db.select().from(projectStatuses).where(eq(projectStatuses.id, value)).get();
        if (!status) return { ok: false, error: "Status tidak valid." };
        if (task.projectId && status.projectId !== task.projectId) return { ok: false, error: "Status bukan milik proyek ini." };
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

/* ------------------------------ Chat ------------------------------ */

export async function sendMessageAction(conversationId: string, body: string): Promise<ActionResult> {
  const ctx = await requireApp();
  try {
    const membership = db
      .select()
      .from(conversationMembers)
      .where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, ctx.user.id)))
      .get();
    if (!membership) return { ok: false, error: "Anda bukan anggota percakapan ini." };
    if (!body.trim()) return { ok: false, error: "Pesan tidak boleh kosong." };
    db.insert(messages)
      .values({ id: newId("msg"), conversationId, authorId: ctx.user.id, body: body.trim(), createdAt: nowISO() })
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
      notify(ctx, userId, "event", "Undangan agenda", `${title} · ${date} ${start}`, "/app/calendar");
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
        .values({ id: newId("dvr"), documentId: id, version: 1, note: "Versi awal", authorId: ctx.user.id, createdAt: nowISO() })
        .run();
    });
    log(ctx, "document", id, "mengunggah dokumen", name);
    refresh();
    return { ok: true, id };
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
      notify(ctx, request.requesterId, "approval", decision === "revision" ? "Permintaan perlu revisi" : "Permintaan ditolak", `${request.title}${note ? ` — ${note}` : ""}`, "/app/requests");
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
        avatarColor: "#365fd1",
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
      .values({ id, orgId: ctx.org.id, name, headUserId: optional(formData, "headUserId"), color: text(formData, "color") || "#365fd1" })
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
