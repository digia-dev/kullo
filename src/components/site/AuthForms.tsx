"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, KeyRound, Mail, UserRound } from "lucide-react";
import { loginAction, type AuthState } from "@/lib/auth-actions";
import {
  requestDemoAction,
  requestSignupAction,
  type RequestState,
} from "@/lib/access-actions";

const initial: AuthState = {};
const initialRequest: RequestState = {};

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
        Belum punya akun? <Link href="/daftar" className="textlink">Daftar</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ defaultPlan = "free" }: { defaultPlan?: string }) {
  const [state, action, pending] = useActionState(requestSignupAction, initialRequest);

  if (state.ok) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <p className="help" role="status" style={{ margin: 0 }}>{state.message}</p>
        {state.statusUrl ? (
          <Link href={state.statusUrl} className="btn btn-primary" style={{ justifyContent: "center" }}>
            Buka status permintaan
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14 }}>
        <label className="field">
          <span className="label">Nama lengkap</span>
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
      <div className="auth-form-row">
        <label className="field">
          <span className="label">Email kerja</span>
          <div style={{ position: "relative" }}>
            <Mail size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
            <input className="input" style={{ paddingLeft: 36 }} type="email" name="email" autoComplete="email" required placeholder="nama@perusahaan.id" />
          </div>
        </label>
        <label className="field">
          <span className="label">Nomor WhatsApp</span>
          <input className="input" name="phone" inputMode="tel" placeholder="08xx xxxx xxxx" />
        </label>
      </div>
      <div className="auth-form-row">
        <label className="field">
          <span className="label">Paket</span>
          <select className="input" name="plan" defaultValue={defaultPlan}>
            <option value="free">Gratis</option>
            <option value="pro">Pro — Rp399.000/bulan (25 anggota)</option>
            <option value="business">Bisnis — Rp1.199.000/bulan (100 anggota)</option>
          </select>
          <span className="help">Paket berbayar dikonfirmasi admin melalui invoice sebelum akses dibuka.</span>
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
        </label>
      </div>
      {state.error && (
        <p className="error-text" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Mengirim permintaan…" : "Kirim permintaan pendaftaran"} <ArrowRight size={17} />
      </button>
    </form>
  );
}

export function DemoRequestForm() {
  const [state, action, pending] = useActionState(requestDemoAction, initialRequest);

  if (state.ok) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <p className="help" role="status" style={{ margin: 0 }}>{state.message}</p>
        <Link href="/masuk" className="btn btn-secondary" style={{ justifyContent: "center" }}>
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: "grid", gap: 14 }}>
      <label className="field">
        <span className="label">Nama perusahaan</span>
        <input className="input" name="companyName" required placeholder="PT Contoh Digital" />
      </label>
      <label className="field">
        <span className="label">Nama Anda</span>
        <input className="input" name="contactName" autoComplete="name" required placeholder="Nama lengkap" />
      </label>
      <label className="field">
        <span className="label">Email</span>
        <div style={{ position: "relative" }}>
          <Mail size={16} aria-hidden style={{ position: "absolute", left: 12, top: 10, color: "var(--text-muted)" }} />
          <input className="input" style={{ paddingLeft: 36 }} type="email" name="email" autoComplete="email" required placeholder="nama@perusahaan.id" />
        </div>
      </label>
      <label className="field">
        <span className="label">Nomor WhatsApp</span>
        <input className="input" name="phone" inputMode="tel" placeholder="08xx xxxx xxxx" />
      </label>
      {state.error && (
        <p className="error-text" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Mengirim…" : "Ajukan demo"} <ArrowRight size={17} />
      </button>
      <p className="help" style={{ margin: 0, textAlign: "center" }}>
        Demo diverifikasi admin. Anda akan menerima tautan masuk setelah disetujui.
      </p>
    </form>
  );
}
