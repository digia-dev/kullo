import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { PRINCIPLES, ROADMAP } from "@/content/guides";

export const metadata: Metadata = {
  title: "Tentang Kullo",
  description:
    "Alasan Kullo dibuat, prinsip desain yang dipakai, dan peta jalan empat fase.",
};

export default function TentangPage() {
  return (
    <>
      <PageHero
        eyebrow="Tentang Kullo"
        title="Ruang kerja untuk tim yang lelah berpindah aplikasi."
        lede="Kullo dibangun untuk satu pekerjaan: menyatukan rencana, pelaksanaan, dan keputusan tim dalam satu basis data. Kami tidak menambah modul yang belum bisa dipakai."
        actions={[{ label: "Jelajahi produk", href: "/produk" }, { label: "Buat akun", href: "/daftar", variant: "outline" }]}
        tone="ink"
      />

      <section className="shell" style={{ padding: "48px 0 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            {
              title: "Masalahnya sederhana",
              body: "Pekerjaan tersebar di percakapan, spreadsheet, dan surel. Yang hilang bukan fitur, melainkan satu tempat yang dipakai semua orang untuk melihat status dan keputusan terbaru.",
            },
            {
              title: "Pendekatannya",
              body: "Dua belas modul memakai satu basis data dan satu set izin. Progres dihitung dari status tugas, bukan angka yang diketik manual.",
            },
            {
              title: "Batasannya",
              body: "Kami tidak membangun penggajian, akuntansi, absensi GPS, atau rekrutmen. Fokus dijaga sampai kebutuhan pasar benar-benar terbukti.",
            },
          ].map((item) => (
            <div key={item.title} className="panel">
              <div className="panel-body">
                <h2 style={{ fontSize: 17, margin: "0 0 8px", fontWeight: 650 }}>{item.title}</h2>
                <p className="market-card-copy" style={{ margin: 0 }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="shell" id="prinsip" style={{ padding: "52px 0 8px", scrollMarginTop: 70 }}>
        <SectionHeading
          title="Prinsip desain"
          lede="Tujuh aturan yang dipakai sebagai acuan setiap kali modul baru ditambahkan."
        />
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {PRINCIPLES.map((principle, index) => (
            <li key={principle.title} className="panel">
              <div className="panel-body" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--accent)", minWidth: 26 }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 style={{ fontSize: 16, margin: "0 0 4px", fontWeight: 750 }}>{principle.title}</h3>
                  <p className="market-card-copy" style={{ margin: 0 }}>
                    {principle.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="business-band" id="roadmap" style={{ padding: "52px 0 64px", marginTop: 44, scrollMarginTop: 70 }}>
        <div className="shell">
          <SectionHeading
            title="Peta jalan"
            lede="Fase 1 sampai 3 sudah berjalan di aplikasi ini. Fase 4 masih rencana. Kami tidak menampilkannya sebagai fitur yang tersedia."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, alignItems: "stretch" }}>
            {ROADMAP.map((phase) => (
              <article
                key={phase.phase}
                className="panel"
                data-status={phase.status}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span className="eyebrow" style={{ margin: 0 }}>
                      {phase.phase}
                    </span>
                    <span
                      className={
                        phase.status === "Tersedia"
                          ? "badge badge-success"
                          : phase.status === "Berjalan"
                            ? "badge badge-accent"
                            : "badge badge-warning"
                      }
                    >
                      {phase.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 17, margin: 0, fontWeight: 750 }}>{phase.title}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 7 }}>
                    {phase.items.map((item) => (
                      <li key={item} style={{ fontSize: 14, color: "var(--text-muted)", display: "flex", gap: 8 }}>
                        <span aria-hidden style={{ color: "var(--accent)" }}>
                          ·
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <p className="help" style={{ marginTop: 18, maxWidth: "70ch" }}>
            Asisten AI, otomatisasi alur kerja, integrasi eksternal, dan notifikasi email serta push masih
            berstatus peta jalan. Harga paket berbayar juga belum ditetapkan.
          </p>
        </div>
      </section>

      <section className="shell" style={{ padding: "56px 0 72px" }}>
        <div
          style={{
            background: "var(--accent-soft)",
            border: "1px solid color-mix(in srgb, var(--accent) 18%, var(--border))",
            borderRadius: 16,
            padding: "36px 32px",
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ maxWidth: "52ch" }}>
            <h2 className="market-h2" style={{ fontSize: 24, lineHeight: "30px", margin: 0, marginBottom: 8 }}>
              Coba sendiri, bukan dari brosur
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15 }}>
              Paket Gratis berisi 5 anggota dan 3 proyek. Cukup untuk menilai apakah Kullo cocok dengan cara
              tim Anda bekerja.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/daftar" className="btn btn-primary btn-lg">
              Buat akun gratis
            </Link>
            <Link href="/dukungan#hubungi" className="btn btn-outline btn-lg">
              Bicara dengan tim
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
