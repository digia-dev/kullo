import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/site/AuthShell";
import { DemoRequestForm, RegisterForm } from "@/components/site/AuthForms";

export const metadata: Metadata = {
  title: "Daftar atau coba demo Kullo",
  description: "Ajukan pendaftaran organisasi atau minta akses demo yang diverifikasi admin.",
};

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";

  return (
    <AuthShell
      formTitle={demo ? "Coba demo Kullo" : "Daftar ke Kullo"}
      formDescription={
        demo
          ? "Isi data perusahaan. Admin memverifikasi permintaan, lalu mengirim tautan masuk ke email Anda."
          : "Isi data, pilih paket, lalu kirim permintaan. Akses dibuka setelah admin mengonfirmasi pembayaran."
      }
      leftIllustration="/illustrations/auth-authentication-hero.svg"
      rightIllustration="/illustrations/auth-secure-login-hero.svg"
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div role="tablist" aria-label="Pilihan akses" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Link
            href="/daftar"
            role="tab"
            aria-selected={!demo}
            className={`btn btn-sm ${demo ? "btn-secondary" : "btn-primary"}`}
            style={{ justifyContent: "center" }}
          >
            Daftar
          </Link>
          <Link
            href="/daftar?mode=demo"
            role="tab"
            aria-selected={demo}
            className={`btn btn-sm ${demo ? "btn-primary" : "btn-secondary"}`}
            style={{ justifyContent: "center" }}
          >
            Coba demo
          </Link>
        </div>

        {demo ? <DemoRequestForm /> : <RegisterForm />}

        <p className="help" style={{ margin: 0, textAlign: "center" }}>
          Sudah punya akses? <Link href="/masuk" className="textlink">Masuk</Link>
        </p>
      </div>
    </AuthShell>
  );
}
