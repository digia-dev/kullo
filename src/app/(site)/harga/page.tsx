import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { PLANS, PLAN_MATRIX } from "@/content/site";
import { SUPPORT_FAQ as FAQ } from "@/content/guides";

export const metadata: Metadata = {
  title: "Paket dan harga",
  description:
    "Bandingkan paket Gratis, Pro, dan Bisnis. Harga Pro dan Bisnis belum ditetapkan, jadi kami tidak menampilkan angka sementara.",
};

const NOTES = [
  "Paket Gratis tidak memerlukan kartu kredit.",
  "Batas anggota dan proyek diperiksa di server saat dipakai.",
  "Harga Pro dan Bisnis ditetapkan setelah riset pasar selesai. Sampai saat itu, hubungi kami.",
];

export default function HargaPage() {
  return (
    <>
      <PageHero
        eyebrow="Paket"
        title="Mulai gratis. Naik paket saat tim tumbuh."
        lede="Tiga paket dengan batas yang jelas. Kami belum menetapkan harga Pro dan Bisnis, jadi halaman ini tidak menampilkan angka."
        actions={[{ label: "Mulai dengan paket Gratis", href: "/daftar" }, { label: "Tanya tim", href: "/dukungan#hubungi", variant: "outline" }]}
      />

      <section className="shell" style={{ padding: "44px 0 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 18, alignItems: "stretch" }}>
          {PLANS.map((plan) => (
            <article
              key={plan.key}
              id={plan.key}
              className={plan.highlighted ? "panel plan-featured" : "panel"}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 26,
                position: "relative",
              }}
            >
              {plan.highlighted && (
                <span className="badge badge-accent" style={{ position: "absolute", top: 18, right: 18 }}>
                  Untuk tim aktif
                </span>
              )}
              <p className="eyebrow" style={{ marginBottom: 8 }}>
                {plan.name}
              </p>
              <p className="plan-price">{plan.price}</p>
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
        <SectionHeading eyebrow="Perbandingan" title="Batas paket yang dipakai aplikasi" lede="Angka dan label di bawah ini sama dengan yang diperiksa aplikasi saat menghitung batas organisasi." />
        <div className="panel" style={{ overflow: "hidden" }}>
          <div className="app-table-wrap">
            <table className="table" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th style={{ width: "34%" }}>Fitur</th>
                  <th>Gratis</th>
                  <th>Pro</th>
                  <th>Bisnis</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_MATRIX.map((row) => (
                  <tr key={row.feature}>
                    <td style={{ fontWeight: 600 }}>{row.feature}</td>
                    {row.values.map((value, index) => (
                      <td key={`${row.feature}-${index}`} style={{ color: value === "Tidak" ? "var(--text-muted)" : "var(--text)" }}>
                        {value === "Tidak" ? <Minus size={15} aria-label="Tidak termasuk" /> : value}
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

