import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Download, Filter, Timer } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getDepartments, getProjectOptions, getReports } from "@/lib/data";
import { can } from "@/lib/rbac";
import { Avatar, StatCard } from "@/components/app/ui";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Laporan" };

type SearchParams = Promise<{ department?: string; project?: string; from?: string; to?: string }>;

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const params = await searchParams;
  const departments = getDepartments(ctx.org.id);
  const projects = getProjectOptions(ctx.org.id);
  const reports = getReports(ctx.org.id, {
    departmentId: params.department,
    projectId: params.project,
    from: params.from,
    to: params.to,
  });
  const allowed = can(ctx, "report.view");
  const maxWeekly = Math.max(1, ...reports.weekly.map((week) => Math.max(week.created, week.completed)));
  const query = new URLSearchParams();
  if (params.department) query.set("departmentId", params.department);
  if (params.project) query.set("projectId", params.project);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);

  if (!allowed) {
    return (
      <>
        <h1 className="sr-only">Laporan</h1>
        <div className="empty-state">
          <strong style={{ color: "var(--text)" }}>Peran Anda belum memiliki izin melihat laporan</strong>
          <p style={{ margin: "4px 0 0" }}>Hubungi administrator organisasi untuk menyesuaikan izin <code>report.view</code>.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="sr-only">Laporan</h1>

      <form method="get" className="panel" style={{ padding: "10px 12px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <Filter size={14} style={{ color: "var(--text-muted)" }} />
        <select className="select" name="department" defaultValue={params.department ?? ""} style={{ width: "auto", height: 34, fontSize: 12.5 }} aria-label="Filter departemen">
          <option value="">Semua departemen</option>
          {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
        </select>
        <select className="select" name="project" defaultValue={params.project ?? ""} style={{ width: "auto", height: 34, fontSize: 12.5 }} aria-label="Filter proyek">
          <option value="">Semua proyek</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.code} · {project.name}</option>)}
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-muted)" }}>
          Dari <input className="input" type="date" name="from" defaultValue={params.from ?? ""} style={{ width: 140, height: 34, fontSize: 12 }} />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-muted)" }}>
          Sampai <input className="input" type="date" name="to" defaultValue={params.to ?? ""} style={{ width: 140, height: 34, fontSize: 12 }} />
        </label>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <button type="submit" className="btn btn-outline btn-sm">Terapkan</button>
          <a href={`/api/export/report?${query.toString()}`} className="btn btn-primary btn-sm">
            <Download size={15} /> Ekspor CSV
          </a>
        </span>
        <Link href="/app/reports" className="btn btn-ghost btn-sm">Reset</Link>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-muted)" }}>{reports.totals.total} tugas dalam rentang</span>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
        <StatCard label="Total tugas" value={formatNumber(reports.totals.total)} hint="Sesuai filter" />
        <StatCard label="Laju penyelesaian" value={`${reports.totals.completionRate}%`} hint={`${reports.totals.done} selesai`} tone="success" />
        <StatCard label="Terbuka" value={formatNumber(reports.totals.pending)} hint="Belum selesai" tone="warning" />
        <StatCard label="Terlambat" value={formatNumber(reports.totals.overdue)} hint="Melewati tenggat" tone="danger" />
        {reports.totals.avgCycleHours !== null && (
          <StatCard
            label="Rata-rata durasi"
            value={reports.totals.avgCycleHours >= 24 ? `${(reports.totals.avgCycleHours / 24).toFixed(1)} hari` : `${Math.max(1, Math.round(reports.totals.avgCycleHours))} jam`}
            hint="Dibuat → selesai"
          />
        )}
        {reports.totals.minutes > 0 && (
          <StatCard label="Waktu tercatat" value={`${(reports.totals.minutes / 60).toFixed(1)} jam`} hint="Dari log waktu" />
        )}
      </div>

      {reports.totals.total === 0 ? (
        <div className="empty-state" style={{ marginBottom: 16 }}>
          <BarChart3 size={24} style={{ color: "var(--text-muted)" }} />
          <strong style={{ display: "block", color: "var(--text)", marginTop: 6 }}>Tidak ada data pada filter ini</strong>
          <p style={{ margin: "3px 0 0" }}>Longgarkan rentang tanggal atau pilih departemen lain. Laporan tidak menampilkan angka pengganti.</p>
        </div>
      ) : null}

      <div className="reports-grid">
        <div style={{ display: "grid", gap: 16 }}>
          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Dibuat vs selesai · 8 minggu</h2><span className="badge">mingguan</span></div>
            <div className="panel-body">
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${reports.weekly.length}, 1fr)`, gap: 8, alignItems: "end", height: 180 }}>
                {reports.weekly.map((week) => (
                  <div key={week.label} style={{ display: "grid", gap: 3, justifyItems: "center", alignContent: "end" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
                      <div title={`${week.created} dibuat`} style={{ width: 9, height: Math.max(2, Math.round((week.created / maxWeekly) * 150)), background: "var(--accent)", borderRadius: "3px 3px 0 0", opacity: 0.45 }} />
                      <div title={`${week.completed} selesai`} style={{ width: 9, height: Math.max(2, Math.round((week.completed / maxWeekly) * 150)), background: "var(--success)", borderRadius: "3px 3px 0 0" }} />
                    </div>
                    <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>{week.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><span style={{ width: 9, height: 9, background: "var(--accent)", opacity: 0.45, borderRadius: 2 }} /> Dibuat</span>
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><span style={{ width: 9, height: 9, background: "var(--success)", borderRadius: 2 }} /> Selesai</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Progres proyek</h2><span className="badge">{reports.projects.length}</span></div>
            <div className="app-table-wrap">
              <table className="table" style={{ minWidth: 560 }}>
                <thead><tr><th>Proyek</th><th>Status</th><th>Progres</th><th>Tugas</th><th>Tenggat</th></tr></thead>
                <tbody>
                  {reports.projects.map((project) => (
                    <tr key={project.id}>
                      <td style={{ fontWeight: 550, fontSize: 12 }}>{project.name}</td>
                      <td><span className={`badge ${project.status === "active" ? "badge-accent" : project.status === "completed" ? "badge-success" : project.status === "on_hold" ? "badge-warning" : "badge"}`}>{project.status}</span></td>
                      <td style={{ minWidth: 130 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <div className="progress-track" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${project.progress}%` }} /></div>
                          <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{project.progress}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 11.5 }}>{project.done}/{project.total}</td>
                      <td style={{ fontSize: 11, color: "var(--text-muted)" }}>{project.dueDate ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Per departemen</h2></div>
            <div className="app-table-wrap">
              <table className="table" style={{ minWidth: 480 }}>
                <thead><tr><th>Departemen</th><th>Total</th><th>Selesai</th><th>Terlambat</th><th>Laju</th></tr></thead>
                <tbody>
                  {reports.departments.map((dept) => (
                    <tr key={dept.id}>
                      <td style={{ fontWeight: 550, fontSize: 12 }}>{dept.name}</td>
                      <td>{dept.total}</td>
                      <td>{dept.done}</td>
                      <td style={{ color: dept.overdue ? "var(--danger)" : undefined }}>{dept.overdue}</td>
                      <td style={{ fontSize: 11.5 }}>{dept.total ? Math.round((dept.done / dept.total) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Beban per anggota</h2></div>
            <div className="panel-body" style={{ display: "grid", gap: 11 }}>
              {reports.people.map((person) => (
                <div key={person.id} style={{ display: "grid", gap: 3 }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 11.5 }}>
                    <Avatar name={person.name} color={person.color} size={22} personId={person.id} />
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</span>
                    <span style={{ color: "var(--text-muted)" }}>{person.open} terbuka</span>
                  </div>
                  <div className="mini-bar" style={{ height: 5 }}><span style={{ width: `${Math.min(100, person.open * 14)}%`, background: person.overdue ? "var(--danger)" : undefined }} /></div>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{person.done} selesai · {person.overdue} terlambat · {(person.minutes / 60).toFixed(1)} jam</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><h2 className="panel-title">Catatan metrik</h2></div>
            <div className="panel-body" style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.65, display: "grid", gap: 7 }}>
              <p style={{ margin: 0 }}>Laju penyelesaian = tugas selesai ÷ total tugas pada filter.</p>
              <p style={{ margin: 0 }}>Durasi = waktu dari tugas dibuat sampai statusnya masuk kategori Done (dihitung ulang saat tugas dibuka kembali). Tugas yang belum selesai tidak dihitung.</p>
              <p style={{ margin: 0 }}>Terlambat dihitung dari tenggat yang sudah lewat dan status belum Done.</p>
              <p style={{ margin: 0, display: "flex", gap: 5, alignItems: "flex-start" }}><Timer size={13} style={{ flex: "none", marginTop: 2 }} /> Waktu berasal dari log waktu yang dicatat pada tugas. Tugas tanpa log tidak dihitung.</p>
              <p style={{ margin: 0 }}>Ekspor CSV memuat ringkasan, proyek, departemen, dan anggota sesuai filter aktif.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
