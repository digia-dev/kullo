import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, CalendarDays, Mail, MessageSquare, Webhook } from "lucide-react";

export const metadata: Metadata = { title: "Integrasi" };

const ITEMS = [
  { Icon: CalendarDays, title: "Google Calendar", copy: "Sinkronisasi agenda dua arah. Belum aktif; pengembangan mengikuti fase 4.", status: "Peta jalan" },
  { Icon: MessageSquare, title: "Slack", copy: "Meneruskan notifikasi tugas ke kanal Slack. Belum aktif.", status: "Peta jalan" },
  { Icon: Mail, title: "Email transaksional", copy: "Undangan dan notifikasi lewat email. Saat ini undangan dibagikan sebagai tautan.", status: "Belum aktif" },
  { Icon: Webhook, title: "Webhook keluar", copy: "Kirim event tugas dan persetujuan ke endpoint Anda. Belum aktif.", status: "Peta jalan" },
  { Icon: Boxes, title: "S3-compatible storage", copy: "Adapter penyimpanan untuk produksi. Kode adapter lokal sudah berjalan.", status: "Siap dihubungkan" },
];

export default function IntegrationsPage() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="panel" style={{ padding: 16, background: "var(--surface)" }}>
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.65 }}>
          Integrasi eksternal belum tersedia di versi ini. Halaman ini menjelaskan status sebenarnya agar Anda tidak menghubungkan sesuatu yang belum berjalan.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>
        {ITEMS.map((item) => (
          <div key={item.title} className="panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <item.Icon size={17} style={{ color: "var(--accent)" }} />
              <strong style={{ fontSize: 13.5 }}>{item.title}</strong>
              <span className={`badge ${item.status === "Siap dihubungkan" ? "badge-success" : "badge"}`} style={{ marginLeft: "auto" }}>{item.status}</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.copy}</p>
          </div>
        ))}
      </div>
      <div className="panel" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 12.5, flex: 1, minWidth: 220 }}>Butuh integrasi tertentu untuk tim Anda? Kirim kebutuhan dan alur kerjanya ke dukungan.</p>
        <Link href="/dukungan#hubungi" className="btn btn-outline btn-sm">Hubungi tim <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}
