import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getDepartments, getPeople } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { Avatar, EmptyState, RoleBadge, StatCard } from "@/components/app/ui";
import { workloadTone } from "@/lib/markers";

export const metadata: Metadata = { title: "Tim" };

export default async function TeamsPage() {
  const ctx = await requireApp();
  const people = await getPeople(ctx.org.id);
  const departments = await getDepartments(ctx.org.id);
  const active = people.filter((person) => person.status === "active").length;
  const pending = people.filter((person) => person.status === "invited" || person.status === "pending").length;

  const groups = new Map<string, typeof people>();
  for (const person of people) {
    const key = person.departmentName ?? "Tanpa departemen";
    groups.set(key, [...(groups.get(key) ?? []), person]);
  }

  return (
    <>
      <h1 className="sr-only">Tim</h1>

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
                    className="team-row"
                    style={{ borderTop: index === 0 ? "none" : "1px solid var(--border)" }}
                  >
                    <Avatar name={person.name} color={person.avatarColor} size={36} personId={person.id} />
                    <div className="team-row-main">
                      <p className="team-row-name" title={person.name}>{person.name}</p>
                      <p
                        className="team-row-meta"
                        title={`${person.title ?? ROLE_LABELS[person.role] ?? person.role} · ${person.email} · bergabung ${formatDate(person.joinedAt)}`}
                      >
                        {person.title ?? ROLE_LABELS[person.role] ?? person.role}
                        <span className="team-email"> · {person.email}</span> · bergabung {formatDate(person.joinedAt)}
                      </p>
                    </div>
                    <div className="team-badges">
                      <RoleBadge role={person.role} label={ROLE_LABELS[person.role] ?? person.role} />
                      <span
                        className={`badge ${person.status === "active" ? "badge-success" : person.status === "disabled" ? "badge-neutral" : "badge-warning"}`}
                      >
                        {person.status === "active" ? "Aktif" : person.status === "disabled" ? "Nonaktif" : "Diundang"}
                      </span>
                      <span
                        className={`badge ${workloadTone(person.openTasks ?? 0) === "danger" ? "badge-danger" : workloadTone(person.openTasks ?? 0) === "warning" ? "badge-warning" : "badge-success"}`}
                        title="Tugas terbuka"
                      >
                        {person.openTasks ?? 0} tugas
                      </span>
                    </div>
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
