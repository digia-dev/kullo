"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckSquare,
  ClipboardPaste,
  Copy,
  Download,
  Eye,
  FileText,
  Folder,
  FolderPlus,
  History,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  RotateCcw,
  Scissors,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  archiveDocumentAction,
  copyDocumentAction,
  createFolderAction,
  deleteDocumentAction,
  moveDocumentAction,
  replaceDocumentFileAction,
  restoreDocumentAction,
  restoreDocumentVersionAction,
  uploadDocumentAction,
} from "@/app/(app)/actions";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "./Toaster";
import { formatBytes, formatDate } from "@/lib/utils";
import { visibilityTone } from "@/lib/markers";

type Doc = {
  id: string;
  name: string;
  kind: string;
  size: number;
  version: number;
  visibility: string;
  folderId: string | null;
  folderName: string;
  ownerName: string;
  projectName: string | null;
  storageKey: string | null;
  isTrashed: boolean;
  deletedAt: string | null;
  createdAt: string;
  versions: Array<{
    id: string;
    version: number;
    note: string | null;
    name: string | null;
    kind: string | null;
    size: number | null;
    hasFile: boolean;
    createdAt: string;
    authorName: string;
  }>;
};

type FolderRow = { id: string; name: string; count: number; scope: string; parentId: string | null };

const VISIBILITY: Record<string, string> = {
  company: "Perusahaan",
  department: "Departemen",
  project: "Proyek",
  personal: "Pribadi",
};

export function DocumentsClient({
  documents,
  folders,
  projects,
  canManage,
  openUpload,
  initialProject,
  initialDoc,
}: {
  documents: Doc[];
  folders: FolderRow[];
  projects: Array<{ id: string; name: string; code: string }>;
  canManage: boolean;
  openUpload: boolean;
  initialProject?: string;
  initialDoc?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [selectedId, setSelectedId] = useState(initialDoc ?? "");
  const [uploadOpen, setUploadOpen] = useState(openUpload);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [versionNote, setVersionNote] = useState("");
  const [versionOpen, setVersionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [view, setView] = useState<"list" | "board">("list");
  const [selectMode, setSelectMode] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ ids: string[]; mode: "copy" | "cut" } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [folderModal, setFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderParent, setFolderParent] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return documents
      .filter((doc) => {
        if (doc.isTrashed) return false;
        if (folder && doc.folderId !== folder) return false;
        if (q && !`${doc.name} ${doc.ownerName} ${doc.projectName ?? ""}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [documents, folder, query, sortAsc]);

  const folderPath = useMemo(() => {
    const path: FolderRow[] = [];
    let current = folder;
    const seen = new Set<string>();
    while (current && !seen.has(current)) {
      seen.add(current);
      const row = folders.find((item) => item.id === current);
      if (!row) break;
      path.unshift(row);
      current = row.parentId ?? "";
    }
    return path;
  }, [folders, folder]);

  const archived = useMemo(
    () =>
      documents
        .filter((doc) => doc.isTrashed)
        .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")),
    [documents],
  );

  function daysLeft(deletedAt: string | null) {
    if (!deletedAt) return 30;
    const elapsed = Date.now() - new Date(deletedAt).getTime();
    return Math.max(0, 30 - Math.floor(elapsed / 86400000));
  }

  async function restoreArchived(id: string) {
    setPending(true);
    const result = await restoreDocumentAction(id);
    setPending(false);
    if (result.ok) {
      toast("Dokumen dipulihkan");
      router.refresh();
    } else setError(result.error ?? "Gagal memulihkan dokumen.");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteDocumentAction(deleteTarget);
    setDeleting(false);
    if (result.ok) {
      setDeleteTarget(null);
      if (selectedId === deleteTarget) setSelectedId("");
      toast("Dokumen dihapus permanen", "info");
      router.refresh();
    } else setError(result.error ?? "Gagal menghapus dokumen.");
  }

  async function submitFolder() {
    const name = folderName.trim();
    if (!name) return;
    setPending(true);
    setError("");
    const result = await createFolderAction(name, folderParent);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Folder gagal dibuat.");
      return;
    }
    toast("Folder dibuat");
    setFolderModal(false);
    setFolderName("");
    setFolderParent(null);
    router.refresh();
  }

  function togglePicked(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((row) => row !== id) : [...current, id]));
  }

  async function bulkArchive() {
    if (picked.length === 0) return;
    setPending(true);
    for (const id of picked) await archiveDocumentAction(id);
    setPending(false);
    toast(`${picked.length} dokumen dipindahkan ke Arsip`, "info");
    setPicked([]);
    setSelectMode(false);
    router.refresh();
  }

  async function pasteClipboard() {
    if (!clipboard || clipboard.ids.length === 0) return;
    setPending(true);
    setError("");
    let moved = 0;
    for (const id of clipboard.ids) {
      const result = clipboard.mode === "copy" ? await copyDocumentAction(id, folder || null) : await moveDocumentAction(id, folder || null);
      if (result.ok) moved += 1;
    }
    setPending(false);
    if (moved > 0) {
      toast(clipboard.mode === "copy" ? `${moved} dokumen disalin ke ${folderPath[folderPath.length - 1]?.name ?? "Semua file"}` : `${moved} dokumen dipindahkan`);
      setClipboard(null);
      router.refresh();
    } else setError("Tidak ada dokumen yang bisa ditempel.");
  }

  async function moveInto(documentId: string, targetFolder: string | null) {
    if (documentId === "folder" || !documentId) return;
    setPending(true);
    const result = await moveDocumentAction(documentId, targetFolder);
    setPending(false);
    if (result.ok) {
      toast(`Dipindahkan ke ${targetFolder ? folders.find((row) => row.id === targetFolder)?.name ?? "folder" : "Semua file"}`);
      router.refresh();
    } else setError(result.error ?? "Gagal memindahkan dokumen.");
  }

  function dropProps(target: string | null) {
    return {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (!draggingId) return;
        event.preventDefault();
        setDropTarget(target ?? "root");
      },
      onDragLeave: () => setDropTarget((current) => ((current === (target ?? "root")) ? null : current)),
      onDrop: async (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/kullo-doc") || draggingId;
        setDropTarget(null);
        setDraggingId(null);
        if (id) void await moveInto(id, target);
      },
    };
  }

  const selected = documents.find((doc) => doc.id === selectedId) ?? null;
  const selectedExt = selected?.name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(selectedExt);
  const isPdf = selectedExt === "pdf";

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  function closeUpload() {
    setUploadOpen(false);
    setError("");
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    url.searchParams.delete("project");
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }

  return (
    <>
      <div className="panel" style={{ marginBottom: 14, padding: "10px 12px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
          <Search size={14} aria-hidden style={{ position: "absolute", left: 9, top: 10, color: "var(--text-muted)" }} />
          <input className="input" style={{ paddingLeft: 30, height: 34, fontSize: 12.5 }} placeholder="Cari dokumen, pemilik, atau proyek…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari dokumen" />
        </div>
        <span className="badge">{filtered.length} file</span>
        <button type="button" className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }} onClick={() => setArchiveOpen(true)}>
          <Archive size={14} /> Arsip {archived.length > 0 && <span className="badge">{archived.length}</span>}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSortAsc((value) => !value)} title="Urutkan nama" aria-label={sortAsc ? "Urutkan Z–A" : "Urutkan A–Z"}>
          {sortAsc ? "A–Z" : "Z–A"}
        </button>
        <div className="doc-view" role="group" aria-label="Tampilan dokumen">
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} aria-label="Tampilan daftar" title="Tampilan daftar">
            <List size={15} />
          </button>
          <button type="button" aria-pressed={view === "board"} onClick={() => setView("board")} aria-label="Tampilan board" title="Tampilan board">
            <LayoutGrid size={15} />
          </button>
        </div>
        <button
          type="button"
          className={`btn ${selectMode ? "btn-primary" : "btn-outline"} btn-sm`}
          onClick={() => {
            setSelectMode((value) => !value);
            setPicked([]);
          }}
          aria-pressed={selectMode}
        >
          <CheckSquare size={14} /> Pilih
        </button>
        {clipboard && (
          <button type="button" className="btn btn-outline btn-sm" disabled={pending} onClick={async () => void await pasteClipboard()}>
            <ClipboardPaste size={14} /> Tempel ({clipboard.ids.length})
          </button>
        )}
        {canManage && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setUploadOpen(true)}>
            <Upload size={14} /> Unggah dokumen
          </button>
        )}
      </div>

      {notice && <p className="badge badge-success" style={{ height: "auto", padding: "7px 10px", marginBottom: 10 }}>{notice}</p>}
      {error && !uploadOpen && <p className="error-text" style={{ marginBottom: 10 }} role="alert">{error}</p>}

      <div className="doc-layout" style={{ display: "grid", gridTemplateColumns: selected ? "190px minmax(0,1fr) minmax(260px,.7fr)" : "190px minmax(0,1fr)", gap: 14, alignItems: "start" }}>
        <aside className="panel" style={{ padding: 8 }}>
          <div className="doc-folder-head">
            <span className="nav-group" style={{ padding: 0 }}>Folder</span>
            {canManage && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Folder baru"
                title="Folder baru"
                onClick={() => {
                  setFolderParent(folder || null);
                  setFolderName("");
                  setFolderModal(true);
                }}
              >
                <Plus size={15} />
              </button>
            )}
          </div>
          <button
            type="button"
            className={`chat-channel ${folder === "" ? "active" : ""} ${dropTarget === "root" ? "drop" : ""}`}
            onClick={() => setFolder("")}
            style={{ width: "100%" }}
            {...dropProps(null)}
          >
            <Folder size={14} /> Semua file <span className="nav-count">{documents.filter((doc) => !doc.isTrashed).length}</span>
          </button>
          {folders.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`chat-channel ${folder === row.id ? "active" : ""} ${dropTarget === row.id ? "drop" : ""}`}
              onClick={() => setFolder(row.id)}
              style={{ width: "100%", paddingLeft: row.parentId ? 24 : undefined }}
              {...dropProps(row.id)}
            >
              <Folder size={14} /> <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
              <span className="nav-count">{row.count}</span>
            </button>
          ))}
        </aside>

        <div className="panel" style={{ overflow: "hidden" }}>
          <div className="doc-crumbs">
            <button type="button" className={folder ? "" : "active"} onClick={() => setFolder("")} {...dropProps(null)}>
              <Folder size={13} /> Semua file
            </button>
            {folderPath.map((row) => (
              <span key={row.id} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                <span style={{ color: "var(--text-muted)" }}>/</span>
                <button type="button" className={row.id === folder ? "active" : ""} onClick={() => setFolder(row.id)} {...dropProps(row.id)}>
                  {row.name}
                </button>
              </span>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>{filtered.length} file</span>
          </div>

          {selectMode && picked.length > 0 && (
            <div className="doc-bulk">
              <strong style={{ fontSize: 12.5 }}>{picked.length} dipilih</strong>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setClipboard({ ids: picked, mode: "copy" });
                  setPicked([]);
                  setSelectMode(false);
                  toast(`${picked.length} dokumen disalin ke papan klip`);
                }}
              >
                <Copy size={14} /> Salin
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setClipboard({ ids: picked, mode: "cut" });
                  setPicked([]);
                  setSelectMode(false);
                  toast(`${picked.length} dokumen siap dipindahkan`);
                }}
              >
                <Scissors size={14} /> Pindah
              </button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} disabled={pending} onClick={async () => void await bulkArchive()}>
                <Trash2 size={14} /> Hapus
              </button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setPicked([])}>
                Batal
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="panel-body">
              <div className="empty-state">
                <FileText size={24} style={{ color: "var(--text-muted)" }} />
                <strong style={{ display: "block", color: "var(--text)", marginTop: 6 }}>Tidak ada dokumen</strong>
                <p style={{ margin: "2px 0 10px", fontSize: 12.5 }}>{query || folder ? "Ubah pencarian atau folder." : "Unggah dokumen pertama ke folder perusahaan."}</p>
                {canManage && <button type="button" className="btn btn-outline btn-sm" onClick={() => setUploadOpen(true)}><Plus size={14} /> Unggah</button>}
              </div>
            </div>
          ) : view === "list" ? (
            <div>
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className={`doc-row ${selectedId === doc.id ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={(event) => {
                    setDraggingId(doc.id);
                    event.dataTransfer.setData("text/kullo-doc", doc.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  onClick={() => setSelectedId(doc.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(doc.id);
                    }
                  }}
                  style={{ cursor: "grab", opacity: draggingId === doc.id ? 0.5 : 1 }}
                >
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={picked.includes(doc.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => togglePicked(doc.id)}
                      aria-label={`Pilih ${doc.name}`}
                      style={{ marginLeft: 10 }}
                    />
                  )}
                  <span className="doc-icon">{doc.kind.slice(0, 4)}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 12.5, fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
                    <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)" }}>
                      v{doc.version} · {formatBytes(doc.size)} · {doc.folderName} · {formatDate(doc.createdAt)}
                    </span>
                  </span>
                  {doc.version > 1 && <span className="badge badge-accent" style={{ fontSize: 10 }}>v{doc.version} baru</span>}
                  <span className={`badge ${visibilityTone(doc.visibility)}`} style={{ fontSize: 10 }}>{VISIBILITY[doc.visibility] ?? doc.visibility}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="doc-board">
              {filtered.map((doc) => {
                const image = ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(doc.kind) && doc.storageKey;
                return (
                  <article
                    key={doc.id}
                    className={`doc-board-card ${selectedId === doc.id ? "active" : ""}`}
                    draggable
                    onDragStart={(event) => {
                      setDraggingId(doc.id);
                      event.dataTransfer.setData("text/kullo-doc", doc.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => setSelectedId(doc.id)}
                    onDoubleClick={() => {
                      if (doc.storageKey) setPreviewOpen(true);
                    }}
                  >
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={picked.includes(doc.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => togglePicked(doc.id)}
                        aria-label={`Pilih ${doc.name}`}
                        style={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}
                      />
                    )}
                    <span className="doc-board-preview">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/documents/${doc.id}/file`} alt={doc.name} loading="lazy" />
                      ) : (
                        <span className="doc-board-kind">{doc.kind.slice(0, 4)}</span>
                      )}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
                      <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)" }}>{formatBytes(doc.size)} · {doc.folderName}</span>
                    </span>
                    {doc.version > 1 && <span className="badge badge-accent" style={{ position: "absolute", top: 8, right: 8, fontSize: 9.5 }}>v{doc.version}</span>}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <aside className="panel" style={{ position: "sticky", top: 72 }}>
            <div className="panel-head">
              <h2 className="panel-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Detail dokumen</h2>
              <button type="button" className="icon-btn" onClick={() => setSelectedId("")} aria-label="Tutup detail" style={{ marginLeft: "auto" }}><X size={15} /></button>
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 12 }}>
              <span className="doc-icon" style={{ width: 44, height: 44, fontSize: 11 }}>{selected.kind.slice(0, 4)}</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 650, wordBreak: "break-word" }}>{selected.name}</p>
                <p className="help" style={{ margin: "2px 0 0" }}>{selected.ownerName} · {formatDate(selected.createdAt)}</p>
              </div>
              <div style={{ display: "grid", gap: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                <span>Versi {selected.version} · {formatBytes(selected.size)}</span>
                <span>{selected.folderName} · <span className={`badge ${visibilityTone(selected.visibility)}`} style={{ height: 19, fontSize: 10 }}>{VISIBILITY[selected.visibility] ?? selected.visibility}</span></span>
                {selected.projectName && <span>Proyek: {selected.projectName}</span>}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.storageKey ? (
                  <>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewOpen(true)}><Eye size={14} /> Pratinjau</button>
                    <a href={`/api/documents/${selected.id}/file?download=1`} className="btn btn-primary btn-sm"><Download size={14} /> Unduh</a>
                  </>
                ) : (
                  <p className="help" style={{ margin: 0 }}>File contoh ini hanya metadata dan tidak memiliki berkas tersimpan.</p>
                )}
              </div>
              {canManage && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--danger)", justifyContent: "flex-start" }}
                  disabled={pending}
                  onClick={async () => {
                    setPending(true);
                    const result = await archiveDocumentAction(selected.id);
                    setPending(false);
                    if (result.ok) {
                      setSelectedId("");
                      setNotice("Dokumen dipindahkan ke Arsip. Otomatis dihapus setelah 30 hari.");
                      router.refresh();
                    } else setError(result.error ?? "Gagal memindahkan ke arsip.");
                  }}
                >
                  <Archive size={14} /> Hapus (pindah ke Arsip)
                </button>
              )}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <History size={14} style={{ color: "var(--text-muted)" }} />
                  <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>Riwayat versi</strong>
                </div>
                {selected.versions.map((version) => (
                  <div key={version.id} style={{ display: "grid", gap: 3, fontSize: 11.5, padding: "5px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)" }}>
                    <div style={{ display: "flex", gap: 7 }}>
                      <span style={{ fontWeight: 650, width: 24 }}>v{version.version}</span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{version.note ?? "Tanpa catatan"}</span>
                        <span style={{ display: "block", color: "var(--text-muted)", fontSize: 10 }}>
                          {version.authorName} · {formatDate(version.createdAt)}
                          {version.size ? ` · ${formatBytes(version.size)}` : ""}
                        </span>
                      </span>
                    </div>
                    {version.hasFile && (
                      <div style={{ display: "flex", gap: 4, paddingLeft: 31 }}>
                        <a className="btn btn-ghost btn-sm" href={`/api/documents/${selected.id}/file?version=${version.id}&download=1`}>
                          <Download size={12} /> Unduh
                        </a>
                        {canManage && version.version !== selected.version && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={pending}
                            onClick={async () => {
                              setPending(true);
                              const result = await restoreDocumentVersionAction(selected.id, version.id);
                              setPending(false);
                              if (result.ok) {
                                setNotice(`Versi v${version.version} dipulihkan sebagai versi baru.`);
                                router.refresh();
                              } else setError(result.error ?? "Gagal memulihkan versi.");
                            }}
                          >
                            <History size={12} /> Kembalikan versi ini
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <p className="help" style={{ margin: "6px 0 0" }}>
                  Ganti file membuat versi baru; berkas lama tetap tersimpan di riwayat dan bisa dipulihkan.
                </p>
                <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 6 }} onClick={() => { setVersionNote(""); setVersionOpen(true); }} disabled={!canManage || !selected.storageKey}>
                  <Plus size={13} /> Ganti file (versi baru)
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {versionOpen && selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVersionOpen(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Ganti file dokumen" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><Upload size={16} /></span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 15 }}>Ganti file · versi baru</h2>
                <p className="help" style={{ margin: 0 }}>{selected.name} · sekarang v{selected.version}</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setVersionOpen(false)} aria-label="Tutup" style={{ marginLeft: "auto" }}><X size={17} /></button>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const input = event.currentTarget.querySelector<HTMLInputElement>('input[type="file"]');
                if (!input?.files?.[0]) return;
                setPending(true);
                setError("");
                const formData = new FormData(event.currentTarget);
                formData.set("documentId", selected.id);
                formData.set("note", versionNote);
                const result = await replaceDocumentFileAction(formData);
                setPending(false);
                if (result.ok) {
                  setVersionOpen(false);
                  setVersionNote("");
                  setNotice("File diganti. Versi sebelumnya tersimpan di riwayat dan bisa dipulihkan.");
                  router.refresh();
                } else setError(result.error ?? "Gagal mengganti file.");
              }}
            >
              <div className="modal-body">
                <label className="field">
                  <span className="label">File baru</span>
                  <input className="input" type="file" name="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip,.txt,.csv,.md" />
                  <span className="help">Maksimal 10 MB. File lama tidak dihapus; tersimpan sebagai versi sebelumnya.</span>
                </label>
                <label className="field">
                  <span className="label">Catatan revisi (opsional)</span>
                  <input className="input" placeholder="Contoh: Revisi angka Q4" value={versionNote} onChange={(event) => setVersionNote(event.target.value)} />
                </label>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setVersionOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Mengunggah…" : "Ganti file"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewOpen && selected?.storageKey && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewOpen(false);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Pratinjau ${selected.name}`}
            style={{ width: "min(960px, 94vw)", height: "min(82vh, 780px)", display: "flex", flexDirection: "column" }}
          >
            <div className="modal-head" style={{ flex: "0 0 auto" }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><FileText size={16} /></span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</h2>
                <p className="help" style={{ margin: 0 }}>v{selected.version} · {formatBytes(selected.size)}</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setPreviewOpen(false)} aria-label="Tutup pratinjau" style={{ marginLeft: "auto" }}><X size={17} /></button>
            </div>
            <div style={{ flex: "1 1 auto", minHeight: 0, background: "var(--canvas)", display: "grid", placeItems: "center", overflow: "auto", padding: isPdf ? 0 : 12 }}>
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/documents/${selected.id}/file`}
                  alt={selected.name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 6, background: "var(--bg)" }}
                />
              ) : isPdf ? (
                <iframe
                  src={`/api/documents/${selected.id}/file`}
                  title={`Pratinjau ${selected.name}`}
                  style={{ width: "100%", height: "100%", border: 0, background: "var(--bg)" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <FileText size={32} style={{ color: "var(--text-muted)" }} />
                  <p style={{ margin: "8px 0 2px", fontWeight: 600 }}>Pratinjau belum tersedia untuk tipe ini</p>
                  <p className="help" style={{ margin: 0 }}>Unduh file untuk membukanya di aplikasi yang sesuai.</p>
                  <a href={`/api/documents/${selected.id}/file?download=1`} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}><Download size={14} /> Unduh file</a>
                </div>
              )}
            </div>
            <div className="modal-foot" style={{ flex: "0 0 auto" }}>
              <a href={`/api/documents/${selected.id}/file?download=1`} className="btn btn-outline btn-sm"><Download size={14} /> Unduh</a>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setPreviewOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {uploadOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeUpload(); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Unggah dokumen">
            <div className="modal-head">
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><Upload size={16} /></span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Unggah dokumen</h2>
              <button type="button" className="icon-btn" onClick={closeUpload} aria-label="Tutup" style={{ marginLeft: "auto" }}><X size={17} /></button>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setPending(true);
                setError("");
                const formData = new FormData(event.currentTarget);
                const result = await uploadDocumentAction(formData);
                setPending(false);
                if (result.ok) {
                  closeUpload();
                  setNotice("Dokumen diunggah dan versi awal dicatat.");
                  router.refresh();
                } else setError(result.error ?? "Unggah gagal.");
              }}
            >
              <div className="modal-body">
                {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
                <label className="field">
                  <span className="label">File</span>
                  <input
                    ref={fileRef}
                    className="input"
                    type="file"
                    name="file"
                    required
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip,.txt,.csv,.md"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const nameInput = event.currentTarget.form?.elements.namedItem("name") as HTMLInputElement | null;
                        if (nameInput && !nameInput.value) nameInput.value = file.name;
                      }
                    }}
                  />
                  <span className="help">Maksimal 10 MB. PDF, Office, gambar, ZIP, TXT, CSV, atau Markdown.</span>
                </label>
                <label className="field"><span className="label">Nama tampilan</span><input className="input" name="name" placeholder="Diisi otomatis dari nama file" /></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                  <label className="field">
                    <span className="label">Folder</span>
                    <select className="select" name="folderId" defaultValue={folder}>
                      <option value="">Tanpa folder</option>
                      {folders.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span className="label">Visibilitas</span>
                    <select className="select" name="visibility" defaultValue="company">
                      {Object.entries(VISIBILITY).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span className="label">Proyek terkait</span>
                    <select className="select" name="projectId" defaultValue={initialProject ?? ""}>
                      <option value="">Tanpa proyek</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.code} · {project.name}</option>)}
                    </select>
                  </label>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={closeUpload}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={pending}>{pending && <Loader2 size={15} className="animate-spin" />} {pending ? "Mengunggah…" : "Unggah"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {folderModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFolderModal(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Folder baru" style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><FolderPlus size={16} /></span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Folder baru</h2>
              <button type="button" className="icon-btn" onClick={() => setFolderModal(false)} aria-label="Tutup" style={{ marginLeft: "auto" }}><X size={17} /></button>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                void await submitFolder();
              }}
            >
              <div className="modal-body">
                <label className="field">
                  <span className="label">Nama folder</span>
                  <input
                    className="input"
                    autoFocus
                    value={folderName}
                    onChange={(event) => setFolderName(event.target.value)}
                    placeholder="Contoh: Brief proyek"
                    aria-label="Nama folder"
                  />
                </label>
                <p className="help" style={{ margin: 0 }}>
                  Dibuat di {folderPath[folderPath.length - 1]?.name ?? "Semua file"}.
                </p>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setFolderModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={pending || !folderName.trim()}>Buat folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {archiveOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setArchiveOpen(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Arsip dokumen" style={{ maxWidth: 580 }}>
            <div className="modal-head">
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><Archive size={16} /></span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 15 }}>Arsip dokumen</h2>
                <p className="help" style={{ margin: 0 }}>Dokumen yang dihapus otomatis dibersihkan setelah 30 hari.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setArchiveOpen(false)} aria-label="Tutup" style={{ marginLeft: "auto" }}><X size={17} /></button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 4 }}>
              {archived.length === 0 ? (
                <div style={{ display: "grid", justifyItems: "center", gap: 4, padding: "28px 12px", textAlign: "center", color: "var(--text-muted)" }}>
                  <Archive size={26} />
                  <strong style={{ color: "var(--text)", fontSize: 13 }}>Arsip kosong</strong>
                  <p className="help" style={{ margin: 0 }}>Dokumen yang Anda hapus akan muncul di sini.</p>
                </div>
              ) : (
                archived.map((doc) => (
                  <div key={doc.id} className="doc-archive-row">
                    <span className="doc-icon">{doc.kind.slice(0, 4)}</span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
                      <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)" }}>
                        Dihapus {doc.deletedAt ? formatDate(doc.deletedAt) : "—"} · otomatis dihapus dalam {daysLeft(doc.deletedAt)} hari
                      </span>
                    </span>
                    <span className="badge badge-neutral">Arsip</span>
                    {canManage && (
                      <>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={async () => void await restoreArchived(doc.id)}>
                          <RotateCcw size={14} /> Pulihkan
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} disabled={pending} onClick={() => setDeleteTarget(doc.id)}>
                          <Trash2 size={14} /> Hapus
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setArchiveOpen(false)}>Selesai</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus permanen dokumen?"
        description="File dan seluruh riwayat versinya akan dihapus dari penyimpanan. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus permanen"
        busyLabel="Menghapus…"
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => void await confirmDelete()}
      />

      <p className="help" style={{ marginTop: 12 }}>
        File disimpan di Supabase Storage (bucket privat). Di lingkungan pengembangan tanpa kredensial, berkas memakai folder lokal <code>data/uploads</code>.
        <Link href="/sumber-daya/catatan-rilis" className="textlink" style={{ marginLeft: 6 }}>Catatan rilis</Link>
      </p>
    </>
  );
}
