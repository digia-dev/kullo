import type { Metadata } from "next";
import { AuthShell } from "@/components/site/AuthShell";
import { ResendVerificationForm } from "@/components/site/AuthForms";

export const metadata: Metadata = { title: "Verifikasi email", robots: { index: false } };

export default function VerifikasiPage() {
  return (
    <AuthShell
      formTitle="Verifikasi email"
      formDescription="Kirim ulang tautan verifikasi untuk mengaktifkan login dengan kata sandi."
      leftIllustration="/illustrations/auth-authentication-hero.svg"
      rightIllustration="/illustrations/auth-secure-login-hero.svg"
    >
      <ResendVerificationForm />
    </AuthShell>
  );
}
