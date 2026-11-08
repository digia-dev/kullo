import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { NotificationPrefs } from "@/components/app/NotificationPrefs";

export const metadata: Metadata = { title: "Notifikasi" };

export default async function NotificationSettingsPage() {
  const ctx = await requireApp();
  let initial: Record<string, boolean> = {};
  try {
    initial = JSON.parse(ctx.membership.notificationPrefs) as Record<string, boolean>;
  } catch {
    initial = {};
  }
  return <NotificationPrefs initial={initial} />;
}
