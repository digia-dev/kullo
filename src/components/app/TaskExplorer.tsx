"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Columns3,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Avatar, EmptyState, PriorityDot, PriorityLabel, StatusBadge } from "./ui";
import { updateTaskAction } from "@/app/(app)/actions";
import { formatDate, priorityOf, todayISO } from "@/lib/utils";

export type ExplorerTask = {
  id: string;
  number: number;
  title: string;
  projectId: string | null;
  projectCode: string | null;
  projectName: string | null;
  statusId: string | null;
  statusName: string | null;
  statusCategory: string | null;
  statusPosition: number;
  priority: string;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
  reporterId: string | null;
  dueDate: string | null;
  startDate: string | null;
  done: boolean;
  overdue: boolean;
  labels: Array<{ id: string; name: string; color: string }>;
  collaboratorIds: string[];
  commentCount: number;
  checklistDone: number;
  checklistTotal: number;
};

export type ExplorerPerson = { id: string; name: string; avatarColor: string; departmentName?: string | null };
export type ExplorerProject = { id: string; code: string; name: string };
export type ExplorerStatus = { id: string; projectId: string; name: string; position: number; category: string };

const SCOPES = [
  ["assigned", "Ditugaskan"],
  ["created", "Dibuat"],
  ["following", "Diikuti"],
  ["completed", "Selesai"],
  ["overdue", "Terlambat"],
] as const;

const VIEWS = [
  { key: "list", label: "List", Icon: List },
  { key: "board", label: "Board", Icon: Columns3 },
  { key: "calendar", label: "Kalender", Icon: CalendarDays },
] as const;

function monthMatrix(base: Date) {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const start = new Date(first);
  const offset = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function TaskExplorer({
  tasks,
  people,
  projects,
  statuses,
  currentUserId,
  mode,
  initialScope = "assigned",
  initialView = "list",
}: {
  tasks: ExplorerTask[];
  people: ExplorerPerson[];
  projects: ExplorerProject[];
  statuses: ExplorerStatus[];
  currentUserId: string;
  mode: "my" | "all";
  initialScope?: string;
  initialView?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<string>(VIEWS.some((item) => item.key === initialView) ? initialView : "list");
  const [scope, setScope] = useState(initialScope);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [sort, setSort] = useState("due");
  const [month, setMonth] = useState(() => new Date());
  const [dragging, setDragging] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const scoped = useMemo(() => {
    if (mode !== "my") return tasks;
    switch (scope) {
      case "created":
        return tasks.filter((task) => task.reporterId === currentUserId);
      case "following":
        return tasks.filter((task) => task.collaboratorIds.includes(currentUserId));
      case "completed":
        return tasks.filter((task) => task.assigneeId === currentUserId && task.done);
      case "overdue":
        return tasks.filter((task) => task.assigneeId === currentUserId && task.overdue);
      default:
        return tasks.filter((task) => task.assigneeId === currentUserId && !task.done);
    }
  }, [tasks, mode, scope, currentUserId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = scoped.filter((task) => {
      if (q && !`${task.title} ${task.projectCode ?? ""} #${task.number}`.toLowerCase().includes(q)) return false;
      if (projectFilter && task.projectId !== projectFilter) return false;
      if (statusFilter === "open" && task.done) return false;
      if (statusFilter === "done" && !task.done) return false;
      if (statusFilter === "overdue" && !task.overdue) return false;
      if (statusFilter && !["open", "done", "overdue"].includes(statusFilter) && task.statusId !== statusFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;
      if (assigneeFilter && task.assigneeId !== assigneeFilter) return false;
      return true;
    });
    return rows.sort((a, b) => {
      if (sort === "priority") return priorityOf(b.priority).rank - priorityOf(a.priority).rank;
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "number") return a.number - b.number;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [scoped, query, projectFilter, statusFilter, priorityFilter, assigneeFilter, sort]);

  const columns = useMemo(() => {
    const source = projectFilter ? statuses.filter((status) => status.projectId === projectFilter) : statuses;
    const seen = new Map<string, ExplorerStatus>();
    for (const status of source.sort((a, b) => a.position - b.position)) {
      if (!seen.has(status.name)) seen.set(status.name, status);
    }
    return Array.from(seen.values());
  }, [statuses, projectFilter]);

  function openTask(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("task", id);
    router.push(`${pathname}?${url.searchParams.toString()}`, { scroll: false });
  }

  async function move(task: ExplorerTask, statusName: string) {
    if (!task.projectId) {
      setError("Tugas tanpa proyek belum punya status. Pindahkan ke proyek terlebih dahulu.");
      return;
    }
    const target = statuses.find((status) => status.projectId === task.projectId && status.name === statusName);
    if (!target || target.id === task.statusId) return;
    setSaving(true);
    setError("");
    const result = await updateTaskAction(task.id, { statusId: target.id });
    setSaving(false);
    if (!result.ok) setError(result.error ?? "Status gagal diubah.");
    else router.refresh();
  }

  async function toggleDone(task: ExplorerTask) {
    const doneStatus = statuses.find((status) => status.projectId === task.projectId && status.category === "done");
    const openStatus = statuses.find((status) => status.projectId === task.projectId && status.category === "open");
    const target = task.done ? openStatus : doneStatus;
    if (!target) {
      setError("Proyek ini belum memiliki status selesai.");
      return;
    }
    setSaving(true);
    const result = await updateTaskAction(task.id, { statusId: target.id });
    setSaving(false);
    if (!result.ok) setError(result.error ?? "Status gagal diubah.");
    else router.refresh();
  }

  const monthDays = monthMatrix(month);
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(month);
  const today = todayISO();
  const hasFilters = Boolean(query || projectFilter || statusFilter || priorityFilter || assigneeFilter);

  return (
    <>
      <div className="panel" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", flexWrap: "wrap" }}>
          {mode === "my" ? (
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {SCOPES.map(([key, label]) => (
                <button key={key} type="button" className={`tab ${scope === key ? "active" : ""}`} style={{ borderRadius: 7, borderBottom: "none", background: scope === key ? "var(--accent-soft)" : "transparent", color: scope === key ? "var(--accent)" : undefined }} onClick={() => setScope(key)}>
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <span className="badge">{filtered.length} tugas</span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
              {VIEWS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setView(item.key)}
                  title={item.label}
                  aria-pressed={view === item.key}
                  style={{
                    border: 0,
                    padding: "6px 10px",
                    display: "inline-flex",
                    gap: 5,
                    alignItems: "center",
                    background: view === item.key ? "var(--accent-soft)" : "var(--bg)",
                    color: view === item.key ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: view === item.key ? 600 : 500,
                  }}
                >
                  <item.Icon size={14} /> <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
            <Link href={`${pathname}?new=task`} className="btn btn-primary btn-sm">
              <Plus size={14} /> Tugas
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "0 12px 11px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <div style={{ position: "relative", flex: "1 1 190px", minWidth: 150 }}>
            <Search size={14} aria-hidden style={{ position: "absolute", left: 9, top: 10, color: "var(--text-muted)" }} />
            <input className="input" style={{ paddingLeft: 30, height: 34, fontSize: 12.5 }} placeholder="Cari judul atau kode…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari tugas" />
          </div>
          <select className="select" style={{ width: "auto", height: 34, fontSize: 12.5 }} value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} aria-label="Filter proyek">
            <option value="">Semua proyek</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.code} · {project.name}</option>)}
          </select>
          <select className="select" style={{ width: "auto", height: 34, fontSize: 12.5 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status">
            <option value="">Semua status</option>
            <option value="open">Terbuka</option>
            <option value="overdue">Terlambat</option>
            <option value="done">Selesai</option>
            {(projectFilter ? statuses.filter((status) => status.projectId === projectFilter) : columns).map((status) => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
          <select className="select" style={{ width: "auto", height: 34, fontSize: 12.5 }} value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="Filter prioritas">
            <option value="">Semua prioritas</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {mode === "all" && (
            <select className="select" style={{ width: "auto", height: 34, fontSize: 12.5 }} value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} aria-label="Filter PIC">
              <option value="">Semua PIC</option>
              {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          )}
          <select className="select" style={{ width: "auto", height: 34, fontSize: 12.5 }} value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Urutkan">
            <option value="due">Tenggat</option>
            <option value="priority">Prioritas</option>
            <option value="title">Judul</option>
            <option value="number">Terbaru</option>
          </select>
          {hasFilters && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setQuery(""); setProjectFilter(""); setStatusFilter(""); setPriorityFilter(""); setAssigneeFilter(""); }}>
              <SlidersHorizontal size={13} /> Reset
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-muted)" }}>{filtered.length} hasil{saving ? " · menyimpan…" : ""}</span>
        </div>
        {error && <p className="error-text" style={{ padding: "0 12px 10px", margin: 0 }} role="alert">{error}</p>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada tugas pada filter ini"
          copy={mode === "my" ? "Coba tab lain atau hapus filter. Tugas baru dapat dibuat dari tombol di atas." : "Ubah filter proyek, status, atau PIC untuk melihat tugas lain."}
          action={{ label: "Buat tugas", href: `${pathname}?new=task` }}
        />
      ) : view === "list" ? (
        <div className="panel app-table-wrap">
          <table className="table" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ width: 34 }} />
                <th>Tugas</th>
                <th>Proyek</th>
                <th>Status</th>
                <th>Prioritas</th>
                <th>PIC</th>
                <th>Tenggat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} onClick={() => openTask(task.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <button
                      type="button"
                      className={`task-check ${task.done ? "done" : ""}`}
                      aria-label={task.done ? "Tandai belum selesai" : "Tandai selesai"}
                      onClick={(event) => { event.stopPropagation(); void toggleDone(task); }}
                      disabled={saving}
                    >
                      {task.done ? <CheckCircle2 size={15} /> : <Circle size={12} />}
                    </button>
                  </td>
                  <td style={{ maxWidth: 340 }}>
                    <span style={{ display: "block", fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
                    <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)" }}>
                      KUL-{String(task.number).padStart(3, "0")}
                      {task.commentCount ? ` · ${task.commentCount} komentar` : ""}
                      {task.checklistTotal ? ` · ${task.checklistDone}/${task.checklistTotal} checklist` : ""}
                    </span>
                  </td>
                  <td style={{ fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{task.projectCode ?? "—"}</td>
                  <td><StatusBadge status={task.statusName} category={task.statusCategory} /></td>
                  <td><PriorityLabel priority={task.priority} /></td>
                  <td>
                    {task.assigneeName ? (
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 11.5 }}>
                        <Avatar name={task.assigneeName} color={task.assigneeColor} size={21} /> {task.assigneeName.split(" ")[0]}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 11.5 }}>Belum ada</span>
                    )}
                  </td>
                  <td style={{ fontSize: 11.5, color: task.overdue ? "var(--danger)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {task.dueDate ? formatDate(task.dueDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : view === "board" ? (
        <div className="board">
          {columns.map((column) => {
            const items = filtered.filter((task) => task.statusName === column.name);
            return (
              <div
                key={column.name}
                className={`board-col ${overColumn === column.name ? "over" : ""}`}
                onDragOver={(event) => { event.preventDefault(); setOverColumn(column.name); }}
                onDragLeave={() => setOverColumn((value) => (value === column.name ? null : value))}
                onDrop={(event) => {
                  event.preventDefault();
                  setOverColumn(null);
                  const task = filtered.find((row) => row.id === dragging);
                  if (task) void move(task, column.name);
                  setDragging(null);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 4px 9px" }}>
                  <span style={{ fontSize: 12, fontWeight: 650 }}>{column.name}</span>
                  <span className="badge">{items.length}</span>
                </div>
                {items.map((task) => (
                  <article
                    key={task.id}
                    className={`board-card ${dragging === task.id ? "dragging" : ""}`}
                    draggable
                    onDragStart={() => setDragging(task.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => openTask(task.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "center" }}>
                      <span className="badge" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5 }}>{task.projectCode ?? "—"}</span>
                      <PriorityDot priority={task.priority} label={false} />
                    </div>
                    <p style={{ margin: "6px 0 5px", fontSize: 12.5, fontWeight: 550, lineHeight: 1.4 }}>{task.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10.5, color: task.overdue ? "var(--danger)" : "var(--text-muted)" }}>{task.dueDate ? formatDate(task.dueDate) : "Tanpa tenggat"}</span>
                      {task.assigneeName && <Avatar name={task.assigneeName} color={task.assigneeColor} size={21} />}
                    </div>
                    <select
                      className="select"
                      aria-label={`Pindahkan ${task.title}`}
                      value={task.statusName ?? ""}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => { void move(task, event.target.value); }}
                      style={{ marginTop: 7, height: 26, fontSize: 10.5, padding: "0 5px" }}
                    >
                      {columns.map((status) => <option key={status.name} value={status.name}>{status.name}</option>)}
                    </select>
                  </article>
                ))}
                {items.length === 0 && <p className="help" style={{ textAlign: "center", padding: "14px 0", margin: 0 }}>Kosong</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <button type="button" className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Bulan sebelumnya"><ChevronLeft size={17} /></button>
            <strong style={{ fontSize: 13.5, textTransform: "capitalize" }}>{monthLabel}</strong>
            <button type="button" className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Bulan berikutnya"><ChevronRight size={17} /></button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMonth(new Date())} style={{ marginLeft: 4 }}>Hari ini</button>
            <span className="help" style={{ marginLeft: "auto" }}>{filtered.filter((task) => task.dueDate).length} tugas bertenggat</span>
          </div>
          <div className="calendar-grid" style={{ gridTemplateColumns: "repeat(7,minmax(78px,1fr))" }}>
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
              <div key={day} style={{ padding: "7px 8px", fontSize: 10.5, fontWeight: 650, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>{day}</div>
            ))}
            {monthDays.map((date) => {
              const key = dateKey(date);
              const inMonth = date.getMonth() === month.getMonth();
              const dayTasks = filtered.filter((task) => task.dueDate === key);
              return (
                <div key={key} className={`calendar-cell ${inMonth ? "" : "muted"} ${key === today ? "today" : ""}`}>
                  <span style={{ fontSize: 10.5, fontWeight: key === today ? 700 : 500, color: key === today ? "var(--accent)" : undefined }}>{date.getDate()}</span>
                  {dayTasks.slice(0, 3).map((task) => (
                    <button key={task.id} type="button" className="calendar-event" style={{ width: "100%", textAlign: "left", border: 0, cursor: "pointer", background: task.done ? "var(--success-soft)" : undefined, color: task.done ? "var(--success)" : undefined }} onClick={() => openTask(task.id)} title={task.title}>
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>+{dayTasks.length - 3} lagi</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
