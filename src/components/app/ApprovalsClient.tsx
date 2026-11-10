"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Clock3, Loader2, RotateCcw, X, XCircle } from "lucide-react";
import { decideRequestAction } from "@/app/(app)/actions";
import { Avatar, EmptyState, StatCard } from "./ui";
import { formatDate, formatIDR, requestStatus, relativeTime } from "@/lib/utils";

type RequestRow = {
  id: string;
  title: string;
  amount: number | null;
  status: string;
  currentStep: number;
  createdAt: string;
  templateName: string | null;
  requesterId: string;
  requesterName: string;
  requesterColor: string;
  data: Record<string, string | number>;
  steps: Array<{ id: string; position: number; approverId: string; approverName: string; status: string; note: string | null; decidedAt: string | null }>;
};

export function ApprovalsClient({
  pending,
  history,
  currentUserId,
  canDecide,
}: {
  pending: RequestRow[];
  history: RequestRow[];
  currentUserId: string;
  canDecide: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function decide(decision: "approved" | "rejected" | "revision") {
    if (!selected) return;
    setPendingAction(true);
    setError("");
    const result = await decideRequestAction(selected.id, decision, note);
    setPendingAction(false);
    if (result.ok) {
      setSelected(null);
      setNote("");
      setNotice(decision === "approved" ? "Permintaan disetujui dan diteruskan ke tahap berikutnya." : decision === "revision" ? "Revisi diminta. Pengaju menerima notifikasi." : "Permintaan ditolak. Pengaju menerima notifikasi.");
      router.refresh();
    } else setError(result.error ?? "Keputusan gagal disimpan.");
  }

  const list = tab === "pending" ? pending : history;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 16 }}>
        <StatCard label="Menunggu Anda" value={pending.length} hint="Keputusan pada tahap ini" tone="warning" />
        <StatCard label="Riwayat keputusan" value={history.length} hint="Permintaan yang pernah Anda nilai" />
        <StatCard label="Disetujui" value={history.filter((request) => request.status === "approved").length} hint="Termasuk tahap sebelumnya" tone="success" />
        <StatCard label="Ditolak / revisi" value={history.filter((request) => ["rejected", "revision"].includes(request.status)).length} hint="Butuh tindak lanjut pengaju" tone="danger" />
      </div>

      {notice && <p className="badge badge-success" style={{ height: "auto", padding: "7px 10px", marginBottom: 12 }}>{notice}</p>}
      {!canDecide && (
        <div className="panel" style={{ padding: 12, marginBottom: 12, background: "var(--warning-soft)", borderColor: "color-mix(in srgb, var(--warning) 25%, var(--border))", fontSize: 12.5 }}>
          Peran Anda dapat melihat data ini tetapi tidak memiliki izin <strong>approval.decide</strong>. Administrator dapat mengubahnya di Pengaturan › Role & izin.
        </div>
      )}

      <div className="panel">
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>
          <button type="button" className={`tab ${tab === "pending" ? "active" : ""}`} style={{ borderBottom: "none", borderRadius: 7, background: tab === "pending" ? "var(--accent-soft)" : "transparent", color: tab === "pending" ? "var(--accent)" : undefined }} onClick={() => setTab("pending")}>Kotak masuk {pending.length ? `(${pending.length})` : ""}</button>
          <button type="button" className={`tab ${tab === "history" ? "active" : ""}`} style={{ borderBottom: "none", borderRadius: 7, background: tab === "history" ? "var(--accent-soft)" : "transparent", color: tab === "history" ? "var(--accent)" : undefined }} onClick={() => setTab("history")}>Riwayat</button>
        </div>

        {list.length === 0 ? (
          <div className="panel-body">
            <EmptyState
              title={tab === "pending" ? "Tidak ada yang menunggu keputusan Anda" : "Belum ada riwayat keputusan"}
              copy={tab === "pending" ? "Permintaan yang sampai ke tahap Anda akan muncul di sini dan dikirim sebagai notifikasi." : "Setelah Anda menyetujui, menolak, atau meminta revisi, riwayatnya tersimpan di sini."}
            />
          </div>
        ) : (
          <div>
            {list.map((request) => {
              const status = requestStatus(request.status);
              const current = request.steps.find((step) => step.position === request.currentStep);
              return (
                <button key={request.id} type="button" className="task-row" onClick={() => { setSelected(request); setNote(""); setError(""); }} style={{ gridTemplateColumns: "34px minmax(0,1fr) auto auto" }}>
                  <Avatar name={request.requesterName} color={request.requesterColor} size={27} personId={request.requesterId} />
                  <span style={{ minWidth: 0 }}>
                    <span className="task-title">{request.title}</span>
                    <span className="task-meta">
                      {request.requesterName} · {request.templateName ?? "Permintaan"} · {relativeTime(request.createdAt)}
                      {request.amount ? ` · ${formatIDR(request.amount)}` : ""}
                    </span>
                  </span>
                  {tab === "pending" && current && <span className="badge badge-accent">Tahap {current.position}</span>}
                  <span className={`badge ${status.tone}`}>{status.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={selected.title}>
            <div className="modal-head">
              <Avatar name={selected.requesterName} color={selected.requesterColor} size={30} personId={selected.requesterId} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>{selected.title}</h2>
                <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{selected.requesterName} · {selected.templateName} · {formatDate(selected.createdAt)}</p>
              </div>
              <span className={`badge ${requestStatus(selected.status).tone}`}>{requestStatus(selected.status).label}</span>
              <button type="button" className="icon-btn" onClick={() => setSelected(null)} aria-label="Tutup"><X size={17} /></button>
            </div>
            <div className="modal-body">
              {selected.amount ? <p style={{ margin: 0, fontSize: 22, fontWeight: 650, letterSpacing: "-0.03em" }}>{formatIDR(selected.amount)}</p> : null}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}>
                {Object.entries(selected.data).map(([key, value]) => (
                  <div key={key} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>{key}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12.5 }}>{String(value)}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ margin: "0 0 7px", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>Alur persetujuan</p>
                {selected.steps.map((step) => (
                  <div key={step.id} style={{ display: "flex", gap: 8, padding: "5px 0 5px 9px", borderLeft: `2px solid ${step.status === "approved" ? "var(--success)" : step.status === "rejected" ? "var(--danger)" : step.status === "revision" ? "var(--marker-orange)" : step.status === "pending" ? "var(--accent)" : "var(--border)"}`, marginLeft: 3 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 12.5 }}><strong>Tahap {step.position}</strong> · {step.approverName}{step.approverId === currentUserId ? " (Anda)" : ""}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{step.status === "pending" ? "Menunggu keputusan" : `${step.status} · ${step.decidedAt ? formatDate(step.decidedAt) : ""}`}{step.note ? ` — ${step.note}` : ""}</p>
                    </div>
                    <span className={`badge ${step.status === "approved" ? "badge-success" : step.status === "rejected" ? "badge-danger" : step.status === "revision" ? "badge-orange" : "badge-accent"}`}>{step.status}</span>
                  </div>
                ))}
              </div>

              {tab === "pending" && canDecide && selected.requesterId !== currentUserId && (
                <div style={{ display: "grid", gap: 8 }}>
                  <label className="field">
                    <span className="label">Catatan keputusan</span>
                    <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Wajib untuk penolakan atau permintaan revisi." style={{ minHeight: 70 }} />
                  </label>
                  {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
                </div>
              )}
              {selected.requesterId === currentUserId && <p className="help" style={{ margin: 0 }}>Anda tidak dapat menyetujui permintaan sendiri. Server akan menolak tindakan ini.</p>}
            </div>
            <div className="modal-foot">
              {tab === "pending" && canDecide && selected.requesterId !== currentUserId ? (
                <>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} disabled={pendingAction || !note.trim()} onClick={async () => void await decide("rejected")}><XCircle size={14} /> Tolak</button>
                  <button type="button" className="btn btn-outline btn-sm" disabled={pendingAction || !note.trim()} onClick={async () => void await decide("revision")}><RotateCcw size={14} /> Minta revisi</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={pendingAction} onClick={async () => void await decide("approved")}>{pendingAction ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Setujui</button>
                </>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setSelected(null)}>Tutup</button>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="help" style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
        <Clock3 size={13} /> Setiap keputusan menyimpan approver, waktu, dan catatan. Persetujuan diri sendiri selalu diblokir di server.
      </p>
      <p className="sr-only"><CheckCircle2 /> {pending.length} permintaan menunggu.</p>
    </>
  );
}
