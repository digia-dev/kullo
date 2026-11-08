"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Save, ShieldCheck } from "lucide-react";
import { updateOrganizationAction } from "@/app/(app)/actions";

const ZONES = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore"];

export function OrganizationForm({
  org,
  canManage,
  plan,
}: {
  org: { name: string; slug: string; address: string | null; timezone: string; workStart: string; workEnd: string };
  canManage: boolean;
  plan: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(280px,.75fr)", gap: 16, alignItems: "start" }} className="dash-grid">
      <form
        className="panel"
        style={{ padding: 18, display: "grid", gap: 13 }}
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setMessage("");
          setError("");
          const result = await updateOrganizationAction(new FormData(event.currentTarget));
          setPending(false);
          if (result.ok) {
            setMessage("Pengaturan organisasi disimpan.");
            router.refresh();
          } else setError(result.error ?? "Gagal menyimpan.");
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 15 }}>Profil organisasi</h2>
          <p className="help" style={{ margin: "2px 0 0" }}>Nama organisasi tampil di sidebar dan seluruh halaman aplikasi.</p>
        </div>
        <label className="field"><span className="label">Nama organisasi</span><input className="input" name="name" defaultValue={org.name} required minLength={2} disabled={!canManage} /></label>
        <label className="field"><span className="label">Alamat</span><textarea className="textarea" name="address" defaultValue={org.address ?? ""} disabled={!canManage} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          <label className="field">
            <span className="label">Zona waktu</span>
            <select className="select" name="timezone" defaultValue={org.timezone} disabled={!canManage}>
              {ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
          </label>
          <label className="field"><span className="label">Jam mulai kerja</span><input className="input" type="time" name="workStart" defaultValue={org.workStart} disabled={!canManage} /></label>
          <label className="field"><span className="label">Jam selesai kerja</span><input className="input" type="time" name="workEnd" defaultValue={org.workEnd} disabled={!canManage} /></label>
        </div>
        {message && <p className="badge badge-success" style={{ height: "auto", padding: "6px 9px", justifyContent: "flex-start" }}>{message}</p>}
        {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
        {canManage ? (
          <div><button type="submit" className="btn btn-primary btn-sm" disabled={pending}>{pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan</button></div>
        ) : (
          <p className="help" style={{ margin: 0 }}>Hanya owner dan administrator yang dapat mengubah profil organisasi.</p>
        )}
      </form>

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" style={{ padding: 18 }}>
          <Building2 size={18} style={{ color: "var(--accent)" }} />
          <h2 style={{ margin: "8px 0 4px", fontSize: 15 }}>Identitas workspace</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Slug: <code>{org.slug}</code></p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Paket: <strong style={{ color: "var(--text)" }}>{plan}</strong></p>
        </section>
        <section className="panel" style={{ padding: 18 }}>
          <ShieldCheck size={18} style={{ color: "var(--success)" }} />
          <h2 style={{ margin: "8px 0 4px", fontSize: 15 }}>Isolasi data</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Setiap query produk memakai organisasi dari sesi. Anggota organisasi lain tidak dapat membaca data ini meski mengetahui ID baris.
          </p>
        </section>
      </div>
    </div>
  );
}
