# Kullo build log

Date: 2026-11-08 Â· Repo: `C:\kullo` (no VCS — nothing committed) Â· Builder sessions: 4 concurrent (shared workspace, per user instruction)

Reference: `https://www.microsoft.com/id-id` used **only** as an appearance/pattern reference (promo bar, header, full-bleed hero + carousel, product card grid, split feature banner, footer). No Microsoft code, copy, assets, or logos were taken. Content is Kullo's own; product screens are clean-room from the PRD (`docs/specs/KULLO.md`).

## Stage 0 — Recon

- `replica/recon.md`: 10 marketing pages (M01–M10), 18 product screens (P01–P18), 8 flows (F01–F08), data model notes.
- Source screenshots in `replica/screens/source-ms-id-*.png` (1440 + 390, captured via headless Chrome; recon console logs under `.playwright-mcp/`).
- `replica/features.csv`: 79 rows â†’ clone=76, skip=3 (AI assistant, email/WhatsApp notification delivery, payment checkout — all PRD out-of-scope).

## Stage 1 — Plan

- Stack: Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind 4 (tokens in `src/app/globals.css`), Drizzle ORM + better-sqlite3, server actions for mutations, cookie session auth.
- `replica/architecture.md`, schema in `src/db/schema.ts`, migration + seed via `npm run db:setup`.
- Design tokens: `replica/design/tokens.json` â†” CSS custom properties (no raw hex in components).

## Stage 2 — Marketing rebuild

- Layout pattern reproduced with Kullo content: promo bar, sticky header + mega nav + mobile drawer, hero carousel (art/copy split, dark/light themes, pause, dots), quick links, product card grid, split banners, module map, resources, CTA, footer.
- Self-hosted Inter (`public/fonts/*.woff2`, OFL) — no external font requests.
- `/harga` shows **Hubungi kami** only; no prices were invented anywhere.

## Stage 3 — Product rebuild (clean-room)

- All 18 screens + 6 project views + 7 settings pages implemented (see `replica/route-map.md`).
- Server actions with RBAC and per-tenant checks in `src/app/(app)/actions.ts`; data layer `src/lib/data.ts`.
- Real seed data for org *Nusantara Digital* (login `alya@nusantara.id` / `kullo123`). No fabricated metrics: reports read only seeded rows; "Waktu tercatat 0.0 jam" is honest (no time logs seeded).

## Stage 4 — Anatomy figure

- `src/components/anatomy/` — Fig 1 "Kullo Work Router" isometric plate with input-tray â†’ route chips, read-me box, light/dark variants. Built to explain the product's core idea (work routing).
- Verified rendering in production: `replica/screens/rebuild-home-1440-anatomy.png`.
- **Removed from the homepage on user request (2026-11-08)**, then deleted from the codebase entirely: `src/components/anatomy/` (5 files), `src/components/site/AnatomyFigure.tsx`, `src/app/anatomy.css`, the `.anatomy-*` CSS block in `globals.css`, and the CSS import in `(site)/layout.tsx`. No references remain (verified by grep).

## Stage 5 — Visual inspection

- Compared `replica/screens/rebuild-*` vs `source-ms-id-*` at 1440 and 390 (home top/mid/foot, menu, produk, harga, masuk; 11 app pages at 1440; settings; dashboard/tasks at 390).
- **Fixed:** mobile hero contrast bug — dark-slide copy was white-on-pale at â‰¤860px; dark slides now keep a dark copy panel (`src/app/globals.css`).
- **Fixed:** `"Segoe UI"` font fallbacks removed (3 hits) — `src/app/globals.css`, `src/components/anatomy/iso-kit.ts`, `replica/design/tokens.json`.

## Stage 6 — Visual identity: bold pass, then Fluent 2 (owner decision, 2026-11-09)

**Final direction: DESIGN.md (Fluent 2) is authoritative.** Earlier on 2026-11-09 an exploratory bold pass (macOS chrome + Atlassian colour + module colours) was implemented; the owner then supplied `DESIGN.md` (Fluent 2) and chose "follow DESIGN.md fully" with the Segoe UI system stack. The app was re-skinned to the Fluent 2 system:

- Brand `#0F6CBD`, neutral `#FAFAFA`/`#F5F5F5`/`#E8E8E8`, text `#242424`/`#616161`, semantic colours per DESIGN.md Â§2.4.
- Segoe UI **system font stack** (never bundled); display weights 600; type scale 40/32/28/24 (Â§3).
- Radius 4/6/8/12, shadows level 1–3 only on hover/popover/modal (Â§5.3); no persistent shadows.
- Removed gradients, glassmorphism, ink bands, module colours and oversized radii (Â§19).
- Sidebar 240 px / topbar 48 px / page padding 24 px (Â§6); buttons 32 px / inputs 32 px / badges 22 px (Â§7).
- Marketing uses the same neutral + brand system; product screenshots remain as evidence (showcase), restyled to Fluent cards.

Two documented accessibility corrections in DESIGN.md Â§21: control border `#8A8A8A` (3:1), badge text uses `-ink` variants.

**Mobile (MOBILE.md, 2026-11-09):** bottom nav 64px with Beranda / My Work / Proyek / Chat / Lainnya (icons 22, labels 11, active `#0F6CBD`); mobile header 56px with Kullo logo + search + notifications (hamburger, quick-create and avatar hidden — More opens the drawer); content padding 16px + 88px bottom safe area; page title 22/600; touch targets 44px for buttons, inputs and header icons; task detail sheet full-screen; dashboard metrics become one full-width card + two-column cards. Chat keeps the conversation list stacked above the thread on mobile (full-screen conversation is a follow-up).

**App theme (owner directive, 2026-11-09):** the application (`/app/*`) now uses a Trello/Atlassian-inspired workspace theme documented in `DESIGN.md` Â§22 — blue top command bar, grey canvas, white cards, dense spacing — with **light and dark modes** (system preference / stored value, no in-app toggle per later owner request), a **collapsible sidebar** (56px icon rail, persisted), and no organisation name in the header. Marketing keeps the Fluent 2 theme. Dashboard metric cards were compacted and the mobile "Aksi cepat" panel removed (the header **+** menu is the single quick-create entry point). Contrast verified AA/AAA for every app pair in both themes.


## Stage 6b — File uploads & chat attachments (2026-11-09)

- **Task drawer**: lampiran bukan lagi metadata. File diunggah nyata (`uploadTaskAttachmentAction`) ke `data/uploads`, dicatat sebagai dokumen + versi, dan otomatis masuk folder dokumen **project** (nama proyek) atau **"Lampiran tugas"** bila tanpa proyek. Lampiran di drawer menautkan `/api/documents/{id}/file`.
- **Chat**: lampiran file/gambar (`sendChatAttachmentAction`) masuk folder **"Chat"**; tabel baru `message_attachments` (migrasi `0003`). Composer punya tombol lampiran, preview chip, dan **paste screenshot Ctrl+V**; bubble menampilkan gambar/file yang bisa dibuka.
- Batas file tetap 10 MB dengan daftar tipe yang sama seperti dokumen.

**Insiden migrasi (penting):** migrasi `0003` hasil `drizzle-kit generate` juga melakukan rebuild tabel `users` (drift skema lama). `DROP TABLE users` memicu cascade dan menghapus `memberships`, `conversation_members`, `messages`, `notifications` di DB demo. Data demo dipulihkan (8 membership, 18 conversation member, 15 pesan seed). **Selalu backup `data/kullo.db` sebelum `db:migrate`**; langkah backup sudah ditambahkan di `replica/deploy.md`.

**Login fix:** cookie sesi sebelumnya `secure: NODE_ENV === "production"`, sehingga di preview HTTP localhost cookie ditolak browser. Sekarang `secure` mengikuti header `x-forwarded-proto`/`x-forwarded-ssl` (HTTPS di produksi, HTTP di localhost).

## Stage 7 — Tests



- Playwright added (`@playwright/test`, `npm test`), config `playwright.config.ts` (starts `next start -p 3010`, Chrome channel), suite `e2e/smoke.spec.ts`.
- **Result: 40/40 passed** (health, 12 marketing routes, 18 app auth-gate redirects, 404, F08 sign-in/out/wrong-password, shell render, search auth, pricing honesty, hero CTA).
- `replica/test-plan.md`: full case matrix (auto + manual) mapped to flows F01–F08.

## Stage 8 — Scoring

| check | result |
| --- | --- |
| `parity.py replica/features.csv` | **100.0** (76 counted, must-haves 55/55) |
| `contrast.py replica/design/tokens.json` | 16 pairs, **0** failing AA |
| `sweep.py` (MS brands/domains/colors) | **0** product-scope hits (report `replica/sweep-report.txt`; other hits are recon logs/build artifacts) |
| `npm run check` | see final entry below |

## Known limits (honest)

- Notifications are in-app only; email/WhatsApp delivery skipped by PRD decision.
- No payments: pricing is contact-sales.
- No visual-regression diff assertions yet (screenshots stored as evidence).
- `"Segoe UI"` appears in the font stack by owner decision (DESIGN.md Â§3, system font only — no font files bundled). `sweep.py` will flag the string; that is expected and accepted.
- Workspace has no git; "commit" in preflight = not applicable.

## Final check

- `npm run check` (lint + typecheck + build): **passing, 0 lint problems / 0 warnings** — output in `check-output.txt` (Fluent 2 + mobile layer, 2026-11-09).
- `npm test` against that build: **40/40 passed** (`test-output.txt`).
- `contrast.py`: **16 pairs, 0 AA failures** (Fluent tokens).
- Visual evidence: `replica/screens/fluent-*.png` (1440), `fluent2-home-390.png`, `fluent3/4-app-390.png`, `m-*.png` (mobile per MOBILE.md), `m2-*.png` (density pass: dashboard, my work, chat, projects on 390).
- Mobile density pass (owner feedback): description text and eyebrow hidden â‰¤640px, secondary header CTAs hidden, stat hints hidden, tableâ†’cards, filter rows scroll horizontally, controls 38–40px. Recorded in MOBILE.md Â§27.4.
- Route manifest: 47 routes (`replica/route-map.md`).
- Deploy steps: `replica/deploy.md`. Env template: `.env.example`.

### Foto profil & picker peserta (2026-11-09)

- **Foto profil**: unggah di Profil, dikompres di browser (canvas, maks 512px, JPEG kualitas turun otomatis) sampai **â‰¤200 KB**; server memvalidasi ulang. Disimpan di `data/uploads/avatars`, kolom baru `users.avatar_key` (migrasi `0004` — ALTER aman, backup dibuat lebih dulu). API `/api/avatar/[id]` menyajikan foto atau fallback SVG inisial; dipakai header, sidebar, tim, chat, komentar, proyek, laporan, persetujuan.
- **Peserta agenda**: multi-select Ctrl diganti **pencarian anggota + daftar yang bisa diklik**, chip peserta terpilih, hidden input `participants`. Diuji membuat agenda dengan Maya diundang (event_participants + notifikasi).

### Umpan balik, refresh dashboard, filter notifikasi (2026-11-09)

- **Foto profil tidak berubah setelah simpan**: penyebabnya URL avatar sama, sehingga browser memakai fallback inisial dari cache memori. Perbaikan: `Avatar` menerima `version` (`avatarKey`), URL menjadi `/api/avatar/{id}?v=...`; Profil memakai versi `upload-<timestamp>` setelah unggah; header/sidebar menerima `avatarKey` dari server. Bukti piksel: 4 gambar avatar termuat 512px, RGB `#c95114` (foto uji oranye), bukan inisial.
- **Toast global** (`src/components/app/Toaster.tsx`): event `kullo:toast`, `aria-live="polite"`, auto-dismiss 3,4 dtk, tone success/info/error. Dipakai di chat (kirim lampiran, edit/hapus pesan, rename/hapus percakapan, anggota), profil (simpan, sandi, avatar), unggah lampiran tugas, dan quick-create.
- **Dashboard**: tombol `Diperbarui HH.MM` memanggil `router.refresh()` + toast; tersedia di header desktop dan di atas metrik pada mobile. Angka metrik kini netral, tone hanya titik label (bukan angka alarm). Empty state mobile dipadatkan.
- **Notifikasi**: filter Semua/Belum dibaca dengan `aria-pressed` dan empty state per filter.
- **Tab settings**: fade tepi + `scroll-snap` di 640px ke bawah sebagai indikator overflow.
- `docs/specs/PLAN.md` bagian 10: item 3, 23, 25, 49, 53, 54 ditandai selesai.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**. Bukti: `replica/screens/plan10-dashboard-1440.png`, `plan10-dashboard-390.png`, `plan10-toast-1440.png`, `plan10-toast-390.png`, `plan10-notif-1440.png`, `plan10-settings-tabs-390.png`.

### Batch 2: filter tugas, pratinjau dokumen, konfirmasi destruktif (2026-11-09)

- **Tugas**: filter (cari/proyek/status/prioritas/PIC/sort) disimpan di `sessionStorage` per tab dan dipulihkan setelah refresh/navigasi; tombol Reset mengosongkannya. Diuji: set filter MKT-04 + search "kampanye" -> reload -> nilai pulih (6 baris).
- **Dokumen**: tombol "Pratinjau" tidak lagi membuka file mentah di tab baru. Modal in-app: gambar langsung, PDF via iframe, tipe lain menampilkan opsi unduh; Escape/backdrop menutup; tombol Unduh tetap tersedia. Diuji dengan "Spek videotron.pdf" (1440 & 390).
- **Konfirmasi destruktif disatukan** dengan komponen baru `ConfirmDialog` (palette, Escape, backdrop, busy state): hapus agenda (kalender), arsip tugas (drawer), arsip proyek (settings). `window.confirm` dihapus dari ketiganya; dialog di atas modal lain pakai `z-index` 130 + `aria-hidden` pada konteks belakang.
- Komentar CSS tema aplikasi diubah agar `sweep.py src` bersih (referensi merek hanya di dokumentasi `DESIGN.md`).
- Verifikasi akhir: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih.
- Bukti: `replica/screens/plan10-task-filters-1440.png`, `plan10-doc-preview-1440.png`, `plan10-doc-preview-390.png`, `plan10-confirm-1440.png`, `plan10-confirm-390.png`, `plan10-confirm-project-1440.png`, plus dashboard/tabs `plan10-dashboard-1440.png`, `plan10-dashboard-390.png`, `plan10-settings-tabs-390.png`.

### Batch 3: toolbar My Work disamakan dengan Tasks + refresh dashboard dihapus (2026-11-09)

- **My Work = Tasks**: `TaskExplorer` untuk `mode="my"` kini merender baris yang sama dengan halaman Tugas — kiri: badge `{n} tugas`, kanan: switch tampilan (List/Board/Kalender) + tombol **Tugas**. Tab scope (Ditugaskan/Dibuat/Diikuti/Selesai/Terlambat) dihilangkan atas permintaan owner; link tetap `<a>` ber-`href` `?view=...&scope=...` sehingga view tetap URL-driven, sementara Tasks tetap state-driven `<button>` dengan gaya identik (12px, padding 6px 10px, radius 7).
- Scope tetap hidup lewat URL (mis. link kartu dashboard `?scope=overdue`); bila scope berbeda dari default, labelnya muncul di badge (`0 tugas Â· Terlambat`) agar filter tersirat tidak senyap. Empty state `mode="my"` disesuaikan (tab sudah tidak ada).
- **Dashboard**: tombol `Diperbarui HH.MM` (item 25) dihapus atas permintaan owner — komponen `DashboardRefresh.tsx` dan aturan `.dash-mobile-refresh` ikut dihapus; `docs/specs/PLAN.md` Â§10.3 ditandai "dihapus atas permintaan owner".
- Properti `hideViewSwitch` dihapus dari `TaskExplorer` (satu-satunya pemakai My Work). `window.confirm`/tab lain tidak terpengaruh.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih.
- Bukti browser (3005): klik Board -> `/app/my-work?view=board&scope=assigned` (papan dirender); `?scope=overdue` -> badge `0 tugas Â· Terlambat`; toolbar My Work vs Tasks identik terstruktur dan identik `getComputedStyle`.
- Bukti: `replica/screens/mywork-viewswitch-1440.png`, `mywork-viewswitch-390.png`, `plan10-dashboard-1440.png` (tanpa tombol refresh), `plan10-dashboard-390.png`.

### Bugfix: tugas tampil di List tapi hilang di Board/Kanban (2026-11-09)

- **Gejala**: di My Work, "Buat list kampanye" (KUL-027) muncul di tampilan List tetapi tidak ada di Board; kolom Board semua "Kosong".
- **Akar masalah**: penyusunan kolom Board memasangkan `task.statusName` dengan nama status, sedangkan KUL-027 tersimpan dengan `status_id = NULL`. Pembuat tugas `createTaskAction` hanya memakai `statusId` dari form; QuickCreate (modal "Buat tugas") tidak mengirim status, sehingga tugas berproyek lahir tanpa status dan tidak cocok dengan kolom mana pun. `messageToTaskAction` sudah benar (pakai status pertama proyek) - jadi perilakunya tidak konsisten.
- **Perbaikan 1 (akar)**: `createTaskAction` kini memberi status default (status posisi pertama proyek) saat proyek dipilih dan form tidak mengirim status. Tugas tanpa proyek tetap `NULL` (sesuai pesan error "Tugas tanpa proyek belum punya status").
- **Perbaikan 2 (paritas)**: `TaskExplorer` membangun `boardGroups` dari `filtered`: setiap tugas yang lolos filter pasti masuk satu kolom; tugas tanpa status (atau statusnya tidak dikenal) masuk kolom tambahan **"Tanpa status"** yang tidak bisa menerima drop. Select pada kartunya menampilkan "Tanpa status" (bukan status pertama yang menyesatkan) dan mengabaikan nilai kosong. Jumlah kartu Board kini selalu sama dengan baris List.
- **Verifikasi (browser 3005)**: My Work List 1 baris = Board 1 kartu; Tasks (dengan filter MKT-04) List 14 baris = Board 14 kartu (Backlog 2 / To Do 2 / In Progress 4 / In Review 2 / Done 3 / Tanpa status 1). Tugas uji "Uji status default" dibuat via QuickCreate tanpa status -> `status_id = st_prj_kullo_backlog` (akar masalah teratasi), lalu diarsipkan. KUL-027 dipindah ke Backlog lewat select kartu; tidak ada lagi tugas aktif tanpa status di DB.
- **Bukti**: `replica/screens/mywork-board-tanpa-status-1440.png` (kolom Tanpa status saat kondisi lama dipulihkan sejenak, lalu dikembalikan), `mywork-board-1440.png`, `mywork-board-390.png`, `board-parity-1440.png`.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**.

### Batch 4: papan Kanban ala Trello + tahapan papan yang bisa diedit (2026-11-09)

- **Kolom = tahapan proyek (`project_statuses`)**: aksi server baru `createStatusAction`, `updateStatusAction`, `reorderStatusAction`, `deleteStatusAction` di `src/app/(app)/actions.ts` (izin `project.edit`, cek organisasi, nama unik 2-30 karakter, maksimal 12 tahap). Hapus tahap ditolak bila masih ada tugas (`Masih ada N tugas pada tahap ini...`) atau bila itu tahap terakhir; tidak ada pemindahan data senyap. Tanpa migrasi DB (tidak ada kolom baru).
- **Header kolom**: judul bisa diklik untuk rename inline (Enter simpan, Escape batal, blur simpan), badge jumlah kartu, tombol "..." membuka menu (Ubah nama, Kategori Terbuka/Berjalan/Review/Selesai, Pindah ke kiri/kanan, Hapus tahap via `ConfirmDialog`). Menu 216px di dalam kolom; tutup saat klik luar/Escape. Menu, urutan, dan "Tambahkan daftar" hanya muncul saat papan berasal dari satu proyek; kolom gabungan lintas proyek tetap hanya untuk memindah kartu.
- **Tambah daftar & tambah kartu**: tombol "Tambahkan daftar" di ujung papan (input + Enter). Setiap kolom punya "+ Tambahkan kartu" dengan composer (Enter simpan & lanjut, Escape batal); pada kolom gabungan muncul pilihan proyek kecil. Kartu baru memakai status kolom tsb (diverifikasi: kartu uji -> `status_id = st_prj_campaign_backlog`, lalu diarsipkan).
- **Kartu lebih kaya**: chip label berwarna (maks 2 + "+n"), kode proyek + titik prioritas, tenggat (merah bila lewat), hitungan komentar, lampiran, checklist x/y, dan tumpukan avatar (PIC + kolaborator, maks 2 + "+n"). Di <=640px chip label dan meta-icon disembunyikan agar kartu tetap ringkas.
- **Label bisa diatur**: `getTaskDetail` mengirim `availableLabels` (label organisasi) dan aksi `setTaskLabelsAction` mengganti `task_label_links` (izin `task.edit`). Di drawer tugas ada bagian Label: chip dengan tombol hapus + select "Tambah label...". Diverifikasi dengan menambah label `backend` ke KUL-010; chip tampil di kartu papan.
- **Pengaturan proyek**: panel "Tahapan papan" di `ProjectSettings` (rename, kategori, naik/turun, hapus dengan konfirmasi, tambah tahap baru) lengkap dengan badge jumlah tugas per tahap. Halaman settings mengirim `statuses` + `taskCount`.
- **Permintaan owner (susulan)**: teks "Papan Kanban / Seret kartu antar kolom..." dihapus dari halaman Board proyek; strip "Progres 14% / tanggal / x/y tugas selesai / milestone / PM" di header proyek dihapus (informasi tetap ada di Overview); gap di mobile dirapatkan (`project-outlet` 16 -> 8px, panel header 14 -> 10px) dan panel header ikut dihapus sehingga Board dimulai tepat di bawah tab.
- Verifikasi (browser 3005): tambah daftar "Tahap Uji" -> rename "Tahap Uji 2" -> kategori Selesai -> urutan ditukar dan dikembalikan -> hapus tahap kosong berhasil -> hapus "In Review" ditolak dengan pesan yang benar -> papan kembali 5 tahap. Tasks gabungan: 6 kolom, tanpa "Tambahkan daftar", menu hanya di kolom milik satu proyek. Data demo dirapikan (tahap uji dihapus, kartu uji diarsipkan).
- Verifikasi akhir: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih.
- Bukti: `replica/screens/board-colmenu-1440.png`, `board-colmenu2-1440.png`, `board-trello-1440.png`, `board-trello-final-1440.png`, `board-card-label-1440.png`, `settings-tahapan-1440.png`, `project-no-progress-1440.png`, `project-no-progress-390.png`, `board-mobile-before-390.png`, `board-mobile-after-390.png`.

### Batch 5: drawer tugas (label, PIC, tempel gambar), kalender mobile, header mobile (2026-11-09)

- **Label pindah ke samping Tenggat**: blok Label mandiri dihapus; kini baris meta drawer berisi Status/Prioritas/PIC lalu Tenggat + Label berdampingan (grid `minmax(150px,1fr)`, jadi 3 kolom di panel 600px). Chip label + tombol "+ Label" sejajar tenggat, dan teks "Belum ada label." dihapus total.
- **PIC cari + pilih**: select biasa diganti `PersonSelect` (komponen baru di `TaskDrawer.tsx`): tombol menampilkan avatar + nama, popover berisi input cari nama dan daftar anggota proyek (gaya `.participant-row` yang sama dengan pemilih peserta agenda), opsi "Belum ditetapkan", tutup via Escape/klik luar. Dipakai untuk `assigneeId` (diverifikasi pilih Alya -> tersimpan, dikembalikan ke "Belum ditetapkan").
- **Tempel gambar di komentar**: `onPaste` pada textarea diskusi membaca item `image/*` clipboard, membungkusnya jadi `screenshot-<waktu>.png`, mengunggah lewat `uploadTaskAttachmentAction`, lalu menampilkan pratinjau 40px + nama + status "Terlampir ke tugas" (dengan tombol tutup). Daftar lampiran menampilkan thumbnail 34px untuk PNG/JPG/GIF/WEBP. Diverifikasi dengan event paste sungguhan (canvas -> File -> DataTransfer): unggahan tersimpan (`attachments` 136 byte), toast muncul, kartu menampilkan indikator lampiran, lalu tugas uji diarsipkan.
- **Kalender responsif (mobile)**: grid bulan tidak lagi dipaksa `minmax(78-88px)` (penyebab scroll horizontal 546px di layar 390). Grid kini `repeat(7,minmax(0,1fr))` (sel ~52px), sel 62px, chip agenda 9px, header kalender membungkus; tampilan minggu di halaman Kalender berubah dari 7 kolom sempit menjadi daftar 7 baris hari. Diverifikasi di Board proyek > Kalender (365px, tanpa overflow) dan `/app/calendar` (Bulan 49,8px/kolom, Minggu 1 kolom).
- **Header halaman disembunyikan di mobile**: pada â‰¤640px seluruh `.page-header` (eyebrow/judul/deskripsi + tombol sejajar seperti "Semua tugas"/"Tugas baru") disembunyikan untuk Dashboard, My Work, Proyek, Tugas, Kalender, Tim, Dokumen, Permintaan, Persetujuan, dan Pengaturan. Nama halaman sudah ada di header mobile; pembuatan data tetap lewat menu **+**. Desktop tidak berubah (header tetap tampil, diverifikasi di My Work 1440).
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih; 10 halaman diperiksa di 390 (header `display:none`, tanpa overflow horizontal).
- Bukti: `replica/screens/drawer-label-pic-1440.png`, `drawer-pic-search-1440.png`, `drawer-paste-1440.png`, `drawer-attach-thumb-1440.png`, `drawer-mobile-390.png`, `calendar-mobile-390.png`, `calendar-page-month-390.png`, `calendar-page-week-390.png`, `mywork-desktop-1440.png`.

### Batch 6: header halaman dihapus (desktop), Laporan, detail proyek, List/Board proyek (2026-11-09)

- **Header halaman dihapus untuk semua lebar** (permintaan owner): `PageHeader` tidak lagi dirender di Dashboard, My Work, Proyek, Tugas, Kalender, Tim, Dokumen, Permintaan, Persetujuan, Pengaturan, dan Laporan. Judul/deskripsi/eyebrow serta tombol sejajar ("Semua tugas", "Tugas baru", "Buka My Work", "Undang anggota", "Proyek baru", "Buat permintaan", "Agenda baru", dll.) hilang; tiap halaman tetap punya `h1` `sr-only` agar struktur aksesibilitas dan uji e2e tetap sah, dan pembuatan data tetap tersedia lewat menu **+** header, toolbar Tugas (`+ Tugas`), tombol Agenda di kalender, tombol Buat permintaan di daftar permintaan, serta empty state.
- **Laporan**: header dihapus; tombol **Ekspor CSV** dipindah ke samping **Terapkan** (satu grup dengan jarak 8px, Reset setelahnya). Sekalian diperbaiki: grafik "Dibuat vs selesai" sebelumnya kosong karena tinggi batang memakai persentase di dalam grid auto-height; kini tinggi dihitung px (maks 150px) sehingga batang tampil. Di â‰¤1023px grid laporan jadi satu kolom (`.reports-grid`) dan tabel bergulir di dalam panelnya, sehingga halaman tidak lagi melebar (dulu 574px di viewport 390).
- **Detail proyek**: tombol **Pengaturan** dan **+ Tugas** di header proyek dihapus (judul + deskripsi tetap); keduanya tetap bisa diakses lewat tab Pengaturan dan toolbar Board.
- **Daftar proyek**: switch **List / Board** ditambahkan tepat di samping filter "Semua departemen" (URL `?view=board|list`, filter lain dipertahankan, `view` ikut terkirim saat Terapkan). Board = kartu seperti sebelumnya, List = tabel (Proyek/kode/departemen, Status, Progres, Tugas, Anggota, Tenggat, PM). Kartu Board memakai `repeat(auto-fill, minmax(300px,1fr))` sehingga satu hasil tetap selebar kartu (~377px di 1440), tidak melebar penuh. Di 390px switch tidak lagi menyusut (131x36) karena filter strip bergulir horizontal.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih. Diperiksa di 1440: 11 halaman tanpa `.page-header`, `h1` sr-only ada, tanpa overflow; kartu tunggal 377px; grid 6 kartu tetap 3 kolom. Di 390: Laporan tanpa overflow (dulu 574px), Terapkan+Ekspor CSV sebaris, switch 131x36.
- Bukti: `replica/screens/reports-1440.png`, `reports-390.png`, `project-overview-no-actions-1440.png`, `projects-board-1440.png`, `projects-list-1440.png`, `projects-list-390.png`, `projects-board-single-1440.png`.

### Batch 7: bottom sheet "Lainnya" + perbaikan chat (2026-11-09)

- **"Lainnya" jadi bottom sheet**: tab kelima tidak lagi membuka drawer sidebar. Lembar naik dari bawah (animasi 260ms `cubic-bezier(.2,.8,.2,1)` + backdrop fade) berisi handle geser, nama workspace, judul "Menu", tombol tutup, dan grid 4 kolom berisi 12 tujuan (Dashboard, My Work, Proyek, Tugas, Kalender, Tim, Chat, Dokumen, Permintaan, Persetujuan, Laporan, Pengaturan) dengan ikon, status aktif, serta badge jumlah My Work/Persetujuan. Interaksi: tap tile menavigasi & menutup, backdrop/Escape/X menutup, handle bisa diseret ke bawah (mengikuti jari via pointer events, tutup bila >90px), body scroll dikunci, `prefers-reduced-motion` mematikan animasi. Di layar â‰¥1024 sheet disembunyikan.
- **Chat mobile — komposer menggantikan tab bar**: saat percakapan dibuka (`chat-layout.has-active`) di â‰¤1023px, tab bar disembunyikan, padding bawah konten menyusut ke safe-area, dan `.chat-layout` memakai tinggi `100dvh - topbar - padding` dengan feed `flex:1` sehingga input menempel di dasar layar. Setelah feedback owner, jarak bawah input dinaikkan menjadi **21px** dari tepi layar (`app-content` 16px + compose 6px + safe area) agar tidak terlalu mepet; daftar chat tanpa percakapan aktif tetap menampilkan tab bar (terukur `grid`), dan tombol kembali mengembalikannya.
- **Teks bantuan dihapus**: baris "Enter untuk kirim Â· Shift+Enter untuk baris baru. Mention memakai @nama. Tempel screenshot dengan Ctrl+V" dihapus dari komposer (diverifikasi `hasEnter=false`, isi `.chat-compose` hanya tombol Kirim).
- **Edit pesan inline**: modal "Edit pesan" dihapus. Klik Edit mengganti bubble menjadi textarea + Batal/Simpan di posisi yang sama (autoFocus, Enter simpan, Shift+Enter baris baru, Escape batal, error tampil di dalam blok). Diuji: ubah teks â†’ Simpan â†’ bubble berubah, lalu dikembalikan ke teks asli.
- **Warna aksi lebih lembut**: baris aksi (Reaksi/Tugas/Balas/Edit/Hapus) memakai `--text-muted` (rgb 68,84,111) sementara isi pesan `--text` (rgb 23,43,77); hover menggelap, chip reaksi aktif tetap aksen.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih.
- Bukti: `replica/screens/mobile-more-sheet-390.png`, `chat-mobile-list-390.png`, `chat-mobile-active-390.png`, `chat-mobile-back-390.png`, `chat-inline-edit-390.png`, `chat-desktop-compose-1440.png`.

### Batch 8: peran anggota & ikon kanal + filter daftar chat (2026-11-09)

- **Badge "anggota" â†’ menu titik tiga**: badge jumlah anggota di header chat dihapus; menu "..." kini punya item **Anggota** untuk semua jenis percakapan. Deskripsi kanal di bawah nama juga dihapus (header hanya nama).
- **Peran anggota (migrasi 0005)**: kolom `conversation_members.role` (`admin`/`member`, default member); migrasi mengangkat anggota pertama tiap percakapan non-DM menjadi admin. Aksi baru `setConversationMemberRoleAction`; `addConversationMemberAction`/`removeConversationMemberAction` kini mensyaratkan admin (keluar sendiri tetap boleh). Admin terakhir tidak bisa dicabut atau dikeluarkan — pesan "Angkat admin lain sebelum keluar…". Pembuat percakapan/kanal otomatis admin.
- **Modal Anggota**: daftar anggota dengan badge **Admin**, tombol Jadikan/Cabut admin dan Keluarkan untuk admin, tombol Keluar untuk diri sendiri, catatan khusus untuk non-admin, serta **pencarian** pada daftar "Tambah anggota" (diverifikasi: cari "sin" â†’ Sinta Dewi).
- **Ikon kanal (migrasi 0006)**: kolom `conversations.icon`; dialog **+** kini punya tab **Chat & grup** dan **Kanal**. Kanal baru: nama + pilihan ikon tagar/bintang/hati/pin (gaya Discord), memakai aksi `createChannelAction` (nama unik, pembuat jadi admin). Ikon dipakai di daftar dan header (diverifikasi kanal uji dengan ikon bintang, lalu dihapus).
- **Filter daftar chat**: label "Percakapan N" diganti segmented control **Semua / Belum dibaca / Kanal**; filter memilih daftar (kanal vs pesan langsung) dan menampilkan empty state yang sesuai. Diukur muat di 390px tanpa overflow.
- **Default mobile & tampilan list**: `/app/projects` membuka **List** di â‰¤1023px (deteksi UA di server + komponen `MobileDefaultList` untuk mode responsif) sementara desktop tetap Board; My Work di mobile kini menampilkan **tabel penuh** (header Tugas/Proyek/Status/…) yang bergulir di dalam panel seperti daftar proyek, bukan kartu bertumpuk (aturan kartu mobile dibatasi `:not([data-mode="my"])`).
- **Kalender mobile lebih besar & bisa digeser**: sel 92Ã—96px (sebelumnya 52px) dengan teks 11/10.5px, grid dibungkus `.calendar-scroll` (overflow-x auto); halaman Kalender memakai grid yang sama sehingga bisa di-swipe tanpa membuat halaman melebar. Terukur: grid 645px pada viewport 390 (scroll), `pageOverflow=false`.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih. Backup DB sebelum migrasi: `data/kullo.backup-2026-11-09-before-chat-admin.db`, `…-before-channel-icon.db`.
- Bukti: `replica/screens/chat-members-admin-1440.png`, `chat-members-nonadmin-1440.png`, `chat-members-search-1440.png`, `chat-channel-star-1440.png`, `chat-header-nodec-1440.png`, `chat-filter-all-1440.png`, `chat-filter-390.png`, `projects-mobile-default-list-390.png`, `mywork-mobile-table-390.png`, `calendar-mobile-bigger-390.png`, `calendar-page-mobile-bigger-390.png`.

### Batch 9: edit pesan lewat komposer + empty state "Belum dibaca" (2026-11-09)

- **Edit pesan gaya WhatsApp**: blok editor besar di dalam thread dihapus. Klik **Edit** kini mengisi komposer di bawah (posisi input tetap), memunculkan bar "Edit pesan" dengan tombol batal, menandai bubble asli dengan outline, dan mengubah tombol kirim menjadi **Simpan** (ikon centang). Enter menyimpan, Escape membatalkan dan mengembalikan draft yang tadi ada di komposer. Diverifikasi: simpan mengubah bubble, edit ulang mengembalikan teks asli, dan Escape mengembalikan draft "draf saya".
- **Area "Belum dibaca"**: tidak lagi menampilkan header seksi "Pesan langsung" atau dua kalimat kosong yang berulang. Ketika tidak ada chat belum dibaca, muncul empty state terpusat ala WhatsApp: ikon chat, "Tidak ada chat belum dibaca", dan "Chat dengan pesan baru akan muncul di sini." Filter **Kanal** memakai pola kosong yang sama ("Belum ada kanal" + ikon #). Offset ikon terhadap pusat panel = 0px di 390.
- **Panel tanpa percakapan**: empty state kanan memakai flex center sehingga ikon + teks berada tepat di tengah panel (diverifikasi center panel = center konten).
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih.
- Bukti: `replica/screens/chat-edit-composer-1440.png`, `chat-edit-composer-390.png`, `chat-unread-empty-1440.png`, `chat-unread-empty-390.png`, `chat-no-selection-1440.png`.

### Batch 10: revert menu Dokumen ke versi sebelumnya (2026-11-10)

- Atas permintaan owner, menu **Dokumen** dikembalikan ke versi sebelum eksperimen Google Drive/OneDrive/DRIVE.md: kartu ringkasan (Berkas, Terpakai, Riwayat versi, Folder), toolbar cari + jumlah file + **Unggah dokumen**, sidebar folder 190px, daftar baris (ikon tipe, nama, versi/ukuran/folder/tanggal, badge visibilitas), panel **Detail dokumen** (pratinjau, unduh, riwayat versi, tambah versi), modal pratinjau, modal unggah.
- Yang dihapus: shell Drive (sidebar My Drive/Shared/Recent/Starred/Trash, kartu folder, storage meter, grid kartu, bulk selection, dialog share, drag-drop upload) beserta aksi server khusus Drive (`createFolderAction`, `renameDocumentAction`, `moveDocumentAction`, `setDocumentStarAction`, `trashDocumentAction`, `restoreDocumentAction`, `deleteDocumentAction`, `shareDocumentAction`, `unshareDocumentAction`) dan CSS-nya. `docs/specs/DRIVE.md` tetap tersimpan sebagai dokumen produk tetapi tidak diterapkan.
- Catatan data: migrasi 0007 (komentar bergambar) tetap dipakai; migrasi 0008 (`documents.is_starred/is_trashed/deleted_at`) dan 0009 (`document_permissions`) sudah masuk DB tetapi kini tidak direferensikan UI — dibiarkan agar tidak perlu rebuild tabel SQLite. Backup sebelum migrasi Drive: `data/kullo.backup-2026-11-09-before-drive-fields.db`, `…-before-doc-sharing.db`.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih. Diperiksa di 1440 & 390: tidak ada `.doc-shell`/nav Drive, `.doc-layout` 3 kolom desktop dan 1 kolom mobile, tanpa overflow.
- Bukti: `replica/screens/documents-reverted-1440.png`, `documents-reverted-390.png`.

### Batch 11: durasi tugas, versi dokumen, arsip, dan interaksi folder (2026-11-10)

- **Durasi tugas**: drawer menampilkan blok **Total waktu** (mis. "5 hari 7 jam") dari `createdAt` sampai status masuk kategori Done; tugas terbuka menampilkan "Berjalan sejak …". `tasks.completed_at` diisi saat status berubah ke Done dan dikosongkan saat dibuka kembali (migrasi 0010 + backfill tugas Done = `updated_at`). Laporan mendapat kartu **Rata-rata durasi** dan grafik mingguan memakai `completed_at`.
- **Versi dokumen = ganti file**: tombol **Ganti file (versi baru)** mengunggah revisi ke `data/uploads/versions`, menaikkan versi dokumen, dan menyimpan file lama sebagai versi di riwayat (bisa diunduh via `?version=`). **Kembalikan versi ini** membuat versi baru dari file lama (file saat ini ikut disnapshot), jadi tidak ada file yang hilang. Diverifikasi: v1â†’v2 (md 72 B) lalu pulihkan v1 â†’ v3 (png 190 B), unduhan versi 200 OK.
- **Arsip**: tombol **Arsip** di samping **Unggah dokumen**; menghapus dokumen memindahkannya ke arsip (`is_trashed` + `deleted_at`), bisa **Pulihkan** atau **Hapus permanen**, dan otomatis dibersihkan setelah **30 hari** saat halaman dimuat (file + seluruh file versi ikut dihapus).
- **Folder & drag-drop**: tombol **+** di panel Folder untuk membuat folder (termasuk subfolder di folder aktif), baris/kartu bisa diseret ke folder atau breadcrumb (**Semua file**/folder induk) untuk memindahkan file naik/turun.
- **Toolbar**: urutan **Arsip Â· A–Z/Z–A Â· List/Board Â· Pilih Â· Unggah**; board menampilkan preview gambar langsung (atau ikon tipe besar). Mode **Pilih** memunculkan checkbox dan bar aksi **Salin / Pindah / Hapus**; item yang disalin/dipotong ditempel ke folder aktif lewat **Tempel (n)** (salinan dibuat sebagai file baru "(salinan)", pindah memakai move).
- Verifikasi browser: salin 1 dokumen ke folder Chat â†’ muncul "Anggaran 2027 — Draft (salinan).xlsx" lalu dihapus permanen untuk merapikan; drag Spek videotron Chat â†’ Semua file â†’ Chat (toast benar); buat subfolder "Sub Uji" lalu dibersihkan; sort Z–A mengubah urutan; 390px tanpa overflow.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih. Backup sebelum migrasi 0010: `data/kullo.backup-2026-11-10-before-cycle-versioning.db`.
- Bukti: `replica/screens/task-duration-done-1440.png`, `task-duration-complete-1440.png`, `reports-cycle-time-1440.png`, `doc-version-after-replace-1440.png`, `doc-version-restored-1440.png`, `documents-archive-btn-1440.png`, `documents-archive-modal-1440.png`, `documents-toolbar-order-1440.png`, `documents-board-v3-1440.png`, `documents-paste-copy-1440.png`, `documents-enhanced-390.png`.

### Batch 12: menu Database (CRM) + hapus Pengaturan dari bottom sheet (2026-11-10)

- **Menu Database baru** sesuai docs/specs/DATABASE.md (subset inti): halaman `/app/database` dengan **Overview** (Contacts, Organizations, Clients, Leads, Vendors, Follow-up + overdue/upcoming), daftar **Follow-up terdekat**, dan **Aktivitas terbaru**.
- **Saved views**: Overview, All Contacts, Organizations, Clients, Leads, Vendors, Partners, Favorites, Follow-ups — semuanya filter atas satu kumpulan record (bukan tabel ganda).
- **Data model**: migrasi 0011 menambah `business_records` (type person/organization, kontak, industri, status, favorit, organisasi induk), `business_classifications`, `follow_ups` (subjek, jenis, tenggat, PIC, status) dan `business_activities`. Seed idempoten 9 record (5 organisasi/4 kontak) + 5 follow-up; role lama disinkronkan dengan izin baru `database.view`/`database.manage` (owner/admin/manager/leader manage, staff view, guest none).
- **Aksi**: `createBusinessRecordAction`, `updateBusinessRecordAction`, `toggleBusinessFavoriteAction`, `createFollowUpAction`, `toggleFollowUpAction` (semua org-scoped, permission database.manage kecuali favorit).
- **UI**: toolbar (cari, Follow-up, Tambah data), dialog Tambah data (Organisasi/Kontak, klasifikasi multi-pilih, organisasi induk, industri/ukuran), dialog follow-up (record, jenis, tanggal, PIC), dialog detail record (kontak, klasifikasi, favorit, follow-up per record + tandai selesai), tabel dengan status badge dan tombol favorit. Sidebar menampilkan **Database** di grup Kolaborasi; label halaman "Database".
- **Mobile "Lainnya"**: opsi **Pengaturan dihapus** dari bottom sheet (masih bisa diakses lewat rute/desktop). Database ikut muncul di sheet.
- **Belum dibangun** dari docs/specs/DATABASE.md: pipeline/kanban, custom fields, import data, dan tombol **Data** pada popup tugas (relasi task–record) — dicatat di DESIGN Â§8.11.
- Verifikasi browser: overview memuat 4 contacts/5 organizations/2 clients/1 lead/1 vendor, follow-up overdue tampil merah; tab Clients menampilkan 2 record; detail PT ABC dan toggle follow-up selesaiâ†’pending berfungsi; 390px tanpa overflow dan sheet berisi 12 tile tanpa Pengaturan.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` 16 pasang, **0 gagal AA**; `sweep.py src` bersih. Backup sebelum migrasi: `data/kullo.backup-2026-11-10-before-database.db`.
- Bukti: `replica/screens/database-overview-1440.png`, `database-client-detail-1440.png`, `database-mobile-390.png`, `mobile-more-no-settings-390.png`.

### Batch 13: revert menu Database (2026-11-10)

- **Permintaan owner:** "kembalikan seperti sebelumnya (sebelum ada menu database)".
- Dihapus: rute `/app/database`, komponen `DatabaseClient`/`DatabaseForms`/`DatabaseDetail`/`database-shared`, aksi `database-actions`, data `crm-data`, parser `lib/csv`, seed `seed-database`, item sidebar + label halaman, izin `database.view`/`database.manage`, dan seluruh CSS Database.
- `src/lib/data.ts` kembali tanpa `getBusinessDatabase`/`BusinessRecordRow`; `schema.ts` kembali tanpa tabel business/CRM. Migrasi 0011/0012 tetap tersimpan di riwayat `drizzle/` dan DB demo (tidak dipakai UI), sehingga tidak ada operasi drop data.
- **Mobile:** filter Pengaturan pada bottom sheet "Lainnya" tetap dipertahankan sesuai permintaan sebelumnya; hanya modul Database yang dibatalkan.
- Verifikasi: `npm run check` lulus; `npm test` 40/40; `contrast.py` 16 pasang, 0 gagal AA; `sweep.py src` bersih. Screenshot Database dihapus; screenshot aplikasi 1440/390 diambil ulang.


### Batch 14: halaman auth layar penuh (2026-11-10)

- **Permintaan owner:** login/daftar/auth tanpa header dan footer marketing, tampil seperti masuk ke aplikasi, dengan ilustrasi SVG/vector 2D; lalu "buat desainnya mirip" referensi login Trello/Atlassian (layout saja, bukan aset/brand).
- `/masuk`, `/daftar`, `/gabung` dipindah dari `(site)` ke route group `(auth)`; metadata `robots: noindex`. Header, promo bar, footer, dan back-to-top marketing tidak lagi dirender.
- Komposisi baru: logo Kullo di atas, kartu form terpusat (468px) dengan heading tengah, dua ilustrasi 2D unDraw di sudut bawah tanpa background putih, signature brand + tagline di bawah kartu, lalu tautan legal.
- Ilustrasi: unDraw `login`, `authentication`, `secure-login` via mirror MIT; direcolour hanya dengan palet DESIGN Ã‚Â§2 (brand blue, brand light, neutral, white), sumber/lisensi di `public/illustrations/README.md`. Tidak ada aset/logo Trello/Atlassian yang dipakai.
- **Mobile:** kartu selebar layar, ilustrasi sudut disembunyikan (<1100px), tanpa overflow horizontal; register tetap dapat di-scroll.
- Verifikasi browser 1440/390: tanpa `.masthead`/footer, `/app/database` tetap 404, kartu 468px, ilustrasi tampil 360px/330px di desktop, login/register mobile rapi.
- Verifikasi: `npm run check` lulus; `npm test` **40/40**; `contrast.py` **0 gagal AA**; `sweep.py src` bersih.
- Bukti: `replica/screens/auth-login-1440.png`, `auth-login-390.png`, `auth-register-390.png`.


### Batch 15: penulisan ulang konten marketing (2026-11-10)

- Memakai skill `bahasa-inti` + `bahasa-website` (github.com/alvinindra/bahasa-skills) untuk seluruh konten marketing: sapaan **Anda** seragam, istilah Indonesia, pesan galat menyebut cara memperbaiki, label tombol menyebut hasil.
- Ditulis ulang: beranda, produk dan 12 halaman modul, solusi, harga, sumber daya dan 5 panduan, dukungan/FAQ, tentang, 404, header/footer, form auth dan kontak.
- Harga tetap jujur: Gratis, Pro "Belum ditetapkan", Bisnis "Sesuai kebutuhan"; tidak ada angka rupiah karangan. Matriks memakai "Tidak/Rencana".
- Header: tombol "Semua Kullo" menjadi **Lihat fitur** dengan dropdown horizontal 4 kolom, ikon setiap modul/solusi, tagline, dan tautan cepat.
- Verifikasi: `npm run check` lulus; `npm test` 40/40; `contrast.py` 0 gagal AA; `sweep.py src` bersih.

### Batch 16: mockup laptop macOS + ponsel di beranda (2026-11-10)

- Section **Di dalam Kullo / Ini tampilan aplikasinya** diganti dari tiga kartu screenshot menjadi satu panggung produk: laptop bergaya macOS (bezel, kamera, menu bar traffic lights, judul Dashboard) berisi screenshot asli Dashboard, dan ponsel di kanan bawah berisi screenshot asli Chat.
- Screenshot diambil ulang dengan Playwright dari aplikasi berjalan: `public/shots/laptop-dashboard.png` (1440Ãƒ—900) dan `public/shots/phone-chat.png` (390Ãƒ—844). Tidak ada mockup yang digambar tangan.
- Panggung memakai `--accent-soft`, label Desktop/Ponsel, tautan Buka demo, bayangan perangkat secukupnya; responsif sampai 390px tanpa overflow.
- Verifikasi: `npm run check` lulus; `npm test` 40/40; `contrast.py` 16 pasang, 0 gagal AA; `sweep.py src` bersih.
- Bukti: `replica/screens/home-device-mockup-1440.png`, `home-device-mockup-stage-1440.png`, `home-device-mockup-390.png`.


### Batch 17: perbaikan hasil code review (2026-11-10)

- **Open redirect login diperbaiki**: `safeNextPath` mem-parse `next` dengan `new URL(..., SITE.url)`, menolak origin berbeda dan backslash, lalu redirect ke `pathname + search + hash` (`src/lib/auth-actions.ts`).
- **Link footer**: Ã¢â‚¬Å“KeamananÃ¢â‚¬Â diarahkan ke `/dukungan#keamanan` yang benar-benar ada; anchor `/tentang#keamanan` dihapus.
- **Dropdown Ã¢â‚¬Å“Lihat fiturÃ¢â‚¬Â**: pola ARIA diubah dari `menu` ke disclosure navigation; backdrop tidak lagi menjadi tombol fokus tak terlihat; tombol memakai `aria-controls`.
- **Auth**: dimensi ilustrasi per file diperbaiki (793Ãƒ—552, 870Ãƒ—520, 543Ãƒ—634); akun demo hanya tampil di development atau bila `KULLO_SHOW_DEMO=1`.
- **Konsistensi istilah**: template baru memakai Ã¢â‚¬Å“Penggantian biayaÃ¢â‚¬Â, Ã¢â‚¬Å“Permintaan pembelianÃ¢â‚¬Â, Ã¢â‚¬Å“Perjalanan dinasÃ¢â‚¬Â, Ã¢â‚¬Å“Dukungan ITÃ¢â‚¬Â, Ã¢â‚¬Å“Permintaan umumÃ¢â‚¬Â; judul pemilik organisasi memakai Ã¢â‚¬Å“Pemilik OrganisasiÃ¢â‚¬Â. Demo DB disinkronkan.
- **Arsitektur**: `auth-actions.ts` dan `invite-actions.ts` dipindah dari `(site)` ke `src/lib/`.
- **Housekeeping**: CSS `.showcase-grid/side/main/card/tag` yang mati dihapus; screenshot lama `dashboard-v3`, `tasks-v3`, `chat-v3` dihapus.
- **Test**: 3 test baru (auth tanpa header/footer, feature menu 16 item + ikon, device stage 1440/390). `npm test` **43/43**.
- Verifikasi: `npm run build` lulus, `contrast.py` 0 gagal AA, `sweep.py` bersih.
- Bukti: `replica/screens/home-device-mockup-final-1440.png`, `home-device-mockup-final-390.png`, `auth-final-1440.png`.


### Batch 18: warna ilustrasi auth mengikuti brand Kullo (2026-11-10)

- Placeholder `var(--primary-svg-color)` pada tiga SVG auth diganti dengan brand blue `#0F6CBD`, sehingga elemen utama (shirt, lock, check) tidak lagi tampil hitam di `<img>`.
- Bentuk gelap dipetakan ke brand pressed `#0C3B5E`; detail perangkat ke brand hover `#115EA3`. Tidak ada warna unDraw yang tersisa.
- Verifikasi: `contrast.py` 16 pasang, 0 gagal AA; `sweep.py src` bersih.
- Bukti: `replica/screens/auth-brand-svg-1440.png`.



### Batch 19: penataan file berdasarkan tipe (2026-11-10)

- **Dokumen**: `DATABASE.md`, `DRIVE.md`, `KULLO.md`, `PLAN.md`, `WORK.md` dipindah ke `docs/specs/`; indeks ada di `docs/README.md`.
- **Tetap di root**: `AGENTS.md`, `DESIGN.md`, `MOBILE.md` karena dirujuk sebagai entry point oleh instruksi repo/desain.
- **Screenshot eksplorasi**: 13 PNG root dipindah ke `replica/screens/adhoc/`; `replica/screens/` tetap untuk bukti rilis.
- **Artefak generated dihapus**: `check-output.txt`, `check.log`, `lint-report.txt`, `test-output.txt`, `tsconfig.tsbuildinfo`, `.tmp-inspect-sessions.mjs`, `test-results/`. `.gitignore` ditambah `test-output.txt`.
- **Referensi diperbarui**: `replica/architecture.md`, `replica/recon.md`, `replica/build-log.md`, `DESIGN.md` menunjuk path baru.
- Root kini hanya berisi config proyek, `.env.example`, `AGENTS.md`, `DESIGN.md`, `MOBILE.md`, dan folder sumber/artefak.


### Batch 20: fondasi keamanan + backup (2026-11-10)

- **Security header** di `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, dan HSTS di production.
- **Rate limit in-memory** (`src/lib/rate-limit.ts`): login 5 percobaan/15 menit per email, register 3/jam per email, pencarian 60/menit per pengguna. Respons 429 + `Retry-After` untuk search. Catatan: multi-instance produksi perlu Redis.
- **Backup SQLite**: `scripts/backup-db.mjs`, `npm run db:backup`, `npm run db:backup:check` (backup + `integrity_check` + jumlah tabel). `data/backups/` di-ignore.
- **PLAN disinkronkan**: test 43/43, CI GitHub Actions ditandai **dilewati atas permintaan owner**, security/backup ditandai selesai, dan status GitHub mencatat perubahan belum di-commit.
- **Deploy doc** memakai `npm run db:backup` dan mengingatkan restore drill ke path sementara.
- Verifikasi: `npm run check` lulus; `npm test` **43/43**; header terlihat di `/api/health`; backup terverifikasi 57 tabel, integrity ok.

**Masih menjadi gerbang:** password reset + email transaksional (butuh pilihan provider), hapus akun/ekspor data (butuh keputusan ruang lingkup), deploy VPS/domain (butuh akun Anda), dan CI (dilewati).


### Batch 21: perbaikan drawer detail tugas + UI/UX terkait (2026-11-10)

- **Aksi footer**: "Selesai" yang hanya menutup drawer diganti **Tutup**; tombol Diskusi duplikat di footer dihapus.
- **Escape berlapis**: Escape pada saran label/PIC/arsip tidak lagi menutup drawer; handler drawer berhenti saat `labelOpen`, `archiveOpen`, atau `discardOpen`.
- **Focus trap**: drawer memfokuskan tombol tutup, mengurung Tab, dan mengembalikan fokus; `ConfirmDialog` juga mendapat focus trap untuk dialog arsip/buang draft.
- **Dirty guard**: deskripsi/komentar yang belum disimpan memunculkan konfirmasi "Tutup tanpa menyimpan?"; draft deskripsi juga tidak hilang saat mengubah status/PIC.
- **Tab aksesibel**: `aria-controls`, `role="tabpanel"`, roving tabindex, ArrowLeft/Right, Home/End.
- **Form**: label `aria-label` untuk deskripsi, komentar, checklist, subtugas, menit, catatan; checklist memakai `role="checkbox"`.
- **Lampiran**: file input native diganti tombol "Pilih file" + nama file + tombol Unggah.
- **Mobile**: target 44px untuk tombol/tab/input drawer, `100dvh`, padding safe-area footer, file picker responsif.
- **Data**: fallback reporter "Anggota" menggantikan "—"; loading fetch memakai AbortController; `TaskDrawerHost` memakai `key={taskId}` agar draft tidak bocor antar tugas.
- **Umpan balik**: indikator "Tersimpan" setelah perubahan properti.
- PLAN Â§10 ditandai sebagai backlog UI/UX (bukan Fase 6 terpisah) dan mencatat perbaikan drawer.
- Verifikasi: `npm run check` lulus; `npm test` **43/43**.
- Bukti: `replica/screens/task-review-drawer-final-1440.png`, `task-review-drawer-fixed-390.png`.


### Batch 22: sistem aksen warna + tab File + hapus lampiran (2026-11-10)

- **Token aksen**: menambah `--marker-purple`, `--marker-teal`, `--marker-orange`, dan `--mention` (Kullo blue `#0F6CBD`) beserta surface/ink di theme situs, app, dan dark. `tokens.json`, `DESIGN.md` Â§2.4, dan `contrast.py` (20 pair, 0 gagal) ikut diperbarui.
- **Penanda tugas**: `DueBadge` (terlambat/hari ini/besok/nanti/selesai), prioritas (merah/oranye/biru/abu), status (termasuk Terhambat), dan badge "Saya" untuk PIC saat ini. Dipakai di daftar, papan, dashboard, overview proyek, dan drawer.
- **Penanda lain**: kalender memakai token acara (rapat/pribadi/perusahaan/tenggat/pengingat), dokumen menampilkan versi baru dan visibilitas, peran anggota memakai chip owner/admin/manager/staff/guest, beban tim memakai tone kapasitas, notifikasi punya warna per jenis, dan command palette menandai jenis entitas.
- **Mention**: `MentionText` merender `@Nama` sebagai chip biru Kullo di chat dan komentar tugas; pemilih mention memakai surface mention.
- **Filter aktif**: chip filter di TaskExplorer dengan tombol hapus per filter.
- **Tab File**: drawer tugas sekarang punya tab **Detail Â· Diskusi Â· File Â· Aktivitas**. File dipindah dari "Waktu & lampiran" ke tab File, dengan unggah, pratinjau/unduh, dan hapus.
- **Hapus lampiran**: `deleteTaskAttachmentAction` memeriksa izin `task.edit`, org, dan tugas; menghapus baris lampiran, dokumen terkait, dan berkas di `data/uploads`. Dialog konfirmasi + toast + reload drawer.
- **Section waktu dihapus**: seluruh blok waktu, time log, dan lampiran di tab Detail dihilangkan atas permintaan owner.
- **Theme init**: script inline dipindah ke `public/theme-init.js`; error console React "script tag while rendering" hilang (0 error di browser console).
- Verifikasi: `npm run check` lulus; `npm test` **43/43**; uji manual unggah lalu hapus `test-delete-upload.txt` berhasil (baris lampiran dan file tersimpan dibersihkan).
- Bukti: `replica/screens/final-task-file-1440.png`, `final-task-file-390.png`, `task-file-delete-dialog-1440.png`, `task-file-deleted-1440.png`, `markers-tasks-1440.png`, `markers-calendar-1440.png`, `markers-documents-1440.png`, `markers-dashboard-1440.png`.


### Batch 23: perbaikan header mobile dan PIC (2026-11-10)

- **Chat baru di mobile**: tombol **+** pada header daftar percakapan kini 44Ã—44 px, memakai grup filter yang boleh menyusut (`flex: 1 1 0`), dan berada di dalam viewport 390px. Tombol membuka dialog "Percakapan baru" dengan fokus awal yang benar.
- **Menu Lainnya**: tile **Pengaturan** dikembalikan ke sheet "Lainnya" (12 tile: Dashboard sampai Pengaturan).
- **PIC**: label "Saya"/"Untuk saya" di kolom PIC, kartu papan, dan drawer dihapus; nama PIC tetap ditampilkan.
- Verifikasi: `npm run check` lulus; `npm test` **43/43**; bukti `replica/screens/mobile-more-with-settings.png`, `mobile-chat-new-fixed.png`.


### Batch 24: dependensi tugas + status simpan (2026-11-10)

- **Dependensi tugas**: `TaskRow` membawa `dependencyIds` dan `blockedByCount`; daftar/papan menampilkan badge **Terhambat** bila prasyarat belum selesai.
- **Editor dependensi**: tab Detail punya section **Dependensi** — daftar prasyarat + status, penanda "Menunggu/Selesai", daftar tugas yang menjadikan tugas ini prasyarat, pilihan tambah prasyarat, dan hapus.
- **Server**: `addTaskDependencyAction` / `removeTaskDependencyAction` memeriksa izin `task.edit`, org, duplikat, diri sendiri, dan dependensi melingkar; aktivitas dicatat.
- **Status simpan**: sinyal client `kullo:sync` membuat indikator header berubah **Menyinkronkan â†’ Tersimpan / Gagal menyimpan** untuk aksi tugas (properti, checklist, komentar, lampiran, arsip, papan). Indikator tetap jujur: tidak mengklaim antrean offline.
- Verifikasi: `npm run check` lulus; `npm test` **43/43**; uji tambah dependensi `tsk_01 â†’ tsk_294…` lalu hapus berhasil, badge Terhambat muncul/hilang.
- Bukti: `replica/screens/task-dependencies-1440.png`, `task-dependency-added-1440.png`, `task-dependency-removed-1440.png`.

### Batch 25: header situs tiga kolom (2026-11-10)

- Header marketing memakai grid tiga kolom: **pengguna di kiri**, **logo tepat di tengah**, **aksi di kanan**.
- Desktop: `Masuk` + navigasi utama di kiri; `Lihat fitur`, `Cari`, `Coba gratis` di kanan.
- Mobile/tablet <1200px: avatar pengguna di kiri; logo di tengah; tombol cari dan hamburger di kanan (cari tepat di samping hamburger). Drawer memakai class `site-nav-drawer` agar breakpoint sama.
- Verifikasi visual 390, 768, 1024, 1200, 1440; menu mobile tetap terbuka; `npm run check` lulus dan `npm test` **43/43**.
- Bukti: `replica/screens/site-header-final-390.png`, `site-header-final-768.png`, `site-header-final2-1024.png`, `site-header-final2-1200.png`, `site-header-final-1440.png`, `site-header-menu-after-390.png`.


### Batch 26: migrasi penuh ke Supabase Postgres + Storage (2026-11-10)

- **Database**: seluruh schema Drizzle dipindah dari SQLite (`sqlite-core`) ke PostgreSQL (`pg-core`). 42 tabel, foreign key, dan index dibuat ulang; migrasi baru ada di `drizzle/0000_stiff_rattler.sql`, migrasi SQLite lama diarsipkan di `drizzle-sqlite/`.
- **Driver**: `src/db/client.ts` memakai `postgres` (postgres-js) dengan `prepare: false`, `max: 1`, dan SSL aktif — sesuai batasan Supabase transaction pooler di Vercel.
- **Async**: 418 situs query dikonversi ke `await` (Drizzle Postgres bersifat async), lalu 126 pemanggil ikut di-`await` dengan bantuan type checker. TypeScript `--noEmit` bersih.
- **Izin per peran**: `AppContext` sekarang membawa `permissions` yang dimuat sekali per request, sehingga `can()` tetap sinkron dan tidak menambah query di 61 titik pemakaian.
- **Storage**: `src/lib/storage.ts` menjadi adapter Supabase Storage (bucket privat `kullo-files`, service role hanya di server, signed download). Upload/hapus/salin dokumen, versi, lampiran, dan avatar memakai adapter ini; tanpa kredensial Supabase, adapter jatuh ke `data/uploads` agar dev dan tes tetap jalan.
- **Supabase project**: schema, FK, index, RLS (42/42 tabel), dan bucket privat dibuat lewat MCP pada project `iwpnhnglffjrcdpeecqh`.
- **Health check**: `/api/health` sekarang mengecek koneksi database dan melaporkan storage (`supabase`/`local`); mengembalikan 503 bila database mati.
- **Skrip**: `db:migrate`, `db:seed`, `db:reset`, dan `db:backup:check` memakai Postgres; `better-sqlite3` dihapus dari dependensi.
- **Verifikasi**: `npm run check` lulus (lint + typecheck + build 47 route); `npm test` **43/43** terhadap PostgreSQL lokal; `/api/health` mengembalikan `database: up`.
- **Belum diverifikasi**: halaman produksi Vercel dengan kredensial Supabase asli (butuh environment variables di akun pemilik) dan upload nyata ke Supabase Storage.
- **Perbaikan teks**: 102 urutan mojibake (`â€”`, `â€“`, `â€œ`, `â€`, `â€¦`) di 7 berkas diperbaiki menjadi em dash, en dash, kutip lengkung, dan elipsis; nama dokumen demo sekarang tampil benar (`Anggaran 2027 — Draft.xlsx`).
- **Bukti**: `replica/screens/batch26-documents-1440.png`, `batch26-documents-390.png`, `batch26-tasks-1440.png`; contrast 20 pair 0 gagal; sweep bersih.

### Batch 27: header baru, alur demo & pendaftaran berbayar (2026-11-11)

- **Header desktop**: logo di kiri, navigasi (Produk, Solusi, Harga, Sumber daya, Dukungan) lalu **Lihat fitur** tepat di samping Dukungan; **Cari**, **Coba gratis**, dan **Masuk** di kanan. Mobile tetap logo kiri, cari + hamburger kanan.
- **Halaman masuk**: blok akun demo dihapus seluruhnya (tidak ada kredensial demo di UI publik).
- **Akun khusus**: seed memakai `demo@kullo.app` / `demopertama`, nama **Pemilik Perusahaan**. Tidak ditampilkan di halaman masuk.
- **Alur demo** (`/daftar?mode=demo`): form perusahaan + nama + email/WA → tersimpan di `access_requests` → notifikasi admin (outbox/Resend) → admin menyetujui di `/app/admin/akses` → ruang kerja baru dibuat (nama perusahaan, owner sesuai nama form) → email berisi tautan `/akses/klaim/<token>` yang langsung membuat sesi login.
- **Alur pendaftaran** (`/daftar`): form + pilihan paket (Gratis / Pro / Business) → permintaan terkirim → admin menandai invoice dikirim → pemohon mengunggah bukti pembayaran di `/akses/status/<token>` → admin menyetujui → tautan masuk dikirim; pemohon juga dapat login dengan email + kata sandi yang didaftarkan.
- **Email**: adapter Resend (`RESEND_API_KEY`) dengan fallback `mail_outbox`; tanpa key, isi email dan tautan ditampilkan di inbox admin untuk dikirim manual. Tidak ada klaim email terkirim saat provider belum diatur.
- **Admin**: `/app/admin/akses` hanya untuk `KULLO_ADMIN_EMAILS` (default `hi.digia@gmail.com,demo@kullo.app`); notifikasi ke `KULLO_NOTIFY_EMAILS` (default `hi.digia@gmail.com`).
- **Supabase**: migrasi `drizzle/0001_overjoyed_ultimates.sql` (access_requests, mail_outbox) diterapkan; RLS aktif di kedua tabel; seed ulang dengan akun demo baru.
- **Verifikasi**: `npm run check` lulus; `npm test` **43/43** (Postgres lokal); alur demo dan pendaftaran diuji end-to-end lokal (permintaan → invoice → bukti → setujui → magic link → login kata sandi).
- **Bukti**: `replica/screens/header-v2-1440.png`, `header-v2-390.png`, `login-no-demo-1440.png`, `daftar-1440.png`, `daftar-demo-1440.png`, `daftar-demo-390.png`, `admin-access-1440.png`, `admin-access-approved-1440.png`.

### Batch 28: auth fit-to-screen, harga pasar, duplikasi Masuk (2026-11-11)

- **Auth desktop tanpa scroll**: `.auth-page` dikunci ke `100dvh` + `overflow:hidden` pada ≥960px; kartu dibuat lebih rapat (padding 20/26px, input 36px, gap 10px), dan form daftar memakai dua kolom (email/WA, paket/password). Terukur `scrollHeight = innerHeight` di 1440×900 dan 1280×720 untuk `/masuk`, `/daftar`, dan `/daftar?mode=demo`. Mobile tetap satu kolom dan bisa scroll.
- **Teks Masuk ganda**: tautan “Sudah punya akun? Masuk” di dalam form dihapus; hanya tersisa satu tautan “Sudah punya akses? Masuk” di bawah kartu. Tab Daftar/Coba demo kini memakai tombol outline agar terlihat sebagai tab.
- **Harga pasar**: Pro **Rp399.000/bulan** (hingga 25 anggota), Bisnis **Rp1.199.000/bulan** (hingga 100 anggota, beberapa organisasi). Acuan riset: Kolabo Rp500.000/bulan untuk 35 pengguna (kolabo.id) dan Circle mulai US$89/bulan setara ±Rp1,47 juta (circle.so/pricing, Des 2026). Kullo sengaja sedikit lebih murah.
- **Konsistensi**: metadata/lede/notes halaman harga, FAQ di `guides.ts`, ketentuan, tentang, label paket di form daftar, `access-actions`, dan seed demo diperbarui. Catatan baru: harga belum termasuk PPN dan aktivasi setelah konfirmasi admin.
- **Preselect paket**: CTA harga mengarah ke `/daftar?plan=pro` atau `?plan=business`; form memilih paket tersebut otomatis.
- **Verifikasi**: `npm run check` lulus; `npm test` **43/43** (test harga diperbarui); contrast 20 pair 0 gagal; sweep bersih.
- **Bukti**: `replica/screens/login-v3-1440.png`, `daftar-v3-1440.png`, `daftar-v3-1280x720.png`, `daftar-demo-v3-1440.png`, `daftar-v3-390.png`, `harga-v3-1440.png`.

### Batch 29: email demo berdesain + kredensial + footer auth desktop (2026-11-11)

- **Email demo**: template HTML transaksional baru (`src/lib/email-template.ts`) memakai table + inline style, wordmark Kullo, kartu kredensial, tombol masuk, tautan langsung, dan footer. Teks fallback tetap dikirim untuk klien yang memblokir HTML.
- **Akun demo nyata**: saat admin menyetujui permintaan demo, sistem membuat kata sandi acak `Kullo-…`, menyimpan hash-nya, membuat user + membership **owner** di organisasi baru bernama perusahaan, dan mengirim email berisi email, kata sandi, serta magic link. Diuji: user hasil approval bisa login dengan kata sandi dari email dan masuk ke dashboard organisasi tersebut.
- **Admin outbox**: isi email (termasuk kata sandi dan tautan) tetap tersimpan sehingga bisa dikirim manual bila SMTP gagal.
- **Auth desktop**: logo di atas tengah, baris brand + copyright/ketentuan/privasi/dukungan di bawah tetap tampil pada desktop pendek (1280×720), tanpa scroll — `scrollHeight = innerHeight`, `auth-brand` dan `auth-panel-foot` terdeteksi.
- **Verifikasi**: `npm run check` lulus; `npm test` **43/43**; alur demo → approve → login kredensial lulus di Postgres lokal; email HTML dirender dan diperiksa visual.
- **Bukti**: `replica/screens/demo-email-660.png`, `login-v4-1280x720.png`, `daftar-v4-1280x720.png`.
