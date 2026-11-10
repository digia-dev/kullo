import { daysFromToday, formatDate } from "./utils";

/**
 * A small, shared vocabulary for colour markers across the app.
 * Every marker also carries text and/or an icon; colour never stands alone.
 */
export type Tone = "accent" | "success" | "warning" | "danger" | "purple" | "teal" | "orange" | "neutral";

export type DueKind = "none" | "done" | "overdue" | "today" | "soon" | "later";

export type DueMeta = {
  kind: DueKind;
  tone: Tone;
  label: string;
  shortLabel: string;
  className: string;
};

export function priorityMeta(value: string) {
  switch (value) {
    case "urgent":
      return { tone: "danger" as Tone, label: "Urgent", className: "badge-danger" };
    case "high":
      return { tone: "orange" as Tone, label: "High", className: "badge-orange" };
    case "low":
      return { tone: "neutral" as Tone, label: "Low", className: "badge-neutral" };
    default:
      return { tone: "accent" as Tone, label: "Medium", className: "badge-accent" };
  }
}

export function statusMeta(status: string | null, category?: string | null) {
  const name = (status ?? "").toLowerCase();
  if (category === "done" || name === "done" || name === "selesai") {
    return { tone: "success" as Tone, className: "badge-success" };
  }
  if (category === "review" || name.includes("review")) {
    return { tone: "purple" as Tone, className: "badge-review" };
  }
  if (category === "blocked" || name.includes("blocked") || name.includes("hold")) {
    return { tone: "danger" as Tone, className: "badge-danger" };
  }
  if (category === "active" || name.includes("progress")) {
    return { tone: "accent" as Tone, className: "badge-accent" };
  }
  return { tone: "neutral" as Tone, className: "badge-neutral" };
}

export function dueMeta(dueDate: string | null | undefined, done = false): DueMeta {
  if (done) {
    return { kind: "done", tone: "success", label: "Selesai", shortLabel: "Selesai", className: "due-chip done" };
  }
  if (!dueDate) {
    return { kind: "none", tone: "neutral", label: "Tanpa tenggat", shortLabel: "Tanpa tenggat", className: "due-chip" };
  }
  const days = daysFromToday(dueDate);
  const date = formatDate(dueDate);
  if (days < 0) {
    const late = Math.abs(days);
    return {
      kind: "overdue",
      tone: "danger",
      label: `Terlambat ${late} hari`,
      shortLabel: "Terlambat",
      className: "due-chip overdue",
    };
  }
  if (days === 0) {
    return { kind: "today", tone: "warning", label: `Hari ini · ${date}`, shortLabel: "Hari ini", className: "due-chip today" };
  }
  if (days === 1) {
    return { kind: "soon", tone: "accent", label: `Besok · ${date}`, shortLabel: "Besok", className: "due-chip soon" };
  }
  if (days <= 3) {
    return { kind: "soon", tone: "accent", label: `${days} hari lagi · ${date}`, shortLabel: `${days} hari lagi`, className: "due-chip soon" };
  }
  return { kind: "later", tone: "neutral", label: date, shortLabel: date, className: "due-chip" };
}

export function requestTone(status: string) {
  switch (status) {
    case "approved":
      return "badge-success";
    case "rejected":
      return "badge-danger";
    case "revision":
      return "badge-orange";
    case "pending":
      return "badge-warning";
    case "submitted":
      return "badge-accent";
    default:
      return "badge-neutral";
  }
}

export function roleMeta(role: string) {
  switch (role) {
    case "owner":
      return { tone: "purple" as Tone, className: "badge-purple", label: "Pemilik" };
    case "admin":
      return { tone: "accent" as Tone, className: "badge-accent", label: "Admin" };
    case "manager":
      return { tone: "teal" as Tone, className: "badge-teal", label: "Manajer" };
    case "leader":
      return { tone: "teal" as Tone, className: "badge-teal", label: "Team Leader" };
    case "guest":
      return { tone: "warning" as Tone, className: "badge-warning", label: "Tamu" };
    default:
      return { tone: "neutral" as Tone, className: "badge-neutral", label: "Staf" };
  }
}

export function eventTone(kind: string) {
  switch (kind) {
    case "deadline":
      return "danger";
    case "personal":
      return "purple";
    case "company":
      return "teal";
    case "reminder":
      return "success";
    default:
      return "accent";
  }
}

export function eventColor(kind: string) {
  switch (eventTone(kind)) {
    case "danger":
      return "var(--danger)";
    case "purple":
      return "var(--marker-purple)";
    case "teal":
      return "var(--marker-teal)";
    case "success":
      return "var(--success)";
    default:
      return "var(--accent)";
  }
}

export function visibilityTone(visibility: string) {
  switch (visibility) {
    case "department":
      return "badge-teal";
    case "project":
      return "badge-purple";
    case "personal":
      return "badge-warning";
    default:
      return "badge-accent";
  }
}

export function entityTone(type: string) {
  switch (type.toLowerCase()) {
    case "proyek":
    case "project":
      return "badge-success";
    case "orang":
    case "person":
      return "badge-teal";
    case "dokumen":
    case "document":
      return "badge-orange";
    case "tugas":
    case "task":
      return "badge-accent";
    default:
      return "badge-neutral";
  }
}

export function workloadTone(open: number) {
  if (open >= 8) return "danger";
  if (open >= 5) return "warning";
  return "success";
}
