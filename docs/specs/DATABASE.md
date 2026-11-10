# DATABASE.md
# KULLO — Business Relationship Database & CRM

**Module:** Database  
**Product:** Kullo  
**Category:** CRM / Contact Management / Business Relationship Management  
**Design Reference:** Parfex CRM, Microsoft Dynamics 365, HubSpot CRM  
**Design System:** Microsoft Fluent 2 + Kullo Design System  
**Platform:** Web Application + Responsive Mobile

---

# 1. OVERVIEW

## 1.1 Introduction

Database adalah modul CRM di dalam Kullo yang berfungsi sebagai pusat pengelolaan seluruh relasi bisnis perusahaan.

Modul ini memungkinkan pengguna menyimpan, mengelola, mencari, mengelompokkan, dan memantau seluruh data:

- Client / Customer.
- Leads / Prospects.
- Contacts.
- Vendors / Suppliers.
- Partners.
- Organizations / Companies.
- Business Accounts.
- Sales Opportunities.
- Business Activities.
- Business Relationships.

Database harus menjadi single source of truth untuk seluruh informasi relasi bisnis di Kullo.

Setiap data harus dapat dihubungkan dengan:
- Workspace.
- Project.
- Task.
- Team.
- Document.
- Sales activity.
- Deal / Opportunity.

## 1.2 Product Vision

Kullo Database bukan sekadar address book.

Modul ini dirancang sebagai business relationship management system yang membantu tim memahami:

- Siapa saja relasi bisnis perusahaan?
- Siapa PIC dari setiap perusahaan?
- Apa status hubungan bisnisnya?
- Apa riwayat komunikasi dengan mereka?
- Siapa yang bertanggung jawab mengelola relasi tersebut?
- Apa peluang bisnis yang sedang berjalan?
- Kapan terakhir kali mereka dihubungi?
- Apa tindakan berikutnya yang perlu dilakukan?

## 1.3 Design Direction

Gunakan pendekatan:

**Parfex CRM-inspired + Microsoft Fluent 2 + Kullo Workspace Integration**

Karakteristik:
- Clean enterprise interface.
- Dense but readable data table.
- Fast navigation.
- Contextual side panel.
- Advanced filtering.
- Relationship-centric data.
- Professional CRM experience.

Hindari:
- Dashboard cards berlebihan.
- Layout seperti spreadsheet mentah.
- Form yang terlalu panjang dalam satu halaman.
- Informasi duplikat.
- Warna berlebihan.
- UI yang terlalu dekoratif.

---

# 2. INFORMATION ARCHITECTURE

## 2.1 Main Navigation

Menu Database menjadi bagian dari sidebar utama Kullo.

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
│
├── Database
│   ├── Overview
│   ├── Companies
│   ├── Contacts
│   ├── Clients
│   ├── Leads
│   ├── Vendors
│   ├── Partners
│   ├── Opportunities
│   ├── Activities
│   └── Import & Export
│
└── Settings
```

Semua menu di atas berada di dalam modul Database, bukan sebagai sidebar utama yang terpisah.

## 2.2 Database Navigation

Ketika pengguna membuka Database, tampilkan secondary navigation.

```text
DATABASE

Overview

RELATIONSHIPS
- Companies
- Contacts

BUSINESS
- Clients
- Leads
- Vendors
- Partners

SALES
- Opportunities
- Activities

MANAGEMENT
- Import & Export
- Data Settings
```

Setiap menu dapat menggunakan badge jumlah data jika relevan.

Contoh:

```text
Companies       128
Contacts        642
Clients          84
Leads           156
Vendors          42
```

Angka harus berasal dari data aktual.

---

# 3. DATABASE OVERVIEW

## 3.1 Overview Page

Overview merupakan halaman ringkasan aktivitas CRM.

Tujuan:
- Memberikan gambaran relasi bisnis.
- Menampilkan data yang membutuhkan perhatian.
- Membantu pengguna mengakses data penting dengan cepat.

Layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Database                                                    │
│ Manage your business relationships                          │
│                                                             │
│ Search contacts, companies, vendors...       + Add Record   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Total Companies   Contacts   Clients   Vendors   Leads       │
│      128            642        84        42       156        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Recent Activity                    Upcoming Follow-ups       │
│                                                             │
│ Sarah updated Client A             Client B - Today          │
│ Rendy added Vendor B               Vendor C - Tomorrow       │
│ Andi created Contact C              Client D - Friday         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Recently Added                                               │
│                                                             │
│ Company Name | Type | Contact | Owner | Created              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 3.2 Overview Components

- DatabaseHeader.
- DatabaseSearch.
- DatabaseStats.
- RecentActivity.
- UpcomingFollowUps.
- RecentlyAdded.
- QuickCreateMenu.

## 3.3 Quick Create

Tombol `+ Add Record` membuka dropdown:

```text
+ Add Record

- Add Company
- Add Contact
- Add Client
- Add Lead
- Add Vendor
- Add Partner
- Add Opportunity
```

Setiap action membuka form yang sesuai.

---

# 4. CORE DATA MODEL

## 4.1 Fundamental Structure

Gunakan struktur data yang memisahkan entitas utama.

```text
WORKSPACE
   │
   ├── COMPANIES
   │      │
   │      ├── CONTACTS
   │      │
   │      ├── CLIENT RELATIONSHIPS
   │      │
   │      ├── VENDOR RELATIONSHIPS
   │      │
   │      ├── OPPORTUNITIES
   │      │
   │      ├── ACTIVITIES
   │      │
   │      └── DOCUMENTS
   │
   └── USERS
          │
          ├── Record Owner
          ├── Activity Owner
          └── Assigned Salesperson
```

## 4.2 Entity Definitions

### Company

Mewakili sebuah organisasi atau badan usaha.

Contoh:
- PT ABC Indonesia.
- CV Maju Bersama.
- Universitas XYZ.
- Dinas Komunikasi dan Informatika.

Satu company dapat memiliki banyak contacts.

### Contact

Mewakili individu yang berhubungan dengan organisasi atau bisnis.

Contoh:
- Marketing Manager.
- Procurement Manager.
- Director.
- Finance PIC.
- Technical PIC.

Satu contact dapat memiliki beberapa relasi bisnis sesuai kebutuhan.

### Client

Mewakili hubungan bisnis antara workspace Kullo dan sebuah perusahaan atau individu.

Client bukan entitas perusahaan yang berbeda.

Satu company dapat memiliki status client dalam satu workspace.

### Lead

Mewakili calon pelanggan atau peluang relasi yang belum memenuhi kriteria sebagai client.

Lead dapat dikonversi menjadi:
- Company.
- Contact.
- Opportunity.

### Vendor

Mewakili perusahaan atau individu yang menyediakan barang atau jasa kepada organisasi.

Vendor dapat memiliki:
- Vendor category.
- Procurement contact.
- Contract.
- Payment information.
- Vendor performance.
- Vendor status.

### Partner

Mewakili hubungan bisnis strategis dengan perusahaan atau individu lain.

### Opportunity

Mewakili peluang transaksi atau bisnis.

Contoh:
- Pengadaan perangkat jaringan.
- Kontrak layanan internet.
- Implementasi software.
- Proyek konsultasi.
- Pengadaan merchandise.

---

# 5. DATABASE MAIN INTERFACE

## 5.1 Main Table Layout

Halaman Companies, Contacts, Clients, Leads, Vendors, dan Partners menggunakan pola interface yang konsisten.

```text
┌──────────────────────────────────────────────────────────────┐
│ Database / Companies                                        │
│                                                             │
│ Companies                                      + Add Company│
│ Manage your organizations and business accounts              │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│ Search companies...                    Import  Export        │
│                                                             │
│ All Companies  My Companies  Active  Archived               │
│                                                             │
│ [Filter] [Owner] [Industry] [Status] [More Filters]         │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│ □  Company       Industry   Contacts   Owner     Status      │
│                                                             │
│ □  Company A     Technology  5         Rendy     Active      │
│ □  Company B     Education   3         Sarah     Prospect    │
│ □  Company C     Government  8         Andi      Active      │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

## 5.2 Table Behavior

Fitur:
- Sorting.
- Filtering.
- Search.
- Pagination.
- Column visibility.
- Column resizing.
- Column reordering.
- Multi-select.
- Bulk actions.
- Row context menu.
- Saved views.

Default row height harus compact, seperti CRM enterprise.

## 5.3 Row Interaction

- Single click: Select record.
- Double click: Open record detail.
- Click name: Open record detail.
- Checkbox: Select record.
- Ellipsis: Open contextual actions.

Pada desktop, record detail dapat ditampilkan melalui right-side panel.

---

# 6. COMPANIES

## 6.1 Companies Page

Companies adalah pusat data organisasi.

Fitur:
- Create Company.
- Edit Company.
- View Company.
- Archive Company.
- Delete Company.
- Add Contacts.
- Add Opportunity.
- Add Activity.
- View Related Documents.
- View Business Relationships.

## 6.2 Company Fields

### Basic Information

| Field | Type |
|---|---|
| Company ID | UUID |
| Company Name | Text |
| Legal Name | Text |
| Company Type | Select |
| Industry | Select |
| Website | URL |
| Company Logo | Image |
| Description | Long Text |

### Company Classification

| Field | Type |
|---|---|
| Industry | Select |
| Sub Industry | Select |
| Company Size | Select |
| Annual Revenue | Currency Range |
| Organization Type | Select |
| Business Category | Multi-select |

### Address

| Field | Type |
|---|---|
| Address | Text |
| City | Text |
| Province / State | Text |
| Postal Code | Text |
| Country | Select |
| Latitude | Decimal |
| Longitude | Decimal |

### Business Information

| Field | Type |
|---|---|
| Relationship Status | Select |
| Account Owner | User |
| Source | Select |
| Priority | Select |
| Tags | Multi-select |
| Notes | Long Text |

### System Information

| Field | Type |
|---|---|
| Created By | User |
| Created At | Timestamp |
| Updated By | User |
| Updated At | Timestamp |
| Archived At | Timestamp |

---

# 7. CONTACTS

## 7.1 Contacts Page

Contacts berisi seluruh individu yang berhubungan dengan perusahaan atau bisnis.

Contacts harus menjadi sumber data utama untuk individu.

Satu perusahaan dapat memiliki banyak contacts.

Contoh:

```text
PT ABC Indonesia

Contacts
├── Budi Santoso
│   └── Procurement Manager
│
├── Sarah Putri
│   └── Finance Manager
│
└── Andi Pratama
    └── Technical Manager
```

## 7.2 Contact Fields

### Personal Information

| Field | Type |
|---|---|
| Contact ID | UUID |
| First Name | Text |
| Last Name | Text |
| Full Name | Computed |
| Salutation | Select |
| Profile Photo | Image |
| Job Title | Text |
| Department | Text |

### Contact Information

| Field | Type |
|---|---|
| Work Email | Email |
| Personal Email | Email |
| Work Phone | Phone |
| Mobile Phone | Phone |
| WhatsApp | Phone |
| LinkedIn URL | URL |
| Website | URL |

### Company Relationship

| Field | Type |
|---|---|
| Company | Relation |
| Primary Contact | Boolean |
| Reports To | Contact Relation |
| Relationship Type | Select |
| Contact Owner | User |

### Additional Information

| Field | Type |
|---|---|
| Birthday | Date |
| Address | Text |
| City | Text |
| Country | Select |
| Tags | Multi-select |
| Notes | Long Text |

### CRM Information

| Field | Type |
|---|---|
| Contact Status | Select |
| Lead Source | Select |
| Last Contacted | Date |
| Next Follow-up | Date |
| Preferred Communication | Select |

## 7.3 Contact Status

Options:
- Active.
- Inactive.
- Prospect.
- Former Contact.
- Archived.

## 7.4 Contact Detail Page

Layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Contacts / Budi Santoso                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Avatar]  Budi Santoso                  Edit   More        │
│            Procurement Manager                              │
│            PT ABC Indonesia                                 │
│                                                             │
│            Email | Phone | WhatsApp                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Overview | Activities | Opportunities | Documents | Notes    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Contact Information            Company Information           │
│                                                             │
│ Email                          PT ABC Indonesia              │
│ Phone                          Technology                    │
│ Department                     Active Client                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Activity Timeline                                           │
│                                                             │
│ Email sent                                                  │
│ Meeting scheduled                                           │
│ Note added                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 8. CLIENTS

## 8.1 Clients Page

Clients menampilkan perusahaan atau individu yang memiliki hubungan bisnis sebagai pelanggan.

Client dapat berasal dari:
- Converted Lead.
- Manual Entry.
- Import.
- Existing Company.

Clients tidak boleh membuat duplikasi Company.

Client merupakan relationship record yang terhubung dengan Company.

## 8.2 Client Fields

| Field | Type |
|---|---|
| Client ID | UUID |
| Company ID | Relation |
| Client Code | Text |
| Client Status | Select |
| Client Since | Date |
| Account Owner | User |
| Client Tier | Select |
| Customer Segment | Select |
| Contract Value | Currency |
| Contract Start | Date |
| Contract End | Date |
| Renewal Date | Date |
| Payment Terms | Select |
| Billing Contact | Contact Relation |
| Technical Contact | Contact Relation |
| Notes | Long Text |

## 8.3 Client Status

- Active.
- Onboarding.
- At Risk.
- Inactive.
- Churned.
- Archived.

## 8.4 Client Detail Tabs

- Overview.
- Contacts.
- Opportunities.
- Projects.
- Activities.
- Documents.
- Contracts.
- Billing.
- Notes.

---

# 9. LEADS

## 9.1 Leads Page

Leads adalah calon pelanggan yang belum dikonversi menjadi client.

Lead dapat berupa:
- Individual.
- Company.
- Organization.

## 9.2 Lead Fields

| Field | Type |
|---|---|
| Lead ID | UUID |
| Lead Name | Text |
| Company Name | Text |
| Email | Email |
| Phone | Phone |
| Website | URL |
| Industry | Select |
| Lead Source | Select |
| Lead Status | Select |
| Lead Score | Number |
| Owner | User |
| Estimated Value | Currency |
| Expected Close Date | Date |
| Notes | Long Text |

## 9.3 Lead Status

- New.
- Contacted.
- Qualified.
- Unqualified.
- Nurturing.
- Converted.

## 9.4 Lead Conversion

Ketika pengguna mengonversi lead:

```text
Lead
  │
  ├── Create or Match Company
  │
  ├── Create or Match Contact
  │
  └── Create Opportunity (optional)
```

Sistem harus melakukan duplicate checking sebelum membuat Company atau Contact baru.

Lead yang dikonversi tetap memiliki riwayat dan referensi asal.

---

# 10. VENDORS

## 10.1 Vendors Page

Vendors berisi seluruh vendor dan supplier yang bekerja sama dengan organisasi.

Vendor dapat berasal dari:
- Company.
- Individual.
- Imported records.

Vendor menggunakan Company sebagai sumber data organisasi.

## 10.2 Vendor Fields

### Vendor Information

| Field | Type |
|---|---|
| Vendor ID | UUID |
| Company ID | Relation |
| Vendor Code | Text |
| Vendor Name | Text |
| Vendor Category | Select |
| Vendor Type | Select |
| Vendor Status | Select |
| Vendor Owner | User |

### Business Information

| Field | Type |
|---|---|
| Website | URL |
| Industry | Select |
| Tax ID | Text |
| Business License | Text |
| Bank Name | Text |
| Bank Account Name | Text |
| Bank Account Number | Sensitive Text |
| Payment Terms | Select |
| Currency | Select |

### Procurement Information

| Field | Type |
|---|---|
| Procurement Contact | Contact Relation |
| Contract Start | Date |
| Contract End | Date |
| Contract Value | Currency |
| Purchase Category | Multi-select |
| Vendor Rating | Number |
| Performance Notes | Long Text |

### Vendor Status

- Pending Verification.
- Active.
- Preferred.
- On Hold.
- Inactive.
- Blacklisted.
- Archived.

## 10.3 Vendor Detail Tabs

- Overview.
- Contacts.
- Products & Services.
- Contracts.
- Purchase Orders.
- Documents.
- Activities.
- Performance.
- Notes.

Vendor banking information harus dilindungi dengan permission khusus dan tidak boleh ditampilkan ke seluruh anggota workspace secara default.

---

# 11. PARTNERS

## 11.1 Partners Page

Partners adalah organisasi atau individu yang memiliki hubungan strategis dengan perusahaan.

Contoh:
- Strategic Partner.
- Technology Partner.
- Channel Partner.
- Reseller.
- Distributor.
- Referral Partner.
- Affiliate Partner.

## 11.2 Partner Fields

| Field | Type |
|---|---|
| Partner ID | UUID |
| Company ID | Relation |
| Partner Code | Text |
| Partner Type | Select |
| Partner Status | Select |
| Relationship Owner | User |
| Partnership Start | Date |
| Partnership End | Date |
| Agreement | Document Relation |
| Notes | Long Text |

---

# 12. OPPORTUNITIES

## 12.1 Opportunities Page

Opportunities adalah modul pengelolaan peluang bisnis.

Satu Company dapat memiliki banyak Opportunities.

Satu Opportunity dapat memiliki beberapa Contacts.

## 12.2 Opportunity Fields

| Field | Type |
|---|---|
| Opportunity ID | UUID |
| Opportunity Name | Text |
| Company | Relation |
| Primary Contact | Contact Relation |
| Opportunity Owner | User |
| Pipeline | Select |
| Stage | Select |
| Deal Value | Currency |
| Probability | Percentage |
| Expected Close Date | Date |
| Source | Select |
| Priority | Select |
| Description | Long Text |

## 12.3 Sales Pipeline

```text
NEW
  ↓
QUALIFICATION
  ↓
NEEDS ANALYSIS
  ↓
PROPOSAL
  ↓
NEGOTIATION
  ↓
WON / LOST
```

Stages harus dapat dikonfigurasi sesuai workspace.

## 12.4 Opportunity Views

- List View.
- Kanban View.
- Forecast View.
- Calendar View.

Kanban cards menampilkan:
- Opportunity Name.
- Company.
- Deal Value.
- Owner.
- Expected Close Date.

---

# 13. ACTIVITIES

## 13.1 Activity Management

Activities adalah seluruh aktivitas komunikasi dan interaksi dengan relasi bisnis.

Jenis activity:

- Call.
- Email.
- Meeting.
- WhatsApp.
- Task.
- Note.
- Follow-up.
- Other.

## 13.2 Activity Fields

| Field | Type |
|---|---|
| Activity ID | UUID |
| Activity Type | Select |
| Subject | Text |
| Description | Long Text |
| Company | Relation |
| Contact | Relation |
| Opportunity | Relation |
| Assigned To | User |
| Due Date | Timestamp |
| Completed At | Timestamp |
| Status | Select |
| Priority | Select |

## 13.3 Activity Timeline

Setiap Company, Contact, Client, Vendor, dan Opportunity memiliki activity timeline.

Timeline menampilkan:

- Created.
- Updated.
- Email sent.
- Call logged.
- Meeting completed.
- Note added.
- File attached.
- Opportunity created.
- Status changed.

## 13.4 Follow-up

Pengguna dapat membuat follow-up langsung dari record.

Contoh:

```text
Follow-up

Contact: Budi Santoso
Company: PT ABC Indonesia

Subject:
Follow up proposal internet dedicated

Due Date:
Tomorrow, 10:00 AM

Assigned To:
Rendy

[Create Follow-up]
```

Follow-up dapat terhubung dengan Task di Kullo.

---

# 14. RECORD DETAIL EXPERIENCE

## 14.1 General Layout

Setiap record menggunakan pola detail yang konsisten.

```text
┌─────────────────────────────────────────────────────────────┐
│ Database / Companies / PT ABC Indonesia                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Logo] PT ABC Indonesia                    Edit   Share     │
│        Technology                                          │
│        Active Client                                        │
│                                                             │
│        Website | Phone | Email                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Overview | Contacts | Opportunities | Activities | Documents │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Record Information             Relationship Information     │
│                                                             │
│ Industry                       Account Owner                 │
│ Company Size                   Relationship Status           │
│ Website                        Client Since                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Recent Activities                                           │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 14.2 Right Details Panel

Klik satu record pada table dapat membuka quick-view side panel.

Side panel menampilkan:
- Name.
- Company.
- Email.
- Phone.
- Status.
- Owner.
- Last Activity.
- Next Follow-up.
- Quick Actions.

Quick actions:
- Edit.
- Call.
- Email.
- Create Task.
- Add Note.
- Create Opportunity.
- Open Full Record.

---

# 15. SEARCH, FILTER & SAVED VIEWS

## 15.1 Global Database Search

Search harus mampu mencari:

- Company Name.
- Contact Name.
- Email.
- Phone.
- Client Code.
- Vendor Code.
- Opportunity Name.
- Website.
- Tags.

Search dapat menampilkan grouped results.

```text
Search: PT ABC

Companies
- PT ABC Indonesia

Contacts
- Budi Santoso
- Sarah Putri

Opportunities
- PT ABC Network Expansion
```

Search results hanya boleh menampilkan data yang dapat diakses pengguna.

## 15.2 Advanced Filters

Filter berdasarkan:

### Company
- Industry.
- Company Size.
- Status.
- Owner.
- Country.
- City.
- Tags.

### Contact
- Company.
- Job Title.
- Department.
- Contact Owner.
- Status.
- Last Contacted.

### Client
- Client Status.
- Client Tier.
- Owner.
- Renewal Date.
- Contract End.

### Vendor
- Vendor Category.
- Vendor Status.
- Vendor Owner.
- Payment Terms.

### Opportunity
- Pipeline.
- Stage.
- Deal Value.
- Owner.
- Expected Close Date.

## 15.3 Saved Views

Pengguna dapat menyimpan filter sebagai custom views.

Contoh:

```text
My Database Views

- All Companies
- My Companies
- Active Clients
- Clients at Risk
- New Leads
- Qualified Leads
- Active Vendors
- Preferred Vendors
- Opportunities Closing This Month
- Overdue Follow-ups
```

Saved views dapat bersifat:
- Personal.
- Shared with Team.
- Workspace-wide.

---

# 16. IMPORT & EXPORT

## 16.1 Import

Kullo Database mendukung import:

- CSV.
- XLSX.

Import workflow:

```text
Upload File
    ↓
Select Data Type
    ↓
Map Columns
    ↓
Validate Data
    ↓
Preview Records
    ↓
Resolve Duplicates
    ↓
Import
    ↓
Import Summary
```

Data types:
- Companies.
- Contacts.
- Clients.
- Leads.
- Vendors.
- Partners.

## 16.2 Column Mapping

Pengguna dapat memetakan kolom file ke field database.

Contoh:

```text
Excel Column           Database Field

Company Name       →   Company Name
Contact Person     →   Contact Name
Email              →   Work Email
Phone              →   Work Phone
Industry           →   Industry
Status             →   Relationship Status
```

## 16.3 Duplicate Detection

Duplicate detection berdasarkan kombinasi:

- Email.
- Phone.
- Company Name.
- Website / Domain.
- Existing Record ID.

Pengguna dapat memilih:
- Skip.
- Update Existing.
- Create New.
- Review Manually.

Nama perusahaan saja tidak selalu cukup untuk menentukan duplikasi.

## 16.4 Export

Export formats:
- CSV.
- XLSX.

Export harus memperhatikan permission dan dapat dibatasi berdasarkan workspace policy.

---

# 17. DATABASE DESIGN SYSTEM

## 17.1 Visual Style

Gunakan gaya Microsoft Fluent 2.

Visual characteristics:
- White / neutral surface.
- Compact data tables.
- Subtle borders.
- Small radius.
- Clean typography.
- Consistent spacing.
- Minimal shadows.
- Contextual menus.
- Professional enterprise interface.

Ikuti warna dan typography dari APP.md.

## 17.2 Components

```text
DatabaseLayout
DatabaseSidebar
DatabaseHeader
DatabaseSearch
DatabaseTable
DatabaseTableToolbar
DatabaseTableRow
DatabaseFilterBuilder
DatabaseSavedViews
DatabaseQuickView
DatabaseDetailPage
DatabaseActivityTimeline
DatabaseRecordForm
DatabaseImportWizard
DatabaseExportDialog
DatabaseEmptyState
DatabaseLoadingState
DatabaseErrorState
```

## 17.3 Interaction Rules

- Inline editing untuk field sederhana.
- Full form untuk data kompleks.
- Right-side panel untuk quick view.
- Dedicated detail page untuk full information.
- Confirmation modal untuk delete.
- Toast untuk success/error.
- Skeleton loading untuk data retrieval.
- Keyboard navigation untuk tabel.
- Multi-select untuk bulk operations.

---

# 18. FORM DESIGN

## 18.1 Add Record Form

Gunakan modal atau side panel untuk data sederhana.

Untuk Company, Contact, Client, Vendor, dan Opportunity yang memiliki banyak field, gunakan dedicated page atau large drawer.

Form harus dibagi menjadi beberapa section.

Contoh Company Form:

```text
Create Company

BASIC INFORMATION
- Company Name
- Legal Name
- Website
- Industry
- Company Type

CONTACT INFORMATION
- Main Email
- Main Phone
- Address
- City
- Province
- Country

BUSINESS RELATIONSHIP
- Relationship Status
- Account Owner
- Source
- Priority
- Tags

ADDITIONAL INFORMATION
- Description
- Notes

[Cancel] [Create Company]
```

## 18.2 Form Behavior

- Required field indicator.
- Inline validation.
- Auto-save where appropriate.
- Duplicate warning.
- Select searchable options.
- Multi-select tags.
- Phone number formatting.
- Email validation.
- URL validation.

Jangan membuat seluruh field wajib diisi.

Field wajib disesuaikan dengan kebutuhan bisnis.

---

# 19. DATABASE RELATIONSHIPS

## 19.1 Entity Relationships

```text
WORKSPACES
    │
    ├── COMPANIES
    │      │
    │      ├── CONTACTS
    │      │
    │      ├── CLIENTS
    │      │
    │      ├── VENDORS
    │      │
    │      ├── PARTNERS
    │      │
    │      └── OPPORTUNITIES
    │
    ├── LEADS
    │
    ├── ACTIVITIES
    │
    └── USERS
```

## 19.2 Relationship Rules

- Company memiliki banyak Contacts.
- Company dapat memiliki banyak Client Relationships.
- Company dapat memiliki banyak Vendor Relationships.
- Company dapat memiliki banyak Partner Relationships.
- Company dapat memiliki banyak Opportunities.
- Contact dapat terhubung dengan banyak Activities.
- Opportunity dapat memiliki banyak Contacts.
- Company dapat memiliki banyak Documents.
- Contact dapat memiliki banyak Activities.
- Lead dapat dikonversi menjadi Company, Contact, dan Opportunity.

Gunakan foreign keys dan referential integrity.

---

# 20. DATABASE SCHEMA

Gunakan PostgreSQL dan ikuti schema utama Kullo.

Rancangan tabel:

```text
companies
contacts
company_contacts
clients
vendors
partners
leads
opportunities
opportunity_contacts
activities
activity_participants
database_tags
database_record_tags
database_saved_views
database_import_jobs
database_import_errors
database_audit_logs
```

## 20.1 companies

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    website TEXT,
    industry VARCHAR(100),
    company_type VARCHAR(100),
    company_size VARCHAR(50),
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(30),
    country VARCHAR(100),
    owner_id UUID,
    source VARCHAR(100),
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);
```

## 20.2 contacts

```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150),
    job_title VARCHAR(150),
    department VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    whatsapp VARCHAR(50),
    linkedin_url TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    owner_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);
```

## 20.3 company_contacts

```sql
CREATE TABLE company_contacts (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    relationship_type VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    reports_to_contact_id UUID REFERENCES contacts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (company_id, contact_id)
);
```

## 20.4 clients

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id),
    client_code VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    client_tier VARCHAR(50),
    segment VARCHAR(100),
    account_owner_id UUID,
    client_since DATE,
    contract_start DATE,
    contract_end DATE,
    renewal_date DATE,
    contract_value NUMERIC(18,2),
    currency CHAR(3),
    payment_terms VARCHAR(100),
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 20.5 vendors

```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id),
    vendor_code VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
    owner_id UUID,
    payment_terms VARCHAR(100),
    currency CHAR(3),
    contract_start DATE,
    contract_end DATE,
    rating NUMERIC(3,2),
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 20.6 partners

```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id),
    partner_code VARCHAR(100),
    partner_type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    owner_id UUID,
    partnership_start DATE,
    partnership_end DATE,
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 20.7 leads

```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    industry VARCHAR(100),
    source VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    score INTEGER,
    estimated_value NUMERIC(18,2),
    currency CHAR(3),
    expected_close_date DATE,
    owner_id UUID,
    converted_company_id UUID REFERENCES companies(id),
    converted_contact_id UUID REFERENCES contacts(id),
    converted_opportunity_id UUID,
    converted_at TIMESTAMPTZ,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 20.8 opportunities

```sql
CREATE TABLE opportunities (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    pipeline VARCHAR(100),
    stage VARCHAR(100),
    value NUMERIC(18,2),
    currency CHAR(3),
    probability NUMERIC(5,2),
    expected_close_date DATE,
    owner_id UUID,
    source VARCHAR(100),
    priority VARCHAR(50),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 20.9 opportunity_contacts

```sql
CREATE TABLE opportunity_contacts (
    id UUID PRIMARY KEY,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    role VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    UNIQUE (opportunity_id, contact_id)
);
```

## 20.10 activities

```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id),
    contact_id UUID REFERENCES contacts(id),
    opportunity_id UUID REFERENCES opportunities(id),
    assigned_to UUID,
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50),
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Schema di atas adalah rancangan awal. Implementasi final harus menyelaraskan tipe UUID, workspace membership, audit fields, soft deletion, dan naming convention dengan database utama Kullo.

---

# 21. DATA SECURITY & PERMISSIONS

## 21.1 Access Control

Setiap record harus memiliki workspace scope.

Pengguna hanya dapat mengakses data yang:
- Berada dalam workspace yang diikutinya.
- Diizinkan oleh role atau permission.
- Tidak dibatasi oleh policy tertentu.

## 21.2 Suggested Roles

| Role | Permission |
|---|---|
| Workspace Owner | Full Access |
| Admin | Manage Database |
| Manager | Manage Team Records |
| Member | Create and Edit Allowed Records |
| Viewer | Read Only |

Permission dapat ditambahkan menjadi granular:

- View Companies.
- Create Companies.
- Edit Companies.
- Delete Companies.
- View Contacts.
- Manage Contacts.
- View Vendors.
- Manage Vendors.
- View Opportunities.
- Manage Opportunities.
- Export Database.
- Import Database.

## 21.3 Sensitive Information

Data sensitif:
- Tax ID.
- Bank Account.
- Personal Contact Information.
- Contract Information.
- Financial Information.

Implementasikan:
- Role-based access.
- Field-level permissions where needed.
- Audit logs.
- Encryption at rest where supported.
- Encryption in transit.
- Restricted export.
- Masked display for sensitive fields.

Jangan menyimpan password, API keys, atau credential vendor sebagai field CRM biasa.

---

# 22. DATA QUALITY & DUPLICATE PREVENTION

## 22.1 Data Validation

Validasi:
- Email format.
- Phone number.
- Website URL.
- Required fields.
- Unique business identifiers.
- Duplicate records.
- Valid foreign keys.
- Workspace ownership.

## 22.2 Duplicate Handling

Sistem perlu mengidentifikasi kemungkinan duplikasi.

Contoh:

```text
Potential Duplicate

PT ABC Indonesia

Existing Record:
PT ABC Indonesia
abc.co.id

New Record:
PT ABC
www.abc.co.id

[Merge] [Keep Both] [Cancel]
```

## 22.3 Merge Records

Merge dapat dilakukan pada:
- Companies.
- Contacts.
- Leads (where appropriate).

Merge harus:
- Mempertahankan record utama.
- Memindahkan relasi.
- Mempertahankan activity history.
- Mempertahankan documents.
- Mempertahankan audit trail.
- Memastikan tidak ada broken references.

Merge tidak boleh menghapus data secara diam-diam.

---

# 23. MOBILE EXPERIENCE

## 23.1 Mobile Layout

Pada mobile, Database harus tetap terasa seperti CRM profesional.

Gunakan:
- Compact contact list.
- Search-first navigation.
- Filter drawer.
- Detail page.
- Bottom sheet actions.
- Quick call.
- Quick email.
- WhatsApp shortcut.
- Add follow-up.
- Create note.

## 23.2 Mobile Contact Card

```text
┌────────────────────────────┐
│ [Avatar] Budi Santoso      │
│          Procurement Mgr   │
│          PT ABC Indonesia  │
│                            │
│          Active Client     │
│                            │
│  Call   Email   WhatsApp   │
└────────────────────────────┘
```

Gunakan card hanya untuk mobile. Desktop tetap menggunakan table-first approach.

---

# 24. IMPLEMENTATION PRIORITIES

## Phase 1 — Core Database

- Database Overview.
- Companies.
- Contacts.
- Clients.
- Leads.
- Vendors.
- Basic CRUD.
- Search.
- Filtering.
- Sorting.
- Company-Contact relationship.
- Basic permissions.
- Detail page.
- Import CSV/XLSX.

## Phase 2 — CRM

- Activities.
- Follow-ups.
- Opportunities.
- Sales Pipeline.
- Client Detail.
- Vendor Detail.
- Saved Views.
- Advanced Search.
- Duplicate Detection.
- Export.

## Phase 3 — Relationship Management

- Partners.
- Relationship Timeline.
- Record Merge.
- Advanced Permissions.
- Audit Logs.
- Project Integration.
- Task Integration.
- Document Integration.
- Contact hierarchy.

## Phase 4 — Enterprise CRM

- Custom Fields.
- Custom Pipelines.
- Advanced Reports.
- Relationship Scoring.
- Automation Rules.
- Advanced Data Governance.
- Advanced Import & Export.
- Configurable Workspace Database.

---

# 25. ACCEPTANCE CRITERIA

### Database Interface
- [ ] Main Database menu tersedia.
- [ ] Overview menampilkan data aktual.
- [ ] Companies menggunakan table view.
- [ ] Contacts menggunakan table view.
- [ ] Clients menggunakan table view.
- [ ] Leads menggunakan table view.
- [ ] Vendors menggunakan table view.
- [ ] Record detail tersedia.
- [ ] Search berfungsi.
- [ ] Filter berfungsi.
- [ ] Sorting berfungsi.
- [ ] Saved views berfungsi.

### Data Management
- [ ] Create Company.
- [ ] Create Contact.
- [ ] Create Client.
- [ ] Create Lead.
- [ ] Create Vendor.
- [ ] Edit Record.
- [ ] Archive Record.
- [ ] Delete Record.
- [ ] Import CSV/XLSX.
- [ ] Export CSV/XLSX.
- [ ] Duplicate detection.

### CRM
- [ ] Activity timeline.
- [ ] Follow-up.
- [ ] Opportunity management.
- [ ] Lead conversion.
- [ ] Client relationship tracking.
- [ ] Vendor relationship tracking.
- [ ] Company-Contact relationship.

### Security
- [ ] Workspace-level access control.
- [ ] Role-based permissions.
- [ ] Sensitive fields protected.
- [ ] Audit log.
- [ ] Export permission.
- [ ] Import permission.
- [ ] No cross-workspace data leakage.

---

# 26. FINAL DESIGN DIRECTION

Kullo Database harus menghadirkan pengalaman CRM yang terasa familiar seperti Parfex CRM, dengan struktur data yang kuat dan scalable.

Fokus utama:

**1. Database First**

Semua client, contact, vendor, partner, dan lead terorganisasi dalam satu pusat data.

**2. Relationship First**

Setiap record terhubung dengan company, contact, activity, opportunity, project, dan document.

**3. Fast and Simple**

Pengguna dapat mencari, membuat, mengubah, dan mengelola data tanpa harus berpindah terlalu banyak halaman.

**4. Enterprise Ready**

Permission, audit logs, data quality, dan security menjadi bagian dari desain sejak awal.

**5. Contextual Collaboration**

Data CRM dapat digunakan di seluruh ekosistem Kullo.

Final product statement:

"Kullo Database — Every relationship, connected to your work."

