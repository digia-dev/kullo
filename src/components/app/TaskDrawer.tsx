"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Check,
  CheckSquare,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Square,
  X,
} from "lucide-react";
import { Avatar } from "./ui";
import {
  addAttachmentAction,
  addChecklistItemAction,
  addCommentAction,
  addTimeLogAction,
  archiveTaskAction,
  createTaskAction,
  toggleChecklistItemAction,
  updateTaskAction,
} from "@/app/(app)/actions";
import { formatBytes, formatDateTime, relativeTime } from "@/lib/utils";

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
  priority: string;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
  reporterName: string | null;
  dueDate: string | null;
  startDate: string | null;
  estimateHours: number | null;
  done: boolean;
  updatedAt: string;
  labels: Array<{ id: string; name: string; color: string }>;
  checklistDone: number;
  checklistTotal: number;
};

type Detail = {
  task: DetailTask;
  comments: Array<{ id: string; body: string; authorName: string; authorColor: string; createdAt: string; parentId: string | null }>;
  checklists: Array<{ id: string; title: string; items: Array<{ id: string; text: string; done: boolean }> }>;
  attachments: Array<{ id: string; name: string; kind: string; size: number; createdAt: string }>;
  timeLogs: Array<{ id: string; minutes: number; note: string | null; loggedOn: string; userName: string }>;
  collaborators: Array<{ id: string; name: string; avatarColor: string }>;
  subtasks: Array<{ id: string; number: number; title: string; statusName: string | null; done: boolean }>;
  activity: Array<{ id: string; actorName: string; verb: string; meta: string | null; createdAt: string }>;
  projectStatuses: Array<{ id: string; name: string; position: number; category: string }>;
  members: Array<{ id: string; name: string; avatarColor: string }>;
  canEdit: boolean;
};

const TABS = [
  { key: "detail", label: "Detail" },
  { key: "discussion", label: "Diskusi" },
  { key: "activity", label: "Aktivitas" },
] as const;

export function TaskDrawer({ taskId, onClose, onChanged }: { taskId: string; onClose: () => void; onChanged?: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("detail");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [checkItem, setCheckItem] = useState("");
  const [logMinutes, setLogMinutes] = useState("");
  const [logNote, setLogNote] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Tidak dapat memuat tugas.");
      const data = (await response.json()) as Detail;
      setDetail(data);
      setDescription(data.task.description ?? "");
      setError("");
    } catch {
      setError("Tugas tidak dapat dimuat. Tutup lalu buka kembali.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function patch(patchData: Record<string, string | null>) {
    if (!detail) return;
    setSaving(true);
    const result = await updateTaskAction(detail.task.id, patchData);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Gagal menyimpan.");
      return;
    }
    await load();
    onChanged?.();
  }

  async function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setSaving(true);
    const result = await fn();
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Tindakan gagal.");
      return false;
    }
    await load();
    onChanged?.();
    return true;
  }

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="sheet" role="dialog" aria-modal="true" aria-label={detail ? detail.task.title : "Detail tugas"}>
        <div className="sheet-head">
          <div style={{ minWidth: 0, flex: 1 }}>
            {detail ? (
              <>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                  {detail.task.projectCode ?? "TANPA PROYEK"} · #{detail.task.number}
                </p>
                <h2 style={{ margin: "2px 0 0", fontSize: 17, lineHeight: 1.35, letterSpacing: "-0.02em" }}>{detail.task.title}</h2>
                <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>
                  Dibuat oleh {detail.task.reporterName ?? "—"} · Diperbarui {relativeTime(detail.task.updatedAt)}
                </p>
              </>
            ) : (
              <div className="skeleton" style={{ height: 40, width: "70%" }} />
            )}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup detail tugas">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: "8px 16px", background: "var(--danger-soft)", color: "var(--danger)", fontSize: 12.5 }} role="alert">
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
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "grid", gap: 9 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 8 }}>
                <label className="field">
                  <span className="label" style={{ fontSize: 11 }}>Status</span>
                  <select
                    className="select"
                    value={detail.task.statusId ?? ""}
                    disabled={!detail.canEdit || saving}
                    onChange={(event) => void patch({ statusId: event.target.value })}
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
                    onChange={(event) => void patch({ priority: event.target.value })}
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="field">
                  <span className="label" style={{ fontSize: 11 }}>PIC</span>
                  <select
                    className="select"
                    value={detail.task.assigneeId ?? ""}
                    disabled={!detail.canEdit || saving}
                    onChange={(event) => void patch({ assigneeId: event.target.value || null })}
                  >
                    <option value="">Belum ditetapkan</option>
                    {detail.members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="label" style={{ fontSize: 11 }}>Tenggat</span>
                  <input
                    className="input"
                    type="date"
                    value={detail.task.dueDate ?? ""}
                    disabled={!detail.canEdit || saving}
                    onChange={(event) => void patch({ dueDate: event.target.value || null })}
                  />
                </label>
              </div>
              {detail.task.labels.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {detail.task.labels.map((label) => (
                    <span key={label.id} className="badge" style={{ background: `${label.color}18`, color: label.color }}>
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="tab-row" style={{ padding: "0 10px" }} role="tablist" aria-label="Bagian tugas">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  className={`tab ${tab === item.key ? "active" : ""}`}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                  {item.key === "discussion" && detail.comments.length > 0 ? ` (${detail.comments.length})` : ""}
                </button>
              ))}
            </div>

            <div className="sheet-body">
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
                          onClick={() => void patch({ description })}
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
                            onClick={() => void act(() => toggleChecklistItemAction(item.id, !item.done))}
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
                          void act(() => addChecklistItemAction(detail.task.id, checkItem)).then((ok) => ok && setCheckItem(""));
                        }}
                      >
                        <input className="input" placeholder="Tambah item checklist…" value={checkItem} onChange={(event) => setCheckItem(event.target.value)} />
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
                        <input className="input" placeholder="Tambah subtugas…" value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} />
                        <button className="btn btn-outline btn-sm" type="submit" disabled={saving}>Tambah</button>
                      </form>
                    )}
                  </section>

                  <section>
                    <h3 style={{ margin: "0 0 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>Waktu & lampiran</h3>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                        <Clock size={13} /> {detail.timeLogs.reduce((sum, row) => sum + row.minutes, 0)} menit tercatat
                      </span>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                        <Paperclip size={13} /> {detail.attachments.length} lampiran
                      </span>
                      {detail.task.estimateHours ? <span>Estimasi {detail.task.estimateHours} jam</span> : null}
                    </div>
                    {detail.attachments.length > 0 && (
                      <div style={{ display: "grid", gap: 4, marginBottom: 8 }}>
                        {detail.attachments.map((file) => (
                          <div key={file.id} style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12 }}>
                            <FileText size={14} style={{ color: "var(--text-muted)" }} />
                            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                            <span style={{ color: "var(--text-muted)" }}>{formatBytes(file.size)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {detail.canEdit && (
                      <form
                        style={{ display: "flex", gap: 6 }}
                        onSubmit={async (event) => {
                          event.preventDefault();
                          if (!attachmentName.trim()) return;
                          const ok = await act(() => addAttachmentAction(detail.task.id, attachmentName, 0));
                          if (ok) setAttachmentName("");
                        }}
                      >
                        <input className="input" placeholder="Nama lampiran (metadata)…" value={attachmentName} onChange={(event) => setAttachmentName(event.target.value)} />
                        <button className="btn btn-outline btn-sm" type="submit" disabled={saving}>Catat</button>
                      </form>
                    )}
                    {detail.canEdit && (
                      <form
                        style={{ display: "flex", gap: 6, marginTop: 8 }}
                        onSubmit={async (event) => {
                          event.preventDefault();
                          const minutes = Number(logMinutes);
                          const ok = await act(() => addTimeLogAction(detail.task.id, minutes, logNote));
                          if (ok) {
                            setLogMinutes("");
                            setLogNote("");
                          }
                        }}
                      >
                        <input className="input" type="number" min={1} max={1440} placeholder="Menit" value={logMinutes} onChange={(event) => setLogMinutes(event.target.value)} style={{ maxWidth: 90 }} />
                        <input className="input" placeholder="Catatan waktu (opsional)" value={logNote} onChange={(event) => setLogNote(event.target.value)} />
                        <button className="btn btn-outline btn-sm" type="submit" disabled={saving || !logMinutes}>Catat</button>
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
                          <Avatar name={item.authorName} color={item.authorColor} size={28} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 12 }}>
                              <strong>{item.authorName}</strong>{" "}
                              <span style={{ color: "var(--text-muted)" }}>{formatDateTime(item.createdAt)}</span>
                            </p>
                            <p style={{ margin: "3px 0 0", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{item.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="panel" style={{ padding: 10, background: "var(--surface)" }}>
                    <textarea
                      className="textarea"
                      placeholder="Tulis komentar. Gunakan @nama untuk menyebut anggota."
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      style={{ minHeight: 70, background: "var(--bg)" }}
                    />
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={saving || !comment.trim()}
                        onClick={async () => {
                          const ok = await act(() => addCommentAction(detail.task.id, comment));
                          if (ok) setComment("");
                        }}
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Kirim
                      </button>
                      <span className="help">Komentar tercatat di activity log tugas ini.</span>
                    </div>
                  </div>
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

            <div className="sheet-foot">
              {detail.task.projectId && (
                <Link href={`/app/projects/${detail.task.projectId}/overview`} className="btn btn-outline btn-sm">
                  <ExternalLink size={14} /> Proyek
                </Link>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setTab("discussion")}
              >
                <MessageSquare size={14} /> Diskusi
              </button>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {saving && <span className="help" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Loader2 size={13} className="animate-spin" /> menyimpan…</span>}
                {detail.canEdit && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--danger)" }}
                    onClick={async () => {
                      if (!window.confirm("Arsipkan tugas ini? Tugas tidak akan muncul di daftar aktif.")) return;
                      const result = await archiveTaskAction(detail.task.id);
                      if (result.ok) {
                        onChanged?.();
                        onClose();
                      } else setError(result.error ?? "Gagal mengarsipkan.");
                    }}
                  >
                    <Archive size={14} /> Arsipkan
                  </button>
                )}
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                  <Check size={14} /> Selesai
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
    </div>
  );
}
