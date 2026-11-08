"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Lock, Save, ShieldCheck } from "lucide-react";
import { updateRolePermissionsAction } from "@/app/(app)/actions";
import { PERMISSIONS, PERMISSION_LABELS, ROLE_LABELS } from "@/lib/permissions";

type Role = { id: string; key: string; name: string; permissions: string };

export function RolesMatrix({ roles, canManage }: { roles: Role[]; canManage: boolean }) {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState(roles.find((role) => role.key !== "owner")?.key ?? roles[0]?.key ?? "owner");
  const parsed = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const role of roles) {
      try {
        map.set(role.key, JSON.parse(role.permissions) as string[]);
      } catch {
        map.set(role.key, []);
      }
    }
    return map;
  }, [roles]);
  const [selected, setSelected] = useState<string[]>(() => parsed.get(activeKey) ?? []);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function pick(key: string) {
    setActiveKey(key);
    setSelected(parsed.get(key) ?? []);
    setMessage("");
    setError("");
  }

  const role = roles.find((row) => row.key === activeKey);
  const isOwner = activeKey === "owner";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="tab-row">
        {roles.map((row) => (
          <button key={row.key} type="button" className={`tab ${activeKey === row.key ? "active" : ""}`} onClick={() => pick(row.key)}>
            {ROLE_LABELS[row.key] ?? row.name}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <ShieldCheck size={16} style={{ color: "var(--accent)" }} />
          <h2 className="panel-title">{role ? ROLE_LABELS[role.key] ?? role.name : "Peran"}</h2>
          <span className="badge">{selected.length}/{PERMISSIONS.length} izin</span>
          <span className="help" style={{ marginLeft: "auto" }}>Diperiksa di server pada setiap aksi</span>
        </div>
        <div className="panel-body">
          {isOwner ? (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "var(--surface)", padding: 12, borderRadius: 8 }}>
              <Lock size={16} style={{ color: "var(--text-muted)", flex: "none", marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Organization Owner selalu memiliki seluruh izin. Izin owner tidak dapat dikurangi agar organisasi tidak terkunci tanpa admin.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 8 }}>
                {PERMISSIONS.map((permission) => {
                  const checked = selected.includes(permission);
                  return (
                    <label
                      key={permission}
                      style={{ display: "flex", gap: 8, alignItems: "flex-start", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 12, cursor: canManage ? "pointer" : "default", background: checked ? "var(--accent-soft)" : "var(--bg)" }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!canManage}
                        onChange={(event) => setSelected((current) => event.target.checked ? Array.from(new Set([...current, permission])) : current.filter((item) => item !== permission))}
                        style={{ marginTop: 2 }}
                      />
                      <span>
                        <span style={{ display: "block", fontWeight: 550 }}>{PERMISSION_LABELS[permission]}</span>
                        <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{permission}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {message && <p className="badge badge-success" style={{ height: "auto", padding: "6px 9px", marginTop: 12 }}>{message}</p>}
              {error && <p className="error-text" style={{ marginTop: 12 }} role="alert">{error}</p>}
              {canManage && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={pending}
                    onClick={async () => {
                      setPending(true);
                      setMessage("");
                      setError("");
                      const formData = new FormData();
                      formData.set("roleKey", activeKey);
                      for (const permission of selected) formData.append("permissions", permission);
                      const result = await updateRolePermissionsAction(formData);
                      setPending(false);
                      if (result.ok) {
                        setMessage("Matriks izin disimpan.");
                        parsed.set(activeKey, selected);
                        router.refresh();
                      } else setError(result.error ?? "Gagal menyimpan izin.");
                    }}
                  >
                    {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan izin
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(parsed.get(activeKey) ?? [])}>Kembalikan</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="panel" style={{ padding: 14, display: "flex", gap: 9, background: "var(--surface)" }}>
        <KeyRound size={16} style={{ color: "var(--warning)", flex: "none" }} />
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.65 }}>
          Menyembunyikan tombol bukan pengamanan. Setiap server action membaca peran dari basis data dan menolak aksi tanpa izin, termasuk permintaan lintas organisasi.
        </p>
      </div>
    </div>
  );
}
