# Kullo route map

Generated from `.next/app-path-routes-manifest.json` (47 routes). `(site)` = marketing, `(app)` = authenticated product.

## Marketing (guest)

| Route | Page |
| --- | --- |
| `/` | Homepage (hero carousel, product grid, anatomy figure, resources) |
| `/produk` | Products overview |
| `/produk/[slug]` | Product detail |
| `/solusi` | Solutions |
| `/harga` | Pricing ("Hubungi kami" — no published prices) |
| `/sumber-daya` | Resources index |
| `/sumber-daya/[slug]` | Resource article |
| `/tentang` | About |
| `/dukungan` | Support |
| `/privasi` | Privacy policy |
| `/ketentuan` | Terms |
| `/daftar` | Sign up (create account + org) |
| `/gabung` | Accept invitation (invite token) |
| `/masuk` | Sign in |

## Product (session required, redirects to `/masuk` when signed out)

| Route | Page |
| --- | --- |
| `/app` | Dashboard (redirects to `/app/dashboard`) |
| `/app/dashboard` | Dashboard overview |
| `/app/my-work` | My work |
| `/app/tasks` | Task explorer |
| `/app/projects` | Projects index |
| `/app/projects/[id]` | Project overview (redirect → `overview`) |
| `/app/projects/[id]/overview` | Project overview |
| `/app/projects/[id]/board` | Board (kanban) |
| `/app/projects/[id]/list` | List |
| `/app/projects/[id]/timeline` | Timeline (Gantt) |
| `/app/projects/[id]/files` | Files |
| `/app/projects/[id]/settings` | Project settings |
| `/app/calendar` | Calendar |
| `/app/teams` | Teams |
| `/app/chat` | Chat |
| `/app/documents` | Documents |
| `/app/requests` | Requests |
| `/app/approvals` | Approvals inbox |
| `/app/reports` | Reports |
| `/app/settings` | Settings index (→ profile) |
| `/app/settings/profile` | Profile |
| `/app/settings/organization` | Organization |
| `/app/settings/members` | Members |
| `/app/settings/departments` | Departments |
| `/app/settings/roles` | Roles matrix |
| `/app/settings/notifications` | Notification preferences |
| `/app/settings/integrations` | Integrations |

## API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Liveness: `{ ok: true, service: "kullo" }` |
| `/api/meta` | GET | App meta (nav counts, org info) |
| `/api/search` | GET | Global search across tasks/projects/people |
| `/api/export/report` | GET | Report export (CSV) |
| `/api/tasks/[id]` | GET/PATCH | Task resource for drawer updates |
| `/api/documents/[id]/file` | GET | Document file stream (permission-checked) |

## Not found

`/_not-found` — 404 page; `/_global-error` — error boundary.
