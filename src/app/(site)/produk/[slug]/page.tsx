import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, MousePointerClick, ShieldCheck, Rows3 } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { ModuleIcon } from "@/components/site/ModuleIcon";
import { CardArt } from "@/components/site/CardArt";
import { MODULES, moduleBySlug } from "@/content/modules";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return MODULES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const mod = moduleBySlug(slug);
  if (!mod) return { title: "Modul tidak ditemukan" };
  return {
    title: `${mod.name}: ${mod.tagline}`,
    description: mod.summary,
  };
}

const ART_BY_MODULE: Record<string, "board" | "chat" | "docs" | "approvals" | "calendar" | "report"> = {
  dashboard: "report",
  "my-work": "board",
  projects: "board",
  tasks: "board",
  teams: "chat",
  chat: "chat",
  calendar: "calendar",
  documents: "docs",
  requests: "approvals",
  approvals: "approvals",
  reports: "report",
  settings: "docs",
};

export default async function ModulePage({ params }: { params: Params }) {
  const { slug } = await params;
  const mod = moduleBySlug(slug);
  if (!mod) notFound();

  const index = MODULES.findIndex((item) => item.slug === mod.slug);
  const next = MODULES[(index + 1) % MODULES.length];
  const related = MODULES.filter((item) => item.group === mod.group && item.slug !== mod.slug).slice(0, 3);
  const art = ART_BY_MODULE[mod.slug] ?? "board";

  return (
    <>
      <PageHero
        eyebrow={`Modul ${mod.number} · ${mod.group}`}
        title={`${mod.name}: ${mod.tagline}`}
        lede={mod.summary}
        actions={[
          { label: "Buka di aplikasi", href: mod.route },
          { label: "Semua modul", href: "/produk", variant: "outline" },
        ]}
      />

      <section className="shell" style={{ padding: "48px 0 8px" }}>
        <div className="split-band">
          <div className="split-band-copy">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <ModuleIcon name={mod.icon} size={20} />
              </span>
              <p className="eyebrow" style={{ margin: 0 }}>
                Cara kerjanya
              </p>
            </div>
            <h2 className="market-h2">{mod.name} dalam alur kerja Anda</h2>
            <p className="market-lede" style={{ margin: 0 }}>
              {mod.description}
            </p>
            <p className="market-lede" style={{ margin: 0 }}>
              Modul ini memakai data organisasi yang sama dengan modul lain. Tidak ada impor ulang atau salinan yang tertinggal.
            </p>
            <Link href={mod.route} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
              Lihat {mod.name} di aplikasi <ArrowRight size={16} />
            </Link>
          </div>
          <div className="split-band-art" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <CardArt variant={art} label={`Tampilan ${mod.name}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="shell" style={{ padding: "52px 0 8px" }}>
        <SectionHeading
          id="kemampuan"
          eyebrow="Yang bisa dilakukan"
          title={`Kemampuan ${mod.name}`}
          lede="Fitur berikut tersedia di aplikasi setelah Anda masuk."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {mod.capabilities.map((capability) => (
            <div key={capability} className="panel">
              <div className="panel-body" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  aria-hidden
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: "var(--success-soft)",
                    color: "var(--success)",
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                    marginTop: 1,
                  }}
                >
                  <Check size={14} strokeWidth={2.6} />
                </span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{capability}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="business-band" style={{ padding: "52px 0 56px", marginTop: 48 }}>
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              {
                Icon: Rows3,
                title: "Satu sumber data",
                copy: "Modul ini membaca baris yang sama dengan My Work, kalender, dan laporan. Perubahan langsung terlihat di seluruh aplikasi.",
              },
              {
                Icon: ShieldCheck,
                title: "Izin diperiksa di server",
                copy: "Setiap permintaan memuat organisasi dari sesi dan memeriksa peran. Menyembunyikan tombol bukan pengamanan.",
              },
              {
                Icon: MousePointerClick,
                title: "Aksi di tempatnya",
                copy: "Tidak perlu berpindah halaman untuk memperbarui status, menulis komentar, atau menetapkan PIC.",
              },
            ].map((item) => (
              <div key={item.title} className="panel" style={{ background: "var(--bg)" }}>
                <div className="panel-body" style={{ display: "grid", gap: 8 }}>
                  <item.Icon size={20} aria-hidden style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750 }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)" }}>{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="shell" style={{ padding: "48px 0 8px" }}>
          <SectionHeading id="terkait" eyebrow={`Lebih banyak di ${mod.group}`} title="Modul yang bekerja bersamanya" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {related.map((item) => (
              <Link key={item.slug} href={`/produk/${item.slug}`} className="panel" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <ModuleIcon name={item.icon} size={17} />
                  <strong style={{ fontSize: 15 }}>{item.name}</strong>
                  <ArrowRight size={15} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--text-muted)" }}>{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="shell" style={{ padding: "44px 0 72px" }}>
        <div
          className="panel"
          style={{
            padding: "28px 30px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            background: "var(--accent-soft)",
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>
              Lanjutkan
            </p>
            <h2 className="market-h2" style={{ fontSize: 24, lineHeight: "30px" }}>
              {next.name}: {next.tagline}
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={`/produk/${next.slug}`} className="btn btn-outline">
              {next.name} <ArrowRight size={15} />
            </Link>
            <Link href="/daftar" className="btn btn-primary">
              Coba gratis
            </Link>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Link href="/produk" className="textlink">
            <ArrowLeft size={15} /> Kembali ke semua modul
          </Link>
        </div>
      </section>
    </>
  );
}

