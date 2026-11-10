import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle, FileText, Target, Users } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getProjectBundle } from "@/lib/data";
import { can } from "@/lib/rbac";
import { Avatar, DueBadge, StatCard, StatusBadge } from "@/components/app/ui";
import { MilestoneList } from "@/components/app/MilestoneList";
import { formatBytes, formatDate, priorityOf, relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview proyek" };

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireApp();
  const { id } = await params;
  const bundle = getProjectBundle(ctx.org.id, id);
  if (!bundle) notFound();
  const { project, tasks, statuses, milestones, members, activity, documents } = bundle;
  const done = tasks.filter((task) => task.done).length;
  const overdue = tasks.filter((task) => task.overdue).length;
  const open = tasks.length - done;
  const editable = can(ctx, "project.edit");

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
        <StatCard label="Total tugas" value={tasks.length} hint={`${open} terbuka`} />
        <StatCard label="Selesai" value={done} hint={`${project.progress}% progres`} tone="success" />
        <StatCard label="Terlambat" value={overdue} hint={overdue ? "Perlu tindakan" : "Tidak ada"} tone={overdue ? "danger" : undefined} />
        <StatCard label="Anggota" value={members.length} hint={project.departmentName ?? "Tanpa departemen"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, .8fr)", gap: 16, alignItems: "start" }} className="dash-grid">
        <div style={{ display: "grid", gap: 16 }}>
          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Status pekerjaan</h2><span className="badge">{tasks.length}</span></div>
            <div className="panel-body" style={{ display: "grid", gap: 10 }}>
              {statuses.map((status) => {
                const count = tasks.filter((task) => task.statusId === status.id).length;
                const width = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
                return (
                  <div key={status.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr 32px", gap: 9, alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{status.name}</span>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${width}%`, background: status.category === "done" ? "var(--success)" : undefined }} /></div>
                    <span style={{ fontSize: 11.5, textAlign: "right", color: "var(--text-muted)" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Tugas terbaru</h2>
              <Link href={`/app/projects/${project.id}/list`} className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>
                Lihat semua <ArrowRight size={13} />
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div className="panel-body"><p className="help" style={{ margin: 0 }}>Belum ada tugas di proyek ini.</p></div>
            ) : (
              <div>
                {tasks.slice(0, 6).map((task) => (
                  <Link key={task.id} href={`/app/tasks?task=${task.id}`} className="task-row">
                    <span className={`task-check ${task.done ? "done" : ""}`}>{task.done ? <CheckCircle2 size={15} /> : <Circle size={12} />}</span>
                    <span style={{ minWidth: 0 }}>
                      <span className="task-title">{task.title}</span>
                      <span className="task-meta">
                        KUL-{String(task.number).padStart(3, "0")}
                        <StatusBadge status={task.statusName} category={task.statusCategory} />
                        <DueBadge dueDate={task.dueDate} done={task.done} compact />
                      </span>
                    </span>
                    <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span className="priority-dot" style={{ background: priorityOf(task.priority).color }} />
                      {task.assigneeName && <Avatar name={task.assigneeName} color={task.assigneeColor} size={22} personId={task.assigneeId ?? undefined} />}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Aktivitas proyek</h2></div>
            <div className="panel-body" style={{ display: "grid", gap: 10 }}>
              {activity.length === 0 ? <p className="help" style={{ margin: 0 }}>Belum ada aktivitas tercatat.</p> : activity.map((row) => (
                <div key={row.id} style={{ display: "flex", gap: 8 }}>
                  <span style={{ width: 5, borderRadius: 99, background: "var(--accent)", flex: "none" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 12.5 }}><strong>{row.actorName}</strong> {row.verb} {row.meta && <span style={{ color: "var(--text-muted)" }}>{row.meta}</span>}</p>
                    <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)" }}>{relativeTime(row.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Milestone</h2><span className="badge">{project.milestoneDone}/{project.milestoneTotal}</span></div>
            <div className="panel-body"><MilestoneList projectId={project.id} milestones={milestones.map((item) => ({ id: item.id, name: item.name, dueDate: item.dueDate, done: item.done }))} canEdit={editable} /></div>
          </section>

          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Tim proyek</h2><span className="badge"><Users size={11} /> {members.length}</span></div>
            <div className="panel-body" style={{ display: "grid", gap: 9 }}>
              {members.map((person) => (
                <div key={person.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Avatar name={person.name} color={person.avatarColor} size={26} personId={person.id} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</p>
                    <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)" }}>{person.title ?? "Anggota"}</p>
                  </div>
                  <span className="badge" style={{ textTransform: "capitalize" }}>{person.role}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Detail</h2></div>
            <div className="panel-body" style={{ display: "grid", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--text-muted)" }}>Manajer</span><strong>{project.managerName ?? "—"}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--text-muted)" }}>Pemilik</span><strong>{project.ownerName ?? "—"}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--text-muted)" }}>Departemen</span><strong>{project.departmentName ?? "—"}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--text-muted)" }}>Prioritas</span><strong style={{ color: priorityOf(project.priority).color }}>{priorityOf(project.priority).label}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--text-muted)" }}>Mulai</span><strong>{project.startDate ? formatDate(project.startDate) : "—"}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--text-muted)" }}>Tenggat</span><strong>{project.dueDate ? formatDate(project.dueDate) : "—"}</strong></div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">File proyek</h2><Link href={`/app/projects/${project.id}/files`} className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>Semua</Link></div>
            <div className="panel-body" style={{ display: "grid", gap: 8 }}>
              {documents.length === 0 ? <p className="help" style={{ margin: 0 }}>Belum ada file terkait proyek.</p> : documents.slice(0, 5).map((doc) => (
                <div key={doc.id} style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12 }}>
                  <FileText size={14} style={{ color: "var(--text-muted)", flex: "none" }} />
                  <Link href={`/app/documents?doc=${doc.id}`} style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</Link>
                  <span style={{ color: "var(--text-muted)", fontSize: 10.5 }}>{formatBytes(doc.size)}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="panel" style={{ padding: 16, background: "var(--surface)" }}>
            <p style={{ margin: 0, fontSize: 12.5, display: "flex", gap: 6, alignItems: "center" }}>
              <Target size={15} style={{ color: "var(--accent)" }} /> Progres dihitung dari status tugas, bukan angka manual.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
