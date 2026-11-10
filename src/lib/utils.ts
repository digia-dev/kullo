import crypto from "node:crypto";

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export function cn(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const AVATAR_COLORS = ["#0f6cbd", "#107c10", "#ca5010", "#8764b8", "#c239b3", "#038387", "#616161"];

export function avatarColor(seed: string) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) % 9973;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function nowISO() {
  return new Date().toISOString();
}

export function formatDate(value?: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const date = value.length === 10 ? new Date(`${value}T00:00:00+07:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    ...opts,
  }).format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function relativeTime(value: string) {
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(then)) return "";
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "baru saja";
  if (Math.abs(mins) < 60) return `${mins} mnt lalu`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return `${days} hari lalu`;
  return formatDate(value);
}

export function daysFromToday(date: string) {
  const a = new Date(`${todayISO()}T00:00:00+07:00`).getTime();
  const b = new Date(`${date}T00:00:00+07:00`).getTime();
  return Math.round((b - a) / 86400000);
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatIDR(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const PRIORITY = {
  urgent: { label: "Urgent", color: "var(--danger)", rank: 4 },
  high: { label: "High", color: "var(--marker-orange)", rank: 3 },
  medium: { label: "Medium", color: "var(--accent)", rank: 2 },
  low: { label: "Low", color: "var(--text-muted)", rank: 1 },
} as const;

export type PriorityKey = keyof typeof PRIORITY;

export function priorityOf(value: string) {
  return PRIORITY[(value as PriorityKey) in PRIORITY ? (value as PriorityKey) : "medium"];
}

export const PROJECT_STATUS = {
  planning: { label: "Planning", tone: "badge" },
  active: { label: "Active", tone: "badge-accent" },
  on_hold: { label: "On hold", tone: "badge-warning" },
  completed: { label: "Completed", tone: "badge-success" },
  cancelled: { label: "Cancelled", tone: "badge-danger" },
} as const;

export function projectStatus(value: string) {
  return PROJECT_STATUS[(value as keyof typeof PROJECT_STATUS) in PROJECT_STATUS ? (value as keyof typeof PROJECT_STATUS) : "active"];
}

export const REQUEST_STATUS = {
  draft: { label: "Draft", tone: "badge-neutral" },
  submitted: { label: "Submitted", tone: "badge-accent" },
  pending: { label: "Pending", tone: "badge-warning" },
  approved: { label: "Approved", tone: "badge-success" },
  rejected: { label: "Rejected", tone: "badge-danger" },
  revision: { label: "Revision requested", tone: "badge-orange" },
  cancelled: { label: "Cancelled", tone: "badge-neutral" },
} as const;

export function requestStatus(value: string) {
  return REQUEST_STATUS[(value as keyof typeof REQUEST_STATUS) in REQUEST_STATUS ? (value as keyof typeof REQUEST_STATUS) : "draft"];
}
