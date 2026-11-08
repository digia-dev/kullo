import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { ModuleIcon } from "@/components/site/ModuleIcon";
import { MODULE_GROUPS, MODULES } from "@/content/modules";
import { CardArt } from "@/components/site/CardArt";

export const metadata: Metadata = {
  title: "Produk — dua belas modul dalam satu portal",
  description:
    "Kenali dua belas modul Kullo: dashboard, my work, proyek, tugas, tim, chat, kalender, dokumen, permintaan, persetujuan, laporan, dan pengaturan.",
};

export default function ProdukPage() {
  return (
    <>
      <PageHero
        eyebrow="Produk"
        title="Dua belas modul, satu basis data"
        lede="Setiap modul membaca orang, proyek, tugas, dan dokumen yang sama. Izin diatur sekali, dipakai di mana-mana."
        actions={[{ label: "Coba gratis", href: "/daftar" }, { label: "Lihat harga", href: "/harga", variant: "outline" }]}
      />

      {MODULE_GROUPS.map((group) => (
        <section key={group} className="shell" style={{ padding: "44px 0 8px" }} id={group.toLowerCase().replace(/\s/g, "-")}>
          <SectionHeading id={group} title={group} align="left" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            {MODULES.filter((module) => module.group === group).map((module) => (
              <article key={module.slug} className="market-card">
                <div className="market-card-body" style={{ gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <ModuleIcon name={module.icon} size={18} />
                    </span>
                    <span className="badge badge-accent">{module.number}</span>
                    <h3 className="market-card-title" style={{ fontSize: 18, marginLeft: "auto" }}>
                      {module.name}
                    </h3>
                  </div>
                  <p className="market-card-copy" style={{ flex: 1 }}>
                    {module.summary}
                  </p>
                  <Link href={`/produk/${module.slug}`} className="textlink">
                    Pelajari {module.name.toLowerCase()} <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="business-band" style={{ padding: "56px 0 64px", marginTop: 40 }}>
        <div className="shell" style={{ display: "grid", gap: 32 }}>
          <SectionHeading
            id="cara-kerja"
            eyebrow="Cara kerja"
            title="Modulnya terhubung karena orang dan proyeknya sama"
            lede="Satu tugas dibuat di proyek, muncul di My Work, dijadwalkan di kalender, dibahas di chat, dan dihitung di laporan — tanpa disalin."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 20 }}>
            {[
              { title: "Satu identitas pekerjaan", copy: "Tugas, proyek, dan dokumen punya ID unik per organisasi. Tidak ada salinan yang tidak sinkron." },
              { title: "Satu set izin", copy: "Role dan departemen menentukan siapa melihat apa. Diperiksa di server setiap permintaan." },
              { title: "Satu riwayat", copy: "Perubahan status, komentar, dan keputusan masuk ke activity log yang sama." },
            ].map((item) => (
              <div key={item.title} className="panel">
                <div className="panel-body">
                  <h3 style={{ fontSize: 16, margin: "0 0 8px", fontWeight: 650 }}>{item.title}</h3>
                  <p className="market-card-copy" style={{ margin: 0 }}>{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell" style={{ padding: "64px 0" }}>
        <div className="split-band">
          <div className="split-band-copy">
            <p className="eyebrow">Mulai dari yang paling penting</p>
            <h2 className="market-h2">Proyek, tugas, dan persetujuan lebih dulu</h2>
            <p className="market-lede" style={{ margin: 0 }}>
              Modul lain menyusul mengikuti kebiasaan tim Anda. Panduan 5 menit menuntun dari organisasi kosong
              sampai tugas pertama selesai.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/sumber-daya/panduan-5-menit" className="btn btn-primary">
                Baca panduan 5 menit
              </Link>
              <Link href="/produk/projects" className="btn btn-outline">
                Lihat modul proyek
              </Link>
            </div>
          </div>
          <div className="split-band-art" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <CardArt variant="board" label="Ilustrasi papan proyek Kullo" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
