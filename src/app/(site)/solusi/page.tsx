import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { CardArt } from "@/components/site/CardArt";
import { SOLUTIONS } from "@/content/site";
import { MODULES } from "@/content/modules";

export const metadata: Metadata = {
  title: "Solusi per peran dan jenis tim",
  description:
    "Kullo untuk manajer, tim proyek, operasional, kepemimpinan, staf, dan kolaborator eksternal. Satu ruang kerja dengan izin yang berbeda.",
};

const ART = ["report", "board", "approvals", "report", "board", "chat"] as const;

export default function SolusiPage() {
  return (
    <>
      <PageHero
        eyebrow="Solusi"
        title="Pekerjaan yang sama, tampilan berbeda untuk tiap peran"
        lede="Kullo tidak membuat enam aplikasi berbeda. Ia menampilkan data yang sama dengan izin dan fokus yang sesuai dengan pekerjaan tiap orang."
        actions={[{ label: "Coba gratis", href: "/daftar" }, { label: "Lihat semua modul", href: "/produk", variant: "outline" }]}
      />

      <section className="shell" style={{ padding: "48px 0 8px" }}>
        <div style={{ display: "grid", gap: 22 }}>
          {SOLUTIONS.map((solution, index) => (
            <article
              key={solution.slug}
              id={solution.slug}
              className="split-band"
              style={{ gridTemplateColumns: index % 2 === 0 ? "1fr 1.1fr" : "1.1fr 1fr" }}
            >
              <div className="split-band-copy" style={{ order: index % 2 === 0 ? 0 : 1 }}>
                <p className="eyebrow" style={{ margin: 0 }}>
                  {solution.eyebrow}
                </p>
                <h2 className="market-h2">{solution.title}</h2>
                <p className="market-lede" style={{ margin: 0 }}>
                  {solution.body}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                  {solution.points.map((point) => (
                    <li key={point} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14 }}>
                      <Check size={16} aria-hidden style={{ color: "var(--success)", flex: "none", marginTop: 3 }} />
                      {point}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href={solution.href} className="btn btn-primary">
                    Buka {solution.module} <ArrowRight size={15} />
                  </Link>
                  <Link href="/harga" className="btn btn-outline">
                    Lihat paket
                  </Link>
                </div>
              </div>
              <div className="split-band-art" style={{ order: index % 2 === 0 ? 1 : 0 }}>
                <div style={{ position: "absolute", inset: 0 }}>
                  <CardArt variant={ART[index] ?? "board"} label={`Tampilan solusi ${solution.title}`} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="business-band" style={{ padding: "56px 0 64px", marginTop: 56 }}>
        <div className="shell">
          <SectionHeading
            eyebrow="Bagaimana peran terhubung"
            title="Satu pekerjaan, empat sudut pandang"
            lede="Manajer melihat keputusan, staf melihat tugas, operasional melihat pengajuan, dan kepemimpinan melihat pola. Semuanya dari baris yang sama."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 14 }}>
            {[
              ["Staf", "Membuat tugas", "Tugas muncul di My Work dan notifikasi atasan."],
              ["Pemimpin tim", "Mengatur papan", "Status berubah, progres proyek dihitung ulang."],
              ["Manajer", "Menyetujui", "Keputusan tercatat dengan catatan dan waktu."],
              ["Pemilik organisasi", "Membaca laporan", "Angka diambil dari tugas dan proyek yang sama."],
            ].map(([role, action, effect], index) => (
              <div key={role} className="panel" style={{ background: "var(--bg)" }}>
                <div className="panel-body">
                  <span className="badge badge-accent">{index + 1}</span>
                  <h3 style={{ margin: "10px 0 4px", fontSize: 15 }}>{role}</h3>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{action}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>{effect}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell" style={{ padding: "56px 0 72px" }}>
        <SectionHeading eyebrow="Jelajahi" title="Mulai dari modul yang paling dekat dengan pekerjaan Anda" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {MODULES.slice(0, 8).map((module) => (
            <Link key={module.slug} href={`/produk/${module.slug}`} className="badge badge-accent" style={{ height: 32, padding: "0 14px", fontSize: 13 }}>
              {module.name}
            </Link>
          ))}
          <Link href="/produk" className="textlink" style={{ marginLeft: 6 }}>
            Semua 12 modul <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
