import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getRoleMatrix } from "@/lib/data";
import { can } from "@/lib/rbac";
import { RolesMatrix } from "@/components/app/RolesMatrix";

export const metadata: Metadata = { title: "Role & izin" };

export default async function RolesSettingsPage() {
  const ctx = await requireApp();
  const roles = await getRoleMatrix(ctx.org.id);
  return (
    <RolesMatrix
      roles={roles.map((role) => ({ id: role.id, key: role.key, name: role.name, permissions: role.permissions }))}
      canManage={can(ctx, "role.manage")}
    />
  );
}
