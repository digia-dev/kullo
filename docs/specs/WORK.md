# WORK.md
# KULLO — Work Management Module

**Module:** Work Management  
**Application:** Kullo  
**Document Type:** Functional & Technical Specification  
**Status:** Product Specification  
**Version:** 1.0

---

# 1. Overview

## 1.1. Tentang Work Management

Work Management adalah modul opsional di dalam Kullo yang digunakan untuk mengelola seluruh proses pekerjaan operasional perusahaan, mulai dari pencatatan Work Order (WO), pembagian pekerjaan ke departemen, pelaksanaan task, monitoring progres, dokumentasi evidence, hingga pelaporan.

Modul ini dikembangkan berdasarkan alur kerja pada sistem Google Sheets yang digunakan untuk mengelola Work Order dan task departemen.

Tujuannya bukan sekadar memindahkan spreadsheet ke aplikasi, tetapi mengubah proses tersebut menjadi sistem kerja terstruktur, terukur, terdokumentasi, dan dapat dikembangkan.

## 1.2. Prinsip Utama

1. Work Order menjadi pusat informasi pekerjaan.
2. Satu Work Order dapat memiliki banyak task.
3. Satu Work Order dapat melibatkan beberapa departemen.
4. Setiap departemen memiliki task board masing-masing.
5. Semua task dapat dipantau melalui global task board.
6. Setiap perubahan status harus tercatat dalam activity history.
7. Evidence dan dokumen pekerjaan tersimpan secara terpusat.
8. Struktur departemen bersifat dinamis dan dapat dikembangkan.
9. Modul dapat diaktifkan atau dinonaktifkan tanpa menghapus data.
10. Work Order hanya dapat diselesaikan jika seluruh persyaratan wajib terpenuhi.

## 1.3. Target Penggunaan

Work Management dirancang untuk perusahaan yang memiliki proses pekerjaan lintas departemen, seperti:

- Internet Service Provider (ISP).
- System Integrator.
- Perusahaan instalasi jaringan.
- Perusahaan teknologi dan infrastruktur.
- Perusahaan dengan proses delivery dan project operation.
- Perusahaan yang memiliki proses administrasi dan keuangan terhubung dengan pekerjaan operasional.

---

# 2. Module Integration

## 2.1. Modul Opsional Kullo

Work Management merupakan modul tambahan yang terintegrasi dengan sistem utama Kullo.

Admin dapat mengaktifkan atau menonaktifkan modul melalui:

`Settings → Modules → Work Management`

Pengaturan:

- Enable Module.
- Disable Module.
- Configure Departments.
- Configure Work Order Categories.
- Configure Task Workflow.
- Configure Permissions.

### Ketentuan

- Data tidak boleh dihapus ketika modul dinonaktifkan.
- Semua data tetap tersimpan di database.
- Menu dan route modul tidak dapat diakses ketika modul dinonaktifkan, kecuali oleh administrator yang berwenang untuk pengelolaan sistem.
- Modul dapat diaktifkan kembali tanpa kehilangan data.
- Modul lain di Kullo tetap dapat berjalan secara independen.

## 2.2. Navigasi Sidebar

Tambahkan grup menu:

**WORK MANAGEMENT**

- Overview
- Work Orders
- Task Board
- My Tasks
- Departments
- Service Database
- Reports

Menu Settings berada di pengaturan modul atau pengaturan utama Kullo sesuai arsitektur aplikasi.

## 2.3. Integrasi dengan Modul Kullo Lainnya

| Modul Kullo | Integrasi |
|---|---|
| Workspace | Work Management terikat pada workspace |
| User Management | Penugasan dan hak akses |
| Documents | Penyimpanan dokumen dan evidence |
| CRM / Contacts | Data client dan PIC |
| Projects | Hubungan dengan project jika diperlukan |
| Notifications | Notifikasi perubahan task dan WO |
| Reports | Laporan operasional |
| Activity Logs | Riwayat aktivitas |

Integrasi bersifat modular. Work Management tidak boleh membuat duplikasi data user, workspace, atau contact apabila entitas tersebut sudah tersedia di sistem utama Kullo.

---

# 3. Department Management

## 3.1. Struktur Departemen

Sistem harus mendukung lima departemen awal:

| Kode | Departemen | Fokus Utama |
|---|---|---|
| INF | Infrastructure | Infrastruktur dan instalasi fisik |
| TEK | Technical | Konfigurasi dan aktivasi teknis |
| KOM | Commercial | Administrasi komersial dan koordinasi pelanggan |
| OPS | Operations | Koordinasi operasional dan delivery |
| FIN | Finance | Administrasi dan validasi keuangan |

Departemen bukan enum atau hardcoded value di dalam source code.

Departemen harus dikelola melalui database agar perusahaan dapat menambah, mengubah, atau menonaktifkan departemen tanpa perubahan kode program.

## 3.2. Tanggung Jawab Departemen

### INF — Infrastructure

Fokus pekerjaan:

- Persiapan infrastruktur.
- Pemeriksaan jalur dan lokasi instalasi.
- Persiapan perangkat fisik.
- Penarikan kabel.
- Instalasi jaringan.
- Pemeriksaan konektivitas fisik.
- Dokumentasi instalasi.
- Pengujian infrastruktur.

### TEK — Technical

Fokus pekerjaan:

- Provisioning layanan.
- Konfigurasi perangkat.
- Konfigurasi jaringan.
- Aktivasi layanan.
- Troubleshooting.
- Pengujian konektivitas.
- Validasi teknis.
- Dokumentasi konfigurasi dan hasil pengujian.

### KOM — Commercial

Fokus pekerjaan:

- Koordinasi kebutuhan pelanggan.
- Pemeriksaan permintaan layanan.
- Pengelolaan quotation.
- Pengelolaan Purchase Order.
- Koordinasi dokumen komersial.
- Koordinasi vendor.
- Validasi kesesuaian layanan dengan permintaan pelanggan.
- Administrasi komersial.

### OPS — Operations

Fokus pekerjaan:

- Penjadwalan pekerjaan.
- Koordinasi pelaksanaan lapangan.
- Koordinasi antar-departemen.
- Monitoring delivery.
- Validasi kesiapan operasional.
- Serah terima pekerjaan.
- Monitoring penyelesaian layanan.
- Dokumentasi laporan operasional.

### FIN — Finance

Fokus pekerjaan:

- Pemeriksaan dokumen keuangan.
- Validasi biaya pekerjaan.
- Administrasi billing.
- Pemeriksaan dokumen pembayaran.
- Verifikasi administrasi transaksi.
- Monitoring kewajiban pembayaran.
- Dokumentasi finansial.
- Validasi persyaratan keuangan.

## 3.3. Dynamic Department System

Database departemen minimal memiliki atribut:

| Field | Description |
|---|---|
| id | Primary key |
| workspace_id | Workspace pemilik departemen |
| code | Kode unik departemen |
| name | Nama departemen |
| description | Deskripsi |
| department_type | Kategori departemen |
| manager_id | Penanggung jawab |
| is_active | Status aktif |
| created_at | Waktu pembuatan |
| updated_at | Waktu pembaruan |

### Business Rules

- Kode departemen harus unik dalam satu workspace.
- User dapat menjadi anggota lebih dari satu departemen.
- Satu departemen dapat memiliki banyak user.
- Departemen dapat memiliki manager.
- Manager dapat mengelola task dan anggota sesuai permission.
- Departemen yang dinonaktifkan tetap memiliki histori pekerjaan.
- Departemen baru dapat ditambahkan tanpa mengubah struktur aplikasi.
- Semua laporan harus membaca daftar departemen secara dinamis.

## 3.4. Department Configuration

Setiap departemen dapat memiliki konfigurasi sendiri:

- Task templates.
- Default task checklist.
- Task priority.
- Required evidence.
- Review requirement.
- Approval requirement.
- Completion criteria.
- Department manager.
- Default task assignee.
- Notification rules.

---

# 4. Work Order Management

## 4.1. Konsep Work Order

Work Order merupakan pusat informasi dari setiap pekerjaan yang dilakukan perusahaan.

Satu Work Order dapat melibatkan satu atau beberapa departemen, dengan jumlah task yang tidak dibatasi oleh struktur spreadsheet.

Setiap Work Order memiliki identitas unik dan histori aktivitas.

## 4.2. Work Order Categories

Kategori awal:

- Pemasangan Baru.
- Trial.
- Upgrade.
- Downgrade.
- Dismantle.
- Isolir.
- BOD.
- Re-Aktivasi.
- Maintenance.
- Troubleshooting.
- Other.

Kategori dapat dikelola melalui pengaturan sehingga admin dapat menambah kategori baru.

## 4.3. Work Order Information

Data Work Order minimal mencakup:

### A. General Information

| Field | Description |
|---|---|
| wo_number | Nomor Work Order |
| title | Judul pekerjaan |
| category_id | Kategori pekerjaan |
| description | Deskripsi pekerjaan |
| site_id | Lokasi/site |
| priority | Prioritas |
| status | Status pekerjaan |
| created_by | Pembuat |
| assigned_manager | Penanggung jawab |
| created_at | Tanggal dibuat |
| due_date | Target penyelesaian |

### B. Client Information

| Field | Description |
|---|---|
| client_id | ID client |
| client_name | Nama client |
| cid | Customer ID |
| sid | Service ID |
| contact_person | PIC client |
| phone | Nomor telepon |
| email | Email |
| installation_address | Alamat instalasi |

Data client sebaiknya terhubung dengan database Contacts/CRM Kullo apabila tersedia.

### C. Service Information

| Field | Description |
|---|---|
| service_id | ID layanan |
| service_name | Nama layanan |
| service_type | Jenis layanan |
| capacity | Kapasitas |
| product_id | Produk/layanan |
| active_date | Tanggal aktivasi |

### D. Commercial Documents

| Field | Description |
|---|---|
| quotation_number | Nomor quotation |
| quotation_file | Dokumen quotation |
| po_number | Nomor Purchase Order |
| po_file | Dokumen PO |
| msa_number | Nomor MSA |
| msa_file | Dokumen MSA |
| fab_number | Nomor FAB |
| other_documents | Dokumen tambahan |

### E. Vendor Information

| Field | Description |
|---|---|
| vendor_id | ID vendor |
| vendor_code | Kode vendor |
| vendor_name | Nama vendor |
| vendor_site | Lokasi vendor |

Vendor harus terhubung dengan master database vendor.

## 4.4. Work Order Status

Status utama:

| Status | Description |
|---|---|
| DRAFT | WO masih dalam penyusunan |
| OPEN | WO telah dibuat dan siap diproses |
| PROGRESS | Pekerjaan sedang berjalan |
| ON HOLD | Pekerjaan ditunda |
| REVIEW | Menunggu pemeriksaan |
| DONE | Pekerjaan selesai |
| CANCELLED | Pekerjaan dibatalkan |

Perubahan status harus memiliki histori.

Status dapat berubah otomatis berdasarkan kondisi task, tetapi tetap harus mengikuti aturan workflow.

## 4.5. Work Order Detail Page

Setiap Work Order memiliki halaman detail dengan tab:

1. Overview
2. Information
3. Departments
4. Tasks
5. Documents
6. Comments
7. Activity History

### Overview

Menampilkan:

- Nomor WO.
- Client.
- Kategori.
- Site.
- Status.
- Progress keseluruhan.
- Due date.
- Departemen terlibat.
- Task selesai.
- Task tertunda.
- Task bermasalah.
- Penanggung jawab.

### Departments

Menampilkan departemen yang terlibat dan status masing-masing.

### Tasks

Menampilkan seluruh task yang terhubung ke WO tersebut.

### Documents

Menampilkan quotation, PO, MSA, FAB, dokumen instalasi, dan dokumen lainnya.

### Activity History

Menampilkan histori perubahan data dan aktivitas pekerjaan.

---

# 5. Department Assignment

## 5.1. Multi-Department Workflow

Satu Work Order dapat melibatkan:

- Satu departemen.
- Dua departemen.
- Tiga departemen.
- Seluruh departemen.

Tidak semua kategori pekerjaan wajib melibatkan kelima departemen.

Admin dapat menentukan departemen yang wajib, opsional, atau tidak diperlukan berdasarkan kategori Work Order.

## 5.2. Department Requirement

Setiap kategori WO memiliki konfigurasi:

| Requirement | Description |
|---|---|
| REQUIRED | Departemen wajib terlibat |
| OPTIONAL | Departemen dapat dilibatkan |
| NOT APPLICABLE | Departemen tidak diperlukan |

Contoh konfigurasi awal:

| Work Order Category | INF | TEK | KOM | OPS | FIN |
|---|---|---|---|---|---|
| Pemasangan Baru | Required | Required | Required | Required | Optional |
| Trial | Required | Required | Required | Optional | Optional |
| Upgrade | Optional | Required | Required | Optional | Optional |
| Downgrade | Optional | Required | Required | Optional | Optional |
| Dismantle | Required | Required | Required | Required | Optional |
| Isolir | Optional | Required | Required | Optional | Optional |
| BOD | Optional | Required | Required | Optional | Optional |
| Re-Aktivasi | Optional | Required | Required | Optional | Optional |

Tabel di atas merupakan konfigurasi awal yang dapat disesuaikan administrator berdasarkan SOP perusahaan. Sistem tidak boleh menganggapnya sebagai aturan permanen.

## 5.3. Department Assignment Rules

Ketika Work Order dibuat:

1. Sistem membaca kategori WO.
2. Sistem mengambil konfigurasi departemen.
3. Sistem menampilkan departemen yang Required dan Optional.
4. User dapat memilih departemen yang diizinkan.
5. Sistem membuat relasi WO dengan departemen.
6. Sistem dapat membuat task berdasarkan template departemen.
7. Setiap departemen mendapatkan notifikasi.

Departemen dengan status NOT APPLICABLE tidak dapat ditambahkan kecuali administrator mengubah konfigurasi atau memberikan override yang tercatat.

## 5.4. Workflow Dependencies

Task dapat berjalan:

- Sequential: task berikutnya menunggu task sebelumnya.
- Parallel: beberapa task berjalan bersamaan.
- Independent: task tidak memiliki ketergantungan.

Contoh:

INF → TEK → OPS

Sementara KOM dan FIN dapat menjalankan task secara paralel apabila tidak ada ketergantungan khusus.

Dependency harus dapat diatur per Work Order maupun melalui template kategori.

---

# 6. Task Management

## 6.1. Konsep Task

Task merupakan pekerjaan individual yang menjadi tanggung jawab user atau departemen tertentu.

Setiap task harus terhubung dengan Work Order, kecuali sistem mengizinkan task mandiri melalui fitur terpisah.

Satu Work Order dapat memiliki banyak task dalam satu departemen.

## 6.2. Task Information

| Field | Description |
|---|---|
| task_id | ID task |
| task_number | Nomor task |
| work_order_id | Relasi Work Order |
| department_id | Departemen |
| title | Judul task |
| description | Deskripsi |
| assigned_to | User penanggung jawab |
| assigned_by | User pemberi tugas |
| priority | Prioritas |
| status | Status task |
| start_date | Tanggal mulai |
| due_date | Deadline |
| completed_at | Waktu selesai |
| created_at | Waktu dibuat |
| updated_at | Waktu diperbarui |

## 6.3. Task Status

| Status | Description |
|---|---|
| TODO | Belum dikerjakan |
| PROGRESS | Sedang dikerjakan |
| REVIEW | Menunggu pemeriksaan |
| DONE | Selesai |
| BLOCKED | Terhambat |
| CANCELLED | Dibatalkan |

Status BLOCKED wajib memiliki alasan atau keterangan kendala.

## 6.4. Task Priority

- LOW
- NORMAL
- HIGH
- URGENT

Prioritas ditampilkan secara konsisten pada task list, task board, dan halaman detail.

## 6.5. Task Detail

Setiap task memiliki halaman atau detail panel yang memuat:

- Task title.
- Description.
- Work Order reference.
- Department.
- Assignee.
- Priority.
- Status.
- Start date.
- Due date.
- Checklist.
- Dependencies.
- Evidence.
- Comments.
- Activity history.

## 6.6. Task Checklist

Task dapat memiliki checklist yang harus diselesaikan sebelum task ditandai DONE.

Fitur:

- Tambah checklist.
- Edit checklist.
- Hapus checklist.
- Tandai selesai.
- Urutkan checklist.
- Tentukan checklist wajib.

Jika terdapat checklist wajib yang belum selesai, sistem dapat menolak penyelesaian task.

## 6.7. Task Dependencies

Task dapat memiliki ketergantungan dengan task lain.

Contoh:

- Task konfigurasi tidak dapat dimulai sebelum instalasi selesai.
- Task serah terima tidak dapat dilakukan sebelum validasi operasional selesai.

Sistem harus mencegah dependency yang membentuk circular loop.

## 6.8. Task Review

Departemen dapat mengatur apakah task memerlukan review.

Alur:

1. Assignee menyelesaikan task.
2. Assignee mengirim task untuk review.
3. Reviewer memeriksa hasil pekerjaan.
4. Reviewer menyetujui atau mengembalikan task.
5. Jika dikembalikan, task kembali ke PROGRESS dengan catatan revisi.

---

# 7. Task Board

## 7.1. Global Task Board

Global Task Board menampilkan seluruh task dari semua departemen.

Fungsi:

- Kanban board.
- List view.
- Filter departemen.
- Filter Work Order.
- Filter assignee.
- Filter status.
- Filter priority.
- Filter due date.
- Search task.

Kolom Kanban:

- TODO
- PROGRESS
- REVIEW
- DONE
- BLOCKED

Task CANCELLED dapat ditampilkan melalui filter atau tampilan khusus.

## 7.2. Department Task Board

Setiap departemen memiliki board masing-masing:

- INF Board.
- TEK Board.
- KOM Board.
- OPS Board.
- FIN Board.

Board hanya menampilkan task dari departemen terkait sesuai permission user.

## 7.3. My Tasks

My Tasks menampilkan seluruh pekerjaan yang ditugaskan kepada user.

Fitur:

- Assigned to me.
- Created by me.
- Due today.
- Overdue.
- Upcoming.
- Completed.
- Blocked.

## 7.4. Board Interaction

Task dapat dipindahkan antar-kolom dengan drag and drop.

Aturan:

- Perubahan status harus divalidasi server.
- User tidak dapat melewati aturan dependency.
- Task yang membutuhkan review tidak boleh langsung menjadi DONE tanpa persetujuan.
- Semua perubahan dicatat dalam activity history.
- Perubahan harus memperbarui progress Work Order.

---

# 8. Evidence & Documents

## 8.1. Task Evidence

Setiap task dapat memiliki lampiran evidence.

Jenis file yang dapat didukung:

- JPG
- JPEG
- PNG
- PDF
- DOCX
- XLSX
- ZIP

Batas ukuran file harus dapat dikonfigurasi.

Setiap evidence memiliki:

- File name.
- File type.
- File size.
- Uploaded by.
- Uploaded at.
- Description.
- Related task.
- Related Work Order.

## 8.2. Evidence Requirements

Departemen dapat menentukan evidence wajib untuk jenis task tertentu.

Contoh:

| Department | Evidence |
|---|---|
| INF | Foto instalasi, dokumentasi jalur kabel |
| TEK | Hasil konfigurasi, hasil pengujian |
| KOM | Quotation, PO, dokumen persetujuan |
| OPS | Berita acara, laporan operasional |
| FIN | Dokumen billing, bukti verifikasi |

Contoh tersebut merupakan referensi konfigurasi. Evidence yang diwajibkan harus mengikuti SOP perusahaan.

## 8.3. Document Management

Dokumen Work Order dapat dikelompokkan menjadi:

- Commercial Documents.
- Technical Documents.
- Installation Documents.
- Operational Documents.
- Financial Documents.
- Other Documents.

Dokumen harus terhubung dengan Work Order dan dapat memiliki relasi ke task tertentu.

Integrasikan dengan modul Documents Kullo jika tersedia. Jangan membuat sistem file terpisah yang menduplikasi fungsi penyimpanan utama.

---

# 9. Work Order Document Generator

## 9.1. Tujuan

Menggantikan kebutuhan pembuatan dokumen manual melalui kolom Text WO pada spreadsheet.

Sistem dapat menghasilkan dokumen Work Order berdasarkan data yang tersimpan.

## 9.2. Fitur

- Generate Work Order.
- Template dokumen.
- Preview.
- Print.
- Export PDF.
- Download.
- Version history.

## 9.3. Template Data

Template dapat menggunakan:

- Nomor WO.
- Tanggal.
- Site.
- Client.
- CID.
- SID.
- Service name.
- Service type.
- Capacity.
- Installation address.
- PIC.
- Contact number.
- Category.
- Vendor.
- Active date.
- Description.
- Department assignments.

## 9.4. Document Rules

- Template dapat diubah oleh administrator.
- Dokumen yang sudah diterbitkan harus memiliki versi.
- Perubahan data Work Order tidak boleh mengubah dokumen historis yang sudah diterbitkan.
- Dokumen dapat diterbitkan ulang sebagai versi baru.

---

# 10. Master Data

## 10.1. Service Database

Master data produk dan layanan.

Field:

- Product ID.
- Service ID.
- Service name.
- Service type.
- Description.
- Capacity.
- Unit.
- Default configuration.
- Status.

## 10.2. Site Database

Field:

- Site ID.
- Site name.
- Address.
- City.
- Region.
- Coordinates (optional).
- Contact person.
- Contact number.
- Status.

## 10.3. Vendor Database

Field:

- Vendor ID.
- Vendor code.
- Vendor name.
- Vendor address.
- Vendor site.
- Contact person.
- Phone.
- Email.
- Status.

## 10.4. Client Database

Jika modul CRM/Contacts Kullo tersedia, Work Management harus menggunakan database tersebut sebagai sumber utama.

Data minimal:

- Client ID.
- Client name.
- CID.
- SID.
- Contact person.
- Phone.
- Email.
- Address.

Jangan membuat data client ganda jika sudah tersedia pada modul CRM.

---

# 11. Progress & Completion Rules

## 11.1. Task Progress

Progress task dihitung berdasarkan checklist atau aturan penyelesaian task yang ditentukan.

## 11.2. Department Progress

Progress departemen dihitung dari seluruh task yang terhubung dengan Work Order dan departemen tersebut.

Rumus dasar:

`Department Progress = (Completed Mandatory Tasks / Total Mandatory Tasks) × 100%`

Jika tidak ada task wajib, sistem dapat menampilkan status Not Required atau mengikuti konfigurasi yang ditentukan.

## 11.3. Work Order Progress

Progress WO dihitung dari task wajib yang harus diselesaikan.

`WO Progress = (Completed Mandatory Tasks / Total Mandatory Tasks) × 100%`

Task opsional dapat ditampilkan sebagai progres tambahan, tetapi tidak boleh mengubah persyaratan penyelesaian wajib secara diam-diam.

## 11.4. Work Order Completion

Work Order hanya dapat berubah menjadi DONE apabila:

1. Seluruh task wajib telah selesai.
2. Seluruh checklist wajib telah selesai.
3. Evidence wajib sudah tersedia.
4. Seluruh review wajib telah disetujui.
5. Tidak ada task wajib yang berstatus BLOCKED.
6. Persyaratan approval terpenuhi.
7. Departemen wajib telah menyelesaikan kewajibannya.

Administrator dapat melakukan override hanya jika memiliki permission khusus dan wajib memberikan alasan. Override harus tercatat dalam audit log.

---

# 12. Notifications & Automation

## 12.1. Notification Events

Sistem dapat mengirim notifikasi ketika:

- Work Order dibuat.
- Work Order diperbarui.
- Work Order diberikan ke departemen.
- Task dibuat.
- Task ditugaskan.
- Task berubah status.
- Task mendekati deadline.
- Task overdue.
- Task BLOCKED.
- Task dikirim untuk review.
- Task disetujui.
- Task dikembalikan.
- Evidence ditambahkan.
- Work Order selesai.

## 12.2. Notification Channels

Mengikuti sistem notifikasi utama Kullo:

- In-app notification.
- Email notification jika tersedia.
- Push notification jika tersedia.

## 12.3. Automation Rules

Admin dapat mengatur automation:

- Auto-create task berdasarkan kategori WO.
- Auto-assign task berdasarkan departemen.
- Auto-notify department manager.
- Reminder sebelum deadline.
- Escalation ketika task overdue.
- Auto-update WO status.
- Auto-generate document setelah kondisi tertentu terpenuhi.

Automation harus memiliki konfigurasi aktif/nonaktif dan histori eksekusi.

---

# 13. Reports & Analytics

## 13.1. Overview Dashboard

Menampilkan:

- Total Work Orders.
- Open Work Orders.
- Work Orders in Progress.
- Completed Work Orders.
- Overdue Work Orders.
- Total Tasks.
- Completed Tasks.
- Blocked Tasks.
- Average Completion Time.
- Department Performance.

## 13.2. Work Order Reports

Filter:

- Date range.
- Category.
- Client.
- Site.
- Vendor.
- Department.
- Status.
- Priority.

## 13.3. Department Reports

Laporan untuk INF, TEK, KOM, OPS, FIN, serta departemen tambahan yang dibuat administrator.

Informasi:

- Total task.
- Completed task.
- In-progress task.
- Overdue task.
- Blocked task.
- Average completion time.
- Task completion rate.
- Workload per member.

## 13.4. User Performance

Menampilkan:

- Assigned tasks.
- Completed tasks.
- Overdue tasks.
- Average task duration.
- Workload.
- Completion rate.

Metrik kinerja harus mempertimbangkan kompleksitas pekerjaan dan distribusi beban kerja. Jumlah task selesai saja tidak cukup untuk menilai performa individu.

## 13.5. Export Reports

Format:

- PDF.
- XLSX.

CSV dapat menjadi opsi tambahan jika dibutuhkan.

---

# 14. User Roles & Permissions

## 14.1. Role Structure

Role mengikuti sistem user management Kullo jika sudah tersedia.

Role yang dapat digunakan:

| Role | Access |
|---|---|
| Super Admin | Seluruh workspace dan konfigurasi sistem |
| Workspace Admin | Pengaturan Work Management |
| Manager | Monitoring dan pengelolaan pekerjaan |
| Department Manager | Pengelolaan departemen |
| Staff | Task yang diberikan dan akses sesuai permission |
| Reviewer | Review dan approval task |
| Viewer | Melihat data yang diizinkan |

Role tidak boleh menjadi satu-satunya dasar otorisasi. Permission harus dapat dikontrol secara granular.

## 14.2. Permission Matrix

| Permission | Admin | Manager | Dept. Manager | Staff | Viewer |
|---|---|---|---|---|---|
| View Work Orders | ✓ | ✓ | ✓ | ✓* | ✓* |
| Create Work Orders | ✓ | ✓ | ✓* | — | — |
| Edit Work Orders | ✓ | ✓ | ✓* | — | — |
| Delete Work Orders | ✓ | — | — | — | — |
| Assign Departments | ✓ | ✓ | ✓* | — | — |
| Create Tasks | ✓ | ✓ | ✓ | ✓* | — |
| Assign Tasks | ✓ | ✓ | ✓ | — | — |
| Update Assigned Tasks | ✓ | ✓ | ✓ | ✓ | — |
| Review Tasks | ✓ | ✓ | ✓* | — | — |
| Manage Departments | ✓ | — | — | — | — |
| Manage Master Data | ✓ | ✓* | — | — | — |
| View Reports | ✓ | ✓ | ✓* | — | ✓* |
| Export Reports | ✓ | ✓ | ✓* | — | — |

Keterangan:

- `✓*` bergantung pada permission dan cakupan akses.
- Department Manager hanya mengelola departemen yang menjadi tanggung jawabnya.
- Staff hanya dapat mengubah task sesuai assignment dan permission.
- Viewer hanya dapat melihat data yang diizinkan.

## 14.3. Data Access Restrictions

- Financial documents hanya dapat diakses user dengan permission terkait.
- Technical configuration hanya dapat diakses user yang berwenang.
- User tidak boleh mengakses task lintas departemen tanpa permission.
- Semua akses dan perubahan sensitif harus tercatat.
- Data workspace harus terisolasi.

---

# 15. Database Architecture

Database harus menggunakan relasi terstruktur dan menghindari penyimpanan seluruh data dalam satu tabel besar.

Nama tabel berikut merupakan rancangan logis dan dapat disesuaikan dengan standar penamaan database Kullo.

## 15.1. Core Tables

### work_orders

Menyimpan informasi utama Work Order.

Field utama:

- id
- workspace_id
- wo_number
- title
- category_id
- description
- client_id
- site_id
- vendor_id
- priority
- status
- created_by
- assigned_manager
- start_date
- due_date
- completed_at
- created_at
- updated_at

### work_order_categories

Menyimpan kategori Work Order.

- id
- workspace_id
- name
- code
- description
- is_active
- created_at
- updated_at

### work_order_services

Menyimpan layanan terkait Work Order.

- id
- work_order_id
- product_id
- service_id
- service_name
- service_type
- capacity
- active_date
- created_at

### work_order_documents

Menyimpan dokumen Work Order.

- id
- work_order_id
- task_id (nullable)
- document_type
- file_name
- file_path
- file_size
- uploaded_by
- created_at

### work_order_departments

Relasi Work Order dengan departemen.

- id
- work_order_id
- department_id
- requirement_type
- status
- assigned_manager
- assigned_at
- completed_at

### work_order_network_configs

Menyimpan konfigurasi jaringan atau informasi teknis khusus.

- id
- work_order_id
- config_type
- config_data
- created_by
- created_at
- updated_at

Akses tabel ini harus dibatasi menggunakan permission teknis.

## 15.2. Department Tables

### departments

- id
- workspace_id
- code
- name
- description
- department_type
- manager_id
- is_active
- created_at
- updated_at

### department_members

- id
- department_id
- user_id
- role
- joined_at

### department_category_requirements

- id
- category_id
- department_id
- requirement_type
- created_at
- updated_at

### department_task_templates

- id
- department_id
- category_id
- title
- description
- priority
- is_required
- requires_review
- requires_evidence
- is_active
- created_at
- updated_at

### department_task_template_checklists

- id
- template_id
- title
- is_required
- sort_order

## 15.3. Task Tables

### tasks

- id
- workspace_id
- work_order_id
- department_id
- task_number
- title
- description
- assigned_to
- assigned_by
- priority
- status
- is_mandatory
- start_date
- due_date
- completed_at
- created_at
- updated_at

### task_checklists

- id
- task_id
- title
- is_completed
- is_required
- completed_by
- completed_at
- sort_order

### task_dependencies

- id
- task_id
- depends_on_task_id
- dependency_type
- created_at

### task_evidence

- id
- task_id
- file_name
- file_path
- file_type
- file_size
- description
- uploaded_by
- created_at

### task_comments

- id
- task_id
- user_id
- comment
- created_at
- updated_at

### task_reviews

- id
- task_id
- reviewer_id
- status
- review_note
- reviewed_at
- created_at

## 15.4. Master Data Tables

### products_services

- id
- workspace_id
- product_id
- service_id
- name
- type
- description
- capacity
- unit
- is_active
- created_at
- updated_at

### sites

- id
- workspace_id
- site_id
- name
- address
- city
- region
- latitude
- longitude
- contact_person
- contact_number
- is_active
- created_at
- updated_at

### vendors

- id
- workspace_id
- vendor_code
- name
- address
- site
- contact_person
- phone
- email
- is_active
- created_at
- updated_at

## 15.5. History & Configuration Tables

### work_order_histories

- id
- work_order_id
- user_id
- action
- old_value
- new_value
- description
- created_at

### work_activity_logs

- id
- workspace_id
- user_id
- entity_type
- entity_id
- action
- metadata
- ip_address
- created_at

### work_management_settings

- id
- workspace_id
- is_enabled
- configuration
- created_at
- updated_at

### work_order_document_templates

- id
- workspace_id
- name
- template_content
- version
- is_active
- created_at
- updated_at

### work_order_document_versions

- id
- work_order_id
- template_id
- version
- file_path
- generated_by
- generated_at

## 15.6. Database Rules

- Gunakan foreign key untuk relasi yang sesuai.
- Gunakan index untuk pencarian WO, task, client, site, dan status.
- Nomor WO harus unik dalam workspace sesuai aturan penomoran.
- Nomor task harus unik sesuai cakupan yang ditentukan.
- Gunakan transaction untuk proses multi-tabel.
- Hindari hard delete untuk data historis.
- Gunakan soft delete jika penghapusan logis dibutuhkan.
- Simpan waktu secara konsisten dan tampilkan berdasarkan timezone workspace.
- Gunakan JSON hanya untuk konfigurasi yang memang fleksibel, bukan untuk menggantikan relasi utama.
- Semua tabel data bisnis harus memiliki workspace scope.
- Terapkan validasi akses pada backend, bukan hanya menyembunyikan menu frontend.

---

# 16. Import & Migration

## 16.1. Excel Import

Sistem harus mendukung import dari file Excel yang memiliki struktur seperti:

- WORK ORDER
- INF
- KOM
- TEK
- DATA

Data dari spreadsheet harus dipetakan ke struktur database Kullo.

Departemen OPS dan FIN dapat langsung menggunakan struktur task yang sama dengan departemen lainnya.

## 16.2. Import Workflow

1. Upload file XLSX.
2. Pilih worksheet.
3. Sistem membaca header.
4. Sistem menampilkan preview.
5. Sistem memetakan kolom.
6. Sistem memvalidasi data.
7. Sistem menampilkan error dan warning.
8. User melakukan konfirmasi import.
9. Sistem menjalankan import.
10. Sistem menampilkan ringkasan hasil.

## 16.3. Data Validation

Validasi meliputi:

- Nomor WO duplikat.
- Task tanpa WO.
- Client tidak ditemukan.
- Department tidak ditemukan.
- Status tidak valid.
- Tanggal tidak valid.
- File atau link evidence tidak valid.
- Data wajib kosong.

## 16.4. Migration Rules

- Jangan menghapus data sumber.
- Data historis harus tetap dapat ditelusuri.
- Data yang tidak lengkap harus ditandai.
- Jangan mengarang nilai yang hilang.
- Data yang gagal diimpor harus tersedia dalam laporan error.
- Import ulang harus memiliki mekanisme deteksi duplikasi.
- Simpan import batch ID untuk audit.

---

# 17. User Interface & Experience

## 17.1. Design Direction

Work Management harus mengikuti design system utama Kullo.

Karakteristik:

- Professional.
- Clean.
- Structured.
- Minimal.
- Enterprise-ready.
- Consistent.
- Responsive.

Gunakan komponen UI yang sama dengan modul lain di Kullo.

Jangan membuat design system terpisah khusus Work Management.

## 17.2. Overview Layout

Komponen:

- Page title.
- Date range filter.
- Work Order summary cards.
- Task summary cards.
- Department performance.
- Recent Work Orders.
- Recent activities.
- Upcoming deadlines.

## 17.3. Work Order List

Kolom utama:

- WO Number.
- Client.
- Category.
- Site.
- Department.
- Priority.
- Status.
- Progress.
- Due Date.
- Actions.

Fitur:

- Search.
- Filter.
- Sorting.
- Pagination.
- Column visibility.
- Export.
- Bulk actions sesuai permission.

## 17.4. Task Board

- Kanban.
- List view.
- Department filter.
- Assignee filter.
- Priority indicator.
- Due date indicator.
- Drag and drop.
- Quick edit.
- Task detail drawer.

## 17.5. Responsive Design

Desktop:

- Sidebar utama Kullo.
- Table dan board yang luas.
- Detail panel.

Tablet:

- Navigasi adaptif.
- Board dapat digeser horizontal.
- Table mendukung horizontal scroll.

Mobile:

- Navigasi mobile Kullo.
- Work Order dalam bentuk card/list.
- Task dalam bentuk card.
- Filter melalui drawer.
- Task detail dalam full-screen panel.
- Tombol aksi mudah dijangkau.
- Form input tidak terlalu padat.

---

# 18. API & Backend Requirements

API mengikuti standar arsitektur backend Kullo.

Contoh endpoint logis:

## Work Orders

- GET `/api/work-orders`
- POST `/api/work-orders`
- GET `/api/work-orders/{id}`
- PUT `/api/work-orders/{id}`
- DELETE `/api/work-orders/{id}`

## Departments

- GET `/api/departments`
- POST `/api/departments`
- GET `/api/departments/{id}`
- PUT `/api/departments/{id}`
- DELETE `/api/departments/{id}`

## Tasks

- GET `/api/tasks`
- POST `/api/tasks`
- GET `/api/tasks/{id}`
- PUT `/api/tasks/{id}`
- PATCH `/api/tasks/{id}/status`
- POST `/api/tasks/{id}/assign`
- POST `/api/tasks/{id}/review`

## Evidence

- POST `/api/tasks/{id}/evidence`
- GET `/api/tasks/{id}/evidence`
- DELETE `/api/evidence/{id}`

## Reports

- GET `/api/work-reports/overview`
- GET `/api/work-reports/departments`
- GET `/api/work-reports/work-orders`
- GET `/api/work-reports/tasks`

## Import

- POST `/api/work-import/upload`
- POST `/api/work-import/preview`
- POST `/api/work-import/execute`
- GET `/api/work-import/{id}/result`

Endpoint di atas merupakan rancangan kontrak awal. Implementasi final harus mengikuti pola routing, response, authentication, dan error handling yang digunakan Kullo.

## 18.1. Backend Validation

Semua aturan bisnis harus divalidasi di backend, termasuk:

- Permission.
- Workspace access.
- Department access.
- Task assignment.
- Status transition.
- Dependency.
- Evidence requirements.
- Review requirements.
- Work Order completion.

Frontend tidak boleh menjadi satu-satunya lapisan pengamanan.

---

# 19. Security & Audit

## 19.1. Security

- Workspace isolation.
- Role-based access control.
- Granular permission.
- Secure file upload.
- File type validation.
- File size validation.
- Server-side validation.
- Protection against unauthorized access.
- Secure document access.
- Sensitive data restrictions.

## 19.2. Audit Trail

Aktivitas yang harus dicatat:

- Create Work Order.
- Update Work Order.
- Change Work Order status.
- Assign department.
- Create task.
- Assign task.
- Change task status.
- Upload evidence.
- Delete attachment.
- Review task.
- Approve task.
- Cancel task.
- Complete Work Order.
- Administrative override.
- Import data.
- Change department configuration.

Riwayat audit tidak boleh dapat diubah oleh user biasa.

---

# 20. Business Rules Summary

1. Work Order menjadi pusat seluruh pekerjaan.
2. Setiap task harus terhubung dengan departemen.
3. Satu Work Order dapat memiliki banyak departemen.
4. Satu departemen dapat memiliki banyak task dalam satu Work Order.
5. Lima departemen awal adalah INF, TEK, KOM, OPS, dan FIN.
6. Departemen harus bersifat dinamis.
7. User dapat menjadi anggota beberapa departemen.
8. Setiap departemen memiliki task board sendiri.
9. Global board menampilkan task lintas departemen sesuai permission.
10. Task wajib harus selesai sebelum WO dapat dinyatakan DONE.
11. Task yang memerlukan review harus disetujui sebelum selesai.
12. Evidence wajib harus tersedia sebelum task diselesaikan.
13. Dependency harus dipenuhi sebelum task dapat dimulai atau diselesaikan sesuai konfigurasi.
14. Semua perubahan status dicatat.
15. Dokumen historis harus mempertahankan versi.
16. Modul dapat dinonaktifkan tanpa menghapus data.
17. Data client, user, dan workspace harus menggunakan sumber utama Kullo jika tersedia.
18. Semua akses harus mengikuti workspace dan permission.
19. Import data harus memiliki validasi dan audit.
20. Penambahan departemen baru tidak boleh membutuhkan perubahan source code.

---

# 21. Development Roadmap

## Phase 1 — Foundation

- Module settings.
- Department management.
- Permission system.
- Database structure.
- Master data.
- Basic navigation.

## Phase 2 — Work Order

- Work Order CRUD.
- Work Order categories.
- Client and vendor integration.
- Department assignment.
- Work Order detail.
- Work Order history.

## Phase 3 — Task Management

- Task CRUD.
- Department task templates.
- Task checklist.
- Task dependencies.
- Task assignment.
- Task comments.
- Task evidence.
- Task review.

## Phase 4 — Board & Workflow

- Global task board.
- Department task board.
- My Tasks.
- Drag and drop.
- Status automation.
- Completion validation.
- Notifications.

## Phase 5 — Documents & Reports

- Document management.
- Work Order document generator.
- PDF export.
- XLSX export.
- Dashboard analytics.
- Department reports.
- User workload reports.

## Phase 6 — Migration & Optimization

- Excel import.
- Data mapping.
- Import validation.
- Migration report.
- Performance optimization.
- Security testing.
- User acceptance testing.

---

# 22. Acceptance Criteria

Work Management dapat dinyatakan siap digunakan apabila:

### Module

- [ ] Modul dapat diaktifkan dan dinonaktifkan.
- [ ] Data tidak hilang ketika modul dinonaktifkan.
- [ ] Menu mengikuti permission user.

### Department

- [ ] INF, TEK, KOM, OPS, FIN tersedia sebagai departemen awal.
- [ ] Admin dapat menambah departemen.
- [ ] Admin dapat mengubah departemen.
- [ ] Admin dapat menonaktifkan departemen.
- [ ] Histori departemen tetap tersedia.
- [ ] User dapat menjadi anggota beberapa departemen.

### Work Order

- [ ] User dapat membuat Work Order.
- [ ] User dapat mengubah Work Order sesuai permission.
- [ ] WO dapat melibatkan beberapa departemen.
- [ ] WO memiliki histori.
- [ ] WO dapat memiliki dokumen.
- [ ] WO memiliki progress otomatis.
- [ ] WO tidak dapat selesai sebelum persyaratan wajib terpenuhi.

### Task

- [ ] User dapat membuat task.
- [ ] Task dapat ditugaskan ke user.
- [ ] Task memiliki status dan prioritas.
- [ ] Task memiliki checklist.
- [ ] Task dapat memiliki dependency.
- [ ] Task dapat memiliki evidence.
- [ ] Task dapat melalui review.
- [ ] Semua perubahan tercatat.

### Board

- [ ] Global board berjalan.
- [ ] Department board berjalan.
- [ ] My Tasks berjalan.
- [ ] Filter dan search berjalan.
- [ ] Drag and drop tervalidasi di backend.

### Reports

- [ ] Dashboard menampilkan data aktual.
- [ ] Laporan seluruh departemen tersedia.
- [ ] Laporan dapat difilter.
- [ ] Export PDF berjalan.
- [ ] Export XLSX berjalan.

### Migration

- [ ] File XLSX dapat diunggah.
- [ ] Preview import tersedia.
- [ ] Validasi data berjalan.
- [ ] Duplikasi dapat dideteksi.
- [ ] Hasil import dapat diperiksa.

### Security

- [ ] Workspace isolation berjalan.
- [ ] Permission divalidasi backend.
- [ ] File upload tervalidasi.
- [ ] Dokumen sensitif dibatasi.
- [ ] Audit trail tersedia.

---

# 23. Final Product Direction

Work Management harus menjadi sistem operasional terintegrasi di dalam Kullo, bukan hanya aplikasi pencatatan Work Order.

Arsitektur produk berpusat pada tiga entitas utama:

**WORK ORDER → DEPARTMENT → TASK**

- Work Order menjelaskan pekerjaan yang harus dilakukan.
- Department menjelaskan unit yang bertanggung jawab.
- Task menjelaskan aktivitas spesifik yang harus diselesaikan.

INF, TEK, KOM, OPS, dan FIN merupakan departemen awal, bukan batas akhir sistem.

Kullo harus mampu menyesuaikan workflow berdasarkan kebutuhan organisasi, kategori pekerjaan, tanggung jawab departemen, dan aturan operasional perusahaan.

**Target akhirnya:** seluruh pekerjaan dapat dibuat, ditugaskan, dipantau, didokumentasikan, divalidasi, dan dilaporkan melalui satu sistem yang terintegrasi.