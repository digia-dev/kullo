import { and, asc, desc, eq, inArray, isNull, ne } from "drizzle-orm";
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
  projectMembers,
  projects,
  projectStatuses,
  requests,
  roles,
  taskCollaborators,
  taskLabels,
  taskLabelLinks,
  tasks,
  timeLogs,
  users,
} from "@/db/schema";
import { daysFromToday, todayISO } from "@/lib/utils";

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

export function getPeople(orgId: string): Person[] {
  const rows = db
    .select({
      user: users,
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
    .orderBy(asc(users.name))
    .all();

  const open = db
    .select({ assigneeId: tasks.assigneeId, statusId: tasks.statusId })
    .from(tasks)
    .where(and(eq(tasks.orgId, orgId), isNull(tasks.archivedAt)))
    .all();
  const doneStatuses = new Set(
    db
      .select({ id: projectStatuses.id })
      .from(projectStatuses)
      .where(eq(projectStatuses.category, "done"))
      .all()
      .map((row) => row.id),
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

export function getDepartments(orgId: string): DepartmentRow[] {
  const depts = db.select().from(departments).where(eq(departments.orgId, orgId)).orderBy(asc(departments.name)).all();
  const people = getPeople(orgId);
  const projectRows = db.select({ departmentId: projects.departmentId }).from(projects).where(eq(projects.orgId, orgId)).all();
  const taskRows = getTaskRows(orgId);

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

export function getProjects(orgId: string, options?: { includeArchived?: boolean }): ProjectRow[] {
  const rows = db.select().from(projects).where(eq(projects.orgId, orgId)).orderBy(desc(projects.createdAt)).all();
  const filtered = options?.includeArchived ? rows : rows.filter((project) => !project.archivedAt);
  const people = getPeople(orgId);
  const taskRows = getTaskRows(orgId);
  const memberRows = db.select().from(projectMembers).all();
  const milestoneRows = db.select().from(milestones).all();
  const deptRows = db.select().from(departments).where(eq(departments.orgId, orgId)).all();

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
  createdAt: string;
  updatedAt: string;
  done: boolean;
  overdue: boolean;
  labels: Array<{ id: string; name: string; color: string }>;
  collaboratorIds: string[];
  commentCount: number;
  attachmentCount: number;
  checklistDone: number;
  checklistTotal: number;
};

export function getTaskRows(orgId: string): TaskRow[] {
  const taskRows = db
    .select()
    .from(tasks)
    .where(and(eq(tasks.orgId, orgId), isNull(tasks.archivedAt)))
    .orderBy(desc(tasks.number))
    .all();
  return enrichTasks(orgId, taskRows);
}

function enrichTasks(orgId: string, taskRows: Array<typeof tasks.$inferSelect>): TaskRow[] {
  if (taskRows.length === 0) return [];
  const projectRows = db.select().from(projects).where(eq(projects.orgId, orgId)).all();
  const statusRows = db.select().from(projectStatuses).all();
  const people = getPeople(orgId);
  const linkRows = db
    .select({ taskId: taskLabelLinks.taskId, labelId: taskLabels.id, name: taskLabels.name, color: taskLabels.color })
    .from(taskLabelLinks)
    .innerJoin(taskLabels, eq(taskLabels.id, taskLabelLinks.labelId))
    .all();
  const commentRows = db.select({ taskId: comments.taskId }).from(comments).all();
  const attachmentRows = db.select({ taskId: attachments.taskId }).from(attachments).all();
  const checklistRows = db
    .select({ taskId: checklists.taskId, done: checklistItems.done })
    .from(checklists)
    .leftJoin(checklistItems, eq(checklistItems.checklistId, checklists.id))
    .all();
  const collaboratorRows = db.select().from(taskCollaborators).all();

  return taskRows.map((task) => {
    const project = projectRows.find((row) => row.id === task.projectId);
    const status = statusRows.find((row) => row.id === task.statusId);
    const assignee = people.find((person) => person.id === task.assigneeId);
    const reporter = people.find((person) => person.id === task.reporterId);
    const done = status?.category === "done";
    const checklist = checklistRows.filter((row) => row.taskId === task.id);
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
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      done: Boolean(done),
      overdue: Boolean(task.dueDate && !done && daysFromToday(task.dueDate) < 0),
      labels: linkRows.filter((row) => row.taskId === task.id).map(({ labelId, name, color }) => ({ id: labelId, name, color })),
      collaboratorIds: collaboratorRows.filter((row) => row.taskId === task.id).map((row) => row.userId),
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

export function getProjectBundle(orgId: string, projectId: string): ProjectBundle | null {
  const project = getProjects(orgId, { includeArchived: true }).find((row) => row.id === projectId);
  if (!project) return null;
  const statuses = db
    .select()
    .from(projectStatuses)
    .where(eq(projectStatuses.projectId, projectId))
    .orderBy(asc(projectStatuses.position))
    .all();
  const tasksAll = enrichTasks(
    orgId,
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.orgId, orgId), eq(tasks.projectId, projectId), isNull(tasks.archivedAt)))
      .orderBy(asc(tasks.number))
      .all(),
  );
  const memberIds = db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, projectId)).all();
  const people = getPeople(orgId);
  const members = memberIds.map((row) => people.find((person) => person.id === row.userId)).filter(Boolean) as Person[];
  const projectMilestones = db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.position))
    .all();
  const docRows = db.select().from(documents).where(and(eq(documents.orgId, orgId), eq(documents.projectId, projectId))).all();
  const activityRows = db
    .select()
    .from(activity)
    .where(and(eq(activity.orgId, orgId), eq(activity.entityType, "project"), eq(activity.entityId, projectId)))
    .orderBy(desc(activity.createdAt))
    .limit(12)
    .all();
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
  comments: Array<{ id: string; body: string; authorName: string; authorColor: string; createdAt: string; parentId: string | null }>;
  checklists: Array<{ id: string; title: string; items: Array<{ id: string; text: string; done: boolean }> }>;
  attachments: Array<{ id: string; name: string; kind: string; size: number; createdAt: string }>;
  timeLogs: Array<{ id: string; minutes: number; note: string | null; loggedOn: string; userName: string }>;
  collaborators: Array<{ id: string; name: string; avatarColor: string }>;
  subtasks: TaskRow[];
  activity: Array<{ id: string; actorName: string; verb: string; meta: string | null; createdAt: string }>;
  projectStatuses: Array<typeof projectStatuses.$inferSelect>;
  members: Person[];
  canEdit: boolean;
};

export function getTaskDetail(orgId: string, taskId: string, canEdit: boolean): TaskDetail | null {
  const task = getTaskRows(orgId).find((row) => row.id === taskId);
  if (!task) return null;
  const people = getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const commentRows = db.select().from(comments).where(eq(comments.taskId, taskId)).orderBy(asc(comments.createdAt)).all();
  const checklistRows = db.select().from(checklists).where(eq(checklists.taskId, taskId)).orderBy(asc(checklists.position)).all();
  const itemRows = checklistRows.length
    ? db
        .select()
        .from(checklistItems)
        .where(inArray(checklistItems.checklistId, checklistRows.map((row) => row.id)))
        .orderBy(asc(checklistItems.position))
        .all()
    : [];
  const attachmentRows = db.select().from(attachments).where(eq(attachments.taskId, taskId)).all();
  const logRows = db.select().from(timeLogs).where(eq(timeLogs.taskId, taskId)).orderBy(desc(timeLogs.loggedOn)).all();
  const collaboratorRows = db.select().from(taskCollaborators).where(eq(taskCollaborators.taskId, taskId)).all();
  const activityRows = db
    .select()
    .from(activity)
    .where(and(eq(activity.orgId, orgId), eq(activity.entityType, "task"), eq(activity.entityId, taskId)))
    .orderBy(desc(activity.createdAt))
    .limit(20)
    .all();
  const subtasks = getTaskRows(orgId).filter((row) => row.parentTaskId === taskId);
  const statusRows = task.projectId
    ? db.select().from(projectStatuses).where(eq(projectStatuses.projectId, task.projectId)).orderBy(asc(projectStatuses.position)).all()
    : [];
  const memberIds = task.projectId
    ? db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, task.projectId)).all()
    : [];
  const members = memberIds
    .map((row) => peopleMap.get(row.userId))
    .filter(Boolean) as Person[];

  return {
    task,
    comments: commentRows.map((row) => ({
      id: row.id,
      body: row.body,
      authorName: peopleMap.get(row.authorId)?.name ?? "Anggota",
      authorColor: peopleMap.get(row.authorId)?.avatarColor ?? "#365fd1",
      createdAt: row.createdAt,
      parentId: row.parentId,
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
      return { id: row.userId, name: person?.name ?? "Anggota", avatarColor: person?.avatarColor ?? "#365fd1" };
    }),
    subtasks,
    activity: activityRows.map((row) => ({
      id: row.id,
      actorName: row.actorId ? peopleMap.get(row.actorId)?.name ?? "Sistem" : "Sistem",
      verb: row.verb,
      meta: row.meta,
      createdAt: row.createdAt,
    })),
    projectStatuses: statusRows,
    members: members.length ? members : people,
    canEdit,
  };
}

export function getDashboard(orgId: string, userId: string) {
  const taskRows = getTaskRows(orgId);
  const myTasks = taskRows.filter((task) => task.assigneeId === userId && !task.done);
  const dueToday = myTasks.filter((task) => task.dueDate === todayISO());
  const overdue = myTasks.filter((task) => task.overdue);
  const completed = taskRows.filter((task) => task.assigneeId === userId && task.done);
  const projectRows = getProjects(orgId).filter((project) => project.status === "active");
  const people = getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const eventRows = db
    .select()
    .from(events)
    .where(eq(events.orgId, orgId))
    .orderBy(asc(events.startsAt))
    .all()
    .filter((event) => new Date(event.startsAt).getTime() >= Date.now() - 86400000)
    .slice(0, 5);
  const activityRows = db
    .select()
    .from(activity)
    .where(eq(activity.orgId, orgId))
    .orderBy(desc(activity.createdAt))
    .limit(9)
    .all();
  const pendingSteps = db
    .select({ step: approvalSteps, request: requests })
    .from(approvalSteps)
    .innerJoin(requests, eq(requests.id, approvalSteps.requestId))
    .where(and(eq(approvalSteps.approverId, userId), eq(approvalSteps.status, "pending"), eq(requests.orgId, orgId)))
    .all();

  return {
    myTasks,
    dueToday,
    overdue,
    completed,
    projects: projectRows,
    events: eventRows,
    activity: activityRows.map((row) => ({
      id: row.id,
      actorName: row.actorId ? peopleMap.get(row.actorId)?.name ?? "Sistem" : "Sistem",
      actorColor: row.actorId ? peopleMap.get(row.actorId)?.avatarColor ?? "#365fd1" : "#66665f",
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

export function getNotifications(orgId: string, userId: string, limit = 8) {
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.orgId, orgId), eq(notifications.userId, userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .all();
}

export function getUnreadNotificationCount(orgId: string, userId: string) {
  return db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.orgId, orgId), eq(notifications.userId, userId), isNull(notifications.readAt)))
    .all().length;
}

export function getMyWorkCount(orgId: string, userId: string) {
  return getTaskRows(orgId).filter((task) => task.assigneeId === userId && !task.done).length;
}

export function getPendingApprovalCount(orgId: string, userId: string) {
  return db
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
    )
    .all().length;
}

export function getEvents(orgId: string) {
  return db
    .select()
    .from(events)
    .where(eq(events.orgId, orgId))
    .orderBy(asc(events.startsAt))
    .all()
    .map((event) => {
      const participants = db.select().from(eventParticipants).where(eq(eventParticipants.eventId, event.id)).all();
      return { ...event, participantCount: participants.length };
    });
}

export function getConversations(ctx: { org: { id: string }; user: { id: string } }) {
  const memberRows = db
    .select({ conversation: conversations })
    .from(conversationMembers)
    .innerJoin(conversations, eq(conversations.id, conversationMembers.conversationId))
    .where(and(eq(conversationMembers.userId, ctx.user.id), eq(conversations.orgId, ctx.org.id)))
    .all();
  const allMessages = db.select().from(messages).all().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const people = getPeople(ctx.org.id);
  const peopleMap = new Map(people.map((person) => [person.id, person]));

  return memberRows
    .map(({ conversation }) => {
      const convMessages = allMessages.filter((message) => message.conversationId === conversation.id);
      const last = convMessages[convMessages.length - 1];
      const membership = db
        .select()
        .from(conversationMembers)
        .where(and(eq(conversationMembers.conversationId, conversation.id), eq(conversationMembers.userId, ctx.user.id)))
        .get();
      const unread = convMessages.filter(
        (message) => message.authorId !== ctx.user.id && (!membership?.lastReadAt || message.createdAt > membership.lastReadAt),
      ).length;
      return {
        id: conversation.id,
        kind: conversation.kind,
        name: conversation.name,
        description: conversation.description,
        projectId: conversation.projectId,
        departmentId: conversation.departmentId,
        lastMessage: last?.body ?? null,
        lastAuthor: last ? peopleMap.get(last.authorId)?.name ?? null : null,
        lastAt: last?.createdAt ?? null,
        unread,
      };
    })
    .sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
}

export function getConversation(ctx: { org: { id: string }; user: { id: string } }, conversationId?: string) {
  const list = getConversations(ctx);
  const active = list.find((conversation) => conversation.id === conversationId) ?? list[0] ?? null;
  if (!active) return { list, active: null, messages: [] };
  const rows = db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, active.id))
    .orderBy(asc(messages.createdAt))
    .all();
  const people = getPeople(ctx.org.id);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const allReactions = db.select().from(messageReactions).all();
  const enriched = rows.map((message) => ({
    id: message.id,
    body: message.body,
    authorId: message.authorId,
    authorName: peopleMap.get(message.authorId)?.name ?? "Anggota",
    authorColor: peopleMap.get(message.authorId)?.avatarColor ?? "#365fd1",
    createdAt: message.createdAt,
    replyToId: message.replyToId,
    replyBody: message.replyToId ? rows.find((row) => row.id === message.replyToId)?.body ?? null : null,
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
  return { list, active, messages: enriched };
}

export function getDocuments(orgId: string) {
  const folderRows = db.select().from(folders).where(eq(folders.orgId, orgId)).orderBy(asc(folders.name)).all();
  const docRows = db.select().from(documents).where(eq(documents.orgId, orgId)).orderBy(desc(documents.createdAt)).all();
  const people = getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const projectRows = db.select().from(projects).where(eq(projects.orgId, orgId)).all();
  const versions = db.select().from(documentVersions).all();
  return {
    folders: folderRows.map((folder) => ({
      ...folder,
      count: docRows.filter((doc) => doc.folderId === folder.id).length,
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
      createdAt: doc.createdAt,
      versions: versions
        .filter((version) => version.documentId === doc.id)
        .sort((a, b) => b.version - a.version)
        .map((version) => ({
          id: version.id,
          version: version.version,
          note: version.note,
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

export function getRequests(orgId: string): RequestRow[] {
  const rows = db.select().from(requests).where(eq(requests.orgId, orgId)).orderBy(desc(requests.createdAt)).all();
  const people = getPeople(orgId);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const templates = db.select().from(formTemplates).where(eq(formTemplates.orgId, orgId)).all();
  const stepRows = db.select().from(approvalSteps).all();

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
      requesterColor: peopleMap.get(request.requesterId)?.avatarColor ?? "#365fd1",
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

export function getRequestTemplates(orgId: string) {
  const templates = db
    .select()
    .from(formTemplates)
    .where(and(eq(formTemplates.orgId, orgId), eq(formTemplates.active, true)))
    .orderBy(asc(formTemplates.name))
    .all();
  return templates.map((template) => ({
    ...template,
    fields: db
      .select()
      .from(formFields)
      .where(eq(formFields.templateId, template.id))
      .orderBy(asc(formFields.position))
      .all(),
  }));
}

export function getApprovalInbox(ctx: { org: { id: string }; user: { id: string } }) {
  const all = getRequests(ctx.org.id);
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

export function getReports(orgId: string, filters?: { departmentId?: string; from?: string; to?: string; projectId?: string }) {
  const departmentsList = getDepartments(orgId);
  const projectsList = getProjects(orgId);
  const tasksAll = getTaskRows(orgId);
  const people = getPeople(orgId);
  const projectRows = db.select().from(projects).where(eq(projects.orgId, orgId)).all();

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
  const timeRows = db.select().from(timeLogs).all();
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
        (task) => task.done && task.updatedAt.slice(0, 10) >= startKey && task.updatedAt.slice(0, 10) <= endKey,
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

export function getSearchResults(ctx: { org: { id: string } }, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: Array<{ id: string; type: string; title: string; subtitle: string; href: string }> = [];
  const people = getPeople(ctx.org.id);
  for (const task of getTaskRows(ctx.org.id)) {
    if (`${task.title} ${task.projectCode ?? ""} #${task.number}`.toLowerCase().includes(q)) {
      results.push({
        id: task.id,
        type: "Tugas",
        title: task.title,
        subtitle: `${task.projectCode ?? "Tanpa proyek"} · ${task.statusName ?? "Backlog"}`,
        href: `/app/tasks?task=${task.id}`,
      });
    }
  }
  for (const project of getProjects(ctx.org.id)) {
    if (`${project.name} ${project.code}`.toLowerCase().includes(q)) {
      results.push({
        id: project.id,
        type: "Proyek",
        title: project.name,
        subtitle: `${project.code} · ${project.taskDone}/${project.taskTotal} tugas selesai`,
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
        subtitle: `${person.title ?? "Anggota"} · ${person.departmentName ?? "Umum"}`,
        href: `/app/teams?person=${person.id}`,
      });
    }
  }
  const docs = db.select().from(documents).where(eq(documents.orgId, ctx.org.id)).all();
  for (const doc of docs) {
    if (doc.name.toLowerCase().includes(q)) {
      results.push({ id: doc.id, type: "Dokumen", title: doc.name, subtitle: `${doc.kind.toUpperCase()} · v${doc.version}`, href: `/app/documents?doc=${doc.id}` });
    }
  }
  return results.slice(0, 24);
}

export function getUnreadCount(orgId: string, userId: string) {
  return getUnreadNotificationCount(orgId, userId);
}

export function getTeamOverview(orgId: string) {
  const people = getPeople(orgId);
  const departmentsList = getDepartments(orgId);
  const projectsList = getProjects(orgId);
  return { people, departments: departmentsList, projects: projectsList };
}

export function getProjectOptions(orgId: string) {
  return db
    .select({ id: projects.id, code: projects.code, name: projects.name, status: projects.status })
    .from(projects)
    .where(and(eq(projects.orgId, orgId), isNull(projects.archivedAt), ne(projects.status, "cancelled")))
    .orderBy(asc(projects.name))
    .all();
}

export function getStatuses(orgId: string) {
  const ids = db.select({ id: projects.id }).from(projects).where(eq(projects.orgId, orgId)).all().map((row) => row.id);
  if (!ids.length) return [];
  return db
    .select()
    .from(projectStatuses)
    .where(inArray(projectStatuses.projectId, ids))
    .orderBy(asc(projectStatuses.position))
    .all();
}

export function getRoleMatrix(orgId: string) {
  return db.select().from(roles).where(eq(roles.orgId, orgId)).all();
}
