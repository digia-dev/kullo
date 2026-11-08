import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getPeople, getProjectOptions, getStatuses, getTaskRows } from "@/lib/data";
import { TaskExplorer } from "@/components/app/TaskExplorer";
import { PageHeader } from "@/components/app/ui";

export const metadata: Metadata = { title: "Tugas" };

type SearchParams = Promise<{ view?: string }>;

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const { view } = await searchParams;
  const tasks = getTaskRows(ctx.org.id);
  const people = getPeople(ctx.org.id);
  const projects = getProjectOptions(ctx.org.id);
  const statuses = getStatuses(ctx.org.id);
  const open = tasks.filter((task) => !task.done).length;
  const overdue = tasks.filter((task) => task.overdue).length;

  return (
    <>
      <PageHeader
        eyebrow="Semua pekerjaan"
        title="Tugas"
        subtitle={`${open} terbuka · ${overdue} terlambat · ${tasks.length} total di organisasi`}
        actions={
          <>
            <Link href="/app/my-work" className="btn btn-outline btn-sm">My Work</Link>
            <Link href="/app/tasks?new=task" className="btn btn-primary btn-sm"><Plus size={15} /> Tugas baru</Link>
          </>
        }
      />
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
