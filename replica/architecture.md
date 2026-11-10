# Kullo architecture

## Decision

One Next.js application for the marketing site and the product. The marketing
pages reproduce the *layout system* observed on microsoft.com/id-id with Kullo
content, Kullo brand and original artwork. The product is a clean-room build of
the specification in `docs/specs/KULLO.md`.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript strict | Server components keep tenant-scoped queries on the server; server actions remove a hand-written REST layer for the MVP. |
| Styling | Hand-authored CSS on the token layer (`globals.css`) + Tailwind v4 reset | Precise reproduction of the measured 54px header, 565px hero, 308px cards; no utility soup in the product. |
| Data | SQLite + Drizzle ORM, WAL, foreign keys on | Zero external services for a deployable demo; swap the driver for Postgres later without changing the schema shape. |
| Auth | Opaque session token, SHA-256 hash at rest, HttpOnly SameSite=Lax cookie, 7 days | No JWT secret to leak; revocable server-side. |
| Passwords | scrypt with random salt, timing-safe comparison | Node built-in, no native dependency. |
| Mutations | Server actions, zod validation, RBAC assertion, audit row | Every write is tenant-checked server-side, never only hidden in the UI. |
| Search | `GET /api/search` scoped by organisation, debounced command palette | Small, cache-free, indexed by org. |
| Files | Metadata + generated version rows; storage adapter interface documented | No fabricated binaries; local disk in dev, S3 adapter for production. |
| Charts | Server-computed aggregates, inline SVG | Real rows only; no chart library weight. |

## Routes

Marketing: `/`, `/produk`, `/produk/[slug]`, `/solusi`, `/harga`,
`/sumber-daya`, `/sumber-daya/[slug]`, `/dukungan`, `/tentang`, `/masuk`,
`/daftar`.

Product: `/app/dashboard`, `/app/my-work`, `/app/tasks`, `/app/projects`,
`/app/projects/[id]/overview|board|list|timeline|files|settings`,
`/app/calendar`, `/app/teams`, `/app/chat`, `/app/documents`, `/app/requests`,
`/app/approvals`, `/app/reports`, `/app/settings/profile|organization|members|departments|roles|notifications`.

Utility: `/api/search`, `/app/reports/export` (CSV), `/app/tasks/[id]` drawer
state is client-side over the current route, deep-linked with `?task=`.

## Tenancy and permission invariants

1. Every product query filters by `ctx.org.id`. The org comes from the session
   membership, never from a URL parameter.
2. `assertCan(ctx, permission)` runs before every mutation; `can()` reads the
   org's role row, so changing a role changes what the same session can do.
3. Cross-org ids are treated as 404, not 403, so ids do not leak existence.
4. Self-approval is rejected in the action, not only hidden in the inbox.
5. A project code is unique per organisation (`projects_org_code`); a task
   number is unique per organisation (`tasks_org_number`).
6. Approval decisions are append-only rows with approver, time and note; a
   request only becomes `approved` when the last step is approved.
7. Deleting an organisation cascades everything; deleting a user keeps
   authored activity via `set null` where history matters.

## Build order

1. Schema, migration, seed (done).
2. Auth, RBAC, tenant context (done).
3. Marketing shell and pages.
4. App shell, dashboard, task loop.
5. Project six views.
6. Chat, calendar, documents.
7. Requests, approvals, reports.
8. Settings and RBAC editor.
9. Search, notifications, mobile pass.
10. Visual inspection, tests, parity, launch.

## Risks

- **Scope.** 12 modules is large; the core work loop gets full CRUD, collaboration
  modules get one complete primary action, and roadmap-only features are
  labelled rather than faked.
- **Timezones.** All dates are stored as ISO with the organisation timezone
  (Asia/Jakarta) used for display and for "today".
- **Concurrency.** SQLite serialises writes; unique constraints catch duplicate
  codes and double decisions. The UI surfaces the resulting error.
- **Realtime.** Chat is request/response, not WebSocket, in this build; the
  schema and polling point are documented for a later socket adapter.
