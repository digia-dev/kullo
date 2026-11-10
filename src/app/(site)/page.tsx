import Link from "next/link";
import Image from "next/image";
import { FolderKanban, MessageSquare, Grid3x3, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { BannerArt, CardArt } from "@/components/site/CardArt";
import { QUICK_LINKS, SOLUTIONS } from "@/content/site";

const CARDS = [
  {
    variant: "board" as const,
    title: "Proyek dan tugas",
    copy: "Atur pekerjaan di papan, daftar, dan lini masa. Setiap tugas punya PIC, status, prioritas, dan tenggat.",
    cta: "Lihat modul proyek",
    href: "/produk/projects",
    Icon: FolderKanban,
  },
  {
    variant: "chat" as const,
    title: "Chat dan kolaborasi",
    copy: "Kanal tim dan proyek yang tetap terhubung ke tugas, dokumen, dan keputusan yang membahasnya.",
    cta: "Lihat cara kerja chat",
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
    copy: "Cuti, reimbursement, dan pembelian melewati alur bertingkat dengan riwayat keputusan.",
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
                  <CardArt variant={card.variant} label={`Tampilan ${card.title}`} />
                </div>
                <div className="market-card-body">
                  <h3 className="market-card-title">{card.title}</h3>
                  <p className="market-card-copy">{card.copy}</p>
                  <Link href={card.href} className="textlink">
                    {card.cta} <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell showcase showcase-devices" aria-labelledby="di-dalam">
        <div className="showcase-head">
          <div>
            <p className="eyebrow" style={{ margin: "0 0 10px" }}>
              Di dalam Kullo
            </p>
            <h2 id="di-dalam" className="market-h2">
              Ini tampilan aplikasinya.
            </h2>
          </div>
          <p className="showcase-note">
            Tampilan asli dari ruang kerja demo: dashboard di laptop dan chat di ponsel. Data, status, dan
            percakapan berasal dari aplikasi yang sedang berjalan.
          </p>
        </div>

        <div className="device-stage">
          <div className="device-stage-caption">
            <span className="device-chip">Desktop</span>
            <span className="device-chip">Ponsel</span>
            <span className="help">Tampilan asli dari ruang kerja demo.</span>
            <Link href="/masuk?next=/app/dashboard" className="textlink">
              Buka demo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="macbook" role="img" aria-label="Tangkapan layar Dashboard Kullo di laptop.">
            <div className="macbook-lid">
              <span className="macbook-camera" aria-hidden />
              <div className="macbook-window">
                <div className="macbook-menubar">
                  <span className="macbook-dot macbook-dot-red" />
                  <span className="macbook-dot macbook-dot-amber" />
                  <span className="macbook-dot macbook-dot-green" />
                  <span className="macbook-appname">Kullo</span>
                  <span className="macbook-window-title">Dashboard</span>
                  <span className="macbook-time">09.41</span>
                </div>
                <div className="macbook-screen">
                  <Image
                    src="/shots/laptop-dashboard.png"
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 820px"
                    style={{ objectFit: "cover", objectPosition: "top left" }}
                  />
                </div>
              </div>
            </div>
            <div className="macbook-base" aria-hidden>
              <span className="macbook-notch" />
            </div>
          </div>

          <div className="phone-mock" role="img" aria-label="Tangkapan layar Chat Kullo di ponsel.">
            <span className="phone-island" aria-hidden />
            <div className="phone-screen">
              <Image
                src="/shots/phone-chat.png"
                alt=""
                fill
                sizes="(max-width: 900px) 32vw, 210px"
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />
            </div>
            <span className="phone-button phone-button-top" aria-hidden />
            <span className="phone-button phone-button-bottom" aria-hidden />
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
                Dari lima anggota pertama sampai organisasi lintas departemen, dua belas modul memakai orang,
                proyek, dokumen, dan aturan izin yang sama. Anda tidak perlu menyambung dua belas aplikasi.
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
            Untuk tim dan peran
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
                    <CardArt variant={variant} label={`Tampilan solusi ${solution.title}`} />
                  </div>
                  <div className="market-card-body">
                    <p className="eyebrow" style={{ color: "var(--text-muted)" }}>
                      {solution.eyebrow}
                    </p>
                    <h3 className="market-card-title">{solution.title}</h3>
                    <p className="market-card-copy">{solution.body}</p>
                    <Link href={solution.href} className="textlink">
                      Lihat {solution.module} <ArrowRight size={15} />
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
