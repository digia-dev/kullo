import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getPeople } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/rbac";
import { ProfileClient } from "@/components/app/ProfileClient";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfileSettingsPage() {
  const ctx = await requireApp();
  const person = (await getPeople(ctx.org.id)).find((row) => row.id === ctx.user.id);
  return (
    <ProfileClient
      user={{ id: ctx.user.id, name: ctx.user.name, email: ctx.user.email, title: ctx.user.title, phone: ctx.user.phone, avatarColor: ctx.user.avatarColor, avatarKey: ctx.user.avatarKey, createdAt: ctx.user.createdAt }}
      role={ROLE_LABELS[ctx.membership.role] ?? ctx.membership.role}
      departmentName={person?.departmentName ?? null}
      initialHasAvatar={Boolean(ctx.user.avatarKey)}
    />
  );
}
