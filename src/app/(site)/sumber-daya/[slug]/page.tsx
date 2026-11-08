import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { GUIDES, guideBySlug } from "@/content/guides";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Panduan tidak ditemukan" };
  return { title: guide.title, description: guide.excerpt };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const index = GUIDES.findIndex((item) => item.slug === guide.slug);
  const next = GUIDES[(index + 1) % GUIDES.length];
  const others = GUIDES.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <section
        style={{
          background: "linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "44px 0 36px",
        }}
      >
        <div className="shell" style={{ maxWidth: "46rem" }}>
          <Link href="/sumber-daya" className="textlink" style={{ marginBottom: 16, display: "inline-flex" }}>
            <ArrowLeft size={15} /> Semua sumber daya
          </Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <span className="badge badge-accent">{guide.category}</span>
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 13, color: "var(--text-muted)" }}>
              <Clock size={14} /> {guide.minutes} menit baca
            </span>
          </div>
          <h1 className="market-h1" style={{ maxWidth: "22ch", marginBottom: 14 }}>
            {guide.title}
          </h1>
          <p className="market-lede" style={{ margin: 0 }}>
            {guide.excerpt}
          </p>
        </div>
      </section>

      <article className="shell" style={{ padding: "40px 0 24px", maxWidth: "46rem" }}>
        <div style={{ display: "grid", gap: 34 }}>
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="market-h2" style={{ fontSize: 22, lineHeight: "28px", marginBottom: 12 }}>
                {section.heading}
              </h2>
              <div style={{ display: "grid", gap: 12 }}>
                {section.body.map((paragraph) => (
                  <p key={paragraph} style={{ fontSize: 16, lineHeight: 1.75, margin: 0, color: "var(--text)" }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <hr className="divider" style={{ margin: "44px 0 28px" }} />

        <div
          className="panel"
          style={{
            background: "var(--accent-soft)",
            borderColor: "color-mix(in srgb, var(--accent) 18%, var(--border))",
          }}
        >
          <div className="panel-body" style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ maxWidth: "46ch" }}>
              <h2 style={{ fontSize: 18, margin: "0 0 6px", fontWeight: 650 }}>Praktikkan sekarang</h2>
              <p className="market-card-copy" style={{ margin: 0 }}>
                Buat organisasi, undang dua anggota, dan selesaikan tugas pertama dalam satu sesi.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/daftar" className="btn btn-primary">
                Buat akun gratis
              </Link>
              <Link href={`/sumber-daya/${next.slug}`} className="btn btn-outline">
                Panduan berikutnya <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </article>

      <section className="business-band" style={{ padding: "44px 0 64px" }}>
        <div className="shell">
          <h2 className="market-h2" style={{ fontSize: 22, marginBottom: 18 }}>
            Panduan lain
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 20, alignItems: "stretch" }}>
            {others.map((item) => (
              <article key={item.slug} className="market-card">
                <div className="market-card-body" style={{ gap: 8 }}>
                  <span className="badge" style={{ alignSelf: "flex-start" }}>
                    {item.category}
                  </span>
                  <h3 className="market-card-title" style={{ fontSize: 17 }}>
                    {item.title}
                  </h3>
                  <p className="market-card-copy" style={{ flex: 1 }}>
                    {item.excerpt}
                  </p>
                  <Link href={`/sumber-daya/${item.slug}`} className="textlink">
                    Baca <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
