import Link from "next/link";
import { AlertTriangle, ChevronRight, Circle } from "lucide-react";
import { PRIORITY, initials } from "@/lib/utils";

export function Avatar({
  name,
  color = "#365fd1",
  size = 28,
  title,
}: {
  name: string;
  color?: string | null;
  size?: number;
  title?: string;
}) {
  return (
    <span
      title={title ?? name}
      aria-hidden={title ? undefined : true}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color ?? "#365fd1",
        color: "#fff",
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
          <Avatar name={person.name} color={person.avatarColor} size={25} />
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
  const tone =
    category === "done"
      ? "badge-success"
      : category === "review"
        ? "badge-warning"
        : category === "active"
          ? "badge-accent"
          : "badge";
  return <span className={`badge ${tone}`}>{status ?? "Backlog"}</span>;
}

export function PriorityDot({ priority, label = true }: { priority: string; label?: boolean }) {
  const meta = PRIORITY[(priority as keyof typeof PRIORITY) in PRIORITY ? (priority as keyof typeof PRIORITY) : "medium"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-muted)" }}>
      <span className="priority-dot" style={{ background: meta.color }} />
      {label ? meta.label : null}
    </span>
  );
}

export function PriorityLabel({ priority }: { priority: string }) {
  const meta = PRIORITY[(priority as keyof typeof PRIORITY) in PRIORITY ? (priority as keyof typeof PRIORITY) : "medium"];
  return (
    <span style={{ fontSize: 11.5, color: meta.color, fontWeight: 600, display: "inline-flex", gap: 4, alignItems: "center" }}>
      <Circle size={7} fill={meta.color} strokeWidth={0} /> {meta.label}
    </span>
  );
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
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 18 }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 650, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {actions && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
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
    <div className="panel" style={{ padding: "14px 16px", height: "100%" }}>
      <p className="stat-label" style={{ margin: 0 }}>{label}</p>
      <p className="stat-value" style={{ margin: "3px 0 0", color }}>{value}</p>
      {hint && <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>{hint}</p>}
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
