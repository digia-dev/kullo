import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  MessageSquare,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getDashboard } from "@/lib/data";
import { formatDate, formatTime, relativeTime } from "@/lib/utils";
import { Avatar, DueBadge, PriorityDot, StatCard, StatusBadge } from "@/components/app/ui";
import { eventColor, workloadTone } from "@/lib/markers";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const ctx = await requireApp();
  const data = getDashboard(ctx.org.id, ctx.user.id);
  const totalOpen = data.myTasks.length;
  const now = new Date().getTime();
  const completedWeek = data.completed.filter((task) => {
    const time = new Date(task.updatedAt).getTime();
    return now - time < 7 * 86400000;
  }).length;

  return (
    <>
      <h1 className="sr-only">Dashboard</h1>

      <div className="dash-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard label="Tugas saya" value={totalOpen} hint="Belum selesai" href="/app/my-work" />
        <StatCard label="Jatuh tempo hari ini" value={data.dueToday.length} hint="Perlu perhatian" tone="warning" href="/app/my-work?scope=assigned&view=list" />
        <StatCard label="Terlambat" value={data.overdue.length} hint="Melewati tenggat" tone="danger" href="/app/my-work?scope=overdue&view=list" />
        <StatCard label="Selesai 7 hari" value={completedWeek} hint="Tugas yang Anda tutup" tone="success" href="/app/my-work?scope=completed&view=list" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, .85fr)", gap: 16, alignItems: "start" }} className="dash-grid">
        <div style={{ display: "grid", gap: 16 }}>
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Tugas saya yang terbuka</h2>
              <span className="badge">{totalOpen}</span>
              <Link href="/app/my-work" className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>
                Semua <ArrowRight size={13} />
              </Link>
            </div>
            {data.myTasks.length === 0 ? (
              <div className="panel-body">
                <div className="empty-state">
                  <strong style={{ color: "var(--text)" }}>Tidak ada tugas terbuka</strong>
                  <p style={{ margin: "4px 0 10px" }}>Semua pekerjaan yang ditugaskan kepada Anda sudah selesai.</p>
                  <Link href="/app/dashboard?new=task" className="btn btn-outline btn-sm"><Plus size={14} /> Buat tugas</Link>
                </div>
              </div>
            ) : (
              <div>
                {data.myTasks.slice(0, 7).map((task) => (
                  <Link key={task.id} href={`/app/tasks?task=${task.id}`} className="task-row">
                    <span className={`task-check ${task.done ? "done" : ""}`}>
                      {task.done ? <CheckCircle2 size={15} /> : <Circle size={13} />}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="task-title">{task.title}</span>
                      <span className="task-meta">
                        <span>{task.projectCode ?? "TANPA PROYEK"}</span>
                        <span aria-hidden>·</span>
                        <StatusBadge status={task.statusName} category={task.statusCategory} />
                        <PriorityDot priority={task.priority} label={false} />
                        <DueBadge dueDate={task.dueDate} done={task.done} compact />
                      </span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {task.checklistTotal > 0 && <span className="badge">{task.checklistDone}/{task.checklistTotal}</span>}
                      {task.commentCount > 0 && <span className="badge"><MessageSquare size={10} /> {task.commentCount}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Proyek aktif</h2>
              <span className="badge">{data.projects.length}</span>
              <Link href="/app/projects" className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>
                Semua proyek <ArrowRight size={13} />
              </Link>
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 14 }}>
              {data.projects.length === 0 ? (
                <p className="help" style={{ margin: 0 }}>Belum ada proyek aktif.</p>
              ) : (
                data.projects.slice(0, 5).map((project) => (
                  <Link key={project.id} href={`/app/projects/${project.id}/overview`} style={{ display: "grid", gap: 5 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="badge" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{project.code}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-muted)" }}>{project.progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-muted)" }}>
                      <span>{project.taskDone}/{project.taskTotal} tugas</span>
                      <span>·</span>
                      <span>{project.departmentName ?? "Tanpa departemen"}</span>
                      <span>·</span>
                      <span>{project.dueDate ? `Tenggat ${formatDate(project.dueDate)}` : "Tanpa tenggat"}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Aktivitas terbaru</h2>
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 13 }}>
              {data.activity.length === 0 ? (
                <p className="help" style={{ margin: 0 }}>Belum ada aktivitas.</p>
              ) : (
                data.activity.map((row) => (
                  <div key={row.id} style={{ display: "flex", gap: 10 }}>
                    <Avatar name={row.actorName} color={row.actorColor} size={27} personId={row.actorId ?? undefined} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5 }}>
                        <strong>{row.actorName}</strong> {row.verb}{" "}
                        {row.meta && <span style={{ color: "var(--text-muted)" }}>{row.meta}</span>}
                      </p>
                      <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)" }}>{relativeTime(row.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Agenda terdekat</h2>
              <Link href="/app/calendar" className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>
                Kalender <ArrowRight size={13} />
              </Link>
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 11 }}>
              {data.events.length === 0 ? (
                <p className="help" style={{ margin: 0 }}>Tidak ada agenda mendatang.</p>
              ) : (
                data.events.map((event) => (
                  <div key={event.id} style={{ display: "flex", gap: 9 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 4,
                        borderRadius: 99,
                        background: eventColor(event.kind),
                        flex: "none",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600 }}>{event.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
                        {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Menunggu keputusan Anda</h2>
              {data.approvals.length > 0 && <span className="badge badge-warning">{data.approvals.length}</span>}
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 10 }}>
              {data.approvals.length === 0 ? (
                <p className="help" style={{ margin: 0 }}>Tidak ada permintaan yang menunggu keputusan Anda.</p>
              ) : (
                data.approvals.map((request) => (
                  <Link key={request.id} href="/app/approvals" className="badge badge-warning" style={{ height: "auto", padding: "8px 10px", justifyContent: "space-between", borderRadius: 8 }}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{request.title}</span>
                    <ArrowRight size={13} />
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Beban tim</h2>
              <Link href="/app/teams" className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>
                Tim <ArrowRight size={13} />
              </Link>
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 9 }}>
              {data.workload.slice(0, 6).map((person) => (
                <div key={person.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={person.name} color={person.color} size={23} personId={person.id} />
                  <span style={{ fontSize: 12, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</span>
                  <span
                    className="mini-bar workload-bar"
                    data-tone={workloadTone(person.open)}
                    style={{ width: 70 }}
                    aria-label={`${person.name}: ${person.open} tugas terbuka`}
                    title={`${person.open} tugas terbuka`}
                  >
                    <span style={{ width: `${Math.min(100, person.open * 14)}%` }} />
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 18, textAlign: "right" }}>{person.open}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {data.overdue.length > 0 && (
        <div className="panel" style={{ marginTop: 16, padding: 12, borderColor: "color-mix(in srgb, var(--danger) 30%, var(--border))", background: "var(--danger-soft)" }}>
          <p style={{ margin: 0, fontSize: 12.5, display: "flex", gap: 7, alignItems: "center", color: "var(--danger)" }}>
            <TriangleAlert size={14} /> {data.overdue.length} tugas melewati tenggat. Buka My Work untuk meninjau.
            <Link href="/app/my-work?scope=overdue" className="textlink" style={{ marginLeft: "auto", fontSize: 12 }}>Tinjau</Link>
          </p>
        </div>
      )}
      <p className="sr-only"><Clock3 /> Data diperbarui saat halaman dimuat.</p>
    </>
  );
}
