import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { RegisterForm } from "@/components/site/AuthForms";

export const metadata: Metadata = {
  title: "Buat akun dan organisasi",
  description: "Mulai Kullo gratis: buat organisasi, undang tim, dan kelola pekerjaan pertama Anda.",
};

export default function DaftarPage() {
  return (
    <section className="shell" style={{ padding: "44px 0 72px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 36, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Link href="/" className="textlink" style={{ fontSize: 13 }}>
            <ArrowLeft size={14} /> Kembali ke beranda
          </Link>
          <p className="eyebrow" style={{ margin: 0 }}>Mulai gratis</p>
          <h1 className="market-h1" style={{ fontSize: 40, lineHeight: "46px" }}>Buat workspace pertama Anda</h1>
          <p className="market-lede" style={{ margin: 0 }}>
            Satu organisasi, satu set peran, dan tiga tugas contoh. Gratis untuk lima anggota pertama.
            Tidak perlu kartu kredit.
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {[
              "Organisasi baru langsung mendapat proyek contoh",
              "Enam template permintaan siap dipakai",
              "Kanal chat umum dan notifikasi sambutan",
              "Data hanya terlihat oleh anggota organisasi",
            ].map((item) => (
              <p key={item} style={{ margin: 0, display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, lineHeight: 1.5 }}>
                <Check size={15} aria-hidden style={{ color: "var(--success)", flex: "none", marginTop: 3 }} /> {item}
              </p>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: "28px 26px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, letterSpacing: "-0.02em" }}>Buat akun</h2>
          <p className="help" style={{ margin: "0 0 18px" }}>
            Anda akan menjadi Organization Owner untuk organisasi yang dibuat.
          </p>
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
