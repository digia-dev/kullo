"use client";

import { useActionState } from "react";
import { submitSupportMessage, type ContactState } from "@/app/(site)/dukungan/actions";

const INITIAL: ContactState = { status: "idle" };

const TOPIC_OPTIONS = [
  { value: "umum", label: "Pertanyaan umum" },
  { value: "harga", label: "Paket & harga" },
  { value: "demo", label: "Permintaan demo" },
  { value: "keamanan", label: "Keamanan & privasi" },
  { value: "karier", label: "Bergabung dengan tim" },
];

export function ContactForm() {
  const [state, action, pending] = useActionState(submitSupportMessage, INITIAL);

  return (
    <form action={action} noValidate style={{ display: "grid", gap: 16 }}>
      {state.status === "ok" && (
        <div
          role="status"
          style={{
            border: "1px solid color-mix(in srgb, var(--success) 40%, var(--border))",
            background: "color-mix(in srgb, var(--success) 8%, var(--bg))",
            color: "var(--success)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 14.5,
          }}
        >
          {state.message}
        </div>
      )}
      {state.status === "error" && state.message && (
        <div
          role="alert"
          style={{
            border: "1px solid color-mix(in srgb, var(--danger) 40%, var(--border))",
            background: "color-mix(in srgb, var(--danger) 7%, var(--bg))",
            color: "var(--danger)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 14.5,
          }}
        >
          {state.message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="label">Nama</span>
          <input name="name" className="input" placeholder="cth: Alya Prameswari" autoComplete="name" aria-invalid={!!state.errors?.name} />
          {state.errors?.name && <span className="error-text">{state.errors.name}</span>}
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="label">Email</span>
          <input name="email" type="email" className="input" placeholder="cth: nama@perusahaan.id" autoComplete="email" aria-invalid={!!state.errors?.email} />
          {state.errors?.email && <span className="error-text">{state.errors.email}</span>}
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span className="label">Topik</span>
        <select name="topic" className="select" defaultValue="umum" aria-invalid={!!state.errors?.topic}>
          {TOPIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state.errors?.topic && <span className="error-text">{state.errors.topic}</span>}
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span className="label">Pesan</span>
        <textarea
          name="message"
          className="textarea"
          rows={6}
          placeholder="Ceritakan kebutuhan tim: jumlah anggota, alur kerja yang ingin dirapikan, dan target mulai."
          aria-invalid={!!state.errors?.message}
        />
        {state.errors?.message && <span className="error-text">{state.errors.message}</span>}
      </label>

      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim pesan"}
        </button>
        <span className="help" style={{ maxWidth: "46ch" }}>
          Pesan masuk ke antrean dukungan Kullo dan dibalas lewat email Anda. Kami tidak memakai pesan ini
          untuk pemasaran.
        </span>
      </div>
    </form>
  );
}
