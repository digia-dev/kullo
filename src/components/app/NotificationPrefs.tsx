"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Save } from "lucide-react";
import { updateNotificationPrefsAction } from "@/app/(app)/actions";

const ITEMS = [
  ["task", "Tugas ditugaskan atau diperbarui", "Saat tugas baru masuk ke Anda atau statusnya berubah."],
  ["comment", "Komentar pada tugas Anda", "Balasan dan diskusi di tugas yang Anda miliki."],
  ["mention", "Anda disebut (@nama)", "Sebutan pada komentar atau pesan."],
  ["approval", "Persetujuan", "Permintaan baru atau keputusan atas pengajuan Anda."],
  ["message", "Pesan chat", "Pesan baru di kanal yang Anda ikuti."],
  ["event", "Agenda", "Undangan, perubahan waktu, dan pengingat."],
  ["document", "Dokumen", "Dokumen dibagikan atau versi baru ditambahkan."],
] as const;

export function NotificationPrefs({ initial }: { initial: Record<string, boolean> }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const [key] of ITEMS) map[key] = initial[key] ?? true;
    return map;
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="panel"
      style={{ padding: 18, display: "grid", gap: 14, maxWidth: 760 }}
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage("");
        setError("");
        const formData = new FormData();
        for (const [key, enabled] of Object.entries(prefs)) if (enabled) formData.append(`pref_${key}`, "on");
        const result = await updateNotificationPrefsAction(formData);
        setPending(false);
        if (result.ok) {
          setMessage("Preferensi notifikasi disimpan.");
          router.refresh();
        } else setError(result.error ?? "Gagal menyimpan preferensi.");
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Bell size={18} style={{ color: "var(--accent)", flex: "none", marginTop: 2 }} />
        <div>
          <h2 style={{ margin: 0, fontSize: 15 }}>Notifikasi dalam aplikasi</h2>
          <p className="help" style={{ margin: "2px 0 0" }}>Pilih peristiwa yang ingin Anda lihat di lonceng notifikasi. Preferensi ini milik akun Anda, bukan organisasi.</p>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {ITEMS.map(([key, title, copy]) => (
          <label key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 12px", cursor: "pointer", background: prefs[key] ? "var(--accent-soft)" : "var(--bg)" }}>
            <input type="checkbox" checked={prefs[key]} onChange={(event) => setPrefs((current) => ({ ...current, [key]: event.target.checked }))} style={{ marginTop: 2 }} />
            <span>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>{title}</span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)" }}>{copy}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="panel" style={{ padding: 12, background: "var(--surface)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
        Kanal email, push peramban, dan WhatsApp belum aktif pada versi ini. Kami tidak menampilkan pilihan yang tidak berjalan.
      </div>
      {message && <p className="badge badge-success" style={{ height: "auto", padding: "6px 9px", justifyContent: "flex-start" }}>{message}</p>}
      {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
      <div><button type="submit" className="btn btn-primary btn-sm" disabled={pending}>{pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan preferensi</button></div>
    </form>
  );
}
