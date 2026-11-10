"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, KeyRound, UserRound } from "lucide-react";
import { acceptInviteAction, type InviteState } from "@/lib/invite-actions";

const initial: InviteState = {};

export function InviteAcceptForm({ token, isNew, email }: { token: string; isNew: boolean; email: string }) {
  const [state, action, pending] = useActionState(acceptInviteAction, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 13 }}>
      <input type="hidden" name="token" value={token} />
      <div className="panel" style={{ padding: 10, background: "var(--surface)", fontSize: 12 }}>
        <strong>{email}</strong>
        <p className="help" style={{ margin: "2px 0 0" }}>{isNew ? "Akun baru dibuat oleh administrator. Tentukan nama dan kata sandi Anda." : "Email ini sudah memiliki akun Kullo. Masukkan kata sandi akun Anda untuk bergabung."}</p>
      </div>
      {isNew && (
        <label className="field">
          <span className="label">Nama lengkap</span>
          <div style={{ position: "relative" }}>
            <UserRound size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
            <input className="input" style={{ paddingLeft: 36 }} name="name" required minLength={2} autoComplete="name" placeholder="Nama lengkap" />
          </div>
        </label>
      )}
      <label className="field">
        <span className="label">{isNew ? "Kata sandi baru" : "Kata sandi akun"}</span>
        <div style={{ position: "relative" }}>
          <KeyRound size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            type="password"
            name={isNew ? "password" : "currentPassword"}
            required
            minLength={isNew ? 8 : 1}
            autoComplete={isNew ? "new-password" : "current-password"}
            placeholder={isNew ? "Minimal 8 karakter" : "Kata sandi Anda"}
          />
        </div>
      </label>
      {state.error && <p className="error-text" role="alert" style={{ margin: 0 }}>{state.error}</p>}
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Bergabungâ€¦" : "Bergabung ke organisasi"} <ArrowRight size={16} />
      </button>
      <p className="help" style={{ margin: 0, textAlign: "center" }}>
        Sudah masuk? <Link href="/app/dashboard" className="textlink">Buka ruang kerja</Link>
      </p>
    </form>
  );
}
