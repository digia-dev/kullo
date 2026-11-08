"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, KeyRound, Mail, UserRound } from "lucide-react";
import { loginAction, registerAction, type AuthState } from "@/app/(site)/auth-actions";

const initial: AuthState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} style={{ display: "grid", gap: 14 }}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="field">
        <span className="label">Email</span>
        <div style={{ position: "relative" }}>
          <Mail size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="nama@perusahaan.id"
          />
        </div>
      </label>
      <label className="field">
        <span className="label">Kata sandi</span>
        <div style={{ position: "relative" }}>
          <KeyRound size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Kata sandi Anda"
          />
        </div>
      </label>
      {state.error && (
        <p className="error-text" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Memeriksa…" : "Masuk"} <ArrowRight size={17} />
      </button>
      <p className="help" style={{ margin: 0, textAlign: "center" }}>
        Belum punya akun? <Link href="/daftar" className="textlink">Buat organisasi gratis</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <form action={action} style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14 }}>
        <label className="field">
          <span className="label">Nama Anda</span>
          <div style={{ position: "relative" }}>
            <UserRound size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
            <input className="input" style={{ paddingLeft: 36 }} name="name" autoComplete="name" required placeholder="Nama lengkap" />
          </div>
        </label>
        <label className="field">
          <span className="label">Nama organisasi</span>
          <input className="input" name="orgName" autoComplete="organization" required placeholder="PT Contoh Digital" />
        </label>
      </div>
      <label className="field">
        <span className="label">Email kerja</span>
        <div style={{ position: "relative" }}>
          <Mail size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
          <input className="input" style={{ paddingLeft: 36 }} type="email" name="email" autoComplete="email" required placeholder="nama@perusahaan.id" />
        </div>
      </label>
      <label className="field">
        <span className="label">Kata sandi</span>
        <div style={{ position: "relative" }}>
          <KeyRound size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
          />
        </div>
        <span className="help">Minimal 8 karakter. Gunakan kombinasi yang tidak dipakai di layanan lain.</span>
      </label>
      {state.error && (
        <p className="error-text" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Membuat organisasi…" : "Buat akun dan organisasi"} <ArrowRight size={17} />
      </button>
      <p className="help" style={{ margin: 0, textAlign: "center" }}>
        Sudah punya akun? <Link href="/masuk" className="textlink">Masuk</Link>
      </p>
      <p className="help" style={{ margin: 0, textAlign: "center" }}>
        Dengan mendaftar, Anda menyetujui{" "}
        <Link href="/ketentuan" className="textlink">ketentuan penggunaan</Link> dan{" "}
        <Link href="/privasi" className="textlink">kebijakan privasi</Link>.
      </p>
    </form>
  );
}
