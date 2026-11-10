"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
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
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Avatar, DueBadge, EmptyState, PriorityDot, PriorityLabel, StatusBadge } from "./ui";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "./Toaster";
import {
  createStatusAction,
  createTaskAction,
  deleteStatusAction,
  reorderStatusAction,
  updateStatusAction,
  updateTaskAction,
} from "@/app/(app)/actions";
import { formatDate, priorityOf, todayISO } from "@/lib/utils";
import { notifySync } from "@/lib/client-sync";

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
  blockedByCount: number;
  labels: Array<{ id: string; name: string; color: string }>;
  collaboratorIds: string[];
  commentCount: number;
  attachmentCount: number;
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

const COL_CATEGORIES = [
  ["open", "Terbuka"],
  ["active", "Berjalan"],
  ["review", "Review"],
  ["blocked", "Terhambat"],
  ["done", "Selesai"],
] as const;

type BoardGroup = {
  name: string;
  dropable: boolean;
  items: ExplorerTask[];
  statusId: string | null;
  projectId: string | null;
  projectIds: string[];
  category: string;
};

/** Wajah yang tampil di kartu: PIC lalu kolaborator, maksimal dua. */
function cardFaces(task: ExplorerTask, people: ExplorerPerson[]) {
  const faces: Array<{ id: string; name: string; color: string | null }> = [];
  if (task.assigneeId && task.assigneeName) {
    faces.push({ id: task.assigneeId, name: task.assigneeName, color: task.assigneeColor });
  }
  for (const id of task.collaboratorIds) {
    if (faces.length >= 2) break;
    if (faces.some((face) => face.id === id)) continue;
    const person = people.find((row) => row.id === id);
    if (person) faces.push({ id: person.id, name: person.name, color: person.avatarColor });
  }
  const extra = task.collaboratorIds.filter(
    (id) => id !== task.assigneeId && !faces.some((face) => face.id === id),
  ).length;
  return { faces, extra };
}

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

  useEffect(() => {
    setView(VIEWS.some((item) => item.key === initialView) ? initialView : "list");
  }, [initialView]);
  const scope = initialScope;
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [sort, setSort] = useState("due");
  const [filtersReady, setFiltersReady] = useState(false);
  const filterKey = `kullo:task-filters:${mode}`;
  const [month, setMonth] = useState(() => new Date());
  const [dragging, setDragging] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Editor papan: menu kolom, rename inline, composer daftar & kartu, hapus tahap.
  const [menuColumn, setMenuColumn] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameCancelled = useRef(false);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [composerColumn, setComposerColumn] = useState<string | null>(null);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerProject, setComposerProject] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BoardGroup | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const composerInput = useRef<HTMLTextAreaElement | null>(null);

  // Menu kolom tertutup saat klik di luar atau menekan Escape.
  useEffect(() => {
    if (!menuColumn) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".board-menu-wrap")) setMenuColumn(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuColumn(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuColumn]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(filterKey);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, string | undefined>;
        if (saved.query) setQuery(saved.query);
        if (saved.projectFilter) setProjectFilter(saved.projectFilter);
        if (saved.statusFilter) setStatusFilter(saved.statusFilter);
        if (saved.priorityFilter) setPriorityFilter(saved.priorityFilter);
        if (saved.assigneeFilter) setAssigneeFilter(saved.assigneeFilter);
        if (saved.sort) setSort(saved.sort);
      }
    } catch {
      // storage unavailable or invalid JSON; start with empty filters
    }
    setFiltersReady(true);
  }, [filterKey]);

  useEffect(() => {
    if (!filtersReady) return;
    try {
      window.sessionStorage.setItem(filterKey, JSON.stringify({ query, projectFilter, statusFilter, priorityFilter, assigneeFilter, sort }));
    } catch {
      // storage unavailable; filters still work for this view
    }
  }, [filtersReady, filterKey, query, projectFilter, statusFilter, priorityFilter, assigneeFilter, sort]);

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

  // Sumber status memperhitungkan filter proyek: bila hanya satu proyek yang
  // memasok kolom, papan boleh diedit (rename, urutan, tambah, hapus).
  const statusSource = useMemo(
    () => (projectFilter ? statuses.filter((status) => status.projectId === projectFilter) : statuses),
    [statuses, projectFilter],
  );
  const boardSingleProject = useMemo(() => {
    const ids = new Set(statusSource.map((status) => status.projectId));
    return ids.size === 1 ? Array.from(ids)[0] : null;
  }, [statusSource]);

  // Setiap tugas yang lolos filter harus tampil di Board. Tugas tanpa status
  // (atau dengan status yang tidak ada lagi) masuk kolom "Tanpa status" supaya
  // tampilan List dan Board tidak pernah berbeda jumlah.
  const boardGroups = useMemo<BoardGroup[]>(() => {
    const names = new Set(columns.map((column) => column.name));
    const groups: BoardGroup[] = columns.map((column) => {
      const matches = statusSource.filter((status) => status.name === column.name);
      const projectIds = Array.from(new Set(matches.map((status) => status.projectId)));
      const single = projectIds.length === 1;
      return {
        name: column.name,
        dropable: true,
        items: filtered.filter((task) => task.statusName === column.name),
        statusId: single ? matches[0].id : null,
        projectId: single ? projectIds[0] : null,
        projectIds,
        category: single ? matches[0].category : "open",
      };
    });
    const orphans = filtered.filter((task) => !task.statusName || !names.has(task.statusName));
    if (orphans.length > 0) {
      groups.push({ name: "Tanpa status", dropable: false, items: orphans, statusId: null, projectId: null, projectIds: [], category: "open" });
    }
    return groups;
  }, [columns, filtered, statusSource]);

  /** Jalankan aksi papan: sibuk, pesan galat, refresh, toast. */
  async function boardAction(
    run: () => Promise<{ ok: boolean; error?: string }>,
    successMessage?: string,
  ): Promise<boolean> {
    setSaving(true);
    setError("");
    notifySync("syncing");
    const result = await run();
    setSaving(false);
    if (!result.ok) {
      notifySync("error");
      setError(result.error ?? "Perubahan gagal disimpan.");
      return false;
    }
    notifySync("saved");
    if (successMessage) toast(successMessage);
    router.refresh();
    return true;
  }

  function startRename(group: BoardGroup) {
    setMenuColumn(null);
    renameCancelled.current = false;
    setRenameValue(group.name);
    setRenaming(group.name);
  }

  async function commitRename(group: BoardGroup) {
    if (renameCancelled.current) {
      renameCancelled.current = false;
      setRenaming(null);
      return;
    }
    const value = renameValue.trim();
    setRenaming(null);
    if (!group.statusId || !value || value === group.name) return;
    await boardAction(() => updateStatusAction(group.statusId as string, { name: value }), "Nama tahap diperbarui");
  }

  async function changeCategory(group: BoardGroup, category: string) {
    if (!group.statusId) return;
    setMenuColumn(null);
    await boardAction(() => updateStatusAction(group.statusId as string, { category }), "Kategori tahap diperbarui");
  }

  async function moveColumn(group: BoardGroup, direction: -1 | 1) {
    if (!group.statusId) return;
    setMenuColumn(null);
    await boardAction(() => reorderStatusAction(group.statusId as string, direction), "Urutan tahap diperbarui");
  }

  async function confirmDelete() {
    if (!deleteTarget?.statusId) return;
    setDeleteError("");
    const result = await deleteStatusAction(deleteTarget.statusId);
    if (!result.ok) {
      setDeleteError(result.error ?? "Tahap gagal dihapus.");
      return;
    }
    setDeleteTarget(null);
    toast("Tahap dihapus");
    router.refresh();
  }

  async function submitList() {
    const value = newListName.trim();
    if (!value || !boardSingleProject) return;
    const ok = await boardAction(() => createStatusAction(boardSingleProject, value), "Tahap ditambahkan");
    if (ok) {
      setNewListName("");
      setAddingList(false);
    }
  }

  function openComposer(group: BoardGroup) {
    setComposerColumn(group.name);
    setComposerTitle("");
    setComposerProject(group.projectId ?? group.projectIds[0] ?? "");
    window.setTimeout(() => composerInput.current?.focus(), 0);
  }

  function closeComposer() {
    setComposerColumn(null);
    setComposerTitle("");
  }

  async function submitCard(group: BoardGroup) {
    const title = composerTitle.trim();
    if (title.length < 3) {
      setError("Judul tugas minimal 3 karakter.");
      return;
    }
    const projectId = composerProject || group.projectId || group.projectIds[0] || "";
    const status = statusSource.find((row) => row.projectId === projectId && row.name === group.name);
    const data = new FormData();
    data.set("title", title);
    if (projectId) data.set("projectId", projectId);
    if (status?.id) data.set("statusId", status.id);
    data.set("priority", "medium");
    const ok = await boardAction(() => createTaskAction(data), "Tugas dibuat");
    if (ok) {
      setComposerTitle("");
      composerInput.current?.focus();
    }
  }

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
    notifySync("syncing");
    const result = await updateTaskAction(task.id, { statusId: target.id });
    setSaving(false);
    if (!result.ok) {
      notifySync("error");
      setError(result.error ?? "Status gagal diubah.");
    } else {
      notifySync("saved");
      router.refresh();
    }
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
    notifySync("syncing");
    const result = await updateTaskAction(task.id, { statusId: target.id });
    setSaving(false);
    if (!result.ok) {
      notifySync("error");
      setError(result.error ?? "Status gagal diubah.");
    } else {
      notifySync("saved");
      router.refresh();
    }
  }

  const monthDays = monthMatrix(month);
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(month);
  const today = todayISO();
  const hasFilters = Boolean(query || projectFilter || statusFilter || priorityFilter || assigneeFilter);

  return (
    <>
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="task-toolbar" style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", flexWrap: "wrap" }}>
          <span className="badge">
            {filtered.length} tugas
            {mode === "my" && scope !== "assigned" ? ` · ${SCOPES.find(([key]) => key === scope)?.[1] ?? ""}` : ""}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }} role="group" aria-label="Tampilan tugas">
              {VIEWS.map((item) => {
                const active = view === item.key;
                const style: CSSProperties = {
                  border: 0,
                  padding: "6px 10px",
                  display: "inline-flex",
                  gap: 5,
                  alignItems: "center",
                  background: active ? "var(--accent-soft)" : "var(--bg)",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                };
                const inner = (
                  <>
                    <item.Icon size={14} aria-hidden /> <span>{item.label}</span>
                  </>
                );
                return mode === "my" ? (
                  <Link key={item.key} href={`/app/my-work?view=${item.key}&scope=${scope}`} title={item.label} aria-current={active ? "true" : undefined} style={style}>
                    {inner}
                  </Link>
                ) : (
                  <button key={item.key} type="button" onClick={() => setView(item.key)} title={item.label} aria-pressed={active} style={style}>
                    {inner}
                  </button>
                );
              })}
            </div>
            <Link href={`${pathname}?new=task`} className="btn btn-primary btn-sm toolbar-new">
              <Plus size={14} /> Tugas
            </Link>
          </div>
        </div>

        <div className="task-filters" style={{ display: "flex", gap: 8, alignItems: "center", padding: "0 12px 11px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
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
        {hasFilters && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", padding: "0 12px 10px" }} aria-label="Filter aktif">
            <span className="help" style={{ marginRight: 2 }}>Filter aktif</span>
            {query && (
              <button type="button" className="filter-chip" onClick={() => setQuery("")} aria-label="Hapus filter pencarian">
                Cari: “{query}” <X size={11} />
              </button>
            )}
            {projectFilter && (
              <button type="button" className="filter-chip" onClick={() => setProjectFilter("")} aria-label="Hapus filter proyek">
                {projects.find((project) => project.id === projectFilter)?.code ?? "Proyek"} <X size={11} />
              </button>
            )}
            {statusFilter && (
              <button type="button" className="filter-chip" onClick={() => setStatusFilter("")} aria-label="Hapus filter status">
                {statusFilter === "open" ? "Terbuka" : statusFilter === "done" ? "Selesai" : statusFilter === "overdue" ? "Terlambat" : statuses.find((status) => status.id === statusFilter)?.name ?? "Status"} <X size={11} />
              </button>
            )}
            {priorityFilter && (
              <button type="button" className="filter-chip" onClick={() => setPriorityFilter("")} aria-label="Hapus filter prioritas">
                {priorityOf(priorityFilter).label} <X size={11} />
              </button>
            )}
            {assigneeFilter && (
              <button type="button" className="filter-chip" onClick={() => setAssigneeFilter("")} aria-label="Hapus filter PIC">
                {people.find((person) => person.id === assigneeFilter)?.name ?? "PIC"} <X size={11} />
              </button>
            )}
          </div>
        )}
        {error && <p className="error-text" style={{ padding: "0 12px 10px", margin: 0 }} role="alert">{error}</p>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada tugas pada filter ini"
          copy={mode === "my" ? "Ubah pencarian atau hapus filter untuk melihat tugas lain. Tugas baru dapat dibuat dari tombol di atas." : "Ubah filter proyek, status, atau PIC untuk melihat tugas lain."}
          action={{ label: "Buat tugas", href: `${pathname}?new=task` }}
        />
      ) : view === "list" ? (
        <div className="panel app-table-wrap" data-mode={mode}>
          <table className="table task-table" style={{ minWidth: 720 }}>
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
                    {task.blockedByCount > 0 && (
                      <span className="badge badge-danger" style={{ height: 18, fontSize: 9.5, marginTop: 2 }} title={`${task.blockedByCount} tugas prasyarat belum selesai`}>
                        Terhambat
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{task.projectCode ?? "—"}</td>
                  <td><StatusBadge status={task.statusName} category={task.statusCategory} /></td>
                  <td><PriorityLabel priority={task.priority} /></td>
                  <td>
                    {task.assigneeName ? (
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 11.5 }}>
                        <Avatar name={task.assigneeName} color={task.assigneeColor} size={21} personId={task.assigneeId ?? undefined} /> {task.assigneeName.split(" ")[0]}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 11.5 }}>Belum ada</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <DueBadge dueDate={task.dueDate} done={task.done} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : view === "board" ? (
        <div className="board">
          {boardGroups.map((group) => {
            const projectStatusRows = statusSource.filter((row) => row.projectId === group.projectId);
            const positionIndex = projectStatusRows.findIndex((row) => row.id === group.statusId);
            const canLeft = Boolean(boardSingleProject) && positionIndex > 0;
            const canRight = Boolean(boardSingleProject) && positionIndex >= 0 && positionIndex < projectStatusRows.length - 1;
            return (
              <div
                key={group.name}
                className={`board-col ${overColumn === group.name ? "over" : ""}`}
                onDragOver={group.dropable ? (event) => { event.preventDefault(); setOverColumn(group.name); } : undefined}
                onDragLeave={group.dropable ? () => setOverColumn((value) => (value === group.name ? null : value)) : undefined}
                onDrop={group.dropable ? (event) => {
                  event.preventDefault();
                  setOverColumn(null);
                  const task = filtered.find((row) => row.id === dragging);
                  if (task) void move(task, group.name);
                  setDragging(null);
                } : undefined}
              >
                <div className="board-col-head">
                  {renaming === group.name ? (
                    <input
                      className="input board-col-input"
                      autoFocus
                      maxLength={30}
                      aria-label={`Nama tahap ${group.name}`}
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void commitRename(group);
                        if (event.key === "Escape") {
                          renameCancelled.current = true;
                          setRenaming(null);
                        }
                      }}
                      onBlur={() => void commitRename(group)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="board-col-title"
                      disabled={!group.statusId || saving}
                      onClick={() => group.statusId && startRename(group)}
                      title={group.statusId ? "Ubah nama tahap" : group.name}
                    >
                      {group.name}
                    </button>
                  )}
                  <span className="badge">{group.items.length}</span>
                  {group.statusId && (
                    <div className="board-menu-wrap">
                      <button
                        type="button"
                        className="icon-btn board-col-more"
                        aria-label={`Pengaturan tahap ${group.name}`}
                        aria-expanded={menuColumn === group.name}
                        onClick={() => setMenuColumn(menuColumn === group.name ? null : group.name)}
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {menuColumn === group.name && (
                        <div className="popover board-menu" role="menu">
                          <button type="button" role="menuitem" className="board-menu-item" disabled={saving} onClick={() => startRename(group)}>
                            Ubah nama
                          </button>
                          <label className="board-menu-field">
                            <span>Kategori</span>
                            <select
                              className="select"
                              value={group.category}
                              disabled={saving}
                              onChange={(event) => void changeCategory(group, event.target.value)}
                            >
                              {COL_CATEGORIES.map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </label>
                          {(canLeft || canRight) && (
                            <>
                              <button type="button" role="menuitem" className="board-menu-item" disabled={!canLeft || saving} onClick={() => void moveColumn(group, -1)}>
                                <ChevronLeft size={14} /> Pindah ke kiri
                              </button>
                              <button type="button" role="menuitem" className="board-menu-item" disabled={!canRight || saving} onClick={() => void moveColumn(group, 1)}>
                                <ChevronRight size={14} /> Pindah ke kanan
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            className="board-menu-item danger"
                            disabled={saving}
                            onClick={() => {
                              setMenuColumn(null);
                              setDeleteError("");
                              setDeleteTarget(group);
                            }}
                          >
                            <Trash2 size={14} /> Hapus tahap
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {group.items.map((task) => {
                  const card = cardFaces(task, people);
                  return (
                    <article
                      key={task.id}
                      className={`board-card ${dragging === task.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={() => setDragging(task.id)}
                      onDragEnd={() => setDragging(null)}
                      onClick={() => openTask(task.id)}
                    >
                      {task.labels.length > 0 && (
                        <div className="board-card-labels">
                          {task.labels.slice(0, 2).map((label) => (
                            <span key={label.id} className="task-label">
                              <span className="label-dot" style={{ background: label.color }} aria-hidden />
                              {label.name}
                            </span>
                          ))}
                          {task.labels.length > 2 && <span className="task-label">+{task.labels.length - 2}</span>}
                        </div>
                      )}
                      <div className="board-card-top">
                        <span className="badge" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5 }}>{task.projectCode ?? "—"}</span>
                        {task.blockedByCount > 0 && <span className="badge badge-danger" style={{ height: 18, fontSize: 9.5 }}>Terhambat</span>}
                        <PriorityDot priority={task.priority} label={false} />
                      </div>
                      <p style={{ margin: "6px 0 5px", fontSize: 12.5, fontWeight: 550, lineHeight: 1.4 }}>{task.title}</p>
                      <div className="board-card-meta">
                        <DueBadge dueDate={task.dueDate} done={task.done} compact />
                        {task.commentCount > 0 && (
                          <span className="meta-chip" title={`${task.commentCount} komentar`}><MessageSquare size={11} aria-hidden /> {task.commentCount}</span>
                        )}
                        {task.attachmentCount > 0 && (
                          <span className="meta-chip" title={`${task.attachmentCount} lampiran`}><Paperclip size={11} aria-hidden /> {task.attachmentCount}</span>
                        )}
                        {task.checklistTotal > 0 && (
                          <span className="meta-chip" title={`Checklist ${task.checklistDone}/${task.checklistTotal}`}>
                            <ListChecks size={11} aria-hidden /> {task.checklistDone}/{task.checklistTotal}
                          </span>
                        )}
                        <span className="board-card-people">
                          {card.faces.map((face) => (
                            <Avatar key={face.id} name={face.name} color={face.color} size={21} personId={face.id} />
                          ))}
                          {card.extra > 0 && <span className="meta-chip">+{card.extra}</span>}
                        </span>
                      </div>
                      <select
                        className="select"
                        aria-label={`Pindahkan ${task.title}`}
                        value={task.statusName ?? ""}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => { if (event.target.value) void move(task, event.target.value); }}
                        style={{ marginTop: 7, height: 26, fontSize: 10.5, padding: "0 5px" }}
                      >
                        {!task.statusName && <option value="">Tanpa status</option>}
                        {columns.map((status) => <option key={status.name} value={status.name}>{status.name}</option>)}
                      </select>
                    </article>
                  );
                })}
                {group.items.length === 0 && <p className="help" style={{ textAlign: "center", padding: "14px 0", margin: 0 }}>Kosong</p>}
                {group.dropable && (
                  composerColumn === group.name ? (
                    <div className="board-composer">
                      {group.projectIds.length > 1 && (
                        <select
                          className="select"
                          aria-label="Proyek tugas baru"
                          value={composerProject}
                          onChange={(event) => setComposerProject(event.target.value)}
                          style={{ height: 30, fontSize: 12 }}
                        >
                          {projects
                            .filter((project) => group.projectIds.includes(project.id))
                            .map((project) => (
                              <option key={project.id} value={project.id}>{project.code} · {project.name}</option>
                            ))}
                        </select>
                      )}
                      <textarea
                        ref={composerInput}
                        className="input board-composer-input"
                        rows={2}
                        aria-label={`Judul kartu baru di ${group.name}`}
                        placeholder="Judul tugas…"
                        value={composerTitle}
                        onChange={(event) => setComposerTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void submitCard(group);
                          }
                          if (event.key === "Escape") closeComposer();
                        }}
                        onBlur={() => {
                          if (!composerTitle.trim()) closeComposer();
                        }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => void submitCard(group)}>
                          {saving ? "Menyimpan…" : "Tambah kartu"}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={closeComposer}>Batal</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="board-add-card" disabled={saving} onClick={() => openComposer(group)}>
                      <Plus size={14} aria-hidden /> Tambahkan kartu
                    </button>
                  )
                )}
              </div>
            );
          })}
          {boardSingleProject &&
            (addingList ? (
              <div className="board-col board-add-list-panel">
                <input
                  className="input board-col-input"
                  autoFocus
                  maxLength={30}
                  aria-label="Nama tahap baru"
                  placeholder="Nama tahap…"
                  value={newListName}
                  onChange={(event) => setNewListName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void submitList();
                    if (event.key === "Escape") {
                      setAddingList(false);
                      setNewListName("");
                    }
                  }}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => void submitList()}>
                    {saving ? "Menyimpan…" : "Tambah tahap"}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAddingList(false); setNewListName(""); }}>Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" className="board-add-list" disabled={saving} onClick={() => setAddingList(true)}>
                <Plus size={15} aria-hidden /> Tambahkan daftar
              </button>
            ))}
        </div>
      ) : (
        <div className="panel">
          <div className="calendar-head">
            <button type="button" className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Bulan sebelumnya"><ChevronLeft size={17} /></button>
            <strong style={{ fontSize: 13.5, textTransform: "capitalize" }}>{monthLabel}</strong>
            <button type="button" className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Bulan berikutnya"><ChevronRight size={17} /></button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMonth(new Date())} style={{ marginLeft: 4 }}>Hari ini</button>
            <span className="help calendar-head-count">{filtered.filter((task) => task.dueDate).length} tugas bertenggat</span>
          </div>
          <div className="calendar-scroll">
            <div className="calendar-grid">
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
                    <button
                      key={task.id}
                      type="button"
                      className={`calendar-event ${task.done ? "done" : task.overdue ? "overdue" : ""}`}
                      style={{ width: "100%", textAlign: "left", border: 0, cursor: "pointer" }}
                      onClick={() => openTask(task.id)}
                      title={`${task.title} · ${formatDate(task.dueDate)}`}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>+{dayTasks.length - 3} lagi</span>}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus tahap papan?"
        description={
          deleteTarget
            ? `Tahap "${deleteTarget.name}" akan dihilangkan dari proyek. Pindahkan ${deleteTarget.items.length} tugas di dalamnya terlebih dahulu.`
            : ""
        }
        confirmLabel="Hapus tahap"
        busyLabel="Menghapus…"
        busy={saving}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
      />
    </>
  );
}
