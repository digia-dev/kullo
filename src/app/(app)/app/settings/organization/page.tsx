import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { OrganizationForm } from "@/components/app/OrganizationForm";

export const metadata: Metadata = { title: "Organisasi" };

export default async function OrganizationSettingsPage() {
  const ctx = await requireApp();
  return (
    <OrganizationForm
      org={{ name: ctx.org.name, slug: ctx.org.slug, address: ctx.org.address, timezone: ctx.org.timezone, workStart: ctx.org.workStart, workEnd: ctx.org.workEnd }}
      canManage={can(ctx, "org.manage")}
      plan={ctx.org.plan}
    />
  );
}
