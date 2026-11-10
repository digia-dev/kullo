import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { SettingsNav } from "@/components/app/SettingsNav";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireApp();
  return (
    <>
      <h1 className="sr-only">Pengaturan {ctx.org.name}</h1>
      <SettingsNav />
      {children}
    </>
  );
}
