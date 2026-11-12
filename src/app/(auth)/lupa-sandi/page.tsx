import type { Metadata } from "next";
import { AuthShell } from "@/components/site/AuthShell";
import { ForgotPasswordForm } from "@/components/site/AuthForms";

export const metadata: Metadata = { title: "Lupa kata sandi", robots: { index: false } };

export default function LupaSandiPage() {
  return (
    <AuthShell
      formTitle="Lupa kata sandi"
      formDescription="Masukkan email akun. Kami kirim tautan untuk membuat kata sandi baru."
      leftIllustration="/illustrations/auth-secure-login-hero.svg"
      rightIllustration="/illustrations/auth-login-hero.svg"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
