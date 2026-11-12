"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Mail, UserPlus, UserX } from "lucide-react";
import { Avatar } from "./ui";
import { inviteMemberAction, setMemberStatusAction, updateMemberRoleAction } from "@/app/(app)/actions";
import { ROLE_LABELS } from "@/lib/permissions";
import { RoleBadge } from "./ui";
import { formatDate } from "@/lib/utils";

type Member = {
  id: string;
  membershipId: string;
  name: string;
  email: string;
  title: string | null;
  avatarColor: string;
  role: string;
  status: string;
  departmentId: string | null;
  departmentName: string | null;
  joinedAt: string;
};

const ROLES = ["admin", "manager", "leader", "staff", "guest"];

export function MembersManager({
  members,
  departments,
  canManage,
  currentUserId,
}: {
  members: Member[];
  departments: Array<{ id: string; name: string }>;
  canManage: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [edits, setEdits] = useState<Record<string, { role: string; departmentId: string }>>({});
  const [memberQuery, setMemberQuery] = useState("");

  const visibleMembers = members.filter((member) => {
    const query = memberQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      (member.title ?? "").toLowerCase().includes(query)
    );
  });

  function editOf(member: Member) {
    return edits[member.membershipId] ?? { role: member.role, departmentId: member.departmentId ?? "" };
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {canManage && (
        <form
          className="panel"
          style={{ padding: 18, display: "grid", gap: 12 }}
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError("");
            setNotice("");
            setInviteLink("");
            const result = await inviteMemberAction(new FormData(event.currentTarget));
            setPending(false);
            if (result.ok && result.token) {
              setNotice(result.message ?? "Undangan dibuat.");
              setInviteLink(`${window.location.origin}/gabung?token=${encodeURIComponent(result.token)}`);
              (event.target as HTMLFormElement).reset();
              router.refresh();
            } else setError(result.error ?? "Gagal mengundang anggota.");
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserPlus size={17} style={{ color: "var(--accent)" }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 15 }}>Undang anggota</h2>
              <p className="help" style={{ margin: "2px 0 0" }}>Tautan undangan sekali pakai berlaku 7 hari. Kirim lewat kanal tepercaya.</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(140px,.6fr) minmax(140px,.6fr) auto", gap: 10, alignItems: "end" }} className="form-row">
            <label className="field"><span className="label">Email</span><input className="input" name="email" type="email" required placeholder="nama@perusahaan.id" /></label>
            <label className="field">
              <span className="label">Peran</span>
              <select className="select" name="role" defaultValue="staff">{ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select>
            </label>
            <label className="field">
              <span className="label">Departemen</span>
              <select className="select" name="departmentId" defaultValue="">
                <option value="">Tanpa departemen</option>
                {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </select>
            </label>
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} Undang</button>
          </div>
          {notice && <p className="badge badge-success" style={{ height: "auto", padding: "6px 9px", justifyContent: "flex-start" }}>{notice}</p>}
          {inviteLink && (
            <div className="panel" style={{ padding: 10, background: "var(--surface)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ fontSize: 11, wordBreak: "break-all", flex: 1, minWidth: 200 }}>{inviteLink}</code>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(inviteLink);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  } catch {
                    setError("Peramban menolak akses clipboard. Salin tautan secara manual.");
                  }
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          )}
          {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
        </form>
      )}

      <section className="panel">
        <div className="panel-head"><h2 className="panel-title">Anggota organisasi</h2><span className="badge">{members.length}</span></div>
        <div style={{ padding: "0 14px 10px" }}>
          <input
            className="input"
            type="search"
            value={memberQuery}
            onChange={(event) => setMemberQuery(event.target.value)}
            placeholder="Cari nama, email, atau jabatan…"
            aria-label="Cari anggota"
          />
        </div>
        <div className="app-table-wrap">
          <table className="table members-table">
            <thead><tr><th>Anggota</th><th>Peran</th><th>Departemen</th><th>Status</th><th>Bergabung</th><th /></tr></thead>
            <tbody>
              {visibleMembers.length === 0 ? (
                <tr><td colSpan={6} className="help">Tidak ada anggota yang cocok.</td></tr>
              ) : null}
              {visibleMembers.map((member) => {
                const edit = editOf(member);
                const isSelf = member.id === currentUserId;
                const isOwner = member.role === "owner";
                return (
                  <tr key={member.membershipId}>
                    <td data-label="Anggota">
                      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <Avatar name={member.name} color={member.avatarColor} size={28} personId={member.id} />
                        <span>
                          <span style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>{member.name}{isSelf ? " (Anda)" : ""}</span>
                          <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)" }}>{member.email} · {member.title ?? "Anggota"}</span>
                        </span>
                      </span>
                    </td>
                    <td data-label="Peran">
                      {canManage && !isOwner && !isSelf ? (
                        <select className="select" style={{ height: 30, fontSize: 11.5, width: 150 }} value={edit.role} onChange={(event) => setEdits((current) => ({ ...current, [member.membershipId]: { ...edit, role: event.target.value } }))}>
                          {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                        </select>
                      ) : (
                        <RoleBadge role={member.role} label={ROLE_LABELS[member.role] ?? member.role} />
                      )}
                    </td>
                    <td data-label="Departemen">
                      {canManage && !isOwner && !isSelf ? (
                        <select className="select" style={{ height: 30, fontSize: 11.5, width: 145 }} value={edit.departmentId} onChange={(event) => setEdits((current) => ({ ...current, [member.membershipId]: { ...edit, departmentId: event.target.value } }))}>
                          <option value="">Tanpa departemen</option>
                          {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: 11.5 }}>{member.departmentName ?? "—"}</span>
                      )}
                    </td>
<td data-label="Status"><span className={`badge ${member.status === "active" ? "badge-success" : member.status === "invited" ? "badge-warning" : "badge"}`}>{member.status}</span></td>
<td data-label="Bergabung" style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(member.joinedAt)}</td>
                    <td data-label="Aksi">
                      {canManage && !isOwner && !isSelf && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={async () => {
                              setPending(true);
                              const result = await updateMemberRoleAction(member.membershipId, edit.role, edit.departmentId || null);
                              setPending(false);
                              if (result.ok) {
                                setNotice(`${member.name}: peran diperbarui.`);
                                router.refresh();
                              } else setError(result.error ?? "Gagal memperbarui peran.");
                            }}
                            disabled={pending || (edit.role === member.role && edit.departmentId === (member.departmentId ?? ""))}
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title={member.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                            aria-label={member.status === "active" ? `Nonaktifkan ${member.name}` : `Aktifkan ${member.name}`}
                            onClick={async () => {
                              const result = await setMemberStatusAction(member.membershipId, member.status === "active" ? "disabled" : "active");
                              if (result.ok) router.refresh();
                              else setError(result.error ?? "Gagal mengubah status.");
                            }}
                          >
                            <UserX size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {notice && <p className="badge badge-success" style={{ height: "auto", padding: "7px 10px" }}>{notice}</p>}
      {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
    </div>
  );
}
