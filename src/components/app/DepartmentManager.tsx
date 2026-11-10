"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Plus, Save } from "lucide-react";
import { createDepartmentAction, updateDepartmentAction } from "@/app/(app)/actions";

type Dept = { id: string; name: string; color: string; headUserId: string | null; headName: string | null; members: number; openTasks: number; projects: number };

export function DepartmentManager({
  departments,
  people,
  canManage,
}: {
  departments: Dept[];
  people: Array<{ id: string; name: string }>;
  canManage: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { name: string; headUserId: string }>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function getDraft(dept: Dept) {
    return draft[dept.id] ?? { name: dept.name, headUserId: dept.headUserId ?? "" };
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(280px,.7fr)", gap: 16, alignItems: "start" }} className="dash-grid">
      <div style={{ display: "grid", gap: 12 }}>
        {departments.map((dept) => {
          const value = getDraft(dept);
          return (
            <section key={dept.id} className="panel" style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: dept.color, marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editing === dept.id ? (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <input className="input" value={value.name} onChange={(event) => setDraft((current) => ({ ...current, [dept.id]: { ...value, name: event.target.value } }))} style={{ maxWidth: 240, height: 32, fontSize: 12 }} aria-label="Nama departemen" />
                      <select className="select" value={value.headUserId} onChange={(event) => setDraft((current) => ({ ...current, [dept.id]: { ...value, headUserId: event.target.value } }))} style={{ maxWidth: 220, height: 32, fontSize: 12 }} aria-label="Kepala departemen">
                        <option value="">Tanpa kepala</option>
                        {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                      </select>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={pending}
                        onClick={async () => {
                          setPending(true);
                          const result = await updateDepartmentAction(dept.id, value.name, value.headUserId || null);
                          setPending(false);
                          if (result.ok) {
                            setEditing(null);
                            setNotice("Departemen diperbarui.");
                            router.refresh();
                          } else setError(result.error ?? "Gagal memperbarui.");
                        }}
                      >
                        {pending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Simpan
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Batal</button>
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>{dept.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>Kepala: {dept.headName ?? "belum ditetapkan"}</p>
                    </>
                  )}
                  <div style={{ display: "flex", gap: 12, marginTop: 7, fontSize: 11.5, color: "var(--text-muted)" }}>
                    <span>{dept.members} anggota</span>
                    <span>{dept.projects} proyek</span>
                    <span>{dept.openTasks} tugas terbuka</span>
                  </div>
                </div>
                {canManage && editing !== dept.id && <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(dept.id)}>Ubah</button>}
              </div>
            </section>
          );
        })}
        {notice && <p className="badge badge-success" style={{ height: "auto", padding: "7px 10px" }}>{notice}</p>}
        {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {canManage && (
          <form
            className="panel"
            style={{ padding: 16, display: "grid", gap: 11 }}
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError("");
              const result = await createDepartmentAction(new FormData(event.currentTarget));
              setPending(false);
              if (result.ok) {
                setNotice("Departemen dibuat.");
                (event.target as HTMLFormElement).reset();
                router.refresh();
              } else setError(result.error ?? "Gagal membuat departemen.");
            }}
          >
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}><Building2 size={16} style={{ color: "var(--accent)" }} /><h2 style={{ margin: 0, fontSize: 14 }}>Departemen baru</h2></div>
            <label className="field"><span className="label">Nama</span><input className="input" name="name" required minLength={2} placeholder="Marketing" /></label>
            <label className="field">
              <span className="label">Kepala departemen</span>
              <select className="select" name="headUserId" defaultValue="">
                <option value="">Belum ditetapkan</option>
                {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            </label>
            <label className="field"><span className="label">Warna penanda</span><input className="input" type="color" name="color" defaultValue="#0f6cbd" style={{ height: 36, padding: 3 }} /></label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>{pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Buat departemen</button>
          </form>
        )}
        <div className="panel" style={{ padding: 16, background: "var(--surface)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Departemen dipakai untuk memfilter laporan dan menentukan approver. Menghapus departemen belum tersedia di versi ini; pindahkan anggota terlebih dahulu.
        </div>
      </div>
    </div>
  );
}
