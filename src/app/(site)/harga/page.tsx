import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { PLANS, PLAN_MATRIX } from "@/content/site";
import { SUPPORT_FAQ as FAQ } from "@/content/guides";

export const metadata: Metadata = {
  title: "Paket dan harga",
  description:
    "Bandingkan paket Free, Pro, dan Business. Harga Pro dan Business belum ditetapkan; kami tidak menampilkan angka karangan.",
};

const NOTES = [
  "Tidak ada kartu kredit untuk paket Free.",
  "Batas anggota dan proyek dihitung di server, bukan hanya ditampilkan.",
  "Harga Pro dan Business ditetapkan setelah riset pasar selesai. Sampai saat itu, hubungi kami.",
];

export default function HargaPage() {
  return (
    <>
      <PageHero
        eyebrow="Paket"
        title="Mulai gratis. Naik paket saat tim tumbuh."
        lede="Tiga paket dengan batas yang jelas. Kami belum menetapkan harga Pro dan Business, jadi kami tidak menampilkan angka yang belum benar."
        actions={[{ label: "Mulai dengan Free", href: "/daftar" }, { label: "Tanya tim kami", href: "/dukungan#hubungi", variant: "outline" }]}
      />

      <section className="shell" style={{ padding: "44px 0 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 18, alignItems: "stretch" }}>
          {PLANS.map((plan) => (
            <article
              key={plan.key}
              id={plan.key}
              className="panel"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 26,
                borderColor: plan.highlighted ? "color-mix(in srgb, var(--accent) 45%, var(--border))" : undefined,
                boxShadow: plan.highlighted ? "var(--shadow-hover)" : undefined,
                position: "relative",
              }}
            >
              {plan.highlighted && (
                <span className="badge badge-accent" style={{ position: "absolute", top: 18, right: 18 }}>
                  Paling populer
                </span>
              )}
              <p className="eyebrow" style={{ marginBottom: 8 }}>
                {plan.name}
              </p>
              <p style={{ fontSize: 34, lineHeight: "40px", fontWeight: 650, letterSpacing: "-0.04em", margin: 0 }}>{plan.price}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", minHeight: 44, margin: "8px 0 18px", lineHeight: 1.5 }}>{plan.priceNote}</p>
              <Link href={plan.cta.href} className={plan.highlighted ? "btn btn-primary" : "btn btn-outline"} style={{ width: "100%" }}>
                {plan.cta.label}
              </Link>
              <hr className="divider" style={{ margin: "20px 0 16px" }} />
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14 }}>
                    <Check size={16} aria-hidden style={{ color: "var(--success)", flex: "none", marginTop: 3 }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="shell" style={{ padding: "48px 0 8px" }} id="banding">
        <SectionHeading eyebrow="Perbandingan" title="Batas paket, tanpa huruf kecil" lede="Angka dan label di bawah ini sama dengan yang dipakai aplikasi saat memeriksa batas organisasi." />
        <div className="panel" style={{ overflow: "hidden" }}>
          <div className="app-table-wrap">
            <table className="table" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th style={{ width: "34%" }}>Fitur</th>
                  <th>Free</th>
                  <th>Pro</th>
                  <th>Business</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_MATRIX.map((row) => (
                  <tr key={row.feature}>
                    <td style={{ fontWeight: 600 }}>{row.feature}</td>
                    {row.values.map((value, index) => (
                      <td key={`${row.feature}-${index}`} style={{ color: value === "â€”" ? "var(--text-muted)" : "var(--text)" }}>
                        {value === "â€”" ? <Minus size={15} aria-label="Tidak termasuk" /> : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="shell" style={{ padding: "32px 0 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {NOTES.map((note) => (
            <div key={note} className="panel">
              <div className="panel-body" style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {note}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="shell" style={{ padding: "48px 0 72px" }}>
        <SectionHeading eyebrow="Pertanyaan umum" title="Hal yang sering ditanyakan soal paket" />
        <div className="panel" style={{ padding: "0 22px" }}>
          {FAQ.slice(0, 3).map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <div className="faq-body">{item.answer}</div>
            </details>
          ))}
        </div>
        <p style={{ marginTop: 18, fontSize: 13, color: "var(--text-muted)" }}>
          <Link href="/dukungan#faq" className="textlink">
            Lihat semua pertanyaan
          </Link>
        </p>
      </section>
    </>
  );
}

