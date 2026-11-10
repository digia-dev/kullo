import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { roles } from "@/db/schema";
import type { AppContext } from "./auth";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, type Permission } from "./permissions";

export { PERMISSIONS, PERMISSION_LABELS, ROLE_LABELS, DEFAULT_ROLE_PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";

/**
 * Load the permission list for a role. Called once per request from
 * `getAppContext`; `can()` then reads the preloaded set synchronously.
 */
export async function getRolePermissions(orgId: string, roleKey: string): Promise<string[]> {
  if (roleKey === "owner") return [...PERMISSIONS];
  const row = (
    await db
      .select({ permissions: roles.permissions })
      .from(roles)
      .where(and(eq(roles.orgId, orgId), eq(roles.key, roleKey)))
  )[0];
  if (row) {
    try {
      const parsed = JSON.parse(row.permissions) as string[];
      return parsed;
    } catch {
      return [...(DEFAULT_ROLE_PERMISSIONS[roleKey] ?? [])];
    }
  }
  return DEFAULT_ROLE_PERMISSIONS[roleKey] ?? [];
}

export function can(ctx: AppContext, permission: Permission): boolean {
  if (ctx.membership.role === "owner") return true;
  return ctx.permissions.includes(permission);
}

export function canAny(ctx: AppContext, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(ctx, permission));
}

export class PermissionError extends Error {
  constructor(message = "Anda tidak memiliki izin untuk tindakan ini.") {
    super(message);
    this.name = "PermissionError";
  }
}
