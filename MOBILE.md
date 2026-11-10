# KULLO — MOBILE DESIGN & EXPERIENCE
## Mobile Application Specification

**Product:** Kullo Work Management Portal  
**Document:** MOBILE.md  
**Version:** 1.0  
**Design Foundation:** Microsoft Fluent 2  
**Platform:** Responsive Web Application / PWA-ready  
**Primary Framework:** React + TypeScript  
**Styling:** Fluent-inspired CSS + Bootstrap 5 utilities

---

# 1. Mobile Experience Philosophy

## 1.1. Overview

Kullo Mobile merupakan pengalaman mobile dari Kullo Work Management Portal.

Mobile interface harus memungkinkan pengguna mengakses pekerjaan, berkomunikasi dengan tim, memperbarui task, memantau proyek, dan memberikan approval secara praktis melalui smartphone.

Mobile tidak boleh hanya menjadi desktop interface yang diperkecil.

Kullo harus memiliki mobile interaction patterns sendiri dengan tetap mempertahankan konsistensi visual Fluent 2.

**Core Philosophy:**

"Your workspace, wherever work happens."

## 1.2. Design Principles

### 1. Mobile First Interaction

Setiap fitur harus dirancang dengan mempertimbangkan penggunaan satu tangan.

- Large touch targets.
- Bottom navigation.
- Bottom sheets.
- Full-screen detail views.
- Simple navigation.
- Minimal typing.

### 2. Content Priority

Tampilkan informasi yang paling penting terlebih dahulu.

- Task status.
- Task deadline.
- Assignee.
- Project progress.
- Pending approvals.
- Unread messages.

### 3. Native-Like Experience

Web app harus terasa seperti aplikasi mobile.

- Smooth transitions.
- Sticky navigation.
- Pull-to-refresh where supported.
- Responsive drawers.
- Touch-friendly interactions.
- PWA compatibility.

### 4. Consistent Fluent Design

Pertahankan identitas Fluent 2.

- Segoe UI typography.
- Microsoft-inspired color system.
- Consistent iconography.
- Subtle borders.
- Clear component hierarchy.
- Accessible interaction states.

---

# 2. Mobile Breakpoints

Gunakan breakpoint berikut.

| Device | Width | Layout |
|---|---:|---|
| Small Mobile | 320–374px | Compact |
| Standard Mobile | 375–430px | Primary |
| Large Mobile | 431–639px | Expanded |
| Tablet | 640–767px | Adaptive |
| Small Desktop | 768–1023px | Tablet/Desktop |
| Desktop | 1024px+ | Desktop Layout |

Mobile experience menjadi prioritas pada viewport 375–430px.

Semua halaman harus tetap usable pada lebar 320px.

Gunakan CSS media queries dan responsive components, bukan membuat aplikasi mobile yang terpisah dari frontend utama.

---

# 3. Mobile Application Architecture

## 3.1. Mobile Navigation

Mobile menggunakan bottom navigation dengan lima menu utama.

```text
┌───────────────────────────────────────┐
│                                       │
│                                       │
│            MAIN CONTENT               │
│                                       │
│                                       │
│                                       │
├───────────────────────────────────────┤
│                                       │
│ Home   My Work  Projects  Chat  More  │
│  ◉       ✓        ▣       ◌     •••   │
│                                       │
└───────────────────────────────────────┘
```

### Bottom Navigation Items

| Menu | Icon | Destination |
|---|---|---|
| Home | Home | Dashboard |
| My Work | Checkmark Circle | Personal Tasks |
| Projects | Folder | Projects |
| Chat | Chat | Conversations |
| More | Grid | Additional Modules |

### Navigation Rules

- Height: 64px plus safe-area inset.
- Background: #FFFFFF.
- Top border: #E8E8E8.
- Icons: 22px.
- Labels: 11px.
- Active color: #0F6CBD.
- Inactive color: #616161.

Active navigation must have a clear visual indicator.

Bottom navigation must remain accessible when scrolling.

### More Menu

The More menu opens a full-height navigation drawer or dedicated navigation page.

Items:

- Calendar.
- Teams.
- Documents.
- Requests.
- Approvals.
- Reports.
- Notifications.
- Settings.
- Workspace Switcher.
- User Profile.

The More page should group navigation items by category.

---

# 4. Mobile Application Layout

## 4.1. Header

Mobile header replaces the desktop command bar.

```text
┌───────────────────────────────────────┐
│ [Logo] Kullo          [Search] [Bell]  │
├───────────────────────────────────────┤
│                                       │
│ Page Content                          │
│                                       │
└───────────────────────────────────────┘
```

Specifications:

- Height: 56px.
- Horizontal padding: 16px.
- Background: #FFFFFF.
- Bottom border: #E8E8E8.
- Sticky position.
- Logo height: 24px.

### Header Actions

Depending on the current module:

- Search.
- Notifications.
- Profile.
- More actions.

Avoid placing too many icons in the header.

## 4.2. Page Header

```text
┌───────────────────────────────────────┐
│ My Work                               │
│ Your personal workspace               │
│                                       │
│ [Today] [Upcoming] [Completed]        │
└───────────────────────────────────────┘
```

Page headers should be compact.

- Title: 22px / 600.
- Description: 13px.
- Vertical spacing: 12px.
- Primary action positioned contextually.

## 4.3. Content Container

```css
.mobile-page {
  width: 100%;
  min-height: 100%;
  padding: 16px;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  overflow-x: hidden;
}
```

Rules:

- Default horizontal padding: 16px.
- Section spacing: 24px.
- Card padding: 14–16px.
- Avoid fixed-width desktop containers.
- Avoid unnecessary horizontal scrolling.
- Support device safe areas.

---

# 5. Mobile Dashboard

## 5.1. Dashboard Objective

Dashboard should answer three questions:

1. What do I need to do today?
2. What is happening with my team?
3. What needs my attention?

The mobile dashboard must prioritize actionable information.

## 5.2. Dashboard Layout

```text
┌───────────────────────────────────────┐
│ Kullo                    Search  Bell │
├───────────────────────────────────────┤
│                                       │
│ Good morning, Rendy                   │
│ Here's your work overview.            │
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ My Tasks                          │ │
│ │ 12 Tasks                          │ │
│ │ 04 Due Today                      │ │
│ └───────────────────────────────────┘ │
│                                       │
│ ┌────────────────┐ ┌────────────────┐ │
│ │ In Progress    │ │ Completed      │ │
│ │ 08             │ │ 24             │ │
│ └────────────────┘ └────────────────┘ │
│                                       │
│ Today's Priorities             See all│
│ ┌───────────────────────────────────┐ │
│ │ Design Homepage                   │ │
│ │ Website Redesign                  │ │
│ │ In Progress         Today         │ │
│ ├───────────────────────────────────┤ │
│ │ Prepare Marketing Report          │ │
│ │ Marketing                         │ │
│ │ To Do               Tomorrow      │ │
│ └───────────────────────────────────┘ │
│                                       │
│ Upcoming Events                       │
│ Team Meeting              10:00 AM    │
│                                       │
├───────────────────────────────────────┤
│ Home  My Work Projects Chat More      │
└───────────────────────────────────────┘
```

## 5.3. Dashboard Components

**Greeting Section**

- Personalized greeting.
- Current date.
- Optional organization name.

**Task Summary**

- My Tasks.
- Due Today.
- In Progress.
- Completed.

**Today's Priorities**

List of urgent and upcoming tasks.

**Upcoming Events**

Show the next three events.

**Recent Activities**

Show recent important changes.

### Dashboard Rules

- Use a single-column layout by default.
- Use two-column metric cards where space allows.
- Avoid desktop-style multi-column grids.
- Prioritize urgent tasks.
- Allow quick navigation to detailed modules.

---

# 6. My Work Mobile

My Work is one of the most important mobile modules.

It must be optimized for frequent task updates.

## 6.1. My Work Navigation

```text
My Work

[Today] [Upcoming] [Completed]

[Search tasks...]

[All] [Priority] [Project]

Task List
```

Use horizontally scrollable filter chips when necessary.

## 6.2. Task Card

```text
┌───────────────────────────────────────┐
│ Design homepage                    •••│
│ Website Redesign                      │
│                                       │
│ [In Progress]          [High]         │
│                                       │
│ [Avatar] Rendy            Today       │
└───────────────────────────────────────┘
```

Task cards should contain:

- Task title.
- Project name.
- Status.
- Priority.
- Assignee.
- Due date.

Avoid displaying too many metadata fields.

## 6.3. Task Quick Actions

Task card actions:

- Mark complete.
- Change status.
- Change priority.
- Open details.
- Add comment.

Use a contextual bottom sheet for secondary actions.

Do not use hover-dependent interactions on mobile.

## 6.4. Task Detail

On mobile, task details should open as a full-screen page rather than a desktop side panel.

```text
┌───────────────────────────────────────┐
│ ← Task Details                   •••  │
├───────────────────────────────────────┤
│                                       │
│ Design Homepage                       │
│ KL-1024                               │
│                                       │
│ [In Progress]        [High Priority]  │
│                                       │
│ Description                           │
│ Design the new homepage layout...     │
│                                       │
│ Assigned To                           │
│ [Avatar] Rendy                        │
│                                       │
│ Project                               │
│ Website Redesign                      │
│                                       │
│ Due Date                              │
│ 12 November 2026                      │
│                                       │
│ Subtasks                              │
│                                       │
│ [ ] Header design                     │
│ [x] Color exploration                 │
│ [ ] Responsive layout                 │
│                                       │
│ Attachments                           │
│                                       │
│ Activity                              │
│                                       │
│ [Write a comment...]                  │
│                                       │
├───────────────────────────────────────┤
│ [Update Status]                       │
└───────────────────────────────────────┘
```

### Task Detail Behavior

- Back navigation returns to the previous context.
- Task updates should save without requiring a complete page reload.
- Use inline editing where appropriate.
- Show a sticky bottom action when the task requires a primary action.
- Comments should be accessible without excessive scrolling.

---

# 7. Project Management Mobile

## 7.1. Project List

```text
Projects                          [+]

[Search projects...]

[All] [Active] [Completed]

┌───────────────────────────────────────┐
│ Website Redesign                      │
│ Marketing Department                  │
│                                       │
│ [Active]             68% Complete     │
│ █████████████░░░░░░                  │
│                                       │
│ [Avatar] [Avatar] +3       12 Nov     │
└───────────────────────────────────────┘
```

Project cards must display:

- Project name.
- Department.
- Status.
- Progress.
- Members.
- Deadline.

## 7.2. Project Detail

Project detail uses full-screen navigation.

```text
┌───────────────────────────────────────┐
│ ← Projects                       •••  │
├───────────────────────────────────────┤
│ Website Redesign                      │
│                                       │
│ [Active]                              │
│                                       │
│ Overview | Tasks | Members | Files    │
│                                       │
│ Progress                              │
│ 68%                                   │
│ █████████████░░░░░░                  │
│                                       │
│ Project Information                   │
│ Manager: Rendy                        │
│ Deadline: 12 November                 │
│ Members: 8                             │
│                                       │
│ Recent Activity                       │
│                                       │
└───────────────────────────────────────┘
```

## 7.3. Project Board

Kanban boards must adapt for narrow screens.

Recommended behavior:

- Horizontal scrolling between columns.
- Fixed column width: 280px.
- Touch-friendly drag and drop.
- Alternative move-status action.
- Clear drag feedback.

On small mobile devices, offer List View as the default.

Do not force users to use a compressed three-column Kanban board.

## 7.4. Project Views

| View | Mobile Behavior |
|---|---|
| Overview | Single column |
| Board | Horizontal scroll |
| List | Responsive list |
| Timeline | Simplified timeline |
| Files | List view |
| Members | Member list |
| Activity | Vertical timeline |

---

# 8. Chat Mobile

Chat must feel familiar to smartphone messaging users.

## 8.1. Conversation List

```text
┌───────────────────────────────────────┐
│ Chat                            [+]   │
├───────────────────────────────────────┤
│ [Search conversations...]             │
│                                       │
│ [Avatar] General                      │
│          Team announcements           │
│          09:30 AM                     │
│                                       │
│ [Avatar] Marketing Team        (2)    │
│          New campaign update          │
│          08:45 AM                     │
│                                       │
│ [Avatar] Website Redesign             │
│          Please review the design     │
│          Yesterday                    │
│                                       │
├───────────────────────────────────────┤
│ Home  My Work Projects Chat More      │
└───────────────────────────────────────┘
```

## 8.2. Chat Conversation

```text
┌───────────────────────────────────────┐
│ ← Marketing Team                 •••  │
│    8 members                           │
├───────────────────────────────────────┤
│                                       │
│ [Avatar] Andi                         │
│ Hi team, here's the update...         │
│                                       │
│                      [You]            │
│                      Thanks!          │
│                                       │
│ [Avatar] Sarah                        │
│ The design is ready for review.       │
│                                       │
├───────────────────────────────────────┤
│ [+] [Write a message...]        [Send]│
└───────────────────────────────────────┘
```

### Chat Requirements

- Full-screen conversation.
- Sticky message composer.
- Keyboard-aware layout.
- Image and file attachments.
- Reply to messages.
- Mentions.
- Reactions.
- Unread markers.
- Message timestamps.
- Infinite scrolling for message history.

The message composer must remain visible when the mobile keyboard opens.

## 8.3. Chat Interactions

Long press on a message opens an action sheet:

- Reply.
- Copy.
- React.
- Edit.
- Delete.
- Forward.

Actions must respect message ownership and permissions.

---

# 9. Calendar Mobile

Calendar should use a simplified mobile layout.

## 9.1. Calendar Views

- Agenda: default.
- Day.
- Week.
- Month.

Agenda view should be the default on small screens.

## 9.2. Calendar Layout

```text
Calendar                           [+]

November 2026

[Day] [Week] [Month] [Agenda]

MON  TUE  WED  THU  FRI
 09   10   11   12   13

Upcoming Events

09:00  Team Meeting
10:30  Project Review
14:00  Marketing Discussion
```

### Features

- Create event.
- Edit event.
- Invite participants.
- View event details.
- Set reminders.
- Filter by project or team.

Event creation should use a bottom sheet on mobile.

---

# 10. Documents Mobile

Documents should prioritize file discovery and preview.

## 10.1. Document List

```text
Documents                         [+]

[Search documents...]

Folders

[Folder] Company
[Folder] Marketing
[Folder] Projects

Recent Files

[PDF] Proposal.pdf
      Modified today

[XLS] Report.xlsx
      Modified yesterday

[PDF] Brand Guide.pdf
      Modified Monday
```

## 10.2. Document Actions

- Open.
- Preview.
- Download.
- Share.
- Rename.
- Move.
- Delete.

Use contextual bottom sheets.

## 10.3. File Preview

File preview should occupy the entire screen.

Header:

- Back.
- File name.
- Download.
- More.

Support browser-native preview where appropriate.

---

# 11. Requests & Approvals Mobile

Approval actions should be easy to access.

## 11.1. Approval Inbox

```text
Approvals

[Pending] [Approved] [Rejected]

┌───────────────────────────────────────┐
│ Purchase Request                      │
│ Requested by: Andi                    │
│ Marketing Department                  │
│                                       │
│ Rp 2.500.000                          │
│ Submitted: Today                      │
│                                       │
│ [Review Request]                      │
└───────────────────────────────────────┘
```

## 11.2. Approval Detail

```text
┌───────────────────────────────────────┐
│ ← Approval Details                    │
├───────────────────────────────────────┤
│ Purchase Request                      │
│                                       │
│ Requester                             │
│ Andi - Marketing                      │
│                                       │
│ Amount                                │
│ Rp 2.500.000                          │
│                                       │
│ Description                           │
│ Purchase design equipment...          │
│                                       │
│ Attachments                           │
│                                       │
│ Approval History                      │
│                                       │
├───────────────────────────────────────┤
│ [Reject]             [Approve]        │
└───────────────────────────────────────┘
```

Approval rules:

- Sticky bottom action bar.
- Confirmation before final decision.
- Optional approval note.
- Clear approval status.
- Show the current approval step.
- Preserve complete audit history.

---

# 12. Notifications Mobile

Notifications should be accessible from the top header.

Notification screen:

```text
Notifications

[All] [Unread]

Today

Task assigned to you
Design Homepage

Sarah mentioned you
Marketing Team

Approval required
Purchase Request

Yesterday

Project updated
Website Redesign
```

Features:

- Mark as read.
- Mark all as read.
- Filter unread.
- Open related content.
- Notification grouping.

Notifications must deep-link to the relevant task, message, project, or request.

---

# 13. Search Mobile

Global search must provide a full-screen search interface.

```text
┌───────────────────────────────────────┐
│ [←] Search Kullo                      │
├───────────────────────────────────────┤
│ [Search tasks, projects, people...]    │
│                                       │
│ Recent Searches                       │
│ Website Redesign                      │
│ Marketing Report                      │
│                                       │
│ Suggested                             │
│                                       │
│ Tasks                                 │
│ Projects                              │
│ People                                │
│ Documents                             │
└───────────────────────────────────────┘
```

Requirements:

- Search suggestions.
- Recent searches.
- Category filtering.
- Clear search.
- Keyboard-aware layout.
- Result highlighting.

---

# 14. Mobile Forms & Input Patterns

Mobile forms must avoid unnecessary complexity.

Guidelines:

- One-column layout.
- Clear labels.
- Appropriate keyboard types.
- Native date and time controls where suitable.
- Selectable bottom sheets for long dropdowns.
- Inline validation.
- Large touch targets.
- Sticky submit action for long forms.

Example task creation:

```text
New Task

Task Name
[Enter task name]

Project
[Select project]

Assignee
[Select member]

Priority
[Medium]

Due Date
[Select date]

Description
[Enter description]

[Create Task]
```

For complex forms, use progressive steps rather than presenting all fields at once.

---

# 15. Bottom Sheets & Drawers

Bottom sheets are a major interaction pattern in Kullo Mobile.

Use bottom sheets for:

- Task actions.
- Filters.
- Sorting.
- Project selection.
- Member selection.
- Date selection.
- Contextual actions.
- Quick event creation.

Specifications:

- Background: #FFFFFF.
- Top corners: 16px.
- Drag handle: 32px × 4px.
- Padding: 16px.
- Maximum height: 85vh.
- Scrollable content.
- Safe-area support.

Bottom sheets must:

- Support Escape when used with a physical keyboard.
- Manage focus correctly.
- Prevent background interaction while modal.
- Provide an accessible close button.
- Avoid accidental dismissal during important forms.

---

# 16. Mobile Design Tokens

Mobile should reuse the main Kullo design tokens.

```css
:root {
  --mobile-header-height: 56px;
  --mobile-bottom-nav-height: 64px;
  --mobile-page-padding: 16px;

  --mobile-touch-target: 44px;
  --mobile-card-padding: 16px;

  --mobile-section-gap: 24px;
  --mobile-item-gap: 12px;

  --mobile-sheet-radius: 16px;
  --mobile-dialog-radius: 12px;
}
```

## 16.1. Typography

| Element | Size |
|---|---:|
| Page Title | 22px |
| Section Title | 16px |
| Card Title | 14px |
| Body | 14px |
| Description | 13px |
| Caption | 12px |
| Bottom Navigation | 11px |

## 16.2. Touch Targets

Minimum touch target:

44px × 44px.

Prefer 48px × 48px for frequently used controls.

Do not place critical actions too close together.

---

# 17. Mobile Interaction & Motion

Use subtle motion consistent with Fluent 2.

| Interaction | Duration |
|---|---:|
| Button feedback | 100ms |
| Tab transition | 150ms |
| Bottom sheet | 250ms |
| Drawer | 250ms |
| Page transition | 200ms |
| Toast | 200ms |

Requirements:

- No excessive animation.
- Avoid unnecessary parallax.
- Preserve scroll position when appropriate.
- Use reduced-motion preferences.
- Prevent layout shifts.

Support touch gestures carefully.

Swipe gestures must never be the only way to perform an action.

---

# 18. PWA & Mobile Web Requirements

Kullo should be PWA-ready.

## 18.1. PWA Capabilities

- Web app manifest.
- Installable application.
- App icons.
- Standalone display mode.
- Theme color.
- Offline fallback.
- Service worker.
- Cache static assets.

## 18.2. Offline Behavior

Initial offline support should be limited to safe, cached information.

Possible capabilities:

- Previously viewed project information.
- Cached task lists.
- Draft task descriptions.
- Draft comments.

Requirements:

- Clearly indicate offline status.
- Do not show unsaved data as successfully synchronized.
- Queue supported mutations carefully.
- Handle conflicts during reconnection.
- Require server confirmation for approvals and other critical actions.

Never allow an offline approval to appear finalized before the server confirms it.

## 18.3. Push Notifications

Future support:

- Task assignments.
- New mentions.
- Approval requests.
- Deadline reminders.
- New chat messages.

Push notifications require explicit user permission.

---

# 19. Mobile Performance

Performance targets:

- Fast initial rendering.
- Avoid unnecessary JavaScript.
- Lazy load non-critical modules.
- Optimize image delivery.
- Use pagination.
- Avoid rendering large task lists simultaneously.
- Debounce search.
- Cache safe read-only data.
- Minimize unnecessary network requests.

Recommended targets:

| Metric | Target |
|---|---|
| LCP | ≤ 2.5 seconds |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| Initial JS | Minimize and monitor |
| Interaction feedback | Immediate where possible |

Targets should be evaluated under representative mobile network conditions.

---

# 20. Mobile Security

All mobile features must follow the same security requirements as desktop.

- Secure authentication.
- Secure session handling.
- RBAC.
- Tenant isolation.
- API permission validation.
- Secure file access.
- XSS protection.
- CSRF protection where applicable.
- Rate limiting.
- Secure logout.
- Session expiration.
- Device-aware session management.

Sensitive content must not be exposed through public cached pages.

Never rely on frontend visibility rules as the only security control.

---

# 21. Responsive Component Architecture

Mobile must reuse the same business logic and core components as desktop.

Suggested frontend structure:

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── layouts/
│   ├── DesktopLayout.tsx
│   ├── MobileLayout.tsx
│   └── ResponsiveLayout.tsx
│
├── modules/
│   ├── dashboard/
│   ├── my-work/
│   ├── projects/
│   ├── tasks/
│   ├── chat/
│   ├── calendar/
│   ├── documents/
│   ├── requests/
│   ├── approvals/
│   └── reports/
│
├── hooks/
│   ├── useBreakpoint.ts
│   ├── useMobileNavigation.ts
│   └── useResponsiveLayout.ts
│
├── services/
├── stores/
├── styles/
│   ├── tokens.css
│   ├── desktop.css
│   ├── mobile.css
│   └── responsive.css
│
└── utils/
```

## 21.1. Responsive Component Strategy

Reuse shared logic, data fetching, validation, and permissions.

Allow different presentations where necessary.

Examples:

| Feature | Desktop | Mobile |
|---|---|---|
| Navigation | Sidebar | Bottom navigation |
| Task detail | Side panel | Full-screen |
| Filters | Toolbar | Bottom sheet |
| Chat | Multi-column | Full-screen |
| Calendar | Grid | Agenda |
| Project board | Kanban | Horizontal board / List |
| Document | Table | File list |
| Approval | Detail panel | Full-screen |

Do not force desktop components to shrink into mobile screens when their interaction patterns are unsuitable.

---

# 22. Mobile Routing Strategy

Mobile should use the same application routes as desktop.

Examples:

```text
/app/dashboard
/app/my-work
/app/tasks
/app/tasks/:taskId
/app/projects
/app/projects/:projectId
/app/chat
/app/chat/:conversationId
/app/calendar
/app/documents
/app/approvals
/app/approvals/:requestId
/app/settings
```

Responsive layouts determine the visual presentation.

Back navigation must preserve appropriate previous route and scroll context.

Support browser back navigation.

---

# 23. Mobile Testing Checklist

## Layout

- [ ] Works at 320px width.
- [ ] Works at 375px width.
- [ ] Works at 390px width.
- [ ] Works at 430px width.
- [ ] Supports landscape orientation.
- [ ] Supports safe areas.
- [ ] No unwanted horizontal overflow.

## Navigation

- [ ] Bottom navigation works.
- [ ] Active states are correct.
- [ ] More menu works.
- [ ] Back navigation works.
- [ ] Deep links work.
- [ ] Navigation preserves context.

## Interaction

- [ ] Touch targets are at least 44px.
- [ ] Forms work with mobile keyboards.
- [ ] Bottom sheets work.
- [ ] Dialogs work.
- [ ] Drag-and-drop has alternatives.
- [ ] Sticky actions do not cover content.

## Modules

- [ ] Dashboard.
- [ ] My Work.
- [ ] Tasks.
- [ ] Projects.
- [ ] Chat.
- [ ] Calendar.
- [ ] Documents.
- [ ] Requests.
- [ ] Approvals.
- [ ] Notifications.
- [ ] Settings.

## Performance

- [ ] Optimized images.
- [ ] Lazy loading.
- [ ] Pagination.
- [ ] Loading states.
- [ ] Error states.
- [ ] Offline indicator.
- [ ] No major layout shifts.

## Accessibility

- [ ] WCAG 2.1 AA.
- [ ] Keyboard navigation.
- [ ] Visible focus.
- [ ] Accessible labels.
- [ ] Screen reader support.
- [ ] Reduced motion.

---

# 24. Development Priority

Mobile development should be divided into four stages.

## Stage 1 — Mobile Foundation

- Responsive application shell.
- Mobile header.
- Bottom navigation.
- More navigation.
- Responsive design tokens.
- Mobile drawer.
- Bottom sheet.
- Responsive routing.

## Stage 2 — Core Productivity

- Dashboard.
- My Work.
- Task list.
- Task detail.
- Task quick actions.
- Project list.
- Project detail.

## Stage 3 — Collaboration

- Chat.
- Notifications.
- Calendar.
- Documents.
- Member directory.

## Stage 4 — Business Operations

- Requests.
- Approvals.
- Reports.
- Settings.
- PWA installation.
- Push notifications.
- Offline draft support.

---

# 25. Final Mobile Experience

Kullo Mobile should become the everyday work companion for employees and managers.

Users should be able to:

- Check their work in seconds.
- Update tasks without opening a laptop.
- Communicate with colleagues.
- Review project progress.
- Respond to approval requests.
- Access important documents.
- Manage their daily schedule.

The mobile experience must be simpler than desktop, without sacrificing essential functionality.

**Final Product Principle:**

Desktop is where teams organize and manage complex work.

Mobile is where teams stay connected, respond, update, and keep work moving.

---

# 26. Official References

1. Microsoft Fluent 2 Design System  
   https://fluent2.microsoft.design/

2. Microsoft Fluent 2 Design Tokens  
   https://fluent2.microsoft.design/design-tokens/

3. Fluent UI React  
   https://react.fluentui.dev/

4. Microsoft Fluent UI System Icons  
   https://github.com/microsoft/fluentui-system-icons

5. Progressive Web Apps  
   https://web.dev/explore/progressive-web-apps

6. Web.dev Responsive Design  
   https://web.dev/learn/design/

7. Web Content Accessibility Guidelines  
   https://www.w3.org/TR/WCAG21/

**Product:** Kullo  
**Document:** MOBILE.md  
**Version:** 1.0

*Work Together. Move Forward.*
---

# 27. Implementation Notes (Kullo repository)

This appendix maps the mobile specification to the code. It does not change §1–§26.

## 27.1 Implemented

- **Bottom navigation** (`src/components/app/AppShell.tsx`): 64px + safe area, white, top border, 22px icons, 11px labels, active `#0F6CBD`, inactive `#616161`. Items: Beranda (Dashboard), My Work, Proyek, Chat, Lainnya (opens the full navigation drawer with grouped items).
- **Mobile header**: 56px, white, bottom border, Kullo mark + wordmark, search and notifications. Hamburger, quick-create and avatar are hidden on mobile; profile/organisation live in the Lainnya drawer.
- **Content container**: 16px page padding, bottom padding `88px + env(safe-area-inset-bottom)`, page title 22/600, description 13px.
- **Touch targets**: buttons, inputs, header icon buttons and nav rows are at least 44px on mobile (`.app-body` scope).
- **Task detail**: `.sheet` becomes full-screen (100% width, no side border) on mobile.
- **Dashboard**: single column; first metric card and last card span the full width, the middle two form a two-column pair (MOBILE.md §5.2).
- **320px**: verified usable; wordmark hides below 375px so the header never overflows.

## 27.2 Token mapping

| MOBILE.md token | CSS variable |
| --- | --- |
| `--mobile-header-height` | `--mobile-header-height` (56px) |
| `--mobile-bottom-nav-height` | `--mobile-bottom-nav-height` (64px) |
| `--mobile-page-padding` | `--mobile-page-padding` (16px) |
| `--mobile-touch-target` | `--mobile-touch-target` (44px) |
| `--mobile-sheet-radius` | `--mobile-sheet-radius` (16px) |

## 27.3 Follow-ups (not yet implemented)

- Chat: the conversation list remains stacked above the thread on mobile; full-screen conversation with back navigation is a follow-up.
- Task list on mobile keeps the compact table; the richer task card of §6.2 is a follow-up.
- PWA (§18): manifest, install prompt, offline cache and push are not implemented yet.

## 27.4 Density pass (owner feedback, 2026-11-09)

Owner feedback: mobile felt crowded (descriptions, oversized buttons, duplicated actions). Applied at ≤640px:

- Page description (`page-sub`) and eyebrow are hidden; page title 20px. Secondary header actions are hidden — one primary action per screen.
- Stat-card hints hidden; panel padding 14px; section gaps reduced.
- Buttons 38px (compact 30px), header icon buttons 40px, inputs 40px — slightly below the 44px target at the owner's request; the tap area is still generous.
- Task table becomes a stacked card row (title, status, priority, due); project/task filter rows and scope tabs scroll horizontally instead of wrapping.
- Chat conversation list capped at 168px.

These are owner-approved deviations from §16.2 and are recorded here so they are not silently reverted.

### 27.5 Dashboard & quick create (owner feedback, 2026-11-09)

- Dashboard metric cards are compact on ≤640px: 2×2 grid (no full-width spans), 8px gap, 10–12px padding, value 20px, label 11px.
- Quick create (the "+" menu: task, project, event, request, document) is available in the mobile header next to search; menu rows are 44px tall.

### 27.6 Mobile header (owner feedback, 2026-11-09)

- The mobile header title shows the current menu name (Dashboard, My Work, Chat, …) next to the Kullo mark, replacing the brand wordmark.
- The repeated page-header block (title/description) and the primary blue page action are hidden on ≤640px; quick-create lives in the header **+** menu. Non-create controls (e.g. the My Work List/Board/Calendar switch) remain.
- Task titles truncate with an ellipsis instead of forcing horizontal scroll.

### 27.7 Page headers and calendars (owner feedback, 2026-11-09)

- The page-header block (title, description, eyebrow and the action buttons on that row) is no longer rendered at any width on Dashboard, My Work, Projects, Tasks, Calendar, Teams, Documents, Requests, Approvals, Settings and Reports; the header already shows the page name, each page keeps a screen-reader-only `h1`, and creation stays in the header **+** menu or the page toolbar.
- Board "Kalender" view: the month grid is fluid (`repeat(7, minmax(0, 1fr))`, ~52px cells at 390px), day cells are 62px high and event chips drop to 9px, so the board never scrolls sideways.
- Calendar page: month grid fluid; the week view becomes a stacked list of seven day rows instead of seven narrow columns; the toolbar (month, Hari ini, filter, Bulan/Minggu/Agenda, Agenda CTA) wraps to multiple lines.
- Projects (owner feedback 2026-11-09): a List / Board switch sits beside the department filter inside the filter strip. On ≤640px the strip stays a single horizontal scroll row, so the switch is reached by swiping; List renders a table that scrolls inside its panel.

### 27.8 "Lainnya" bottom sheet (owner feedback, 2026-11-09)

- The fifth tab no longer opens the sidebar drawer: it raises a bottom sheet (`role="dialog"`, `aria-modal`) with a grab handle, the workspace name, a "Menu" title and a close button.
- Contents: every sidebar destination as a 4-column grid of icon tiles (Dashboard, My Work, Projects, Tasks, Calendar, Teams, Chat, Documents, Requests, Approvals, Reports, Settings). The active destination is tinted; My Work and Approvals carry their count badges.
- Motion: 260ms slide-up with a fade backdrop; the sheet follows a downward drag and closes past 90px (grab handle, pointer events). Backdrop tap, Escape and any tile tap close it; body scroll is locked while open; `prefers-reduced-motion` removes the animation. Tiles scale slightly on press for touch feedback.

### 27.9 Chat (owner feedback, 2026-11-09)

- On ≤1023px an **open conversation** replaces the bottom tab bar: the tab bar is hidden and the composer sits at the bottom of the viewport with a 21px breathing gap above the safe area (content padding 16px + composer 6px). The conversation list (`/app/chat` without an active chat) keeps the tab bar, and leaving a conversation brings it back.
- The helper line under the composer ("Enter untuk kirim · Shift+Enter … · Ctrl+V") is removed.
- Editing a message uses the bottom composer, WhatsApp-style: the composer is prefilled with the message, shows an "Edit pesan" bar with a cancel button, and the send button becomes **Simpan** (Enter saves). The original bubble gets a subtle outline while editing; Escape cancels and restores the draft that was in the composer. There is no modal and the layout does not shift.
- The action row under each bubble (Reaksi, Tugas, Balas, Edit, Hapus) uses the muted text colour, so it reads softer than the message body.

### 27.10 Chat list, channels, membership (owner feedback, 2026-11-09)

- The top of the conversation list is a compact three-way filter — **Semua / Belum dibaca / Kanal** (11px, 34px tall) beside the new-conversation **+**; it fits at 390px with no horizontal overflow.
- "Belum dibaca" lists only conversations with unread messages as a flat list (no section headers); when empty it shows a centred chat icon with "Tidak ada chat belum dibaca" and a one-line hint, WhatsApp-style. "Kanal" hides direct messages and uses the same centred empty state when there is no channel.
- Channels can be created with an icon (tagar/bintang/hati/pin) from the **+** dialog's **Kanal** tab; the icon is used in the list and the header, and the header no longer shows a description line.
- The member dialog lists roles (Admin badge), lets admins promote/demote and remove members, and filters candidates with a search field.

### 27.11 Default views and mobile calendar (owner feedback, 2026-11-09)

- **Proyek** opens in **List** on ≤1023px (server picks List from the user agent, and `MobileDefaultList` corrects the URL in responsive/devtools mode); desktop still opens Board. The toggle remains available.
- **My Work** keeps List as its default view and now renders the task table on mobile as well, scrolling horizontally inside its panel the same way the project list does — the stacked-card adaptation no longer applies to `data-mode="my"`.
- **Calendar** cells are larger on mobile (92×96px, 11px dates, 10.5px events) and the month grid scrolls horizontally inside its card (`.calendar-scroll`), so the page itself never overflows while the calendar can be swiped.

### 27.12 Bottom sheet "Lainnya" (owner feedback, 2026-11-10)

- **Pengaturan** was removed from the "Lainnya" bottom sheet (still reachable from the desktop sidebar and its own route).
- The Database module and its sidebar/menu entries were removed on owner request (2026-11-10); no Database tile or route remains.

### 27.13 Auth screens (2026-11-10)

- `/masuk`, `/daftar`, dan `/gabung` berada di route group `(auth)` sehingga **tidak memakai header/footer marketing** dan tampil layar penuh seperti masuk ke aplikasi.
- Komposisi mobile: logo Kullo di atas, kartu form selebar layar, signature brand dan tautan legal di bawah; ilustrasi sudut disembunyikan.
- Form tetap satu kolom, input 40px, tombol utama selebar kartu; halaman dapat di-scroll vertikal tanpa overflow horizontal.
- Ilustrasi 2D unDraw hanya tampil di desktop (≥1100px) di sudut bawah, tanpa kartu putih, dengan palet DESIGN §2; sumber/lisensi di `public/illustrations/README.md`.
