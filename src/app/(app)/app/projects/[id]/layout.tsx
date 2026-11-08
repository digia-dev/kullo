import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus, Settings } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getProjectBundle } from "@/lib/data";
import { can } from "@/lib/rbac";
import { AvatarStack, PageHeader } from "@/components/app/ui";
import { ProjectTabs } from "@/components/app/ProjectTabs";
import { formatDate, projectStatus } from "@/lib/utils";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireApp();
  const { id } = await params;
  const bundle = getProjectBundle(ctx.org.id, id);
  if (!bundle) notFound();
  const { project } = bundle;
  const status = projectStatus(project.status);
  const editable = can(ctx, "project.edit");

  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <Link href="/app/projects" className="textlink" style={{ fontSize: 12 }}>
          <ArrowLeft size={13} /> Semua proyek
        </Link>
        <span className="badge" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{project.code}</span>
        <span className={`badge ${status.tone}`}>{status.label}</span>
        {project.archivedAt && <span className="badge">Arsip</span>}
      </div>

      <PageHeader
        title={project.name}
        subtitle={project.description ?? "Belum ada deskripsi proyek."}
        actions={
          <>
            <Link href={`/app/projects/${project.id}/settings`} className="btn btn-outline btn-sm"><Settings size={14} /> Pengaturan</Link>
            {editable && <Link href={`/app/projects/${project.id}/board?new=task`} className="btn btn-primary btn-sm"><Plus size={15} /> Tugas</Link>}
          </>
        }
      />

      <div className="panel" style={{ padding: "12px 14px", marginBottom: 14, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Progres</span>
          <div className="progress-track" style={{ width: 120 }}>
            <div className="progress-fill" style={{ width: `${project.progress}%` }} />
          </div>
          <strong style={{ fontSize: 12 }}>{project.progress}%</strong>
        </div>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", display: "inline-flex", gap: 5, alignItems: "center" }}>
          <CalendarDays size={13} /> {project.startDate ? formatDate(project.startDate) : "—"} → {project.dueDate ? formatDate(project.dueDate) : "—"}
        </span>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{project.taskDone}/{project.taskTotal} tugas selesai · {project.milestoneDone}/{project.milestoneTotal} milestone</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8, alignItems: "center" }}>
          <AvatarStack people={bundle.members} max={5} />
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{project.managerName ? `PM ${project.managerName}` : "Belum ada PM"}</span>
        </span>
      </div>

      <ProjectTabs projectId={project.id} />
      <div style={{ paddingTop: 16 }}>{children}</div>
    </>
  );
}
