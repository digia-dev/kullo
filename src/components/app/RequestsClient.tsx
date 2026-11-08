"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, FileText, Loader2, Plus, Send, X, XCircle } from "lucide-react";
import { submitRequestAction } from "@/app/(app)/actions";
import { EmptyState } from "./ui";
import { formatDate, formatIDR, requestStatus, relativeTime } from "@/lib/utils";

type Field = { id: string; label: string; type: string; required: boolean; options: string | null };
type Template = { id: string; key: string; name: string; description: string | null; category: string; fields: Field[] };
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
  steps: Array<{ id: string; position: number; approverName: string; status: string; note: string | null; decidedAt: string | null }>;
};

function parseOptions(raw: string | null) {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function RequestsClient({
  templates,
  requests,
  currentUserId,
  openNew,
}: {
  templates: Template[];
  requests: RequestRow[];
  currentUserId: string;
  openNew: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "mine" | "pending">("all");
  const [newOpen, setNewOpen] = useState(openNew);
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const template = templates.find((row) => row.id === templateId) ?? templates[0];
  const filtered = useMemo(() => {
    if (tab === "mine") return requests.filter((request) => request.requesterId === currentUserId);
    if (tab === "pending") return requests.filter((request) => ["pending", "submitted"].includes(request.status));
    return requests;
  }, [requests, tab, currentUserId]);

  function closeNew() {
    setNewOpen(false);
    setError("");
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
        {templates.slice(0, 6).map((row) => (
          <button
            key={row.id}
            type="button"
            className="panel"
            style={{ padding: 13, textAlign: "left", cursor: "pointer" }}
            onClick={() => { setTemplateId(row.id); setNewOpen(true); }}
          >
            <FileText size={17} style={{ color: "var(--accent)" }} />
            <span style={{ display: "block", marginTop: 6, fontSize: 12.5, fontWeight: 650 }}>{row.name}</span>
            <span className="help" style={{ display: "block", marginTop: 2, fontSize: 11 }}>{row.description}</span>
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 10px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
          {([
            ["all", "Semua permintaan"],
            ["mine", "Permintaan saya"],
            ["pending", "Menunggu keputusan"],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" className={`tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)} style={{ borderBottom: "none", borderRadius: 7, background: tab === key ? "var(--accent-soft)" : "transparent", color: tab === key ? "var(--accent)" : undefined }}>{label}</button>
          ))}
          <button type="button" className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={() => setNewOpen(true)}><Plus size={14} /> Buat permintaan</button>
        </div>
        {notice && <p className="badge badge-success" style={{ margin: "8px 12px 0", height: "auto", padding: "6px 9px" }}>{notice}</p>}
        {filtered.length === 0 ? (
          <div className="panel-body">
            <EmptyState title="Belum ada permintaan" copy="Pilih salah satu template di atas untuk mengajukan cuti, reimbursement, pembelian, atau permintaan lain." action={{ label: "Buat permintaan", onClick: () => setNewOpen(true) }} />
          </div>
        ) : (
          <div>
            {filtered.map((request) => {
              const status = requestStatus(request.status);
              return (
                <button key={request.id} type="button" className="task-row" onClick={() => setSelected(request)} style={{ gridTemplateColumns: "34px minmax(0,1fr) auto" }}>
                  <span className={`task-check ${request.status === "approved" ? "done" : ""}`}>
                    {request.status === "approved" ? <CheckCircle2 size={15} /> : request.status === "rejected" ? <XCircle size={14} /> : <Clock3 size={13} />}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="task-title">{request.title}</span>
                    <span className="task-meta">
                      {request.templateName ?? "Permintaan"} · {request.requesterName} · {relativeTime(request.createdAt)}
                      {request.amount ? ` · ${formatIDR(request.amount)}` : ""}
                    </span>
                  </span>
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>{selected.title}</h2>
                <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{selected.templateName} · {selected.requesterName} · {formatDate(selected.createdAt)}</p>
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
                  <div key={step.id} style={{ display: "flex", gap: 8, padding: "5px 0", borderLeft: `2px solid ${step.status === "approved" ? "var(--success)" : step.status === "rejected" ? "var(--danger)" : step.status === "pending" ? "var(--accent)" : "var(--border)"}`, paddingLeft: 9, marginLeft: 3 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 12.5 }}><strong>Tahap {step.position}</strong> · {step.approverName}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{step.status === "pending" ? "Menunggu keputusan" : `${step.status} · ${step.decidedAt ? formatDate(step.decidedAt) : ""}`}{step.note ? ` — ${step.note}` : ""}</p>
                    </div>
                    <span className={`badge ${step.status === "approved" ? "badge-success" : step.status === "rejected" ? "badge-danger" : step.status === "revision" ? "badge-warning" : "badge-accent"}`}>{step.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setSelected(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {newOpen && template && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeNew(); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Buat permintaan">
            <div className="modal-head">
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><FileText size={16} /></span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Buat permintaan</h2>
              <button type="button" className="icon-btn" onClick={closeNew} aria-label="Tutup" style={{ marginLeft: "auto" }}><X size={17} /></button>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setPending(true);
                setError("");
                const formData = new FormData(event.currentTarget);
                const result = await submitRequestAction(formData);
                setPending(false);
                if (result.ok) {
                  closeNew();
                  setNotice("Permintaan terkirim dan approver sudah dinotifikasi.");
                  setTab("mine");
                  router.refresh();
                } else setError(result.error ?? "Permintaan gagal dikirim.");
              }}
            >
              <div className="modal-body">
                {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
                <label className="field">
                  <span className="label">Jenis permintaan</span>
                  <select className="select" name="templateId" value={template.id} onChange={(event) => setTemplateId(event.target.value)} required>
                    {templates.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                  </select>
                  <span className="help">{template.description}</span>
                </label>
                <label className="field">
                  <span className="label">Judul permintaan</span>
                  <input className="input" name="title" required minLength={3} placeholder={`Contoh: ${template.name} untuk November`} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
                  {template.fields.map((field) => {
                    const options = parseOptions(field.options);
                    const required = field.required;
                    return (
                      <label key={field.id} className="field" style={{ gridColumn: field.type === "textarea" ? "1 / -1" : undefined }}>
                        <span className="label">{field.label}{required ? " *" : ""}</span>
                        {field.type === "textarea" ? (
                          <textarea className="textarea" name={`field_${field.id}`} required={required} />
                        ) : field.type === "select" ? (
                          <select className="select" name={`field_${field.id}`} required={required}>
                            <option value="">Pilih…</option>
                            {options.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          <input className="input" type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} name={`field_${field.id}`} required={required} />
                        )}
                      </label>
                    );
                  })}
                </div>
                <div className="panel" style={{ padding: 10, background: "var(--surface)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.55 }}>
                  Permintaan dikirim ke atasan langsung Anda. Bila nominal Rp1.000.000 atau lebih, tahap kedua diteruskan ke manajer lain. Anda tidak dapat menyetujui permintaan sendiri.
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={closeNew}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Kirim permintaan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
