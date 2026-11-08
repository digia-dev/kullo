"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Moon, Save, Sun, UserRound } from "lucide-react";
import { Avatar } from "./ui";
import { changePasswordAction, updateProfileAction } from "@/app/(app)/actions";

export function ProfileClient({
  user,
  role,
  departmentName,
}: {
  user: { name: string; email: string; title: string | null; phone: string | null; avatarColor: string; createdAt: string };
  role: string;
  departmentName: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [pwPending, setPwPending] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("kullo:theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("kullo:theme", next ? "dark" : "light");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(280px,.8fr)", gap: 16, alignItems: "start" }} className="dash-grid">
      <div style={{ display: "grid", gap: 16 }}>
        <form
          className="panel"
          style={{ padding: 18, display: "grid", gap: 13 }}
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setMessage("");
            setError("");
            const result = await updateProfileAction(new FormData(event.currentTarget));
            setPending(false);
            if (result.ok) {
              setMessage("Profil disimpan.");
              router.refresh();
            } else setError(result.error ?? "Gagal menyimpan profil.");
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 15 }}>Profil pribadi</h2>
            <p className="help" style={{ margin: "2px 0 0" }}>Nama dan jabatan tampil pada tugas, komentar, dan direktori tim.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
            <Avatar name={user.name} color={user.avatarColor} size={44} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{user.email}</p>
              <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{role} · {departmentName ?? "Tanpa departemen"}</p>
            </div>
          </div>
          <label className="field"><span className="label">Nama lengkap</span><input className="input" name="name" defaultValue={user.name} required minLength={2} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <label className="field"><span className="label">Jabatan</span><input className="input" name="title" defaultValue={user.title ?? ""} /></label>
            <label className="field"><span className="label">Nomor telepon</span><input className="input" name="phone" defaultValue={user.phone ?? ""} placeholder="08xx-xxxx-xxxx" /></label>
          </div>
          {message && <p className="badge badge-success" style={{ height: "auto", padding: "6px 9px", justifyContent: "flex-start" }}>{message}</p>}
          {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
          <div><button type="submit" className="btn btn-primary btn-sm" disabled={pending}><Save size={14} /> {pending ? "Menyimpan…" : "Simpan profil"}</button></div>
        </form>

        <form
          className="panel"
          style={{ padding: 18, display: "grid", gap: 12 }}
          onSubmit={async (event) => {
            event.preventDefault();
            setPwPending(true);
            setPwMessage("");
            setPwError("");
            const data = new FormData(event.currentTarget);
            const current = String(data.get("current") ?? "");
            const next = String(data.get("next") ?? "");
            const confirm = String(data.get("confirm") ?? "");
            if (next !== confirm) {
              setPwPending(false);
              setPwError("Konfirmasi kata sandi tidak cocok.");
              return;
            }
            const result = await changePasswordAction(current, next);
            setPwPending(false);
            if (result.ok) {
              setPwMessage("Kata sandi diperbarui. Sesi lain tetap berlaku sampai kedaluwarsa.");
              event.currentTarget.reset();
            } else setPwError(result.error ?? "Gagal mengubah kata sandi.");
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 15 }}>Keamanan akun</h2>
            <p className="help" style={{ margin: "2px 0 0" }}>Kata sandi disimpan sebagai hash scrypt dengan garam unik.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            <label className="field"><span className="label">Kata sandi saat ini</span><input className="input" type="password" name="current" required autoComplete="current-password" /></label>
            <label className="field"><span className="label">Kata sandi baru</span><input className="input" type="password" name="next" required minLength={8} autoComplete="new-password" /></label>
            <label className="field"><span className="label">Ulangi kata sandi baru</span><input className="input" type="password" name="confirm" required minLength={8} autoComplete="new-password" /></label>
          </div>
          {pwMessage && <p className="badge badge-success" style={{ height: "auto", padding: "6px 9px", justifyContent: "flex-start" }}>{pwMessage}</p>}
          {pwError && <p className="error-text" style={{ margin: 0 }} role="alert">{pwError}</p>}
          <div><button type="submit" className="btn btn-outline btn-sm" disabled={pwPending}>{pwPending ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />} Ubah kata sandi</button></div>
        </form>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <section className="panel" style={{ padding: 18 }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>Tampilan</h2>
          <p className="help" style={{ margin: "2px 0 10px" }}>Mode gelap diterapkan di peramban ini dan tidak mengubah data organisasi.</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={toggleTheme} aria-pressed={dark}>
            {dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? "Gunakan mode terang" : "Gunakan mode gelap"}
          </button>
        </section>
        <section className="panel" style={{ padding: 18 }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>Ringkasan akun</h2>
          <div style={{ display: "grid", gap: 7, marginTop: 9, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-muted)" }}>Peran</span><strong>{role}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-muted)" }}>Departemen</span><strong>{departmentName ?? "—"}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-muted)" }}>Email</span><strong style={{ maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</strong></div>
          </div>
        </section>
        <div className="panel" style={{ padding: 16, background: "var(--surface)", display: "flex", gap: 8 }}>
          <UserRound size={17} style={{ color: "var(--accent)", flex: "none" }} />
          <p className="help" style={{ margin: 0 }}>Informasi sensitif seperti nomor telepon hanya terlihat oleh peran yang diizinkan di direktori tim.</p>
        </div>
      </div>
    </div>
  );
}
