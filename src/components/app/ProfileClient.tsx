"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, KeyRound, Loader2, Save, Trash2, UserRound } from "lucide-react";
import { Avatar } from "./ui";
import { toast } from "./Toaster";
import { changePasswordAction, removeAvatarAction, updateAvatarAction, updateProfileAction } from "@/app/(app)/actions";

async function compressToJpeg(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Pilih file gambar (JPG, PNG, atau WebP).");
  const bitmap = await createImageBitmap(file);
  const max = 512;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Peramban tidak mendukung pemrosesan gambar.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let quality = 0.9;
  let blob: Blob | null = null;
  for (let attempt = 0; attempt < 9; attempt += 1) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= 200 * 1024) break;
    quality -= 0.1;
  }
  if (!blob) throw new Error("Gagal mengompresi gambar.");
  if (blob.size > 200 * 1024) throw new Error("Gambar masih melebihi 200 KB. Coba gambar lain.");
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

export function ProfileClient({
  user,
  role,
  departmentName,
  initialHasAvatar,
}: {
  user: { id: string; name: string; email: string; title: string | null; phone: string | null; avatarColor: string; avatarKey: string | null; createdAt: string };
  role: string;
  departmentName: string | null;
  initialHasAvatar: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pwPending, setPwPending] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");
  const [hasAvatar, setHasAvatar] = useState(initialHasAvatar);
  const [avatarVersion, setAvatarVersion] = useState<string | null>(user.avatarKey);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");

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
              toast("Profil disimpan");
              router.refresh();
            } else setError(result.error ?? "Gagal menyimpan profil.");
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 15 }}>Profil pribadi</h2>
            <p className="help" style={{ margin: "2px 0 0" }}>Nama dan jabatan tampil pada tugas, komentar, dan direktori tim.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
            <Avatar name={user.name} color={user.avatarColor} size={44} personId={user.id} version={avatarVersion} />
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
              toast("Kata sandi diperbarui");
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
          <h2 style={{ margin: 0, fontSize: 15 }}>Foto profil</h2>
          <p className="help" style={{ margin: "2px 0 10px" }}>
            Foto dipakai di header, sidebar, komentar, chat, dan direktori tim. Gambar dikompres otomatis hingga maksimal 200 KB.
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 10 }}>
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Pratinjau foto profil" style={{ width: 64, height: 64, borderRadius: 999, objectFit: "cover" }} />
            ) : (
              <Avatar name={user.name} color={user.avatarColor} size={64} personId={user.id} version={avatarVersion} />
            )}
            <div style={{ display: "grid", gap: 6 }}>
              <label className="btn btn-outline btn-sm" style={{ cursor: "pointer" }}>
                <Camera size={14} /> Pilih foto
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    setAvatarBusy(true);
                    setAvatarError("");
                    setAvatarMessage("");
                    try {
                      const compressed = await compressToJpeg(file);
                      setAvatarFile(compressed);
                      setAvatarPreview(URL.createObjectURL(compressed));
                    } catch (failure) {
                      setAvatarError(failure instanceof Error ? failure.message : "Gagal memproses gambar.");
                    } finally {
                      setAvatarBusy(false);
                    }
                  }}
                />
              </label>
              <span className="help">
                {avatarFile ? `${Math.round(avatarFile.size / 1024)} KB · siap disimpan` : "JPG, PNG, atau WebP"}
              </span>
            </div>
          </div>
          {avatarMessage && <p className="badge badge-success" style={{ height: "auto", padding: "6px 9px", justifyContent: "flex-start" }}>{avatarMessage}</p>}
          {avatarError && <p className="error-text" style={{ margin: "0 0 6px" }} role="alert">{avatarError}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!avatarFile || avatarBusy}
              onClick={async () => {
                if (!avatarFile) return;
                setAvatarBusy(true);
                setAvatarError("");
                setAvatarMessage("");
                const formData = new FormData();
                formData.set("file", avatarFile);
                const result = await updateAvatarAction(formData);
                setAvatarBusy(false);
                if (!result.ok) {
                  setAvatarError(result.error ?? "Gagal menyimpan foto.");
                  return;
                }
                setHasAvatar(true);
                setAvatarFile(null);
                setAvatarPreview(null);
                setAvatarVersion(`upload-${Date.now()}`);
                setAvatarMessage("Foto profil diperbarui.");
                toast("Foto profil diperbarui");
                router.refresh();
              }}
            >
              {avatarBusy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan foto
            </button>
            {hasAvatar && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={avatarBusy}
                onClick={async () => {
                  setAvatarBusy(true);
                  setAvatarError("");
                  const result = await removeAvatarAction();
                  setAvatarBusy(false);
                  if (!result.ok) {
                    setAvatarError(result.error ?? "Gagal menghapus foto.");
                    return;
                  }
                  setHasAvatar(false);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  setAvatarVersion(null);
                  setAvatarMessage("Foto profil dihapus.");
                  toast("Foto profil dihapus", "info");
                  router.refresh();
                }}
              >
                <Trash2 size={14} /> Hapus foto
              </button>
            )}
          </div>
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
