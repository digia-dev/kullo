import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getDepartments, getPeople } from "@/lib/data";
import { can } from "@/lib/rbac";
import { MembersManager } from "@/components/app/MembersManager";

export const metadata: Metadata = { title: "Anggota" };

export default async function MembersSettingsPage() {
  const ctx = await requireApp();
  const people = getPeople(ctx.org.id);
  const departments = getDepartments(ctx.org.id);
  return (
    <MembersManager
      members={people.map((person) => ({
        id: person.id,
        membershipId: person.membershipId,
        name: person.name,
        email: person.email,
        title: person.title,
        avatarColor: person.avatarColor,
        role: person.role,
        status: person.status,
        departmentId: person.departmentId,
        departmentName: person.departmentName,
        joinedAt: person.joinedAt,
      }))}
      departments={departments.map((dept) => ({ id: dept.id, name: dept.name }))}
      canManage={can(ctx, "member.manage")}
      currentUserId={ctx.user.id}
    />
  );
}
