# KULLO
## Product Requirements Document (PRD)

**Product Name:** Kullo  
**Product Type:** Web-Based Work Management & Collaboration Portal  
**Version:** 1.0  
**Status:** Initial Product Specification  
**Document Date:** 8 November 2026

---

# 1. Product Overview

## 1.1. Tentang Kullo

Kullo adalah platform manajemen pekerjaan dan kolaborasi perusahaan yang mengintegrasikan berbagai aktivitas operasional ke dalam satu portal kerja.

Kullo membantu perusahaan mengelola pekerjaan, tim, proyek, komunikasi, dokumen, jadwal, persetujuan, dan laporan melalui satu sistem terpusat.

Kullo dirancang untuk menjadi tempat utama karyawan memulai aktivitas kerja sehari-hari.

Alih-alih menggunakan banyak aplikasi berbeda untuk mengatur pekerjaan, berdiskusi, membagikan dokumen, dan memantau progres, semua aktivitas tersebut dapat dilakukan melalui Kullo.

**Product Philosophy:**

"Everything your team needs to work, in one place."

## 1.2. Product Vision

Menjadi centralized workspace yang membantu organisasi bekerja lebih terstruktur, transparan, produktif, dan terhubung.

## 1.3. Product Mission

1. Menyatukan seluruh aktivitas kerja dalam satu platform.
2. Mempermudah koordinasi antarindividu dan departemen.
3. Meningkatkan transparansi pekerjaan dan tanggung jawab.
4. Menyederhanakan proses administrasi dan approval.
5. Memberikan informasi operasional secara real-time.
6. Membantu manajemen mengambil keputusan berdasarkan data.

## 1.4. Target Market

- Startup dan perusahaan teknologi.
- Digital agency dan creative agency.
- Perusahaan jasa dan konsultan.
- Perusahaan dengan banyak departemen.
- Perusahaan multi-cabang.
- Tim project-based dan remote teams.
- UMKM yang mulai membangun sistem operasional profesional.

---

# 2. Product Positioning

Kullo mengambil inspirasi dari konsep Business Operating System seperti Kolabo, tetapi memiliki fokus utama pada work management dan team collaboration.

| Aspek | Deskripsi |
|---|---|
| Category | Work Management Platform |
| Positioning | Centralized Work Portal |
| Primary Value | Manage work, people, projects, and collaboration |
| Target | Business & Organization |
| Platform | Web Application |
| Business Model | SaaS |
| Deployment | Cloud-based |

## 2.1. Core Value Proposition

**One Workspace. Every Workflow.**

Kullo menyediakan satu tempat untuk:

- Manage People — Mengelola anggota dan struktur organisasi.
- Manage Work — Mengelola pekerjaan dan tanggung jawab.
- Manage Projects — Mengatur proyek dan progres.
- Collaborate — Berkomunikasi dan berkolaborasi.
- Manage Documents — Menyimpan dan membagikan dokumen.
- Manage Time — Mengatur jadwal dan aktivitas kerja.
- Manage Approvals — Mengelola persetujuan.
- Monitor Performance — Memantau produktivitas dan hasil kerja.

---

# 3. User & Organization Structure

## 3.1. Multi-Tenant Organization

Kullo menggunakan konsep multi-tenant SaaS.

Setiap perusahaan memiliki workspace sendiri dengan data yang terisolasi.

Struktur organisasi:

```text
Kullo Platform
│
├── Organization A
│   ├── Workspace
│   ├── Departments
│   │   ├── Marketing
│   │   ├── Sales
│   │   ├── Technology
│   │   └── Finance
│   │
│   ├── Projects
│   ├── Tasks
│   ├── Documents
│   ├── Conversations
│   └── Reports
│
└── Organization B
    ├── Workspace
    ├── Departments
    ├── Projects
    ├── Tasks
    ├── Documents
    └── Reports
```

Setiap organisasi memiliki pengaturan, pengguna, departemen, proyek, dan hak akses masing-masing.

## 3.2. User Roles

### A. Platform Super Admin

Pengelola keseluruhan platform Kullo.

Hak akses:
- Mengelola organisasi.
- Mengelola subscription.
- Mengelola pengguna platform.
- Mengelola konfigurasi global.
- Melihat penggunaan sistem.
- Mengelola modul dan fitur.
- Mengakses platform monitoring.

### B. Organization Owner

Pemilik organisasi.

Hak akses:
- Mengelola seluruh pengaturan perusahaan.
- Mengundang dan menghapus anggota.
- Mengelola role dan permission.
- Membuat departemen.
- Mengakses seluruh laporan organisasi.
- Mengelola subscription.
- Mengatur konfigurasi workspace.

### C. Administrator

Pengelola operasional organisasi.

Hak akses:
- Mengelola anggota.
- Mengelola departemen.
- Mengelola proyek.
- Mengelola pengaturan organisasi sesuai izin.
- Mengelola dokumen dan pengumuman.

### D. Manager / Head of Department

Pengelola departemen atau tim.

Hak akses:
- Membuat dan mengelola proyek.
- Membuat dan membagikan tugas.
- Menentukan PIC.
- Memantau pekerjaan anggota.
- Memberikan approval.
- Melihat laporan departemen.
- Mengelola agenda tim.

### E. Team Leader

Pengelola tim atau proyek.

Hak akses:
- Membuat tugas.
- Menentukan anggota tugas.
- Mengatur deadline.
- Mengubah status pekerjaan.
- Memantau progres proyek.
- Melakukan komunikasi proyek.

### F. Staff / Employee

Pengguna operasional.

Hak akses:
- Melihat tugas pribadi.
- Mengelola pekerjaan yang ditugaskan.
- Mengirim komentar.
- Mengunggah dokumen.
- Mengikuti diskusi.
- Mengajukan permintaan.
- Melihat agenda pribadi.

### G. Guest / External Collaborator

Pengguna eksternal dengan akses terbatas.

Hak akses:
- Melihat proyek yang dibagikan.
- Mengakses dokumen tertentu.
- Memberikan komentar.
- Mengunggah file sesuai permission.

Semua role harus menggunakan Role-Based Access Control (RBAC), sehingga permission dapat disesuaikan dengan kebutuhan organisasi.

---

# 4. Core Application Modules

Kullo terdiri dari 12 modul utama.

| No. | Module | Description |
|---|---|---|
| 01 | Dashboard | Ringkasan aktivitas kerja |
| 02 | My Work | Personal task management |
| 03 | Projects | Project management |
| 04 | Tasks | Task management |
| 05 | Teams | Team & organization management |
| 06 | Chat | Internal communication |
| 07 | Calendar | Schedule management |
| 08 | Documents | File & document management |
| 09 | Forms & Requests | Internal request management |
| 10 | Approvals | Approval workflow |
| 11 | Reports | Performance & operational reports |
| 12 | Settings | Organization configuration |

---

# 5. Functional Requirements

## 5.1. Dashboard

Dashboard merupakan halaman utama setelah pengguna berhasil login.

Tujuannya memberikan gambaran menyeluruh tentang aktivitas kerja pengguna.

### Dashboard Widgets

**Personal Overview**
- My Tasks.
- Tasks Due Today.
- Overdue Tasks.
- Completed Tasks.
- Upcoming Events.
- Pending Approvals.

**Project Overview**
- Active Projects.
- Project Progress.
- Project Deadline.
- Project Status.
- Team Workload.

**Activity Feed**
- Recent task updates.
- New project assignments.
- Comments and mentions.
- Document uploads.
- Approval updates.
- Team activities.

**Quick Actions**
- Create Task.
- Create Project.
- Start Conversation.
- Upload Document.
- Create Event.
- Submit Request.

### Dashboard Behavior

- Widget dapat disesuaikan berdasarkan role.
- Data mengikuti permission pengguna.
- Aktivitas terbaru ditampilkan secara kronologis.
- Informasi diperbarui secara berkala.
- Pengguna dapat membuka detail dari setiap widget.

## 5.2. My Work

Halaman personal workspace untuk setiap anggota.

Fitur:

**My Tasks**
- Assigned to me.
- Created by me.
- Following.
- Completed.
- Overdue.

**Task Views**
- List View.
- Board View.
- Calendar View.

**Personal Planning**
- Personal notes.
- Daily priorities.
- Upcoming deadlines.
- Personal activity timeline.

**Task Actions**
- Update status.
- Update priority.
- Change deadline.
- Add comments.
- Attach files.
- Create subtasks.

My Work harus menjadi pusat aktivitas sehari-hari setiap pengguna.

## 5.3. Project Management

Modul untuk mengelola pekerjaan berbasis proyek.

### Project Structure

```text
Organization
└── Department
    └── Project
        ├── Overview
        ├── Tasks
        ├── Members
        ├── Discussions
        ├── Files
        ├── Calendar
        └── Reports
```

### Project Properties

Setiap proyek memiliki:

- Project Name.
- Project Description.
- Project Code.
- Project Cover.
- Project Owner.
- Project Manager.
- Department.
- Project Members.
- Start Date.
- Due Date.
- Priority.
- Status.
- Progress.
- Tags.

### Project Status

- Planning.
- Active.
- On Hold.
- Completed.
- Cancelled.

### Project Views

**1. Overview**

Menampilkan ringkasan proyek, progres, anggota, deadline, dan aktivitas.

**2. Board View**

Kanban board untuk melihat status seluruh pekerjaan.

**3. List View**

Tampilan tabel dengan filter, sorting, dan grouping.

**4. Timeline View**

Visualisasi pekerjaan berdasarkan waktu pengerjaan.

**5. Calendar View**

Melihat seluruh deadline dan agenda proyek.

**6. Files View**

Menampilkan seluruh file yang berhubungan dengan proyek.

### Project Management Features

- Create project.
- Edit project.
- Archive project.
- Duplicate project.
- Add members.
- Assign project manager.
- Set milestones.
- Track progress.
- Project activity logs.
- Project discussions.
- Project reporting.

## 5.4. Task Management

Task management merupakan salah satu fitur paling penting di Kullo.

Setiap pekerjaan harus memiliki identitas, PIC, status, prioritas, dan deadline.

### Task Properties

| Property | Description |
|---|---|
| Task ID | Unique identifier |
| Task Name | Nama pekerjaan |
| Description | Detail pekerjaan |
| Project | Relasi proyek |
| Assignee | Penanggung jawab |
| Collaborators | Anggota pendukung |
| Reporter | Pembuat tugas |
| Status | Status pekerjaan |
| Priority | Prioritas |
| Start Date | Tanggal mulai |
| Due Date | Deadline |
| Labels | Kategori pekerjaan |
| Attachments | Lampiran |
| Checklist | Daftar pekerjaan kecil |
| Subtasks | Sub-pekerjaan |

### Task Status

Default workflow:

```text
Backlog
   ↓
To Do
   ↓
In Progress
   ↓
In Review
   ↓
Done
```

Status dapat disesuaikan oleh administrator proyek.

### Task Priority

- Urgent.
- High.
- Medium.
- Low.

### Task Features

- Create task.
- Edit task.
- Delete task.
- Assign task.
- Reassign task.
- Add collaborators.
- Create subtasks.
- Add checklist.
- Add attachments.
- Comment on tasks.
- Mention users.
- Set recurring tasks.
- Track time.
- Set dependencies.
- Duplicate task.
- Move task between projects.
- Archive task.

### Task Discussion

Setiap task memiliki ruang diskusi sendiri.

Fitur:
- Comment.
- Reply.
- Mention menggunakan @username.
- Upload attachment.
- Emoji reaction.
- Edit comment.
- Delete comment.
- Activity history.

Semua aktivitas perubahan task tercatat dalam activity log.

## 5.5. Team & Organization Management

Modul untuk mengelola struktur organisasi.

### Organization Management

- Company profile.
- Company logo.
- Company address.
- Business information.
- Organization settings.
- Working days.
- Working hours.
- Timezone.

### Department Management

- Create department.
- Edit department.
- Assign department head.
- Add members.
- Remove members.
- View department projects.
- View department workload.

### Employee Directory

Setiap anggota memiliki profil:

- Full name.
- Profile picture.
- Email.
- Phone number.
- Job title.
- Department.
- Manager.
- Employment status.
- Join date.
- Skills.
- Assigned projects.

Informasi sensitif harus dibatasi berdasarkan permission.

### Team Management

- Create teams.
- Assign team leaders.
- Add team members.
- Team discussions.
- Team projects.
- Team activity.

## 5.6. Internal Chat

Kullo menyediakan komunikasi internal agar percakapan tidak tersebar di berbagai aplikasi.

### Chat Types

**Direct Message**
- Percakapan personal antaranggota.

**Group Chat**
- Percakapan kelompok.
- Group description.
- Group members.
- Group administrators.

**Project Channel**
- Ruang diskusi khusus proyek.

**Department Channel**
- Ruang komunikasi departemen.

### Chat Features

- Text messages.
- File attachments.
- Image sharing.
- Reply to message.
- Message reactions.
- User mentions.
- Message search.
- Edit and delete messages.
- Pin messages.
- Unread indicator.
- Online presence.

### Chat Integration

Chat harus terhubung dengan task dan project.

Contoh:
- Pengguna dapat membuat task dari pesan.
- Task dapat dibagikan ke chat.
- Notifikasi task muncul di percakapan terkait.
- Project channel dapat menampilkan ringkasan aktivitas proyek.

## 5.7. Calendar & Schedule

Kalender untuk mengatur jadwal pribadi dan organisasi.

### Calendar Views

- Day.
- Week.
- Month.
- Agenda.

### Event Types

- Personal Event.
- Team Meeting.
- Project Deadline.
- Task Deadline.
- Company Event.
- Reminder.

### Event Properties

- Event Name.
- Description.
- Date & Time.
- Participants.
- Location.
- Related Project.
- Attachments.
- Reminder.

### Calendar Features

- Create event.
- Edit event.
- Invite participants.
- Recurring events.
- Event reminders.
- Participant availability (future).
- Calendar filtering.
- Export calendar.

## 5.8. Documents & File Management

Pusat penyimpanan dokumen perusahaan.

### Document Structure

```text
Documents
├── Company
├── Departments
├── Projects
├── Teams
└── Personal
```

### Features

- Upload files.
- Download files.
- Preview supported files.
- Create folders.
- Rename files.
- Move files.
- Delete files.
- Share documents.
- File permissions.
- Version history.
- Search documents.
- File tagging.

### Supported File Types

- PDF.
- DOC / DOCX.
- XLS / XLSX.
- PPT / PPTX.
- PNG / JPG / WEBP.
- ZIP.
- TXT.
- CSV.

File access harus mengikuti permission organisasi dan folder.

## 5.9. Forms & Requests

Modul untuk pengajuan kebutuhan internal perusahaan.

### Default Forms

- General Request.
- Purchase Request.
- Reimbursement Request.
- Leave Request.
- Overtime Request.
- Business Trip Request.
- Equipment Request.
- IT Support Request.

### Form Builder

Administrator dapat membuat form sesuai kebutuhan.

Form components:
- Short Text.
- Long Text.
- Number.
- Date.
- Dropdown.
- Multiple Choice.
- Checkbox.
- File Upload.
- User Selection.

### Request Workflow

```text
Employee
   ↓
Submit Request
   ↓
Department Manager
   ↓
Approval / Rejection
   ↓
Request Completed
```

Workflow harus mendukung multi-level approval.

## 5.10. Approval Management

Pusat pengelolaan seluruh persetujuan.

### Approval Categories

- Purchase.
- Reimbursement.
- Leave.
- Overtime.
- Business Trip.
- Project Request.
- General Request.

### Approval Features

- Approval inbox.
- Approval history.
- Approve.
- Reject.
- Request revision.
- Add approval notes.
- Multi-level approval.
- Approval delegation.
- Approval notifications.

### Approval Rules

Setiap pengajuan memiliki status:

- Draft.
- Submitted.
- Pending.
- Approved.
- Rejected.
- Revision Requested.
- Cancelled.

Setiap keputusan harus menyimpan identitas approver, waktu keputusan, dan catatan.

## 5.11. Reports & Analytics

Modul untuk memantau produktivitas organisasi.

### Dashboard Analytics

**Task Analytics**
- Total tasks.
- Completed tasks.
- Pending tasks.
- Overdue tasks.
- Completion rate.

**Project Analytics**
- Active projects.
- Completed projects.
- Project progress.
- Delayed projects.

**Team Analytics**
- Workload per member.
- Tasks per department.
- Task completion.
- Team activity.

**Time Analytics**
- Logged hours.
- Estimated versus actual time.
- Time spent per project.

### Report Features

- Date filtering.
- Department filtering.
- Project filtering.
- Employee filtering.
- Export PDF.
- Export XLSX.

Laporan produktivitas harus mengutamakan transparansi dan konteks pekerjaan, bukan sekadar menghitung jumlah task.

## 5.12. Settings

### Personal Settings

- Profile.
- Account security.
- Password.
- Notification preferences.
- Appearance.
- Language.
- Timezone.

### Organization Settings

- Organization profile.
- Members.
- Departments.
- Roles.
- Permissions.
- Project settings.
- Task workflow.
- Approval workflow.
- Working hours.
- Integrations.
- Subscription.

---

# 6. Notification System

Kullo harus memiliki notification center terintegrasi.

### Notification Events

- Task assigned.
- Task updated.
- Task deadline approaching.
- Task overdue.
- New comment.
- User mentioned.
- Project invitation.
- New chat message.
- Approval request.
- Approval result.
- Event invitation.
- Document shared.

### Notification Channels

MVP:
- In-app notifications.

Future:
- Email notifications.
- Browser push notifications.
- WhatsApp integration.

### Notification Features

- Read / unread.
- Mark all as read.
- Notification grouping.
- Notification filtering.
- Notification preferences.
- Deep link to related activity.

---

# 7. Global Search

Kullo menyediakan pencarian global melalui satu search interface.

Searchable content:

- Tasks.
- Projects.
- Employees.
- Departments.
- Messages.
- Documents.
- Events.
- Requests.

Fitur:
- Search suggestions.
- Search history.
- Category filters.
- Recent searches.
- Quick navigation.

Keyboard shortcut:

`Ctrl + K` untuk membuka global search.

---

# 8. AI Assistant (Future Module)

Kullo dirancang agar dapat dikembangkan dengan AI assistant.

AI bukan sekadar chatbot, tetapi asisten kerja yang memahami konteks organisasi berdasarkan permission pengguna.

### AI Capabilities

**Work Assistant**
- Menampilkan ringkasan pekerjaan hari ini.
- Membantu menyusun prioritas.
- Merangkum progres proyek.
- Mencari task tertentu.
- Menjelaskan aktivitas proyek.

**Task Assistant**
- Membuat task dari instruksi bahasa natural.
- Membuat checklist.
- Menyusun deskripsi task.
- Mengidentifikasi pekerjaan terlambat.

**Report Assistant**
- Membuat ringkasan laporan.
- Menganalisis progres proyek.
- Mengidentifikasi potensi keterlambatan.
- Menyusun laporan mingguan.

**Meeting Assistant**
- Membuat meeting summary.
- Mengubah hasil meeting menjadi task.
- Menyusun daftar tindak lanjut.

### Example Interaction

User:

"Rangkum pekerjaan tim marketing minggu ini."

AI:

- Menampilkan task yang selesai.
- Menampilkan task yang masih berjalan.
- Menampilkan task overdue.
- Menampilkan hambatan pekerjaan.
- Menyusun ringkasan aktivitas tim.

AI harus selalu mengikuti hak akses pengguna dan tidak boleh mengakses data organisasi yang tidak diizinkan.

---

# 9. Application Navigation & Information Architecture

## 9.1. Main Application Layout

Kullo menggunakan layout dashboard modern dengan sidebar navigation, top navigation, dan main content area.

```text
┌───────────────────────────────────────────────────────────┐
│ KULLO             Search       Notifications    Profile    │
├──────────────┬────────────────────────────────────────────┤
│              │                                            │
│ Workspace    │              Main Content                  │
│              │                                            │
│ Dashboard    │                                            │
│ My Work      │                                            │
│ Projects     │                                            │
│ Tasks        │                                            │
│ Calendar     │                                            │
│              │                                            │
│ WORKSPACE    │                                            │
│ Teams        │                                            │
│ Chat         │                                            │
│ Documents    │                                            │
│ Requests     │                                            │
│ Approvals    │                                            │
│              │                                            │
│ MANAGEMENT   │                                            │
│ Reports      │                                            │
│ Settings     │                                            │
│              │                                            │
├──────────────┴────────────────────────────────────────────┤
│ User Profile / Workspace Switcher                        │
└───────────────────────────────────────────────────────────┘
```

## 9.2. Primary Routes

```text
/
├── /login
├── /register
├── /forgot-password
│
├── /app
│   ├── /dashboard
│   ├── /my-work
│   ├── /tasks
│   ├── /projects
│   │   ├── /:projectId
│   │   ├── /:projectId/overview
│   │   ├── /:projectId/board
│   │   ├── /:projectId/list
│   │   ├── /:projectId/timeline
│   │   ├── /:projectId/files
│   │   └── /:projectId/settings
│   │
│   ├── /calendar
│   ├── /teams
│   ├── /chat
│   ├── /documents
│   ├── /requests
│   ├── /approvals
│   ├── /reports
│   │
│   └── /settings
│       ├── /profile
│       ├── /organization
│       ├── /members
│       ├── /departments
│       ├── /roles
│       ├── /permissions
│       ├── /notifications
│       └── /integrations
│
└── /super-admin
    ├── /organizations
    ├── /users
    ├── /subscriptions
    ├── /modules
    └── /system-settings
```

---

# 10. User Experience & Design Requirements

## 10.1. Design Direction

Kullo harus memiliki tampilan modern, minimal, profesional, dan produktif.

Referensi karakter desain:
- Linear: interface yang bersih dan fokus pada pekerjaan.
- Notion: fleksibilitas pengelolaan informasi.
- ClickUp: kelengkapan work management.
- Slack: komunikasi tim.
- Kolabo: pendekatan portal operasional perusahaan.

Referensi tersebut digunakan sebagai inspirasi prinsip desain, bukan untuk menyalin identitas atau tampilan produk.

## 10.2. Design Principles

1. Clarity over Complexity.
2. Minimal Visual Noise.
3. Fast Navigation.
4. Consistent Components.
5. Information Hierarchy.
6. Contextual Actions.
7. Responsive Experience.

## 10.3. Visual Direction

**Color Palette**

| Token | Color | Usage |
|---|---|---|
| Primary | #252525 | Primary interface |
| Background | #FFFFFF | Main background |
| Surface | #F8F8F7 | Secondary surface |
| Border | #E8E8E6 | Borders |
| Text | #252525 | Primary text |
| Muted | #858585 | Secondary text |
| Accent | #426BDB | Primary actions |
| Success | #269B69 | Completed status |
| Warning | #D99A32 | Warning status |
| Danger | #D94B4B | Critical status |

**Typography**
- Primary: Inter.
- Secondary: Inter.
- Font weight: 400, 500, 600, 700.

**Interface Characteristics**
- Light mode as default.
- Optional dark mode.
- Compact but readable interface.
- Subtle borders.
- Minimal shadows.
- Consistent spacing.
- Rounded corners 6–10px.
- Clear status indicators.
- Minimal animations.

## 10.4. Responsive Design

Kullo harus mendukung:

- Desktop: 1440px and above.
- Laptop: 1024px–1439px.
- Tablet: 768px–1023px.
- Mobile: 320px–767px.

Desktop menjadi pengalaman utama untuk pengelolaan pekerjaan.

Mobile difokuskan pada:
- Viewing tasks.
- Updating task status.
- Chat.
- Notifications.
- Approvals.
- Calendar.
- Document access.

---

# 11. Core User Workflows

## 11.1. Organization Onboarding

```text
Visit Kullo
    ↓
Register Account
    ↓
Create Organization
    ↓
Complete Organization Profile
    ↓
Create Departments
    ↓
Invite Team Members
    ↓
Assign Roles
    ↓
Create First Project
    ↓
Start Working
```

## 11.2. Task Workflow

```text
Manager Creates Task
    ↓
Assign Team Member
    ↓
Member Receives Notification
    ↓
Member Starts Working
    ↓
Update Progress
    ↓
Submit for Review
    ↓
Manager Reviews
    ↓
Approved
    ↓
Task Completed
```

## 11.3. Project Workflow

```text
Create Project
    ↓
Assign Project Manager
    ↓
Add Members
    ↓
Create Milestones
    ↓
Create Tasks
    ↓
Monitor Progress
    ↓
Review Results
    ↓
Complete Project
```

## 11.4. Request & Approval Workflow

```text
Employee Creates Request
    ↓
Submit Request
    ↓
Manager Receives Notification
    ↓
Review Request
    ↓
Approve / Reject / Request Revision
    ↓
Notify Employee
    ↓
Save Approval History
```

---

# 12. Database & Core Data Entities

Database harus mendukung multi-tenant architecture.

### Organization & User

- organizations
- users
- organization_members
- departments
- teams
- roles
- permissions
- role_permissions
- user_roles

### Project Management

- projects
- project_members
- project_statuses
- project_milestones
- tasks
- task_assignees
- task_collaborators
- task_statuses
- task_labels
- task_comments
- task_attachments
- task_checklists
- task_subtasks
- task_dependencies
- task_time_logs

### Collaboration

- conversations
- conversation_members
- messages
- message_attachments
- message_reactions
- notifications
- activity_logs

### Documents

- folders
- documents
- document_versions
- document_permissions

### Calendar

- events
- event_participants
- event_reminders

### Requests & Approvals

- form_templates
- form_fields
- requests
- request_attachments
- approval_workflows
- approval_steps
- approval_actions

### Subscription & Platform

- plans
- subscriptions
- invoices
- organization_settings
- integrations
- system_settings

**Important:** Seluruh data organisasi wajib memiliki relasi tenant yang jelas. Backend harus memvalidasi organization membership dan permission pada setiap request, bukan hanya menyembunyikan data melalui frontend.

---

# 13. Non-Functional Requirements

## 13.1. Performance

- Initial application load dioptimalkan agar terasa cepat.
- Dashboard menggunakan pagination atau lazy loading bila diperlukan.
- Search menggunakan indexing yang sesuai.
- Database query harus efisien.
- File upload harus mendukung ukuran file yang dikonfigurasi.
- Realtime features menggunakan mekanisme komunikasi yang sesuai.

## 13.2. Security

- Secure authentication.
- Password hashing.
- Session/JWT security.
- Role-based access control.
- Tenant data isolation.
- CSRF protection jika menggunakan cookie authentication.
- XSS protection.
- SQL injection prevention.
- Rate limiting.
- Secure file access.
- Audit logging.
- HTTPS mandatory.

## 13.3. Reliability

- Automated database backups.
- Error logging.
- Application monitoring.
- Database transaction management.
- Recovery procedures.
- Graceful error handling.

## 13.4. Scalability

Arsitektur harus mendukung:
- Multiple organizations.
- Thousands of users.
- Multiple concurrent projects.
- Growing document storage.
- Increasing activity volume.
- Modular feature expansion.

## 13.5. Compatibility

- Chrome.
- Edge.
- Firefox.
- Safari.

---

# 14. Technical Architecture (Proposed)

Bagian ini merupakan rekomendasi implementasi awal dan dapat dikembangkan melalui TECH.md.

## 14.1. Frontend

- Vite.
- React.
- TypeScript.
- React Router.
- Bootstrap 5 / custom CSS.
- TanStack Query.
- Zustand.
- Reusable component architecture.

Frontend harus dipisahkan dari backend melalui REST API.

## 14.2. Backend

- PHP 8.1+.
- Native PHP architecture.
- RESTful API.
- PostgreSQL.
- PDO.
- JWT or secure session authentication.
- Custom validation layer.
- Modular service architecture.

Backend tidak menggunakan framework berat.

## 14.3. Infrastructure

- Frontend hosting: Vercel atau static hosting.
- Backend hosting: cPanel-compatible PHP hosting.
- Database: PostgreSQL.
- File storage: local storage atau S3-compatible storage.
- Domain: kullo.app (subject to availability).

Arsitektur awal harus menghindari ketergantungan pada VPS khusus jika shared hosting yang tersedia masih mampu memenuhi kebutuhan sistem.

## 14.4. Suggested Project Structure

```text
kullo/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── modules/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── routes/
│   │   └── styles/
│   └── public/
│
├── backend/
│   ├── public/
│   ├── src/
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   ├── Middleware/
│   │   ├── Validators/
│   │   └── Helpers/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── storage/
│
├── docs/
│   ├── PRD.md
│   ├── TECH.md
│   ├── DESIGN.md
│   └── API.md
│
└── README.md
```

---

# 15. MVP Scope & Development Roadmap

Kullo harus dikembangkan secara bertahap. Tidak semua modul harus tersedia pada peluncuran pertama.

## Phase 1 — Core Workspace (MVP)

**Objective:** Pengguna sudah bisa mengelola perusahaan, tim, proyek, dan pekerjaan.

Features:
- Authentication.
- Organization onboarding.
- User management.
- Department management.
- RBAC.
- Dashboard.
- My Work.
- Project management.
- Task management.
- Kanban board.
- List view.
- Comments.
- Attachments.
- In-app notifications.
- Basic activity logs.

**Acceptance Criteria:**
- User dapat membuat organisasi.
- Organization Owner dapat mengundang anggota.
- Administrator dapat mengatur departemen dan role.
- Manager dapat membuat proyek.
- Manager dapat membuat dan membagikan task.
- Staff dapat memperbarui task.
- Seluruh perubahan tercatat.
- Data antarorganisasi tidak dapat diakses silang.

## Phase 2 — Team Collaboration

**Objective:** Menghubungkan komunikasi dan aktivitas kerja.

Features:
- Internal chat.
- Group chat.
- Project channels.
- Calendar.
- Document management.
- Global search.
- User mentions.
- Advanced notifications.

**Acceptance Criteria:**
- Anggota dapat berkomunikasi.
- Chat dapat dihubungkan dengan proyek.
- User dapat membuat agenda.
- Dokumen dapat dibagikan dengan permission.
- Pengguna dapat mencari pekerjaan dan dokumen.

## Phase 3 — Business Operations

**Objective:** Mengintegrasikan administrasi internal perusahaan.

Features:
- Form builder.
- Request management.
- Multi-level approvals.
- Reimbursement.
- Leave request.
- Overtime request.
- Purchase request.
- Timesheet.
- Advanced reporting.

**Acceptance Criteria:**
- Admin dapat membuat template pengajuan.
- Staff dapat mengirim request.
- Manager dapat memberikan keputusan.
- Setiap approval memiliki histori.
- Manajemen dapat melihat laporan.

## Phase 4 — Intelligence & Automation

**Objective:** Menjadikan Kullo sebagai intelligent work platform.

Features:
- AI Work Assistant.
- AI Project Summary.
- AI Task Generator.
- AI Meeting Summary.
- Workflow Automation.
- Advanced analytics.
- External integrations.
- Calendar integrations.

---

# 16. SaaS Business Model

Kullo menggunakan subscription-based business model.

Usulan paket:

| Feature | Free | Pro | Business |
|---|---|---|---|
| Organization | 1 | 1 | Multiple |
| Members | 5 | 25 | Custom |
| Projects | 3 | Unlimited | Unlimited |
| Tasks | Unlimited | Unlimited | Unlimited |
| Kanban | Yes | Yes | Yes |
| Chat | Basic | Full | Full |
| Documents | Limited | Extended | Extended |
| Reports | Basic | Advanced | Advanced |
| Approvals | Basic | Advanced | Advanced |
| AI Assistant | No | Optional | Optional |
| Priority Support | No | No | Yes |

Harga belum ditentukan dan perlu divalidasi melalui riset pasar.

---

# 17. Product Success Metrics

Kullo harus dievaluasi menggunakan metrik penggunaan dan dampak operasional.

### Acquisition
- New organizations.
- New registered users.
- Organization activation rate.

### Activation
- Percentage of organizations creating first project.
- Percentage of users assigned first task.
- Time to first completed task.

### Engagement
- Daily Active Users.
- Weekly Active Users.
- Tasks created per organization.
- Tasks completed per organization.
- Projects active.
- Collaboration activities.

### Retention
- Weekly retention.
- Monthly retention.
- Organization churn.
- Subscription renewal rate.

### Productivity
- Task completion rate.
- Overdue task ratio.
- Project completion rate.
- Approval turnaround time.

Target angka akan ditentukan setelah mendapatkan baseline dari pengguna awal.

---

# 18. Out of Scope for MVP

Untuk menjaga fokus pengembangan, fitur berikut tidak masuk MVP:

- Full accounting system.
- Payroll management.
- Tax calculation.
- Point of Sale.
- CRM lengkap.
- Inventory management.
- Recruitment management.
- Attendance with GPS.
- Native Android/iOS application.
- Video conferencing.
- Advanced AI automation.

Fitur tersebut dapat menjadi modul pengembangan jangka panjang apabila kebutuhan pasar sudah tervalidasi.

---

# 19. Risks & Considerations

| Risk | Mitigation |
|---|---|
| Terlalu banyak fitur | Prioritaskan core work management |
| UI terlalu kompleks | Gunakan progressive disclosure |
| Data antarorganisasi bocor | Tenant isolation di backend |
| Chat menjadi lambat | Gunakan pagination dan optimasi realtime |
| File storage membesar | Implementasikan storage policy |
| User tidak aktif | Sederhanakan onboarding |
| Approval terlalu rumit | Workflow builder bertahap |
| Pengembangan terlalu lama | Modular development dan MVP |

---

# 20. Definition of Done

Sebuah modul dinyatakan selesai jika:

1. Seluruh functional requirements telah diimplementasikan.
2. UI sesuai dengan design system Kullo.
3. Validasi frontend dan backend tersedia.
4. Permission telah diuji.
5. Tenant isolation telah diuji.
6. Error handling tersedia.
7. Loading dan empty states tersedia.
8. Responsive layout berfungsi.
9. Data tersimpan dengan benar.
10. Tidak ada critical bug.
11. Dokumentasi API diperbarui.
12. Fitur telah melewati pengujian acceptance.

---

# 21. Final Product Direction

Kullo bukan hanya aplikasi untuk membuat task atau memantau proyek.

Kullo adalah portal kerja yang menghubungkan orang, pekerjaan, komunikasi, dan proses operasional perusahaan.

**The Core Concept:**

- People know what they need to do.
- Teams know what they are working on.
- Managers know what is happening.
- Organizations know where they are going.

Dengan pendekatan modular, Kullo dapat dimulai sebagai work management platform yang ringan, kemudian berkembang menjadi Business Operating System yang lebih lengkap.

**KULLO**

*Work Together. Move Forward.*

---

# 22. References & Product Research

Referensi berikut digunakan untuk memahami kategori produk, fitur, dan pendekatan work management. Kullo tetap memiliki identitas dan implementasi produk sendiri.

1. [Kolabo — Business Operating System](https://www.kolabo.id/) — Referensi integrasi manajemen organisasi, HR, project management, komunikasi, dan operasional.
2. [Kolabo — Terms & Conditions](https://www.kolabo.id/terms-n-condition.html) — Referensi cakupan fitur kolaborasi, approval, kalender, dan dokumen.
3. [Linear](https://linear.app/) — Referensi pengalaman project dan issue management.
4. [Notion](https://www.notion.so/) — Referensi pengelolaan informasi dan dokumentasi.
5. [Slack](https://slack.com/) — Referensi komunikasi dan kolaborasi tim.
6. [ClickUp](https://clickup.com/) — Referensi work management dan task management.

**End of Document — Kullo PRD v1.0**