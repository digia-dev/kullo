"use client";

import { useActionState } from "react";
import { uploadPaymentProofAction, type RequestState } from "@/lib/access-actions";

const initial: RequestState = {};

export function PaymentProofForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(uploadPaymentProofAction, initial);

  return (
    <form action={action} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="token" value={token} />
      <label className="field">
        <span className="label">Bukti pembayaran</span>
        <input className="input" type="file" name="proof" accept="image/*,.pdf" required />
        <span className="help">Unggah foto transfer atau PDF invoice yang sudah dibayar. Maksimal 8 MB.</span>
      </label>
      {state.error && (
        <p className="error-text" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="help" role="status" style={{ margin: 0, color: "var(--success)" }}>
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Mengunggah..." : "Kirim bukti pembayaran"}
      </button>
    </form>
  );
}
