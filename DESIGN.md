# KULLO — DESIGN SYSTEM
## Microsoft Fluent 2 Inspired Design Language

**Product:** Kullo Work Management Portal  
**Document:** DESIGN.md  
**Version:** 1.0  
**Design Foundation:** Microsoft Fluent 2  
**Visual Reference:** Microsoft 365, Teams, Planner, SharePoint  
**Platform:** Web Application  
**Primary Language:** Indonesian / English-ready

---

# 1. Design Philosophy

## 1.1. Design Direction

Kullo adopts Microsoft Fluent 2 as its primary design foundation.

The goal is to create an enterprise-grade work management application that feels familiar to Microsoft users while maintaining its own product identity.

Kullo should feel:

- Professional.
- Familiar.
- Clean.
- Structured.
- Functional.
- Consistent.
- Accessible.
- Efficient.

The interface must prioritize productivity rather than decoration.

Users should be able to understand where they are, what they need to do, and what actions they can take without unnecessary complexity.

## 1.2. Design Principles

Follow four primary Fluent design principles.

### 1. Natural on every platform

The interface should adapt naturally to desktop, tablet, and mobile.

- Predictable navigation.
- Familiar interaction patterns.
- Responsive layouts.
- Consistent components.
- Platform-aware behaviors.

### 2. Built for focus

The application must minimize unnecessary visual noise.

- Avoid excessive cards.
- Avoid decorative gradients.
- Avoid oversized typography.
- Prioritize meaningful information.
- Keep actions contextual.
- Use whitespace to establish hierarchy.

### 3. One for all, all for one

Accessibility is part of the design foundation.

- Keyboard navigation.
- Screen reader compatibility.
- Accessible color contrast.
- Visible focus states.
- Responsive typography.
- Clear interaction feedback.

### 4. Unmistakably Kullo

Although inspired by Microsoft, Kullo must have its own identity.

- Use Fluent-inspired components.
- Establish a recognizable Kullo brand accent.
- Maintain consistent interaction patterns.
- Use a unified iconography system.
- Avoid directly copying Microsoft product branding.

---

# 2. Visual Identity

## 2.1. Brand Personality

Kullo is a modern business productivity platform.

| Attribute | Direction |
|---|---|
| Personality | Professional |
| Tone | Friendly and reliable |
| Visual Style | Modern Enterprise |
| Complexity | Minimal |
| Density | Comfortable |
| Interaction | Predictable |
| Experience | Productivity-first |

## 2.2. Brand Color

Kullo uses Microsoft Fluent-inspired blue as its primary brand color.

Primary brand color:

`#0F6CBD`

This is the main accent for primary actions, active navigation, links, and selected states.

### Brand Palette

| Token | Hex | Usage |
|---|---|---|
| Brand Primary | #0F6CBD | Primary actions |
| Brand Hover | #115EA3 | Hover state |
| Brand Pressed | #0C3B5E | Pressed state |
| Brand Light | #EBF3FC | Selected backgrounds |
| Brand Subtle | #F0F6FC | Soft brand surfaces |

## 2.3. Neutral Color System

Neutral colors establish the visual foundation.

| Token | Hex | Usage |
|---|---|---|
| Neutral 0 | #FFFFFF | Main surface |
| Neutral 10 | #FAFAFA | Application background |
| Neutral 20 | #F5F5F5 | Secondary background |
| Neutral 30 | #F0F0F0 | Hover background |
| Neutral 40 | #E8E8E8 | Borders |
| Neutral 50 | #D6D6D6 | Stronger borders |
| Neutral 60 | #ADADAD | Disabled elements |
| Neutral 70 | #8A8A8A | Secondary text |
| Neutral 80 | #616161 | Supporting text |
| Neutral 90 | #424242 | Primary text |
| Neutral 100 | #242424 | Strong emphasis |

Use neutral colors as the majority of the interface.

Blue should be used intentionally to indicate actions and active states, not as a decorative background for every section.

## 2.4. Semantic Colors

| Semantic | Color | Usage |
|---|---|---|
| Success | #107C10 | Completed, approved |
| Success Background | #DFF6DD | Success surface |
| Warning | #FCE100 | Attention |
| Warning Background | #FFF4CE | Warning surface |
| Danger | #D13438 | Error, rejected |
| Danger Background | #FDE7E9 | Error surface |
| Info | #0F6CBD | Informational |
| Info Background | #E5F1FB | Information surface |
| Purple | #8764B8 | In review, owner role, personal calendar |
| Purple Background | #F4F0FA | Purple surface |
| Teal | #038387 | Shared documents, company calendar |
| Teal Background | #E0F4F2 | Teal surface |
| Orange | #CA5010 | High priority, revision requested |
| Orange Background | #FFF1E5 | Orange surface |

Marker accents extend, not replace, the four semantic families. A marker always
uses a dot, chip, icon or left border; it never fills a whole row or card.
`@mention` uses the Kullo brand blue (`#0F6CBD`) with the brand-light surface.

Semantic colors must always be accompanied by meaningful text or icons.

Never communicate status through color alone.

---

# 3. Typography

## 3.1. Primary Typeface

Use Microsoft's Segoe UI font stack.

```css
font-family:
  "Segoe UI",
  "Segoe UI Variable",
  -apple-system,
  BlinkMacSystemFont,
  "Helvetica Neue",
  Arial,
  sans-serif;
```

Use system font fallbacks to maintain a native experience on platforms without Segoe UI.

## 3.2. Typography Scale

| Style | Size | Weight | Line Height |
|---|---:|---:|---:|
| Display | 40px | 600 | 52px |
| H1 | 32px | 600 | 40px |
| H2 | 28px | 600 | 36px |
| H3 | 24px | 600 | 32px |
| H4 | 20px | 600 | 28px |
| H5 | 16px | 600 | 24px |
| Body Large | 16px | 400 | 24px |
| Body | 14px | 400 | 20px |
| Body Strong | 14px | 600 | 20px |
| Caption | 12px | 400 | 16px |
| Small | 11px | 400 | 16px |

## 3.3. Typography Rules

- Use sentence case.
- Avoid unnecessary uppercase headings.
- Use 600 weight for section titles.
- Use 400 weight for normal content.
- Use 500 weight for navigation and metadata.
- Keep descriptions concise.
- Use tabular numerals for dates, counts, and financial values.

Avoid using too many font sizes on one screen.

---

# 4. Spacing System

Use the Fluent-inspired 4px spacing foundation.

## 4.1. Spacing Tokens

| Token | Value |
|---|---:|
| space-0 | 0px |
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-5 | 20px |
| space-6 | 24px |
| space-7 | 28px |
| space-8 | 32px |
| space-10 | 40px |
| space-12 | 48px |
| space-14 | 56px |
| space-16 | 64px |

## 4.2. Application Spacing

| Element | Spacing |
|---|---:|
| Icon and label | 8px |
| Form field gap | 16px |
| Card internal padding | 16px |
| Section spacing | 24px |
| Page content padding | 24px |
| Modal padding | 24px |
| Sidebar item spacing | 4px |

Spacing must be consistent across every module.

---

# 5. Shape, Border & Elevation

## 5.1. Border Radius

| Token | Value | Usage |
|---|---:|---|
| radius-none | 0px | Table dividers |
| radius-small | 4px | Small controls |
| radius-medium | 6px | Buttons and inputs |
| radius-large | 8px | Cards |
| radius-xlarge | 12px | Dialogs |
| radius-circular | 999px | Avatars and pills |

Use moderate corner rounding.

Do not create excessively rounded cards or pill-shaped layouts everywhere.

## 5.2. Borders

Default border:

```css
border: 1px solid #E8E8E8;
```

Rules:

- Use subtle borders.
- Avoid heavy outlines.
- Use dividers to separate related sections.
- Use stronger borders for selected and focused elements.

## 5.3. Elevation

Fluent-inspired elevation should be subtle.

| Level | Usage |
|---|---|
| Level 0 | Default page surfaces |
| Level 1 | Hoverable cards |
| Level 2 | Dropdowns and popovers |
| Level 3 | Modals and dialogs |
| Level 4 | Critical floating overlays |

Example:

```css
--shadow-1: 0 1px 2px rgba(0,0,0,.08);
--shadow-2: 0 2px 4px rgba(0,0,0,.12);
--shadow-3: 0 4px 8px rgba(0,0,0,.14);
```

Avoid persistent shadows on every container.

---

# 6. Application Layout

## 6.1. Main Layout Architecture

Kullo uses a Microsoft 365-inspired application shell.

The layout consists of:

1. Application sidebar.
2. Workspace navigation.
3. Top command bar.
4. Main content area.
5. Optional contextual side panel.

### Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────┐
│ KULLO       Search everything...       Help   Notifications  User│
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│ Dashboard  │  Page Title                       + Create          │
│            │  Breadcrumbs                                         │
│ My Work    │                                                     │
│            │  ┌───────────────────────────────────────────────┐  │
│ Projects   │  │                                               │  │
│            │  │               Main Content                    │  │
│ Tasks      │  │                                               │  │
│            │  │                                               │  │
│ Calendar   │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│ WORKSPACE  │                                                     │
│            │                                                     │
│ Teams      │                                                     │
│ Chat       │                                                     │
│ Documents  │                                                     │
│ Requests   │                                                     │
│ Approvals  │                                                     │
│            │                                                     │
│ MANAGEMENT │                                                     │
│ Reports    │                                                     │
│ Settings   │                                                     │
│            │                                                     │
│ Workspace  │                                                     │
│ Switcher   │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

Owner override (2026-11-09): the page-title row shown above (eyebrow, title, description and the action buttons on that line) is **not rendered** on Dashboard, My Work, Projects, Tasks, Calendar, Teams, Documents, Requests, Approvals, Settings and Reports. The page name is carried by the topbar/sidebar, each page keeps a screen-reader-only `h1`, and creation stays in the header **+** menu or in the page toolbar (`+ Tugas`, `Agenda`, `Buat permintaan`, empty-state actions). Reports keeps **Ekspor CSV** next to the **Terapkan** filter button.

Project detail pages keep the project title and description but no longer show the **Pengaturan** and **+ Tugas** buttons (both are reachable from the project tabs and the board toolbar). The projects list offers a **List / Board** switch next to the department filter; Board keeps the card grid and the cards keep their track width (`repeat(auto-fill, …)`) even when only one project matches, while List is a table of project, status, progress, tasks, members, due date and PM.

## 6.2. Sidebar

The sidebar is the primary navigation component.

**Specifications:**

- Width: 240px.
- Collapsed width: 56px.
- Background: #FAFAFA.
- Border-right: 1px solid #E8E8E8.
- Navigation item height: 36px.
- Icon size: 20px.
- Label size: 14px.

### Navigation Structure

```text
KULLO

MAIN
  Dashboard
  My Work
  Projects
  Tasks
  Calendar

WORKSPACE
  Teams
  Chat
  Documents
  Requests
  Approvals

MANAGEMENT
  Reports
  Settings

BOTTOM
  Workspace Switcher
  User Profile
```

### Sidebar Behavior

- Expand and collapse.
- Active route indicator.
- Hover background.
- Optional notification badge.
- Collapsible navigation groups.
- Workspace switcher.
- Responsive mobile drawer.

Active navigation:

```css
background: #EBF3FC;
color: #0F6CBD;
font-weight: 600;
```

Use a subtle active indicator on the left edge.

## 6.3. Top Command Bar

The top bar contains global actions.

Components:

- Brand / workspace identity.
- Global search.
- Create button.
- Help.
- Notifications.
- User profile.

Specifications:

- Height: 48px.
- Background: #FFFFFF.
- Bottom border: #E8E8E8.
- Horizontal padding: 16px.

Global search should support `Ctrl + K`.

## 6.4. Main Content Area

Specifications:

- Flexible width.
- Background: #FFFFFF.
- Default padding: 24px.
- Maximum content width: 1600px.
- Vertical scrolling within the main application area where appropriate.

Avoid placing every page inside a large rounded card.

Use direct content placement with section dividers and restrained surfaces.

---

# 7. Component Design System

All components must follow a unified design language.

## 7.1. Buttons

### Primary Button

Used for the main action.

```text
┌──────────────────────┐
│  + Create project    │
└──────────────────────┘
```

Specifications:

- Height: 32px.
- Horizontal padding: 12px.
- Background: #0F6CBD.
- Text: #FFFFFF.
- Radius: 6px.
- Font: 14px / 600.

### Secondary Button

- Background: #FFFFFF.
- Border: #D1D1D1.
- Text: #242424.

### Subtle Button

- Background: transparent.
- No visible border.
- Hover background: #F5F5F5.

### Danger Button

- Background: #D13438.
- Text: #FFFFFF.

Button states:

- Default.
- Hover.
- Active.
- Focus.
- Disabled.
- Loading.

Avoid placing multiple primary buttons in the same action group.

## 7.2. Input Fields

Specifications:

- Height: 32px.
- Padding: 8px.
- Border: #D1D1D1.
- Radius: 4px.
- Font: 14px.
- Background: #FFFFFF.

States:

- Default.
- Hover.
- Focus.
- Error.
- Disabled.

Focus state:

```css
border-color: #0F6CBD;
outline: 2px solid rgba(15,108,189,.25);
outline-offset: 1px;
```

Support:

- Text input.
- Textarea.
- Search input.
- Number input.
- Date picker.
- Dropdown.
- Multi-select.
- Checkbox.
- Radio.
- Toggle.

Every input must have a visible label or an accessible name.

## 7.3. Cards

Cards are used for grouped information, not as the default container for everything.

Specifications:

- Background: #FFFFFF.
- Border: 1px solid #E8E8E8.
- Radius: 8px.
- Padding: 16px.
- Minimal elevation.

Card types:

- Metric card.
- Project card.
- Task card.
- Member card.
- Activity card.
- Document card.

## 7.4. Badges & Status Indicators

Use compact status labels.

Examples:

| Status | Appearance |
|---|---|
| To Do | Neutral |
| In Progress | Blue |
| In Review | Purple |
| Done | Green |
| Blocked | Red |
| On Hold | Yellow |

Badge rules:

- Height: 22px.
- Horizontal padding: 8px.
- Radius: 4px.
- Font: 12px / 600.

Keep badge backgrounds subtle.

## 7.5. Avatars

Specifications:

| Size | Dimension |
|---|---:|
| XS | 24px |
| SM | 32px |
| MD | 40px |
| LG | 48px |
| XL | 64px |

Features:

- User photo.
- Initials fallback.
- Online indicator.
- Group avatar.
- Avatar stack.

Use consistent avatar colors and accessible fallback labels.

## 7.6. Dropdown & Popover

Use Fluent-inspired floating surfaces.

- White background.
- 1px border.
- Radius: 8px.
- Shadow: Level 2.
- Item height: 36px.
- Padding: 4px.

Support:

- Keyboard navigation.
- Escape to close.
- Outside click.
- Focus management.
- Selected state.

## 7.7. Dialog & Modal

Use for important interactions.

Examples:

- Create project.
- Delete task.
- Invite member.
- Edit organization.
- Approval confirmation.

Specifications:

- Width: 480px default.
- Maximum width: 640px.
- Radius: 12px.
- Padding: 24px.
- Backdrop: subtle dark overlay.

Modal structure:

```text
┌────────────────────────────────────────────┐
│ Create new project                    [X]  │
├────────────────────────────────────────────┤
│                                            │
│ Project name                               │
│ [______________________________________]   │
│                                            │
│ Description                                │
│ [______________________________________]   │
│                                            │
│ Project manager                            │
│ [ Select member                         ]  │
│                                            │
├────────────────────────────────────────────┤
│                         Cancel   Create    │
└────────────────────────────────────────────┘
```

Delete and destructive actions must require confirmation.

## 7.8. Tabs

Use tabs for related content.

Examples:

- Overview.
- Tasks.
- Members.
- Files.
- Activity.

Specifications:

- Height: 40px.
- Bottom border.
- Active text: #0F6CBD.
- Active underline: 2px.
- Font: 14px / 600.

## 7.9. Tables

Tables are essential for enterprise work management.

Features:

- Column sorting.
- Column filtering.
- Row selection.
- Pagination.
- Search.
- Column resizing.
- Optional column visibility.
- Bulk actions.
- Context menu.

Specifications:

- Header height: 40px.
- Row height: 44px.
- Compact row height: 36px.
- Font: 13–14px.
- Subtle horizontal separators.

Do not use excessive vertical borders.

Selected rows should use a subtle blue background.

---

# 8. Module-Specific Design Patterns

## 8.1. Dashboard

The dashboard must prioritize actionable information.

### Layout

```text
Good morning, Rendy
Here's what's happening with your work today.

[ + Create ] 

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ My Tasks    │ │ In Progress │ │ Completed   │ │ Overdue     │
│ 24          │ │ 08          │ │ 12          │ │ 04          │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

┌──────────────────────────────┐ ┌───────────────────────────┐
│ My Tasks                     │ │ Upcoming Events           │
│                              │ │                           │
│ Task 1                       │ │ Team Meeting              │
│ Task 2                       │ │ Project Review            │
│ Task 3                       │ │                           │
└──────────────────────────────┘ └───────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Recent Activities                                             │
│                                                              │
│ Project updated...                                            │
│ New task assigned...                                          │
│ Document uploaded...                                          │
└──────────────────────────────────────────────────────────────┘
```

### Design Rules

- Greeting uses H3.
- KPI cards remain compact.
- Avoid oversized metric typography.
- Recent activity uses timeline/list presentation.
- Widgets should have independent loading states.
- Users can personalize dashboard widgets in a future release.

## 8.2. My Work

Personal work management should feel focused.

Main layout:

```text
My Work

[Overview] [List] [Board] [Calendar]

Filters:
[Status] [Priority] [Project] [Due date]

Task Name          Project        Priority       Due Date
----------------------------------------------------------
Design homepage   Website        High           Today
Create report     Marketing      Medium         Tomorrow
Review proposal   Sales          Low            Friday
```

Use list view as the default.

Board view should support drag and drop.

## 8.3. Projects

Project overview should provide a clear operational summary.

```text
Project: Website Redesign

Active | High Priority

Overview | Board | List | Timeline | Files | Members

Progress: 68%

[Progress Bar]

Project Information
- Owner
- Manager
- Start date
- Due date

Project Activity

Recent Updates
- Task completed
- New member added
- Deadline updated
```

### Project Board

Kanban design:

```text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ To Do        │ │ In Progress  │ │ Done         │
│ 04           │ │ 03           │ │ 08           │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ Task card    │ │ Task card    │ │ Task card    │
│ Task card    │ │ Task card    │ │ Task card    │
│ Task card    │ │              │ │              │
│ + Add task   │ │ + Add task   │ │ + Add task   │
└──────────────┘ └──────────────┘ └──────────────┘
```

Task cards must show:

- Task title.
- Priority.
- Assignee.
- Due date.
- Comment count.
- Attachment indicator.

Drag-and-drop must have clear visual feedback and must not obscure the target column.

Implementation notes (2026-11-09):

- Every column ends with a composer (`+ Tambahkan kartu`); the column card count sits in the header.
- Column header opens a menu: rename (inline), category (Terbuka/Berjalan/Review/Selesai), move left/right, delete. Deleting a stage that still holds tasks is refused, not silently migrated.
- Card detail adds label chips, checklist x/y and an avatar stack on top of the required fields. At 640px and below, label chips and meta icons are hidden so the card stays legible; due date and assignee remain.
- Cross-project boards merge columns by name; editing is only offered when a column belongs to a single project.

## 8.4. Task Detail

Task details should open as a contextual side panel on desktop.

Suggested width: 600px.

```text
┌──────────────────────────────────────────┐
│ Task #KL-1024                        [X]  │
├──────────────────────────────────────────┤
│                                          │
│ Design homepage                          │
│                                          │
│ Status       In Progress                 │
│ Priority     High                        │
│ Assignee     [Avatar] Rendy              │
│ Due date     12 November                 │
│ Project      Website Redesign            │
│                                          │
│ Description                              │
│ Design the new homepage layout...        │
│                                          │
│ Subtasks                                 │
│ [ ] Header design                        │
│ [x] Color exploration                    │
│ [ ] Responsive layout                    │
│                                          │
│ Attachments                              │
│                                          │
│ Activity & Comments                      │
│                                          │
│ [Write a comment...]                     │
│                                          │
└──────────────────────────────────────────┘
```

The task panel should support editing without navigating away from the current board or list.

Implementation notes (2026-11-09):

- The meta row is Status, Priority, PIC, Due date and Label; Label chips sit to the right of the due date with a compact "+ Label" picker. When a task has no labels nothing is printed (no "no labels" placeholder).
- PIC is a searchable single-select: the control shows the avatar and name, opens a popover with a name filter and a list of project members (plus "Belum ditetapkan"). Typing filters; Escape or an outside click closes.
- Pasting an image (Ctrl+V screenshot) into the discussion composer uploads it immediately as a task attachment, shows a thumbnail with "Terlampir ke tugas", and the attachment list renders image thumbnails.
- Task detail shows **Total waktu**: the span from the task's creation to the moment its status entered the Done category (or to now while it is still open). Reopening a task clears the completion timestamp. Reports use the same values for "Rata-rata durasi" and the weekly completed chart.

## 8.5. Teams

Team directory should use a combination of list and profile cards.

Display:

- Team name.
- Department.
- Team leader.
- Number of members.
- Active projects.

Team details:

- Overview.
- Members.
- Projects.
- Discussions.
- Activity.

## 8.6. Chat

Chat should follow familiar enterprise messaging patterns.

Desktop layout:

```text
┌──────────────┬──────────────────────┬─────────────────────┐
│ Conversations│ Project Discussion  │ Details             │
│              │                      │                     │
│ Search       │ Team discussion      │ Project             │
│              │                      │ Members             │
│ General      │ Messages             │ Files               │
│ Marketing    │                      │                     │
│ Projects     │                      │                     │
│              │                      │                     │
│              │ Message composer     │                     │
└──────────────┴──────────────────────┴─────────────────────┘
```

- Left: conversation list.
- Center: message thread.
- Right: optional conversation details.

Right panel should be collapsible.

Chat must prioritize message readability and avoid unnecessary decorative bubbles.

Implementation notes (2026-11-09):

- Per-message actions (Reaksi, Tugas, Balas, Edit, Hapus) are rendered in the muted text colour so they recede behind the message body; only the active reaction chip keeps the accent tint.
- Editing a message uses the bottom composer instead of replacing the bubble: the composer is prefilled, an "Edit pesan" bar appears with a cancel button, the primary button becomes Simpan (Enter saves), the edited bubble is outlined, and Escape restores the previous draft. No modal and no layout shift.
- The composer hint line was removed; the textarea keeps Enter-to-send, Shift+Enter, @mentions and Ctrl+V image paste without a visible legend.

Channel and membership rules (2026-11-09):

- The chat header shows only the conversation name; the description line is gone.
- New channels are created from the **+** dialog (tab **Kanal**) with a name and one of four icons — tagar, bintang, hati, pin (Discord-style). The chosen icon replaces the default `#` in the list and header.
- Conversation members carry a role (`admin` / `member`). The creator is admin; admins add/remove members and grant or revoke admin. The last admin cannot be demoted or removed (leave is refused with an explanation). Non-admins see the roster read-only and can still leave.
- Adding members uses search-and-select inside the member dialog; the new-conversation dialog keeps its searchable person list.
- The conversation list header is a three-way filter — **Semua / Belum dibaca / Kanal** — replacing the old "Percakapan N" label.

## 8.7. Calendar

Use a Microsoft Outlook-inspired calendar layout.

Views:

- Day.
- Work Week.
- Week.
- Month.
- Agenda.

Calendar events use semantic colors and clear labels.

Provide quick event creation from date selection.

## 8.8. Documents

Use a SharePoint-inspired document library.

Default layout:

```text
Documents

[Search files] [Filter] [Sort] [Upload]

Folders
  Company
  Marketing
  Projects
  Finance

Name                Modified        Owner
--------------------------------------------
Proposal.pdf        Today           Rendy
Report.xlsx         Yesterday       Admin
Brand Guide.pdf     Monday          Design
```

Support:

- List view.
- Grid view.
- Folder navigation.
- Breadcrumbs.
- Context menu.
- Preview panel.
- Permission indicators.

Implementation notes (2026-11-10):

- A document row opens the details panel; the toolbar offers **Arsip** beside **Unggah dokumen**.
- Deleting a document moves it to the archive (`is_trashed` + `deleted_at`); archived files are removed permanently after 30 days (purged when the documents page loads) and can be restored from the archive dialog before that. Permanent delete also removes the stored file and every version file.
- Versioning behaves like "replace file": **Ganti file (versi baru)** uploads a revision and bumps the document version; the previous file is kept as a version (recycle) with its own download link. **Kembalikan versi ini** creates a new current version from an older file, so nothing is overwritten or lost.
- The folder panel has a **+** button (creates a folder inside the current folder); rows and board cards are draggable onto a folder or a breadcrumb segment to move them between folders/up to the root.
- Toolbar cluster: **Arsip · A–Z/Z–A · List/Board · Pilih**. Board view shows live image previews (large type icon otherwise). **Pilih** enables checkboxes and a bulk bar with **Salin**, **Pindah**, **Hapus**; copied/cut items are pasted into the current folder with **Tempel**.
- The page sticks to the pre-Drive layout (summary cards, search toolbar, folder sidebar, list rows, details panel); docs/specs/DRIVE.md is not applied.

## 8.9. Requests & Approvals

Approval pages should prioritize decisions.

Main layout:

```text
Approvals

[Pending] [Approved] [Rejected] [All]

Request
Requester
Department
Submitted
Status
Action
```

Approval detail should clearly show:

- Request information.
- Requester.
- Attached documents.
- Approval history.
- Current approval step.
- Approve / Reject / Request revision.

Destructive or irreversible decisions require confirmation.

## 8.10. Reports

Reports should use a clean Microsoft 365 analytics-inspired approach.

- Compact KPI summaries.
- Clear charts.
- Date range filters.
- Department and project filters.
- Export actions.
- Descriptive legends.
- Accessible chart labels.

Avoid unnecessary visualizations.

Every chart must answer a meaningful business question.

## 8.11. Authentication screens

Login, registration and invitation acceptance are full-screen entry screens,
outside the marketing header/footer (`src/app/(auth)`).

- Centered composition: Kullo logo above a 468px form card, small brand
  signature and legal links below.
- Neutral `--canvas` background, white card, 1px `--border`, no gradients or
  oversized decorative shadows. Primary action uses `--accent`.
- Two 2D SVG illustrations sit directly on the canvas in the bottom corners
  (no white card). They are unDraw files recoloured with DESIGN §2 brand/neutral
  values only; source and licence are recorded in
  `public/illustrations/README.md`. Illustrations are decorative (`aria-hidden`)
  and hidden below 1100px.
- Heading centered, labels left-aligned, primary button full width. The demo
  account block appears only on login.
- Mobile: single column, corner illustrations hidden, card fills the available
  width; no horizontal overflow.
- `/masuk`, `/daftar`, `/gabung`; the route group sets `robots: noindex`.

---

# 9. Iconography

Use a consistent Fluent-inspired icon system.

Recommended icon source:

**Fluent UI System Icons**

Official resources:
https://github.com/microsoft/fluentui-system-icons

Guidelines:

- Prefer outline icons for default states.
- Use filled icons for selected states where appropriate.
- Default icon size: 20px.
- Small icon size: 16px.
- Large icon size: 24px.
- Use consistent stroke and visual weight.
- Avoid mixing multiple icon families.

Suggested icon mapping:

| Feature | Icon |
|---|---|
| Dashboard | Grid |
| My Work | Checkmark Circle |
| Projects | Folder |
| Tasks | Clipboard Task |
| Calendar | Calendar |
| Teams | People |
| Chat | Chat |
| Documents | Document |
| Requests | Clipboard |
| Approvals | Checkmark Circle |
| Reports | Chart |
| Settings | Settings |
| Search | Search |
| Notifications | Alert |

Icons must always have accessible labels when their purpose is not obvious.

---

# 10. Interaction & Motion

Kullo uses subtle motion to provide interaction feedback.

## 10.1. Animation Principles

- Fast.
- Purposeful.
- Subtle.
- Consistent.
- Non-distracting.

## 10.2. Motion Tokens

| Token | Duration | Usage |
|---|---:|---|
| Instant | 0ms | Immediate state |
| Fast | 100ms | Hover |
| Normal | 200ms | Dropdown |
| Moderate | 250ms | Dialog |
| Slow | 300ms | Panel transition |

Use ease-out for entering elements and ease-in for exiting elements.

## 10.3. Interaction States

Every interactive component must support:

1. Default.
2. Hover.
3. Focus.
4. Active.
5. Selected.
6. Disabled.
7. Loading.
8. Error.

## 10.4. Microinteractions

Examples:

- Button hover.
- Sidebar active indicator.
- Dropdown transition.
- Toast notifications.
- Kanban drag feedback.
- Checkbox animation.
- Loading skeleton.
- Progress indicator.

Respect `prefers-reduced-motion`.

---

# 11. Dark Mode

Dark mode should follow Fluent dark theme principles.

Suggested dark palette:

| Token | Hex |
|---|---|
| Background | #1F1F1F |
| Surface | #292929 |
| Surface Secondary | #333333 |
| Border | #424242 |
| Text Primary | #FFFFFF |
| Text Secondary | #D1D1D1 |
| Muted | #A0A0A0 |
| Brand | #479EF5 |

Rules:

- Preserve semantic colors.
- Maintain accessible contrast.
- Do not simply invert light-mode colors.
- Use semantic tokens for every component.
- Ensure charts and badges remain readable.

Theme options:

- Light.
- Dark.
- System.

Light mode is the default.

---

# 12. Responsive Design

Kullo is desktop-first but must be fully responsive.

## 12.1. Breakpoints

| Device | Width |
|---|---:|
| Small Mobile | 320–479px |
| Mobile | 480–639px |
| Large Mobile / Small Tablet | 640–1023px |
| Desktop | 1024–1365px |
| Large Desktop | 1366–1919px |
| Extra Large | 1920px+ |

## 12.2. Responsive Behavior

### Desktop

- Expanded sidebar.
- Full navigation.
- Multi-column dashboard.
- Full Kanban board.
- Side-panel task detail.
- Three-column chat.

### Tablet

- Collapsible sidebar.
- Reduced dashboard columns.
- Horizontal scrolling for wide Kanban boards.
- Simplified table controls.
- Two-column chat where appropriate.

### Mobile

- Navigation drawer or compact navigation.
- Single-column content.
- Full-screen task detail.
- Compact task list.
- Simplified calendar.
- Single-column chat.
- Touch-friendly controls.
- Sticky primary actions where necessary.

No essential feature should become inaccessible on mobile.

---

# 13. Accessibility Standards

Target WCAG 2.1 AA.

Requirements:

- Normal text contrast: minimum 4.5:1.
- Large text contrast: minimum 3:1.
- Interactive component contrast: minimum 3:1.
- Keyboard accessibility.
- Visible focus indicators.
- Logical heading hierarchy.
- Semantic HTML.
- Accessible form labels.
- Screen reader support.
- Focus trapping in modal dialogs.
- Escape key to close dismissible overlays.
- No color-only status communication.
- Support text zoom up to 200%.
- Reflow without content loss at 320px viewport width.

All critical workflows must be usable without a mouse.

---

# 14. Empty, Loading & Error States

Every module must have consistent system states.

## 14.1. Empty State

Example:

```text
No projects yet

Create your first project and start
organizing your team's work.

[ + Create project ]
```

Use a small illustration or icon only when it improves comprehension.

## 14.2. Loading State

Use skeleton loaders for:

- Dashboard widgets.
- Task lists.
- Project details.
- Member lists.
- Document tables.

Avoid full-page loading when only one section is loading.

## 14.3. Error State

Example:

```text
Something went wrong

We couldn't load this information.

[ Try again ]
```

Error messages should explain what happened and how to recover.

## 14.4. Toast Notifications

Use toast feedback for:

- Task created.
- Project updated.
- Document uploaded.
- Changes saved.
- Request submitted.
- Approval completed.

Keep messages concise and actionable.

---

# 15. Design Tokens Implementation

All design values should be stored as reusable tokens.

Do not hardcode colors, typography, spacing, and border radii throughout individual components.

Example CSS implementation:

```css
:root {
  /* Brand */
  --color-brand-primary: #0F6CBD;
  --color-brand-hover: #115EA3;
  --color-brand-pressed: #0C3B5E;
  --color-brand-subtle: #EBF3FC;

  /* Neutral */
  --color-neutral-background: #FAFAFA;
  --color-neutral-surface: #FFFFFF;
  --color-neutral-surface-secondary: #F5F5F5;
  --color-neutral-border: #E8E8E8;
  --color-neutral-text: #242424;
  --color-neutral-text-secondary: #616161;
  --color-neutral-text-muted: #8A8A8A;

  /* Semantic */
  --color-success: #107C10;
  --color-warning: #FCE100;
  --color-danger: #D13438;
  --color-info: #0F6CBD;

  /* Typography */
  --font-family:
    "Segoe UI",
    "Segoe UI Variable",
    -apple-system,
    BlinkMacSystemFont,
    Arial,
    sans-serif;

  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 32px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 999px;

  /* Layout */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 56px;
  --topbar-height: 48px;
  --page-padding: 24px;

  /* Borders */
  --border-default: 1px solid #E8E8E8;
}
```

Dark theme must override semantic tokens rather than requiring individual components to define separate colors.

---

# 16. Component Architecture

Create reusable UI components.

Suggested structure:

```text
components/
│
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Switch
│   ├── Badge
│   ├── Avatar
│   ├── Tooltip
│   ├── Dropdown
│   ├── Popover
│   ├── Dialog
│   ├── Drawer
│   ├── Tabs
│   ├── Table
│   ├── Pagination
│   ├── Toast
│   └── Skeleton
│
├── layout/
│   ├── AppShell
│   ├── Sidebar
│   ├── Topbar
│   ├── PageHeader
│   ├── Breadcrumb
│   └── WorkspaceSwitcher
│
├── dashboard/
│   ├── MetricCard
│   ├── ActivityFeed
│   ├── UpcomingEvents
│   └── TaskSummary
│
├── projects/
│   ├── ProjectCard
│   ├── ProjectHeader
│   ├── ProjectBoard
│   ├── ProjectList
│   └── ProjectTimeline
│
├── tasks/
│   ├── TaskCard
│   ├── TaskRow
│   ├── TaskDetailPanel
│   ├── TaskStatus
│   └── TaskPriority
│
└── collaboration/
    ├── ChatWindow
    ├── MessageBubble
    ├── CommentThread
    └── MemberStack
```

All modules must consume the same shared UI components.

Do not create different button, input, or badge styles for individual modules.

---

# 17. Frontend Implementation Guidelines

The design system should be implemented using the following approach:

1. Define global CSS variables.
2. Build the application shell.
3. Implement reusable Fluent-inspired UI components.
4. Establish typography and spacing rules.
5. Implement shared layout patterns.
6. Build module-specific components.
7. Add interaction states.
8. Implement responsive behavior.
9. Add light and dark themes.
10. Run accessibility checks.

The existing PRD proposes React, TypeScript, React Router, and Bootstrap 5.

For consistency:

- Bootstrap 5 can be used for responsive grid and basic utilities.
- Kullo's CSS variables must override generic Bootstrap visual defaults.
- Do not mix Bootstrap's default component appearance with Fluent styling.
- Implement Kullo's own component layer.
- Alternatively, Fluent UI React can be evaluated if adopting Microsoft's component library is preferable to maintaining custom components.

Do not introduce Tailwind as the primary styling system.

---

# 18. Design Quality Checklist

Before completing any page, verify the following.

### Visual

- [ ] Uses Kullo color tokens.
- [ ] Uses Segoe UI typography.
- [ ] Follows spacing system.
- [ ] Consistent border radius.
- [ ] Consistent icon family.
- [ ] No unnecessary gradients.
- [ ] No excessive shadows.
- [ ] Clear information hierarchy.

### Functional

- [ ] Buttons have correct states.
- [ ] Inputs have validation states.
- [ ] Dropdowns work with keyboard.
- [ ] Modals manage focus.
- [ ] Navigation indicates active page.
- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.

### Responsive

- [ ] Desktop layout works.
- [ ] Tablet layout works.
- [ ] Mobile layout works.
- [ ] Tables have mobile alternatives.
- [ ] Sidebar adapts.
- [ ] No unwanted horizontal overflow.

### Accessibility

- [ ] Contrast passes WCAG AA.
- [ ] Keyboard navigation works.
- [ ] Focus indicator is visible.
- [ ] Form labels are accessible.
- [ ] Icons have accessible names.
- [ ] Status is not communicated by color alone.

---

# 19. Final Design Direction

Kullo must look and feel like a modern Microsoft enterprise productivity application.

The experience should combine:

- The familiarity of Microsoft 365.
- The communication patterns of Microsoft Teams.
- The task organization of Microsoft Planner.
- The document organization of SharePoint.
- The design consistency of Fluent 2.

However, Kullo should remain simpler and more focused.

**Avoid:**

- Excessive gradients.
- Glassmorphism.
- Neon colors.
- Oversized rounded cards.
- Decorative dashboard widgets.
- Unnecessary animations.
- Inconsistent icon libraries.
- Excessive whitespace that hides useful information.
- Excessive visual density.

**The final design objective:**

A clean, structured, familiar, and powerful enterprise workspace where people can manage their entire working day without feeling overwhelmed.

---

# 20. Official Design References

Use these official Microsoft resources as the source of truth when implementing or extending the design system.

1. Fluent 2 Design System  
   https://fluent2.microsoft.design/

2. Fluent 2 Design Tokens  
   https://fluent2.microsoft.design/design-tokens/

3. Fluent 2 Color System  
   https://fluent2.microsoft.design/color

4. Fluent 2 Typography  
   https://fluent2.microsoft.design/typography

5. Fluent 2 Layout  
   https://fluent2.microsoft.design/layout

6. Fluent 2 Design Principles  
   https://fluent2.microsoft.design/design-principles

7. Fluent 2 Accessibility  
   https://fluent2.microsoft.design/accessibility

8. Fluent UI React  
   https://react.fluentui.dev/

9. Fluent UI System Icons  
   https://github.com/microsoft/fluentui-system-icons

**Design System:** Microsoft Fluent 2  
**Product Identity:** Kullo  
**Version:** 1.0

*Work Together. Move Forward.*
---

# 21. Implementation Notes (Kullo repository)

This appendix maps the design system above to the actual code. It does not change any rule in §1–§20.

## 21.1 Token locations

- CSS custom properties: `src/app/globals.css` (`:root` light, `.dark` dark theme).
- Documented tokens for tooling/contrast: `replica/design/tokens.json`.
- Fluent 2 rule values are implemented as: `--accent` `#0F6CBD`, `--accent-hover` `#115EA3`, `--accent-soft` `#EBF3FC`, neutrals `#FAFAFA`/`#F5F5F5`/`#E8E8E8`/`#242424`/`#616161`, semantic colours from §2.4.

## 21.2 Two accessibility corrections

1. **Control border** — §7.2 specifies `#D1D1D1` for input borders. That is below the 3:1 non-text contrast required by WCAG 1.4.11, so form controls use `#8A8A8A` (`--border-input`). Visual weight stays light; contrast passes.
2. **Badge text** — badge surfaces use the §2.4 backgrounds, but text uses darker `-ink` variants (`#0B6A0B`, `#6B5900`, `#A4262C`) so 12 px labels reach AA. The visible hues remain the semantic ones.

## 21.3 Segoe UI

`Segoe UI` is used strictly as a **system font stack** (no font files are bundled or downloaded). On platforms without it, the stack falls back to `-apple-system`, `BlinkMacSystemFont`, `Helvetica Neue`, `Arial`, `sans-serif`. This keeps licensing clean and the Fluent 2 look on Windows.

## 21.4 CSS variable mapping

| DESIGN.md token | CSS variable |
| --- | --- |
| Brand Primary / Hover / Light | `--accent` / `--accent-hover` / `--accent-soft` |
| Neutral 0 / 10 / 20 / 40 | `--bg` / `--canvas` / `--surface` / `--border` |
| Neutral 90 / 80 | `--text` / `--text-muted` |
| Success / Warning / Danger (+ bg) | `--success`/`--success-soft`, `--warning`/`--warning-soft`, `--danger`/`--danger-soft` |
| Radius small / medium / large / xlarge | `--radius-xs` (4) / `--radius-sm` (6) / `--radius-md` (8) / `--radius-lg` (12) |
| Elevation 1 / 2 / 3 | `--shadow-hover` / `--shadow-2` / `--shadow-pop` |
| Sidebar / topbar / page padding | `--sidebar` (240) / `--header` (48) / `.app-content` 24px |

Dark theme overrides the same semantic variables (§11), so components never branch on theme.

---

# 22. Application Theme — Trello-inspired workspace (owner directive, 2026-11-09)

Scope: **application only** (`/app/*`, the AppShell). Marketing pages keep the Fluent 2 theme above. Reference: Trello/Atlassian visual principles (changing colour, density, board feel) — no Atlassian assets, logos or code.

## 22.1 Rationale

Operators sit in the app for long sessions. The workspace uses a calm grey canvas, white cards and a saturated blue chrome, with lower visual noise and denser information than the marketing site — the Trello/Atlassian "board" reading pattern.

## 22.2 Tokens (scoped to `.app-body`)

| Token | Light | Dark |
|---|---|---|
| Canvas | `#F4F5F7` | `#1D2125` |
| Surface / card | `#FFFFFF` | `#22272B` |
| Surface secondary | `#F7F8F9` / `#EBECF0` | `#282E33` / `#2C333A` |
| Border | `#DFE1E6` | `#38414A` |
| Text | `#172B4D` | `#DEE4EA` |
| Muted | `#44546F` | `#9FADBC` |
| Accent | `#0C66E4` | `#579DFF` |
| Accent soft | `#E9F2FF` | `#1C2B41` |
| Success | `#22A06B` / soft `#DCFFF1` | `#4BCE97` / `#1C3329` |
| Warning | `#E2B203` / soft `#FFF7D6` | `#F5CD47` / `#332E1B` |
| Danger | `#C9372C` / soft `#FFECEB` | `#F87168` / `#42221F` |

Chrome: light top command bar uses the brand blue with white icons; dark uses the neutral canvas. Sidebar is white (light) / `#22272B` (dark).

## 22.3 Theme switch

- `<html data-app-theme="light|dark">`, persisted in `localStorage["kullo:theme"]`.
- Initialised by a blocking script in `src/app/(app)/layout.tsx` from storage, falling back to `prefers-color-scheme`.
- **The header toggle was removed on owner request (2026-11-09).** The app now follows the stored preference if present, otherwise the system preference; there is no in-app switch.
- Top command bar no longer shows the organisation name (owner request); it shows the current page label only.
- Sidebar is collapsible on desktop (≤1023px it becomes a drawer): a `PanelLeft` control collapses it to a 56px icon rail; the state persists in `localStorage["kullo:sidebar"]`.

## 22.4 Density

- Page padding 16/20 desktop, 12 mobile; panel header 40px; panel body 12px (10/12 mobile); table rows 36–40px; page title 22/28 (20 mobile); dashboard grid gap 12px.
- Dashboard "Aksi cepat" panel is hidden on ≤640px — the header **+** menu is the single quick-create entry point on mobile.

## 22.5 Contrast (verified)

Text 12.9:1 / muted 7.0:1 on the light canvas; 12.6:1 / 7.1:1 in dark; accent 5.2:1 on white and 5.9:1 on the dark canvas; badge pairs 5.5–10.9:1. All AA, most AAA.
