"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  CircleCheck,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { KulloMark } from "@/components/site/KulloMark";
import { CommandPalette } from "./CommandPalette";
import { QuickCreateHost } from "./QuickCreate";
import { TaskDrawerHost } from "./TaskDrawerHost";
import { Avatar } from "./ui";
import { relativeTime } from "@/lib/utils";
import { markAllNotificationsReadAction, markNotificationReadAction, signOutAction } from "@/app/(app)/actions";

type ShellUser = { id: string; name: string; email: string; title: string | null; avatarColor: string };
type ShellOrg = { id: string; name: string; slug: string; plan: string };
type ShellNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

const NAV = [
  {
    label: "Ruang kerja",
    items: [
      { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
      { label: "My Work", href: "/app/my-work", icon: CheckSquare, countKey: "myWork" },
      { label: "Proyek", href: "/app/projects", icon: FolderKanban },
      { label: "Tugas", href: "/app/tasks", icon: CircleCheck },
      { label: "Kalender", href: "/app/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Kolaborasi",
    items: [
      { label: "Tim", href: "/app/teams", icon: Users },
      { label: "Chat", href: "/app/chat", icon: MessageSquare },
      { label: "Dokumen", href: "/app/documents", icon: FileText },
    ],
  },
  {
    label: "Operasional",
    items: [
      { label: "Permintaan", href: "/app/requests", icon: BookOpen },
      { label: "Persetujuan", href: "/app/approvals", icon: CircleCheck, countKey: "approvals" },
      { label: "Laporan", href: "/app/reports", icon: BarChart3 },
      { label: "Pengaturan", href: "/app/settings/profile", icon: Settings },
    ],
  },
];

const PAGE_LABELS: Array<[string, string]> = [
  ["/app/dashboard", "Dashboard"],
  ["/app/my-work", "My Work"],
  ["/app/projects", "Proyek"],
  ["/app/tasks", "Tugas"],
  ["/app/calendar", "Kalender"],
  ["/app/teams", "Tim"],
  ["/app/chat", "Chat"],
  ["/app/documents", "Dokumen"],
  ["/app/requests", "Permintaan"],
  ["/app/approvals", "Persetujuan"],
  ["/app/reports", "Laporan"],
  ["/app/settings", "Pengaturan"],
];

export function AppShell({
  user,
  org,
  membership,
  notifications,
  counts,
  children,
}: {
  user: ShellUser;
  org: ShellOrg;
  membership: { role: string };
  notifications: ShellNotification[];
  counts: { unread: number; myWork: number; approvals: number };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    setUserOpen(false);
    setQuickOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setNotifOpen(false);
        setUserOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pageLabel = PAGE_LABELS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Workspace";
  const unread = notifications.filter((item) => !item.readAt).length;

  return (
    <div className="app-body">
      <div className="app-shell">
        {sidebarOpen && <div className="app-drawer-backdrop lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />}
        <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`} aria-label="Navigasi aplikasi">
          <div className="sidebar-brand">
            <Link href="/app/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
              <KulloMark size={26} />
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.04em" }}>Kullo</span>
            </Link>
            <span className="badge" style={{ marginLeft: "auto", fontSize: 10 }}>{org.plan}</span>
            <button type="button" className="icon-btn lg:hidden" aria-label="Tutup navigasi" onClick={() => setSidebarOpen(false)}>
              <X size={17} />
            </button>
          </div>

          <div className="sidebar-scroll">
            <div style={{ padding: "10px 12px 6px" }}>
              <Link href="/app/settings/organization" className="workspace-chip" title="Pengaturan organisasi">
                <span className="workspace-dot">{org.name.slice(0, 2).toUpperCase()}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.name}</span>
                  <span style={{ display: "block", color: "var(--text-muted)", fontSize: 11 }}>{membership.role}</span>
                </span>
                <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
              </Link>
            </div>

            {NAV.map((group) => (
              <div key={group.label}>
                <p className="nav-group">{group.label}</p>
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const count = item.countKey === "myWork" ? counts.myWork : item.countKey === "approvals" ? counts.approvals : 0;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
                      <Icon aria-hidden />
                      {item.label}
                      {count > 0 && <span className="nav-count">{count}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="sidebar-foot">
            <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "2px 4px" }}>
              <Avatar name={user.name} color={user.avatarColor} size={30} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.title ?? user.email}</p>
              </div>
              <form action={signOutAction}>
                <button type="submit" className="icon-btn" aria-label="Keluar" title="Keluar">
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="app-main">
          <header className="app-topbar">
            <button type="button" className="icon-btn app-mobile-bar" aria-label="Buka navigasi" onClick={() => setSidebarOpen(true)}>
              <Menu size={19} />
            </button>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 650, lineHeight: 1.3 }}>
                {org.name}
              </p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 650, lineHeight: 1.3 }}>{pageLabel}</p>
            </div>

            <div className="topbar-spacer" />

            <button type="button" className="topbar-search" onClick={() => setPaletteOpen(true)} aria-label="Cari di Kullo">
              <Search size={15} aria-hidden />
              <span>Cari</span>
              <span className="kbd" style={{ marginLeft: "auto" }}>Ctrl K</span>
            </button>

            <div style={{ position: "relative" }}>
              <button type="button" className="icon-btn" aria-label="Aksi cepat" aria-expanded={quickOpen} onClick={() => { setQuickOpen((value) => !value); setNotifOpen(false); setUserOpen(false); }}>
                <Plus size={18} />
              </button>
              {quickOpen && (
                <div className="popover" style={{ width: 210 }} role="menu">
                  {[
                    ["Tugas baru", "/app/dashboard?new=task"],
                    ["Proyek baru", "/app/projects?new=project"],
                    ["Agenda baru", "/app/calendar?new=event"],
                    ["Permintaan baru", "/app/requests?new=1"],
                    ["Dokumen baru", "/app/documents?new=1"],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={() => setQuickOpen(false)}
                      style={{ display: "block", padding: "9px 13px", fontSize: 12.5, borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)" }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Notifikasi, ${unread} belum dibaca`}
                aria-expanded={notifOpen}
                onClick={() => { setNotifOpen((value) => !value); setUserOpen(false); setQuickOpen(false); }}
              >
                <Bell size={18} />
                {unread > 0 && <span className="icon-dot" />}
              </button>
              {notifOpen && (
                <div className="popover" role="dialog" aria-label="Notifikasi">
                  <div className="popover-head">
                    <span>Notifikasi</span>
                    {unread > 0 && <span className="badge badge-accent">{unread}</span>}
                    {unread > 0 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ marginLeft: "auto" }}
                        onClick={async () => {
                          await markAllNotificationsReadAction();
                          router.refresh();
                        }}
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="popover-list">
                    {notifications.length === 0 ? (
                      <p className="help" style={{ padding: 16, margin: 0 }}>Belum ada notifikasi.</p>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`notif-row ${item.readAt ? "" : "unread"}`}
                          onClick={async () => {
                            if (!item.readAt) await markNotificationReadAction(item.id);
                            setNotifOpen(false);
                            router.push(item.href ?? "/app/dashboard");
                            router.refresh();
                          }}
                        >
                          {!item.readAt && <span className="notif-dot" />}
                          <span style={{ minWidth: 0, flex: 1, marginLeft: item.readAt ? 16 : 0 }}>
                            <span style={{ display: "block", fontWeight: 600, fontSize: 12.5 }}>{item.title}</span>
                            {item.body && <span style={{ display: "block", color: "var(--text-muted)", fontSize: 11.5, lineHeight: 1.45, marginTop: 1 }}>{item.body}</span>}
                            <span style={{ display: "block", color: "var(--text-muted)", fontSize: 10.5, marginTop: 2 }}>{relativeTime(item.createdAt)}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                    <Link href="/app/settings/notifications" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }} onClick={() => setNotifOpen(false)}>
                      Atur preferensi notifikasi
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="icon-btn"
                aria-label="Menu akun"
                aria-expanded={userOpen}
                onClick={() => { setUserOpen((value) => !value); setNotifOpen(false); setQuickOpen(false); }}
                style={{ width: 36 }}
              >
                <Avatar name={user.name} color={user.avatarColor} size={28} />
              </button>
              {userOpen && (
                <div className="popover" style={{ width: 240 }} role="menu">
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                    <p style={{ margin: 0, fontWeight: 650, fontSize: 13 }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{user.email}</p>
                  </div>
                  {[
                    ["Profil saya", "/app/settings/profile"],
                    ["Organisasi", "/app/settings/organization"],
                    ["Anggota & peran", "/app/settings/members"],
                    ["Kembali ke situs", "/"],
                  ].map(([label, href]) => (
                    <Link key={href} href={href} role="menuitem" onClick={() => setUserOpen(false)} style={{ display: "block", padding: "9px 14px", fontSize: 12.5 }}>
                      {label}
                    </Link>
                  ))}
                  <form action={signOutAction} style={{ borderTop: "1px solid var(--border)" }}>
                    <button type="submit" role="menuitem" style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: 12.5, background: "none", border: 0, cursor: "pointer", color: "var(--danger)" }}>
                      Keluar
                    </button>
                  </form>
                </div>
              )}
            </div>
          </header>

          <main className="app-content">{children}</main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Suspense fallback={null}>
        <TaskDrawerHost />
      </Suspense>
      <Suspense fallback={null}>
        <QuickCreateHost />
      </Suspense>
    </div>
  );
}
