import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getDepartments, getPeople } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { Avatar, EmptyState, PageHeader, StatCard } from "@/components/app/ui";

export const metadata: Metadata = { title: "Tim" };

export default async function TeamsPage() {
  const ctx = await requireApp();
  const people = getPeople(ctx.org.id);
  const departments = getDepartments(ctx.org.id);
  const active = people.filter((person) => person.status === "active").length;
  const pending = people.filter((person) => person.status === "invited" || person.status === "pending").length;

  const groups = new Map<string, typeof people>();
  for (const person of people) {
    const key = person.departmentName ?? "Tanpa departemen";
    groups.set(key, [...(groups.get(key) ?? []), person]);
  }

  return (
    <>
      <PageHeader
        eyebrow="Organisasi"
        title="Tim"
        subtitle={`${people.length} anggota · ${departments.length} departemen · ${active} aktif`}
        actions={
          can(ctx, "member.manage") ? (
            <Link href="/app/settings/members" className="btn btn-primary btn-sm"><UserPlus size={15} /> Undang anggota</Link>
          ) : undefined
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard label="Anggota" value={people.length} hint="Seluruh organisasi" />
        <StatCard label="Aktif" value={active} hint="30 hari terakhir" tone="success" />
        <StatCard label="Menunggu" value={pending} hint="Undangan belum diterima" tone={pending ? "warning" : undefined} />
        <StatCard label="Departemen" value={departments.length} hint="Struktur organisasi" href="/app/settings/departments" />
      </div>

      {people.length === 0 ? (
        <EmptyState title="Belum ada anggota" copy="Undang anggota pertama agar mereka bisa bekerja bersama di dalam Kullo." action={{ label: "Undang anggota", href: "/app/settings/members" }} />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {[...groups.entries()].map(([group, members]) => (
            <section key={group} className="panel" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid var(--border)" }}>
                <strong style={{ fontSize: 13 }}>{group}</strong>
                <span className="badge">{members.length} anggota</span>
              </div>
              <ul>
                {members.map((person, index) => (
                  <li
                    key={person.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 16px",
                      borderTop: index === 0 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <Avatar name={person.name} color={person.avatarColor} size={36} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 620 }}>{person.name}</p>
                      <p className="help" style={{ margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {person.title ?? ROLE_LABELS[person.role] ?? person.role} · bergabung {formatDate(person.joinedAt)}
                      </p>
                    </div>
                    <span className="hide-sm" style={{ fontSize: 12.5, color: "var(--text-muted)", minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {person.email}
                    </span>
                    <span className="badge" style={{ flexShrink: 0 }}>{ROLE_LABELS[person.role] ?? person.role}</span>
                    <span
                      className={`badge ${person.status === "active" ? "badge-success" : person.status === "disabled" ? "" : "badge-warning"}`}
                      style={{ flexShrink: 0 }}
                    >
                      {person.status === "active" ? "Aktif" : person.status === "disabled" ? "Nonaktif" : "Diundang"}
                    </span>
                    <span className="badge" style={{ flexShrink: 0 }} title="Tugas terbuka">{person.openTasks ?? 0} tugas</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
