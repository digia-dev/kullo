import type { Metadata } from "next";
import { CalendarDays, Columns3, List } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getPeople, getProjectOptions, getStatuses, getTaskRows } from "@/lib/data";
import { TaskExplorer } from "@/components/app/TaskExplorer";

export const metadata: Metadata = { title: "My Work" };

const VIEW_OPTIONS = [
  { key: "list", label: "List", Icon: List },
  { key: "board", label: "Board", Icon: Columns3 },
  { key: "calendar", label: "Kalender", Icon: CalendarDays },
] as const;

type SearchParams = Promise<{ scope?: string; view?: string }>;

export default async function MyWorkPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const { scope, view } = await searchParams;
  const tasks = getTaskRows(ctx.org.id);
  const people = getPeople(ctx.org.id);
  const projects = getProjectOptions(ctx.org.id);
  const statuses = getStatuses(ctx.org.id);
  const activeView = VIEW_OPTIONS.some((item) => item.key === view) ? view : "list";

  return (
    <>
      <h1 className="sr-only">My Work</h1>
      <TaskExplorer
        mode="my"
        tasks={tasks}
        people={people.map((person) => ({ id: person.id, name: person.name, avatarColor: person.avatarColor, departmentName: person.departmentName }))}
        projects={projects}
        statuses={statuses}
        currentUserId={ctx.user.id}
        initialScope={scope ?? "assigned"}
        initialView={activeView}
      />
    </>
  );
}
