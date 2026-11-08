import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { GUIDES } from "@/content/guides";

export const metadata: Metadata = {
  title: "Sumber daya",
  description:
    "Panduan memulai, alur kerja tugas dan persetujuan, catatan rilis, dan prinsip desain Kullo.",
};

const CATEGORY_COPY: Record<string, string> = {
  Panduan: "Langkah konkret untuk memulai dan mengatur tim.",
  "Alur kerja": "Cara kerja suatu proses di dalam Kullo, tahap demi tahap.",
  Rilis: "Apa yang sudah berjalan, dan apa yang masih di peta jalan.",
  Prinsip: "Keputusan desain yang mendasari seluruh modul.",
};

export default function SumberDayaPage() {
  const categories = Array.from(new Set(GUIDES.map((guide) => guide.category)));

  return (
    <>
      <PageHero
        eyebrow="Sumber daya"
        title="Panduan yang bisa langsung dipraktikkan"
        lede="Ditulis dari cara kerja aplikasinya sendiri — bukan janji fitur yang belum ada."
        actions={[{ label: "Panduan 5 menit", href: "/sumber-daya/panduan-5-menit" }, { label: "Pusat dukungan", href: "/dukungan", variant: "outline" }]}
      />

      <section className="shell" style={{ padding: "44px 0 8px" }}>
        {categories.map((category) => (
          <div key={category} style={{ marginBottom: 36 }}>
            <SectionHeading id={category.toLowerCase()} title={category} lede={CATEGORY_COPY[category]} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
                alignItems: "stretch",
              }}
            >
              {GUIDES.filter((guide) => guide.category === category).map((guide) => (
                <article key={guide.slug} className="market-card">
                  <div className="market-card-body" style={{ gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="badge">{guide.category}</span>
                      <span
                        style={{
                          display: "inline-flex",
                          gap: 5,
                          alignItems: "center",
                          fontSize: 12.5,
                          color: "var(--text-muted)",
                        }}
                      >
                        <Clock size={13} /> {guide.minutes} menit baca
                      </span>
                    </div>
                    <h2 className="market-card-title">{guide.title}</h2>
                    <p className="market-card-copy" style={{ flex: 1 }}>
                      {guide.excerpt}
                    </p>
                    <Link href={`/sumber-daya/${guide.slug}`} className="textlink">
                      Baca panduan <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="business-band" style={{ padding: "52px 0 64px" }}>
        <div className="shell" style={{ display: "grid", gap: 24 }}>
          <SectionHeading
            id="prinsip"
            eyebrow="Prinsip desain"
            title="Tujuh aturan yang menentukan tampilan Kullo"
            lede="Dipakai sebagai acuan saat modul baru dibuat, agar tabel, kartu, dan dialog tetap terasa satu produk."
          />
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, counterReset: "prinsip" }}>
            {[
              ["Clarity over Complexity", "Halaman hanya menampilkan yang dibutuhkan untuk keputusan berikutnya."],
              ["Minimal Visual Noise", "Satu aksen warna, border tipis, dan status ditandai dengan warna kecil."],
              ["Fast Navigation", "Sidebar tetap, Ctrl+K untuk pencarian global, dan daftar menyimpan konteksnya."],
              ["Consistent Components", "Tabel, kartu, dialog, dan tombol memakai radius serta ukuran yang sama."],
              ["Information Hierarchy", "Judul, data utama, lalu konteks. Angka penting lebih besar dari penjelasannya."],
              ["Contextual Actions", "Aksi muncul di tempat tugas itu berada, bukan tombol global untuk satu baris."],
              ["Responsive Experience", "390px berfokus pada membaca tugas, memperbarui status, chat, dan persetujuan."],
            ].map(([title, body], index) => (
              <li
                key={title}
                className="panel"
                style={{ counterIncrement: "prinsip" }}
              >
                <div className="panel-body" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span
                    aria-hidden
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 13,
                      color: "var(--accent)",
                      fontWeight: 700,
                      minWidth: 24,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 16, margin: "0 0 4px", fontWeight: 650 }}>{title}</h3>
                    <p className="market-card-copy" style={{ margin: 0 }}>
                      {body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
