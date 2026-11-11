"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClipboardEvent } from "react";
import Link from "next/link";
import {
  Archive,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Loader2,
  Paperclip,
  Search,
  Send,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Avatar, DueBadge, MentionText, StatusBadge } from "./ui";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "./Toaster";
import {
  addChecklistItemAction,
  addCommentWithFilesAction,
  addTaskDependencyAction,
  archiveTaskAction,
  createTaskAction,
  createTaskLabelAction,
  deleteTaskAttachmentAction,
  removeTaskDependencyAction,
  setTaskLabelsAction,
  toggleChecklistItemAction,
  updateTaskAction,
  uploadTaskAttachmentAction,
} from "@/app/(app)/actions";
import { formatBytes, formatDateTime, relativeTime } from "@/lib/utils";
import { priorityMeta } from "@/lib/markers";
import { notifySync } from "@/lib/client-sync";

type DetailTask = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  projectId: string | null;
  projectCode: string | null;
  projectName: string | null;
  statusId: string | null;
  statusName: string | null;
  statusCategory: string | null;
  priority: string;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
  reporterName: string | null;
  dueDate: string | null;
  startDate: string | null;
  estimateHours: number | null;
  done: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  labels: Array<{ id: string; name: string; color: string }>;
  checklistDone: number;
  checklistTotal: number;
};

type Detail = {
  task: DetailTask;
  comments: Array<{
    id: string;
    authorId: string;
    body: string;
    authorName: string;
    authorColor: string;
    createdAt: string;
    parentId: string | null;
    attachments: Array<{ id: string; name: string; kind: string }>;
  }>;
  checklists: Array<{ id: string; title: string; items: Array<{ id: string; text: string; done: boolean }> }>;
  attachments: Array<{ id: string; documentId: string | null; name: string; kind: string; size: number; createdAt: string }>;
  timeLogs: Array<{ id: string; minutes: number; note: string | null; loggedOn: string; userName: string }>;
  collaborators: Array<{ id: string; name: string; avatarColor: string }>;
  subtasks: Array<{ id: string; number: number; title: string; statusName: string | null; done: boolean }>;
  dependencies: Array<{ id: string; number: number; title: string; projectCode: string | null; statusName: string | null; statusCategory: string | null; done: boolean }>;
  dependents: Array<{ id: string; number: number; title: string; projectCode: string | null; statusName: string | null; statusCategory: string | null; done: boolean }>;
  dependencyCandidates: Array<{ id: string; number: number; title: string; projectCode: string | null; statusName: string | null; statusCategory: string | null; done: boolean }>;
  activity: Array<{ id: string; actorName: string; verb: string; meta: string | null; createdAt: string }>;
  projectStatuses: Array<{ id: string; name: string; position: number; category: string }>;
  members: Array<{ id: string; name: string; avatarColor: string }>;
  availableLabels: Array<{ id: string; name: string; color: string }>;
  canEdit: boolean;
  currentUserId: string;
};

const TABS = [
  { key: "detail", label: "Detail" },
  { key: "discussion", label: "Diskusi" },
  { key: "file", label: "File" },
  { key: "activity", label: "Aktivitas" },
] as const;

export function TaskDrawer({ taskId, onClose, onChanged }: { taskId: string; onClose: () => void; onChanged?: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("detail");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [checkItem, setCheckItem] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [dependencyTarget, setDependencyTarget] = useState("");
  const [commentFiles, setCommentFiles] = useState<Array<{ id: string; file: File; url: string }>>([]);
  const [labelQuery, setLabelQuery] = useState("");
  const [labelOpen, setLabelOpen] = useState(false);
  const [labelBusy, setLabelBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [deleteAttachment, setDeleteAttachment] = useState<{ id: string; name: string } | null>(null);
  const [deletingAttachment, setDeletingAttachment] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestClose = useCallback(() => {
    const dirtyDescription = Boolean(detail && description !== (detail.task.description ?? ""));
    const dirtyComment = comment.trim().length > 0 || commentFiles.length > 0;
    if (dirtyDescription || dirtyComment) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  }, [comment, commentFiles.length, description, detail, onClose]);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Tidak dapat memuat tugas.");
      const data = (await response.json()) as Detail;
      setDetail(data);
      setDescription(data.task.description ?? "");
      setError("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setError("Tugas tidak dapat dimuat. Tutup lalu buka kembali.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (archiveOpen || discardOpen) return;
    const node = dialogRef.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
    const timer = window.setTimeout(() => {
      const closeButton = node.querySelector<HTMLButtonElement>('button[aria-label="Tutup detail tugas"]');
      (closeButton ?? focusables()[0])?.focus();
    }, 30);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [archiveOpen, discardOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (archiveOpen || discardOpen) return;
      if (labelOpen) {
        setLabelOpen(false);
        return;
      }
      requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [archiveOpen, discardOpen, labelOpen, requestClose]);

  async function patch(patchData: Record<string, string | null>) {
    if (!detail) return;
    const draftDescription = description;
    const originalDescription = detail.task.description ?? "";
    setSaving(true);
    setSaved(false);
    notifySync("syncing");
    const result = await updateTaskAction(detail.task.id, patchData);
    setSaving(false);
    if (!result.ok) {
      notifySync("error");
      setError(result.error ?? "Gagal menyimpan.");
      return;
    }
    await load();
    if (draftDescription !== originalDescription) setDescription(draftDescription);
    setSaved(true);
    notifySync("saved");
    onChanged?.();
  }

  async function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setSaving(true);
    notifySync("syncing");
    const result = await fn();
    setSaving(false);
    if (!result.ok) {
      notifySync("error");
      setError(result.error ?? "Tindakan gagal.");
      return false;
    }
    await load();
    notifySync("saved");
    onChanged?.();
    return true;
  }

  /** Tempel gambar ke komentar: ditahan sebagai pratinjau sampai komentar dikirim. */
  function handlePaste(event: ClipboardEvent<HTMLElement>) {
    if (!detail || !detail.canEdit) return;
    const items = Array.from(event.clipboardData?.items ?? []).filter(
      (entry) => entry.kind === "file" && entry.type.startsWith("image/"),
    );
    const files = items.map((entry) => entry.getAsFile()).filter((file): file is File => Boolean(file));
    if (files.length === 0) return;
    event.preventDefault();
    addCommentFiles(files);
  }

  function addCommentFiles(files: File[]) {
    setCommentFiles((current) => {
      const room = Math.max(0, 4 - current.length);
      const next = [...current];
      for (const file of files.slice(0, room)) {
        const extension = (file.type.split("/")[1] ?? "png").replace("jpeg", "jpg");
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        const renamed = new File([file], `screenshot-${stamp}.${extension}`, { type: file.type });
        next.push({ id: `${stamp}-${Math.random().toString(36).slice(2, 7)}`, file: renamed, url: URL.createObjectURL(renamed) });
      }
      return next;
    });
  }

  function removeCommentFile(id: string) {
    setCommentFiles((current) => {
      const target = current.find((entry) => entry.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((entry) => entry.id !== id);
    });
  }

  async function submitComment() {
    if (!detail) return;
    if (!comment.trim() && commentFiles.length === 0) return;
    const data = new FormData();
    data.set("taskId", detail.task.id);
    data.set("body", comment);
    for (const entry of commentFiles) data.append("files", entry.file);
    const ok = await act(async () => await addCommentWithFilesAction(data));
    if (!ok) return;
    for (const entry of commentFiles) URL.revokeObjectURL(entry.url);
    setCommentFiles([]);
    setComment("");
    toast("Komentar dikirim");
  }

  /** Tambah label dari input manual: pakai label yang ada atau buat baru. */
  async function addLabelByName(raw: string) {
    if (!detail) return;
    const clean = raw.trim();
    if (!clean || labelBusy) return;
    setLabelBusy(true);
    setError("");
    const existing = detail.availableLabels.find((label) => label.name.toLowerCase() === clean.toLowerCase());
    let labelId = existing?.id ?? null;
    if (!labelId) {
      const created = await createTaskLabelAction(clean);
      if (!created.ok) {
        setLabelBusy(false);
        setError(created.error ?? "Label gagal dibuat.");
        return;
      }
      labelId = created.id;
    }
    const currentIds = detail.task.labels.map((label) => label.id);
    setLabelBusy(false);
    setLabelQuery("");
    setLabelOpen(false);
    if (currentIds.includes(labelId)) return;
    const ok = await act(async () => await setTaskLabelsAction(detail.task.id, [...currentIds, labelId as string]));
    if (ok) toast("Label diperbarui");
  }

  const assignedLabelIds = new Set((detail?.task.labels ?? []).map((label) => label.id));
  const labelSuggestions = (detail?.availableLabels ?? [])
    .filter((label) => !assignedLabelIds.has(label.id))
    .filter((label) => label.name.toLowerCase().includes(labelQuery.trim().toLowerCase()))
    .slice(0, 6);
  return (
    <div
      className="sheet-backdrop task-drawer-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <aside ref={dialogRef} className="sheet task-drawer" role="dialog" aria-modal="true" aria-label={detail ? detail.task.title : "Detail tugas"} aria-hidden={archiveOpen || discardOpen ? true : undefined}>
        <div className="sheet-head">
          <div style={{ minWidth: 0, flex: 1 }}>
            {detail ? (
              <>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                  {detail.task.projectCode ?? "TANPA PROYEK"} · #{detail.task.number}
                </p>
                <h2 style={{ margin: "2px 0 0", fontSize: 17, lineHeight: 1.35, letterSpacing: "-0.02em" }}>{detail.task.title}</h2>
                <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
                  <StatusBadge status={detail.task.statusName} category={detail.task.statusCategory} />
                  <span className={`badge ${priorityMeta(detail.task.priority).className}`}>{priorityMeta(detail.task.priority).label}</span>
                  <DueBadge dueDate={detail.task.dueDate} done={detail.task.done} compact />
                  {(detail.task.statusCategory === "blocked" || detail.dependencies.some((dependency) => !dependency.done)) && (
                    <span className="badge badge-danger" title={detail.dependencies.some((dependency) => !dependency.done) ? "Menunggu tugas prasyarat" : undefined}>Terhambat</span>
                  )}
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>
                  Dibuat oleh {detail.task.reporterName ?? "Anggota"} · Diperbarui {relativeTime(detail.task.updatedAt)}
                </p>
              </>
            ) : (
              <div className="skeleton" style={{ height: 40, width: "70%" }} />
            )}
          </div>
          <button type="button" className="icon-btn" onClick={requestClose} aria-label="Tutup detail tugas">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="task-error" style={{ padding: "8px 16px", background: "var(--danger-soft)", color: "var(--danger)", fontSize: 12.5 }} role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="sheet-body" style={{ display: "grid", gap: 12 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton" style={{ height: index === 0 ? 84 : 34 }} />
            ))}
          </div>
        ) : detail ? (
          <>
            <div className="task-properties" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "grid", gap: 9 }}>
              <button
                type="button"
                className="task-props-toggle"
                aria-expanded={propsOpen}
                aria-controls="task-properties-grid"
                onClick={() => setPropsOpen((value) => !value)}
              >
                <span>Status, prioritas, PIC, tenggat</span>
                {propsOpen ? <ChevronUp size={15} aria-hidden /> : <ChevronDown size={15} aria-hidden />}
              </button>
              <div id="task-properties-grid" className={`task-props-grid ${propsOpen ? "" : "is-collapsed"}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 8 }}>
                <label className="field">
                  <span className="label" style={{ fontSize: 11 }}>Status</span>
                  <select
                    className="select"
                    value={detail.task.statusId ?? ""}
                    disabled={!detail.canEdit || saving}
                    onChange={async (event) => void await patch({ statusId: event.target.value })}
                  >
                    {detail.projectStatuses.map((status) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="label" style={{ fontSize: 11 }}>Prioritas</span>
                  <select
                    className="select"
                    value={detail.task.priority}
                    disabled={!detail.canEdit || saving}
                    onChange={async (event) => void await patch({ priority: event.target.value })}
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <div className="field">
                  <span className="label" style={{ fontSize: 11 }}>PIC</span>
                  <PersonSelect
                    value={detail.task.assigneeId}
                    members={detail.members}
                    disabled={!detail.canEdit || saving}
                    onChange={async (id) => void await patch({ assigneeId: id })}
                  />
                </div>
                <label className="field">
                  <span className="label" style={{ fontSize: 11 }}>Tenggat</span>
                  <input
                    className="input"
                    type="date"
                    value={detail.task.dueDate ?? ""}
                    disabled={!detail.canEdit || saving}
                    onChange={async (event) => void await patch({ dueDate: event.target.value || null })}
                  />
                </label>
                <div className="field" style={{ minWidth: 0, gridColumn: "1 / -1" }}>
                  <span className="label" style={{ fontSize: 11 }}>Label</span>
                  <div style={{ position: "relative" }}>
                    <div className="label-picker">
                      {detail.task.labels.map((label) => (
                        <span key={label.id} className="badge label-chip" style={{ background: `${label.color}18`, color: label.color }}>
                          {label.name}
                          {detail.canEdit && (
                            <button
                              type="button"
                              className="label-chip-x"
                              aria-label={`Hapus label ${label.name}`}
                              title="Hapus label"
                              disabled={saving}
                              onClick={async () => {
                                const ok = await act(async () =>
                                  await setTaskLabelsAction(
                                    detail.task.id,
                                    detail.task.labels.filter((row) => row.id !== label.id).map((row) => row.id),
                                  ),
                                );
                                if (ok) toast("Label diperbarui");
                              }}
                            >
                              <X size={11} aria-hidden />
                            </button>
                          )}
                        </span>
                      ))}
                      {detail.canEdit && (
                        <input
                          className="label-input"
                          value={labelQuery}
                          disabled={saving || labelBusy}
                          placeholder={detail.task.labels.length === 0 ? "Cari atau buat label…" : "Tambah label…"}
                          aria-label="Cari atau buat label"
                          role="combobox"
                          aria-autocomplete="list"
                          aria-expanded={labelOpen}
                          aria-controls="task-label-suggest"
                          onFocus={() => setLabelOpen(true)}
                          onBlur={() => window.setTimeout(() => setLabelOpen(false), 120)}
                          onChange={(event) => {
                            setLabelQuery(event.target.value);
                            setLabelOpen(true);
                          }}
                          onKeyDown={async (event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void await addLabelByName(labelQuery || labelSuggestions[0]?.name || "");
                            }
                            if (event.key === "Escape") {
                              event.stopPropagation();
                              setLabelOpen(false);
                            }
                          }}
                        />
                      )}
                    </div>
                    {detail.canEdit && labelOpen && labelQuery.trim().length > 0 && (
                      <div className="label-suggest" id="task-label-suggest" role="listbox" aria-label="Label yang ada">
                        {labelSuggestions.length === 0 ? (
                          <p className="help" style={{ margin: 0, padding: "6px 8px" }}>
                            Tekan Enter untuk membuat label “{labelQuery.trim()}”.
                          </p>
                        ) : (
                          labelSuggestions.map((row) => (
                            <button
                              key={row.id}
                              type="button"
                              role="option"
                              aria-selected={false}
                              className="label-suggest-item"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={async () => void await addLabelByName(row.name)}
                            >
                              <span className="label-dot" style={{ background: row.color }} aria-hidden />
                              {row.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="task-main">
            <div className="tab-row" style={{ padding: "0 10px" }} role="tablist" aria-label="Bagian tugas">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  id={`task-tab-${item.key}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  aria-controls="task-panel"
                  tabIndex={tab === item.key ? 0 : -1}
                  className={`tab ${tab === item.key ? "active" : ""}`}
                  onClick={() => setTab(item.key)}
                  onKeyDown={(event) => {
                    const keys = TABS.map((row) => row.key);
                    const index = keys.indexOf(item.key);
                    let next: (typeof TABS)[number]["key"] | null = null;
                    if (event.key === "ArrowRight") next = keys[(index + 1) % keys.length];
                    if (event.key === "ArrowLeft") next = keys[(index - 1 + keys.length) % keys.length];
                    if (event.key === "Home") next = keys[0];
                    if (event.key === "End") next = keys[keys.length - 1];
                    if (!next) return;
                    event.preventDefault();
                    setTab(next);
                    document.getElementById(`task-tab-${next}`)?.focus();
                  }}
                >
                  {item.label}
                  {item.key === "discussion" && detail.comments.length > 0 ? ` (${detail.comments.length})` : ""}
                  {item.key === "file" && detail.attachments.length > 0 ? ` (${detail.attachments.length})` : ""}
                </button>
              ))}
            </div>

            <div
              className="sheet-body"
              role="tabpanel"
              id="task-panel"
              aria-labelledby={`task-tab-${tab}`}
            >
              {tab === "detail" && (
                <div style={{ display: "grid", gap: 20 }}>
                  <section>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>Deskripsi</h3>
                      {detail.canEdit && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={saving || description === (detail.task.description ?? "")}
                          onClick={async () => void await patch({ description })}
                        >
                          Simpan
                        </button>
                      )}
                    </div>
                    <textarea
                      className="textarea"
                      style={{ minHeight: 90, fontSize: 13 }}
                      value={description}
                      placeholder="Tambahkan konteks, tautan, atau kriteria selesai."
                      aria-label="Deskripsi tugas"
                      disabled={!detail.canEdit}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </section>

                  <section>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>
                        Checklist
                      </h3>
                      <span className="badge">{detail.task.checklistDone}/{detail.task.checklistTotal}</span>
                    </div>
                    {detail.checklists.map((list) => (
                      <div key={list.id} style={{ display: "grid", gap: 4 }}>
                        {list.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            role="checkbox"
                            aria-checked={item.done}
                            disabled={!detail.canEdit}
                            onClick={async () => void await act(async () => await toggleChecklistItemAction(item.id, !item.done))}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "flex-start",
                              padding: "4px 2px",
                              border: 0,
                              background: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: 13,
                              color: item.done ? "var(--text-muted)" : "var(--text)",
                              textDecoration: item.done ? "line-through" : "none",
                            }}
                          >
                            {item.done ? <CheckSquare size={16} style={{ color: "var(--success)", flex: "none", marginTop: 1 }} /> : <Square size={16} style={{ color: "var(--text-muted)", flex: "none", marginTop: 1 }} />}
                            {item.text}
                          </button>
                        ))}
                      </div>
                    ))}
                    {detail.canEdit && (
                      <form
                        style={{ display: "flex", gap: 6, marginTop: 8 }}
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!checkItem.trim()) return;
                          void act(async () => await addChecklistItemAction(detail.task.id, checkItem)).then((ok) => ok && setCheckItem(""));
                        }}
                      >
                        <input className="input" placeholder="Tambah item checklist…" aria-label="Item checklist baru" value={checkItem} onChange={(event) => setCheckItem(event.target.value)} />
                        <button className="btn btn-outline btn-sm" type="submit" disabled={saving}>Tambah</button>
                      </form>
                    )}
                  </section>

                  <section>
                    <h3 style={{ margin: "0 0 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>Subtugas</h3>
                    {detail.subtasks.length === 0 ? (
                      <p className="help" style={{ margin: 0 }}>Belum ada subtugas.</p>
                    ) : (
                      <div style={{ display: "grid", gap: 4 }}>
                        {detail.subtasks.map((subtask) => (
                          <Link key={subtask.id} href={`/app/tasks?task=${subtask.id}`} className="badge" style={{ height: 28, justifyContent: "space-between", background: "var(--surface)" }}>
                            <span>{subtask.title}</span>
                            <span style={{ color: subtask.done ? "var(--success)" : "var(--text-muted)" }}>{subtask.statusName}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {detail.canEdit && detail.task.projectId && (
                      <form
                        style={{ display: "flex", gap: 6, marginTop: 8 }}
                        onSubmit={async (event) => {
                          event.preventDefault();
                          if (!subtaskTitle.trim()) return;
                          const data = new FormData();
                          data.set("title", subtaskTitle);
                          data.set("projectId", detail.task.projectId ?? "");
                          data.set("parentTaskId", detail.task.id);
                          data.set("priority", "medium");
                          setSaving(true);
                          const result = await createTaskAction(data);
                          setSaving(false);
                          if (result.ok) {
                            setSubtaskTitle("");
                            await load();
                            onChanged?.();
                          } else setError(result.error ?? "Gagal membuat subtugas.");
                        }}
                      >
                        <input className="input" placeholder="Tambah subtugas…" aria-label="Judul subtugas baru" value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} />
                        <button className="btn btn-outline btn-sm" type="submit" disabled={saving}>Tambah</button>
                      </form>
                    )}
                  </section>

                  <section>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>Dependensi</h3>
                      <span className="badge">{detail.dependencies.length}</span>
                    </div>
                    <p className="help" style={{ margin: "0 0 8px" }}>Tugas ini menunggu tugas prasyarat selesai sebelum dapat dianggap siap.</p>
                    {detail.dependencies.length === 0 ? (
                      <p className="help" style={{ margin: 0 }}>Belum ada dependensi.</p>
                    ) : (
                      <div style={{ display: "grid", gap: 4 }}>
                        {detail.dependencies.map((dependency) => (
                          <div key={dependency.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)" }}>
                            <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)", flex: "none" }}>{dependency.projectCode ?? "—"}-{dependency.number}</span>
                            <span style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ display: "block", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dependency.title}</span>
                              <StatusBadge status={dependency.statusName} category={dependency.statusCategory} />
                            </span>
                            {dependency.done ? <span className="badge badge-success">Selesai</span> : <span className="badge badge-warning">Menunggu</span>}
                            {detail.canEdit && (
                              <button
                                type="button"
                                className="icon-btn"
                                aria-label={`Hapus dependensi ${dependency.title}`}
                                title="Hapus dependensi"
                                disabled={saving}
                                onClick={() => void act(async () => await removeTaskDependencyAction(detail.task.id, dependency.id)).then((ok) => ok && toast("Dependensi dihapus", "info"))}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {detail.dependents.length > 0 && (
                      <p className="help" style={{ margin: "8px 0 0" }}>
                        Menjadi prasyarat untuk {detail.dependents.map((dependent) => dependent.title).slice(0, 3).join(", ")}{detail.dependents.length > 3 ? `, +${detail.dependents.length - 3}` : ""}.
                      </p>
                    )}
                    {detail.canEdit && detail.dependencyCandidates.length > 0 && (
                      <form
                        style={{ display: "flex", gap: 6, marginTop: 8 }}
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!dependencyTarget) return;
                          void act(async () => await addTaskDependencyAction(detail.task.id, dependencyTarget)).then((ok) => {
                            if (ok) {
                              setDependencyTarget("");
                              toast("Dependensi ditambahkan");
                            }
                          });
                        }}
                      >
                        <select className="select" aria-label="Pilih tugas prasyarat" value={dependencyTarget} onChange={(event) => setDependencyTarget(event.target.value)}>
                          <option value="">Pilih tugas prasyarat…</option>
                          {detail.dependencyCandidates.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>{candidate.projectCode ?? "—"}-{candidate.number} · {candidate.title}</option>
                          ))}
                        </select>
                        <button className="btn btn-outline btn-sm" type="submit" disabled={saving || !dependencyTarget}>Tambah</button>
                      </form>
                    )}
                  </section>

                </div>
              )}

              {tab === "discussion" && (
                <div style={{ display: "grid", gap: 14 }}>
                  {detail.comments.length === 0 ? (
                    <p className="help" style={{ margin: 0 }}>Belum ada komentar. Mulai diskusi dengan konteks yang jelas.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 14 }}>
                      {detail.comments.map((item) => (
                        <div key={item.id} style={{ display: "flex", gap: 9 }}>
                          <Avatar name={item.authorName} color={item.authorColor} size={28} personId={item.authorId} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 12 }}>
                              <strong>{item.authorName}</strong>{" "}
                              <span style={{ color: "var(--text-muted)" }}>{formatDateTime(item.createdAt)}</span>
                            </p>
                            {item.body && (
                              <p style={{ margin: "3px 0 0", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}><MentionText body={item.body} /></p>
                            )}
                            {item.attachments?.length > 0 && (
                              <div className="comment-images">
                                {item.attachments.map((file) => {
                                  const href = `/api/documents/${file.id}/file`;
                                  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(file.kind);
                                  return isImage ? (
                                    <a key={file.id} href={href} target="_blank" rel="noreferrer" title={file.name} className="comment-image-link">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={href} alt={file.name} loading="lazy" />
                                    </a>
                                  ) : (
                                    <a key={file.id} href={href} target="_blank" rel="noreferrer" className="chat-attach-file">
                                      <FileText size={13} />
                                      <span>{file.name}</span>
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="panel" style={{ padding: 10, background: "var(--surface)" }}>
                    <textarea
                      className="textarea"
                      placeholder="Tulis komentar…"
                      aria-label="Tulis komentar"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      onPaste={handlePaste}
                      style={{ minHeight: 70, background: "var(--bg)" }}
                    />
                    {commentFiles.length > 0 && (
                      <div className="comment-paste">
                        {commentFiles.map((entry) => (
                          <div key={entry.id} className="comment-pending">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={entry.url} alt={`Pratinjau ${entry.file.name}`} />
                            <button
                              type="button"
                              className="icon-btn"
                              aria-label="Hapus gambar"
                              title="Hapus gambar"
                              onClick={() => removeCommentFile(entry.id)}
                              style={{ width: 22, height: 22, position: "absolute", top: -6, right: -6, background: "var(--bg)", border: "1px solid var(--border)" }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <span className="help" style={{ marginLeft: 4 }}>
                          {commentFiles.length}/4 gambar siap dikirim
                        </span>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={saving || (!comment.trim() && commentFiles.length === 0)}
                        onClick={async () => void await submitComment()}
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Kirim
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={saving}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/png,image/jpeg,image/gif,image/webp";
                          input.multiple = true;
                          input.onchange = () => {
                            if (input.files) addCommentFiles(Array.from(input.files));
                          };
                          input.click();
                        }}
                      >
                        <Paperclip size={14} /> Gambar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tab === "file" && (
                <div style={{ display: "grid", gap: 14 }}>
                  <section>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>File</h3>
                      <span className="badge">{detail.attachments.length}</span>
                    </div>
                    {detail.attachments.length === 0 ? (
                      <p className="help" style={{ margin: 0 }}>Belum ada file. Unggah dokumen, gambar, atau arsip untuk tugas ini.</p>
                    ) : (
                      <div className="task-attachment-list">
                        {detail.attachments.map((file) => {
                          const href = file.documentId ? `/api/documents/${file.documentId}/file` : null;
                          const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(file.kind);
                          return (
                            <div key={file.id} className="task-attachment-row">
                              {isImage && href ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img className="attach-thumb" src={href} alt={`Lampiran ${file.name}`} />
                              ) : (
                                <span className="task-attachment-icon"><FileText size={15} aria-hidden /></span>
                              )}
                              <span style={{ minWidth: 0, flex: 1 }}>
                                {href ? (
                                  <a href={href} target="_blank" rel="noreferrer" className="task-attachment-name">{file.name}</a>
                                ) : (
                                  <span className="task-attachment-name">{file.name}</span>
                                )}
                                <span className="help" style={{ display: "block", margin: 0 }}>{file.kind.toUpperCase()} · {formatBytes(file.size)}</span>
                              </span>
                              {detail.canEdit && (
                                <button
                                  type="button"
                                  className="icon-btn task-attachment-delete"
                                  aria-label={`Hapus ${file.name}`}
                                  title="Hapus file"
                                  disabled={deletingAttachment}
                                  onClick={() => setDeleteAttachment({ id: file.id, name: file.name })}
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                  {detail.canEdit && (
                    <form
                      style={{ display: "grid", gap: 6 }}
                      onSubmit={async (event) => {
                        event.preventDefault();
                        if (!pendingFile) return;
                        const formData = new FormData();
                        formData.set("taskId", detail.task.id);
                        formData.set("file", pendingFile);
                        const ok = await act(async () => await uploadTaskAttachmentAction(formData));
                        if (ok) {
                          setPendingFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                          toast("File diunggah");
                        }
                      }}
                    >
                      <div className="task-file-row">
                        <input
                          ref={fileInputRef}
                          id="task-attachment-file"
                          type="file"
                          name="file"
                          required
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.txt,.csv,.md"
                          className="sr-only"
                          aria-label="Unggah file tugas"
                          onChange={(event) => setPendingFile(event.target.files?.[0] ?? null)}
                        />
                        <label htmlFor="task-attachment-file" className="btn btn-outline btn-sm task-file-pick">
                          <Upload size={14} /> Pilih file
                        </label>
                        <span className="task-file-name">{pendingFile?.name ?? "Belum ada file dipilih"}</span>
                        <button className="btn btn-primary btn-sm" type="submit" disabled={saving || !pendingFile}>
                          <Upload size={14} /> Unggah
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {tab === "activity" && (
                <div style={{ display: "grid", gap: 12 }}>
                  {detail.activity.length === 0 ? (
                    <p className="help" style={{ margin: 0 }}>Belum ada aktivitas yang tercatat.</p>
                  ) : (
                    detail.activity.map((row) => (
                      <div key={row.id} style={{ borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
                        <p style={{ margin: 0, fontSize: 12.5 }}>
                          <strong>{row.actorName}</strong> {row.verb} {row.meta ? <span style={{ color: "var(--text-muted)" }}>{row.meta}</span> : null}
                        </p>
                        <p style={{ margin: "1px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{relativeTime(row.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            </div>

            <div className="sheet-foot">
              {detail.task.projectId && (
                <Link href={`/app/projects/${detail.task.projectId}/overview`} className="btn btn-outline btn-sm">
                  <ExternalLink size={14} /> Proyek
                </Link>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {saving && <span className="help" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Loader2 size={13} className="animate-spin" /> menyimpan…</span>}
                {saved && !saving && <span className="help" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Check size={13} /> Tersimpan</span>}
                {detail.canEdit && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--danger)" }}
                    onClick={() => {
                      setError("");
                      setArchiveOpen(true);
                    }}
                  >
                    <Archive size={14} /> Arsipkan
                  </button>
                )}
                <button type="button" className="btn btn-primary btn-sm" onClick={requestClose}>
                  <X size={14} /> Tutup
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="sheet-body">
            <p className="error-text">{error || "Tugas tidak ditemukan."}</p>
          </div>
        )}
      </aside>

      <ConfirmDialog
        open={discardOpen}
        title="Tutup tanpa menyimpan?"
        description="Deskripsi atau komentar yang belum disimpan akan hilang."
        confirmLabel="Buang perubahan"
        onConfirm={onClose}
        onClose={() => setDiscardOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleteAttachment)}
        title="Hapus file?"
        description={deleteAttachment ? `“${deleteAttachment.name}” akan dihapus dari tugas ini. Tindakan ini tidak dapat dibatalkan.` : ""}
        confirmLabel="Hapus file"
        busyLabel="Menghapus…"
        busy={deletingAttachment}
        error={deleteAttachment ? error : undefined}
        onClose={() => {
          setDeleteAttachment(null);
          setError("");
        }}
        onConfirm={async () => {
          if (!deleteAttachment) return;
          setDeletingAttachment(true);
          setError("");
          notifySync("syncing");
          const result = await deleteTaskAttachmentAction(deleteAttachment.id);
          setDeletingAttachment(false);
          if (!result.ok) {
            notifySync("error");
            setError(result.error ?? "Gagal menghapus file.");
            return;
          }
          setDeleteAttachment(null);
          notifySync("saved");
          toast("File dihapus", "info");
          await load();
          onChanged?.();
        }}
      />

      <ConfirmDialog
        open={archiveOpen}
        title="Arsipkan tugas?"
        description="Tugas akan hilang dari daftar aktif. Riwayat, komentar, dan lampirannya tetap tersimpan."
        confirmLabel="Arsipkan tugas"
        busyLabel="Mengarsipkan…"
        busy={archiving}
        error={archiveOpen ? error : undefined}
        onClose={() => setArchiveOpen(false)}
        onConfirm={async () => {
          if (!detail) return;
          setArchiving(true);
          setError("");
          notifySync("syncing");
          const result = await archiveTaskAction(detail.task.id);
          setArchiving(false);
          notifySync(result.ok ? "saved" : "error");
          if (result.ok) {
            setArchiveOpen(false);
            toast("Tugas diarsipkan", "info");
            onChanged?.();
            onClose();
          } else setError(result.error ?? "Gagal mengarsipkan.");
        }}
      />
    </div>
  );
}

type PickerPerson = { id: string; name: string; avatarColor: string };

/** Pilih satu orang lewat pencarian nama (gaya yang sama dengan pemilih peserta). */
function PersonSelect({
  value,
  members,
  disabled,
  onChange,
}: {
  value: string | null;
  members: PickerPerson[];
  disabled?: boolean;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = members.find((person) => person.id === value) ?? null;
  const filtered = members.filter((person) => person.name.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-person-select]")) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="person-select" data-person-select>
      <button
        type="button"
        className="select person-select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={current ? `PIC ${current.name}` : "Pilih PIC"}
        disabled={disabled}
        onClick={() => {
          setOpen((state) => !state);
          setQuery("");
        }}
      >
        {current ? (
          <>
            <Avatar name={current.name} color={current.avatarColor} size={18} personId={current.id} />
            <span className="person-select-name">{current.name}</span>
          </>
        ) : (
          <span className="person-select-name muted">Belum ditetapkan</span>
        )}
        <ChevronDown size={14} aria-hidden style={{ marginLeft: "auto", flex: "none", color: "var(--text-muted)" }} />
      </button>
      {open && (
        <div className="popover person-select-menu">
          <div className="person-select-search">
            <Search size={13} aria-hidden />
            <input
              autoFocus
              className="input"
              placeholder="Cari nama anggota…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Cari PIC"
            />
          </div>
          <div className="participant-list" role="listbox" aria-label="Pilih PIC">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className="participant-row"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>Belum ditetapkan</span>
              {!value && <Check size={14} style={{ color: "var(--accent)" }} />}
            </button>
            {filtered.map((person) => (
              <button
                key={person.id}
                type="button"
                role="option"
                aria-selected={value === person.id}
                className="participant-row"
                onClick={() => {
                  onChange(person.id);
                  setOpen(false);
                }}
              >
                <Avatar name={person.name} color={person.avatarColor} size={22} personId={person.id} />
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</span>
                {value === person.id && <Check size={14} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
            {filtered.length === 0 && <p className="help" style={{ margin: 0, padding: 8 }}>Tidak ada anggota yang cocok.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
