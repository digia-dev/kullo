import { and, asc, desc, eq, inArray, isNull, ne } from "drizzle-orm";
import { db } from "@/db/client";
import {
  activity,
  approvalSteps,
  attachments,
  checklistItems,
  checklists,
  comments,
  commentAttachments,
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
  messageAttachments,
  messageReactions,
  messages,
  milestones,
  notifications,
  projectMembers,
  projects,
  projectStatuses,
  requests,
  roles,
  taskCollaborators,
  taskDependencies,
  taskLabels,
  taskLabelLinks,
  tasks,
  timeLogs,
  users,
} from "@/db/schema";
import { daysFromToday, todayISO } from "@/lib/utils";
import { deleteObject } from "@/lib/storage";

export type Person = {
  id: string;
  membershipId: string;
  name: string;
  email: string;
  title: string | null;
  phone: string | null;
  avatarColor: string;
  role: string;
  status: string;
  departmentId: string | null;
  departmentName: string | null;
  managerId: string | null;
  joinedAt: string;
  openTasks?: number;
};

export async function getPeople(orgId: string): Promise<Person[]> {
  const rows = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        title: users.title,
        phone: users.phone,
        avatarColor: users.avatarColor,
        avatarKey: users.avatarKey,
        createdAt: users.createdAt,
      },
      membershipId: memberships.id,
      role: memberships.role,
      status: memberships.status,
      departmentId: memberships.departmentId,
      departmentName: departments.name,
      managerId: memberships.managerId,
      joinedAt: memberships.joinedAt,
      notificationPrefs: memberships.notificationPrefs,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .leftJoin(departments, eq(departments.id, memberships.departmentId))
    .where(eq(memberships.orgId, orgId))
    .orderBy(asc(users.name));

  const open = await db
    .select({ assigneeId: tasks.assigneeId, statusId: tasks.statusId })
    .from(tasks)
    .where(and(eq(tasks.orgId, orgId), isNull(tasks.archivedAt)));
  const doneStatuses = new Set(
    (
      await db
        .select({ id: projectStatuses.id })
        .from(projectStatuses)
        .where(eq(projectStatuses.category, "done"))
    ).map((row) => row.id),
  );
  const openByUser = new Map<string, number>();
  for (const task of open) {
    if (!task.assigneeId || (task.statusId && doneStatuses.has(task.statusId))) continue;
    openByUser.set(task.assigneeId, (openByUser.get(task.assigneeId) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.user.id,
    membershipId: row.membershipId,
    name: row.user.name,
    email: row.user.email,
    title: row.user.title,
    phone: row.user.phone,
    avatarColor: row.user.avatarColor,
    role: row.role,
    status: row.status,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    managerId: row.managerId,
    joinedAt: row.joinedAt,
    openTasks: openByUser.get(row.user.id) ?? 0,
  }));
}

export type DepartmentRow = {
  id: string;
  name: string;
  color: string;
  headUserId: string | null;
  headName: string | null;
  members: number;
  openTasks: number;
  projects: number;
};

export async function getDepartments(orgId: string): Promise<DepartmentRow[]> {
  const depts = await db.select().from(departments).where(eq(departments.orgId, orgId)).orderBy(asc(departments.name));
  const people = await getPeople(orgId);
  const projectRows = await db.select({ departmentId: projects.departmentId }).from(projects).where(eq(projects.orgId, orgId));
  const taskRows = await getTaskRows(orgId);

  return depts.map((dept) => {
    const head = people.find((person) => person.id === dept.headUserId);
    return {
      id: dept.id,
      name: dept.name,
      color: dept.color,
      headUserId: dept.headUserId,
      headName: head?.name ?? null,
      members: people.filter((person) => person.departmentId === dept.id).length,
      openTasks: taskRows.filter(
        (task) => !task.done && people.find((person) => person.id === task.assigneeId)?.departmentId === dept.id,
      ).length,
      projects: projectRows.filter((project) => project.departmentId === dept.id).length,
    };
  });
}

export type ProjectRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  departmentId: string | null;
  departmentName: string | null;
  managerId: string | null;
  managerName: string | null;
  ownerId: string | null;
  ownerName: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  dueDate: string | null;
  progress: number;
  archivedAt: string | null;
  taskTotal: number;
  taskDone: number;
  memberCount: number;
  memberIds: string[];
  milestoneTotal: number;
  milestoneDone: number;
};

export async function getProjects(orgId: string, options?: { includeArchived?: boolean }): Promise<ProjectRow[]> {
  const rows = await db.select().from(projects).where(eq(projects.orgId, orgId)).orderBy(desc(projects.createdAt));
  const filtered = options?.includeArchived ? rows : rows.filter((project) => !project.archivedAt);
  const people = await getPeople(orgId);
  const taskRows = await getTaskRows(orgId);
  const memberRows = await db.select().from(projectMembers);
  const milestoneRows = await db.select().from(milestones);
  const deptRows = await db.select().from(departments).where(eq(departments.orgId, orgId));

  return filtered.map((project) => {
    const projectTasks = taskRows.filter((task) => task.projectId === project.id);
    const done = projectTasks.filter((task) => task.done).length;
    const projectMilestones = milestoneRows.filter((milestone) => milestone.projectId === project.id);
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      description: project.description,
      departmentId: project.departmentId,
      departmentName: deptRows.find((dept) => dept.id === project.departmentId)?.name ?? null,
      managerId: project.managerId,
      managerName: people.find((person) => person.id === project.managerId)?.name ?? null,
      ownerId: project.ownerId,
      ownerName: people.find((person) => person.id === project.ownerId)?.name ?? null,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      dueDate: project.dueDate,
      progress: projectTasks.length ? Math.round((done / projectTasks.length) * 100) : project.progress,
      archivedAt: project.archivedAt,
      taskTotal: projectTasks.length,
      taskDone: done,
      memberCount: memberRows.filter((row) => row.projectId === project.id).length,
      memberIds: memberRows.filter((row) => row.projectId === project.id).map((row) => row.userId),
      milestoneTotal: projectMilestones.length,
      milestoneDone: projectMilestones.filter((milestone) => milestone.done).length,
    };
  });
}

export type TaskRow = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  projectId: string | null;
  projectCode: string | null;
  projectName: string | null;
  statusId: string | null;
  statusName: string | null;
  statusCategory: string | null;
  statusPosition: number;
  priority: string;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
  reporterId: string | null;
  reporterName: string | null;
  parentTaskId: string | null;
  startDate: string | null;
  dueDate: string | null;
  estimateHours: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  done: boolean;
  overdue: boolean;
  labels: Array<{ id: string; name: string; color: string }>;
  collaboratorIds: string[];
  dependencyIds: string[];
  blockedByCount: number;
  commentCount: number;
  attachmentCount: number;
  checklistDone: number;
  checklistTotal: number;
};

export async function getTaskRows(orgId: string): Promise<TaskRow[]> {
  const taskRows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.orgId, orgId), isNull(tasks.archivedAt)))
    .orderBy(desc(tasks.number));
  return await enrichTasks(orgId, taskRows);
}

async function enrichTasks(orgId: string, taskRows: Array<typeof tasks.$inferSelect>): Promise<TaskRow[]> {
  if (taskRows.length === 0) return [];
  const projectRows = await db.select().from(projects).where(eq(projects.orgId, orgId));
  const statusRows = await db.select().from(projectStatuses);
  const people = await getPeople(orgId);
  const linkRows = await db
    .select({ taskId: taskLabelLinks.taskId, labelId: taskLabels.id, name: taskLabels.name, color: taskLabels.color })
    .from(taskLabelLinks)
    .innerJoin(taskLabels, eq(taskLabels.id, taskLabelLinks.labelId));
  const commentRows = await db.select({ taskId: comments.taskId }).from(comments);
  const attachmentRows = await db.select({ taskId: attachments.taskId }).from(attachments);
  const checklistRows = await db
    .select({ taskId: checklists.taskId, done: checklistItems.done })
    .from(checklists)
    .leftJoin(checklistItems, eq(checklistItems.checklistId, checklists.id));
  const collaboratorRows = await db.select().from(taskCollaborators);
  const dependencyRows = await db.select().from(taskDependencies);
  const taskById = new Map(taskRows.map((row) => [row.id, row]));
  const statusById = new Map(statusRows.map((row) => [row.id, row]));

  return taskRows.map((task) => {
    const project = projectRows.find((row) => row.id === task.projectId);
    const status = statusRows.find((row) => row.id === task.statusId);
    const assignee = people.find((person) => person.id === task.assigneeId);
    const reporter = people.find((person) => person.id === task.reporterId);
    const done = status?.category === "done";
    const checklist = checklistRows.filter((row) => row.taskId === task.id);
    const dependencyIds = dependencyRows.filter((row) => row.taskId === task.id).map((row) => row.dependsOnId);
    const blockedByCount = dependencyIds.filter((dependencyId) => {
      const dependency = taskById.get(dependencyId);
      if (!dependency) return false;
      return statusById.get(dependency.statusId ?? "")?.category !== "done";
    }).length;
    return {
      id: task.id,
      number: task.number,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      projectCode: project?.code ?? null,
      projectName: project?.name ?? null,
      statusId: task.statusId,
      statusName: status?.name ?? null,
      statusCategory: status?.category ?? null,
      statusPosition: status?.position ?? 0,
      priority: task.priority,
      assigneeId: task.assigneeId,
      assigneeName: assignee?.name ?? null,
      assigneeColor: assignee?.avatarColor ?? null,
      reporterId: task.reporterId,
      reporterName: reporter?.name ?? null,
      parentTaskId: task.parentTaskId,
      startDate: task.startDate,
      dueDate: task.dueDate,
      estimateHours: task.estimateHours,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      done: Boolean(done),
      overdue: Boolean(task.dueDate && !done && daysFromToday(task.dueDate) < 0),
      labels: linkRows.filter((row) => row.taskId === task.id).map(({ labelId, name, color }) => ({ id: labelId, name, color })),
      collaboratorIds: collaboratorRows.filter((row) => row.taskId === task.id).map((row) => row.userId),
      dependencyIds,
      blockedByCount,
      commentCount: commentRows.filter((row) => row.taskId === task.id).length,
      attachmentCount: attachmentRows.filter((row) => row.taskId === task.id).length,
      checklistDone: checklist.filter((row) => row.done).length,
      checklistTotal: checklist.length,
    };
  });
}

export type ProjectBundle = {
  project: ProjectRow;
  statuses: Array<typeof projectStatuses.$inferSelect>;
  tasks: TaskRow[];
  members: Person[];
  milestones: Array<typeof milestones.$inferSelect>;
  documents: Array<{ id: string; name: string; kind: string; size: number; version: number; createdAt: string }>;
  activity: Array<{ id: string; actorName: string; verb: string; meta: string | null; createdAt: string }>;
};

export async function getProjectBundle(orgId: string, projectId: string): Promise<ProjectBundle | null> {
  const project = (await getProjects(orgId, { includeArchived: true })).find((row) => row.id === projectId);
  if (!project) return null;
  const statuses = await db
    .select()
    .from(projectStatuses)
    .where(eq(projectStatuses.projectId, projectId))
    .orderBy(asc(projectStatuses.position));
  const tasksAll = await enrichTasks(
    orgId,
    await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.orgId, orgId), eq(tasks.projectId, projectId), isNull(tasks.archivedAt)))
      .orderBy(asc(tasks.number)),
  );
  const memberIds = await db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, projectId));
  const people = await getPeople(orgId);
  const members = memberIds.map((row) => people.find((person) => person.id === row.userId)).filter(Boolean) as Person[];
  const projectMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.position));
  const docRows = await db.select().from(documents).where(and(eq(documents.orgId, orgId), eq(documents.projectId, projectId)));
  const activityRows = await db
    .select()
    .from(activity)
    .where(and(eq(activity.orgId, orgId), eq(activity.entityType, "project"), eq(activity.entityId, projectId)))
    .orderBy(desc(activity.createdAt))
    .limit(12);
  const peopleMap = new Map(people.map((person) => [person.id, person]));

  return {
    project,
    statuses,
    tasks: tasksAll,
    members,
    milestones: projectMilestones,
    documents: docRows.map((doc) => ({
      id: doc.id,
      name: doc.name,
      kind: doc.kind,
      size: doc.size,
      version: doc.version,
      createdAt: doc.createdAt,
    })),
    activity: activityRows.map((row) => ({
      id: row.id,
      actorName: row.actorId ? peopleMap.get(row.actorId)?.name ?? "Sistem" : "Sistem",
      verb: row.verb,
      meta: row.meta,
      createdAt: row.createdAt,
    })),
  };
}

export type TaskDetail = {
  task: TaskRow;
  comments: Array<{
    id: string;
    authorId: string;
    body: string;
    authorName: string;
    authorColor: string;
    createdAt: string;
    parentId: string | null;
    attachments: Array<{ id: string; name: string; kind: string }>;
  }>;
  checklists: Array<{ id: string; title: string; items: Array<{ id: string; text: string; done: boolean }> }>;
  attachments: Array<{ id: string; documentId: string | null; name: string; kind: string; size: number; createdAt: string }>;
  timeLogs: Array<{ id: string; minutes: number; note: string | null; loggedOn: string; userName: string }>;
  collaborators: Array<{ id: string; name: string; avatarColor: string }>;
  subtasks: TaskRow[];
  dependencies: TaskRow[];
  dependents: TaskRow[];
  dependencyCandidates: TaskRow[];
  activity: Array<{ id: string; actorName: string; verb: string; meta: string | null; createdAt: string }>;
  projectStatuses: Array<typeof projectStatuses.$inferSelect>;
  members: Person[];
  availableLabels: Array<{ id: string; name: string; color: string }>;
  canEdit: boolean;
};

export async function getTaskDetail(orgId: string, taskId: string, canEdit: boolean): Promise<TaskDetail | null> {
  const allTasks = await getTaskRows(orgId);
  const task = allTasks.find((row) => row.id === taskId);
  if (!task) return null;
  const people = await getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const commentRows = await db.select().from(comments).where(eq(comments.taskId, taskId)).orderBy(asc(comments.createdAt));
  const commentAttachmentRows = await db
    .select({ commentId: commentAttachments.commentId, id: documents.id, name: documents.name, kind: documents.kind })
    .from(commentAttachments)
    .innerJoin(documents, eq(documents.id, commentAttachments.documentId));
  const checklistRows = await db.select().from(checklists).where(eq(checklists.taskId, taskId)).orderBy(asc(checklists.position));
  const itemRows = checklistRows.length
    ? await db
        .select()
        .from(checklistItems)
        .where(inArray(checklistItems.checklistId, checklistRows.map((row) => row.id)))
        .orderBy(asc(checklistItems.position))
    : [];
  const attachmentRows = await db.select().from(attachments).where(eq(attachments.taskId, taskId));
  const logRows = await db.select().from(timeLogs).where(eq(timeLogs.taskId, taskId)).orderBy(desc(timeLogs.loggedOn));
  const collaboratorRows = await db.select().from(taskCollaborators).where(eq(taskCollaborators.taskId, taskId));
  const activityRows = await db
    .select()
    .from(activity)
    .where(and(eq(activity.orgId, orgId), eq(activity.entityType, "task"), eq(activity.entityId, taskId)))
    .orderBy(desc(activity.createdAt))
    .limit(20);
  const subtasks = allTasks.filter((row) => row.parentTaskId === taskId);
  const dependencies = task.dependencyIds
    .map((dependencyId) => allTasks.find((row) => row.id === dependencyId))
    .filter((row): row is TaskRow => Boolean(row));
  const dependents = allTasks.filter((row) => row.dependencyIds.includes(taskId));
  const dependencyCandidates = allTasks.filter(
    (row) => row.id !== taskId && !task.dependencyIds.includes(row.id) && !dependents.some((dependent) => dependent.id === row.id),
  );
  const statusRows = task.projectId
    ? await db.select().from(projectStatuses).where(eq(projectStatuses.projectId, task.projectId)).orderBy(asc(projectStatuses.position))
    : [];
  const memberIds = task.projectId
    ? await db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, task.projectId))
    : [];
  const members = memberIds
    .map((row) => peopleMap.get(row.userId))
    .filter(Boolean) as Person[];

  return {
    task,
    comments: commentRows.map((row) => ({
      id: row.id,
      authorId: row.authorId,
      body: row.body,
      authorName: peopleMap.get(row.authorId)?.name ?? "Anggota",
      authorColor: peopleMap.get(row.authorId)?.avatarColor ?? "#0f6cbd",
      createdAt: row.createdAt,
      parentId: row.parentId,
      attachments: commentAttachmentRows
        .filter((attachment) => attachment.commentId === row.id)
        .map((attachment) => ({ id: attachment.id, name: attachment.name, kind: attachment.kind })),
    })),
    checklists: checklistRows.map((list) => ({
      id: list.id,
      title: list.title,
      items: itemRows
        .filter((item) => item.checklistId === list.id)
        .map((item) => ({ id: item.id, text: item.text, done: item.done })),
    })),
    attachments: attachmentRows.map((row) => ({
      id: row.id,
      documentId: row.documentId,
      name: row.name,
      kind: row.kind,
      size: row.size,
      createdAt: row.createdAt,
    })),
    timeLogs: logRows.map((row) => ({
      id: row.id,
      minutes: row.minutes,
      note: row.note,
      loggedOn: row.loggedOn,
      userName: peopleMap.get(row.userId)?.name ?? "Anggota",
    })),
    collaborators: collaboratorRows.map((row) => {
      const person = peopleMap.get(row.userId);
      return { id: row.userId, name: person?.name ?? "Anggota", avatarColor: person?.avatarColor ?? "#0f6cbd" };
    }),
    subtasks,
    dependencies,
    dependents,
    dependencyCandidates,
    activity: activityRows.map((row) => ({
      id: row.id,
      actorName: row.actorId ? peopleMap.get(row.actorId)?.name ?? "Sistem" : "Sistem",
      verb: row.verb,
      meta: row.meta,
      createdAt: row.createdAt,
    })),
    projectStatuses: statusRows,
    members: members.length ? members : people,
    availableLabels: await db
      .select({ id: taskLabels.id, name: taskLabels.name, color: taskLabels.color })
      .from(taskLabels)
      .where(eq(taskLabels.orgId, orgId))
      .orderBy(asc(taskLabels.name)),
    canEdit,
  };
}

export async function getDashboard(orgId: string, userId: string) {
  const taskRows = await getTaskRows(orgId);
  const myTasks = taskRows.filter((task) => task.assigneeId === userId && !task.done);
  const dueToday = myTasks.filter((task) => task.dueDate === todayISO());
  const overdue = myTasks.filter((task) => task.overdue);
  const completed = taskRows.filter((task) => task.assigneeId === userId && task.done);
  const projectRows = (await getProjects(orgId)).filter((project) => project.status === "active");
  const people = await getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const eventRows = (
    await db
      .select()
      .from(events)
      .where(eq(events.orgId, orgId))
      .orderBy(asc(events.startsAt))
  )
    .filter((event) => new Date(event.startsAt).getTime() >= Date.now() - 86400000)
    .slice(0, 5);
  const activityRows = await db
    .select()
    .from(activity)
    .where(eq(activity.orgId, orgId))
    .orderBy(desc(activity.createdAt))
    .limit(9);
  const pendingSteps = await db
    .select({ step: approvalSteps, request: requests })
    .from(approvalSteps)
    .innerJoin(requests, eq(requests.id, approvalSteps.requestId))
    .where(and(eq(approvalSteps.approverId, userId), eq(approvalSteps.status, "pending"), eq(requests.orgId, orgId)));

  return {
    myTasks,
    dueToday,
    overdue,
    completed,
    projects: projectRows,
    events: eventRows,
    activity: activityRows.map((row) => ({
      id: row.id,
      actorId: row.actorId,
      actorName: row.actorId ? peopleMap.get(row.actorId)?.name ?? "Sistem" : "Sistem",
      actorColor: row.actorId ? peopleMap.get(row.actorId)?.avatarColor ?? "#0f6cbd" : "#58617a",
      verb: row.verb,
      meta: row.meta,
      createdAt: row.createdAt,
      entityType: row.entityType,
      entityId: row.entityId,
    })),
    approvals: pendingSteps.map((row) => ({ id: row.request.id, title: row.request.title, amount: row.request.amount })),
    workload: people.map((person) => ({
      id: person.id,
      name: person.name,
      color: person.avatarColor,
      open: taskRows.filter((task) => task.assigneeId === person.id && !task.done).length,
    })),
  };
}

export async function getNotifications(orgId: string, userId: string, limit = 8) {
  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.orgId, orgId), eq(notifications.userId, userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(orgId: string, userId: string) {
  return (await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.orgId, orgId), eq(notifications.userId, userId), isNull(notifications.readAt)))).length;
}

export async function getMyWorkCount(orgId: string, userId: string) {
  return (await getTaskRows(orgId)).filter((task) => task.assigneeId === userId && !task.done).length;
}

export async function getPendingApprovalCount(orgId: string, userId: string) {
  return (await db
    .select({ id: approvalSteps.id })
    .from(approvalSteps)
    .innerJoin(requests, eq(requests.id, approvalSteps.requestId))
    .where(
      and(
        eq(approvalSteps.approverId, userId),
        eq(approvalSteps.status, "pending"),
        eq(requests.orgId, orgId),
        inArray(requests.status, ["pending", "submitted"]),
      ),
    )).length;
}

export async function getEvents(orgId: string) {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.orgId, orgId))
    .orderBy(asc(events.startsAt));
  return await Promise.all(
    rows.map(async (event) => {
      const participants = await db.select().from(eventParticipants).where(eq(eventParticipants.eventId, event.id));
      return { ...event, participantCount: participants.length };
    }),
  );
}

export async function getConversations(ctx: { org: { id: string }; user: { id: string } }) {
  const memberRows = await db
    .select({ conversation: conversations })
    .from(conversationMembers)
    .innerJoin(conversations, eq(conversations.id, conversationMembers.conversationId))
    .where(and(eq(conversationMembers.userId, ctx.user.id), eq(conversations.orgId, ctx.org.id)));
  const allMessages = (await db.select().from(messages)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const people = await getPeople(ctx.org.id);
  const peopleMap = new Map(people.map((person) => [person.id, person]));

  const list = await Promise.all(
    memberRows.map(async ({ conversation }) => {
      const convMessages = allMessages.filter((message) => message.conversationId === conversation.id);
      const last = convMessages[convMessages.length - 1];
      const membership = (
        await db
          .select()
          .from(conversationMembers)
          .where(and(eq(conversationMembers.conversationId, conversation.id), eq(conversationMembers.userId, ctx.user.id)))
      )[0];
      const unread = convMessages.filter(
        (message) => message.authorId !== ctx.user.id && (!membership?.lastReadAt || message.createdAt > membership.lastReadAt),
      ).length;
      let displayName = conversation.name;
      if (conversation.kind === "dm") {
        const members = await db
          .select()
          .from(conversationMembers)
          .where(eq(conversationMembers.conversationId, conversation.id));
        const otherId = members.find((member) => member.userId !== ctx.user.id)?.userId;
        if (otherId) displayName = peopleMap.get(otherId)?.name ?? displayName;
      }
      return {
        id: conversation.id,
        kind: conversation.kind,
        name: displayName,
        description: conversation.description,
        icon: conversation.icon,
        projectId: conversation.projectId,
        departmentId: conversation.departmentId,
        lastMessage: last?.body ?? null,
        lastAuthor: last ? peopleMap.get(last.authorId)?.name ?? null : null,
        lastAt: last?.createdAt ?? null,
        unread,
      };
    }),
  );

  return list.sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
}

export async function getConversation(ctx: { org: { id: string }; user: { id: string } }, conversationId?: string) {
  const list = await getConversations(ctx);
  const active = conversationId ? list.find((conversation) => conversation.id === conversationId) ?? null : null;
  if (!active) return { list, active: null, messages: [] };
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, active.id))
    .orderBy(asc(messages.createdAt));
  const people = await getPeople(ctx.org.id);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const allReactions = await db.select().from(messageReactions);
  const attachmentRows = await db.select().from(messageAttachments);
  const documentRows = await db.select().from(documents);
  const documentMap = new Map(documentRows.map((doc) => [doc.id, doc]));
  const enriched = rows.map((message) => ({
    id: message.id,
    body: message.body,
    authorId: message.authorId,
    authorName: peopleMap.get(message.authorId)?.name ?? "Anggota",
    authorColor: peopleMap.get(message.authorId)?.avatarColor ?? "#0f6cbd",
    createdAt: message.createdAt,
    replyToId: message.replyToId,
    replyBody: message.replyToId ? rows.find((row) => row.id === message.replyToId)?.body ?? null : null,
    attachments: attachmentRows
      .filter((attachment) => attachment.messageId === message.id)
      .flatMap((attachment) => {
        const doc = documentMap.get(attachment.documentId);
        return doc ? [{ id: doc.id, name: doc.name, kind: doc.kind, size: doc.size }] : [];
      }),
    reactions: Array.from(
      allReactions
        .filter((reaction) => reaction.messageId === message.id)
        .reduce((map, reaction) => {
          map.set(reaction.emoji, [...(map.get(reaction.emoji) ?? []), reaction.userId]);
          return map;
        }, new Map<string, string[]>())
        .entries(),
    ).map(([emoji, userIds]) => ({ emoji, count: userIds.length, mine: userIds.includes(ctx.user.id) })),
  }));
  const memberRows = await db
    .select()
    .from(conversationMembers)
    .where(eq(conversationMembers.conversationId, active.id));
  const memberIds = memberRows.map((member) => member.userId);
  const roles: Record<string, string> = {};
  for (const member of memberRows) roles[member.userId] = member.role;
  return { list, active: { ...active, memberIds, roles }, messages: enriched };
}

export async function getDocuments(orgId: string) {
  // Arsip otomatis dibersihkan setelah 30 hari.
  const cutoffIso = new Date(Date.now() - 30 * 86400000).toISOString();
  const initialDocs = await db.select().from(documents).where(eq(documents.orgId, orgId));
  const expired = initialDocs.filter((doc) => doc.isTrashed && doc.deletedAt && doc.deletedAt < cutoffIso);
  if (expired.length > 0) {
    const versionRows = await db.select().from(documentVersions);
    for (const doc of expired) {
      const keys = new Set<string>();
      if (doc.storageKey) keys.add(doc.storageKey);
      for (const row of versionRows) if (row.documentId === doc.id && row.storageKey) keys.add(row.storageKey);
      await db.delete(documents).where(eq(documents.id, doc.id));
      for (const key of keys) {
        try {
          await deleteObject(key);
        } catch {
          /* abaikan */
        }
      }
    }
  }
  const folderRows = await db.select().from(folders).where(eq(folders.orgId, orgId)).orderBy(asc(folders.name));
  const docRows = await db.select().from(documents).where(eq(documents.orgId, orgId)).orderBy(desc(documents.createdAt));
  const people = await getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const projectRows = await db.select().from(projects).where(eq(projects.orgId, orgId));
  const versions = await db.select().from(documentVersions);
  return {
    folders: folderRows.map((folder) => ({
      ...folder,
      count: docRows.filter((doc) => doc.folderId === folder.id && !doc.isTrashed).length,
    })),
    documents: docRows.map((doc) => ({
      id: doc.id,
      name: doc.name,
      kind: doc.kind,
      size: doc.size,
      version: doc.version,
      visibility: doc.visibility,
      folderId: doc.folderId,
      folderName: folderRows.find((folder) => folder.id === doc.folderId)?.name ?? "Tanpa folder",
      ownerName: doc.ownerId ? peopleMap.get(doc.ownerId)?.name ?? "Anggota" : "—",
      projectName: projectRows.find((project) => project.id === doc.projectId)?.name ?? null,
      storageKey: doc.storageKey,
      isTrashed: doc.isTrashed,
      deletedAt: doc.deletedAt,
      createdAt: doc.createdAt,
      versions: versions
        .filter((version) => version.documentId === doc.id)
        .sort((a, b) => b.version - a.version)
        .map((version) => ({
          id: version.id,
          version: version.version,
          note: version.note,
          name: version.name,
          kind: version.kind,
          size: version.size,
          hasFile: Boolean(version.storageKey),
          createdAt: version.createdAt,
          authorName: version.authorId ? peopleMap.get(version.authorId)?.name ?? "Anggota" : "—",
        })),
    })),
  };
}

export type RequestRow = {
  id: string;
  title: string;
  amount: number | null;
  status: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  templateName: string | null;
  templateKey: string | null;
  requesterId: string;
  requesterName: string;
  requesterColor: string;
  data: Record<string, string | number>;
  steps: Array<{
    id: string;
    position: number;
    approverId: string;
    approverName: string;
    status: string;
    note: string | null;
    decidedAt: string | null;
  }>;
};

export async function getRequests(orgId: string): Promise<RequestRow[]> {
  const rows = await db.select().from(requests).where(eq(requests.orgId, orgId)).orderBy(desc(requests.createdAt));
  const people = await getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const templates = await db.select().from(formTemplates).where(eq(formTemplates.orgId, orgId));
  const stepRows = await db.select().from(approvalSteps);

  return rows.map((request) => {
    let data: Record<string, string | number> = {};
    try {
      data = JSON.parse(request.data) as Record<string, string | number>;
    } catch {
      data = {};
    }
    const template = templates.find((row) => row.id === request.templateId);
    return {
      id: request.id,
      title: request.title,
      amount: request.amount,
      status: request.status,
      currentStep: request.currentStep,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      templateName: template?.name ?? null,
      templateKey: template?.key ?? null,
      requesterId: request.requesterId,
      requesterName: peopleMap.get(request.requesterId)?.name ?? "Anggota",
      requesterColor: peopleMap.get(request.requesterId)?.avatarColor ?? "#0f6cbd",
      data,
      steps: stepRows
        .filter((step) => step.requestId === request.id)
        .sort((a, b) => a.position - b.position)
        .map((step) => ({
          id: step.id,
          position: step.position,
          approverId: step.approverId,
          approverName: peopleMap.get(step.approverId)?.name ?? "Anggota",
          status: step.status,
          note: step.note,
          decidedAt: step.decidedAt,
        })),
    };
  });
}

export async function getRequestTemplates(orgId: string) {
  const templates = await db
    .select()
    .from(formTemplates)
    .where(and(eq(formTemplates.orgId, orgId), eq(formTemplates.active, true)))
    .orderBy(asc(formTemplates.name));
  return Promise.all(
    templates.map(async (template) => ({
      ...template,
      fields: await db
        .select()
        .from(formFields)
        .where(eq(formFields.templateId, template.id))
        .orderBy(asc(formFields.position)),
    })),
  );
}

export async function getApprovalInbox(ctx: { org: { id: string }; user: { id: string } }) {
  const all = await getRequests(ctx.org.id);
  const pending = all.filter((request) => {
    if (!["pending", "submitted"].includes(request.status)) return false;
    const current = request.steps.find((step) => step.position === request.currentStep);
    return current?.approverId === ctx.user.id && current.status === "pending";
  });
  const history = all.filter((request) =>
    request.steps.some((step) => step.approverId === ctx.user.id && step.status !== "pending"),
  );
  return { pending, history, all };
}

export async function getReports(orgId: string, filters?: { departmentId?: string; from?: string; to?: string; projectId?: string }) {
  const departmentsList = await getDepartments(orgId);
  const projectsList = await getProjects(orgId);
  const tasksAll = await getTaskRows(orgId);
  const people = await getPeople(orgId);
  const projectRows = await db.select().from(projects).where(eq(projects.orgId, orgId));

  const from = filters?.from ?? "";
  const to = filters?.to ?? "";
  const inRange = (date: string | null) => {
    if (!date) return true;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  };

  const filtered = tasksAll.filter((task) => {
    if (filters?.projectId && task.projectId !== filters.projectId) return false;
    const project = projectRows.find((row) => row.id === task.projectId);
    if (filters?.departmentId && project?.departmentId !== filters.departmentId) return false;
    return inRange(task.createdAt.slice(0, 10));
  });

  const done = filtered.filter((task) => task.done);
  const overdue = filtered.filter((task) => task.overdue);
  const pending = filtered.filter((task) => !task.done);
  const completionRate = filtered.length ? Math.round((done.length / filtered.length) * 100) : 0;
  const cycleHours = done
    .filter((task) => task.completedAt)
    .map((task) => (new Date(task.completedAt as string).getTime() - new Date(task.createdAt).getTime()) / 3_600_000)
    .filter((hours) => Number.isFinite(hours) && hours >= 0);
  const avgCycleHours = cycleHours.length
    ? Math.round((cycleHours.reduce((sum, hours) => sum + hours, 0) / cycleHours.length) * 10) / 10
    : null;
  const timeRows = await db.select().from(timeLogs);
  const taskIds = new Set(filtered.map((task) => task.id));
  const minutes = timeRows.filter((row) => taskIds.has(row.taskId)).reduce((sum, row) => sum + row.minutes, 0);

  const weekly = Array.from({ length: 8 }).map((_, index) => {
    const end = new Date();
    end.setDate(end.getDate() - (7 - index) * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const startKey = start.toISOString().slice(0, 10);
    const endKey = end.toISOString().slice(0, 10);
    return {
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      completed: filtered.filter(
        (task) => task.completedAt && task.completedAt.slice(0, 10) >= startKey && task.completedAt.slice(0, 10) <= endKey,
      ).length,
      created: filtered.filter(
        (task) => task.createdAt.slice(0, 10) >= startKey && task.createdAt.slice(0, 10) <= endKey,
      ).length,
    };
  });

  return {
    totals: {
      total: filtered.length,
      done: done.length,
      pending: pending.length,
      overdue: overdue.length,
      completionRate,
      minutes,
      avgCycleHours,
    },
    projects: projectsList.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
      progress: project.progress,
      total: project.taskTotal,
      done: project.taskDone,
      dueDate: project.dueDate,
    })),
    departments: departmentsList.map((dept) => {
      const deptProjectIds = projectRows.filter((row) => row.departmentId === dept.id).map((row) => row.id);
      const deptTasks = filtered.filter((task) => task.projectId && deptProjectIds.includes(task.projectId));
      return {
        id: dept.id,
        name: dept.name,
        total: deptTasks.length,
        done: deptTasks.filter((task) => task.done).length,
        overdue: deptTasks.filter((task) => task.overdue).length,
      };
    }),
    people: people.map((person) => {
      const own = filtered.filter((task) => task.assigneeId === person.id);
      const hours = timeRows.filter((row) => row.userId === person.id && taskIds.has(row.taskId)).reduce((sum, row) => sum + row.minutes, 0);
      return {
        id: person.id,
        name: person.name,
        color: person.avatarColor,
        open: own.filter((task) => !task.done).length,
        done: own.filter((task) => task.done).length,
        overdue: own.filter((task) => task.overdue).length,
        minutes: hours,
      };
    }),
    weekly,
    timeLogged: minutes,
  };
}

export async function getSearchResults(ctx: { org: { id: string } }, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: Array<{ id: string; type: string; title: string; subtitle: string; href: string }> = [];
  const people = await getPeople(ctx.org.id);
  for (const task of await getTaskRows(ctx.org.id)) {
    if (`${task.title} ${task.projectCode ?? ""} #${task.number}`.toLowerCase().includes(q)) {
      results.push({
        id: task.id,
        type: "Tugas",
        title: task.title,
        subtitle: `${task.projectCode ?? "Tanpa proyek"} Â· ${task.statusName ?? "Backlog"}`,
        href: `/app/tasks?task=${task.id}`,
      });
    }
  }
  for (const project of await getProjects(ctx.org.id)) {
    if (`${project.name} ${project.code}`.toLowerCase().includes(q)) {
      results.push({
        id: project.id,
        type: "Proyek",
        title: project.name,
        subtitle: `${project.code} Â· ${project.taskDone}/${project.taskTotal} tugas selesai`,
        href: `/app/projects/${project.id}/overview`,
      });
    }
  }
  for (const person of people) {
    if (`${person.name} ${person.email} ${person.title ?? ""}`.toLowerCase().includes(q)) {
      results.push({
        id: person.id,
        type: "Orang",
        title: person.name,
        subtitle: `${person.title ?? "Anggota"} Â· ${person.departmentName ?? "Umum"}`,
        href: `/app/teams?person=${person.id}`,
      });
    }
  }
  const docs = await db.select().from(documents).where(eq(documents.orgId, ctx.org.id));
  for (const doc of docs) {
    if (doc.name.toLowerCase().includes(q)) {
      results.push({ id: doc.id, type: "Dokumen", title: doc.name, subtitle: `${doc.kind.toUpperCase()} Â· v${doc.version}`, href: `/app/documents?doc=${doc.id}` });
    }
  }
  return results.slice(0, 24);
}

export async function getUnreadCount(orgId: string, userId: string) {
  return await getUnreadNotificationCount(orgId, userId);
}

export async function getTeamOverview(orgId: string) {
  const people = await getPeople(orgId);
  const departmentsList = await getDepartments(orgId);
  const projectsList = await getProjects(orgId);
  return { people, departments: departmentsList, projects: projectsList };
}

export async function getProjectOptions(orgId: string) {
  return await db
    .select({ id: projects.id, code: projects.code, name: projects.name, status: projects.status })
    .from(projects)
    .where(and(eq(projects.orgId, orgId), isNull(projects.archivedAt), ne(projects.status, "cancelled")))
    .orderBy(asc(projects.name));
}

export async function getStatuses(orgId: string) {
  const ids = (await db.select({ id: projects.id }).from(projects).where(eq(projects.orgId, orgId))).map((row) => row.id);
  if (!ids.length) return [];
  return await db
    .select()
    .from(projectStatuses)
    .where(inArray(projectStatuses.projectId, ids))
    .orderBy(asc(projectStatuses.position));
}

export async function getRoleMatrix(orgId: string) {
  return await db.select().from(roles).where(eq(roles.orgId, orgId));
}
