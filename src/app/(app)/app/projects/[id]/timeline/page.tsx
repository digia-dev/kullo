import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getProjectBundle } from "@/lib/data";
import { Avatar, PriorityDot, StatusBadge } from "@/components/app/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Timeline proyek" };

function parseDate(value: string) {
  return new Date(`${value}T00:00:00+07:00`).getTime();
}

export default async function ProjectTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireApp();
  const { id } = await params;
  const bundle = getProjectBundle(ctx.org.id, id);
  if (!bundle) notFound();
  const tasks = bundle.tasks.filter((task) => task.dueDate || task.startDate);
  const dates = tasks.flatMap((task) => [task.startDate, task.dueDate].filter(Boolean) as string[]);
  const now = new Date().getTime();
  const fallbackStart = bundle.project.startDate ?? new Date().toISOString().slice(0, 10);
  const fallbackEnd = bundle.project.dueDate ?? new Date(now + 30 * 86400000).toISOString().slice(0, 10);
  const start = dates.length ? dates.reduce((min, date) => (date < min ? date : min), dates[0]) : fallbackStart;
  const end = dates.length ? dates.reduce((max, date) => (date > max ? date : max), dates[0]) : fallbackEnd;
  const span = Math.max(1, parseDate(end) - parseDate(start));

  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>Timeline</h2>
        <span className="badge"><CalendarDays size={11} /> {formatDate(start)} → {formatDate(end)}</span>
        <span className="help">{tasks.length} tugas memiliki tanggal</span>
      </div>

      <div className="panel" style={{ padding: "14px 16px" }}>
        {tasks.length === 0 ? (
          <p className="help" style={{ margin: 0 }}>Belum ada tugas dengan tanggal mulai atau tenggat. Tambahkan tanggal pada tugas untuk melihat timeline.</p>
        ) : (
          <div>
            <div className="gantt-row" style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 650, textTransform: "uppercase", letterSpacing: ".06em" }}>
              <span>Tugas</span>
              <div style={{ position: "relative", height: 16 }}>
                <span style={{ position: "absolute", left: 0 }}>{formatDate(start)}</span>
                <span style={{ position: "absolute", right: 0 }}>{formatDate(end)}</span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              {tasks.map((task) => {
                const taskStart = task.startDate ?? task.dueDate ?? start;
                const taskEnd = task.dueDate ?? task.startDate ?? end;
                const left = Math.max(0, ((parseDate(taskStart) - parseDate(start)) / span) * 100);
                const width = Math.max(1.5, ((parseDate(taskEnd) - parseDate(taskStart)) / span) * 100);
                return (
                  <div key={task.id} className="gantt-row">
                    <Link href={`/app/tasks?task=${task.id}`} style={{ display: "flex", gap: 7, alignItems: "center", minWidth: 0 }}>
                      {task.assigneeName && <Avatar name={task.assigneeName} color={task.assigneeColor} size={21} />}
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 12, fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
                        <span style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 1 }}>
                          <StatusBadge status={task.statusName} category={task.statusCategory} />
                          <PriorityDot priority={task.priority} label={false} />
                        </span>
                      </span>
                    </Link>
                    <div className="gantt-track">
                      <span
                        className="gantt-bar"
                        style={{
                          left: `${left}%`,
                          width: `${Math.min(100 - left, width)}%`,
                          background: task.done ? "var(--success)" : task.overdue ? "var(--danger)" : "var(--accent)",
                          opacity: task.done ? 0.6 : 1,
                        }}
                        title={`${formatDate(taskStart)} → ${formatDate(taskEnd)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="help" style={{ margin: "10px 0 0" }}>Bar menunjukkan rentang tanggal mulai sampai tenggat. Tugas tanpa salah satu tanggal memakai tanggal yang tersedia.</p>
          </div>
        )}
      </div>
    </>
  );
}
