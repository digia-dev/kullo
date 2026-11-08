"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Square } from "lucide-react";
import { addMilestoneAction, toggleMilestoneAction } from "@/app/(app)/actions";
import { formatDate } from "@/lib/utils";

export function MilestoneList({
  projectId,
  milestones,
  canEdit,
}: {
  projectId: string;
  milestones: Array<{ id: string; name: string; dueDate: string | null; done: boolean }>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {milestones.length === 0 ? (
        <p className="help" style={{ margin: 0 }}>Belum ada milestone.</p>
      ) : (
        milestones.map((milestone) => (
          <div key={milestone.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <button
              type="button"
              style={{ border: 0, background: "none", padding: 0, cursor: canEdit ? "pointer" : "default", display: "flex", gap: 7, alignItems: "flex-start", textAlign: "left" }}
              disabled={!canEdit || pending}
              onClick={async () => {
                setPending(true);
                await toggleMilestoneAction(milestone.id, !milestone.done);
                setPending(false);
                router.refresh();
              }}
              aria-label={milestone.done ? `Buka ${milestone.name}` : `Selesaikan ${milestone.name}`}
            >
              {milestone.done ? <CheckSquare size={16} style={{ color: "var(--success)", flex: "none", marginTop: 1 }} /> : <Square size={16} style={{ color: "var(--text-muted)", flex: "none", marginTop: 1 }} />}
              <span>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 550, textDecoration: milestone.done ? "line-through" : "none", color: milestone.done ? "var(--text-muted)" : "var(--text)" }}>{milestone.name}</span>
                <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)" }}>{milestone.dueDate ? formatDate(milestone.dueDate) : "Tanpa tanggal"}</span>
              </span>
            </button>
          </div>
        ))
      )}
      {canEdit && (
        <form
          style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}
          onSubmit={async (event) => {
            event.preventDefault();
            if (!name.trim()) return;
            setPending(true);
            const result = await addMilestoneAction(projectId, name, dueDate);
            setPending(false);
            if (result.ok) {
              setName("");
              setDueDate("");
              setError("");
              router.refresh();
            } else setError(result.error ?? "Gagal menambah milestone.");
          }}
        >
          <input className="input" placeholder="Milestone baru…" value={name} onChange={(event) => setName(event.target.value)} style={{ flex: "1 1 140px", height: 32, fontSize: 12 }} />
          <input className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} style={{ width: 130, height: 32, fontSize: 12 }} />
          <button type="submit" className="btn btn-outline btn-sm" disabled={pending}>Tambah</button>
          {error && <p className="error-text" style={{ margin: 0, width: "100%" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
