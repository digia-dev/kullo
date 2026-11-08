# Test plan: Kullo

Build: local main (no VCS)  Date: 2026-11-08  Env: production build + SQLite seed (`npm run db:setup`)

Runner: Playwright (`npx playwright test`, config `playwright.config.ts`, suite `e2e/`). Seeded account: `alya@nusantara.id` / `kullo123`.
Parity: `parity.py replica/features.csv` → 100.0 (76/76, must-haves 55/55).
Contrast: `contrast.py replica/design/tokens.json` → 14 pairs, 0 failing AA.
Rebrand: `sweep.py` → 0 product-scope hits (report: `replica/sweep-report.txt`).

| case | flow | type | steps | expected | auto | result |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | first visit → sign up | happy | open `/`, click hero CTA | lands on `/daftar` | e2e | pass |
| F01-H2 | create org | happy | `/daftar`, fill name/org/email/password, submit | redirects to `/app/dashboard`, org created | manual | pass (manual, 2026-11-08) |
| F01-E1 | edge: email already used | edge | submit `/gabung` with seeded email | inline error, no account created | manual | pass |
| F01-E2 | edge: weak password | edge | password < 8 chars | validation error on form | manual | pass |
| F02-H1 | manager creates project | happy | `/app/projects` → new project, fill name+code, submit | project appears in list with code | manual | pass |
| F02-H2 | assign a task | happy | project → add task, set PIC + due date | task on board/list, assignee shown | manual | pass |
| F02-E1 | edge: duplicate code | edge | create project with existing code | "Kode proyek sudah dipakai." | manual | pass |
| F02-E2 | edge: due before start | edge | due date < start date | "Tenggat tidak boleh sebelum tanggal mulai." | manual | pass |
| F03-H1 | staff moves work | happy | open task → change status → add checklist item → comment | state persists, activity updated | manual | pass |
| F03-E1 | edge: permission denied | edge | guest account opens another department's task | action blocked with clear message | manual | pass (server-side checks in `actions.ts`) |
| F04-H1 | request → approval chain | happy | submit leave request → manager inbox → approve → next approver | status advances per level to approved | manual | pass |
| F04-N1 | negative: self-approval | negative | approver opens own request | "Anda tidak dapat menyetujui permintaan sendiri." | manual | pass |
| F04-N2 | negative: reject without note | negative | reject with empty note | "Catatan wajib diisi…" | manual | pass |
| F05-H1 | chat message | happy | open channel, type, send | message appears, persists on reload | manual | pass |
| F05-N1 | negative: empty message | negative | send empty | blocked, nothing posted | manual | pass |
| F05-H2 | message → task | happy | convert message to task | task created, linked | manual | pass |
| F06-H1 | document upload | happy | `/app/documents` upload ≤10 MB allowed type | file listed, downloadable via permission-checked route | manual | pass |
| F06-N1 | negative: oversize file | negative | upload >10 MB | "Ukuran file maksimal 10 MB." | manual | pass |
| F07-H1 | report view + export | happy | `/app/reports`, change filter, export CSV | chart/table from real data, CSV downloads | manual | pass |
| F07-N1 | negative: no hand-typed numbers | negative | inspect report figures | all values come from seeded DB rows | manual | pass |
| F08-H1 | sign in | happy | `/masuk` with seed account | → `/app/dashboard` | e2e | pass |
| F08-H2 | sign out | happy | click `Keluar` in app shell | session cleared, back to marketing | e2e | pass |
| F08-N1 | negative: wrong password | negative | bad credentials | "Email atau kata sandi tidak cocok." stays on `/masuk` | e2e | pass |
| F08-E1 | edge: expired session | edge | clear cookie, open `/app/*` | redirected to `/masuk?next=…` | e2e | pass |
| API-H1 | health | happy | `GET /api/health` | 200 `{ ok: true, service: "kullo" }` | e2e | pass |
| API-H2 | search | happy | `GET /api/search?q=tugas` while signed in | 200 JSON results | e2e | pass |
| API-N1 | negative: search unauthenticated | negative | same request without cookie | 401/redirect, no data leaked | e2e | pass |
| WEB-H1 | every route responds | happy | GET all 11 marketing + 18 app routes | 200 for marketing, redirect to `/masuk` for app, 404 for unknown | e2e | pass |
| WEB-H2 | pricing honesty | happy | open `/harga` | "Hubungi kami", no fabricated rupiah figures | e2e | pass |
| A11Y-1 | contrast on tokens | audit | `contrast.py replica/design/tokens.json` | 0 AA failures | script | pass |
| VIS-1 | desktop parity | audit | screenshots at 1440 vs source | layout pattern parity, Kullo content | manual | pass (`replica/screens/rebuild-*`) |
| VIS-2 | mobile parity + contrast | audit | screenshots at 390 | no washed-out hero text, stacked layout holds | manual | pass (fixed dark-slide copy panel 2026-11-08) |

## Not covered yet

- Visual-regression baselines (screenshots exist in `replica/screens/`, no diff assertions wired).
- Real payment flow — not applicable: pricing is "Hubungi kami", no checkout in scope.
- Email delivery — not applicable: notifications are in-app only (PRD decision).
