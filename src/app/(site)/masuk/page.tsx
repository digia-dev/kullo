import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { LoginForm } from "@/components/site/AuthForms";

export const metadata: Metadata = { title: "Masuk ke Kullo", description: "Masuk ke workspace Kullo organisasi Anda." };

type SearchParams = Promise<{ next?: string; expired?: string }>;

export default async function MasukPage({ searchParams }: { searchParams: SearchParams }) {
  const { next, expired } = await searchParams;

  return (
    <section className="shell" style={{ padding: "44px 0 72px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 36, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Link href="/" className="textlink" style={{ fontSize: 13 }}>
            <ArrowLeft size={14} /> Kembali ke beranda
          </Link>
          <p className="eyebrow" style={{ margin: 0 }}>Masuk</p>
          <h1 className="market-h1" style={{ fontSize: 40, lineHeight: "46px" }}>Kembali ke pekerjaan Anda</h1>
          <p className="market-lede" style={{ margin: 0 }}>
            Satu akun untuk proyek, tugas, chat, dokumen, kalender, dan persetujuan di organisasi Anda.
          </p>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {["Tugas dan proyek tetap di tempatnya", "Notifikasi dalam aplikasi", "Izin mengikuti peran organisasi"].map((item) => (
              <p key={item} style={{ margin: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                <Check size={15} aria-hidden style={{ color: "var(--success)" }} /> {item}
              </p>
            ))}
          </div>
          <div className="panel" style={{ padding: 16, background: "var(--surface)", marginTop: 6 }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 650, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-muted)" }}>
              Akun demo
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>
              Email <strong>alya@nusantara.id</strong><br />
              Kata sandi <strong>kullo123</strong>
            </p>
            <p className="help" style={{ margin: "6px 0 0" }}>Organisasi demo: Nusantara Digital. Data contoh sudah terisi.</p>
          </div>
        </div>

        <div className="panel" style={{ padding: "28px 26px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, letterSpacing: "-0.02em" }}>Masuk ke akun</h2>
          <p className="help" style={{ margin: "0 0 18px" }}>
            {expired ? "Sesi Anda berakhir. Silakan masuk kembali." : "Gunakan email dan kata sandi yang terdaftar."}
          </p>
          <LoginForm next={next} />
        </div>
      </div>
    </section>
  );
}
