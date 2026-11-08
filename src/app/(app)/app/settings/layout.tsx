import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { PageHeader } from "@/components/app/ui";
import { SettingsNav } from "@/components/app/SettingsNav";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireApp();
  return (
    <>
      <PageHeader
        eyebrow={ctx.org.name}
        title="Pengaturan"
        subtitle="Profil pribadi, struktur organisasi, anggota, peran, dan preferensi notifikasi."
      />
      <SettingsNav />
      {children}
    </>
  );
}
