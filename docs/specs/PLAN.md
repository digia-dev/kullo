# PLAN.md — Kullo menuju Production (Web + iOS + Android)

Tanggal: 2026-11-08 · Repo: https://github.com/digia-dev/kullo · Estimasi: 1 developer + AI-assist

Dokumen ini adalah peta jalan dari kondisi sekarang sampai aplikasi **dipublikasikan** di web, App Store, dan Google Play — dengan seluruh platform terintegrasi.

---

## 0. Kondisi saat ini (jujur)

### Sudah ada
| Aspek | Status |
|---|---|
| Web app | Next.js 16, 47 route, 18 layar produk + 12 halaman marketing, lolos `npm run check` + 43/43 e2e |
| Data | SQLite + Drizzle (WAL + busy_timeout), session DB-backed (hash + expiry), RBAC per-organisasi |
| Auth | Login/register, cookie session, gate `/app/*` — **belum ada reset password** |
| Notifikasi | Tabel `notifications` + satu fungsi `notify()` (15 titik panggil) — in-app saja |
| Chat | Berfungsi, tapi update via `router.refresh()` — **belum realtime** |
| Dokumen | Upload ke disk `data/uploads/`, permission-checked |
| GitHub | ✅ terhubung; perubahan sesi ini belum di-commit/push |
| Deploy | Langkah systemd+nginx tertulis di `replica/deploy.md` (belum dieksekusi) |

### Belum ada (blokir publikasi)
- Git CI (push ≠ terverifikasi), backup, error tracking, uptime, HTTPS/headers/rate-limit
- Password reset, email transaksional, hapus akun + ekspor data (UU PDP)
- Lapisan API JSON (server actions hanya melayani web) → **syarat mobile**
- Realtime (SSE/WS), push notification, deep link
- App store assets, akun Apple/Google

---

## 1. Target akhir

```
                        ┌─────────────────────────────┐
   Web (browser)  ─────►│   Next.js (RSC + actions)   │
   PWA install    ─────►│   + REST API /api/v1 (JSON) │──────┐
   iOS app        ─────►│   stateless, bearer/cookie  │      │
   Android app    ─────►└─────────────┬───────────────┘      │
                                     │                       │
                     ┌───────────────┴─────────────┐         │
                     │  Service layer (bisnis)     │◄────────┘
                     │  notify() dispatcher        │
                     └───────┬───────────┬─────────┘
                             │           │
                    ┌────────▼───┐  ┌────▼─────────┐
                    │ PostgreSQL │  │ Antrean kirim │ → Email (SMTP/API)
                    │ (ketika    │  │ email + push  │ → Push (Expo/FCM/APNs)
                    │  multi-node)│  └──────────────┘ → In-app (sudah ada)
                    └────────────┘
```

**Prinsip:** satu backend, satu service layer, tiga penampil (web, iOS, Android). Perubahan bisnis ditulis sekali.

---

## 2. Fase eksekusi

### Fase 0 — Fondasi rekayasa (sebelum produksi) — ±4 hari
> Tujuan: kode aman, bisa rollback, masalah ketahuan sebelum pengguna.

- [ ] GitHub Actions CI: `npm ci && npm run check && npm test` tiap push + PR (add `deploy.yml` nanti) — **dilewati atas permintaan owner 2026-11-10**
- [ ] Branch protection `main` (butuh repo settings di GitHub - akun Anda)
- [ ] Pisahkan `db:migrate` dari `db:seed` untuk produksi; akun demo tidak masuk DB produksi
- [x] Backup SQLite: `npm run db:backup:check` membuat backup + uji integrity; pasang `cron` di server saat deploy
- [x] Security header (`next.config.ts`) + rate-limit `/masuk` dan `/api/search`
- [ ] HTTPS/TLS, monitoring/uptime, dan pembatasan lain di server produksi
- [ ] Error tracking (Sentry/GlitchTip) + uptime monitor `/api/health`
- [ ] **Password reset** (tautan via email) + **hapus akun + ekspor data** (UU PDP)
- [ ] Review `/privasi` & `/ketentuan` (Anda)
- [ ] Load test awal (k6/autocannon) → catat angka baseline

**DoD:** semua check merah/hijau di CI; restore backup terbukti; reset password jalan end-to-end.

### Fase 1 — Web ke production — ±3 hari
> Tujuan: web publik di domain sendiri.

- [ ] Deploy ke VPS (ikuti `replica/deploy.md`): systemd + nginx + TLS
- [ ] DNS A/CNAME + canonical host + redirect HTTPS
- [ ] Environment produksi (`DATABASE_PATH` di disk persisten), migrasi tanpa seed
- [ ] Analytics ramah privasi (Umami/Plausible self-host) — opsional
- [ ] Smoke test F01–F08 di live, desktop + browser HP
- [ ] **(Cepat, opsional)** PWA: manifest + service worker + icon → bisa "Add to Home Screen" — setengah langkah mobile tanpa nunggu Fase 3

**DoD:** `https://domain-anda` lolos semua alur; monitoring hijau 48 jam.

### Fase 2 — Lapisan API (jembatan ke mobile) — ±1,5 minggu
> Tujuan: bisnis bisa diakses mesin (mobile, integrasi eksternal), bukan hanya browser.

- [ ] **Refactor service layer**: pindahkan mutasi dari `actions.ts` ke `src/services/*` (murni TS + Zod); server actions jadi tipis, API controller juga tipis — logika ditulis sekali
- [ ] `POST /api/v1/auth/login|logout`, `GET /api/v1/me` — token bearer (pakai tabel `sessions` yang ada)
- [ ] Resource: `projects`, `tasks`, `chat`, `documents`, `requests`, `approvals`, `calendar`, `reports`, `notifications`, `search`
- [ ] Skema Zod dipakai bersama web+API → kontrak tipe sama
- [ ] OpenAPI 3.1 dihasilkan dari skema (dokumen integrasi otomatis)
- [ ] Tes API (auth 401/403, validasi, batas ukuran file, isolasi antar-organisasi)
- [ ] Pagination + format error konsisten

**DoD:** seluruh alur F01–F08 bisa dijalankan lewat curl dengan token; e2e web tetap 43/43.

### Fase 3 — Aplikasi mobile (iOS + Android) — ±3 minggu
> Keputusan di §4: **Expo (React Native)** direkomendasikan.

- [ ] Monorepo (`npm workspaces`): `apps/web` (sekarang), `apps/mobile` (Expo), `packages/core` (tipe + Zod + client API + design tokens)
- [ ] Layar mobile: Dashboard, My Work, Tasks (detail+drawer), Projects, Chat, Calendar, Approvals, Notifications, Profile/Settings, Documents (preview+upload)
- [ ] Auth: login/register/reset → token tersimpan aman (expo-secure-store), refresh session
- [ ] Offline-first: cache React Query + optimistic update chat/task; conflict = reload server
- [ ] Push notification (expo-notifications → FCM + APNs) memakai dispatcher Fase 4
- [ ] Upload dokumen (photo picker) + preview
- [ ] Deep link: `https://domain/app/...` ↔ aplikasi (Universal Links + App Links)
- [ ] Ikon, splash, dark mode, aksesibilitas, layout HP kecil (360px) & tablet
- [ ] QA: emulator iOS + Android nyata, TestFlight internal, Play internal track

**DoD:** seluruh alur inti (F02–F05, F08) selesai di aplikasi; tidak ada layar "website di dalam bingkai".

### Fase 4 — Integrasi lintas platform — ±1 minggu
> Tujuan: pengalaman tumpah sama di web & mobile.

- [ ] **Notification dispatcher**: perluas `notify()` → tulis baris in-app (sudah) **+** antrean email **+** antrean push; satu titik, semua platform ikut
- [ ] Email transaksional: undang anggota, reset password, notifikasi approval, digest — kirim via SMTP/Resend (pilihan §4)
- [ ] Realtime web: SSE untuk chat + lonceng notifikasi (ganti ketergantungan `router.refresh()`); mobile pakai push + refetch
- [ ] Prefersensi notifikasi (`settings/notifications`) berlaku untuk email & push, bukan hanya in-app
- [ ] Webhook keluar + API key (isi menu Integrations yang sekarang "Peta jalan") — untuk integrasi pihak ketiga
- [ ] Deep link universal teruji: tautan email/undangan membuka app kalau terpasang, kalau tidak → web

**DoD:** satu pesan approval → muncul serentak di in-app web, inbox email, dan push mobile.

### Fase 5 — Publikasi & peluncuran — ±5 hari
> Tujuan: ada di store, ada di web, siap orang asing mendaftar.

**Web:** SEO (metadata, OG image, sitemap, robots), skor Lighthouse, error tracking bersih, backup otomatis jalan, runbook insiden 1 halaman.

**iOS App Store:**
- [ ] Akun Apple Developer (Anda — berbayar, §6)
- [ ] App Privacy Labels (nama, email, dokumen konten kerja)
- [ ] **Hapus akun dari dalam app** (syarat Apple 1.5 — sudah dibangun Fase 0, harus terlihat di UI settings)
- [ ] Screenshot 6.5" (6+), deskripsi ID+EN, usia 4+, review notes (akun demo: `alya@nusantara.id`/`kullo123`)
- [ ] TestFlight external → Submit → Phased Release

**Google Play:**
- [ ] Akun Play Console (Anda — $25 sekali, §6)
- [ ] Data Safety form (data dikumpulkan: identitas, konten, dienkripsi in-transit)
- [ ] Internal → Closed → Production track; permission minimal (tanpa permission sensitif — upload pakai photo picker)

**Bersama:** ikon adaptive, feature graphic, halaman status, pengumuman peluncuran, rollback plan.

**DoD:** aplikasi live di 3 store/platform; orang baru bisa daftar, kerja, dan menerima notifikasi tanpa bantuan Anda.

---

## 3. Urutan & beban kerja (jujur)

| Fase | Isi | Estimasi | Bisa paralel? |
|---|---|---|---|
| 0 Fondasi | CI, backup, reset password, PDP | ±4 hari | — (mulai sekarang) |
| 1 Web production | deploy + domain | ±3 hari | paralel dgn 0 |
| 2 API layer | refactor service + REST | ±1,5 minggu | setelah 0 |
| 3 Mobile (Expo) | app iOS+Android | ±3 minggu | setelah 2 |
| 4 Integrasi | email+push+realtime+deep link | ±1 minggu | setelah 2 & 3 mulai |
| 5 Publikasi | store submission | ±5 hari | terakhir |
| **Total** | | **±6–8 minggu** | |

---

## 4. Keputusan besar (butuh persetujuan Anda)

### 4.1 Pendekatan mobile — rekomendasi: **Expo (React Native)**
| Opsi | Kelebihan | Kekurangan | Vonis |
|---|---|---|---|
| **Expo/RN** (✅ rekomendasi) | UX native penuh, push notifikasi andal, ada di store, offline kuat | Kode mobile terpisah (dibagi via `packages/core`), paling lama | Pilih untuk store |
| Capacitor (bungkus web) | Paling cepat | Apple sering tolak (guideline 4.2 "minimal functionality"), terasa website-di-bingkai | Tidak disarankan |
| PWA saja | Tercepat, nol biaya store | Tidak ada di store, push iOS terbatas, tanpa deep link andal | Jadikan pelengkap (Fase 1) |

### 4.2 Lainnya
| Keputusan | Rekomendasi | Butuh Anda |
|---|---|---|
| Database | Tetap **SQLite** untuk launch (1 VPS cukup ratusan user); pindah **Postgres** saat butuh 2+ server | setuju kapan pindah |
| Email | SMTP murah/Resend/Mailgun free tier untuk transactional | daftar akun (gratis) |
| Payment | Tunda — pricing masih "Hubungi kami" | kapan perlu |
| Monorepo | npm workspaces saat Fase 3 mulai | tidak |

---

## 5. Integrasi lintas platform (desain singkat)

1. **Satu service layer** — `src/services/*` dipanggil server actions (web) DAN controller `/api/v1` (mobile). Tidak ada logika ganda.
2. **Dispatcher notifikasi** — `notify()` yang ada sekarang menjadi satu-satunya pintu: `db insert` → `queue email` → `queue push`. Preferensi user (`settings/notifications`) jadi filter di dispatcher.
3. **Auth ganda** — web: cookie httpOnly (sudah); mobile/API: bearer token dari tabel `sessions` yang sama; logout = cabut baris session (sudah bisa).
4. **Deep link** — rute `/app/*` didaftarkan sebagai Universal Link (iOS) + App Link (Android); tautan notifikasi email/push memakai URL yang sama → platform memilih buka app atau web.
5. **Kode bersama** — `packages/core`: tipe + skema Zod + client API + token warna. Web dan mobile mengimpornya, kontrak tidak pernah terpecah.
6. **Realtime** — SSE untuk web (murah, tanpa WebSocket infra); mobile andalkan push + refetch.

---

## 6. Biaya & akun (GERBANG — hanya Anda yang pegang)

| Item | Biaya | Untuk |
|---|---|---|
| VPS/cloud | sudah Anda siapkan | hosting web + database |
| Domain | ±Rp 15–200rb/thn | web + deep link |
| Apple Developer | **$99/thn** | App Store iOS |
| Google Play Console | **$25 sekali** | Play Store |
| Email (Resend dll) | gratis s.d. volume tertentu | transactional email |
| Sentry/Umami | gratis tier | monitoring/analytics |
| Push (Expo push) | gratis | notifikasi mobile |

Saya tidak mendaftarkan akun atau mengeluarkan uang — semua akun dibuat & dimiliki Anda.

---

## 7. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Refactor service layer (Fase 2) regresi web | tinggi | e2e 40 jadi jaring pengaman; refactor bertahap per resource |
| Apple tolak aplikasi | tinggi | native UX asli (bukan wrapper), hapus akun jelas di settings, demo akun di review notes |
| SQLite tidak muat multi-node | sedang | pemicu pindah Postgres jelas (§4.2); query sudah lewat Drizzle → migrasi terisolasi |
| Chat tanpa realtime terasa lambat | sedang | SSE di Fase 4; push mobile menutupi |
| Satu developer + banyak fase | sedang | urutan fase sudah dependensi; Fase 1 bisa dirilis lebih dulu |
| Repo public bocor ide | rendah | sudah diputuskan; bisa di-private kapan saja di Settings GitHub |

---

## 8. Pembagian peran

**Saya kerjakan:** semua kode, refactor, CI workflow, script deploy/backup, aset app (ikon/screenshot dari build), dokumentasi, pengajuan keputusan tiap pergantian fase.

**Anda putuskan/kerjakan:** akun Apple & Google + pembayarannya, domain & DNS, keputusan §4, review legal, approve mulai tiap fase, visibility repo.

---

## 9. Milestone

| # | Milestone | Fase | Kapan |
|---|---|---|---|
| M1 | CI hijau + backup teruji + reset password jalan | 0 | awal |
| M2 | **Web publik** di domain sendiri | 1 | setelah M1 |
| M3 | API v1 lengkap + tes lolos | 2 | setelah M1 |
| M4 | Beta mobile di TestFlight + Play internal | 3 | setelah M3 |
| M5 | Notifikasi in-app + email + push serentak | 4 | setelah M4 |
| M6 | **Peluncuran**: web + App Store + Play | 5 | setelah M5 + akun store Anda |

---

*Status dokumen: rencana, belum dieksekusi. Setiap fase berakhir dengan DoD yang diverifikasi, lalu saya berhenti menunggu persetujuan Anda untuk fase berikutnya.*

---

# 10. UI/UX remediation backlog (bagian UI/UX; tidak ada "Fase 6" terpisah di fase eksekusi)
>
> Catatan 2026-11-10: drawer detail tugas sudah diperbaiki (label aksi, focus trap, Escape per lapisan, dirty guard, tab keyboard, file picker, target mobile, safe-area). Tab **File** menggantikan blok “Waktu & lampiran”; lampiran bisa diunggah dan dihapus dengan konfirmasi. Sistem aksen warna (prioritas, tenggat, status, peran, kalender, dokumen, beban kerja, mention biru Kullo) sudah dipasang sebagai token bersama. **Dependensi tugas** kini punya editor (tambah/hapus, deteksi siklus, badge Terhambat), dan indikator header menampilkan status simpan **Menyinkronkan/Tersimpan/Gagal**. Item `??` lain di bawah tetap menjadi backlog; statusnya tidak otomatis berubah karena perubahan ini.

Status: ✅ selesai · 🔜 berikutnya · ⏳ nanti. Sumber: audit menyeluruh UI/UX aplikasi (Desktop 1440, Mobile 390/320, light & dark).

## 10.1 Prioritas tinggi

| # | Area | Kelemahan | Status |
|---|---|---|---|
| 1 | Chat | Tanpa realtime (pesan baru butuh refresh) | ⏳ |
| 2 | Settings | Preferensi notifikasi tidak memengaruhi notifikasi | ✅ dispatcher `notify()` membaca `memberships.notificationPrefs` |
| 3 | Global | Tidak ada toast/umpan balik sukses | ✅ `Toaster` global + sukses chat/profil/tugas/quick-create |
| 4 | Tugas | Tidak ada bulk action | 🔜 |
| 5 | Chat | Tidak bisa membalas pesan (UI) | ✅ tombol Balas + quote di composer |
| 6 | Chat | Tidak bisa edit/hapus pesan sendiri | ✅ Edit/Hapus + modal + validasi pemilik |
| 7 | Chat | Tidak ada kelola anggota grup | ✅ Kelola anggota: tambah, keluarkan, keluar |
| 8 | Chat | Daftar tanpa preview/waktu terakhir | ✅ preview + jam di daftar |
| 9 | Global | Loading state/progress navigasi minim | 🔜 |
| 10 | Tugas | Filter hilang saat refresh/navigasi | ✅ filter disimpan di `sessionStorage` per tab |
| 11 | Global | Modal kustom tanpa Escape/focus trap | ✅ Escape menutup semua dialog chat; focus trap 🔜 |
| 12 | Mobile | Kalender bulan sempit, tanpa agenda default | 🔜 |
| 13 | Dokumen | Preview membuka file mentah di tab baru | ✅ modal gambar/PDF, fallback unduh untuk tipe lain |
| 14 | Global | Konfirmasi destruktif tidak konsisten | ✅ `ConfirmDialog` untuk agenda, tugas, proyek; chat sudah modal |
| 15 | Mobile | Halaman More masih drawer desktop | 🔜 |

## 10.2 Per modul

| # | Area | Kelemahan | Status |
|---|---|---|---|
| 16 | Global | Bahasa campur (My Work/Board/Done vs istilah ID) | 🔜 |
| 17 | Global | Header tanpa identitas org/breadcrumb | 🔜 |
| 18 | Global | Sidebar collapsed tanpa label/badge | ✅ tooltip + rail 56px; badge 🔜 |
| 19 | Global | Teks mikro 10–11px | 🔜 |
| 20 | Global | Touch target 38–40px (target 44) | ⏳ keputusan owner (dicatat MOBILE.md) |
| 21 | Dashboard | Panel "Aksi cepat" duplikat + header | ✅ panel dihapus |
| 22 | Dashboard | Beban tim tanpa drill-down | 🔜 |
| 23 | Dashboard | Panel kosong makan ruang | ✅ padding empty-state dipadatkan di mobile |
| 24 | Dashboard | Panel AI roadmap = filler | ✅ dihapus |
| 25 | Dashboard | Tanpa refresh manual/timestamp | ⏳ fitur dibuat lalu **dihapus atas permintaan owner** (2026-11-09) |
| 26 | Tugas | Tanpa sort indicator & aria-sort | 🔜 |
| 27 | Tugas | Tanpa saved view | ⏳ |
| 28 | Tugas | Tanpa pagination/virtualisasi | ⏳ |
| 29 | Tugas | Komentar tanpa @mention picker | 🔜 |
| 30 | Proyek | Board tanpa swimlane/WIP | ◐ tahapan bisa diedit (rename/kategori/urutan/hapus/tambah) + menu kolom + composer; swimlane & WIP ⏳ |
| 31 | Proyek | Timeline tanpa drag reschedule | ⏳ |
| 32 | Proyek | Tanpa template proyek | ⏳ |
| 33 | Proyek | Upload tanpa drag & drop | 🔜 |
| 34 | Proyek | Kartu padat metadata di mobile | ✅ <=640px chip label + meta-icon disembunyikan; tenggat/PIC tetap |
| 35 | Dokumen | Tanpa bulk download | ⏳ |
| 36 | Persetujuan | Tanpa bulk approve | 🔜 |
| 37 | Persetujuan | Tanpa pengingat/SLA/delegasi | ⏳ |
| 38 | Persetujuan | Hanya alur berurutan | ⏳ |
| 39 | Laporan | Metrik "Waktu tercatat 0.0 jam" tampil kosong | ✅ disembunyikan saat 0 |
| 40 | Laporan | Grafik hanya warna | 🔜 |
| 41 | Laporan | Tanpa laporan terjadwal | ⏳ |
| 42 | Chat | Tanpa search pesan | 🔜 |
| 43 | Chat | Tanpa lampiran di chat | ⏳ |
| 44 | Chat | Tanpa typing/read receipt | ⏳ |
| 45 | Chat | Tanpa infinite scroll riwayat | ⏳ |
| 46 | Chat | DM bisa di-rename (mental model aneh) | ✅ rename hanya grup/kanal |
| 47 | Notifikasi | In-app saja (tanpa email/push) | ⏳ (butuh infra email) |
| 48 | Notifikasi | Tidak realtime & tanpa grouping | ⏳ |
| 49 | Notifikasi | Tanpa filter "belum dibaca" | ✅ Semua / Belum dibaca + empty state |
| 50 | Mobile | Tabel modul lain masih pola desktop | 🔜 |
| 51 | Mobile | Tanpa swipe-back chat | ⏳ |
| 52 | Mobile | Tanpa PWA offline/push | ◐ manifest ✅, service worker & push ⏳ |
| 53 | Settings | 7 tab horizontal scroll tanpa indikator | ✅ fade tepi + scroll-snap mobile |
| 54 | Dashboard | Angka metrik berwarna alarm | ✅ angka netral, tone hanya titik label |

## 10.3 Catatan implementasi batch 2026-11-09

- `notify()` kini menghormati kategori preferensi (`task`, `comment`, `mention`, `approval`, `message`, `event`, `document`); `project` dipetakan ke `task`.
- Chat: balas pesan (`replyToId` divalidasi), edit/hapus pesan sendiri, kelola anggota grup (tambah/keluarkan/keluar), preview + waktu di daftar, Escape menutup dialog.
- Dashboard: panel Aksi cepat dan panel AI dihapus; quick-create hanya lewat **+** header.
- Laporan: metrik waktu hanya tampil bila ada log.
- PWA: `src/app/manifest.ts` + `src/app/icon.svg` (installable shell); offline/push belum.
- Toast global (`Toaster.tsx`) untuk sukses chat/profil/lampiran/quick-create; `aria-live="polite"`, aman di mobile (di atas tab bar).
- Dashboard: tombol "Diperbarui HH.MM" sempat ditambahkan lalu **dihapus atas permintaan owner** (2026-11-09); `DashboardRefresh.tsx` ikut dihapus.
- Notifikasi: filter Semua/Belum dibaca, empty state per filter.
- Metrik dashboard: angka netral, warna tone dipindah ke titik label (bukan angka alarm).
- Tab settings: fade tepi + scroll-snap di mobile sebagai indikator overflow.
- Empty state mobile dipadatkan (padding 20px 14px).
- Tugas: filter (cari/proyek/status/prioritas/PIC/sort) disimpan di `sessionStorage` per tab dan dipulihkan saat refresh/navigasi; Reset mengosongkannya.
- Dokumen: tombol Pratinjau membuka modal di app (gambar langsung, PDF via iframe, tipe lain menampilkan opsi unduh), Escape menutup.
- Konfirmasi destruktif disatukan lewat `ConfirmDialog` (agenda, arsip tugas, arsip proyek); `window.confirm` dihapus, Escape/backdrop menutup, tombol dinonaktifkan saat proses.
- Board proyek: kolom = `project_statuses`; rename inline, menu kolom (ubah nama/kategori/pindah/hapus), "Tambahkan daftar", composer kartu per kolom, kartu dengan label/komentar/lampiran/checklist/avatar. Hapus tahap ditolak bila masih berisi tugas. Label tugas bisa diatur dari drawer (`setTaskLabelsAction`).
- Header proyek: strip Progres/tanggal/tugas/milestone/PM dihapus atas permintaan owner 2026-11-09 (datanya tetap di Overview); teks "Papan Kanban / Seret kartu antar kolom..." di halaman Board dihapus; gap mobile setelah tab dirapatkan (`project-outlet` 8px).
- Drawer tugas (permintaan owner 2026-11-09): Label dipindah ke samping Tenggat (tanpa teks "Belum ada label."), PIC memakai pemilih cari + pilih, dan menempel gambar (Ctrl+V) di komentar langsung mengunggahnya sebagai lampiran tugas dengan pratinjau + thumbnail di daftar lampiran.
- Mobile (permintaan owner 2026-11-09): seluruh header halaman disembunyikan di layar kecil (nama halaman ada di header, pembuatan lewat menu +); tampilan minggu kalender menjadi daftar hari (lihat juga "Mobile" di bawah untuk kalender yang bisa digeser).
- Header halaman (permintaan owner 2026-11-09 lanjutan): blok judul/deskripsi + tombol sejajar dihapus juga di desktop untuk Dashboard, My Work, Proyek, Tugas, Kalender, Tim, Dokumen, Permintaan, Persetujuan, Pengaturan, dan Laporan (tiap halaman tetap punya `h1` sr-only). Di Laporan, tombol **Ekspor CSV** dipindah ke samping **Terapkan**.
- Halaman detail proyek: tombol **Pengaturan** dan **+ Tugas** di header dihapus (tujuan tetap ada di tab Pengaturan dan toolbar Board).
- Daftar proyek: switch **List / Board** di samping filter departemen (Board = kartu seperti sebelumnya, List = tabel); kartu Board memakai `auto-fill` sehingga satu hasil tidak melebar penuh.
- Mobile "Lainnya": drawer sidebar diganti **bottom sheet** yang naik dari bawah (260ms, backdrop fade) berisi 12 tombol menu berikon dalam grid 4 kolom, status aktif, badge jumlah My Work/Persetujuan, tutup lewat backdrop/Escape/tombol X/geser ke bawah >90px; scroll halaman dikunci saat terbuka dan animasi dimatikan pada `prefers-reduced-motion`.
- Chat (permintaan owner 2026-11-09): saat percakapan dibuka di ≤1023px, tab bar bawah diganti komposer yang menempel di dasar layar (daftar chat tetap memakai tab bar); teks bantuan di bawah komposer dihapus; edit pesan lewat komposer (lihat Chat lanjutan 2); baris aksi (Reaksi/Tugas/Balas/Edit/Hapus) memakai warna `--text-muted` agar lebih lembut dari isi pesan.
- Chat lanjutan (permintaan owner 2026-11-09): badge "anggota" di header dihapus dan diganti menu **Anggota** di titik tiga; peran anggota (`admin`/`member`) ditambahkan lewat migrasi 0005 (pembuat percakapan = admin, admin terakhir tidak bisa dicabut/dikeluarkan), modal anggota bisa menambah/mengeluarkan/mengangkat admin dengan pencarian; deskripsi kanal di header dihapus; kanal baru bisa memilih ikon (tagar/bintang/hati/pin) lewat migrasi 0006; daftar percakapan memakai filter **Semua/Belum dibaca/Kanal** menggantikan label "Percakapan N".
- Chat lanjutan 2: edit pesan memakai komposer bawah (bar "Edit pesan", tombol Simpan, bubble ditandai, Escape mengembalikan draft) alih-alih blok editor di thread; empty state "Belum dibaca"/"Kanal" memakai ikon terpusat dengan teks singkat seperti WhatsApp; panel tanpa percakapan memakai flex center.
- Dokumen (permintaan owner 2026-11-10): eksperimen tampilan Google Drive/DRIVE.md dibatalkan dan menu Dokumen dikembalikan ke versi sebelumnya (kartu ringkasan, toolbar cari+unggah, sidebar folder, daftar baris, panel detail, modal pratinjau/unggah). Aksi server khusus Drive dihapus; migrasi 0008/0009 tetap ada di DB tetapi tidak dipakai UI.
- Mobile: default **List** untuk Proyek (≤1023px) dan My Work, tabel My Work di mobile mengikuti gaya daftar proyek (scroll dalam panel), serta kalender sel 92×96px yang bisa digeser horizontal tanpa membuat halaman melebar.
- Tugas (2026-11-10): drawer menampilkan **Total waktu** (dibuat → status Done) dan Laporan menambah **Rata-rata durasi**; `completed_at` diisi saat status masuk kategori Done dan dikosongkan saat dibuka kembali (migrasi 0010).
- Dokumen versi (2026-11-10): **Ganti file (versi baru)** menyimpan revisi sebagai versi baru dan file lama tetap di riwayat (unduh via `?version=`); **Kembalikan versi ini** membuat versi baru dari file lama. **Arsip** di samping Unggah menyimpan dokumen terhapus (Pulihkan / Hapus permanen, auto-hapus 30 hari).
- Dokumen interaksi (2026-11-10): tombol **+** di panel folder (termasuk subfolder), drag file ke folder/breadcrumb, toolbar **Arsip · A–Z/Z–A · List/Board · Pilih**, board dengan preview gambar, serta bulk **Salin/Pindah/Hapus** dan **Tempel** ke folder aktif.
- Bottom sheet "Lainnya" mobile: **Pengaturan dihapus** dari sheet (tetap bisa diakses lewat rute/desktop). Menu Database yang sempat ditambahkan **dibatalkan/dihapus** pada permintaan berikutnya (2026-11-10); sidebar, rute, komponen, aksi, izin, dan seed Database dikembalikan ke kondisi sebelum modul tersebut ada.
- Halaman auth `/masuk`, `/daftar`, `/gabung` (2026-11-10): dipindah ke route group `(auth)` tanpa header/footer marketing; komposisi terpusat terinspirasi pola login aplikasi (logo di atas, kartu form, ilustrasi 2D sudut bawah, signature brand) dengan palet DESIGN.md dan ilustrasi unDraw berlisensi terbuka.
- Semua perubahan diverifikasi `npm run check` + `npm test`.
