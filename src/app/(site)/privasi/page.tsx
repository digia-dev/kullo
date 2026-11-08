import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Privasi",
  description: "Kebijakan privasi Kullo: data yang dikumpulkan, alasannya, dan hak Anda atas data tersebut.",
};

const SECTIONS = [
  {
    heading: "Data yang kami simpan",
    body: [
      "Akun: nama, email, kata sandi yang sudah di-hash, peran, dan departemen. Organisasi: nama perusahaan, alamat, jam kerja, dan zona waktu.",
      "Isi kerja: proyek, tugas, komentar, lampiran, pesan chat, dokumen, agenda, pengajuan, dan keputusan persetujuan. Semuanya terikat pada satu organisasi.",
      "Data teknis: token sesi yang di-hash, alamat IP pada catatan audit, dan waktu setiap aksi penting.",
    ],
  },
  {
    heading: "Mengapa kami menyimpannya",
    body: [
      "Untuk menjalankan layanan yang Anda minta: menampilkan pekerjaan Anda, mengirim notifikasi dalam aplikasi, dan menjaga keamanan akun.",
      "Untuk kepatuhan internal: mencatat perubahan izin, keputusan persetujuan, dan aktivitas administrator.",
      "Kami tidak menjual data Anda, tidak memakai isi percakapan Anda untuk melatih model pihak ketiga, dan tidak menampilkan iklan.",
    ],
  },
  {
    heading: "Siapa yang dapat mengakses",
    body: [
      "Di dalam aplikasi: hanya anggota organisasi Anda dengan izin yang sesuai perannya. Data sensitif seperti nomor telepon hanya terlihat bagi peran tertentu.",
      "Di infrastruktur: layanan hosting yang menjalankan basis data dan aplikasi, terikat perjanjian kerahasiaan dan akses sesuai kebutuhan.",
      "Bila diwajibkan hukum: kami memberi data hanya melalui proses resmi dan memberi tahu Anda sejauh yang diizinkan.",
    ],
  },
  {
    heading: "Berapa lama disimpan",
    body: [
      "Selama akun aktif, lalu 30 hari setelah penghapusan diminta agar pemulihan masih memungkinkan.",
      "Catatan audit tertentu dapat disimpan lebih lama bila diwajibkan untuk keamanan dan kepatuhan.",
      "Anda dapat meminta penghapusan data melalui halo@kullo.app. Kami menghapus atau menganonimkan dalam 30 hari kerja.",
    ],
  },
  {
    heading: "Cookie",
    body: [
      "Kullo memakai satu cookie sesi bernama kullo_session untuk menjaga Anda tetap masuk. Cookie ini HttpOnly dan tidak dipakai untuk pelacakan lintas situs.",
      "Preferensi lokal seperti status bar promo disimpan di penyimpanan peramban Anda dan tidak dikirim ke server.",
    ],
  },
  {
    heading: "Hak Anda",
    body: [
      "Meminta salinan data Anda, memperbaiki data yang salah, menarik persetujuan, dan meminta penghapusan.",
      "Kami menanggapi permintaan dalam 30 hari kerja melalui email yang terdaftar pada akun Anda.",
    ],
  },
];

export default function PrivasiPage() {
  return (
    <>
      <PageHero
        eyebrow="Privasi"
        title="Kebijakan privasi Kullo"
        lede="Ditulis dalam bahasa yang bisa dibaca. Terakhir diperbarui 9 November 2026."
        tone="plain"
      />
      <article className="shell" style={{ padding: "40px 0 72px", maxWidth: "46rem" }}>
        <p style={{ fontSize: 16, lineHeight: 1.75, marginTop: 0 }}>
          Kebijakan ini menjelaskan data apa yang Kullo simpan, mengapa, dan apa yang bisa Anda lakukan
          terhadapnya. Pertanyaan dapat dikirim ke <strong>halo@kullo.app</strong> atau lewat{" "}
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
          Dokumen ini adalah bagian dari versi awal Kullo dan akan diperbarui bila terdapat perubahan cara
          data ditangani. Perubahan material akan diumumkan di halaman sumber daya.
        </p>
      </article>
    </>
  );
}
