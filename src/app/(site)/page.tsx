import Link from "next/link";
import { FolderKanban, MessageSquare, Grid3x3, BookOpen, Sparkles } from "lucide-react";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { BannerArt, CardArt } from "@/components/site/CardArt";
import { QUICK_LINKS, SOLUTIONS } from "@/content/site";

const CARDS = [
  {
    variant: "board" as const,
    title: "Proyek & Tugas",
    copy: "Rencanakan pekerjaan di board, list, dan timeline. Setiap tugas punya PIC, status, prioritas, dan tenggat.",
    cta: "Pelajari selengkapnya",
    href: "/produk/projects",
    Icon: FolderKanban,
  },
  {
    variant: "chat" as const,
    title: "Chat & Kolaborasi",
    copy: "Kanal tim, kanal proyek, dan pesan langsung yang tetap menempel pada pekerjaannya.",
    cta: "Lihat cara kerja",
    href: "/produk/chat",
    Icon: MessageSquare,
  },
  {
    variant: "docs" as const,
    title: "Dokumen",
    copy: "Folder perusahaan, riwayat versi, dan izin akses yang mengikuti struktur organisasi.",
    cta: "Pelajari dokumen",
    href: "/produk/documents",
    Icon: BookOpen,
  },
  {
    variant: "approvals" as const,
    title: "Persetujuan",
    copy: "Cuti, reimbursement, dan pembelian dengan alur multi-level serta riwayat keputusan.",
    cta: "Lihat alur persetujuan",
    href: "/produk/approvals",
    Icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <section aria-label="Mulai dengan Kullo">
        <div
          className="shell"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "18px 44px",
            flexWrap: "wrap",
            padding: "18px 0 8px",
          }}
        >
          {QUICK_LINKS.map((link, index) => {
            const Icon = [Grid3x3, FolderKanban, BookOpen][index];
            return (
              <Link key={link.href} href={link.href} className="quicklink" style={{ flexDirection: "column", gap: 8 }}>
                <Icon size={26} strokeWidth={1.4} aria-hidden />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="utama">
        <h2 id="utama" className="sr-only">
          Modul yang paling sering dipakai
        </h2>
        <div className="shell" style={{ padding: "52px 0 8px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(272px, 1fr))",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            {CARDS.map((card) => (
              <article key={card.title} className="market-card">
                <div className="market-card-media">
                  <CardArt variant={card.variant} label={`Ilustrasi modul ${card.title}`} />
                </div>
                <div className="market-card-body">
                  <h3 className="market-card-title">{card.title}</h3>
                  <p className="market-card-copy">{card.copy}</p>
                  <Link href={card.href} className="btn btn-primary">
                    {card.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="perusahaan" style={{ padding: "56px 0 8px" }}>
        <div className="shell">
          <div className="split-band">
            <div className="split-band-copy">
              <p className="eyebrow">Satu portal</p>
              <h2 id="perusahaan" className="market-h2">
                Kullo untuk seluruh perusahaan
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.65, margin: 0 }}>
                Mulai dari lima anggota pertama sampai organisasi multi-departemen. Dua belas modul berbagi
                orang, proyek, dokumen, dan aturan izin yang sama — bukan dua belas aplikasi yang dijahit
                bersama.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/harga" className="btn btn-primary">
                  Lihat paket
                </Link>
                <Link href="/produk" className="btn btn-outline">
                  Jelajahi 12 modul
                </Link>
              </div>
            </div>
            <div className="split-band-art">
              <div style={{ position: "absolute", inset: 0 }}>
                <BannerArt />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="business-band" aria-labelledby="bisnis" style={{ padding: "56px 0 64px" }}>
        <div className="shell">
          <h2 id="bisnis" className="market-h2" style={{ marginBottom: 24 }}>
            Untuk bisnis
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(272px, 1fr))",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            {SOLUTIONS.slice(0, 4).map((solution, index) => {
              const variant = (["calendar", "board", "approvals", "report"] as const)[index];
              return (
                <article key={solution.slug} id={solution.slug} className="market-card">
                  <div className="market-card-media">
                    <CardArt variant={variant} label={`Ilustrasi solusi ${solution.title}`} />
                  </div>
                  <div className="market-card-body">
                    <p className="eyebrow" style={{ color: "var(--text-muted)" }}>
                      {solution.eyebrow}
                    </p>
                    <h3 className="market-card-title">{solution.title}</h3>
                    <p className="market-card-copy">{solution.body}</p>
                    <Link href={solution.href} className="btn btn-primary">
                      Lihat {solution.module}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
