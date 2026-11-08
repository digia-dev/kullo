# Recon map: Kullo, built on the Microsoft Indonesia homepage pattern

Scope: A Kullo marketing site that reuses the layout system, section order and
interaction patterns observed on `https://www.microsoft.com/id-id`, with every
piece of content, branding and imagery replaced by Kullo. Behind it, a
clean-room rebuild of the Kullo work-management product defined in `KULLO.md`.
For: Kullo's founders and the teams they sell to (Indonesian startups, agencies,
multi-department companies).
Date: 8 November 2026

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Microsoft Indonesia homepage | https://www.microsoft.com/id-id | Appearance reference only: promo bar, header, hero carousel, quick links, 4-up cards, split feature banner, "Untuk bisnis" band, footer, mobile menu. Captured at 1440 and 390. |
| 2 | Kullo PRD v1.0 | `KULLO.md` (local, supplied by user) | Product truth: 12 modules, roles, RBAC, data entities, workflows, plans, MVP phases, visual direction. |
| 3 | Microsoft Indonesia navigation | https://www.microsoft.com/id-id | Menu inventory: Microsoft 365, Azure, Copilot, XBOX, Dukungan; utility menu, search, account. Mobile drawer with accordions. |
| 4 | Kullo references (PRD §22) | https://www.kolabo.id/ , https://linear.app/ , https://www.notion.so/ , https://slack.com/ , https://clickup.com/ | Category context only. No assets, copy, code or private APIs are taken from them. |

Customer reviews: Kullo has no live customers and therefore no reviews. None are
invented. Microsoft's homepage shows no customer testimonials either, so the
rebuilt homepage has no social-proof section. Product decisions come from the
supplied PRD, not from fabricated feedback.

## The reference page, as measured

| Part | Observation at 1440 | Observation at 390 |
| --- | --- | --- |
| Promo bar | 62px, thumbnail left, two-line copy, dismiss link, blue CTA; hidden on phone |
| Header | 54px, logo + 5 links, utility cluster right; sticky white, 1px bottom border |
| Hero | Full-bleed 565px image, 48/56 heading weight 500, 15px body, white button, text in left 50% | Stacked: 300px image then tinted copy panel, 32px heading |
| Carousel | 2 slides, 7s autoplay, circular prev/next, bar indicator, pause/play | Same controls, smaller |
| Quick links | 3 icon links, centred, 16px semibold underlined | 2 visible, horizontally scrollable |
| Card row | Content 1296px wide, 4 cards 308px, 12px radius, 1px border, 16:9 image, 20px title, 15px body, blue CTA anchored bottom | 1 card per row |
| Split banner | 16:9 image right, copy left, 32px heading, blue CTA | Stacked |
| Business band | Pale blue full-bleed, 32px heading, 4 cards | Stacked |
| Footer | 6 link columns on #f2f2f2, 13px links, bottom locale + legal row, floating back-to-top pill | Accordion-style or stacked columns |
| Menu | Utility dropdown ("Semua Microsoft") and mobile drawer with grouped links + accordions | Full-height white drawer, gradient rule at bottom |

Content width is 90% capped at ~1600px. Type is Segoe UI on the source; Kullo
uses Inter (PRD §10.3). Microsoft's four-square logo, product names, images and
copy are not used.

## Kullo screens to build

### Marketing (appearance patterned on the source, content from the PRD)

| ID | screen | route | purpose | key components | states |
| --- | --- | --- | --- | --- | --- |
| M01 | Beranda | `/` | Explain the one-workspace promise, route to product and signup | promo bar, header, hero carousel (2), quick links, 4 product cards, split banner, business band, "how it works" anatomy figure, footer | default, menu open, mobile drawer, slide 2 |
| M02 | Produk | `/produk` | All 12 modules, grouped | module grid, anchor nav, CTA band | default, filtered |
| M03 | Modul detail | `/produk/[slug]` | What one module does | hero, capability list, related modules, CTA | 12 generated pages |
| M04 | Solusi | `/solusi` | By role and team type | role cards, workflow strip | default |
| M05 | Harga | `/harga` | Free / Pro / Business, no invented prices | plan cards, feature matrix, FAQ | monthly/annual toggle (annual = "soon", no fake discount) |
| M06 | Sumber daya | `/sumber-daya` | Honest guides to the shipped product | article list, article page | list, article |
| M07 | Dukungan | `/dukungan` | FAQ from the real product + contact form | accordion, form | default, sent, error |
| M08 | Tentang | `/tentang` | Product thesis and roadmap phases | story, principles, roadmap | default |
| M09 | Masuk / Daftar | `/masuk`, `/daftar` | Auth into the product | auth form, demo credentials | default, invalid, loading |

### Product (clean-room, Kullo design system)

| ID | screen | route | purpose | states |
| --- | --- | --- | --- | --- |
| P01 | Dashboard | `/app/dashboard` | Today at a glance | filled, loading, empty |
| P02 | My Work | `/app/my-work` | Personal task queue, list/board/calendar | filled, filtered, empty |
| P03 | Projects | `/app/projects` | Project portfolio | filled, empty, filters |
| P04 | Project overview | `/app/projects/[id]/overview` | Summary, members, milestones, activity | filled |
| P05 | Project board | `/app/projects/[id]/board` | Kanban, drag/move status | filled, empty column, error |
| P06 | Project list | `/app/projects/[id]/list` | Sortable/filterable table | filled |
| P07 | Project timeline | `/app/projects/[id]/timeline` | Dates as bars | filled |
| P08 | Project files | `/app/projects/[id]/files` | Project documents | filled, empty |
| P09 | Project settings | `/app/projects/[id]/settings` | Edit project, members, archive | filled, saved, error |
| P10 | Tasks | `/app/tasks` | Cross-project task index | filled, filtered |
| P11 | Task detail | drawer on any task | Properties, checklist, subtasks, comments, activity | filled, edited, error |
| P12 | Calendar | `/app/calendar` | Month/week/agenda, events | filled, empty day |
| P13 | Teams | `/app/teams` | Directory, departments, workload | filled |
| P14 | Chat | `/app/chat` | Channels/DMs, messages, reactions | filled, empty channel |
| P15 | Documents | `/app/documents` | Folders, files, versions, permissions | filled, empty |
| P16 | Requests | `/app/requests` | Templates + submitted requests | filled, empty |
| P17 | Approvals | `/app/approvals` | Inbox, decisions, history | filled, empty, decided |
| P18 | Reports | `/app/reports` | Task/project/team analytics from real rows | filled, filtered, no data |
| P19 | Settings: profile | `/app/settings/profile` | Personal settings | filled, saved |
| P20 | Settings: organization | `/app/settings/organization` | Org profile, working hours, timezone | filled, saved |
| P21 | Settings: members | `/app/settings/members` | Invite, role changes | filled, invited, error |
| P22 | Settings: departments | `/app/settings/departments` | Departments and heads | filled |
| P23 | Settings: roles | `/app/settings/roles` | RBAC matrix | filled, saved |
| P24 | Settings: notifications | `/app/settings/notifications` | In-app preferences | filled |
| P25 | Search | `Ctrl/Cmd+K` | Global search across tasks/projects/people/docs | results, empty |
| P26 | Notifications | topbar panel | Unread/read, deep links | filled, empty |

## Flows

```
F01 First visit -> trial
    M01 hero CTA -> M09 daftar -> create org -> /app/dashboard
    happy path clicks: 4
    edge: email already used, weak password, org slug taken

F02 Manager creates a project and assigns work
    P01 quick action -> P03 new project -> P04 -> create task -> assign -> notify
    happy path clicks: 5
    edge: no members, due date before start, duplicate code

F03 Staff moves work forward
    P02 task -> P11 update status -> checklist -> comment -> manager sees activity
    happy path clicks: 3
    edge: permission denied on another department, stale task (409)

F04 Request and multi-level approval
    P16 submit leave -> P17 manager inbox -> approve -> next approver -> approved
    happy path clicks: 4
    edge: self-approval blocked, reject with note, revision requested

F05 Team communication
    P14 channel -> send message -> react -> convert message to task
    happy path clicks: 3
    edge: empty message, mention unknown user

F06 Document sharing
    P15 upload metadata -> set permission -> share to project
    happy path clicks: 3
    edge: file too large, no permission

F07 Reporting
    P18 choose range/department -> charts recompute -> CSV export
    happy path clicks: 2
    edge: no data in range, export empty

F08 Sign in / out
    M09 credentials -> /app -> sign out
    edge: wrong password, expired session
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, danger, on-dark | default, hover, focus, disabled, loading | all |
| Header / utility | desktop, mobile drawer, mega menu | closed, open, scrolled | marketing |
| Hero carousel | 2 slides, full-bleed | slide 1/2, paused, hover controls | M01 |
| Card | media, icon, stat | default, hover | M01-M05 |
| App shell | sidebar + topbar | collapsed, mobile sheet | P01-P24 |
| Task drawer | create/edit | default, saving, error | P02-P11 |
| Kanban | columns by status | drag-over, empty | P05 |
| Table | sortable, selectable | default, empty | P06, P10, P18 |
| Approval card | pending, approved, rejected, revision | actioned | P17 |
| Chart | bar, line, donut, sparkline | data, empty | P01, P18 |
| Dialog | confirm, form | open, submitting, error | all |

## Data model (from PRD §12)

```
organizations(id, name, slug, logo, address, timezone, work_start, work_end, plan, created_at)
users(id, name, email, password_hash, title, phone, avatar_color, created_at)
memberships(id, org_id, user_id, role, department_id, manager_id, joined_at, status)
departments(id, org_id, name, head_user_id, color)
roles(id, org_id, key, name, permissions_json)            permission matrix, RBAC
projects(id, org_id, department_id, code, name, description, cover, owner_id,
         manager_id, status, priority, start_date, due_date, progress, archived_at)
project_members(project_id, user_id, role)
project_statuses(id, project_id, name, position, category)
milestones(id, project_id, name, due_date, done)
tasks(id, org_id, project_id, number, title, description, status_id, priority,
      assignee_id, reporter_id, start_date, due_date, estimate_hours, archived_at)
task_collaborators(task_id, user_id)
task_labels(id, org_id, name, color), task_label_links(task_id, label_id)
checklists(id, task_id, title, position), checklist_items(id, checklist_id, text, done)
comments(id, task_id, author_id, body, parent_id, created_at, edited_at)
attachments(id, org_id, task_id, document_id, name, size, type)
time_logs(id, task_id, user_id, minutes, note, logged_on)
dependencies(task_id, depends_on_task_id)
conversations(id, org_id, kind, name, description, project_id, department_id)
conversation_members(conversation_id, user_id)
messages(id, conversation_id, author_id, body, reply_to_id, created_at)
message_reactions(message_id, user_id, emoji)
notifications(id, org_id, user_id, kind, title, body, href, read_at, created_at)
activity(id, org_id, actor_id, entity_type, entity_id, verb, meta_json, created_at)
folders(id, org_id, name, parent_id, scope, department_id, project_id)
documents(id, org_id, folder_id, name, kind, size, version, owner_id, visibility,
          project_id, department_id, created_at)
document_versions(id, document_id, version, note, created_at, author_id)
events(id, org_id, title, description, kind, starts_at, ends_at, location,
       project_id, created_by, all_day)
event_participants(event_id, user_id, status)
form_templates(id, org_id, key, name, description, category, active)
form_fields(id, template_id, label, type, required, options_json, position)
requests(id, org_id, template_id, requester_id, title, amount, data_json, status,
         current_step, created_at)
request_attachments(request_id, document_id)
approval_steps(id, request_id, position, approver_id, status, decided_at, note)
plans(id, key, name, price_idr, member_limit, project_limit, features_json)
subscriptions(id, org_id, plan_id, status, renews_at)
audit_log(id, org_id, actor_id, action, entity, entity_id, at)
sessions(id, user_id, token_hash, expires_at)
```

Relationships: organization 1-n membership, department, project, task, document,
conversation, request; project 1-n task, milestone, file; task 1-n comment,
checklist item, attachment, time log; request 1-n approval step; user 1-n
membership (one per org in the MVP), notification.

Tenant isolation: every product query is scoped by `org_id` from the session
membership; mutations re-check role permission server-side. Evidence: PRD §3,
§12 ("Backend harus memvalidasi organization membership dan permission pada
setiap request").

## Feature matrix

See `features.csv`. Must: 34, should: 14, could: 7, skip: 2.

## Out of scope

- Microsoft brand assets, product names, copy, photos, icons and page source.
- Kullo: payroll, accounting, tax, POS, inventory, recruitment, GPS attendance,
  native mobile apps, video conferencing, and advanced AI automation (PRD §18).
  These are listed as roadmap, not shipped.
- Real payments: plan checkout is a gate; no card is charged. Pricing shows
  "Hubungi kami" rather than invented rupiah prices.
- Email/push/WhatsApp delivery: in-app notifications only in this build.
- File binary storage on a CDN: uploads store metadata and a generated preview,
  with a local-disk adapter and an S3 adapter documented.

## Size

Reference screens 5, Kullo screens 34 (9 marketing + 26 product routes/states),
flows 8, entities 28. Hard parts: RBAC with tenant isolation, the task drawer
across views, multi-level approvals, and keeping the 12 modules coherent.
Honest size: **L** for the full slice; the core loop alone (auth, org, projects,
tasks, board, comments, notifications) is **M**.

## Slice recommendation

1. Marketing: homepage faithful to the source pattern + Produk, Solusi, Harga,
   Sumber Daya, Dukungan, Tentang, auth.
2. Product: every one of the 12 modules has a real route with seeded data and
   the primary action working; Phase 1 features are complete CRUD, Phase 2
   collaboration is functional, Phase 3 approvals/reports are functional.
   AI stays a labelled roadmap item.
3. Backend: SQLite + Drizzle, cookie sessions, scrypt hashes, server-side RBAC
   and tenant scoping, migrations and seed.
