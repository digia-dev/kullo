import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Ketentuan penggunaan",
  description: "Ketentuan penggunaan Kullo: aturan akun, perilaku, pembatasan, dan penyelesaian sengketa.",
};

const SECTIONS = [
  {
    heading: "Penerimaan",
    body: [
      "Dengan membuat akun atau memakai Kullo, Anda menyetujui ketentuan ini. Bila Anda memakai Kullo atas nama organisasi, Anda menyatakan berwenang mewakilinya.",
      "Bila Anda tidak setuju, jangan gunakan layanan ini. Anda dapat meminta penghapusan akun kapan saja.",
    ],
  },
  {
    heading: "Akun dan keamanan",
    body: [
      "Anda bertanggung jawab atas keamanan kata sandi Anda dan atas aktivitas yang terjadi di bawah akun Anda. Segera laporkan bila menduga akun disalahgunakan.",
      "Satu orang memakai satu akun. Berbagi akun membuat jejak aktivitas dan pertanggungjawaban keputusan menjadi tidak jelas.",
      "Kami dapat menangguhkan akun yang melanggar ketentuan ini atau membahayakan layanan, dengan pemberitahuan sejauh yang memungkinkan.",
    ],
  },
  {
    heading: "Penggunaan yang wajar",
    body: [
      "Gunakan Kullo untuk pekerjaan yang sah. Dilarang mengunggah malware, mencoba menembus keamanan, memindahkan data pengguna lain, atau memakai layanan untuk spam.",
      "Anda memiliki isi yang Anda unggah. Kullo hanya memprosesnya untuk menjalankan layanan sesuai kebijakan privasi.",
    ],
  },
  {
    heading: "Ketersediaan layanan",
    body: [
      "Versi ini masih berkembang. Fitur dapat berubah, diperbaiki, atau dihapus, dan kami akan berusaha memberi tahu perubahan berarti lewat sumber daya produk.",
      "Kami tidak menjamin layanan bebas gangguan setiap saat. Pencadangan basis data dijalankan secara berkala, namun Anda disarankan mengekspor data penting Anda sendiri.",
    ],
  },
  {
    heading: "Paket dan pembayaran",
    body: [
      "Paket Gratis disediakan tanpa biaya dengan batas yang tercantum di halaman harga. Paket Pro Rp399.000 per bulan dan Bisnis Rp1.199.000 per bulan, belum termasuk PPN. Pembayaran melalui invoice dan akses diaktifkan setelah konfirmasi admin.",
      "Saat ini Kullo tidak memproses pembayaran apa pun di dalam aplikasi.",
    ],
  },
  {
    heading: "Pembatasan tanggung jawab",
    body: [
      "Sejauh diizinkan hukum, Kullo tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data akibat kelalaian Anda sendiri, atau kerugian bisnis yang timbul dari pemakaian layanan.",
      "Tanggung jawab kami terbatas pada kerugian langsung yang terbukti dan sebesar biaya yang Anda bayarkan kepada Kullo dalam 12 bulan terakhir, atau Rp0 bila Anda memakai paket Gratis.",
    ],
  },
  {
    heading: "Perubahan ketentuan",
    body: [
      "Kami dapat memperbarui ketentuan ini. Tanggal pembaruan akan diubah di bagian atas halaman; perubahan material akan diumumkan di sumber daya produk.",
      "Pemakaian Kullo setelah pembaruan berarti Anda menerima versi yang baru.",
    ],
  },
  {
    heading: "Hukum yang berlaku",
    body: [
      "Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa diselesaikan secara musyawarah; bila tidak tercapai, di pengadilan yang berwenang sesuai domisili Kullo.",
    ],
  },
];

export default function KetentuanPage() {
  return (
    <>
      <PageHero
        eyebrow="Ketentuan"
        title="Ketentuan penggunaan Kullo"
        lede="Aturan dasar memakai layanan ini. Terakhir diperbarui 9 November 2026."
        tone="plain"
      />
      <article className="shell" style={{ padding: "40px 0 72px", maxWidth: "46rem" }}>
        <p style={{ fontSize: 16, lineHeight: 1.75, marginTop: 0 }}>
          Ketentuan ini mengikat setiap pengguna Kullo. Pertanyaan dapat dikirim ke{" "}
          <strong>halo@kullo.app</strong> atau lewat{" "}
          <Link href="/dukungan#hubungi" className="textlink">
            formulir dukungan
          </Link>
          .
        </p>
        <div style={{ display: "grid", gap: 32, marginTop: 32 }}>
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="market-h2" style={{ fontSize: 21, lineHeight: "28px", marginBottom: 12 }}>
                {section.heading}
              </h2>
              <div style={{ display: "grid", gap: 12 }}>
                {section.body.map((paragraph) => (
                  <p key={paragraph} style={{ fontSize: 16, lineHeight: 1.75, margin: 0 }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <hr className="divider" style={{ margin: "40px 0 24px" }} />
        <p className="help">
          Dokumen ini adalah bagian dari versi awal Kullo dan bukan nasihat hukum. Bila ada perbedaan antara
          dokumen ini dan isi aplikasi, yang berlaku adalah yang paling menguntungkan pengguna.
        </p>
      </article>
    </>
  );
}
