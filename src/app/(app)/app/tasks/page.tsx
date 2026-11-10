import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getPeople, getProjectOptions, getStatuses, getTaskRows } from "@/lib/data";
import { TaskExplorer } from "@/components/app/TaskExplorer";

export const metadata: Metadata = { title: "Tugas" };

type SearchParams = Promise<{ view?: string }>;

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const { view } = await searchParams;
  const tasks = await getTaskRows(ctx.org.id);
  const people = await getPeople(ctx.org.id);
  const projects = await getProjectOptions(ctx.org.id);
  const statuses = await getStatuses(ctx.org.id);

  return (
    <>
      <h1 className="sr-only">Tugas</h1>
      <TaskExplorer
        mode="all"
        tasks={tasks}
        people={people.map((person) => ({ id: person.id, name: person.name, avatarColor: person.avatarColor, departmentName: person.departmentName }))}
        projects={projects}
        statuses={statuses}
        currentUserId={ctx.user.id}
        initialView={view ?? "list"}
      />
    </>
  );
}
