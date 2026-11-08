# Kullo build log

Date: 2026-11-08 · Repo: `C:\kullo` (no VCS — nothing committed) · Builder sessions: 4 concurrent (shared workspace, per user instruction)

Reference: `https://www.microsoft.com/id-id` used **only** as an appearance/pattern reference (promo bar, header, full-bleed hero + carousel, product card grid, split feature banner, footer). No Microsoft code, copy, assets, or logos were taken. Content is Kullo's own; product screens are clean-room from the PRD (`KULLO.md`).

## Stage 0 — Recon

- `replica/recon.md`: 10 marketing pages (M01–M10), 18 product screens (P01–P18), 8 flows (F01–F08), data model notes.
- Source screenshots in `replica/screens/source-ms-id-*.png` (1440 + 390, captured via headless Chrome; recon console logs under `.playwright-mcp/`).
- `replica/features.csv`: 79 rows → clone=76, skip=3 (AI assistant, email/WhatsApp notification delivery, payment checkout — all PRD out-of-scope).

## Stage 1 — Plan

- Stack: Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind 4 (tokens in `src/app/globals.css`), Drizzle ORM + better-sqlite3, server actions for mutations, cookie session auth.
- `replica/architecture.md`, schema in `src/db/schema.ts`, migration + seed via `npm run db:setup`.
- Design tokens: `replica/design/tokens.json` ↔ CSS custom properties (no raw hex in components).

## Stage 2 — Marketing rebuild

- Layout pattern reproduced with Kullo content: promo bar, sticky header + mega nav + mobile drawer, hero carousel (art/copy split, dark/light themes, pause, dots), quick links, product card grid, split banners, module map, resources, CTA, footer.
- Self-hosted Inter (`public/fonts/*.woff2`, OFL) — no external font requests.
- `/harga` shows **Hubungi kami** only; no prices were invented anywhere.

## Stage 3 — Product rebuild (clean-room)

- All 18 screens + 6 project views + 7 settings pages implemented (see `replica/route-map.md`).
- Server actions with RBAC and per-tenant checks in `src/app/(app)/actions.ts`; data layer `src/lib/data.ts`.
- Real seed data for org *Nusantara Digital* (login `alya@nusantara.id` / `kullo123`). No fabricated metrics: reports read only seeded rows; "Waktu tercatat 0.0 jam" is honest (no time logs seeded).

## Stage 4 — Anatomy figure

- `src/components/anatomy/` — Fig 1 "Kullo Work Router" isometric plate with input-tray → route chips, read-me box, light/dark variants. Built to explain the product's core idea (work routing).
- Verified rendering in production: `replica/screens/rebuild-home-1440-anatomy.png`.
- **Removed from the homepage on user request (2026-11-08)**, then deleted from the codebase entirely: `src/components/anatomy/` (5 files), `src/components/site/AnatomyFigure.tsx`, `src/app/anatomy.css`, the `.anatomy-*` CSS block in `globals.css`, and the CSS import in `(site)/layout.tsx`. No references remain (verified by grep).

## Stage 5 — Visual inspection

- Compared `replica/screens/rebuild-*` vs `source-ms-id-*` at 1440 and 390 (home top/mid/foot, menu, produk, harga, masuk; 11 app pages at 1440; settings; dashboard/tasks at 390).
- **Fixed:** mobile hero contrast bug — dark-slide copy was white-on-pale at ≤860px; dark slides now keep a dark copy panel (`src/app/globals.css`).
- **Fixed:** `"Segoe UI"` font fallbacks removed (3 hits) — `src/app/globals.css`, `src/components/anatomy/iso-kit.ts`, `replica/design/tokens.json`.

## Stage 6 — Tests

- Playwright added (`@playwright/test`, `npm test`), config `playwright.config.ts` (starts `next start -p 3010`, Chrome channel), suite `e2e/smoke.spec.ts`.
- **Result: 40/40 passed** (health, 12 marketing routes, 18 app auth-gate redirects, 404, F08 sign-in/out/wrong-password, shell render, search auth, pricing honesty, hero CTA).
- `replica/test-plan.md`: full case matrix (auto + manual) mapped to flows F01–F08.

## Stage 7 — Scoring

| check | result |
| --- | --- |
| `parity.py replica/features.csv` | **100.0** (76 counted, must-haves 55/55) |
| `contrast.py replica/design/tokens.json` | 14 pairs, **0** failing AA |
| `sweep.py` (MS brands/domains/colors) | **0** product-scope hits (report `replica/sweep-report.txt`; other hits are recon logs/build artifacts) |
| `npm run check` | see final entry below |

## Known limits (honest)

- Notifications are in-app only; email/WhatsApp delivery skipped by PRD decision.
- No payments: pricing is contact-sales.
- No visual-regression diff assertions yet (screenshots stored as evidence).
- Workspace has no git; "commit" in preflight = not applicable.

## Final check

- `npm run check` (lint + typecheck + build): **passing, 0 lint problems / 0 warnings** — output in `check-output.txt`.
- `npm test` against that build: **40/40 passed**.
- Route manifest: 47 routes (`replica/route-map.md`).
- Deploy steps: `replica/deploy.md`. Env template: `.env.example`.
