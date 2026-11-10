import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireApp } from "@/lib/auth";
import { getDepartments, getPeople, getProjectBundle } from "@/lib/data";
import { can } from "@/lib/rbac";
import { ProjectSettings } from "@/components/app/ProjectSettings";

export const metadata: Metadata = { title: "Pengaturan proyek" };

export default async function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireApp();
  const { id } = await params;
  const bundle = getProjectBundle(ctx.org.id, id);
  if (!bundle) notFound();
  const departments = getDepartments(ctx.org.id);
  const people = getPeople(ctx.org.id);
  return (
    <ProjectSettings
      project={{
        id: bundle.project.id,
        name: bundle.project.name,
        description: bundle.project.description,
        departmentId: bundle.project.departmentId,
        managerId: bundle.project.managerId,
        status: bundle.project.status,
        priority: bundle.project.priority,
        startDate: bundle.project.startDate,
        dueDate: bundle.project.dueDate,
        ownerId: bundle.project.ownerId,
        managerName: bundle.project.managerName,
      }}
      departments={departments.map((dept) => ({ id: dept.id, name: dept.name }))}
      people={people.map((person) => ({ id: person.id, name: person.name, avatarColor: person.avatarColor, title: person.title }))}
      members={bundle.members.map((person) => ({ id: person.id, name: person.name, avatarColor: person.avatarColor, title: person.title, role: person.role }))}
      statuses={bundle.statuses.map((status) => ({
        id: status.id,
        name: status.name,
        position: status.position,
        category: status.category,
        taskCount: bundle.tasks.filter((task) => task.statusId === status.id).length,
      }))}
      canEdit={can(ctx, "project.edit")}
    />
  );
}
