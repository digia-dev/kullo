# Audit kritik internal Kullo

> Catatan etis: ini adalah temuan audit internal dari source code dan UI saat ini, **bukan ulasan atau testimoni pengguna**. Jangan menerbitkannya sebagai komentar pelanggan.
>
> Beberapa butir berasal dari inspeksi kode dan belum direproduksi di semua perangkat; perlakukan sebagai hipotesis audit yang perlu diverifikasi sebelum dipublikasikan.

Jumlah temuan: **206**. Kategori: Pendaftaran, Autentikasi, Email, Admin, Tugas, Komentar, Dokumen, UI/UX, Mobile, Aksesibilitas, Performa, Keamanan, Marketing, Operasional.

| No | Kategori | Kritik | Perbaikan |
| --- | --- | --- | --- |
| 1 | Pendaftaran | Form daftar meminta kata sandi sebelum akun disetujui; pendaftar tidak diberi tahu bahwa yang disimpan baru hash dan akun belum aktif. | Jelaskan status 'menunggu persetujuan' dan jangan minta password sampai approval, atau kirim tautan pembuatan password. |
| 2 | Pendaftaran | Tidak ada verifikasi email; siapa pun bisa mendaftar memakai alamat orang lain. | Kirim OTP/verifikasi email sebelum permintaan masuk ke admin. |
| 3 | Pendaftaran | Setelah submit, satu-satunya bukti adalah pesan di layar dan tautan status rahasia; tidak ada email konfirmasi. | Kirim email 'permintaan diterima' berisi ID dan tautan status. |
| 4 | Pendaftaran | Status permintaan hanya bisa dicek lewat token di URL; pengguna yang kehilangan tautan tidak punya cara lain. | Sediakan pencarian status dengan email + OTP. |
| 5 | Pendaftaran | Token status dan token login memakai nilai yang sama; membagikan tautan status berarti membagikan kunci akun. | Pisahkan token status (read-only) dan token klaim sekali pakai. |
| 6 | Pendaftaran | Token tidak punya masa berlaku eksplisit dan tidak bisa dicabut dari UI. | Tambahkan expiry, tombol cabut, dan regenerasi tautan. |
| 7 | Pendaftaran | Admin dapat menyetujui dengan satu klik tanpa konfirmasi; salah klik langsung membuat organisasi dan user. | Tambahkan dialog konfirmasi berisi nama perusahaan dan email. |
| 8 | Pendaftaran | Jika email gagal, tautan dan kata sandi hanya tersimpan di outbox; tidak ada notifikasi kegagalan ke admin. | Tampilkan status kirim email dan tombol kirim ulang di inbox. |
| 9 | Pendaftaran | Form demo menerima nama perusahaan apa pun tanpa validasi atau verifikasi domain. | Batasi domain email perusahaan atau tambahkan verifikasi manual. |
| 10 | Pendaftaran | Rate limit hanya di memori proses; reset saat deploy dan tidak berlaku lintas instance. | Pindahkan rate limit ke database/Redis dengan kunci IP + email. |
| 11 | Pendaftaran | Tidak ada CAPTCHA atau proteksi bot pada form publik. | Tambahkan Turnstile/hCaptcha atau challenge ringan. |
| 12 | Pendaftaran | Duplikat hanya dicek pada permintaan berstatus pending; email yang sudah punya akun bisa mengajukan lagi. | Cek tabel users dan semua permintaan, bukan hanya pending. |
| 13 | Pendaftaran | Tidak ada checkbox persetujuan ketentuan/privasi; teks tautan saja tidak cukup sebagai bukti consent. | Tambahkan checkbox eksplisit dan simpan waktu persetujuan. |
| 14 | Pendaftaran | Nomor WhatsApp tidak diverifikasi; admin harus menebak kontak valid. | Kirim OTP WhatsApp atau tandai kontak belum terverifikasi. |
| 15 | Pendaftaran | Pilihan paket tidak memengaruhi limit backend; memilih Gratis dan Pro menghasilkan workspace yang sama. | Terapkan plan pada organisasi dan tegakkan limit anggota/proyek. |
| 16 | Pendaftaran | Harga tidak tercatat sebagai subscription; tidak ada masa aktif, perpanjangan, atau status kedaluwarsa. | Buat subscription dengan periode, status, dan tanggal jatuh tempo. |
| 17 | Pendaftaran | Tidak ada nomor invoice, rincian pajak, atau instruksi pembayaran di aplikasi. | Terbitkan invoice PDF bernomor dengan PPN dan rekening tujuan. |
| 18 | Pendaftaran | Bukti pembayaran hanya divalidasi ukuran dan nama file; tidak ada pemeriksaan MIME asli atau malware. | Validasi magic bytes, batasi tipe, dan pindai file. |
| 19 | Pendaftaran | Bukti pembayaran bisa dibuka platform admin mana pun tanpa jejak audit. | Batasi per peran dan catat setiap akses ke audit log. |
| 20 | Pendaftaran | Alasan penolakan dikunci pada satu kalimat; admin tidak bisa menulis alasan spesifik. | Sediakan textarea alasan dan template penolakan. |
| 21 | Pendaftaran | Tidak ada mekanisme kirim ulang kredensial; password demo hanya muncul sekali di email/outbox. | Sediakan reset password untuk akun demo atau tombol regenerasi. |
| 22 | Pendaftaran | Permintaan yang ditinggalkan tidak pernah dibersihkan; tabel access_requests akan menumpuk selamanya. | Tambahkan job retensi dan status kedaluwarsa. |
| 23 | Pendaftaran | Tidak ada deteksi 'email sudah punya akun' saat mengajukan demo; user bisa membuat workspace ganda. | Cocokkan email dengan users/memberships sebelum membuat request. |
| 24 | Pendaftaran | Halaman status menampilkan email perusahaan dan status approval ke siapa pun yang memegang URL. | Sembunyikan detail sensitif atau minta verifikasi email. |
| 25 | Autentikasi | Tidak ada fitur lupa kata sandi; pengguna yang lupa password tidak punya jalan pulih. | Bangun reset password lewat email bertoken sekali pakai. |
| 26 | Autentikasi | Tidak ada verifikasi email saat membuat akun mandiri. | Kirim tautan verifikasi sebelum akun bisa dipakai. |
| 27 | Autentikasi | Tidak ada 2FA untuk anggota, apalagi platform admin. | Tambahkan TOTP/WebAuthn, wajib untuk admin. |
| 28 | Autentikasi | Tidak ada penghapusan akun atau ekspor data; UU PDP sulit dipenuhi. | Sediakan self-service delete/export dengan konfirmasi. |
| 29 | Autentikasi | Daftar sesi aktif tidak terlihat; pengguna tidak bisa logout dari perangkat lain. | Tampilkan sesi, perangkat, dan tombol cabut. |
| 30 | Autentikasi | Cookie sesi 7 hari tanpa rotasi; token dicuri tetap berlaku sampai kedaluwarsa. | Rotasi token saat login dan saat perubahan sensitif. |
| 31 | Autentikasi | Rate limit login di memori; restart server menghapus perlindungan brute force. | Simpan hitungan percobaan di database. |
| 32 | Autentikasi | Tidak ada peringatan login baru atau email ke pemilik akun. | Kirim notifikasi login dari perangkat/IP baru. |
| 33 | Autentikasi | Kebijakan password hanya minimal 8 karakter; tidak ada cek password bocor. | Gunakan zxcvbn/HaveIBeenPwned dan tolak password umum. |
| 34 | Autentikasi | Parameter scrypt tidak didokumentasikan dan tidak diuji terhadap batas CPU serverless. | Dokumentasikan biaya dan benchmark di runtime Vercel. |
| 35 | Autentikasi | Kredensial akun demo diketahui publik dan tidak dibatasi environment. | Batasi akun demo dengan flag env dan data terpisah. |
| 36 | Autentikasi | Tidak ada perlindungan CSRF eksplisit di dokumentasi; keamanan bergantung pada perilaku Server Actions. | Dokumentasikan dan uji origin/CSRF pada setiap action. |
| 37 | Autentikasi | Perubahan kata sandi tidak terlihat mencabut semua sesi lama. | Cabut semua sesi lain setelah ganti password. |
| 38 | Autentikasi | Pesan error login membedakan email tidak ada vs password salah? Saat ini disamarkan, tetapi rate-limit tetap bisa dipakai enumerasi. | Terapkan respons dan timing seragam, plus rate limit per IP. |
| 39 | Email | Gmail SMTP punya batas harian dan reputasi lemah untuk email transaksional bisnis. | Gunakan domain dengan SPF/DKIM/DMARC atau provider transaksional. |
| 40 | Email | App Password Gmail disimpan di env dan pernah muncul di chat. | Rotasi App Password dan gunakan secret manager. |
| 41 | Email | Belum ada SPF, DKIM, dan DMARC untuk kullo.web.id. | Konfigurasi DNS email sebelum mengirim ke pengguna nyata. |
| 42 | Email | Tidak ada penanganan bounce, spam complaint, atau alamat tidak valid. | Integrasikan webhook bounce dan tandai email gagal. |
| 43 | Email | Outbox tidak punya retry/backoff; kegagalan SMTP berhenti sebagai baris diam. | Tambahkan antrean email dengan retry dan status. |
| 44 | Email | Template invoice dan penolakan masih teks polos; kualitasnya tidak konsisten dengan email demo. | Pakai template HTML yang sama untuk semua email akses. |
| 45 | Email | Tidak ada batas jumlah email per permintaan; klik berulang bisa mengirim spam. | Idempotensi per status dan batas kirim. |
| 46 | Email | Subjek email memakai nama perusahaan dari input tanpa sanitasi header. | Bersihkan newline dan karakter kontrol pada subjek. |
| 47 | Email | Tidak ada tautan preferensi atau cara berhenti menerima notifikasi admin. | Tambahkan preferensi notifikasi meski email transaksional. |
| 48 | Email | Tidak ada uji rendering di Gmail/Outlook/mobile untuk template HTML. | Tambahkan snapshot email dan uji Litmus/EML. |
| 49 | Email | Tautan login memakai NEXT_PUBLIC_APP_URL; salah set env membuat semua tautan mati. | Validasi env saat build dan tampilkan error konfigurasi. |
| 50 | Email | Tidak ada riwayat email per pengguna yang bisa dilihat admin dari halaman anggota. | Tautkan outbox ke user/request dan tampilkan di profil. |
| 51 | Admin | Inbox akses tidak punya pencarian, filter, atau pagination; akan tidak terpakai saat request menumpuk. | Tambahkan filter status/tipe, pencarian, dan pagination. |
| 52 | Admin | Setiap approve/reject tidak menulis audit log. | Catat aktor, waktu, keputusan, dan perubahan. |
| 53 | Admin | Tidak ada pemisahan peran; siapa pun yang ada di allowlist bisa melihat bukti pembayaran. | Buat peran finance/support/admin dengan izin berbeda. |
| 54 | Admin | Kata sandi demo terlihat sebagai teks di outbox. | Simpan hash saja, kirim sekali, dan sediakan reset. |
| 55 | Admin | Tombol Setujui langsung mengeksekusi provisioning tanpa konfirmasi. | Tambahkan dialog konfirmasi dan ringkasan. |
| 56 | Admin | Alasan tolak tidak bisa diedit; semua penolakan berbunyi sama. | Sediakan input alasan dan template. |
| 57 | Admin | Tidak ada aksi massal untuk approve/reject. | Tambahkan pilih-banyak dengan konfirmasi. |
| 58 | Admin | Tidak ada timeline status permintaan; admin tidak tahu kapan invoice dikirim. | Simpan event status dan tampilkan riwayat. |
| 59 | Admin | Tidak ada pencatatan nominal invoice atau pembayaran. | Tambahkan amount, currency, dan referensi pembayaran. |
| 60 | Admin | Tidak ada alur refund/pembatalan langganan. | Rancang state cancelled/refunded dan akses berakhir. |
| 61 | Admin | Permintaan yang disetujui tetapi tidak pernah diklaim tidak kedaluwarsa. | Tambahkan expiry dan pembersihan akun demo. |
| 62 | Admin | Tidak ada tombol kirim ulang tautan setelah approval. | Sediakan regenerate/resend dengan audit. |
| 63 | Admin | Permintaan baru tidak muncul di lonceng notifikasi aplikasi. | Buat notifikasi in-app untuk platform admin. |
| 64 | Admin | Halaman admin tidak ada di navigasi; hanya bisa diakses jika tahu URL. | Tambahkan menu admin yang hanya tampil untuk allowlist. |
| 65 | Tugas | Dependensi dihapus dari UI tetapi tabel dan field masih ada; data yatim tanpa cara mengelola. | Hapus skema atau sediakan migrasi/arsip yang jelas. |
| 66 | Tugas | Tidak ada tugas berulang untuk pekerjaan rutin. | Tambahkan recurrence dengan RRULE. |
| 67 | Tugas | Tidak ada bulk edit, bulk move, atau bulk assign. | Tambahkan multi-select dan aksi massal. |
| 68 | Tugas | Filter tidak bisa disimpan sebagai view pribadi/tim. | Simpan filter dan urutan sebagai view. |
| 69 | Tugas | Tidak ada custom field; tim harus menjejalkan informasi ke deskripsi. | Tambahkan field kustom per proyek. |
| 70 | Tugas | Tidak ada template tugas/proyek. | Sediakan template dan duplikasi proyek. |
| 71 | Tugas | Mention di komentar tidak mengirim notifikasi ke yang disebut. | Buat notifikasi mention dan preferensi. |
| 72 | Tugas | Tidak ada pengingat tenggat; DueBadge hanya visual. | Tambahkan pengingat email/in-app H-1. |
| 73 | Tugas | Tidak ada batas kedalaman subtask; struktur bisa menjadi liar. | Batasi level atau ubah menjadi item checklist. |
| 74 | Tugas | Nomor tugas per organisasi bisa membingungkan saat banyak proyek. | Tampilkan kode proyek konsisten atau nomor per proyek. |
| 75 | Tugas | Tidak ada optimistic update; setiap perubahan menunggu server dan refresh. | Gunakan update optimistis dengan rollback. |
| 76 | Tugas | Arsip tugas tidak punya undo atau tampilan arsip yang jelas. | Tambahkan undo dan halaman arsip. |
| 77 | Tugas | Tidak ada duplikasi proyek untuk klien baru. | Tambahkan clone proyek tanpa data aktivitas. |
| 78 | Tugas | Dependensi lintas proyek tidak pernah didukung. | Rancang dependency lintas proyek atau hapus total. |
| 79 | Tugas | Progress proyek hanya rasio jumlah tugas, bukan bobot/estimasi. | Hitung progress berbobot atau per milestone. |
| 80 | Tugas | Time tracking dihapus dari UI; data time_logs menjadi yatim. | Hapus tabel atau sediakan laporan waktu. |
| 81 | Tugas | Milestone hanya nama+tanggal; tidak terhubung ke tugas. | Hubungkan tugas ke milestone dan progres. |
| 82 | Tugas | Kapasitas tim tidak bisa diatur; workload hanya hitungan tugas. | Tambahkan kapasitas jam/minggu per anggota. |
| 83 | Tugas | Papan Kanban tidak punya WIP limit. | Tambahkan WIP limit per kolom. |
| 84 | Tugas | Riwayat aktivitas dangkal; tidak ada diff nilai lama/baru. | Simpan perubahan field secara terstruktur. |
| 85 | Tugas | Tidak ada ekspor tugas/proyek ke CSV. | Tambahkan ekspor dengan filter aktif. |
| 86 | Tugas | Tidak ada API publik untuk integrasi. | Rancang API token dan dokumentasi. |
| 87 | Tugas | Drag-and-drop papan tidak bisa dioperasikan dengan keyboard. | Tambahkan aksi pindah status via keyboard. |
| 88 | Tugas | Banyak label bahasa Inggris bercampur Indonesia (High, Due, My Work). | Standarkan istilah atau sediakan i18n. |
| 89 | Tugas | Deskripsi tidak mendukung markdown/checklist inline. | Tambahkan markdown aman dan preview. |
| 90 | Tugas | Tidak ada pemisahan hak edit vs komentar per field. | Perjelas izin field-level atau role. |
| 91 | Komentar | Mention hanya tersedia di komentar tugas dan chat, tidak di deskripsi. | Aktifkan mention di editor deskripsi. |
| 92 | Komentar | Mention disimpan sebagai teks nama, bukan ID; ganti nama memutus tautan. | Simpan mention sebagai ID + snapshot nama. |
| 93 | Komentar | Tidak ada notifikasi mention. | Kirim notifikasi in-app/email. |
| 94 | Komentar | Tidak ada riwayat edit komentar. | Simpan versi dan tampilkan 'diedit'. |
| 95 | Komentar | Lampiran komentar dibatasi 4 file dan kena limit 4,5 MB Vercel. | Upload langsung ke storage dan naikkan batas. |
| 96 | Komentar | Tidak ada reaksi di komentar tugas, padahal chat punya. | Tambahkan reaksi ringan. |
| 97 | Komentar | Tidak ada moderasi/hapus komentar oleh admin. | Tambahkan izin moderasi dan audit. |
| 98 | Komentar | Mention popup bisa terpotong di sheet mobile saat keyboard terbuka. | Gunakan portal/popover yang sadar viewport. |
| 99 | Dokumen | Upload lewat Server Action dibatasi ±4,5 MB di Vercel. | Upload langsung ke Supabase Storage dengan signed URL. |
| 100 | Dokumen | Tidak ada validasi MIME asli; ekstensi bisa dipalsukan. | Periksa magic bytes dan blokir tipe berbahaya. |
| 101 | Dokumen | Tidak ada pemindaian malware. | Integrasikan ClamAV/scan async. |
| 102 | Dokumen | Tidak ada kuota per organisasi; storage bisa membengkak tanpa peringatan. | Tampilkan kuota dan batas per paket. |
| 103 | Dokumen | File di trash tidak punya UI restore yang jelas. | Tambahkan restore dan retensi. |
| 104 | Dokumen | Tidak ada pratinjau untuk Office/PDF di dalam aplikasi. | Tambahkan preview atau fallback jelas. |
| 105 | Dokumen | Pencarian dokumen hanya metadata, bukan isi. | Tambahkan ekstraksi teks dan full-text search. |
| 106 | Dokumen | Versi dokumen tidak punya diff atau catatan perubahan wajib. | Wajibkan catatan versi dan tampilkan diff. |
| 107 | Dokumen | Signed URL tidak digunakan untuk unduhan; semua lewat route yang memproksikan file. | Gunakan signed URL berumur pendek. |
| 108 | Dokumen | Tidak ada audit unduhan dokumen sensitif. | Catat akses/unduhan di audit log. |
| 109 | Dokumen | Avatar hanya divalidasi di klien? Server perlu memastikan tipe dan ukuran. | Validasi server-side dan normalisasi gambar. |
| 110 | Dokumen | Bukti pembayaran disimpan di bucket yang sama dengan file kerja. | Pisahkan bucket/prefix khusus data finansial. |
| 111 | Dokumen | Fallback penyimpanan lokal membuat perilaku dev dan produksi berbeda. | Gunakan storage emulator atau Supabase lokal yang konsisten. |
| 112 | Dokumen | Tidak ada lifecycle policy untuk file yatim. | Jalankan job pembersihan berkala. |
| 113 | UI/UX | Halaman auth dikunci 100dvh; di layar pendek (<600px) konten bisa terpotong tanpa scroll. | Izinkan scroll saat tinggi viewport di bawah ambang. |
| 114 | UI/UX | Header marketing mulai sesak di 1200px; tombol dan nav berebut ruang. | Uji breakpoint 1200–1320 dan sederhanakan nav. |
| 115 | UI/UX | Toggle tema terkubur di Profil, bukan di topbar atau Pengaturan umum. | Pindahkan ke menu tampilan global. |
| 116 | UI/UX | Tema gelap hanya untuk app; transisi dari marketing ke app terasa mendadak. | Dukung preferensi tema di seluruh situs. |
| 117 | UI/UX | Tab pengaturan terpotong horizontal di beberapa lebar. | Ubah menjadi dropdown/scroll dengan indikator. |
| 118 | UI/UX | Panel properti modal tugas menyisakan ruang kosong besar di bawah. | Isi dengan metadata atau buat rail lebih ringkas. |
| 119 | UI/UX | Filter tugas tidak menunjukkan jumlah filter aktif. | Tambahkan badge jumlah filter. |
| 120 | UI/UX | Command palette tidak punya petunjuk shortcut yang konsisten. | Tampilkan hint dan dokumentasikan. |
| 121 | UI/UX | Toast bisa menutupi tombol aksi di bawah layar. | Atur offset dan antrean toast. |
| 122 | UI/UX | Skeleton loading tidak mencerminkan layout akhir. | Buat skeleton sesuai grid. |
| 123 | UI/UX | Pesan error umum 'Gagal...' tanpa langkah pemulihan. | Sertakan sebab dan aksi berikutnya. |
| 124 | UI/UX | Empty state tidak selalu punya CTA. | Tambahkan aksi utama di setiap empty state. |
| 125 | UI/UX | Breadcrumb tidak konsisten di semua halaman. | Standarkan breadcrumb dan judul halaman. |
| 126 | UI/UX | Kepadatan UI tidak bisa diatur; tabel terasa sempit/lebar di layar berbeda. | Tambahkan density comfortable/compact. |
| 127 | UI/UX | Campuran bahasa Inggris dan Indonesia membingungkan. | Standarkan bahasa atau i18n penuh. |
| 128 | UI/UX | Tombol primary terlalu banyak dalam satu layar sehingga hierarki lemah. | Batasi satu aksi utama per area. |
| 129 | Mobile | Bottom nav hanya 4 item; Pengaturan dan chat sekunder tersembunyi di Lainnya. | Uji discoverability dan pertimbangkan 5 item. |
| 130 | Mobile | Tab pengaturan terpotong di 390px. | Gunakan scroll tab dengan fade atau dropdown. |
| 131 | Mobile | Daftar anggota berupa kartu sangat panjang; tidak ada pencarian. | Tambahkan pencarian dan filter. |
| 132 | Mobile | 100dvh dengan keyboard dapat menggeser composer. | Gunakan visualViewport dan safe-area. |
| 133 | Mobile | Mention popup di sheet bisa tertutup keyboard. | Reposisi popup di atas input. |
| 134 | Mobile | Toggle atribut ikon saja sulit ditemukan pengguna baru. | Tambahkan tooltip/label saat pertama. |
| 135 | Mobile | Tabel anggota memakai label berulang yang memakan ruang. | Ringkas label atau gunakan dua kolom. |
| 136 | Mobile | Tidak ada swipe action untuk tugas/chat. | Tambahkan aksi geser opsional. |
| 137 | Mobile | Tidak ada pull-to-refresh. | Tambahkan refresh gestur. |
| 138 | Mobile | Composer chat bisa tertutup keyboard pada perangkat kecil. | Uji iOS Safari dan Android Chrome. |
| 139 | Mobile | Auth mobile masih scroll panjang; belum ada versi ringkas. | Pertahankan scroll tetapi ringkas field. |
| 140 | Mobile | Hero marketing memuat gambar besar; LCP mobile berisiko. | Optimalkan gambar dan ukuran responsif. |
| 141 | Mobile | Tidak ada prompt install PWA. | Tambahkan prompt setelah interaksi. |
| 142 | Mobile | Banyak affordance hover tidak punya padanan tap. | Pastikan semua aksi punya tombol terlihat. |
| 143 | Mobile | Bottom nav bisa menutupi konten terakhir. | Tambahkan padding bawah global. |
| 144 | Mobile | Angka dan tanggal tidak konsisten formatnya. | Gunakan formatter id-ID terpusat. |
| 145 | Aksesibilitas | Prioritas memakai warna saja tanpa teks di beberapa tempat. | Sertakan label teks/ikon. |
| 146 | Aksesibilitas | Kontras teks muted di dark mode mendekati batas. | Uji ulang AA pada semua surface. |
| 147 | Aksesibilitas | Pesan error form tidak terhubung aria-describedby. | Hubungkan input ke error. |
| 148 | Aksesibilitas | Field wajib tidak memakai aria-required. | Tambahkan atribut dan indikator visual. |
| 149 | Aksesibilitas | Modal tidak selalu mengembalikan fokus ke pemicu. | Simpan dan pulihkan fokus. |
| 150 | Aksesibilitas | Tabel tidak punya caption/aria-label yang menjelaskan konteks. | Tambahkan caption. |
| 151 | Aksesibilitas | Perubahan status async tidak diumumkan ke screen reader. | Gunakan aria-live pada status simpan. |
| 152 | Aksesibilitas | Drag-and-drop papan tidak bisa keyboard. | Sediakan aksi menu pindah status. |
| 153 | Aksesibilitas | Mention listbox tidak mengumumkan jumlah hasil. | Gunakan aria-live dan opsi yang jelas. |
| 154 | Aksesibilitas | Select di tabel anggota hanya 30px di desktop. | Naikkan target sentuh/klik. |
| 155 | Aksesibilitas | Ilustrasi dekoratif sudah aria-hidden; pastikan konsisten di semua halaman. | Audit semua gambar dekoratif. |
| 156 | Aksesibilitas | Tidak ada skip link di app shell. | Tambahkan 'Lewati ke konten'. |
| 157 | Aksesibilitas | Fokus keyboard pada papan/daftar tidak terlihat jelas. | Perkuat focus ring. |
| 158 | Aksesibilitas | Toggle ikon tanpa teks bisa membingungkan; aria-label saja tidak membantu penglihatan. | Tambahkan tooltip visual. |
| 159 | Performa | Query ke Supabase Sydney ±275 ms; dashboard 15–40 detik. | Pindahkan region atau batch query. |
| 160 | Performa | Dashboard menjalankan puluhan query berurutan. | Gabungkan query atau gunakan Promise.all terkontrol. |
| 161 | Performa | Tidak ada pagination pada tugas, anggota, atau dokumen. | Tambahkan cursor pagination. |
| 162 | Performa | Tidak ada cache untuk data yang jarang berubah. | Gunakan unstable_cache/tag revalidate. |
| 163 | Performa | N+1 pada enrichTasks dan getConversations. | Batch query dengan inArray. |
| 164 | Performa | getPeople mengambil seluruh kolom users termasuk password_hash. | Pilih kolom eksplisit dan jangan pernah kirim hash ke UI. |
| 165 | Performa | Setiap request membaca sesi dari database. | Cache sesi jangka pendek atau gunakan token terverifikasi. |
| 166 | Performa | Beberapa foreign key tidak punya index. | Tambahkan index sesuai advisor. |
| 167 | Performa | Timestamp disimpan sebagai text; sorting/range rawan format. | Gunakan timestamptz. |
| 168 | Performa | Connection pool tidak disesuaikan per lingkungan. | Konfigurasi pool terpisah dev/prod. |
| 169 | Performa | Tidak ada background job untuk email/scan. | Tambahkan queue. |
| 170 | Performa | Tidak ada query timeout. | Set statement_timeout. |
| 171 | Performa | Tidak ada log slow query. | Aktifkan pg_stat_statements dan alert. |
| 172 | Performa | Pencarian memakai ILIKE tanpa index full-text. | Gunakan tsvector/pg_trgm. |
| 173 | Performa | Laporan menghitung ulang semua data setiap request. | Materialized view/cache. |
| 174 | Performa | Belum ada load test baseline. | Jalankan k6 dan catat p95. |
| 175 | Keamanan | password_hash ikut terambil pada getPeople meski tidak ditampilkan. | Select kolom eksplisit; audit semua query. |
| 176 | Keamanan | Token magic disimpan plaintext di access_requests. | Simpan hash dan tampilkan token hanya sekali. |
| 177 | Keamanan | RLS aktif tanpa policy; aman untuk anon tetapi tidak melindungi jika kredensial DB bocor. | Gunakan role aplikasi least-privilege + policy. |
| 178 | Keamanan | Allowlist admin berbasis env; demo@kullo.app ikut di local env. | Pisahkan admin platform dari akun demo. |
| 179 | Keamanan | Tidak ada audit trail untuk aksi admin. | Catat semua keputusan. |
| 180 | Keamanan | Tidak ada log IP/device login. | Simpan metadata sesi. |
| 181 | Keamanan | Tidak ada Content-Security-Policy. | Tambahkan CSP ketat. |
| 182 | Keamanan | HSTS hanya production. | Pastikan header konsisten di semua domain. |
| 183 | Keamanan | Rate limit tidak persisten. | Gunakan store bersama. |
| 184 | Keamanan | Tidak ada enkripsi application-level untuk data sensitif. | Evaluasi enkripsi kolom. |
| 185 | Keamanan | Tidak ada kebijakan retensi data. | Tetapkan retensi dan penghapusan. |
| 186 | Keamanan | Nama perusahaan masuk subjek email tanpa sanitasi header. | Strip newline dan validasi. |
| 187 | Keamanan | Tidak ada 2FA untuk admin. | Wajibkan 2FA. |
| 188 | Keamanan | Bukti pembayaran dapat diakses semua admin tanpa watermark/audit. | Batasi dan audit. |
| 189 | Marketing | Klaim 'lebih hemat dibanding alat serupa' tanpa tabel perbandingan publik. | Tambahkan perbandingan dengan tanggal dan sumber. |
| 190 | Marketing | Harga di halaman tidak ditegakkan di aplikasi. | Sinkronkan plan dan limit. |
| 191 | Marketing | Tidak ada rincian PPN/faktur pajak. | Jelaskan pajak dan dokumen. |
| 192 | Marketing | Tidak ada kebijakan refund/pembatalan. | Tambahkan halaman kebijakan. |
| 193 | Marketing | Tidak ada bukti sosial (logo/testimoni) — jujur, tetapi konversi lemah. | Kumpulkan testimoni nyata atau tampilkan studi kasus internal. |
| 194 | Marketing | Domain kullo.web.id belum terpasang; tautan email masih bisa salah domain. | Selesaikan DNS/TLS sebelum kampanye. |
| 195 | Marketing | Tidak ada sitemap/robots yang terlihat. | Tambahkan sitemap dan robots. |
| 196 | Marketing | Hanya bahasa Indonesia; belum ada versi Inggris. | Rencanakan i18n. |
| 197 | Operasional | CI dilewati; tidak ada gerbang otomatis untuk PR. | Aktifkan GitHub Actions. |
| 198 | Operasional | Tidak ada error tracking (Sentry/GlitchTip). | Integrasikan dan alert. |
| 199 | Operasional | Tidak ada uptime monitor independen. | Pantau /api/health dari luar. |
| 200 | Operasional | Backup Supabase belum diuji restore. | Lakukan restore drill. |
| 201 | Operasional | Region Sydney menambah latensi pengguna Indonesia. | Evaluasi region Singapore atau edge cache. |
| 202 | Operasional | Vercel region syd1 dipin, tetapi env harus diset manual dan mudah salah. | Gunakan vercel env pull/checklist otomatis. |
| 203 | Operasional | Tidak ada staging environment. | Buat preview branch dengan DB terpisah. |
| 204 | Operasional | Migrasi tidak punya rollback. | Rancang down migration/restore plan. |
| 205 | Operasional | Tidak ada retensi log. | Tetapkan retensi dan akses. |
| 206 | Operasional | Tidak ada runbook insiden. | Tulis runbook dan kontak eskalasi. |
