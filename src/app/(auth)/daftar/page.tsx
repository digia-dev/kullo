import type { Metadata } from "next";
import { RegisterForm } from "@/components/site/AuthForms";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata: Metadata = {
  title: "Buat akun dan organisasi",
  description: "Mulai Kullo gratis: buat organisasi, undang tim, dan kelola pekerjaan pertama.",
};

export default function DaftarPage() {
  return (
    <AuthShell
      formTitle="Buat akun dan organisasi"
      formDescription="Anda akan menjadi pemilik organisasi yang dibuat. Gratis untuk lima anggota pertama."
      leftIllustration="/illustrations/auth-authentication-hero.svg"
      rightIllustration="/illustrations/auth-secure-login-hero.svg"
    >
      <RegisterForm />
    </AuthShell>
  );
}
