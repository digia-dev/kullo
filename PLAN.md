# PLAN.md — Kullo menuju Production (Web + iOS + Android)

Tanggal: 2026-11-08 · Repo: https://github.com/digia-dev/kullo · Estimasi: 1 developer + AI-assist

Dokumen ini adalah peta jalan dari kondisi sekarang sampai aplikasi **dipublikasikan** di web, App Store, dan Google Play — dengan seluruh platform terintegrasi.

---

## 0. Kondisi saat ini (jujur)

### Sudah ada
| Aspek | Status |
|---|---|
| Web app | Next.js 16, 47 route, 18 layar produk + 12 halaman marketing, lolos `npm run check` + 40/40 e2e |
| Data | SQLite + Drizzle (WAL + busy_timeout), session DB-backed (hash + expiry), RBAC per-organisasi |
| Auth | Login/register, cookie session, gate `/app/*` — **belum ada reset password** |
| Notifikasi | Tabel `notifications` + satu fungsi `notify()` (15 titik panggil) — in-app saja |
| Chat | Berfungsi, tapi update via `router.refresh()` — **belum realtime** |
| Dokumen | Upload ke disk `data/uploads/`, permission-checked |
| GitHub | ✅ terhubung, `main` ter-push |
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

- [ ] GitHub Actions CI: `npm ci && npm run check && npm test` tiap push + PR (add `deploy.yml` nanti)
- [ ] Branch protection `main` (butuh repo settings di GitHub — akun Anda)
- [ ] Pisahkan `db:migrate` dari `db:seed` untuk produksi; akun demo tidak masuk DB produksi
- [ ] Backup otomatis SQLite (`cron` + `.backup`) **diuji restore-nya sekali**
- [ ] Hardening: HTTPS, security header, rate-limit `/masuk` + `/api/search`
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

**DoD:** seluruh alur F01–F08 bisa dijalankan lewat curl dengan token; e2e web tetap 40/40.

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
