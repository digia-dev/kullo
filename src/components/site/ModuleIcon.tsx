import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  ListChecks,
  Users,
  MessageSquare,
  CalendarDays,
  FolderOpen,
  FileText,
  BadgeCheck,
  BarChart3,
  Settings,
  Hammer,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  layout: LayoutDashboard,
  "check-square": CheckSquare,
  "folder-kanban": FolderKanban,
  "list-checks": ListChecks,
  users: Users,
  "message-square": MessageSquare,
  "calendar-days": CalendarDays,
  "folder-open": FolderOpen,
  "file-text": FileText,
  "badge-check": BadgeCheck,
  "bar-chart-3": BarChart3,
  settings: Settings,
};

export function ModuleIcon({ name, size = 20, strokeWidth = 1.6 }: { name: string; size?: number; strokeWidth?: number }) {
  const Icon = ICONS[name] ?? Hammer;
  return <Icon size={size} strokeWidth={strokeWidth} />;
}
