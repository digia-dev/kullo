import type { Metadata } from "next";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireApp } from "@/lib/auth";
import { getPeople, getProjectOptions, getStatuses, getTaskRows } from "@/lib/data";
import { TaskExplorer } from "@/components/app/TaskExplorer";
import { PageHeader } from "@/components/app/ui";
import { todayISO } from "@/lib/utils";

export const metadata: Metadata = { title: "My Work" };

type SearchParams = Promise<{ scope?: string; view?: string }>;

export default async function MyWorkPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const { scope, view } = await searchParams;
  const tasks = getTaskRows(ctx.org.id);
  const people = getPeople(ctx.org.id);
  const projects = getProjectOptions(ctx.org.id);
  const statuses = getStatuses(ctx.org.id);
  const mine = tasks.filter((task) => task.assigneeId === ctx.user.id && !task.done);

  return (
    <>
      <PageHeader
        eyebrow="Ruang kerja pribadi"
        title="My Work"
        subtitle={`${mine.length} tugas terbuka untuk Anda · ${mine.filter((task) => task.dueDate === todayISO()).length} jatuh tempo hari ini`}
        actions={
          <>
            <Link href="/app/tasks" className="btn btn-outline btn-sm">Semua tugas</Link>
            <Link href="/app/my-work?new=task" className="btn btn-primary btn-sm"><Plus size={15} /> Tugas baru</Link>
          </>
        }
      />
      <TaskExplorer
        mode="my"
        tasks={tasks}
        people={people.map((person) => ({ id: person.id, name: person.name, avatarColor: person.avatarColor, departmentName: person.departmentName }))}
        projects={projects}
        statuses={statuses}
        currentUserId={ctx.user.id}
        initialScope={scope ?? "assigned"}
        initialView={view ?? "list"}
      />
    </>
  );
}
