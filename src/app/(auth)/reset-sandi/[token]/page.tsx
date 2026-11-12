import type { Metadata } from "next";
import { AuthShell } from "@/components/site/AuthShell";
import { ResetPasswordForm } from "@/components/site/AuthForms";

export const metadata: Metadata = { title: "Atur ulang kata sandi", robots: { index: false } };

export default async function ResetSandiPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthShell
      formTitle="Atur ulang kata sandi"
      formDescription="Buat kata sandi baru minimal 8 karakter. Tautan ini hanya bisa dipakai sekali."
      leftIllustration="/illustrations/auth-secure-login-hero.svg"
      rightIllustration="/illustrations/auth-login-hero.svg"
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
