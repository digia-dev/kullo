import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  timezone: text("timezone").notNull().default("Asia/Jakarta"),
  workStart: text("work_start").notNull().default("09:00"),
  workEnd: text("work_end").notNull().default("18:00"),
  plan: text("plan").notNull().default("free"),
  createdAt: text("created_at").notNull().default(now),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  title: text("title"),
  phone: text("phone"),
  avatarColor: text("avatar_color").notNull().default("#365fd1"),
  createdAt: text("created_at").notNull().default(now),
});

export const departments = sqliteTable(
  "departments",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    headUserId: text("head_user_id").references(() => users.id, { onDelete: "set null" }),
    color: text("color").notNull().default("#365fd1"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [uniqueIndex("departments_org_name").on(t.orgId, t.name)],
);

export const memberships = sqliteTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("staff"),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    managerId: text("manager_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status").notNull().default("active"),
    inviteTokenHash: text("invite_token_hash"),
    inviteExpiresAt: text("invite_expires_at"),
    notificationPrefs: text("notification_prefs").notNull().default("{}"),
    joinedAt: text("joined_at").notNull().default(now),
  },
  (t) => [
    uniqueIndex("memberships_org_user").on(t.orgId, t.userId),
    index("memberships_org").on(t.orgId),
  ],
);

export const roles = sqliteTable(
  "roles",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    permissions: text("permissions").notNull().default("{}"),
    system: integer("system", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [uniqueIndex("roles_org_key").on(t.orgId, t.key)],
);

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    managerId: text("manager_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status").notNull().default("active"),
    priority: text("priority").notNull().default("medium"),
    startDate: text("start_date"),
    dueDate: text("due_date"),
    progress: integer("progress").notNull().default(0),
    archivedAt: text("archived_at"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [
    uniqueIndex("projects_org_code").on(t.orgId, t.code),
    index("projects_org_status").on(t.orgId, t.status),
  ],
);

export const projectMembers = sqliteTable(
  "project_members",
  {
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })],
);

export const projectStatuses = sqliteTable(
  "project_statuses",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
    category: text("category").notNull().default("open"),
  },
  (t) => [index("project_statuses_project").on(t.projectId, t.position)],
);

export const milestones = sqliteTable(
  "milestones",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dueDate: text("due_date"),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("milestones_project").on(t.projectId)],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    statusId: text("status_id").references(() => projectStatuses.id, { onDelete: "set null" }),
    priority: text("priority").notNull().default("medium"),
    assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
    reporterId: text("reporter_id").references(() => users.id, { onDelete: "set null" }),
    parentTaskId: text("parent_task_id"),
    startDate: text("start_date"),
    dueDate: text("due_date"),
    estimateHours: integer("estimate_hours"),
    archivedAt: text("archived_at"),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [
    uniqueIndex("tasks_org_number").on(t.orgId, t.number),
    index("tasks_project_status").on(t.projectId, t.statusId),
    index("tasks_org_assignee").on(t.orgId, t.assigneeId),
  ],
);

export const taskCollaborators = sqliteTable(
  "task_collaborators",
  {
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.userId] })],
);

export const taskLabels = sqliteTable(
  "task_labels",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#365fd1"),
  },
  (t) => [uniqueIndex("task_labels_org_name").on(t.orgId, t.name)],
);

export const taskLabelLinks = sqliteTable(
  "task_label_links",
  {
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    labelId: text("label_id").notNull().references(() => taskLabels.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.labelId] })],
);

export const checklists = sqliteTable(
  "checklists",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Checklist"),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("checklists_task").on(t.taskId)],
);

export const checklistItems = sqliteTable(
  "checklist_items",
  {
    id: text("id").primaryKey(),
    checklistId: text("checklist_id").notNull().references(() => checklists.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("checklist_items_checklist").on(t.checklistId)],
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    parentId: text("parent_id"),
    createdAt: text("created_at").notNull().default(now),
    editedAt: text("edited_at"),
  },
  (t) => [index("comments_task").on(t.taskId, t.createdAt)],
);

export const attachments = sqliteTable(
  "attachments",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    documentId: text("document_id"),
    name: text("name").notNull(),
    kind: text("kind").notNull().default("file"),
    size: integer("size").notNull().default(0),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("attachments_task").on(t.taskId)],
);

export const timeLogs = sqliteTable(
  "time_logs",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    minutes: integer("minutes").notNull(),
    note: text("note"),
    loggedOn: text("logged_on").notNull(),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("time_logs_task").on(t.taskId)],
);

export const taskDependencies = sqliteTable(
  "task_dependencies",
  {
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    dependsOnId: text("depends_on_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.dependsOnId] })],
);

export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("channel"),
    name: text("name").notNull(),
    description: text("description"),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("conversations_org").on(t.orgId)],
);

export const conversationMembers = sqliteTable(
  "conversation_members",
  {
    conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: text("last_read_at"),
  },
  (t) => [primaryKey({ columns: [t.conversationId, t.userId] })],
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    replyToId: text("reply_to_id"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("messages_conversation").on(t.conversationId, t.createdAt)],
);

export const messageReactions = sqliteTable(
  "message_reactions",
  {
    messageId: text("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
  },
  (t) => [primaryKey({ columns: [t.messageId, t.userId, t.emoji] })],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    readAt: text("read_at"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("notifications_user").on(t.userId, t.createdAt)],
);

export const activity = sqliteTable(
  "activity",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    verb: text("verb").notNull(),
    meta: text("meta"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("activity_org").on(t.orgId, t.createdAt), index("activity_entity").on(t.entityType, t.entityId)],
);

export const folders = sqliteTable(
  "folders",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    scope: text("scope").notNull().default("company"),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("folders_org").on(t.orgId)],
);

export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    kind: text("kind").notNull().default("pdf"),
    size: integer("size").notNull().default(0),
    version: integer("version").notNull().default(1),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    visibility: text("visibility").notNull().default("company"),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    storageKey: text("storage_key"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("documents_org").on(t.orgId), index("documents_folder").on(t.folderId)],
);

export const documentVersions = sqliteTable(
  "document_versions",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    note: text("note"),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("document_versions_doc").on(t.documentId)],
);

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    kind: text("kind").notNull().default("meeting"),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    allDay: integer("all_day", { mode: "boolean" }).notNull().default(false),
    location: text("location"),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("events_org_start").on(t.orgId, t.startsAt)],
);

export const eventParticipants = sqliteTable(
  "event_participants",
  {
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    response: text("response").notNull().default("accepted"),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);

export const formTemplates = sqliteTable(
  "form_templates",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull().default("general"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [uniqueIndex("form_templates_org_key").on(t.orgId, t.key)],
);

export const formFields = sqliteTable(
  "form_fields",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id").notNull().references(() => formTemplates.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    type: text("type").notNull().default("text"),
    required: integer("required", { mode: "boolean" }).notNull().default(false),
    options: text("options"),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("form_fields_template").on(t.templateId, t.position)],
);

export const requests = sqliteTable(
  "requests",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    templateId: text("template_id").references(() => formTemplates.id, { onDelete: "set null" }),
    requesterId: text("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    amount: integer("amount"),
    data: text("data").notNull().default("{}"),
    status: text("status").notNull().default("submitted"),
    currentStep: integer("current_step").notNull().default(1),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [index("requests_org").on(t.orgId, t.status)],
);

export const approvalSteps = sqliteTable(
  "approval_steps",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    approverId: text("approver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    note: text("note"),
    decidedAt: text("decided_at"),
  },
  (t) => [index("approval_steps_request").on(t.requestId, t.position)],
);

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  memberLimit: integer("member_limit"),
  projectLimit: integer("project_limit"),
  features: text("features").notNull().default("[]"),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  planId: text("plan_id").references(() => plans.id, { onDelete: "set null" }),
  status: text("status").notNull().default("active"),
  renewsAt: text("renews_at"),
  createdAt: text("created_at").notNull().default(now),
});

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    at: text("at").notNull().default(now),
  },
  (t) => [index("audit_org").on(t.orgId, t.at)],
);

export const supportMessages = sqliteTable("support_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull().default("umum"),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(now),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("sessions_user").on(t.userId)],
);
