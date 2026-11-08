import Link from "next/link";
import { KulloLogo } from "@/components/site/KulloMark";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "48px 20px" }}>
      <div style={{ maxWidth: 620, textAlign: "center", display: "grid", gap: 14, justifyItems: "center" }}>
        <KulloLogo size={34} wordSize={22} />
        <p className="eyebrow" style={{ margin: 0 }}>404</p>
        <h1 className="market-h1" style={{ fontSize: 40, lineHeight: "46px" }}>Halaman ini tidak ada di workspace</h1>
        <p className="market-lede" style={{ margin: 0 }}>
          Alamatnya mungkin sudah berubah, atau tautannya salah ketik. Anda bisa kembali ke beranda atau langsung
          membuka aplikasi.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          <Link href="/" className="btn btn-primary">Kembali ke beranda</Link>
          <Link href="/app/dashboard" className="btn btn-outline">Buka aplikasi</Link>
        </div>
      </div>
    </div>
  );
}
