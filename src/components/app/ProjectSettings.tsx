"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ChevronDown, ChevronUp, Copy, Plus, Save, Trash2 } from "lucide-react";
import { Avatar } from "./ui";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "./Toaster";
import {
  addProjectMemberAction,
  archiveProjectAction,
  createStatusAction,
  deleteStatusAction,
  duplicateProjectAction,
  removeProjectMemberAction,
  reorderStatusAction,
  updateProjectAction,
  updateStatusAction,
} from "@/app/(app)/actions";

type Project = {
  id: string;
  name: string;
  description: string | null;
  departmentId: string | null;
  managerId: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  dueDate: string | null;
  ownerId: string | null;
  managerName: string | null;
};

type BoardStatus = {
  id: string;
  name: string;
  position: number;
  category: string;
  taskCount: number;
};

const STATUS_CATEGORIES = [
  ["open", "Terbuka"],
  ["active", "Berjalan"],
  ["review", "Review"],
  ["done", "Selesai"],
] as const;

export function ProjectSettings({
  project,
  departments,
  people,
  members,
  statuses,
  canEdit,
}: {
  project: Project;
  departments: Array<{ id: string; name: string }>;
  people: Array<{ id: string; name: string; avatarColor: string; title: string | null }>;
  members: Array<{ id: string; name: string; avatarColor: string; title: string | null; role: string }>;
  statuses: BoardStatus[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [statusError, setStatusError] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<BoardStatus | null>(null);
  const [deletingStatus, setDeletingStatus] = useState(false);
  const available = people.filter((person) => !members.some((member) => member.id === person.id));

  async function statusAction(
    run: () => Promise<{ ok: boolean; error?: string }>,
    successMessage?: string,
  ): Promise<boolean> {
    setPending(true);
    setStatusError("");
    const result = await run();
    setPending(false);
    if (!result.ok) {
      setStatusError(result.error ?? "Tahap gagal disimpan.");
      router.refresh(); // kembalikan nilai input ke keadaan server
      return false;
    }
    if (successMessage) toast(successMessage);
    router.refresh();
    return true;
  }

  async function save() {
    if (!formRef.current) return;
    setPending(true);
    setMessage("");
    setError("");
    const result = await updateProjectAction(project.id, new FormData(formRef.current));
    setPending(false);
    if (result.ok) {
      setMessage("Perubahan proyek disimpan.");
      router.refresh();
    } else setError(result.error ?? "Gagal menyimpan.");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, .7fr)", gap: 16, alignItems: "start" }} className="dash-grid">
      <form
        ref={formRef}
        onSubmit={async (event) => {
          event.preventDefault();
          void await save();
        }}
        className="panel"
        style={{ padding: 18, display: "grid", gap: 14 }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 15 }}>Pengaturan proyek</h2>
          <p className="help" style={{ margin: "2px 0 0" }}>Perubahan berlaku untuk seluruh tampilan proyek dan aktivitas anggota.</p>
        </div>
        <label className="field">
          <span className="label">Nama proyek</span>
          <input className="input" name="name" defaultValue={project.name} required minLength={3} disabled={!canEdit} />
        </label>
        <label className="field">
          <span className="label">Deskripsi</span>
          <textarea className="textarea" name="description" defaultValue={project.description ?? ""} disabled={!canEdit} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
          <label className="field">
            <span className="label">Departemen</span>
            <select className="select" name="departmentId" defaultValue={project.departmentId ?? ""} disabled={!canEdit}>
              <option value="">Tanpa departemen</option>
              {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Manajer</span>
            <select className="select" name="managerId" defaultValue={project.managerId ?? ""} disabled={!canEdit}>
              <option value="">Belum ditetapkan</option>
              {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Status</span>
            <select className="select" name="status" defaultValue={project.status} disabled={!canEdit}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="field">
            <span className="label">Prioritas</span>
            <select className="select" name="priority" defaultValue={project.priority} disabled={!canEdit}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="field">
            <span className="label">Tanggal mulai</span>
            <input className="input" type="date" name="startDate" defaultValue={project.startDate ?? ""} disabled={!canEdit} />
          </label>
          <label className="field">
            <span className="label">Tenggat</span>
            <input className="input" type="date" name="dueDate" defaultValue={project.dueDate ?? ""} disabled={!canEdit} />
          </label>
        </div>
        {message && <p className="badge badge-success" style={{ height: "auto", padding: "6px 10px", justifyContent: "flex-start" }}>{message}</p>}
        {error && <p className="error-text" role="alert" style={{ margin: 0 }}>{error}</p>}
        {canEdit && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={pending}><Save size={14} /> {pending ? "Menyimpan…" : "Simpan perubahan"}</button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={async () => {
                setPending(true);
                const result = await duplicateProjectAction(project.id);
                setPending(false);
                if (result.ok && result.id) router.push(`/app/projects/${result.id}/overview`);
                else setError(result.error ?? "Gagal menduplikasi proyek.");
              }}
              disabled={pending}
            >
              <Copy size={14} /> Duplikasi
            </button>
          </div>
        )}
      </form>

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel">
          <div className="panel-head"><h2 className="panel-title">Tahapan papan</h2><span className="badge">{statuses.length}</span></div>
          <div className="panel-body" style={{ display: "grid", gap: 8 }}>
            <p className="help" style={{ margin: 0 }}>
              Urutan kolom papan Kanban proyek. Tahap berkategori <strong>Selesai</strong> dihitung sebagai progres proyek.
            </p>
            {statuses.map((status, index) => (
              <div key={status.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  key={`${status.id}:${status.name}`}
                  className="input"
                  defaultValue={status.name}
                  maxLength={30}
                  disabled={!canEdit || pending}
                  aria-label={`Nama tahap ${status.name}`}
                  style={{ height: 32, fontSize: 12, flex: "1 1 auto", minWidth: 0 }}
                  onKeyDown={async (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      const value = event.currentTarget.value.trim();
                      if (value && value !== status.name) void await statusAction(async () => await updateStatusAction(status.id, { name: value }), "Nama tahap diperbarui");
                    }
                  }}
                  onBlur={async (event) => {
                    const value = event.currentTarget.value.trim();
                    if (value && value !== status.name) void await statusAction(async () => await updateStatusAction(status.id, { name: value }), "Nama tahap diperbarui");
                  }}
                />
                <select
                  className="select"
                  value={status.category}
                  disabled={!canEdit || pending}
                  aria-label={`Kategori ${status.name}`}
                  onChange={async (event) => void await statusAction(async () => await updateStatusAction(status.id, { category: event.target.value }), "Kategori tahap diperbarui")}
                  style={{ height: 32, fontSize: 11.5, width: 104, flex: "none" }}
                >
                  {STATUS_CATEGORIES.map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <span className="badge" title={`${status.taskCount} tugas di tahap ini`} style={{ flex: "none" }}>{status.taskCount}</span>
                {canEdit && (
                  <>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Naikkan ${status.name}`}
                      title="Naikkan"
                      disabled={pending || index === 0}
                      onClick={async () => void await statusAction(async () => await reorderStatusAction(status.id, -1), "Urutan tahap diperbarui")}
                      style={{ width: 28, height: 28, flex: "none" }}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Turunkan ${status.name}`}
                      title="Turunkan"
                      disabled={pending || index === statuses.length - 1}
                      onClick={async () => void await statusAction(async () => await reorderStatusAction(status.id, 1), "Urutan tahap diperbarui")}
                      style={{ width: 28, height: 28, flex: "none" }}
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Hapus tahap ${status.name}`}
                      title="Hapus tahap"
                      disabled={pending}
                      onClick={() => {
                        setStatusError("");
                        setDeleteStatus(status);
                      }}
                      style={{ width: 28, height: 28, flex: "none" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {canEdit && (
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <input
                  className="input"
                  placeholder="Tahap baru…"
                  maxLength={30}
                  value={newStatus}
                  disabled={pending}
                  onChange={(event) => setNewStatus(event.target.value)}
                  onKeyDown={async (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void await (async () => {
                        const value = newStatus.trim();
                        if (!value) return;
                        const ok = await statusAction(async () => await createStatusAction(project.id, value), "Tahap ditambahkan");
                        if (ok) setNewStatus("");
                      })();
                    }
                  }}
                  style={{ height: 32, fontSize: 12, flex: "1 1 auto", minWidth: 0 }}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={!newStatus.trim() || pending}
                  onClick={async () => {
                    const value = newStatus.trim();
                    if (!value) return;
                    const ok = await statusAction(async () => await createStatusAction(project.id, value), "Tahap ditambahkan");
                    if (ok) setNewStatus("");
                  }}
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>
            )}
            {statusError && <p className="error-text" role="alert" style={{ margin: 0 }}>{statusError}</p>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2 className="panel-title">Anggota proyek</h2><span className="badge">{members.length}</span></div>
          <div className="panel-body" style={{ display: "grid", gap: 9 }}>
            {members.map((member) => (
              <div key={member.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Avatar name={member.name} color={member.avatarColor} size={26} personId={member.id} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 550 }}>{member.name}</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)" }}>{member.title ?? "Anggota"} · {member.role}</p>
                </div>
                {canEdit && member.id !== project.ownerId && member.id !== project.managerId && (
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Keluarkan ${member.name}`}
                    title="Keluarkan dari proyek"
                    onClick={async () => {
                      const result = await removeProjectMemberAction(project.id, member.id);
                      if (result.ok) router.refresh();
                      else setError(result.error ?? "Gagal mengeluarkan anggota.");
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {canEdit && available.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <select className="select" value={newMember} onChange={(event) => setNewMember(event.target.value)} style={{ fontSize: 12 }}>
                  <option value="">Tambah anggota…</option>
                  {available.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={!newMember}
                  onClick={async () => {
                    const result = await addProjectMemberAction(project.id, newMember);
                    if (result.ok) {
                      setNewMember("");
                      router.refresh();
                    } else setError(result.error ?? "Gagal menambah anggota.");
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </section>

        {canEdit && (
          <section className="panel" style={{ padding: 16, borderColor: "color-mix(in srgb, var(--danger) 25%, var(--border))" }}>
            <h2 style={{ margin: 0, fontSize: 14 }}>Arsipkan proyek</h2>
            <p className="help" style={{ margin: "4px 0 10px" }}>Proyek dan tugasnya tetap tersimpan, tetapi tidak tampil di daftar aktif.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: "var(--danger)" }}
              onClick={() => {
                setError("");
                setArchiveOpen(true);
              }}
            >
              <Archive size={14} /> Arsipkan proyek
            </button>
            {error && <p className="error-text" style={{ margin: "8px 0 0" }}>{error}</p>}
          </section>
        )}
      </div>

      <ConfirmDialog
        open={archiveOpen}
        title="Arsipkan proyek?"
        description={`“${project.name}” beserta tugasnya tetap tersimpan, tetapi tidak tampil di daftar aktif. Belum ada tombol buka arsip di versi ini.`}
        confirmLabel="Arsipkan proyek"
        busyLabel="Mengarsipkan…"
        busy={archiving}
        error={archiveOpen ? error : undefined}
        onClose={() => setArchiveOpen(false)}
        onConfirm={async () => {
          setArchiving(true);
          setError("");
          const result = await archiveProjectAction(project.id);
          setArchiving(false);
          if (result.ok) {
            setArchiveOpen(false);
            toast("Proyek diarsipkan", "info");
            router.push("/app/projects");
            router.refresh();
          } else setError(result.error ?? "Gagal mengarsipkan proyek.");
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteStatus)}
        title="Hapus tahap papan?"
        description={
          deleteStatus
            ? deleteStatus.taskCount > 0
              ? `Tahap "${deleteStatus.name}" masih berisi ${deleteStatus.taskCount} tugas. Pindahkan tugas tersebut ke tahap lain sebelum menghapus.`
              : `Tahap "${deleteStatus.name}" akan dihilangkan dari papan proyek. Tindakan ini tidak menghapus tugas.`
            : ""
        }
        confirmLabel="Hapus tahap"
        busyLabel="Menghapus…"
        busy={deletingStatus}
        error={deleteStatus ? statusError : undefined}
        onClose={() => {
          setDeleteStatus(null);
          setStatusError("");
        }}
        onConfirm={async () => {
          if (!deleteStatus) return;
          setDeletingStatus(true);
          setStatusError("");
          const result = await deleteStatusAction(deleteStatus.id);
          setDeletingStatus(false);
          if (result.ok) {
            setDeleteStatus(null);
            toast("Tahap dihapus");
            router.refresh();
          } else {
            setStatusError(result.error ?? "Tahap gagal dihapus.");
          }
        }}
      />
    </div>
  );
}
