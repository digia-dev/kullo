# DRIVE.md
# KULLO — Document Management & Cloud Drive

**Module:** Kullo Drive  
**Navigation:** Dokumen  
**Design Reference:** Microsoft OneDrive, SharePoint, Microsoft 365  
**Design System:** Microsoft Fluent 2  
**Product Type:** Collaborative Cloud Document Management  
**Platform:** Web Application + Responsive Mobile

---

# 1. OVERVIEW

## 1.1 Introduction

Kullo Drive adalah modul manajemen dokumen dan penyimpanan file terintegrasi di dalam platform Kullo.

Modul ini mengadopsi konsep dan pengalaman penggunaan Microsoft OneDrive, dengan kemampuan tambahan untuk menghubungkan dokumen dengan workspace, proyek, task, tim, dan aktivitas operasional Kullo.

Kullo Drive harus terasa seperti cloud storage modern yang profesional, intuitif, cepat, dan mudah digunakan.

Pengguna dapat:
- Menyimpan dan mengelola file.
- Membuat folder dan subfolder.
- Mengunggah berbagai jenis file.
- Melihat preview dokumen secara langsung.
- Berbagi file dengan anggota tim.
- Mengatur permission dan akses dokumen.
- Mengelola dokumen berdasarkan proyek.
- Mencari file dengan cepat.
- Melihat aktivitas dan riwayat perubahan.
- Mengakses dokumen dari berbagai perangkat.

## 1.2 Product Philosophy

Kullo Drive bukan sekadar tempat menyimpan file.

Prinsip utama:

1. **Everything in One Place** — seluruh dokumen kerja tersimpan secara terorganisasi.
2. **Simple File Management** — pengelolaan file harus intuitif seperti OneDrive.
3. **Team Collaboration** — dokumen dapat diakses dan dikelola bersama.
4. **Contextual Documents** — file dapat terhubung dengan proyek, task, dan workspace.
5. **Secure by Default** — setiap dokumen memiliki pengaturan akses yang jelas.

---

# 2. MAIN NAVIGATION

Menu Dokumen berada pada sidebar utama Kullo.

Struktur navigasi:

```text
KULLO
│
├── Home
├── My Work
├── Tasks
├── Projects
├── Chat
├── Calendar
├── Documents
│   ├── My Files
│   ├── Shared
│   ├── Recent
│   ├── Favorites
│   ├── Recycle Bin
│   └── Storage
│
└── Settings
```

## 2.1 Navigation Behavior

- Klik Documents membuka halaman utama Kullo Drive.
- My Files menampilkan file milik pengguna.
- Shared menampilkan dokumen yang dibagikan kepada atau oleh pengguna.
- Recent menampilkan dokumen yang baru dibuka atau diubah.
- Favorites menampilkan file dan folder favorit.
- Recycle Bin menampilkan file yang dihapus.
- Storage menampilkan penggunaan kapasitas penyimpanan.

Navigasi harus konsisten dengan Microsoft Fluent 2 dan layout utama Kullo.

---

# 3. MAIN INTERFACE DESIGN

## 3.1 Overall Layout

Gunakan pendekatan layout Microsoft OneDrive Web.

Struktur halaman:

```text
┌──────────────────────────────────────────────────────────────┐
│ KULLO HEADER                                                  │
│ Logo | Global Search | Help | Notifications | Profile        │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│ DRIVE        │ My Files                                      │
│              │                                               │
│ My Files     │ + New     Upload     Sort     View     Filter  │
│ Shared       │                                               │
│ Recent       │ All files / Documents                         │
│ Favorites    │                                               │
│ Recycle Bin  │                                               │
│              │                                               │
│              │ Name       Modified       Modified by  Size   │
│              │                                               │
│              │ 📁 Projects                                   │
│              │ 📁 Marketing                                  │
│              │ 📄 Proposal.pdf                               │
│              │ 📊 Budget.xlsx                                │
│              │ 📝 Meeting Notes.docx                          │
│              │                                               │
│              │                                               │
│              │                                               │
│              ├───────────────────────────────────────────────┤
│              │ Storage Usage                                 │
└──────────────┴───────────────────────────────────────────────┘
```

## 3.2 Header

Header mengikuti global header Kullo.

Elemen:

- Global search.
- Breadcrumb navigation.
- Notifications.
- Help.
- User profile.

Tambahkan contextual search pada halaman Drive untuk pencarian dokumen.

## 3.3 Drive Sidebar

Sidebar khusus Drive memiliki dua bagian:

**Navigation**
- My Files
- Shared
- Recent
- Favorites
- Recycle Bin

**Storage**
- Storage usage indicator.
- Used storage.
- Available storage.
- Manage storage.

Sidebar dapat di-collapse untuk memberikan ruang lebih besar pada file explorer.

---

# 4. MY FILES

## 4.1 Main File Explorer

My Files adalah halaman utama Kullo Drive.

Tampilan harus mengadopsi OneDrive File Explorer.

Komponen utama:

**A. Page Header**
- Title: My Files
- Description: Manage and organize your documents.
- Breadcrumb.
- File count.

**B. Action Toolbar**

Tombol utama:

- New
- Upload
- Sort
- View
- Filter
- Details

New membuka dropdown:

```text
+ New
  ├── Folder
  ├── Word Document
  ├── Excel Spreadsheet
  ├── PowerPoint Presentation
  └── Create Shortcut
```

Format pembuatan dokumen harus disesuaikan dengan editor yang tersedia. Jangan menampilkan fungsi pembuatan dokumen yang belum diimplementasikan.

Upload membuka pilihan:

```text
Upload
  ├── Files
  └── Folder
```

**C. File Explorer View**

Default menggunakan List View seperti OneDrive.

Kolom:

| Column | Description |
|---|---|
| Name | Nama file/folder dan icon |
| Modified | Waktu perubahan terakhir |
| Modified By | Pengguna yang mengubah |
| File Size | Ukuran file |
| Sharing | Status sharing |

Kolom dapat disesuaikan melalui View Settings.

## 4.2 File and Folder Appearance

Gunakan ikon berdasarkan jenis file.

- PDF: PDF icon.
- Word: DOCX icon.
- Excel: XLSX icon.
- PowerPoint: PPTX icon.
- Image: Thumbnail preview.
- Video: Video thumbnail.
- Audio: Audio icon.
- Archive: ZIP icon.
- Other: Generic file icon.
- Folder: Folder icon.

Gunakan warna ikon yang familiar seperti Microsoft Office, tetapi tetap harmonis dengan identitas visual Kullo.

## 4.3 View Modes

Sediakan dua pilihan tampilan:

**List View**
- Tampilan tabel.
- Cocok untuk dokumen dalam jumlah besar.
- Mendukung sorting.
- Mendukung multi-selection.

**Grid View**
- Tampilan kartu.
- Menampilkan thumbnail.
- Menampilkan nama file.
- Menampilkan modified date.
- Cocok untuk visual browsing.

Default: List View.

---

# 5. FILE OPERATIONS

Setiap file dan folder harus mendukung operasi berikut.

## 5.1 Basic Operations

- Open.
- Preview.
- Download.
- Rename.
- Move.
- Copy.
- Delete.
- Share.
- Copy Link.
- Add to Favorites.
- View Details.

## 5.2 Context Menu

Klik kanan atau klik tombol ellipsis pada file menampilkan context menu.

```text
┌──────────────────────────┐
│ Open                     │
│ Preview                  │
│ Download                 │
│ Share                    │
│ Copy Link                │
│ ──────────────────────── │
│ Rename                   │
│ Move to                  │
│ Copy to                  │
│ Add to Favorites         │
│ ──────────────────────── │
│ Details                  │
│ Delete                   │
└──────────────────────────┘
```

Context menu harus menggunakan Fluent 2 menu pattern.

## 5.3 Multi-Select

Pengguna dapat memilih beberapa file sekaligus.

Fitur:
- Checkbox selection.
- Shift + Click untuk range selection.
- Ctrl/Cmd + Click untuk multiple selection.
- Select All.
- Bulk Delete.
- Bulk Move.
- Bulk Download.
- Bulk Share jika didukung.

Saat file dipilih, tampilkan contextual action toolbar.

---

# 6. FILE PREVIEW

## 6.1 Preview Experience

Ketika pengguna mengklik file, buka preview menggunakan overlay atau dedicated viewer.

Jangan langsung memaksa pengguna mengunduh file.

Preview mendukung format:

- PDF.
- JPG / JPEG.
- PNG.
- WebP.
- SVG (dengan sanitasi).
- MP4 / WebM.
- TXT.
- DOCX, XLSX, PPTX melalui viewer yang tersedia.

Format yang belum didukung menampilkan informasi file beserta tombol Download.

## 6.2 Preview Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Back    Proposal.pdf                  Share  Download  ... │
├──────────────────────────────────────────────┬───────────────┤
│                                              │               │
│                                              │ File Details  │
│                                              │               │
│              DOCUMENT PREVIEW                │ Information   │
│                                              │               │
│                                              │ Activity      │
│                                              │               │
│                                              │ Sharing       │
└──────────────────────────────────────────────┴───────────────┘
```

Fitur:
- Zoom In / Zoom Out.
- Fullscreen.
- Download.
- Print.
- Previous / Next file.
- Open details panel.

## 6.3 Details Panel

Menampilkan:
- File name.
- File type.
- File size.
- Created date.
- Modified date.
- Created by.
- Modified by.
- Location.
- Sharing permissions.
- Activity history.

---

# 7. SHARING & PERMISSIONS

Sharing adalah salah satu fitur utama Kullo Drive.

## 7.1 Share Dialog

Ketika pengguna memilih Share, tampilkan modal seperti Microsoft OneDrive.

Komponen:

**Share [File Name]**

Input:
- Add people or groups.
- Email or member search.

Permission options:

- Can View.
- Can Edit.

Additional options:
- Allow download (where supported).
- Set expiration date for external links.
- Password protection for external links (where supported).

Action:
- Send.
- Copy Link.

## 7.2 Sharing Types

**A. Internal Sharing**

Berbagi dokumen dengan:
- Individual members.
- Teams.
- Projects.
- Workspace members.

**B. Link Sharing**

Jenis akses:

- Specific people.
- Organization members.
- Anyone with the link (only if enabled by workspace administrator).

Default permission harus Private atau restricted access.

## 7.3 Permission Management

Setiap dokumen memiliki permission:

| Role | Permission |
|---|---|
| Owner | Full control |
| Editor | View, edit, rename, organize |
| Viewer | View and download according to policy |
| Workspace Admin | Administrative access |

Permission harus dapat diubah dan dicabut oleh pemilik atau administrator yang berwenang.

---

# 8. SHARED

Halaman Shared menampilkan dokumen yang memiliki relasi sharing.

Bagi menjadi dua tab:

**Shared With Me**
- File yang dibagikan oleh orang lain.
- Nama pemilik.
- Tanggal dibagikan.
- Permission.
- Lokasi file.

**Shared By Me**
- File yang dibagikan pengguna.
- Daftar penerima.
- Permission.
- Tanggal sharing.
- Manage Access.

Tampilan menggunakan tabel seperti OneDrive.

---

# 9. RECENT

Halaman Recent menampilkan dokumen berdasarkan aktivitas terbaru.

Kategori:
- Recently Opened.
- Recently Modified.
- Recently Uploaded.

Informasi:
- File name.
- Last opened.
- Modified by.
- File location.
- File type.

Sorting:
- Most Recent.
- Oldest First.
- Name.

Recent harus berdasarkan aktivitas pengguna, bukan hanya tanggal upload.

---

# 10. FAVORITES

Pengguna dapat menandai file dan folder sebagai Favorites.

Fitur:
- Add to Favorites.
- Remove from Favorites.
- Filter berdasarkan jenis file.
- Sorting.
- Open file.
- Quick access.

Favorites bersifat personal dan tidak mengubah permission dokumen.

---

# 11. RECYCLE BIN

Dokumen yang dihapus masuk ke Recycle Bin.

Jangan langsung menghapus file secara permanen.

Fitur:
- Restore.
- Delete Permanently.
- Empty Recycle Bin.
- Select Multiple.
- View Deleted By.
- View Deleted Date.

Setiap penghapusan harus mempertahankan informasi pemilik dan lokasi sebelumnya agar file dapat dipulihkan.

Permanent deletion harus membutuhkan konfirmasi.

Aturan retention dapat diatur oleh administrator workspace.

---

# 12. SEARCH & FILTER

Kullo Drive harus mempunyai pencarian dokumen yang cepat.

## 12.1 Search

Search berdasarkan:
- File name.
- Folder name.
- File extension.
- Owner.
- Modified by.
- Project.
- Document metadata.

Jika full-text indexing tersedia, pencarian dapat mencakup isi dokumen.

## 12.2 Filters

Filter:
- File Type.
- Modified Date.
- Owner.
- Shared Status.
- Location.
- Project.

## 12.3 Sorting

Sorting:
- Name A-Z.
- Name Z-A.
- Date Modified.
- Date Created.
- File Size.
- File Type.

Search dan filter tidak boleh menampilkan dokumen yang tidak dapat diakses pengguna.

---

# 13. KULLO WORKSPACE INTEGRATION

Bagian ini menjadi pembeda utama Kullo Drive dibandingkan cloud storage biasa.

Dokumen harus terhubung dengan ekosistem Kullo.

## 13.1 Project Documents

Setiap project mempunyai ruang dokumen sendiri.

Contoh:

```text
Projects
  └── Website Redesign
      ├── Documents
      │   ├── Project Brief.pdf
      │   ├── Design Guidelines.pdf
      │   ├── Budget.xlsx
      │   └── Meeting Notes.docx
      │
      ├── Tasks
      └── Activity
```

Dokumen proyek dapat diakses melalui:
- Menu Documents.
- Halaman Project.
- Project Details.

Pastikan file yang sama tidak diduplikasi hanya karena ditampilkan di beberapa lokasi.

## 13.2 Task Attachments

Task dapat mempunyai attachment.

Contoh:

```text
Task: Create Homepage Design

Attachments:
- Homepage-Wireframe.fig
- Design-Brief.pdf
- Reference.png
```

Fitur:
- Upload attachment.
- Preview attachment.
- Download attachment.
- Open in Drive.
- Remove attachment according to permission.

## 13.3 Team Documents

Setiap team mempunyai folder khusus.

Contoh:

```text
Teams
  ├── Marketing
  │   ├── Campaigns
  │   └── Reports
  │
  ├── Design
  │   ├── Brand Assets
  │   └── Creative Files
  │
  └── Engineering
      ├── Technical Docs
      └── Documentation
```

Akses folder mengikuti membership dan permission team.

## 13.4 Workspace Files

Workspace dapat memiliki root document library yang dikelola administrator.

Struktur:

```text
Workspace
  ├── General
  ├── Company Documents
  ├── Shared Resources
  ├── Templates
  └── Archive
```

---

# 14. ACTIVITY & VERSION HISTORY

## 14.1 Activity Timeline

Setiap dokumen mempunyai aktivitas.

Contoh:

```text
Today
- Rendy uploaded Proposal.pdf
- Sarah shared Proposal.pdf
- Andi renamed Budget.xlsx

Yesterday
- Sarah modified Meeting Notes.docx
- Rendy moved Brand Assets
```

Informasi aktivitas:
- Actor.
- Action.
- Timestamp.
- Target file.
- Previous and new values when relevant.

## 14.2 Version History

Jika file diperbarui, sistem dapat mempertahankan versi sebelumnya.

Fitur:
- View Versions.
- Download Previous Version.
- Restore Version.
- Compare Versions (if supported by the document format).

Versioning harus menggunakan immutable file versions dan tidak boleh menimpa riwayat versi sebelumnya.

---

# 15. STORAGE MANAGEMENT

Halaman Storage menampilkan penggunaan penyimpanan.

Komponen:

- Total Storage.
- Used Storage.
- Available Storage.
- Storage by File Type.
- Largest Files.
- Recent Uploads.

Contoh visual:

```text
Storage Overview

[██████████░░░░░░░░░░] 52%

Used: 52 GB
Available: 48 GB
Total: 100 GB

Storage Breakdown

Documents       20 GB
Images          15 GB
Videos          12 GB
Other            5 GB
```

Angka di atas hanya contoh tampilan. Nilai aktual harus berasal dari sistem penyimpanan.

---

# 16. UPLOAD EXPERIENCE

Upload harus memiliki pengalaman seperti OneDrive.

## 16.1 Upload Methods

- Click Upload.
- Drag and Drop.
- Upload Multiple Files.
- Upload Folder.
- Paste Files where supported.

## 16.2 Upload Progress

Saat upload berlangsung, tampilkan upload manager.

Contoh:

```text
Uploading 3 files

Proposal.pdf       100%  Completed
Design.png          65%  Uploading
Budget.xlsx         20%  Uploading

[Cancel All]
```

Fitur:
- Progress per file.
- Overall progress.
- Cancel upload.
- Retry failed upload.
- Error details.
- Upload completion notification.

## 16.3 Upload Validation

Validasi:
- Maximum file size.
- Allowed file types.
- Storage quota.
- Duplicate filename.
- File integrity.
- User permissions.

Jika terjadi duplikasi nama file, berikan pilihan:
- Replace (with version preservation where supported).
- Keep Both.
- Cancel.

---

# 17. UI DESIGN SYSTEM

## 17.1 Design Direction

Gunakan kombinasi:

- Microsoft OneDrive: File management experience.
- Microsoft SharePoint: Document library and permissions.
- Microsoft Teams: Workspace integration.
- Microsoft Fluent 2: UI components and interaction patterns.
- Kullo APP.md: Brand identity and color tokens.

Jangan membuat tampilan yang terlalu dekoratif.

Prioritaskan produktivitas, keterbacaan, dan efisiensi.

## 17.2 Visual Principles

1. Clean and Minimal.
2. Enterprise Ready.
3. Consistent Spacing.
4. Clear Information Hierarchy.
5. Lightweight Interaction.
6. Familiar File Management.
7. Responsive Layout.

## 17.3 Color

Ikuti design tokens dari APP.md.

Ketentuan:
- Primary color mengikuti identitas Kullo.
- Background menggunakan neutral surface.
- Sidebar menggunakan warna surface yang konsisten.
- Selected item menggunakan subtle primary tint.
- Hover menggunakan neutral hover surface.
- Destructive actions menggunakan semantic danger color.
- File type icons boleh menggunakan warna khas format Microsoft Office.

Jangan membuat palette baru yang bertentangan dengan APP.md.

## 17.4 Typography

Gunakan typography dari global Kullo design system.

Hierarki:
- Page title.
- Section heading.
- File name.
- Metadata.
- Secondary information.

File name harus mudah dibaca, sedangkan metadata menggunakan ukuran lebih kecil dan warna sekunder.

## 17.5 Components

Komponen utama:

```text
DriveLayout
DriveSidebar
DriveHeader
DriveToolbar
DriveBreadcrumb
DriveSearch
DriveFileList
DriveFileGrid
DriveFileRow
DriveFileCard
DriveFolderCard
DriveContextMenu
DriveShareDialog
DrivePreview
DriveDetailsPanel
DriveUploadManager
DriveStorageIndicator
DriveActivityTimeline
DriveVersionHistory
DriveEmptyState
DriveLoadingState
DriveErrorState
```

Komponen harus reusable dan mengikuti global Kullo UI components.

---

# 18. INTERACTION DESIGN

## 18.1 Navigation

- Single click untuk memilih file.
- Double click untuk membuka file atau folder.
- Breadcrumb untuk kembali ke parent folder.
- Back navigation harus mempertahankan konteks sebelumnya jika memungkinkan.

## 18.2 Drag and Drop

Pengguna dapat:
- Memindahkan file antar folder.
- Memindahkan beberapa file.
- Mengunggah file melalui drag and drop.

Tampilkan visual drop target ketika pengguna melakukan drag.

Pastikan drag operation tidak berjalan ketika pengguna sedang memilih teks atau menggunakan tombol pada file row.

## 18.3 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + A | Select All |
| Ctrl/Cmd + C | Copy |
| Ctrl/Cmd + X | Cut |
| Ctrl/Cmd + V | Paste |
| Delete | Delete Selected |
| F2 | Rename |
| Escape | Close Dialog / Clear Selection |
| Enter | Open Selected Item |
| Ctrl/Cmd + Shift + N | New Folder |

Shortcut harus memperhatikan fokus input dan accessibility.

## 18.4 Feedback

Gunakan:
- Toast notification.
- Confirmation dialog.
- Loading indicator.
- Skeleton loading.
- Progress indicator.
- Inline validation.

Contoh:
- File uploaded successfully.
- Folder created.
- Document moved.
- Link copied.
- Access updated.
- File restored.

---

# 19. RESPONSIVE DESIGN

Kullo Drive harus berfungsi optimal pada desktop, tablet, dan mobile.

## 19.1 Desktop

Prioritas:
- Full sidebar.
- Table view.
- Multi-selection.
- Context menu.
- Details panel.
- Drag and drop.
- Upload manager.

## 19.2 Tablet

- Collapsible sidebar.
- Responsive file table.
- Adaptive toolbar.
- Touch-friendly selection.
- Details panel sebagai drawer.

## 19.3 Mobile

Gunakan pendekatan mobile-first Fluent 2.

Layout:

```text
┌───────────────────────────┐
│ Documents           Search│
├───────────────────────────┤
│ My Files                  │
│                           │
│ + New           Upload    │
│                           │
│ Folders                   │
│                           │
│ 📁 Projects               │
│ 📁 Marketing              │
│                           │
│ Files                     │
│                           │
│ 📄 Proposal.pdf           │
│ 📊 Budget.xlsx            │
│ 📝 Meeting Notes.docx     │
│                           │
├───────────────────────────┤
│ Home Tasks Projects Docs  │
└───────────────────────────┘
```

Mobile behavior:
- Bottom navigation mengikuti global Kullo mobile navigation.
- Sidebar diganti drawer.
- File actions menggunakan bottom sheet.
- Preview menggunakan fullscreen page.
- File list menggunakan compact list.
- Upload menggunakan native file picker.
- Touch target minimal 44px.
- Jangan memaksakan desktop table pada layar kecil.

---

# 20. TECHNICAL REQUIREMENTS

## 20.1 Architecture

Ikuti arsitektur utama Kullo.

Frontend:
- React.
- TypeScript.
- React Router.
- Existing Kullo UI component system.
- Existing API client and state management.

Backend:
- Gunakan backend dan API architecture yang sudah ditentukan dalam PRD.md.
- Jangan membuat backend terpisah khusus Drive.
- Semua operasi harus melalui API yang memiliki autentikasi dan otorisasi.

Storage:
- Gunakan storage abstraction agar provider dapat diganti.
- File metadata disimpan di PostgreSQL.
- File binary disimpan pada object storage atau storage provider yang sesuai.
- Jangan menyimpan file binary besar langsung di PostgreSQL.
- Jangan mengasumsikan local filesystem sebagai scalable cloud storage.

## 20.2 Suggested Database Entities

```text
drive_files
- id
- workspace_id
- folder_id
- owner_id
- name
- original_name
- extension
- mime_type
- file_size
- storage_key
- checksum
- created_at
- updated_at
- deleted_at

drive_folders
- id
- workspace_id
- parent_id
- owner_id
- name
- created_at
- updated_at
- deleted_at

drive_permissions
- id
- file_id
- folder_id
- principal_type
- principal_id
- permission
- granted_by
- created_at

drive_favorites
- id
- user_id
- file_id
- folder_id
- created_at

drive_versions
- id
- file_id
- version_number
- storage_key
- file_size
- checksum
- created_by
- created_at

drive_activities
- id
- workspace_id
- file_id
- actor_id
- action
- metadata
- created_at

drive_shares
- id
- file_id
- token_hash
- permission
- expires_at
- created_by
- created_at
- revoked_at
```

Entity di atas merupakan rancangan awal. Relasi, constraint, indeks, dan strategi penyimpanan harus disesuaikan dengan database schema Kullo yang sebenarnya.

## 20.3 API Structure

Contoh endpoint:

```http
GET    /api/drive/files
GET    /api/drive/files/{id}
POST   /api/drive/files/upload
PATCH  /api/drive/files/{id}
DELETE /api/drive/files/{id}

GET    /api/drive/folders
POST   /api/drive/folders
PATCH  /api/drive/folders/{id}
DELETE /api/drive/folders/{id}

POST   /api/drive/files/{id}/move
POST   /api/drive/files/{id}/copy
GET    /api/drive/files/{id}/download
GET    /api/drive/files/{id}/preview

POST   /api/drive/files/{id}/share
GET    /api/drive/files/{id}/permissions
PATCH  /api/drive/files/{id}/permissions

GET    /api/drive/shared
GET    /api/drive/recent
GET    /api/drive/favorites
GET    /api/drive/trash
POST   /api/drive/trash/{id}/restore

GET    /api/drive/files/{id}/versions
GET    /api/drive/files/{id}/activity

GET    /api/drive/storage
GET    /api/drive/search
```

Endpoint merupakan rekomendasi kontrak API, bukan asumsi bahwa endpoint tersebut sudah tersedia.

## 20.4 Security

Implementasikan:
- Authentication.
- Workspace-level authorization.
- File-level permissions.
- Secure download authorization.
- Signed URLs with expiration where applicable.
- MIME type validation.
- File extension validation.
- File size limits.
- Malware scanning integration where available.
- Rate limiting.
- CSRF protection where applicable.
- Audit logs.
- Secure share links.
- Protection against path traversal.
- Safe preview and content sanitization.

Jangan pernah mengandalkan URL file yang sulit ditebak sebagai pengganti authorization.

---

# 21. EMPTY, LOADING & ERROR STATES

Setiap halaman harus mempunyai state yang jelas.

## Empty State

My Files:

"Your workspace is ready for documents."

Description:
"Upload files or create folders to keep your work organized."

CTA:
- Upload Files.
- New Folder.

Shared:

"No shared documents yet."

Favorites:

"Your favorite files will appear here."

Recycle Bin:

"Your recycle bin is empty."

## Loading State

Gunakan skeleton untuk:
- File list.
- Folder cards.
- Details panel.
- Preview.
- Storage indicator.

## Error State

Tangani:
- Upload failed.
- Permission denied.
- File not found.
- Storage quota exceeded.
- Preview unavailable.
- Network error.
- Invalid file type.

Berikan tindakan yang relevan seperti Retry, Go Back, atau Contact Admin.

---

# 22. DEVELOPMENT PRIORITIES

Implementasi dilakukan secara bertahap.

## Phase 1 — Core Drive (MVP)

- My Files.
- Folder and subfolder.
- Upload files.
- Download files.
- Rename.
- Move.
- Copy.
- Delete.
- List View.
- Grid View.
- Breadcrumb.
- Search by filename.
- File preview for PDF and images.
- Basic permission.

## Phase 2 — Collaboration

- Shared With Me.
- Shared By Me.
- Share Dialog.
- Internal sharing.
- Permission management.
- Favorites.
- Recent.
- Activity timeline.
- Task attachments.
- Project documents.

## Phase 3 — Advanced Drive

- Version history.
- Recycle Bin retention.
- Advanced filters.
- Advanced search.
- Storage management.
- Bulk operations.
- Upload manager.
- Preview additional document formats.
- External sharing.
- Advanced workspace permissions.

## Phase 4 — Enterprise Experience

- Document approval workflow.
- Document templates.
- Audit log.
- Advanced retention policy.
- Document classification.
- Organization-wide document management.
- Advanced access controls.

Fitur yang membutuhkan layanan tambahan harus ditampilkan hanya jika backend atau integrasinya sudah tersedia.

---

# 23. ACCEPTANCE CRITERIA

Kullo Drive dianggap memenuhi standar implementasi apabila:

### Interface
- [ ] Tampilan menyerupai pengalaman OneDrive modern.
- [ ] Mengikuti Fluent 2.
- [ ] Konsisten dengan APP.md.
- [ ] Sidebar dan toolbar berfungsi.
- [ ] List dan Grid View berfungsi.
- [ ] Breadcrumb berfungsi.
- [ ] Context menu berfungsi.
- [ ] Responsive desktop, tablet, dan mobile.

### File Management
- [ ] Upload file.
- [ ] Upload folder.
- [ ] Create folder.
- [ ] Rename.
- [ ] Move.
- [ ] Copy.
- [ ] Delete.
- [ ] Download.
- [ ] Preview.
- [ ] Multi-select.
- [ ] Search dan sorting.

### Collaboration
- [ ] Share document.
- [ ] Manage permissions.
- [ ] Shared With Me.
- [ ] Shared By Me.
- [ ] Favorites.
- [ ] Recent.
- [ ] Activity history.

### Integration
- [ ] Terhubung dengan Workspace.
- [ ] Terhubung dengan Projects.
- [ ] Terhubung dengan Tasks.
- [ ] Mendukung Team Documents.
- [ ] Tidak membuat duplikasi file tanpa kebutuhan.

### Security
- [ ] Authorization diterapkan pada setiap operasi.
- [ ] File tidak dapat diakses tanpa izin.
- [ ] Sharing link dapat dicabut.
- [ ] Upload divalidasi.
- [ ] Audit log tersedia untuk aktivitas penting.

---

# 24. FINAL DESIGN DIRECTION

Kullo Drive harus terasa seperti menggunakan Microsoft OneDrive di dalam sebuah platform kerja modern.

Referensi utama:

1. **Microsoft OneDrive** — file explorer, navigation, upload, preview, sharing, context menu.
2. **Microsoft SharePoint** — document library, team permissions, metadata, version history.
3. **Microsoft Fluent 2** — typography, spacing, components, dialogs, navigation, interaction.
4. **Kullo Design System** — warna, typography, buttons, sidebar, global navigation, dan konsistensi visual.

## Important Implementation Rules

- Jangan membuat tampilan seperti file manager Windows Explorer versi lama.
- Jangan membuat tampilan seperti Google Drive.
- Jangan menggunakan dashboard cards berlebihan.
- Jangan memenuhi halaman dengan statistik yang tidak diperlukan.
- Jangan membuat setiap file menjadi card besar pada default view.
- Jangan menggunakan terlalu banyak warna.
- Jangan membuat preview file hanya berupa modal sederhana jika format membutuhkan viewer khusus.
- Jangan menduplikasi file saat menghubungkannya dengan project atau task.
- Jangan membuat fitur UI palsu tanpa dukungan backend.

**Target akhir:**

Kullo Drive adalah pusat dokumen profesional yang menggabungkan kemudahan OneDrive, kemampuan document management SharePoint, dan kolaborasi kontekstual dalam satu ekosistem Kullo.

**Design Statement:**

"Your team's files, organized around your work."