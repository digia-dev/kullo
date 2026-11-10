import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireApp } from "@/lib/auth";
import { getProjectBundle } from "@/lib/data";
import { TaskExplorer } from "@/components/app/TaskExplorer";

export const metadata: Metadata = { title: "Board proyek" };

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireApp();
  const { id } = await params;
  const bundle = getProjectBundle(ctx.org.id, id);
  if (!bundle) notFound();
  return (
    <>
      <TaskExplorer
        mode="all"
        tasks={bundle.tasks}
        people={bundle.members.map((person) => ({ id: person.id, name: person.name, avatarColor: person.avatarColor }))}
        projects={[{ id: bundle.project.id, code: bundle.project.code, name: bundle.project.name }]}
        statuses={bundle.statuses.map((status) => ({ id: status.id, projectId: status.projectId, name: status.name, position: status.position, category: status.category }))}
        currentUserId={ctx.user.id}
        initialView="board"
      />
    </>
  );
}
