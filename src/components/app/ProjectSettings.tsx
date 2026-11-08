"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Copy, Plus, Save, Trash2 } from "lucide-react";
import { Avatar } from "./ui";
import {
  addProjectMemberAction,
  archiveProjectAction,
  duplicateProjectAction,
  removeProjectMemberAction,
  updateProjectAction,
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

export function ProjectSettings({
  project,
  departments,
  people,
  members,
  canEdit,
}: {
  project: Project;
  departments: Array<{ id: string; name: string }>;
  people: Array<{ id: string; name: string; avatarColor: string; title: string | null }>;
  members: Array<{ id: string; name: string; avatarColor: string; title: string | null; role: string }>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newMember, setNewMember] = useState("");
  const available = people.filter((person) => !members.some((member) => member.id === person.id));

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
        onSubmit={(event) => {
          event.preventDefault();
          void save();
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
          <div className="panel-head"><h2 className="panel-title">Anggota proyek</h2><span className="badge">{members.length}</span></div>
          <div className="panel-body" style={{ display: "grid", gap: 9 }}>
            {members.map((member) => (
              <div key={member.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Avatar name={member.name} color={member.avatarColor} size={26} />
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
              onClick={async () => {
                if (!window.confirm("Arsipkan proyek ini? Tindakan ini dapat diubah dari data, tetapi tidak ada tombol buka arsip.")) return;
                const result = await archiveProjectAction(project.id);
                if (result.ok) {
                  router.push("/app/projects");
                  router.refresh();
                } else setError(result.error ?? "Gagal mengarsipkan proyek.");
              }}
            >
              <Archive size={14} /> Arsipkan proyek
            </button>
            {error && <p className="error-text" style={{ margin: "8px 0 0" }}>{error}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
