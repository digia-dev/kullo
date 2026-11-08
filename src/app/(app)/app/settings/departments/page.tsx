import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getDepartments, getPeople } from "@/lib/data";
import { can } from "@/lib/rbac";
import { DepartmentManager } from "@/components/app/DepartmentManager";

export const metadata: Metadata = { title: "Departemen" };

export default async function DepartmentsSettingsPage() {
  const ctx = await requireApp();
  const departments = getDepartments(ctx.org.id);
  const people = getPeople(ctx.org.id);
  return (
    <DepartmentManager
      departments={departments.map((dept) => ({ id: dept.id, name: dept.name, color: dept.color, headUserId: dept.headUserId, headName: dept.headName, members: dept.members, openTasks: dept.openTasks, projects: dept.projects }))}
      people={people.map((person) => ({ id: person.id, name: person.name }))}
      canManage={can(ctx, "department.manage")}
    />
  );
}
