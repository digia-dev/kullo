"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Eye,
  FileText,
  Folder,
  History,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import { addDocumentVersionAction, uploadDocumentAction } from "@/app/(app)/actions";
import { formatBytes, formatDate } from "@/lib/utils";

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
  createdAt: string;
  versions: Array<{ id: string; version: number; note: string | null; createdAt: string; authorName: string }>;
};

type FolderRow = { id: string; name: string; count: number; scope: string };

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
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return documents.filter((doc) => {
      if (folder && doc.folderId !== folder) return false;
      if (q && !`${doc.name} ${doc.ownerName} ${doc.projectName ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [documents, folder, query]);

  const selected = documents.find((doc) => doc.id === selectedId) ?? null;

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
        {canManage && (
          <button type="button" className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={() => setUploadOpen(true)}>
            <Upload size={14} /> Unggah dokumen
          </button>
        )}
      </div>

      {notice && <p className="badge badge-success" style={{ height: "auto", padding: "7px 10px", marginBottom: 10 }}>{notice}</p>}
      {error && !uploadOpen && <p className="error-text" style={{ marginBottom: 10 }} role="alert">{error}</p>}

      <div className="doc-layout" style={{ display: "grid", gridTemplateColumns: selected ? "190px minmax(0,1fr) minmax(260px,.7fr)" : "190px minmax(0,1fr)", gap: 14, alignItems: "start" }}>
        <aside className="panel" style={{ padding: 8 }}>
          <p className="nav-group" style={{ padding: "8px 6px 4px" }}>Folder</p>
          <button type="button" className={`chat-channel ${folder === "" ? "active" : ""}`} onClick={() => setFolder("")} style={{ width: "100%" }}>
            <Folder size={14} /> Semua file <span className="nav-count">{documents.length}</span>
          </button>
          {folders.map((row) => (
            <button key={row.id} type="button" className={`chat-channel ${folder === row.id ? "active" : ""}`} onClick={() => setFolder(row.id)} style={{ width: "100%" }}>
              <Folder size={14} /> <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
              <span className="nav-count">{row.count}</span>
            </button>
          ))}
        </aside>

        <div className="panel">
          {filtered.length === 0 ? (
            <div className="panel-body">
              <div className="empty-state">
                <FileText size={24} style={{ color: "var(--text-muted)" }} />
                <strong style={{ display: "block", color: "var(--text)", marginTop: 6 }}>Tidak ada dokumen</strong>
                <p style={{ margin: "2px 0 10px", fontSize: 12.5 }}>{query || folder ? "Ubah pencarian atau folder." : "Unggah dokumen pertama ke folder perusahaan."}</p>
                {canManage && <button type="button" className="btn btn-outline btn-sm" onClick={() => setUploadOpen(true)}><Plus size={14} /> Unggah</button>}
              </div>
            </div>
          ) : (
            <div>
              {filtered.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className="doc-row"
                  onClick={() => setSelectedId(doc.id)}
                  style={{ width: "100%", background: selectedId === doc.id ? "var(--accent-soft)" : "transparent", border: 0, borderBottom: "1px solid var(--border)", textAlign: "left", cursor: "pointer" }}
                >
                  <span className="doc-icon">{doc.kind.slice(0, 4)}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 12.5, fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
                    <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)" }}>
                      v{doc.version} · {formatBytes(doc.size)} · {doc.folderName} · {formatDate(doc.createdAt)}
                    </span>
                  </span>
                  <span className="badge" style={{ fontSize: 10 }}>{VISIBILITY[doc.visibility] ?? doc.visibility}</span>
                </button>
              ))}
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
                <span>{selected.folderName} · {VISIBILITY[selected.visibility] ?? selected.visibility}</span>
                {selected.projectName && <span>Proyek: {selected.projectName}</span>}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.storageKey ? (
                  <>
                    <a href={`/api/documents/${selected.id}/file`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Eye size={14} /> Pratinjau</a>
                    <a href={`/api/documents/${selected.id}/file?download=1`} className="btn btn-primary btn-sm"><Download size={14} /> Unduh</a>
                  </>
                ) : (
                  <p className="help" style={{ margin: 0 }}>File contoh ini hanya metadata dan tidak memiliki berkas tersimpan.</p>
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <History size={14} style={{ color: "var(--text-muted)" }} />
                  <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>Riwayat versi</strong>
                </div>
                {selected.versions.map((version) => (
                  <div key={version.id} style={{ display: "flex", gap: 7, fontSize: 11.5, padding: "3px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)" }}>
                    <span style={{ fontWeight: 650, width: 24 }}>v{version.version}</span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{version.note ?? "Tanpa catatan"}</span>
                      <span style={{ display: "block", color: "var(--text-muted)", fontSize: 10 }}>{version.authorName} · {formatDate(version.createdAt)}</span>
                    </span>
                  </div>
                ))}
                {versionOpen ? (
                  <form
                    style={{ display: "grid", gap: 6, marginTop: 7 }}
                    onSubmit={async (event) => {
                      event.preventDefault();
                      if (!versionNote.trim()) return;
                      setPending(true);
                      const result = await addDocumentVersionAction(selected.id, versionNote);
                      setPending(false);
                      if (result.ok) {
                        setVersionNote("");
                        setVersionOpen(false);
                        setNotice("Versi baru dicatat.");
                        router.refresh();
                      } else setError(result.error ?? "Gagal menambah versi.");
                    }}
                  >
                    <input className="input" placeholder="Catatan versi" value={versionNote} onChange={(event) => setVersionNote(event.target.value)} style={{ height: 32, fontSize: 12 }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>Simpan versi</button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setVersionOpen(false)}>Batal</button>
                    </div>
                  </form>
                ) : (
                  <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => setVersionOpen(true)} disabled={!canManage}><Plus size={13} /> Versi baru</button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

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

      <p className="help" style={{ marginTop: 12 }}>
        File disimpan di adapter lokal <code>data/uploads</code>. Untuk produksi, ganti dengan S3-compatible storage lewat kunci lingkungan.
        <Link href="/sumber-daya/catatan-rilis" className="textlink" style={{ marginLeft: 6 }}>Catatan rilis</Link>
      </p>
    </>
  );
}
