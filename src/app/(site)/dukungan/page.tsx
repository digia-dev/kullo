import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { SUPPORT_FAQ } from "@/content/guides";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Dukungan",
  description:
    "Pusat dukungan Kullo: pertanyaan umum, keamanan data, dan formulir kontak untuk pertanyaan paket, demo, atau keamanan.",
};

export default function DukunganPage() {
  const general = SUPPORT_FAQ.filter((item) => !item.anchor || item.anchor === "faq");

  return (
    <>
      <PageHero
        eyebrow="Dukungan"
        title="Bantuan tanpa basa-basi"
        lede="Jawaban untuk pertanyaan yang paling sering muncul. Bila belum cukup, tulis pesan dan kami balas lewat email Anda."
        actions={[{ label: "Tulis pesan", href: "#hubungi" }, { label: "Panduan memulai", href: "/sumber-daya", variant: "outline" }]}
      />

      <section className="shell" style={{ padding: "44px 0 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 44 }}>
          {[
            {
              Icon: MessageCircle,
              title: "Pertanyaan umum",
              body: "Paket, harga, data, dan batasan versi ini dijawab apa adanya.",
              href: "#faq",
              cta: "Baca FAQ",
            },
            {
              Icon: ShieldCheck,
              title: "Keamanan data",
              body: "Kata sandi di-hash, sesi berbatas waktu, dan data disaring per organisasi di server.",
              href: "#keamanan",
              cta: "Lihat detail keamanan",
            },
            {
              Icon: Mail,
              title: "Hubungi kami",
              body: "Untuk harga, demo, keamanan, atau kebutuhan yang belum tercantum.",
              href: "#hubungi",
              cta: "Kirim pesan",
            },
            {
              Icon: Sparkles,
              title: "Panduan produk",
              body: "Langkah demi langkah dari organisasi kosong sampai tugas pertama selesai.",
              href: "/sumber-daya",
              cta: "Buka sumber daya",
            },
          ].map((card) => (
            <article key={card.title} className="market-card">
              <div className="market-card-body" style={{ gap: 8 }}>
                <span
                  aria-hidden
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <card.Icon size={18} />
                </span>
                <h2 className="market-card-title" style={{ fontSize: 17 }}>
                  {card.title}
                </h2>
                <p className="market-card-copy" style={{ flex: 1 }}>
                  {card.body}
                </p>
                <Link href={card.href} className="textlink">
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell" id="faq" style={{ padding: "8px 0 48px", scrollMarginTop: 70 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 0, maxWidth: "78ch" }}>
          <SectionHeading
            id="pertanyaan"
            title="Pertanyaan yang paling sering kami terima"
            lede="Bila jawabannya belum cocok dengan situasi Anda, tulis pesannya di bawah."
          />
          <div style={{ display: "grid", gap: 10 }}>
            {general.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <div className="faq-body">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="business-band" id="keamanan" style={{ padding: "48px 0", scrollMarginTop: 70 }}>
        <div className="shell">
          <SectionHeading
            title="Keamanan yang bisa Anda periksa"
            lede="Bukan daftar sertifikasi — ini yang benar-benar dijalankan kode aplikasinya."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {[
              { title: "Kata sandi", body: "Di-hash dengan scrypt dan garam unik per pengguna. Tidak ada kata sandi yang tersimpan polos." },
              { title: "Sesi", body: "Token acak di-hash di basis data, dikirim lewat cookie HttpOnly, kedaluwarsa setelah 7 hari." },
              { title: "Isolasi organisasi", body: "Setiap permintaan menyaring data dengan organisasi aktif dari sesi. Akses silang ditolak." },
              { title: "Izin di server", body: "Peran dibaca dari basis data, bukan dari antarmuka. Menyembunyikan tombol bukan keamanan." },
            ].map((item) => (
              <div key={item.title} className="panel">
                <div className="panel-body">
                  <h3 style={{ fontSize: 16, margin: "0 0 6px", fontWeight: 650 }}>{item.title}</h3>
                  <p className="market-card-copy" style={{ margin: 0 }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell" id="hubungi" style={{ padding: "56px 0 72px", scrollMarginTop: 70 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)",
            gap: 40,
            alignItems: "start",
          }}
          className="contact-grid"
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: 10 }}>
              Hubungi kami
            </p>
            <h2 className="market-h2" style={{ marginBottom: 12 }}>
              Ceritakan kebutuhan tim Anda
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.65, marginTop: 0 }}>
              Sertakan jumlah anggota dan alur kerja yang ingin dirapikan. Kami membalas lewat email dalam
              hari kerja.
            </p>
            <div className="panel" style={{ marginTop: 20 }}>
              <div className="panel-body" style={{ display: "grid", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 14.5 }}>
                  <strong>Email langsung:</strong> halo@kullo.app
                </p>
                <p className="help" style={{ margin: 0 }}>
                  Kami tidak meminta kata sandi, kode OTP, atau data pembayaran lewat email.
                </p>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-body">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
