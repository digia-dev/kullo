"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, MapPin, Pencil, Trash2, Users, X } from "lucide-react";
import { deleteEventAction, updateEventAction } from "@/app/(app)/actions";
import { EmptyState } from "./ui";
import { formatDate, formatTime } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location: string | null;
  projectId: string | null;
  createdBy: string | null;
  participantCount: number;
};

const KINDS: Record<string, { label: string; color: string }> = {
  meeting: { label: "Rapat tim", color: "#365fd1" },
  personal: { label: "Pribadi", color: "#7a3d9e" },
  company: { label: "Perusahaan", color: "#8a5a10" },
  deadline: { label: "Tenggat", color: "#c02f2f" },
  reminder: { label: "Pengingat", color: "#18794e" },
};

const VIEWS = [
  ["month", "Bulan"],
  ["week", "Minggu"],
  ["agenda", "Agenda"],
] as const;

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function eventDate(event: CalendarEvent) {
  return event.startsAt.slice(0, 10);
}

function monthMatrix(base: Date) {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function weekDays(base: Date) {
  const start = new Date(base);
  start.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function EventCalendar({
  events,
  projects,
  canDeleteAny,
}: {
  events: CalendarEvent[];
  projects: Array<{ id: string; name: string; code: string }>;
  canDeleteAny: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [kindFilter, setKindFilter] = useState("");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => events.filter((event) => !kindFilter || event.kind === kindFilter), [events, kindFilter]);
  const today = dateKey(new Date());
  const monthDays = monthMatrix(cursor);
  const week = weekDays(cursor);
  const title = new Intl.DateTimeFormat("id-ID", view === "month" ? { month: "long", year: "numeric" } : { day: "numeric", month: "long", year: "numeric" }).format(cursor);

  function shift(direction: number) {
    if (view === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1));
    else if (view === "week") {
      const next = new Date(cursor);
      next.setDate(cursor.getDate() + direction * 7);
      setCursor(next);
    } else {
      const next = new Date(cursor);
      next.setMonth(cursor.getMonth() + direction);
      setCursor(next);
    }
  }

  function openEvent(event: CalendarEvent) {
    setSelected(event);
    setEditing(false);
    setError("");
  }

  return (
    <>
      <div className="panel" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", flexWrap: "wrap" }}>
          <button type="button" className="icon-btn" onClick={() => shift(-1)} aria-label="Sebelumnya"><ChevronLeft size={17} /></button>
          <strong style={{ fontSize: 13.5, textTransform: "capitalize", minWidth: 160 }}>{title}</strong>
          <button type="button" className="icon-btn" onClick={() => shift(1)} aria-label="Berikutnya"><ChevronRight size={17} /></button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCursor(new Date())}>Hari ini</button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <select className="select" value={kindFilter} onChange={(event) => setKindFilter(event.target.value)} style={{ width: "auto", height: 34, fontSize: 12.5 }} aria-label="Filter jenis agenda">
              <option value="">Semua jenis</option>
              {Object.entries(KINDS).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
            </select>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
              {VIEWS.map(([key, label]) => (
                <button key={key} type="button" onClick={() => setView(key)} aria-pressed={view === key} style={{ border: 0, padding: "6px 10px", background: view === key ? "var(--accent-soft)" : "var(--bg)", color: view === key ? "var(--accent)" : "var(--text-muted)", fontSize: 12, fontWeight: view === key ? 600 : 500, cursor: "pointer" }}>{label}</button>
              ))}
            </div>
            <Link href="/app/calendar?new=event" className="btn btn-primary btn-sm"><CalendarPlus size={14} /> Agenda</Link>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Belum ada agenda" copy="Buat rapat tim, pengingat, atau acara perusahaan. Agenda pribadi hanya perlu peserta Anda sendiri." action={{ label: "Buat agenda", href: "/app/calendar?new=event" }} />
      ) : view === "month" ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <div className="calendar-grid" style={{ gridTemplateColumns: "repeat(7,minmax(88px,1fr))" }}>
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
              <div key={day} style={{ padding: "7px 8px", fontSize: 10.5, fontWeight: 650, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>{day}</div>
            ))}
            {monthDays.map((date) => {
              const key = dateKey(date);
              const dayEvents = filtered.filter((event) => eventDate(event) === key);
              return (
                <div key={key} className={`calendar-cell ${date.getMonth() === cursor.getMonth() ? "" : "muted"} ${key === today ? "today" : ""}`}>
                  <span style={{ fontSize: 10.5, fontWeight: key === today ? 700 : 500, color: key === today ? "var(--accent)" : undefined }}>{date.getDate()}</span>
                  {dayEvents.slice(0, 6).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className="calendar-event"
                      style={{ background: `${KINDS[event.kind]?.color ?? "#365fd1"}14`, color: KINDS[event.kind]?.color ?? "var(--accent)", borderLeftColor: KINDS[event.kind]?.color ?? "var(--accent)" }}
                      onClick={() => openEvent(event)}
                      title={`${event.title} · ${formatTime(event.startsAt)}`}
                    >
                      {!event.allDay && <span style={{ opacity: 0.8 }}>{formatTime(event.startsAt)} </span>}
                      {event.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : view === "week" ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(100px,1fr))" }}>
            {week.map((date) => {
              const key = dateKey(date);
              return (
                <div key={key} style={{ borderRight: "1px solid var(--border)", minHeight: 340, background: key === today ? "var(--accent-soft)" : undefined }}>
                  <div style={{ padding: "7px 9px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 650 }}>
                    {new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric" }).format(date)}
                  </div>
                  <div style={{ padding: 6, display: "grid", gap: 5 }}>
                    {filtered.filter((event) => eventDate(event) === key).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => openEvent(event)}
                        style={{ textAlign: "left", border: 0, borderLeft: `3px solid ${KINDS[event.kind]?.color ?? "var(--accent)"}`, background: `${KINDS[event.kind]?.color ?? "#365fd1"}12`, borderRadius: 5, padding: "5px 6px", cursor: "pointer" }}
                      >
                        <span style={{ display: "block", fontSize: 10.5, fontWeight: 600 }}>{formatTime(event.startsAt)}</span>
                        <span style={{ display: "block", fontSize: 11, lineHeight: 1.35 }}>{event.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="panel">
          {filtered
            .slice()
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
            .map((event) => (
              <button key={event.id} type="button" onClick={() => openEvent(event)} className="task-row" style={{ gridTemplateColumns: "70px minmax(0,1fr) auto" }}>
                <span style={{ textAlign: "center" }}>
                  <span style={{ display: "block", fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)" }}>{new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(event.startsAt))}</span>
                  <span style={{ display: "block", fontSize: 18, fontWeight: 650, lineHeight: 1 }}>{new Date(event.startsAt).getDate()}</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="task-title">{event.title}</span>
                  <span className="task-meta">
                    {event.allDay ? "Sepanjang hari" : `${formatTime(event.startsAt)}–${formatTime(event.endsAt)}`}
                    {event.location ? ` · ${event.location}` : ""}
                  </span>
                </span>
                <span className="badge" style={{ background: `${KINDS[event.kind]?.color ?? "#365fd1"}14`, color: KINDS[event.kind]?.color ?? "var(--accent)" }}>{KINDS[event.kind]?.label ?? event.kind}</span>
              </button>
            ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
        {Object.entries(KINDS).map(([key, meta]) => (
          <span key={key} style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: meta.color }} /> {meta.label}
          </span>
        ))}
      </div>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={selected.title}>
            <div className="modal-head">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: KINDS[selected.kind]?.color ?? "var(--accent)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>{selected.title}</h2>
                <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{KINDS[selected.kind]?.label ?? selected.kind}</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setSelected(null)} aria-label="Tutup"><X size={17} /></button>
            </div>
            {editing ? (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  setPending(true);
                  const result = await updateEventAction(selected.id, new FormData(event.currentTarget));
                  setPending(false);
                  if (result.ok) {
                    setSelected(null);
                    router.refresh();
                  } else setError(result.error ?? "Gagal menyimpan agenda.");
                }}
                className="modal-body"
              >
                <label className="field"><span className="label">Nama agenda</span><input className="input" name="title" defaultValue={selected.title} required /></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
                  <label className="field"><span className="label">Tanggal</span><input className="input" type="date" name="date" defaultValue={selected.startsAt.slice(0, 10)} required /></label>
                  <label className="field"><span className="label">Mulai</span><input className="input" type="time" name="startTime" defaultValue={selected.startsAt.slice(11, 16)} /></label>
                  <label className="field"><span className="label">Selesai</span><input className="input" type="time" name="endTime" defaultValue={selected.endsAt.slice(11, 16)} /></label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                  <label className="field">
                    <span className="label">Jenis</span>
                    <select className="select" name="kind" defaultValue={selected.kind}>
                      {Object.entries(KINDS).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
                    </select>
                  </label>
                  <label className="field"><span className="label">Lokasi</span><input className="input" name="location" defaultValue={selected.location ?? ""} /></label>
                  <label className="field">
                    <span className="label">Proyek</span>
                    <select className="select" name="projectId" defaultValue={selected.projectId ?? ""}>
                      <option value="">Tanpa proyek</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </label>
                </div>
                <label className="field"><span className="label">Deskripsi</span><textarea className="textarea" name="description" defaultValue={selected.description ?? ""} /></label>
                {error && <p className="error-text" style={{ margin: 0 }}>{error}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Batal</button>
                </div>
              </form>
            ) : (
              <>
                <div className="modal-body" style={{ gap: 10 }}>
                  <p style={{ margin: 0, display: "flex", gap: 7, alignItems: "center", fontSize: 13 }}><Clock size={14} style={{ color: "var(--text-muted)" }} /> {formatDate(selected.startsAt)} · {selected.allDay ? "Sepanjang hari" : `${formatTime(selected.startsAt)}–${formatTime(selected.endsAt)}`}</p>
                  {selected.location && <p style={{ margin: 0, display: "flex", gap: 7, alignItems: "center", fontSize: 13 }}><MapPin size={14} style={{ color: "var(--text-muted)" }} /> {selected.location}</p>}
                  <p style={{ margin: 0, display: "flex", gap: 7, alignItems: "center", fontSize: 13 }}><Users size={14} style={{ color: "var(--text-muted)" }} /> {selected.participantCount} peserta</p>
                  {selected.description && <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)" }}>{selected.description}</p>}
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Pencil size={14} /> Ubah</button>
                  {(canDeleteAny || selected.createdBy) && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--danger)" }}
                      onClick={async () => {
                        if (!window.confirm("Hapus agenda ini?")) return;
                        const result = await deleteEventAction(selected.id);
                        if (result.ok) {
                          setSelected(null);
                          router.refresh();
                        } else setError(result.error ?? "Gagal menghapus agenda.");
                      }}
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  )}
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setSelected(null)} style={{ marginLeft: "auto" }}>Tutup</button>
                </div>
              </>
            )}
            {error && !editing && <p className="error-text" style={{ padding: "0 18px 12px", margin: 0 }}>{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
