import type { Metadata } from "next";
import { LoginForm } from "@/components/site/AuthForms";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata: Metadata = { title: "Masuk ke Kullo", description: "Masuk ke ruang kerja Kullo organisasi Anda." };

type SearchParams = Promise<{ next?: string; expired?: string }>;

export default async function MasukPage({ searchParams }: { searchParams: SearchParams }) {
  const { next, expired } = await searchParams;
  const showDemo = process.env.NODE_ENV !== "production" || process.env.KULLO_SHOW_DEMO === "1";

  return (
    <AuthShell
      formTitle="Masuk ke akun Kullo"
      formDescription={expired ? "Sesi Anda berakhir. Masuk kembali untuk melanjutkan pekerjaan." : "Gunakan email dan kata sandi akun Kullo Anda."}
      leftIllustration="/illustrations/auth-secure-login-hero.svg"
      rightIllustration="/illustrations/auth-login-hero.svg"
      demo={showDemo ? { email: "alya@nusantara.id", password: "kullo123", organization: "Nusantara Digital" } : undefined}
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
