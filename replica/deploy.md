# Deploy checklist & steps: Kullo

Date: 2026-11-10  Commit: none  Go from user: **not yet — waiting at the deploy gate**

## Preflight (all must pass)

- [x] e2e suite green: **43/43** (`npm test`) against PostgreSQL
- [x] no open S1 or S2 bugs
- [x] parity: all must-haves done (55/55), feature score **100.0**
- [x] rebrand sweep clean (0 product-scope hits; `replica/sweep-report.txt`)
- [x] production build passes (`npm run check`, 47 routes)
- [x] contrast AA on tokens (0 failures)
- [x] favicon, titles, OG, app icon are Kullo's own (no third-party marks)
- [ ] privacy policy and terms reviewed by the user — pages exist (`/privasi`, `/ketentuan`), content is draft
- [ ] account deletion works end-to-end — member deactivation exists in settings; hard-delete flow not built
- [x] pricing honest: "Hubungi kami", no invented figures
- [x] no fabricated reviews, metrics, or screenshots

## Architecture (current)

| Layer | Service |
|---|---|
| Hosting | Vercel (Next.js 16, Node runtime) |
| Database | Supabase Postgres (transaction pooler for runtime, direct connection for migrations) |
| Files | Supabase Storage, private bucket `kullo-files` |
| Auth | Email + password, DB-backed sessions in Postgres (no OAuth) |
| Health | `/api/health` checks the database connection |

Schema lives in `src/db/schema.ts` (Drizzle `pg-core`). Migrations are in `drizzle/`
(PostgreSQL dialect). The previous SQLite migrations are archived in
`drizzle-sqlite/` and are not used anymore.

## Environment variables (Vercel → Project → Settings → Environment Variables)

```text
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>      # server only, never NEXT_PUBLIC_
SUPABASE_STORAGE_BUCKET=kullo-files

# Transactional email (optional). Without a key, messages land in mail_outbox
# and are visible in /app/admin/akses for manual sending.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
RESEND_API_KEY=
KULLO_MAIL_FROM=Kullo <noreply@kullo.app>
KULLO_ADMIN_EMAILS=hi.digia@gmail.com,demo@kullo.app
KULLO_NOTIFY_EMAILS=hi.digia@gmail.com
NEXT_PUBLIC_APP_URL=https://your-domain
KULLO_SHOW_DEMO=1                                  # optional public demo account
```

`DATABASE_SSL` is only for local Postgres without TLS (`false`). Leave it unset in production.

## Supabase setup (already applied to project `iwpnhnglffjrcdpeecqh`)

- 42 tables, foreign keys and indexes applied (matches `drizzle/0000_stiff_rattler.sql`).
- Row Level Security enabled on all public tables. The app connects as the Postgres
  owner role, so RLS does not block it; the public anon/authenticated API routes are closed.
- Private Storage bucket `kullo-files` (50 MB object limit), no public access.

If a fresh Supabase project is ever needed:

```bash
# with DIRECT_URL pointing at the new project
npm run db:migrate      # apply drizzle/ migrations
npm run db:seed         # demo data (Nusantara Digital)
# then create the private bucket kullo-files in Storage, or:
# insert into storage.buckets (id,name,public) values ('kullo-files','kullo-files',false);
```

## Vercel deploy steps

1. Import the repo into Vercel (framework preset: Next.js).
2. Add every variable above to **Production** and **Preview**.
3. Deploy. The build runs `next build` only; it does not touch the database.
4. After the first deploy, seed the production database **once** from a machine with
   `DIRECT_URL` set to the production project:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   Seeding wipes existing rows — never run it on a database that already holds real data.
5. Open `/api/health` and confirm `{"ok":true,"database":"up","storage":"supabase"}`.
6. Sign in with the demo account only if `KULLO_SHOW_DEMO=1`; otherwise register a real
   account from `/daftar`.

## Domain

- [ ] A/CNAME the domain to Vercel
- [ ] set the canonical host, 301 the other
- [ ] Vercel issues HTTPS automatically; the session cookie turns `secure` behind HTTPS

## Watch

- [ ] error tracking (e.g. Sentry or Vercel log drain)
- [ ] uptime check on `/api/health`
- [ ] Supabase daily backups / PITR (paid plan)
- [ ] Storage usage and egress in the Supabase dashboard
- [ ] core flow F01–F08 on the live site, desktop and phone

## Rollback

Vercel keeps every deployment: promote the previous one. For data, restore a
Supabase backup. Migrations are forward-only; restore the matching database
snapshot with matching code.

## Known limits

- Server Action uploads pass through the Vercel function, so bodies above ~4.5 MB
  fail. Files are otherwise stored in Supabase Storage with signed access.
- Email delivery (invite links, password reset) is not configured; invite links are
  copied from the UI.
- No OAuth by owner decision.
