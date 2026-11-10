import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, Circle, Clock3 } from "lucide-react";
import { initials } from "@/lib/utils";
import { dueMeta, entityTone, priorityMeta, roleMeta, statusMeta } from "@/lib/markers";

export function Avatar({
  name,
  color = "var(--accent)",
  size = 28,
  title,
  personId,
  version,
}: {
  name: string;
  color?: string | null;
  size?: number;
  title?: string;
  personId?: string;
  version?: string | null;
}) {
  if (personId) {
    const params = new URLSearchParams();
    if (color && color.startsWith("#")) params.set("color", color);
    if (version) params.set("v", version);
    const query = params.toString() ? `?${params.toString()}` : "";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/avatar/${personId}${query}`}
        alt={title ?? name}
        title={title ?? name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: "cover",
          flex: "none",
          background: color ?? "var(--accent)",
          display: "inline-block",
        }}
      />
    );
  }
  return (
    <span
      title={title ?? name}
      aria-hidden={title ? undefined : true}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color ?? "var(--accent)",
        color: "var(--on-accent)",
        display: "inline-grid",
        placeItems: "center",
        fontSize: Math.max(9, Math.round(size * 0.36)),
        fontWeight: 650,
        flex: "none",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ people, max = 4 }: { people: Array<{ id: string; name: string; avatarColor?: string | null }>; max?: number }) {
  const shown = people.slice(0, max);
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {shown.map((person, index) => (
        <span key={person.id} style={{ marginLeft: index === 0 ? 0 : -7, border: "2px solid var(--bg)", borderRadius: 999 }}>
          <Avatar name={person.name} color={person.avatarColor} size={25} personId={person.id} />
        </span>
      ))}
      {people.length > max && (
        <span className="badge" style={{ marginLeft: 4, height: 22 }}>
          +{people.length - max}
        </span>
      )}
    </span>
  );
}

export function StatusBadge({ status, category }: { status: string | null; category?: string | null }) {
  const meta = statusMeta(status, category);
  return <span className={`badge ${meta.className}`}>{status ?? "Backlog"}</span>;
}

function priorityColor(tone: string) {
  if (tone === "danger") return "var(--danger)";
  if (tone === "orange") return "var(--marker-orange)";
  if (tone === "accent") return "var(--accent)";
  return "var(--text-muted)";
}

export function PriorityDot({ priority, label = true }: { priority: string; label?: boolean }) {
  const meta = priorityMeta(priority);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-muted)" }} title={`Prioritas ${meta.label}`}>
      <span className="priority-dot" style={{ background: priorityColor(meta.tone) }} />
      {label ? meta.label : null}
    </span>
  );
}

export function PriorityLabel({ priority }: { priority: string }) {
  const meta = priorityMeta(priority);
  const color = priorityColor(meta.tone);
  return (
    <span style={{ fontSize: 11.5, color, fontWeight: 600, display: "inline-flex", gap: 4, alignItems: "center" }} title={`Prioritas ${meta.label}`}>
      <Circle size={7} fill={color} strokeWidth={0} /> {meta.label}
    </span>
  );
}

/** Due dates are a reminder, so the icon and the words carry the meaning too. */
export function DueBadge({
  dueDate,
  done = false,
  compact = false,
}: {
  dueDate: string | null | undefined;
  done?: boolean;
  compact?: boolean;
}) {
  const meta = dueMeta(dueDate, done);
  const Icon =
    meta.kind === "done"
      ? CheckCircle2
      : meta.kind === "overdue"
        ? AlertTriangle
        : meta.kind === "today" || meta.kind === "soon"
          ? Clock3
          : CalendarDays;
  return (
    <span className={meta.className} title={meta.label}>
      <Icon size={11} aria-hidden />
      <span>{compact ? meta.shortLabel : meta.label}</span>
    </span>
  );
}

export function MentionText({ body }: { body: string }) {
  const parts = body.split(/(@[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("@") ? (
          <span key={index} className="mention-tag">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function RoleBadge({ role, label }: { role: string; label?: string }) {
  const meta = roleMeta(role);
  return <span className={`badge ${meta.className}`}>{label ?? meta.label}</span>;
}

export function EntityBadge({ type }: { type: string }) {
  return <span className={`badge ${entityTone(type)}`}>{type}</span>;
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="empty-state">
      <div style={{ display: "grid", gap: 8, justifyItems: "center", maxWidth: 420, margin: "0 auto" }}>
        <span
          aria-hidden
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            display: "grid",
            placeItems: "center",
            color: "var(--text-muted)",
          }}
        >
          <AlertTriangle size={18} />
        </span>
        <strong style={{ color: "var(--text)", fontSize: 14.5 }}>{title}</strong>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{copy}</p>
        {action?.href ? (
          <Link href={action.href} className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
            {action.label} <ChevronRight size={14} />
          </Link>
        ) : action?.onClick ? (
          <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 4 }} onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header" style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 18 }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <p className="page-eyebrow" style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 650, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "accent" | "success" | "warning" | "danger";
  href?: string;
}) {
  const color =
    tone === "success" ? "var(--success)" : tone === "warning" ? "var(--warning)" : tone === "danger" ? "var(--danger)" : "var(--accent)";
  const body = (
    <div className="panel stat-card" style={{ padding: "14px 16px", height: "100%" }}>
      <p className="stat-label" style={{ margin: 0 }}>
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: color, display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />
        {label}
      </p>
      <p className="stat-value" style={{ margin: "3px 0 0", color: "var(--text)" }}>{value}</p>
      {hint && <p className="stat-hint" style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} style={{ display: "block", height: "100%" }}>
      {body}
    </Link>
  ) : (
    body
  );
}
