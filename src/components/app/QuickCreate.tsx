"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarPlus, FolderPlus, Loader2, PlusSquare, X } from "lucide-react";
import { createEventAction, createProjectAction, createTaskAction } from "@/app/(app)/actions";
import { todayISO } from "@/lib/utils";

type Meta = {
  projects: Array<{ id: string; code: string; name: string }>;
  people: Array<{ id: string; name: string; role: string }>;
  departments: Array<{ id: string; name: string }>;
};

const TITLES: Record<string, string> = {
  task: "Tugas baru",
  project: "Proyek baru",
  event: "Agenda baru",
};

export function QuickCreateHost() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const mode = params.get("new");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mode || !["task", "project", "event"].includes(mode)) return;
    setError("");
    void fetch("/api/meta", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: Meta) => setMeta(data))
      .catch(() => setError("Data proyek dan anggota tidak dapat dimuat."));
  }, [mode]);

  useEffect(() => {
    if (!mode) return;
    if (mode === "request") {
      close();
      router.push("/app/requests?new=1");
    } else if (mode === "document") {
      close();
      router.push("/app/documents?new=1");
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mode || !["task", "project", "event"].includes(mode)) return null;

  function close() {
    const next = new URLSearchParams(params.toString());
    next.delete("new");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  async function submit(formData: FormData) {
    setPending(true);
    const action = mode === "task" ? createTaskAction : mode === "project" ? createProjectAction : createEventAction;
    const result = await action(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Gagal menyimpan.");
      return;
    }
    close();
    router.refresh();
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={TITLES[mode]}>
        <div className="modal-head">
          <span
            aria-hidden
            style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}
          >
            {mode === "task" ? <PlusSquare size={16} /> : mode === "project" ? <FolderPlus size={16} /> : <CalendarPlus size={16} />}
          </span>
          <h2 style={{ margin: 0, fontSize: 16 }}>{TITLES[mode]}</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Tutup" style={{ marginLeft: "auto" }}>
            <X size={17} />
          </button>
        </div>

        <form action={submit}>
          <div className="modal-body">
            {error && <p className="error-text" role="alert" style={{ margin: 0 }}>{error}</p>}

            {mode === "task" && (
              <>
                <label className="field">
                  <span className="label">Judul tugas</span>
                  <input className="input" name="title" required minLength={3} placeholder="Apa yang perlu diselesaikan?" autoFocus />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                  <label className="field">
                    <span className="label">Proyek</span>
                    <select className="select" name="projectId" defaultValue="">
                      <option value="">Tanpa proyek</option>
                      {meta?.projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.code} · {project.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="label">PIC</span>
                    <select className="select" name="assigneeId" defaultValue="">
                      <option value="">Belum ditetapkan</option>
                      {meta?.people.map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="label">Prioritas</span>
                    <select className="select" name="priority" defaultValue="medium">
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="label">Tenggat</span>
                    <input className="input" type="date" name="dueDate" defaultValue={todayISO()} />
                  </label>
                </div>
                <label className="field">
                  <span className="label">Deskripsi <span className="help">(opsional)</span></span>
                  <textarea className="textarea" name="description" placeholder="Konteks, tautan, kriteria selesai…" />
                </label>
              </>
            )}

            {mode === "project" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 140px", gap: 12 }}>
                  <label className="field">
                    <span className="label">Nama proyek</span>
                    <input className="input" name="name" required minLength={3} placeholder="Peluncuran produk" autoFocus />
                  </label>
                  <label className="field">
                    <span className="label">Kode</span>
                    <input className="input" name="code" required minLength={2} placeholder="PRD-01" style={{ textTransform: "uppercase" }} />
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                  <label className="field">
                    <span className="label">Departemen</span>
                    <select className="select" name="departmentId" defaultValue="">
                      <option value="">Tanpa departemen</option>
                      {meta?.departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="label">Manajer proyek</span>
                    <select className="select" name="managerId" defaultValue="">
                      <option value="">Saya sendiri</option>
                      {meta?.people.map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="label">Mulai</span>
                    <input className="input" type="date" name="startDate" defaultValue={todayISO()} />
                  </label>
                  <label className="field">
                    <span className="label">Tenggat</span>
                    <input className="input" type="date" name="dueDate" />
                  </label>
                </div>
                <label className="field">
                  <span className="label">Deskripsi <span className="help">(opsional)</span></span>
                  <textarea className="textarea" name="description" placeholder="Tujuan proyek dan hasil yang diharapkan…" />
                </label>
              </>
            )}

            {mode === "event" && (
              <>
                <label className="field">
                  <span className="label">Nama agenda</span>
                  <input className="input" name="title" required minLength={3} placeholder="Sprint review" autoFocus />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
                  <label className="field">
                    <span className="label">Tanggal</span>
                    <input className="input" type="date" name="date" required defaultValue={todayISO()} />
                  </label>
                  <label className="field">
                    <span className="label">Mulai</span>
                    <input className="input" type="time" name="startTime" defaultValue="09:00" />
                  </label>
                  <label className="field">
                    <span className="label">Selesai</span>
                    <input className="input" type="time" name="endTime" defaultValue="10:00" />
                  </label>
                  <label className="field">
                    <span className="label">Jenis</span>
                    <select className="select" name="kind" defaultValue="meeting">
                      <option value="meeting">Rapat tim</option>
                      <option value="personal">Pribadi</option>
                      <option value="company">Acara perusahaan</option>
                      <option value="deadline">Tenggat</option>
                      <option value="reminder">Pengingat</option>
                    </select>
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                  <label className="field">
                    <span className="label">Lokasi</span>
                    <input className="input" name="location" placeholder="Ruang Garuda / Google Meet" />
                  </label>
                  <label className="field">
                    <span className="label">Proyek terkait</span>
                    <select className="select" name="projectId" defaultValue="">
                      <option value="">Tanpa proyek</option>
                      {meta?.projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span className="label">Peserta</span>
                  <select className="select" name="participants" multiple size={4}>
                    {meta?.people.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                  <span className="help">Tahan Ctrl/Cmd untuk memilih beberapa peserta.</span>
                </label>
              </>
            )}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={close}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending && <Loader2 size={15} className="animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
