import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, FolderPlus, Search, Target, Users } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getDepartments, getPeople, getProjects } from "@/lib/data";
import { PageHeader, AvatarStack, EmptyState } from "@/components/app/ui";
import { daysFromToday, formatDate, projectStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Proyek" };

type SearchParams = Promise<{ status?: string; department?: string; q?: string; archived?: string }>;

const STATUS_OPTIONS = [
  ["", "Semua status"],
  ["planning", "Planning"],
  ["active", "Active"],
  ["on_hold", "On hold"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
] as const;

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const params = await searchParams;
  const people = getPeople(ctx.org.id);
  const departments = getDepartments(ctx.org.id);
  const all = getProjects(ctx.org.id, { includeArchived: params.archived === "1" });
  const q = (params.q ?? "").toLowerCase();
  const projects = all.filter((project) => {
    if (params.status && project.status !== params.status) return false;
    if (params.department && project.departmentId !== params.department) return false;
    if (q && !`${project.name} ${project.code} ${project.description ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        eyebrow="Portofolio"
        title="Proyek"
        subtitle={`${all.length} proyek · ${all.filter((project) => project.status === "active").length} aktif · ${all.filter((project) => project.status === "on_hold").length} ditahan`}
        actions={<Link href="/app/projects?new=project" className="btn btn-primary btn-sm"><FolderPlus size={15} /> Proyek baru</Link>}
      />

      <form method="get" className="panel" style={{ padding: "10px 12px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
          <Search size={14} aria-hidden style={{ position: "absolute", left: 9, top: 10, color: "var(--text-muted)" }} />
          <input className="input" name="q" defaultValue={params.q ?? ""} placeholder="Cari nama atau kode proyek…" style={{ paddingLeft: 30, height: 34, fontSize: 12.5 }} aria-label="Cari proyek" />
        </div>
        <select className="select" name="status" defaultValue={params.status ?? ""} style={{ width: "auto", height: 34, fontSize: 12.5 }} aria-label="Status proyek">
          {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="select" name="department" defaultValue={params.department ?? ""} style={{ width: "auto", height: 34, fontSize: 12.5 }} aria-label="Departemen">
          <option value="">Semua departemen</option>
          {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" name="archived" value="1" defaultChecked={params.archived === "1"} /> Tampilkan arsip
        </label>
        <button type="submit" className="btn btn-outline btn-sm">Terapkan</button>
        <Link href="/app/projects" className="btn btn-ghost btn-sm">Reset</Link>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-muted)" }}>{projects.length} hasil</span>
      </form>

      {projects.length === 0 ? (
        <EmptyState
          title="Belum ada proyek yang cocok"
          copy="Hapus filter atau buat proyek baru. Setiap proyek dimulai dengan lima status: Backlog, To Do, In Progress, In Review, Done."
          action={{ label: "Buat proyek", href: "/app/projects?new=project" }}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {projects.map((project) => {
            const status = projectStatus(project.status);
            const members = people.filter((person) => project.memberIds.includes(person.id));
            const late = project.dueDate ? daysFromToday(project.dueDate) < 0 && project.status !== "completed" : false;
            return (
              <article key={project.id} className="panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden", opacity: project.archivedAt ? 0.78 : 1 }}>
                <div style={{ height: 4, background: project.status === "completed" ? "var(--success)" : project.status === "on_hold" ? "var(--warning)" : "var(--accent)" }} />
                <div style={{ padding: 17, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span className="badge" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{project.code}</span>
                    <span className={`badge ${status.tone}`}>{status.label}</span>
                    {project.archivedAt && <span className="badge">Arsip</span>}
                    <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 650 }}>{project.progress}%</span>
                  </div>
                  <div>
                    <Link href={`/app/projects/${project.id}/overview`} style={{ fontSize: 16, fontWeight: 650, letterSpacing: "-0.02em", lineHeight: 1.35 }}>
                      {project.name}
                    </Link>
                    <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: 1.55, color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description || "Belum ada deskripsi."}</p>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${project.progress}%`, background: project.status === "completed" ? "var(--success)" : undefined }} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, fontSize: 11.5, color: "var(--text-muted)" }}>
                    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Target size={12} /> {project.taskDone}/{project.taskTotal} tugas</span>
                    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Users size={12} /> {project.memberCount} anggota</span>
                    <span style={{ display: "inline-flex", gap: 5, alignItems: "center", color: late ? "var(--danger)" : undefined }}><CalendarDays size={12} /> {project.dueDate ? formatDate(project.dueDate) : "Tanpa tenggat"}</span>
                    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>{project.departmentName ?? "Tanpa departemen"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 6 }}>
                    <AvatarStack people={members.length ? members : people.filter((person) => person.id === project.managerId)} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{project.managerName ? `PM ${project.managerName.split(" ")[0]}` : "Belum ada PM"}</span>
                    <Link href={`/app/projects/${project.id}/overview`} className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>
                      Buka <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
